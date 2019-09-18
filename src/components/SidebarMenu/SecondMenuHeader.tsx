import React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {useContext} from 'react';
import {SidebarContext} from 'src/components/AppLayout/SidebarContextWrap';

const SecondMenuHeaderComponent = styled.div`
  text-transform: uppercase;
  padding: 7px 26px;
  color: ${ColorPalette.gray4};
  margin-top: 20px;
`;

function SecondMenuHeader({children}: {children: React.ReactNode}) {
  const sidebarContext = useContext(SidebarContext);
  return (sidebarContext.isOpen && <SecondMenuHeaderComponent>{children}</SecondMenuHeaderComponent>) || null;
}

export default SecondMenuHeader;
