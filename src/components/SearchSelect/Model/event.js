import React from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import SearchSelectRadio from '../Radio';
import { makerFilters, findTreeParent, getLetfEllipsis } from '../../../utils/utils';
import styles from './ellipsis.less';


@connect(({ event, loading }) => ({
  dataSource: event.event,
  eventType: event.type,
  loading: loading.models.event,
}))

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.fecthId = null;
  }

  componentDidMount() {
    const { eventId, onChange } = this.props;
    if (eventId && !this.fecthId) {
      this.fecthId = eventId;
      this.fetchEvent({}, {}, eventId, onChange);
    }
  }


  fetchEventType = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'event/fetchEventType',
      payload: {},
    });
  }

  fetchEvent = (params, _, id, callBack) => {
    let newParams;
    const { dispatch } = this.props;
    this.fetchEventType();
    if (id) {
      newParams = { filters: `id=${id}` };
    } else if (params.length && !params.page) {
      newParams = makerFilters({
        filters: { name: { like: params } },
      });
    } else if (Object.keys(params).length) {
      newParams = params;
    }
    if (newParams) {
      dispatch({
        type: 'event/fetchEvent',
        payload: newParams,
        callBack,
      });
    }
  }

  makeColumns = () => {
    const { eventType } = this.props;
    const columns = [
      {
        dataIndex: 'id',
        title: '编号',
        searcher: true,
        sorter: true,
        width: 110,
        fixed: 'left',
      },
      {
        dataIndex: 'name',
        title: '名称',
        searcher: true,
        tooltip: true,
        fixed: 'left',
        width: 300,
      },
      {
        dataIndex: 'type_id',
        title: '事件类型',
        width: 300,
        treeFilters: {
          title: 'name',
          value: 'id',
          parentId: 'parent_id',
          parentVal: null,
          data: eventType,
        },
        render: (typeId) => {
          const findData = findTreeParent(eventType, typeId);
          const listName = findData.reverse().map(item => item.name);
          const name = listName.join(' > ');
          return (
            <Tooltip title={name}>
              {getLetfEllipsis(name, 230, 14)}
            </Tooltip>
          );
        },
      },
      {
        dataIndex: 'point_a_default',
        title: 'A分',
        rangeFilters: true,
        width: 100,
      },
      {
        dataIndex: 'point_b_default',
        title: 'B分',
        width: 100,
        rangeFilters: true,
      },
      {
        dataIndex: 'first_approver_name',
        title: '初审人',
        width: 100,
        searcher: true,
      },
      {
        dataIndex: 'final_approver_name',
        title: '终审人',
        width: 100,
        searcher: true,
      },
    ];
    return columns;
  }


  makeSearchSelectProps = () => {
    const { dataSource, value } = this.props;
    const response = {
      ...this.props,
      valueOBJ: value,
      renderOption: this.renderOption,
      fetchDataSource: this.fetchEvent,
    };
    if (Array.isArray(dataSource)) {
      response.dataSource = dataSource;
      response.selectedData = dataSource;
    } else if (Object.keys(dataSource).length) {
      response.selectedData = dataSource.data;
    }
    return response;
  }

  makeModalSelectProps = () => {
    const { dataSource, loading, name, value } = this.props;
    const response = {
      loading,
      name,
      value,
      index: 'id',
      data: [],
      columns: this.makeColumns(),
      scroll: { x: 1200 },
      modalProps: {
        title: '选择事件',
      },
    };
    if (Array.isArray(dataSource)) {
      response.dataSource = dataSource;
    } else {
      response.data = dataSource && dataSource.data;
      response.total = dataSource && dataSource.total;
    }
    return response;
  }

  renderOption = (item) => {
    const { eventType } = this.props;
    const findData = findTreeParent(eventType, item.type_id);
    const eventTypeName = findData.reverse().map(data => data.name);
    return (
      <React.Fragment>
        {item.name}
        <div className={styles.optionEventType}>
          <span>{getLetfEllipsis(eventTypeName.join(' > '), 240, 12)}</span>
          {item.final_approver_name && (
            <span className="ellipsis">终审人：{item.final_approver_name}</span>
          )}
          {item.first_approver_name && (
            <span className="ellipsis">初审人：{item.first_approver_name}</span>
          )}
        </div>
      </React.Fragment>
    );
  }

  render() {
    return (
      <SearchSelectRadio
        {...this.makeSearchSelectProps()}
        modalSelectProps={{ ...this.makeModalSelectProps() }}
      />
    );
  }
}
