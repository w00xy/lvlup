import React from 'react'
import { Link } from 'react-router-dom'
import './helloPage.css'
import HeaderBig from '../../components/HeaderBig/HeaderBig'

const HelloPage = () => {
  return (
    <div className="hello-container">
        <div className="hello-header-wrapper">
            <HeaderBig />
        </div>
      
      <div className="content-container">
        <h1 className="main-title">ОРГАНИЗУЙ СВОЕ ОБУЧЕНИЕ</h1>
        <h2 className="subtitle">ОТСЛЕЖИВАЙ <span className="accent">ПРОГРЕСС</span></h2>
        <h2 className="subtitle">ПОЛУЧАЙ ОТЧЕТЫ</h2>
        
        <div className="buttons-container">
          <Link to="/login" className="auth-button login">Вход</Link>
          <Link to="/register" className="auth-button register">Регистрация</Link>
        </div>
      </div>
    </div>
  )
}

export default HelloPage