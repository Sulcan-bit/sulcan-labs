// app/register/page.tsx

"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!phone) {
      setError("Cellphone number is required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!accessCode) {
      setError("Access code is required.");
      return;
    }

    // Normalize phone to digits only
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Phone number must be 10 digits.");
      return;
    }

    const normalizedPhone = `+1${digits}`;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone: normalizedPhone,
          password,
          accessCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">

        {/* Back to Home */}
        <div className="mb-6">
          <a href="/" className="text-blue-600 underline">
            ← Back to Home
          </a>
        </div>

        <h1 className="text-2xl font-bold mb-6">Create Account</h1>

        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Cellphone Number"
            className="border p-2 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="text"
            placeholder="Access Code"
            className="border p-2 rounded"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 rounded"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-2 rounded"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
      </div>
    </main>
  );
}

