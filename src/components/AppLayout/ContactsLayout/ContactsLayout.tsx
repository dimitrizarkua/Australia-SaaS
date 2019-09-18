import * as React from 'react';
import {matchPath, Redirect, Route, RouteComponentProps, RouteProps, Switch, withRouter} from 'react-router-dom';
import SidebarMenu from 'src/components/SidebarMenu/SidebarMenu';
import ContactService, {IContactCategoriesSuccess} from 'src/services/ContactService';
import {compose} from 'redux';
import withData, {IResource} from 'src/components/withData/withData';
import ContactsCategoryLayout from './ContactsCategoryLayout';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';

interface IWithDataProps {
  categories: IResource<IContactCategoriesSuccess>;
}

enum CategorySequence {
  'customer',
  'supplier',
  'insurer',
  'broker',
  'loss_adjustor',
  'company_location'
}

const sideBarHints: {[key: number]: string} = {
  [CategorySequence.customer]: 'Customers',
  [CategorySequence.supplier]: 'Suppliers',
  [CategorySequence.insurer]: 'Insurers',
  [CategorySequence.broker]: 'Broker',
  [CategorySequence.loss_adjustor]: 'Loss adjustor',
  [CategorySequence.company_location]: 'Company location'
};

class ContactsLayout extends React.PureComponent<RouteComponentProps<{}> & IWithDataProps> {
  public componentDidMount() {
    this.props.categories.fetch();
  }

  private getContactsMenuItems() {
    if (!this.props.categories.data) {
      return [];
    }
    return this.props.categories.data.data
      .sort((a, b) => (CategorySequence[a.type] < CategorySequence[b.type] ? -1 : 1))
      .map(category => {
        const path = `/contacts/${category.id}`;
        const icon = ContactService.getCategoryIcon(category.type);
        const isActive = !!matchPath(this.props.location.pathname, {path});
        const hint = sideBarHints[CategorySequence[category.type]];
        return {path, icon, isActive, hint};
      });
  }

  public render() {
    const {match, categories} = this.props;
    return (
      <div className="d-flex h-100 flex-row align-items-stretch">
        <SidebarMenu items={this.getContactsMenuItems()}>
          {categories.loading && <BlockLoading size={40} color={ColorPalette.gray1} />}
        </SidebarMenu>
        <Switch>
          <Route path={`${match.url}/:category`} component={ContactsCategoryLayout} />
          {categories.data && categories.data!.data.length > 0 && (
            <Redirect to={`${match.url}/${categories.data!.data[0].id}`} />
          )}
        </Switch>
      </div>
    );
  }
}

export default compose<React.ComponentClass<RouteProps>>(
  withRouter,
  withData({
    categories: {
      fetch: ContactService.getCategories
    }
  })
)(ContactsLayout);
