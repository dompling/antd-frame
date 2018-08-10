import React from 'react';
import { Input, Icon } from 'antd';

const { Search } = Input;
export default class extends React.PureComponent {
  state = {
    selectChange: false,
  };

  handleChange = () => {
    this.searchInput.blur();
    this.setState({ selectChange: true });
  };

  handleFocus = () => {
    const { selectChange } = this.state;
    if (!selectChange) {
      this.searchInput.blur();
      this.props.showModal();
    }
  };

  handleBlur = () => {
    this.props.hiddenModal();
  };

  render() {
    const {
      value,
      style,
      placeholder,
      clearValue,
      disabled,
    } = this.props;

    const buttonBefore = (
      <span onClick={clearValue} style={{ cursor: 'pointer' }}><Icon type="close" /></span>
    );

    return (
      <Search
        addonBefore={buttonBefore}
        ref={(e) => {
          this.searchInput = e;
        }}
        disabled={disabled}
        placeholder={placeholder}
        style={style}
        value={value[0] ? value[0].label : null}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />
    );
  }
}
