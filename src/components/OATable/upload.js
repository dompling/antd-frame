import React from 'react';
import { Upload, Button } from 'antd';
import upload from '../../utils/upload';


export default class extends React.Component {
  state = {
    fileList: [],
  }

  handleChange = (info) => {
    let { fileList } = info;
    fileList = fileList.slice(-1);

    fileList = fileList.map((file) => {
      const newFile = file;
      if (file.response) {
        newFile.url = file.response.url;
      }
      return newFile;
    });

    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.status === 'success';
      }
      return true;
    });
    this.setState({ fileList });
  }

  render() {
    const { handleBeforeUpload, uri, children } = this.props;
    const accessToken = localStorage.getItem(`${TOKEN_PREFIX}access_token`);
    const props = {
      action: '',
      onChange: this.handleChange,
      beforeUpload: handleBeforeUpload,
      customRequest: (options) => {
        const formData = new FormData();
        formData.append(options.filename, options.file);
        upload(uri, {
          method: 'POST',
          mode: 'cors',
          body: formData,
        }).then((res) => {
          if (res.status === 'success') {
            options.onSuccess();
          } else {
            options.onError();
          }
        });
      },
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    return (
      <Upload {...props} fileList={this.state.fileList}>
        <Button icon="upload" >{children}</Button>
      </Upload>
    );
  }
}
