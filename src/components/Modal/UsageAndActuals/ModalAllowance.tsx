import {IModal} from 'src/models/IModal';
import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {IUser} from 'src/models/IUser';
import {IAllowanceType} from 'src/models/UsageAndActualsModels/IAllowance';
import {Moment} from 'moment';
import {Field, reduxForm, InjectedFormProps, formValues} from 'redux-form';
import SelectAsync from 'src/components/Form/SelectAsync';
import debounce from 'debounce-promise';
import UserService from 'src/services/UserService';
import {formatPrice, getUserNames} from 'src/utility/Helpers';
import {required} from 'src/services/ValidationService';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import Select from 'src/components/Form/Select';
import withData, {IResource} from 'src/components/withData/withData';
import {compose} from 'redux';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import DateTime from 'src/components/Form/DateTime';
import Input from 'src/components/Form/Input';

export interface IFormValues {
  user: IUser;
  allowance_type: IAllowanceType;
  date_given: Moment;
  amount: number;
}

interface IOwnProps {
  onSubmit: (data: IFormValues) => any;
  isEdit: boolean;
}

type IProps = IModal & IOwnProps;

interface IWithDataProps {
  loadTypes: IResource<IAllowanceType[]>;
}

interface IInjectedFormValues {
  amount: number;
  allowanceType: IAllowanceType;
}

const formName = 'ModalAllowanceForm';

class ModalAllowance extends React.PureComponent<
  InjectedFormProps<IFormValues, IProps> & IProps & IWithDataProps & IInjectedFormValues
> {
  public componentDidMount() {
    this.props.loadTypes.fetch();
  }

  private onSubmit = async (data: IFormValues) => {
    const {onSubmit, onClose} = this.props;

    try {
      await onSubmit(data);
      onClose();
    } catch (e) {
      //
    }
  };

  private renderBody = () => {
    const {
      handleSubmit,
      loadTypes: {data, loading},
      amount,
      allowanceType,
      isEdit
    } = this.props;

    return (
      <form id={formName} onSubmit={handleSubmit(this.onSubmit)} autoComplete="off">
        <div className="row">
          <div className="col-5">
            <Field
              name="user"
              label="Recipient"
              component={SelectAsync}
              loadOptions={this.debouncedUserLoad}
              getOptionLabel={this.getRecipientOptionLabel}
              getOptionValue={this.getRecipientOptionValue}
              validate={required}
              isClearable={true}
              placeholder="Start typing to search..."
              disabled={isEdit}
            />
          </div>
          <div className="col-5 position-relative">
            {loading && <BlockLoading size={20} color={ColorPalette.white} />}
            <Field
              name="allowance_type"
              label="Allowance Type"
              component={Select}
              getOptionLabel={this.getAllowanceTypeOptionLabel}
              getOptionValue={this.getAllowanceTypeOptionValue}
              validate={required}
              options={data || []}
              disabled={isEdit}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-5">
            <Field name="date_given" label="Date" component={DateTime} validate={required} futureEnabled={true} />
          </div>
          <div className="col-7">
            <Field
              name="amount"
              label={`Amount ${
                allowanceType ? `(${allowanceType.charging_interval.toLowerCase()})` : ''
              }: ${formatPrice((amount || 0) * ((allowanceType && allowanceType.charge_rate_per_interval) || 0))}`}
              component={Input}
              type="number"
              validate={required}
            />
          </div>
        </div>
      </form>
    );
  };

  private loadUsers = async (search: string) => {
    const res = await UserService.searchUsers({name: search});
    return res.data;
  };

  private debouncedUserLoad = debounce(this.loadUsers, 1000);

  private getRecipientOptionLabel = (user: IUser) => getUserNames(user).name;

  private getRecipientOptionValue = (user: IUser) => user.id;

  private getAllowanceTypeOptionLabel = (t: IAllowanceType) => t.name;

  private getAllowanceTypeOptionValue = (t: IAllowanceType) => t.id;

  private renderFooter = () => {
    const {invalid} = this.props;

    return (
      <PrimaryButton className="btn" type="submit" disabled={invalid} form={formName}>
        Save
      </PrimaryButton>
    );
  };

  public render() {
    const {isOpen, title, onClose, submitting} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          loading={submitting}
          title={title || ''}
          body={this.renderBody()}
          footer={this.renderFooter()}
        />
      </Modal>
    );
  }
}

export default compose<React.ComponentClass<IProps & Partial<InjectedFormProps<{}>>>>(
  reduxForm<IFormValues, IProps>({
    form: formName
  }),
  formValues({amount: 'amount', allowanceType: 'allowance_type'}),
  withData({
    loadTypes: {
      fetch: UsageAndActualsService.getAllowanceTypes
    }
  })
)(ModalAllowance);
