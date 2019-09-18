import * as React from 'react';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import TextEditor, {IProps as IExtProps} from './TextEditor';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import AttachedFiles from './AttachedFiles';
import {IDocument} from 'src/models/IDocument';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {connect} from 'react-redux';
import DocumentsService from 'src/services/DocumentsService';
import {INote} from 'src/models/INotesAndMessages';
import NotesAndMessagesService from 'src/services/NotesAndMessagesService';

export interface IProps extends IExtProps {
  afterSave?: (note: INote) => void;
  beforeSave?: () => void;
  buttonPlaceholder?: string;
  loadingColor?: string;
  hideBottom?: boolean;
  edit?: boolean;
  note?: INote;
  triggerToSave?: boolean;
}

interface IState {
  loading: boolean;
  noteText: string;
  documents: IDocument[];
  disabled: boolean;
}

const Wrapper = styled.div`
  position: relative;
`;

const EditorFooter = styled.div`
  background: ${ColorPalette.orange0};
  text-align: right;
  height: 45px;
`;

const SaveNoteButton = styled.button`
  background: ${ColorPalette.orange1};
  color: ${ColorPalette.white};
  padding: 0 25px;
  border: 0;
  border-radius: 0;
  height: 100%;
  cursor: pointer;
`;

const EditorBorder = styled.div`
  border: 1px solid ${ColorPalette.gray2};
`;

const {ColoredDiv} = StyledComponents;

const pattern = /\B@[a-z0-9_-]+/gi;

class NoteComponent extends React.PureComponent<IProps, IState> {
  constructor(props: IProps, state: IState) {
    super(props, state);

    const {edit, note} = props;

    if (edit && note) {
      this.setState({noteText: note.note});
      this.setState({documents: note.documents});
      this.existedDocumentIds = note.documents.map((doc: IDocument) => doc.id);
    } else {
      this.existedDocumentIds = [];
    }
  }

  public state = {
    loading: false,
    noteText: '',
    documents: [],
    disabled: false
  };

  private existedDocumentIds: number[] = [];

  public componentWillMount() {
    const {edit, note} = this.props;

    if (edit && note) {
      this.setState({noteText: note.note});
      this.setState({documents: note.documents});
      this.existedDocumentIds = note.documents.map((doc: IDocument) => doc.id);
    } else {
      this.existedDocumentIds = [];
    }
  }

  public componentDidUpdate(prevProps: IProps) {
    const {triggerToSave} = this.props;

    if (triggerToSave && triggerToSave !== prevProps.triggerToSave) {
      this.handleAsyncAction(this.onSave);
    }
  }

  private handleAsyncAction = async (action: () => any) => {
    this.setState({loading: true});

    try {
      await action();
    } finally {
      this.setState({loading: false});
    }
  };

  private handleNoteChange = (note: string) => {
    this.setState({
      noteText: note
    });
  };

  private isContainInvalidMentions = () => {
    return !!this.state.noteText.match(pattern);
  };

  private postNoteDocument = async (files?: Blob[] | FileList | null) => {
    if (files && files.length) {
      const response = await DocumentsService.postDocument(files[0] as File);
      this.setState({documents: [...this.state.documents, response.data]});
    }
  };

  private removeDocument = async (id: number) => {
    this.setState({documents: this.state.documents.filter((doc: IDocument) => id !== doc.id)});
  };

  private onSave = async () => {
    const {afterSave, edit, note, beforeSave} = this.props;
    const {noteText, documents} = this.state;

    if (beforeSave) {
      await beforeSave();
    }

    const noteSaved = edit
      ? await NotesAndMessagesService.updateNote(note!.id, noteText)
      : await NotesAndMessagesService.postNote(noteText);
    const promisesForAdd = documents
      .filter((document: IDocument) => !this.existedDocumentIds.includes(document.id))
      .map((document: IDocument) => DocumentsService.attachDocumentToNote(noteSaved.data.id, document.id));

    const editedDocIds = documents.map((doc: IDocument) => doc.id);
    const promisesForDelete = this.existedDocumentIds
      .filter((id: number) => !editedDocIds.includes(id))
      .map((id: number) => DocumentsService.detachDocumentFromNote(noteSaved.data.id, id));

    await Promise.all([Promise.all([promisesForAdd]), Promise.all([promisesForDelete])]);

    setTimeout(() => {
      if (afterSave) {
        afterSave(noteSaved.data);
      }
    }, 800);
  };

  private setDisableSate = (cond: boolean) => {
    this.setState({disabled: cond});
  };

  public render() {
    const {placeholder, color, buttonPlaceholder, loadingColor, hideBottom, initValue} = this.props;
    const {loading, noteText, documents, disabled} = this.state;

    return (
      <Wrapper>
        {loading && <BlockLoading size={40} color={loadingColor || ColorPalette.white} zIndex={2} />}
        <EditorBorder>
          <TextEditor
            {...this.props}
            value={noteText}
            initValue={initValue}
            onChange={this.handleNoteChange}
            postDocument={files => this.handleAsyncAction(() => this.postNoteDocument(files))}
            placeholder={placeholder || 'Write your note here...'}
            color={color || ColorPalette.orange0}
            externalDisableListener={this.setDisableSate}
          />
          {!hideBottom && (
            <EditorFooter>
              <SaveNoteButton
                onClick={() => this.handleAsyncAction(this.onSave)}
                disabled={disabled || this.isContainInvalidMentions()}
              >
                {buttonPlaceholder || 'Add Note'}
              </SaveNoteButton>
            </EditorFooter>
          )}
        </EditorBorder>
        {documents && documents.length > 0 && (
          <ColoredDiv margin="15px 0 0 0">
            <AttachedFiles documents={documents} onRemove={this.removeDocument} />
          </ColoredDiv>
        )}
      </Wrapper>
    );
  }
}

export default connect()(NoteComponent);
