import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    //Load auth from localStorage on refresh

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);


    const login = async (email, password) => {
        const res = await axios.post(
            'http://localhost:5000/api/auth/login',
            { email, password }
        );

        const { token, user } = res.data.data;

        setToken(token);
        setUser(user);

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return user; //important for redirects
    };


    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);