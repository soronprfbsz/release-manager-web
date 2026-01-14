import type { ITheme } from '@xterm/xterm'

type ThemeType =
    | 'black'
    | 'white'
    | 'gruvbox'

export const XTERM_THEMES: Record<ThemeType, ITheme> = {
    // Fresh Mint Dark Mode (Default dark theme)
    black: {
        background: '#181d1c', // Fresh Mint dark card (160 12% 11%)
        foreground: '#ebf2f0', // Fresh Mint dark foreground (160 8% 95%)
        cursor: '#7ebfab', // Fresh Mint dark primary (155 32% 58%)
        cursorAccent: '#181d1c',
        selectionBackground: '#26342f', // Fresh Mint dark accent
        black: '#181d1c',
        red: '#e64b5a', // Soft red (--destructive)
        green: '#7ebfab', // Fresh sage (--primary dark)
        yellow: '#d4a544',
        blue: '#5baec7',
        magenta: '#b39ddb',
        cyan: '#48d1cc',
        white: '#a9bfba',
        brightBlack: '#9eb5b0', // Muted foreground
        brightRed: '#f07178',
        brightGreen: '#8ccab7',
        brightYellow: '#f0c674',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#ebf2f0',
    },
    // Fresh Mint Light Mode (Default light theme)
    white: {
        background: '#ffffff', // White cards (Fresh Mint light)
        foreground: '#252d2e', // Deep teal-gray text (--foreground)
        cursor: '#539c85', // Fresh sage green (--primary)
        cursorAccent: '#ffffff',
        selectionBackground: '#d9ede6', // Light sage accent (--accent)
        black: '#252d2e',
        red: '#e64b5a', // Soft red (--destructive)
        green: '#539c85', // Fresh sage green (--primary)
        yellow: '#d4a017',
        blue: '#4a90a4',
        magenta: '#9370db',
        cyan: '#20b2aa',
        white: '#d5e6e0',
        brightBlack: '#697172', // Muted teal-gray (--muted-foreground)
        brightRed: '#f07178',
        brightGreen: '#6db39a',
        brightYellow: '#f0c674',
        brightBlue: '#5baec7',
        brightMagenta: '#b39ddb',
        brightCyan: '#48d1cc',
        brightWhite: '#f0f9f6', // Soft mint background
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
