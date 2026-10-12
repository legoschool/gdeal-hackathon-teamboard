const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function context(server = false) {
  const c = vm.createContext({console, URL, TextEncoder, Date, crypto: require('node:crypto').webcrypto,
    btoa: s => Buffer.from(s, 'binary').toString('base64'), location: {origin:'http://localhost',href:'http://localhost/gas-preview/worker.js'}});
  c.self = c;
  const files = server ? ['tools/gas-mock/services.js', 'gas/Code.js'] : ['js/config.js','js/ops.js','js/sample-data.js','js/archive-export.js'];
  files.forEach(f => vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f}));
  return c;
}
test('published work is withdrawn if intent is incomplete', () => {
  const {HB} = context(); const s = HB.sample.build('after'); const t=s.teams.find(t=>t.published);
  HB.ops.saveIntent(s,{teamId:t.id,intent:{scene:'',who:'교사',change:'개선'}},s.people.find(p=>p.id===t.members[0]));
  assert.equal(t.published,false); assert.equal(t.publishedAt,null);
});
test('leaving the last seat retains a team with a saved plan', () => {
  const {HB}=context(); const s=HB.sample.build('before'); const t=s.teams[0]; const p=s.people.find(p=>p.id===t.members[0]);
  t.members=[p.id]; t.plan={problem:'보존할 문제'}; s.logs=s.logs.filter(l=>l.team!==t.id);
  HB.ops.leaveTeam(s,{teamId:t.id},p); assert(s.teams.includes(t)); assert.equal(t.members.length,0);
});
test('archive excludes unpublished teams, people and auth fields and escapes markup', () => {
  const {HB}=context(); const s=HB.sample.build('after'); const t=s.teams.find(t=>t.published);
  s.people[0].email='private@example.com'; s.people[0].code='654321';
  t.work.title='<script>alert(1)</script>'; t.work.link='javascript:alert(1)';
  const data=HB.archiveExport.build(s,{},123456789);
  assert.equal(data.works.length,s.teams.filter(t=>t.published).length);
  assert(!JSON.stringify(data).includes('private@example.com')); assert(!('people' in data));
  assert.equal(data.works.find(w=>w.id===t.id).work.link,'');
  const html=HB.archiveExport.html(data); assert(!html.includes('<script>')); assert(html.includes('&lt;script&gt;'));
});
test('archive embeds resolved photos and preserves chronological process', () => {
  const {HB}=context(); const s=HB.sample.build('after'); const t=s.teams.find(t=>t.published);
  t.work.cover='img:g12345678'; const image='data:image/png;base64,aGVsbG8=';
  const data=HB.archiveExport.build(s,{'img:g12345678':image});
  const w=data.works.find(w=>w.id===t.id); assert.equal(w.work.cover,image);
  assert.deepEqual([...w.process].map(l=>l.at),[...w.process].map(l=>l.at).sort((a,b)=>a-b));
  assert(HB.archiveExport.html(data).includes(image));
});
test('server round trip checks identity, team permissions, readonly, code revocation', () => {
  const c=context(true); c.seedSample_('after');
  vm.runInContext(`const table=readTable_('people');
    table.rows.forEach(r=>{ if (['p01','p37','s01'].includes(r.id)) {r.email=r.id+'@example.com';r.code='123456';writePerson_(table,r);} }); bump_();`,c);
  const parse=JSON.parse; const token=who=>parse(c.login(who+'@example.com','123456')).token;
  const p=token('p01'), other=token('p37'), staff=token('s01'); assert(p && staff);
  assert(parse(c.login('p01@example.com','a123456')).error);
  const boot=parse(c.boot(p)); assert.equal(boot.meId,'p01'); assert(!('email' in boot.state.people[0]));
  const team=boot.state.teams.find(t=>t.members.includes('p01'));
  const rejected=parse(c.api('saveIntent',{teamId:team.id,intent:{}},other)); assert(rejected.error);
  const saved=parse(c.api('addLog',{id:'ltest1234',teamId:team.id,text:'통합 테스트',kind:'test'},p));
  assert(!saved.error); assert(parse(c.getState(p)).state.logs.some(l=>l.id==='ltest1234'));
  assert(parse(c.admin('people',{},p)).error);
  assert(parse(c.admin('toString',{},staff)).error);
  c.admin('setReadonly',{on:true},staff);
  assert(parse(c.api('addLog',{id:'ltest5678',teamId:team.id,text:'거절',kind:'test'},p)).error);
  c.admin('newCode',{id:'p01'},staff); assert.equal(parse(c.getState(p)).meId,null);
});
