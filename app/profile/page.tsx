// app/profile/page.tsx

"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load profile.");
          return;
        }

        setUser(data);
      } catch (err) {
        console.error(err);
        setError("Unexpected error occurred.");
      }
    }

    loadProfile();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-md w-full">
          <div className="text-red-600 font-medium mb-4">{error}</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow max-w-md w-full">
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">

        {/* Navigation */}
        <div className="flex justify-between mb-6">
          <a href="/models" className="text-blue-600 underline">
            ← Back
          </a>

          <a href="/api/auth/logout" className="text-red-600 underline">
            Logout
          </a>
        </div>

        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <div className="flex flex-col gap-3">

          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Phone:</strong> {user.phone}</div>

          <div><strong>First Name:</strong> {user.first_name || "Not set"}</div>
          <div><strong>Last Name:</strong> {user.last_name || "Not set"}</div>

          <div><strong>Address Line 1:</strong> {user.address_line1 || "Not set"}</div>
          <div><strong>Address Line 2:</strong> {user.address_line2 || "Not set"}</div>
          <div><strong>City:</strong> {user.city || "Not set"}</div>
          <div><strong>Province:</strong> {user.province || "Not set"}</div>
          <div><strong>Postal Code:</strong> {user.postal_code || "Not set"}</div>
          <div><strong>Country:</strong> {user.country || "Not set"}</div>

        </div>

      </div>
    </main>
  );
}
