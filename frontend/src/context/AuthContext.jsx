import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    const getAuthState = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/auth/is-auth', { withCredentials: true });
            setIsLoggedIn(true);

            
            console.log("Auth check response:", res.data);

            await getUserData();
        } catch (error) {
            console.log(error.response?.data?.message);
            setIsLoggedIn(false);
        }
    };

    const getUserData = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/user/user-data', { withCredentials: true });
            setUserData(res.data?.userData);

        
            console.log("Fetched userData:", res.data?.userData);

        } catch (error) {
            console.log(error.response?.data?.message);
            setUserData(null);
        }
    };

    useEffect(() => {
        getAuthState();
    }, []);

    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    );
};