import React from 'react';
import {Marker} from 'react-leaflet';
import L, {LatLngExpression} from 'leaflet';
import ColoredIcon from 'src/components/Icon/ColoredIcon';
import {IconName} from 'src/components/Icon/Icon';
import ReactDOMServer from 'react-dom/server';
import styled from 'styled-components';

interface IProps {
  position: LatLngExpression;
  color: string;
}

const PinShadow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  box-shadow: 0 0 38px 19px black;
  opacity: 0.15;
`;

class MapPin extends React.PureComponent<IProps> {
  private renderIcon = () => {
    const {color} = this.props;
    const iconSize = 40;

    return new L.DivIcon({
      html: ReactDOMServer.renderToStaticMarkup(
        <>
          <PinShadow />
          <ColoredIcon
            size={iconSize}
            style={{position: 'relative'}}
            color={color}
            name={IconName.PinMapFilled}
            fill={true}
          />
        </>
      ),
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize],
      popupAnchor: [0, -iconSize / 1.2]
    });
  };

  public render() {
    const {position, children} = this.props;

    return (
      <Marker position={position} icon={this.renderIcon()}>
        {children}
      </Marker>
    );
  }
}

export default MapPin;
