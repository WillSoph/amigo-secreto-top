/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  addParticipante,
  buscarParticipantePorNome,
  buscarParticipantePorNomeSenha,
  atualizarDesejo
} from "@/services/participant";

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

  // Recupera login salvo ao montar
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(groupCode));
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setUsuario(user);
        setDesejo(user.desejo || "");
        // Já chama onLogin para manter sincronizado acima
        onLogin({ nome: user.nome, isAdmin: !!user.isAdmin, id: user.id });
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line
  }, [groupCode]);

  useEffect(() => {
    if (usuario && grupo?.sorteio == null) {
      // Carregue se quiser persistir depois
      // const saved = window.localStorage.getItem(`naoQueroTirar_${groupCode}_${usuario.id}`);
      // if (saved) setNaoQueroTirar(saved);
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
    atualizarGrupo();
    setErro("Participante cadastrado! Agora faça login.");
    setTab("login");
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
    const p: { id: string; nome: string; isAdmin: boolean; desejo?: string } = {
      id: encontrados[0].id,
      nome: 'nome' in encontrados[0] ? (encontrados[0].nome as string) : "",
      isAdmin: 'isAdmin' in encontrados[0] ? !!encontrados[0].isAdmin : false,
      desejo: 'desejo' in encontrados[0] ? (encontrados[0].desejo as string) : undefined,
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

    // Atualiza desejo salvo do usuário no storage (caso usuário atualize o desejo)
    const userAtual = { ...usuario, desejo };
    setUsuario(userAtual);
    localStorage.setItem(getStorageKey(groupCode), JSON.stringify(userAtual));
  }

  // Amigo oculto
  let amigoOcultoId = "";
  let amigoObj: any = null;

  if (usuario && grupo?.sorteio) {
    amigoOcultoId = grupo.sorteio[usuario.id]; // undefined se não sorteou
    if (amigoOcultoId) {
      amigoObj = participantes.find((p: any) => p.id === amigoOcultoId);
    }
  }

  return (
    <div className="mt-6 sm:mt-10">
      {!usuario && (
        <div className="mb-3 text-primary font-medium text-sm md:text-base">
          Faça seu login para verificar o status do amigo secreto e o seu amigo oculto.
        </div>
      )}
      {/* Tabs */}
      <div className="flex w-full border-b mb-5">
        {usuario?.isAdmin && !grupo.sorteio && (
          <button
            className={`flex-1 cursor-pointer px-3 py-2 text-sm md:text-base transition border-b-2 ${
              tab === "cadastrar"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-slate-500"
            }`}
            onClick={() => setTab("cadastrar")}
          >
            Cadastrar
          </button>
        )}
        <button
          className={`flex-1 cursor-pointer px-3 py-2 text-sm md:text-base transition border-b-2 ${
            tab === "login"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-slate-500"
          }`}
          onClick={() => setTab("login")}
        >
          Login
        </button>
      </div>


      {/* Formulário */}
      {tab === "cadastrar" ? (
        <form className="space-y-4" onSubmit={handleCadastrar}>
          <Input
            placeholder="Seu nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full"
          />
          <Input
            placeholder="Senha"
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="w-full"
          />
          {erro && <div className="text-red-500 text-sm">{erro}</div>}
          <Button className="w-full py-2 text-base rounded-lg">Cadastrar</Button>
        </form>
      ) : !usuario ? (
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            placeholder="Seu nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full"
          />
          <Input
            placeholder="Senha"
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="w-full"
          />
          {erro && <div className="text-red-500 text-sm">{erro}</div>}
          <Button className="w-full py-2 text-base rounded-lg">Entrar</Button>
        </form>
      ) : (
        <div className="mt-4 bg-slate-100 rounded-xl p-4 sm:p-6 text-slate-700 shadow-sm">
          <div className="mb-2 text-base sm:text-lg">
            Olá, <b>{usuario.nome}</b>!
          </div>
          {/* Campo de desejo */}
          <div className="mt-4">
            <label className="font-semibold">O que você quer ganhar?</label>
            <Input
              value={desejo}
              onChange={e => setDesejo(e.target.value)}
              placeholder="Ex: Um livro, chocolate..."
              className="mt-1 w-full"
            />
            <Button
              onClick={handleSalvarDesejo}
              className="mt-2 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded"
              type="button"
            >
              Salvar
            </Button>
            {desejoMsg && <div className="text-green-700 mt-1">{desejoMsg}</div>}
          </div>
          {/* Preferência premium */}
          {grupo.sorteio == null && (
            <div className="mt-4">
              <label className="font-semibold block mb-1">
                Quem você NÃO quer tirar? <span className="text-xs text-slate-400">(Premium)</span>
              </label>
              <select
                className="w-full border rounded px-2 py-2 bg-white text-base"
                value={naoQueroTirar}
                onChange={e => setNaoQueroTirar(e.target.value)}
              >
                <option value="">Selecione...</option>
                {participantes
                  .filter(p => p.id !== usuario.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
              </select>
              <Button
                className="mt-2 w-full sm:w-auto px-4 py-2 bg-primary text-white rounded"
                type="button"
                onClick={handleSalvarNaoQuero}
                disabled={!naoQueroTirar}
              >
                Comprar preferência (Premium)
              </Button>
              {naoQueroMsg && <div className="text-green-700 mt-1">{naoQueroMsg}</div>}
            </div>
          )}
          {/* Amigo oculto */}
          {grupo.sorteio ? (
            <div className="mt-4">
              <div>
                Seu amigo secreto é:{" "}
                <span className="font-semibold">
                  {amigoObj
                    ? amigoObj.nome
                    : grupo.sorteio[usuario.id] === undefined
                      ? "Você não participou do sorteio."
                      : "Ainda não definido para você."}
                </span>
              </div>
              {/* Só mostra o desejo se encontrou o amigoObj */}
              {amigoObj ? (
                <div>
                  {amigoObj.desejo ? (
                    <span className="text-slate-700">
                      Desejo: <b>{amigoObj.desejo}</b>
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      O amigo secreto ainda não informou o que gostaria de ganhar.
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-2">O sorteio ainda não foi realizado.</div>
          )}


        </div>
      )}
    </div>
  );
}
