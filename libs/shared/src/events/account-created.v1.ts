export interface AccountCreatedV1 {
  id: string;
  userId: string;
  type: 'CHECKING' | 'SAVINGS';
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}
