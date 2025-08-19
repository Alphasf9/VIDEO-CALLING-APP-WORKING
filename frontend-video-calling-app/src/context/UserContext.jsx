/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/AxiosInstance";
import { logout } from "../utils/AuthUtils";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const normalizeUser = (u) => {
        if (!u) return null;
        const updatedUser = { ...u };
        if (updatedUser.avatarUrl && !updatedUser.avatarUrl.startsWith("http")) {
            updatedUser.avatarUrl = "https://" + updatedUser.avatarUrl;
        }
        return updatedUser;
    };

    const fetchUserProfile = async (token) => {
        try {
            const res = await api.get("/users/user-profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const updatedUser = normalizeUser(res.data.user);
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
            console.error("Error fetching profile:", error);
            if (error.response?.status === 401) {
                clearUserSession();
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedAccessToken = localStorage.getItem("accessToken");

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedAccessToken) {
            setAccessToken(storedAccessToken);
            fetchUserProfile(storedAccessToken);
        } else {
            setLoading(false);
        }
    }, []);

    const saveUserSession = (userData, token) => {
        const updatedUser = normalizeUser(userData);
        setUser(updatedUser);
        setAccessToken(token);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("accessToken", token);
    };

    const clearUserSession = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
    };

    return (
        <UserContext.Provider
            value={{
                user,
                accessToken,
                loading,
                saveUserSession,
                clearUserSession,
                fetchUserProfile,
                setUser,
            }}
        >
            {loading ? <div>Loading...</div> : children}
        </UserContext.Provider>
    );
};
