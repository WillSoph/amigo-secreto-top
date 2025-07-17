import { useEffect, useState } from "react";
import { db } from "@/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useGrupo(groupCode: string) {
  const [grupo, setGrupo] = useState<unknown>(null);
  useEffect(() => {
    if (!groupCode) return;
    const ref = doc(db, "groups", groupCode);
    const unsub = onSnapshot(ref, (snapshot) => {
      setGrupo(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
    });
    return () => unsub();
  }, [groupCode]);
  return grupo;
}
