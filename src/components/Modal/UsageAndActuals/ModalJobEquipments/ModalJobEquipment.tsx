import {IModal} from 'src/models/IModal';
import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import JobService from 'src/services/JobService';
import CustomForm, {
  formName,
  IFormValues
} from 'src/components/Modal/UsageAndActuals/ModalJobEquipments/EquipmentCustomForm';
import EquipmentTransformer from 'src/transformers/EquipmentTransformer';
import {IEquipmentInfo} from 'src/models/UsageAndActualsModels/IEquipment';
import {BACKEND_DATE_TIME} from 'src/constants/Date';
import moment from 'moment';
import {loadJobEquipments, loadJobCostingCounters} from 'src/redux/currentJob/currentJobUsageAndActuals';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';

interface IProps {
  jobId: number;
  equipment?: IEquipmentInfo;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  loading: boolean;
}

class ModalJobEquipments extends React.PureComponent<IProps & IModal, IState> {
  public state = {
    loading: false
  };

  private renderBody = () => {
    const {equipment, jobId} = this.props;

    return (
      <CustomForm
        onSubmit={this.sendCustomData}
        edit={!!equipment}
        initialValues={equipment && EquipmentTransformer.hydrateEquipmentInfoForEdit(equipment)}
        jobId={jobId}
      />
    );
  };

  private sendCustomData = async (data: IFormValues) => {
    const {jobId, onClose, equipment, dispatch} = this.props;

    this.setState({loading: true});

    try {
      if (!!equipment) {
        if (data.ended_at && data.ended_at.isValid() && !moment(equipment.ended_at).isSame(data.ended_at)) {
          await JobService.updateJobEquipmentFinishUsing(
            jobId,
            equipment.id,
            data.ended_at.utc().format(BACKEND_DATE_TIME)
          );
        }

        if (equipment.intervals_count_override !== data.intervals_count_override) {
          await JobService.updateJobEquipmentOverride(jobId, equipment.id, data.intervals_count_override);
        }
      } else {
        const equipmentId = data.equipment.id;

        await JobService.addEquipmentToJob(jobId, {
          equipment_id: equipmentId,
          started_at: data.started_at && data.started_at.utc().format(BACKEND_DATE_TIME),
          ended_at: data.ended_at && data.ended_at.utc().format(BACKEND_DATE_TIME)
        });
        dispatch(loadJobCostingCounters(jobId));
      }
      dispatch(loadJobEquipments(jobId));
    } finally {
      onClose();
    }
  };

  private renderFooter() {
    const {equipment} = this.props;

    return (
      <PrimaryButton className="btn btn-primary" form={formName}>
        {equipment ? 'Save' : 'Add'}
      </PrimaryButton>
    );
  }

  public render() {
    const {isOpen, onClose, equipment} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          title={equipment ? 'Edit Equipment' : 'Add Equipment'}
          body={this.renderBody()}
          footer={this.renderFooter()}
          loading={this.state.loading}
        />
      </Modal>
    );
  }
}

export default ModalJobEquipments;
