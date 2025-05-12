import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import { getCourses } from '../../services/courseService';
import { getCategories } from '../../services/categoryService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from './reportsPage.module.css';

const sortDirections = {
    asc: 'asc',
    desc: 'desc',
};

const sortIcon = (active, direction) => {
    if (!active) return <span className={styles.sortIcon}>▼</span>;
    return direction === 'asc' ? <span className={styles.sortIcon}>▲</span> : <span className={styles.sortIcon}>▼</span>;
};

const getToday = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
};
const getWeekAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
};
const getMonthAgo = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
};
const getStartOfYear = () => {
    const d = new Date();
    d.setMonth(0, 1);
    return d.toISOString().slice(0, 10);
};

const ReportsPage = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState(sortDirections.asc);
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [periodType, setPeriodType] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [exportFormat, setExportFormat] = useState('pdf');

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const data = await getCourses();
                const normalized = data.map(course => ({
                    id: course.course_id || course.id,
                    name: course.course_name || course.name,
                    category: course.category_name || course.category || '',
                    date: course.start_date ? new Date(course.start_date) : null,
                }));
                setCourses(normalized);
                setFilteredCourses(normalized);
            } catch (err) {
                setCourses([]);
                setFilteredCourses([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories(0, 100);
                setCategories(data);
            } catch (err) {
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Автоматическая подстановка дат при выборе периода
    useEffect(() => {
        if (periodType === 'today') {
            const today = getToday();
            setDateFrom(today);
            setDateTo(today);
        } else if (periodType === 'week') {
            setDateFrom(getWeekAgo());
            setDateTo(getToday());
        } else if (periodType === 'month') {
            setDateFrom(getMonthAgo());
            setDateTo(getToday());
        } else if (periodType === 'all') {
            setDateFrom('');
            setDateTo('');
        }
        // Для custom не меняем даты
    }, [periodType]);

    // Фильтрация по названию, категории и периоду
    useEffect(() => {
        let filtered = courses;
        if (courseName.trim()) {
            filtered = filtered.filter(course =>
                course.name.toLowerCase().includes(courseName.trim().toLowerCase())
            );
        }
        if (selectedCategory) {
            filtered = filtered.filter(course => course.category === selectedCategory);
        }
        if (dateFrom && dateTo) {
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            // Устанавливаем конец дня для to
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(course => {
                if (!course.date) return false;
                // Сравниваем только по дате, игнорируя время
                return course.date >= from && course.date <= to;
            });
        }
        setFilteredCourses(filtered);
    }, [courseName, courses, selectedCategory, dateFrom, dateTo]);

    // Генерация имени файла отчёта
    const getReportFileName = (ext = 'xlsx') => {
        let name = 'Отчет';
        name += selectedCategory ? `_${selectedCategory}` : '_Все';
        if (dateFrom && dateTo) {
            name += `_${dateFrom}_${dateTo}`;
        }
        return `${name}.${ext}`;
    };

    // Экспорт в XLSX
    const handleExportXLSX = () => {
        const exportData = filteredCourses.map(course => ({
            'Название курса': course.name,
            'Категория': course.category,
            'Дата': course.date ? course.date.toLocaleDateString() : ''
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Отчет');
        XLSX.writeFile(wb, getReportFileName('xlsx'));
    };

    // Экспорт в PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFont('times');
        doc.setFontSize(14);
        doc.text('Отчет по курсам', 14, 18);
        let subtitle = '';
        if (selectedCategory) subtitle += `Категория: ${selectedCategory}  `;
        if (dateFrom && dateTo) subtitle += `Период: ${dateFrom} — ${dateTo}`;
        if (subtitle) doc.setFontSize(10), doc.text(subtitle, 14, 26);
        autoTable(doc, {
            startY: subtitle ? 32 : 24,
            head: [['Название курса', 'Категория', 'Дата']],
            body: filteredCourses.map(course => [
                course.name,
                course.category,
                course.date ? course.date.toLocaleDateString() : ''
            ]),
            styles: { font: 'times', fontSize: 10 },
            headStyles: { fillColor: [40, 40, 40] },
        });
        doc.save(getReportFileName('pdf'));
    };

    // Сортировка
    const handleSort = (field) => {
        let direction = sortDirection;
        if (sortField === field) {
            direction = direction === sortDirections.asc ? sortDirections.desc : sortDirections.asc;
        } else {
            direction = sortDirections.asc;
        }
        setSortField(field);
        setSortDirection(direction);
        setFilteredCourses(prev =>
            [...prev].sort((a, b) => {
                let aValue = a[field];
                let bValue = b[field];
                if (field === 'date') {
                    aValue = aValue ? aValue.getTime() : 0;
                    bValue = bValue ? bValue.getTime() : 0;
                }
                if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                return 0;
            })
        );
    };

    const handleDownload = () => {
        if (exportFormat === 'xlsx') {
            handleExportXLSX();
        } else if (exportFormat === 'pdf') {
            handleExportPDF();
        }
    };

    return (
        <div className={styles.container}>
            <Header activePage="reports" />
            <div className={styles.content}>
                <div className={styles.totalCount}>
                    Всего: {filteredCourses.length}
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
                                disabled={isLoading}
                            />
                            <button className={styles.searchButton} disabled>
                                Искать
                            </button>
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterItem}>
                            <label>Период</label>
                            <select className={styles.select} value={periodType} onChange={e => setPeriodType(e.target.value)}>
                                <option value="today">За сегодня</option>
                                <option value="week">За неделю</option>
                                <option value="month">За месяц</option>
                                <option value="all">За все время</option>
                            </select>
                            <div style={{display: 'flex', gap: 8, marginTop: 8}}>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className={styles.searchInput}
                                    style={{maxWidth: 180}}
                                />
                                <span style={{alignSelf: 'center'}}>—</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    className={styles.searchInput}
                                    style={{maxWidth: 180}}
                                />
                            </div>
                        </div>

                        <div className={styles.filterItem}>
                            <label>По категориям</label>
                            <select className={styles.select} value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                                <option value="">Все категории</option>
                                {categories.map(cat => (
                                    <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterItem}>
                            <label>Формат</label>
                            <select className={styles.select} value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
                                <option value="pdf">PDF</option>
                                <option value="xlsx">XLSX</option>
                            </select>
                        </div>

                        <button
                            className={styles.printButton}
                            onClick={handleDownload}
                            disabled={filteredCourses.length === 0}
                        >
                            Скачать
                        </button>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.tableHeader}>
                            <tr>
                                <th className={styles.columnHeader} onClick={() => handleSort('name')}>
                                    Название курса
                                    {sortIcon(sortField === 'name', sortDirection)}
                                </th>
                                <th className={styles.columnHeader} onClick={() => handleSort('category')}>
                                    Категория
                                    {sortIcon(sortField === 'category', sortDirection)}
                                </th>
                                <th className={styles.columnHeader} onClick={() => handleSort('date')}>
                                    Дата
                                    {sortIcon(sortField === 'date', sortDirection)}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={3}>Загрузка...</td></tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr><td colSpan={3}>Нет данных</td></tr>
                            ) : (
                                filteredCourses.map(course => (
                                    <tr key={course.id}>
                                        <td>{course.name}</td>
                                        <td>{course.category}</td>
                                        <td>{course.date ? course.date.toLocaleDateString() : ''}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
