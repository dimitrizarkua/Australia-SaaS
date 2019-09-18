import * as React from 'react';
import {IModal} from 'src/models/IModal';
import {INote} from 'src/models/INotesAndMessages';
import ModalWindow from 'src/components/Modal/ModalWindow';
import Modal from 'src/components/Modal/Modal';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import ColorPalette from 'src/constants/ColorPalette';
import {connect} from 'react-redux';
import NoteComponent from 'src/components/TextEditor/NoteComponent';

interface IInputProps {
  note: INote;
  afterSuccess?: () => any;
  disableTemplatesControl?: boolean;
}

interface IState {
  loading: boolean;
  saving: boolean;
}

class ModalNoteEdit extends React.PureComponent<IModal & IInputProps, IState> {
  public state = {
    loading: false,
    saving: false
  };

  private saveNoteDraft = async () => {
    const {onClose, afterSuccess} = this.props;

    try {
      if (afterSuccess) {
        afterSuccess();
      }

      setTimeout(() => {
        onClose();
      });
    } finally {
      this.setState({loading: false});
    }
  };

  private startToSave = () => {
    this.setState({loading: true, saving: true});
  };

  private renderBody = () => {
    const {note, disableTemplatesControl} = this.props;
    const {saving} = this.state;

    return (
      <NoteComponent
        afterSave={this.saveNoteDraft}
        note={note}
        color={ColorPalette.orange0}
        placeholder="Write your note here..."
        hideBottom={true}
        disableTemplatesControl={disableTemplatesControl}
        edit={true}
        triggerToSave={saving}
        initValue={note.note_resolved}
      />
    );
  };

  private renderFooter() {
    return (
      <PrimaryButton className="btn btn-primary" onClick={this.startToSave}>
        Save
      </PrimaryButton>
    );
  }

  public render() {
    const {isOpen, onClose} = this.props;
    const {loading} = this.state;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          loading={loading}
          footer={this.renderFooter()}
          body={this.renderBody()}
          title="Edit Note"
        />
      </Modal>
    );
  }
}

export default connect()(ModalNoteEdit);
