"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarGrupoComAdmin } from "@/services/group";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { gerarCodigoGrupo } from "@/utils/localGroup";

import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [nomeCriador, setNomeCriador] = useState("");
  const [senhaCriador, setSenhaCriador] = useState("");
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="bg-background min-h-screen text-text">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-8">
        <div className="font-bold text-xl sm:text-2xl text-primary tracking-tight">
          amigosecretotop
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[450px] md:min-h-[560px] flex items-center justify-center overflow-hidden">
        {/* Imagem de fundo */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/hero-party.png"
            alt="Festa de amigos comemorando"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-[#ffb6b6]/60 md:bg-[#ffb6b6]/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/30 md:bg-black/40" />
        </div>
        {/* Conteúdo do Hero */}
        <div className="relative z-10 px-5 w-full max-w-2xl flex flex-col items-start gap-4 md:gap-7">
          {/* Logo */}
          <div className="mb-2">
            <Image
              src="/amigo-secreto-top-logo.png"
              alt="Logo Amigo Secreto Top"
              width={160}
              height={48}
              className="drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
            Amigo Secreto Online <span className="text-secondary">/ Amigo Oculto Online</span>
          </h1>
          <p className="text-base md:text-xl text-white/90 max-w-lg drop-shadow">
            Organize seu <strong>amigo secreto</strong> virtual em poucos cliques. Não é necessário cadastro, nem telefone, nem e-mail.
            <br className="hidden md:block" />
            Compartilhe o link do grupo e todos podem participar!
          </p>
          <ul className="text-white/90 text-sm md:text-base list-disc list-inside pl-2 space-y-1">
            <li>🎁 Sorteio automático e seguro</li>
            <li>🎄 Ideal para Natal, empresa, amigos e família</li>
            <li>🔒 Aqui as pessoas <b>NÃO PODEM</b> escolher quem querem tirar</li>
          </ul>
          {/* Botão que abre o Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="mt-2 bg-secondary text-foreground hover:bg-primary hover:text-white font-semibold rounded-xl shadow"
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
                      <Input value={nomeCriador} onChange={e => setNomeCriador(e.target.value)} placeholder="Digite seu nome" required />
                    </div>
                    <div>
                      <label className="font-semibold text-primary">Sua Senha</label>
                      <Input type="password" value={senhaCriador} onChange={e => setSenhaCriador(e.target.value)} placeholder="Defina uma senha" required />
                    </div>
                    <div>
                      <label className="font-semibold text-primary">Nome do Grupo</label>
                      <Input value={nomeGrupo} onChange={e => setNomeGrupo(e.target.value)} placeholder="Ex: Grupo dos Devs" required />
                    </div>
                    <div>
                      <label className="font-semibold text-primary">Descrição</label>
                      <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Natal da firma, equipe remota, família, amigos..." />
                    </div>
                    {erro && <div className="text-red-500 text-sm mb-2">{erro}</div>}
                    <Button
                      className="w-full btn-tertiary mt-2"
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
        </div>
      </section>

      {/* Passos */}
      <section className="bg-primary text-white py-10 md:py-16 mt-14">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-center px-2 sm:px-0">
          <div>
            <h3 className="font-bold mb-1 text-lg md:text-xl text-secondary">1. Criar o grupo</h3>
            <p>Basta escolher um nome, senha e descrição. O link é gerado na hora!</p>
          </div>
          <div>
            <h3 className="font-bold mb-1 text-lg md:text-xl text-secondary">2. Compartilhar o link</h3>
            <p>Envie para WhatsApp, Telegram, e-mail ou como quiser!</p>
          </div>
          <div>
            <h3 className="font-bold mb-1 text-lg md:text-xl text-secondary">3. Sorteio e revelação</h3>
            <p>Cada um faz login e descobre o seu amigo secreto. Simples e privado!</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 px-2 sm:px-0">
          <div>
            amigosecretotop &copy; {new Date().getFullYear()} <span className="text-secondary ml-2">- Amigo Secreto Online</span>
          </div>
          <div className="space-x-4">
            <a href="#" className="hover:underline text-secondary">Política de Privacidade</a>
            <a href="#" className="hover:underline text-secondary">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
