import React from 'react';
import './coursesList.css';
import CourseCard from '../CourseCard/CourseCard';

// Временные моки для курсов
const defaultCourses = [
    { 
        id: 1, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Маркетинг'
    },
    { 
        id: 2, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'SMM'
    },
    { 
        id: 3, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Таргет'
    },
    { 
        id: 4, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Маркетинг'
    },
    { 
        id: 5, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'SMM'
    },
    { 
        id: 6, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Таргет'
    },
    { 
        id: 7, 
        title: 'Продвижение в соц-сетях УБТ Траффик', 
        date: '5 мая 2025', 
        image: '/134a02b0ac6a07801d64d610443fe194.png',
        category: 'Маркетинг'
    },
];

const CoursesList = ({ courses = defaultCourses }) => {
    return (
        <div className="courses-list-container">
            <div className="courses-list">
                {courses.map(course => (
                    <CourseCard
                        key={course.id}
                        title={course.title}
                        date={course.date}
                        image={course.image}
                        category={course.category}
                    />
                ))}
            </div>
        </div>
    );
};

export default CoursesList; 