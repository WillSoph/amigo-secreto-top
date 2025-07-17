import { db } from "./firebase";
import { setDoc, doc, Timestamp, getDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

interface CriarGrupoComAdminParams {
  codigo: string;
  nome: string;
  descricao?: string;
  adminNome: string;
  adminSenha: string;
}

export async function criarGrupoComAdmin({ codigo, nome, descricao, adminNome, adminSenha }: CriarGrupoComAdminParams) {
    // 1. Cria o grupo
    const adminUid = uuidv4(); // Gere um id único para o admin
    await setDoc(doc(db, "groups", codigo), {
      codigo,
      nome,
      descricao: descricao || null,
      adminUid,
      sorteio: null,
      pagos: [],
      createdAt: Timestamp.now(),
    });

    // 2. Cria o admin na subcoleção participants
  await setDoc(doc(db, "groups", codigo, "participants", adminUid), {
    nome: adminNome,
    senha: adminSenha,
    isAdmin: true,
    desejo: "",
  });

  // 3. Retorne o adminUid para fazer login automático, se quiser
  return adminUid;
}

// Buscar grupo
export async function getGrupoByCodigo(codigo: string) {
    const snap = await getDoc(doc(db, "groups", codigo));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }
  
  // Atualizar nome
  export async function atualizarNomeGrupo(codigo: string, nome: string) {
    await updateDoc(doc(db, "groups", codigo), { nome });
  }
  
  // Deletar grupo
  export async function removerGrupo(codigo: string) {
    await deleteDoc(doc(db, "groups", codigo));
  }
  
  // Rodar sorteio
  export async function rodarSorteioGrupo(groupCode: string) {
    const snapshot = await getDocs(collection(db, "groups", groupCode, "participants"));
    const participantes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    if (participantes.length < 2) throw new Error("Precisa de pelo menos 3 participantes!");
  
    // Embaralha:
    const sorteio: Record<string, string> = {};
    const list = [...participantes];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    // Atribui
    for (let i = 0; i < list.length; i++) {
      sorteio[list[i].id] = list[(i + 1) % list.length].id;
    }
    // Salva no grupo
    await updateDoc(doc(db, "groups", groupCode), { sorteio });
  }
  
  // Resetar grupo
  export async function resetarGrupo(groupCode: string) {
    const col = collection(db, "groups", groupCode, "participants");
    const snapshot = await getDocs(col);
    // Filtra só quem NÃO é admin
    const participantes = snapshot.docs.filter(doc => !doc.data().isAdmin);
    for (const docu of participantes) {
      await deleteDoc(docu.ref);
    }
    await updateDoc(doc(db, "groups", groupCode), { sorteio: null });
  }
