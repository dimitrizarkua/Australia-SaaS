import React, {useContext} from 'react';
import classnames from 'classnames';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {ISidebarContext, SidebarContext} from 'src/components/AppLayout/SidebarContextWrap';
import Icon, {IconName} from 'src/components/Icon/Icon';
import {MenuItemCommonStyles} from 'src/components/SidebarMenu/FullSidebarMenuItem';

const SIDEBAR_WIDTH = {
  FULL: 320,
  SHORT: 68
};

const StyledMenu = styled.nav<{width?: number; isOpen?: boolean}>`
  background: ${ColorPalette.gray1};
  border-right: 1px solid ${ColorPalette.gray2};
  overflow-y: auto;
  width: ${({isOpen, width}) => (isOpen ? width || SIDEBAR_WIDTH.FULL : SIDEBAR_WIDTH.SHORT)}px;
  position: relative;
`;

interface IProps {
  className?: string;
  width?: number;
  children: React.ReactNode;
  noExpand?: boolean;
}

const ToggleItem = styled.div`
  ${MenuItemCommonStyles}
  cursor: pointer;
`;

const CollapseText = styled.div`
  margin-left: 26px;
`;

function FullSidebarMenu({width, children, className, noExpand}: IProps) {
  const {isOpen, toggleSidebar}: ISidebarContext = useContext(SidebarContext);
  return (
    <StyledMenu
      width={width}
      className={classnames(
        'nav d-flex flex-nowrap flex-column text-left flex-shrink-0 justify-content-between',
        className
      )}
      isOpen={isOpen || noExpand}
    >
      <div>{children}</div>
      {!noExpand && (
        <ToggleItem onClick={toggleSidebar} className="d-flex flex-row align-items-center">
          {isOpen ? (
            <React.Fragment>
              <Icon name={IconName.LeftArrowNavigation} />
              <CollapseText>Collapse sidebar</CollapseText>
            </React.Fragment>
          ) : (
            <div className="d-flex flex-row align-items-center">
              <Icon name={IconName.RightArrowNavigation} />
            </div>
          )}
        </ToggleItem>
      )}
    </StyledMenu>
  );
}

export default React.memo(FullSidebarMenu);
