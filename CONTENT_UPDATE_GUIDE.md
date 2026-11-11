# 콘텐츠 관리

콘텐츠를 수정한 뒤 `npm test && npm run build`로 데이터·파일 연결을 확인합니다. 레이아웃이나 탐색을 바꿨다면 `npm run test:e2e`도 실행합니다.

웹사이트는 언어 전환 없이 영어로 운영합니다. 표시되는 제목·설명·기여·역할·수업명·링크 문구와 접근성 텍스트는 모두 영어로 작성합니다. 원본 PDF·표지 이미지·링크·파일명·ID·날짜는 보존합니다. 자료가 한국어인 경우 `Korean` 또는 `Korean edition`으로 안내합니다. 관리 문서와 화면에 표시하지 않는 원문 정보는 한국어로 보존할 수 있습니다.

## 소개

- 홈 한 문장 소개: `data/portfolio-config.json`의 `profile.tagline`. 소속 나열 대신 하는 일과 목적을 담습니다.
- 홈 약력: `profile.background`에서 CV 항목의 `section`, `id`를 참조합니다.
- 한국어 소개 원본: `data/profile-intro.md`에 보존합니다. 현재 홈에는 표시하지 않습니다.
- CV에는 Summary를 표시하지 않습니다.

## Writing

글은 `reports`에 추가합니다. `id`, `title`, `description`, `contribution`, `date`(YYYY-MM), `category`, `kind`, `type`이 필요합니다.

- `kind`: `Article`, `Report`, `Paper Review`.
- `type: "url"`: `url`에 원문 주소.
- `type: "pdf"`: `filename`에 `data/reports/` 안 파일명. 페이지에서 미리보기와 원본 다운로드를 제공합니다.

공저서는 `publications`에 등록합니다. 표지·제목·출판사·출간일·기여 설명·서점 링크만 노출합니다. 책 본문은 올리지 않습니다. 표지의 세로 비율은 유지됩니다.

공저서의 `title`은 영어 표시 제목, `originalTitle`은 검색에만 사용하는 원제입니다. `publisher`는 영문 표기, `language: "ko"`는 한국어판 안내에 사용합니다. 기여 설명은 `description`을 CV와 Writing에서 함께 사용합니다.

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

## CV: All / Finance / Crypto

Work experience와 Research experience는 세 버전에서 항목·설명·내부 순서를 모두 공유합니다. 두 섹션은 원본 배열 순서를 사용하며 분야 필터와 재정렬을 적용하지 않습니다. 경력을 임의로 숨기거나 WorldQuant 등을 특정 버전에서만 위로 옮기지 않습니다.

분야별 우선순위는 `cv.views.<view>.sections`로 고정합니다. 다른 작업을 하면서 이 순서를 변경하지 않습니다.

- Finance: Education → Research → Work → Publication → Projects → Awards → Qualifications → Extracurricular.
- Crypto: Work → Publication → Research → Projects → Awards → Events → Extracurricular → Qualifications → Education.
- All: Work → Publication → Research → Projects → Awards → Extracurricular → Events → Qualifications → Education.

Publication은 모든 버전에서 Work 바로 다음에 둡니다. Education은 Finance에서 첫 번째, All·Crypto에서 마지막이며 중간에 넣지 않습니다. Expertise와 그 하위 관심 분야·기술 목록은 CV에서 제거했습니다.

PDAO, Base Korea, Undergrad AI Study의 활동은 `cv.extracurricular`에서 관리합니다. Base Korea의 Based Advocate 활동은 Work 대신 이 섹션에 두며, PDAO와 함께 Finance·Crypto 양쪽에 포함됩니다.

NinjaLabsKR, SuperteamKR, POSTECH CCBR은 `cv.affiliations`에서 관리하고, **Crypto에서만** Extracurricular 끝에 `Affiliations · NinjaLabsKR · SuperteamKR · POSTECH CCBR` 한 줄로 표시합니다. 별도의 큰 섹션은 만들지 않으며 All·Finance에는 표시하지 않습니다. 역할·기간·설명은 데이터에 보존하되 CV 화면과 인쇄에서는 소속명만 보여줍니다. 항목 이동 시 ID도 보존합니다.

나머지 섹션에는 필요할 때만 분야별 노출과 우선순위를 설정할 수 있습니다.

```json
{
  "id": "extracurricular-example",
  "period": "2025.06 - Present",
  "role": "Member",
  "organization": "Organization",
  "audiences": ["finance", "crypto"],
  "order": { "all": 2, "finance": 0, "crypto": 3 },
  "highlights": ["공통 성과", "추가 설명"],
  "highlightsByView": { "finance": ["금융 지원에서 강조할 사실"] }
}
```

- **All**은 일반 CV 항목을 모두 표시합니다. 보조 정보인 Affiliations 한 줄은 사용자 지정으로 Crypto에서만 표시하는 예외입니다.
- `audiences`: 해당 항목을 보여줄 분야. 생략하면 공통 항목입니다. Work·Research에는 적용하지 않습니다.
- `order`: 보기별 정렬 우선순위. 작은 숫자가 먼저 나오며, 없으면 원래 배열 순서를 유지합니다. Work·Research에는 적용하지 않습니다.
- `highlightsByView`: 보기별로 강조할 사실. 없으면 공통 `highlights`를 사용합니다. Work·Research는 항상 공통 설명을 표시합니다. 날짜·직책·성과를 과장하거나 새로 만들지 않습니다.
- `cv.views`: 보기별 탭 이름과 섹션 순서를 관리합니다.
- `cv.publicationIds` / `cv.projectIds`: 위에서 등록한 책·프로젝트의 ID만 넣습니다. 같은 자료를 CV에 중복 입력하지 않습니다.

`#cv?view=finance`, `#cv?view=crypto` 링크를 공유할 수 있습니다. **Print current view**는 화면과 동일한 문서 구조로 현재 CV를 인쇄합니다. 모든 경력 상세는 화면에서도 펼쳐집니다. 다운로드 링크는 **PDF · English**만 표시하며 한국어 PDF 링크는 표시하지 않습니다. 원본 PDF는 별도 관리하며 자동으로 덮어쓰지 않습니다.

2026년 이공 우수인재 장학의 영문명은 CV와 History 모두 **Outstanding STEM Talent Scholarship**으로 표기합니다.

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
