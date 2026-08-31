// app/login/page.tsx

"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "sms">("password");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">

        {/* Back to Home */}
        <div className="mb-6">
          <a href="/" className="text-blue-600 underline">
            ← Back to Home
          </a>
        </div>

        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {/* Mode Switch */}
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              mode === "password" ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("password")}
          >
            Email + Password
          </button>

          <button
            className={`px-4 py-2 rounded ${
              mode === "sms" ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("sms")}
          >
            Email + SMS Code
          </button>
        </div>

        {mode === "password" ? <PasswordLogin /> : <SmsLogin />}
      </div>
    </main>
  );
}

function PasswordLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      window.location.href = "/models";

    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    }

    setLoading(false);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleLogin}>
      {error && <div className="text-red-600 font-medium">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white p-2 rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

function SmsLogin() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");   // ⭐ NEW FIELD
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"send" | "verify">("send");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),   // ⭐ SEND PHONE
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send SMS code.");
        setLoading(false);
        return;
      }

      setStep("verify");
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    }

    setLoading(false);
  }

  async function verifyCode(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),   // ⭐ PHONE NOT NEEDED HERE
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code.");
        setLoading(false);
        return;
      }

      window.location.href = "/models";
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    }

    setLoading(false);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={step === "send" ? sendCode : verifyCode}>
      {error && <div className="text-red-600 font-medium">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {step === "send" && (
        <>
          <input
            type="tel"
            placeholder="Cellphone Number"
            className="border p-2 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-2 rounded"
          >
            {loading ? "Sending..." : "Send SMS Code"}
          </button>
        </>
      )}

      {step === "verify" && (
        <>
          <input
            type="text"
            placeholder="Enter SMS Code"
            className="border p-2 rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-2 rounded"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </>
      )}
    </form>
  );
}
