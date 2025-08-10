"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { criarGrupoComAdmin } from "@/services/group";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { gerarCodigoGrupo } from "@/utils/localGroup";

import Image from "next/image";
import { Depoimento } from "@/components/Depoimento";
import { PoliticaPrivacidadeModal } from "@/components/PoliticaPrivacidadeModal";

/* =====================
   MODAL: ACESSAR GRUPO
===================== */
function AcessarGrupoModal() {
  const [open, setOpen] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  function handleAcessar(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) {
      setErro("Digite o código do grupo.");
      return;
    }
    setErro(null);
    setOpen(false);
    router.push(`/grupo/${codigo.trim()}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white text-primary border-primary font-semibold rounded-2xl shadow"
          size="lg"
        >
          Acesse seu grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xs mx-auto">
        <DialogHeader>
          <DialogTitle>Acessar Grupo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAcessar} className="space-y-3">
          <div>
            <label className="font-semibold text-primary">Código do Grupo</label>
            <Input
              value={codigo}
              className="mt-1"
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: QWERTY"
              required
              autoFocus
            />
          </div>
          {erro && <div className="text-red-500 text-sm">{erro}</div>}
          <Button variant="default" type="submit" className="w-full mt-2">
            Acessar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* =====================
   DADOS DEPOIMENTOS
===================== */
const depoimentos = [
  {
    foto: "/depoimento1.png",
    nome: "Carla Mendonça",
    texto: "Amei! Organizei o amigo secreto da firma em minutos e foi tudo muito prático.",
  },
  {
    foto: "/depoimento2.png",
    nome: "Juliano Castro",
    texto: "Muito fácil de usar, sem precisar de cadastro! Todo mundo do grupo adorou.",
  },
];

/* =====================
   PÁGINA INICIAL
===================== */
export default function Home() {
  const router = useRouter();
  const [nomeCriador, setNomeCriador] = useState("");
  const [senhaCriador, setSenhaCriador] = useState("");
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const codigo = gerarCodigoGrupo();

    try {
      await criarGrupoComAdmin({
        codigo,
        nome: nomeGrupo || "Amigo Secreto Top",
        descricao,
        adminNome: nomeCriador.trim(),
        adminSenha: senhaCriador,
      });

      setLoading(false);
      setDialogOpen(false);
      router.push(`/grupo/${codigo}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErro(e.message || "Erro ao criar grupo.");
      } else {
        setErro("Erro ao criar grupo.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % depoimentos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="bg-background min-h-screen text-text">
      {/* ===================== HERO ===================== */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        {/* Imagem base */}
        <div className="absolute inset-0">
          <Image
            src="/hero-party.png"
            alt="Festa de amigos comemorando"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-secondary/50 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/40 blur-[100px]" />

        {/* Conteúdo */}
        <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-14 text-white text-center">
          {/* Mini-badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1 mb-4">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm">Sem cadastro • Sorteio seguro • Grátis</span>
          </div>

          {/* Logo */}
          <div className="mb-2 flex justify-center">
            <Image
              src="/amigo-secreto-top-logo.png"
              alt="Logo Amigo Secreto Top"
              width={180}
              height={54}
              className="drop-shadow-lg"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-md">
            Amigo Secreto Online <span className="text-secondary">divertido</span> e sem fricção
          </h1>

          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Crie o grupo, compartilhe o link e pronto. Todo mundo participa sem e-mail ou telefone.
          </p>

          {/* Chips */}
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {["Sorteio automático", "Sem cadastro", "Link compartilhável"].map((txt) => (
              <li
                key={txt}
                className="text-sm bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/30 text-white"
              >
                {txt}
              </li>
            ))}
          </ul>

          {/* Botões */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="rounded-2xl bg-secondary text-gray-900 px-5 py-3 font-semibold shadow-lg hover:-translate-y-[1px] hover:shadow-xl transition"
                  size="lg"
                >
                  Crie seu grupo agora
                </Button>
              </DialogTrigger>
              <DialogContent className=" w-full max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle>Crie seu grupo de Amigo Secreto</DialogTitle>
                </DialogHeader>
                <Card className="shadow-lg border-primary w-full">
                  <CardContent className="p-4 bg-white rounded">
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className="font-semibold text-primary">Seu Nome</label>
                        <Input
                          value={nomeCriador}
                          onChange={(e) => setNomeCriador(e.target.value)}
                          placeholder="Digite seu nome"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-primary">Sua Senha</label>
                        <Input
                          type="password"
                          value={senhaCriador}
                          onChange={(e) => setSenhaCriador(e.target.value)}
                          placeholder="Defina uma senha"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-primary">Nome do Grupo</label>
                        <Input
                          value={nomeGrupo}
                          onChange={(e) => setNomeGrupo(e.target.value)}
                          placeholder="Ex: Grupo dos Devs"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-primary">Descrição</label>
                        <Input
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          placeholder="Ex: Natal da firma, equipe remota, família, amigos..."
                        />
                      </div>
                      {erro && <div className="text-red-500 text-sm mb-2">{erro}</div>}
                      <Button
                        variant="default"
                        className="w-full mt-2"
                        disabled={
                          loading ||
                          !nomeCriador.trim() ||
                          !senhaCriador.trim() ||
                          !nomeGrupo.trim() ||
                          !descricao.trim()
                        }
                      >
                        {loading ? "Criando..." : "Criar grupo agora"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>

            <AcessarGrupoModal />
          </div>
        </div>
      </section>

      {/* ===================== PASSOS ===================== */}
      <section className="relative bg-secondary text-gray-900 pt-10 md:pt-16 pb-10 md:pb-16">
        {/* Wave no topo – mesma cor do fundo */}
        

        <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-center px-2 sm:px-0">
          <div>
            <h3 className="font-bold mb-1 text-lg md:text-xl text-primary">1. Criar o grupo</h3>
            <p>Basta escolher um nome, senha e descrição. O link é gerado na hora!</p>
          </div>
          <div>
            <h3 className="font-bold mb-1 text-lg md:text-xl text-primary">2. Compartilhar o link</h3>
            <p>Envie para WhatsApp, Telegram, e-mail ou como quiser!</p>
          </div>
          <div>
            <h3 className="font-bold mb-1 text-lg md:text-xl text-primary">3. Sorteio e revelação</h3>
            <p>Cada um faz login e descobre o seu amigo secreto. Simples e privado!</p>
          </div>
        </div>
      </section>

      {/* ===================== DEPOIMENTOS ===================== */}
      <section className="bg-white py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">O que estão dizendo…</h2>
          {/* Mobile: 1 depoimento com slide / Desktop: 2 lado a lado */}
          <div className="flex flex-col md:flex-row md:justify-center md:gap-8 items-center">
            {/* Mobile */}
            <div className="w-full md:hidden transition-all duration-300">
              <Depoimento {...depoimentos[idx]} />
            </div>
            {/* Desktop */}
            <div className="hidden md:flex md:gap-10 w-full justify-center">
              {depoimentos.map((dep, i) => (
                <Depoimento key={i} {...dep} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-primary text-white py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 px-2 sm:px-0">
          <div>
            amigosecretotop &copy; {new Date().getFullYear()} - Amigo Secreto Online
          </div>
          <div className="space-x-4">
            <PoliticaPrivacidadeModal />
            <a href="#" className="hover:underline text-secondary">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
