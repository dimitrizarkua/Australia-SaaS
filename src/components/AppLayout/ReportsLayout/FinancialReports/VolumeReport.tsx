import {connect} from 'react-redux';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {IAppState} from 'src/redux';
import {IFinancialVolume} from 'src/models/ReportModels/IFinancialReports';
import {formatPrice} from 'src/utility/Helpers';
import {selectVolume, IFinReportVolumeState, getVolume} from 'src/redux/financialReportsDucks';
import {BaseFinanceReport, IFinanceReportChartData, IFinReportStatConfig} from './BaseFinanceReport';
import {mergeArraysByIndex} from 'src/utility/ArrayHelper';
import {ICsvTransferFormat} from 'src/components/Layout/Reports/PrintButton';

enum VolumeReportValues {
  TotalRevenue = 'Total Revenue',
  Invoices = 'Invoices',
  CreditNotes = 'Credit Notes',
  AccountsReceivable = 'Accounts Receivable',
  FromJobs = 'From Jobs',
  PurchaseOrders = 'Purchase Orders',
  TotalGrossProfit = 'Total Gross Profit'
}

interface IConnectProps {
  financialVolume: IFinReportVolumeState;
  dispatch: ThunkDispatch<any, any, Action>;
}

type FinancialVolumeReportProps = IFinancialVolume & IConnectProps;

class FinancialVolumeReport extends BaseFinanceReport<FinancialVolumeReportProps> {
  protected finTables = [];

  protected get data() {
    return this.props.financialVolume.data;
  }

  protected getCsv = (): null | ICsvTransferFormat[] => {
    const volumeData = this.props.financialVolume.data;
    if (!volumeData) {
      return null;
    }

    const result: ICsvTransferFormat[] = [this.chartCsv];

    if (
      (volumeData.chart && volumeData.chart.length) ||
      (volumeData.previous_interval_chart && volumeData.previous_interval_chart.length)
    ) {
      result.push(this.statCsv);
    }

    return result;
  };

  private get chartCsv(): ICsvTransferFormat {
    const volumeData = this.props.financialVolume.data!;

    const currentPeriod =
      volumeData.chart &&
      volumeData.chart.map((el, i) => ({
        current_period_date: el.date,
        current_period_value: el.value
      }));

    const previousPeriod =
      volumeData.previous_interval_chart &&
      volumeData.previous_interval_chart.map(el => ({
        previous_period_date: el.date,
        previous_period_value: el.value
      }));

    return {
      reportName: 'Report volume',
      data: mergeArraysByIndex(currentPeriod, previousPeriod)
    };
  }

  private get statCsv(): ICsvTransferFormat {
    const volumeData = this.props.financialVolume.data!;

    return {
      columns: ['statistic_element', 'value', 'delta'],
      reportName: 'Volume statistic',
      data: [
        {
          statistic_element: VolumeReportValues.TotalRevenue,
          value: volumeData.total_revenue,
          delta: volumeData.total_revenue_change
        },
        {
          statistic_element: VolumeReportValues.FromJobs,
          value: volumeData.from_jobs,
          delta: volumeData.from_jobs_change
        },
        {statistic_element: VolumeReportValues.Invoices, value: volumeData.invoices, delta: volumeData.invoices_change},
        {
          statistic_element: VolumeReportValues.PurchaseOrders,
          value: volumeData.purchase_orders,
          delta: volumeData.purchase_orders_change
        },
        {
          statistic_element: VolumeReportValues.CreditNotes,
          value: volumeData.credit_notes,
          delta: volumeData.credit_notes_change
        },
        {
          statistic_element: VolumeReportValues.TotalGrossProfit,
          value: volumeData.total_gross_profit,
          delta: volumeData.total_gross_profit_change
        },
        {
          statistic_element: VolumeReportValues.AccountsReceivable,
          value: volumeData.accounts_receivable,
          delta: volumeData.accounts_receivable_change
        }
      ]
    };
  }

  protected request(cb?: () => void): void {
    const {dispatch, currentFilterParams} = this.props;
    dispatch(getVolume(currentFilterParams)).then(cb);
  }

  protected get isLoading(): boolean {
    return this.props.financialVolume.loading;
  }

  protected get statConfig(): IFinReportStatConfig | null {
    const financialVolume = this.props.financialVolume.data;
    if (!financialVolume) {
      return null;
    }

    return {
      data: [
        {
          label: VolumeReportValues.TotalRevenue,
          value: formatPrice(financialVolume.total_revenue),
          delta: financialVolume.total_revenue_change,
          hasDelimiter: true,
          toolTip: 'Total revenue for the current period.'
        },
        {
          label: VolumeReportValues.FromJobs,
          value: financialVolume.from_jobs,
          delta: financialVolume.from_jobs_change,
          hasDelimiter: true,
          toolTip: 'The total count of jobs<br />within the current period.'
        },
        {
          label: VolumeReportValues.Invoices,
          value: financialVolume.invoices,
          delta: financialVolume.invoices_change,
          hasDelimiter: true,
          toolTip: 'Total number of invoices<br />written in the current period.'
        },
        {
          label: VolumeReportValues.PurchaseOrders,
          value: financialVolume.purchase_orders,
          delta: financialVolume.purchase_orders_change,
          hasDelimiter: true,
          toolTip: 'Total number of purchase orders<br />written in the current period.'
        },
        {
          label: VolumeReportValues.CreditNotes,
          value: financialVolume.credit_notes,
          delta: financialVolume.credit_notes_change,
          hasDelimiter: true,
          toolTip: 'Total number of credit notes<br />written in the current period.'
        },
        {
          label: VolumeReportValues.TotalGrossProfit,
          value: `${financialVolume.total_gross_profit.toFixed(2)}%`,
          delta: financialVolume.from_jobs_change,
          hasDelimiter: true,
          toolTip: 'Total gross profit<br />for the current period.'
        },
        {
          label: VolumeReportValues.AccountsReceivable,
          value: formatPrice(financialVolume.accounts_receivable),
          delta: financialVolume.invoices_change,
          toolTip: 'Accounts receivable in the current period.'
        }
      ],
      perCol: 4,
      perRow: 2
    };
  }

  protected get chartData(): IFinanceReportChartData {
    const {
      financialVolume: {data}
    } = this.props;
    if (!data) {
      return null;
    }

    const {chart, previous_interval_chart} = data!;

    return {
      name: 'Volume',
      primaryChart: chart,
      secondaryChart: previous_interval_chart
    };
  }
}

function mapStateToProps(state: IAppState) {
  return {
    financialVolume: selectVolume(state)
  };
}

export default connect(mapStateToProps)(FinancialVolumeReport as any);
