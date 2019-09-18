import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';

interface IProps {
  url: string | undefined;
  width: number;
  height: number;
}

const Avatar = styled.div<{
  url?: string;
  width: number;
  height: number;
}>`
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border-radius: 50%;
  margin-right: 15px;
  cursor: pointer;

  ${props =>
    props.url
      ? `
    background-image: url(${props.url});
    background-size: cover;
    background-position: center;
    color: transparent;
  `
      : `
    color: ${ColorPalette.gray5};
    box-shadow: 0 0 0 1px ${ColorPalette.gray2} inset;
  `}
`;

class ContactAvatar extends React.PureComponent<IProps> {
  public render() {
    const {url, width, height} = this.props;

    return (
      <Avatar className="d-flex align-items-center justify-content-center" url={url} height={height} width={width}>
        Add photo
      </Avatar>
    );
  }
}

export default ContactAvatar;
