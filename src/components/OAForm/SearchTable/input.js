import React from 'react';
import { Input, Icon } from 'antd';

const { Search } = Input;
export default class extends React.PureComponent {
  handleFocus = () => {
    const { modalVisible } = this.props;
    this.searchInput.blur();
    if (!modalVisible) {
      this.searchInput.blur();
      this.props.handleModelVisble(true);
    }
  };

  handleBlur = () => {
    this.props.handleModelVisble(false);
  };

  render() {
    const {
      value,
      placeholder,
      clearValue,
      disabled,
      showName,
    } = this.props;

    const buttonBefore = (
      <span onClick={clearValue} style={{ cursor: 'pointer' }}><Icon type="close" /></span>
    );
    return (
      <Search
        readOnly
        addonBefore={buttonBefore}
        ref={(e) => {
          this.searchInput = e;
        }}
        disabled={disabled}
        placeholder={placeholder}
        value={value && value[showName]}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />
    );
  }
}
