import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import classnames from 'classnames';
import CheckboxSimple, {CheckboxDirection} from './CheckboxSimple';

export interface IProps extends WrappedFieldProps {
  optionValue?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
  direction?: CheckboxDirection;
}

class Checkbox extends React.PureComponent<IProps> {
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.input.onChange(event.target.checked);
  };

  private handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.input.onBlur(event.target.checked);
  };

  public render() {
    const {meta, label, direction, disabled} = this.props;
    const isInvalid = meta.touched && meta.error;
    const props = {
      ...this.props.input,
      onChange: this.handleChange,
      onBlur: this.handleBlur,
      className: classnames('form-control', this.props.className, {'is-invalid': isInvalid}),
      defaultChecked: this.props.optionValue
    };
    return (
      <div className="form-group">
        <CheckboxSimple propsForForm={props} label={label} direction={direction} disabled={disabled} />
        {isInvalid && <div className="invalid-feedback">{meta.error}</div>}
      </div>
    );
  }
}

export default Checkbox;
