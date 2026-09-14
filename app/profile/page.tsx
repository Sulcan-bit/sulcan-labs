// app/profile/page.tsx

"use client";

import { useEffect, useState } from "react";

type User = {
  email: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  address_line1?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
};

export default function ProfilePage() {
  console.log("🟦 [PROFILE] Page loaded");

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address_line1: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
  });

  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [suggestions, setSuggestions] = useState<
    { place_id: string; description: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      console.log("🟦 [PROFILE] Loading profile...");

      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const data = await res.json();

        console.log("🟦 [PROFILE] Profile response:", data);

        if (!res.ok) {
          setError(data.error || "Failed to load profile.");
          return;
        }

        setUser(data);

        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          address_line1: data.address_line1 ?? "",
          city: data.city ?? "",
          province: data.province ?? "",
          postal_code: data.postal_code ?? "",
          country: data.country ?? "",
        });
      } catch (err) {
        console.error("🔴 [PROFILE] Unexpected error:", err);
        setError("Unexpected error occurred.");
      }
    }

    loadProfile();
  }, []);

  // Save profile
  async function handleSave() {
    console.log("🟦 [PROFILE] Saving profile:", form);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("🟦 [PROFILE] Save response:", data);

      if (!res.ok) {
        alert(data.error || "Failed to update profile.");
        return;
      }

      alert("Profile updated successfully!");
      setIsEditing(false);
      setUser(data.user);
    } catch (err) {
      console.error("🔴 [PROFILE] Save error:", err);
      alert("Unexpected error occurred.");
    }
  }

  // Delete profile
  async function handleDelete() {
    console.log("🟦 [PROFILE] Delete requested");

    const confirmed = window.confirm(
      "Are you sure you want to delete your profile? Your account will be disabled, but your information will be retained by Sulcan."
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      console.log("🟦 [PROFILE] Delete response:", data);

      if (!res.ok) {
        alert(data.error || "Failed to delete profile.");
        return;
      }

      alert("Your profile has been deleted. Your data remains securely stored.");
      window.location.href = "/api/auth/logout";
    } catch (err) {
      console.error("🔴 [PROFILE] Delete error:", err);
      alert("Unexpected error occurred.");
    }
  }

  // SECURE AUTOCOMPLETE — calls backend, NOT Google
  async function handleAddressInput(value: string) {
    console.log("🟦 [AUTOCOMPLETE] Input typed:", value);

    setForm((prev) => ({ ...prev, address_line1: value }));

    if (value.length < 3) {
      console.log("🟦 [AUTOCOMPLETE] Input too short, clearing suggestions");
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    try {
      console.log("🟦 [AUTOCOMPLETE] Sending request to backend...");

      const res = await fetch("/api/google/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: value }),
      });

      console.log("🟦 [AUTOCOMPLETE] Backend response status:", res.status);

      const json = await res.json();
      console.log("🟦 [AUTOCOMPLETE] Backend JSON:", json);

      const mapped = (json.suggestions || []).map((s: any) => ({
        place_id: s.placeId,
        description: s.formattedSuggestion,
      }));

      console.log("🟦 [AUTOCOMPLETE] Mapped suggestions:", mapped);

      setSuggestions(mapped);
      setShowSuggestions(true);
    } catch (err) {
      console.error("🔴 [AUTOCOMPLETE] Error:", err);
    }
  }

  // SECURE PLACE DETAILS — calls backend, NOT Google
  async function handleSelectSuggestion(place_id: string, description: string) {
    console.log("🟦 [DETAILS] Selected place:", place_id, description);

    setShowSuggestions(false);

    try {
      const res = await fetch("/api/google/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id }),
      });

      console.log("🟦 [DETAILS] Backend response status:", res.status);

      const json = await res.json();
      console.log("🟦 [DETAILS] Backend JSON:", json);

      const components = json.addressComponents || [];

      const get = (type: string) =>
        components.find((c: any) => c.types.includes(type))?.longText ?? "";

      const streetNumber = get("street_number");
      const route = get("route");
      const city = get("locality");
      const province = get("administrative_area_level_1");
      const postalCode = get("postal_code");
      const country = get("country");

      const address_line1 = [streetNumber, route].filter(Boolean).join(" ");

      console.log("🟦 [DETAILS] Parsed address:", {
        address_line1,
        city,
        province,
        postal_code: postalCode,
        country,
      });

      setForm((prev) => ({
        ...prev,
        address_line1: address_line1 || description,
        city,
        province,
        postal_code: postalCode,
        country,
      }));
    } catch (err) {
      console.error("🔴 [DETAILS] Error:", err);
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
      <div className="bg-white p-8 rounded shadow max-w-xl w-full">

        {/* Navigation */}
        <div className="flex justify-between mb-6">
          <a href="/models" className="text-gray-700 hover:text-black">
            ← Back
          </a>
          <a href="/api/auth/logout" className="text-gray-700 hover:text-black">
            Logout
          </a>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Profile</h1>

        {/* READ MODE */}
        {!isEditing && (
          <div className="space-y-6">

            <div className="bg-gray-50 p-5 rounded border">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">Account</h2>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Phone:</strong> {user.phone}</div>
            </div>

            <div className="bg-gray-50 p-5 rounded border">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">Personal Information</h2>
              <div><strong>First Name:</strong> {user.first_name || "Not set"}</div>
              <div><strong>Last Name:</strong> {user.last_name || "Not set"}</div>
            </div>

            <div className="bg-gray-50 p-5 rounded border">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">Address</h2>
              <div><strong>Address:</strong> {user.address_line1 || "Not set"}</div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                className="px-5 py-2 rounded bg-gray-800 text-white hover:bg-black"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>

              <button
                className="px-5 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                onClick={handleDelete}
              >
                Delete Profile
              </button>
            </div>

          </div>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <div className="space-y-6">

            <div className="bg-gray-50 p-5 rounded border">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">Account</h2>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Phone:</strong> {user.phone}</div>
            </div>

            <div className="bg-gray-50 p-5 rounded border space-y-4">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">Personal Information</h2>

              <label className="flex flex-col">
                <span className="font-medium">First Name</span>
                <input
                  className="border p-2 rounded"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col">
                <span className="font-medium">Last Name</span>
                <input
                  className="border p-2 rounded"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, last_name: e.target.value }))
                  }
                />
              </label>
            </div>

            {/* ADDRESS SECTION */}
            <div className="bg-gray-50 p-5 rounded border space-y-4">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">Address</h2>

              <label className="flex flex-col relative">
                <span className="font-medium">Address</span>
                <input
                  className="border p-2 rounded"
                  value={form.address_line1}
                  onChange={(e) => handleAddressInput(e.target.value)}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute bg-white border rounded shadow mt-1 w-full z-10">
                    {suggestions.map((s) => (
                      <div
                        key={s.place_id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          handleSelectSuggestion(s.place_id, s.description)
                        }
                      >
                        {s.description}
                      </div>
                    ))}
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                className="px-5 py-2 rounded bg-gray-800 text-white hover:bg-black"
                onClick={handleSave}
              >
                Save Profile
              </button>

              <button
                className="px-5 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
