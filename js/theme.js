// theme.js — loadTheme / applyTheme / updateThemeButtons

import { THEME_KEY } from './data.js';

export function loadTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    return stored || 'starlight';
}

export function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeButtons(theme);
}

export function updateThemeButtons(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}
