const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root=path.resolve(__dirname,'..');
const artifacts=path.join(__dirname,'artifacts');fs.mkdirSync(artifacts,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'}[path.extname(file)]||'application/octet-stream';
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':type});res.end(err?'Not found':data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || chromium.executablePath()});
 try {
  const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    window.__writes=0;
    const send=Worker.prototype.postMessage;
    Worker.prototype.postMessage=function(message,...rest){
      if(message.fn==='api'){
        window.__writes++;
        if(window.__failWrite){setTimeout(()=>this.dispatchEvent(new MessageEvent('message',{data:{id:message.id,ok:false,error:'simulated write failure'}})),500);return;}
        setTimeout(()=>send.call(this,message,...rest),500);return;
      }
      send.call(this,message,...rest);
    };
  });
  await page.goto(origin+'/gas-preview/index.html');
  await page.waitForFunction(()=>window.HB&&HB.store.state);
  for(const route of ['#/ideas','#/teams','#/feed','#/archive','#/guide']){
    await page.evaluate(r=>location.hash=r,route);
    await page.waitForTimeout(80);
    assert((await page.locator('#view').innerText()).length>20);
  }
  await page.locator('[data-act="join"]').first().click();
  await page.locator('[name="email"]').fill('p01@example.com');
  await page.locator('[name="code"]').fill('111111');
  await page.locator('form[data-form="login"] button[type="submit"], form[data-form="login"] .btn--primary').click();
  await page.waitForFunction(()=>HB.me()?.id==='p01');
  await page.evaluate(()=>location.hash='#/team/t01/log');
  const form=page.locator('[data-form="log-add"]');
  await form.locator('[name="text"]').fill('브라우저 저장 검증 기록');
  await form.evaluate(f=>{f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
  assert.equal(await page.evaluate(()=>window.__writes),1);
  assert.equal(await form.locator('[name="text"]').inputValue(),'브라우저 저장 검증 기록');
  await page.waitForFunction(()=>HB.store.pending===0);
  await page.waitForFunction(()=>document.querySelector('[data-form="log-add"] textarea').value==='');
  assert.equal(await page.evaluate(()=>HB.store.state.logs.filter(l=>l.text==='브라우저 저장 검증 기록').length),1);
  await page.evaluate(()=>window.__failWrite=true);
  await form.locator('[name="text"]').fill('실패해도 남아야 하는 입력');
  await form.locator('.btn--primary').click();
  await page.waitForFunction(()=>HB.store.pending===0);
  await page.waitForFunction(()=>!document.querySelector('[data-form="log-add"] textarea').disabled);
  assert.equal(await form.locator('[name="text"]').inputValue(),'실패해도 남아야 하는 입력');
  assert.equal(await page.evaluate(()=>HB.store.state.logs.some(l=>l.text==='실패해도 남아야 하는 입력')),false);
  await page.evaluate(()=>window.__failWrite=false);
  // Two independent writes must retain both server changes.
  await page.evaluate(async()=>{await Promise.all([HB.actions.addNote('t01','연속 저장 하나'),HB.actions.addNote('t01','연속 저장 둘')]);});
  assert.equal(await page.evaluate(()=>HB.store.state.teams.find(t=>t.id==='t01').notes.filter(n=>n.text.startsWith('연속 저장')).length),2);
  await page.evaluate(()=>HB.logout());
  await page.evaluate(()=>HB.login('staff@example.com','999999'));
  await page.evaluate(()=>location.hash='#/admin/settings');
  await page.waitForFunction(()=>HB.store.pending===0&&HB.view.adm.people);
  const downloadPromise=page.waitForEvent('download');
  await page.locator('[data-act="adm-export"][data-v="html"]').click();
  const download=await downloadPromise;
  const saved=path.join(artifacts,'sample-archive.html');await download.saveAs(saved);
  const html=fs.readFileSync(saved,'utf8');assert(!html.includes('staff@example.com'));assert(!html.includes('999999'));
  assert(html.includes('작품집'));assert(html.includes('제작 의도'));
  await page.screenshot({path:path.join(artifacts,'admin-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  for(const route of ['#/','#/team/t01/log','#/archive','#/admin/settings']){
    await page.evaluate(r=>location.hash=r,route);await page.waitForTimeout(120);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert.equal(overflow,false,'mobile overflow '+route);
  }
  await page.screenshot({path:path.join(artifacts,'admin-mobile.png'),fullPage:true});
  const offline=await browser.newPage();const requests=[];
  offline.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await offline.goto('file:///'+saved.replace(/\\/g,'/'));
  assert.equal(await offline.locator('article').count(),7);
  assert.equal(requests.length,0);
  await offline.screenshot({path:path.join(artifacts,'archive.png'),fullPage:false});
  assert.deepEqual(errors,[]);
  console.log('PASS: guest routes, login, confirmed saves, duplicate guard, failure preserves draft, serial writes, export, offline archive, desktop/mobile layout.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
