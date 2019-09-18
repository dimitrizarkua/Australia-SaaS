import * as React from 'react';
import {Field, InjectedFormProps, reduxForm} from 'redux-form';
import {ITaskType} from '../../models/ITask';
import Input from '../Form/Input';
import {required} from '../../services/ValidationService';
import Checkbox from '../Form/Checkbox';
import PrimaryButton from '../Buttons/PrimaryButton';
import styled from 'styled-components';
import BlockLoading from '../Layout/Common/BlockLoading';
import ColorPalette from '../../constants/ColorPalette';
import ColorPicker from '../Form/ColorPicker';
import {colorTransformer} from 'src/utility/Helpers';

interface IProps {
  onSubmit: (data: any) => Promise<any>;
  color?: number;
}

interface IState {
  loading: boolean;
}

const Form = styled.form`
  position: relative;
`;

class TaskTypeForm extends React.PureComponent<InjectedFormProps<Partial<ITaskType>, IProps> & IProps, IState> {
  public state = {
    loading: false
  };

  private internalHandler = async (data: any) => {
    const {onSubmit} = this.props;
    this.setState({loading: true});
    try {
      await onSubmit(data);
      this.props.reset();
    } finally {
      this.setState({loading: false});
    }
  };

  public render() {
    const {handleSubmit, color} = this.props;
    const {loading} = this.state;

    return (
      <Form onSubmit={handleSubmit(this.internalHandler)} autoComplete="off">
        {loading && <BlockLoading size={40} color={colorTransformer(color || 0) || ColorPalette.white} />}
        <fieldset disabled={false}>
          <div className="row">
            <div className="col-7">
              <Field name="name" component={Input} validate={required} type="text" label="Type Name" />
            </div>
          </div>
          <div className="row">
            <div className="col-3">
              <Field
                name="default_duration_minutes"
                component={Input}
                validate={required}
                type="number"
                min={0}
                label="Default Duration (minutes)"
              />
            </div>
            <div className="col-2">
              <Field name="kpi_hours" component={Input} validate={required} type="number" min={0} label="KPI (hours)" />
            </div>
            <div className="col-2">
              <Field name="color" height={33} component={ColorPicker} label="Color" />
            </div>
          </div>
          <div className="row">
            <div className="col-auto">
              <Field name="can_be_scheduled" component={Checkbox} label="Can Be Scheduled" />
            </div>
            <div className="col-auto">
              <Field name="kpi_include_afterhours" component={Checkbox} label="KPI Include Afterhours" />
            </div>
          </div>
          <div style={{marginTop: '30px'}}>
            <PrimaryButton className="btn" type="submit">
              Add New Task Type
            </PrimaryButton>
          </div>
        </fieldset>
      </Form>
    );
  }
}

export default reduxForm<Partial<ITaskType>, IProps>({
  form: 'TaskTypeForm',
  enableReinitialize: true,
  initialValues: {
    default_duration_minutes: 120,
    can_be_scheduled: false,
    kpi_include_afterhours: false,
    kpi_hours: 0,
    color: 5646
  }
})(TaskTypeForm);
