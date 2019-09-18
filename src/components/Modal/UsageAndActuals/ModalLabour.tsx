import {IModal} from 'src/models/IModal';
import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {IUser} from 'src/models/IUser';
import {Moment} from 'moment';
import {Field, reduxForm, InjectedFormProps} from 'redux-form';
import SelectAsync from 'src/components/Form/SelectAsync';
import debounce from 'debounce-promise';
import UserService from 'src/services/UserService';
import {getUserNames} from 'src/utility/Helpers';
import {required} from 'src/services/ValidationService';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import Select from 'src/components/Form/Select';
import withData, {IResource} from 'src/components/withData/withData';
import {compose} from 'redux';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import DateTime from 'src/components/Form/DateTime';
import {ILabourType} from 'src/models/UsageAndActualsModels/ILabour';
import {IconName} from 'src/components/Icon/Icon';
import {FRONTEND_TIME} from 'src/constants/Date';
import styled from 'styled-components';

const FieldWrapper = styled.div<{hidden: boolean}>`
  display: ${props => (props.hidden ? 'none' : 'flex')};
`;

export interface IFormValues {
  started_at_date: Moment;
  started_at_override: Moment;
  ended_at_override?: Moment;
  user: IUser;
  labour_type: ILabourType;
  break: Moment;
  job_id: number;
  id: number;
  creator_id: number;
}

interface IOwnProps {
  onSubmit: (data: IFormValues) => any;
  isEdit: boolean;
  isMultiEdit: boolean;
}

type IProps = IModal & IOwnProps;

interface IWithDataProps {
  loadTypes: IResource<ILabourType[]>;
}

const formName = 'ModalLabourForm';

class ModalLabour extends React.PureComponent<InjectedFormProps<IFormValues, IProps> & IProps & IWithDataProps> {
  public componentDidMount() {
    this.props.loadTypes.fetch();
  }

  private onSubmit = async (data: IFormValues) => {
    const {onSubmit, onClose} = this.props;

    await onSubmit(data);
    onClose();
  };

  private loadUsers = async (search: string) => {
    const res = await UserService.searchUsers({name: search});
    return res.data;
  };

  private debouncedUserLoad = debounce(this.loadUsers, 1000);

  private getWorkerOptionLabel = (user: IUser) => getUserNames(user).name;

  private getWorkerOptionValue = (user: IUser) => user.id;

  private getLabourTypeOptionLabel = (t: ILabourType) => t.name;

  private getLabourTypeOptionValue = (t: ILabourType) => t.id;

  private renderBody = () => {
    const {
      handleSubmit,
      loadTypes: {data, loading},
      isEdit,
      isMultiEdit
    } = this.props;

    return (
      <form id={formName} onSubmit={handleSubmit(this.onSubmit)} autoComplete="off">
        <div className="row">
          <div className="col-4">
            <Field name="started_at_date" label="Date" validate={required} component={DateTime} />
          </div>
        </div>

        <FieldWrapper hidden={isEdit && isMultiEdit} className="row">
          <div className="col-6">
            <Field
              name="user"
              label="Worker"
              component={SelectAsync}
              loadOptions={this.debouncedUserLoad}
              getOptionLabel={this.getWorkerOptionLabel}
              getOptionValue={this.getWorkerOptionValue}
              validate={isMultiEdit ? undefined : required}
              isClearable={true}
              placeholder="Start typing to search..."
              disabled={isEdit}
            />
          </div>
          <div className="col-6">
            {loading && <BlockLoading size={20} color={ColorPalette.white} />}
            <Field
              name="labour_type"
              label="Crew Type"
              component={Select}
              getOptionLabel={this.getLabourTypeOptionLabel}
              getOptionValue={this.getLabourTypeOptionValue}
              validate={isMultiEdit ? undefined : required}
              options={data || []}
              disabled={isEdit}
            />
          </div>
        </FieldWrapper>

        <div className="row">
          <div className="col-4">
            <Field
              name="started_at_override"
              label="Start Time"
              component={DateTime}
              showTime={true}
              dateFormat={false}
              viewMode="time"
              validate={required}
              iconName={IconName.Clock}
              timeFormat={FRONTEND_TIME}
            />
          </div>
          <div className="col-4">
            <Field
              name="ended_at_override"
              label="End Time"
              component={DateTime}
              showTime={true}
              dateFormat={false}
              viewMode="time"
              iconName={IconName.Clock}
              validate={required}
            />
          </div>
          <div className="col-4">
            <Field
              name="break"
              label="Break"
              component={DateTime}
              showTime={true}
              dateFormat={false}
              viewMode="time"
              timeFormat="HH:mm"
              iconName={IconName.Clock}
            />
          </div>
        </div>
      </form>
    );
  };

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
  withData({
    loadTypes: {
      fetch: UsageAndActualsService.getLabourTypes
    }
  })
)(ModalLabour);
