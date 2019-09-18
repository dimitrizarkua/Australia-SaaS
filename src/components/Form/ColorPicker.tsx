import {WrappedFieldProps} from 'redux-form';
import * as React from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import styled from 'styled-components';
import {ColorResult, ChromePicker} from 'react-color';
import DropdownMenuControl from '../Layout/MenuItems/DropdownMenuControl';
import withoutProps from 'src/components/withoutProps/withoutProps';

export interface IProps extends WrappedFieldProps {
  label?: string;
  height?: number;
}

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

const ColorBox = styled(withoutProps(['color', 'height'])('div'))<{
  color: string;
  height: number;
}>`
  border-radius: 100000px;
  background ${props => props.color};
  height: ${props => props.height}px;
  width: ${props => props.height}px;
`;

class ColorPicker extends React.PureComponent<IProps> {
  private onChange = (color: ColorResult) => {
    const {input} = this.props;

    input.onChange(color.hex);
  };

  private renderTrigger = () => {
    const {input, height} = this.props;
    return (
      <div className="h-100 d-flex align-items-center">
        <ColorBox color={input.value} height={height || 16} />
      </div>
    );
  };

  private renderBody = () => {
    const {input} = this.props;
    return <ChromePicker color={input.value} onChange={this.onChange} />;
  };

  public render() {
    const {label} = this.props;

    return (
      <div className="form-group">
        {label && <StyledLabel>{label}</StyledLabel>}
        <div className="h-100 w-100">
          <DropdownMenuControl
            transparentDropdown={true}
            trigger={this.renderTrigger}
            renderInternal={this.renderBody}
          />
        </div>
      </div>
    );
  }
}

export default ColorPicker;
