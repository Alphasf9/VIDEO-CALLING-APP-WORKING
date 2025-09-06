import React, { useState, useEffect } from "react";
import api from "../api/AxiosInstance";

const SearchEducator = ({ query }) => {
  const [loading, setLoading] = useState(false);
  const [educators, setEducators] = useState([]);

  const fetchEducators = async (searchTerm) => {
    try {
      setLoading(true);
      const res = await api.get(`/users/all-educators?search=${searchTerm}`);
      setEducators(res.data.educators || []);
    } catch (error) {
      console.error("❌ Error fetching educators:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setEducators([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchEducators(query);
    }, 400); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : educators.length > 0 ? (
        educators.map((edu) => (
          <div
            key={edu.userId}
            className="p-4 bg-white rounded-xl shadow-md border border-gray-200 flex gap-4 items-center"
          >
            <img
              src={`https://${edu.avatarUrl}`}
              alt={edu.name}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <h3 className="font-bold text-lg">{edu.name}</h3>
              <p className="text-gray-600 text-sm">{edu.bio}</p>
              <p className="text-xs text-gray-500">📧 {edu.email}</p>
              <p className="text-xs">
                Skills:{" "}
                <span className="text-indigo-600">
                  {edu.skills?.join(", ") || "N/A"}
                </span>
              </p>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  edu.availability === "online"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {edu.availability || "offline"}
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

export default SearchEducator;
