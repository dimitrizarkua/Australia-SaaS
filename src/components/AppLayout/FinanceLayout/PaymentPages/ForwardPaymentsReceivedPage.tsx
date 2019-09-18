import * as React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {IAppState} from 'src/redux';
import styled from 'styled-components';
import * as qs from 'qs';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import debounce from 'debounce-promise';
import Moment from 'react-moment';
import {IReturnType} from 'src/redux/reduxWrap';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {ILocation} from 'src/models/IAddress';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import SubHeaderPanel from 'src/components/Layout/Common/SubHeaderPanel';
import PurpleStripeSelect from '../FinanceComponents/PurpleStripeSelect';
import PrintButton from 'src/components/Layout/Reports/PrintButton';
import {getReceivedPayments, getReceivedPaymentsInfo} from 'src/redux/forwardPaymentsReceivedDucks';
import ForwardPaymentTabs, {ForwardTabs} from './ForwardPaymentsTabs';
import {DarkRow, PurpleStripeContent, PurpleStripeText, PrintButtonContainer} from './PaymentStyledComponents';
import PlainTable from 'src/components/Tables/PlainTable';
import ValueWithLabel from '../FinanceComponents/ValueWithLabel';
import {formatPrice} from 'src/utility/Helpers';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import PageContent from 'src/components/Layout/PageContent';
import FinanceYearSelect from '../FinanceComponents/FinanceYearSelect';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {getEntityById} from 'src/services/helpers/ApiHelpers';
import {FRONTEND_DATE} from 'src/constants/Date';

const LabelsColumn = styled.div`
  margin-right: 70px;
`;

export const ReceivedPaimentTable = styled(PlainTable)`
  th {
    font-weight: ${Typography.weight.normal};
  }
  th:nth-child(4) ~ th,
  td:nth-child(4) ~ td {
    text-align: right;
    padding-right: 15px;
  }
  tr.payment-row {
    background: ${ColorPalette.gray0};
  }
`;

interface IState {
  locationId?: number;
}

interface IConnectProps {
  payments: IReturnType<any>;
  info: IReturnType<any>;
  locations: ILocation[];
  dispatch: (params?: any) => Promise<any> | void;
}

type AllProps = RouteComponentProps<{}> & IConnectProps;

// TODO: after API implement, use it
class ForwardPaymentsRemittencesPageInternal extends React.PureComponent<AllProps, IState> {
  public state = {locationName: undefined, locationId: undefined};

  public componentDidMount() {
    const queryParams = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    if (queryParams.location) {
      this.getPayments({id: +queryParams.location});
    } else {
      this.getPaymentsForPrymary();
    }
  }

  private getLocationNameById = (id?: number) => {
    const location = getEntityById(this.props.locations, id) as ILocation;
    return location && location.name;
  };

  public componentDidUpdate(prevProps: AllProps, prevState: IState) {
    if (!prevState.locationId && prevProps.locations.length !== this.props.locations.length) {
      this.getPaymentsForPrymary();
    }
  }

  private getPaymentsForPrymary() {
    if (this.primaryLocation) {
      this.getPayments(this.primaryLocation);
    }
  }

  private getPayments = ({id}: {id?: number}) => {
    this.setState({locationId: id});
    this.props.dispatch(getReceivedPayments({locations: [id]}));
    this.props.dispatch(getReceivedPaymentsInfo({locations: [id]}));
  };

  private debouncedGetPayments = debounce(this.getPayments);

  private dataToExport = () => {
    const data: any[] = [];
    // TODO consider what happens here
    this.allPaymentsData.forEach((payment: any) => {
      data.push({
        date: payment.date,
        'remittance reference/payment': `Receipt ${payment.id}`,
        'from account': payment.source_gl_account_id,
        'to account': payment.destination_gl_account_id,
        amount: '',
        total: formatPrice(payment.total_amount)
      });
      payment.invoice.forEach((invoice: any) => {
        data.push({
          date: '',
          'remittance reference/payment': `Inv. ${invoice.id}`,
          'from account': '',
          'to account': '',
          amount: formatPrice(invoice.amount),
          total: ''
        });
      });
    });

    return {
      reportName: 'Forward_payments_received',
      data: this.allPaymentsData.map((payment: any) => ({
        'originally paid': payment.due_at,
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

  private renderPaymentsTable() {
    return (
      <ReceivedPaimentTable className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Remittence Reference/Payment</th>
            <th>From Account</th>
            <th>To Account</th>
            <th>Amount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>{this.allPaymentsData.map(payment => this.renderPayments(payment))}</tbody>
      </ReceivedPaimentTable>
    );
  }

  private renderPayments(payment: any) {
    return (
      <>
        <tr key={`pmnt-row-${payment.id}`} className="payment-row">
          <td>
            <Moment format={FRONTEND_DATE}>{payment.date}</Moment>
          </td>
          <td>Receipt {payment.id}</td>
          <td>{payment.source_gl_account_id}</td>
          <td>{payment.destination_gl_account_id}</td>
          <td>{}</td>
          <td>{formatPrice(payment.total_amount)}</td>
        </tr>
        {payment.invoices.map((invoice: any) => (
          <tr key={`pmnt-inv-${payment.id}-${invoice.id}`}>
            <td>{}</td>
            <td>Inv. {invoice.id}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{formatPrice(invoice.amount)}</td>
          </tr>
        ))}
      </>
    );
  }

  private get primaryLocation() {
    return this.props.locations.find(l => !!l.primary);
  }

  public render() {
    const {
      locations,
      info,
      payments: {loading}
    } = this.props;
    const loadingInfo = this.props.info.loading;
    const monthAmount = info.data && formatPrice(info.data.month);
    const yearAmount = info.data && formatPrice(info.data.year);
    const overall = info.data && formatPrice(info.data.overall);
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
                <FinanceYearSelect onChange={this.debouncedGetPayments} />
                <PurpleStripeText>Forward Invoice Payments</PurpleStripeText>
              </PurpleStripeContent>
            </SubHeaderPanel>
            <ForwardPaymentTabs
              activeTabId={ForwardTabs.received}
              onChangePage={() =>
                this.props.history.push({
                  pathname: '/finance/forward-invoice-payments/new',
                  search: this.state.locationId ? `location=${this.state.locationId}` : ''
                })
              }
            />
            <DarkRow>
              {loadingInfo && <BlockLoading size={40} color={ColorPalette.white} />}
              <LabelsColumn>
                <ValueWithLabel label="Location" value={locationName} hasDelimiter={true} />
                <ValueWithLabel label="Overall Total" value={overall} />
              </LabelsColumn>
              <LabelsColumn>
                <ValueWithLabel label="Selected Financial Year" value={yearAmount} hasDelimiter={true} />
                <ValueWithLabel label="This Month" value={monthAmount} />
              </LabelsColumn>
            </DarkRow>
            {context.has(Permission.PAYMENTS_VIEW) && (
              <PageContent>
                {loading && <BlockLoading size={40} color={ColorPalette.white} />}
                {!loading && this.allPaymentsData.length === 0 && this.renderPaymentsTable()}
              </PageContent>
            )}
          </ScrollableContainer>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  payments: state.forwardPaymentsReceived,
  info: state.forwardPaymentsReceivedInfo,
  locations: state.user.locations
});

export default compose<React.ComponentClass<{}>>(
  withRouter,
  connect(mapStateToProps)
)(ForwardPaymentsRemittencesPageInternal);
