/**
 * Утилиты для управления темой приложения
 */

/**
 * Получает текущую тему из localStorage, или возвращает темную тему
 * если тема не была установлена ранее
 * @returns {string} 'dark' или 'light'
 */
export const getTheme = () => {
  return localStorage.getItem('theme') || 'dark';
};

/**
 * Устанавливает тему приложения
 * @param {string} theme - 'dark' или 'light'
 */
export const setTheme = (theme) => {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('theme', theme);
};

/**
 * Переключает тему между темной и светлой
 * @returns {string} Новая тема ('dark' или 'light')
 */
export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  setTheme(newTheme);
  return newTheme;
};

/**
 * Инициализирует тему при загрузке приложения
 */
export const initTheme = () => {
  const savedTheme = getTheme();
  setTheme(savedTheme);
}; 