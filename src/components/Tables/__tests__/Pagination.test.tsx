import * as React from 'react';
import {shallow} from 'enzyme';
import Pagination from '../Pagination';

describe('Pagination', () => {
  let props: any;
  beforeEach(() => {
    props = {
      pagination: {current_page: 1, last_page: 5, per_page: 15},
      onChange: jest.fn()
    };
  });

  it('should disable previous button, if first page', () => {
    const component = shallow(<Pagination {...props} />);
    const items = component.find('.page-item');
    expect(items.at(0).hasClass('disabled')).toEqual(true);
  });

  it('should disable next button, if last page', () => {
    props.pagination.current_page = props.pagination.last_page;
    const component = shallow(<Pagination {...props} />);
    const items = component.find('.page-item');
    expect(items.at(items.length - 1).hasClass('disabled')).toEqual(true);
  });

  it('should render buttons for all pages', () => {
    const component = shallow(<Pagination {...props} />);
    const items = component.find('.page-item');
    expect(items.length).toEqual(props.pagination.last_page + 2); // +2 for next ans previous buttons
  });
});
