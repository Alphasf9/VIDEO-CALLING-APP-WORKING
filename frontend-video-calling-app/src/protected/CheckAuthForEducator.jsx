import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function CheckAuthForEducator({ children }) {
    const navigate = useNavigate();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        if (user === undefined) return;

        if (user?.role === "educator") {
            setLoading(false);
            setUnauthorized(false);
        } else if (user?.role === "learner") {
            setUnauthorized(true);
            setLoading(false);

            // redirect after 3s so they see the message first
            setTimeout(() => {
                navigate("/learner/dashboard");
            }, 3000);
        }
    }, [navigate, user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
                <span className="loading loading-infinity loading-xl text-indigo-400"></span>
            </div>
        );
    }

    if (unauthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-center px-6">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-2xl animate-fade-in">
                    <h1 className="text-3xl font-bold text-red-400 mb-4">
                        🚫 Access Denied
                    </h1>
                    <p className="text-lg text-gray-200 mb-6">
                        You are logged in as a <span className="font-semibold">Learner</span>.
                        Educator-only resources cannot be accessed with this account.
                    </p>
                    <p className="text-indigo-300 text-sm italic">
                        Redirecting you back to your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default CheckAuthForEducator;
