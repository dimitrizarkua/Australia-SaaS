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
import {IPaymentToForwardParams} from 'src/models/FinanceModels/IPayments';
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
  totalAvailable: number;
  totalRemittence: number;
  locationName?: string;
  glAccounts: IGLAccount[];
  onChangeGLAccount: () => void | Promise<any>;
}

export type ForwardPaymentsFormProps = IPaymentToForwardParams & {
  source_gl_account_id: any;
  destination_gl_account_id: any;
};

type IProps = IOwnProps & InjectedFormProps<ForwardPaymentsFormProps, IOwnProps>;

class ForwardInvoicePaymentsForm extends React.PureComponent<IProps> {
  private static formSelectStyles = {
    ...commonSelectStyles,
    control: (base: React.CSSProperties, state: any) => ({
      ...base,
      borderColor: ColorPalette.gray2,
      background: state.isDisabled ? ColorPalette.gray1 : ColorPalette.white,
      boxShadow: state.isFocused ? `0 0 1px ${ColorPalette.gray4}` : 'none'
    })
  };

  private isBankAccount = (acc: any) => acc.is_bank_account;

  private get sourceAccounts() {
    return this.props.glAccounts.filter(this.isBankAccount);
  }

  private get destinationAccounts() {
    return this.props.glAccounts.filter((acc: any) => !this.isBankAccount(acc));
  }

  public render() {
    const {locationName, totalAvailable, totalRemittence, loading, disabled, onChangeGLAccount} = this.props;

    return (
      <PaymentsForm onSubmit={this.props.handleSubmit}>
        <div className="row">
          <div className="col-6">
            <Field
              name="transferred_at"
              label="Date to Transfer"
              placeholder="Date"
              component={DateTime}
              futureEnabled={true}
              validate={required}
              disabled={disabled}
            />
            <Field
              name="source_gl_account_id"
              label="Paid from Account"
              placeholder="Select account..."
              component={Select}
              options={this.sourceAccounts}
              validate={required}
              disabled={disabled}
              getOptionLabel={FinanceService.getGLAccountLabel}
              getOptionValue={(option: IGLAccount) => option.id.toString()}
              selectStyles={ForwardInvoicePaymentsForm.formSelectStyles}
              onChange={onChangeGLAccount}
            />
            <Field
              name="destination_gl_account_id"
              label="Paid to Account"
              placeholder="Select account..."
              component={Select}
              options={this.destinationAccounts}
              validate={required}
              disabled={disabled}
              getOptionLabel={FinanceService.getGLAccountLabel}
              getOptionValue={(option: IGLAccount) => option.id.toString()}
              selectStyles={ForwardInvoicePaymentsForm.formSelectStyles}
            />
            <Field
              name="remittance_reference"
              label="Remittence Reference"
              placeholder="None"
              component={Input}
              disabled={disabled}
            />
          </div>
          <LabelsColumn className="col-5 offset-1">
            {loading && <BlockLoading size={40} />}
            <ValueWithLabel label="Location" value={locationName || ''} hasDelimiter={true} />
            <ValueWithLabel label="Total Available" value={formatPrice(totalAvailable)} hasDelimiter={true} />
            <ValueWithLabel label="Total remittence" value={formatPrice(totalRemittence)} />
            <div className="pt-2">
              <PrimaryButton type="submit" className="btn btn-primary" disabled={!!disabled}>
                Process Payment
              </PrimaryButton>
            </div>
          </LabelsColumn>
        </div>
      </PaymentsForm>
    );
  }
}

export default reduxForm<ForwardPaymentsFormProps, any>({
  form: 'ForwardPaymentsForm'
})(ForwardInvoicePaymentsForm);
