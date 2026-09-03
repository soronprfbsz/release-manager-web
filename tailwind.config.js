/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  safelist: [
    // theme-color 동적 클래스 safelist
    ...['1', '2', '3', '4', '5'].flatMap((n) => [
      `bg-theme-color-${n}/10`,
      `bg-theme-color-${n}/15`,
      `border-theme-color-${n}/30`,
      `border-theme-color-${n}/50`,
      `text-theme-color-${n}`,
      `hover:bg-theme-color-${n}/15`,
      `hover:border-theme-color-${n}/50`,
    ]),
  ],
  theme: {
    extend: {
      fontFamily: {
        // Pretendard 우선 — Arial 을 먼저 두면 Chromium 이 한글 글리프를
        // Pretendard 로 폴백하지 않고 두부(□)를 낸다. 상세는 globals.css body 주석.
        sans: ['"Pretendard"', 'Arial', 'Helvetica', '"Malgun Gothic"', '"Apple SD Gothic Neo"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
        // 히어로 워드마크용 — .display-outline 과 함께 쓴다.
        display: ['"Arial Black"', 'Arial', 'Helvetica', 'sans-serif'],
        // 터미널(xterm) 가독성 때문에 등폭 유지.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
      },
      // radius 단일 소스 = --radius (globals.css).
      // DEFAULT/xl 까지 파생시켜 `rounded` (57곳) 와 `rounded-xl` (4곳) 도 토큰을 따르게 한다.
      // 이 둘은 원래 Tailwind 고정값(4px / 12px)이라 --radius 를 바꿔도 안 따라왔다.
      // 현재 --radius: 0.5rem 기준 계산값이 기존 고정값과 동일하므로 지금 화면은 그대로다.
      // rounded-full / rounded-none 은 물리적 컨트롤(핀/원형 배지)용이라 의도적으로 고정.
      borderRadius: {
        DEFAULT: 'calc(var(--radius) - 4px)', //  4px
        sm: 'calc(var(--radius) - 4px)',      //  4px
        md: 'calc(var(--radius) - 2px)',      //  6px
        lg: 'var(--radius)',                  //  8px
        xl: 'calc(var(--radius) + 4px)',      // 12px
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // 카드·패널 제목 띠 / 테이블 헤더 띠 — 요구가 달라 각자 토큰을 쓴다.
        // 둘 다 불투명색이어야 한다 (테이블 헤더는 sticky).
        'panel-header': 'hsl(var(--panel-header))',
        'table-header': 'hsl(var(--table-header))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        'theme-color': {
          1: 'hsl(var(--theme-color-1) / <alpha-value>)',
          2: 'hsl(var(--theme-color-2) / <alpha-value>)',
          3: 'hsl(var(--theme-color-3) / <alpha-value>)',
          4: 'hsl(var(--theme-color-4) / <alpha-value>)',
          5: 'hsl(var(--theme-color-5) / <alpha-value>)',
        },
      },
      // text-primary 만 채움색과 다른 토큰을 쓴다.
      // --primary(hue 48 / L 50%)는 상대휘도 0.64 라 밝은 면 위 텍스트로 쓰면
      // 흰 배경에서조차 최대 1.51:1 — 값을 어떻게 잡아도 AA 를 못 넘긴다.
      // bg-primary / border-primary 는 그대로 --primary 를 쓰고,
      // text-primary 만 --primary-text 로 뺀다 (다크에서는 두 값이 동일).
      // foreground 를 같이 선언해야 text-primary-foreground 가 유지된다.
      textColor: {
        primary: {
          DEFAULT: 'hsl(var(--primary-text))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // text-destructive 도 같은 이유로 분리한다 — 채움으로 쓰기 좋은 진한 red 는
        // 텍스트로 쓰면 어두운 면 위에서 AA 를 못 넘긴다. bg-destructive /
        // border-destructive 는 --destructive 를 그대로 쓴다.
        destructive: {
          DEFAULT: 'hsl(var(--destructive-text))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
