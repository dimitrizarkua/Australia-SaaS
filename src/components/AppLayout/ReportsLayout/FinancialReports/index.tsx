import * as React from 'react';
import {connect} from 'react-redux';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {IAppState} from 'src/redux';
import {debounce} from 'lodash';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import moment, {Moment} from 'moment';
import {ILocation} from 'src/models/IAddress';
import {IGLAccount} from 'src/models/IFinance';
import ReactTooltip from 'react-tooltip';
import SubHeaderPanel from 'src/components/Layout/Common/SubHeaderPanel';
import PrintButton, {CsvSourceFormat} from 'src/components/Layout/Reports/PrintButton';
import PurpleStripeSelect from 'src/components/AppLayout/FinanceLayout/FinanceComponents/PurpleStripeSelect';
import ReportTwoPeriodsFilter, {IPeriods} from 'src/components/Layout/Reports/ReportTwoPeriodsFilter';
import FunnelFinanceFilter, {IFinFilterState} from 'src/components/Layout/Reports/FunnelFinanceFilter';
import TabNav from 'src/components/TabNav/TabNav';
import {TabsHolder} from 'src/components/AppLayout/FinanceLayout/PaymentPages/PaymentStyledComponents';
import {loadGLAccountsForLocations, selectGlAccounts} from 'src/redux/financeDucks';
import {JobTagsState, loadJobTags} from 'src/redux/jobTagsDucks';
import FinancialVolumePage from './VolumeReport';
import {FinancialRevenueReport} from 'src/components/AppLayout/ReportsLayout/FinancialReports/RevenueReport';
import {selectUserLocations, selectUserPrimaryLocation} from 'src/redux/userDucks';
import {
  PurpleStripeContent,
  PurpleStripeText,
  PrintButtonContainer
} from 'src/components/AppLayout/FinanceLayout/PaymentPages/PaymentStyledComponents';
import {FinReportScrollableContainer} from './FinReportComponents';
import {FinancialAccReceivableReport} from './AccountsReceivableReport';

interface IConnectProps {
  locations: ILocation[];
  primary_location: ILocation;
  jobTags: JobTagsState;
  glAccounts: IGLAccount[];
  dispatch: ThunkDispatch<any, any, Action>;
}

type AllProps = RouteComponentProps<{type: string}> & IConnectProps;

const TabReportConfig = [
  {name: 'Volume', id: 'volume'},
  {name: 'Revenue', id: 'revenue'},
  {name: 'Accounts Receivables', id: 'acc-receivables-report'}
];

export interface IShareFinReportProps {
  primaryLocation: ILocation;
  receiveCsvData: (fn: () => void) => any;
  currentFilterParams: IFinancialReportFilter;
}

interface IFinReportSate {
  filter: IFinancialReportFilter;
  buildCsv: () => CsvSourceFormat;
}

interface IFinancialReportFilter {
  location_id?: number;
  tag_ids?: number[];
  gl_account_id?: number;
  current_date_from: Moment;
  current_date_to: Moment;
  previous_date_from: Moment;
  previous_date_to: Moment;
  interval: number;
}

const startOfMonth = moment().startOf('month');
const endOfMonth = moment().endOf('month');
const monthLength = moment(endOfMonth).diff(startOfMonth, 'd');
const beforeStartOfMonth = moment(startOfMonth).subtract(1, 'd');
const startOfPreviousMonth = moment(beforeStartOfMonth).subtract(monthLength, 'd');

const FinanceReportInitialState: IFinancialReportFilter = {
  current_date_from: startOfMonth,
  current_date_to: endOfMonth,
  previous_date_from: startOfPreviousMonth,
  previous_date_to: beforeStartOfMonth,
  location_id: undefined,
  gl_account_id: undefined,
  interval: 1,
  tag_ids: []
};

class FinanceReport extends React.PureComponent<AllProps, IFinReportSate> {
  public state = {
    filter: FinanceReportInitialState,
    buildCsv: () => null
  };
  public componentDidMount() {
    this.getGlAccountByLocation();
    this.getTags();
  }

  public componentDidUpdate(prevProps: AllProps) {
    ReactTooltip.rebuild();
  }

  private getTags() {
    this.props.dispatch(loadJobTags());
  }

  private get getTabsConfig() {
    return TabReportConfig.map(t => ({
      ...t,
      onClick: () => {
        this.props.history.push(`/reports/financial-report/${t.id}`);
      }
    }));
  }

  private onChangeLocation = ({id}: ILocation) => {
    this.setState({filter: {...this.state.filter, location_id: id}});
    this.debounceGetGl(id);
  };

  private debounceGetGl = debounce(this.getGlAccountByLocation, 700);

  private getGlAccountByLocation(locId?: number) {
    const id = locId || this.props.primary_location.id;
    this.props.dispatch(loadGLAccountsForLocations([id]));
  }

  private onChangePeriods = (date: IPeriods) => {
    this.setState({
      filter: {
        ...this.state.filter,
        current_date_from: date.current.start,
        current_date_to: date.current.end,
        previous_date_from: date.previous.start,
        previous_date_to: date.previous.end
      }
    });
  };

  private chainCsvReceiveFunc = (receiveFunc: () => any) => {
    this.setState({buildCsv: receiveFunc});
  };

  private get activeTabs() {
    return this.props.match.params.type;
  }

  private get selectedLocation() {
    return this.state.filter.location_id || this.props.primary_location.id;
  }

  private handleChangeFilter = ({selectedGlAccount, selectedTags}: IFinFilterState) => {
    this.setState({
      filter: {
        ...this.state.filter,
        gl_account_id: (selectedGlAccount && selectedGlAccount.id) || undefined,
        tag_ids: selectedTags.map(i => i.id)
      }
    });
  };

  private renderContent = () => {
    let Report;
    const shareReportProps: IShareFinReportProps = {
      primaryLocation: this.props.primary_location,
      receiveCsvData: this.chainCsvReceiveFunc,
      currentFilterParams: {...this.state.filter, location_id: this.selectedLocation}
    };

    switch (this.activeTabs) {
      case 'volume':
        Report = FinancialVolumePage;
        break;
      case 'revenue':
        Report = FinancialRevenueReport;
        break;
      case 'acc-receivables-report':
        Report = FinancialAccReceivableReport;
        break;
      default:
        return null;
    }

    return <Report {...shareReportProps} />;
  };

  private locationToValue = (option: ILocation) => option.id.toString();
  private locationToLabel = (option: ILocation) => option.name;

  public render() {
    const {
      locations,
      glAccounts,
      jobTags: {data: tags}
    } = this.props;
    const {
      filter: {previous_date_from, previous_date_to, current_date_from, current_date_to},
      buildCsv
    } = this.state;

    return (
      <div className="h-100">
        <SubHeaderPanel>
          <PurpleStripeContent>
            <PrintButtonContainer>
              <PrintButton transformToTable={buildCsv} />
            </PrintButtonContainer>

            <PurpleStripeSelect
              options={locations}
              value={this.selectedLocation}
              getOptionValue={this.locationToValue}
              getOptionLabel={this.locationToLabel}
              onChange={this.onChangeLocation}
              placeholder="Select location..."
              transformValueById={true}
              withBorder={true}
            />

            <ReportTwoPeriodsFilter
              onChange={this.onChangePeriods}
              defaultPeriods={{
                current: {
                  start: current_date_from,
                  end: current_date_to
                },
                previous: {
                  start: previous_date_from,
                  end: previous_date_to
                }
              }}
            />

            <FunnelFinanceFilter glAccounts={glAccounts} tags={tags} onChange={this.handleChangeFilter} />

            <PurpleStripeText>Financial Report</PurpleStripeText>
          </PurpleStripeContent>
        </SubHeaderPanel>
        <TabsHolder>
          <TabNav items={this.getTabsConfig} selectedTabId={this.activeTabs} />
        </TabsHolder>
        <FinReportScrollableContainer className="w-100">{this.renderContent()}</FinReportScrollableContainer>
      </div>
    );
  }
}

function mapStateToProps(state: IAppState) {
  return {
    jobTags: state.jobTags,
    locations: selectUserLocations(state),
    primary_location: selectUserPrimaryLocation(state),
    glAccounts: selectGlAccounts(state)
  };
}

const FinanceReportWrapper = compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps)
)(FinanceReport);

export {FinanceReportWrapper as FinanceReport};
