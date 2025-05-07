import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './registerPage.css';
import HeaderBig from '../../components/HeaderBig/HeaderBig';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [registerData, setRegisterData] = useState({
        name: '',
        login: '',
        email: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Добавить логику регистрации когда будет API
        console.log('Register attempt:', registerData);
        
        // Перенаправление на страницу курсов после успешной регистрации
        // В будущем, это должно происходить только после успешной регистрации
        navigate('/courses');
    };

    return (
        <div className="auth-container">
            <HeaderBig />

            <div className="auth-content">
                <h1 className="auth-title">Регистрация</h1>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Имя</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={registerData.name}
                            onChange={handleInputChange}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login">Логин</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={registerData.login}
                            onChange={handleInputChange}
                            className="auth-input"
                            required
                        />
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
                            className="auth-input"
                            required
                        />
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