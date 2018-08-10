import React, { PureComponent } from 'react';
import { Tag, Input, Tooltip, Icon } from 'antd';

export default class TagInput extends PureComponent {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      value: value || [],
      inputVisible: false,
      inputValue: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value && Array.isArray(nextProps.value)) {
      this.setState({ value: [...nextProps.value] });
    }
  }

  handleClose = (removedTag) => {
    const value = this.state.value.filter(tag => tag !== removedTag);
    this.setState({ value }, this.handleOnChange);
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  }

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  }

  handleOnChange = () => {
    const { value } = this.state;
    const { onChange } = this.props;
    onChange(value);
  }

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { value } = this.state;
    if (inputValue && value.indexOf(inputValue) === -1) {
      value = [...value, inputValue];
    }
    this.setState({
      value,
      inputVisible: false,
      inputValue: '',
    }, this.handleOnChange);
  }

  saveInputRef = (input) => {
    this.input = input;
  }

  render() {
    const { value, inputVisible, inputValue } = this.state;
    return (
      <div>
        {value.map((tag) => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag key={tag} closable afterClose={() => this.handleClose(tag)}>
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          );
          return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag
            onClick={this.showInput}
            style={{ background: '#fff', borderStyle: 'dashed' }}
          >
            <Icon type="plus" /> 请输入
          </Tag>
        )}
      </div>
    );
  }
}
TagInput.defaultProps = {
  value: [],
  onChange: () => { },
};

