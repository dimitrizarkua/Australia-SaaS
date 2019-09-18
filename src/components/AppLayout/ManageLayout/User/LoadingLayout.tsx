import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import React from 'react';

const Layout = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${ColorPalette.gray1}
  opacity: 0.6;
  z-index: 2;
  point-events: none;
`;

export default function LoadingLayout() {
  return (
    <Layout>
      <BlockLoading size={40} />
    </Layout>
  );
}
