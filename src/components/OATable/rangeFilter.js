import React, { PureComponent } from 'react';
import {
  Button,
} from 'antd';
import InputRange from '../InputRange';

export default class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: [{
        min: null,
        max: null,
      }],
    };
  }

  onChange = (values) => {
    this.setState({
      value: [{
        min: values.min,
        max: values.max,
      }],
    });
  };

  resetOnSearchRange = () => {
    const { onSearchRange } = this.props;
    this.setState({
      value: [],
    }, () => {
      onSearchRange([]);
    });
  };

  render() {
    const { onSearchRange, width } = this.props;
    const { value } = this.state;
    return (
      <div className="ant-table-filter-dropdown" style={{ width: 260 }}>
        <InputRange
          value={value[0]}
          width={width}
          onChange={this.onChange}
          addonAfter={<Button type="primary" onClick={() => onSearchRange(value)} >确定</Button>}
        />
      </div>
    );
  }
}
