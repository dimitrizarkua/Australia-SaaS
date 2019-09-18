import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

interface IProps {
  color?: string;
  opacity?: number;
  zIndex?: number;
}

const CoverBlock = styled.div<{
  color: string;
  opacity: number;
  zIndex?: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.color || ColorPalette.white};
  opacity: ${props => props.opacity || 0.5};
  z-index: ${props => props.zIndex || 100};
`;

class Cover extends React.PureComponent<IProps> {
  public render() {
    const {color, opacity, zIndex} = this.props;

    return <CoverBlock color={color || ColorPalette.white} opacity={opacity || 0.7} zIndex={zIndex} />;
  }
}

export default Cover;
