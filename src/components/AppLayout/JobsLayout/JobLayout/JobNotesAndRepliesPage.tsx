import * as React from 'react';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {RouteComponentProps} from 'react-router';
import {connect} from 'react-redux';
import moment, {Moment} from 'moment';
import * as qs from 'qs';
import ColorPalette from 'src/constants/ColorPalette';
import EmailReplyForm, {IFormData} from './EmailReplyForm';
import JobNoteOrReply from './JobNoteOrReply';
import {IMessage, INote} from 'src/models/INotesAndMessages';
import {IJobStatus, JobStatuses} from 'src/models/IJob';
import DateTransformer from 'src/transformers/DateTransformer';
import {IAppState} from 'src/redux';
import {
  deleteEditedReply,
  IEditedReplyState,
  resetEditedReply,
  saveEditedReply,
  uploadReplyDocument
} from 'src/redux/editedReply';
import {
  addNoteToJob,
  addReplyToJob,
  deleteJobNote,
  getJobNotesAndReplies,
  INotesAndRepliesState
} from 'src/redux/notesAndReplies';
import {IUserState} from 'src/redux/userDucks';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import Permission from 'src/constants/Permission';
import UserContext from 'src/components/AppLayout/UserContext';
import NoteComponent from 'src/components/TextEditor/NoteComponent';
import JobService from 'src/services/JobService';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import NoteComponentWrapper from 'src/components/TextEditor/NoteComponentWrapper';
import ScrollToComponent from 'src/components/AppLayout/ScrollToComponent';
import {IUserSimple} from 'src/models/IUser';
import JobStatusListItem from 'src/components/AppLayout/JobsLayout/JobLayout/JobStatusListItem';

interface IParams {
  id: string;
}

interface IConnectProps {
  notesAndReplies: INotesAndRepliesState;
  editedReply: IEditedReplyState;
  job: ICurrentJob;
  user: IUserState;
  dispatch: ThunkDispatch<any, any, Action>;
}

export enum JobTypeCreating {
  user = 'user',
  email = 'email',
  recurring = 'recurring'
}

type JobMetaDataItem = IJobStatus | INote | IMessage | IJobStatusOfCreating;

export interface IJobStatusOfCreating {
  type: JobTypeCreating;
  created_at: string | null;
  user?: IUserSimple;
  status: JobStatuses.Created;
}

class JobNotesAndRepliesPage extends ScrollToComponent<RouteComponentProps<IParams> & IConnectProps> {
  public componentDidMount() {
    this.getJobNotesAndReplies().then(this.markJobAsReadIfAllowed);
    this.scrollToHighlightedItem(this.getHighlightedItemSelector());
  }

  public componentDidUpdate(prevProps: IConnectProps) {
    const {job} = this.props;
    if (!prevProps.job.data && job.data) {
      this.markJobAsReadIfAllowed();
    }
    if (this.notesAndRepliesCounter(this.props) !== this.notesAndRepliesCounter(prevProps)) {
      this.scrollToHighlightedItem(this.getHighlightedItemSelector());
    }
  }

  private notesAndRepliesCounter = (props: IConnectProps) => {
    return props.notesAndReplies.data
      ? props.notesAndReplies.data.notes.length + props.notesAndReplies.data.messages.length
      : 0;
  };

  private markJobAsReadIfAllowed = () => {
    const {job, match} = this.props;
    if (job.data && !job.data.edit_forbidden) {
      JobService.markJobAsRead(+match.params.id);
    }
  };

  private revertBackToNotes = () => {
    this.props.history.push(this.props.location.pathname);
  };

  private cancelNote = async () => {
    this.revertBackToNotes();
  };

  private cancelReply = async () => {
    await this.props.dispatch(deleteEditedReply());
    this.revertBackToNotes();
  };

  private sendReply = async (data: IFormData) => {
    const {dispatch} = this.props;
    await dispatch(saveEditedReply(data));
    const {
      job,
      editedReply: {savedReply}
    } = this.props;
    if (savedReply) {
      await dispatch(addReplyToJob(job.data!.id, savedReply.id));
      dispatch(resetEditedReply());
    }
    this.revertBackToNotes();
  };

  private saveNoteDraft = async (note: INote) => {
    const {dispatch} = this.props;
    const {job} = this.props;

    this.cancelNote();
    await dispatch(addNoteToJob(job.data!.id, note.id));
  };

  private postReplyDocument = async (files?: Blob[] | FileList | null) => {
    if (files && files.length) {
      await this.props.dispatch(uploadReplyDocument(files[0]));
    }
  };

  private deleteJobNote(id: number) {
    const {job, dispatch} = this.props;
    dispatch(deleteJobNote(job.data!.id, id));
  }

  private canDeleteNote(note: INote) {
    const {job, user} = this.props;
    const editForbidden = job.data && job.data.edit_forbidden;
    if (!user) {
      return false;
    }
    return user.me && user.me.id === note.user.id && !editForbidden;
  }

  private computeJobCreatorType(statusOfCreating?: IJobStatus): JobTypeCreating {
    const {
      job: {data: jobData}
    } = this.props;
    if (statusOfCreating && statusOfCreating.user) {
      return JobTypeCreating.user;
    }

    if (jobData && jobData.recurring_job_id) {
      return JobTypeCreating.recurring;
    }

    return JobTypeCreating.email;
  }

  private getAll(showNotes: boolean, showReplies: boolean) {
    const statusesList = this.getStatuses();
    const statusOfCreating: IJobStatus | undefined = statusesList.shift();

    const statusInfoList = (statusesList as JobMetaDataItem[])
      .concat(this.getNotesAndReplies(showNotes, showReplies))
      .sort((a, b) => moment(b.created_at || '').diff(a.created_at || ''));

    return [
      ...statusInfoList,
      {
        user: (statusOfCreating && statusOfCreating.status === JobStatuses.New && statusOfCreating.user) || undefined,
        created_at: DateTransformer.dehydrateDateTime(this.props.job.data!.created_at as Moment),
        type: this.computeJobCreatorType(statusOfCreating),
        status: JobStatuses.Created
      }
    ];
  }

  private getStatuses(): IJobStatus[] {
    const {job} = this.props;
    if (job) {
      return job.data!.statuses || [];
    } else {
      return [];
    }
  }

  private getNotesAndReplies(showNotes: boolean, showReplies: boolean) {
    const notesAndRepliesData = this.props.notesAndReplies.data;
    if (!notesAndRepliesData) {
      return [];
    } else {
      const {notes, messages} = notesAndRepliesData;
      return [...(notes && showNotes ? notes : []), ...(messages && showReplies ? messages : [])];
    }
  }

  private typeCheckers = {
    instanceOfJobStatus(object: any): object is IJobStatus | IJobStatusOfCreating {
      return object.hasOwnProperty('status') && object.hasOwnProperty('created_at');
    },
    instanceOfNote(object: any): object is INote {
      return object.hasOwnProperty('note') && object.hasOwnProperty('created_at') && object.hasOwnProperty('id');
    },
    instanceOfMessage(object: any): object is IMessage {
      return (
        object.hasOwnProperty('sender') &&
        object.hasOwnProperty('created_at') &&
        object.hasOwnProperty('id') &&
        object.hasOwnProperty('subject')
      );
    }
  };

  private get isNoteEditorVisible() {
    const params = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    return params.note === 'true';
  }

  private get isEmailReplyVisible() {
    const params = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    return params.reply === 'true';
  }

  private getHighlightedItemSelector = () => {
    let selector;
    const highlightedItem = this.getHighlightedItem();

    if (highlightedItem.note) {
      selector = `note-${highlightedItem.note}`;
    } else if (highlightedItem.message) {
      selector = `message-${highlightedItem.message}`;
    }

    return selector;
  };

  private getJobNotesAndReplies = () => {
    return this.props.dispatch(getJobNotesAndReplies(this.props.match.params.id));
  };

  public render() {
    const {notesAndReplies, job} = this.props;
    const editForbidden = job.data && job.data.edit_forbidden;

    return (
      <UserContext.Consumer>
        {context => {
          const showNotes = context.has(Permission.NOTES_VIEW);
          const showReplies = context.has(Permission.MESSAGES_VIEW);
          const showNoteForm = context.has(Permission.NOTES_CREATE);
          const showReplyForm = context.has(Permission.MESSAGES_MANAGE);
          return (
            job.data && (
              <div style={{position: 'relative'}} className="flex-grow-1">
                {this.isNoteEditorVisible && !editForbidden && showNoteForm && (
                  <NoteComponentWrapper padding="40px 30px" overflow="visible">
                    <NoteComponent
                      afterSave={this.saveNoteDraft}
                      color={ColorPalette.orange0}
                      onCancel={this.cancelNote}
                    />
                  </NoteComponentWrapper>
                )}
                {this.isEmailReplyVisible && !editForbidden && showReplyForm && (
                  <NoteComponentWrapper padding="40px 30px 70px 30px">
                    <EmailReplyForm
                      documents={this.props.editedReply.documents}
                      onSubmit={this.sendReply}
                      onSave={this.sendReply}
                      onCancel={this.cancelReply}
                      postDocument={this.postReplyDocument}
                      disabled={!!editForbidden}
                    />
                  </NoteComponentWrapper>
                )}
                {notesAndReplies && (
                  <div style={{position: 'relative'}}>
                    {notesAndReplies.loading && <BlockLoading size={40} color={ColorPalette.white} />}
                    {this.getAll(showNotes, showReplies).map((element, index) => {
                      if (this.typeCheckers.instanceOfJobStatus(element)) {
                        return <JobStatusListItem key={index} status={element as any} />;
                      }
                      if (this.typeCheckers.instanceOfNote(element)) {
                        return (
                          <JobNoteOrReply
                            highlightedItemId={this.getHighlightedItem().note}
                            noteOrReply={element}
                            onDelete={this.canDeleteNote(element) ? () => this.deleteJobNote(element.id) : undefined}
                            key={`note-${element.id}`}
                            allowEditNote={!!this.canDeleteNote(element)}
                            afterEditSuccess={this.getJobNotesAndReplies}
                          />
                        );
                      }
                      if (this.typeCheckers.instanceOfMessage(element)) {
                        return (
                          <JobNoteOrReply
                            noteOrReply={element}
                            highlightedItemId={this.getHighlightedItem().message}
                            key={`reply-${element.id}`}
                          />
                        );
                      } else {
                        return null;
                      }
                    })}
                  </div>
                )}
              </div>
            )
          );
        }}
      </UserContext.Consumer>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  editedReply: state.editedReply,
  notesAndReplies: state.notesAndReplies,
  job: state.currentJob,
  user: state.user
});

export default connect(mapStateToProps)(JobNotesAndRepliesPage);

export const InternalJobNotesAndRepliesPage = JobNotesAndRepliesPage;
