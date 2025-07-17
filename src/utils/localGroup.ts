// /utils/localGroup.ts

export type Participante = {
    nome: string;
    senha: string;
    isAdmin?: boolean;
    desejo?: string;
  };
  
  export type Grupo = {
    codigo: string;
    nome: string;
    descricao?: string;
    participantes: Participante[];
    sorteio?: { [nome: string]: string };
  };
  
  const LS_KEY = "grupos_amigo_secreto";
  
  export function getGrupos(): Grupo[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  }
  
  export function saveGrupos(grupos: Grupo[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(grupos));
  }
  
  export function getGrupoPorCodigo(codigo: string): Grupo | undefined {
    return getGrupos().find((g) => g.codigo === codigo);
  }
  
  export function addParticipante(codigo: string, participante: Participante) {
    const grupos = getGrupos();
    const idx = grupos.findIndex((g) => g.codigo === codigo);
    if (idx >= 0) {
      grupos[idx].participantes.push(participante);
      saveGrupos(grupos);
    }
  }
  
  export function removeParticipante(codigo: string, nome: string) {
    const grupos = getGrupos();
    const idx = grupos.findIndex((g) => g.codigo === codigo);
    if (idx >= 0) {
      grupos[idx].participantes = grupos[idx].participantes.filter((p) => p.nome !== nome);
      saveGrupos(grupos);
    }
  }
  
  export function atualizarNomeGrupo(codigo: string, nome: string) {
    const grupos = getGrupos();
    const idx = grupos.findIndex((g) => g.codigo === codigo);
    if (idx >= 0) {
      grupos[idx].nome = nome;
      saveGrupos(grupos);
    }
  }
  
  export function removerGrupo(codigo: string) {
    const grupos = getGrupos().filter((g) => g.codigo !== codigo);
    saveGrupos(grupos);
  }

  export function gerarCodigoGrupo(tamanho = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < tamanho; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  export function rodarSorteioGrupo(codigo: string) {
    const grupos = getGrupos();
    const grupo = grupos.find((g) => g.codigo === codigo);
    if (!grupo) return;
  
    const nomes = grupo.participantes.map((p) => p.nome);
    if (nomes.length < 2) return;
    let sorteados = [...nomes];
    const sorteio: { [nome: string]: string } = {};
  
    for (const nome of nomes) {
      let opcoes = sorteados.filter((n) => n !== nome && !Object.values(sorteio).includes(n));
      if (opcoes.length === 0) opcoes = sorteados.filter((n) => n !== nome);
      const escolhido = opcoes[Math.floor(Math.random() * opcoes.length)];
      sorteio[nome] = escolhido;
      sorteados = sorteados.filter((n) => n !== escolhido);
    }
  
    grupo.sorteio = sorteio;
    saveGrupos(grupos);
  }

  export function atualizarDesejoParticipante(codigo: string, nome: string, desejo: string) {
    const grupos = getGrupos();
    const grupo = grupos.find((g) => g.codigo === codigo);
    if (!grupo) return;
    const participante = grupo.participantes.find((p) => p.nome === nome);
    if (participante) {
      participante.desejo = desejo;
      saveGrupos(grupos);
    }
  }
  
  
  
  