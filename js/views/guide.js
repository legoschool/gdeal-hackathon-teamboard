/* 사용법: 참가자, 퍼실, 운영진(운영진에게만 보임), 자주 묻는 것.
   주소: #/guide, #/guide/facil, #/guide/staff, #/guide/faq
   글을 고치려면 아래 GUIDE의 steps만 고친다. go는 그 단계 화면으로 가는 버튼이다(myTeam/탭 이름이면 내 팀 공간). */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const esc = U.esc;

  const GUIDE = {
    participant: {
      name: '참가자',
      sections: [
        { title: '들어오기', steps: [
          '받은 주소를 열면 로그인하지 않아도 모든 팀의 아이디어, 과정, 작품을 볼 수 있어요.',
          '글을 쓰려면 오른쪽 위 "참여하기"를 누르고 신청한 이메일과 6자리 참여 코드를 넣어요. 참여 코드는 운영진이 메일로 보내요.',
          '한 번 들어오면 같은 기기에서는 다시 넣지 않아도 돼요. 여럿이 쓰는 컴퓨터라면 끝나고 오른쪽 위 내 이름을 눌러 로그아웃해요.',
        ] },
        { title: '아이디어 올리기', go: ['#/ideas/new', '아이디어 올리기 열기'], steps: [
          '"아이디어" 화면에서 "아이디어 올리기"를 눌러요.',
          '제목, 학교에서 겪는 일, 이렇게 되면 좋겠다를 적고 학교급과 태그를 골라 "올리기"를 눌러요.',
          '다른 사람 아이디어에는 "공감"을 누르거나 제목을 눌러 댓글을 달아요. 공감이 많은 아이디어가 홈에 먼저 보여요.',
        ] },
        { title: '팀 만들기와 들어가기', go: ['#/teams', '팀 화면 열기'], steps: [
          `한 팀은 참가자 ${C.team.seats}명과 퍼실 1명이에요. "팀" 화면에서 빈자리가 있는 팀의 "들어가기"를 누르면 그 팀 참가자가 돼요.`,
          '새로 만들려면 "새 팀 만들기"에서 팀 이름, 펫, 시작할 아이디어를 골라요. 아이디어 카드의 "이 아이디어로 팀 만들기"로 시작해도 돼요. 다른 팀이 고른 펫은 고를 수 없어요.',
          '퍼실은 자동으로 붙어요. 팀을 옮기려면 팀 공간 위쪽 "팀에서 나가기"를 누른 뒤 다른 팀에 들어가요.',
        ] },
        { title: '계획 공유', go: ['plan', '우리 팀 계획 열기'], steps: [
          '팀 공간 "계획" 탭에서 "고치기"를 눌러 해결할 문제, 쓰는 사람, 만들 것, 쓸 도구, 맡은 일을 적고 "저장"해요.',
          '오른쪽 "일정"에 할 일과 기한을 더하고, 끝난 일은 네모 칸을 눌러 체크해요.',
          '계획은 다른 팀도 봐요. 비슷한 문제를 푸는 팀을 찾아 의견을 나눌 때 써요.',
        ] },
        { title: '과정 기록', go: ['log', '우리 팀 과정 열기'], steps: [
          '팀 공간 "과정" 탭에서 종류(회의, 만들기, 막힘, 써 보기, 고침, 적용)를 고르고 한 일을 적어 "올리기"를 눌러요. 링크와 그림을 하나씩 붙일 수 있어요.',
          '막힌 곳은 "막힘"으로 올려요. 댓글이 없는 막힘은 다른 팀 과정 탭 오른쪽에 떠서 도움을 받을 수 있어요.',
          '기록은 그대로 아카이브의 "만든 과정"이 돼요. 길게 한 번보다 짧게 자주 올리는 쪽이 나중에 읽기 좋아요.',
          '그림에는 학생 얼굴과 이름이 나오지 않게 해요.',
        ] },
        { title: '제작 의도와 작품', go: ['work', '우리 팀 작품 열기'], steps: [
          '"제작 의도" 탭에서 "고치기"를 눌러 시작된 장면, 누가 쓰나, 바라는 변화 세 칸을 적어요.',
          '"작품" 탭에서 "작품 올리기"를 눌러 작품 이름, 한 줄 소개, 작품 링크(https://로 시작), 코드·자료 링크, 사용법, 대표 그림을 넣어요. 대표 그림이 없으면 팀 펫이 들어가요.',
        ] },
        { title: '아카이브 공개', go: ['#/archive', '아카이브 열기'], steps: [
          '작품 이름·소개·링크와 제작 의도 세 칸이 차면 작품 탭의 "아카이브에 공개"가 켜져요. 누르면 아카이브에 작품 카드가 올라가요.',
          '공개한 뒤에도 고칠 수 있고, "공개 취소"로 내릴 수 있어요.',
        ] },
        { title: '다른 팀과 함께하기', go: ['#/feed', '과정 화면 열기'], steps: [
          '"과정" 화면에서 모든 팀 기록을 최근 것부터 봐요. 팀이나 종류로 골라 볼 수 있어요.',
          '기록마다 "응원"을 누르거나 댓글을 달아요. 팀 전체에 하고 싶은 말은 그 팀 공간 "의견" 탭에 남겨요.',
        ] },
      ],
      levels: true,
    },
    facil: {
      name: '퍼실',
      sections: [
        { title: '맡은 팀', go: ['plan', '맡은 팀 열기'], steps: [
          '퍼실이 맡을 팀은 운영진이 정해요. 로그인하면 오른쪽 위 내 이름 아래에 맡은 팀이 보여요.',
          '퍼실은 맡은 팀의 계획, 과정, 제작 의도, 작품을 참가자와 똑같이 쓰고 고칠 수 있어요.',
        ] },
        { title: '막힌 팀 돕기', go: ['#/feed', '과정 화면 열기'], steps: [
          '"과정" 화면에서 종류 "막힘"을 고르면 막힌 기록만 모여요. 맡은 팀이 아니어도 댓글로 도울 수 있어요.',
          '팀 공간 위쪽 여섯 칸 가운데 꺼진 칸이 그 팀의 다음 할 일이에요. "다음 단계"에 켜지는 조건이 적혀 있어요.',
        ] },
      ],
      levels: true,
    },
    staff: {
      name: '운영진',
      staff: true,
      sections: [
        { title: '사람 등록', go: ['#/admin/people', '운영 > 사람 열기'], steps: [
          '"운영 > 사람"에서 "사람 추가"를 눌러 이름, 역할(참가자·퍼실·운영진), 학교, 이메일을 넣어요. 이메일이 있어야 로그인할 수 있어요.',
          '운영 스프레드시트의 "사람" 시트에 직접 적어도 돼요. 첫 줄의 열 이름은 바꾸지 않아요.',
        ] },
        { title: '참여 코드 보내기', go: ['#/admin/people', '운영 > 사람 열기'], steps: [
          '"코드 만들기"를 누르면 이메일이 있고 코드가 없는 사람에게 6자리 코드가 붙어요.',
          '"코드 메일 보내기"를 누르면 아직 코드 메일을 받지 않은 사람에게 코드와 접속 주소가 가요. 개인 구글 계정은 하루 100명까지 보낼 수 있어요.',
          '코드를 잊은 사람은 그 사람 줄의 "새 코드"를 누른 뒤 "코드 메일 보내기"를 누르면 그 사람에게만 다시 가요. 예전 코드는 그때부터 쓸 수 없어요.',
        ] },
        { title: '팀 조정', go: ['#/admin/teams', '운영 > 팀 열기'], steps: [
          '"운영 > 팀"에서 참가자를 넣고 빼고, 퍼실을 바꾸고, 팀 이름과 펫을 고쳐요.',
          '팀 없는 참가자는 "운영 > 현황"에서 팀을 골라 바로 넣을 수 있어요.',
        ] },
        { title: '살피기와 정리', go: ['#/admin', '운영 > 현황 열기'], steps: [
          `"운영 > 현황"에는 진행이 느린 팀이 위에 오고, ${C.team.quietDays}일 넘게 기록이 없는 팀은 빨갛게 보여요.`,
          '"운영 > 글"에서 아이디어·기록·댓글·의견을 지울 수 있어요. 지운 글은 되돌릴 수 없어요.',
        ] },
        { title: '끝낸 뒤', go: ['#/admin/settings', '운영 > 설정 열기'], steps: [
          '"운영 > 설정"에서 "글쓰기 닫기"를 누르면 운영진 말고는 쓸 수 없고, 아카이브는 계속 보여요.',
          '시험으로 넣은 예시 데이터는 "예시 지우기"로 지워요. 이메일이 있는 사람은 남아요.',
        ] },
      ],
    },
    faq: {
      name: '자주 묻는 것',
      faq: [
        ['참여 코드를 잊었어요', '운영진에게 말하면 새 코드를 메일로 다시 보내 줘요. 새 코드를 받으면 예전 코드는 쓸 수 없어요.'],
        ['"이메일이나 참여 코드가 맞지 않아요"가 떠요', '신청할 때 쓴 이메일인지 확인해요. 8번 틀리면 10분 동안 로그인이 막혀요.'],
        ['다른 사람이 쓴 글이 안 보여요', '화면은 15초마다 새 글을 받아요. 그래도 안 보이면 새로고침해요.'],
        ['쓴 글을 고치고 싶어요', '계획, 제작 의도, 작품은 "고치기"로 고쳐요. 과정 기록은 지우고 다시 올려요.'],
        ['"저장하지 못했어요"가 떠요', '인터넷 연결을 확인하고 다시 적어 올려요.'],
        ['맨 위에 "Google Apps Script 사용자가 만들었습니다"가 떠요', '구글이 붙이는 안내예요. 오른쪽 X로 닫아도 돼요.'],
        ['휴대폰에서도 되나요', '돼요. 화면 아래 메뉴로 홈, 아이디어, 팀, 과정, 아카이브를 옮겨 다녀요.'],
        ['화면 아래에 빨간 상자가 뜨고 멈췄어요', '새로고침해 보고, 그래도 같으면 빨간 상자를 사진으로 찍어 운영진에게 보내요.'],
      ],
    },
  };

  function goHref(go, me) {
    if (go[0][0] === '#') return go[0];
    const t = me ? S.teamOf(me.id) : null;
    return t ? `#/team/${t.id}/${go[0]}` : '#/teams';
  }

  function levels() {
    return `<section class="panel guide-sec">
      <h2><span class="guide-no">Lv</span>진행판 여섯 칸</h2>
      <p>아래 칸이 켜질 때마다 팀 Lv이 하나씩 오르고, 홈 "팀 진행판"에서 팀 펫이 그 칸까지 걸어가요.</p>
      <ol class="howto-steps">${C.steps.map((s, i) => `<li><span>${i + 1}</span><b>${esc(s.name)}</b><small>${esc(s.need)}</small></li>`).join('')}</ol>
    </section>`;
  }

  function sections(part, me) {
    return part.sections.map((sec, i) => {
      const href = sec.go ? goHref(sec.go, me) : '';
      const label = sec.go && sec.go[0][0] !== '#' && !(me && S.teamOf(me.id)) ? '팀 화면 열기' : sec.go && sec.go[1];
      return `<section class="panel guide-sec">
        <h2><span class="guide-no">${i + 1}</span>${esc(sec.title)}</h2>
        <ol class="guide-steps">${sec.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
        ${href ? `<a class="btn btn--sm guide-go" href="${href}">${esc(label)} →</a>` : ''}
      </section>`;
    }).join('') + (part.levels ? levels() : '');
  }

  function faq(part) {
    return `<section class="panel"><dl class="faq">${part.faq.map(([q, a]) => `<div><dt>${esc(q)}</dt><dd>${esc(a)}</dd></div>`).join('')}</dl></section>`;
  }

  HB.views.guide = (r) => {
    const me = HB.me();
    const keys = Object.keys(GUIDE).filter((k) => !GUIDE[k].staff || (me && me.role === 'staff'));
    const fallback = me && me.role === 'facil' ? 'facil' : 'participant';
    const tab = keys.indexOf(r.id) >= 0 ? r.id : fallback;
    const part = GUIDE[tab];
    return `<section class="page-head"><div><h1>사용법</h1></div>
        <button class="btn btn--sm" data-act="guide-copy">이 화면 주소 복사</button></section>
      <nav class="tabs" aria-label="사용법">${keys.map((k) =>
        `<a href="#/guide/${k}" class="${k === tab ? 'is-on' : ''}"${k === tab ? ' aria-current="page"' : ''}>${esc(GUIDE[k].name)}</a>`).join('')}</nav>
      <div class="tab-body guide">${part.faq ? faq(part) : sections(part, me)}</div>`;
  };

  HB.on({
    'guide-copy': () => {
      const url = HB.shareUrl();
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(() => U.toast('주소를 복사했어요.'), () => U.toast(url));
    },
  });
})();
