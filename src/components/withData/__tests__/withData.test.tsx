import * as React from 'react';
import {shallow} from 'enzyme';
import withData from '../withData';

class TestComponent extends React.Component {
  public render() {
    return <div />;
  }
}

const config = {
  contacts: {
    fetch: (shouldReject?: boolean) => (shouldReject ? Promise.reject('err') : Promise.resolve([1])),
    initialData: []
  }
};

const ComponentWithData = withData(config)(TestComponent);

describe('withData', () => {
  it('should set proper default values', () => {
    const component = shallow(<ComponentWithData />);
    const contactsProps = component.props().contacts;
    expect(contactsProps.ready).toEqual(false);
    expect(contactsProps.loading).toEqual(false);
    expect(contactsProps.error).toEqual(null);
    expect(contactsProps.data).toEqual([]);
    expect(contactsProps.initialData).toEqual([]);
  });

  describe('fetch', () => {
    it('should loading to true during loading', done => {
      const component = shallow(<ComponentWithData />);
      const contactsProps = component.props().contacts;
      expect(contactsProps.loading).toEqual(false);

      const promise = contactsProps.fetch();

      expect(component.props().contacts.loading).toEqual(true);

      promise.then(() => {
        expect(component.props().contacts.loading).toEqual(false);
        done();
      });
    });

    it('should ready to true on success', done => {
      const component = shallow(<ComponentWithData />);
      component
        .props()
        .contacts.fetch()
        .then(() => {
          expect(component.props().contacts.ready).toEqual(true);
          done();
        });
    });

    it('should ready to true on error', done => {
      const component = shallow(<ComponentWithData />);
      component
        .props()
        .contacts.fetch(true)
        .then(() => {
          expect(component.props().contacts.ready).toEqual(true);
          expect(component.props().contacts.error).toEqual('err');
          done();
        });
    });

    it('should set data on success', done => {
      const component = shallow(<ComponentWithData />);
      component
        .props()
        .contacts.fetch()
        .then(() => {
          expect(component.props().contacts.data).toEqual([1]);
          done();
        });
    });
  });

  describe('reset', () => {
    it('should set data to initialData', done => {
      const component = shallow(<ComponentWithData />);
      component
        .props()
        .contacts.fetch()
        .then(() => {
          component.props().contacts.reset();
          const contactsProps = component.props().contacts;
          expect(contactsProps.data).toEqual(config.contacts.initialData);
          expect(contactsProps.ready).toEqual(false);
          done();
        });
    });
  });

  describe('init', () => {
    it('should set data to passed data', done => {
      const component = shallow(<ComponentWithData />);
      component
        .props()
        .contacts.fetch()
        .then(() => {
          component.props().contacts.init([2]);
          const contactsProps = component.props().contacts;
          expect(contactsProps.data).toEqual([2]);
          expect(contactsProps.ready).toEqual(true);
          done();
        });
    });
  });
});
