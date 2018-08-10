import React from 'react';
import { Spin } from 'antd';
import Operator from './operator';
import Create from './Create';
import { unicodeFieldsError } from '../../utils/utils';

import './message.less';
import styles from './index.less';

export default option => (Componet) => {
  const newOption = {
    ...option,
    onValuesChange(props, fieldValue, allValues) {
      props.onChange(allValues, props.index);
      const [name] = Object.keys(fieldValue);
      props.setFiedError(name);
    },
  };
  const { localBackUpKey } = option || {};
  delete newOption.localBackUpKey;
  const FormComponent = Create(newOption)(Componet);
  class NewFormComponent extends React.PureComponent {
    state = {
      autoSave: false,
      localSave: false,
      modalSave: false,
    }

    getlocalBackUp = (value) => {
      const { setFieldsValue } = this.form;
      setFieldsValue(value);
    }

    savelocalBackUp = () => {
      const { getFieldsValue } = this.form;
      return getFieldsValue();
    }

    bindAutoSave = (autoSave, localSave) => {
      this.setState({ autoSave, localSave });
    }

    handleFieldsError = (name) => {
      const { setFields, getFieldError } = this.form;
      if (getFieldError(name)) {
        setFields({ [name]: {} });
      }
    }

    handleOnChange = (changedFields, index) => {
      const { onChange } = this.props;
      if (onChange) onChange(changedFields, index);
      if (!this.state.autoSave) return;
      clearInterval(this.localSavingInterval);
      if (this.opertor) {
        this.localSavingInterval = setInterval(() => {
          this.opertor.saveByLocal(changedFields, clearInterval(this.localSavingInterval));
        }, 4000);
      }
    }

    bindModalAutoSave = (autoSave) => {
      this.setState({ autoSave, modalSave: true });
      return {
        getlocalBackUp: this.getlocalBackUp,
        savelocalBackUp: this.savelocalBackUp,
      };
    }

    handleOnError = (error, callback, isUnicode) => {
      const errResult = unicodeFieldsError(error, isUnicode);
      const { setFields } = this.form;
      setFields(errResult);
      if (callback) {
        Object.keys(errResult).forEach((name) => {
          callback(name, errResult[name], error);
        });
      }
    }

    handleSubmit = (callback) => {
      return (e) => {
        if (e) e.preventDefault();
        this.form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            callback(values);
          }
        });
      };
    }

    validatorRequired = (_, value, cb) => {
      if (value === '' || !value) cb('必填选项!');
      if (Array.isArray(value) && value.length === 0) cb('必填选项!');
      if (typeof value === 'object' && Object.keys(value).length === 0) cb('必填选项!');
      cb();
    }

    makeNewFormComponetProps = () => {
      const respone = {
        ...this.props,
        bindAutoSave: this.bindAutoSave,
        bindModalAutoSave: this.bindModalAutoSave,
        setFiedError: this.handleFieldsError,
        onChange: this.handleOnChange,
        onSubmit: this.handleSubmit,
        onError: this.handleOnError,
      };
      delete respone.loading;
      respone.validatorRequired = { validator: this.validatorRequired };
      return respone;
    }

    render() {
      const { loading } = this.props;
      const { autoSave, localSave, modalSave } = this.state;
      return (
        <Spin spinning={loading || false}>
          <div className={styles.OAForm}>
            {(autoSave || localSave) && (
              <Operator
                autoSave
                ref={(e) => {
                  this.opertor = e;
                }}
                modalSave={modalSave}
                localBackUpKey={localBackUpKey}
                savelocalBackUp={this.savelocalBackUp}
                getlocalBackUp={this.getlocalBackUp}
              />
            )}
            <FormComponent
              {...this.makeNewFormComponetProps()}
              bindForm={(form) => {
                this.form = form;
              }}
            />
          </div>
        </Spin>
      );
    }
  }
  return NewFormComponent;
};
