import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import classnames from 'classnames';
import styled, {css} from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

interface IProps extends WrappedFieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  hint?: React.ReactElement<unknown> | Array<React.ReactElement<unknown>> | string | null;
  disabled?: boolean;
}

interface IState {
  isExpanded: boolean;
  isHoverHint: boolean;
}

export const inputCss = css`
  background: ${ColorPalette.gray1};
  border-radius: 4px;
  border: none;

  &::placeholder {
    font-weight: lighter;
    color: ${ColorPalette.gray4};
  }
`;

const StyledInput = styled.input`
  ${inputCss}
`;

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

const HintHolder = styled.div`
  position: relative;
  top: 5px;
`;

class InputWithHint extends React.PureComponent<IProps, IState> {
  public state = {
    isExpanded: false,
    isHoverHint: false
  };

  private set setExpanded(isExpanded: boolean) {
    this.setState({isExpanded});
  }

  private set setHoverHint(isHoverHint: boolean) {
    this.setState({isHoverHint});
  }

  public render() {
    const {meta, hint} = this.props;
    const {isExpanded, isHoverHint} = this.state;
    const isInvalid = meta.touched && meta.error;

    return (
      <div className="form-group">
        {this.props.label && <StyledLabel>{this.props.label}</StyledLabel>}
        <StyledInput
          {...this.props.input}
          className={classnames('form-control', this.props.className, {'is-invalid': isInvalid})}
          placeholder={this.props.placeholder}
          type={this.props.type}
          disabled={!!this.props.disabled}
          onFocus={() => {
            this.setExpanded = true;
          }}
          onBlur={() => {
            this.setExpanded = false;
          }}
        />
        <HintHolder>
          {(isExpanded || isHoverHint) && hint && (
            <div
              className="dropdown-menu show"
              onMouseOver={() => {
                this.setHoverHint = true;
              }}
              onMouseOut={() => {
                this.setHoverHint = false;
              }}
              onClick={() => {
                this.setHoverHint = false;
              }}
            >
              {hint}
            </div>
          )}
        </HintHolder>
        {isInvalid && <div className="invalid-feedback">{meta.error}</div>}
      </div>
    );
  }
}

export default InputWithHint;
