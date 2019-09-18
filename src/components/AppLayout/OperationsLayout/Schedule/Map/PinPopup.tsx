import * as React from 'react';
import {Popup} from 'react-leaflet';
import moment from 'moment';
import {FRONTEND_TIME} from 'src/constants/Date';
import {ISequenceTask} from 'src/components/AppLayout/OperationsLayout/Schedule/Map/RunTaskPinSet';
import {IPerson} from 'src/models/IPerson';
import styled from 'styled-components';
import {ILocation} from 'src/models/IAddress';

const HintBox = styled.div`
  margin-bottom: 10px;

  :last-child {
    margin-bottom: 0;
  }
`;

interface IProps {
  tasks: ISequenceTask[];
  location: ILocation;
}

class PinPopup extends React.PureComponent<IProps> {
  public render() {
    const {tasks, location} = this.props;

    return (
      <Popup>
        {tasks.map((task: ISequenceTask, index) => (
          <HintBox key={index}>
            <strong>
              {task.index + 1} - {task.task.name}
            </strong>
            <br />
            {task.task.job.site_address && (
              <>
                {task.task.job.site_address.full_address}
                <br />
              </>
            )}
            {task.task.job.site_contact && (
              <>
                {(task.task.job.site_contact as IPerson).first_name} {(task.task.job.site_contact as IPerson).last_name}
                <br />
              </>
            )}
            Job #{task.task.job.id}
            <br />
            Schedule time:{' '}
            {moment(task.task.starts_at)
              .utcOffset(location.tz_offset)
              .format(FRONTEND_TIME)}{' '}
            -{' '}
            {moment(task.task.ends_at)
              .utcOffset(location.tz_offset)
              .format(FRONTEND_TIME)}
          </HintBox>
        ))}
      </Popup>
    );
  }
}

export default PinPopup;
