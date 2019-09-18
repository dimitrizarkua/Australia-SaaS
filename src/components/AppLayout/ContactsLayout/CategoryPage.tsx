import * as React from 'react';
import {Link, RouteComponentProps, RouteProps, withRouter} from 'react-router-dom';
import styled from 'styled-components';
import Icon from 'src/components/Icon/Icon';
import PageContent from 'src/components/Layout/PageContent';
import withData, {IResource} from 'src/components/withData/withData';
import ContactService, {IContactCategorySuccess} from 'src/services/ContactService';
import {compose} from 'redux';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import withoutProps from 'src/components/withoutProps/withoutProps';
import {connect} from 'react-redux';
import {ContactStatuses} from 'src/models/IContactStatus';

const PageHeader = styled.h2`
  margin: 5px 0 30px 0;
`;

const QuickFilters = styled.ul`
  list-style: none;
  padding: 0;
`;

const FilterItem = styled(withoutProps(['isActive'])('li'))<{isActive: boolean}>`
  font-weight: ${props => (props.isActive ? Typography.weight.bold : Typography.weight.normal)};
`;

interface IFilter {
  query: string;
  name: string;
}

interface IParams {
  category: string;
}

interface IWithDataProps {
  category: IResource<IContactCategorySuccess>;
}

type IProps = RouteComponentProps<IParams> & IWithDataProps;

class CategoryPage extends React.PureComponent<IProps> {
  private get filters(): IFilter[] {
    return [
      {query: '?active_in_days=30', name: 'Active in last 30 days'},
      {query: '?active_in_days=60', name: 'Active in last 60 days'},
      {query: '?active_in_days=90', name: 'Active in last 90 days'},
      {query: `?contact_status=${ContactStatuses.INACTIVE}`, name: 'Archived'}
    ];
  }

  public componentDidMount() {
    this.fetchCategory();
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.match.params.category !== prevProps.match.params.category) {
      this.fetchCategory();
    }
  }

  private fetchCategory() {
    this.props.category.fetch(this.props.match.params.category);
  }

  private isActive(f: IFilter) {
    return this.props.location.search === f.query;
  }

  public render() {
    const {match, category} = this.props;
    if (!category.ready || category.loading) {
      return (
        <div className="d-flex h-100" style={{position: 'relative'}}>
          <BlockLoading size={40} color={ColorPalette.white} />
        </div>
      );
    }

    return (
      <UserContext.Consumer>
        {context => (
          <PageContent className="d-flex flex-row">
            <div className="pr-3">
              <Icon name={ContactService.getCategoryIcon(category.data!.data.type)} size={40} />
            </div>
            <div className="flex-grow-1">
              <PageHeader>{category.data!.data.name}</PageHeader>
              <QuickFilters>
                {context.has(Permission.CONTACTS_CREATE) && (
                  <>
                    <li>
                      <Link to={`${match.url}/create/person`}>Add New Person</Link>
                    </li>
                    <li>
                      <Link to={`${match.url}/create/company`}>Add New Company</Link>
                    </li>
                  </>
                )}
                <li>&nbsp;</li>
                {this.filters.map(f => (
                  <FilterItem isActive={this.isActive(f)} key={f.query}>
                    <Link to={this.isActive(f) ? match.url : `${match.url}${f.query}`}>{f.name}</Link>
                  </FilterItem>
                ))}
              </QuickFilters>
            </div>
          </PageContent>
        )}
      </UserContext.Consumer>
    );
  }
}

export default compose<React.ComponentClass<RouteProps>>(
  withRouter,
  withData({
    category: {
      fetch: ContactService.findCategoryById
    }
  }),
  connect()
)(CategoryPage);
