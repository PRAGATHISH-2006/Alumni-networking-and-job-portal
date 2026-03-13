import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const { data } = await API.get('/api/auth/profile');
                setUser(data);
            } catch (error) {
                setUser(null);
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await API.post('/api/auth/login', { email, password });
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const { data } = await API.post('/api/auth/register', userData);
        setUser(data);
        return data;
    };

    const logout = async () => {
        await API.post('/api/auth/logout');
        setUser(null);
    };

    const updateUser = async (userData) => {
        try {
            const { data } = await API.put('/api/users/profile', userData);
            setUser(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
