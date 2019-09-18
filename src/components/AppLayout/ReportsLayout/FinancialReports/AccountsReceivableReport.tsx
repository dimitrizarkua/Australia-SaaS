import * as React from 'react';
import {connect} from 'react-redux';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {IAppState} from 'src/redux';
import {formatPrice} from 'src/utility/Helpers';
import {getAccReceivable, IFinAccReceivableState, selectAccReceive} from 'src/redux/financialReportsDucks';
import {IShareFinReportProps} from './index';
import {
  FinReportTable,
  CurrencyTd,
  CurrencyTh,
  FinReportNoDataRow
} from 'src/components/AppLayout/ReportsLayout/FinancialReports/FinReportComponents';
import {BaseFinanceReport, IFinanceReportChartData} from './BaseFinanceReport';
import {ICsvTransferFormat} from 'src/components/Layout/Reports/PrintButton';

enum AccReceivableValues {
  TotalReceivables = 'Total Receivables',
  Current = 'Current',
  Month = '30 days',
  TwoMonths = '60 days',
  ThreeMonths = '90+ days'
}

enum AccReceivableColumns {
  Contact = 'Contact',
  Current = 'Current',
  Month = '30 days',
  TwoMonths = '60 days',
  ThreeMonths = '90+ days',
  Total = 'Total'
}

interface IConnectProps {
  financialAccReceivable: IFinAccReceivableState;
  dispatch: ThunkDispatch<any, any, Action>;
}

type AllProps = IShareFinReportProps & IConnectProps;

class FinancialAccReceivableReport extends BaseFinanceReport<AllProps> {
  protected get isLoading() {
    return this.props.financialAccReceivable.loading;
  }

  protected getCsv = (): null | ICsvTransferFormat[] => {
    const revenueData = this.props.financialAccReceivable.data;
    if (!revenueData) {
      return null;
    }

    const resultCsv = [this.statCsv];
    const chartCsv = this.chartCsv;
    if (chartCsv) {
      resultCsv.push(chartCsv);
    }

    return resultCsv;
  };

  private get statCsv(): ICsvTransferFormat {
    const accReceivable = this.props.financialAccReceivable.data!;

    return {
      columns: ['statistic_element', 'value', 'delta'],
      reportName: 'Accounts receivables statistics',
      data: [
        {
          statistic_element: AccReceivableValues.TotalReceivables,
          value: accReceivable.total,
          delta: accReceivable.total_change
        },
        {
          statistic_element: AccReceivableValues.Current,
          value: accReceivable.current,
          delta: accReceivable.current_change
        },
        {
          statistic_element: AccReceivableValues.Month,
          value: accReceivable.more_30_days,
          delta: accReceivable.more_30_days_change
        },
        {
          statistic_element: AccReceivableValues.TwoMonths,
          value: accReceivable.more_60_days,
          delta: accReceivable.more_60_days_change
        },
        {
          statistic_element: AccReceivableValues.ThreeMonths,
          value: accReceivable.more_90_days,
          delta: accReceivable.more_90_days_change
        }
      ]
    };
  }

  private get chartCsv(): ICsvTransferFormat | null {
    const {chart} = this.props.financialAccReceivable.data!;

    const currentPeriod =
      chart &&
      chart.map((el, i) => ({
        current_period_date: el.date,
        current_period_value: el.value
      }));

    return {
      reportName: 'Accounts Receivables',
      data: currentPeriod
    };
  }

  protected get data() {
    return this.props.financialAccReceivable.data;
  }

  protected get chartData(): IFinanceReportChartData {
    const {
      financialAccReceivable: {data}
    } = this.props;

    const {chart, previous_interval_chart} = data!;

    return {
      name: 'Accounts Receivables',
      primaryChart: chart,
      secondaryChart: previous_interval_chart
    };
  }

  protected request = () => {
    const {dispatch, currentFilterParams} = this.props;
    dispatch(getAccReceivable(currentFilterParams));
  };

  protected get statConfig() {
    const financialAccReceivable = this.props.financialAccReceivable.data;
    if (!financialAccReceivable) {
      return null;
    }

    return {
      data: [
        {
          label: AccReceivableValues.TotalReceivables,
          value: formatPrice(financialAccReceivable.total),
          delta: financialAccReceivable.total_change,
          hasDelimiter: true,
          toolTip: AccReceivableValues.TotalReceivables
        },
        {
          label: AccReceivableValues.Current,
          value: formatPrice(financialAccReceivable.current),
          delta: financialAccReceivable.current_change,
          hasDelimiter: true,
          toolTip: AccReceivableValues.Current
        },
        {
          label: AccReceivableValues.Month,
          value: formatPrice(financialAccReceivable.more_30_days),
          delta: financialAccReceivable.more_30_days_change,
          hasDelimiter: true,
          toolTip: AccReceivableValues.Month
        },
        {
          label: AccReceivableValues.TwoMonths,
          value: formatPrice(financialAccReceivable.more_60_days),
          delta: financialAccReceivable.more_60_days_change,
          hasDelimiter: true,
          toolTip: AccReceivableValues.TwoMonths
        },
        {
          label: AccReceivableValues.ThreeMonths,
          value: formatPrice(financialAccReceivable.more_90_days),
          delta: financialAccReceivable.more_90_days_change,
          toolTip: AccReceivableValues.ThreeMonths
        }
      ],
      perRow: 2,
      perCol: 3
    };
  }

  private renderContactTable = (): React.ReactNode => {
    const {data} = this.props.financialAccReceivable;
    const contacts = data && data.contacts;
    let tableContent = <FinReportNoDataRow colspan={6} />;
    if (contacts && contacts.length) {
      tableContent = (
        <React.Fragment>
          {contacts.map((el, i) => (
            <tr key={i}>
              <td>{el.name}</td>
              <CurrencyTd>{el.current}</CurrencyTd>
              <CurrencyTd>{el.more_30_days}</CurrencyTd>
              <CurrencyTd>{el.more_60_days}</CurrencyTd>
              <CurrencyTd>{el.more_90_days}</CurrencyTd>
              <CurrencyTd>{el.total}</CurrencyTd>
            </tr>
          ))}
        </React.Fragment>
      );
    }

    return (
      <FinReportTable className="w-100" noStripped={true}>
        <thead>
          <tr>
            <th>{AccReceivableColumns.Contact}</th>
            <CurrencyTh>{AccReceivableColumns.Current}</CurrencyTh>
            <CurrencyTh>{AccReceivableColumns.Month}</CurrencyTh>
            <CurrencyTh>{AccReceivableColumns.TwoMonths}</CurrencyTh>
            <CurrencyTh>{AccReceivableColumns.ThreeMonths}</CurrencyTh>
            <CurrencyTh>{AccReceivableColumns.Total}</CurrencyTh>
          </tr>
        </thead>
        <tbody>{tableContent}</tbody>
      </FinReportTable>
    );
  };

  protected finTables = [this.renderContactTable];
}

function mapStateToProps(state: IAppState) {
  return {
    financialAccReceivable: selectAccReceive(state)
  };
}

const FinancialRevenuePageWrapper = connect(mapStateToProps)(FinancialAccReceivableReport as any);

export {FinancialRevenuePageWrapper as FinancialAccReceivableReport};
