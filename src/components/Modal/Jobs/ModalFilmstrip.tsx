import * as React from 'react';
import {IModal} from 'src/models/IModal';
import Modal from '../Modal';
import ModalWindow from '../ModalWindow';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import {IPhoto} from 'src/models/IPhoto';
import moment from 'moment';
import {IJob} from 'src/models/IJob';
import {ModalStyles} from '../ModalStyles';
import Icon, {IconName} from 'src/components/Icon/Icon';
import PhotoService from 'src/services/PhotoService';
import printJS from 'print-js';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import JobService from 'src/services/JobService';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {openModal} from 'src/redux/modalDucks';
import withoutProps from 'src/components/withoutProps/withoutProps';
import {getUserNames} from 'src/utility/Helpers';
import {FRONTEND_DATE_TIME} from 'src/constants/Date';

interface IProps {
  photos: IPhoto[];
  currentPhotoId: number;
  job: IJob;
  updateParentPhotos: () => void;
  noUpdate: boolean;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  currentIndex: number;
  zoom: number;
  rotateDegrees: number;
  bottomToolsLoading: boolean;
}

const FilmstripHolder = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
`;

const TopNav = styled.div`
  position: relative;
  top: 0px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: ${ModalStyles.marginVerticalOffset}px;
  padding: 0 30px;
  background: ${ColorPalette.white};
  text-align: right;
  z-index: 100;
  border-bottom: 1px solid ${ColorPalette.gray2};
`;

const GrayNote = styled.div`
  color: ${ColorPalette.gray5};
`;

const ImageContainer = styled.div`
  height: 100%;
  overflow: auto;
  position: relative;
`;

const ImageContainerInternal = styled.div`
  display: flex;
  min-height: 100%;
  width: 100%;
  position: relative;
  padding: 20px 0 90px 0;
`;

const Closer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

const ImageWrapper = styled.div<{
  width: number;
  height: number;
}>`
  position: relative;
  z-index: 2;
  margin: auto;
  transition: 0.3s;
  width: ${props => (props.width ? props.width : 0)}px;
  height: ${props => (props.height ? props.height : 0)}px;

  > img {
    width: 100%;
    height: 100%;
  }
`;

const BottomToolsHolder = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 0;
  display: flex;
  justify-content: center;
  z-index: 100;
`;

const BottomTools = styled.div`
  height: 50px;
  padding: 20px;
  background: ${ColorPalette.menu};
  color: ${ColorPalette.white};
  border-radius: 6px;
  display: flex;
  align-items: center;
  bottom: 20px;
  position: absolute;
  overflow: hidden;
`;

const CustomIcon = styled(withoutProps(['color', 'rotate'])(Icon))<{
  color: string;
  rotate: number;
}>`
  transform: rotate(${props => props.rotate}deg);
  cursor: pointer;
  path,
  circle,
  line,
  polyline,
  polygon,
  rect {
    stroke: ${props => (props.color ? props.color : ColorPalette.black1)};
  }

  :hover path,
  :hover line,
  :hover circle,
  :hover polygon,
  :hover rect,
  :hover polyline {
    stroke: ${ColorPalette.blue4};
  }
`;

class ModalFilmstrip extends React.PureComponent<IModal & IProps & IConnectProps, IState> {
  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    const {currentPhotoId, photos, onClose} = this.props;

    if (currentPhotoId !== prevProps.currentPhotoId || photos.length !== prevProps.photos.length) {
      this.setState({
        currentIndex: this.getCurrentPhotoIndex(),
        zoom: 1,
        rotateDegrees: 0,
        bottomToolsLoading: false
      });
    }

    if (this.state.currentIndex !== prevState.currentIndex) {
      this.setState({
        zoom: 1,
        rotateDegrees: 0,
        bottomToolsLoading: false
      });
    }

    if (photos.length < 1) {
      onClose();
    }
  }

  public getCurrentPhotoIndex = (): number => {
    const {photos, currentPhotoId} = this.props;
    const index = photos.map(el => el.id).indexOf(currentPhotoId);

    return index > -1 ? index : 0;
  };

  public state = {
    currentIndex: this.getCurrentPhotoIndex(),
    zoom: 1,
    rotateDegrees: 0,
    bottomToolsLoading: false
  };

  private zoomDelta = 0.2;

  private setZoom = (type: '+' | '-') => {
    if (type === '+') {
      this.setState({zoom: this.state.zoom + this.zoomDelta});
    }

    if (type === '-') {
      if (this.state.zoom > this.zoomDelta * 1.1) {
        this.setState({zoom: this.state.zoom - this.zoomDelta});
      }
    }
  };

  private setPhoto = (type: '+' | '-') => {
    const {photos} = this.props;

    if (type === '+') {
      if (this.state.currentIndex < photos.length - 1) {
        this.setState({currentIndex: this.state.currentIndex + 1});
      }
    }

    if (type === '-') {
      if (this.state.currentIndex > 0) {
        this.setState({currentIndex: this.state.currentIndex - 1});
      }
    }
  };

  private rotateImage = () => {
    this.setState({rotateDegrees: this.state.rotateDegrees + 1});
  };

  private downloadPhoto = () => {
    const {job, photos} = this.props;
    const photo = photos[this.state.currentIndex];

    this.setState({bottomToolsLoading: true});

    PhotoService.downloadPhoto(
      photo.id,
      `${job.id}_${photo.description.split(' ').join('_')}_${moment(photo.updated_at).format('YYYYMMDD')}.${
        photo.mime_type.split('/')[1]
      }`
    )
      .then(() => {
        this.setState({bottomToolsLoading: false});
      })
      .catch(() => {
        this.setState({bottomToolsLoading: false});
      });
  };

  private printPhoto = () => {
    const {photos} = this.props;
    const photo = photos[this.state.currentIndex];

    this.setState({bottomToolsLoading: true});

    PhotoService.getPhotoData(photo.id)
      .then(response => {
        printJS({printable: window.URL.createObjectURL(response), type: 'image'});
        this.setState({bottomToolsLoading: false});
      })
      .catch(() => {
        this.setState({bottomToolsLoading: false});
      });
  };

  private deletePhoto = async () => {
    const {photos, job, updateParentPhotos, dispatch} = this.props;
    const photo = photos[this.state.currentIndex];

    const res = await dispatch(openModal('Confirm', 'Do you really want to delete this photo from this job?'));

    if (res) {
      this.setState({bottomToolsLoading: true});

      try {
        await JobService.detachPhoto(job.id, photo.id);
        await updateParentPhotos();
        this.setState({bottomToolsLoading: false});
      } catch (er) {
        this.setState({bottomToolsLoading: false});
      }
    }
  };

  public render() {
    const {isOpen, onClose, customModal, job, photos, noUpdate} = this.props;
    const {currentIndex, zoom, rotateDegrees, bottomToolsLoading} = this.state;
    const photo = photos[currentIndex];

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow onClose={onClose} customModal={customModal}>
          <FilmstripHolder>
            {photo && (
              <>
                <div>
                  <TopNav className="align-items-center">
                    <div className="d-flex align-items-center">
                      <CustomIcon
                        name={IconName.Chevron}
                        size={20}
                        rotate={45}
                        color={ColorPalette.black1}
                        onClick={onClose}
                      />
                      <span style={{marginLeft: '10px'}}>{photo.description}</span>
                    </div>
                    <div>
                      <div>{JobService.getJobName(job)}</div>
                      <GrayNote>
                        {photo.created_at === photo.updated_at
                          ? `Created ${moment(photo.created_at).format(FRONTEND_DATE_TIME)} by ${
                              getUserNames(photo.creator).name
                            }`
                          : `Modified ${moment(photo.updated_at).format(FRONTEND_DATE_TIME)} ${
                              photo.modified_by ? getUserNames(photo.modified_by).name : ''
                            }`}
                      </GrayNote>
                    </div>
                  </TopNav>
                </div>
                <ImageContainer>
                  <ImageContainerInternal>
                    <Closer onClick={onClose} />
                    <ImageWrapper
                      width={rotateDegrees % 2 > 0 ? photo.height * zoom : photo.width * zoom}
                      key={photo.id}
                      className="d-flex align-items-center justify-content-center"
                      height={rotateDegrees % 2 > 0 ? photo.width * zoom : photo.height * zoom}
                    >
                      <div
                        style={{
                          width: `${rotateDegrees % 2 > 0 ? photo.height * zoom : photo.width * zoom}px`,
                          height: `${rotateDegrees % 2 > 0 ? photo.width * zoom : photo.height * zoom}px`
                        }}
                      />
                      <ImageWrapper
                        width={photo.width * zoom}
                        key={photo.id}
                        height={photo.height * zoom}
                        style={{
                          transform: `rotateZ(${rotateDegrees * -90}deg)`,
                          position: 'absolute'
                        }}
                      >
                        <img key={photo.id} src={photo.url} />
                      </ImageWrapper>
                    </ImageWrapper>
                  </ImageContainerInternal>
                </ImageContainer>
                <BottomToolsHolder>
                  <BottomTools>
                    {bottomToolsLoading && <BlockLoading size={40} color={ColorPalette.menu} />}
                    <div className="d-flex align-items-center">
                      <CustomIcon
                        name={IconName.Chevron}
                        size={20}
                        rotate={45}
                        color={ColorPalette.white}
                        onClick={() => this.setPhoto('-')}
                      />
                      <div style={{margin: '0 10px'}}>
                        {currentIndex + 1} of {photos.length}
                      </div>
                      <CustomIcon
                        name={IconName.Chevron}
                        size={20}
                        rotate={-135}
                        color={ColorPalette.white}
                        onClick={() => this.setPhoto('+')}
                      />
                    </div>
                    <div className="d-flex align-items-center" style={{margin: '0 50px'}}>
                      <CustomIcon
                        name={IconName.SubtractCircle}
                        size={20}
                        rotate={0}
                        color={ColorPalette.white}
                        onClick={() => this.setZoom('-')}
                      />
                      <div style={{margin: '0 15px'}}>{(zoom * 100).toFixed(0)}%</div>
                      <CustomIcon
                        name={IconName.AddCircle}
                        size={20}
                        rotate={0}
                        color={ColorPalette.white}
                        onClick={() => this.setZoom('+')}
                      />
                    </div>
                    <div className="d-flex align-items-center justify-content-between" style={{width: '150px'}}>
                      <CustomIcon
                        name={IconName.Rotate}
                        size={20}
                        rotate={0}
                        color={ColorPalette.white}
                        onClick={this.rotateImage}
                      />
                      <CustomIcon
                        name={IconName.Download}
                        size={20}
                        rotate={0}
                        color={ColorPalette.white}
                        onClick={this.downloadPhoto}
                      />
                      <CustomIcon
                        name={IconName.Printer}
                        size={20}
                        rotate={0}
                        color={ColorPalette.white}
                        onClick={this.printPhoto}
                      />
                      {!noUpdate && (
                        <CustomIcon
                          name={IconName.Remove}
                          size={20}
                          rotate={0}
                          color={ColorPalette.white}
                          onClick={this.deletePhoto}
                        />
                      )}
                    </div>
                  </BottomTools>
                </BottomToolsHolder>
              </>
            )}
          </FilmstripHolder>
        </ModalWindow>
      </Modal>
    );
  }
}

export default connect()(ModalFilmstrip);
