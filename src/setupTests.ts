import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

jest.mock('src/utility/Echo', () => ({
  getEcho: () => {
    class EchoMock {
      public static leave = () => new EchoMock();
      public static join = () => new EchoMock();
      public static private = () => new EchoMock();
      public here() {
        return this;
      }
      public joining() {
        return this;
      }
      public leaving() {
        return this;
      }
      public listen() {
        return this;
      }
      public private() {
        return this;
      }
    }
    return new EchoMock();
  },
  initEcho: jest.fn()
}));
