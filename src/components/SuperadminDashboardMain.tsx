"use client";

import { useEffect, useState } from "react";
import { db } from "@/services/firebase"; // Caminho do seu arquivo firebase.ts
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
    PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip, CartesianGrid,
  } from "recharts";
  import { format } from "date-fns";

// Exemplo de preço premium por usuário bloqueado
const PREMIUM_PRICE = 11.0;

type Grupo = {
  id: string;
  nome?: string;
  codigo?: string;
  participantesCount?: number;
};

export default function SuperadminDashboardMain() {
  const [tab, setTab] = useState<"dashboard" | "grupos">("dashboard");
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [usuariosAtivos, setUsuariosAtivos] = useState(0);
  const [receita, setReceita] = useState(0);

  const [pagos, setPagos] = useState(0);
  const [naoPagos, setNaoPagos] = useState(0);
  const [cadastrosPorMes, setCadastrosPorMes] = useState<{ mes: string; grupos: number }[]>([]);

  // Função para buscar grupos (usada ao montar e após exclusão)
  async function fetchGrupos() {
    setLoading(true);
    const gruposSnap = await getDocs(collection(db, "groups"));
    const gruposArray: Grupo[] = [];
    for (const groupDoc of gruposSnap.docs) {
      const groupId = groupDoc.id;
      const groupData = groupDoc.data();
      const participantsSnap = await getDocs(collection(db, "groups", groupId, "participants"));
      gruposArray.push({
        id: groupId,
        nome: groupData.nome || "",
        codigo: groupData.codigo || "",
        participantesCount: participantsSnap.docs.length,
      });
    }
    setGrupos(gruposArray);
    setLoading(false);
  }

  // Carregar grupos ao abrir a aba
  useEffect(() => {
    if (tab === "grupos") fetchGrupos();
    // eslint-disable-next-line
  }, [tab]);

  // Excluir grupo com confirmação
  async function handleExcluirGrupo(groupId: string) {
    if (!window.confirm("Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    await deleteDoc(doc(db, "groups", groupId));
    // Para limpar subcoleção participants, você pode agendar uma função cloud ou iterar aqui (para poucos grupos ok):
    // const participantesSnap = await getDocs(collection(db, "groups", groupId, "participants"));
    // for (const p of participantesSnap.docs) { await deleteDoc(p.ref); }
    await fetchGrupos();
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const gruposSnap = await getDocs(collection(db, "groups"));
      const gruposArray: Grupo[] = [];
      let usuarios = 0;
      let receitaPremium = 0;
      let countPagos = 0;
      let countNaoPagos = 0;

      // Para gráfico de barras
      const mesesMap: Record<string, number> = {};

      for (const groupDoc of gruposSnap.docs) {
        const groupId = groupDoc.id;
        const groupData = groupDoc.data();
        // Data de criação do grupo (Firestore Timestamp para Date)
        let createdAt: Date | null = null;
        if (groupData.createdAt?.seconds) {
          createdAt = new Date(groupData.createdAt.seconds * 1000);
        }

        // Para gráfico de barras: conta grupo criado no mês/ano atual
        if (createdAt && createdAt.getFullYear() === new Date().getFullYear()) {
          const mes = String(createdAt.getMonth() + 1).padStart(2, "0"); // "01", "02"...
          mesesMap[mes] = (mesesMap[mes] || 0) + 1;
        }

        // Busca participantes
        const participantsSnap = await getDocs(collection(db, "groups", groupId, "participants"));
        const participantes = participantsSnap.docs.map(d => d.data());
        type Participante = { blockedId?: string };
        const blockedPremiumCount = participantes.filter((p: Participante) => !!p.blockedId).length;
        countPagos += blockedPremiumCount;
        countNaoPagos += participantes.length - blockedPremiumCount;

        gruposArray.push({
          id: groupId,
          nome: groupData.nome || "",
          codigo: groupData.codigo || "",
          participantesCount: participantes.length,
        });

        usuarios += participantes.length;
        receitaPremium += blockedPremiumCount * PREMIUM_PRICE;
      }

      setGrupos(gruposArray);
      setUsuariosAtivos(usuarios);
      setReceita(receitaPremium);
      setPagos(countPagos);
      setNaoPagos(countNaoPagos);

      // Formata array do gráfico de barras
      const mesesDoAno = Array.from({ length: 12 }, (_, i) =>
        String(i + 1).padStart(2, "0")
      );
      setCadastrosPorMes(
        mesesDoAno.map(mes => ({
          mes: format(new Date(new Date().getFullYear(), Number(mes) - 1, 1), "MMM"),
          grupos: mesesMap[mes] || 0,
        }))
      );

      setLoading(false);
    }

    fetchData();
  }, []);

  // Puxa todos os grupos e conta usuários pagos (blockedId)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // 1. Grupos
      const gruposSnap = await getDocs(collection(db, "groups"));
      const gruposArray: Grupo[] = [];
      let usuarios = 0;
      let receitaPremium = 0;

      // 2. Para cada grupo, conta participantes e bloqueios premium
      for (const groupDoc of gruposSnap.docs) {
        const groupId = groupDoc.id;
        const groupData = groupDoc.data();
        // Busca participantes
        const participantsSnap = await getDocs(collection(db, "groups", groupId, "participants"));
        const participantes = participantsSnap.docs.map(d => d.data());
        type Participante = { blockedId?: string };
        const blockedPremiumCount = participantes.filter((p: Participante) => !!p.blockedId).length;

        gruposArray.push({
          id: groupId,
          nome: groupData.nome || "",
          codigo: groupData.codigo || "",
          participantesCount: participantes.length,
        });

        usuarios += participantes.length;
        receitaPremium += blockedPremiumCount * PREMIUM_PRICE;
      }

      setGrupos(gruposArray);
      setUsuariosAtivos(usuarios);
      setReceita(receitaPremium);
      setLoading(false);
    }

    fetchData();
  }, []);

  function handleLogout() {
    localStorage.removeItem("superadmin_token_amigosecreto");
    window.location.href = "/superadmin";
  }

  const COLORS = ["#5D8DF6", "#FBD38D"];
  const pieData = [
    { name: "Usuários Premium", value: pagos },
    { name: "Usuários Gratuitos", value: naoPagos },
  ];

  return (
    <main className="bg-gray-100 min-h-screen text-gray-800">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-3 bg-primary text-white">
        <div className="font-bold text-lg tracking-tight">
          AMIGO SECRETO TOP
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-red-100 hover:text-red-600">
          Logout
        </Button>
      </header>
      {/* Sidebar + conteúdo */}
      <div className="flex min-h-[calc(100vh-56px)]">
        <nav className="w-48 bg-gray-400 text-white py-6 flex flex-col gap-2">
          <button
            className={`text-left px-5 py-2 font-semibold rounded transition ${
              tab === "dashboard"
                ? "bg-white text-primary shadow"
                : "hover:bg-gray-300 hover:text-gray-900"
            }`}
            onClick={() => setTab("dashboard")}
          >
            HOME
          </button>
          <button
            className={`text-left px-5 py-2 font-semibold rounded transition ${
              tab === "grupos"
                ? "bg-white text-primary shadow"
                : "hover:bg-gray-300 hover:text-gray-900"
            }`}
            onClick={() => setTab("grupos")}
          >
            LISTA DE GRUPOS
          </button>
        </nav>
        {/* Conteúdo */}
        <section className="flex-1 p-8">
          {tab === "dashboard" ? (
            <>
              {/* Cards do topo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white rounded-xl p-7 flex flex-col items-center shadow">
                  <div className="text-sm text-gray-500 font-semibold mb-1">GRUPOS CADASTRADOS</div>
                  <div className="text-4xl font-bold text-primary">{loading ? "--" : grupos.length}</div>
                </div>
                <div className="bg-white rounded-xl p-7 flex flex-col items-center shadow">
                  <div className="text-sm text-gray-500 font-semibold mb-1">USUÁRIOS ATIVOS</div>
                  <div className="text-4xl font-bold text-primary">{loading ? "--" : usuariosAtivos}</div>
                </div>
                <div className="bg-white rounded-xl p-7 flex flex-col items-center shadow">
                  <div className="text-sm text-gray-500 font-semibold mb-1">RECEITA TOTAL</div>
                  <div className="text-4xl font-bold text-green-600">
                    {loading
                      ? "--"
                      : receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
              </div>
              {/* GRÁFICOS */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* --- Gráfico Pizza --- */}
                <div className="bg-white rounded-xl flex flex-col items-center justify-center min-h-[300px] shadow p-5">
                  <h3 className="font-semibold mb-4 text-lg text-primary">Usuários pagos x gratuitos</h3>
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
                {/* --- Gráfico Barras --- */}
                <div className="bg-white rounded-xl flex flex-col items-center justify-center min-h-[300px] shadow p-5">
                  <h3 className="font-semibold mb-4 text-lg text-primary">Grupos criados por mês ({new Date().getFullYear()})</h3>
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
            <div className="overflow-auto">
              <table className="min-w-full bg-white rounded-xl shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">NOME</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">CÓDIGO</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">INTEGRANTES</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {grupos.map(grupo => (
                    <tr key={grupo.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2">{grupo.nome || grupo.id}</td>
                      <td className="px-4 py-2">{grupo.codigo}</td>
                      <td className="px-4 py-2">{grupo.participantesCount ?? "--"}</td>
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
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
