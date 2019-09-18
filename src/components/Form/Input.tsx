import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import classnames from 'classnames';
import styled, {css} from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import InputMask from 'react-input-mask';

export interface IProps extends WrappedFieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  currency?: boolean;
  labelClassName?: string;
  valueClassName?: string;
  disabled?: boolean;
  min?: number;
  mask?: string;
  step?: number;
  maskChar?: string | null;
}

export const inputCss = css`
  background: ${ColorPalette.gray1};
  position: relative;
  border-radius: 4px;
  border: none;

  &:disabled {
    background: ${ColorPalette.gray0};
  }

  &::placeholder {
    font-weight: lighter;
    color: ${ColorPalette.gray4};
  }
`;

const StyledInput = styled.input<{
  isCurrencyOffset: boolean;
}>`
  ${inputCss}
  
  padding-left: ${props => (props.isCurrencyOffset ? '1.3em' : null)}
`;

const InputWrapper = styled.div<{
  currency?: boolean;
}>`
  position: relative;
  &::after {
    content: ${props => props.currency && "'$'"};
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 8px;
  }
`;

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

class Input extends React.PureComponent<IProps> {
  public render() {
    const {
      meta,
      min,
      currency,
      input,
      type,
      placeholder,
      disabled,
      mask,
      maskChar,
      labelClassName,
      label,
      valueClassName,
      step,
      className: outsideClassName
    } = this.props;
    const isInvalid = meta.touched && meta.error;
    const isShowCurrency = currency && input.value;
    const className = classnames('form-control', {'is-invalid': isInvalid});
    const styledInputProps = {
      ...input,
      min,
      className,
      type,
      placeholder,
      disabled,
      step
    };
    return (
      <div className={classnames('form-group', outsideClassName)}>
        {label && <StyledLabel className={labelClassName}>{label}</StyledLabel>}
        <div className={valueClassName}>
          {mask ? (
            <InputMask mask={mask as string} maskChar={maskChar} {...styledInputProps}>
              {(inputProps: any) => <StyledInput {...inputProps} disabled={disabled} />}
            </InputMask>
          ) : (
            <InputWrapper currency={isShowCurrency}>
              <StyledInput {...styledInputProps} isCurrencyOffset={isShowCurrency} />
            </InputWrapper>
          )}
          {isInvalid && (
            <div className="invalid-feedback" style={{display: isInvalid ? 'block' : 'none'}}>
              {meta.error}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Input;
