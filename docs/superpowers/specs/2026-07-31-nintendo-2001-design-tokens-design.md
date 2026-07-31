# Nintendo.com 2001 디자인 토큰 적용 — Design

- 작성일: 2026-07-31
- 작성자: Claude + jhlee
- 적용 범위: `release-manager-web` 의 `src/app/styles/globals.css` + `tailwind.config.js` + shadcn base 컴포넌트 4종
- 영향 테마: 라이트 / 다크 양쪽 전면 교체
- 원천 자료: `getdesign.md` 의 `nintendo-2001` 템플릿 (`npx getdesign@latest add nintendo-2001`)

## 1. 배경

현재 웹 프로젝트는 "Backstage" 디자인 시스템(중립 회색 램프 + 티얼 브랜드)을 shadcn HSL 토큰 형태로 쓰고 있다. 이를 getdesign.md 의 `nintendo-2001` 템플릿 — 2001년 Nintendo.com 을 "콘솔 하드웨어로 렌더링된 웹"으로 해석한 디자인 시스템 — 으로 교체한다.

정체성 요약: 모든 UI 영역이 **페리윙클 금속판(beveled periwinkle plate)** 이고, 상단이 밝게 엣지-라이트되고 아래에 크롬-인디고 그림자선이 깔린다. 어두운 **카본 네이비 command layer**(내비 / 사이드바 / 푸터)가 크롬 위에 얹히고, 따뜻한 색(amber / signal orange / nav-gold)은 **길찾기 신호 전용**으로 배급된다.

### 1.1 원천 자료 조사 결과

`getdesign` CLI 는 `./DESIGN.md` **마크다운 한 장만** 떨어뜨린다 (README: *"`add` writes `./DESIGN.md` at your project root"*). CSS 변수를 생성하지 않으므로 토큰 변환은 전량 수작업이다.

템플릿에는 두 가지 원천이 존재하고 **서로 다른 디자인**이다.

| | DESIGN.md 산문 | Preview 구현 (`preview.html`) |
|---|---|---|
| 라이트 canvas | periwinkle `#7a8aba` (UI 전역 본체) | `#ffffff` 흰색 |
| periwinkle 사용처 | UI 전역 | 히어로 배너 1곳 |
| nav bar | carbon `#21242e` 슬랩 + 할프톤 | canvas 와 동일 |
| primary | Nintendo red `#e60012` | amber `#ecab37` |

**진실 원천은 DESIGN.md 산문으로 확정한다.** 근거는 스펙 자체의 규정이다.

> **Examples (illustrative)** — *Kit-mirror demonstration surfaces. Each `ex-*` entry references brand-native primitives so downstream consumers (`/preview-design`, `/generate-kit`) re-skin the same 10 surfaces consistently.*

Preview 페이지는 이 `/preview-design` 출력물이다. 템플릿 간 비교 일관성을 위해 10개 표면을 동일 형태로 재도색하는 하네스이므로 정체성을 흰 캔버스 + 액센트 1색으로 눌러버린다. 닌텐도의 재현물이 아니다.

### 1.2 Preview 에서 채택하는 것

Preview 는 진실 원천이 아니지만 세 가지는 산문의 공백을 메우거나 산문의 판단을 검증한다.

1. **`{colors.hairline}` 실체** — `#b3b9d6`(라이트) / `#39415e`(다크). 산문이 `search-field` / `text-input` / `radio-option` 3곳에서 참조하는데 Colors 섹션에 정의를 빼먹은 색이다. `--input` 공백이 채워진다.
2. **primary = amber, red = danger 전용** — 산문의 Don't(*"Never a surface fill outside the logo plate"*)를 저작자 본인이 구현에서 지킨 증거. shadcn `--primary` 는 기본 버튼 fill 이므로 Nintendo red 를 매핑하면 앱 전체가 빨간 버튼이 되고 산문을 정면 위반한다.
3. **다크 파생 규칙 + 램프 hex** — `preview-dark.html` 이 별도 저작 파일이고 자체 서술문을 갖는다.

> *"the console interface taken down to a **midnight-navy machine under low light**. Beveled metal plates still assemble the page, but the chassis darkens: the canvas drops to deep midnight navy, plates become dark slate-blue, and **the bevel line lifts brighter than the surface** so each panel's edge still catches light. Warm amber and orange wayfinding signal ... are preserved."*

### 1.3 다크 램프가 산문과 충돌하지 않는 이유

추출한 다크 램프를 HSL 로 풀면 전부 페리윙클과 같은 색상환(222–228°) 위에 있다.

| Preview 다크 | HSL | 산문 쿨 크롬 | HSL |
|---|---|---|---|
| `#0e1018` | `hsl(228, 26%, 7%)` | canvas `#7a8aba` | `hsl(225, 32%, 60%)` |
| `#161a26` | `hsl(225, 27%, 12%)` | periwinkle `#8ba1d4` | `hsl(222, 46%, 69%)` |
| `#39415e` | `hsl(227, 25%, 30%)` | chrome-indigo `#3d4f97` | `hsl(228, 42%, 42%)` |
| `#aeb6d4` | `hsl(227, 31%, 76%)` | muted-indigo `#60619c` | `hsl(239, 24%, 49%)` |

다크 램프는 **페리윙클 색조를 명도만 내린 단일 hue 램프** — 문자 그대로 "전원 꺼진 페리윙클 콘솔"이다. 산문과 충돌하는 것은 Preview 의 **라이트**(무채색 흰 캔버스)뿐이고, 다크는 오히려 산문에 더 충실하다. 따라서 **라이트만 페리윙클로 재정박하고 다크는 추출값을 거의 그대로 쓴다.**

## 2. 목표

1. 라이트 / 다크 양 테마의 기존 토큰 계약 85개 선언(라이트 42 + 다크 43)을 전량 채우고, 크롬 레이어용 `--plate-highlight` 2선언을 추가한다 (총 87).
2. 산문의 크롬 정체성(베벨 플레이트 / 챔퍼 / 할프톤 / 아웃라인 디스플레이 타입)을 유틸리티 클래스로 구현하고 shadcn base 컴포넌트 4종에 적용한다.
3. 산문에 없는 15종(차트 5 · 카테고리 4 · theme-color 5 · 포커스 링 1)을 **산문 내 색에서 파생**해 채운다. 새 색을 발명하지 않는다.
4. WCAG AA(본문 4.5:1)를 배치 규칙으로 통제한다.
5. 로컬에서 확인 후 마음에 안 들면 **한 줄로 원복** 가능하게 한다.

## 3. 비목표 (Out of Scope)

- ❌ 레이아웃 변경 — 고정폭 780–830px 캔버스, 듀얼 내비바, 우측 액션 레일, 회전 좌측 탭. 업무용 내부 툴에 2001년 밀도/고정폭을 적용하면 사용성 손해가 크다.
- ❌ 히어로 포토그래피 필드 / Mario 마스코트 / ESRB 뱃지 / 캘린더 위젯 — 이 앱에 대응물이 없다.
- ❌ 픽셀 폰트(Silkscreen / VT323 / Press Start 2P) 웹폰트 추가 — 별건.
- ❌ `xterm-themes.ts` / `linkHelpers.tsx` / `version-site-chart.tsx` 의 하드코딩 hex 3개 파일 — 토큰 교체 후 별도 판단.
- ❌ 본문 12px / 마이크로 10px 축소 — 현재 사이즈 유지 (§7.2 참조).

## 4. 원천 색 팔레트

산문 16색 + Preview 파생 램프.

### 4.1 산문 색 (HSL 변환)

| 이름 | Hex | HSL |
|---|---|---|
| Nintendo Red / error | `#e60012` | `355 100% 45%` |
| Signal Orange | `#f68d1f` | `31 92% 54%` |
| Amber | `#ecab37` | `38 83% 57%` |
| Nav Gold | `#e48600` | `35 100% 45%` |
| Periwinkle Metallic (canvas) | `#7a8aba` | `225 32% 60%` |
| Light Periwinkle | `#8ba1d4` | `222 46% 69%` |
| Pale Sky (canvas-soft) | `#9fbee7` | `214 60% 76%` |
| Pale Lavender | `#acace7` | `240 55% 79%` |
| Pale Ice | `#c0d5e6` | `207 43% 83%` |
| Chrome Indigo | `#3d4f97` | `228 42% 42%` |
| Muted Indigo | `#60619c` | `239 24% 49%` |
| Platinum Gray | `#dedede` | `0 0% 87%` |
| White | `#ffffff` | `0 0% 100%` |
| Carbon Navy (ink) | `#21242e` | `226 16% 15%` |
| Systems Teal | `#206479` | `194 58% 30%` |
| Games Red | `#a7282b` | `359 61% 41%` |

`{colors.carbon}` 은 Colors 섹션에 자체 항목이 없으나 Text 섹션의 *"Carbon Navy (`{colors.ink}` — #21242e): ...and the fill of the dark command layer"* 로 `carbon = ink = #21242e` 로 확정. `{colors.ink-soft}` 는 chrome-indigo 와 동일 hex.

### 4.2 Preview 파생 램프

| 용도 | 라이트 | 다크 |
|---|---|---|
| hairline | `#b3b9d6` = `230 30% 77%` | `#39415e` = `227 25% 30%` |
| 다크 canvas | — | `#0e1018` = `228 26% 7%` |
| 다크 plate | — | `#161a26` = `225 27% 12%` |
| 다크 raised | — | `#1e2330` = `224 24% 15%` |
| 다크 hover | — | `#252b38` = `221 20% 18%` |
| 다크 mid | — | `#7c84a6` = `229 19% 57%` |
| 다크 muted-fg | — | `#aeb6d4` = `227 31% 76%` |
| 다크 on-primary | — | `#070910` = `227 39% 5%` |

다크 hover / raised / mid 3색은 토큰 선언에는 없지만 Preview 렌더링 실측에서 실제로 페인트되는 중간 단계다.

## 5. 토큰 매핑

### 5.1 표면 위계 — 이 설계의 핵심

산문의 표면 역할은 다음과 같고, 이 위계를 지키는 것이 대비 문제의 해법이다 (§7.1).

- **canvas** `#7a8aba` = 플레이트 **사이의 섀시**. 텍스트 표면이 아니다.
- **platinum** `#dedede` = *"the list-row and inset **content surface**"*
- **white** `#ffffff` = *"Content cards, form fields"*
- **carbon** `#21242e` = command layer, 크롬 **위**에 얹힘
- **white 텍스트** = *"Text on carbon, red, and orange chrome"* 에만

라이트 3단 위계: **carbon 사이드바(가장 어두움) > canvas 페이지(페리윙클 섀시) > white 카드(가장 밝음)**. 기존 Backstage 라이트의 3단 구조(slate-100 > slate-50 > white)와 동일한 형태이나 페이지가 페리윙클 금속면으로 바뀌고 사이드바가 카본 슬랩으로 승격된다.

다크 위계: **canvas 7% > plate 12% > raised 15% > hover 18% > bevel 30%**. 베벨선이 표면보다 **밝다** — 다크 극성 반전.

### 5.2 라이트 (42개)

```
:root.light {
  --background:             225 32% 60%;   /* canvas #7a8aba — 페리윙클 섀시 */
  --foreground:             226 16% 15%;   /* ink #21242e */
  --card:                   0 0% 100%;     /* white — 콘텐츠 카드 */
  --card-foreground:        226 16% 15%;
  --popover:                0 0% 100%;
  --popover-foreground:     226 16% 15%;

  --primary:                38 83% 57%;    /* amber #ecab37 — Preview 채택 */
  --primary-foreground:     226 16% 15%;   /* ink on amber */

  --secondary:              214 60% 76%;   /* canvas-soft #9fbee7 — light inset panel */
  --secondary-foreground:   226 16% 15%;

  --muted:                  0 0% 87%;      /* platinum #dedede — list-row surface */
  --muted-foreground:       228 42% 42%;   /* ink-soft #3d4f97 — platinum 위에서만 */

  --accent:                 222 46% 69%;   /* periwinkle #8ba1d4 — raised mid panel */
  --accent-foreground:      226 16% 15%;

  --destructive:            355 100% 45%;  /* error #e60012 */
  --destructive-foreground: 0 0% 100%;

  --border:                 228 42% 42%;   /* chrome-indigo — 베벨 그림자선 */
  --input:                  230 30% 77%;   /* hairline #b3b9d6 — Preview 추출 */
  --ring:                   31 92% 54%;    /* signal #f68d1f */

  --chart-1:                214 60% 40%;   /* sky, 차트용 명도 하향 */
  --chart-2:                194 58% 30%;   /* systems-teal */
  --chart-3:                240 55% 50%;   /* lavender, 차트용 명도 하향 */
  --chart-4:                359 61% 41%;   /* games-red */
  --chart-5:                226 16% 45%;   /* carbon hue 중명도 = 쿨 그레이 */

  --cat-database:           214 60% 40%;
  --cat-web:                194 58% 30%;
  --cat-engine:             240 55% 50%;
  --cat-etc:                226 16% 45%;

  --theme-color-1:          214 60% 40%;
  --theme-color-2:          194 58% 30%;
  --theme-color-3:          240 55% 50%;
  --theme-color-4:          359 61% 41%;
  --theme-color-5:          226 16% 45%;

  --header-bg:              226 16% 15%;   /* carbon — nav-bar 슬랩 */

  --sidebar-bg:             226 16% 15%;   /* carbon — command layer */
  --sidebar-fg:             0 0% 100%;
  --sidebar-fg-muted:       214 60% 76%;   /* canvas-soft, 산문의 footer 텍스트색 */
  --sidebar-border:         228 42% 42%;   /* chrome-indigo 베벨선 */
  --sidebar-hover:          226 16% 22%;   /* carbon 한 단계 밝게 */
  --sidebar-active-bg:      35 100% 16%;   /* nav-gold 딥 틴트 */
  --sidebar-active-fg:      38 83% 57%;    /* amber */
  --sidebar-active-border:  31 92% 54% / 0.45;
}
```

### 5.3 다크 (43개)

```
:root,
:root.dark {
  --background:             228 26% 7%;    /* #0e1018 미드나이트 네이비 */
  --foreground:             0 0% 100%;
  --card:                   225 27% 12%;   /* #161a26 다크 슬레이트블루 플레이트 */
  --card-foreground:        0 0% 100%;
  --popover:                225 27% 12%;
  --popover-foreground:     0 0% 100%;

  --primary:                38 83% 57%;    /* amber — 양 테마 불변 */
  --primary-foreground:     227 39% 5%;    /* #070910 */

  --secondary:              224 24% 15%;   /* #1e2330 */
  --secondary-foreground:   0 0% 100%;

  --muted:                  221 20% 18%;   /* #252b38 */
  --muted-foreground:       227 31% 76%;   /* #aeb6d4 */

  --accent:                 31 60% 18%;    /* signal 딥 틴트 */
  --accent-foreground:      31 92% 54%;    /* signal — 불변 */

  --destructive:            355 100% 45%;  /* 불변 */
  --destructive-foreground: 0 0% 100%;     /* ⚠ Preview 이탈 — §5.4 */

  --border:                 227 25% 30%;   /* #39415e — 표면보다 밝은 베벨선 */
  --input:                  227 25% 30%;
  --ring:                   31 92% 54%;

  --radius:                 0.375rem;      /* 6px — §6.1 */

  --chart-1:                214 60% 70%;
  --chart-2:                194 58% 55%;
  --chart-3:                240 55% 79%;   /* lavender #acace7 원본 */
  --chart-4:                359 61% 62%;
  --chart-5:                227 31% 76%;   /* #aeb6d4 */

  --cat-database:           214 60% 70%;
  --cat-web:                194 58% 55%;
  --cat-engine:             240 55% 79%;
  --cat-etc:                229 19% 57%;   /* #7c84a6 */

  --theme-color-1:          214 60% 70%;
  --theme-color-2:          194 58% 55%;
  --theme-color-3:          240 55% 79%;
  --theme-color-4:          359 61% 62%;
  --theme-color-5:          227 31% 76%;

  --header-bg:              225 27% 12%;   /* plate 레벨 — §5.4 */

  --sidebar-bg:             225 27% 12%;
  --sidebar-fg:             0 0% 100%;
  --sidebar-fg-muted:       227 31% 76%;
  --sidebar-border:         227 25% 30%;
  --sidebar-hover:          221 20% 18%;
  --sidebar-active-bg:      31 60% 18%;
  --sidebar-active-fg:      38 83% 57%;
  --sidebar-active-border:  31 92% 54% / 0.45;
}
```

### 5.4 Preview 에서 의도적으로 이탈하는 2건

1. **`--destructive-foreground` (다크)** — Preview 의 `--color-foreground-on-primary` 는 다크에서 `#070910` 으로 뒤집힌다. 이 값은 amber 배경 기준(9.9:1)이며, red `#e60012` 위에서는 **4.18:1 로 AA 미달**이다. red 위에는 white(**4.77:1**)를 쓴다. 두 값 모두 여유가 크지 않으므로 `--destructive` 를 큰 면적 fill 로 쓰는 컴포넌트가 생기면 재검토한다.
2. **`--header-bg` (다크)** — Preview 의 다크 nav 는 배경과 같은 니어블랙이다. 그러나 산문의 원칙은 command layer 가 크롬 **위**에 얹힌다는 것(Elevation 레벨 3)이고, 다크에서 "위"는 **더 밝음**이다. plate 레벨 12% 로 올려 슬랩 구분을 유지한다.

### 5.5 산문에 없는 15종의 파생 근거

| 대상 | 파생 | 근거 |
|---|---|---|
| `--ring` | signal `31 92% 54%` | 포커스 링 = "당신의 액션이 여기 떨어진다". 산문의 signal 정의(*forward cue*)와 정확히 일치. 양 테마 불변 |
| 차트 5 · 카테고리 4 · theme-color 5 | page-tint 3색 + sky + 쿨 그레이 | 산문 내 색 중 **색상환이 벌어진** 것만 선택 (194 / 214 / 240 / 359 / 무채) |

`{colors.signal}` / `{colors.amber}` 는 차트에 **쓰지 않는다.** 산문의 *"warm color must always mean act here"* 는 인터페이스 크롬을 보호하는 규칙이고 차트는 크롬이 아니므로, 정보 레이어를 page-tint 로 분리하면 규칙의 의도를 지키면서 공백을 메울 수 있다.

쿨 계열만 쓰면 222–240° 에 뭉쳐 카테고리 구분이 되지 않으므로 systems-teal(194°) 과 games-red(359°) 를 정보 레이어에 편입한다. 산문의 *"Don't add accent colors outside the page-tint heroes"* 는 이 2색을 page-tint 로 이미 허용하고 있다.

카테고리 매핑은 기존 사용자 인지를 보존하도록 색상환 근접값을 따른다: database(파랑 214) · web(티얼 194) · engine(바이올렛 240) · etc(쿨 그레이). 산문에 녹색이 없어 web 은 티얼로 대체한다.

## 6. 형상 · 타이포

### 6.1 Radius

Preview 추출값: `button/input/status 2px · tile 4px · card/frame 6px`.

프로젝트는 단일 `--radius` 에서 `calc()` 로 파생한다 (`md = -2px`, `sm = -4px`). **`--radius: 0.375rem`(6px)** 로 두면 `lg=6px`(card/frame) · `md=4px`(tile) · `sm=2px`(button/input) 이 되어 Preview 스케일과 정확히 일치한다. tailwind.config 수정 불필요.

산문의 시그니처인 **챔퍼(45° 컷)는 `border-radius` 로 표현 불가**하며 `clip-path` 유틸리티로 처리한다 (§6.3).

### 6.2 폰트

`tailwind.config.js` 의 `fontFamily.sans` 와 `globals.css` 의 `body` font-family 를 교체한다.

```js
sans: ['Arial', 'Helvetica', '"Pretendard"', 'system-ui', 'sans-serif'],
display: ['"Arial Black"', 'Arial', 'sans-serif'],
```

`"Pretendard"` 는 한글 폴백으로 유지한다 — 이 앱은 UI 텍스트가 한글이고 Arial 에 한글 글리프가 없다. Arial → Pretendard 폴백 체인이 라틴/한글을 각각 담당한다.

`mono` 는 터미널(xterm) 가독성 때문에 현행 JetBrains Mono 를 유지한다. Preview 는 `--font-mono` 를 Arial 로 두었으나 이는 kit-mirror 의 단순화이고, 실제 터미널에 등폭 폰트를 포기하는 것은 기능 후퇴다.

`body` 의 `font-feature-settings: "cv11", "ss03"` 은 Inter 전용 feature 이므로 제거한다.

### 6.3 크롬 레이어 유틸리티

`globals.css` 에 `@layer utilities` 로 추가한다. 토큰이 아니라 형태·질감이므로 클래스로 구현한다.

| 클래스 | 구현 | 용도 |
|---|---|---|
| `.plate` | `box-shadow: inset 0 1px 0 <highlight>, 0 1px 0 hsl(var(--border))` | Elevation 1 — 콘텐츠 패널, 카드 |
| `.plate-inset` | 반전 — 상단 어두운 선, 하단 밝은 선 | Elevation 0 — 리스트 행, 폼 필드 |
| `.plate-chip` | 밝은 상단 엣지 + 하드 하단 그림자 | Elevation 2 — 버튼, 칩 |
| `.slab` | carbon 배경 + `.halftone` | Elevation 3 — 내비, 사이드바, 푸터 |
| `.halftone` | `background-image: radial-gradient(hsl(0 0% 100% / 0.04) 0.5px, transparent 0.5px); background-size: 3px 3px` | 스피커 그릴 질감 |
| `.chamfer` | `clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)` | 45° 컷 코너 — 최상위 패널만 |
| `.ui-label` | `text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; line-height: 1.1` | 실크스크린 레전드 voice |
| `.display-outline` | `-webkit-text-stroke: 2px hsl(var(--foreground)); text-shadow: 3px 3px 0 hsl(var(--border))` | 박스아트 워드마크 |

`highlight` 값은 테마별로 다르다 — 라이트는 `hsl(0 0% 100% / 0.5)`, 다크는 `hsl(227 25% 30% / 0.8)`. 다크에서 베벨선이 표면보다 밝아지는 극성 반전을 여기서 구현한다.

이를 위해 **`--plate-highlight` 변수 1개를 신규 추가**한다 (라이트/다크 각 1선언). 기존 85개 토큰 계약 밖의 추가분이므로 최종 선언 수는 라이트 43 + 다크 44 = 87개가 된다. 클래스는 하나로 유지하고 테마 분기를 변수가 흡수한다.

### 6.4 유틸리티 적용 대상

| 파일 | 적용 |
|---|---|
| `src/shared/ui/button.tsx` | `.plate-chip` — default / secondary variant |
| `src/shared/ui/card.tsx` | `.plate` |
| `src/shared/ui/input.tsx` | `.plate-inset` |
| `src/widgets/_shared/sidebar/**` | `.slab` (컨테이너), `.ui-label` (섹션 라벨) |

`.chamfer` 는 최상위 페이지 패널 1–2곳에만 쓴다. 산문도 *"Chamfered panel geometry on the **largest** modules"* 로 제한한다.

## 7. 접근성

### 7.1 대비 — 배치 규칙으로 통제

canvas 는 중간톤(상대휘도 0.26)이라 텍스트 표면으로 쓰면 대비가 빡빡하다. 그러나 §5.1 의 표면 위계를 지키면 실질 위반은 1건뿐이다.

| 조합 | 대비 | 판정 |
|---|---|---|
| ink on canvas | 4.55:1 | 통과 — 크롬 라벨 |
| ink-soft on platinum | 5.6:1 | 통과 — 본문 보조 |
| ink-soft on white | 7.53:1 | 통과 |
| white on carbon | 15.5:1 | 통과 |
| nav-gold on carbon | 5.7:1 | 통과 |
| ink on white | 15.5:1 | 통과 |
| amber on sidebar-active-bg | 5.86:1 | 통과 |
| **ink-soft on canvas** | **2.28:1** | **위반** |
| **white on canvas** | **3.41:1** | **위반** |

두 위반 조합은 **산문이 애초에 허용하지 않는다** — white 는 *"Text on carbon, red, and orange chrome"* 전용이고, ink-soft 는 platinum/white 표면용이다. 색을 바꿀 문제가 아니라 배치 규칙으로 막을 문제다.

**규칙**: `--background`(canvas) 위 텍스트는 `--foreground`(ink) 만. `--muted-foreground`(ink-soft) 는 `--card` / `--muted` 위에서만. 검증은 §9 에서 실제 화면으로 확인한다.

다크는 구조적으로 여유롭다 — white on `#0e1018` 19.0:1, `#aeb6d4` 9.4:1, amber 9.4:1, `#070910` on amber 9.9:1, signal on accent 5.15:1, amber on sidebar-active-bg 6.15:1. `--destructive` 조합(§5.4)만 예외다.

### 7.2 본문 사이즈

산문은 본문 12px / 마이크로 10px 을 명시하나 **적용하지 않는다.** 이 앱은 하루 종일 들여다보는 내부 운영 화면이고, 산문의 밀도는 2001년 고정폭 캔버스(§3 비목표) 전제에서 나온 값이다. 레이아웃을 바꾸지 않으므로 타이포 밀도만 따를 근거가 없다. `.ui-label`(11px) 은 라벨 전용이므로 그대로 채택한다.

### 7.3 포커스 링

산문은 *"No hover states are documented"* 이며 focus 정의도 없다. `--ring` ← signal(§5.5)로 채워 키보드 접근성을 확보한다. hover 는 `button-primary-pressed`(amber → nav-gold)의 "warm 계열은 한 단계 어둡게" 규칙을 파생 근거로 삼는다.

## 8. 원복 전략

web 저장소는 `main` 클린 상태(untracked 3건만 존재)다.

- **이 설계 문서는 `main` 에 커밋한다** — 조사 결과(Preview 실체 · 다크 추출값 · 대비 실측)는 테마 채택 여부와 무관하게 남을 가치가 있고, 브랜치에만 두면 원복 시 함께 사라진다.
- 구현 작업 브랜치: `design/nintendo-2001`
- 원복: `git checkout main` — 한 줄. 별도 백업 불필요. 설계 문서는 main 에 있으므로 보존된다.
- 채택 시: `main` 으로 merge (사용자의 main 직접 커밋 관례에 맞춰 fast-forward).

API 변경이 없으므로 백엔드 영향 / 동시 배포 제약이 없다.

## 9. 검증 계획

| 단계 | 검증 |
|---|---|
| 1. 토큰 교체 | `npm run dev` → 라이트/다크 토글하며 콘솔 에러 0 |
| 2. 타입/린트 | `npm run type-check` && `npm run lint` 통과 |
| 3. 빌드 | `npm run build` 통과 |
| 4. 대비 실측 | 주요 화면에서 §7.1 위반 조합(ink-soft/white on canvas)이 실제로 나타나지 않는지 확인 |
| 5. 카테고리 구분 | DB / WEB / ENGINE / ETC 뱃지 4색이 양 테마에서 서로 구별되는지 확인 |
| 6. 차트 | 버전 사이트 차트가 양 테마에서 읽히는지 확인 |
| 7. 크롬 레이어 | 베벨/할프톤/챔퍼가 의도대로 렌더되는지 확인 |

4–7 은 스크린샷으로 사용자에게 제시하고 판단을 받는다. "맘에 안 들면 원복"이 이 작업의 전제이므로 최종 판정은 사용자 몫이다.

## 10. 알려진 한계

1. **하드코딩 hex 3파일** — `xterm-themes.ts`(터미널 팔레트) · `linkHelpers.tsx` · `version-site-chart.tsx` 는 토큰을 안 쓴다. 교체 후 색이 겉돌 수 있고, 비목표로 뒀으므로 확인 후 별도 판단한다.
2. **success / warning 부재** — 프로젝트에 해당 토큰이 없어 이번 범위에는 영향이 없다. 다만 Preview 는 두 값을 동일 hex 로 두었고 산문에도 상태색이 없으므로, 향후 상태색이 필요해지면 이 템플릿 밖에서 가져와야 한다.
3. **녹색 부재** — 산문에 녹색이 전혀 없어 `--cat-web` 이 티얼로 바뀐다. 기존 초록 뱃지에 익숙한 사용자에게는 인지 변화다.
4. **차트 hue 근접** — 214° 와 240° 는 14° 차이로 색약 사용자에게 구분이 약할 수 있다. 산문 팔레트 안에서 더 벌릴 방법이 없다. 필요하면 명도 차이를 키우거나 패턴/레이블을 병용한다.
5. **챔퍼와 `overflow`** — `clip-path` 는 자식의 `overflow: visible` 콘텐츠를 자른다. 드롭다운/팝오버를 품는 컨테이너에는 쓰지 않는다.
