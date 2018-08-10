import React, { PureComponent, Fragment } from 'react';
import {
  Tag,
} from 'antd';
import ToolBar from './toolBar';
import './index.less';

export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rules: {
        volcano: /({<\w+>})+/,
        blue: /(\{\{\w+\}\})+/,
        default: /(\{\?\w+(\.\*\.)?\w*\?\})/,
      },
      contents: {},
    };
  }

  onChange = (e) => {
    const { onChange } = this.props;
    const { value } = e.target;
    if (onChange) {
      onChange(value);
    }
  };

  addTag = (src) => {
    const { value, onChange, disabled } = this.props;
    if (disabled) {
      return;
    }
    const cursor = this.input.selectionEnd;
    let newValue = '';
    if (value) {
      const start = value.substr(0, cursor);
      const end = value.substr(cursor, value.length);
      const newCursor = `${start}${src}`.length;
      this.input.setSelectionRange(newCursor, newCursor);
      newValue = `${start}${src}${end}`;
    } else {
      newValue = src;
      this.input.value = src;
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  makeContent = () => {
    const { value } = this.props;
    let newValue = [];
    if (value) {
      newValue = value.split(/(\{\{\w+\}\})|(\{\?\w+\?\})|(\{\?\w+\.\*\.\w*\?\})|(\{<\d+>\})/);
      newValue = newValue.filter(item => item !== undefined);
    }
    return newValue;
  };

  compileHtml = (item, index) => {
    const { rules, contents } = this.state;
    let temp = item;
    if (contents) {
      Object.keys(rules).forEach((color) => {
        if (item.search(rules[color]) !== -1 && contents[item]) {
          const tagProps = { key: `tag-${index}` };
          if (color !== 'default') {
            tagProps.color = color;
          }
          temp = (
            <Tag {...tagProps}>{contents[item]}</Tag>
          );
        }
      });
    }

    return temp;
  };

  render() {
    const html = this.makeContent();
    const { disabled } = this.props;
    return (
      <Fragment>
        <textarea
          disabled={disabled}
          readOnly={disabled}
          {...this.props}
          ref={(e) => {
            this.input = e;
          }}
          className="ant-input"
          style={{
            height: 'auto',
          }}
          value={this.props.value || ''}
          onChange={this.onChange}
        />
        <div
          className="ant-input"
          disabled={disabled}
          readOnly={disabled}
          style={{
            height: 'auto',
          }}
        >
          <label>表达式 ：</label>
          {html.map((item, index) => {
            return this.compileHtml(item, index);
          })}
        </div>
        <ToolBar
          disabled={disabled}
          fields={this.props.fields}
          plusItem={this.addTag}
          makeContents={(contents) => {
            this.setState({ contents });
          }}
        />
      </Fragment>
    );
  }
}
Index.defaultProps = {
  disabled: false,
};
