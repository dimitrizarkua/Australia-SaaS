import * as React from 'react';
import {IModal} from 'src/models/IModal';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {Field, InjectedFormProps, reduxForm} from 'redux-form';
import {Moment} from 'moment';
import Input from 'src/components/Form/Input';
import Select from 'src/components/Form/Select';
import DateTime from 'src/components/Form/DateTime';
import {required} from 'src/services/ValidationService';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {ILocation} from 'src/models/IAddress';

const formName = 'ModalRentalCarsForm';

export interface IFormValues {
  make: string;
  model: string;
  registration: string;
  type: string;
  rent_starts_at: Moment;
  rent_ends_at: Moment;
  location_id: ILocation;
}

interface IConnectProps {
  locations: ILocation[];
}

interface IOwnProps {
  onSubmit: (data: IFormValues) => any;
}

type IProps = IOwnProps & IModal;

class ModalRentalCars extends React.PureComponent<InjectedFormProps<IFormValues, IProps> & IProps & IConnectProps> {
  private validateStartDate = (value: Moment | undefined, allValues: Partial<IFormValues>) => {
    if (allValues.rent_ends_at && value && value.isAfter(allValues.rent_ends_at)) {
      return 'Incorrect start date';
    }

    return undefined;
  };

  private validateEndDate = (value: Moment | undefined, allValues: Partial<IFormValues>) => {
    if (allValues.rent_starts_at && value && value.isBefore(allValues.rent_starts_at)) {
      return 'Incorrect end date';
    }

    return undefined;
  };

  private getOptionLabel = (el: ILocation) => {
    return el.name;
  };

  private getOptionValue = (el: ILocation) => {
    return el.id;
  };

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
    const {locations} = this.props;

    return (
      <form id={formName} onSubmit={this.props.handleSubmit(this.onSubmit)}>
        <div className="row">
          <div className="col-6">
            <Field name="make" label="Car Brand" component={Input} validate={required} />
          </div>
          <div className="col-6">
            <Field name="model" label="Car Model" component={Input} validate={required} />
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            <Field name="registration" label="Reg. Number" component={Input} validate={required} />
          </div>
          <div className="col-4">
            <Field name="type" label="Car Type" component={Input} validate={required} />
          </div>
          <div className="col-4">
            <Field
              name="location_id"
              label="Location"
              component={Select}
              options={locations}
              validate={required}
              getOptionLabel={this.getOptionLabel}
              getOptionValue={this.getOptionValue}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            <Field
              name="rent_starts_at"
              label="Rental Start Date"
              component={DateTime}
              validate={[required, this.validateStartDate]}
              futureEnabled={true}
            />
          </div>
          <div className="col-4">
            <Field
              name="rent_ends_at"
              label="Rental End Date"
              component={DateTime}
              validate={[required, this.validateEndDate]}
              futureEnabled={true}
            />
          </div>
        </div>
      </form>
    );
  };

  private renderFooter = () => {
    const {invalid} = this.props;

    return (
      <PrimaryButton className="btn" type="submit" form={formName} disabled={invalid}>
        Add
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

const mapStateToProps = (state: IAppState) => ({
  locations: state.user.locations
});

export default compose<React.ComponentClass<IProps & Partial<InjectedFormProps<{}>>>>(
  connect(mapStateToProps),
  reduxForm<IFormValues, IProps>({
    form: formName
  })
)(ModalRentalCars);
