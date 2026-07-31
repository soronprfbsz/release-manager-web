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
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
    },
  },
  plugins: [require('tailwindcss-animate')],
}
