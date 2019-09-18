import * as React from 'react';
import ReactModal from 'react-modal';

interface IProps {
  isOpen: boolean;
}

const style = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 1999
  },
  content: {
    width: '100%',
    height: '100%',
    background: 'transparent',
    position: 'absolute',
    borderRadius: '3px',
    border: 0,
    overflow: 'auto',
    top: 0,
    bottom: 'inherit',
    left: 0,
    right: 'inherit',
    padding: 0
  }
};

class Modal extends React.PureComponent<IProps> {
  public render() {
    const {isOpen} = this.props;

    return (
      <ReactModal
        isOpen={isOpen}
        appElement={document.getElementById('root') as HTMLElement}
        ariaHideApp={false}
        style={style}
      >
        {this.props.children}
      </ReactModal>
    );
  }
}

export default Modal;
