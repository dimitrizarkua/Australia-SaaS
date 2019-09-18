import * as React from 'react';
import {getEcho} from './Echo';
import Notify, {NotifyType} from './Notify';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import styled from 'styled-components';
import {updateCurrentUserNotifications} from 'src/redux/userDucks';
import {debounce} from 'lodash';
import {store} from 'src/redux/store';
import {
  INotificationBody,
  IUserNotification,
  IWebSocketNotification,
  NotificationTargetTypes,
  UserChannelNotificationTypes
} from 'src/models/INotification';
import {History} from 'history';
import NotificationTransformer from 'src/transformers/NotificationTransformer';
import EventBus from 'src/utility/EventBus';
import UserService from 'src/services/UserService';

interface IBrowserNotificationConfig {
  title?: string;
  body?: string;
  onClick?: () => void;
  icon?: string;
  image?: string;
}

const {ColoredDiv} = StyledComponents;

const WarningSign = styled.div`
  color: ${ColorPalette.white};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${ColorPalette.orange1}
  width: 36px;
  height: 36px;
  border-radius: 99px;
  border: 10px solid ${ColorPalette.orange1}4a;
  background-clip: padding-box;
  margin-right: 8px;
`;

const NotificationFrame = (title: string, body: string = '', onClick?: () => any) => (
  <table onClick={onClick}>
    <tbody>
      <tr>
        <td>
          <WarningSign>!</WarningSign>
        </td>
        <td>
          <ColoredDiv weight={Typography.weight.medium} fontSize={Typography.size.medium}>
            {title}
          </ColoredDiv>
        </td>
      </tr>
      <tr>
        <td />
        <td>
          <ColoredDiv color={ColorPalette.gray5}>{body}</ColoredDiv>
        </td>
      </tr>
    </tbody>
  </table>
);

export function BrowserNotification(config: IBrowserNotificationConfig) {
  const {title = 'Notification', body, icon, onClick} = config; // TODO change default icon

  if (!document.hasFocus()) {
    if (!('Notification' in window)) {
      Notify(NotifyType.Info, NotificationFrame(title, body, onClick), {
        autoClose: 10000
      });
    } else {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon
        });

        if (onClick) {
          notification.onclick = onClick;
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(permission => {
          const notification = new Notification(title, {
            body,
            icon
          });

          if (onClick) {
            notification.onclick = onClick;
          }
        });
      }
    }
  } else {
    Notify(NotifyType.Info, NotificationFrame(title, body, onClick), {
      autoClose: 20000
    });
  }

  debouncedFetchUserNotifications();
}

const debouncedFetchUserNotifications = debounce(() => {
  store.dispatch(updateCurrentUserNotifications() as any);
}, 1000);

export function ConnectToUserPrivateChannel(userId: number | string, historyContext: History) {
  const types = [];

  for (const key in UserChannelNotificationTypes) {
    if (UserChannelNotificationTypes[key]) {
      types.push(UserChannelNotificationTypes[key]);
    }
  }

  const echo = getEcho().private(`user-${userId}`);

  types.forEach((type: string) => {
    echo.listen(`.${type}`, (e: IWebSocketNotification) => {
      if (type === UserChannelNotificationTypes.JOB_CREATED && historyContext.location.pathname === '/jobs/inbox') {
        EventBus.emit(UserChannelNotificationTypes.JOB_CREATED);
      }

      invokeBrowserNotification(e, historyContext);
    });
  });
}

function invokeBrowserNotification(e: IWebSocketNotification, historyContext: History) {
  const parsedNotification = NotificationTransformer.hydrate(e.notification as IUserNotification);

  if (!!parsedNotification.body) {
    const {text, sender} = parsedNotification.body;

    BrowserNotification({
      body: text,
      icon: sender && sender.avatar && sender.avatar.url,
      onClick: onNotificationClickSwitcher(parsedNotification, historyContext, true)
    });
  }
}

export function onNotificationClickSwitcher(
  n: IUserNotification<INotificationBody>,
  historyContext: History,
  isFromWebsocket?: boolean
): () => void {
  const historyPusher = (path: string) => async () => {
    historyContext.push(path);

    if (isFromWebsocket) {
      await UserService.removeNotification(n.id);
      store.dispatch(updateCurrentUserNotifications() as any);
    }
  };
  const jobDetailsNotificationTypes = [
    UserChannelNotificationTypes.JOB_CREATED,
    UserChannelNotificationTypes.JOB_USER_ASSIGNED,
    UserChannelNotificationTypes.JOB_UPDATED,
    UserChannelNotificationTypes.JOB_TEAM_ASSIGNED
  ];
  const jobNotesOrRepliesNotificationTypes = [
    UserChannelNotificationTypes.JOB_MESSAGE_ATTACHED,
    UserChannelNotificationTypes.JOB_NOTE_ATTACHED
  ];
  const invoiceDetailsNotificationTypes = [
    UserChannelNotificationTypes.INVOICE_NOTE_ATTACHED,
    UserChannelNotificationTypes.INVOICE_APPROVE_REQUEST
  ];
  const poDetailsNotificationTypes = [
    UserChannelNotificationTypes.PURCHASE_ORDER_NOTE_ATTACHED,
    UserChannelNotificationTypes.PURCHASE_ORDER_APPROVE_REQUEST
  ];
  const cnDetailsNotificationTypes = [
    UserChannelNotificationTypes.CREDIT_NOTE_NOTE_ATTACHED,
    UserChannelNotificationTypes.CREDIT_NOTE_APPROVE_REQUEST
  ];
  const contextType = n.body.context && n.body.context.type;
  const contextId = n.body.context && n.body.context.id;
  const targetId = n.body.target && n.body.target.id;
  const linkToJobDetails = `/job/${targetId}/details`;
  const linkToJobNotesOrReplies = `/job/${targetId}/notes-and-replies?${contextType}=${contextId}`;
  const linkToContact = `/contacts/category/edit/${targetId}?${contextType}=${contextId}`;
  const linkToInvoiceDetails = `/finance/invoices/details/${targetId}?${contextType}=${contextId}`;
  const linkToPODetails = `/finance/purchase-orders/details/${targetId}?${contextType}=${contextId}`;
  const linkToCNDetails = `/finance/credit-notes/details/${targetId}?${contextType}=${contextId}`;

  if (jobDetailsNotificationTypes.includes(n.type)) {
    return historyPusher(linkToJobDetails);
  }

  if (jobNotesOrRepliesNotificationTypes.includes(n.type)) {
    return historyPusher(linkToJobNotesOrReplies);
  }

  if (UserChannelNotificationTypes.CONTACT_NOTE_ATTACHED === n.type) {
    return historyPusher(linkToContact);
  }

  if (invoiceDetailsNotificationTypes.includes(n.type)) {
    return historyPusher(linkToInvoiceDetails);
  }

  if (poDetailsNotificationTypes.includes(n.type)) {
    return historyPusher(linkToPODetails);
  }

  if (cnDetailsNotificationTypes.includes(n.type)) {
    return historyPusher(linkToCNDetails);
  }

  if ([UserChannelNotificationTypes.USER_MENTIONED].includes(n.type)) {
    switch (n.body.target.type) {
      case NotificationTargetTypes.Job:
        return historyPusher(linkToJobNotesOrReplies);
      case NotificationTargetTypes.Contact:
        return historyPusher(linkToContact);
      case NotificationTargetTypes.Invoice:
        return historyPusher(linkToInvoiceDetails);
      case NotificationTargetTypes.PurchaseOrder:
        return historyPusher(linkToPODetails);
      case NotificationTargetTypes.CreditNote:
        return historyPusher(linkToCNDetails);
    }
  }

  return () => null;
}
