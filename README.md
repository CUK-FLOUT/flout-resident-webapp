# flout-resident-webapp

FLOUT 주민용 모바일 웹앱 — 공공데이터로 우리 집 침수 취약도를 확인하고, 현장점검 → 맞춤 예방안 → 지원·시공까지 연결하는 부천시 반지하 침수 예방 서비스.

- 기획·기능명세: Notion `술제술제 › 기능명세서`
- 디자인: [Figma › 주민용 최종디자인](https://www.figma.com/design/vGHXBD128aui75dvqLXEbP/FLOUT?node-id=1115-2380) · [주민용 디자인 시스템](https://www.figma.com/design/vGHXBD128aui75dvqLXEbP/FLOUT?node-id=1162-561)

## 시작하기

```bash
# Node 20 이상 (.nvmrc 참고)
npm install
cp .env.example .env   # VITE_USE_MOCK=true 면 백엔드 없이 목업 데이터로 동작
npm run format         # 최초 1회: Tailwind 클래스 순서 정렬 (prettier-plugin-tailwindcss)
# ↑ 처음 설치한 사람은 생성된 package-lock.json 을 커밋해 주세요
npm run dev            # http://localhost:5173  (같은 와이파이 휴대폰에서 Network 주소로 접속 가능)
```

개발 서버에서 **`/__screens`** 로 들어가면 전체 화면 목록(구현 여부, 경로, Figma 링크)을 볼 수 있어요. 미구현 화면은 placeholder 로 떠서 플로우를 끝까지 클릭해 볼 수 있습니다.

| 스크립트            | 설명                                      |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | 개발 서버                                 |
| `npm run build`     | 타입체크 + 프로덕션 빌드 (`dist/`)        |
| `npm run preview`   | 빌드 결과 미리보기                        |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | TypeScript 타입체크만                     |
| `npm run format`    | Prettier 정렬 (Tailwind 클래스 순서 포함) |

## 기술 스택

| 영역            | 선택                                    | 이유                                                              |
| --------------- | --------------------------------------- | ----------------------------------------------------------------- |
| 빌드            | Vite 6 + React 19 + TypeScript (strict) |                                                                   |
| 스타일          | Tailwind CSS v4                         | Figma 변수를 `@theme` 토큰으로 1:1 매핑                           |
| 라우팅          | React Router v7 (data router, lazy)     | 화면별 코드 스플리팅                                              |
| 서버 상태       | TanStack Query v5                       | 신청 상태 갱신·캐시·재시도                                        |
| 클라이언트 상태 | Zustand                                 | 3단계 신청 폼 등 화면 간 공유 상태만                              |
| 아이콘          | lucide-react                            | 디자인 시스템의 선형 아이콘(chevron, map-pin, info …)과 동일 계열 |

## 폴더 구조

```
src/
├─ api/                 # 도메인별 API 함수 + React Query 훅, 목업
│  ├─ queryClient.ts    #   QueryClient, queryKeys, withMock()
│  ├─ risk.ts           #   RISK  주소 검색 · 취약도 분석 · 예방 가이드
│  ├─ applications.ts   #   INSPECTION / STATUS / RESULT / SUPPORT / CONSTRUCTION
│  ├─ notifications.ts  #   NOTI
│  └─ mocks.ts          #   VITE_USE_MOCK=true 일 때 쓰는 데이터 (Figma 예시 문구)
├─ components/
│  ├─ ui/               # 디자인 시스템 컴포넌트 (Button, TextField, ChoiceGroup, BottomSheet …)
│  ├─ layout/           # AppLayout, AppHeader, Screen(헤더+본문+하단 CTA)
│  └─ dev/              # ScreenPlaceholder (미구현 화면용)
├─ constants/
│  ├─ paths.ts          # 라우트 경로 패턴 (PATHS)
│  └─ labels.ts         # enum 코드 → 한국어 문구/색
├─ lib/                 # http(fetch 래퍼), env, storage, cn, hooks
├─ pages/<도메인>/       # 화면 컴포넌트 (1 화면 = 1 파일, default export)
├─ routes/
│  ├─ router.tsx        # 라우트 정의
│  └─ screens.ts        # Figma 프레임 ↔ 라우트 ↔ 기능명세 매핑 (화면 목록의 source of truth)
├─ stores/              # Zustand 스토어
├─ styles/index.css     # Tailwind + 디자인 토큰
└─ types/domain.ts      # 기능명세 기반 도메인 타입 (백엔드 확정 전 가안)
```

## 디자인 토큰 (Figma → Tailwind)

`src/styles/index.css` 의 `@theme` 에 정의돼 있어요. **hex 값을 직접 쓰지 말고 토큰 클래스를 쓰세요.**

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

> ⚠️ Figma 의 `color/body` 는 타이포 `Body` 와 클래스명이 겹쳐서 `text-body-text` 로 이름을 바꿨어요. (`text-body` = 14px 본문 크기)

디자인 원칙(디자인 시스템 문서에서 발췌)

- 위험·주의·완료는 **색 + 상태명 + 아이콘**을 함께 (`<StatusText>`)
- 일반 카드·입력창은 그림자 없이 표면과 경계로 구분, 안내·서류·알림에만 카드(`<InfoCard>`)
- 화면 구조: 헤더 56 → 본문 스크롤(좌우 20) → 하단 고정 CTA 84 (`<Screen header bottom>`)
- 취약도는 확률(%)로 말하지 않고 **높음 / 주의 / 낮음** 등급으로만

## 화면 ↔ 라우트 ↔ 기능명세

전체 매핑은 `src/routes/screens.ts` 에 있어요. 요약:

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

현재 구현: **온보딩, 홈(01), 취약도 결과(02 / 낮음)** — 나머지는 placeholder.

## 새 화면 만들기

1. `src/routes/screens.ts` 에서 해당 화면의 Figma 노드·명세 확인
2. `src/pages/<도메인>/XxxPage.tsx` 의 `<ScreenPlaceholder>` 를 실제 UI로 교체
   ```tsx
   <Screen header={{ title: '현장점검 신청' }} bottom={<Button>다음</Button>}>
     …
   </Screen>
   ```
3. 데이터는 `src/api/*` 훅 사용 (`useApplication(id)` 등). 목업이 부족하면 `api/mocks.ts` 에 추가
4. 한국어 상태 문구는 `constants/labels.ts` 에서
5. `screens.ts` 의 `status` 를 `'done'` 으로

## 백엔드 연동

- `.env` 의 `VITE_API_BASE_URL` 설정 후 `VITE_USE_MOCK=false`
- API 경로·응답 형태는 `src/api/*.ts` 와 `src/types/domain.ts` 에 **가안**으로 적혀 있어요 (`TODO(백엔드)` 검색). 백엔드 스펙이 확정되면 이 두 곳만 맞추면 됩니다.
- 응답 포맷이 `{ data, message }` 래핑이면 `src/lib/http.ts` 의 반환부만 수정
- 주소 검색(RISK-01)은 [도로명주소 API](https://business.juso.go.kr) 승인키를 `VITE_JUSO_API_KEY` 에 넣으면 실제 검색. CORS 문제가 있으면 백엔드 프록시로 옮기세요.

## 배포

SPA 라우팅이라 호스팅에서 모든 경로를 `index.html` 로 rewrite 해야 해요 (Vercel/Netlify 기본 SPA 설정 또는 `_redirects`).

## 컨벤션

- 브랜치: `main` ← `develop` ← `feat/<이슈번호>-<요약>` (예: `feat/12-inspection-apply`)
- 커밋: `feat:` `fix:` `refactor:` `style:` `chore:` `docs:` + 한국어 요약 (예: `feat: 현장점검 신청 1단계 화면`)
- PR: 템플릿에 Figma 노드 링크 + 명세 ID + 모바일 스크린샷 첨부
- import 는 `@/` 절대경로, 컴포넌트 파일명 PascalCase, 훅은 `useXxx`
