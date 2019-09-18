import * as React from 'react';
import {connect} from 'react-redux';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {IAppState} from 'src/redux';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import debounce from 'debounce-promise';
import LookupInvoiceForm from './LookupInvoiceForm';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import PageContent from 'src/components/Layout/PageContent';
import JobInfo from '../FinanceComponents/JobInfo';
import CommonStyledComponents from 'src/components/Layout/Common/StyledComponents';
import {IInvoiceForPayment, PaymentTypesEnum} from 'src/models/FinanceModels/IInvoices';
import {IGLAccount} from 'src/models/IFinance';
import {ILocation} from 'src/models/IAddress';
import CheckboxSimple from 'src/components/Form/CheckboxSimple';
import InlineSelect from 'src/components/Form/InlineSelect';
import PriceInput from 'src/components/Form/InlinePriceInput';
import {CellContent, InvoiceCellContent, PaymentsTable} from './PaymentStyledComponents';
import ReceivePaymentForm from './ReceivePaymentForm';
import {formatPrice} from 'src/utility/Helpers';
import {
  ReceivePaymentsStateType,
  searchPaymentInvoices,
  toggleSelection,
  setPaymentType,
  setAmount
} from 'src/redux/receivePaymentsDucks';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {loadGLAccountsForCurrentUser} from 'src/redux/financeDucks';
import PaymentService from 'src/services/PaymentsService';
import moment from 'moment';

const LightRow = styled(CommonStyledComponents.ColoredRow)`
  background: ${ColorPalette.gray0};
  .form-group.form__dark {
    width: 400px;
    textarea,
    input {
      background: ${ColorPalette.white};
      border: 1px solid ${ColorPalette.gray2};
    }
    textarea {
      min-height: 90px;
    }
  }
  button[type='submit'] {
    margin-top: 5px;
  }
`;

const DarkRow = CommonStyledComponents.ColoredRow;

const InvoicesTableHeader = styled.h2`
  font-size: ${Typography.size.normal};
  font-weight: ${Typography.weight.bold};
  text-transform: uppercase;
  margin: 45px 0 15px;
`;

interface IConnectProps {
  receivePayments: ReceivePaymentsStateType;
  glAccounts: IGLAccount[];
  locations: ILocation[];
  dispatch: ThunkDispatch<any, any, Action>;
}

export class ReceivePaymentPageInternal extends React.PureComponent<IConnectProps> {
  public componentDidMount() {
    this.props.dispatch(loadGLAccountsForCurrentUser());
  }

  public componentDidUpdate(prevProps: IConnectProps) {
    if (!prevProps.locations.length && this.props.locations.length) {
      this.props.dispatch(loadGLAccountsForCurrentUser());
    }
  }

  private lookupTerm: string = '';

  private getPaymentInvoices = (data: any) => {
    const {term} = data;
    this.lookupTerm = term;
    this.props.dispatch(searchPaymentInvoices(term));
  };

  private debouncedSearch = debounce(this.getPaymentInvoices);

  private get invoicesData() {
    return ((this.props.receivePayments.data && this.props.receivePayments.data!.data) || []) as IInvoiceForPayment[];
  }

  private toggleSelection = (invoice: IInvoiceForPayment) => {
    this.props.dispatch(toggleSelection(invoice));
  };

  private setPaymentType = (id: string | number, paymentType: PaymentTypesEnum) => {
    this.props.dispatch(setPaymentType(id, paymentType));
  };

  private setAmount = (id: string | number, e: any) => {
    this.props.dispatch(setAmount(id, +e.target.value.replace(/[^\d\.]/g, '')));
  };

  private get selectedAmount() {
    return this.selectedInvoices.reduce(
      (res: number, invoice: IInvoiceForPayment) => (invoice.payment_amount ? res + invoice.payment_amount : res),
      0
    );
  }

  private get selectedInvoices() {
    const {receivePayments} = this.props;
    if (receivePayments.data!.selectedIds) {
      return this.invoicesData.filter(inv => this.invoiceIsSelected(+inv.id));
    }
    return [];
  }

  private get paymentTypeOptions() {
    const options = [];
    for (const type in PaymentTypesEnum) {
      if (PaymentTypesEnum.hasOwnProperty(type)) {
        options.push({value: type, label: type});
      }
    }
    return options;
  }

  private invoiceIsSelected = (id: number) => {
    const {receivePayments} = this.props;
    if (receivePayments.data!.selectedIds) {
      return receivePayments.data!.selectedIds.includes(id);
    }
    return false;
  };

  private get bankAccounts() {
    return this.props.glAccounts.filter((acc: any) => acc.is_bank_account);
  }

  private get primaryLocation() {
    return this.props.locations.find(l => !!l.primary);
  }

  private receivePayment = (params: any) => {
    const paymentParams = {
      ...params,
      location_id: this.primaryLocation
    };
    const paymentInvoices = this.selectedInvoices.map(inv => ({
      invoice_id: +inv.id,
      is_fp: inv.payment_type === PaymentTypesEnum.FP,
      amount: inv.payment_amount || 0
    }));
    return PaymentService.receivePayment(paymentParams, paymentInvoices).then(this.refreshLookup);
  };

  private refreshLookup() {
    this.getPaymentInvoices({term: this.lookupTerm});
  }

  private renderInvoicesTable() {
    if (!this.invoicesData.length) {
      return null;
    }
    return (
      <>
        <InvoicesTableHeader>Invoices found</InvoicesTableHeader>
        <PaymentsTable className="table">
          <tbody>{this.invoicesData.map(invoice => this.renderInvoiceRow(invoice))}</tbody>
        </PaymentsTable>
      </>
    );
  }

  private renderInvoiceRow(invoice: IInvoiceForPayment) {
    const isSelected = this.invoiceIsSelected(+invoice.id);
    const className = isSelected ? 'selected-row' : '';
    return (
      <tr key={`rp-row-${invoice.id}`} className={className}>
        <td>
          <CheckboxSimple
            value={isSelected}
            onChange={(data: any) => this.toggleSelection(invoice)}
            size={15}
            inversedColors={true}
          />
        </td>
        <td>
          <InvoiceCellContent>
            <div>Inv. {invoice.id}</div>
            <div>GEEL | {invoice.recipient_name}</div>
          </InvoiceCellContent>
        </td>
        <td>
          <CellContent>
            <JobInfo job={invoice.job} />
            <div>{invoice.job && invoice.job.insurer_name}</div>
          </CellContent>
        </td>
        <td>
          <CellContent>
            <div>{formatPrice(invoice.balance_due)}</div>
            <div>Balance due</div>
          </CellContent>
        </td>
        <td>
          {!!invoice.payment_type && (
            <InlineSelect
              defaultValue={{
                label: PaymentTypesEnum[invoice.payment_type],
                value: invoice.payment_type
              }}
              options={this.paymentTypeOptions}
              onChange={(val: any) => this.setPaymentType(invoice.id, val.value)}
            />
          )}
        </td>
        <td>
          <PriceInput
            value={formatPrice(invoice.payment_amount || 0)}
            onBlur={(e: any) => this.setAmount(invoice.id, e)}
          />
        </td>
      </tr>
    );
  }

  public render() {
    const {loading} = this.props.receivePayments;
    return (
      <UserContext.Consumer>
        {context => (
          <ScrollableContainer className="h-100">
            <DarkRow>
              {context.has(Permission.PAYMENTS_CREATE) && (
                <ReceivePaymentForm
                  onSubmit={this.receivePayment}
                  disabled={this.invoicesData.length === 0}
                  totalSelected={this.selectedAmount}
                  glAccounts={this.bankAccounts}
                  initialValues={{
                    paid_at: moment()
                  }}
                />
              )}
            </DarkRow>
            <LightRow>
              <LookupInvoiceForm onSubmit={this.debouncedSearch} />
            </LightRow>
            {context.has(Permission.PAYMENTS_VIEW) && (
              <PageContent>
                {loading && <BlockLoading size={40} color={ColorPalette.white} />}
                {!loading && this.invoicesData.length > 0 && this.renderInvoicesTable()}
              </PageContent>
            )}
          </ScrollableContainer>
        )}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  receivePayments: state.receivePayments,
  glAccounts: state.finance.glAccounts,
  locations: state.user.locations
});

export default connect(mapStateToProps)(ReceivePaymentPageInternal);
