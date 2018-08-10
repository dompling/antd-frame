import moment from 'moment';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - (day * oneDay);

    return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!');  // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(routePath =>
    routePath.indexOf(path) === 0 && routePath !== path);
  routes = routes.map(item => item.replace(path, ''));
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  const renderRoutes = renderArr.map((item) => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
      exact,
    };
  });
  return renderRoutes;
}

/**
 * 验证用户操作权限
 * @param {权限Id} authId
 */
export function customerAuthority(authId) {
  let authAble = false;
  if (window.user && Object.keys(window.user).length) {
    const { authorities: { oa } } = window.user;
    if (Array.isArray(authId)) {
      authId.forEach((id) => {
        if (oa.indexOf(id) !== -1) {
          authAble = true;
        }
      });
    } else {
      authAble = oa.indexOf(authId) !== -1;
    }
  }
  return authAble;
}


/**
 * 验证品牌权限
 */
export function getBrandAuthority(brandId) {
  if (Object.keys(window.user).length) {
    const availableBrands = window.user.authorities.available_brands;
    if (availableBrands.indexOf(brandId) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * 验证部门权限
 */
export function getDepartmentAuthority(departmentId) {
  if (Object.keys(window.user).length) {
    const availableDepartments = window.user.authorities.available_departments;
    if (availableDepartments.indexOf(departmentId) !== -1) {
      return true;
    }
  }
  return false;
}

export function makePositionData(brandId, brand) {
  let conditions = brandId;
  if (brandId.in) {
    conditions = brandId.in;
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
}


export function undotFieldsValue(fieldsValue) {
  const params = {};
  Object.keys(fieldsValue).forEach((key) => {
    const value = fieldsValue[key];
    let fieldsValueMd = params;
    const keyGroup = key.split('.');
    keyGroup.forEach((item, index) => {
      if (index === keyGroup.length - 1) {
        fieldsValueMd[item] = value;
      } else {
        fieldsValueMd[item] = fieldsValueMd[item] || {};
        fieldsValueMd = fieldsValueMd[item];
      }
    });
  });
  return params;
}

export function dotFieldsValue(fieldsValue, parentKey) {
  let response = {};
  Object.keys(fieldsValue || {}).forEach((key) => {
    const value = fieldsValue[key];
    const newKey = parentKey === undefined ? key : `${parentKey}.${key}`;
    if (Array.isArray(value)) {
      if (typeof value[0] === 'object') {
        response = {
          ...response,
          ...dotFieldsValue(value, newKey),
        };
      } else {
        response[newKey] = value;
      }
    } else if (typeof value === 'object') {
      response = {
        ...response,
        ...dotFieldsValue(value, newKey),
      };
    } else {
      response[newKey] = value;
    }
  });
  return response;
}

// table params

const whereConfig = {
  in: '=',
  like: '~',
  min: '>=',
  max: '<=',
  gt: '>',
  lt: '<',
};

export function dotWheresValue(fields) {
  let fieldsWhere = '';
  Object.keys(fields || {}).forEach((key) => {
    const name = key;
    if (typeof fields[key] === 'object') {
      Object.keys(fields[key]).forEach((i) => {
        let value = fields[key][i];
        if (Array.isArray(value) && value.length > 0) {
          value = value.length > 1 ? `[${value}]` : value[0];
        }
        if (value) {
          fieldsWhere += `${name}${whereConfig[i]}${value};`;
        }
      });
    } else if (fields[key]) {
      fieldsWhere += `${name}=${fields[key]};`;
    }
  });
  return fieldsWhere;
}

export function makerFilters(params) {
  const { filters } = { ...params };
  let newFilters = '';
  newFilters = dotWheresValue(filters);
  return {
    ...params,
    filters: newFilters,
  };
}

/* selectTree */

export function markTreeData(data = [], { value, lable, parentId }, pid = null) {
  const tree = [];
  data.forEach((item) => {
    if (item[parentId] === pid) {
      const temp = {
        value: item[value].toString(),
        label: item[lable],
        key: `${item[value]}`,
      };
      const children = markTreeData(data, { value, lable, parentId }, item[value]);
      if (children.length > 0) {
        temp.children = children;
      }
      tree.push(temp);
    }
  });
  return tree;
}

/**
 * 获取url参数对象
 * @param {参数名称} name
 */
export function getUrlString(name) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}
