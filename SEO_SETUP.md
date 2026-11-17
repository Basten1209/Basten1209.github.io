# SEO / AI 검색 운영

기존 사이트는 초기 HTML에 본문이 없고 `#writing` 등의 해시로 화면을 전환했습니다. 이제 빌드 시 실제 React 화면을 HTML로 생성하므로, JavaScript를 실행하지 않는 검색기와 방문자도 본문·출처·문서 링크를 읽을 수 있습니다. Google도 [JavaScript 사이트에서 사전 렌더링과 실제 경로 링크를 권장](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)합니다.

## 공개 주소

| 페이지 | 주소 |
| --- | --- |
| Home | `https://seungjun.site/` |
| Writing | `https://seungjun.site/writing/` |
| Projects | `https://seungjun.site/projects/` |
| CV One-pager | `https://seungjun.site/cv/` |
| CV All | `https://seungjun.site/cv/all/` |
| History | `https://seungjun.site/history/` |
| 공저서 소개 | `https://seungjun.site/writing/book/digital-asset-era/` |

프로젝트는 `/projects/#project-lift`처럼 같은 문서의 항목으로 연결합니다. 예전 해시 주소는 JavaScript로 해당 공개 주소에 이동합니다. 새 링크는 실제 경로를 사용합니다. GitHub Pages는 해시를 서버로 전달받지 않으므로 예전 해시를 서버의 301 응답으로 바꿀 수는 없습니다.

## 자동 생성 설정

- `src/lib/seo.mjs`: 페이지별 제목·설명·canonical·Open Graph·Twitter 카드, JSON-LD, 사이트맵의 단일 원본.
- JSON-LD: Person(한국어 이름 포함), WebSite, ProfilePage/CollectionPage/WebPage, BreadcrumbList, 작품 목록, 책의 서지 정보. 확인되지 않은 직책·소속이나 단독 저자 표기를 추가하지 않습니다.
- `scripts/prerender.mjs`: 공개 페이지마다 `dist/<path>/index.html` 생성. 기존 컴포넌트와 데이터를 그대로 사용하며 별도 검색봇 전용 본문은 없습니다.
- `dist/sitemap.xml`: 실제 HTML을 생성하는 canonical 주소만 포함. 필터 쿼리·해시·외부 글 주소는 제외합니다. 확인된 페이지 수정일이 없으므로 `lastmod`를 빌드 시각으로 만들어 넣지 않습니다.
- `robots.txt`: 공개 콘텐츠와 OAI-SearchBot 접근 허용, 사이트맵 주소 안내. 기존 전체 허용 정책을 유지합니다. [OAI-SearchBot은 ChatGPT 검색용이며 GPTBot의 학습 목적과 구분](https://developers.openai.com/api/docs/bots)됩니다.
- `dist/404.html`: 없는 주소를 홈으로 위장하지 않는 `noindex` 오류 문서. 실제 404 상태는 GitHub Pages가 제공합니다. Vite preview의 미등록 경로 처리는 배포 서버와 다를 수 있습니다.

Google의 [AI 검색 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)에 맞춰 검색 가능한 본문·명확한 출처·일관된 주소에 집중합니다. `llms.txt`나 특별한 AI 전용 schema가 Google AI 검색의 필수 조건은 아닙니다. 설정만으로 색인·순위·AI 답변 인용이 보장되지는 않습니다.

## 배포 후 계정에서 진행할 작업

저장소 변경만으로 Search Console의 소유권 확인이나 색인 요청이 완료되지는 않습니다.

1. 기존 GitHub Actions 워크플로로 **`dist/`**를 배포합니다. Pages 소스는 GitHub Actions, 도메인은 `seungjun.site`를 유지합니다.
2. [Google Search Console](https://search.google.com/search-console)에서 기존 속성을 선택합니다. 없다면 도메인 속성을 만들고 화면에서 발급한 DNS TXT 값으로 소유권을 확인합니다. 임의의 인증 토큰을 코드에 넣지 않습니다.
3. Sitemaps에서 `https://seungjun.site/sitemap.xml`을 제출합니다. robots.txt에도 같은 주소가 있으므로 크롤러가 발견할 수 있습니다. [Google 사이트맵 제출 안내](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
4. 홈·Writing·Projects·CV를 [URL 검사](https://support.google.com/webmasters/answer/9012289)로 확인하고 라이브 테스트 후 색인 생성을 요청합니다. canonical, 본문, 리소스 접근 여부를 확인합니다.
5. Bing Webmaster Tools를 사용하는 경우 같은 사이트맵을 제출합니다. 이후 검색 관리 도구에서 색인 상태·노출·클릭 변화를 확인합니다.

## 유지보수와 검증

```sh
npm test
npm run build
npm run test:e2e
```

브라우저 검증은 데스크톱/모바일에서 메타데이터·사이트맵·본문 HTML·로컬 링크·이미지/PDF·기존 링크·hydration·JavaScript 없는 탐색을 확인합니다. 콘텐츠 원본은 기존 JSON과 One-pager Markdown을 유지합니다. 사이트 주소를 바꾸면 `src/lib/site.mjs`의 `siteOrigin`, `CNAME`, `robots.txt`의 사이트맵 주소를 함께 수정합니다.

외부 Notion·Medium 글의 원문 색인 설정은 해당 서비스에서 관리합니다. 이 사이트에는 제목·기여·설명·원문 링크를 노출하며, 외부 글의 색인 여부까지 변경하지는 않습니다.
