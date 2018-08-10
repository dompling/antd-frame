/**
 * Created by Administrator on 2018/3/31.
 */
import React from 'react';
import OATable from '../OATable/index';

export default class SelectTable extends React.PureComponent {
  constructor(props) {
    super(props);
    const { selectValue } = this.props;
    const selectKey = selectValue.map(item => item.key);
    this.state = {
      cursor: 'default',
      selectKey: selectKey || [],
      value: selectValue || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { loading, selectValue } = nextProps;
    if (!loading && selectValue !== this.props.selectValue) {
      const selectKey = selectValue.map(item => item.key);
      this.setState({ selectKey: [...selectKey], value: [...selectValue] });
    }
  }

  clickSelectValue = (selectedRows) => {
    const { data, valueIndex, labelIndex, multiple } = this.props;
    let { value, selectKey } = this.state;
    const val = [];
    value.forEach((item) => {
      val.push(item.key);
    });

    const removeValIndex = val.indexOf(selectedRows[valueIndex]);
    if (removeValIndex !== -1) {
      value = value.filter(item => item.key !== selectedRows[valueIndex]);
    } else {
      data.forEach((item) => {
        if (item[valueIndex] === selectedRows[valueIndex]) {
          if (multiple) {
            value.push({
              key: item[valueIndex],
              label: item[labelIndex],
            });
          } else {
            value = [];
            value[0] = {
              key: item[valueIndex],
              label: item[labelIndex],
            };
          }
        }
      });
    }
    selectKey = value.map(item => item.key);
    this.setState({ value: [...value], selectKey: [...selectKey] }, () => {
      this.props.setSelectedValue(value);
    });
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

  handelChange = (selectKey, selectedRows) => {
    const { labelIndex, valueIndex } = this.props;
    let { value } = this.state;

    value = value.filter(item => selectKey.indexOf(item.key) !== -1);

    const valueKeys = value.map(item => item.key);

    selectedRows.forEach((item) => {
      if (valueKeys.indexOf(item[valueIndex]) === -1) {
        value.push({
          key: item[valueIndex],
          label: item[labelIndex],
        });
      }
    });

    this.setState({ value: [...value], selectKey: [...selectKey] }, () => {
      this.props.setSelectedValue(value);
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
    } = this.props;

    const selection = multiple ? {
      rowSelection: {
        type: 'checkbox',
        onChange: this.handelChange,
        selectedRowKeys: this.state.selectKey,
      },
    } : {};

    return (
      <div style={{ cursor: this.state.cursor }}>
        <OATable
          {...selection}
          columns={columns}
          data={data}
          total={total}
          loading={loading}
          fetchDataSource={fetchDataSource}
          serverSide
          onRow={this.handleRow}
        />
      </div>
    );
  }
}
