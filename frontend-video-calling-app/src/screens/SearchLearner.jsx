import React, { useState, useEffect } from "react";
import api from "../api/AxiosInstance";

const SearchLearners = ({ query }) => {
    const [loading, setLoading] = useState(false);
    const [learners, setLearners] = useState([]);

    const fetchLearners = async (searchTerm) => {
        try {
            setLoading(true);
            const res = await api.get(`/users/all-learners?search=${searchTerm}`);
            setLearners(res.data.learners || []);
        } catch (error) {
            console.error("❌ Error fetching learners:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!query.trim()) {
            setLearners([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            fetchLearners(query);
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : learners.length > 0 ? (
                learners.map((learner) => (
                    <div
                        key={learner.userId}
                        className="p-4 bg-white rounded-xl shadow-md border border-gray-200 flex gap-4 items-center"
                    >
                        <img
                            src={`https://${learner.avatarUrl}`}
                            alt={learner.name}
                            className="w-16 h-16 rounded-full object-cover border"
                        />
                        <div>
                            <h3 className="font-bold text-lg">{learner.name}</h3>
                            <p className="text-gray-600 text-sm">{learner.bio}</p>
                            <p className="text-xs text-gray-500">📧 {learner.email}</p>
                            <p className="text-xs">
                                Skills:{" "}
                                <span className="text-indigo-600">
                                    {learner.skills?.join(", ") || "N/A"}
                                </span>
                            </p>
                            <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${learner.availability === "online"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {learner.availability || "offline"}
                            </span>
                        </div>
                    </div>
                ))
            ) : query.trim() ? (
                <p className="text-gray-500">No educators found</p>
            ) : null}
        </div>
    );
};

export default SearchLearners;
