import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import { connect } from 'dva';
import { getBrandAuthority, getDepartmentAuthority } from '../../../../utils/utils';
import SearchTable from '../index';

@connect(({ department, brand, shop, loading }) => ({
  brand: brand.brand,
  brandLoading: loading.models.brand,
  department: department.department,
  departmentLoading: loading.effects['department/fetchDepartment'],
  shop: shop.shop,
  shopTotal: shop.total,
  shopLoading: loading.models.shop,
}))

export default class Shop extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'brand/fetchBrand' });
    dispatch({ type: 'department/fetchDepartment', payload: {} });
  }

  fetchShop = (params) => {
    const { dispatch } = this.props;
    dispatch({ type: 'shop/fetchShop', payload: params });
  };

  makeColumns = () => {
    const { brand, department, authority } = this.props;
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
    let access = false;
    if (authority) {
      access = true;
    }
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
  }

  makeShopProps = () => {
    const {
      shop,
      shopTotal,
      shopLoading,
      brandLoading,
      departmentLoading,
    } = this.props;

    const tableProps = {
      data: shop,
      total: shopTotal,
      index: 'shop_sn',
      scroll: { x: 760 },
      loading: (shopLoading || brandLoading || departmentLoading),
    };

    tableProps.columns = this.makeColumns();
    return tableProps;
  };

  makeSearchTableProps = () => {
    const response = {
      ...this.props,
      tableProps: {
        ...this.makeShopProps(),
        fetchDataSource: this.fetchShop,
      },
    };
    return response;
  }

  render() {
    return (
      <SearchTable {...this.makeSearchTableProps()} />
    );
  }
}

Shop.defaultProps = {
  multiple: false,
  disabled: false,
  name: {},
  showName: '',
  title: '',
  placeholder: '请选择',
  filters: {},
  onChange: () => { },
};
