import * as React from 'react';
import {default as Icon, IProps as IpropsExternal} from 'src/components/Icon/Icon';
import styled from 'styled-components';
import withoutProps from 'src/components/withoutProps/withoutProps';

interface IProps extends IpropsExternal {
  color: string;
  fill?: boolean;
  hoverColor?: string;
}

const ColoredIconCore = styled(withoutProps(['color', 'fill', 'hoverColor'])(Icon))<{
  color: string;
  fill?: boolean;
  hoverColor?: string;
}>`
  & * {
    stroke: ${props => props.color} !important;
    fill: ${props => props.fill && props.color} !important;
  }

  &:hover * {
    stroke: ${props => (props.hoverColor ? props.hoverColor : props.color)} !important;
  }
`;

class ColoredIcon extends React.PureComponent<IProps> {
  public render() {
    const {color, fill, hoverColor} = this.props;

    return <ColoredIconCore {...this.props} color={color} fill={fill} hoverColor={hoverColor} />;
  }
}

export default ColoredIcon;
