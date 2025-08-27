/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "./ui/button";
import { X, Crown } from "lucide-react";

type Props = {
  participantes: any[];
  isAdmin: boolean;
  onRemove: (id: string) => void;
  sorteioRealizado?: boolean;
};

export default function GroupParticipants({
  participantes,
  isAdmin,
  onRemove,
  sorteioRealizado,
}: Props) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">Participantes</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          {participantes.length} {participantes.length === 1 ? "pessoa" : "pessoas"}
        </span>
      </div>

      <ul className="flex flex-col gap-3 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pr-1">
        {participantes.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-300 bg-white py-8 text-center text-slate-400 shadow-sm">
            Nenhum participante ainda
          </li>
        )}

        {participantes.map((p) => {
          const initial = (p?.nome?.[0] || "?").toUpperCase();
          return (
            <li
              key={p.id}
              className="group flex items-center justify-between gap-3 rounded-2xl border bg-white px-3 py-3 shadow-sm transition hover:shadow-md md:px-4"
            >
              {/* Esquerda: avatar + nome + (admin) */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary text-white font-semibold shadow-sm ring-4 ring-primary/10 md:h-9 md:w-9">
                  {initial}
                </div>

                <div className="min-w-0 flex items-center gap-2">
                  <span className="truncate text-sm md:text-[13px] font-semibold text-slate-900">
                    {p.nome}
                  </span>

                  {p.isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                      <Crown size={12} /> admin
                    </span>
                  )}
                </div>
              </div>

              {/* Remover (somente admin, sem sorteio e não remove admin) */}
              {isAdmin && !p.isAdmin && !sorteioRealizado && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2 flex-shrink-0 rounded-full hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remover ${p.nome}`}
                  title={`Remover ${p.nome}`}
                  onClick={() => onRemove(p.id)}
                >
                  <X size={18} />
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
