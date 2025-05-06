import React from 'react'
import logo from '/public/logo_big.svg'
import './headerBig.css'
import { Link } from 'react-router-dom'

const HeaderBig = () => {
  return (
    <div className="auth-header">
        <Link to="/" className="logo-link">
            <img src={logo} alt="SkillLvlUp Logo" className="logo" />
            <span className="logo-text">SkillLvLUp</span>
        </Link>
    </div>
  )
}

export default HeaderBig