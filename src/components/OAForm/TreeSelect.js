import React, { PureComponent } from 'react';
import {
  TreeSelect,
} from 'antd';
import { markTreeData } from '../../utils/utils';

const defaultProps = {
  dataSource: {
    data: [],
    parentValue: 0,
    fields: { value: 'id', parentId: 'parent_id', lable: 'name' },
  },
  onChange: () => { },
};

export default class OATreeSelect extends PureComponent {
  handleOnChange = (value) => {
    const {
      dataSource,
      name,
      onChange,
      multiple,
      treeCheckable,
    } = this.props;
    if (!name) {
      onChange(value);
      return;
    }
    if (treeCheckable || multiple) {
      const fieldsName = dataSource.fields.value;
      const newData = [];
      dataSource.data.forEach((item) => {
        const valueIndex = value.indexOf(item[fieldsName].toString());
        if (valueIndex !== -1) {
          newData[valueIndex] = item;
        }
      });
      const newValue = newData.map((item) => {
        const temp = {};
        Object.keys(name).forEach((key) => {
          temp[key] = item[name[key]];
        });
        return temp;
      });
      onChange(newValue);
    } else {
      const [newData] = dataSource.data.filter(item => value === item[fieldsName].toString());
      const newValue = {};
      Object.keys(name).forEach((key) => {
        temp[key] = newData[name[key]];
      });
      onChange(newValue);
    }
  }

  makeTreeValue = () => {
    const {
      value,
      dataSource,
      name,
      treeCheckable,
      multiple,
    } = this.props;
    let newValue = value;
    if (name && (treeCheckable || multiple)) {
      let valueName = '';
      Object.keys(name).forEach((key) => {
        if (dataSource.fields.value === name[key]) {
          valueName = key;
        }
      });
      newValue = value.map(item => item[valueName].toString());
    } else if (name) {
      newValue = value[valueName].toString();
    }
    return newValue;
  }

  makeProps = () => {
    const { dataSource: { data, fields, parentValue } } = this.props;
    const response = {
      ...this.props,
      value: this.makeTreeValue(),
      dropdownStyle: { maxLength: '400px' },
      treeData: markTreeData(data, fields, parentValue),
    };
    Object.keys(defaultProps).forEach((key) => {
      delete response[key];
    });
    response.onChange = this.handleOnChange;
    return response;
  }

  render() {
    return (
      <TreeSelect {...this.makeProps()} />
    );
  }
}
OATreeSelect.defaultProps = defaultProps;

