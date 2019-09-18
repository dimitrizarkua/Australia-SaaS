import {IModal} from 'src/models/IModal';
import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import {IMaterialItem} from 'src/components/Modal/UsageAndActuals/ModalJobMaterials/MaterialQuickForm';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import JobService from 'src/services/JobService';
import {BACKEND_DATE_TIME} from 'src/constants/Date';
import CustomForm, {
  formName,
  IFormValues
} from 'src/components/Modal/UsageAndActuals/ModalJobMaterials/MaterialCustomForm';
import UsageAndActualsService from 'src/services/UsageAndActuals/UsageAndActualsService';
import {IMaterial, IMaterialInfo} from 'src/models/UsageAndActualsModels/IMaterial';
import MaterialTransformer from 'src/transformers/MaterialTransformer';
import {loadJobCostingCounters} from 'src/redux/currentJob/currentJobUsageAndActuals';
import {ThunkDispatch} from 'redux-thunk';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {isInvalid} from 'redux-form';
import {IAppState} from 'src/redux';

export enum ModalTypes {
  Quick,
  Custom
}

interface IProps {
  jobId: number;
  userId: number;
  loadJobMaterialsList: () => any;
  type: ModalTypes;
  material?: IMaterialInfo;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IConnectProps {
  formIsInvalid: boolean;
}

interface IState {
  quickData: IMaterialItem[];
  loading: boolean;
}

class ModalJobMaterials extends React.PureComponent<IProps & IModal & IConnectProps, IState> {
  public state = {
    quickData: [],
    loading: false
  };

  private renderBody = () => {
    const {material} = this.props;

    return (
      <CustomForm
        onSubmit={this.sendCustomData}
        edit={!!material}
        initialValues={material && MaterialTransformer.hydrateMaterialInfoForEdit(material)}
      />
    );
  };

  private sendCustomData = async (data: IFormValues) => {
    const {jobId, userId, onClose, loadJobMaterialsList, material, dispatch} = this.props;

    this.setState({loading: true});

    try {
      if (!!material) {
        const materialForSend = MaterialTransformer.dehydrateMaterialInfo(data) as IMaterialInfo;

        await JobService.updateJobMaterial(jobId, material.id, materialForSend);
      } else {
        let materialId;

        if (!data.material) {
          materialId = ((await UsageAndActualsService.createNewMaterial(
            Object.assign(data, {measure_unit_id: data.measure_unit_id.id})
          )) as IMaterial).id;
        } else {
          materialId = data.material.id;
        }

        await JobService.addMaterialToJob(jobId, {
          job_id: jobId,
          material_id: materialId,
          creator_id: userId,
          used_at: data.used_at.format(BACKEND_DATE_TIME),
          quantity_used: data.count
        });
        dispatch(loadJobCostingCounters(jobId));
      }

      loadJobMaterialsList();
    } finally {
      onClose();
    }
  };

  private renderFooter() {
    const {material, formIsInvalid} = this.props;

    return (
      <PrimaryButton className="btn btn-primary" form={formName} disabled={formIsInvalid}>
        {material ? 'Save' : 'Add'}
      </PrimaryButton>
    );
  }

  public render() {
    const {isOpen, onClose, material} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          title={material ? 'Edit Material' : 'Add Material'}
          body={this.renderBody()}
          footer={this.renderFooter()}
          loading={this.state.loading}
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({formIsInvalid: isInvalid(formName)(state)});

export default compose<React.ComponentClass<IProps & IModal>>(connect(mapStateToProps))(ModalJobMaterials);
