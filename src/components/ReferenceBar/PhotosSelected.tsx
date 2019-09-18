import * as React from 'react';
import styled from 'styled-components';
import Typography from 'src/constants/Typography';
import ColorPalette from 'src/constants/ColorPalette';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import PhotoService from 'src/services/PhotoService';
import {IJob} from 'src/models/IJob';
import moment from 'moment';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import JobService from 'src/services/JobService';
import {connect} from 'react-redux';
import {IAppState} from 'src/redux';
import {ICurrentJobPhotos, loadCurrentJobPhotos, resetSelectedPhotos} from 'src/redux/currentJob/currentJobPhotosDucks';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {openModal} from 'src/redux/modalDucks';

interface IProps {
  job: IJob;
}

interface IConnectProps {
  currentJobPhotos: ICurrentJobPhotos;
  dispatch: ThunkDispatch<any, any, Action>;
}

interface IState {
  loading: boolean;
}

const Wrapper = styled.div`
  padding: 15px;
  position: fixed;
  margin-top: 60px;
`;

const Title = styled.div`
  font-size: ${Typography.size.medium};
  font-weight: ${Typography.weight.medium};
`;

const Gray = styled.div`
  color: ${ColorPalette.gray4};
  margin-bottom: 30px;
`;

const Remove = styled.div`
  color: ${ColorPalette.blue4};
  cursor: pointer;
  margin-top: 10px;
  display: inline-block;

  :hover {
    text-decoration: underline;
    color: ${ColorPalette.blue5};
  }
`;

class PhotosSelected extends React.PureComponent<IProps & IConnectProps, IState> {
  public state = {
    loading: false
  };

  private downloadPhotos = () => {
    const {
      currentJobPhotos: {selectedPhotos},
      job,
      dispatch
    } = this.props;

    if (selectedPhotos.length > 0) {
      const promises = [];

      this.setState({loading: true});

      for (const photo of selectedPhotos) {
        promises.push(
          PhotoService.downloadPhoto(
            photo.id,
            `${job.id}_${photo.description.split(' ').join('_')}_${moment(photo.updated_at).format('YYYYMMDD')}.${
              photo.mime_type.split('/')[1]
            }`
          )
        );
      }

      Promise.all(promises)
        .then(() => {
          dispatch(resetSelectedPhotos());
          this.setState({loading: false});
        })
        .catch(() => {
          this.setState({loading: false});
        });
    }
  };

  private detachPhotos = async () => {
    const {
      currentJobPhotos: {selectedPhotos},
      job,
      dispatch
    } = this.props;

    const res = await dispatch(
      openModal(
        'Confirm',
        `Do you really want to delete ${selectedPhotos.length > 1 ? 'these photos' : 'this photo'} from this job?`
      )
    );

    if (res) {
      const promises = [];

      this.setState({loading: true});

      for (const photo of selectedPhotos) {
        promises.push(JobService.detachPhoto(job.id, photo.id));
      }

      Promise.all(promises)
        .then(() => {
          dispatch(loadCurrentJobPhotos(job.id));
          dispatch(resetSelectedPhotos());
          this.setState({loading: false});
        })
        .catch(() => {
          this.setState({loading: false});
        });
    }
  };

  public render() {
    const {
      currentJobPhotos: {selectedPhotos}
    } = this.props;
    const {loading} = this.state;

    return (
      <Wrapper>
        <Title>Manage Photos</Title>
        <Gray>
          {selectedPhotos.length} {selectedPhotos.length > 1 ? 'items' : 'item'} selected
        </Gray>
        <PrimaryButton className="btn" onClick={this.downloadPhotos}>
          Download
        </PrimaryButton>
        <br />
        <Remove
          onClick={() => {
            this.detachPhotos();
          }}
        >
          Delete
        </Remove>
        {loading && <BlockLoading size={40} color={ColorPalette.gray1} />}
      </Wrapper>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  currentJobPhotos: state.currentJobPhotos
});

export default connect(mapStateToProps)(PhotosSelected);
