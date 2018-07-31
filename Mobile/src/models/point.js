import { Toast } from 'antd-mobile';
import {
  getPointDetail,
  getPointLog,
  getPointLog2,
} from '../services/point';
import defaultReducers from './reducers/default';
import { makerFilters } from '../utils/util.js';


export default {
  namespace: 'point',
  state: {
    pointDetails: {},
    pointList: {},
  },
  effects: {
    *getPointDetail({ payload }, { call, put }) {
      const { id } = payload;
      const response = yield call(getPointDetail, id);
      if (response && !response.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'point',
            id,
            data: response,
          },
        });
      } else {
        Toast.fail(response.message);
      }
    },
    *getPointLog({ payload }, { call, put }) {
      const newPayload = makerFilters(payload);
      const response = yield call(getPointLog, newPayload);
      if (response && !response.error) {
        yield put({
          type: 'saveList',
          payload: {
            key: 'pointList',
            // type: payload.type,
            value: response,
          },
        });
      } else {
        Toast.fail(response.message);
      }
    },
    *getPointLog2({ payload }, { call, put }) {
      // const newPayload = makerFilters(payload);
      const response = yield call(getPointLog2, payload);
      if (response && !response.error) {
        yield put({
          type: 'saveList',
          payload: {
            key: 'pointList',
            // type: payload.type,
            value: response,
          },
        });
      } else {
        Toast.fail(response.message);
      }
    },
  },
  reducers: {
    ...defaultReducers,
    saveData(state, action) {
      const newState = { ...state };
      newState[action.payload.key] = action.payload.value;
      return {
        ...state, ...newState,
      };
    },
    saveList(state, action) {
      const info = action.payload.value;
      let newList = { ...state[action.payload.key] };
      if (info.page !== 1) { // 多页
        let newData = [...newList.data];
        newData = newData.concat(info.data);
        newList = { ...info, data: newData };
      } else {
        newList = { ...info };
      }
      return {
        ...state,
        [action.payload.key]: newList,
      };
    },
  },
};
