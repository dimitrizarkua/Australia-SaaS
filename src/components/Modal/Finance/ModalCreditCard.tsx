import * as React from 'react';
import styled from 'styled-components';
import {InjectedFormProps, ConfigProps, Field, reduxForm} from 'redux-form';
import {range} from 'lodash';
import {IInvoice} from 'src/models/FinanceModels/IInvoices';
import {IModal} from 'src/models/IModal';
import {IPaymentReceipt} from 'src/models/FinanceModels/IPayments';
import Modal from '../Modal';
import ModalWindow from '../ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import Input from 'src/components/Form/Input';
import Select from 'src/components/Form/Select';
import {required, email, validCardNumber, validCardFullName} from 'src/services/ValidationService';
import {normalizeName, normalizeCardNumber} from 'src/utility/Normalizers';
import InvoicePaymentBar from './InvoicePaymentBar';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import {FieldsBlock, PaymentForm, PaymentFormError, PaymentFormSuccess, PaymentReceipt} from './PaymentFormComponents';
import {CREDIT_CARD_CVV_MASK} from 'src/constants/InputMasks';

const FlexInputDiv = styled.div`
  max-width: 120px;
  flex-basis: 40%;
  margin: 0 5px;
  &:first-child {
    margin-right: 25px;
  }
  &.no-label-input {
    margin-top: 2rem;
  }
`;

export interface IForm {
  name: string;
  cvv: string;
  number: string;
  email: string;
  expiry_month: {value: number; label: string};
  expiry_year: {value: number; label: string};
  billing_address1: string;
  billing_city: string;
  billing_country: string;
}

interface IState {
  hasReceipt: boolean;
  errorMessage: string;
}

interface IProps {
  invoiceData: Partial<IInvoice>;
  onSubmit: (data: any) => void | Promise<any>;
  onClose: (data: any) => void | Promise<any>;
  onSwitchPaymentType: () => void;
  isOpen: boolean;
}

type IParams = IModal & IProps & Partial<ConfigProps<any>>;

class ModalCreditCard extends React.PureComponent<InjectedFormProps<IForm, IParams> & IParams, IState> {
  private static months = range(1, 13).map(i => ({value: i, label: i < 10 ? `0${i}` : `${i}`}));
  private static years = (() => {
    const startYear = new Date().getFullYear();
    return range(startYear, startYear + 10).map(y => ({value: y, label: y}));
  })();

  public state = {
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

  private renderBody = () => {
    return (
      <>
        <InvoicePaymentBar invoiceData={this.props.invoiceData} showRate={true} />
        <StyledComponents.Link onClick={this.props.onSwitchPaymentType}>
          Change to direct deposit payment
        </StyledComponents.Link>
        {this.state.errorMessage && <PaymentFormError message={this.state.errorMessage} />}
        {this.state.hasReceipt && (
          <>
            <PaymentFormSuccess />
            {this.receipt && <PaymentReceipt receipt={this.receipt} />}
          </>
        )}
        {!this.state.hasReceipt && (
          <PaymentForm
            onSubmit={this.props.handleSubmit(this.onSubmit)}
            autoComplete="off"
            id="CreditCardPaymentModalForm"
          >
            <div className="row">
              <div className="col-6">
                <Field
                  name="name"
                  component={Input}
                  validate={[required, validCardFullName]}
                  normalize={normalizeName}
                  label="Name"
                />
                <Field
                  name="number"
                  component={Input}
                  validate={[required, validCardNumber]}
                  normalize={normalizeCardNumber}
                  label="Card Number"
                />
              </div>
            </div>
            <div className="row">
              <div className="d-flex col-9">
                <FlexInputDiv>
                  <Field
                    name="cvv"
                    component={Input}
                    validate={required}
                    mask={CREDIT_CARD_CVV_MASK}
                    maskChar={null}
                    label="CCV"
                  />
                </FlexInputDiv>
                <FlexInputDiv>
                  <Field
                    name="expiry_month"
                    component={Select}
                    options={ModalCreditCard.months}
                    validate={required}
                    label="Expiry"
                  />
                </FlexInputDiv>
                <FlexInputDiv className="no-label-input">
                  <Field name="expiry_year" component={Select} options={ModalCreditCard.years} validate={required} />
                </FlexInputDiv>
              </div>
            </div>
            <FieldsBlock>
              <div className="row">
                <div className="col-5">
                  <Field name="billing_address1" component={Input} validate={required} label="Billing Address" />
                </div>
              </div>
              <div className="row">
                <div className="col-5">
                  <Field name="billing_city" component={Input} validate={required} label="City" />
                </div>
                <div className="col-5">
                  <Field name="billing_country" component={Input} validate={required} label="Country" />
                </div>
              </div>
            </FieldsBlock>
            <FieldsBlock>
              <div className="row">
                <div className="col-6">
                  <Field name="email" validate={[required, email]} component={Input} label="Email receipt to:" />
                </div>
              </div>
            </FieldsBlock>
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
        form="CreditCardPaymentModalForm"
        disabled={this.props.submitting || this.props.invalid || this.props.invoiceData!.amount_due! < 0}
      >
        Pay Now
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
          title="Payment: Credit Card"
        />
      </Modal>
    );
  }
}

export default reduxForm<IForm, IParams>({
  form: 'InvoicePaymentCreditCard'
})(ModalCreditCard);
