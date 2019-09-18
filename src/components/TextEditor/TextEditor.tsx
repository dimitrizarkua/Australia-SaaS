import 'draft-js-mention-plugin/lib/plugin.css';

import * as React from 'react';
import {Action, compose} from 'redux';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {debounce} from 'lodash';
import {EditorState, Modifier, RichUtils} from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createMentionPlugin, {defaultSuggestionsFilter} from 'draft-js-mention-plugin';
import styled from 'styled-components';
import {stateFromHTML} from 'draft-js-import-html';
import {convertToHTML} from 'draft-convert';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import {IconName} from 'src/components/Icon/Icon';
import EditorControl from 'src/components/TextEditor/EditorControl';
import TemplatesControl, {ITemplate} from 'src/components/TextEditor/TemplatesControl';
import {IMentionsUser} from 'src/models/IUser';
import withData, {IResource} from 'src/components/withData/withData';
import UserService, {IMentionsUsersSuccess} from 'src/services/UserService';
import AttachmentControl from 'src/components/TextEditor/AttachmentControl';
import MentionsControl from 'src/components/TextEditor/MentionsControl';

export const ENCODED_MENTION_CLASS = 'ENCODED_MENTION_CLASS';

const padding = 10;

const mentionsStyles = {
  mention: 'MENTIONS_THEME_MENTION_CLASS',
  mentionSuggestions: 'MENTIONS_THEME_MENTION_SUGGESTIONS_CLASS',
  mentionSuggestionsEntryContainer: 'MENTIONS_THEME_MENTION_SUGGESTIONS_ENTRY_CONTAINER',
  mentionSuggestionsEntry: 'MENTIONS_THEME_MENTION_SUGGESTIONS_ENTRY_CLASS',
  mentionSuggestionsEntryFocused: 'MENTIONS_THEME_MENTION_SUGGESTIONS_ENTRY_FOCUSED_CLASS',
  mentionSuggestionsEntryActive: 'MENTIONS_THEME_MENTION_SUGGESTIONS_ENTRY_CLASS'
};

const EditorContainer = styled.div`
  border-bottom: 1px solid ${ColorPalette.gray2};

  span > span > span {
    color: ${ColorPalette.red1};
    background: transparent;
    text-decoration: underline;
    text-decoration-style: dashed;
  }

  .${mentionsStyles.mention} > span > span {
    color: ${ColorPalette.green2} !important;
    background: transparent !important;
    text-decoration: none !important;
  }

  .${mentionsStyles.mentionSuggestions} {
    z-index: 2;
    position: absolute;
    padding: 5px;
    border: 1px solid ${ColorPalette.gray2};
    border-radius: 4px;
    margin-top: 0.4em;
    background: ${ColorPalette.white};
  }

  .${mentionsStyles.mentionSuggestionsEntry} {
    box-shadow: none;
    padding-top: 5px;
    cursor: pointer;
  }

  .${mentionsStyles.mentionSuggestionsEntryFocused} {
    background: ${ColorPalette.gray0};
  }

  .DraftEditor-root {
    position: relative;
  }

  .DraftEditor-editorContainer {
    padding: ${padding}px;
    min-height: 120px;
    max-height: 500px;
    overflow: auto;
    z-index: 1;
    position: relative;
  }

  .public-DraftEditorPlaceholder-root {
    color: ${ColorPalette.gray4};
    position: absolute;
    top: ${padding}px;
    left: ${padding}px;
  }
`;

const Controls = styled.div<{color: string}>`
  background: ${props => props.color};
  border-bottom: 1px solid ${ColorPalette.gray2};
  padding: 5px;
  height: 45px;
`;

const MentionEntry = styled.div`
  font-size: ${Typography.size.normal};
  font-weight: ${Typography.weight.normal};
  min-width: 220px;
  padding: 5px 15px;
`;

const MentionLocation = styled.div`
  float: right;
  padding-left: 5px;
  font-weight: ${Typography.weight.normal};
  color: ${ColorPalette.gray4};
`;

const Entry = (props: any) => {
  const {mention, searchValue, isFocused, ...parentProps} = props;

  return (
    <MentionEntry {...parentProps}>
      <strong>{mention.first_name}</strong> {mention.last_name}
      <MentionLocation>{mention.locations && mention.locations.join(' ')}</MentionLocation>
    </MentionEntry>
  );
};

interface IInlineStyle {
  icon: IconName;
  style: 'BOLD' | 'ITALIC' | 'UNDERLINE';
}

interface IMention extends IMentionsUser {
  name: string;
}

export interface IWithDataProps {
  users: IResource<IMentionsUsersSuccess>;
}

export interface IProps {
  value?: string;
  initValue?: string;
  placeholder?: string;
  color: string;
  onChange?: (value: string) => any;
  onSave?: () => void;
  onCancel?: () => void;
  postDocument?: (files?: Blob[] | FileList | null) => void;
  disableAttachments?: boolean;
  disableMentionControl?: boolean;
  disableTemplatesControl?: boolean;
  externalDisableListener?: (c: boolean) => any;
}

export interface IConnectProps {
  dispatch: ThunkDispatch<unknown, unknown, Action>;
}

interface IState {
  editorState: EditorState;
  suggestions: IMention[];
}

const INLINE_STYLES: IInlineStyle[] = [
  {icon: IconName.TextBold, style: 'BOLD'},
  {icon: IconName.TextItalic, style: 'ITALIC'},
  {icon: IconName.TextUnderlined, style: 'UNDERLINE'}
];

class TextEditor extends React.Component<IProps & IWithDataProps & IConnectProps, IState> {
  public componentDidMount() {
    this.setExternalDisabledCondition();
  }

  public componentDidUpdate() {
    this.setExternalDisabledCondition();
  }

  private static mentionLengthForSearch: number = 3;
  public static getDerivedStateFromProps(props: IProps, state: IState) {
    if (props.value === '') {
      const editorState = EditorState.createWithContent(stateFromHTML(''));
      return {editorState};
    } else {
      return null;
    }
  }

  private editor: React.RefObject<Editor> = React.createRef();
  private upload: React.RefObject<HTMLInputElement> = React.createRef();

  private initMentionPlugin = () => {
    const plugin = createMentionPlugin({
      mentionPrefix: '@',
      theme: mentionsStyles
    });

    return plugin;
  };

  private mentionPlugin: any = this.initMentionPlugin();

  public state = {
    editorState: EditorState.createWithContent(stateFromHTML(this.props.initValue || '')),
    suggestions: []
  };

  private onChange = (editorState: EditorState) => {
    this.setState({
      editorState
    });

    const newValue = this.getHTML();

    if (this.props.value !== newValue && this.props.onChange) {
      this.props.onChange(newValue);
    }
  };

  private onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {postDocument} = this.props;

    if (postDocument) {
      postDocument(event.target.files);
    }
  };

  private getHTML = () => {
    const contentState = this.state.editorState.getCurrentContent();
    const html: string = convertToHTML({
      entityToHTML: (entity: any, originalText: any) => {
        if (entity.type === 'mention') {
          return `[USER_ID:${entity.data.mention.id}]`;
        }
        return originalText;
      }
    })(contentState);
    return html;
  };

  private onSearchMentionChange = async (e: {value: string}) => {
    if (e.value.length >= TextEditor.mentionLengthForSearch) {
      const mentions: IMention[] = await this.getSuggestions(e.value);
      this.setState({
        suggestions: defaultSuggestionsFilter(e.value, mentions)
      });
    } else if (e.value.length === 0) {
      this.clearMentionsState();
    }
  };

  private onAddMention = (mention: any) => {
    this.clearMentionsState();
    this.onClearUserSearch();
  };

  private onClearUserSearch = () => {
    this.props.users.reset();
  };

  private clearMentionsState = () => {
    this.setState({suggestions: []});
  };

  private fetchDebounced = debounce(async name => await this.props.users.fetch(name), 350, {leading: true});

  private getSuggestions = async (name: string) => {
    await this.fetchDebounced(name);
    const mentions = this.props.users.data;
    return (
      (mentions &&
        mentions.data.map(mention => ({
          ...mention,
          name: `${mention.first_name} ${mention.last_name}`
        }))) ||
      []
    );
  };

  private focusEditor() {
    if (this.editor.current) {
      this.editor.current.focus();
    }
  }

  private toggleInlineStyle = (inlineStyle: string) => {
    // return focus to the editor, and then change inline style
    this.focusEditor();
    setTimeout(() => {
      this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle));
    }, 0);
  };

  private toggleBulletList = () => {
    // return focus to the editor, and then change blockType
    this.focusEditor();
    setTimeout(() => {
      this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item'));
    }, 0);
  };

  private isActive = (mode: string) => {
    return this.state.editorState.getCurrentInlineStyle().has(mode);
  };

  private isActiveBulletList = () => {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    return blockType === 'unordered-list-item';
  };

  private useTemplate = (template: ITemplate) => {
    this.onChange(EditorState.createWithContent(stateFromHTML(template.content)));
  };

  private openAttachmentDialog = () => {
    const uploadNode = this.upload.current;
    if (uploadNode) {
      uploadNode.click();
    }
  };

  private onSelectMentionUser = (user: IMentionsUser) => {
    const {editorState} = this.state;
    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const newContent = currentContent.createEntity('mention', 'SEGMENTED', {mention: user});

    const entityId = newContent.getLastCreatedEntityKey();
    const stateWithInsertion = Modifier.replaceText(
      newContent,
      selectionState,
      `@${user.full_name}`,
      undefined,
      entityId
    );
    this.setState({editorState: EditorState.push(editorState, stateWithInsertion, 'apply-entity')});
  };

  private onDrop = (e: any) => {
    const {postDocument, disableAttachments} = this.props;

    e.preventDefault();

    if (e.dataTransfer.files.length > 0 && postDocument && !disableAttachments) {
      postDocument(e.dataTransfer.files);
    }
  };

  private onDragOver = (e: any) => {
    e.preventDefault();
    this.focusEditor();
  };

  private onClick = (e: any) => {
    this.focusEditor();
  };

  private setExternalDisabledCondition = () => {
    const {externalDisableListener} = this.props;

    if (externalDisableListener) {
      externalDisableListener(!this.state.editorState.getCurrentContent().getPlainText());
    }
  };

  public render() {
    const {disableAttachments, disableMentionControl, disableTemplatesControl} = this.props;
    const isActiveBulletList = this.isActiveBulletList();
    const {MentionSuggestions} = this.mentionPlugin;
    const plugins = [this.mentionPlugin];
    const mentionUsers = this.props.users.data && this.props.users.data.data;

    return (
      <EditorContainer onDragOver={this.onDragOver} onDrop={this.onDrop} onClick={this.onClick}>
        <Controls color={this.props.color} className="d-flex justify-content-between">
          <div>
            {INLINE_STYLES.map(s => (
              <EditorControl
                key={s.style}
                isActive={this.isActive(s.style)}
                name={s.icon}
                onClick={() => this.toggleInlineStyle(s.style)}
              />
            ))}
            <EditorControl isActive={isActiveBulletList} name={IconName.BulletList} onClick={this.toggleBulletList} />
            {!disableAttachments && <AttachmentControl onSelect={this.openAttachmentDialog} />}
            {!disableMentionControl && (
              <MentionsControl
                loading={this.props.users.loading}
                onSelect={this.onSelectMentionUser}
                onChangeSearch={this.getSuggestions}
                onClearSearch={this.onClearUserSearch}
                users={mentionUsers}
              />
            )}
            {!disableTemplatesControl && <TemplatesControl onSelect={this.useTemplate} />}
          </div>
          <div>
            {this.props.onSave && <EditorControl isActive={false} name={IconName.Check} onClick={this.props.onSave} />}
            {this.props.onCancel && (
              <EditorControl isActive={false} name={IconName.Trash} onClick={this.props.onCancel} />
            )}
          </div>
        </Controls>
        <div style={{cursor: 'text'}}>
          <Editor
            ref={this.editor}
            placeholder={isActiveBulletList ? '' : this.props.placeholder}
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
          />
        </div>
        <MentionSuggestions
          onSearchChange={this.onSearchMentionChange}
          onAddMention={this.onAddMention}
          suggestions={this.state.suggestions}
          entryComponent={Entry}
        />
        <input
          id="fileUpload"
          type="file"
          ref={this.upload}
          onChange={this.onChangeFile}
          style={{display: 'none'}}
          accept="image/*, application/pdf"
        />
      </EditorContainer>
    );
  }
}

export default compose<React.ComponentClass<IProps>>(
  connect(),
  withData<IProps>({
    users: {
      fetch: (name: string) => UserService.searchUsers({name})
    }
  })
)(TextEditor);

export const InternalTextEditor = TextEditor;
