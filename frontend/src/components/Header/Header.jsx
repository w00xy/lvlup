import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';
import logoImg from '/public/logo_big.svg';

const Header = ({ activePage }) => {
    return (
        <header className="main-header">
            <div className="header-left">
                <Link to="/courses" className="logo-link">
                    <img src={logoImg} alt="SkillLvlUp Logo" className="logo" />
                    <span className="logo-text">SkillLvLUp</span>
                </Link>
            </div>
            <nav className="header-nav">
                <Link to="/courses" className={`nav-link ${activePage === 'courses' ? 'active' : ''}`}>
                    Курсы
                </Link>
                <Link to="/reports" className={`nav-link ${activePage === 'reports' ? 'active' : ''}`}>
                    Отчеты
                </Link>
                <Link to="/settings" className={`nav-link ${activePage === 'settings' ? 'active' : ''}`}>
                    Настройки
                </Link>
                <Link to="/" className="nav-link">
                    Выйти
                </Link>
            </nav>
        </header>
    );
};

export default Header; 