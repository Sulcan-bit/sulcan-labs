import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="w-full p-4 flex justify-between items-center bg-white shadow">
        <div className="text-2xl font-bold tracking-wide">Sulcan Labs</div>
        <button className="px-4 py-2 bg-black text-white rounded">
          Login
        </button>
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
          <h1 className="text-5xl font-bold">AI‑Managed Heavy Oil Optimization</h1>
          <p className="mt-4 text-xl max-w-3xl mx-auto font-medium">
            C4/C5 Blending • Viscosity Control • Vapor Pressure Compliance • Netback Maximization
          </p>
        </div>
      </section>

      {/* Oil Storage Terminal Section */}
      <section className="relative h-[400px] mt-12 flex items-center justify-center text-black">
        <Image
          src="/terminal.jpg"
          alt="Oil Storage Terminal"
          fill
          className="object-cover opacity-30 rounded-lg shadow-lg"
        />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-4xl font-bold">AI‑Driven Terminal & Market Access Optimization</h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto font-medium">
            Intelligent tools for optimizing storage, blending, transportation, and market access across Hardisty,
            Cushing, and major North American pipeline systems.
          </p>
        </div>
      </section>

      {/* Truck-In Terminal Section */}
      <section className="relative h-[400px] mt-12 flex items-center justify-center text-black">
        <Image
          src="/truck-terminal.jpg"
          alt="Truck-In Oil Terminal"
          fill
          className="object-cover opacity-30 rounded-lg shadow-lg"
        />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-4xl font-bold">AI‑Enhanced Truck‑In & Blending Operations</h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto font-medium">
            Optimized truck‑in scheduling, light‑oil blending, and operational efficiency tools designed for smaller
            terminals and regional heavy‑oil hubs.
          </p>
        </div>
      </section>

      {/* Centered AI Optimization Paragraph */}
      <section className="p-12 text-center">
        <p className="mt-4 text-lg max-w-3xl mx-auto leading-relaxed">
          AI‑managed optimization tools for C4/C5 diluent blending, viscosity control, vapor pressure compliance,
          transportation economics, and netback maximization. The system integrates monthly pricing, blend ratios,
          operational constraints, and market access pathways to generate the most profitable heavy‑oil strategy.
        </p>
      </section>

      {/* Contact Section */}
      <section className="p-12">
        <h2 className="text-3xl font-semibold">Contact</h2>
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





