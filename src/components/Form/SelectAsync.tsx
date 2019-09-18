import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import classnames from 'classnames';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import ReactSelectAsync from 'react-select/lib/Async';
import selectStyles from './commonSelectStyles';

export interface IProps extends WrappedFieldProps {
  selectStyles?: any;
  label?: string;
  type?: string;
  loadOptions?: (query: string, callback?: (options: any) => void) => Promise<any> | void;
  noOptionsMessage?: (obj: {inputValue: string}) => string | null;
  placeholder?: string;
  getOptionLabel?: () => string;
  getOptionValue?: () => string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  isClearable?: boolean;
  disabled?: boolean;
}

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

class SelectAsync extends React.PureComponent<IProps> {
  public static defaultOptions = {
    getOptionValue: (option: any) => option.id.toString(),
    getOptionLabel: (option: any) => option.name,
    noOptionsMessage: ({inputValue}: {inputValue: string}) => (inputValue ? 'No options...' : 'Start typing...')
  };

  private handleBlur = () => {
    this.props.input.onBlur(this.props.input.value);
  };

  private getStyles = () => {
    return {...selectStyles, ...this.props.selectStyles};
  };

  public render() {
    const {meta, className, labelClassName, valueClassName, ...rest} = {...SelectAsync.defaultOptions, ...this.props};
    const isInvalid = meta.touched && meta.error;

    return (
      <div className={classnames('form-group', className)}>
        {this.props.label && <StyledLabel className={labelClassName}>{this.props.label}</StyledLabel>}
        <div className={valueClassName}>
          <ReactSelectAsync
            {...this.props.input}
            onBlur={this.handleBlur}
            styles={this.getStyles()}
            className={classnames('form-control', {'is-invalid': isInvalid})}
            placeholder={this.props.placeholder}
            loadOptions={this.props.loadOptions}
            isDisabled={this.props.disabled}
            {...rest}
          />
          {isInvalid && <div className="invalid-feedback">{meta.error}</div>}
        </div>
      </div>
    );
  }
}

export default SelectAsync;
