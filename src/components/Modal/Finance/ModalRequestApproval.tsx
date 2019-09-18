import * as React from 'react';
import {IModal} from 'src/models/IModal';
import Modal from '../Modal';
import ModalWindow from '../ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {InjectedFormProps, Field, reduxForm} from 'redux-form';
import Select from 'src/components/Form/Select';
import {IUser} from 'src/models/IUser';
import Notify, {NotifyType} from 'src/utility/Notify';
import {required} from 'src/services/ValidationService';
import {getUserNames} from 'src/utility/Helpers';

interface IProps {
  approvers: IUser[];
  onSubmit: (data: IFormValues) => Promise<any>;
}

export interface IFormValues {
  user: IUser;
}

type IParams = IModal & IProps;

interface IState {
  loading: boolean;
}

class ModalRequestApproval extends React.PureComponent<InjectedFormProps<IFormValues, IParams> & IParams, IState> {
  public state = {
    loading: false
  };

  private onSubmit = async (data: IFormValues) => {
    const {onClose, onSubmit} = this.props;

    this.setState({loading: true});

    try {
      await onSubmit(data);
      Notify(NotifyType.Success, 'A request for approval has been sent to selected users');
      onClose();
    } catch (er) {
      Notify(NotifyType.Danger, 'Server error');
    } finally {
      this.setState({loading: false});
    }
  };

  private renderBody = () => {
    const {approvers, handleSubmit} = this.props;

    return (
      <form autoComplete="off" onSubmit={handleSubmit(this.onSubmit)} id="RequestApprovalModalForm">
        <div className="row">
          <div className="col-6">
            <Field
              name="user"
              component={Select}
              getOptionValue={(option: IUser) => option.id.toString()}
              getOptionLabel={(option: IUser) => getUserNames(option).name}
              validate={required}
              options={approvers}
              label="Staff Name"
            />
          </div>
        </div>
      </form>
    );
  };

  private renderFooter() {
    return (
      <PrimaryButton className="btn btn-primary" type="submit" form="RequestApprovalModalForm">
        Send
      </PrimaryButton>
    );
  }

  public render() {
    const {isOpen, onClose} = this.props;
    const {loading} = this.state;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          footer={this.renderFooter()}
          body={this.renderBody()}
          loading={loading}
          title="Request Approval"
        />
      </Modal>
    );
  }
}

export default reduxForm<IFormValues, IParams>({
  form: 'RequestApprovalModalForm'
})(ModalRequestApproval);
