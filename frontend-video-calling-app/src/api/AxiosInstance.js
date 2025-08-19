import axios from "axios";
import { logout } from "../utils/AuthUtils";

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    res => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_SERVER_URL}/users/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                localStorage.setItem("accessToken", data.accessToken);

                originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                console.log("Error refreshing token:", refreshError);
                logout();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
