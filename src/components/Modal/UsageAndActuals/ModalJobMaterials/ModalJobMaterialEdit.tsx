import * as React from 'react';
import {IModal} from 'src/models/IModal';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import {Action, compose} from 'redux';
import {Field, InjectedFormProps, reduxForm} from 'redux-form';
import Select from 'src/components/Form/Select';
import ColorPalette from 'src/constants/ColorPalette';
import {required} from 'src/services/ValidationService';
import {IMaterial} from 'src/models/UsageAndActualsModels/IMaterial';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {IReturnType} from 'src/redux/reduxWrap';
import {ThunkDispatch} from 'redux-thunk';
import {loadAllMaterials} from 'src/redux/materialsDucks';
import DateTime from 'src/components/Form/DateTime';
import Input from 'src/components/Form/Input';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {Moment} from 'moment';

interface IProps {
  onSubmit: (data: IFormValues) => Promise<any>;
}

export interface IFormValues {
  material: IMaterial;
  used_at: string | Moment;
  quantity_used_override: string;
}

interface IConnectProps {
  materials: IReturnType<IMaterial[]>;
  dispatch: ThunkDispatch<any, any, Action>;
}

const formName = 'EditJobMaterialForm';

class ModalJobMaterialEdit extends React.PureComponent<
  InjectedFormProps<IFormValues, IModal> & IProps & IModal & IConnectProps
> {
  public componentDidMount() {
    const {dispatch} = this.props;

    dispatch(loadAllMaterials());
  }

  private handleSubmit = async (data: any) => {
    const {onSubmit, onClose} = this.props;

    await onSubmit(data);
    onClose();
  };

  private renderBody = () => {
    const {
      handleSubmit,
      materials: {data, loading}
    } = this.props;

    return (
      <form onSubmit={handleSubmit(this.handleSubmit)} autoComplete="off" id={formName}>
        <div className="row">
          <div className="col-6 position-relative">
            {loading && <BlockLoading size={30} color={ColorPalette.white} />}
            <Field
              name="material"
              validate={required}
              component={Select}
              options={data || []}
              getOptionValue={(option: IMaterial) => option.id}
              getOptionLabel={(option: IMaterial) => option.name}
              label="Material"
            />
          </div>
          <div className="col-6">
            <Field name="used_at" validate={required} component={DateTime} label="Used At" />
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <Field name="quantity_used_override" validate={required} component={Input} type="number" label="Quantity" />
          </div>
        </div>
      </form>
    );
  };

  private renderFooter = () => {
    return (
      <PrimaryButton className="btn btn-primary" form={formName}>
        Save
      </PrimaryButton>
    );
  };

  public render() {
    const {isOpen, onClose, submitting} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          title="Edit Material"
          body={this.renderBody()}
          footer={this.renderFooter()}
          loading={submitting}
        />
      </Modal>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({materials: state.materials});

export default compose<React.ComponentClass<Partial<InjectedFormProps<IFormValues, IModal>> & IModal & IProps>>(
  connect(mapStateToProps),
  reduxForm({
    form: formName,
    enableReinitialize: true
  })
)(ModalJobMaterialEdit);
