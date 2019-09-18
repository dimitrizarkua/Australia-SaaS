import * as React from 'react';
import {shallow} from 'enzyme';
import faker from 'faker';
import UsersSearchControl, {IProps} from '../UsersSearchControl';
import SearchInput from 'src/components/SearchInput/SearchInput';
import User from '../User';
import {IMentionsUser} from 'src/models/IUser';
import {getFakeMentionUser} from 'src/services/helpers/TestHelpers';

describe('UsersSearchControl', () => {
  let props: IProps;

  const getMentionUsers = (): IMentionsUser[] => {
    const users = [];
    const count = faker.random.number({min: 1, max: 6});
    for (let i = 0; i < count; i++) {
      users.push(getFakeMentionUser());
    }
    return users;
  };

  const selectMentionUser = jest.fn();

  beforeEach(() => {
    props = {
      loading: false,
      onChangeSearch: jest.fn(),
      onSelectMentionsUser: selectMentionUser,
      onClearSearch: jest.fn(),
      mentionsUsers: []
    };
  });

  it('should render search area', () => {
    const component = shallow(<UsersSearchControl {...props} />);
    expect(component.find(SearchInput).length).toBe(1);
  });

  it('should render mention users', () => {
    props = {
      ...props,
      mentionsUsers: getMentionUsers()
    };
    const component = shallow(<UsersSearchControl {...props} />);
    expect(component.find(User).length).toEqual(props.mentionsUsers!.length);
  });

  it('should call onSelectMentionsUser', () => {
    props = {
      ...props,
      mentionsUsers: getMentionUsers()
    };
    const component = shallow(<UsersSearchControl {...props} />);
    component
      .find(User)
      .first()
      .simulate('click');
    expect(selectMentionUser).toBeCalled();
  });
});
