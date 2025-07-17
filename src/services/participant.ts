import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, updateDoc, query, where, deleteDoc  } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export async function addParticipante(grupoCodigo: string, nome: string, senha: string) {
  const participanteId = uuidv4();
  await setDoc(doc(db, "groups", grupoCodigo, "participants", participanteId), {
    nome,
    senha,
    desejo: "",
    isAdmin: false,
  });
}

export async function getParticipantes(groupCode: string) {
    const ref = collection(db, "groups", groupCode, "participants");
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

export async function buscarParticipantePorNome(grupoCodigo: string, nome: string) {
  const q = query(
    collection(db, "groups", grupoCodigo, "participants"),
    where("nome", "==", nome)
  );
  const snaps = await getDocs(q);
  return snaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function buscarParticipantePorNomeSenha(grupoCodigo: string, nome: string, senha: string) {
  const q = query(
    collection(db, "groups", grupoCodigo, "participants"),
    where("nome", "==", nome),
    where("senha", "==", senha)
  );
  const snaps = await getDocs(q);
  return snaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function atualizarDesejo(grupoCodigo: string, participanteId: string, desejo: string) {
  await updateDoc(doc(db, "groups", grupoCodigo, "participants", participanteId), { desejo });
}

export async function removeParticipanteFirestore(groupCode: string, participanteId: string) {
    await deleteDoc(doc(db, "groups", groupCode, "participants", participanteId));
  }
