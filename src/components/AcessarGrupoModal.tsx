// components/AcessarGrupoModal.tsx
"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function AcessarGrupoModal() {
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
          className="ml-0 md:ml-4 mt-2 md:mt-0 bg-white text-primary border-primary font-semibold rounded-xl shadow"
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
              onChange={e => setCodigo(e.target.value)}
              placeholder="Ex: QWERTY"
              required
              autoFocus
            />
          </div>
          {erro && <div className="text-red-500 text-sm">{erro}</div>}
          <Button type="submit" className="w-full btn-tertiary mt-2">
            Acessar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
