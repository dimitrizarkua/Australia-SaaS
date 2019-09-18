import * as React from 'react';
import withData, {IResource} from 'src/components/withData/withData';
import {IFinanceEntity} from 'src/models/FinanceModels/ICommonFinance';
import {IContactAssignment} from 'src/models/IJob';
import JobService from 'src/services/JobService';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ReferenceBarJobDetails from 'src/components/ReferenceBar/ReferenceBarJobDetails';
import ReferenceBarContact from 'src/components/ReferenceBar/ReferenceBarContact';
import ReferenceBarFinancials from 'src/components/ReferenceBar/ReferenceBarFinancials';

interface IProps {
  entity: Partial<IFinanceEntity>;
  additionalItems?: React.ReactElement<any>;
  loading: boolean;
}

interface IWithDataProps {
  contacts: IResource<IContactAssignment[]>;
}

class FinanceReferenceItems extends React.PureComponent<IProps & IWithDataProps> {
  public componentDidMount() {
    this.fetchReferenceBarData();
  }

  public componentDidUpdate(prevProps: IProps) {
    if (this.props.entity.job && prevProps.entity.job && this.props.entity.job.id !== prevProps.entity.job.id) {
      this.fetchReferenceBarData();
    }
  }

  private usedContactIds!: number[];

  private fetchReferenceBarData() {
    const job = this.props.entity.job;
    if (job) {
      const jobId = job.id;
      this.props.contacts.fetch(jobId);
    }
  }

  private renderReferenceBarJob() {
    const job = this.props.entity.job;
    if (job) {
      return (
        <ReferenceBarJobDetails
          job={job}
          showJobLink={true}
          contacts={this.props.contacts.data || []}
          withoutActions={true}
        />
      );
    }
    return null;
  }

  private checkContactNotUsed(contact: any) {
    if (this.usedContactIds.includes(contact.id)) {
      return false;
    }
    this.usedContactIds.push(contact.id);
    return true;
  }

  private renderJobContacts() {
    if (this.props.contacts.data) {
      return this.props.contacts.data.map((contact: any, index: number) => {
        return this.checkContactNotUsed(contact) ? (
          <ReferenceBarContact contact={contact} key={`cnt-${contact.type}-${index}`} />
        ) : null;
      });
    }
    return null;
  }

  private renderContact(contact: any) {
    return this.checkContactNotUsed(contact) ? <ReferenceBarContact contact={contact} /> : null;
  }

  private renderFinancials() {
    return <ReferenceBarFinancials financials={{}} />;
  }

  public render() {
    this.usedContactIds = [];
    return (
      <>
        {(this.props.loading || this.props.contacts.loading) && <BlockLoading size={40} color={ColorPalette.white} />}
        {this.props.entity.recipient_contact && this.renderContact(this.props.entity.recipient_contact)}
        {this.props.entity.accounting_organization &&
          this.renderContact(this.props.entity.accounting_organization.contact)}
        {this.props.additionalItems}
        {this.renderJobContacts()}
        {this.renderReferenceBarJob()}
        {this.renderFinancials()}
      </>
    );
  }
}

export default withData<IProps>({
  contacts: {
    fetch: JobService.getContacts,
    initialData: []
  }
})(FinanceReferenceItems);
