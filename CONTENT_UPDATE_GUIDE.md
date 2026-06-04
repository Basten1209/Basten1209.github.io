# 포트폴리오 콘텐츠 업데이트 가이드

이 문서는 포트폴리오 사이트의 콘텐츠를 업데이트하는 방법을 안내합니다.
모든 콘텐츠는 `data/portfolio-config.json` 중앙 설정 파일에서 관리됩니다.

---

## 1. Home 섹션 텍스트 수정

**파일**: `data/portfolio-config.json` > `profile`

| 필드 | 설명 |
|------|------|
| `tagline` | 히어로 영역 태그라인 (HTML `<strong>` 지원) |
| `status` | 상태 배지 텍스트 (예: "Available for Technical Research") |
| `focusAreas[]` | 3개 포커스 카드 (`icon`, `title`, `description`) |

```json
{
  "profile": {
    "tagline": "Investigating the convergence of <strong>Crypto Markets</strong>...",
    "status": "Available for Technical Research",
    "focusAreas": [
      { "icon": "token", "title": "Crypto Markets", "description": "..." }
    ]
  }
}
```

---

## 2. 리포트/아티클 추가 (Articles 섹션)

**파일**: `data/portfolio-config.json` > `reports[]`

### PDF 리포트 추가

1. PDF 파일을 `data/reports/` 폴더에 추가
2. `reports[]` 배열에 메타데이터 추가:

```json
{
  "id": "unique-id",
  "filename": "파일명.pdf",
  "title": "리포트 제목",
  "description": "리포트 요약 설명 (카드에 표시됨)",
  "contribution": "주 저자",
  "date": "2025-03",
  "category": "PDAO",
  "type": "pdf"
}
```

### 외부 링크 (Medium, 블로그 등) 추가

PDF 없이 외부 URL로 연결할 수 있습니다:

```json
{
  "id": "medium-article-1",
  "title": "아티클 제목",
  "description": "아티클 요약 설명",
  "contribution": "주 저자",
  "date": "2025-03",
  "category": "Personal",
  "type": "url",
  "url": "https://medium.com/@seungjun-oh/article-slug"
}
```

### 필드 설명

| 필드 | 필수 | 설명 |
|------|------|------|
| `id` | O | 고유 식별자 |
| `title` | O | 제목 |
| `description` | O | 요약 설명 (행/카드에 표시) |
| `contribution` | O | 기여도 → 자동으로 영문 역할 라벨로 변환됨 (아래 표 참고) |
| `date` | O | 발간 날짜 (YYYY-MM 형식, 연도별 그룹 + 최신순 정렬) |
| `category` | O | 카테고리 (스파인 색상 결정: PDAO=크림슨, Bithumb=슬레이트, POSTECH=인디고) |
| `type` | O | `"pdf"` 또는 `"url"` |
| `filename` | PDF일 때 | PDF 파일명 (`data/reports/` 내 파일명과 일치) |
| `url` | URL일 때 | 외부 링크 주소 |
| `selected` | 선택 | `true`로 지정 시 상단 **Selected Works**(표지 썸네일 카드)에 노출. **딱 3개 권장** |

### Selected Works (엄선작) 지정

상단 "Selected Works" 영역은 `reports[]`에서 `"selected": true`가 붙은 항목만 카드로 보여줍니다.
PDF 항목은 첫 페이지가 표지 썸네일로 자동 렌더됩니다 (lazy load). **3개를 권장**하며, 노출 순서는
`renderSelected`의 `order` 배열(`assets/js/main.js`)에서 id로 제어합니다. 표지가 너무 무거운 대용량
PDF(20MB+)는 피하고, 가능하면 PDF 타입을 고르세요(외부 링크는 타이포그래픽 표지로 대체됨).

### 기여도(contribution) → 영문 역할 자동 변환

행/카드에는 한글 기여도가 아래 규칙으로 정규화되어 영문으로 표시되며, 필터의 Role 축은 3단계 티어로 묶입니다.

| 입력값(예시) | 표시 라벨 | 필터 티어 |
|------|------|------|
| `주 저자` | Lead Author | Lead Author |
| `리포트 코디네이팅 …` | Coordinator | Coordinator |
| `프로젝트 리더` | Project Lead | Contributor |
| `Research Assistant로 참여` | Research Assistant | Contributor |
| `데이터 수집 및 전처리` 등 | Data & Preprocessing 등 | Contributor |

> 새로운 기여도 문자열을 쓰면 매핑되지 않아 원문 그대로 표시될 수 있습니다.
> 매핑을 추가하려면 `assets/js/main.js`의 `ROLE_MAP` / `normalizeRole` / `roleTier`를 수정하세요.

---

## 2-1. 학습자료 추가 (Learning / Study Notes 섹션)

**파일**: `data/portfolio-config.json` > `learning[]`

본인이 직접 만든 학습 노트·가이드(또는 참고 링크)를 모아 두는 **단순 링크 모음** 섹션입니다.
하나의 평면 리스트로 표시되며 별도 그룹/필터는 없습니다. **배열이 비어 있으면 "준비 중 (TBD)" 상태**가 표시됩니다.

```json
{
  "id": "note-1",
  "title": "노트/가이드 제목",
  "source": "출처 또는 게시 위치 (선택)",
  "level": "note",
  "type": "url",
  "url": "https://...",
  "note": "한 줄 설명 (선택)"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `id` | O | 고유 식별자 |
| `title` | O | 자료 제목 |
| `source` | 선택 | 출처/게시 위치 |
| `level` | 선택 | 좌측 아이콘: `note`(편집) / `foundational`(학교) / `paper`(문서) / `repo`(코드) / `course` / `book` |
| `type` | O | `"url"`(외부 링크) 또는 `"pdf"`(`data/reports/` 내 파일) |
| `url` / `filename` | 타입별 | 외부 URL 또는 PDF 파일명 |
| `note` | 선택 | 한 줄 설명 |

> 현재는 비어 있어 "준비 중 (TBD)" 상태입니다. 본인 자료가 준비되면 위 형식으로 추가하세요.

---

## 3. Experience History 수정

**파일**: `data/proof-of-work.xlsx`

스프레드시트를 직접 수정 후 저장합니다. Experience 섹션에서 자동으로 로딩됩니다.

또는 `data/portfolio-config.json` > `cv.experience[]`에서 구조화 데이터를 수정할 수 있습니다:

```json
{
  "period": "2025.12 -",
  "role": "Technical Writer (Intern)",
  "team": "TechBD team",
  "organization": "B-Harvest",
  "url": "https://bharvest.io",
  "type": "Technical",
  "highlights": ["업무 내용 1", "업무 내용 2"]
}
```

**type 값**: `Technical`, `Military`, `Community`, `Leadership`

---

## 4. CV 업데이트

### 방법 A: 구조화 데이터 (권장)

`data/portfolio-config.json` > `cv` 섹션의 각 카테고리를 직접 수정:

- `cv.education[]` - 학력
- `cv.experience[]` - 경력
- `cv.research[]` - 연구 경험
- `cv.skills` - 기술 스택 및 관심 분야
- `cv.publication[]` - 출판물
- `cv.projects[]` - 프로젝트
- `cv.events[]` - 발표 및 이벤트
- `cv.awards[]` - 수상 및 장학금
- `cv.certificates` - 자격증 (finance, cs, general)

---

## 5. 이력서 PDF 추가

**파일**: `data/portfolio-config.json` > `resumes[]`

1. PDF 파일을 `data/resume/` 폴더에 추가
2. 메타데이터 추가:

```json
{
  "id": "resume_2025",
  "title": "Resume 2025",
  "file": "data/resume/resume_2025.pdf",
  "language": "en"
}
```

---

## 6. 프로필 정보 수정

**파일**: `data/portfolio-config.json` > `profile`

- `email`, `emailAlt` - 이메일
- `social.linkedin`, `social.twitter`, `social.github`, `social.medium` - 소셜 링크
- `image` - 프로필 사진 경로 (`assets/images/profile.jpg` 교체)

---

## 배포

```bash
# JSON 유효성 검증
npm run validate-json

# 로컬 테스트
npm run serve
# http://localhost:8080 접속

# 배포 (main 브랜치에 푸시)
git add data/portfolio-config.json
git commit -m "docs: update portfolio content"
git push origin main
```

GitHub Pages가 자동으로 1-2분 내 배포합니다.

---

**업데이트 날짜**: 2026-06-05
**버전**: 4.0 (Articles 아카이브 리디자인 + Learning 섹션)
