import {Moment} from 'moment';

export interface IFinancialChartPoint {
  date: Moment;
  value: number;
}

export type FinancialChartDataset = IFinancialChartPoint[];

export interface IFinancialVolume {
  total_revenue: number;
  total_revenue_change: number;
  from_jobs: number;
  from_jobs_change: number;
  invoices: number;
  invoices_change: number;
  purchase_orders: number;
  purchase_orders_change: number;
  credit_notes: number;
  credit_notes_change: number;
  total_gross_profit: number;
  total_gross_profit_change: number;
  accounts_receivable: number;
  accounts_receivable_change: number;
  chart: FinancialChartDataset;
  previous_interval_chart: FinancialChartDataset;
}

export interface IFinancialAccReceivable {
  current: number;
  current_change: number;
  more_30_days: number;
  more_30_days_change: number;
  more_60_days: number;
  more_60_days_change: number;
  more_90_days: number;
  more_90_days_change: number;
  total: number;
  total_change: number;
  contacts: IFinReportContacts[];
  chart: FinancialChartDataset;
  previous_interval_chart: FinancialChartDataset;
}

export interface IFinReportTaggedInvoices {
  change: number;
  count: number;
  name: string;
  percent: number;
}

export interface IFinReportContacts {
  name: string;
  current: number;
  more_30_days: number;
  more_60_days: number;
  more_90_days: number;
  total: number;
}

export interface IFinReportRevenueAccounts {
  name: string;
  code: string;
  amount: number;
}

export interface IFinancialRevenue {
  avg_job_cost: number;
  avg_job_cost_change: number;
  avg_over_job_cost: number;
  avg_over_job_cost_change: number;
  chart: FinancialChartDataset;
  previous_interval_chart: FinancialChartDataset;
  credit_notes: number;
  credit_notes_change: number;
  invoices_paid: number;
  invoices_paid_change: number;
  invoices_written: number;
  invoices_written_change: number;
  revenue_accounts: IFinReportRevenueAccounts[];
  tagged_invoices: IFinReportTaggedInvoices[];
  total_gross_profit: number;
  total_gross_profit_change: number;
}

export interface IFinancialReportParams {
  location_id?: number;
  tag_ids?: number[];
  interval: number;
  gl_account_id?: number;
  current_date_from: Moment;
  current_date_to: Moment;
  previous_date_from: Moment;
  previous_date_to: Moment;
}
