import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Header from '../../components/Header/Header';
import ThemeSwitcher from '../../components/ThemeSwitcher/ThemeSwitcher';
import { getCategoryByName, getCategories, createCategory } from '../../services/categoryService';
import styles from './settingsPage.module.css';

const SettingsPage = () => {
    const [categoryName, setCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categoryExists, setCategoryExists] = useState(false);
    const [error, setError] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [lastCaretPosition, setLastCaretPosition] = useState(0);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);
    const [showDescriptionInput, setShowDescriptionInput] = useState(false);
    const [categoryDescription, setCategoryDescription] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Загрузка всех категорий при монтировании компонента
    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const data = await getCategories(0, 100);
                setAllCategories(data);
                setFilteredCategories(data);
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };
        
        fetchAllCategories();
    }, []);
    
    // Принудительный возврат фокуса после перерисовки
    useLayoutEffect(() => {
        if (isFocused && inputRef.current) {
            // Возвращаем фокус элементу
            inputRef.current.focus();
            
            // Восстанавливаем позицию курсора
            if (lastCaretPosition !== null) {
                try {
                    inputRef.current.setSelectionRange(lastCaretPosition, lastCaretPosition);
                } catch (err) {
                    console.error('Ошибка при установке позиции каретки:', err);
                }
            }
        }
    });
    
    const filterCategories = (name) => {
        if (name.trim() === '') {
            setFilteredCategories(allCategories);
            return false; // Возвращаем флаг: найдены ли точные совпадения
        } else {
            const filtered = allCategories.filter(category => 
                category.name.toLowerCase().includes(name.toLowerCase())
            );
            
            // Проверяем, есть ли точное совпадение
            const exactMatch = allCategories.some(category => 
                category.name.toLowerCase() === name.toLowerCase()
            );
            
            setFilteredCategories(filtered);
            return exactMatch;
        }
    };
    
    // Обработчик ввода - обновляет состояние и фильтрует категории
    const handleCategoryNameChange = (e) => {
        const name = e.target.value;
        // Сохраняем позицию каретки перед обновлением состояния
        setLastCaretPosition(e.target.selectionStart);
        setCategoryName(name);
        
        // Проверка существования категории через фильтрацию локального массива
        const exactMatch = filterCategories(name);
        setCategoryExists(exactMatch);
        
        // Отменяем предыдущий таймаут, если он был
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Устанавливаем новый таймаут для API-запроса
        if (!exactMatch && name.trim() !== '') {
            timeoutRef.current = setTimeout(() => {
                // Запускаем проверку только если поле всё ещё в фокусе
                if (isFocused) {
                    checkCategoryExistsFromApi(name);
                }
            }, 800);
        }
    };
    
    // Отдельная функция для проверки через API
    const checkCategoryExistsFromApi = async (name) => {
        try {
            setIsLoading(true);
            const category = await getCategoryByName(name);
            if (category) {
                setCategoryExists(true);
            }
        } catch (err) {
            console.error('Ошибка при проверке категории:', err);
            // Не показываем ошибку пользователю при проверке
        } finally {
            setIsLoading(false);
        }
    };
    
    // Обработчики фокуса и блюра
    const handleFocus = () => {
        setIsFocused(true);
        setShowDropdown(true);
    };
    
    const handleBlur = () => {
        // Используем задержку, чтобы не терять фокус при клике на выпадающий список
        setTimeout(() => {
            if (document.activeElement !== inputRef.current) {
                setIsFocused(false);
            }
        }, 50);
    };
    
    // Очистка таймаута при размонтировании компонента
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    
    // Обработчик события клика за пределами выпадающего списка
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                inputRef.current && 
                !inputRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCategorySelect = (category) => {
        setCategoryName(category.name);
        setCategoryExists(true);
        setShowDropdown(false);
    };

    const handleSaveCategory = () => {
        if (categoryExists) {
            return;
        }
        
        if (categoryName.trim() === '') {
            setError('Необходимо указать название категории');
            return;
        }
        
        // Проверка на минимальную длину названия категории
        if (categoryName.trim().length < 3) {
            setError('Слишком короткое название категории. Минимум 3 символа.');
            return;
        }
        setError(null);
        setShowDescriptionInput(true);
    };

    const handleCreateCategory = async () => {
        if (categoryDescription.trim().length < 3) {
            setError('Описание категории должно быть не короче 3 символов.');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await createCategory(categoryName.trim(), categoryDescription.trim());
            setSuccessMessage('Категория успешно создана!');
            setCategoryName('');
            setCategoryDescription('');
            setShowDescriptionInput(false);
            setCategoryExists(false);
            // Обновляем список категорий
            const data = await getCategories(0, 100);
            setAllCategories(data);
            setFilteredCategories(data);
        } catch (err) {
            setError('Ошибка при создании категории');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Header activePage="settings" />
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Настройки</h1>
                    <p className={styles.description}>Настройте приложение под себя</p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Внешний вид</h2>
                    <div className={styles.settingsGroup}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Тема приложения</label>
                            <div className={styles.themeOptionWrapper}>
                                <ThemeSwitcher />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Поиск</h2>
                    <div className={styles.settingsGroup}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Название категории</label>
                            <div className={styles.searchContainer}>
                                <div className={styles.inputWithDropdown}>
                                    <input 
                                        ref={inputRef}
                                        type="text" 
                                        className={styles.formInput}
                                        placeholder="Введите название категории"
                                        value={categoryName}
                                        onChange={handleCategoryNameChange}
                                        disabled={isLoading}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        autoComplete="off"
                                    />
                                    {showDropdown && filteredCategories.length > 0 && (
                                        <div ref={dropdownRef} className={styles.dropdown}>
                                            {filteredCategories.map((category) => (
                                                <div 
                                                    key={category.category_id} 
                                                    className={styles.dropdownItem}
                                                    onClick={() => handleCategorySelect(category)}
                                                    onMouseDown={(e) => e.preventDefault()} // Предотвращаем потерю фокуса при клике
                                                >
                                                    {category.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    className={styles.primaryButton} 
                                    onClick={handleSaveCategory}
                                    disabled={categoryExists || isLoading || categoryName.trim() === '' || categoryName.trim().length < 3}
                                >
                                    {isLoading ? 'Проверка...' : categoryExists ? 'Уже существует' : 'Создать'}
                                </button>
                            </div>
                            {error && <div className={styles.errorMessage}>{error}</div>}
                            {categoryExists && !error && (
                                <div className={styles.infoMessage}>
                                    Категория с таким названием уже существует
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showDescriptionInput && (
                    <div style={{marginTop: '1rem'}}>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="Введите короткое описание категории"
                            value={categoryDescription}
                            onChange={e => setCategoryDescription(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            className={styles.primaryButton}
                            style={{marginTop: '0.5rem'}}
                            onClick={handleCreateCategory}
                            disabled={isLoading || categoryDescription.trim().length < 3}
                        >
                            {isLoading ? 'Создание...' : 'Сохранить категорию'}
                        </button>
                    </div>
                )}
                {successMessage && (
                    <div className={styles.infoMessage} style={{color: 'green'}}>{successMessage}</div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
