import React from 'react';
import './courseCard.css';

const CourseCard = ({ id, title, date, image, category, onClick }) => {

    const imageUrl = `${import.meta.env.VITE_API_URL}/${image}`;
    
    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        // Получаем день, месяц и время
        const day = date.getDate();
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                       'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        const month = months[date.getMonth()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day} ${month} ${hours}:${minutes}`;
    };
    
    return (
        <div className="course-card" onClick={onClick}>
            <div className="course-info">
                <h3 className="course-title">{title}</h3>
                <p className="course-date">{formatDate(date)}</p>
                <span className="course-category">{category}</span>
            </div>
            <div className="course-image">
                <img src={imageUrl} alt={title} />
            </div>
        </div>
    );
};

export default CourseCard; 