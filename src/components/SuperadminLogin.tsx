"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import bcrypt from "bcryptjs";

const ADMIN_USER_DOC = "superadmin";
const ADMIN_COLLECTION = "adminUsers";
const TOKEN_KEY = "superadmin_token_amigosecreto";

// Função para hash e para comparar senha
async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}
async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export default function SuperadminLogin({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<"cadastro" | "login" | "carregando">("carregando");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    // Verifica se existe admin cadastrado
    (async () => {
      const docSnap = await getDoc(doc(db, ADMIN_COLLECTION, ADMIN_USER_DOC));
      if (docSnap.exists()) {
        setStep("login");
      } else {
        setStep("cadastro");
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!senha.trim()) {
      setErro("Digite a senha.");
      return;
    }
    if (step === "cadastro") {
      const hash = await hashPassword(senha);
      await setDoc(doc(db, ADMIN_COLLECTION, ADMIN_USER_DOC), { senhaHash: hash });
      localStorage.setItem(TOKEN_KEY, "logado");
      onLogin();
    } else if (step === "login") {
      const docSnap = await getDoc(doc(db, ADMIN_COLLECTION, ADMIN_USER_DOC));
      if (!docSnap.exists()) {
        setErro("Admin não cadastrado.");
        setStep("cadastro");
        return;
      }
      const data = docSnap.data();
      if (await comparePassword(senha, data.senhaHash)) {
        localStorage.setItem(TOKEN_KEY, "logado");
        onLogin();
      } else {
        setErro("Senha incorreta.");
      }
    }
  }

  if (step === "carregando") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-5"
      >
        <h2 className="text-2xl font-bold text-center text-primary">
          {step === "cadastro" ? "Cadastrar Senha de Admin" : "Login Superadmin"}
        </h2>
        <Input
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          placeholder="Senha secreta"
          className="w-full"
        />
        {erro && <div className="text-red-500">{erro}</div>}
        <Button className="w-full" type="submit">
          {step === "cadastro" ? "Cadastrar" : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
