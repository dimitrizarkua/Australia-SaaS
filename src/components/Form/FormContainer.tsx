import styled from 'styled-components';
import withoutProps from 'src/components/withoutProps/withoutProps';

const FormContainer = styled(withoutProps(['isNew'])('div'))<{isNew: boolean}>`
  position: relative;
  margin-bottom: ${props => (props.isNew ? 0 : '45px')};
`;

export default FormContainer;
