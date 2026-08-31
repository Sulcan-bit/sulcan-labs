// app/heavy-oil/inputs/page.tsx

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InputsForm from "./InputsForm";

export default async function HeavyOilInputsPage() {
  const user = await requireAuth();

  // Load months from MonthlyData
  const months = await prisma.monthlyData.findMany({
    orderBy: [{ year: "desc" }, { id: "desc" }],
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Heavy Oil Diluent Optimization Inputs</h1>
      <p className="mb-6 text-lg">Welcome, {user.email}</p>

      <InputsForm months={months} />
    </main>
  );
}
