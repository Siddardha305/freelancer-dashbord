export type ClientStatus = "Active" | "Paused" | "Inactive";

export interface Client {
  id: string;
  name: string;
  brandName?: string;
  niche: string;
  phone?: string;
  email: string;
  status: ClientStatus;
  monthlyPrice: number;
  perThumbnailPrice?: number;
  joinedDate: string;
  notes?: string;
  avatarUrl?: string;
}

export interface ClientProgress {
  clientId: string;
  month: string;
  requested: number;
  delivered: number;
}
