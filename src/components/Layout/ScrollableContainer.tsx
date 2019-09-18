import styled from 'styled-components';

const ScrollableContainer = styled.div`
  overflow-y: auto;
  @media print {
    width: auto;
    height: auto !important;
    overflow-y: visible;
  }
`;

export default ScrollableContainer;
