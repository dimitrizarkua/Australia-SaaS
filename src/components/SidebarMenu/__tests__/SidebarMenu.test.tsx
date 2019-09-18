import * as React from 'react';
import {shallow} from 'enzyme';
import SidebarMenu, {IProps, NavLink} from '../SidebarMenu';
import {IconName} from 'src/components/Icon/Icon';

describe('SidebarMenu', () => {
  let props: IProps;

  beforeEach(() => {
    props = {
      items: [
        {
          path: '/path',
          icon: IconName.People,
          isActive: true
        }
      ]
    };
  });

  it('render menu items', () => {
    const component = shallow(<SidebarMenu {...props} />);
    expect(component.find(NavLink).length).toEqual(props.items.length);
  });
});
