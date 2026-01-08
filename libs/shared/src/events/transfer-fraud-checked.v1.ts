export interface TransferFraudCheckedV1 {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  currency: string;
  approved: boolean;
  reasons: string[];
}
