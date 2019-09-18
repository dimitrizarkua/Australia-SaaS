import * as React from 'react';
import {WrappedFieldProps} from 'redux-form';
import TextEditor from '../TextEditor/TextEditor';

export interface IProps {
  color: string;
  placeholder?: string;
  onCancel?: () => void;
  onSave?: () => void;
  postDocument: (files?: Blob[] | FileList | null) => void;
  disableAttachments?: boolean;
  disableMentionControl?: boolean;
  disableTemplatesControl?: boolean;
}

class TextEditorField extends React.PureComponent<IProps & WrappedFieldProps> {
  public render() {
    const {disableAttachments, disableMentionControl, disableTemplatesControl} = this.props;

    return (
      <TextEditor
        color={this.props.color}
        postDocument={this.props.postDocument}
        onChange={this.props.input.onChange}
        value={this.props.input.value}
        placeholder={this.props.placeholder}
        onCancel={this.props.onCancel}
        onSave={this.props.onSave}
        disableAttachments={disableAttachments}
        disableMentionControl={disableMentionControl}
        disableTemplatesControl={disableTemplatesControl}
      />
    );
  }
}

export default TextEditorField;
