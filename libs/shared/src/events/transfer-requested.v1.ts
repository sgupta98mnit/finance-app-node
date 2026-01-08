export interface TransferRequestedV1 {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}
