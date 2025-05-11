import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './header.css';
import logo_small from '../../assets/logo_small.png';
import { removeToken } from '../../utils/auth';
import { getTheme, toggleTheme as toggleThemeUtil } from '../../utils/theme';
import { FaSun, FaMoon } from 'react-icons/fa';

const Header = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [theme, setTheme] = useState(getTheme());
    const [userData, setUserData] = useState({
        name: '',
        email: ''
    });

    // Получаем данные пользователя при монтировании компонента
    useEffect(() => {
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');
        setUserData({
            name: userName || 'Пользователь',
            email: userEmail || 'email@example.com'
        });
    }, []);

    const toggleTheme = () => {
        const newTheme = toggleThemeUtil();
        setTheme(newTheme);
    };

    const handleLogout = () => {
        removeToken();
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        navigate('/login');
    };

    const handleSettingsClick = () => {
        setShowDropdown(false); // Закрываем дропдаун
        navigate('/settings'); // Переход на страницу настроек
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <Link to="/" className="header-logo">
                        <img src={logo_small} alt="Logo" className="logo-image" />
                        <span className="logo-text">SkillLvLUp</span>
                    </Link>

                    <nav className="header-nav">
                        <Link to="/courses" className="nav-link">Курсы</Link>
                        <Link to="/reports" className="nav-link">Отчеты</Link>
                    </nav>
                </div>

                <div className="header-right">
                    <button 
                        className="theme-toggle" 
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
                    >
                        {theme === 'dark' ? <FaSun /> : <FaMoon />}
                    </button>
                    
                    <div 
                        className="account-wrapper"
                        onMouseEnter={() => setShowDropdown(true)}
                        onMouseLeave={() => setShowDropdown(false)}
                    >
                        <div className="account-container">
                            <div className="account-icon">
                                <span className="account-initial">
                                    {userData.name[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>

                        {showDropdown && (
                            <div className="account-dropdown">
                                <div className="dropdown-header">
                                    <div className="dropdown-header-content" onClick={handleSettingsClick}>
                                        <span className="user-name">
                                            {userData.name}
                                        </span>
                                    <button 
                                        className="user-email"
                                    >
                                            {userData.email}
                                        </button>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button 
                                    className="logout-button"
                                    onClick={handleLogout}
                                >
                                    Выйти из аккаунта
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 