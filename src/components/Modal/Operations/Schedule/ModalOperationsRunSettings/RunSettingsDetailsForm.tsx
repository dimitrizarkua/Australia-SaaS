import * as React from 'react';
import {reduxForm, InjectedFormProps, Field} from 'redux-form';
import {required} from 'src/services/ValidationService';
import Input from 'src/components/Form/Input';

interface IInputProps {
  onSubmit: (data: IFormValues) => any;
}

export interface IFormValues {
  name: string;
}

export const RunSettingsDetailsFormName = 'RunSettingsDetailsForm';

class RunSettingsDetailsForm extends React.PureComponent<InjectedFormProps<IFormValues, IInputProps> & IInputProps> {
  public render() {
    const {handleSubmit} = this.props;

    return (
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-5">
            <Field name="name" label="Run Name" validate={required} component={Input} />
          </div>
        </div>
      </form>
    );
  }
}

export default reduxForm<IFormValues, IInputProps>({
  form: RunSettingsDetailsFormName
})(RunSettingsDetailsForm);
