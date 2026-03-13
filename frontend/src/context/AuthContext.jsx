import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/auth/profile');
                setUser(data);
            } catch (error) {
                setUser(null);
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/register', userData);
        setUser(data);
        return data;
    };

    const logout = async () => {
        await axios.post('http://localhost:5000/api/auth/logout');
        setUser(null);
    };

    const updateUser = async (userData) => {
        try {
            const { data } = await axios.put('http://localhost:5000/api/users/profile', userData);
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
