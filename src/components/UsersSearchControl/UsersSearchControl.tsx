import {debounce} from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import SearchInput from '../SearchInput/SearchInput';
import User from './User';
import {IMentionsUser} from 'src/models/IUser';
import ColorPalette from 'src/constants/ColorPalette';

export interface IProps {
  onSelectMentionsUser: (user: IMentionsUser) => Promise<any>;
  onChangeSearch: (name: string) => any;
  onClearSearch: () => void;
  mentionsUsers?: IMentionsUser[];
  loading?: boolean;
}

const UsersMenu = styled.div`
  width: 265px;
`;

const SearchArea = styled.div`
  padding-bottom: 10px;
`;

const NoFound = styled.span`
  color: ${ColorPalette.gray3};
`;

class UsersSearchControl extends React.PureComponent<IProps> {
  private handleSearch = (searchStr: string) => {
    if (searchStr && searchStr.length > 1) {
      this.props.onChangeSearch(searchStr);
    }
  };

  private debouncedSearch = debounce(this.handleSearch, 500);

  public render() {
    const {loading, mentionsUsers, onSelectMentionsUser} = this.props;
    return (
      <UsersMenu>
        <SearchArea className="px-2">
          <SearchInput
            loading={loading || false}
            onSearchValueChange={this.debouncedSearch}
            placeholder={'Search...'}
            focusOnMount={true}
          />
        </SearchArea>
        {!(mentionsUsers && mentionsUsers.length > 0) && <NoFound className="px-2">No users found</NoFound>}
        {mentionsUsers &&
          mentionsUsers.map(u => (
            <User
              key={u.id}
              firstName={u.first_name}
              lastName={u.last_name}
              locations={u.locations && u.locations.join(' ')}
              onClick={() => onSelectMentionsUser(u)}
            />
          ))}
      </UsersMenu>
    );
  }
}

export default UsersSearchControl;
