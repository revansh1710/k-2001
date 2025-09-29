export type Milestone = {
  id?: number;
  title: string;
  date?: string; // ISO
  status?: 'planned' | 'in_progress' | 'completed';
  notes?: string;
};

export type Mission = {
  id?: number;
  name: string;
  target?: string;
  windowOpen?: string | null;
  windowClose?: string | null;
  launchDate?: string | null;
  deltaV_kms?: number | null;
  coordinates?: string | null;
  notes?: string | null;
  milestones?: Milestone[];
  owner?: { id: number } | number | null;
};
