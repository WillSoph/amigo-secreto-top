import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";

// Usar nome + grupo como email fake (ex: will-123456@amigosecreto.com)
export function makeFakeEmail(nome: string, codigoGrupo: string) {
  return `${nome.trim().toLowerCase().replace(/\s/g, "_")}-${codigoGrupo}@amigosecreto.com`;
}

export async function register(nome: string, senha: string, codigoGrupo: string) {
  const email = makeFakeEmail(nome, codigoGrupo);
  const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
  return userCredential.user;
}

export async function login(nome: string, senha: string, codigoGrupo: string) {
  const email = makeFakeEmail(nome, codigoGrupo);
  const userCredential = await signInWithEmailAndPassword(auth, email, senha);
  return userCredential.user;
}

export async function logout() {
  await signOut(auth);
}
