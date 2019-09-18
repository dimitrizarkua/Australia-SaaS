import * as React from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';
import JobService from 'src/services/JobService';
import {IAppState} from 'src/redux';
import {ICurrentJob} from 'src/redux/currentJob/currentJobDucks';
import PhotoUnit from './PhotoUnit';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import PhotoService from 'src/services/PhotoService';
import {IObjectEnvelope} from 'src/models/IEnvelope';
import {IPhoto} from 'src/models/IPhoto';
import moment from 'moment';
import Typography from 'src/constants/Typography';
import ModalFilmstrip from 'src/components/Modal/Jobs/ModalFilmstrip';
import {ICurrentJobPhotos, loadCurrentJobPhotos, resetJobPhotos} from 'src/redux/currentJob/currentJobPhotosDucks';
import {Action, compose} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import StyledComponents from 'src/components/Layout/Common/StyledComponents';
import {ISortedItem, sortedByDateGroups} from 'src/utility/Helpers';
import Icon, {IconName} from 'src/components/Icon/Icon';
import Notify, {NotifyType} from 'src/utility/Notify';
import {RouteComponentProps, RouteProps, withRouter} from 'react-router';

interface IConnectProps {
  currentJob: ICurrentJob;
  currentJobPhotos: ICurrentJobPhotos;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IParams {
  id: string;
}

interface IState {
  loading: boolean;
  filmstrip: boolean;
  currentPhotoId: number | undefined;
  blockLoading: boolean;
}

type IProps = IConnectProps & RouteComponentProps<IParams>;

export const imageTypes = 'image/jpeg,image/png';

const Wrapper = styled.div`
  padding: 40px 30px 30px 30px;
  display: flex;
  flex-grow: 1;
  position: relative;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
`;

const WrapperInternal = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  margin: 10px 0 40px 0;
`;

const Title = StyledComponents.SortedGroupTitle;

const Bold = styled.div`
  font-weight: ${Typography.weight.bold};
`;

const Link = styled.span`
  color: ${ColorPalette.blue4};
  cursor: pointer;

  :hover {
    text-decoration: underline;
    color: ${ColorPalette.blue5};
  }
`;

const IconHolder = styled.div`
  color: transparent;
  filter: grayscale(1);
`;

const AddNewPhotos = styled.div`
  position: absolute;
  top: 20px;
  right: 30px;
  display: inline-block;
  color: ${ColorPalette.blue4};
  cursor: pointer;
  font-size: ${Typography.size.smaller};

  :hover {
    color: ${ColorPalette.blue5};
    text-decoration: underline;
  }
`;

class JobPhotos extends React.PureComponent<IProps, IState> {
  public state = {
    loading: false,
    filmstrip: false,
    currentPhotoId: undefined,
    blockLoading: false
  };

  public componentDidMount() {
    this.loadPhotos();
  }

  public componentWillUnmount() {
    this.props.dispatch(resetJobPhotos());
  }

  private loadPhotos = () => {
    const {match, dispatch} = this.props;

    return dispatch(loadCurrentJobPhotos(match.params.id));
  };

  private handleDrop = (e: any) => {
    const {
      currentJob: {data: dt}
    } = this.props;
    const editForbidden = dt && dt.edit_forbidden;
    e.preventDefault();

    if (!editForbidden && e.dataTransfer.files.length > 0) {
      this.setState({loading: true});
      this.uploadPhotos(e.dataTransfer.files);
    }
  };

  private uploadPhotos = (files: File[]) => {
    const {match} = this.props;
    const promises = [];
    const types = ['png', 'jpeg', 'jpg'];

    for (const file of files) {
      const type = (file.name.split('.').pop() || '').toLowerCase();
      if (types.includes(type)) {
        const fd = new FormData();
        fd.append('file', file);
        promises.push(
          PhotoService.uploadPhoto(fd).then((response: IObjectEnvelope<IPhoto>) => {
            return JobService.attachPhoto(match.params.id, response.data.id, {description: ''});
          })
        );
      } else {
        Notify(
          NotifyType.Warning,
          <>
            Type <strong>.{type}</strong> is not supported!
          </>
        );
      }
    }

    if (promises.length === 0) {
      this.setState({loading: false});
    } else {
      Promise.all(promises)
        .then(() => {
          setTimeout(() => {
            this.loadPhotos();
            this.setState({loading: false});
          }, 500);
        })
        .catch(() => {
          this.setState({loading: false});
        });
    }
  };

  private onDragOver = (e: any) => {
    e.preventDefault();
  };

  private get groupedPhotos(): Array<ISortedItem<IPhoto>> {
    const {
      currentJobPhotos: {data}
    } = this.props;

    if (data) {
      return sortedByDateGroups<IPhoto>(data.data, 'created_at');
    } else {
      return [];
    }
  }

  private get sortedPhotos(): IPhoto[] {
    const photos = this.props.currentJobPhotos.data;
    if (photos) {
      return photos.data.sort((a: IPhoto, b: IPhoto) => (moment(a.created_at) > moment(b.created_at) ? -1 : 1));
    }
    return [];
  }

  private changeDescription = (str: string, id: number) => {
    const {match} = this.props;

    return JobService.updateAttachedPhoto(match.params.id, id, {description: str});
  };

  private onPhotoUpdate = (fd: FormData, id: number) => {
    return PhotoService.updatePhoto(id, fd).then(() => {
      this.setState({blockLoading: true});
      return this.loadPhotos()
        .then(() => {
          this.setState({blockLoading: false});
        })
        .catch(() => {
          this.setState({blockLoading: false});
        });
    });
  };

  private openFilmstrip = (currentPhotoId: number) => {
    this.setState({currentPhotoId, filmstrip: true});
  };

  private closeFilmstrip = () => {
    this.setState({filmstrip: false});
  };

  private inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  private onUploadLinkClick = () => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  };

  private onFileInputChange = (e: any) => {
    if (e.target.files.length > 0) {
      this.setState({loading: true});
      this.uploadPhotos(e.target.files);
    }
  };

  public render() {
    const {
      currentJobPhotos: {loading, data, selectedPhotos},
      currentJob: {data: dt}
    } = this.props;
    const {loading: ld, filmstrip, currentPhotoId, blockLoading} = this.state;
    const editForbidden = dt && dt.edit_forbidden;
    const sortedPhotosGroups = this.groupedPhotos;

    return (
      <Wrapper onDragOver={this.onDragOver} onDrop={this.handleDrop}>
        {data && dt && (
          <>
            {sortedPhotosGroups.length > 0 ? (
              <>
                {!editForbidden && <AddNewPhotos onClick={this.onUploadLinkClick}>Add photos</AddNewPhotos>}
                {sortedPhotosGroups.map((section, index) => (
                  <div key={index} style={{width: '100%'}}>
                    <Title>{moment(section.unix * 1000).format('ddd, D MMM YYYY')}</Title>
                    <WrapperInternal>
                      {section.items.map((photo: IPhoto) => (
                        <PhotoUnit
                          key={photo.id}
                          photo={photo}
                          selected={!!selectedPhotos.find(el => el.id === photo.id)}
                          noUpdate={!!editForbidden}
                          onExpand={this.openFilmstrip}
                          onDescriptionChange={this.changeDescription}
                          onPhotoUpdate={this.onPhotoUpdate}
                        />
                      ))}
                    </WrapperInternal>
                  </div>
                ))}
              </>
            ) : (
              <>
                <IconHolder className="w-100 d-flex justify-content-center">
                  <Icon name={IconName.Barista} size={200} />
                </IconHolder>
                <div className="w-100 d-flex justify-content-center">
                  <Bold>No photos have been uploaded</Bold>
                </div>
                {!editForbidden && (
                  <div className="w-100 d-flex justify-content-center">
                    <div style={{textAlign: 'center'}}>
                      Drag and drop to add photos or <Link onClick={this.onUploadLinkClick}>click here</Link> to <br />{' '}
                      upload the old fashioned way.
                    </div>
                  </div>
                )}
              </>
            )}
            {currentPhotoId && (
              <ModalFilmstrip
                isOpen={filmstrip}
                job={dt}
                customModal={true}
                noUpdate={!!editForbidden}
                photos={this.sortedPhotos}
                currentPhotoId={currentPhotoId || 0}
                updateParentPhotos={this.loadPhotos}
                onClose={this.closeFilmstrip}
              />
            )}
          </>
        )}
        {(loading || ld) && !blockLoading && <BlockLoading size={40} color={ColorPalette.white} />}
        <input
          type="file"
          accept={imageTypes}
          multiple={true}
          hidden={true}
          onChange={this.onFileInputChange}
          ref={this.inputRef}
        />
      </Wrapper>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  currentJob: state.currentJob,
  currentJobPhotos: state.currentJobPhotos
});

export default compose<React.ComponentClass<RouteProps>>(
  connect(mapStateToProps),
  withRouter
)(JobPhotos);
