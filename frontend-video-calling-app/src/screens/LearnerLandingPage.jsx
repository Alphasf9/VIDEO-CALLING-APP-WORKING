import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../api/AxiosInstance";

const LandingPage = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(
    user?.avatarUrl ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `https://${user.avatarUrl}`) : ""
  );



  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      setUploading(true);

      // Get signed upload URL
      const { data } = await api.post("/users/user-url", {
        fileName: file.name,
        fileType: file.type,
      });

      let { uploadUrl, publicUrl } = data;

      // Ensure publicUrl has https://
      publicUrl = publicUrl.startsWith("http") ? publicUrl : `https://${publicUrl}`;

      // Upload file to S3
      await api.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        baseURL: "", // prevent Axios baseURL from prepending
        withCredentials: false,
      });

      // Update user context + localStorage
      const updatedUser = { ...user, avatarUrl: publicUrl };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setPreview(publicUrl);



      // Navigate to learner dashboard after upload
      navigate("/learner/dashboard");

    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Failed to upload avatar.");
      setPreview(user?.avatarUrl ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `https://${user.avatarUrl}`) : "");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center p-8 space-y-8 relative">
      {/* Avatar Circle */}
      <section className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Your Profile</h2>
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={preview || "https://via.placeholder.com/150?text=Avatar"}
              alt="avatar"
              className="w-40 h-40 rounded-full object-cover border-4 border-indigo-200 shadow-lg transition-transform duration-300 hover:scale-105"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-indigo-500 text-white p-3 rounded-full cursor-pointer shadow-md hover:bg-indigo-600 transition-colors duration-300"
            >
              📷
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
        {uploading && <p className="text-center text-sm text-indigo-500 font-medium">Uploading your avatar...</p>}
      </section>
    </div>
  );
};

export default LandingPage;
