import * as React from 'react';
import {ITask} from 'src/models/ITask';
import {Polyline} from 'react-leaflet';
import {LatLngExpression} from 'leaflet';

interface IProps {
  tasks: ITask[];
  color: string;
}

class RunTaskPolylineSet extends React.PureComponent<IProps> {
  private getPositions = () => {
    const {tasks} = this.props;

    return tasks
      .filter((task: ITask) => task.job.site_address_lat && task.job.site_address_lng)
      .map((task: ITask) => [task.job.site_address_lat, task.job.site_address_lng] as LatLngExpression);
  };

  public render() {
    const {color} = this.props;

    return <Polyline color={color} positions={this.getPositions()} />;
  }
}

export default RunTaskPolylineSet;
