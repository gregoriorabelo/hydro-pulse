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

export type Sensor = {
  id: string;
  blockId: string;
  reservoirId: string | null;
  name: string;
  serial: string;
  model: string | null;
  createdAt: string;
  secret?: string;
};

export type SensorInput = {
  blockId: string;
  reservoirId?: string | null;
  name: string;
  serial: string;
  model?: string | null;
};

export type GlobalRole = "admin" | "operador";
export type CondominiumRole = "admin" | "sindico" | "operador" | "visualizador";

export const CONDOMINIUM_ROLE_LABELS: Record<CondominiumRole, string> = {
  admin: "Administrador",
  sindico: "Síndico",
  operador: "Operador",
  visualizador: "Visualizador",
};

export type UserCondominiumAccess = {
  condominiumId: string;
  condominiumName: string;
  role: CondominiumRole;
};

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: GlobalRole;
  createdAt: string;
  condominiums: UserCondominiumAccess[];
};

export type UserInput = {
  name?: string | null;
  email: string;
  password?: string;
  role: GlobalRole;
  condominiums: { condominiumId: string; role: CondominiumRole }[];
};
