import type { WaterBlock } from "@/types/block";

export const mockBlocks: WaterBlock[] = [
  {
    id: "A",
    nivel: 82,
    profundidade: 164,
    tendencia: "Estável",
    autonomia: "28h",
    atualizacao: "Agora",
    alerta: "Operação normal",
    historico: [],
  },

  {
    id: "B",
    nivel: 48,
    profundidade: 96,
    tendencia: "Caindo",
    autonomia: "11h",
    atualizacao: "2 min",
    alerta: "Consumo acima do padrão",
    historico: [],
  },

  {
    id: "C",
    nivel: 31,
    profundidade: 62,
    tendencia: "Caindo",
    autonomia: "4h",
    atualizacao: "1 min",
    alerta: "Risco de falta d’água",
    historico: [],
  },

  {
    id: "D",
    nivel: 74,
    profundidade: 148,
    tendencia: "Subindo",
    autonomia: "25h",
    atualizacao: "Agora",
    alerta: "Recuperação operacional",
    historico: [],
  },

  {
    id: "E",
    nivel: 63,
    profundidade: 126,
    tendencia: "Estável",
    autonomia: "18h",
    atualizacao: "5 min",
    alerta: "Operação estável",
    historico: [],
  },

  {
    id: "F",
    nivel: 88,
    profundidade: 176,
    tendencia: "Estável",
    autonomia: "32h",
    atualizacao: "Agora",
    alerta: "Reservatório seguro",
    historico: [],
  },
];