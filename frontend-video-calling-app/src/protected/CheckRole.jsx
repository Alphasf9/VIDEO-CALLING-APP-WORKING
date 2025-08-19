import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function CheckUser({ children }) {
    const navigate = useNavigate();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user === undefined) return;

        if (user?.role === 'learner') {
            setLoading(false);
            navigate('/learner/dashboard');
        }

        if (user?.role === 'educator') {
            setLoading(false);
            navigate('/educator/dashboard');
        }
    }, [navigate, user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-dots loading-lg text-primary"></span>
            </div>
        );
    }

    return <>{children}</>;
}

export default CheckUser;