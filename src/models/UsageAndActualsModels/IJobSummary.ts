import {IEntity} from 'src/models/IEntity';

export interface IJobUsageSummary {
  total_costed: number;
  remaining: number;
  gross_profit: number;
  labour_used: number;
  equipment_used: number;
  materials_used: number;
  po_and_other_used: number;
  assessment_reports: IAssessmentReportSummary[];
}

export interface IAssessmentReportSummary extends IEntity {
  id: number;
  date: string;
  report: string;
  total_amount: number;
  status: string;
}
