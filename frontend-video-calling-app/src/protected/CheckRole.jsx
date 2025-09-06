import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function CheckUser({ children }) {
    const navigate = useNavigate();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        if (user === undefined) return;

        if (user?.role === "learner") {
            setLoading(false);
            setUnauthorized(false);
        } else if (user?.role === "educator") {
            setUnauthorized(true);
            setLoading(false);

            // Redirect after 3s
            setTimeout(() => {
                navigate("/educator/dashboard");
            }, 3000);
        }
    }, [navigate, user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
                <span className="loading loading-dots loading-lg text-indigo-400"></span>
            </div>
        );
    }

    if (unauthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-center px-6">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-2xl animate-fade-in">
                    <h1 className="text-3xl font-bold text-red-400 mb-4">🚫 Access Denied</h1>
                    <p className="text-lg text-gray-200 mb-6">
                        You are logged in as an <span className="font-semibold">Educator</span>.
                        Learner-only resources cannot be accessed with this account.
                    </p>
                    <p className="text-indigo-300 text-sm italic">
                        Redirecting you to your educator dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default CheckUser;
