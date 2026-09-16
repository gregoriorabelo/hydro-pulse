export type Condominium = {
  id: string;
  name: string;
  city: string | null;
  cnpj: string | null;
  phone: string | null;
  responsibleName: string | null;
  address: string | null;
  blocksExpected: number | null;
  unitsExpected: number | null;
  reservoirsExpected: number | null;
  createdAt: string;
};

export type CondominiumInput = {
  name: string;
  city?: string | null;
  cnpj?: string | null;
  phone?: string | null;
  responsibleName?: string | null;
  address?: string | null;
  blocksExpected?: number | null;
  unitsExpected?: number | null;
  reservoirsExpected?: number | null;
};

export type Block = {
  id: string;
  condominiumId: string;
  name: string;
  createdAt: string;
};

export type ReservoirType = "Superior" | "Inferior" | "Cisterna" | "Reúso";
export type ReservoirStatus = "ativo" | "pausado";

export type Reservoir = {
  id: string;
  blockId: string;
  name: string;
  type: ReservoirType;
  capacityLiters: number | null;
  totalDepthCm: number | null;
  usefulHeightCm: number | null;
  minOperationalVolumeLiters: number | null;
  criticalLevelPercent: number;
  attentionLevelPercent: number;
  readingIntervalMinutes: number | null;
  expectedAutonomyHours: number | null;
  status: ReservoirStatus;
  createdAt: string;
};

export type ReservoirInput = {
  name: string;
  type: ReservoirType;
  capacityLiters?: number | null;
  totalDepthCm?: number | null;
  usefulHeightCm?: number | null;
  minOperationalVolumeLiters?: number | null;
  criticalLevelPercent?: number;
  attentionLevelPercent?: number;
  readingIntervalMinutes?: number | null;
  expectedAutonomyHours?: number | null;
};
