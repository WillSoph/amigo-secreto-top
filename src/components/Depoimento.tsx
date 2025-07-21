import Image from "next/image";

type DepoimentoProps = {
  foto: string;
  nome: string;
  texto: string;
};

export function Depoimento({ foto, nome, texto }: DepoimentoProps) {
  return (
    <div className="flex items-center gap-4 w-full max-w-md">
      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-4 border-secondary shadow-lg">
        <Image
          src={foto}
          alt={nome}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <div className="font-semibold text-primary mb-1">{nome}</div>
        <div className="text-gray-800 text-base">{texto}</div>
      </div>
    </div>
  );
}
