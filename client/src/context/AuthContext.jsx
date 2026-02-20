import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('tp_token'));
    const [loading, setLoading] = useState(true);

    // On mount, verify token is still valid
    useEffect(() => {
        const verifyToken = async () => {
            const stored = localStorage.getItem('tp_token');
            if (!stored) {
                setLoading(false);
                return;
            }
            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
                const res = await api.get('/auth/me');
                setUser(res.data);
                setToken(stored);
            } catch {
                // Token invalid/expired
                localStorage.removeItem('tp_token');
                delete api.defaults.headers.common['Authorization'];
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, []);

    const login = (userData, jwtToken) => {
        localStorage.setItem('tp_token', jwtToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        setUser(userData);
        setToken(jwtToken);
    };

    const logout = () => {
        localStorage.removeItem('tp_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
