import type { ITheme } from '@xterm/xterm'

type ThemeType =
    | 'black'
    | 'white'
    | 'gruvbox'

export const XTERM_THEMES: Record<ThemeType, ITheme> = {
    // Default Black (Matches card background in black theme)
    black: {
        background: '#171717', // Same as --card in black theme (0 0% 9%)
        foreground: '#c9d1d9', // Soft grey text
        cursor: '#58a6ff',
        cursorAccent: '#171717',
        selectionBackground: '#3a3a3a',
        black: '#171717',
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
    // Default White (Matches card background in light theme)
    white: {
        background: '#ffffff', // Same as --card in light theme (0 0% 100%)
        foreground: '#334155', // Slate-700
        cursor: '#0f172a', // Slate-900
        cursorAccent: '#ffffff',
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
    // Gruvbox (Matches card background in gruvbox theme)
    gruvbox: {
        background: '#333333', // Same as --card in gruvbox theme (0 0% 20%)
        foreground: '#ebdbb2',
        cursor: '#ebdbb2',
        cursorAccent: '#333333',
        selectionBackground: '#3c3836',
        black: '#333333',
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
