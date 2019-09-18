import * as React from 'react';
import {reduxForm} from 'redux-form';
import {Field, InjectedFormProps} from 'redux-form';
import styled from 'styled-components';
import Input from 'src/components/Form/Input';
import Select from 'src/components/Form/Select';
import DateTime from 'src/components/Form/DateTime';
import ValueWithLabel from '../FinanceComponents/ValueWithLabel';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {formatPrice} from 'src/utility/Helpers';
import {IGLAccount} from 'src/models/IFinance';
import {IReceivePaymentParams} from 'src/models/FinanceModels/IPayments';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import commonSelectStyles from 'src/components/Form/commonSelectStyles';
import {PaymentsForm} from './PaymentStyledComponents';
import ColorPalette from 'src/constants/ColorPalette';
import {required} from 'src/services/ValidationService';
import FinanceService from 'src/services/FinanceService';

const LabelsColumn = styled.div`
  padding-top: 30px;
`;

export interface IOwnProps {
  disabled?: boolean;
  loading: boolean;
  totalSelected: number;
  glAccounts: IGLAccount[];
}

interface IConfigProps {
  onSubmit: (data: any) => Promise<any>;
}

interface IState {
  amount: number;
}

export type ReceivePaymentFormParams = IReceivePaymentParams & {
  dst_gl_account: any;
};

type IProps = IOwnProps & IConfigProps & InjectedFormProps<Partial<ReceivePaymentFormParams>, IOwnProps & IConfigProps>;

class ReceivePaymentsForm extends React.PureComponent<IProps, IState> {
  private static formSelectStyles = {
    ...commonSelectStyles,
    control: (base: React.CSSProperties, state: any) => ({
      ...base,
      borderColor: ColorPalette.gray2,
      background: state.isDisabled ? ColorPalette.gray1 : ColorPalette.white,
      boxShadow: state.isFocused ? `0 0 1px ${ColorPalette.gray4}` : 'none'
    })
  };

  public state = {amount: 0};

  private onChangeAmount = (e: any) => {
    this.setState({amount: +e.target.value});
  };

  private onSubmit = async (formData: any) => {
    await this.props.onSubmit(formData);
    this.props.reset();
  };

  public render() {
    const {glAccounts, totalSelected, loading, submitting, disabled} = this.props;

    const difference = totalSelected - this.state.amount;

    return (
      <PaymentsForm onSubmit={this.props.handleSubmit(this.onSubmit)}>
        <div className="row">
          <div className="col-6">
            <Field
              name="paid_at"
              label="Date Received"
              placeholder="Date"
              component={DateTime}
              futureEnabled={true}
              validate={required}
              disabled={disabled}
            />
            <Field
              name="amount"
              label="Amount Received"
              type="number"
              component={Input}
              validate={required}
              disabled={disabled}
              currency={true}
              onChange={this.onChangeAmount}
            />
            <Field
              name="dst_gl_account"
              label="Paid into Account"
              placeholder="Select account..."
              component={Select}
              options={glAccounts}
              validate={required}
              disabled={disabled}
              getOptionLabel={FinanceService.getGLAccountLabel}
              getOptionValue={(option: IGLAccount) => option.id.toString()}
              selectStyles={ReceivePaymentsForm.formSelectStyles}
            />
            <Field
              name="reference"
              label="Remittence Reference"
              placeholder="None"
              component={Input}
              disabled={disabled}
            />
          </div>
          <LabelsColumn className="col-5 offset-1">
            {(loading || submitting) && <BlockLoading size={40} color={ColorPalette.white1} />}
            <ValueWithLabel label="Amount Received" value={formatPrice(this.state.amount)} hasDelimiter={true} />
            <ValueWithLabel label="Total Selected" value={formatPrice(totalSelected)} hasDelimiter={true} />
            <ValueWithLabel
              label="Difference"
              value={formatPrice(difference)}
              color={difference < 0 ? ColorPalette.red1 : undefined}
            />
            <div className="pt-2">
              <PrimaryButton
                type="submit"
                className="btn btn-primary"
                disabled={!!disabled || submitting || Math.abs(difference) > Number.MIN_VALUE}
              >
                Process Payment
              </PrimaryButton>
            </div>
          </LabelsColumn>
        </div>
      </PaymentsForm>
    );
  }
}

export default reduxForm<Partial<ReceivePaymentFormParams>, any>({
  form: 'ReceivePaymentsForm'
})(ReceivePaymentsForm);
