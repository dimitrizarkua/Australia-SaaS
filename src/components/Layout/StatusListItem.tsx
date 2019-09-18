import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import {IJobStatus} from 'src/models/IJob';
import moment from 'moment';
import {getUserNames} from 'src/utility/Helpers';
import {IUser} from 'src/models/IUser';
import {FRONTEND_DATE_TIME} from 'src/constants/Date';

const noteBorder = 4;
const avatarLeftMargin = 24;
const avatarWidth = 40;
const noteTextLeftMargin = 24;

const StatusMessage = styled.div`
  border-top: 1px solid ${ColorPalette.gray2};
  border-bottom: 1px solid ${ColorPalette.gray2};
  background: ${ColorPalette.gray0};
  color: ${ColorPalette.gray5};
  height: 50px;
  padding-left: ${noteTextLeftMargin + avatarWidth + avatarLeftMargin + noteBorder}px;
  margin-top: -1px;
`;

const StatusDateLabel = styled.div`
  width: 140px;
  font-size: ${Typography.size.smaller};
  margin-right: 62px;
`;

interface IProps<T> {
  status: Partial<IJobStatus & T>;
  itemTypeName?: string;
}

class StatusListItem<T> extends React.PureComponent<IProps<T>> {
  private get renderStatusLabel() {
    switch ((this.props.status.status as string).toLowerCase()) {
      case 'created':
        return this.getStatusOfCreating();
      default:
        return this.getStatusOfChanging();
    }
  }

  protected getStatusOfChanging() {
    const {
      status: {status, user}
    } = this.props;
    const userNames = getUserNames(user as IUser);
    return `Status changed to ‘${status}’ ${user ? `by ${userNames.name}` : ''}`;
  }

  protected getStatusOfCreating() {
    const {
      status: {user},
      itemTypeName
    } = this.props;
    const userNames = getUserNames(user as IUser);
    return `${itemTypeName} created ${user ? `by ${userNames.name}` : ''}`;
  }

  public render() {
    return (
      <StatusMessage className="d-flex flex-row align-items-end">
        <div className="d-flex flex-column align-self-center flex-grow-1">{this.renderStatusLabel}</div>
        <StatusDateLabel className="d-flex flex-column align-self-center">
          {moment(this.props.status.created_at! || '').format(FRONTEND_DATE_TIME)}
        </StatusDateLabel>
      </StatusMessage>
    );
  }
}

export default StatusListItem;
