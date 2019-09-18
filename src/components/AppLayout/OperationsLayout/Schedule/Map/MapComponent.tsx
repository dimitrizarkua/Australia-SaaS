import 'leaflet/dist/leaflet.css';
import 'src/components/AppLayout/OperationsLayout/Schedule/Map/map.css';

import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IRun} from 'src/models/IRun';
import {Map as LeafletMap, TileLayer} from 'react-leaflet';
import RunViewOnMap from 'src/components/AppLayout/OperationsLayout/Schedule/Map/RunViewOnMap';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {ITask} from 'src/models/ITask';
import {circleMarker, featureGroup} from 'leaflet';
import {ILocation} from 'src/models/IAddress';

interface IProps {
  runs: IRun[];
  loadingRuns: boolean;
  location: ILocation;
}

const MapContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${ColorPalette.red1};
`;

class MapComponent extends React.PureComponent<IProps> {
  public componentDidMount() {
    this.fitMapBounds();
  }

  public componentDidUpdate(prevProps: IProps) {
    this.fitMapBounds();
  }

  private fitMapBounds = () => {
    const markers = this.getAllMarkersFromRuns(this.props.runs);

    if (this.map && markers.length > 0) {
      this.map.current.leafletElement.fitBounds(featureGroup(this.getAllMarkersFromRuns(this.props.runs)).getBounds(), {
        padding: [100, 100],
        maxZoom: 17
      });
    }
  };

  private getAllMarkersFromRuns = (runs: IRun[]): any[] => {
    const res: any[] = [];
    const delta = 0.000000001;

    runs.forEach((run: IRun) => {
      run.assigned_tasks.forEach((task: ITask) => {
        if (task.job.site_address_lat && task.job.site_address_lng) {
          res.push(circleMarker([task.job.site_address_lat, task.job.site_address_lng]));

          if (res.length === 1) {
            res.push(circleMarker([task.job.site_address_lat + delta, task.job.site_address_lng + delta]));
          }
        }
      });
    });

    return res;
  };

  private map: React.RefObject<any> = React.createRef();

  public render() {
    const {runs, loadingRuns, location} = this.props;

    return (
      <MapContainer>
        <LeafletMap center={[-34.397, 150.644]} maxZoom={17} zoom={4} ref={this.map}>
          <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="" />
          {runs.map((run: IRun) => (
            <RunViewOnMap key={`run-${run.id}`} run={run} location={location} />
          ))}
        </LeafletMap>
        {loadingRuns && <BlockLoading color={ColorPalette.white} size={40} zIndex={999} />}
      </MapContainer>
    );
  }
}

export default MapComponent;
