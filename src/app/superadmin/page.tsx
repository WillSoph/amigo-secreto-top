"use client";
import { useState, useEffect } from "react";
import SuperadminLogin from "@/components/SuperadminLogin";
import DashboardMain from "@/components/SuperadminDashboardMain";

const TOKEN_KEY = "superadmin_token_amigosecreto";

export default function SuperadminPage() {
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY) === "logado") {
      setLogado(true);
    }
  }, []);

  if (!logado) {
    return <SuperadminLogin onLogin={() => setLogado(true)} />;
  }

  // Depois mostre o dashboard (cards, gráficos etc)
  return <DashboardMain />;
}
