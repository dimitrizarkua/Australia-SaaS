import * as React from 'react';
import styled from 'styled-components';
import Icon, {IProps as IIconProps} from 'src/components/Icon/Icon';
import ColorPalette from 'src/constants/ColorPalette';
import withoutProps from 'src/components/withoutProps/withoutProps';

const EditorControl = styled(withoutProps(['isActive'])(Icon))<IProps>`
  margin: 8px;
  cursor: pointer;

  path {
    stroke: ${props => (props.isActive ? ColorPalette.black0 : ColorPalette.gray5)};
  }

  :hover path {
    stroke: ${ColorPalette.black0};
  }
`;

interface IProps {
  isActive: boolean;
}

export default (props: IProps & IIconProps) => <EditorControl {...props} size={18} />;
