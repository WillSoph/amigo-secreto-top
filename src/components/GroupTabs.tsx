/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  addParticipante,
  buscarParticipantePorNome,
  buscarParticipantePorNomeSenha,
  atualizarDesejo,
} from "@/services/participant";
import {
  Pencil,
  Lock,
  Sparkles,
  Gift,
  ShieldCheck,
  X,
} from "lucide-react";

type Props = {
  groupCode: string;
  grupo: any;
  participantes: any[];
  atualizarGrupo: () => void;
  onLogin: (user: { nome: string; isAdmin: boolean; id: string; desejo?: string }) => void;
};

const getStorageKey = (groupCode: string) => `amigosecreto:user:${groupCode}`;

export default function GroupTabs({
  groupCode,
  grupo,
  participantes,
  atualizarGrupo,
  onLogin,
}: Props) {
  const [tab, setTab] = useState<"cadastrar" | "login">("login");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [desejo, setDesejo] = useState("");
  const [desejoMsg, setDesejoMsg] = useState("");
  const [naoQueroTirar, setNaoQueroTirar] = useState("");
  const [naoQueroMsg, setNaoQueroMsg] = useState("");
  const [editandoDesejo, setEditandoDesejo] = useState(false);

  // Recupera login salvo
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(groupCode));
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setUsuario(user);
        setDesejo(user.desejo || "");
        onLogin({ nome: user.nome, isAdmin: !!user.isAdmin, id: user.id });
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line
  }, [groupCode]);

  useEffect(() => {
    if (usuario && grupo?.sorteio == null) {
      // espaço pra futuras persistências
    }
  }, [usuario, groupCode, grupo?.sorteio]);

  // Premium
  const handleSalvarNaoQuero = async () => {
    if (!naoQueroTirar) return;
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: groupCode,
        userId: usuario.id,
        blockedId: naoQueroTirar,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error) {
      setNaoQueroMsg("Erro: " + data.error);
      console.error("Stripe error:", data.error);
    }
  };

  // Cadastro
  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!nome.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }
    const existentes = await buscarParticipantePorNome(groupCode, nome.trim());
    if (existentes.length > 0) {
      setErro("Nome já cadastrado no grupo.");
      return;
    }
    await addParticipante(groupCode, nome.trim(), senha.trim());
    setNome("");
    setSenha("");
    setErro("Participante cadastrado!");
    atualizarGrupo();
  }

  // Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const encontrados = await buscarParticipantePorNomeSenha(
      groupCode,
      nome.trim(),
      senha
    );
    if (!encontrados.length) {
      setErro("Nome ou senha inválidos.");
      return;
    }
    const p: { id: string; nome: string; isAdmin: boolean; desejo?: string; blockedId?: string } = {
      id: encontrados[0].id,
      nome: "nome" in encontrados[0] ? (encontrados[0].nome as string) : "",
      isAdmin: "isAdmin" in encontrados[0] ? !!encontrados[0].isAdmin : false,
      desejo: "desejo" in encontrados[0] ? (encontrados[0].desejo as string) : undefined,
      blockedId: "blockedId" in encontrados[0] ? (encontrados[0].blockedId as string) : "",
    };
    setUsuario(p);
    setDesejo(p.desejo || "");
    localStorage.setItem(getStorageKey(groupCode), JSON.stringify(p));
    onLogin({ nome: p.nome, isAdmin: !!p.isAdmin, id: p.id });
  }

  // Desejo
  async function handleSalvarDesejo() {
    if (!usuario) return;
    await atualizarDesejo(groupCode, usuario.id, desejo);
    setDesejoMsg("Desejo salvo!");
    setTimeout(() => setDesejoMsg(""), 1500);
    atualizarGrupo();
    const userAtual = { ...usuario, desejo };
    setUsuario(userAtual);
    localStorage.setItem(getStorageKey(groupCode), JSON.stringify(userAtual));
  }

  // Amigo oculto
  let amigoOcultoId = "";
  let amigoObj: any = null;
  if (usuario && grupo?.sorteio) {
    amigoOcultoId = grupo.sorteio[usuario.id];
    if (amigoOcultoId) {
      amigoObj = participantes.find((p: any) => p.id === amigoOcultoId);
    }
  }

  // Sincroniza storage quando Firestore muda
  useEffect(() => {
    if (usuario && participantes.length) {
      const userFirestore = participantes.find((p: any) => p.id === usuario.id);
      if (userFirestore && JSON.stringify(userFirestore) !== JSON.stringify(usuario)) {
        setUsuario(userFirestore);
        setDesejo(userFirestore.desejo || "");
        localStorage.setItem(getStorageKey(groupCode), JSON.stringify(userFirestore));
      }
    }
    // eslint-disable-next-line
  }, [participantes]);

  useEffect(() => {
    atualizarGrupo();
  }, []);

  return (
    <div className="mt-4 sm:mt-8">
      {!usuario && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-primary">
          Faça seu login para verificar o status do amigo secreto e o seu amigo oculto.
        </div>
      )}

      {/* Nav em pills */}
      <div className="mb-5 inline-flex w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
        {usuario?.isAdmin && !grupo.sorteio && (
          <button
            className={`flex-1 px-4 py-2 text-sm md:text-base transition ${
              tab === "cadastrar"
                ? "bg-primary text-white"
                : "bg-transparent hover:bg-slate-50 text-slate-600"
            }`}
            onClick={() => setTab("cadastrar")}
          >
            Cadastrar
          </button>
        )}
        <button
          className={`flex-1 px-4 py-2 text-sm md:text-base transition ${
            tab === "login"
              ? "bg-primary text-white"
              : "bg-transparent hover:bg-slate-50 text-slate-600"
          }`}
          onClick={() => setTab("login")}
        >
          Login
        </button>
      </div>

      {/* Formulários */}
      {tab === "cadastrar" ? (
        <form
          className="space-y-4 rounded-2xl border bg-white p-4 sm:p-6 shadow-sm"
          onSubmit={handleCadastrar}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Seu nome</label>
            <Input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <Input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
          </div>
          {erro && <div className="text-sm text-red-600">{erro}</div>}
          <Button className="w-full py-2 text-base rounded-xl">Cadastrar</Button>
        </form>
      ) : !usuario ? (
        <form
          className="space-y-4 rounded-2xl border bg-white p-4 sm:p-6 shadow-sm"
          onSubmit={handleLogin}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Seu nome</label>
            <Input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <Input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
          </div>
          {erro && <div className="text-sm text-red-600">{erro}</div>}
          <Button className="w-full py-2 text-base rounded-xl">Entrar</Button>
        </form>
      ) : (
        <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
          {/* Cabeçalho do usuário */}
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white font-semibold">
              {usuario?.nome?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="leading-tight">
              <div className="text-base sm:text-lg font-semibold text-slate-900">Olá, {usuario.nome}!</div>
              {usuario?.isAdmin && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <ShieldCheck size={14} /> admin do grupo
                </div>
              )}
            </div>
          </div>

          {/* Desejo */}
          <div className="mt-3 rounded-xl border bg-slate-50 p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <Gift size={18} className="text-primary" />
              <label className="font-semibold">O que você quer ganhar?</label>
            </div>

            {!editandoDesejo && desejo && (
              <div className="flex items-center gap-2">
                <span className="text-slate-800">{desejo}</span>
                <button
                  className="rounded p-1 hover:bg-white"
                  onClick={() => setEditandoDesejo(true)}
                  title="Editar desejo"
                  type="button"
                >
                  <Pencil size={18} />
                </button>
              </div>
            )}

            {(editandoDesejo || !desejo) && (
              <div className="flex items-center gap-2">
                <Input
                  value={desejo}
                  onChange={e => setDesejo(e.target.value)}
                  placeholder="Ex: Um livro, chocolate..."
                  className="w-full"
                />
                <Button
                  onClick={async () => {
                    await handleSalvarDesejo();
                    setEditandoDesejo(false);
                  }}
                  type="button"
                  className="rounded-xl"
                >
                  Salvar
                </Button>
                {editandoDesejo && (
                  <button
                    className="rounded p-1 hover:bg-white"
                    onClick={() => setEditandoDesejo(false)}
                    title="Cancelar"
                    type="button"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {desejoMsg && <div className="mt-1 text-sm text-green-700">{desejoMsg}</div>}
          </div>

          {/* Preferência premium */}
          {grupo.sorteio == null && !usuario?.blockedId && (
            <div className="mt-4 rounded-xl border bg-gradient-to-br from-amber-50 to-rose-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-800">
                <Lock size={18} />
                <span className="font-semibold">Preferência Premium</span>
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  opcional
                </span>
              </div>

              <label className="mb-1 block text-sm font-medium text-slate-700">
                Quem você <b>não</b> quer tirar?
              </label>
              <select
                className="w-full rounded-lg border bg-white px-3 py-2 text-base"
                value={naoQueroTirar}
                onChange={e => setNaoQueroTirar(e.target.value)}
              >
                <option value="">Selecione…</option>
                {participantes
                  .filter(p => p.id !== usuario.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
              </select>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  className="rounded-xl"
                  type="button"
                  onClick={handleSalvarNaoQuero}
                  disabled={!naoQueroTirar}
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  Comprar preferência
                </Button>
                {naoQueroMsg && <div className="text-sm text-green-700">{naoQueroMsg}</div>}
              </div>
            </div>
          )}

          {usuario?.blockedId && (
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-blue-800">
              Sua preferência premium: você não tirará{" "}
              <b>{participantes.find(p => p.id === usuario.blockedId)?.nome || "participante desconhecido"}</b>.
            </div>
          )}

          {/* Amigo oculto */}
          <div className="mt-4 rounded-xl border bg-white p-3 sm:p-4">
            <div className="mb-2 font-semibold">Seu amigo secreto</div>
            {grupo.sorteio ? (
              <div className="space-y-2">
                <div className="text-slate-900">
                  {amigoObj
                    ? <span className="font-semibold">{amigoObj.nome}</span>
                    : grupo.sorteio[usuario.id] === undefined
                      ? "Você não participou do sorteio."
                      : "Ainda não definido para você."}
                </div>

                {amigoObj && (
                  <div className="text-sm text-slate-600">
                    {amigoObj.desejo
                      ? <>Desejo: <b>{amigoObj.desejo}</b></>
                      : "O amigo secreto ainda não informou o que gostaria de ganhar."}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-600">O sorteio ainda não foi realizado.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
