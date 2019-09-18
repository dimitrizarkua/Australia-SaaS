import * as React from 'react';
import DocumentsService from 'src/services/DocumentsService';
import styled from 'styled-components';
import ColorPalette from 'src/constants/ColorPalette';
import Typography from 'src/constants/Typography';
import {IDocument} from 'src/models/IDocument';
import Icon, {IconName} from 'src/components/Icon/Icon';
import withoutProps from 'src/components/withoutProps/withoutProps';

const AttachedFile = styled.div`
  display: flex;
`;

const AttachedFileRemove = styled.div`
  font-size: ${Typography.size.medium};
  color: ${ColorPalette.gray4};
  margin-left: 5px;
  cursor: pointer;
`;

const AttachedFileLink = styled.span`
  display: block;
  cursor: pointer;
  color: ${ColorPalette.blue4};
  &:hover {
    text-decoration: underline;
    color: ${ColorPalette.blue5};
  }
`;

const AttachedFileIcon = styled(withoutProps(['removing'])(Icon))<{removing?: boolean}>`
  margin-right: 2px;
  path {
    stroke: ${props => (props.removing ? ColorPalette.gray4 : ColorPalette.blue4)};
  }
`;

interface IProps {
  documents?: IDocument[] | null;
  onRemove?: (id: number) => any;
}

class AttachedFiles extends React.Component<IProps> {
  private downloadFile = (id: number, fileName: string) => {
    DocumentsService.downloadDocument(id, fileName);
  };

  private removeDocument = (documentId: number) => {
    if (this.props.onRemove) {
      this.props.onRemove(documentId);
    }
  };

  public render() {
    const {documents, onRemove} = this.props;
    if (!documents || documents.length === 0) {
      return null;
    }
    return (
      <>
        {documents.map((doc: IDocument) => {
          return (
            <AttachedFile key={`link-${doc.id}`}>
              <AttachedFileLink onClick={() => this.downloadFile(doc.id, doc.file_name)}>
                <AttachedFileIcon name={IconName.Attachment} size={11} />
                {doc.file_name}
              </AttachedFileLink>
              {onRemove && <AttachedFileRemove onClick={() => this.removeDocument(doc.id)}>&times;</AttachedFileRemove>}
            </AttachedFile>
          );
        })}
      </>
    );
  }
}

export default AttachedFiles;
