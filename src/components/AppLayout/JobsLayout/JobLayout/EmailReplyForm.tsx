import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {Action} from 'redux';
import {reduxForm, Field, InjectedFormProps} from 'redux-form';
import {ThunkDispatch} from 'redux-thunk';
import Input from 'src/components/Form/Input';
import Select from 'src/components/Form/Select';
import TextEditorField from 'src/components/Form/TextEditorField';
import AttachedFiles from 'src/components/TextEditor/AttachedFiles';
import {required, requiredHtml, email} from 'src/services/ValidationService';
import {IDocument} from 'src/models/IDocument';
import {MessageType} from 'src/models/INotesAndMessages';
import ContactsSearch from 'src/components/Form/ContactSelectors/AssignedContactSelector';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import {IContactAssignment} from 'src/models/IJob';
import {INotesAndRepliesState} from 'src/redux/notesAndReplies';
import {removeDocumentFromReply, IEditedReplyState} from 'src/redux/editedReply';
import LongAlert from 'src/components/LongAlert/LongAlert';
import {IReturnType} from 'src/redux/reduxWrap';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';

interface ISendAsOption {
  value: MessageType;
  label: string;
}

export interface IFormData {
  type: ISendAsOption;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

interface IOwnProps {
  onSave: (data: IFormData) => void;
  onCancel: () => void;
  postDocument: (files?: Blob[] | FileList | null) => void;
  onSubmit: (data: any) => {};
  disabled: boolean;
  documents?: IDocument[] | null;
}

interface IConnectProps {
  job: ICurrentJob;
  contacts: IReturnType<IContactAssignment[]>;
  notesAndReplies: INotesAndRepliesState;
  setValue: (field: string, value: any) => void;
  editedReply: IEditedReplyState;
  dispatch: ThunkDispatch<any, any, Action>;
}

type IProps = InjectedFormProps<IFormData, IOwnProps> & IOwnProps & IConnectProps;

interface IState {
  type: ISendAsOption | null;
  to: string;
}

const StyledLabel = styled.label`
  color: ${ColorPalette.gray4};
`;

const EditorWrapper = styled.div`
  margin-top: 25px;
  border: 1px solid ${ColorPalette.gray2};
`;

const EditorFooter = styled.div`
  background: ${ColorPalette.blue0};
  text-align: right;
  height: 45px;
`;

const SubmitButton = styled.button`
  background: ${ColorPalette.blue1};
  color: ${ColorPalette.white};
  padding: 0 25px;
  border: 0;
  border-radius: 0;
  height: 100%;
  cursor: pointer;
`;

const AttachedFilesWrapper = styled.div`
  margin-top: 5px;
`;

class EmailReplyForm extends React.PureComponent<IProps, IState> {
  public state = {
    type: null,
    to: ''
  };

  private static sendAsOptions: ISendAsOption[] = [
    {
      value: MessageType.EMAIL,
      label: 'Email'
    },
    {
      value: MessageType.SMS,
      label: 'SMS'
    }
  ];

  private saveDraft = () => {
    this.props.handleSubmit(this.props.onSave)();
  };

  private onTypeFieldChange = (e: any, type: ISendAsOption) => {
    this.setState({type});
  };

  private onToFieldChange = (e: any, to: string) => {
    this.setState({to});
  };

  private clickOnHintItem = {
    [MessageType.EMAIL]: (o: IContactAssignment) => {
      this.props.change('to', o.email);
    },
    [MessageType.SMS]: (o: IContactAssignment) => {
      this.props.change('to', o.mobile_phone);
    }
  };

  public get assignedContacts() {
    if (!this.props.contacts.data) {
      return [];
    }
    return this.props.contacts.data.map(contact => ({
      ...contact,
      disabled: this.state.type === MessageType.SMS ? !contact.mobile_phone : !contact.email
    }));
  }

  private removeDocumentFromReply = async (documentId: number) => {
    return await this.props.dispatch(removeDocumentFromReply(documentId));
  };

  public render() {
    const onSelectContact = this.clickOnHintItem[(this.state.type || ({} as ISendAsOption)).value || MessageType.EMAIL];
    const {type} = this.state;
    const {handleSubmit, submitting} = this.props;
    const isEmail = type && (type as ISendAsOption).value === MessageType.EMAIL;
    const disableAttachedFiles = !type || (!!type && (type as ISendAsOption).value === MessageType.SMS);

    return (
      <>
        {submitting && <BlockLoading size={40} color={ColorPalette.white} />}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="row">
            <StyledLabel className="col-2 col-form-label">Send As:</StyledLabel>
            <div className="col-2">
              <Field
                name="type"
                placeholder="Select..."
                validate={required}
                component={Select}
                options={EmailReplyForm.sendAsOptions}
                onChange={this.onTypeFieldChange}
                disabled={this.props.disabled}
              />
            </div>
          </div>
          <div className="row">
            <StyledLabel className="col-2 col-form-label">To:</StyledLabel>
            <div className="col-5">
              <Field
                name="to"
                placeholder="Select..."
                validate={isEmail ? [required, email] : [required]}
                component={ContactsSearch}
                onChange={this.onToFieldChange}
                onSelect={onSelectContact}
                contactValue={this.state.to}
                assignedContacts={this.assignedContacts}
                loading={this.props.contacts.loading}
                disabled={this.props.disabled}
              />
            </div>
          </div>
          {isEmail && (
            <>
              <div className="row">
                <StyledLabel className="col-2 col-form-label">Cc:</StyledLabel>
                <div className="col-5">
                  <Field
                    name="cc"
                    placeholder="Select..."
                    component={Input}
                    validate={email}
                    disabled={this.props.disabled}
                  />
                </div>
              </div>
              <div className="row">
                <StyledLabel className="col-2 col-form-label">Bcc:</StyledLabel>
                <div className="col-5">
                  <Field
                    name="bcc"
                    placeholder="Select..."
                    component={Input}
                    validate={email}
                    disabled={this.props.disabled}
                  />
                </div>
              </div>
              <div className="row">
                <StyledLabel className="col-2 col-form-label">Subject:</StyledLabel>
                <div className="col-5">
                  <Field
                    name="subject"
                    placeholder="Subject..."
                    component={Input}
                    validate={isEmail ? required : undefined}
                    disabled={this.props.disabled}
                  />
                </div>
              </div>
            </>
          )}

          {type && (
            <LongAlert>
              This message will be sent to the specified{' '}
              {(type as ISendAsOption).value === MessageType.EMAIL ? 'email addresses' : 'phone number'}.{' '}
              <strong>Switch to a Note</strong> if you want to reply with an internal note.
            </LongAlert>
          )}

          <EditorWrapper>
            <Field
              name="body"
              placeholder="Enter body here..."
              component={TextEditorField}
              color={ColorPalette.blue0}
              onCancel={this.props.onCancel}
              onSave={this.saveDraft}
              postDocument={this.props.postDocument}
              validate={requiredHtml}
              disableAttachments={disableAttachedFiles}
            />
            <EditorFooter>
              <SubmitButton type="submit" disabled={this.props.submitting}>
                Send {type && ((type as ISendAsOption).value === MessageType.EMAIL ? 'Email' : 'SMS')}
              </SubmitButton>
            </EditorFooter>
          </EditorWrapper>
          {!disableAttachedFiles && (
            <AttachedFilesWrapper>
              <AttachedFiles documents={this.props.documents} onRemove={this.removeDocumentFromReply} />
            </AttachedFilesWrapper>
          )}
        </form>
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  job: state.currentJob,
  contacts: state.currentJobContacts,
  notesAndReplies: state.notesAndReplies,
  editedReply: state.editedReply
});

export default compose<React.ComponentClass<IOwnProps>>(
  reduxForm<IFormData, IOwnProps>({
    form: 'EmailReplyForm'
  }),
  connect(mapStateToProps)
)(EmailReplyForm);
