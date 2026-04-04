# Seungjun Oh - Portfolio Website

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://basten1209.github.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

개인 포트폴리오 웹사이트 - 크립토/블록체인 리서치 및 개발 경험을 소개합니다.

🌐 **Live Site**: [https://basten1209.github.io](https://basten1209.github.io)

## ✨ 주요 기능

- 📱 **반응형 디자인** - 모바일, 태블릿, 데스크톱 최적화
- 🌙 **다크모드 지원** - 시스템 설정 자동 감지
- 📄 **PDF 뷰어** - 이력서 및 리포트 온라인 열람
- 📊 **동적 데이터 관리** - JSON 기반 콘텐츠 관리
- ⚡ **빠른 로딩** - 정적 사이트, CDN 활용
- 🔍 **검색 기능** - 히스토리 테이블 실시간 검색
- 📈 **자동 정렬** - 날짜 기준 리포트 정렬

## 🏗️ 사이트 구조

```
Basten1209.github.io/
├── index.html              # 메인 페이지
├── assets/
│   ├── css/
│   │   └── style.css       # 스타일시트 (다크모드 포함)
│   ├── js/
│   │   └── main.js         # 기능 구현
│   └── images/
│       └── profile.jpg     # 프로필 사진
├── data/
│   ├── portfolio-config.json    # 통합 설정 파일 ⭐
│   ├── profile-intro.md         # 프로필 소개
│   ├── summary.md               # 요약 섹션
│   ├── proof-of-work.xlsx       # 히스토리 테이블
│   ├── resume/                  # 이력서 PDF
│   └── reports/                 # 리포트 PDF
├── scripts/
│   ├── generate-file-list.js    # 파일 목록 자동 생성
│   └── validate-json.js         # JSON 유효성 검증
├── .github/
│   └── workflows/
│       └── update-portfolio.yml # GitHub Actions
├── CONTENT_UPDATE_GUIDE.md      # 업데이트 가이드
├── package.json                 # Node.js 설정
└── README.md                    # 이 파일
```

## 🎨 주요 섹션

### 1. **Home** - 프로필 소개
- 프로필 사진
- 자기소개 (Markdown 지원)
- 최근 경력 요약

### 2. **Resume/CV** - 이력서
- PDF 이력서 (한글/영문)
- 구조화된 CV 데이터 (JSON 기반)

### 3. **Proof of Work** - 성과물
- 14개+ 리서치 리포트
- PDF 뷰어 내장
- 기여도 정보 표시
- Excel 히스토리 테이블 (검색/정렬)

## 🚀 빠른 시작

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/Basten1209/Basten1209.github.io.git
cd Basten1209.github.io

# 로컬 서버 실행 (Python)
python -m http.server 8080

# 또는 Node.js 서버
npm run serve

# 브라우저에서 http://localhost:8080 접속
```

### 콘텐츠 업데이트

자세한 업데이트 방법은 [CONTENT_UPDATE_GUIDE.md](CONTENT_UPDATE_GUIDE.md)를 참조하세요.

#### 빠른 예제

**새 리포트 추가**:
```bash
# 1. PDF 파일 추가
cp "New Report.pdf" data/reports/

# 2. portfolio-config.json 수정 (reports 배열에 추가)

# 3. 커밋 & 푸시
git add data/reports/"New Report.pdf" data/portfolio-config.json
git commit -m "docs: add new report"
git push origin main
```

## 🛠️ 자동화 도구

### 파일 목록 생성

```bash
npm run generate-lists
```

`data/reports/`와 `data/resume/` 폴더를 스캔하여 새 파일을 감지합니다.

### JSON 유효성 검증

```bash
npm run validate-json
```

모든 JSON 설정 파일의 형식과 필수 필드를 검증합니다.

## 🔄 배포

### 자동 배포 (GitHub Pages)

`main` 브랜치에 푸시하면 자동으로 배포됩니다.

```bash
git push origin main
# 1-2분 후 https://basten1209.github.io 업데이트
```

### GitHub Actions

`.github/workflows/update-portfolio.yml`이 자동으로:
- JSON 파일 유효성 검증
- 필수 파일 존재 확인
- PDF 파일 일관성 체크
- 파일 목록 자동 생성

## 📦 기술 스택

### Frontend
- **HTML5** - 시맨틱 마크업
- **CSS3** - CSS Variables, Flexbox, Grid
- **Vanilla JavaScript (ES6+)** - 프레임워크 없이 구현

### Libraries (CDN)
- **marked** - Markdown 파싱
- **DOMPurify** - XSS 방지
- **XLSX** - Excel 파일 파싱
- **PDF.js** - PDF 렌더링

### Tools
- **Node.js** - 빌드 스크립트
- **GitHub Pages** - 호스팅
- **GitHub Actions** - CI/CD

## 🎯 개선 사항 (v2.0)

### ✅ 업데이트 편의성
- ✨ **통합 설정 파일** (`portfolio-config.json`)
- ✨ **Markdown 기반 콘텐츠** (프로필 소개)
- ✨ **자동 파일 목록 생성** 스크립트
- ✨ **JSON 유효성 검증** 자동화
- ✨ **GitHub Actions** 워크플로우

### ✅ 가독성 향상
- ✨ **날짜순 리포트 정렬**
- ✨ **카테고리별 분류**
- ✨ **개선된 레이아웃**

### ✅ UX 개선
- ✨ **다크모드** 지원
- ✨ **PDF 로딩 프로그레스 바**
- ✨ **반응형 개선**
- ✨ **더 나은 네비게이션**

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 👤 저자

**Seungjun Oh (오승준)**

- 🌐 Website: [basten1209.github.io](https://basten1209.github.io)
- 📧 Email: seungjunoh@postech.ac.kr
- 💼 LinkedIn: [seungjun5](https://www.linkedin.com/in/seungjun5/)
- 🐦 Twitter: [@seungjun_x](https://x.com/seungjun_x)
- 📝 Medium: [@seungjun-oh](https://medium.com/@seungjun-oh)
- 💻 GitHub: [@Basten1209](https://github.com/Basten1209)

## 🤝 기여

버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

질문이나 제안사항이 있으시면 [Issues](https://github.com/Basten1209/Basten1209.github.io/issues)를 통해 연락주세요.

---

**Last Updated**: 2024-12-09
**Version**: 2.0.0
