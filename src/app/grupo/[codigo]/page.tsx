/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import GroupParticipants from "@/components/GroupParticipants";
import GroupTabs from "@/components/GroupTabs";
import {
  atualizarNomeGrupo,
  removerGrupo,
  resetarGrupo,
  rodarSorteioGrupo,
} from "@/services/group";
import { removeParticipanteFirestore } from "@/services/participant";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParticipantes } from "@/hooks/useParticipants";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useGrupo } from "@/hooks/useGrupo";

function algumPremium(participantes: any[]) {
  return participantes.some(p => !!p.blockedId);
}
function usuarioEhPremium(participantes: any[], userId: string) {
  const user = participantes.find(p => p.id === userId);
  return !!user?.blockedId;
}

const STORAGE_KEY = "amigosecreto:user";

type Participante = {
  id: string;
  nome: string;
  isAdmin?: boolean;
  desejo?: string;
  blockedId?: string;
  [key: string]: any; // Se quiser permitir outros campos
};


export default function GrupoPage({ params }: { params: Promise<{ codigo: string }> }) {
  // Unwrap o param
  const { codigo } = use(params);

  const [editNome, setEditNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [usuarioLogado, setUsuarioLogadoState] = useState<Participante | null>(null);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [participantToRemoveName, setParticipantToRemoveName] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Dialog states
  const [dialogSorteioOpen, setDialogSorteioOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [dialogResetOpen, setDialogResetOpen] = useState(false);
  const [dialogBlockedOpen, setDialogBlockedOpen] = useState(false);

  const [blockedName, setBlockedName] = useState<string>("");

  const router = useRouter();
  const participantes = useParticipantes(codigo) as Participante[];

  const grupo = useGrupo(codigo) as { nome?: string; sorteio?: boolean }; // Define the expected shape of grupo

  console.log("copied: ", copied);

  // Persiste login no storage ao logar
  const setUsuarioLogado = useCallback((user: any) => {
    setUsuarioLogadoState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Recupera login salvo ao montar
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUsuarioLogadoState(JSON.parse(savedUser));
    }
  }, [setUsuarioLogado]);

  function handleLogout() {
    // Remover storage de todos os grupos
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("amigosecreto:user")) {
        localStorage.removeItem(key);
      }
    });
    setUsuarioLogado(null);
    router.push("/");
  }

  const handleSalvarNome = async () => {
    if (!usuarioLogado?.isAdmin) return;
    await atualizarNomeGrupo(codigo, novoNome);
    setEditNome(false);
    toast.success("Nome do grupo atualizado!");
  };

  // Tentativa de remover participante
  const handleRemoveParticipante = async (id: string) => {
    if (!usuarioLogado?.isAdmin) return;

    // Checa premium
    if (usuarioEhPremium(participantes, id)) {
      const nome = participantes.find(p => p.id === id)?.nome || "";
      setBlockedName(nome);
      setDialogBlockedOpen(true);
      return;
    }

    // Dialog de remoção
    const nome = participantes.find(p => p.id === id)?.nome || "";
    setParticipantToRemove(id);
    setParticipantToRemoveName(nome);
  };

  // Remover grupo (Dialog)
  const handleRemoverGrupo = async () => {
    setDialogDeleteOpen(true);
  };

  // Confirma exclusão real
  const handleDeleteConfirm = async () => {
    await removerGrupo(codigo);
    window.location.href = "/";
  };

  // Agora resetar grupo com dialog!
  const handleResetarGrupo = () => {
    setDialogResetOpen(true);
  };
  const handleResetConfirm = async () => {
    setDialogResetOpen(false);
    await resetarGrupo(codigo);
    toast.success("Grupo resetado!", { description: "Todos os participantes e o sorteio foram apagados." });
  };

  const handleConfirmSorteio = async () => {
    setDialogSorteioOpen(false);
    try {
      await rodarSorteioGrupo(codigo);
      toast.success("Sorteio realizado!", {
        description: "Os participantes já podem conferir seu amigo secreto.",
        className: "bg-green-600 text-white" // toast de sucesso verde
      });
    } catch (error: any) {
      toast.error("Erro ao sortear!", {
        description: error?.message || "Houve um problema ao sortear o grupo.",
        action: { label: "Ok", onClick: () => {} }
      });
    }
  };

  function handleCopy() {
    navigator.clipboard.writeText(codigo);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <main className="bg-background min-h-screen">
      {/* Dialog: Remover participante */}
      <Dialog open={!!participantToRemove} onOpenChange={() => setParticipantToRemove(null)}>
        <DialogContent>
          <DialogHeader>Remover participante</DialogHeader>
          <DialogTitle>
            Tem certeza que deseja remover <b>{participantToRemoveName}</b> do grupo?
          </DialogTitle>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setParticipantToRemove(null)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={async () => {
                if (participantToRemove) {
                  await removeParticipanteFirestore(codigo, participantToRemove);
                  setParticipantToRemove(null);
                }
              }}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Rodar sorteio */}
      <Dialog open={dialogSorteioOpen} onOpenChange={setDialogSorteioOpen}>
        <DialogContent>
          <DialogHeader>Confirmar sorteio</DialogHeader>
          <DialogTitle>Deseja realmente rodar o sorteio? Essa ação não poderá ser desfeita!</DialogTitle>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogSorteioOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSorteio} variant="default">
              Sim, sortear!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir grupo */}
      <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
        <DialogContent>
          <DialogHeader>Excluir grupo</DialogHeader>
          <DialogTitle>
            Tem certeza que deseja excluir o grupo?
          </DialogTitle>
          {algumPremium(participantes) && (
            <div className="mt-2 text-red-600 font-medium">
              Atenção: Este grupo possui participantes que já pagaram pelo recurso premium.<br/>
              Ao excluir, você perderá todos os registros dessas compras.
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="destructive"
            >
              Excluir grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Resetar grupo */}
      <Dialog open={dialogResetOpen} onOpenChange={setDialogResetOpen}>
        <DialogContent>
          <DialogHeader>Resetar grupo</DialogHeader>
          <DialogTitle>
            Tem certeza que deseja resetar o grupo? <br />
            <span className="text-sm text-slate-600 font-normal">
              Isso irá apagar <b>todos os participantes</b> e o resultado do sorteio.
            </span>
          </DialogTitle>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogResetOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleResetConfirm}
              variant="destructive"
            >
              Resetar grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Usuário premium não pode ser deletado */}
      <Dialog open={dialogBlockedOpen} onOpenChange={setDialogBlockedOpen}>
        <DialogContent>
          <DialogHeader>Participante Premium</DialogHeader>
          <DialogTitle>
            Não é possível remover o participante <b>{blockedName}</b> porque ele já ativou o recurso premium!
          </DialogTitle>
          <DialogFooter>
            <Button variant="default" onClick={() => setDialogBlockedOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ...Restante do seu código (Header, etc) */}
      <Header onLogout={handleLogout} />
      <section className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          {/* Título e código */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              {editNome ? (
                <>
                  <input
                    value={novoNome}
                    onChange={e => setNovoNome(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <Button size="sm" onClick={handleSalvarNome}>Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditNome(false)}>Cancelar</Button>
                </>
              ) : (
                <>
                  <h1 className="text-xl md:text-2xl font-bold text-primary break-words max-w-xs md:max-w-md">{grupo?.nome || "Grupo não encontrado"}</h1>
                  {usuarioLogado?.isAdmin && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => { setEditNome(true); setNovoNome(grupo?.nome || "") }}>
                        <Pencil size={18} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleRemoverGrupo}>
                        <Trash size={18} />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center justify-between bg-[#ffdfab] rounded px-4 py-2 font-mono shadow-inner select-all">
              <span className="text-base font-semibold text-[#383838]">Código: <span className="font-bold text-lg">{codigo}</span></span>
              <button
                className="ml-3 p-1 rounded hover:bg-[#ffe5c1] active:bg-[#ffd07a]"
                onClick={handleCopy}
                aria-label="Copiar código"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          {/* Participantes */}
          <GroupParticipants
            participantes={participantes}
            isAdmin={usuarioLogado?.isAdmin === true}
            onRemove={handleRemoveParticipante}
            sorteioRealizado={grupo?.sorteio || false}
          />

          {/* Ações do admin */}
          {usuarioLogado?.isAdmin && (
            <div className="flex gap-4 mb-8 mt-6 flex-col sm:flex-row">
              <Button
                className="flex-1 btn-primary"
                onClick={handleResetarGrupo}
                disabled={false}
                title={grupo?.sorteio ? "Resete o grupo para poder rodar novamente." : ""}
              >
                Resetar Grupo
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => setDialogSorteioOpen(true)}
                disabled={!!grupo?.sorteio}
                title={grupo?.sorteio ? "Sorteio já realizado" : ""}
              >
                Rodar Sorteio
              </Button>
            </div>
          )}


          {/* Tabs e área do usuário */}
          {grupo && (
            <GroupTabs
              groupCode={codigo}
              grupo={grupo}
              participantes={participantes}
              atualizarGrupo={() => {}} // Não precisa mais!
              onLogin={setUsuarioLogado}
            />
          )}
        </div>
      </section>
    </main>
  );
}
