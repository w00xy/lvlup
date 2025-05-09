import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Сохраняем текущий URL для редиректа после авторизации
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
