import * as React from 'react';
import styled from 'styled-components';
import {IModalWindowBaseProps} from 'src/models/IModal';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import {ModalStyles} from './ModalStyles';

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: calc(100% - ${ModalStyles.marginVerticalOffset * 2}px);
  display: flex;
  margin: ${ModalStyles.marginVerticalOffset}px 0px;
`;

const GoBack = styled.div`
  position: absolute;
  top: -${ModalStyles.marginVerticalOffset}px;
  height: calc(100% + ${ModalStyles.marginVerticalOffset * 2}px);
  width: 100%;
`;

const ModalWindowBox = styled.div`
  max-width: 700px;
  min-width: 500px;
  width: 100%;
  background: white;
  margin: auto auto;
  position: relative;
  z-index: 1;
  border-radius: 3px;

  > .cover-loading {
    border-radius: 3px;
  }
`;

const ModalWindowHeader = styled.div`
  padding: 20px ${ModalStyles.horizontalPadding}px;
  font-size: ${Typography.size.medium};
  font-weight: ${Typography.weight.bold};
`;

export const ModalWindowBodyMinHeight = 400;
export const ModalWindowBody = styled.div`
  padding: 30px ${ModalStyles.horizontalPadding}px;
  min-height: ${ModalStyles.bodyMinHeight}px;
  border-top: 1px solid ${ColorPalette.gray2};
  position: relative;
`;

export const ModalWindowFooter = styled.div`
  padding: 20px ${ModalStyles.horizontalPadding}px;
  border-top: 1px solid ${ColorPalette.gray2};
  display: flex;
  justify-content: flex-end;
  align-items: center;

  & > * {
    margin-left: 10px;
  }
`;

const CloseButton = styled.button`
  border: 1px solid ${ColorPalette.gray2};
`;

class ModalWindow extends React.PureComponent<IModalWindowBaseProps> {
  public render() {
    const {title, body, footer, onClose, loading, customModal, closeCaption} = this.props;

    return (
      <ModalContainer>
        <GoBack onClick={onClose} />
        {!customModal && (
          <ModalWindowBox>
            {loading && <BlockLoading size={40} color={ColorPalette.white} zIndex={10} />}
            <ModalWindowHeader>{title}</ModalWindowHeader>
            {body && <ModalWindowBody>{body}</ModalWindowBody>}
            <ModalWindowFooter>
              {footer}
              <CloseButton className="btn btn-outline-secondary" onClick={onClose}>
                {closeCaption || 'Cancel'}
              </CloseButton>
            </ModalWindowFooter>
          </ModalWindowBox>
        )}
        {this.props.children}
      </ModalContainer>
    );
  }
}

export default ModalWindow;
