import * as React from 'react';
import {mount, render, shallow} from 'enzyme';
import {InternalContactsSearch as ContactsSearch, ScrollableList} from '../ContactsSearch';
import {ContactType} from 'src/models/IContact';
import {Link} from 'react-router-dom';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

describe('ContactsSearch', () => {
  let props: any;

  beforeEach(() => {
    props = {
      dispatch: jest.fn(),
      contacts: {
        loading: false,
        fetch: jest.fn(),
        ready: false,
        error: null
      },
      type: 'customer',
      renderLink: (id: string | number) => `/contacts/customers/${id}`,
      location: {pathname: '/contacts/2/edit/1'},
      match: {params: {category: 2, id: 1}}
    };
  });

  it('render loading if contacts are not ready', () => {
    const component = mount(<ContactsSearch {...props} />);
    expect(component.find(BlockLoading).length).toEqual(1);
  });

  it('render error if has error', () => {
    props.contacts.ready = true;
    props.contacts.error = {error_message: 'Something went wrong!'};
    const component = shallow(<ContactsSearch {...props} />);
    expect(shallow(component.find(ScrollableList).props().children as any).text()).toEqual(
      `Error! ${props.contacts.error.error_message}`
    );
  });

  it('render contacts if has any', () => {
    props.contacts.ready = true;
    props.contacts.data = {
      data: [{id: 1, first_name: 'John', last_name: 'Smith', contact_type: ContactType.person, contact_status: {}}]
    };
    const component = shallow(<ContactsSearch {...props} />);
    expect(render(component.find(Link).props().children as any).text()).toContain('John Smith');
  });
});
