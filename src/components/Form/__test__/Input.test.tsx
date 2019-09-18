import * as React from 'react';
import {shallow} from 'enzyme';
import Input from '../Input';

describe('Input', () => {
  let props: any;
  beforeEach(() => {
    props = {
      input: {value: ''},
      meta: {
        error: 'This field is required',
        touched: false
      }
    };
  });

  it('should NOT render error if field is not touched', () => {
    const component = shallow(<Input {...props} />);
    expect(component.find('.invalid-feedback').length).toEqual(0);
    expect(component.find('.is-invalid').length).toEqual(0);
  });

  it('should render error if field is touched and has error', () => {
    props.meta.touched = true;
    const component = shallow(<Input {...props} />);
    expect(component.find('.invalid-feedback').text()).toEqual('This field is required');
    expect(component.find('.is-invalid').length).toEqual(1);
  });
});
