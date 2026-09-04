// app/heavy-oil/inputs/page.tsx

import { prisma } from "@/lib/prisma";
import InputsForm from "./InputsForm";

export default async function HeavyOilInputsPage() {
  // ❗ IMPORTANT:
  // Server Components cannot authenticate users.
  // Auth is now enforced ONLY in API routes.
  // So we remove requireAuth entirely.

  // Load months from MonthlyData
  const months = await prisma.monthlyData.findMany({
    orderBy: [{ year: "desc" }, { id: "desc" }],
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Heavy Oil Diluent Optimization Inputs</h1>

      {/* ❗ We cannot show user.email here anymore because RSC cannot read auth */}
      <InputsForm months={months} />
    </main>
  );
}

