import * as React from 'react';
import {shallow} from 'enzyme';
import {InternalApp as App} from '../App';
import {Redirect} from 'react-router';
import AppLayout from 'src/components/AppLayout/AppLayout';
import SessionStorageService from 'src/services/SessionStorageService';
import {initEcho} from 'src/utility/Echo';

jest.mock('src/services/StorageService', () => ({
  setUpStorage: () => ({then: (fn: any) => fn()})
}));

describe('App', () => {
  let props: any;

  beforeEach(() => {
    props = {
      dispatch: () => Promise.resolve(),
      user: null
    };
    jest.resetAllMocks();
    jest.spyOn(SessionStorageService, 'getItem').mockImplementation(() => 'access token');
  });

  it('render loading while requesting current user', () => {
    const component = shallow(<App {...props} />);
    expect(component.text()).toEqual('Loading...');
  });

  it('render redirect to login if user is undefined', () => {
    const component = shallow(<App {...props} />);
    component.setState({isLoading: false});
    expect(
      component
        .update()
        .find(Redirect)
        .props().to
    ).toEqual('/login');
    expect(component.update().find({component: AppLayout}).length).toEqual(0);
  });

  it('render app layout if user is defined', () => {
    props.user = {name: 'User'};
    const component = shallow(<App {...props} />);
    component.setState({isLoading: false});
    expect(component.update().find({component: AppLayout}).length).toEqual(1);
  });

  it('should initEcho if access_token available', () => {
    shallow(<App {...props} />);
    expect(initEcho).toHaveBeenCalled();
  });

  it('should NOT initEcho if access_token unavailable', () => {
    jest.spyOn(SessionStorageService, 'getItem').mockImplementation(() => null);
    shallow(<App {...props} />);
    expect(initEcho).not.toHaveBeenCalled();
  });
});
