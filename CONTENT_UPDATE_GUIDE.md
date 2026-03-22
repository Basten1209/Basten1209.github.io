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
| `description` | O | 요약 설명 (카드 미리보기에 표시) |
| `contribution` | O | 기여도 (예: "주 저자", "Research Assistant로 참여") |
| `date` | O | 발간 날짜 (YYYY-MM 형식, 최신순 정렬) |
| `category` | O | 카테고리 (Bithumb, PDAO, Personal 등) |
| `type` | O | `"pdf"` 또는 `"url"` |
| `filename` | PDF일 때 | PDF 파일명 (`data/reports/` 내 파일명과 일치) |
| `url` | URL일 때 | 외부 링크 주소 |

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

### 방법 B: 마크다운 (레거시)

`data/cv.md` 파일을 직접 수정. CV 섹션에서 마크다운 렌더링으로 표시됩니다.

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

**업데이트 날짜**: 2026-03-23
**버전**: 3.0
