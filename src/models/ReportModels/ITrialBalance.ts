export interface ITrialBalance {
  group_name: string;
  gl_account_name: string;
  debit_amount: number;
  credit_amount: number;
  debit_amount_ytd: number;
  credit_amount_ytd: number;
}

export interface ITrialBalances {
  Revenue: ITrialBalance[];
  Assets: ITrialBalance[];
  Liabilities: ITrialBalance[];
  TOTAL: ITrialBalance[];
}
