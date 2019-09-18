import {onNotificationClickSwitcher} from 'src/utility/BrowserNotification';
import {
  INotificationBody,
  IUserNotification,
  NotificationContextTypes,
  NotificationTargetTypes,
  UserChannelNotificationTypes
} from 'src/models/INotification';
import {createBrowserHistory} from 'history';
import {IUser} from 'src/models/IUser';

describe('onNotificationClickSwitcher', () => {
  const notification: IUserNotification<INotificationBody> = {
    id: 4234,
    user_id: 645,
    body: {
      text: 'text',
      target: {
        id: 9878,
        type: NotificationTargetTypes.Job
      },
      sender: {} as IUser,
      context: {
        id: 64564,
        type: NotificationContextTypes.Note
      }
    },
    created_at: '',
    deleted_at: '',
    type: UserChannelNotificationTypes.JOB_NOTE_ATTACHED
  };
  const history = createBrowserHistory();

  it(`should in case of ${UserChannelNotificationTypes.JOB_CREATED}`, () => {
    notification.type = UserChannelNotificationTypes.JOB_CREATED;
    onNotificationClickSwitcher(notification, history)();
    expect(history.location.pathname).toEqual(`/job/${notification.body.target.id}/details`);
  });

  it(`should in case of ${UserChannelNotificationTypes.JOB_USER_ASSIGNED}`, () => {
    notification.type = UserChannelNotificationTypes.JOB_USER_ASSIGNED;
    onNotificationClickSwitcher(notification, history)();
    expect(history.location.pathname).toEqual(`/job/${notification.body.target.id}/details`);
  });

  it(`should in case of ${UserChannelNotificationTypes.JOB_TEAM_ASSIGNED}`, () => {
    notification.type = UserChannelNotificationTypes.JOB_USER_ASSIGNED;
    onNotificationClickSwitcher(notification, history)();
    expect(history.location.pathname).toEqual(`/job/${notification.body.target.id}/details`);
  });
});
