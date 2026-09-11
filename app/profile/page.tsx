// app/profile/page.tsx

"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load profile.");
          return;
        }

        setUser(data);

        // Populate editable form fields
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          address_line1: data.address_line1 ?? "",
          address_line2: data.address_line2 ?? "",
          city: data.city ?? "",
          province: data.province ?? "",
          postal_code: data.postal_code ?? "",
          country: data.country ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("Unexpected error occurred.");
      }
    }

    loadProfile();
  }, []);

  async function handleSave() {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update profile.");
        return;
      }

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
    }
  }

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

        <div className="flex flex-col gap-4">

          {/* Read-only fields */}
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Phone:</strong> {user.phone}</div>

          {/* Editable fields */}
          <label className="flex flex-col">
            <span className="font-semibold">First Name</span>
            <input
              className="border p-2 rounded"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold">Last Name</span>
            <input
              className="border p-2 rounded"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold">Address Line 1</span>
            <input
              className="border p-2 rounded"
              value={form.address_line1}
              onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold">Address Line 2</span>
            <input
              className="border p-2 rounded"
              value={form.address_line2}
              onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold">City</span>
            <input
              className="border p-2 rounded"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold">Province</span>
            <input
              className="border p-2 rounded"
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold">Postal Code</span>
            <input
              className="border p-2 rounded"
              value={form.postal_code}
              onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="font-semibold">Country</span>
            <input
              className="border p-2 rounded"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </label>

          <button
            className="bg-blue-600 text-white p-2 rounded mt-4"
            onClick={handleSave}
          >
            Save Profile
          </button>

        </div>

      </div>
    </main>
  );
}
