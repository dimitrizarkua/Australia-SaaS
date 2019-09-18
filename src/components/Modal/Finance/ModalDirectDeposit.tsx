import * as React from 'react';
import styled from 'styled-components';
import {InjectedFormProps, ConfigProps, Field, reduxForm} from 'redux-form';
import ColorPalette from 'src/constants/ColorPalette';
import {IInvoice} from 'src/models/FinanceModels/IInvoices';
import {IModal} from 'src/models/IModal';
import {IGLAccount} from 'src/models/IFinance';
import {IPaymentReceipt} from 'src/models/FinanceModels/IPayments';
import Modal from '../Modal';
import ModalWindow from '../ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import Input from 'src/components/Form/Input';
import Select from 'src/components/Form/Select';
import DateTime from 'src/components/Form/DateTime';
import {required} from 'src/services/ValidationService';
import InvoicePaymentBar from './InvoicePaymentBar';
import {normalizePrice} from 'src/utility/Normalizers';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import {PaymentForm, PaymentFormError, PaymentFormSuccess, PaymentReceipt} from './PaymentFormComponents';
import {Moment} from 'moment';
import FinanceService from 'src/services/FinanceService';
import {priceToValue} from 'src/transformers/PaymentTransformer';
import {formatPrice} from 'src/utility/Helpers';

const GLAccountInfo = styled.div`
  margin-top: 23px;
  color: ${ColorPalette.gray4};
`;

export interface IForm {
  amount: string;
  paid_at: Moment;
  gl_account_id: IGLAccount;
  reference: string;
}

interface IState {
  glAccountInfoLine1: string;
  glAccountInfoLine2: string;
  hasReceipt: boolean;
  errorMessage: string;
}

interface IProps {
  invoiceData: Partial<IInvoice>;
  glAccounts: IGLAccount[];
  onSubmit: (data: any) => void | Promise<any>;
  onClose: (data: any) => void | Promise<any>;
  onSwitchPaymentType: () => void;
  isOpen: boolean;
}

type IParams = IModal & IProps & Partial<ConfigProps<any>>;

class ModalDirectDeposit extends React.PureComponent<InjectedFormProps<IForm, IParams> & IParams, IState> {
  public state = {
    glAccountInfoLine1: '',
    glAccountInfoLine2: '',
    hasReceipt: false,
    errorMessage: ''
  };

  private receipt!: IPaymentReceipt | undefined;

  private onSubmit = async (formData: any) => {
    try {
      this.receipt = await this.props.onSubmit(formData);
      this.setState({hasReceipt: true});
      return this.receipt;
    } catch (e) {
      this.setState({errorMessage: e.error_message});
      return Promise.reject();
    }
  };

  private onClose = () => {
    this.receipt = undefined;
    this.setState({
      hasReceipt: false,
      errorMessage: ''
    });
    this.props.reset();
    this.props.onClose();
  };

  private onChangeGLAccount = (data: any) => {
    this.setState({
      glAccountInfoLine1: `Name: ${data.name}`,
      glAccountInfoLine2: `BSB: ${data.bank_bsb || '-'}, Account No: ${data.bank_account_number || '-'}`
    });
  };

  private validateAmount = (value: any) => {
    const {invoiceData} = this.props;
    const digitalPrice = priceToValue(value);

    if (digitalPrice < 0) {
      return 'Amount can\'t be less than 0';
    }

    if (digitalPrice > invoiceData!.amount_due!) {
      return `Amount can't be more than ${formatPrice(invoiceData!.amount_due!)}`;
    }

    return undefined;
  };

  private renderBody = () => {
    return (
      <>
        <InvoicePaymentBar invoiceData={this.props.invoiceData} />
        <StyledComponents.Link onClick={this.props.onSwitchPaymentType}>Change to credit card</StyledComponents.Link>
        {this.state.errorMessage && <PaymentFormError message={this.state.errorMessage} />}
        {this.state.hasReceipt && (
          <>
            <PaymentFormSuccess />
            {this.receipt && <PaymentReceipt receipt={this.receipt} />}
          </>
        )}
        {!this.state.hasReceipt && (
          <PaymentForm onSubmit={this.props.handleSubmit(this.onSubmit)} autoComplete="off" id="DirectDepositModalForm">
            <div className="row">
              <div className="col-4">
                <Field
                  name="amount"
                  component={Input}
                  validate={[required, this.validateAmount]}
                  label="Amount"
                  normalize={normalizePrice}
                />
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-4">
                <Field name="paid_at" label="Date" placeholder="Date" component={DateTime} futureEnabled={true} />
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-6">
                <Field
                  name="gl_account_id"
                  label="Paid into Account"
                  placeholder="Select account..."
                  component={Select}
                  options={this.props.glAccounts}
                  validate={required}
                  getOptionLabel={FinanceService.getGLAccountLabel}
                  getOptionValue={(option: IGLAccount) => option.id.toString()}
                  onChange={this.onChangeGLAccount}
                />
              </div>
              <GLAccountInfo className="col-6">
                <div>{this.state.glAccountInfoLine1}</div>
                <div>{this.state.glAccountInfoLine2}</div>
              </GLAccountInfo>
            </div>
            <div className="row mt-1">
              <div className="col-6">
                <Field
                  name="reference"
                  component={Input}
                  label="Reference"
                  placeholder="Optional reference number or description"
                />
              </div>
            </div>
          </PaymentForm>
        )}
      </>
    );
  };

  private renderFooter() {
    return (
      <PrimaryButton
        className="btn btn-primary"
        type="submit"
        form="DirectDepositModalForm"
        disabled={this.props.submitting || this.props.invalid || this.props.invoiceData!.amount_due! < 0}
      >
        Add Payment
      </PrimaryButton>
    );
  }

  public render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalWindow
          onClose={this.onClose}
          footer={!this.state.hasReceipt ? this.renderFooter() : undefined}
          closeCaption={this.state.hasReceipt ? 'Close' : 'Cancel'}
          body={this.renderBody()}
          loading={this.props.submitting}
          title="Payment: Direct Deposit"
        />
      </Modal>
    );
  }
}

export default reduxForm<IForm, IParams>({
  form: 'PaymentDirectDeposit'
})(ModalDirectDeposit);
