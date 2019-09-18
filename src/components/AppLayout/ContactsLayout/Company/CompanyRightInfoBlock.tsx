import * as React from 'react';
import Permission from 'src/constants/Permission';
import UserContext from 'src/components/AppLayout/UserContext';
import ContactJobs from '../ContactJobs';
import ContactReceivables from '../ContactReceivables';
import {ICompany} from 'src/models/ICompany';
import PeopleAtCompany from '../PeopleAtCompany';
import {IPerson} from 'src/models/IPerson';
import ContactAccountManagement from '../ContactAccountManagement';

interface IProps {
  company: Partial<ICompany>;
  onLoadTags: () => Promise<any>;
  contactLoading: boolean;
  // TODO: add real data
  receivables?: any;
  referrals?: any[];
}

class CompanyRightInfoBlock extends React.PureComponent<IProps> {
  private getPeopleAtCompany = (): IPerson[] => {
    return (this.props.company.subsidiaries || []).filter(el => {
      return !!el.first_name;
    });
  };

  public render() {
    const {company, receivables, referrals, onLoadTags} = this.props;

    return (
      <UserContext.Consumer>
        {context =>
          company.id &&
          company.legal_name && (
            <>
              {context.has(Permission.CONTACTS_UPDATE) && (
                <ContactAccountManagement
                  managedAccounts={company.managed_accounts}
                  contactId={company.id}
                  onUpdate={onLoadTags}
                  contactLoading={this.props.contactLoading}
                />
              )}
              {context.has(Permission.JOBS_VIEW) && referrals && referrals.length > 0 && (
                <ContactJobs referrals={referrals} />
              )}
              {receivables && Object.keys(receivables).length !== 0 && (
                <ContactReceivables
                  receivables={receivables.rows}
                  total={receivables.total}
                  caption="Aged Receivables"
                />
              )}
              <PeopleAtCompany companyName={company.legal_name} people={this.getPeopleAtCompany()} />
            </>
          )
        }
      </UserContext.Consumer>
    );
  }
}

export default CompanyRightInfoBlock;
