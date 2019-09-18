import * as React from 'react';
import {INote} from 'src/models/INotesAndMessages';
import JobNoteOrReply from 'src/components/AppLayout/JobsLayout/JobLayout/JobNoteOrReply';
import {IUserState} from 'src/redux/userDucks';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from './Common/BlockLoading';
import StatusListItem from 'src/components/Layout/StatusListItem';
import moment from 'moment';
import {IJobStatus} from 'src/models/IJob';

interface IProps {
  notes: INote[];
  statuses?: IJobStatus[];
  onNoteDelete?: (noteId: number) => void;
  onNoteEdit?: () => void;
  user: IUserState;
  loading?: boolean;
  loadingColor?: string;
  highlightedItemId?: number;
  afterEditSuccess?: () => any;
}

const Wrapper = styled.div`
  position: relative;
  min-height: 50px;
`;

class NoteBasedItemsList extends React.PureComponent<IProps> {
  private allowAction(note: INote) {
    const {user} = this.props;
    if (!user) {
      return false;
    }

    return user.me && user.me.id === note.user_id;
  }

  private typeCheckers = {
    instanceOfJobStatus(object: any): object is IJobStatus {
      return object.hasOwnProperty('status') && object.hasOwnProperty('created_at');
    },
    instanceOfNote(object: any): object is INote {
      return object.hasOwnProperty('note') && object.hasOwnProperty('created_at') && object.hasOwnProperty('id');
    }
  };

  public render() {
    const {
      notes,
      statuses,
      onNoteDelete,
      onNoteEdit,
      loading,
      loadingColor,
      highlightedItemId,
      afterEditSuccess
    } = this.props;
    const notesAndStatuses: Array<IJobStatus | INote> = statuses
      ? ([] as Array<IJobStatus | INote>)
          .concat(notes)
          .concat(statuses)
          .sort((a, b) => moment(b.created_at || '').diff(a.created_at || ''))
      : notes;

    return (
      <Wrapper>
        {loading && <BlockLoading size={40} color={loadingColor || ColorPalette.white} />}
        <UserContext.Consumer>
          {context =>
            notesAndStatuses.map((element: INote | IJobStatus, index) => {
              if (this.typeCheckers.instanceOfJobStatus(element)) {
                return <StatusListItem key={index} status={element} />;
              }
              if (context.has(Permission.NOTES_VIEW) && this.typeCheckers.instanceOfNote(element)) {
                return (
                  <JobNoteOrReply
                    highlightedItemId={highlightedItemId}
                    key={element.id}
                    noteOrReply={element}
                    onEdit={this.allowAction(element) && onNoteEdit ? () => onNoteEdit() : undefined}
                    allowEditNote={!!this.allowAction(element)}
                    afterEditSuccess={afterEditSuccess}
                    onDelete={this.allowAction(element) && onNoteDelete ? () => onNoteDelete(element.id) : undefined}
                  />
                );
              } else {
                return null;
              }
            })
          }
        </UserContext.Consumer>
      </Wrapper>
    );
  }
}

export default NoteBasedItemsList;
