import * as React from 'react';
import {IRecurringJob} from 'src/models/IJob';
import ReferenceBarItem from './ReferenceBarItem';
import {Link} from 'react-router-dom';

interface IProps {
  items: IRecurringJob[];
  loading?: boolean;
}

class ReferenceBarPreviousJobs extends React.PureComponent<IProps> {
  public render() {
    const {loading, items} = this.props;

    return (
      <ReferenceBarItem caption="Previous Jobs" loading={loading} collapsable={true}>
        {items.map(job => (
          <div key={job.id}>
            <Link to={`/job/${job.id}/notes-and-replies`}>#{job.id}:</Link> {job.description}
          </div>
        ))}
      </ReferenceBarItem>
    );
  }
}

export default ReferenceBarPreviousJobs;
