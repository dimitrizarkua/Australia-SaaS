import CrossWindowsChannel from './CrossWindowsChannel';

export enum Key {
  getSessionStorage = 'getSessionStorage',
  setSessionStorage = 'setSessionStorage'
}

/**
 * 1. Save current tab in the list of opened tabs.
 * 2. If there is more than one tab opened and sessionStorage is empty, try to sync sessionStorage.
 * 3. Remove tab from list of opened tabs on close.
 *
 * Logic above allows to support the following workflows:
 * - Logout user when they leave the website (close all tabs)
 * - Allow user to work in multiple tabs simultaneously
 * - Allow to keep user logged in on page refresh
 *
 * Make sure you test all workflows above, when make changes to underlying logic.
 */
export const setUpStorage = () => {
  CrossWindowsChannel.addMessageHandler({
    type: Key.getSessionStorage,
    handler: () => {
      if (!sessionStorage.length) {
        return;
      }
      CrossWindowsChannel.messageBroadcast({type: Key.setSessionStorage, ...sessionStorage});
    }
  });
  //
  return new Promise(resolve => {
    // Dirty hack for init session storage for new browser tab
    if (sessionStorage.length > 0) {
      // If tab isn't new, continue
      resolve();
    } else {
      // Tab is new, ask other tabs for sending a sessionStorage state to us
      CrossWindowsChannel.messageBroadcast({type: Key.getSessionStorage});
      // Fallback, we expect to get a sessionStorage state for 1second, otherwise we continue without sessionStorage initialise
      setTimeout(resolve, 1000);
    }

    // Add handler for getting existing sessionStorage state from old browser tab
    CrossWindowsChannel.addMessageHandler({
      type: Key.setSessionStorage,
      handler: data => {
        if (sessionStorage.length) {
          return;
        }
        Object.keys(data).forEach(key => {
          window.sessionStorage.setItem(key, data[key]);
        });
        // Getting state and go next app's initial step
        resolve();
      }
    });
  });
};
