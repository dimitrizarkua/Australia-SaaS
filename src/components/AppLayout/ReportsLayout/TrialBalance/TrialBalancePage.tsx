import * as React from 'react';
import ReportHeader from 'src/components/Layout/Reports/ReportHeader';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import ReportPage from 'src/components/Layout/Reports/ReportPage';
import NoBorderBodyTable from 'src/components/Tables/NoBorderBodyTable';
import {IAppState} from 'src/redux';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {IReportHandler} from 'src/components/Layout/Reports/IReportHandler';
import {TrialBalanceStateType, getTrialBalance} from 'src/redux/trialBalanceDucks';
import {ITrialBalance} from 'src/models/ReportModels/ITrialBalance';
import {IColumn, ColumnType} from 'src/components/Tables/IColumn';
import {getFormatPriceOrEmpty} from 'src/utility/Helpers';
import {EMPTY_CELL} from 'src/constants/Table';
import {debounce} from 'lodash';
import DateTransformer from 'src/transformers/DateTransformer';
import TrialBalancePageFilter from './TrialBalancePageFilter';
import TableLastRowEmpty from 'src/components/Tables/TableLastRowEmpty';
import StrongSpan from 'src/components/Layout/StrongSpan';
import {DataGridHeader, TextHeader} from 'src/components/Tables/DataGridHeader';
import {DataGridCell} from 'src/components/Tables/DataGridCell';

interface IConnectProps {
  trialBalance: TrialBalanceStateType;
  dispatch: (params?: any) => Promise<any> | void;
}

const REPORT_NAME = 'Trial Balance';

class TrialBalancePage extends React.PureComponent<IConnectProps> implements IReportHandler {
  public getCsvData = () => {
    const trialBalance = this.props.trialBalance.data!.data;

    if (!this.hasTrialBalances) {
      return [];
    }

    let res: any[] = [];
    if (trialBalance.Revenue) {
      res = res.concat(trialBalance.Revenue);
    }

    if (trialBalance.Assets) {
      res = res.concat(trialBalance.Assets);
    }

    if (trialBalance.Liabilities) {
      res = res.concat(trialBalance.Liabilities);
    }

    if (trialBalance.TOTAL) {
      res = res.concat(trialBalance.TOTAL);
    }

    return {
      reportName: REPORT_NAME,
      data: res.map(tr => {
        return {
          group_name: tr.group_name,
          gl_account_name: tr.gl_account_name,
          debit_amount: tr.debit_amount,
          credit_amount: tr.credit_amount,
          debit_amount_ytd: tr.debit_amount_ytd,
          credit_amount_ytd: tr.credit_amount_ytd
        };
      })
    };
  };

  private getData(location: number, page?: number, dateTo?: string | null) {
    this.props.dispatch(
      getTrialBalance({
        date_to: dateTo,
        location_id: location,
        page
      })
    );
  }

  private getTrialBalance = (data: any, page?: number) => {
    const {dateTo, location} = data;

    if (location) {
      const to = DateTransformer.dehydrateDate(dateTo);
      const locationId = location && location.id;

      return this.getData(locationId, page, to);
    }
  };

  private filterReport = debounce(this.getTrialBalance);

  private columnsPaymentDef: Array<IColumn<ITrialBalance>> = [
    {
      id: 'gl_account_name',
      header: 'Account',
      type: ColumnType.Text,
      cell: item => <span>{item.gl_account_name}</span>
    },
    {
      id: 'debit_amount',
      header: 'Debit',
      width: '15%',
      type: ColumnType.Numeric,
      cell: item => <span>{getFormatPriceOrEmpty(item.debit_amount, EMPTY_CELL)}</span>
    },
    {
      id: 'credit_amount',
      header: 'Credit',
      width: '15%',
      type: ColumnType.Numeric,
      cell: item => <span>{getFormatPriceOrEmpty(item.credit_amount, EMPTY_CELL)}</span>
    },
    {
      id: 'debit_amount_ytd',
      header: 'YTD Debit',
      width: '15%',
      type: ColumnType.Numeric,
      cell: item => <span>{getFormatPriceOrEmpty(item.debit_amount_ytd, EMPTY_CELL)}</span>
    },
    {
      id: 'credit_amount_ytd',
      header: 'YTD Credit',
      width: '15%',
      type: ColumnType.Numeric,
      cell: item => <span>{getFormatPriceOrEmpty(item.credit_amount_ytd, EMPTY_CELL)}</span>
    }
  ];

  private renderReportRows() {
    const trialBalance = this.props.trialBalance.data!.data;

    if (!trialBalance) {
      return null;
    }

    return (
      <>
        <tr>
          <td colSpan={this.columnsPaymentDef.length} style={{padding: '0'}}>
            {this.renderTrialBalance(trialBalance.Revenue, 'Revenue', false)}
          </td>
        </tr>

        <tr>
          <td colSpan={this.columnsPaymentDef.length} style={{padding: '0'}}>
            {this.renderTrialBalance(trialBalance.Assets, 'Assets', false)}
          </td>
        </tr>

        <tr>
          <td colSpan={this.columnsPaymentDef.length} style={{padding: '0'}}>
            {this.renderTrialBalance(trialBalance.Liabilities, 'Liabilities', true, trialBalance.TOTAL)}
          </td>
        </tr>
      </>
    );
  }

  private renderTrialBalance(
    balance: ITrialBalance[],
    groupName: string,
    addTotal: boolean,
    balanceTotal?: ITrialBalance[]
  ) {
    return (
      <TableLastRowEmpty className="table">
        <thead>
          <tr>
            <TextHeader colSpan={this.columnsPaymentDef.length}>
              <StrongSpan>{groupName}</StrongSpan>
            </TextHeader>
          </tr>
        </thead>
        <tbody>
          {balance && balance.length > 0 && balance[0].gl_account_name
            ? this.renderBalances(balance)
            : this.renderNodata()}
          {addTotal && balanceTotal && this.renderBalances(balanceTotal, true)}
          <tr>
            <td colSpan={this.columnsPaymentDef.length}>&nbsp;</td>
          </tr>
        </tbody>
      </TableLastRowEmpty>
    );
  }

  private renderBalances(balances: ITrialBalance[], isTotal?: boolean) {
    if (!balances) {
      return null;
    }

    return balances.map((balance: ITrialBalance) => (
      <tr key={balance.gl_account_name}>
        {this.columnsPaymentDef.map(c => (
          <DataGridCell key={c.id} width={c.width} hidden={c.hidden} align={c.type}>
            {!isTotal ? c.cell(balance) : <StrongSpan>{c.cell(balance)}</StrongSpan>}
          </DataGridCell>
        ))}
      </tr>
    ));
  }

  private renderNodata() {
    return (
      <tr>
        <td className="no-items" colSpan={this.columnsPaymentDef.length}>
          No items found
        </td>
      </tr>
    );
  }

  private get hasTrialBalances(): boolean {
    const {
      trialBalance: {ready, data: trialBalanceData}
    } = this.props;
    return !!(ready && trialBalanceData && trialBalanceData.data);
  }

  public render() {
    const {
      trialBalance: {loading}
    } = this.props;
    const hasTrialBalances = this.hasTrialBalances;

    return (
      <>
        <ReportHeader reportName={REPORT_NAME} toCsvFn={this.getCsvData}>
          <TrialBalancePageFilter onSubmit={this.filterReport} />
        </ReportHeader>
        {loading ? (
          <BlockLoading size={40} color={ColorPalette.white} />
        ) : (
          <ReportPage>
            <NoBorderBodyTable className="table">
              <thead>
                <tr>
                  {this.columnsPaymentDef.map(c => (
                    <DataGridHeader key={c.id} width={c.width} hidden={c.hidden} align={c.type}>
                      {c.header}
                    </DataGridHeader>
                  ))}
                </tr>
              </thead>
              <tbody>{hasTrialBalances ? this.renderReportRows() : this.renderNodata()}</tbody>
            </NoBorderBodyTable>
          </ReportPage>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  trialBalance: state.trialBalance
});

export default compose<React.ComponentClass<{}>>(connect(mapStateToProps))(TrialBalancePage);

export const InternalAccountTransactionsPage = TrialBalancePage;
