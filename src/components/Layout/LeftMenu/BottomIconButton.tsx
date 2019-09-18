import * as React from 'react';
import {default as Icon, IconName} from 'src/components/Icon/Icon';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

interface IProps {
  name: IconName;
  onClick?: () => void;
  size?: number;
  'data-tip'?: string;
  'data-for'?: string;
}

const MenuActionsBarItem = styled.div`
  margin-right: 26px;
  cursor: pointer;

  :hover path,
  :hover line,
  :hover circle {
    stroke: ${ColorPalette.blue4};
  }
`;

class BottomIconButton extends React.PureComponent<IProps> {
  public render() {
    const {name, onClick, size, 'data-tip': dt, 'data-for': df} = this.props;

    return (
      <MenuActionsBarItem onClick={onClick} data-for={df} data-tip={dt}>
        <Icon name={name} size={size} />
      </MenuActionsBarItem>
    );
  }
}

export default BottomIconButton;
