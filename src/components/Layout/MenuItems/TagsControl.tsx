import * as React from 'react';
import styled from 'styled-components';
import Icon, {IconName} from 'src/components/Icon/Icon';
import Dropdown, {IMenuProps, ITriggerProps} from 'src/components/Dropdown/Dropdown';
import withData, {IResource} from 'src/components/withData/withData';
import TagService, {ITagsSuccess} from 'src/services/TagService';
import {ITag, TagTypes} from 'src/models/ITag';
import {ActionIcon} from '../PageMenu';
import SearchInput from 'src/components/SearchInput/SearchInput';
import TagsArea from 'src/components/Tag/TagsArea';
import {debounce} from 'lodash';

const TagsMenu = styled.div`
  width: 265px;
`;

interface IWithDataProps {
  tags: IResource<ITagsSuccess>;
}

interface IProps {
  disabled?: boolean;
  type: TagTypes | string;
  filter?: ITag[];
  onTagClick: (tag: ITag) => any;
}

interface IState {
  search: string;
}

const TagsBox = styled.div`
  margin-top: 10px;
`;

class TagsControl extends React.PureComponent<IProps & IWithDataProps, IState> {
  public state = {
    search: ''
  };

  private handleSearch = (searchStr: string) => {
    this.setState({search: searchStr}, () => this.props.tags.fetch({type: this.props.type, name: this.state.search}));
  };

  private debouncedSearch = debounce(this.handleSearch, 1000);

  private toggleMenu = (triggerProps: ITriggerProps) => () => {
    if (this.props.disabled) {
      return null;
    }
    // Fetch tags on first Menu open
    if (!triggerProps.isExpanded && !this.props.tags.ready && !this.props.tags.loading) {
      this.props.tags.fetch({type: this.props.type});
    }
    return triggerProps.toggle();
  };

  private renderIconTrigger = (name: IconName) => {
    const {disabled} = this.props;
    return (triggerProps: ITriggerProps) => (
      <ActionIcon
        data-tip="Tags"
        data-for={`${this.props.type}-menu-tooltip`}
        onClick={this.toggleMenu(triggerProps)}
        disabled={disabled}
      >
        <Icon name={name} />
      </ActionIcon>
    );
  };

  private renderTagsMenu = (menuProps: IMenuProps) => {
    const {
      tags: {data},
      onTagClick,
      filter
    } = this.props;
    const filteredTags = data ? data.data.filter(tag => !filter || !filter.find(t => t.id === tag.id)) : [];

    return (
      <TagsMenu className="px-2">
        <SearchInput
          loading={this.props.tags.loading}
          placeholder={'Search...'}
          onSearchValueChange={this.debouncedSearch}
        />
        {!!filteredTags.length && (
          <TagsBox>
            <TagsArea tags={filteredTags} onClick={onTagClick} disableAlert={true} />
          </TagsBox>
        )}
      </TagsMenu>
    );
  };

  public render() {
    return (
      <Dropdown
        trigger={this.renderIconTrigger(IconName.Tags)}
        menu={this.renderTagsMenu}
        onOutside={() => this.handleSearch('')}
      />
    );
  }
}

export default withData<IProps>({
  tags: {
    fetch: TagService.searchTags
  }
})(TagsControl);
