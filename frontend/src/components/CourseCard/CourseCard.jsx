import React from 'react';
import './courseCard.css';

const CourseCard = ({ title, date, image, category }) => {
    return (
        <div className="course-card">
            <div className="course-info">
                <h3 className="course-title">{title}</h3>
                <p className="course-date">{date}</p>
                <span className="course-category">{category}</span>
            </div>
            <div className="course-image">
                <img src={image} alt={title} />
            </div>
        </div>
    );
};

export default CourseCard; 