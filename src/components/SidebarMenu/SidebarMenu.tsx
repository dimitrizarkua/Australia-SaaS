import * as React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Icon, {IconName} from 'src/components/Icon/Icon';
import ReactTooltip from 'react-tooltip';
import withoutProps from 'src/components/withoutProps/withoutProps';

const StyledMenu = styled.nav`
  background: ${ColorPalette.gray1};
  overflow-y: auto;
  overflow-x: hidden;
  width: 72px;
  position: relative;
`;

export const NavLink = styled(withoutProps(['isActive'])(Link))<{isActive: boolean}>`
  line-height: 0;
  padding: 13px 26px;
  background: ${props => (props.isActive ? ColorPalette.gray2 : 'transparent')};
  path,
  circle,
  line {
    stroke: ${props => (props.isActive ? ColorPalette.blue4 : ColorPalette.black0)};
    fill: transparent;
  }
  :hover path,
  :hover circle,
  :hover line {
    stroke: ${ColorPalette.blue4};
  }
`;

export interface IProps {
  items: IMenuItem[];
}

export interface IMenuItem {
  path: string;
  icon: IconName;
  isActive: boolean;
  hint?: string;
}

class SidebarMenu extends React.PureComponent<IProps> {
  public render() {
    return (
      <StyledMenu className="text-center flex-shrink-0">
        {this.props.items.length > 0 && (
          <ReactTooltip className="overlapping" id="sidebar-menu-tooltip" place="right" effect="solid" />
        )}
        {this.props.items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className="nav-link"
            isActive={item.isActive}
            data-for="sidebar-menu-tooltip"
            data-tip={item.hint || ''}
          >
            <Icon name={item.icon} />
          </NavLink>
        ))}
        {this.props.children}
      </StyledMenu>
    );
  }
}

export default SidebarMenu;
