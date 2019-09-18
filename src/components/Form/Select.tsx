import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import classnames from 'classnames';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import ReactSelect from 'react-select';
import selectStyles from './commonSelectStyles';

export interface IWrappedSelectOption {
  value: string;
  label: string;
}

export interface IProps extends WrappedFieldProps {
  selectStyles?: any;
  value?: any;
  label?: string;
  type?: string;
  options?: IWrappedSelectOption[] | any[];
  placeholder?: string;
  getOptionLabel?: () => string;
  getOptionValue?: () => string;
  className?: string;
  isClearable?: boolean;
  labelClassName?: string;
  valueClassName?: string;
  returnValue?: (obj: any) => void;
  disabled?: boolean;
}

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

class Select extends React.PureComponent<IProps> {
  public componentDidMount() {
    if (this.props.returnValue) {
      this.props.returnValue(this.props.input.value || {});
    }
  }

  private handleBlur = () => {
    this.props.input.onBlur(this.props.input.value);
  };

  private getStyles = () => {
    return {...selectStyles, ...this.props.selectStyles};
  };

  public render() {
    const {meta, input, className, labelClassName, valueClassName, ...rest} = this.props;
    const isInvalid = meta.touched && meta.error;
    return (
      <div className={classnames('form-group', className)}>
        {this.props.label && <StyledLabel className={labelClassName}>{this.props.label}</StyledLabel>}
        <div className={valueClassName}>
          <ReactSelect
            {...input}
            onBlur={this.handleBlur}
            styles={this.getStyles()}
            className={classnames('form-control', {'is-invalid': isInvalid})}
            placeholder={this.props.placeholder}
            options={this.props.options}
            isDisabled={this.props.disabled}
            {...rest}
          />
          {isInvalid && <div className="invalid-feedback">{meta.error}</div>}
        </div>
      </div>
    );
  }
}

export default Select;
