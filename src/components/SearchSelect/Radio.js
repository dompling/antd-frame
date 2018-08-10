import React from 'react';
import SearchSelect from '../SearchSelect';
import { ModalSelect } from '../OAModal';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      visible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      this.setState({ value });
    }
  }

  handleVisible = (flag) => {
    this.setState({ visible: !!flag });
  }

  handleChange = (value) => {
    this.setState({ value }, () => {
      const { onChange } = this.props;
      onChange(value);
    });
  }

  makeSearchSelectProps = () => {
    const { fetchDataSource } = this.props;
    const { value } = this.state;
    const response = {
      dataSource: [],
      selectedData: [],
      ...this.props,
      valueOBJ: value,
      onChange: this.handleChange,
      afterClick: () => this.handleVisible(true),
      fetchDataSource,
    };
    return response;
  }

  makeModalSelectProps = () => {
    const { visible } = this.state;
    const { loading, modalSelectProps, fetchDataSource } = this.props;
    const response = {
      visible,
      index: 'id',
      data: [],
      loading,
      onChange: this.handleChange,
      onCancel: this.handleVisible,
      fetchDataSource,
      ...modalSelectProps,
    };
    return response;
  }

  render() {
    return (
      <React.Fragment>
        <SearchSelect {...this.makeSearchSelectProps()} />
        <ModalSelect {...this.makeModalSelectProps()} />
      </React.Fragment>
    );
  }
}
