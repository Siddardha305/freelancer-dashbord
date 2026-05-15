export type ClientStatus = "Active" | "Paused" | "Inactive";
export type ClientPriority = "High" | "Medium" | "Low";

export interface Client {
  id: string;
  name: string;
  brandName?: string;
  niche: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
  status: ClientStatus;
  priority: ClientPriority;
  monthly_price: number;
  pricing_model: string;
  channel_link?: string;
  avatar?: string;
  notes?: string;
  tags: string[];
  totalEarned: number;
  contractStartDate?: string; // ISO string for frontend
  contractEndDate?: string;
  lastContactedAt?: string;
  referredBy?: string;
  thumbnails_per_month: number;
  price_per_thumbnail: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProgress {
  clientId: string;
  month: string;
  requested: number;
  delivered: number;
}

