import * as React from 'react';
import {IModal} from 'src/models/IModal';
import Modal from '../Modal';
import ModalWindow from '../ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';

interface IProps {
  onResolve?: () => void;
  onReject?: () => void;
  title?: string;
  body?: React.ReactElement<unknown> | string;
  hash?: string;
}

class Confirm extends React.PureComponent<IModal & IProps> {
  private onClose = () => {
    const {onClose, onReject, hash} = this.props;

    if (onReject) {
      onReject();
    }

    const event = new CustomEvent(`modal-confirm-${hash || ''}`, {detail: false});
    window.dispatchEvent(event);

    onClose();
  };

  private onSuccess = () => {
    const {onClose, onResolve, hash} = this.props;

    if (onResolve) {
      onResolve();
    }

    const event = new CustomEvent(`modal-confirm-${hash || ''}`, {detail: true});
    window.dispatchEvent(event);

    onClose();
  };

  private renderFooter() {
    return (
      <PrimaryButton className="btn btn-primary" onClick={this.onSuccess}>
        Confirm
      </PrimaryButton>
    );
  }

  public render() {
    const {isOpen, title, body} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow onClose={this.onClose} footer={this.renderFooter()} body={body} title={title || ''} />
      </Modal>
    );
  }
}

export default Confirm;
