# flout-resident-webapp

FLOUT 주민용 모바일 웹앱 — 공공데이터로 우리 집 침수 취약도를 확인하고, 현장점검 → 맞춤 예방안 → 지원·시공까지 연결하는 부천시 반지하 침수 예방 서비스.

- 기획·기능명세: Notion `술제술제 › 기능명세서`
- 디자인: [Figma › 주민용 최종디자인](https://www.figma.com/design/vGHXBD128aui75dvqLXEbP/FLOUT?node-id=1115-2380) · [주민용 디자인 시스템](https://www.figma.com/design/vGHXBD128aui75dvqLXEbP/FLOUT?node-id=1162-561)

---

## 1. 시작하기

```bash
# Node 22 권장 (.nvmrc) · 최소 20
npm install
cp .env.example .env   # VITE_USE_MOCK=true 면 백엔드 없이 목업 데이터로 동작
npm run dev            # http://localhost:5173
```

- 처음 받았을 때, `package.json` 이 바뀌었을 때 → `npm install` 다시 실행
- 같은 와이파이의 휴대폰에서 터미널에 뜨는 Network 주소로 접속 가능
- **`/__screens`** — 전체 화면 목록 (구현 여부 · 경로 · Figma 링크). 미구현 화면도 다음 화면으로 이동하며 플로우 확인 가능

| 환경변수            | 설명                                                                            |
| ------------------- | ------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | 백엔드 API 주소 (끝에 `/` 없이)                                                 |
| `VITE_JUSO_API_KEY` | 도로명주소 검색 API 승인키 ([business.juso.go.kr](https://business.juso.go.kr)) |
| `VITE_USE_MOCK`     | `true` 면 `src/api/mocks.ts` 목업 데이터 사용                                   |

| 스크립트            | 설명                                      |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | 개발 서버                                 |
| `npm run build`     | 타입체크 + 프로덕션 빌드 (`dist/`)        |
| `npm run preview`   | 빌드 결과 미리보기                        |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | TypeScript 타입체크만                     |
| `npm run format`    | Prettier 정렬 (Tailwind 클래스 순서 포함) |

---

## 2. 작업 방법 (Git)

`main` 하나만 유지. 작업마다 `main` 에서 브랜치를 따서 PR 로 머지.

```
main ← feat/작업이름  (PR 머지 후 브랜치 삭제)
```

**GitHub Desktop 기준**

1. Current Branch `main` → **Fetch origin** → **Pull origin** (최신 받기)
2. **New Branch** → `feat/inspection-apply` 처럼 생성 (main 기준)
3. VS Code 에서 작업 → `npm run dev` 로 확인
4. 커밋 메시지 작성 → **Commit** (여러 번 가능)
5. **Publish branch** → **Create Pull Request** → 브라우저에서 PR 생성
6. CI 초록 체크 확인 → **Merge pull request** → **Delete branch**
7. 다음 작업은 1번부터

**주의**

- `main` 에 직접 커밋 금지 — 항상 브랜치 → PR
- `node_modules`, `.env` 는 커밋 금지 (`.gitignore` 에 포함)
- PR 에 conflict 가 뜨면 내 브랜치에서 **Branch → Update from main** 후 충돌 파일 수정 → 커밋 → 푸시

---

## 3. 진행 현황

### 완료 — 초기세팅

| 항목             | 내용                                                                                                                                                        | 위치                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 프로젝트 설정    | Vite + React + TS strict, `@/` 별칭, ESLint, Prettier, `.env.example`, `.nvmrc`, VS Code 추천 확장                                                          | 루트 설정 파일                         |
| 디자인 토큰      | 주민용 디자인 시스템(Figma 1162:561)의 색상 11 · 타이포 8 · radius · 레이아웃 값을 Tailwind 토큰으로 정의                                                   | `src/styles/index.css`                 |
| 공통 컴포넌트    | Button · TextField · Textarea · ChoiceGroup · CheckItem · BottomSheet · ProgressBar/StepProgress · InfoCard · StatusText · KeyValueList · ListRow · Divider | `src/components/ui`                    |
| 레이아웃         | AppLayout(모바일 폭 고정) · AppHeader(56px, 뒤로가기) · Screen(헤더 + 본문 + 하단 고정 CTA)                                                                 | `src/components/layout`                |
| 라우팅           | 주민용 화면 32개 라우트. 바텀시트·상태 변형 프레임까지 Figma 노드 ↔ 경로 ↔ 기능명세 ID 매핑                                                                 | `src/routes`, `src/constants/paths.ts` |
| 화면             | 온보딩 · 01 홈 · 02 취약도 결과(높음/낮음) 구현, 나머지 29개 placeholder                                                                                    | `src/pages`                            |
| 개발용 화면 목록 | `/__screens`                                                                                                                                                | `src/pages/dev`                        |
| 도메인 타입      | 노션 기능명세(RISK · INSPECTION · STATUS · RESULT · SUPPORT · CONSTRUCTION · NOTI) 기반                                                                     | `src/types/domain.ts`                  |
| API 레이어       | fetch 래퍼(타임아웃·에러 처리·토큰), 도메인별 React Query 훅, 목업 스위치, 도로명주소 API 연동                                                              | `src/api`, `src/lib/http.ts`           |
| 상태             | 현장점검 신청 3단계 폼 draft 스토어                                                                                                                         | `src/stores/inspectionDraft.ts`        |
| GitHub           | PR 템플릿, 이슈 템플릿(기능·버그), CI(`npm ci` → lint → build), Vercel SPA rewrite                                                                          | `.github`, `vercel.json`               |

검증: 타입체크 · ESLint 에러 0, 홈·취약도 결과 화면 Figma 대조 확인

### 다음 — 화면 구현 순서

사용자 흐름 순서. 각 단계 = 브랜치 1개 = PR 1개. 단계끼리 파일이 겹치지 않아 나눠서 병렬 작업 가능.

| #   | 브랜치                  | 화면 (Figma)                                                                      | 기능명세                                     | 파일 (`src/pages/…`)                                                                                                                 |
| --- | ----------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `feat/inspection-apply` | 03 신청(주택 상황) → 03-2 날짜 입력 → 03-3 정보 확인 → 04-1 접수 완료 → 04-2 이후 절차 | INSPECTION-01~10, NOTI-01                    | `inspection/InspectionApplyPage` · `InspectionSchedulePage` · `InspectionConfirmPage` · `InspectionCompletePage` · `InspectionNextStepsPage` |
| 2   | `feat/applications`     | 05 내 신청 · 05-2 전체 내역 · 06-1 진행 허브 · 06-2 신청 정보 · 07-1 방문 일정 · 07-2 방문 전 안내 | STATUS-01~06, NOTI-02·03                     | `applications/*`                                                                                                                     |
| 3   | `feat/result`           | 08-1 결과 요약 · 08-2 취약지점·현장사진 · 08-3 전문가 권장 예방조치               | RESULT-01~08, NOTI-04                        | `result/*`                                                                                                                           |
| 4   | `feat/support`          | 09-1 지원 안내 · 09-2 조건·서류(+10 신청 바텀시트) · 11 신청 완료 · 12-1~4 진행상태  | SUPPORT-01~09, CONSTRUCTION-01~03, NOTI-05·06 | `support/*`                                                                                                                          |
| 5   | `feat/construction`     | 13 시공 일정(+13-1 방문전 확인 시트) · 14 시공 진행 · 15 시공 완료                | CONSTRUCTION-04~07, NOTI-07·08               | `construction/*`                                                                                                                     |
| 6   | `feat/notifications`    | 16 알림(+16-1 상세 시트)                                                          | NOTI-01~08                                   | `notifications/NotificationsPage`                                                                                                    |
| 7   | `feat/guide`            | 02 가이드 생성 중 · 03 가이드 상세(+04 해결 여부 시트) · 05 미해결 사유 · 06 해결 완료 | RISK-07                                      | `guide/*`                                                                                                                            |
| 8   | `feat/auth`             | 로그인 · 회원가입 · 00 정보 제공 동의                                             | —                                            | `auth/LoginPage` · `SignupPage` · `ConsentPage`                                                                                      |

### 확인·결정 필요

- [ ] 백엔드 API 스펙 확정 → `src/api/*`, `src/types/domain.ts` 반영 (`TODO(백엔드)` 검색)
- [ ] 인증 방식 확정 (Google OAuth / 이메일)
- [ ] 로고 에셋 — Figma 'FLOUT' 로고를 `public/` 에 내보내 온보딩·파비콘 교체 (현재 임시 아이콘)
- [ ] 도로명주소 API 승인키 발급 및 운영 도메인 등록
- [ ] 배포처 결정 (Vercel 기준 `vercel.json` 준비됨)
- [ ] 기획 확인 — 물 유입 위치 선택지에 '화장실'(Figma 에만 있음) 포함 여부
- [ ] `.prettierrc` 에 `"tailwindStylesheet": "./src/styles/index.css"` 추가 후 `npm run format` (커스텀 토큰 클래스 정렬)

---

## 4. 새 화면 만들기

1. `/__screens` 또는 `src/routes/screens.ts` 에서 해당 화면의 Figma 노드·기능명세 확인
2. `src/pages/<도메인>/XxxPage.tsx` 의 `<ScreenPlaceholder>` 를 실제 UI로 교체
```tsx
   <Screen header={{ title: '현장점검 신청' }} bottom={<Button>다음</Button>}>
     …본문
   </Screen>
```
3. 버튼·입력창·선택지 등은 `@/components/ui` 사용 — hex 색상 직접 사용 금지, 토큰 클래스 사용
4. 데이터는 `src/api/*` 훅 사용 (`useApplication(id)` 등). 목업 부족하면 `src/api/mocks.ts` 에 추가
5. 상태 문구(접수·검토 중·승인 등)는 `src/constants/labels.ts` 에서 가져오기
6. 페이지 이동은 `navigate(generatePath(PATHS.xxx, { applicationId }))` — 경로 문자열 직접 쓰지 않기
7. 완료 후 `src/routes/screens.ts` 의 `status` 를 `'done'` 으로 변경

---

## 5. 기술 스택

**런타임**

| 영역            | 라이브러리                         | 버전  | 선택 이유                                                   |
| --------------- | ---------------------------------- | ----- | ----------------------------------------------------------- |
| UI              | React                              | 19.3  |                                                             |
| 라우팅          | React Router (data router, `lazy`) | 7.18  | 화면별 코드 스플리팅, `generatePath` 로 경로 파라미터 타입 체크 |
| 서버 상태       | TanStack Query                     | 5.104 | 신청 진행상태 캐시·갱신·재시도                              |
| 클라이언트 상태 | Zustand                            | 5.0   | 3단계 신청 폼처럼 화면 간 공유 상태만 (서버 데이터는 Query) |
| 스타일          | Tailwind CSS (`@tailwindcss/vite`) | 4.3   | Figma 변수를 `@theme` 토큰으로 1:1 매핑                     |
| 아이콘          | lucide-react                       | 0.511 | 디자인 시스템의 선형 아이콘과 같은 계열                     |
| 유틸            | clsx                               | 2.1   | 조건부 className (`cn()`)                                   |
| 폰트            | Pretendard Variable (CDN)          | 1.3.9 | 디자인 시스템 지정 서체                                     |

**개발 도구**

| 영역             | 도구                                                                 | 버전                       |
| ---------------- | -------------------------------------------------------------------- | -------------------------- |
| 빌드 · 개발 서버 | Vite + `@vitejs/plugin-react`                                        | 6.4 · 4.7                  |
| 언어             | TypeScript (`strict`, `noUnusedLocals`, `@/` 경로 별칭)              | 5.8                        |
| 린트             | ESLint flat config + typescript-eslint + react-hooks + react-refresh | 9 · 8                      |
| 포맷             | Prettier + prettier-plugin-tailwindcss                               | 3 · 0.6                    |
| CI               | GitHub Actions — `npm ci` → lint → build                             | `.github/workflows/ci.yml` |
| 런타임           | Node.js                                                              | 22 (`.nvmrc`)              |

> 정확한 버전은 `package-lock.json` 기준. 의존성 추가 시 `npm install <pkg>` 후 lock 파일까지 커밋.

---

## 6. 폴더 구조

```
src/
├─ api/                 # 도메인별 API 함수 + React Query 훅, 목업
│  ├─ queryClient.ts    #   QueryClient, queryKeys, withMock()
│  ├─ risk.ts           #   RISK  주소 검색 · 취약도 분석 · 예방 가이드
│  ├─ applications.ts   #   INSPECTION / STATUS / RESULT / SUPPORT / CONSTRUCTION
│  ├─ notifications.ts  #   NOTI
│  └─ mocks.ts          #   VITE_USE_MOCK=true 일 때 쓰는 데이터 (Figma 예시 문구)
├─ components/
│  ├─ ui/               # 디자인 시스템 컴포넌트
│  ├─ layout/           # AppLayout, AppHeader, Screen(헤더+본문+하단 CTA)
│  └─ dev/              # ScreenPlaceholder (미구현 화면용)
├─ constants/
│  ├─ paths.ts          # 라우트 경로 패턴 (PATHS)
│  └─ labels.ts         # enum 코드 → 한국어 문구/색
├─ lib/                 # http(fetch 래퍼), env, storage, cn, hooks
├─ pages/<도메인>/       # 화면 컴포넌트 (1 화면 = 1 파일, default export)
├─ routes/
│  ├─ router.tsx        # 라우트 정의
│  └─ screens.ts        # Figma 프레임 ↔ 라우트 ↔ 기능명세 매핑 (화면 목록 기준 파일)
├─ stores/              # Zustand 스토어
├─ styles/index.css     # Tailwind + 디자인 토큰
└─ types/domain.ts      # 기능명세 기반 도메인 타입 (백엔드 확정 전 가안)
```

---

## 7. 디자인 토큰 (Figma → Tailwind)

`src/styles/index.css` 의 `@theme` 에 정의. **hex 값 직접 사용 금지, 토큰 클래스 사용.**

| Figma                             | Tailwind                                                 | 값                                            |
| --------------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| color/primary · onPrimary         | `bg-primary` `text-on-primary`                           | #234F73 · #FFF                                |
| color/page · surface · soft       | `bg-page` `bg-surface` `bg-soft`                         | #F4F5F6 · #FFF · #EEF3F7                      |
| color/ink · body · muted · border | `text-ink` `text-body-text` `text-muted` `border-border` | #202B36 · #43515E · #596672 · #C8D0D7         |
| color/danger · warning · success  | `text-danger` `text-warning` `text-success`              | #A53632 · #865A16 · #27654D                   |
| Risk / Title / Heading / Section  | `text-risk` `text-title` `text-heading` `text-section`   | 30·26·20·16px Bold                            |
| Body / Label / Caption / Button   | `text-body` `text-label` `text-caption` `text-button`    | 14 Reg · 14 Med · 13 Reg · 16 Bold            |
| radius 4 · 6 · 8 · 12             | `rounded-sm` `rounded-md` `rounded-lg` `rounded-xl`      | 썸네일 · 버튼/입력/카드 · 신청 CTA · 바텀시트 |
| 좌우 여백 20 · 헤더 56            | `px-gutter` `h-header`                                   |                                               |

> ⚠️ Figma 의 `color/body` 는 타이포 `Body` 와 클래스명이 겹쳐서 `text-body-text` 로 이름 변경 (`text-body` = 14px 본문 크기)

디자인 원칙 (디자인 시스템 문서 발췌)

- 위험·주의·완료는 **색 + 상태명 + 아이콘** 함께 표시 (`<StatusText>`)
- 일반 카드·입력창은 그림자 없이 표면과 경계로 구분, 안내·서류·알림에만 카드 (`<InfoCard>`)
- 화면 구조: 헤더 56 → 본문 스크롤(좌우 20) → 하단 고정 CTA 84 (`<Screen header bottom>`)
- 취약도는 확률(%) 대신 **높음 / 주의 / 낮음** 등급으로만 표현

---

## 8. 화면 ↔ 라우트 ↔ 기능명세

전체 매핑은 `src/routes/screens.ts`. 요약:

| 그룹          | Figma 프레임                                         | 경로                                                         | 명세                              |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------------ | --------------------------------- |
| 진입          | 온보딩 / 로그인 / 회원가입 / 00 정보 제공 동의       | `/onboarding` `/login` `/signup` `/consent`                  |                                   |
| 홈·취약도     | 01 홈화면                                            | `/`                                                          | RISK-01                           |
|               | 02 취약도 결과 · 01 결과-낮음                        | `/risk/:assessmentId`                                        | RISK-02~06, 08, 09                |
| 예방 가이드   | 02 생성 중 · 03 상세(+04 시트) · 05 미해결 · 06 해결 | `/risk/:assessmentId/guide/*`                                | RISK-07                           |
| 현장점검 신청 | 03 → 03-2 → 03-3 → 04-1 → 04-2                       | `/inspection/apply/*`, `/inspection/complete/:applicationId` | INSPECTION-01~10                  |
| 내 신청       | 05 · 05-2 · 06-1 허브 · 06-2 · 07-1 · 07-2           | `/applications`, `/applications/:applicationId/*`            | STATUS-01~06                      |
| 점검 결과     | 08-1 · 08-2 · 08-3                                   | `/applications/:applicationId/result/*`                      | RESULT-01~08                      |
| 지원          | 09-1 · 09-2(+10 시트) · 11 · 12-1~4                  | `/applications/:applicationId/support/*`                     | SUPPORT-01~09, CONSTRUCTION-01~03 |
| 시공          | 13(+13-1 시트) · 14 · 15                             | `/applications/:applicationId/construction/*`                | CONSTRUCTION-04~07                |
| 알림          | 16 (+16-1 시트)                                      | `/notifications`                                             | NOTI-01~08                        |

---

## 9. 백엔드 연동

- `.env` 의 `VITE_API_BASE_URL` 설정 후 `VITE_USE_MOCK=false`
- API 경로·응답 형태는 `src/api/*.ts`, `src/types/domain.ts` 에 **가안**으로 작성 (`TODO(백엔드)` 검색). 스펙 확정 시 이 두 곳만 수정
- 응답이 `{ data, message }` 형태로 감싸져 있으면 `src/lib/http.ts` 반환부만 수정
- 주소 검색(RISK-01)은 `VITE_JUSO_API_KEY` 입력 시 실제 검색. CORS 문제 시 백엔드 프록시로 이동

## 10. 배포

SPA 라우팅이라 모든 경로를 `index.html` 로 rewrite 필요 (Vercel 은 `vercel.json` 포함, Netlify 는 `_redirects`).

## 11. 컨벤션

- 브랜치: `main` + `feat/<요약>` (예: `feat/inspection-apply`), 수정은 `fix/<요약>`
- 커밋: `feat:` `fix:` `refactor:` `style:` `chore:` `docs:` + 한국어 요약 (예: `feat: 현장점검 신청 1단계 화면`)
- PR: 템플릿에 Figma 노드 링크 + 기능명세 ID + 모바일 스크린샷 첨부
- 코드: import 는 `@/` 절대경로, 컴포넌트 파일명 PascalCase, 훅은 `useXxx`
