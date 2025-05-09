import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './registerPage.css';
import HeaderBig from '../../components/HeaderBig/HeaderBig';
import { API_URL } from '../../config/api';
import { getAuthToken, saveToken } from '../../utils/auth';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [registerData, setRegisterData] = useState({
        user_name: '',
        login: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        user_name: '',
        login: '',
        password: '',
        general: ''
    });

    const validateForm = () => {
        const newErrors = {
            user_name: '',
            login: '',
            password: '',
            general: ''
        };
        let isValid = true;

        // Проверка имени пользователя
        if (registerData.user_name.length < 4) {
            newErrors.user_name = 'Имя пользователя должно быть не менее 4 символов';
            isValid = false;
        }

        // Проверка логина
        if (registerData.login.length < 4) {
            newErrors.login = 'Логин должен быть не менее 4 символов';
            isValid = false;
        }

        // Проверка пароля
        if (registerData.password.length < 8) {
            newErrors.password = 'Пароль должен быть не менее 8 символов';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
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
        setErrors({ user_name: '', login: '', password: '', general: '' });

        // Проверяем валидацию перед отправкой
        if (!validateForm()) {
            return;
        }

        try {
            const registerResponse = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)
            });

            const responseData = await registerResponse.json();

            if (registerResponse.status === 201) {
                try {
                    const response = await fetch(`${API_URL}/auth/token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            username: registerData.login,
                            password: registerData.password,
                            grant_type: 'password'
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        saveToken(data.access_token);
                        // Сохраняем данные пользователя
                        localStorage.setItem('user_name', data.user_name);
                        localStorage.setItem('user_email', data.email);
                        navigate('/courses');
                    } else {
                        setErrors(prev => ({
                            ...prev,
                            general: 'Ошибка авторизации после регистрации'
                        }));
                    }
                } catch (authError) {
                    setErrors(prev => ({
                        ...prev,
                        general: 'Ошибка авторизации после регистрации'
                    }));
                    console.error('Auth error:', authError);
                }
            } else {
                if (registerResponse.status === 422) {
                    const validationErrors = responseData.detail;
                    if (Array.isArray(validationErrors)) {
                        setErrors(prev => ({
                            ...prev,
                            general: validationErrors[0].msg
                        }));
                    } else {
                        setErrors(prev => ({
                            ...prev,
                            general: 'Ошибка валидации данных'
                        }));
                    }
                } else if (registerResponse.status === 400) {
                    setErrors(prev => ({
                        ...prev,
                        general: responseData.detail
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        general: 'Ошибка при регистрации'
                    }));
                }
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                general: 'Ошибка сервера. Попробуйте позже.'
            }));
            console.error('Registration error:', err);
        }
    };

    return (
        <div className="auth-container">
            <HeaderBig />

            <div className="auth-content">
                <h1 className="auth-title">Регистрация</h1>
                
                {errors.general && <div className="error-message">{errors.general}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="user_name">Имя</label>
                        <input
                            type="text"
                            id="user_name"
                            name="user_name"
                            value={registerData.user_name}
                            onChange={handleInputChange}
                            className={`auth-input ${errors.user_name ? 'error' : ''}`}
                            required
                            minLength={4}
                        />
                        {errors.user_name && <div className="field-error">{errors.user_name}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="login">Логин</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={registerData.login}
                            onChange={handleInputChange}
                            className={`auth-input ${errors.login ? 'error' : ''}`}
                            required
                            minLength={4}
                        />
                        {errors.login && <div className="field-error">{errors.login}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={registerData.email}
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
                            value={registerData.password}
                            onChange={handleInputChange}
                            className={`auth-input ${errors.password ? 'error' : ''}`}
                            required
                            minLength={8}
                        />
                        {errors.password && <div className="field-error">{errors.password}</div>}
                        <small className="password-hint">Минимум 8 символов</small>
                    </div>

                    <button type="submit" className="submit-button">
                        Создать аккаунт
                    </button>

                    <Link to="/login" className="switch-auth-link">
                        Уже есть аккаунт? <span className='underline'>Войти</span>
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage; 