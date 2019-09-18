import {Key} from 'src/services/SessionStorageService';
import {initEcho} from 'src/utility/Echo';
import moment, {Moment} from 'moment';

const getAccessToken = (expirationDate: Moment) => {
  const payload = {exp: expirationDate.unix()};
  return `header.${btoa(JSON.stringify(payload))}.secret`;
};

const setUpStorage = (accessToken: any, refreshToken: any) => {
  const SessionStorageService = require('src/services/SessionStorageService').default;
  jest.spyOn(SessionStorageService, 'getItem').mockImplementation((key: Key) => {
    return key === Key.access_token ? accessToken : refreshToken;
  });
};

const DEFAULT_EXP = 1500;

describe('AuthService', () => {
  describe('echo initialization', () => {
    beforeEach(() => {
      jest.spyOn(window, 'fetch').mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              [Key.access_token]: 'access_token',
              [Key.refresh_token]: 'refresh_token'
            })
        });
      });
    });

    it('should initEcho on login', done => {
      const AuthService = require('src/services/AuthService').default;
      AuthService.login('username', 'password').then(() => {
        expect(initEcho).toHaveBeenCalled();
        done();
      });
    });

    it('should initEcho on loginWithOffice365', done => {
      const AuthService = require('src/services/AuthService').default;
      AuthService.loginWithOffice365('token').then(() => {
        expect(initEcho).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('setUpTokenRefresher', () => {
    const refreshToken = 'test';
    const accessToken = getAccessToken(moment().add(DEFAULT_EXP, 'seconds'));
    let refreshMock: any;

    beforeEach(() => {
      jest.resetModules();
      jest.useFakeTimers();
      refreshMock = (global as any).fetch = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
    });

    it('should do nothing if no accessToken', () => {
      setUpStorage(null, refreshToken);
      // tslint:disable-next-line
      require('src/services/AuthService').default;
      jest.runOnlyPendingTimers();
      expect(refreshMock).not.toHaveBeenCalled();
    });

    it('should do nothing if no refreshToken', () => {
      setUpStorage(accessToken, null);
      // tslint:disable-next-line
      require('src/services/AuthService').default;
      jest.runOnlyPendingTimers();
      expect(refreshMock).not.toHaveBeenCalled();
    });

    it('should do nothing if malformed accessToken', () => {
      setUpStorage('invalid', refreshToken);
      // tslint:disable-next-line
      require('src/services/AuthService').default;
      jest.runOnlyPendingTimers();
      expect(refreshMock).not.toHaveBeenCalled();
    });

    it('should refresh token if less than 2 minutes left before accessToken expiration', () => {
      setUpStorage(getAccessToken(moment().add(120, 'seconds')), refreshToken);
      // tslint:disable-next-line
      require('src/services/AuthService').default;
      expect(refreshMock).toHaveBeenCalled();
    });

    it('should schedule token refresh if more than 2 minutes left before accessToken expiration', () => {
      setUpStorage(accessToken, refreshToken);
      // tslint:disable-next-line
      require('src/services/AuthService').default;
      expect(refreshMock).not.toHaveBeenCalled();
    });
  });
});
