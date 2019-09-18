import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Icon, {IconName} from 'src/components/Icon/Icon';
import withoutProps from 'src/components/withoutProps/withoutProps';

export enum CheckboxDirection {
  horizontal = 'horizontal',
  verical = 'vertical'
}

const ORDER_CHECKBOX = 1;

interface IProps {
  onChange?: (cond: boolean) => void;
  inversedColors?: boolean;
  value?: boolean;
  disabled?: boolean;
  size?: number;
  direction?: CheckboxDirection | undefined;
  unremovable?: boolean;
  propsForForm?: any;
  label?: string;
}

const Checkbox = styled(
  withoutProps(['size', 'checked', 'color', 'background', 'checkedBackground', 'hasBorder', 'disabled'])('div')
)<{
  size: number;
  checked: boolean | undefined;
  color: string;
  background: string;
  checkedBackground: string;
  hasBorder?: boolean;
  disabled?: boolean;
}>`
  border: ${props => (props.hasBorder ? `1px solid ${props.color}` : `1px solid ${ColorPalette.gray2} !important`)};
  border-radius: 0.25em;
  height: ${props => props.size}px;
  width: ${props => props.size}px;
  display: block;
  background: ${props => (props.checked && !props.disabled ? props.checkedBackground : props.background)};
  position: relative;
  margin-bottom: 0;
  order: ${ORDER_CHECKBOX};

  & > input {
    opacity: 0 !important;
  }

  path {
    stroke: ${ColorPalette.white};
    fill: ${ColorPalette.white};
    stroke: ${props => props.color};
    fill: ${props => props.color};
  }
`;

const StyledLabel = styled.label<{isHorizontal: boolean}>`
  color: ${ColorPalette.gray4};
  flex-direction: ${props => (props.isHorizontal ? 'row' : 'column')};
  align-items: ${props => props.isHorizontal && 'center'};
`;

const CheckIcon = styled(Icon)`
  position: absolute;
`;

const OrderedLabel = styled.span<{isHorizontal: boolean}>`
  order: ${props => (props.isHorizontal ? ORDER_CHECKBOX + 1 : ORDER_CHECKBOX - 1)};
  margin-left: ${props => props.isHorizontal && '14px'};
`;

class CheckboxSimple extends React.PureComponent<IProps> {
  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!this.props.propsForForm && this.props.onChange) {
      this.props.onChange(e.target.checked);
    }
  };

  public render() {
    const {value, size, propsForForm, label, disabled, unremovable, direction = CheckboxDirection.verical} = this.props;
    const color = this.props.inversedColors ? ColorPalette.gray3 : ColorPalette.white;
    const background = this.props.inversedColors ? 'transparent' : ColorPalette.gray1;
    const checkedBackground = this.props.inversedColors ? ColorPalette.white : ColorPalette.blue2;
    const checked: boolean = (propsForForm || {}).value || value || unremovable;
    const isDisabled: boolean = !!disabled || !!unremovable;
    const isHorizontal: boolean = direction === CheckboxDirection.horizontal;

    return (
      <StyledLabel isHorizontal={isHorizontal} className="d-flex">
        <OrderedLabel isHorizontal={isHorizontal}>{label}</OrderedLabel>
        <Checkbox
          size={size || 18}
          checked={!!checked}
          hasBorder={this.props.inversedColors}
          color={color}
          background={background}
          checkedBackground={checkedBackground}
          disabled={isDisabled}
        >
          {checked && <CheckIcon name={IconName.CheckSimple} size={size || 18} />}
          <input
            type="checkbox"
            className="form-control"
            checked={!!checked}
            disabled={disabled}
            onChange={this.handleChange}
            {...propsForForm}
          />
        </Checkbox>
      </StyledLabel>
    );
  }
}

export default CheckboxSimple;
