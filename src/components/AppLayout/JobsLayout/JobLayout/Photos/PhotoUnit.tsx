import * as React from 'react';
import {IPhoto} from 'src/models/IPhoto';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import Icon, {IconName} from 'src/components/Icon/Icon';
import {debounce} from 'lodash';
import {connect} from 'react-redux';
import {setSelectedPhotos} from 'src/redux/currentJob/currentJobPhotosDucks';
import {ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import PhotoService from 'src/services/PhotoService';
import {imageTypes} from './JobPhotos';
import withoutProps from 'src/components/withoutProps/withoutProps';

interface IProps {
  photo: IPhoto;
  selected: boolean;
  noUpdate: boolean;
  onExpand: (photoId: number) => void;
  onDescriptionChange: (str: string, photoId: number) => Promise<any>;
  onPhotoUpdate: (fd: FormData, photoId: number) => Promise<any>;
}

interface IConnectProps {
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  description: string;
  thumbnailUrl: string;
  loading: boolean;
}

const PhotoBox = styled.div`
  width: 230px;
  margin: 0 20px 20px 0;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
  box-shadow: 0 0 0 1px ${ColorPalette.gray2};
  cursor: pointer;

  :hover {
    background: ${ColorPalette.blue0};

    & .tools {
      visibility: visible !important;
    }
  }
`;

const PhotoCover = styled.div<{
  backgroundImage: string | undefined;
}>`
  background-size: cover;
  background-position: center;
  background-color: ${ColorPalette.gray0};
  background-image: url(${props => props.backgroundImage || '***'});
  width: 100%;
  height: 150px;
`;

const PhotoDescription = styled(withoutProps(['selected'])('input'))<{
  selected: boolean;
}>`
  padding: 10px;
  border: 0;
  width: 100%;
  font-weight: ${Typography.weight.medium};
  font-size: ${Typography.size.smaller};
  outline: none;
  background: ${props => (props.selected ? ColorPalette.blue0 : 'transparent')};
  color: ${props => (props.selected ? ColorPalette.black1 : ColorPalette.gray5)};
`;

const ToolsHolder = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  visibility: hidden;

  > * {
    margin-left: 5px;
  }
`;

const ToolsButton = styled(withoutProps(['br', 'color'])('div'))<{
  bg: string;
  color: string;
}>`
  height: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 100px;
  background: ${props => props.bg};
  z-index: 5;
  color: ${props => (props.color ? props.color : ColorPalette.white)};

  path,
  circle,
  line {
    stroke: ${props => (props.color ? props.color : ColorPalette.white)};
  }

  * {
    stroke-width: 2.5px !important;
  }
`;

const UpdateSpan = styled.span`
  margin: 0 5px;
  font-size: ${Typography.size.smaller};
`;

class PhotoUnit extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    description: this.props.photo.description,
    thumbnailUrl: '***',
    loading: false
  };

  private counter = 0;

  public componentDidMount() {
    const {
      photo: {thumbnails}
    } = this.props;

    if (!(thumbnails && thumbnails[0] && thumbnails[0].url)) {
      this.startUpdate();
    }
  }

  private startUpdate = async () => {
    this.setState({loading: true});
    const photo = await PhotoService.getPhotoInfo(this.props.photo.id);
    this.setState({loading: false});

    if (photo.data && photo.data.thumbnails && photo.data.thumbnails[0]) {
      this.setState({thumbnailUrl: photo.data.thumbnails[0].url});
    } else {
      if (this.counter < 2) {
        this.counter++;
        setTimeout(this.startUpdate, 4000);
      }
    }
  };

  private onDescriptionChangeInternal = (e: any) => {
    this.setState({description: e.target.value});
    this.debouncedDescriptionChange(e.target.value);
  };

  private debouncedDescriptionChange = debounce((str: string) => {
    const {
      onDescriptionChange,
      photo: {id}
    } = this.props;

    this.setState({loading: true});
    onDescriptionChange(str, id).finally(() => {
      this.setState({loading: false});
    });
  }, 1500);

  private uploadPhoto = (file: File) => {
    const {
      photo: {id},
      onPhotoUpdate
    } = this.props;
    const fd = new FormData();

    fd.append('file', file);

    onPhotoUpdate(fd, id).finally(() => {
      this.setState({loading: false});
    });
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
      this.uploadPhoto(e.target.files[0]);
    }
  };

  public render() {
    const {
      photo: {thumbnails, id},
      onExpand,
      photo,
      selected,
      dispatch,
      noUpdate
    } = this.props;
    const {description, loading, thumbnailUrl} = this.state;

    return (
      <PhotoBox>
        <ToolsHolder className="tools">
          <ToolsButton bg={ColorPalette.gray1} color={ColorPalette.black0} onClick={() => onExpand(id)}>
            <Icon name={IconName.Expand} size={10} />
          </ToolsButton>
          {!noUpdate && (
            <ToolsButton bg={ColorPalette.blue5} color={ColorPalette.white} onClick={this.onUploadLinkClick}>
              <UpdateSpan>Update</UpdateSpan>
            </ToolsButton>
          )}
        </ToolsHolder>
        <PhotoCover
          backgroundImage={(thumbnails && thumbnails[0] && thumbnails[0].url) || thumbnailUrl}
          onClick={!noUpdate ? () => dispatch(setSelectedPhotos(photo)) : undefined}
        />
        <PhotoDescription
          type="text"
          onChange={this.onDescriptionChangeInternal}
          value={description}
          selected={selected}
          disabled={noUpdate}
          placeholder={!noUpdate ? 'Enter a short description...' : 'Editing is disabled'}
        />
        {loading && <BlockLoading size={40} color={ColorPalette.white} />}
        <input
          type="file"
          accept={imageTypes}
          hidden={true}
          disabled={noUpdate}
          onChange={this.onFileInputChange}
          ref={this.inputRef}
        />
      </PhotoBox>
    );
  }
}

export default connect()(PhotoUnit);
