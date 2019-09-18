import {INotificationBody, IUserNotification} from 'src/models/INotification';

const hydrate = (notification: IUserNotification): IUserNotification<INotificationBody> => {
  let parsedBody: any;
  try {
    parsedBody = JSON.parse(notification.body);
  } catch {
    parsedBody = {
      sender: {},
      context: {},
      target: {}
    };
  }
  return {
    id: notification.id,
    user_id: notification.user_id,
    body: parsedBody,
    created_at: notification.created_at,
    deleted_at: notification.deleted_at,
    type: notification.type
  };
};

export default {
  hydrate
};
