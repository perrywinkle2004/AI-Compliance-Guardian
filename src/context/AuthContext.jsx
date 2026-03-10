import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../services/api';
import { logActivity } from '../services/activityLogger';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp < currentTime) {
                    logout();
                } else {
                    setUser({
                        username: decoded.sub,
                        role: decoded.role,
                        token: token
                    });
                    // Set default header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Try JSON login first
            const response = await api.post('/auth/login', { username, password });
            const { access_token, role } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role); // Keep legacy role for now if needed elsewhere

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            const decoded = jwtDecode(access_token);
            const userObj = {
                username: decoded.sub,
                role: role,
                token: access_token
            };
            setUser(userObj);
            // Record login to activity feed
            await logActivity(
                'login',
                `${role === 'admin' ? 'Admin' : 'User'} logged in`,
                { role },
                decoded.sub,
                role
            );
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (username, email, password, role) => {
        try {
            await api.post('/auth/register', { username, email, password, role });
            // Record registration event (no token yet — backend records it too)
            await logActivity(
                'register',
                `New account created: ${username}`,
                { username, role },
                username,
                role
            );
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        const currentUser = {
            username: localStorage.getItem('username') || '',
            role: localStorage.getItem('role') || '',
        };
        // Best-effort: log logout before clearing token so the request can still be sent
        logActivity(
            'logout',
            `${currentUser.role === 'admin' ? 'Admin' : 'User'} logged out`,
            { role: currentUser.role },
            currentUser.username,
            currentUser.role
        );
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
