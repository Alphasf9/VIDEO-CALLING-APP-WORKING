import React from "react";
import { useNavigate } from "react-router-dom";
import { useEducator } from "../context/EducatorContext";
function CheckAuthForEducator({ children, protectedRoute }) {
    const navigate = useNavigate();
    const { accessToken, loading } = useEducator();

    if (loading) return <div>Loading...</div>;

    if (protectedRoute && !accessToken) {
        navigate("/educator/login");
        return null;
    }

    if (!protectedRoute && accessToken) {
        navigate("/");
        return null;
    }

    return <>{children}</>;
}

export default CheckAuthForEducator;
