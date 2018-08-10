import React, { PureComponent } from 'react';
import OAForm from './index';
import OAModal from '../OAModal';
import Operator from './operator';
import './notification.less';

const defaultProps = {
  formProps: {},
  onChange: null,
  loading: false,
  onSubmit: () => {

  },
  onError: () => {

  },
};
export default class Modal extends PureComponent {
  makeModalProps = () => {
    const { title, okText, onSubmit } = this.props;
    const response = {
      ...this.props,
      title: title || '表单',
      okText: okText || '确定',
      onOk: onSubmit,
      destroyOnClose: true,
    };
    Object.keys(defaultProps).forEach((key) => {
      delete response[key];
    });
    return response;
  }

  makeOAFormProps = () => {
    const { formProps } = this.props;
    const response = { ...formProps };
    return response;
  }

  render() {
    const { children, localBackUpKey, savelocalBackUp } = this.props;
    return (
      <OAModal {...this.makeModalProps()}>
        {(savelocalBackUp) && (
          <Operator
            autoSave
            ref={(e) => {
              this.opertor = e;
            }}
            localBackUpKey={localBackUpKey}
            savelocalBackUp={this.props.savelocalBackUp}
            getlocalBackUp={this.props.getlocalBackUp}
          />
        )}
        <OAForm {...this.makeOAFormProps()}>
          {children}
        </OAForm>
      </OAModal>
    );
  }
}
Modal.defaultProps = defaultProps;
