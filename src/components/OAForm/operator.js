import React, { PureComponent } from 'react';
import { message } from 'antd';
import styles from './index.less';

class Operator extends PureComponent {
  saveByLocal = (fieldsValue, callback) => {
    message.destroy();
    const saveLoading = message.loading('备份中', 1);
    const { localBackUpKey } = this.props;
    localStorage.setItem(localBackUpKey, JSON.stringify(fieldsValue));
    if (callback) callback();
    setTimeout(saveLoading, 1);
  }

  fetchLocalSaving = () => {
    message.destroy();
    const { localBackUpKey, getlocalBackUp } = this.props;
    const storageValue = JSON.parse(localStorage.getItem(localBackUpKey));
    if (Object.keys(storageValue || {}).length === 0) {
      setTimeout(message.error('表单没有备份'), 1);
    } else {
      setTimeout(message.loading('读取中'), 1);
    }
    getlocalBackUp(storageValue);
  }

  clearFormAndLocalSaving = () => {
    const { localBackUpKey } = this.props;
    localStorage.removeItem(localBackUpKey);
  }

  render() {
    const { savelocalBackUp, modalSave } = this.props;
    return (
      <div className={styles.OAFormOperator} style={{ display: modalSave ? 'none' : 'block' }}>
        <a onClick={this.clearFormAndLocalSaving}>重置表单</a>
        <a onClick={() => {
          this.saveByLocal(savelocalBackUp());
        }}
        >
          本地备份
        </a>
        <a onClick={this.fetchLocalSaving}>读取备份</a>
      </div>
    );
  }
}
Operator.defaultProps = {
  autoSave: false,
  localBackUpKey: '',
  getlocalBackUp: () => { },
  savelocalBackUp: () => { },
};
export default Operator;
