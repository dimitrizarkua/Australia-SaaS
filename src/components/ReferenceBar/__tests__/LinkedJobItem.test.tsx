import * as React from 'react';
import {shallow} from 'enzyme';
import {InternalLinkedJobItem as LinkedJobItem} from '../LinkedJobItem';

describe('LinkedJobItem', () => {
  let props: any;

  beforeEach(() => {
    props = {
      jobId: 1,
      linkedJob: {id: 2, latest_status: {status: 'New'}},
      disabled: false
    };
  });

  it('should render "remove" link if not disabled', () => {
    const component = shallow(<LinkedJobItem {...props} />);
    expect(component.find({children: 'remove'}).length).toEqual(1);
  });

  it('should NOT render "remove" link if disabled', () => {
    props.disabled = true;
    const component = shallow(<LinkedJobItem {...props} />);
    expect(component.find({children: 'remove'}).length).toEqual(0);
  });
});
