import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import styles from './reportsPage.module.css';

const ReportsPage = () => {
    const [courseName, setCourseName] = useState('');
    const mockData = [
        { id: 1, name: 'Python для начинающих', category: 'Программирование', date: '01.05.2024' },
        { id: 2, name: 'JavaScript основы', category: 'Web-разработка', date: '02.05.2024' },
        { id: 3, name: 'Маркетинг в соцсетях', category: 'Маркетинг', date: '03.05.2024' },
    ];

    return (
        <div className={styles.container}>
            <Header activePage="reports" />
            <div className={styles.content}>
                <div className={styles.totalCount}>
                    Всего: 666
                </div>

                <div className={styles.filters}>
                    <div className={styles.searchSection}>
                        <label>Название курса</label>
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="Введите название курса"
                                className={styles.searchInput}
                            />
                            <button className={styles.searchButton}>
                                Искать
                            </button>
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterItem}>
                            <label>За период</label>
                            <select className={styles.select}>
                                <option value="">Выберите период</option>
                                <option value="week">Неделя</option>
                                <option value="month">Месяц</option>
                                <option value="year">Год</option>
                            </select>
                        </div>

                        <div className={styles.filterItem}>
                            <label>По категориям</label>
                            <select className={styles.select}>
                                <option value="">Все категории</option>
                                <option value="programming">Программирование</option>
                                <option value="marketing">Маркетинг</option>
                                <option value="design">Дизайн</option>
                            </select>
                        </div>

                        <div className={styles.filterItem}>
                            <label>Выбор формата</label>
                            <select className={styles.select}>
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                                <option value="word">Word</option>
                            </select>
                        </div>

                        <button className={styles.printButton}>
                            Печать
                        </button>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.columnHeader}>
                                    Название курса
                                    <span className={styles.sortIcon}>▼</span>
                                </th>
                                <th className={styles.columnHeader}>
                                    Категория
                                    <span className={styles.sortIcon}>▼</span>
                                </th>
                                <th className={styles.columnHeader}>
                                    Дата
                                    <span className={styles.sortIcon}>▼</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockData.map(course => (
                                <tr key={course.id}>
                                    <td>{course.name}</td>
                                    <td>{course.category}</td>
                                    <td>{course.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
