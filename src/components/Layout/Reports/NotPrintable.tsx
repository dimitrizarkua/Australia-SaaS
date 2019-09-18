import styled from 'styled-components';

const NotPrintable = styled.div`
  @media print {
    display: none;
  }
`;

export default NotPrintable;
