import * as React from 'react';
import {IconName} from 'src/components/Icon/Icon';
import styled, {css} from 'styled-components';
import Icon from 'src/components/Icon/Icon';
import {Link} from 'react-router-dom';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import withoutProps from 'src/components/withoutProps/withoutProps';
import {SidebarContext} from 'src/components/AppLayout/SidebarContextWrap';
import {useContext} from 'react';

export interface IMenuItem {
  path: string;
  icon?: IconName;
  label: string;
  value?: number | string;
  isActive: boolean;
  type?: string;
  hideInClosed?: boolean;
}

export interface IProps {
  item: IMenuItem;
  key?: string;
}

const LinkText = styled.div<{havePadding?: boolean}>`
  padding-left: ${props => (props.havePadding ? 26 : 0)}px;
  line-height: 1rem;
`;

const StyledIcon = styled(Icon)`
  fill: transparent;
  min-width: 20px;
`;

export const MenuItemCommonStyles = css`
  line-height: 0;
  padding: 13px 26px;
  background: transparent;
  color: ${ColorPalette.black0};
  font-weight: normal;
  path,
  circle {
    stroke: ${ColorPalette.black0};
    fill: transparent;
  }
  :hover path,
  :hover circle {
    stroke: ${ColorPalette.blue4};
  }
  :hover {
    color: ${ColorPalette.blue4};
  }
`;

export const FullNavLink = styled(withoutProps(['isActive'])(Link))<{isActive: boolean}>`
  ${MenuItemCommonStyles}
  color: ${props => (props.isActive ? ColorPalette.blue4 : ColorPalette.black0)};
  font-weight: ${props => (props.isActive ? Typography.weight.medium : Typography.weight.normal)};
  path,
  circle {
    stroke: ${props => (props.isActive ? ColorPalette.blue4 : ColorPalette.black0)};
    fill: transparent;
  }
`;

function FullSidebarMenuItem({item: {path, icon, label, isActive, value, hideInClosed = false}}: IProps) {
  const renderIcon = icon || icon === 0 ? <StyledIcon name={icon} /> : null;
  const sidebarContext = useContext(SidebarContext);
  if ((!renderIcon || hideInClosed) && !sidebarContext.isOpen) {
    return null;
  }

  const renderValue = value ? (
    <LinkText havePadding={true} className="ml-auto">
      {value}
    </LinkText>
  ) : null;
  return (
    <FullNavLink key={path} to={path} className="nav-link" isActive={isActive}>
      <div className="d-flex flex-row align-items-center">
        {renderIcon}
        {sidebarContext.isOpen ? (
          <React.Fragment>
            <LinkText havePadding={!!icon || icon === 0}>{label}</LinkText>
            {renderValue}
          </React.Fragment>
        ) : null}
      </div>
    </FullNavLink>
  );
}

export default FullSidebarMenuItem;
