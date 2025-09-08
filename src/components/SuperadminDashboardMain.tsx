"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/services/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as BarTooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

// Preço para cálculo da receita
const PREMIUM_PRICE = 11.0;

type Grupo = {
  id: string;
  nome?: string;
  codigo?: string;
  participantesCount?: number;
  premiumCount?: number;
  adminName?: string;
  createdAt?: Date | null;
};

export default function SuperadminDashboardMain() {
  const [tab, setTab] = useState<"dashboard" | "grupos">("dashboard");
  const [loading, setLoading] = useState(true);

  // Base de grupos compartilhada pelas abas
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  // KPIs
  const [usuariosAtivos, setUsuariosAtivos] = useState(0);
  const [receita, setReceita] = useState(0);
  const [pagos, setPagos] = useState(0);
  const [naoPagos, setNaoPagos] = useState(0);

  // KPIs extras
  const [premiumRate, setPremiumRate] = useState(0);
  const [avgRevenuePerGroup, setAvgRevenuePerGroup] = useState(0);
  const [groupsLast30d, setGroupsLast30d] = useState(0);
  const [growthMoM, setGrowthMoM] = useState<number | null>(null);

  // Série para gráfico
  const [cadastrosPorMes, setCadastrosPorMes] = useState<
    { mes: string; grupos: number }[]
  >([]);

  // Busca (lista de grupos)
  const [busca, setBusca] = useState("");

  // Utilitários
  function tsToDateMaybe(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return v;
    const t: Timestamp | undefined = v as any;
    if (t?.seconds) return new Date(t.seconds * 1000);
    return null;
  }

  async function buildGrupoRow(groupId: string, groupData: any): Promise<Grupo> {
    const participantsSnap = await getDocs(
      collection(db, "groups", groupId, "participants")
    );

    let participantesCount = 0;
    let premiumCount = 0;
    let adminName: string | undefined;

    participantsSnap.docs.forEach((pDoc) => {
      const p = pDoc.data() as any;
      participantesCount++;
      if (p?.blockedId) premiumCount++;
      if (p?.isAdmin) adminName = p?.name || p?.nome || "—";
    });

    const createdAt = tsToDateMaybe(groupData?.createdAt);

    return {
      id: groupId,
      nome: groupData?.nome || groupData?.name || "",
      codigo: groupData?.codigo || "",
      participantesCount,
      premiumCount,
      adminName,
      createdAt,
    };
  }

  // DASHBOARD
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);

      const gruposSnap = await getDocs(collection(db, "groups"));
      const gruposArray: Grupo[] = [];

      let totalUsuarios = 0;
      let totalReceita = 0;
      let countPagos = 0;
      let countNaoPagos = 0;

      const mesesMap: Record<string, number> = {};

      const d30 = new Date();
      d30.setDate(d30.getDate() - 30);
      let last30 = 0;

      for (const groupDoc of gruposSnap.docs) {
        const row = await buildGrupoRow(groupDoc.id, groupDoc.data());
        gruposArray.push(row);

        totalUsuarios += row.participantesCount || 0;
        countPagos += row.premiumCount || 0;
        countNaoPagos += (row.participantesCount || 0) - (row.premiumCount || 0);
        totalReceita += (row.premiumCount || 0) * PREMIUM_PRICE;

        if (row.createdAt) {
          if (row.createdAt >= d30) last30++;
          if (row.createdAt.getFullYear() === new Date().getFullYear()) {
            const mes = String(row.createdAt.getMonth() + 1).padStart(2, "0");
            mesesMap[mes] = (mesesMap[mes] || 0) + 1;
          }
        }
      }

      setGrupos(gruposArray);
      setUsuariosAtivos(totalUsuarios);
      setReceita(totalReceita);
      setPagos(countPagos);
      setNaoPagos(countNaoPagos);
      setGroupsLast30d(last30);

      const rate = totalUsuarios > 0 ? (countPagos / totalUsuarios) * 100 : 0;
      setPremiumRate(rate);
      setAvgRevenuePerGroup(
        gruposArray.length ? totalReceita / gruposArray.length : 0
      );

      const mesesDoAno = Array.from({ length: 12 }, (_, i) =>
        String(i + 1).padStart(2, "0")
      );
      const series = mesesDoAno.map((m) => ({
        mes: format(
          new Date(new Date().getFullYear(), Number(m) - 1, 1),
          "MMM"
        ),
        grupos: mesesMap[m] || 0,
      }));
      setCadastrosPorMes(series);

      const now = new Date();
      const mi = now.getMonth();
      const atual = series[mi]?.grupos ?? 0;
      const anterior = series[mi - 1]?.grupos ?? 0;
      setGrowthMoM(
        mi === 0 ? null : anterior === 0 ? (atual > 0 ? 100 : 0) : ((atual - anterior) / anterior) * 100
      );

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  // LISTA DE GRUPOS (quando entra na aba)
  async function fetchGruposTable() {
    setLoading(true);
    const gruposSnap = await getDocs(collection(db, "groups"));
    const arr: Grupo[] = [];
    for (const groupDoc of gruposSnap.docs) {
      const row = await buildGrupoRow(groupDoc.id, groupDoc.data());
      arr.push(row);
    }
    setGrupos(arr);
    setLoading(false);
  }

  useEffect(() => {
    if (tab === "grupos") fetchGruposTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleExcluirGrupo(groupId: string) {
    if (!window.confirm("Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    await deleteDoc(doc(db, "groups", groupId));
    await fetchGruposTable();
  }

  function handleLogout() {
    localStorage.removeItem("superadmin_token_amigosecreto");
    window.location.href = "/superadmin";
  }

  // --- Busca + Ordenação ---
  const gruposFiltradosOrdenados = useMemo(() => {
    const q = busca.trim().toLowerCase();

    // filtro por nome do grupo OU admin
    const filtrados = q
      ? grupos.filter((g) => {
          const nome = (g.nome || "").toLowerCase();
          const admin = (g.adminName || "").toLowerCase();
          return nome.includes(q) || admin.includes(q);
        })
      : grupos.slice();

    // ordena por createdAt desc (mais recentes primeiro; nulos vão pro fim)
    filtrados.sort((a, b) => {
      const da = a.createdAt ? a.createdAt.getTime() : -Infinity;
      const db = b.createdAt ? b.createdAt.getTime() : -Infinity;
      return db - da;
    });

    return filtrados;
  }, [grupos, busca]);

  // Gráfico pizza
  const COLORS = ["#5D8DF6", "#FBD38D"];
  const pieData = [
    { name: "Usuários Premium", value: pagos },
    { name: "Usuários Gratuitos", value: naoPagos },
  ];

  return (
    <main className="bg-gray-100 min-h-screen text-gray-800">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-3 bg-emerald-700 text-white">
        <div className="font-bold text-lg tracking-tight">
          AMIGO SECRETO TOP — Superadmin
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-white hover:bg-red-100 hover:text-red-600"
        >
          Logout
        </Button>
      </header>

      {/* Layout */}
      <div className="flex min-h-[calc(100vh-56px)]">
        <nav className="w-48 bg-emerald-900 text-white py-6 flex flex-col gap-2">
          <button
            className={`text-left px-5 py-2 font-semibold rounded transition ${
              tab === "dashboard"
                ? "bg-white text-emerald-700 shadow"
                : "hover:bg-emerald-800"
            }`}
            onClick={() => setTab("dashboard")}
          >
            HOME
          </button>
          <button
            className={`text-left px-5 py-2 font-semibold rounded transition ${
              tab === "grupos"
                ? "bg-white text-emerald-700 shadow"
                : "hover:bg-emerald-800"
            }`}
            onClick={() => setTab("grupos")}
          >
            LISTA DE GRUPOS
          </button>
        </nav>

        <section className="flex-1 p-8">
          {tab === "dashboard" ? (
            <>
              {/* KPIs principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                <div className="bg-white rounded-xl p-7 flex flex-col items-center shadow">
                  <div className="text-sm text-gray-500 font-semibold mb-1">
                    GRUPOS CADASTRADOS
                  </div>
                  <div className="text-4xl font-bold text-emerald-700">
                    {loading ? "--" : grupos.length}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-7 flex flex-col items-center shadow">
                  <div className="text-sm text-gray-500 font-semibold mb-1">
                    USUÁRIOS ATIVOS
                  </div>
                  <div className="text-4xl font-bold text-emerald-700">
                    {loading ? "--" : usuariosAtivos}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-7 flex flex-col items-center shadow">
                  <div className="text-sm text-gray-500 font-semibold mb-1">
                    RECEITA TOTAL
                  </div>
                  <div className="text-4xl font-bold text-green-600">
                    {loading
                      ? "--"
                      : receita.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                  </div>
                </div>
              </div>

              {/* KPIs extras */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <div className="bg-white rounded-xl p-6 shadow">
                  <p className="text-sm text-gray-500 font-semibold">
                    TAXA PREMIUM
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-700">
                    {loading ? "--" : `${premiumRate.toFixed(1)}%`}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow">
                  <p className="text-sm text-gray-500 font-semibold">
                    TICKET MÉDIO / GRUPO
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-700">
                    {loading
                      ? "--"
                      : avgRevenuePerGroup.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow">
                  <p className="text-sm text-gray-500 font-semibold">
                    GRUPOS (ÚLT. 30 DIAS)
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-700">
                    {loading ? "--" : groupsLast30d}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow">
                  <p className="text-sm text-gray-500 font-semibold">
                    CRESCIMENTO M/M
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold ${
                      growthMoM !== null && growthMoM < 0
                        ? "text-rose-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {loading || growthMoM === null
                      ? "--"
                      : `${growthMoM.toFixed(1)}%`}
                  </p>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl flex flex-col items-center justify-center min-h-[300px] shadow p-5">
                  <h3 className="font-semibold mb-4 text-lg text-emerald-700">
                    Usuários pagos x gratuitos
                  </h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <PieTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl flex flex-col items-center justify-center min-h-[300px] shadow p-5">
                  <h3 className="font-semibold mb-4 text-lg text-emerald-700">
                    Grupos criados por mês ({new Date().getFullYear()})
                  </h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={cadastrosPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis allowDecimals={false} />
                      <BarTooltip />
                      <Bar dataKey="grupos" fill="#5D8DF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            // LISTA DE GRUPOS
            <div className="space-y-3">
              {/* Barra de busca */}
              <div className="flex items-center justify-between">
                <div className="relative w-full max-w-md">
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome do grupo ou admin…"
                    className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-auto">
                <table className="min-w-full bg-white rounded-xl shadow">
                  <thead>
                    <tr className="text-left">
                      <th className="px-4 py-2 font-semibold text-gray-600">NOME</th>
                      <th className="px-4 py-2 font-semibold text-gray-600">CÓDIGO</th>
                      <th className="px-4 py-2 font-semibold text-gray-600">INTEGRANTES</th>
                      <th className="px-4 py-2 font-semibold text-gray-600">PREMIUM</th>
                      <th className="px-4 py-2 font-semibold text-gray-600">ADMIN</th>
                      <th className="px-4 py-2 font-semibold text-gray-600">CRIADO EM</th>
                      <th className="px-4 py-2 font-semibold text-gray-600">AÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gruposFiltradosOrdenados.map((grupo) => (
                      <tr key={grupo.id} className="border-b last:border-b-0">
                        <td className="px-4 py-2">{grupo.nome || grupo.id}</td>
                        <td className="px-4 py-2">{grupo.codigo || "—"}</td>
                        <td className="px-4 py-2">{grupo.participantesCount ?? "—"}</td>
                        <td className="px-4 py-2">{grupo.premiumCount ?? 0}</td>
                        <td className="px-4 py-2">{grupo.adminName || "—"}</td>
                        <td className="px-4 py-2">
                          {grupo.createdAt
                            ? format(grupo.createdAt, "dd/MM/yyyy HH:mm")
                            : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            variant="outline"
                            className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleExcluirGrupo(grupo.id)}
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Vazio */}
                {!loading && gruposFiltradosOrdenados.length === 0 && (
                  <div className="text-center text-gray-500 py-6">
                    Nenhum grupo encontrado para “{busca}”.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
