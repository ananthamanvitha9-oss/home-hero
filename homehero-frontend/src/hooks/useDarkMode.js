import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('homehero-dark-mode');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('homehero-dark-mode', JSON.stringify(isDark));
    document.body.style.background = isDark
      ? 'hsl(220, 30%, 13%)'
      : '#f0f2f5';
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  return { isDark, toggleDarkMode };
};
