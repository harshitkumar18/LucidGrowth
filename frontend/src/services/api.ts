// Simple fetch-based API service (no external dependencies)
import { Email, SystemStatus } from '../types/email';

// Use same-origin /api for production (Vercel rewrite), fallback to localhost for dev
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Simple fetch-based API functions
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}...`);
  }

  return response.json();
}

export const emailService = {
  // Get all emails
  getAllEmails: async (): Promise<Email[]> => {
    return apiRequest('/emails');
  },

  // Get email by ID
  getEmailById: async (id: string): Promise<Email> => {
    return apiRequest(`/emails/${id}`);
  },

  // Get email by message ID
  getEmailByMessageId: async (messageId: string): Promise<Email> => {
    return apiRequest(`/emails/message/${messageId}`);
  },

  // Get system status
  getSystemStatus: async (): Promise<SystemStatus> => {
    return apiRequest('/emails/status');
  },

  // Trigger email processing
  processEmails: async (): Promise<{ message: string; error?: string }> => {
    return apiRequest('/emails/process', { method: 'POST' });
  },
};
