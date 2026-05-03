import React, { createContext, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { user, isLoaded } = useUser();
    const { getToken, signOut } = useClerkAuth();

    useEffect(() => {
        const updateApiToken = async () => {
            if (isLoaded && user) {
                const token = await getToken();
                if (token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } else {
                delete api.defaults.headers.common['Authorization'];
            }
        };
        updateApiToken();
    }, [user, isLoaded, getToken]);

    const logout = () => {
        signOut();
    };

    const value = {
        user: user ? { 
            id: user.id, 
            name: user.fullName, 
            email: user.primaryEmailAddress?.emailAddress 
        } : null,
        loading: !isLoaded,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
