import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import {StyledLabel} from './Common';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

interface IProps extends WrappedFieldProps {
  label?: string;
  x?: number;
  y?: number;
  list?: string[];
}

interface IState {
  elements: string[];
}

const Grid = styled.div<{
  x: number | undefined;
  y: number | undefined;
}>`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  border-radius: 0.25rem;
  border: 1px solid ${ColorPalette.gray2};
  overflow: hidden;
  background: ${ColorPalette.gray1};

  & > div:nth-child(${props => props.x || 1}n) {
    margin-right: 0 !important;
  }

  & > div:nth-child(n + ${props => (props.x || 1) * ((props.y || 1) - 1) + 1}) {
    margin-bottom: 0 !important;
  }
`;

const Element = styled.div<{
  selected: boolean;
  x: number | undefined;
}>`
  padding: 10px;
  text-align: center;
  cursor: pointer;
  width: ${props => `calc((100% - ${(props.x || 1) - 1}px) / ${props.x || 1})`};
  max-width: ${props => `calc((100% - ${(props.x || 1) - 1}px) / ${props.x || 1})`};
  background: ${props => (props.selected ? `${ColorPalette.blue2} !important` : ColorPalette.white)};
  color: ${props => (props.selected ? ColorPalette.white : ColorPalette.gray5)};
  outline: ${props => (props.selected ? `1px solid ${ColorPalette.blue3}` : '')};
  outline-offset: 0.5px;
  overflow: hidden;
  margin: 0px 1px 1px 0px

  :hover {
    background: ${ColorPalette.gray1};
  }
`;

class MultipleSelectPlate extends React.PureComponent<IProps, IState> {
  public state = {
    elements: this.props.input.value ? this.props.input.value : []
  };

  private onClick = (str: string) => {
    if ((this.state.elements as string[]).includes(str)) {
      const clone = Array.apply(null, this.state.elements);
      clone.splice(clone.indexOf(str), 1);
      this.setState({elements: clone});
    } else {
      this.setState({elements: (this.state.elements as string[]).concat([str])});
    }

    setTimeout(() => {
      this.props.input.onChange(this.state.elements);
    });
  };

  public render() {
    const {x, y, list, label} = this.props;

    return (
      <div className="form-group">
        {label && <StyledLabel>{label}</StyledLabel>}
        <Grid x={x} y={y}>
          {list &&
            list.map((el, index) => (
              <Element
                selected={(this.state.elements as string[]).includes(el.toLowerCase())}
                x={x}
                onClick={() => {
                  this.onClick(el.toLowerCase());
                }}
                key={index}
              >
                {el}
              </Element>
            ))}
        </Grid>
      </div>
    );
  }
}

export default MultipleSelectPlate;
