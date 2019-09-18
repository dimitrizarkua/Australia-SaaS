import * as React from 'react';
import {HTMLAttributes} from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

interface IProps extends HTMLAttributes<{}> {
  size: number;
  value: string | number;
  name: string;
  disabled?: boolean;
  checked?: boolean;
}

const Radio = styled.label<{
  size: number;
  checked: boolean | undefined;
  disabled: boolean | undefined;
}>`
  border: 0 !important;
  border-radius: 100px;
  height: ${props => props.size}px;
  width: ${props => props.size}px;
  display: block
  box-shadow: 0 0 0 1.5px ${props =>
    props.checked && !props.disabled ? ColorPalette.blue2 : ColorPalette.gray1} inset;
  position: relative;
  margin: 0;

  ${props =>
    props.checked &&
    `
    &:before {
      content: '';
      display: block;
      position: absolute;
      width: 50%;
      height: 50%
      top: 25%;
      left: 25%;
      border-radius: 100%;
      background: ${props.disabled ? ColorPalette.gray1 : ColorPalette.blue2};
    }`}

  & > input {
    opacity: 0;
  }

  ${props =>
    props.disabled &&
    `
    & > input {
      display: none;
    }`}
`;

class RadioButton extends React.PureComponent<IProps> {
  public render() {
    const {size, value, onChange, name, disabled, checked} = this.props;
    return (
      <Radio size={size} checked={checked} disabled={disabled}>
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          className="form-control"
          disabled={disabled}
          onChange={onChange}
        />
      </Radio>
    );
  }
}

export default RadioButton;
