// app/models/page.tsx

import Link from "next/link";
export const revalidate = 0;

export default function ModelsPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">

        {/* Header */}
        <div className="flex justify-between mb-6">
          <Link href="/profile" prefetch={false} className="text-blue-600 underline">
            Profile
          </Link>

          <a href="/api/auth/logout" className="text-red-600 underline">
            Logout
          </a>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-6">Select a Model</h1>

        {/* Model Links */}
        <div className="flex flex-col gap-4 mb-10">
  <Link
    href="/heavy-oil"
    prefetch={false}
    className="block p-4 rounded bg-black text-white text-center"
  >
    Heavy Oil Diluent Optimization
  </Link>

  <Link
    href="/condensate"
    prefetch={false}
    className="block p-4 rounded bg-gray-700 text-white text-center"
  >
    Condensate Comparison Model
  </Link>

  <Link
    href="/wti-futures"
    className="block p-4 rounded bg-gray-800 text-white text-center"
  >
    WTI Futures Curve (3-Year)
  </Link>

  {/* ⭐ Add this */}
  <Link
    href="/sulcan-ai"
    prefetch={false}
    className="block p-4 rounded bg-indigo-600 text-white text-center"
  >
    Sulcan AI Agent
  </Link>
</div>


        {/* Support & Feedback */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">
            Support & Feedback
          </h2>

          <p className="text-gray-700 mb-4">
            If you need help, have questions, or want to provide feedback about any
            of the Sulcan models, you can reach us anytime:
          </p>

          <div className="space-y-2">
            <p className="text-gray-800">
              📧 <span className="font-medium">Email:</span>{" "}
              <a
                href="mailto:support@sulcan.com"
                className="text-blue-600 underline"
              >
                support@sulcan.com
              </a>
            </p>

            <p className="text-gray-800">
              📱 <span className="font-medium">Text Message:</span>{" "}
              <a
                href="sms:18339992783"
                className="text-blue-600 underline"
              >
                1‑833‑999‑2783
              </a>
            </p>
          </div>

          <p className="text-gray-600 text-sm mt-4">
            We typically respond within the hour during business days.
          </p>
        </div>

      </div>
    </main>
  );
}







