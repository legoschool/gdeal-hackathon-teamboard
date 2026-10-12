/* 행사 내용과 화면에 나오는 칸. 글자만 바꾸려면 이 파일만 고친다.
   고친 뒤에는 초안 도구의 '예시 데이터 처음으로'를 눌러야 저장된 예시에 반영된다.
   앱스 스크립트판은 서버도 이 파일을 쓴다(시트 열 이름이 여기 칸 이름에서 나온다). */
var HB = typeof HB !== 'undefined' ? HB : {};

HB.config = {
  event: {
    title: 'G-DEAL 교사 해커톤',
    host: '제3회 한마당',
    dateLabel: '',                   // 예: '12월 19일(토) 13:00~17:00'. 빈칸이면 화면에 날짜·시간과 D-day를 보이지 않는다
    place: '',                       // 빈칸이면 보이지 않는다
    day: '2026-12-19',               // 화면에는 안 보인다. 홈 '진행 단계'에서 지금 칸(사전·당일·이후)을 고르는 데만 쓴다
  },

  // 홈 화면 단계판. when이 빈칸이면 날짜 줄을 보이지 않는다
  phases: [
    { key: 'before', name: '사전', when: '', does: ['아이디어 모으기', '팀 만들기', '계획 공유'] },
    { key: 'day',    name: '당일', when: '', does: ['만들기', '과정 기록', '전체 발표'] },
    { key: 'after',  name: '이후', when: '', does: ['학교에 적용', '결과 공유회', '아카이브 공개'] },
  ],

  team: {
    maxTeams: 10,
    seats: 4,           // 참가자 자리. 퍼실 1명은 따로
    minToForm: 3,       // '팀 결성' 단계가 켜지는 참가자 수
    minLogs: 3,         // '과정 기록' 단계가 켜지는 기록 수
    quietDays: 3,       // 운영 화면에서 이 날수 넘게 기록이 없으면 빨갛게 표시
  },

  // 팀 펫. 그림은 assets/pets/아이디.png (몬스터 원정대 그림을 잘라 씀)
  pets: [
    { id: 'koalbot',   name: '코알봇',   color: '#3fb6dc' },
    { id: 'antro',     name: '앤트로',   color: '#f08a3c' },
    { id: 'monggeul',  name: '몽글이',   color: '#a58be6' },
    { id: 'digibugi',  name: '디기부기', color: '#3a88cb' },
    { id: 'pickling',  name: '피클링',   color: '#6cbf3f' },
    { id: 'droni',     name: '드로니',   color: '#e0a815' },
    { id: 'owllab',    name: '아울랩',   color: '#4f9a69' },
    { id: 'hongaengi', name: '홍앵이',   color: '#ee5d6c' },
    { id: 'maninyang', name: '매니냥',   color: '#d39a4a' },
    { id: 'h2o',       name: '또롱이',   color: '#35bccf' },
  ],

  // 팀 진행 단계. 조건 계산은 js/select.js의 teamSteps
  steps: [
    { key: 'formed', name: '팀 결성',      need: '참가자 3명' },
    { key: 'plan',   name: '계획 공유',    need: '계획 네 칸' },
    { key: 'log',    name: '과정 기록',    need: '기록 3개' },
    { key: 'intent', name: '제작 의도',    need: '의도 세 칸' },
    { key: 'work',   name: '작품 공유',    need: '이름·소개·링크' },
    { key: 'open',   name: '아카이브 공개', need: '공개 누르기' },
  ],

  // 과정 기록 종류
  logKinds: [
    { key: 'meet',  name: '회의',    color: '#3a88cb' },
    { key: 'make',  name: '만들기',  color: '#277849' },
    { key: 'stuck', name: '막힘',    color: '#e0533f' },
    { key: 'test',  name: '써 보기', color: '#8b6fd6' },
    { key: 'fix',   name: '고침',    color: '#c48a12' },
    { key: 'apply', name: '적용',    color: '#1d8a8a' },
  ],

  ideaFields: [
    { key: 'title',   label: '제목',              rows: 1, required: true, max: 40 },
    { key: 'problem', label: '학교에서 겪는 일',  rows: 3, required: true, hint: '언제, 누가, 무엇 때문에 불편한지' },
    { key: 'wish',    label: '이렇게 되면 좋겠다', rows: 2, required: true },
  ],

  planFields: [
    { key: 'problem',  label: '해결할 문제', rows: 3, hint: '학교에서 실제로 겪는 장면으로' },
    { key: 'users',    label: '쓰는 사람',   rows: 1, hint: '예: 6학년 담임 5명' },
    { key: 'solution', label: '만들 것',     rows: 3, hint: '화면 하나, 버튼 하나 수준으로' },
    { key: 'tools',    label: '쓸 도구',     rows: 1, hint: '예: 구글 시트, 앱스 스크립트' },
  ],

  intentFields: [
    { key: 'scene',  label: '시작된 장면', rows: 3, hint: '이 도구가 필요하다고 느낀 날 있었던 일' },
    { key: 'who',    label: '누가 쓰나',   rows: 2, hint: '누가, 언제, 어디서' },
    { key: 'change', label: '바라는 변화', rows: 3, hint: '쓰기 전과 뒤에 달라지는 것. 숫자가 있으면 숫자로' },
  ],

  workFields: [
    { key: 'title',   label: '작품 이름',       rows: 1, required: true, max: 30 },
    { key: 'oneline', label: '한 줄 소개',      rows: 1, required: true, max: 60 },
    { key: 'link',    label: '작품 링크',       rows: 1, required: true, type: 'url' },
    { key: 'source',  label: '코드·자료 링크',  rows: 1, type: 'url' },
    { key: 'howto',   label: '사용법',          rows: 4, hint: '한 줄에 한 단계' },
  ],

  schoolLevels: ['초등', '중등', '고등', '특수'],
  tags: ['수업', '평가', '학급 운영', '업무', '소통', '안전'],

  nav: [
    { route: 'home',    name: '홈' },
    { route: 'ideas',   name: '아이디어' },
    { route: 'teams',   name: '팀' },
    { route: 'feed',    name: '과정' },
    { route: 'archive', name: '아카이브' },
    { route: 'guide',   name: '사용법' },
    { route: 'admin',   name: '운영', staff: true },   // 운영진에게만 보인다
  ],

  // 초안 도구의 시점. 예시 데이터를 이 시각까지 있었던 일로 자른다
  snapshots: [
    { key: 'before', name: '사전 (11월 20일)', at: '2026-11-20T18:00' },
    { key: 'day',    name: '당일 (12월 19일)', at: '2026-12-19T16:30' },
    { key: 'after',  name: '이후 (12월 30일)', at: '2026-12-30T10:00' },
  ],

  storageKey: 'gdeal-hackathon-board-v1',
  meKey: 'gdeal-hackathon-board-me',
};
