import { useState, useEffect } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import '../styles/header.scss';

type Theme = 'light' | 'dark';

const THEME_KEY = '@todolist:theme';

export function Header() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    // Sem preferência salva: respeita o tema do sistema operacional
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  return (
    <header className="header">
      <div>
        <span className="wordmark">to<span className="dot">.</span>do</span>

        <button
          type="button"
          className="theme-toggle"
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          onClick={toggleTheme}
        >
          <span className="track">
            <span className="thumb">
              {theme === 'dark' ? <FiMoon size={12} /> : <FiSun size={12} />}
            </span>
          </span>
        </button>
      </div>
    </header>
  )
}
