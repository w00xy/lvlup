import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { getTheme, toggleTheme as toggleThemeUtil } from '../../utils/theme';
import './themeSwitcher.css';

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        // Обновление состояния, если тема меняется в другом месте
        const handleStorageChange = () => {
            setTheme(getTheme());
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleToggleTheme = () => {
        const newTheme = toggleThemeUtil();
        setTheme(newTheme);
    };

    return (
        <button 
            className="theme-switcher" 
            onClick={handleToggleTheme}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
        >
            <span className="theme-switcher-icon">
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </span>
            <span className="theme-switcher-text">
                {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
            </span>
        </button>
    );
};

export default ThemeSwitcher; 