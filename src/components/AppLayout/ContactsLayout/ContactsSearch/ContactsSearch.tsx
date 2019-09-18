import * as React from 'react';
import {Link, matchPath, RouteComponentProps, withRouter} from 'react-router-dom';
import styled from 'styled-components';
import {Action, compose} from 'redux';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {IContacts, loadList, reset} from 'src/redux/contactsDucks';
import {ThunkDispatch} from 'redux-thunk';
import * as qs from 'qs';
import {debounce} from 'lodash';
import SearchInput from 'src/components/SearchInput/SearchInput';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ContactService from 'src/services/ContactService';
import Pagination from 'src/components/Tables/Pagination';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import {ContactStatuses} from 'src/models/IContactStatus';
import EventBus, {EventBusEventName} from 'src/utility/EventBus';

const ContactsList = styled.div`
  width: 320px;
  background: ${ColorPalette.gray0};
  border-right: 1px solid ${ColorPalette.gray2};
  height: 100%;
  position: relative;
`;

export const ScrollableList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  position: relative;
`;

const SearchInputWrapper = styled.div`
  padding: 15px;
`;

const ListPlaceholder = styled.div`
  padding: 15px 15px;
`;

const List = styled.ul`
  margin-bottom: 0;
  padding: 0 0 15px 15px;
  list-style: none;
  flex-grow: 1;
  max-width: 100%;
`;

const ListItem = styled.li<{isActive: boolean; isArchived: boolean}>`
  word-wrap: break-word;
  font-weight: ${props => (props.isActive ? Typography.weight.bold : Typography.weight.normal)};
  border-bottom: 1px solid ${ColorPalette.gray2};

  :last-child {
    border-bottom: 0;
  }

  a {
    padding: 15px 0 15px 5px;
    display: block;
    color: ${props => (props.isArchived ? ColorPalette.gray3 : ColorPalette.black0)};

    :hover {
      background: ${ColorPalette.gray1};
      text-decoration: none;
    }
  }
`;

const Alphabet = styled.ul`
  padding: 0;
  list-style: none;
  text-align: center;
  position: sticky;
  top: 0;
  width: 20px;
  bottom: 0;
  overflow: hidden;
  margin-bottom: 0;
`;

const Letter = styled.li`
  color: ${ColorPalette.gray4};
  cursor: pointer;
  :hover {
    color: ${ColorPalette.black0};
  }
`;

const ArchiveIndicator = styled.div`
  border-radius: 5px;
  border: 1px solid ${ColorPalette.gray2};
  height: 24px;
  width: 24px;
  text-align: center;
  margin-right: 5px;
`;

const {ColoredDiv} = StyledComponents;

interface IProps {
  category: number | string;
}

interface IConnectProps {
  contacts: IContacts;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  search: string;
}

type ICompoundProps = RouteComponentProps<IProps> & IProps & IConnectProps;

class ContactsSearch extends React.PureComponent<ICompoundProps, IState> {
  public state = {
    search: ''
  };

  private alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  public componentDidMount() {
    this.fetchContacts();

    EventBus.listen(EventBusEventName.ContactChangedStatus, this.fetchContacts);
  }

  public componentWillUnmount() {
    EventBus.removeListener(EventBusEventName.ContactChangedStatus, this.fetchContacts);
  }

  public componentDidUpdate(prevProps: ICompoundProps) {
    const {category, location, dispatch} = this.props;

    if (
      category !== prevProps.category ||
      (location.search !== prevProps.location.search && location.search.search(/note|meeting/) === -1)
    ) {
      this.setState({search: ''});
      dispatch(reset());
      this.fetchContacts();
    }
  }

  private fetchContacts = (params = {}) => {
    const queryParams = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    const {category} = this.props;

    if (+category) {
      this.props.dispatch(
        loadList({per_page: 50, contact_category_id: this.props.category, ...params, ...queryParams})
      );
    }
  };

  private debouncedFetch = debounce(this.fetchContacts, 300);

  private handleSearch = (searchStr: string) => {
    this.setState({search: searchStr});
    this.debouncedFetch({term: searchStr});
  };

  private isActive = (id: number): boolean => {
    const path = '/contacts/:category/edit/:id';
    const match: any = matchPath(this.props.location.pathname, {path});
    return match && parseInt(match.params.id, 0) === id;
  };

  private scrollTo = (letter: string) => {
    return () => {
      const element = document.querySelector(`[data-letter="${letter}"]`);
      if (element && element.scrollIntoView) {
        element.scrollIntoView(true);
      }
    };
  };

  private onPaginateClick = (page: number) => {
    this.fetchContacts({page});
  };

  public render() {
    const {ready, loading, error, data} = this.props.contacts;

    return (
      <ContactsList className="d-flex flex-column h-100 flex-shrink-0">
        {!ready && <BlockLoading size={40} color={ColorPalette.gray0} />}
        <SearchInputWrapper>
          <SearchInput
            loading={ready && loading}
            onSearchValueChange={this.handleSearch}
            placeholder={'Search list...'}
          />
        </SearchInputWrapper>
        <ScrollableList className="d-flex flex-row">
          {(() => {
            if (error) {
              return <ListPlaceholder>Error! {error.error_message}</ListPlaceholder>;
            } else if (data && data.data.length === 0) {
              return <ListPlaceholder>No results found</ListPlaceholder>;
            }
            return (
              <>
                <List>
                  {data &&
                    data.data.map(c => {
                      const isArchived = c.contact_status.status === ContactStatuses.INACTIVE;
                      const contactName = ContactService.getContactName(c);

                      return (
                        <ListItem key={c.id} isActive={this.isActive(c.id)} isArchived={isArchived}>
                          <Link
                            className="d-flex align-items-center justify-content-between"
                            to={`/contacts/${this.props.category}/edit/${c.id}`}
                            data-letter={contactName ? contactName[0].toLowerCase() : null}
                          >
                            <span>{contactName}</span>
                            {isArchived && (
                              <ArchiveIndicator className="d-flex align-items-center justify-content-center">
                                A
                              </ArchiveIndicator>
                            )}
                          </Link>
                        </ListItem>
                      );
                    })}
                </List>
                <Alphabet>
                  {this.alphabet.map(letter => (
                    <Letter key={letter} onClick={this.scrollTo(letter.toLowerCase())}>
                      {letter}
                    </Letter>
                  ))}
                </Alphabet>
              </>
            );
          })()}
        </ScrollableList>
        {data && data.pagination && data.pagination.last_page > 1 && (
          <ColoredDiv margin="15px 15px 0 15px" overflow="visible">
            <Pagination pagination={data.pagination} onChange={this.onPaginateClick} />
          </ColoredDiv>
        )}
      </ContactsList>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  contacts: state.contacts
});

export default compose<React.ComponentClass<IProps>>(
  withRouter,
  connect(mapStateToProps)
)(ContactsSearch);

export const InternalContactsSearch = ContactsSearch;
