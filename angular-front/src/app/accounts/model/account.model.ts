export interface Account {
  id: string;
  balance?: number;
  createdAt?: string;
  type?: string;
  customerId?: number;
}

export type AccountStatus = 'idle' | 'loading' | 'success' | 'error';
