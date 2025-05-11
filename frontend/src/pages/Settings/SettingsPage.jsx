import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import styles from './settingsPage.module.css';

const SettingsPage = () => {
    const [theme, setTheme] = useState('Светлая');

    return (
        <div className={styles.container}>
            <Header activePage="settings" />
            <div className={styles.content}>
                <div className={styles.settingsGroup}>
                    <div className={styles.inputGroup}>
                        <label>Название категории</label>
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                className={styles.searchInput} 
                                placeholder="Введите название категории"
                            />
                            <button className={styles.searchButton}>
                                Искать
                            </button>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Сменить тему</label>
                        <select 
                            className={styles.themeSelect}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="Светлая">Светлая</option>
                            <option value="Темная">Темная</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
