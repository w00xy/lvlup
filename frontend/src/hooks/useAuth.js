import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    return { isAuthenticated, isLoading };
};
