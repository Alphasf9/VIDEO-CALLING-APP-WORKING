/* eslint-disable react-refresh/only-export-components */
// context/EducatorContext.jsx
import { createContext, useState, useContext } from "react";
import { logout } from "../utils/AuthUtils";
import api from "../api/AxiosInstance";
import { useEffect } from "react";
import { useCallback } from "react";

const EducatorContext = createContext();

export function EducatorProvider({ children }) {
  const [educator, setEducator] = useState(null);
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

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const res = await api.get("/users/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = normalizeUser(res.data.user);
      setEducator(updatedUser);
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
  }, [setEducator]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccessToken = localStorage.getItem("accessToken");

    if (storedUser) setEducator(JSON.parse(storedUser));
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      fetchUserProfile(storedAccessToken);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);


  const saveUserSession = (userData, token) => {
    const updatedUser = normalizeUser(userData);
    setEducator(updatedUser);
    setAccessToken(token);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("accessToken", token);
  };


  const clearUserSession = () => {
    setEducator(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  return (
    <EducatorContext.Provider value={{
      educator, setEducator, saveUserSession,
      accessToken, setAccessToken, clearUserSession,
      loading, setLoading, fetchUserProfile
    }}>
      {children}
    </EducatorContext.Provider>
  );
}

export function useEducator() {
  return useContext(EducatorContext);
}
