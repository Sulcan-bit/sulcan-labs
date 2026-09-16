// app/condensate/history/page.tsx

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth";
import HistoryClient from "./history-client";

export default async function CondensateHistoryPage() {
  const user = await getUserFromSession();

  if (!user) {
    redirect("/login");
  }

  return <HistoryClient />;
}



