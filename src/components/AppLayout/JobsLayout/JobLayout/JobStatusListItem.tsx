import StatusListItem from 'src/components/Layout/StatusListItem';
import {getUserNames} from 'src/utility/Helpers';
import {IUser} from 'src/models/IUser';
import {IJobStatusOfCreating, JobTypeCreating} from './JobNotesAndRepliesPage';

export default class JobStatusListItem extends StatusListItem<IJobStatusOfCreating> {
  private computeCreator() {
    const {
      status: {user, type}
    } = this.props;
    switch (type) {
      case JobTypeCreating.user:
        return getUserNames(user as IUser).name;
      case JobTypeCreating.email:
        return 'incoming email';
      default:
        return null;
    }
  }

  protected getStatusOfCreating() {
    const creator = this.computeCreator();
    return `Job created ${creator ? `by ${creator}` : ''}`;
  }
}
