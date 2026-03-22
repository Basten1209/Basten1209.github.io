# Portfolio Redesign: "The Editorial Archive"

## Project Overview
Seungjun Oh의 Web3/Blockchain 분야 주니어 리서쳐 & Technical Writer 포트폴리오 웹사이트 리디자인.
기존 구식 디자인을 디자이너가 제공한 "The Editorial Archive" 컨셉으로 전면 개편.

## Tech Stack
- **Framework:** Vanilla HTML/CSS/JS 정적 사이트 (GitHub Pages 호스팅)
- **CSS:** Tailwind CSS (CDN Play) - 레퍼런스 디자인 기반
- **Fonts:** Manrope (headlines), Newsreader (body), Inter (labels)
- **Icons:** Material Symbols Outlined
- **Libraries:** marked.js, DOMPurify, PDF.js, XLSX (모두 CDN)
- **Data:** `data/portfolio-config.json` 중앙 설정 파일

## Design System Rules (DESIGN.md 기반)
- **No-Line Rule:** 1px border 금지. 섹션 구분은 배경색 전환으로만
- **Surface Hierarchy:** surface (#f8f9fa) → surface-container-low (#f1f4f6) → surface-container-lowest (#ffffff)
- **Typography Mixing:** Manrope bold 헤드라인 + Newsreader serif 본문 조합이 시그니처
- **Tonal Layering:** 전통적 drop shadow 금지. Ambient shadow (24px blur, 4% opacity) 사용
- **Glassmorphism:** 네비게이션 바에 bg-white/70 + backdrop-blur-md 적용
- **Color:** Primary deep blue (#4c6078), 100% black 텍스트 금지 (on_surface #2b3437 사용)

## Architecture
- SPA with hash routing: `#home`, `#articles`, `#experience`, `#cv`
- 4개 섹션으로 확장 (기존 3개 + 탭 → 탭 제거, 4개 독립 섹션)
- PDF 뷰어는 모달 방식으로 전환
- Excel 테이블은 에디토리얼 스타일로 리렌더링

## Key Files
- `index.html` - 메인 HTML (전면 재작성)
- `assets/js/main.js` - 모든 프론트엔드 로직
- `assets/css/style.css` - 삭제 예정 (Tailwind으로 대체)
- `data/portfolio-config.json` - 콘텐츠 설정
- `reference/` - 디자이너 레퍼런스 (읽기 전용)

## Reference Materials
- `reference/syntactic_blueprint/DESIGN.md` - 디자인 시스템 문서
- `reference/home_seungjun_oh_portfolio/` - 홈 페이지 레퍼런스
- `reference/my_articles/` - 아티클/리서치 페이지 레퍼런스
- `reference/experience_history_sheet/` - 경력/히스토리 페이지 레퍼런스
- `reference/resume_cv/` - CV 페이지 레퍼런스

## Commands
- `npm run serve` - 로컬 서버 (Python HTTP, port 8080)
- `npm run generate-lists` - PDF 파일 목록 자동 생성
- `npm run validate-json` - JSON 설정 파일 검증
