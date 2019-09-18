import * as React from 'react';
import {Redirect, Route, RouteComponentProps, RouteProps, Switch, withRouter} from 'react-router-dom';
import ContactService, {IContactCategorySuccess} from 'src/services/ContactService';
import {compose} from 'redux';
import withData, {IResource} from 'src/components/withData/withData';
import ContactsSearch from './ContactsSearch/ContactsSearch';
import ScrollableContainer from 'src/components/Layout/ScrollableContainer';
import CategoryPage from './CategoryPage';
import ContactDetailsPage from './ContactDetailsPage';
import Permission from 'src/constants/Permission';
import AppRoute from 'src/components/AppRoute';

interface IParams {
  category: string;
}

interface IWithDataProps {
  category: IResource<IContactCategorySuccess>;
}

class ContactsLayout extends React.PureComponent<RouteComponentProps<IParams> & IWithDataProps> {
  public render() {
    const {match} = this.props;
    return (
      <>
        <ContactsSearch category={match.params.category} />
        <div className="flex-grow-1">
          <ScrollableContainer className="h-100">
            <Switch>
              <Route exact={true} path={match.path} component={CategoryPage} />
              <AppRoute
                exact={true}
                path={`${match.path}/create/:type`}
                component={ContactDetailsPage}
                permission={Permission.CONTACTS_CREATE}
              />
              <Route exact={true} path={`${match.path}/edit/:id`} component={ContactDetailsPage} />
              <Redirect to={match.url} />
            </Switch>
          </ScrollableContainer>
        </div>
      </>
    );
  }
}

export default compose<React.ComponentClass<RouteProps>>(
  withRouter,
  withData({
    category: {
      fetch: ContactService.findCategoryById
    }
  })
)(ContactsLayout);
