export interface IPayment {
  id: number;
  transaction_id: number;
  type: string;
  reference: string;
  paid_at: Date;
  amount: number;
}
