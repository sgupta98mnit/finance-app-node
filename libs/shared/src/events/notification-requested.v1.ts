export interface NotificationRequestedV1 {
  id: string;
  type: 'EMAIL' | 'SMS';
  to: string;
  template: string;
  variables: Record<string, string>;
  createdAt: string;
}
