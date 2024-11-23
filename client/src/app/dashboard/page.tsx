"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Edit } from "lucide-react";

interface User {
  name: string;
  email: string;
  image: string;
  _id: string;
  acadamics: {
    branch: string;
    urn: string;
    yearOfAdmission: number;
  };
}

const DashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const clearToken = useAuthStore((state) => state.clearToken);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      const fetchUserData = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) {
            throw new Error("Failed to fetch user data.");
          }

          const data = await res.json();

          setUser(data);
        } catch (err) {
          setError("Failed to load user data.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/update/${
          user?._id as string
        }`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update image.");
      }

      // Fetch updated user data after successful image update
      window.location.reload();
    } catch (err) {
      setError("Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center bg-white rounded-lg shadow-lg p-6 max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.name}!
        </h1>
        <p className="text-lg text-gray-600 mt-2">Your Details:</p>
        <div className="mt-4 space-y-2">
          <p className="text-gray-700">Email: {user?.email}</p>
          <p className="text-gray-700">Branch: {user?.acadamics?.branch}</p>
          <p className="text-gray-700">URN: {user?.acadamics?.urn}</p>
          <p className="text-gray-700">
            Year of Admission: {user?.acadamics?.yearOfAdmission}
          </p>
        </div>

        {/* Profile Image with Edit Icon */}
        <div className="relative mt-6">
          <img
            src={user?.image}
            alt={`${user?.name}'s profile`}
            className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-md"
          />

          {/* Image Input */}
          <input
            type="file"
            onChange={handleImageChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
            disabled={isUploading}
          />
          <div className="flex justify-center">
            <Edit className="" />
          </div>
        </div>

        {isUploading && (
          <p className="mt-4 text-blue-500">Uploading image...</p>
        )}

        <button
          onClick={() => {
            clearToken();
            window.location.reload();
          }}
          className="mt-6 px-6 py-3 bg-red-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
