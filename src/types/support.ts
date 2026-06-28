export type SupportCategory = 'billing' | 'technical' | 'feature_request' | 'other';
export type SupportPriority = 'low' | 'medium' | 'high' | 'critical';
export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}
