import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './aufPage.css';
import logo from '../../../public/logo_big.svg';
import HeaderBig from '../../components/HeaderBig/HeaderBig';
import { API_URL } from '../../config/api';
import { saveToken } from '../../utils/auth';

const AufPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/courses';
    const [loginData, setLoginData] = useState({
        login: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        login: '',
        password: '',
        general: ''
    });

    const validateForm = () => {
        const newErrors = {
            login: '',
            password: '',
            general: ''
        };
        let isValid = true;

        // Проверка логина
        if (loginData.login.length < 4) {
            newErrors.login = 'Логин должен быть не менее 4 символов';
            isValid = false;
        }

        // Проверка пароля
        if (loginData.password.length < 8) {
            newErrors.password = 'Пароль должен быть не менее 8 символов';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку поля при изменении
        setErrors(prev => ({
            ...prev,
            [name]: '',
            general: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({ login: '', password: '', general: '' });

        if (!validateForm()) {
            return;
        }

        try {
            // Сначала получаем токен
            const response = await fetch(`${API_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: loginData.login,
                    password: loginData.password,
                    grant_type: 'password'
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем токен
                saveToken(data.access_token);

                // Получаем данные пользователя
                const userResponse = await fetch(`${API_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    // Сохраняем данные пользователя в localStorage
                    localStorage.setItem('user_name', userData.user_name);
                    localStorage.setItem('user_email', userData.email);
                }

                // Перенаправляем на страницу, с которой пришли
                navigate(from, { replace: true });
            } else {
                // Обработка ошибок
                if (response.status === 401) {
                    setErrors(prev => ({
                        ...prev,
                        general: data.detail || 'Неверный логин или пароль'
                    }));
                } else if (response.status === 422) {
                    setErrors(prev => ({
                        ...prev,
                        general: 'Некорректные данные для входа'
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        general: 'Ошибка при входе в систему'
                    }));
                }
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                general: 'Ошибка сервера. Попробуйте позже.'
            }));
            console.error('Login error:', err);
        }
    };

    return (
        <div className="auth-container">
            <HeaderBig />

            <div className="auth-content">
                <h1 className="auth-title">Авторизация</h1>
                
                {errors.general && <div className="error-message">{errors.general}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login">Логин</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={loginData.login}
                            onChange={handleInputChange}
                            className={`auth-input ${errors.login ? 'error' : ''}`}
                            required
                            minLength={4}
                        />
                        {errors.login && <div className="field-error">{errors.login}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={loginData.password}
                            onChange={handleInputChange}
                            className={`auth-input ${errors.password ? 'error' : ''}`}
                            required
                            minLength={8}
                        />
                        {errors.password && <div className="field-error">{errors.password}</div>}
                        <small className="password-hint">Минимум 8 символов</small>
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