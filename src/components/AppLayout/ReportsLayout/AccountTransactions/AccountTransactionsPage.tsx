import * as React from 'react';
import Moment from 'react-moment';
import {connect} from 'react-redux';
import {compose} from 'redux';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ReportSummary from 'src/components/Layout/Reports/ReportSummary';
import Pagination from 'src/components/Tables/Pagination';
import StripedTable from 'src/components/Tables/StripedTable';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import {IAccountTransactionListItem} from 'src/models/ReportModels/IAccountTransaction';
import {IAppState} from 'src/redux';
import {AccountTransactionStateType, getAccountTransaction} from 'src/redux/accountTransactionDucks';
import {formatPrice} from 'src/utility/Helpers';
import styled from 'styled-components';
import DateTransformer from 'src/transformers/DateTransformer';
import NotPrintable from 'src/components/Layout/Reports/NotPrintable';
import {IReportHandler} from 'src/components/Layout/Reports/IReportHandler';
import AccountTransactionsPageFilter from './AccountTransactionsPageFilter';
import {debounce} from 'lodash';
import ReportHeader from 'src/components/Layout/Reports/ReportHeader';
import {FRONTEND_DATE} from 'src/constants/Date';
import PageContent from 'src/components/Layout/PageContent';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import {ICsvTransferFormat} from 'src/components/Layout/Reports/PrintButton';
import {TextHeader, NumericHeader} from 'src/components/Tables/DataGridHeader';
import {TextCell, NumericCell} from 'src/components/Tables/DataGridCell';

export const Label = styled.div`
  display: table-row;
  text-align: left;
  padding: 10px 40px 10px 120px;
  color: ${ColorPalette.gray4};
  font-size: ${Typography.size.normal};
`;

export const Value = styled.div`
  display: table-row;
  text-align: left;
  padding: 10px 40px 10px 10px;
  font-weight: ${Typography.weight.bold};
  font-size: ${Typography.size.big};
`;

export const Row = styled.div`
  border-top: 1px solid ${ColorPalette.gray2};
  min-width: 100%;
`;

interface IConnectProps {
  accountTransactions: AccountTransactionStateType;
  dispatch: (params?: any) => Promise<any> | void;
}

interface IState {
  balance: number;
  glAccountName: string;
  glType: string;
  isEmpty: boolean;
}

const REPORT_NAME = 'Account Transactions';

class AccountTransactionsPage extends React.PureComponent<IConnectProps, IState> implements IReportHandler {
  public state = {
    balance: 0,
    glAccountName: '',
    glType: '',
    isEmpty: true
  };

  public getCsvData = (): ICsvTransferFormat | null => {
    const transactions = this.props.accountTransactions.data!.data;

    if (!this.hasAccountTransactions) {
      return null;
    }

    return {
      reportName: REPORT_NAME,
      data: transactions.map((transaction: IAccountTransactionListItem) => {
        return {
          date: transaction.transaction ? DateTransformer.dehydrateDate(transaction.transaction.created_at) : '',
          description:
            transaction.transaction && transaction.transaction.payment ? transaction.transaction.payment.reference : '',
          debit: transaction.is_debit ? transaction.amount : '',
          credit: !transaction.is_debit ? transaction.amount : '',
          balance: transaction.balance
        };
      })
    };
  };

  private getAccountTransactions = (data: any) => {
    this.handlePagination(data, 0);
  };

  private filterReport = debounce(this.getAccountTransactions);

  private async handlePagination(data: any, page?: number) {
    const {dateFrom, dateTo, glAccount} = data;

    const from = DateTransformer.dehydrateDate(dateFrom);
    const to = DateTransformer.dehydrateDate(dateTo);

    if (glAccount) {
      this.setState({
        glAccountName: glAccount.name,
        glType: glAccount.account_type.name
      });

      return await this.getData(glAccount.id, page, from, to);
    } else {
      this.setEmpty();
    }
  }

  private setEmpty() {
    this.setState({
      glAccountName: '',
      glType: '',
      balance: 0,
      isEmpty: true
    });
  }

  private async getData(glAccount: number, page?: number, dateFrom?: string | null, dateTo?: string | null) {
    try {
      await this.props.dispatch(
        getAccountTransaction(glAccount, {
          date_from: dateFrom,
          date_to: dateTo,
          page
        })
      );
    } finally {
      const totalBalance =
        this.props.accountTransactions.data &&
        this.props.accountTransactions.data!.additional &&
        this.props.accountTransactions.data!.additional.total_balance;

      this.setState({balance: totalBalance ? totalBalance : 0, isEmpty: false});
    }
  }

  private renderReportRows() {
    const transactions = this.props.accountTransactions.data!.data;

    if (!transactions) {
      return null;
    }

    const nullValue = '--';

    return transactions.map((transaction: IAccountTransactionListItem) => (
      <tr key={`trans-tr-${transaction.id}`}>
        <TextCell>
          <Moment format={FRONTEND_DATE}>
            {transaction.transaction ? transaction.transaction.created_at.toString() : nullValue}
          </Moment>
        </TextCell>
        <TextCell>{nullValue}</TextCell>
        <TextCell>
          {transaction.transaction && transaction.transaction.payment && transaction.transaction.payment.reference
            ? transaction.transaction.payment.reference
            : nullValue}
        </TextCell>
        <NumericCell>{transaction.is_debit ? formatPrice(transaction.amount) + ' DR' : nullValue}</NumericCell>
        <NumericCell>{!transaction.is_debit ? formatPrice(transaction.amount) + ' CR' : nullValue}</NumericCell>
        <NumericCell>{formatPrice(transaction.balance)}</NumericCell>
      </tr>
    ));
  }

  private renderNodata() {
    return (
      <tr>
        <td className="no-items" colSpan={6}>
          No data...
        </td>
      </tr>
    );
  }

  private renderSummary() {
    const {glAccountName, glType, balance} = this.state;

    return (
      <div className="row" style={{height: '288px'}}>
        <div className=".col-lg-4 col-md-4 col-sm-12">
          <div className="d-flex flex-column h-100 align-items-stretch">
            <div className="d-flex flex-row flex-fill align-items-center">
              <div>
                <Label>Account</Label>
                <Value>{glAccountName}</Value>
              </div>
            </div>

            <Row className="d-flex flex-row flex-fill align-items-center">
              <div className="row w-100">
                <div className="col-6">
                  <Label>Account Balance</Label>
                  <Value>{formatPrice(balance)}</Value>
                </div>
                <div className="col-6">
                  <Label>Account Type</Label>
                  <Value>{glType}</Value>
                </div>
              </div>
            </Row>
          </div>
        </div>
      </div>
    );
  }

  private get hasAccountTransactions() {
    const {
      accountTransactions: {ready, data}
    } = this.props;
    const transactionData = data && data.data;
    return ready && transactionData && transactionData.length > 0 && !this.state.isEmpty;
  }

  public render() {
    const {
      accountTransactions: {loading}
    } = this.props;
    const accountTransactionsData = this.props.accountTransactions.data;
    const hasAccountTransactions = this.hasAccountTransactions;

    return (
      <>
        <ReportHeader reportName={REPORT_NAME} toCsvFn={this.getCsvData}>
          <AccountTransactionsPageFilter onSubmit={this.filterReport} />
        </ReportHeader>

        {loading ? (
          <BlockLoading size={40} color={ColorPalette.white} />
        ) : (
          <ScrollableContainer className="h-100">
            <ReportSummary>{this.renderSummary()}</ReportSummary>
            <PageContent>
              <StripedTable className="table">
                <thead>
                  <tr>
                    <TextHeader scope="col" width={'10%'}>
                      Date
                    </TextHeader>
                    <TextHeader scope="col" width="20%">
                      Description
                    </TextHeader>
                    <TextHeader scope="col" width="25%">
                      Reference
                    </TextHeader>
                    <NumericHeader scope="col" width="15%">
                      Debit
                    </NumericHeader>
                    <NumericHeader scope="col" width="15%">
                      Credit
                    </NumericHeader>
                    <NumericHeader scope="col" width="15%">
                      Balance
                    </NumericHeader>
                  </tr>
                </thead>
                <tbody>{hasAccountTransactions ? this.renderReportRows() : this.renderNodata()}</tbody>
              </StripedTable>

              {accountTransactionsData && accountTransactionsData.pagination && (
                <NotPrintable>
                  <Pagination pagination={accountTransactionsData.pagination} onChange={this.handlePagination} />
                </NotPrintable>
              )}
            </PageContent>
          </ScrollableContainer>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  accountTransactions: state.accountTransactions
});

export default compose<React.ComponentClass<{}>>(connect(mapStateToProps))(AccountTransactionsPage);

export const InternalAccountTransactionsPage = AccountTransactionsPage;
