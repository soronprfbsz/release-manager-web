import type { ITheme } from '@xterm/xterm'

type ThemeType = 'light' | 'dark'

/**
 * Xterm.js terminal themes — Backstage redesign.
 * Background / foreground / cursor 는 globals.css 와 동기화.
 */
export const XTERM_THEMES: Record<ThemeType, ITheme> = {
    // Light — Backstage white surface, teal cursor
    light: {
        background: '#FFFFFF',
        foreground: '#202020',           // gray-900
        cursor: '#0e9384',               // brand-600 teal
        cursorAccent: '#FFFFFF',
        selectionBackground: '#f0fdf9',  // brand-50
        black: '#202020',
        red: '#d92d20',                  // error-600
        green: '#079455',                // success-600
        yellow: '#dc6803',               // warning-600
        blue: '#1570ef',                 // blue-600
        magenta: '#6938ef',              // violet-600
        cyan: '#0e9384',                 // brand-600
        white: '#d7d7d7',                // gray-300
        brightBlack: '#707070',          // gray-500
        brightRed: '#f04438',
        brightGreen: '#17b26a',
        brightYellow: '#f79009',
        brightBlue: '#2e90fa',
        brightMagenta: '#7a5af8',
        brightCyan: '#2ed3b7',
        brightWhite: '#fafafa',
    },
    // Dark — Backstage night-1000 surface, brand-300 cursor
    dark: {
        background: '#0f0f0f',           // night-1000
        foreground: '#f7f7f7',           // night-fg
        cursor: '#5fe9d0',               // brand-300
        cursorAccent: '#0f0f0f',
        selectionBackground: '#292929',  // night-700
        black: '#0f0f0f',
        red: '#f04438',
        green: '#6ce9a6',
        yellow: '#fec84b',
        blue: '#84caff',
        magenta: '#a48afb',
        cyan: '#5fe9d0',
        white: '#494949',                // gray-700 (mid-gray on dark)
        brightBlack: '#989898',          // night-fg-2
        brightRed: '#fda29b',
        brightGreen: '#a6e1c4',
        brightYellow: '#fee98a',
        brightBlue: '#b2ddff',
        brightMagenta: '#c4b8fd',
        brightCyan: '#99f6e0',
        brightWhite: '#f7f7f7',
    },
}
