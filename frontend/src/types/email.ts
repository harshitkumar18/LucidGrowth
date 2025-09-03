export interface Email {
  _id: string;
  messageId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  headers: Record<string, any>;
  receivingChain: ReceivingChainHop[];
  espType: string;
  espDetails: ESPDetails;
  status: 'pending' | 'processed' | 'error';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceivingChainHop {
  server: string;
  timestamp: string;
  by: string;
  with: string;
  id: string;
}

export interface ESPDetails {
  provider: string;
  confidence: number;
  indicators: string[];
}

export interface SystemStatus {
  totalEmails: number;
  processedEmails: number;
  pendingEmails: number;
  errorEmails: number;
  testEmailAddress: string;
  testEmailSubject: string;
  imapStatus: string;
}
