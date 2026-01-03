import type { ITheme } from '@xterm/xterm'

type ThemeType =
    | 'black'
    | 'white'
    | 'gruvbox'

export const XTERM_THEMES: Record<ThemeType, ITheme> = {
    // Default Black (Pure Dark - GitHub Dark inspired)
    black: {
        background: '#0d1117', // Pure dark background
        foreground: '#c9d1d9', // Soft grey text
        cursor: '#58a6ff',
        cursorAccent: '#0d1117',
        selectionBackground: '#264f78',
        black: '#0d1117',
        red: '#ff7b72',
        green: '#7ee787',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#a5d6a7',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc',
    },
    // Default White (Modern Light - cleaner, higher contrast)
    white: {
        background: '#f8fafc', // Slate-50 - subtle difference from white page
        foreground: '#334155', // Slate-700
        cursor: '#0f172a', // Slate-900
        cursorAccent: '#f8fafc',
        selectionBackground: '#cbd5e1', // Slate-300
        black: '#0f172a',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#cbd5e1',
        brightBlack: '#64748b',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#f1f5f9',
    },
    // Gruvbox
    gruvbox: {
        background: '#282828',
        foreground: '#ebdbb2',
        cursor: '#ebdbb2',
        cursorAccent: '#282828',
        selectionBackground: '#3c3836',
        black: '#282828',
        red: '#cc241d',
        green: '#98971a',
        yellow: '#d79921',
        blue: '#458588',
        magenta: '#b16286',
        cyan: '#689d6a',
        white: '#a89984',
        brightBlack: '#928374',
        brightRed: '#fb4934',
        brightGreen: '#b8bb26',
        brightYellow: '#fabd2f',
        brightBlue: '#83a598',
        brightMagenta: '#d3869b',
        brightCyan: '#8ec07c',
        brightWhite: '#ebdbb2',
    },
}
