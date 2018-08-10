/**
 * Created by Administrator on 2018/3/31.
 */
import React from 'react';
import OATable from '../../OATable/index';

export default class SelectTable extends React.Component {
  constructor(props) {
    super(props);
    const { selectValue } = props;
    this.state = {
      cursor: 'default',
      value: selectValue || [],
    };
  }

  componentWillReceiveProps(newProps) {
    const { selectValue } = newProps;
    if (selectValue !== this.props.selectValue) {
      this.setState({ value: [...selectValue] });
    }
  }

  clickSelectValue = (selectedRows) => {
    const {
      data,
      index,
      multiple,
    } = this.props;
    let { value } = this.state;
    if (multiple) {
      const valueKey = value.map(item => item[index]);
      const removeValIndex = valueKey.indexOf(selectedRows[index]);
      if (removeValIndex !== -1) {
        value = value.filter((_, i) => i !== removeValIndex);
      } else {
        data.forEach((item) => {
          if (item[index] === selectedRows[index]) {
            value.push(item);
          }
        });
      }
    } else {
      value = [selectedRows];
    }
    this.handelChange('', value);
  };

  handleRow = (record) => {
    return {
      onMouseEnter: () => {
        this.setState({ cursor: 'pointer' });
      },
      onMouseLeave: () => {
        this.setState({ cursor: 'default' });
      },
      onClick: () => {
        this.clickSelectValue(record);
      },
    };
  };

  handelChange = (_, selectedRows) => {
    const { setSelectedValue } = this.props;
    const value = [];
    selectedRows.forEach((item) => {
      value.push(item);
    });
    this.setState({ value }, () => {
      setSelectedValue([...value]);
    });
  };

  render() {
    const {
      columns,
      data,
      multiple,
      loading,
      fetchDataSource,
      total,
      index,
      scroll,
      serverSide,
    } = this.props;

    const { value } = this.state;
    const selection = multiple ? {
      rowSelection: {
        type: 'checkbox',
        onChange: this.handelChange,
        selectedRowKeys: value.map(item => item[index]),
      },
    } : {};
    return (
      <div style={{ cursor: this.state.cursor }}>
        <OATable
          {...(serverSide !== undefined ? { serverSide } : { serverSide: true })}
          {...{ scroll: scroll || { x: 760 } }}
          {...selection}
          columns={columns}
          data={data}
          total={total}
          loading={loading}
          onRow={this.handleRow}
          fetchDataSource={fetchDataSource}
        />
      </div>
    );
  }
}
