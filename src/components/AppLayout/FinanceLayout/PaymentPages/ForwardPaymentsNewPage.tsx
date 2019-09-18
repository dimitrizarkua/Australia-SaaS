import * as React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {IAppState} from 'src/redux';
import styled from 'styled-components';
import * as qs from 'qs';
import ColorPalette from 'src/constants/ColorPalette';
import debounce from 'debounce-promise';
import Moment from 'react-moment';
import PurpleStripeSelect from '../FinanceComponents/PurpleStripeSelect';
import {formatPrice} from 'src/utility/Helpers';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import PageContent from 'src/components/Layout/PageContent';
import {
  CellContent,
  InvoiceCellContent,
  PaymentsTable,
  DarkRow,
  PurpleStripeContent,
  PurpleStripeText,
  PrintButtonContainer
} from './PaymentStyledComponents';
import {IGLAccount} from 'src/models/IFinance';
import {ILocation} from 'src/models/IAddress';
import {
  InvoicePaymentsStateType,
  togglePayment,
  massSelect,
  resetSelection,
  getPayments,
  forwardPayments
} from 'src/redux/forwardPaymentsDucks';
import ForwardPaymentTabs, {ForwardTabs} from './ForwardPaymentsTabs';
import JobInfo from '../FinanceComponents/JobInfo';
import CheckboxSimple from 'src/components/Form/CheckboxSimple';
import SubHeaderPanel from 'src/components/Layout/Common/SubHeaderPanel';
import PrintButton from 'src/components/Layout/Reports/PrintButton';
import ForwardInvoicePaymentsForm, {ForwardPaymentsFormProps} from './ForwardInvoicePaymentsForm';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {getEntityById} from 'src/services/helpers/ApiHelpers';
import {FRONTEND_DATE} from 'src/constants/Date';
import withData, {IResource} from 'src/components/withData/withData';
import AccountTransactionService, {IAccountTransactionsListSuccess} from 'src/services/AccountTransactionService';
import {loadGLAccountsForLocations} from 'src/redux/financeDucks';

const ForwardPaymentsTable = styled(PaymentsTable)`
  th:last-child,
  td:last-child {
    text-align: right;
  }
  tr.selected-row {
    background-color: ${ColorPalette.blue0};
    &:hover {
      opacity: 0.75;
    }
  }
`;

interface IWithDataProps {
  glAccountInfo: IResource<IAccountTransactionsListSuccess>;
}

interface IConnectProps {
  payments: InvoicePaymentsStateType;
  glAccounts: IGLAccount[];
  locations: ILocation[];
  dispatch: (params?: any) => Promise<any> | void;
}

interface IState {
  locationId?: number;
  allSelected: boolean;
}

type AllProps = RouteComponentProps<{}> & IConnectProps & IWithDataProps;

class ForwardInvoicePaymentsPageInternal extends React.PureComponent<AllProps, IState> {
  public state = {
    allSelected: false,
    locationId: undefined
  };

  public componentDidMount() {
    const queryParams = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true
    });

    if (queryParams.location) {
      this.getPayments({id: +queryParams.location});
    } else {
      this.getPaymentsForPrymary();
    }
  }

  public componentDidUpdate(prevProps: AllProps, prevState: IState) {
    if (!prevState.locationId && prevProps.locations.length !== this.props.locations.length) {
      this.getPaymentsForPrymary();
    }
  }

  private getLocationNameById = (id?: number) => {
    const location = getEntityById(this.props.locations, id) as ILocation;
    return location && location.name;
  };

  private getPaymentsForPrymary() {
    if (this.primaryLocation) {
      this.getPayments(this.primaryLocation);
    }
  }

  private getPayments = ({id}: {id: number}) => {
    this.setState({locationId: id});
    this.props.dispatch(getPayments({location_id: id}));
    this.props.dispatch(loadGLAccountsForLocations([id]));
  };

  private debouncedGetPayments = debounce(this.getPayments);

  private fetchGLAccountInfo = ({id}: any) => {
    this.props.glAccountInfo.fetch(id);
  };

  private dataToExport = () => {
    return {
      reportName: 'Forward_payments_new',
      data: this.allPaymentsData.map((payment: any) => ({
        'originally payd': payment.due_at,
        invoice: `Inv. ${payment.id}`,
        job: payment.job ? `# ${payment.job.id}${payment.job.location_code}: ${payment.job.insurer_name}` : '',
        amount: formatPrice(payment.total_amount)
      }))
    };
  };

  private get allPaymentsData() {
    const {payments} = this.props;
    return ((payments.data && payments.data!.data) || []) as any[];
  }

  private get selectedPayments() {
    const {payments} = this.props;
    if (payments.data!.selectedIds) {
      return this.allPaymentsData.filter(p => this.paymentIsSelected(p.id));
    }
    return [];
  }

  private paymentIsSelected = (id: number) => {
    const {payments} = this.props;
    if (payments.data!.selectedIds) {
      return payments.data!.selectedIds.includes(id);
    }
    return false;
  };

  private selectAll = (val: any) => {
    this.setState({allSelected: !this.state.allSelected}, () => {
      if (this.state.allSelected && this.allPaymentsData.length) {
        this.props.dispatch(massSelect(this.allPaymentsData));
      } else {
        this.props.dispatch(resetSelection());
      }
    });
  };

  private toggleSelection = (payment: any) => {
    this.props.dispatch(togglePayment(payment));
    this.setState({allSelected: false});
  };

  private calcBalance = (payments: any[]) => {
    return payments.reduce((res: number, p: any) => res + p.total_amount, 0);
  };

  private forwardPayments = (data: ForwardPaymentsFormProps) => {
    if (this.state.locationId !== undefined) {
      this.props.dispatch(
        forwardPayments(
          {
            ...data,
            location_id: this.state.locationId,
            source_gl_account_id: data.source_gl_account_id.id,
            destination_gl_account_id: data.destination_gl_account_id.id
          },
          {location_id: this.state.locationId}
        )
      );
    }
  };

  private renderPaymentRow(payment: any) {
    const isSelected = this.paymentIsSelected(+payment.id);
    const className = isSelected ? 'selected-row' : '';
    return (
      <tr key={`pmnt-row-${payment.id}`} className={className}>
        <td>
          <CheckboxSimple
            value={isSelected}
            onChange={(data: any) => this.toggleSelection(payment)}
            size={15}
            inversedColors={true}
          />
        </td>
        <td>
          <Moment format={FRONTEND_DATE}>{payment.due_at}</Moment>
        </td>
        <td>
          <InvoiceCellContent>
            <div>Inv. {payment.id}</div>
            <div>GEEL | Suncorp Insurance</div>
          </InvoiceCellContent>
        </td>
        <td>
          <CellContent>
            <JobInfo job={payment.job} withoutName={true} />
            <div>{payment.job && payment.job.insurer_name}</div>
          </CellContent>
        </td>
        <td>{formatPrice(payment.total_amount)}</td>
      </tr>
    );
  }

  private renderPaymentsTable() {
    return (
      <ForwardPaymentsTable className="table">
        <thead>
          <tr>
            <th>
              <CheckboxSimple
                value={this.state.allSelected}
                onChange={this.selectAll}
                size={15}
                inversedColors={true}
              />
            </th>
            <th>Originally Paid</th>
            <th>Invoice</th>
            <th>Job</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>{this.allPaymentsData.map(payment => this.renderPaymentRow(payment))}</tbody>
      </ForwardPaymentsTable>
    );
  }

  private get primaryLocation() {
    return this.props.locations.find(l => !!l.primary);
  }

  public render() {
    const {locations, glAccounts} = this.props;
    const paymentsData = this.props.payments.data;
    const {loading} = this.props.payments;
    const disableSubmit = loading || !(paymentsData && paymentsData.data && paymentsData.data.length);
    const totalAmount = this.props.glAccountInfo.data ? this.props.glAccountInfo.data.additional.total_balance : 0;

    const totalRemittence = this.calcBalance(this.selectedPayments);
    const locationName = this.getLocationNameById(this.state.locationId);

    return (
      <UserContext.Consumer>
        {context => (
          <ScrollableContainer className="h-100">
            <SubHeaderPanel>
              <PurpleStripeContent>
                <PrintButtonContainer>
                  <PrintButton transformToTable={this.dataToExport} />
                </PrintButtonContainer>
                <PurpleStripeSelect
                  options={locations}
                  value={this.state.locationId ? {id: this.state.locationId, name: locationName} : undefined}
                  getOptionValue={(option: ILocation) => option.id.toString()}
                  getOptionLabel={(option: ILocation) => option.name}
                  onChange={this.debouncedGetPayments}
                  placeholder="Select location..."
                  withBorder={true}
                />
                <PurpleStripeText>Forward Invoice Payments</PurpleStripeText>
              </PurpleStripeContent>
            </SubHeaderPanel>
            <ForwardPaymentTabs
              activeTabId={ForwardTabs.new}
              onChangePage={() =>
                this.props.history.push({
                  pathname: '/finance/forward-invoice-payments/received',
                  search: this.state.locationId ? `location=${this.state.locationId}` : ''
                })
              }
            />
            <DarkRow>
              {context.has(Permission.PAYMENTS_FORWARD) && (
                <ForwardInvoicePaymentsForm
                  totalAvailable={totalAmount}
                  totalRemittence={totalRemittence}
                  locationName={locationName}
                  glAccounts={glAccounts}
                  disabled={disableSubmit}
                  onSubmit={this.forwardPayments}
                  onChangeGLAccount={this.fetchGLAccountInfo}
                  loading={loading}
                />
              )}
            </DarkRow>
            {context.has(Permission.PAYMENTS_VIEW) && (
              <PageContent>
                {loading && <BlockLoading size={40} color={ColorPalette.white} />}
                {!loading && this.allPaymentsData.length > 0 && this.renderPaymentsTable()}
              </PageContent>
            )}
          </ScrollableContainer>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  payments: state.forwardPayments,
  glAccounts: state.finance.glAccounts,
  locations: state.user.locations
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  withData({
    glAccountInfo: {
      fetch: AccountTransactionService.getAccountTransactionsByGlAccountId
    }
  }),
  connect(mapStateToProps)
)(ForwardInvoicePaymentsPageInternal);
