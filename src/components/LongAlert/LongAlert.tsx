import ColorPalette from 'src/constants/ColorPalette';
import styled from 'styled-components';
import Icon, {IconName} from 'src/components/Icon/Icon';
import * as React from 'react';

const Alert = styled.div`
  color: ${ColorPalette.black0};
  background: ${ColorPalette.orange0};
  border-radius: 0;
  border-color: ${ColorPalette.orange1};
  border-left-width: 8px;
  margin-top: 20px;
`;

const AlertIcon = styled(Icon)`
  vertical-align: sub;
  margin-right: 12px;
`;

class LongAlert extends React.PureComponent {
  public render() {
    return (
      <Alert className="alert">
        <AlertIcon name={IconName.Alert} size={18} />
        {this.props.children}
      </Alert>
    );
  }
}

export default LongAlert;
