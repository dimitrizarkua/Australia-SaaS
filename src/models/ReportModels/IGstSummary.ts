export interface IGstSummary {
  name: string;
  total_amount: number;
  taxes: number;
  tax_rate: number;
}

export interface IGstSummaries {
  income: {
    data: IGstSummary[];
    total: number;
  };
  expenses: {
    data: IGstSummary[];
    total: number;
  };
  other: {
    data: IGstSummary[];
    total: number;
  };
}
