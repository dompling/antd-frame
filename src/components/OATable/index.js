import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { connect } from 'dva';
import { Table, Input, Icon, message, Button, Tooltip, Spin } from 'antd';
import Ellipsis from '../Ellipsis';

import { makerFilters } from '../../utils/utils';

import TreeFilter from './treeFilter';
import DateFilter from './dateFilter';
import RangeFilter from './rangeFilter';

import Operator from './operator';
import TableUpload from './upload';

import EdiTableCell from './editTableCell';


import styles from './index.less';
import request from '../../utils/request';


const defaultProps = {
  multiOperator: null,
  extraOperator: null,
  extraOperatorRight: null,
  serverSide: false,
  excelExport: null,
  excelInto: null,
  excelTemplate: null,
  extraExportFields: [],
  filtered: 0,
  sync: true,
  tableVisible: true,
  autoScroll: false,
  fetchDataSource: () => {
    // message.error('请设置fetchDataSource');
  },
};
@connect(({ table }) => ({
  table,
}))
class OATable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      pagination: {
        pageSize: 10,
        current: 1,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: this.showTotal,
      },
      filterDropdownVisible: false,
      filtered: [],
      filters: {},
      sorter: {},
      loading: false,
    };
    this.sortOrder = {};
  }

  componentDidMount() {
    const { data, serverSide } = this.props;
    if (!data || data.length === 0 || serverSide) {
      this.fetchTableDataSource();
    }
    this.bodyHeiht = document.body.clientHeight;
    const rightContent = document.getElementById('rightContent');
    this.contentTop = rightContent.offsetTop;
    if (this.table) {
      this.tableElement = ReactDOM.findDOMNode(this.table).getBoundingClientRect();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { rowSelection, multiOperator } = nextProps;
    if (
      multiOperator && multiOperator.length > 0
      &&
      rowSelection
      && JSON.stringify(rowSelection) !== JSON.stringify(this.props.rowSelection)
    ) {
      const { selectedRowKeys, selectedRows } = rowSelection;
      this.setState({ selectedRowKeys, selectedRows });
    }
  }

  onEnd = (e) => {
    const dom = e.target;
    dom.style.height = 'auto';
  }

  setScrollHeight = () => {
    const { autoScroll } = this.props;
    let scrollY = true;
    if (autoScroll && this.table && this.tableElement) {
      const { contentTop } = this;
      const { bodyHeight, contentHeigth } = this.props.table;
      const table = this.tableElement;
      const tableTo = table.top;
      const tableToContetnTop = tableTo - contentTop;
      const { pagination } = this.props;
      scrollY = contentHeigth - tableToContetnTop;
      if (!pagination) {
        scrollY -= (bodyHeight || this.bodyHeight) > 660 ? 120 : 100;
      }
      return scrollY;
    }
  }

  showTotal = (total, range) => {
    return <div style={{ color: '#969696' }}>{`显示 ${range[0]} - ${range[1]} 项 , 共 ${total} 项`}</div>;
  }

  fetchTableDataSource = (fetch, update = false) => {
    const { fetchDataSource, columns, serverSide } = this.props;
    const { filters, pagination, sorter } = this.state;
    let params = {};
    let urlPath = {};
    if (serverSide) {
      const filterParam = {};
      const searcherParam = {};
      columns.forEach((column, index) => {
        const key = column.dataIndex || index;
        const filter = filters[key];
        if (filter && filter.length > 0) {
          if (column.searcher) {
            filterParam[key] = { like: filter[0] };
          } else if (column.dateFilters) {
            [filterParam[key]] = filter;
          } else {
            filterParam[key] = filter.length === 1 ? filter[0] : { in: filter };
          }
        }
      });
      params = {
        page: pagination.current,
        pagesize: pagination.pageSize,
        filters: {
          ...filterParam,
          ...searcherParam,
        },
      };
      const defaultSorter = Object.keys(this.sortOrder);
      if (sorter.field) {
        params.sort = `${sorter.field}-${sorter.order === 'ascend' ? 'asc' : 'desc'}`;
      } else if (defaultSorter.length) {
        defaultSorter.forEach((key) => {
          params.sort = `${key}-${defaultSorter[key] === 'ascend' ? 'asc' : 'desc'}`;
        });
      }
      urlPath = makerFilters(params);
    }
    if (!fetch) {
      if (!serverSide && update) {
        params.update = update;
      }
      fetchDataSource(urlPath, params);
    } else {
      return params;
    }
  }


  mapColumns = () => {
    return this.props.columns.map((column, index) => {
      const { filters, sorter } = this.state;
      const { serverSide } = this.props;
      const key = column.dataIndex || index;
      const response = { ...column };
      if (!serverSide) {
        response.sorter = column.sorter === true ? this.makeDefaultSorter(key) : column.sorter;
      }
      response.filteredValue = filters[key] || null;
      if (column.dataIndex && column.sorter && column.sortOrder) {
        this.sortOrder[column.dataIndex] = column.sortOrder;
      }
      response.sortOrder = sorter.columnKey === key && sorter.order;
      if (column.searcher) {
        Object.assign(response, this.makeSearchFilterOption(key, column));
        response.render = response.render || this.makeDefaultSearchRender(key);
      } else if (column.treeFilters) {
        Object.assign(response, this.makeTreeFilterOption(key, column));
      } else if (column.filters && !serverSide) {
        response.onFilter = column.onFilter || this.makeDefaultOnFilter(key);
      } else if (column.dateFilters) {
        Object.assign(response, this.makeDateFilterOption(key, column));
      } else if (column.rangeFilters) {
        Object.assign(response, this.makeRangeFilterOption(key, column));
      }
      if (column.dataIndex !== undefined && !column.render) {
        const { tooltip } = column;
        response.render = (text) => {
          return (
            <Ellipsis tooltip={tooltip || false} lines={1}>
              {text}
            </Ellipsis>
          );
        };
      }
      return response;
    });
  }

  makeSearchFilterOption = (key, column) => {
    const { filtered, filters, filterDropdownVisible } = this.state;
    const { serverSide } = this.props;
    const cls = classNames({
      [styles['table-filter-active']]: filtered.indexOf(key) !== -1,
    });
    const searchFilterOption = {
      filterIcon: <Icon type="search" className={cls} />,
      filterDropdown: (
        <Input.Search
          ref={(ele) => {
            this[`searchInput_${key}`] = ele;
          }}
          placeholder="搜索"
          onSearch={this.handleSearch(key)}
          style={{ width: 180 }}
          enterButton
        />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          this[`searchInput_${key}`].input.input.value = filters[key] || '';
        }
        this.setState({
          filterDropdownVisible: visible ? key : false,
        }, () => this[`searchInput_${key}`] && this[`searchInput_${key}`].focus());
      },
    };
    if (!serverSide && !column.onFilter) {
      searchFilterOption.onFilter = this.makeDefaultOnSearch(key);
    }
    return searchFilterOption;
  }

  makeTreeFilterOption = (key, column) => {
    const { filterDropdownVisible } = this.state;
    const { serverSide } = this.props;
    const treeFilterOption = {
      filterDropdown: (
        <TreeFilter
          treeFilters={column.treeFilters}
          handleConfirm={this.handleTreeFilter(key)}
        />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: (visible) => {
        this.setState({
          filterDropdownVisible: visible ? key : false,
        });
      },
    };
    if (!serverSide && !column.onFilter) {
      treeFilterOption.onFilter = this.makeDefaultOnFilter(key);
    }
    return treeFilterOption;
  }

  makeDateFilterOption = (key, column) => {
    const { filterDropdownVisible, filtered } = this.state;
    const { serverSide } = this.props;
    const cls = classNames({
      [styles['table-filter-active']]: filtered.indexOf(key) !== -1,
    });
    const dateFilterOption = {
      filterIcon: <Icon type="clock-circle-o" className={cls} />,
      filterDropdown: (
        <DateFilter
          onSearchTime={this.handleDateFilter(key)}
          dateFilterVisible={filterDropdownVisible === key}
        />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: (visible) => {
        this.setState({
          filterDropdownVisible: visible ? key : false,
        });
      },
    };
    if (!serverSide && !column.onFilter) {
      dateFilterOption.onFilter = this.makeDefaultOnRangeFilter(key);
    }

    return dateFilterOption;
  }

  makeRangeFilterOption = (key, column) => {
    const { filterDropdownVisible, filtered } = this.state;
    const { serverSide } = this.props;
    const cls = classNames({
      [styles['table-filter-active']]: filtered.indexOf(key) !== -1,
    });
    const rangeFilterOption = {
      filterIcon: <Icon type="filter" className={cls} />,
      filterDropdown: (
        <RangeFilter
          width={260}
          onSearchRange={this.handleRangeFilter(key)}
        />
      ),
      filterDropdownVisible: filterDropdownVisible === key,
      onFilterDropdownVisibleChange: (visible) => {
        this.setState({
          filterDropdownVisible: visible ? key : false,
        });
      },
    };
    if (!serverSide && !column.onFilter) {
      rangeFilterOption.onFilter = this.makeDefaultOnRangeFilter(key);
    }
    return rangeFilterOption;
  }

  handleSearch = (key) => {
    return (value) => {
      const { filters, filtered } = this.state;
      const { serverSide } = this.props;
      const searchFilter = value ? [value] : [];
      const filteredState = filtered.filter(item => item !== key);
      if (value) {
        filteredState.push(key);
      }
      this.setState({
        filters: {
          ...filters,
          [key]: searchFilter,
        },
        filterDropdownVisible: false,
        filtered: filteredState,
      }, () => {
        if (serverSide) {
          this.fetchTableDataSource();
        }
      });
    };
  }

  handleTreeFilter = (key) => {
    return (checkedKeys) => {
      const { filters } = this.state;
      const { serverSide } = this.props;
      this.setState({
        filters: {
          ...filters,
          [key]: checkedKeys,
        },
        filterDropdownVisible: false,
      }, () => {
        if (serverSide) {
          this.fetchTableDataSource();
        }
      });
    };
  }

  handleDateFilter = (key) => {
    return (timeValue) => {
      const { filters, filtered } = this.state;
      const { serverSide } = this.props;
      const filteredState = filtered.filter(item => item !== key);
      if (timeValue.length > 0) {
        filteredState.push(key);
      }
      this.setState({
        filters: {
          ...filters,
          [key]: timeValue,
        },
        filterDropdownVisible: false,
        filtered: filteredState,
      }, () => {
        if (serverSide) {
          this.fetchTableDataSource();
        }
      });
    };
  }

  handleRangeFilter = (key) => {
    return (rangeValue) => {
      const { filters, filtered } = this.state;
      const { serverSide } = this.props;
      const filteredState = filtered.filter(item => item !== key);
      if (rangeValue.length > 0) {
        filteredState.push(key);
      }
      this.setState({
        filters: {
          ...filters,
          [key]: rangeValue,
        },
        filterDropdownVisible: false,
        filtered: filteredState,
      }, () => {
        if (serverSide) {
          this.fetchTableDataSource();
        }
      });
    };
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      filters,
      pagination,
      sorter,
    }, () => {
      if (this.props.serverSide) {
        this.fetchTableDataSource();
      }
    });
  }

  makeDefaultOnFilter = (key) => {
    return (value, record) => {
      if (Array.isArray(record[key])) {
        const able = record[key].find(item => item.toString() === value);
        return able;
      }
      return `${record[key]}` === `${value}`;
    };
  }

  makeDefaultOnRangeFilter = (key) => {
    return ({ min, max }, record) => min <= record[key] && max >= record[key];
  }


  makeDefaultOnSearch = (key) => {
    return (value, record) => {
      return `${record[key]}`.match(new RegExp(value, 'gi'));
    };
  }

  makeDefaultSorter = (key) => {
    return (a, b) => a[key] - b[key];
  }

  makeDefaultSearchRender = (key) => {
    const { filters } = this.state;
    return (val) => {
      if (filters[key]) {
        const reg = new RegExp(filters[key][0], 'gi');
        const match = `${val}`.match(reg);
        return (
          <span>
            {`${val}`.split(reg).map(
              (text, i) => (
                i > 0 ? [<span key={key} className="ant-table-search-highlight">{match[0]}</span>, text] : text
              )
            )}
          </span>
        );
      } else {
        return val;
      }
    };
  }

  resetFilter = (key) => {
    const { serverSide } = this.props;
    const { filters, searchers, filtered } = this.state;
    if (key && filters[key]) {
      delete filters[key];
    } else if (key && searchers[key]) {
      delete searchers[key];
    }
    let newFiltered = [];
    if (key) {
      newFiltered = filtered.filter(item => item !== key);
    }
    this.setState({
      filters: key ? filters : {},
      searchers: key ? searchers : {},
      filtered: newFiltered,
      sorter: {},
    }, () => {
      if (serverSide) {
        this.fetchTableDataSource();
      }
    });
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows }, () => {
      const { rowSelection } = this.props;
      if (rowSelection && rowSelection.onChange) {
        rowSelection.onChange(selectedRowKeys, selectedRows);
      }
    });
  }

  clearSelectedRows = () => {
    this.handleRowSelectChange([], []);
  }

  makeTableProps = () => {
    const { pagination, selectedRowKeys } = this.state;
    const { multiOperator, data, serverSide, total, rowSelection, autoScroll } = this.props;
    const { bodyHeight } = this.props.table;
    if (serverSide) {
      pagination.total = total;
    }
    const newRowSelection = multiOperator && multiOperator.length > 0 ? {
      ...rowSelection,
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    } : rowSelection;
    const response = {
      rowKey: (record, index) => record.id || record.staff_sn || record.shop_sn || index,
      dataSource: data,
      onChange: this.handleTableChange,
      size: (bodyHeight || this.bodyHeight) > 660 ? 'default' : 'small',
      bordered: false,
      scroll: {},
      pagination: {
        ...pagination,
        ...this.props.pagination,
      },
      ...this.props,
      rowSelection: newRowSelection,
      columns: this.mapColumns(),
    };
    if (autoScroll && this.table) {
      response.scroll.y = this.setScrollHeight();
    }
    Object.keys(defaultProps).forEach((key) => {
      delete response[key];
    });
    return response;
  }

  makeExcelFieldsData = (data) => {
    const { extraExportFields, columns, excelExport: { title } } = this.props;
    let exportFields = extraExportFields.concat(columns);
    exportFields = exportFields.filter(item => item.dataIndex !== undefined);
    const newData = [];
    data.forEach((item) => {
      let temp = {};
      const fieldsKey = Object.keys(item);
      Object.keys(exportFields).forEach((column) => {
        const columnValue = exportFields[column];
        let renderValue;
        if (columnValue.render) {
          renderValue = columnValue.render(item[columnValue.dataIndex], item);
        }
        if (fieldsKey.indexOf(columnValue.dataIndex) !== -1 && !columnValue.render) {
          temp[columnValue.dataIndex] = item[columnValue.dataIndex];
        } else if (columnValue.exportRender) {
          temp[columnValue.dataIndex] = columnValue.exportRender(item);
        } else if (
          fieldsKey.indexOf(columnValue.dataIndex) !== -1
          && columnValue.render
          && typeof renderValue === 'string'
        ) {
          temp[columnValue.dataIndex] = renderValue;
        }
      });
      temp = Object.values(temp);
      newData.push(temp);
    });
    const header = Object.keys(exportFields).map(key => exportFields[key].title);
    const datas = {
      sheetData: newData,
      sheetHeader: header,
    };
    let tableString = `${datas.sheetHeader.join(',')}\n`;
    datas.sheetData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        let str = item[key];
        if (typeof str === 'string') {
          str = str.replace(/,/ig, '，');
        }
        tableString += `${str}\t,`;
      });
      tableString += '\n';
    });

    const uri = `data:application/csv;charset=utf-8,\ufeff${encodeURIComponent(tableString)}`;
    const link = document.createElement('a');
    link.href = uri;
    link.download = `${title}.xls`;
    link.click();
    this.excelLoading(false);
  }

  excelLoading = (loading) => {
    this.setState({ loading });
  }

  handleExportExcel = () => {
    const { excelExport: { uri } } = this.props;
    const params = this.fetchTableDataSource(true);
    const body = { filters: params.filters };
    this.excelLoading('导出中...');
    request(`${uri}`, {
      method: 'GET',
      body,
    }).then((response) => {
      this.makeExcelFieldsData(response);
    });
  }


  handleBeforeUpload = (file) => {
    const isExcel = (file.type === 'application/vnd.ms-excel') || (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    if (!isExcel) {
      message.error('你只能上传excel格式的文件!');
    }
    return isExcel;
  }

  handleExcelTemplate = () => {
    const { excelTemplate } = this.props;
    location.href = excelTemplate;
  }


  makeExtraOperator = () => {
    const { extraOperator, excelInto, excelExport, excelTemplate } = this.props;
    const operator = extraOperator || [];
    if (excelInto) {
      operator.push(
        <Tooltip key="upload" title="导入数据">
          <TableUpload
            uri={excelInto}
            handleBeforeUpload={this.handleBeforeUpload}
          >
            EXCEL导入
          </TableUpload>
        </Tooltip>
      );
    }

    if (excelExport) {
      operator.push(
        <Tooltip key="download" title="导出数据">
          <Button icon="download" onClick={this.handleExportExcel}>EXCEL导出</Button>
        </Tooltip>
      );
    }

    if (excelTemplate) {
      operator.push(
        <Tooltip key="muban" title="模板">
          <Button icon="download" onClick={this.handleExcelTemplate}>下载EXCEL模板</Button>
        </Tooltip>
      );
    }
    return operator;
  }

  render() {
    const { multiOperator, tableVisible, extraOperatorRight, sync, columns } = this.props;
    const { loading } = this.state;
    const filterColumns = columns.map((item) => {
      const temp = { title: item.title, dataIndex: item.dataIndex };
      if (item.filters) {
        temp.filterData = item.filters;
      }
      if (item.treeFilters) {
        temp.filterData = item.treeFilters;
      }
      return temp;
    });
    return (
      <Spin spinning={loading !== false} tip={`${loading}`}>
        <div
          className={styles.filterTable}
        >
          <Operator
            {...this.state}
            sync={sync}
            key="Operator"
            filterColumns={filterColumns || []}
            multiOperator={multiOperator}
            extraOperator={this.makeExtraOperator()}
            extraOperatorRight={extraOperatorRight}
            fetchTableDataSource={() => { this.fetchTableDataSource(null, true); }}
            resetFilter={this.resetFilter}
            clearSelectedRows={this.clearSelectedRows}
          />
          {(tableVisible === true) && (
            <Table
              ref={(e) => {
                this.table = e;
              }}
              {...this.makeTableProps()}
              key="table"
            />
          )}
        </div>
      </Spin>
    );
  }
}

OATable.EdiTableCell = EdiTableCell;
OATable.defaultProps = defaultProps;

export default OATable;

