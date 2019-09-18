import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import RadioButton from './RadioButton';

export interface IProps {
  optionValue: string | number;
  label?: string;
  className?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  value?: any;
}

class RadioInput extends React.PureComponent<IProps & WrappedFieldProps> {
  public render() {
    const {meta} = this.props;
    const isInvalid = meta.touched && meta.error;
    const checked = this.props.input.value === this.props.optionValue;
    return (
      <div className="form-group">
        <RadioButton
          size={16}
          {...this.props.input}
          checked={checked}
          value={this.props.optionValue}
          disabled={this.props.disabled}
        />
        {isInvalid && <div className="invalid-feedback">{meta.error}</div>}
      </div>
    );
  }
}

export default RadioInput;
