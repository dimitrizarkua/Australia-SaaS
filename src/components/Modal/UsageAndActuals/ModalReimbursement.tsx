import {IModal} from 'src/models/IModal';
import * as React from 'react';
import Modal from 'src/components/Modal/Modal';
import ModalWindow from 'src/components/Modal/ModalWindow';
import PrimaryButton from 'src/components/Buttons/PrimaryButton';
import {Field, reduxForm, InjectedFormProps, formValues} from 'redux-form';
import DateTime from 'src/components/Form/DateTime';
import {required} from 'src/services/ValidationService';
import {formatPrice, getUserNames} from 'src/utility/Helpers';
import Input from 'src/components/Form/Input';
import {compose} from 'redux';
import TextArea from 'src/components/Form/TextArea';
import Checkbox from 'src/components/Form/Checkbox';
import {Moment} from 'moment';
import {ColoredDiv, Link} from 'src/components/Layout/Common/StyledComponents';
import {CheckboxDirection} from 'src/components/Form/CheckboxSimple';
import {imageTypes} from 'src/components/AppLayout/JobsLayout/JobLayout/Photos/JobPhotos';
import DocumentsService from 'src/services/DocumentsService';
import {IDocument} from 'src/models/IDocument';
import BlockLoading from 'src/components/Layout/Common/BlockLoading';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import SelectAsync from 'src/components/Form/SelectAsync';
import {IUser} from 'src/models/IUser';
import UserService from 'src/services/UserService';
import debounce from 'debounce-promise';

export interface IFormValues {
  user: IUser;
  date_of_expense: Moment;
  document_id: number;
  description: string;
  total_amount: number;
  is_chargeable: boolean;
}

interface IOwnProps {
  onSubmit: (data: IFormValues) => any;
  isEdit: boolean;
}

interface IInjectedFormValues {
  totalAmount: number;
  docId?: number;
}

type IProps = IModal & IOwnProps;

interface IState {
  fileLoading: boolean;
  file?: IDocument;
}

const formName = 'ModalReimbursementForm';

class ModalReimbursement extends React.PureComponent<
  InjectedFormProps<IFormValues, IProps> & IProps & IInjectedFormValues,
  IState
> {
  public state = {
    fileLoading: false,
    file: undefined
  };

  public async componentDidMount() {
    const {docId} = this.props;

    if (docId) {
      this.setState({fileLoading: true});

      const {data} = await DocumentsService.getDocumentInfo(docId);

      this.setState({fileLoading: false, file: data});
    }
  }

  private onSubmit = async (data: IFormValues) => {
    const {onSubmit, onClose} = this.props;

    try {
      await onSubmit(data);
      onClose();
    } catch (e) {
      //
    }
  };

  private inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  private onUploadLinkClick = () => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  };

  private onFileInputChange = async (e: any) => {
    if (e.target.files.length > 0) {
      this.setState({fileLoading: true});

      const {data} = await DocumentsService.postDocument(e.target.files[0]);

      this.setState({file: data, fileLoading: false});
      this.props.change('document_id', data.id);
    }
  };

  private loadUsers = async (search: string) => {
    const res = await UserService.searchUsers({name: search});
    return res.data;
  };

  private debouncedUserLoad = debounce(this.loadUsers, 1000);

  private getRecipientOptionLabel = (user: IUser) => getUserNames(user).name;

  private getRecipientOptionValue = (user: IUser) => user.id;

  private renderBody = () => {
    const {handleSubmit, totalAmount, isEdit} = this.props;
    const {file, fileLoading} = this.state;

    return (
      <form id={formName} onSubmit={handleSubmit(this.onSubmit)} autoComplete="off">
        <div className="row">
          <div className="col-4">
            <Field
              name="user"
              label="Recipient"
              component={SelectAsync}
              loadOptions={this.debouncedUserLoad}
              getOptionLabel={this.getRecipientOptionLabel}
              getOptionValue={this.getRecipientOptionValue}
              validate={required}
              isClearable={true}
              placeholder="Start typing to search..."
              disabled={isEdit}
            />
          </div>
          <div className="col-4">
            <Field name="date_of_expense" label="Date of Expense" component={DateTime} validate={required} />
          </div>
          <div className="col-4">
            <Field
              name="total_amount"
              label={`Total Amount: ${formatPrice(totalAmount || 0)}`}
              component={Input}
              type="number"
              validate={required}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Field name="description" label="Description" component={TextArea} validate={required} />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Field
              name="is_chargeable"
              label="Chargeable"
              component={Checkbox}
              direction={CheckboxDirection.horizontal}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-auto">
            {fileLoading && <BlockLoading size={16} color={ColorPalette.white} />}
            {file ? (
              <ColoredDiv
                onClick={this.onUploadLinkClick}
                fontSize={Typography.size.smaller}
                color={ColorPalette.blue4}
                style={{cursor: 'pointer'}}
              >
                {(file as IDocument).file_name}
              </ColoredDiv>
            ) : (
              <Link noDecoration={true} onClick={this.onUploadLinkClick}>
                Add file
              </Link>
            )}
          </div>
        </div>
        <input
          type="file"
          accept={imageTypes}
          multiple={true}
          hidden={true}
          onChange={this.onFileInputChange}
          ref={this.inputRef}
        />
      </form>
    );
  };

  private renderFooter = () => {
    const {invalid, docId} = this.props;

    return (
      <PrimaryButton className="btn" type="submit" disabled={invalid || !docId} form={formName}>
        Save
      </PrimaryButton>
    );
  };

  public render() {
    const {isOpen, title, onClose, submitting} = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalWindow
          onClose={onClose}
          loading={submitting}
          title={title || ''}
          body={this.renderBody()}
          footer={this.renderFooter()}
        />
      </Modal>
    );
  }
}

export default compose<React.ComponentClass<IProps & Partial<InjectedFormProps<{}>>>>(
  reduxForm<IFormValues, IProps>({
    form: formName
  }),
  formValues({totalAmount: 'total_amount', docId: 'document_id'})
)(ModalReimbursement);
