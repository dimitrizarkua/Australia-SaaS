import React from 'react';
import {IGLAccount, IAccountingOrganization} from 'src/models/IFinance';
import {IAppState} from 'src/redux';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {InnerHeadBlock} from 'src/components/Layout/Reports/InnerHeadBlock';
import moment, {Moment} from 'moment';
import ContactService from 'src/services/ContactService';
import ReportFilterDropdown from 'src/components/Layout/Reports/ReportFilterDropdown';
import ReportFilterDatePeriod, {IDatePeriodResponse} from 'src/components/Layout/Reports/ReportFilterDatePeriod';
import withData, {IResource} from 'src/components/withData/withData';
import FinanceService from 'src/services/FinanceService';
import {IUserState} from 'src/redux/userDucks';
import debounce from 'debounce-promise';

interface IProps {
  onSubmit: (data?: any) => void | any;
}

interface IState {
  dateFromSelected: Moment;
  dateToSelected: Moment;
  glAccountSelected: IGLAccount | null;
  aoSelected: IAccountingOrganization | null;
}

interface IConnectProps {
  accountingOrganizations: IAccountingOrganization[];
  user: IUserState;
}

interface IWithDataProps {
  glAccountsFilter: IResource<IGLAccount[]>;
}

class AccountTransactionsPageFilter extends React.PureComponent<IProps & IConnectProps & IState & IWithDataProps> {
  public state: IState = {
    dateFromSelected: moment(),
    dateToSelected: moment(),
    glAccountSelected: null,
    aoSelected: null
  };

  public componentDidUpdate(prevProps: any, prevState: IState) {
    const {dateFromSelected, dateToSelected, glAccountSelected} = this.state;

    if (
      !dateFromSelected.isSame(prevState.dateFromSelected) ||
      !dateToSelected.isSame(prevState.dateToSelected) ||
      glAccountSelected !== prevState.glAccountSelected
    ) {
      const dataToSend = {
        dateFrom: dateFromSelected,
        dateTo: dateToSelected,
        glAccount: glAccountSelected
      };
      this.props.onSubmit(dataToSend);
    }
  }

  private glAccountNameRender(el: IGLAccount) {
    return el.name;
  }

  private onGlAccountChange = (el: IGLAccount) => {
    this.setState({glAccountSelected: el});
  };

  private onAoChange = async (el: IAccountingOrganization) => {
    this.setState({aoSelected: el});
    try {
      await this.debouncedSearch({accounting_organization_id: el.id});
    } finally {
      const {
        glAccountsFilter: {data}
      } = this.props;
      if (data && data.length > 0) {
        this.setState({glAccountSelected: data[0]});
      } else {
        this.setState({glAccountSelected: null});
      }
    }
  };

  private debouncedSearch = debounce(this.props.glAccountsFilter.fetch, 500);

  private aoNameRender(el: IAccountingOrganization) {
    return ContactService.getContactName(el.contact);
  }

  private onDateChange = (date: IDatePeriodResponse) => {
    this.setState({dateFromSelected: date.startDate, dateToSelected: date.endDate});
  };

  public render() {
    const {
      glAccountsFilter: {data},
      accountingOrganizations,
      user
    } = this.props;
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    return (
      <>
        <InnerHeadBlock>
          <ReportFilterDatePeriod
            onChange={this.onDateChange}
            defaultStartDate={startOfMonth}
            defaultEndDate={endOfMonth}
          />
        </InnerHeadBlock>
        <InnerHeadBlock>
          {!accountingOrganizations || (accountingOrganizations && accountingOrganizations.length === 0) ? (
            <div>No Accounting Organizations</div>
          ) : (
            <ReportFilterDropdown
              items={accountingOrganizations}
              onChange={this.onAoChange}
              placeHolder="Select Accounting Organization..."
              nameRender={this.aoNameRender}
              defaultValueById={user.locations[0]}
            />
          )}
        </InnerHeadBlock>
        <InnerHeadBlock>
          {!data || (data && data.length === 0) ? (
            <div>No GL Accounts</div>
          ) : (
            <ReportFilterDropdown
              items={data}
              onChange={this.onGlAccountChange}
              placeHolder="Select GL Account..."
              nameRender={this.glAccountNameRender}
              defaultValueById={data[0].id}
              selectItemById={data[0].id}
            />
          )}
        </InnerHeadBlock>
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  accountingOrganizations: state.finance.accountingOrganizations,
  user: state.user
});

export default compose<React.ComponentClass<any>>(
  connect(mapStateToProps),
  withData<IProps>({
    glAccountsFilter: {
      fetch: FinanceService.searchGLAccounts
    }
  })
)(AccountTransactionsPageFilter);
