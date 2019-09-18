import * as React from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import styled from 'styled-components';
import {default as Icon, IconName} from 'src/components/Icon/Icon';
import withoutProps from 'src/components/withoutProps/withoutProps';

interface IProps {
  size: number;
  color?: string;
  onClick?: (obj: any) => void;
  zIndex?: number;
}

const Loader = styled(withoutProps(['zIndex'])('div'))<{zIndex?: number}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.zIndex || 100};

  svg {
    position: absolute;
    z-index: 1;
  }

  path {
    fill: ${ColorPalette.blue2} !important
    stroke: transparent !important;
  }
`;

const Background = styled.div<{
  color: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.color};
  opacity: 0.7;
`;

class BlockLoading extends React.PureComponent<IProps> {
  public render() {
    const {size, color, onClick, zIndex} = this.props;

    return (
      <Loader className="cover-loading" onClick={onClick} zIndex={zIndex}>
        <Background color={color || ColorPalette.transparent} />
        <Icon name={IconName.Loading} size={size} />
      </Loader>
    );
  }
}

export default BlockLoading;
