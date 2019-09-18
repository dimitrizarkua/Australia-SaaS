const BROADCAST_TYPE = 'message';

interface IMessageHandler {
  type: string;
  handler: (messageData: any) => any;
}

const messageHandlerList: IMessageHandler[] = [];

function addMessageHandler(handler: IMessageHandler) {
  messageHandlerList.push(handler);
}

function removeMessageHandler(type: string) {
  const removingHandlerIndex = messageHandlerList.findIndex(handler => handler.type === type);

  if (removingHandlerIndex >= 0) {
    messageHandlerList.splice(removingHandlerIndex, 1);
  }
}

function receiveMessage(event: any) {
  if (event.key !== BROADCAST_TYPE) {
    return;
  }

  const message = JSON.parse(event.newValue);
  if (!message) {
    return;
  }

  const {type, ...data} = message;

  messageHandlerList.forEach(handle => {
    if (handle.type === type) {
      handle.handler(data);
    }
  });
}

function messageBroadcast(message: {}) {
  localStorage.setItem(BROADCAST_TYPE, JSON.stringify(message));
  localStorage.removeItem(BROADCAST_TYPE);
}

window.addEventListener('storage', receiveMessage);

export default {messageBroadcast, addMessageHandler, removeMessageHandler};
