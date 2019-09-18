import * as React from 'react';
import {IPerson} from 'src/models/IPerson';
import Permission from 'src/constants/Permission';
import UserContext from 'src/components/AppLayout/UserContext';
import ReferenceBarItem from 'src/components/ReferenceBar/ReferenceBarItem';
import {Link} from 'react-router-dom';
import ContactJobs from '../ContactJobs';
import ContactReceivables from '../ContactReceivables';
import ContactAccountManagement from '../ContactAccountManagement';

interface IProps {
  person: Partial<IPerson>;
  onLoadTags: () => Promise<any>;
  contactLoading: boolean;
  // TODO: add real data
  receivables?: any;
  referrals?: any[];
}

class PersonRightInfoBlock extends React.PureComponent<IProps> {
  public render() {
    const {person, receivables, referrals, onLoadTags} = this.props;

    return (
      <UserContext.Consumer>
        {context => (
          <>
            {person.id && context.has(Permission.CONTACTS_UPDATE) && (
              <ContactAccountManagement
                managedAccounts={person.managed_accounts}
                contactId={person.id}
                onUpdate={onLoadTags}
                contactLoading={this.props.contactLoading}
              />
            )}
            {person.parent_company && (
              <ReferenceBarItem caption="Company">
                <p>{person.parent_company.legal_name}</p>
                <Link to={`/contacts/${person.parent_company.contact_category.id}/edit/${person.parent_company.id}`}>
                  View company
                </Link>
              </ReferenceBarItem>
            )}
            {person.id && (
              <>
                {context.has(Permission.JOBS_VIEW) && referrals && referrals.length > 0 && (
                  <ContactJobs referrals={referrals} />
                )}
                {receivables && Object.keys(receivables).length !== 0 && (
                  <ContactReceivables
                    receivables={receivables.rows}
                    total={receivables.total}
                    caption="Aged Receivables (Company)"
                  />
                )}
              </>
            )}
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default PersonRightInfoBlock;
