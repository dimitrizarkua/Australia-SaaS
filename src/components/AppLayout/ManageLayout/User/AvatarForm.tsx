import React from 'react';
import styled from 'styled-components';
import {useState, useEffect} from 'react';
import ColorPalette from 'src/constants/ColorPalette';
import Notify, {NotifyType} from 'src/utility/Notify';
import {DimensionInBit} from 'src/constants/InformationSize';
import {AvatarSquare} from 'src/components/Layout/Common/StyledComponents';

interface IAvatarFormProps {
  size?: number;
  handleSave: (file: File) => Promise<any>;
  initialUrl: string | undefined;
  allowDimension?: number;
  allowSize?: number;
  disabled: boolean;
  initials: string;
}

const BorderedLabel = styled.label<{isHavingImage: boolean; disabled: boolean}>`
  border-radius: 4px;
  cursor: ${props => !props.disabled && 'pointer'};
  border: ${props => props.isHavingImage && `1px solid ${ColorPalette.gray2}`};
`;

const AvatarBox = styled(AvatarSquare)`
  position: relative;
  overflow: hidden;
  font-size: 1.5em;

  :hover::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${ColorPalette.blue6};
    transition-duration: 0.3s;
    opacity: 0.2;
  }

  > input {
    cursor: pointer;
    position: absolute;
    visibility: hidden;
    width: 100%;
    height: 100%;
  }
`;

const ChangeLink = styled.div<{
  disabled: boolean;
}>`
  color: ${props => (props.disabled ? `${ColorPalette.gray4} !important` : `${ColorPalette.blue1}`)};
  padding: 2px 4px;
  border-radius: 2px;
  background: ${props => !props.disabled && ColorPalette.gray2};
  cursor: ${props => !props.disabled && 'pointer'};

  :hover {
    color: ${ColorPalette.white};
  }
`;

function AvatarForm({
  size = 60,
  initialUrl,
  handleSave,
  initials,
  disabled,
  allowDimension = 300,
  allowSize = 2
}: IAvatarFormProps) {
  const [file, changeFile] = useState<null | File>(null);
  const [isTouched, changeTouchStatus] = useState(false);
  const [imgUrl, changeImgUrl] = useState(initialUrl);

  useEffect(() => {
    return () => {
      if (file && imgUrl) {
        window.URL.revokeObjectURL(imgUrl);
      }
    };
  }, [file]);

  function validate(fileImage: File): Promise<string> {
    const img = document.createElement('img');
    const imageSource = window.URL.createObjectURL(fileImage);
    img.src = imageSource;
    return new Promise((resolve, reject) => {
      img.onload = () => {
        if (img.naturalWidth > allowDimension || img.naturalWidth > allowDimension) {
          window.URL.revokeObjectURL(imageSource);
          reject(`Resolution limit: ${allowDimension}x${allowDimension}px`);
        }
        if (fileImage.size > allowSize * DimensionInBit.mB) {
          reject(`Image must be smaller than ${allowSize * DimensionInBit.mB} byte`);
        }

        resolve();
      };
    });
  }

  function handleSaveLocal() {
    if (isTouched) {
      handleSave(file as File).then(() => changeTouchStatus(false));
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const image = e.target.files![0];
    if (!image) {
      return;
    }

    validate(image)
      .then(() => {
        changeFile(image);
        changeTouchStatus(true);
        changeImgUrl(window.URL.createObjectURL(image));
      })
      .catch(erMessage => Notify(NotifyType.Warning, erMessage));
  }

  const isHavingImage = !!(imgUrl || file);
  return (
    <div className="d-flex flex-column align-items-center">
      <BorderedLabel isHavingImage={isHavingImage} disabled={disabled}>
        <AvatarBox wh={size} backgroundUrl={imgUrl || ''}>
          {!isHavingImage && initials}
          <input type="file" onChange={onChange} disabled={disabled} accept="image/*" title="Avatar" />
        </AvatarBox>
      </BorderedLabel>
      {!disabled && (
        <ChangeLink disabled={!isTouched} onClick={handleSaveLocal}>
          Change
        </ChangeLink>
      )}
    </div>
  );
}

export default React.memo(AvatarForm);
