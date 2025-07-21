// components/PoliticaPrivacidadeModal.tsx
"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PoliticaPrivacidadeModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="hover:underline text-secondary transition-colors duration-200"
          onClick={() => setOpen(true)}
        >
          Política de Privacidade
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Política de Privacidade</DialogTitle>
        </DialogHeader>
        <div className="text-base text-gray-800 space-y-4 pt-2">
          <p>
            Este site respeita e protege a sua privacidade. Não coletamos dados pessoais sensíveis, como e-mail ou telefone, para uso dos grupos de amigo secreto. As informações fornecidas pelos usuários são utilizadas exclusivamente para a organização dos grupos e realização dos sorteios. Nenhuma informação é compartilhada com terceiros.
          </p>
          <p>
            Os dados são armazenados de forma segura no banco de dados e podem ser removidos a qualquer momento mediante solicitação. Ao utilizar este site, você concorda com a nossa política de privacidade e uso de cookies estritamente necessários para o funcionamento da aplicação.
          </p>
        </div>
        <div className="pt-4 flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
