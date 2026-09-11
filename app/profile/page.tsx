// app/profile/page.tsx

"use client";

import { useEffect, useState } from "react";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

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
  const [isEditing, setIsEditing] = useState(false);

  const [suggestions, setSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load profile.");
          return;
        }

        setUser(data);

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

  // Save profile
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
      setIsEditing(false);
      setUser(data.user);
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
    }
  }

  // Delete profile
  async function handleDelete() {
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
      if (!res.ok) {
        alert(data.error || "Failed to delete profile.");
        return;
      }

      alert("Your profile has been deleted. Your data remains securely stored.");
      window.location.href = "/api/auth/logout";
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
    }
  }

  // ⭐ Google Places Autocomplete (ONE FIELD)
  async function handleAddressInput(value: string) {
    setForm({ ...form, address_line1: value });

    if (value.length < 3) {
      setShowSuggestions(false);
      return;
    }

    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
        `?input=${encodeURIComponent(value)}` +
        `&components=country:ca` +
        `&types=address` +
        `&key=${GOOGLE_API_KEY}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.status !== "OK") {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSuggestions(
        json.predictions.map((p: any) => ({
          description: p.description,
          place_id: p.place_id,
        }))
      );

      setShowSuggestions(true);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  }

  // ⭐ Google Place Details → auto-fill city/province/postal/country
  async function handleSelectSuggestion(place_id: string, description: string) {
    setForm({ ...form, address_line1: description });
    setShowSuggestions(false);

    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${place_id}` +
        `&fields=address_component,formatted_address` +
        `&key=${GOOGLE_API_KEY}`;

      const res = await fetch(url);
      const json = await res.json();

      const components = json?.result?.address_components ?? [];

      const get = (type: string) =>
        components.find((c: any) => c.types.includes(type))?.long_name ?? "";

      const streetNumber = get("street_number");
      const route = get("route");
      const city = get("locality") || get("sublocality");
      const province = get("administrative_area_level_1");
      const postalCode = get("postal_code");
      const country = get("country");

      const address_line1 = [streetNumber, route].filter(Boolean).join(" ");

      setForm({
        ...form,
        address_line1,
        city,
        province,
        postal_code: postalCode,
        country,
      });
    } catch (err) {
      console.error("Place details error:", err);
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
              <div><strong>City:</strong> {user.city || "Not set"}</div>
              <div><strong>Province:</strong> {user.province || "Not set"}</div>
              <div><strong>Postal Code:</strong> {user.postal_code || "Not set"}</div>
              <div><strong>Country:</strong> {user.country || "Not set"}</div>
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
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </label>

              <label className="flex flex-col">
                <span className="font-medium">Last Name</span>
                <input
                  className="border p-2 rounded"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </label>
            </div>

            {/* ⭐ ONE SINGLE ADDRESS FIELD WITH AUTOCOMPLETE */}
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
                    {suggestions.map((s, idx) => (
                      <div
                        key={idx}
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

              {/* Auto-filled fields (read-only) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">City</span>
                  <input
                    className="border p-2 rounded bg-gray-100"
                    value={form.city}
                    readOnly
                  />
                </div>

                <div>
                  <span className="font-medium">Province</span>
                  <input
                    className="border p-2 rounded bg-gray-100"
                    value={form.province}
                    readOnly
                  />
                </div>

                <div>
                  <span className="font-medium">Postal Code</span>
                  <input
                    className="border p-2 rounded bg-gray-100"
                    value={form.postal_code}
                    readOnly
                  />
                </div>

                <div>
                  <span className="font-medium">Country</span>
                  <input
                    className="border p-2 rounded bg-gray-100"
                    value={form.country}
                    readOnly
                  />
                </div>
              </div>
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

