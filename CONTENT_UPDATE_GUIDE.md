# 콘텐츠 관리

콘텐츠를 수정한 뒤 `npm test && npm run build`로 데이터·파일 연결을 확인합니다. 레이아웃이나 탐색을 바꿨다면 `npm run test:e2e`도 실행합니다.

웹사이트는 언어 전환 없이 영어로 운영합니다. 표시되는 제목·설명·기여·역할·수업명·링크 문구와 접근성 텍스트는 모두 영어로 작성합니다. 원본 자료·표지 이미지·링크·파일명·ID·날짜는 보존합니다. 영문 CV PDF는 아래 One-pager 절차에 따라 갱신합니다. 자료가 한국어인 경우 `Korean` 또는 `Korean edition`으로 안내합니다. 관리 문서와 화면에 표시하지 않는 원문 정보는 한국어로 보존할 수 있습니다.

## 소개

- 홈 한 문장 소개: `data/portfolio-config.json`의 `profile.tagline`. 소속 나열 대신 하는 일과 목적을 담습니다.
- 홈 약력: `profile.background`에서 CV 항목의 `section`, `id`를 참조합니다.
- 한국어 소개 원본: `data/profile-intro.md`에 보존합니다. 현재 홈에는 표시하지 않습니다.
- CV One-pager의 Summary는 기존 첫 문장을 bullet 없는 한 문단으로 표시합니다. 문구를 줄여 물리적인 한 줄로 맞추지 않습니다. All에는 Summary를 추가하지 않습니다.

## Writing

글은 `reports`에 추가합니다. `id`, `title`, `description`, `contribution`, `date`(YYYY-MM), `category`, `kind`, `type`이 필요합니다.

- `kind`: `Article`, `Report`, `Paper Review`.
- `type: "url"`: `url`에 원문 주소.
- `type: "pdf"`: `filename`에 `data/reports/` 안 파일명. 페이지에서 미리보기와 원본 다운로드를 제공합니다.

공저서는 `publications`에 등록합니다. 표지·제목·출판사·출간일·기여 설명·서점 링크만 노출합니다. 책 본문은 올리지 않습니다. 표지의 세로 비율은 유지됩니다.

공저서의 `title`은 영어 표시 제목, `originalTitle`은 검색에만 사용하는 원제입니다. `publisher`는 영문 표기, `language: "ko"`는 한국어판 안내에 사용합니다. 기본 기여 설명은 `description`이며, All CV에서만 표현을 달리할 경우 해당 공저서의 `cv.description`을 사용합니다.

## Projects

`projects` 배열이 단일 원본입니다. 기본 필드는 `id`, `title`, `subtitle`, `description`, `year`, `category`, `status`, `stack`, `links`, `audiences`입니다.

- 선택 필드: `details`, `role`, `highlights`, `award`. `award`에는 대회명을 반복하지 않고 수상 결과만 기록합니다. 작업 맥락 아래에 별도로 표시됩니다.
- `links`: `{ "label": "GitHub", "url": "https://..." }` 형태.
- `reportIds`: 관련 Writing 항목 ID. 보고서 내용과 링크를 복사하지 않고 참조합니다.
- `date`: 확인된 YYYY-MM 날짜가 있으면 연도보다 정밀하게 정렬합니다. 없으면 `year`를 씁니다.
- `context`: 작업 유형과 맥락을 분리한 필수 객체입니다. `type`은 `In-class term project`, `Competition`, `Research project`, `Side project`, `Startup project`, `Personal project` 중 하나입니다. `name`에는 정식 수업명·대회명·소속 기관명을 넣습니다. 수업명을 연구 주제나 팀 번호로 대체하지 않습니다. 수업의 `courseCode`는 관리용으로 보존하며 화면에는 정식 명칭을 표시합니다.
- 예: `{ "type": "In-class term project", "name": "Product and Production Process Design II: Capstone Design", "courseCode": "IMEN330" }`, `{ "type": "Competition", "name": "Monad Blitz Seoul" }`, `{ "type": "Side project", "name": "POSTECH FBDA Lab" }`.
- `category`는 주제 분류이며 작업 유형이나 소속을 대신해 표시하지 않습니다. 확인된 프로젝트 설명만 등록하며 계획 단계는 설명에도 명시합니다.
- `featuredProjectIds`: Projects 상단 이미지 카드 3개의 ID. 각 프로젝트에 실제 작업 이미지 `cover`, 이미지 설명 `coverAlt`, 맞춤 방식 `coverFit` (`contain` 또는 `cover`)을 등록합니다. 카드에는 이미지와 제목만 표시하고, 전체 목록은 별도로 최신순 정렬됩니다.
- 2021~2022 수업 프로젝트와 수업 복습·퀴즈 사이트는 표시하지 않습니다. NFT Hub의 2022년 전시 포스터와 Robust Alpha Generation의 2025년 IQC 발표자료는 `data/projects/`에 보관하고 각 프로젝트에서 연결합니다.
- 발표자료는 `data/projects/`에 두고 `links`에서 상대 경로로 연결할 수 있습니다. 비공개 저장소를 공개로 바꾸거나 접근 불가능한 링크를 방문자에게 제공하지 않습니다.
- `status`: 확인한 상태만 기록합니다. 실제 배포를 확인하지 않은 프로젝트에 Live를 붙이지 않습니다.
- 새 프로젝트의 공개 링크·역할·수상 관련성을 확인한 후 정보를 추가합니다.

프로젝트는 `#projects/<id>`로 해당 목록 위치에 바로 이동합니다. 별도 상세 페이지나 모달은 없습니다.

전체 프로젝트 목록은 **All / In-class / Other**로 필터링합니다. `context.type`이 `In-class term project`인 항목만 In-class이며, 나머지는 Other입니다. 대표작 카드 3개는 필터와 무관하게 유지합니다. `#projects?type=inclass`, `#projects?type=other`로 선택을 공유할 수 있고, 프로젝트 바로가기 링크는 All로 돌아가 해당 항목을 보여줍니다.

## CV: One-pager / All

기본 화면 `#cv`는 **One-pager**이고, **All**은 `#cv?view=all`로 공유합니다. Finance·Crypto 탭은 제거했으며, 예전 링크는 One-pager를 보여줍니다. 두 탭 모두 **Print current view**로 현재 문서를 인쇄할 수 있습니다.

### One-pager와 PDF

`data/resume/one-pager.md`가 웹 화면과 영문 PDF의 공통 원본입니다. 승인된 문구와 순서를 유지합니다: Summary → Education → Work → Publication → Research → Extracurricular → Selected Awards → Selected Certifications. All 데이터의 설명을 자동으로 가져오거나 그쪽 문구를 덮어쓰지 않습니다.

지원하는 Markdown은 다음과 같습니다.

- `# 이름`, 그 다음 연락처 한 줄, `## 섹션 이름`, `- bullet`을 사용합니다. Summary는 bullet 없는 일반 문단을 지원합니다.
- 기관 첫 줄은 `**[기관명](https://...)** | *직급* | 기간` 형태입니다. 마지막 ` | ` 뒤는 오른쪽 열로 표시합니다. 학위 등 추가 행에도 같은 구분자를 사용합니다.
- Work experience는 `회사명 소속 · *직무* (계약형태) | 기간`으로 통일하며 회사명 뒤에 구분선 대신 CSS 간격을 둡니다. 직무만 기울임, 소속·계약형태는 일반체, 날짜는 우측 볼드입니다. B-Harvest의 두 단계는 `*Technical Writer* (Internship); *Researcher* (Freelance)`로 연결합니다.
- `**주요 키워드**`, `*직급*`, `***학위***`, `[링크](https://...)`를 지원합니다. HTML은 렌더링하지 않습니다.
- 섹션 제목은 sentence case, bullet 끝은 마침표 없이 통일합니다. 약어의 점은 유지합니다.
- PDAO의 커뮤니티 설명·출범·2025년 1월 이후 운영 이력과 그랜트·행사 성과는 Extracurricular에서 두 줄로 묶습니다. Summary에 반복하지 않습니다.
- 제목은 `Selected Certifications (10+ total)`로 쓰고, 본문은 자격증 이름과 괄호 안 발급기관을 두 bullet·인쇄 두 줄로 표시하며, 자격증명에는 볼드를 적용하지 않습니다. 발급기관은 Samil PwC, KOFIA, KBI, K-DATA, HRD Korea를 사용합니다. 첫 줄은 재경관리사·투자자산운용사·Financial Planner, 둘째 줄은 SQL Developer·정보처리산업기사·ADsP이며 Hold와 including은 쓰지 않습니다. ADsP는 풀어 쓰지 않습니다. 정보처리산업기사의 영문명은 `Industrial Engineer Information Processing`입니다. 전체를 국가공인 민간자격이라고 쓰지 않습니다. [금융투자협회 안내](https://license.kofia.or.kr/resources/etc/PLIO.pdf)는 투자자산운용사를 등록민간자격으로, [Q-net](https://www.q-net.or.kr/crf005.do?id=crf00505&jmCd=2290&tabGbn=1)은 정보처리산업기사를 국가자격으로 안내합니다.
- Selected Awards의 bullet 마지막 ` | 연도`는 화면에서 구분선을 표시하지 않고 오른쪽 굵은 연도로 배치합니다.
- Publication은 책 제목·ISBN·기울임 Co-Author를 한 행에 쓰고, 마지막 열에는 출간일을 둡니다. 위치나 별도 역할 행을 추가하지 않습니다.
- 장학금은 **Outstanding STEM Talent Career Development Scholar** (**12M KRW**) by BrainKorea21로 한 줄에 표기하고 지원 기간은 생략합니다. 금액은 Scholar 바로 뒤 괄호에 넣고, 금액과 단위 사이에는 줄바꿈 방지 공백을 사용합니다.

본문은 데스크톱·인쇄에서 **10pt**로 유지하며, 남는 공간은 추후 항목 추가를 위해 남깁니다. 회사명·직급·날짜는 데스크톱과 인쇄에서 한 줄로 배치합니다. 모바일에서는 읽기 쉽도록 줄을 나눕니다. One-pager 전용 스타일은 `src/components/one-pager.css`, 렌더러는 `src/components/OnePager.jsx`, 제한된 Markdown 파서는 `src/lib/one-pager.mjs`입니다. Spectral 폰트는 `assets/fonts/spectral/`에서 로컬로 제공합니다.

문구가 확정되거나 사용자가 요청했을 때 PDF를 생성합니다. 편집 중 반복 생성하지 않습니다.

```sh
npm run export-one-pager
npm test
npm run test:e2e
```

내보내기 명령은 사이트를 빌드하고 임시 로컬 서버에서 One-pager를 출력합니다. 외부 요청 없이 로컬 폰트를 사용하며, **정확히 1페이지인지, 웹과 PDF의 텍스트가 같은지** 검사한 뒤 `data/resume/resume_eng.pdf`를 갱신합니다. 줄바꿈·겹침·잘림은 PDF를 열어 시각적으로 확인합니다. 일반 빌드는 PDF를 재생성하지 않습니다. 다운로드 링크는 **PDF · One-pager**이며 한국어 PDF와 그 숨김 상태는 유지합니다.

### All 아카이브

`data/portfolio-config.json`의 전체 CV 이력을 유지하면서, 공통 경험의 명칭·역할·성과는 승인된 One-pager에 맞춥니다. `cv.views.all.sections` 순서는 Education → Work → Publication → Research → Projects → Awards → Extracurricular → Events → Qualifications입니다.

- Work·Research는 원본 배열 순서를 그대로 사용합니다. 다른 섹션은 `order.all`이 있으면 해당 순서를 따릅니다.
- 모든 일반 CV 항목을 표시합니다. 이전 `audiences`, Finance·Crypto용 순서·강조 데이터는 보존하지만 현재 화면에서 사용하지 않습니다.
- Work·Research는 공통 `highlights`를, 다른 섹션은 `highlightsByView.all`이 있으면 해당 설명을 사용합니다.
- All의 설명은 안전한 인라인 Markdown(`**키워드**` 등)을 지원합니다. 대분류·기관명은 강제 대문자를 사용하지 않으며, 직급만 이탤릭으로 표시합니다. `team`, `role`, `employmentType`을 구분하고 날짜는 원본 값을 유지한 채 `Mon YYYY`로 표시합니다.
- B-Harvest의 인턴·프리랜서 기간과 PDAO의 Head·Launch Member 기간은 각각 보존합니다. Base Korea의 종료일은 May 2026입니다. BK21의 선정일 Sep 2026과 지원 기간 Mar 2026–Feb 2027을 구분합니다.
- Awards의 `result`, `topic`, `fundingPeriod`, `dateLabel`로 수상 결과·주제·지원 기간·선정일을 구분합니다. Four Pillars의 주제는 MetaMask 트랙에만 연결하며 다른 두 트랙도 유지합니다. `events-9`는 AI x Web3 in 2026 | Seoul Summit의 Co-host 이력입니다.
- PDAO, Base Korea, Undergrad AI Study는 `cv.extracurricular`에 유지합니다. Base Korea를 Work로 옮기지 않습니다.
- NinjaLabsKR, SuperteamKR, POSTECH CCBR의 `cv.affiliations` 데이터는 보존하되 화면에 표시하지 않습니다.
- `cv.publicationIds` / `cv.projectIds`는 책·프로젝트의 공통 원본 ID를 참조합니다.
- 책·프로젝트의 All 전용 문구는 원본 항목의 `cv` 객체(`title`, `description`, `highlights`)에 둡니다. `cvEntries`에서만 적용하므로 Writing·Projects의 문구나 공통 링크는 바뀌지 않습니다.
- Summary, Expertise, 기술 목록을 All에 추가하지 않습니다.

## History

`data/proof-of-work.json`은 대외활동과 직무·커뮤니티 활동의 시간 기록입니다. 사소한 활동도 남길 수 있으며 CV 필터와 무관합니다. 수업에서 수행한 프로젝트는 History에 추가하지 않고 Projects에서 관리합니다. 대회 프로젝트는 제작 이력 대신 대회 참가 또는 수상으로 기록하며, 같은 활동을 중복 추가하지 않습니다. 원본 63개 항목을 보존한 상태에서 사용자가 승인한 활동을 추가합니다.

BlockHack Korea / DeFi Compass와 Block AI*26은 같은 대회이며, History에서는 예선 참가 한 건으로 관리합니다. Uniswap V3 LP Risk Analysis는 사용자가 History에서 제외했습니다.

2026년 6월 이후 승인된 활동은 `history-067`~`history-074`에 반영했습니다. FBDA 연구는 CV에 명시된 두 기간에 맞춰 기존 `history-045`를 2025.06–12로 정리하고, 2026.06 이후 재개를 `history-074`에 기록했습니다. 다른 기존 기록은 유지합니다.

```json
{
  "id": "history-075",
  "start": "2026.11",
  "end": "2026.11",
  "contents": "Participated in a community event.",
  "tags": ["Community"],
  "importance": false,
  "crypto": false
}
```

- 같은 달에 끝난 활동은 `start`와 `end`를 같게 둡니다.
- 자격 취득처럼 한 번의 사건은 `kind: "qualification"`을 붙이면 종료일이 없어도 진행 중인 기간처럼 표시하지 않습니다.
- `importance`는 타임라인에서 주요 전환점을 강조합니다. 작은 경험을 지우는 필터가 아닙니다.
- `href`는 선택 사항. `#writing/book/digital-asset-era` 또는 대회 참가·수상 기록에 연결된 `#projects/mintme`처럼 관련 결과물로 연결합니다.
- 기존 기록과 CV의 기간이 다를 경우 실제 날짜를 확인한 뒤 수정합니다. 예전 기록을 보고 종료일을 추측하지 않습니다.

## 파일과 배포

원본 PDF와 이미지 경로는 유지됩니다. 빌드 시 `data/`, `assets/images/`가 `dist/`에 복사됩니다. 새 파일을 추가한 뒤 검증을 실행하면 빠진 파일과 잘못된 참조를 확인할 수 있습니다.

`npm run generate-lists`는 보조 파일 목록을 갱신합니다. 사이트 표시는 위 JSON 기록을 기준으로 하며 파일명만 추가했다고 자동으로 글이 발행되지는 않습니다.
