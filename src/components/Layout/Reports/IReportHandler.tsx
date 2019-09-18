import {ICsvTransferFormat} from './PrintButton';

export interface IReportHandler {
  getCsvData(): ICsvTransferFormat | null | any[];
}
