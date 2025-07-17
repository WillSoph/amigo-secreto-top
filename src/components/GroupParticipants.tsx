import { Button } from "./ui/button";
import { X } from "lucide-react";

// Estilos customizados para scrollbar suave
const scrollbarClass =
  "scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400";

type Props = {
  participantes: any[];
  isAdmin: boolean;
  onRemove: (id: string) => void;
  sorteioRealizado?: boolean;
};

export default function GroupParticipants({ participantes, isAdmin, onRemove, sorteioRealizado }: Props) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold mb-3 text-lg md:text-xl">Participantes</h2>
      <ul className="flex flex-col gap-3 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        {participantes.length === 0 && (
          <li className="text-slate-400 text-center py-6 rounded-lg bg-slate-50 shadow-inner">
            Nenhum participante ainda
          </li>
        )}
        {participantes.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 shadow-sm transition gap-3 md:px-4 md:py-3"
          >
            <span className="flex items-center gap-3 min-w-0">
              {/* Avatar e nome */}
              <span className="bg-primary text-white font-bold flex items-center justify-center rounded-full w-10 h-10 text-base md:w-8 md:h-8 md:text-sm flex-shrink-0">
                {p.nome[0]}
              </span>
              <span className="truncate font-medium text-base md:text-sm">{p.nome}</span>
              {p.isAdmin && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-200 text-blue-800 rounded font-semibold">
                  admin
                </span>
              )}
            </span>
            {/* Só mostra botão se não houve sorteio */}
            {isAdmin && !p.isAdmin && !sorteioRealizado && (
              <Button
                size="icon"
                variant="ghost"
                className="ml-2 flex-shrink-0"
                aria-label={`Remover ${p.nome}`}
                onClick={() => onRemove(p.id)}
              >
                <X size={18} />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
