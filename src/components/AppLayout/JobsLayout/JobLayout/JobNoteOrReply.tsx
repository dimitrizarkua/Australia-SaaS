import * as React from 'react';
import AttachedFiles from 'src/components/TextEditor/AttachedFiles';
import moment from 'moment';
import styled from 'styled-components';
import {sanitize, replaceMentions} from 'src/utility/Helpers';
import {INote, IMessage, MessageType} from 'src/models/INotesAndMessages';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import DropdownMenuControl, {IMenuItem} from 'src/components/Layout/MenuItems/DropdownMenuControl';
import UserContext from 'src/components/AppLayout/UserContext';
import Permission from 'src/constants/Permission';
import {IUserContext} from 'src/components/AppLayout/UserContext';
import {getUserNames} from 'src/utility/Helpers';
import {IconName} from 'src/components/Icon/Icon';
import {FRONTEND_DATE_TIME} from 'src/constants/Date';
import ModalNoteEdit from 'src/components/Modal/Common/ModalNoteEdit';

interface IProps {
  noteOrReply: INote | IMessage;
  onDelete?: () => any;
  onEdit?: () => any;
  afterEditSuccess?: () => any;
  allowEditNote?: boolean;
  highlightedItemId?: number;
}

interface IState {
  showSubject: boolean;
  showEditModal: boolean;
}

const noteBorder = 4;
const avatarLeftMargin = 24;
const avatarWidth = 40;
const noteTextLeftMargin = 24;
const allMargins = noteTextLeftMargin + avatarWidth + avatarLeftMargin;

const Message = styled.div<{
  isReply?: boolean;
  isMeeting?: boolean;
  isHighlighted?: boolean;
}>`
  color: ${ColorPalette.gray5};
  padding: 21px 0;
  border-bottom: 1px solid ${ColorPalette.gray2};
  border-left: ${noteBorder}px solid
    ${props =>
      (props.isMeeting && ColorPalette.purple2) || (props.isReply && ColorPalette.gray4) || ColorPalette.orange2};
  ${props => props.isHighlighted && `background: ${ColorPalette.blue0};`}
`;

const Avatar = styled.div<{backgroundImage?: string}>`
  width: ${avatarWidth}px;
  height: ${avatarWidth}px;
  line-height: ${avatarWidth}px;
  margin-left: ${avatarLeftMargin}px;
  border-radius: 4px;
  overflow: hidden;
  background-color: ${props => (props.backgroundImage ? 'transparent' : ColorPalette.green0)};
  background-image: ${props => (props.backgroundImage ? `url(${props.backgroundImage})` : 'none')};
  background-size: cover;
  text-align: center;
  font-size: 130%;
  font-weight: ${Typography.weight.bold};
  color: ${props => (props.backgroundImage ? 'transparent' : ColorPalette.white)};
`;

const Placeholder = styled.div`
  height: ${avatarWidth}px;
`;

const Subject = styled.div`
  margin-left: ${allMargins}px;
  margin-bottom: 1rem;
`;

const MessageContainer = styled.div`
  margin-left: ${allMargins}px;
`;

const MessageText = styled.div`
  word-break: break-all;
  p {
    margin-bottom: 0;
  }
`;

const MessageAuthor = styled.div<{
  isReply?: boolean;
  isMeeting?: boolean;
}>`
  margin-left: ${props => (props.isReply ? allMargins : noteTextLeftMargin)}px;
  display: flex;

  font-size: 1.1rem;
  font-weight: ${Typography.weight.medium};

  & .title {
    font-weight: ${Typography.weight.bold};
  }

  & .action {
    padding-left: 10px;
    color: ${props =>
      (props.isMeeting && ColorPalette.purple2) || (props.isReply && ColorPalette.gray4) || ColorPalette.orange2};
  }
`;

const DateLabel = styled.div`
  width: 140px;
  font-size: ${Typography.size.smaller};
  margin-right: 21px;
`;

const MenuArea = styled.div`
  margin-right: 21px;
  width: 20px;
`;

const {ColoredDiv} = StyledComponents;

class JobNoteOrReply extends React.PureComponent<IProps, IState> {
  public state = {
    showSubject: false,
    showEditModal: false
  };

  private static replyPhrases = {
    incoming: 'sent an Email',
    email: 'replied via Email',
    sms: 'replied via SMS'
  };

  private parseNote = (note: string) => replaceMentions(sanitize(note));

  private get addReplyPhrase() {
    const noteOrReply = this.props.noteOrReply as IMessage;
    if (noteOrReply.is_incoming) {
      return JobNoteOrReply.replyPhrases.incoming;
    } else if (noteOrReply.message_type === MessageType.EMAIL) {
      return JobNoteOrReply.replyPhrases.email;
    } else if (noteOrReply.message_type === MessageType.SMS) {
      return JobNoteOrReply.replyPhrases.sms;
    }
    return null;
  }

  private get isReply(): boolean {
    const noteOrReply = this.props.noteOrReply as IMessage;
    return !!noteOrReply.message_body_resolved;
  }

  private onEdit = () => {
    this.setState({showEditModal: true});
  };

  private renderMenu = (context: IUserContext): IMenuItem[] => {
    const result: IMenuItem[] = [];
    const {onDelete, allowEditNote} = this.props;

    if (this.isReply) {
      result.push({
        name: this.state.showSubject ? 'Hide subject' : 'Show subject',
        onClick: this.toggleSubject
      });
    }

    if (!this.isReply && !this.isMeeting() && allowEditNote && context.has(Permission.NOTES_UPDATE)) {
      result.push({
        name: 'Edit',
        onClick: this.onEdit
      });
    }

    if (onDelete && context.has(Permission.NOTES_DELETE)) {
      result.push({
        name: 'Delete',
        onClick: onDelete
      });
    }

    return result;
  };

  private toggleSubject = () => {
    this.setState({showSubject: !this.state.showSubject});
  };

  private isMeeting = () => {
    const noteOrReply = this.props.noteOrReply as INote;
    return !!noteOrReply.meeting;
  };

  private closeEditNoteModal = () => {
    this.setState({showEditModal: false});
  };

  public renderHeadLine(noteOrReply: INote & IMessage, isReply: boolean) {
    const userNames = getUserNames(noteOrReply.user || noteOrReply.sender);
    const userName = userNames.name;
    const fromEmail = noteOrReply.from_name;
    const avatarImage = noteOrReply.user && noteOrReply.user.avatar && noteOrReply.user.avatar.url;
    const initials = userNames.initials;

    return (
      <div className="d-flex">
        {!isReply && !userNames.invalid ? (
          <Avatar className="flex-shrink-0" backgroundImage={avatarImage}>
            {initials}
          </Avatar>
        ) : (
          <Placeholder />
        )}
        {!isReply && (
          <MessageAuthor isReply={isReply} isMeeting={this.isMeeting()} className="flex-grow-1">
            <span className="title">{userName}</span>
            <div className="action">
              {this.isMeeting() ? `added a meeting to ${noteOrReply.contact!.name}` : 'added a note'}
            </div>
          </MessageAuthor>
        )}
        {isReply && (
          <div className="flex-grow-1">
            <MessageAuthor isReply={isReply}>
              <span className="title">{noteOrReply.is_incoming ? fromEmail : userName}</span>
              <div className="action">{this.addReplyPhrase}</div>
            </MessageAuthor>
            {this.state.showSubject && (
              <Subject>{!!noteOrReply.subject ? `Subject: ${noteOrReply.subject}` : 'No Subject'}</Subject>
            )}
          </div>
        )}
        <DateLabel>{moment(noteOrReply.created_at).format(FRONTEND_DATE_TIME)}</DateLabel>
      </div>
    );
  }

  public render() {
    const {noteOrReply: nr, highlightedItemId, afterEditSuccess} = this.props;
    const noteOrReply = nr as (INote & IMessage);
    const hasBody = !!(noteOrReply.note_resolved || noteOrReply.message_body_resolved);
    const isReply = this.isReply;
    const isHighlighted =
      (isReply && noteOrReply.id === highlightedItemId) || (!isReply && noteOrReply.id === highlightedItemId);
    const {showEditModal} = this.state;

    return (
      <UserContext.Consumer>
        {context => {
          const dropdownItems = this.renderMenu(context);
          return (
            <>
              {!isReply && showEditModal && (
                <ModalNoteEdit
                  isOpen={showEditModal}
                  onClose={this.closeEditNoteModal}
                  note={nr as INote}
                  disableTemplatesControl={true}
                  afterSuccess={afterEditSuccess}
                />
              )}
              <Message
                isHighlighted={isHighlighted}
                isReply={isReply}
                isMeeting={this.isMeeting()}
                className="d-flex flex-row align-items-end"
                id={`${isReply ? 'message' : 'note'}-${noteOrReply.id}`}
              >
                <div className="flex-grow-1">
                  {this.renderHeadLine(noteOrReply, isReply)}
                  <MessageContainer className="flex-column">
                    <MessageText>
                      {this.isMeeting() && (
                        <ColoredDiv weight={Typography.weight.bold}>
                          {moment(noteOrReply.meeting!.scheduled_at).format('dddd Do MMMM YYYY, h:mma')}
                        </ColoredDiv>
                      )}
                      {hasBody && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: this.parseNote(noteOrReply.note_resolved || noteOrReply.message_body_resolved || '')
                          }}
                        />
                      )}
                      <br />
                      {noteOrReply.documents && !!noteOrReply.documents.length && (
                        <AttachedFiles documents={noteOrReply.documents} />
                      )}
                    </MessageText>
                  </MessageContainer>
                </div>
                <MenuArea className="flex-shrink-0 align-self-start">
                  {(isReply || dropdownItems.length > 0) && (
                    <DropdownMenuControl iconName={IconName.MenuVertical} items={dropdownItems} />
                  )}
                </MenuArea>
              </Message>
            </>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default JobNoteOrReply;
