import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import classnames from 'classnames';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {inputCss} from 'src/components/Form/Input';

export interface IProps extends WrappedFieldProps {
  label?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  disabled?: boolean;
}

const StyledTextArea = styled.textarea`
  min-height: 120px;
  resize: none;
  ${inputCss}
`;

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

class TextArea extends React.PureComponent<IProps> {
  public render() {
    const {meta} = this.props;
    const isInvalid = meta.touched && meta.error;
    return (
      <div className={classnames('form-group', this.props.className)}>
        {this.props.label && <StyledLabel className={this.props.labelClassName}>{this.props.label}</StyledLabel>}
        <div className={this.props.valueClassName}>
          <StyledTextArea
            {...this.props.input}
            className={classnames('form-control', {'is-invalid': isInvalid})}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
          />
          {isInvalid && <div className="invalid-feedback">{meta.error}</div>}
        </div>
      </div>
    );
  }
}

export default TextArea;
