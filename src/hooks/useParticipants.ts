import { useEffect, useState } from "react";
import { db } from "@/services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export function useParticipantes(groupCode: string) {
  const [participantes, setParticipantes] = useState<any[]>([]);
  useEffect(() => {
    if (!groupCode) return;
    const ref = collection(db, "groups", groupCode, "participants");
    const unsub = onSnapshot(ref, (snapshot) => {
      setParticipantes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [groupCode]);
  return participantes;
}