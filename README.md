# G-DEAL 해커톤 팀 보드

교사가 학교 현장의 고민을 나누고 팀을 구성해 도구를 만들며, 제작 과정과 작품을 공유하는 웹앱입니다.

- [배포 페이지](https://legoschool.github.io/gdeal-hackathon-teamboard/)
- [예시 체험판](https://legoschool.github.io/gdeal-hackathon-teamboard/demo/)
- **[운영·개발 인계서](HANDOFF.md)** — 다음 담당자는 이 문서부터 읽으세요.
- [기존 상세 개발 자료](DEVELOPMENT.md)

## 운영판과 체험판

| 구분 | 데이터 저장 | 용도 |
|---|---|---|
| 운영판: Google Apps Script | 운영 Google Sheets에 공동 저장 | 실제 행사 |
| GitHub Pages 체험판 | 브라우저의 모의 시트. 새로고침 시 초기화 | 기능 검토·인계·교육 |
| 로컬 `index.html` | 해당 브라우저 localStorage | 화면 초안 확인 |

GitHub 배포로 Apps Script 운영 버전이 자동 업데이트되지는 않습니다. 운영판 주소와 시트·스크립트 식별자는 별도 비공개 인계서로 전달합니다. 2026-10-12 수정본의 운영판 반영은 구글 배포 인증 인계 후 진행해야 합니다.

## 구현된 기능

아이디어와 공감·댓글, 팀 생성·참가·퍼실 배정, 계획·역할·일정, 제작 과정·사진·응원, 제작 의도·작품 제출, 아카이브, 운영진 관리, 공개 작품집 HTML·JSON 다운로드.

신청서·선착순 대기, 긴 사전 설문, 발표 타이머, 상 투표는 현재 팀 보드에 포함되지 않습니다. 참가자는 운영진이 등록합니다.

## 실행과 검증

Node.js 20 이상, Python 3.10 이상을 사용합니다.

```sh
npm ci
python -m pip install -r requirements.txt
python tools/build_gas.py
npm test
npx playwright install chromium
npm run test:browser
python -m http.server 5175 --bind 127.0.0.1
```

`http://127.0.0.1:5175/gas-preview/index.html`을 엽니다.

| 체험 역할 | 이메일 | 코드 |
|---|---|---|
| 참가자 | p01@example.com | 111111 |
| 퍼실 | f01@example.com | 333333 |
| 운영진 | staff@example.com | 999999 |

모두 예시 전용 계정이며 운영판에 접근할 수 없습니다.

## GitHub 배포

`main`에 반영하면 `.github/workflows/pages.yml`이 빌드, 회귀 테스트, 브라우저 테스트를 수행한 뒤 Pages를 배포합니다. Actions 실행 결과에서 Apps Script 업로드 파일 3개와 테스트 화면 캡처도 내려받을 수 있습니다.

```sh
python tools/build_pages.py
```

정적 배포 대상은 `_site/`뿐입니다. `site/index.html`은 안내 페이지, `_site/demo/`는 모의 서버를 사용하는 체험판입니다.

## 소스 구조

- `js/`, `css/`, `assets/`: 공용 화면·데이터 규칙·디자인
- `server/`: Apps Script 서버 원본
- `tools/build_gas.py`: 운영용 `gas/` 및 체험용 `gas-preview/` 생성
- `tools/build_pages.py`, `site/`: GitHub Pages 생성
- `tests/`: 서버와 브라우저 검증
- `HANDOFF.md`: 운영 방법, 권한 인계, 배포, 한계, 후속 작업

운영 데이터·실제 참여 코드·개인 인증 파일은 저장소에 올리지 않습니다. 그림·글꼴 등의 출처와 이용 조건은 [인계서](HANDOFF.md#자료와-디자인-출처)를 확인하세요.
