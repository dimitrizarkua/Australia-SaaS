import * as React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import withoutProps from 'src/components/withoutProps/withoutProps';

const StyledMenu = styled.nav`
  background: ${ColorPalette.gray0};
  overflow-y: auto;
  border-right: 1px solid ${ColorPalette.gray2};
  width: 210px;
`;

const LinkText = styled.div`
  line-height: ${Typography.size.normal};
`;

export const FullNavLink = styled(withoutProps(['isActive'])(Link))<{isActive: boolean}>`
  line-height: 0;
  padding: ${Typography.size.normal} 20px;
  background: transparent;
  color: ${props => (props.isActive ? ColorPalette.blue4 : ColorPalette.black0)};
  font-weight: ${Typography.weight.normal};
`;

export interface IProps {
  items: ISubmenuItem[];
}

export interface ISubmenuItem {
  path: string;
  label: string;
  isActive: boolean;
  removed?: boolean;
}

class SidebarSubmenu extends React.PureComponent<IProps> {
  public render() {
    return (
      <StyledMenu className="text-center flex-shrink-0">
        {this.props.items.map(item => (
          <FullNavLink key={item.path} to={item.path} className="nav-link" isActive={item.isActive}>
            <div className="d-flex flex-row align-items-center">
              <LinkText>{item.label}</LinkText>
            </div>
          </FullNavLink>
        ))}
      </StyledMenu>
    );
  }
}

export default SidebarSubmenu;
