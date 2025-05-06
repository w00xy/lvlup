import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './aufPage.css';
import logo from '../../../public/logo_big.svg';
import HeaderBig from '../../components/HeaderBig/HeaderBig';

const AufPage = () => {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({
        login: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Добавить логику авторизации когда будет API
        console.log('Login attempt:', loginData);
        
        // Перенаправление на страницу курсов после успешного входа
        // В будущем, это должно происходить только после успешной авторизации
        navigate('/courses');
    };

    return (
        <div className="auth-container">
            <HeaderBig />

            <div className="auth-content">
                <h1 className="auth-title">Авторизация</h1>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login">Логин</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={loginData.login}
                            onChange={handleInputChange}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={loginData.password}
                            onChange={handleInputChange}
                            className="auth-input"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Войти в аккаунт
                    </button>

                    <Link to="/register" className="switch-auth-link">
                        Нет аккаунта? <span className='underline'>Зарегистрироваться</span>
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default AufPage; 