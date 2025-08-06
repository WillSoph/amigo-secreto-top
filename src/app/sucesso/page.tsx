"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

// =====================
// MODAL PARA ACESSAR GRUPO
// =====================
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
          className="bg-white text-primary border-primary font-semibold rounded-xl shadow"
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
              onChange={e => setCodigo(e.target.value)}
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

export default function Sucesso() {
  const router = useRouter();

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
        <div className="relative z-10 px-5 w-full max-w-2xl flex flex-col items-center gap-4 md:gap-8">
          <Image
            src="/amigo-secreto-top-logo.png"
            alt="Logo Amigo Secreto Top"
            width={160}
            height={48}
            className="drop-shadow-lg mb-2"
            priority
          />
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight text-center">
            Escolha registrada com sucesso!
          </h1>
          <p className="text-base md:text-xl text-white/90 max-w-lg drop-shadow text-center">
            Sua preferência premium foi processada.<br />
            Agora é só voltar ao seu grupo e aproveitar a brincadeira com ainda mais diversão e tranquilidade.<br />
            Obrigado por usar o <b>Amigo Secreto Top</b>!
          </p>
          <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            className=" bg-secondary text-foreground hover:bg-primary hover:text-white font-semibold rounded-xl shadow"
            size="lg"
            onClick={() => router.push("/")}
          >
            Voltar para a página inicial
          </Button>
          <AcessarGrupoModal />
          </div>
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
            amigosecretotop &copy; {new Date().getFullYear()} - Amigo Secreto Online
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
