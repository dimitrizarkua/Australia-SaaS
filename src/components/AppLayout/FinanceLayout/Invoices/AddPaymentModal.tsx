import * as React from 'react';
import {Action} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {ThunkDispatch} from 'redux-thunk';
import moment from 'moment';
import ModalCreditCard from 'src/components/Modal/Finance/ModalCreditCard';
import ModalDirectDeposit from 'src/components/Modal/Finance/ModalDirectDeposit';
import {IGLAccount} from 'src/models/IFinance';
import {formatPrice} from 'src/utility/Helpers';
import PaymentsService from 'src/services/PaymentsService';
import {IInvoice} from 'src/models/FinanceModels/IInvoices';
import {loadGLAccounts} from 'src/redux/financeDucks';

interface IOwnProps {
  invoice: IInvoice;
  onPaymentReceive: () => any;
  onClose: () => void;
}

interface IConnectProps {
  glAccounts: IGLAccount[];
  dispatch: ThunkDispatch<IAppState, unknown, Action>;
}

enum PaymentType {
  DirectDeposit,
  CreditCard
}

interface IState {
  paymentType: PaymentType;
}

type IProps = IOwnProps & IConnectProps;

class AddPaymentModal extends React.PureComponent<IProps, IState> {
  public state = {
    paymentType: PaymentType.CreditCard
  };

  public componentDidMount() {
    this.props.dispatch(loadGLAccounts(this.props.invoice.accounting_organization_id));
  }

  private receiveCreditCardPayment = async (formData: any) => {
    return this.receivePayment(formData, PaymentsService.receiveWithCreditCard);
  };

  private receiveDirectDepositPayment = async (formData: any) => {
    return this.receivePayment(formData, PaymentsService.receiveDirectDeposit);
  };

  private receivePayment = async (formData: any, requestMethod: (id: number, formData: any) => Promise<any>) => {
    const res = await requestMethod(this.props.invoice.id, formData);
    if (this.props.onPaymentReceive) {
      this.props.onPaymentReceive();
    }
    return res;
  };

  private switchPaymentWindow = () => {
    this.setState(({paymentType}) => ({
      paymentType: paymentType === PaymentType.CreditCard ? PaymentType.DirectDeposit : PaymentType.CreditCard
    }));
  };

  private get payableAccounts() {
    return this.props.glAccounts.filter((acc: any) => acc.enable_payments_to_account);
  }

  public render() {
    const {invoice, onClose} = this.props;
    const {paymentType} = this.state;
    const mailingAddress = invoice.recipient_contact && invoice.recipient_contact.mailing_address;

    return (
      <>
        <ModalDirectDeposit
          invoiceData={invoice}
          onSubmit={this.receiveDirectDepositPayment}
          isOpen={paymentType === PaymentType.DirectDeposit}
          onClose={onClose}
          onSwitchPaymentType={this.switchPaymentWindow}
          glAccounts={this.payableAccounts}
          initialValues={{
            email: invoice.recipient_contact && invoice.recipient_contact!.email,
            paid_at: moment(),
            amount: invoice.amount_due !== undefined ? formatPrice(invoice.amount_due) : undefined
          }}
        />
        <ModalCreditCard
          initialValues={{
            email: invoice.recipient_contact && invoice.recipient_contact!.email,
            billing_address1: mailingAddress && mailingAddress.address_line_1,
            billing_city: mailingAddress && mailingAddress.suburb && mailingAddress.suburb.name,
            billing_country: mailingAddress && mailingAddress.country ? mailingAddress.country.name : 'Australia'
          }}
          invoiceData={invoice}
          isOpen={paymentType === PaymentType.CreditCard}
          onSubmit={this.receiveCreditCardPayment}
          onClose={onClose}
          onSwitchPaymentType={this.switchPaymentWindow}
        />
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  glAccounts: state.finance.glAccounts
});

export default connect(mapStateToProps)(AddPaymentModal);
