import * as React from 'react';
import {ITask} from 'src/models/ITask';
import MapPin from 'src/components/AppLayout/OperationsLayout/Schedule/Map/MapPin';
import PinPopup from 'src/components/AppLayout/OperationsLayout/Schedule/Map/PinPopup';
import {ILocation} from 'src/models/IAddress';

interface IProps {
  tasks: ITask[];
  color: string;
  location: ILocation;
}

interface ISortedTasksGroup {
  lat: number;
  lng: number;
  tasks: ISequenceTask[];
}

export interface ISequenceTask {
  task: ITask;
  index: number;
}

class RunTaskPinSet extends React.PureComponent<IProps> {
  private sortTasks = (): ISortedTasksGroup[] => {
    const {tasks} = this.props;
    const groups = {};

    tasks.forEach((task: ITask, index) => {
      if (task.job.site_address_lat && task.job.site_address_lng) {
        const latLngStr = `${task.job.site_address_lat}-${task.job.site_address_lng}`;
        if (!groups[latLngStr]) {
          groups[latLngStr] = {
            lat: task.job.site_address_lat,
            lng: task.job.site_address_lng,
            tasks: [
              {
                task,
                index
              }
            ]
          };
        } else {
          groups[latLngStr].tasks.push({
            task,
            index
          });
        }
      }
    });

    return Object.values(groups);
  };

  public render() {
    const {color, location} = this.props;

    return this.sortTasks().map((group: ISortedTasksGroup, index) => {
      return (
        <MapPin key={`location-${index}`} position={[group.lat, group.lng]} color={color}>
          <PinPopup tasks={group.tasks} location={location} />
        </MapPin>
      );
    });
  }
}

export default RunTaskPinSet;
