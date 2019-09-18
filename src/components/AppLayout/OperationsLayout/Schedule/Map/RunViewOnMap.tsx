import * as React from 'react';
import {IRun} from 'src/models/IRun';
import RunTaskPolylineSet from 'src/components/AppLayout/OperationsLayout/Schedule/Map/RunTaskPolylineSet';
import {getRandomColor} from 'src/utility/Helpers';
import RunTaskPinSet from 'src/components/AppLayout/OperationsLayout/Schedule/Map/RunTaskPinSet';
import {ILocation} from 'src/models/IAddress';

interface IProps {
  run: IRun;
  location: ILocation;
}

class RunViewOnMap extends React.PureComponent<IProps> {
  public render() {
    const {
      run: {assigned_tasks},
      location
    } = this.props;
    const color = getRandomColor();

    return (
      <>
        <RunTaskPolylineSet tasks={assigned_tasks} color={color} />
        <RunTaskPinSet tasks={assigned_tasks} color={color} location={location} />
      </>
    );
  }
}

export default RunViewOnMap;
