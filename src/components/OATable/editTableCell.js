import React from 'react';
import { Input } from 'antd';
import 'ant-design-pro/dist/ant-design-pro.css';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import './tableCell.less';

export default class EditableCell extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || ' ',
      editable: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  }

  makeInputValue = (newValue) => {
    let value = newValue;
    const { range, type } = this.props;
    if (type === 'number' && range) {
      if (parseFloat(value) < range.min) {
        value = range.min;
      }
      if (parseFloat(value) > range.max) {
        value = range.max;
      }
    }
    const numberValue = parseFloat(value);
    if (Math.floor(numberValue) === numberValue) {
      value = Number(value);
    }
    return value;
  }

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ value: this.makeInputValue(value) });
  }

  check = () => {
    this.setState({ editable: false });
    const { onChange } = this.props;
    if (onChange) {
      const { value } = this.state;
      onChange(this.makeInputValue(value));
    }
  }

  edit = () => {
    this.setState({ editable: true }, () => {
      this.input.input.focus();
    });
  }

  render() {
    const { value, editable } = this.state;
    const { type, style, range } = this.props;
    let content = value;
    if (type === 'number' && range) {
      if (parseFloat(value) < range.min || parseFloat(value) > range.max) {
        content = <span style={{ color: 'red' }}>{value}</span>;
      }
    }
    return (
      <div className="editable-cell" onClick={this.edit}>
        {
          editable ? (
            <Input
              {...{ type } || null}
              ref={(e) => { this.input = e; }}
              value={value}
              onChange={this.handleChange}
              onPressEnter={this.check}
              onBlur={this.check}
              style={{ ...style }}
            />
          ) :
            (
              <Ellipsis lines={1}>
                {content}
              </Ellipsis>
            )
        }
      </div>
    );
  }
}
