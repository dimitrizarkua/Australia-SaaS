import * as React from 'react';
import {connect} from 'react-redux';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {IAppState} from 'src/redux';
import {RouteComponentProps} from 'react-router-dom';
import {formatPrice} from 'src/utility/Helpers';
import {getRevenue, IFinReportRevenueState, selectRevenue} from 'src/redux/financialReportsDucks';
import {IShareFinReportProps} from './index';
import {
  CurrencyTd,
  FinReportTable,
  CurrencyTh,
  FinReportNoDataRow
} from 'src/components/AppLayout/ReportsLayout/FinancialReports/FinReportComponents';
import {BaseFinanceReport, IFinanceReportChartData} from './BaseFinanceReport';
import ColorPalette from 'src/constants/ColorPalette';
import {ICsvTransferFormat} from 'src/components/Layout/Reports/PrintButton';
import {mergeArraysByIndex} from 'src/utility/ArrayHelper';
import {IFinReportRevenueAccounts} from 'src/models/ReportModels/IFinancialReports';

enum RevenueReportValues {
  InvoicesPaid = 'Invoices Paid',
  AverageJobCost = 'Average Job Cost',
  CreditNotes = 'Credit Notes',
  InvoicesWritten = 'Invoices Written',
  AvgJobCost = 'Avg. Over Job Cost',
  TotalGrossProfit = 'Total Gross Profit'
}

enum RevenueTagInvoiceColumn {
  TaggedInvoices = 'Tagged Invoices',
  Number = 'No.',
  Diff = 'Diff.',
  Percent = '%'
}

enum RevenueAccountColumn {
  RevenueAccount = 'Revenue Account',
  Amount = 'Amount'
}

interface IConnectProps {
  financialRevenue: IFinReportRevenueState;
  dispatch: ThunkDispatch<any, any, Action>;
}

type AllProps = RouteComponentProps<{}> & IShareFinReportProps & IConnectProps;

class FinancialRevenueReport extends BaseFinanceReport<AllProps> {
  protected get isLoading() {
    return this.props.financialRevenue.loading;
  }

  protected getCsv = (): null | ICsvTransferFormat[] => {
    const revenueData = this.props.financialRevenue.data;
    if (!revenueData) {
      return null;
    }

    const resultCsv = [this.statCsv];
    if (revenueData.tagged_invoices && revenueData.tagged_invoices.length) {
      resultCsv.push(this.taggedInvoiceCsv);
    }
    if (revenueData.revenue_accounts && revenueData.revenue_accounts.length) {
      resultCsv.push(this.revenueAccountCsv);
    }

    const chartCsv = this.chartCsv;
    if (chartCsv) {
      resultCsv.push(chartCsv);
    }

    return resultCsv;
  };

  private get statCsv(): ICsvTransferFormat {
    const revenueData = this.props.financialRevenue.data!;

    return {
      columns: ['statistic_element', 'value', 'delta'],
      reportName: 'Revenue Statistics',
      data: [
        {
          statistic_element: RevenueReportValues.InvoicesPaid,
          value: revenueData.invoices_paid,
          delta: revenueData.invoices_paid_change
        },
        {
          statistic_element: RevenueReportValues.InvoicesWritten,
          value: revenueData.invoices_written,
          delta: revenueData.invoices_written_change
        },
        {
          statistic_element: RevenueReportValues.AverageJobCost,
          value: revenueData.avg_job_cost,
          delta: revenueData.avg_job_cost_change
        },
        {
          statistic_element: RevenueReportValues.AvgJobCost,
          value: revenueData.avg_over_job_cost,
          delta: revenueData.avg_over_job_cost_change
        },
        {
          statistic_element: RevenueReportValues.CreditNotes,
          value: revenueData.credit_notes,
          delta: revenueData.credit_notes_change
        },
        {
          statistic_element: RevenueReportValues.TotalGrossProfit,
          value: revenueData.total_gross_profit,
          delta: revenueData.total_gross_profit_change
        }
      ]
    };
  }

  private get revenueAccountCsv(): ICsvTransferFormat {
    const revenueData = this.props.financialRevenue.data!.revenue_accounts;

    return {
      reportName: 'Revenue Accounts',
      data: revenueData.map(el => ({
        [RevenueAccountColumn.RevenueAccount]: this.getRevenueAccountName(el),
        [RevenueAccountColumn.Amount]: el.amount
      }))
    };
  }

  private get chartCsv(): ICsvTransferFormat | null {
    const {chart, previous_interval_chart} = this.props.financialRevenue.data!;

    const currentPeriod =
      chart &&
      chart.map((el, i) => ({
        current_period_date: el.date,
        current_period_value: el.value
      }));

    const previousPeriod =
      previous_interval_chart &&
      previous_interval_chart.map(el => ({
        previous_period_date: el.date,
        previous_period_value: el.value
      }));

    return {
      reportName: 'Revenue report',
      data: mergeArraysByIndex(currentPeriod, previousPeriod)
    };
  }

  private get taggedInvoiceCsv(): ICsvTransferFormat {
    const {
      financialRevenue: {data}
    } = this.props;

    const body = data!.tagged_invoices.map(el => ({
      [RevenueTagInvoiceColumn.TaggedInvoices]: el.name,
      [RevenueTagInvoiceColumn.Number]: el.count,
      [RevenueTagInvoiceColumn.Percent]: el.percent,
      [RevenueTagInvoiceColumn.Diff]: el.change
    }));

    return {
      data: body,
      reportName: 'Tagged Invoices'
    };
  }

  protected get data() {
    return this.props.financialRevenue.data;
  }

  protected get chartData(): IFinanceReportChartData {
    const {
      financialRevenue: {data}
    } = this.props;

    const {chart, previous_interval_chart} = data!;

    return {
      name: 'Revenue',
      primaryChart: chart,
      secondaryChart: previous_interval_chart
    };
  }

  protected request = (cb?: () => void) => {
    const {dispatch, currentFilterParams} = this.props;
    dispatch(getRevenue(currentFilterParams)).then(cb);
  };

  protected get statConfig() {
    const financialRevenue = this.props.financialRevenue.data;
    if (!financialRevenue) {
      return null;
    }

    return {
      data: [
        {
          label: RevenueReportValues.InvoicesPaid,
          value: formatPrice(financialRevenue.invoices_paid),
          delta: financialRevenue.invoices_paid_change,
          hasDelimiter: true,
          toolTip: RevenueReportValues.InvoicesPaid
        },
        {
          label: RevenueReportValues.InvoicesWritten,
          value: formatPrice(financialRevenue.invoices_written),
          delta: financialRevenue.invoices_written_change,
          hasDelimiter: true,
          toolTip: RevenueReportValues.InvoicesWritten
        },
        {
          label: RevenueReportValues.AverageJobCost,
          value: formatPrice(financialRevenue.avg_job_cost),
          delta: financialRevenue.avg_job_cost_change,
          hasDelimiter: true,
          toolTip: RevenueReportValues.AverageJobCost
        },
        {
          label: RevenueReportValues.AvgJobCost,
          value: formatPrice(financialRevenue.avg_over_job_cost),
          delta: financialRevenue.avg_over_job_cost_change,
          hasDelimiter: true,
          toolTip: RevenueReportValues.AvgJobCost
        },
        {
          label: RevenueReportValues.CreditNotes,
          value: formatPrice(financialRevenue.credit_notes),
          delta: financialRevenue.credit_notes_change,
          toolTip: RevenueReportValues.CreditNotes
        },
        {
          label: RevenueReportValues.TotalGrossProfit,
          value: `${financialRevenue.total_gross_profit.toFixed(2)}%`,
          delta: financialRevenue.total_gross_profit_change,
          toolTip: RevenueReportValues.TotalGrossProfit
        }
      ],
      perRow: 2,
      perCol: 3
    };
  }

  private getDiffColor = (value: number) => {
    if (0 > value) {
      return ColorPalette.red1;
    }

    if (value > 0) {
      return ColorPalette.green2;
    }

    return 'inherit';
  };

  private getRevenueAccountName(revAcc: IFinReportRevenueAccounts) {
    return `${revAcc.name}: ${revAcc.code}`;
  }

  private renderRevenueAccountTable = (): React.ReactNode => {
    const {data} = this.props.financialRevenue;
    const revenueAccounts = data && data.revenue_accounts;
    let tableContent = <FinReportNoDataRow colspan={2} />;
    if (revenueAccounts && revenueAccounts.length) {
      tableContent = (
        <React.Fragment>
          {revenueAccounts.map((el, i) => (
            <tr key={i}>
              <td>{this.getRevenueAccountName(el)}</td>
              <CurrencyTd>{`$ ${el.amount}`}</CurrencyTd>
            </tr>
          ))}
        </React.Fragment>
      );
    }

    return (
      <FinReportTable className="w-100">
        <thead>
          <tr>
            <th>{RevenueAccountColumn.RevenueAccount}</th>
            <CurrencyTh>{RevenueAccountColumn.Amount}</CurrencyTh>
          </tr>
        </thead>
        <tbody>{tableContent}</tbody>
      </FinReportTable>
    );
  };

  private renderRevenueTaggedInvTable = (): React.ReactNode => {
    const {data} = this.props.financialRevenue;
    const taggedInvoicesList = data && data.tagged_invoices;
    let tableContent = <FinReportNoDataRow colspan={4} />;
    if (taggedInvoicesList && taggedInvoicesList.length) {
      tableContent = (
        <React.Fragment>
          {taggedInvoicesList.map((el, i) => (
            <tr key={i}>
              <td>{el.name}</td>
              <CurrencyTd>{el.count}</CurrencyTd>
              <CurrencyTd>{`${el.percent}%`}</CurrencyTd>
              <CurrencyTd style={{color: this.getDiffColor(el.change)}}>{`${el.change}%`}</CurrencyTd>
            </tr>
          ))}
        </React.Fragment>
      );
    }

    return (
      <FinReportTable className="w-100">
        <thead>
          <tr>
            <th>Tagged Invoices</th>
            <CurrencyTh>No.</CurrencyTh>
            <CurrencyTh>%</CurrencyTh>
            <CurrencyTh>Diff.</CurrencyTh>
          </tr>
        </thead>
        <tbody>{tableContent}</tbody>
      </FinReportTable>
    );
  };

  protected finTables = [this.renderRevenueTaggedInvTable, this.renderRevenueAccountTable];
}

function mapStateToProps(state: IAppState) {
  return {
    financialRevenue: selectRevenue(state)
  };
}

const FinancialRevenuePageWrapper = connect(mapStateToProps)(FinancialRevenueReport as any);

export {FinancialRevenuePageWrapper as FinancialRevenueReport};
