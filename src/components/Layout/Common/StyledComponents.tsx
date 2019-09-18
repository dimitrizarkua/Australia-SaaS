import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
// import withoutProps from 'src/components/withoutProps/withoutProps';

export const Link = styled.div<{
  margin?: string;
  disabled?: boolean;
  fontSize?: string;
  color?: string;
  colorOnHover?: string;
  noDecoration?: boolean;
}>`
  font-size: ${props => props.fontSize || Typography.size.smaller};
  color: ${props => (props.color ? props.color : ColorPalette.blue4)};
  cursor: pointer;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  margin: ${props => props.margin};

  &:hover {
    color: ${props => (props.colorOnHover ? props.colorOnHover : ColorPalette.blue5)};
    ${props => !props.noDecoration && 'text-decoration: underline;'}
  }
`;

export const AvatarSquare = styled.div<{
  wh: number;
  backgroundUrl?: string;
  backgroundColor?: string | undefined;
  margin?: string;
  fontSize?: string;
}>`
  border-radius: 4px;
  width: ${props => props.wh}px;
  height: ${props => props.wh}px;
  color: ${props => (props.backgroundUrl ? ColorPalette.transparent : ColorPalette.gray5)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${Typography.weight.bold};
  font-size: ${props => props.fontSize || '1em'};
  background-position: center;
  flex-shrink: 0;
  background: ${props =>
    props.backgroundUrl ? `url(${props.backgroundUrl})` : props.backgroundColor || ColorPalette.gray1};
  background-size: cover;
  margin: ${props => props.margin};
`;

export const ColoredDiv = styled.div<{
  color?: string;
  weight?: string;
  fontSize?: string;
  margin?: string;
  textOverflow?: string;
  padding?: string;
  overflow?: string;
}>`
  color: ${props => props.color || 'unset'};
  font-weight: ${props => props.weight || Typography.weight.normal};
  font-size: ${props => props.fontSize || '1em'};
  text-overflow: ${props => props.textOverflow || 'unset'};
  overflow: ${props => props.overflow || 'hidden'};
  margin: ${props => props.margin};
  padding: ${props => props.padding};
  position: relative;
`;

const SortedGroupTitle = styled.div<{
  padding?: string;
}>`
  text-transform: uppercase;
  color: ${ColorPalette.gray4};
  font-weight: ${Typography.weight.medium};
  padding: ${props => props.padding || '0 0 0 0'};
`;

const ColoredRow = styled.div<{
  background?: string;
  borderColor?: string;
}>`
  width: 100%;
  padding: 45px 30px;
  border-bottom: 1px solid ${props => props.borderColor || ColorPalette.gray2};
  background-color: ${props => props.background || ColorPalette.gray1};
`;

export default {
  Link,
  AvatarSquare,
  ColoredDiv,
  ColoredRow,
  SortedGroupTitle
};
