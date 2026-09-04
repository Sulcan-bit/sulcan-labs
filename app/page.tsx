// app/page.tsx

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Professional Navbar */}
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.svg"
            alt="Sulcan Labs Logo"
            width={32}
            height={32}
            className="opacity-90"
          />
          <div className="text-2xl font-semibold tracking-tight">
            Sulcan Labs
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Pipeline Section */}
      <section className="relative h-[500px] flex items-center justify-center text-black">
        <Image
          src="/pipeline.jpg"
          alt="Pipeline"
          fill
          className="object-cover opacity-30"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold tracking-tight">
            AI‑Managed Heavy Oil Optimization
          </h1>
          <p className="mt-4 text-xl max-w-3xl mx-auto font-medium text-gray-700">
            C4/C5 Blending • Viscosity Control • Vapor Pressure Compliance • Netback Maximization
          </p>
        </div>
      </section>

      {/* Oil Storage Terminal Section */}
      <section className="relative h-[400px] mt-16 flex items-center justify-center text-black">
        <Image
          src="/terminal.jpg"
          alt="Oil Storage Terminal"
          fill
          className="object-cover opacity-30 rounded-lg shadow-lg"
        />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-4xl font-bold tracking-tight">
            AI‑Driven Terminal & Market Access Optimization
          </h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto font-medium text-gray-700">
            Intelligent tools for optimizing storage, blending, transportation, and market access across Hardisty,
            Cushing, and major North American pipeline systems.
          </p>
        </div>
      </section>

      {/* Truck-In Terminal Section */}
      <section className="relative h-[400px] mt-16 flex items-center justify-center text-black">
        <Image
          src="/truck-terminal.jpg"
          alt="Truck-In Oil Terminal"
          fill
          className="object-cover opacity-30 rounded-lg shadow-lg"
        />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-4xl font-bold tracking-tight">
            AI‑Enhanced Truck‑In & Blending Operations
          </h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto font-medium text-gray-700">
            Optimized truck‑in scheduling, light‑oil blending, and operational efficiency tools designed for smaller
            terminals and regional heavy‑oil hubs.
          </p>
        </div>
      </section>

      {/* Centered AI Optimization Paragraph */}
      <section className="p-12 text-center">
        <p className="mt-4 text-lg max-w-3xl mx-auto leading-relaxed text-gray-700">
          AI‑managed optimization tools for C4/C5 diluent blending, viscosity control, vapor pressure compliance,
          transportation economics, and netback maximization. The system integrates monthly pricing, blend ratios,
          operational constraints, and market access pathways to generate the most profitable heavy‑oil strategy.
        </p>
      </section>

      {/* Contact Section */}
      <section className="p-12">
        <h2 className="text-3xl font-semibold tracking-tight">Contact</h2>
        <p className="mt-4 text-lg">
          Toll‑Free: <strong>1‑833‑999‑2783</strong>
        </p>
        <p className="mt-2 text-lg">
          Email:{" "}
          <a href="mailto:info@sulcan.com" className="text-blue-600 underline">
            info@sulcan.com
          </a>
        </p>
      </section>
    </main>
  );
}


