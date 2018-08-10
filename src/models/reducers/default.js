/**
 * Created by Administrator on 2018/4/1.
 */
import { notification } from 'antd';

export default {
  save(state, action) {
    const { store, id, data } = action.payload;
    if (id === undefined) {
      return {
        ...state,
        [store]: data,
      };
    } else {
      const originalStore = state[`${store}Details`];
      return {
        ...state,
        [`${store}Details`]: {
          ...originalStore,
          [id]: data,
        },
      };
    }
  },
  setTotal(state, action) {
    const { total, store, filtered } = action.payload;
    return {
      ...state,
      [`${store}Total`]: total,
      [`${store}Filtered`]: filtered,
    };
  },
  add(state, action) {
    const { store, data } = action.payload;
    if (data.message) {
      notification.error({
        message: data.message,
      });
      return;
    }
    notification.success({
      message: '添加成功',
    });
    let dataState = [];
    dataState = [...state[store]];
    dataState.push(data);
    return {
      ...state,
      [store]: dataState,
    };
  },
  update(state, action) {
    const { store, id, data } = action.payload;
    if (data.message) {
      notification.error({
        message: data.message,
      });
      return;
    }
    notification.success({
      message: '编辑成功',
    });
    const originalStore = { ...state[`${store}Details`] };
    Object.keys(originalStore).forEach((key) => {
      if (id === key) {
        delete originalStore[key];
      }
    });
    let updated = false;
    const newStore = state[store].map((item) => {
      if (parseInt(item.id, 0) === parseInt(id, 0)) {
        updated = true;
        return data;
      } else {
        return item;
      }
    });
    if (!updated) {
      newStore.push(data);
    }
    return {
      ...state,
      [store]: state[store].length ? newStore : [],
      [`${store}Details`]: originalStore,
    };
  },
  delete(state, action) {
    const { store, id } = action.payload;
    notification.success({
      message: '删除成功',
    });
    const originalStore = { ...state[`${store}Details`] };
    Object.keys(originalStore).forEach((key) => {
      if (id === key) {
        delete originalStore[key];
      }
    });
    return {
      ...state,
      [store]: state[store].filter(item => item.id !== id),
      [`${store}Details`]: originalStore,
    };
  },
};
