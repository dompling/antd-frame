import React from 'react';
import { Modal, Tooltip, message } from 'antd';
import { connect } from 'dva';
import SelectTable from './selectTable';
import RadioInput from './input';
import CheckBoxTag from './tag';
import { getBrandAuthority, getDepartmentAuthority } from '../../utils/utils';


const defaultStyle = {
  width: '600px',
  height: '400px',
};

/**
 * 定制插件
 */
const type = {
  staff: {
    makeColumns: ({ brand, department, position, filterPosition }, access) => {
      const status = [
        { value: 1, text: '试用期' },
        { value: 2, text: '在职' },
        { value: 3, text: '停薪留职' },
        { value: -1, text: '离职' },
        { value: -2, text: '自动离职' },
        { value: -3, text: '开除' },
        { value: -4, text: '劝退' },
      ];
      let brandFilters = [];
      if (brand) {
        brand.forEach((item) => {
          if (getBrandAuthority(item.id)) {
            brandFilters.push({ text: item.name, value: item.id });
          }
        });
      }
      brandFilters = access ? brandFilters : (
        brand.map(item => ({ text: item.name, value: item.id }))
      );
      return [
        {
          title: '编号',
          dataIndex: 'staff_sn',
          sorter: true,
          searcher: true,
        }, {
          title: '姓名',
          align: 'center',
          dataIndex: 'realname',
          searcher: true,
        }, {
          title: '品牌',
          align: 'center',
          dataIndex: 'brand_id',
          filters: brandFilters,
          render: (val) => {
            const data = brand && brand.filter(item => item.id === val)[0];
            return data ? data.name : '';
          },
        }, {
          title: '职位',
          dataIndex: 'position_id',
          filters: filterPosition && filterPosition.map((item) => {
            return { text: item.name, value: item.id };
          }),
          render: (val) => {
            const data = position && position.filter(item => item.id === val)[0];
            return data ? data.name : '';
          },
        }, {
          title: '部门',
          dataIndex: 'department_id',
          width: 200,
          treeFilters: {
            title: 'full_name',
            value: 'id',
            parentId: 'parent_id',
            data: department && department.map((item) => {
              const temp = { ...item };
              if (access) {
                temp.disabled = !getDepartmentAuthority(item.id);
              }
              return temp;
            }),
          },
          render: (val) => {
            const data = department && department.filter(item => item.id === val)[0];
            const fullName = data ? data.full_name : '';
            const content = (
              <Tooltip title={fullName} placement="right">
                {fullName}
              </Tooltip>
            );
            return content;
          },
        },
        {
          title: '状态',
          dataIndex: 'status_id',
          align: 'center',
          filters: status,
          render: val => status.filter(item => item.value === val)[0].text,
        },
      ];
    },
  },
  shop: {
    makeColumns: ({ department, brand }, access) => {
      let brandFilters = [];
      if (brand) {
        brand.forEach((item) => {
          if (getBrandAuthority(item.id)) {
            brandFilters.push({ text: item.name, value: item.id });
          }
        });
      }
      brandFilters = access ? brandFilters : (
        brand.map(item => ({ text: item.name, value: item.id }))
      );
      return [
        {
          title: '编号',
          dataIndex: 'shop_sn',
          sorter: true,
          searcher: true,
        },
        {
          title: '店铺',
          dataIndex: 'name',
          searcher: true,
          render: val => (
            <Tooltip title={val} placement="right">
              {val.length > 9 ? `${val.substr(0, 9)}...` : val}
            </Tooltip>
          ),
        },
        {
          title: '品牌',
          align: 'center',
          dataIndex: 'brand_id',
          filters: access ? brandFilters : brand.map(item => ({ text: item.name, value: item.id })),
          render: (val) => {
            const data = brand && brand.filter(item => item.id === val)[0];
            return data ? data.name : '';
          },
        }, {
          title: '部门',
          dataIndex: 'department_id',
          treeFilters: {
            title: 'full_name',
            value: 'id',
            parentId: 'parent_id',
            data: department && department.map((item) => {
              const temp = { ...item };
              if (access) {
                temp.disabled = !getDepartmentAuthority(item.id);
              }
              return temp;
            }),
          },
          render: (val) => {
            const data = department && department.filter(item => item.id === val)[0];
            const fullName = data ? data.full_name : '';
            return (
              <Tooltip title={fullName} placement="right">
                {fullName.length > 9 ? `${fullName.substr(0, 9)}...` : fullName}
              </Tooltip>
            );
          },
        },
        {
          title: '店员',
          dataIndex: 'staff',
          searcher: true,
          render: (val) => {
            let shopStaff = val.map(item => item.realname);
            shopStaff = shopStaff.join(',');
            return (
              <Tooltip title={shopStaff} placement="right">
                {shopStaff.length > 9 ? `${shopStaff.substr(0, 9)}...` : shopStaff}
              </Tooltip>
            );
          },
        },
      ];
    },
  },
};

/**
 * 定制插件开发的数据模型
 */
@connect(({ staffs, department, brand, position, shop, loading }) => ({
  brand: brand.brand,
  brandLoading: loading.models.brand,
  department: department.department,
  departmentLoading: loading.effects['department/fetchDepartment'],
  staffSearcherTotal: staffs.total,
  staffSearcherResult: staffs.tableResult,
  staffDetails: staffs.details,
  staffsLoading: loading.effects['staffs/fetchStaff'],
  position: position.position,
  positionLoading: loading.models.position,
  shop: shop.shop,
  shopTotal: shop.total,
  shopLoading: loading.models.shop,
}))

export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this.pushValue = [];
    const { value, multiple } = props;
    const selectValue = multiple && value ? value : !multiple && value ? [value] : [110007];
    this.state = {
      selectValue,
      visible: false,
      filterPosition: [],
      staffSearcherParams: '',
      modelStyle: props.modelStyle || defaultStyle,
    };
  }

  componentDidMount() {
    const { module, tableProps, dispatch } = this.props;
    if (Object.keys(type).indexOf(module) === -1 && !tableProps) {
      message.error(`没有找到该模型${module}的搜索代码，请在组件中添加相关模型代码`);
      return false;
    }
    switch (module) {
      case 'staff':
        dispatch({ type: 'brand/fetchBrand' });
        dispatch({ type: 'position/fetchPosition' });
        dispatch({ type: 'department/fetchDepartment', payload: {} });
        this.fetchDataSource = this.fetchStaff;
        break;
      case 'shop':
        dispatch({ type: 'brand/fetchBrand' });
        dispatch({ type: 'department/fetchDepartment', payload: {} });
        this.fetchDataSource = this.fetchShop;
        break;
      default:
        this.fetchDataSource = tableProps.fetchDataSource;
        break;
    }
  }

  componentWillReceiveProps(nextProps) {
    const { position } = nextProps;
    const { filterPosition } = this.state;
    if (nextProps.position !== this.props.position && filterPosition.length === 0) {
      this.setState(({ filterPosition: [...position] }));
    }
    const { selectValue } = this.state;
    if (selectValue.length > 0 && this.props.staffDetails !== nextProps.staffDetails) {
      const newSelectValue = [];
      nextProps.staffDetails.forEach((item) => {
        if (selectValue.indexOf(item.staff_sn) !== -1) {
          newSelectValue.push({
            key: item.staff_sn,
            label: item.realname,
          });
        }
      });

      this.setState({
        selectValue: newSelectValue,
      });
    }
  }

  onChange = (value, visible) => {
    const { multiple } = this.props;
    let result = [];
    if (multiple) {
      result = value.map(item => item.key);
    } else {
      result = value[0] ? value[0].key : [];
    }
    this.props.onChange(result, visible, value);
  };

  setTableValue = (value) => {
    const { multiple } = this.props;
    if (multiple) {
      if (this.state.selectValue.length > 0) {
        const keys = this.state.selectValue.map(item => item.key);
        this.pushValue = value.filter(item => keys.indexOf(item.key) === -1);
      } else {
        this.pushValue = value;
      }
    } else {
      this.setState({
        visible: false,
        selectValue: value,
      }, () => this.onChange(value, false));
    }
  };

  setTagSelectedValue = (value) => {
    this.setState({
      selectValue: [...value],
    }, () => this.onChange(value, false));
  };

  handleOk = () => {
    const { selectValue } = this.state;
    const value = [...this.pushValue, ...selectValue];
    this.setState({
      visible: false,
      selectValue: value,
    }, () => this.onChange(value, false));
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    }, () => this.onChange([], false));
  };

  showModal = () => {
    this.setState({
      visible: true,
    }, () => this.onChange([], true));
  };

  makeTableProps = () => {
    const { module } = this.props;
    const { tableProps } = this.props;
    let newTableProps = {};
    switch (module) {
      case 'staff':
        newTableProps = this.makeStaffProps(type[module]);
        break;
      case 'shop':
        newTableProps = this.makeShopProps(type[module]);
        break;
      default:
        newTableProps = tableProps;
        break;
    }
    return newTableProps;
  };

  /**
   *
   *定制开发插件内容：
   * 员工staff 搜索
   */

  fetchStaff = (params) => {
    const { dispatch, position } = this.props;
    let { filterPosition } = this.state;
    dispatch({ type: 'staffs/fetchStaff', payload: params });
    if (params.filters && params.filters.brand_id) {
      const pushPosition = this.makePositionData(params.filters.brand_id);
      if (pushPosition.length > 0) {
        filterPosition = pushPosition;
      }
    } else {
      filterPosition = position;
    }

    this.setState({
      filterPosition: [...filterPosition],
      staffSearcherParams: JSON.stringify(params),
    });
  };

  makePositionData = (params) => {
    const { brand } = this.props;
    let conditions = params;
    if (params.in) {
      conditions = params.in;
    }
    const selectBrand = brand.filter(item => conditions.indexOf(item.id.toString()) !== -1);
    const pushPosition = [];
    selectBrand.forEach((item) => {
      if (item.positions.length > 0) {
        item.positions.forEach((p) => {
          const pushIndex = pushPosition.map(index => index.id);
          if (pushIndex.indexOf(p.id) === -1) {
            pushPosition.push(p);
          }
        });
      }
    });
    return pushPosition;
  };

  makeStaffProps = (module) => {
    const { staffSearcherParams, filterPosition } = this.state;
    const {
      brand,
      position,
      department,
      brandLoading,
      staffsLoading,
      positionLoading,
      departmentLoading,
      staffSearcherTotal,
      staffSearcherResult,
      authority,
    } = this.props;
    const tableProps = {
      valueIndex: 'staff_sn',
      labelIndex: 'realname',
      total: staffSearcherTotal,
      data: staffSearcherResult[staffSearcherParams],
      loading: (staffsLoading || brandLoading || departmentLoading || positionLoading),
    };

    let access = false;
    if (authority) {
      access = true;
    }

    tableProps.columns = module.makeColumns({
      brand,
      department,
      position,
      filterPosition,
    }, access);

    return tableProps;
  };

  /**
   *
   * 店铺shop搜索
   */
  fetchShop = (params) => {
    const { dispatch } = this.props;
    dispatch({ type: 'shop/fetchShop', payload: params });
  };

  makeShopProps = (module) => {
    const {
      shop,
      shopTotal,
      shopLoading,
      brand,
      brandLoading,
      department,
      departmentLoading,
      authority,
    } = this.props;

    const tableProps = {
      data: shop,
      valueIndex: 'shop_sn',
      labelIndex: 'name',
      total: shopTotal,
      loading: (shopLoading || brandLoading || departmentLoading),
    };

    let access = false;
    if (authority) {
      access = true;
    }
    tableProps.columns = module.makeColumns({ brand, department }, access);
    return tableProps;
  };

  render() {
    const { multiple, style, placeholder, disabled } = this.props;
    const { selectValue, visible, modelStyle: { width } } = this.state;
    const footer = multiple ? null : { footer: null };
    const tableProps = this.makeTableProps();
    const commonProps = {
      style,
      disabled,
      placeholder,
      value: selectValue,
      showModal: this.showModal,
    };
    return (
      <div>
        {multiple ? (
          <CheckBoxTag
            {...commonProps}
            setTagSelectedValue={this.setTagSelectedValue}
          />
        ) : (
          <RadioInput
            {...commonProps}
            hiddenModal={this.handleCancel}
            clearValue={() => {
              this.setState({
                selectValue: [],
              }, () => this.onChange([], false, []));
            }}
          />
        )}
        <Modal
          style={this.state.modelStyle}
          width={width}
          title="员工列表"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          {...footer}
        >
          <SelectTable
            {...tableProps}
            multiple={multiple}
            selectValue={selectValue}
            fetchDataSource={this.fetchDataSource}
            setSelectedValue={this.setTableValue}
          />
        </Modal>
      </div>
    );
  }
}
