# 포트폴리오 업데이트 가이드

이 문서는 포트폴리오 사이트의 콘텐츠를 쉽게 업데이트하는 방법을 안내합니다.

## 📋 목차

- [빠른 업데이트 (코드 수정 불필요)](#빠른-업데이트-코드-수정-불필요)
- [리포트 추가](#리포트-추가)
- [이력서 추가](#이력서-추가)
- [프로필 정보 수정](#프로필-정보-수정)
- [자동화 도구 사용](#자동화-도구-사용)
- [배포 방법](#배포-방법)

---

## 빠른 업데이트 (코드 수정 불필요)

### 📝 CV 업데이트

**파일**: `data/cv.md`

1. Markdown 형식으로 작성
2. 저장 후 커밋 & 푸시
3. 자동으로 사이트에 반영됨

```bash
git add data/cv.md
git commit -m "docs: update CV"
git push origin main
```

### 🏠 홈 소개 업데이트

**파일**: `data/profile-intro.md`

간단한 소개 텍스트를 Markdown 형식으로 작성합니다.

```markdown
크립토 마켓과 산업에 관심이 많은 유저입니다...

과거 빗썸경제연구소 리서치센터 인턴 경험...
```

### 📊 요약 섹션 업데이트

**파일**: `summary.md`

홈 페이지 하단에 표시되는 요약 정보를 작성합니다.

---

## 리포트 추가

### 1단계: PDF 파일 추가

새 리포트 PDF를 `data/reports/` 폴더에 추가합니다.

```bash
cp "New Report.pdf" data/reports/
```

### 2단계: 메타데이터 추가

**파일**: `data/portfolio-config.json`의 `reports` 배열에 추가

```json
{
  "id": "new-report",
  "filename": "New Report.pdf",
  "title": "New Report - Subtitle",
  "contribution": "주 저자",
  "date": "2024-12",
  "category": "Research"
}
```

### 필드 설명

- `id`: 고유 식별자
- `filename`: 실제 PDF 파일명 (정확히 일치해야 함)
- `title`: 리포트 제목
- `contribution`: 기여도 설명 (예: "주 저자", "Research Assistant로 참여")
- `date`: 발간 날짜 (YYYY-MM 형식, 최신순 정렬에 사용)
- `category`: 카테고리 (예: "Bithumb", "PDAO", "Personal")

### 3단계: 커밋 & 푸시

```bash
git add data/reports/"New Report.pdf" data/portfolio-config.json
git commit -m "docs: add new research report"
git push origin main
```

### 리포트 순서

리포트는 `date` 필드를 기준으로 **최신순 자동 정렬**됩니다.

---

## 이력서 추가

### 1단계: PDF 파일 추가

새 이력서 PDF를 `data/resume/` 폴더에 추가합니다.

```bash
cp resume_2024.pdf data/resume/
```

### 2단계: 메타데이터 추가

**파일**: `data/portfolio-config.json`의 `resumes` 배열에 추가

```json
{
  "id": "resume_2024",
  "title": "Resume 2024",
  "file": "data/resume/resume_2024.pdf",
  "language": "en"
}
```

### 3단계: 커밋 & 푸시

```bash
git add data/resume/resume_2024.pdf data/portfolio-config.json
git commit -m "docs: add 2024 resume"
git push origin main
```

---

## 프로필 정보 수정

**파일**: `data/portfolio-config.json`

### 이메일 변경

```json
{
  "profile": {
    "email": "new-email@example.com",
    "emailAlt": "alt-email@example.com"
  }
}
```

### 소셜 링크 변경

```json
{
  "profile": {
    "social": {
      "linkedin": "https://linkedin.com/in/your-profile",
      "twitter": "https://twitter.com/your-handle",
      "github": "https://github.com/your-username",
      "medium": "https://medium.com/@your-username"
    }
  }
}
```

### 프로필 사진 변경

**파일**: `assets/images/profile.jpg`를 새 이미지로 교체

```bash
cp new-profile-photo.jpg assets/images/profile.jpg
git add assets/images/profile.jpg
git commit -m "chore: update profile photo"
git push origin main
```

---

## 자동화 도구 사용

### 파일 목록 자동 생성

새 PDF 파일을 추가한 후 자동으로 목록을 생성할 수 있습니다.

```bash
# Node.js 설치 필요
npm run generate-lists
```

이 명령은:
- `data/reports/`와 `data/resume/` 폴더를 스캔
- 새로운 PDF 파일을 감지
- 누락된 파일 경고

### JSON 파일 유효성 검증

설정 파일이 올바른지 확인합니다.

```bash
npm run validate-json
```

에러가 발생하면 JSON 형식이나 필수 필드 누락을 확인하세요.

---

## 배포 방법

### GitHub Pages 자동 배포

이 사이트는 GitHub Pages를 사용하여 자동으로 배포됩니다.

#### 배포 프로세스

1. 변경사항을 `main` 브랜치에 푸시
2. GitHub이 자동으로 사이트 빌드
3. 1-2분 후 사이트 업데이트 완료

#### 배포 확인

```bash
# 변경사항 푸시
git push origin main

# 브라우저에서 확인
# https://basten1209.github.io
```

### 로컬 테스트

배포하기 전에 로컬에서 테스트할 수 있습니다.

```bash
# Python HTTP 서버 실행
npm run serve

# 또는 직접 실행
python -m http.server 8080

# 브라우저에서 http://localhost:8080 접속
```

---

## 자주 묻는 질문 (FAQ)

### Q: JSON 파일을 수정했는데 사이트에 반영이 안 됩니다.

**A**: 다음을 확인하세요:
1. JSON 문법이 올바른지 (`npm run validate-json`)
2. 파일을 저장했는지
3. Git에 커밋하고 푸시했는지
4. 브라우저 캐시를 클리어했는지 (Ctrl+Shift+R)

### Q: PDF 파일을 추가했는데 드롭다운에 나타나지 않습니다.

**A**: `portfolio-config.json`에 메타데이터를 추가했는지 확인하세요. 파일명이 정확히 일치해야 합니다.

### Q: 사이트가 다크모드를 지원하나요?

**A**: 네! 시스템 설정(OS)의 다크모드가 자동으로 적용됩니다.

### Q: 리포트 순서를 변경하려면?

**A**: `portfolio-config.json`에서 `date` 필드를 수정하면 자동으로 최신순 정렬됩니다.

### Q: 에러 메시지가 표시됩니다.

**A**: 브라우저 콘솔(F12)을 열어 에러 로그를 확인하세요. 일반적인 원인:
- 파일 경로 오류
- JSON 문법 오류
- 네트워크 문제

---

## 체크리스트

### 새 리포트 추가 시

- [ ] PDF 파일을 `data/reports/`에 추가
- [ ] `portfolio-config.json`에 메타데이터 추가
- [ ] JSON 유효성 검증 (`npm run validate-json`)
- [ ] 로컬 테스트 (`npm run serve`)
- [ ] Git 커밋 & 푸시
- [ ] 사이트 확인 (1-2분 후)

### 프로필 정보 변경 시

- [ ] `portfolio-config.json` 또는 해당 `.md` 파일 수정
- [ ] 이메일/링크 정확성 확인
- [ ] 프로필 사진 교체 (필요시)
- [ ] JSON 유효성 검증
- [ ] Git 커밋 & 푸시

---

## 추가 도움말

문제가 해결되지 않으면:

1. GitHub Issues에 문제 등록
2. 브라우저 개발자 도구 콘솔 확인
3. JSON 유효성 검사 도구 사용 (jsonlint.com)

## 관련 파일

- 📄 [README.md](README.md) - 프로젝트 개요
- 📊 [portfolio-config.json](data/portfolio-config.json) - 메인 설정 파일 ⭐
- 🎨 [style.css](assets/css/style.css) - 스타일 설정
- ⚙️ [main.js](assets/js/main.js) - 기능 구현

---

## 변경 이력

### v2.0 (2024-12-09)
- ✅ 통합 설정 파일(`portfolio-config.json`) 도입
- ✅ 다크모드 지원
- ✅ PDF 로딩 프로그레스 바
- ✅ 자동화 스크립트 추가
- ✅ GitHub Actions 워크플로우
- 🗑️ 레거시 파일 삭제 (`report-contributions.json` - portfolio-config.json에 통합됨)

---

**업데이트 날짜**: 2024-12-09
**버전**: 2.0
