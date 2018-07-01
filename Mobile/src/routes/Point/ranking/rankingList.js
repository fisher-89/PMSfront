import React from 'react';
import {
  connect,
} from 'dva';
import { WingBlank, WhiteSpace, Flex, List, DatePicker } from 'antd-mobile';
import moment from 'moment';
import nothing from '../../../assets/nothing.png';
import { userStorage, getUrlParams } from '../../../utils/util';
import { ListSort, Nothing } from '../../../components/index';
import style from '../index.less';

// const sortList = [
//   { name: '默认排序', value: 'created_at-asc',
// icon: import('../../../assets/filter/default_sort.svg') },
//   { name: '时间升序', value: 'created_at-asc', icon: import('../../../assets/filter/asc.svg') },
//   { name: '时间降序', value: 'created_at-desc', icon: import('../../../assets/filter/desc.svg') },
//   { name: 'A分升序', value: 'point_a-asc', icon: import('../../../assets/filter/asc.svg') },
//   { name: 'A分降序', value: 'point_a_-desc', icon: import('../../../assets/filter/desc.svg') },
//   { name: 'B分升序', value: 'point_b_-asc', icon: import('../../../assets/filter/asc.svg') },
//   { name: 'B分降序', value: 'point_b_-desc', icon: import('../../../assets/filter/desc.svg') },
// ];


@connect(({ ranking, loading }) => ({
  ranking: ranking.ranking,
  loading,
  group: ranking.group,
}))
export default class PointRanking extends React.Component {
  state = {
    modal: {// 模态框
      filterModal: false,
      sortModal: false,
    },
    // params: {
    //   stage: 'month',
    //   datetime: moment(new Date()).format('YYYY-MM-DD'),
    //   group_id: '',
    //   start_at: '',
    //   end_at: '',
    // },
  }
  componentWillMount() {
    const { dispatch, location } = this.props;
    this.urlParams = getUrlParams(location.search);
    this.fetchRanking(this.urlParams);
    dispatch({
      type: 'ranking/getAuthorityGroup',
    });
    this.userInfo = userStorage('userInfo');
  }

  componentWillReceiveProps(nextProps) {
    const { location: { search } } = nextProps;
    if (search !== this.props.location.search) {
      this.urlParams = getUrlParams(search);
      this.fetchRanking(this.urlParams);
    }
  }
  onCancel = (e, feild) => {
    const { modal } = this.state;
    const newModal = { ...modal };
    newModal[feild] = false;
    this.setNewState('modal', newModal);
  }
  setNewState = (key, newValue) => {
    this.setState({
      [key]: newValue,
    });
  }
  selFilter = (feild) => { // 筛选
    const { modal } = this.state;
    const newModal = { ...modal };
    newModal[feild] = !newModal[feild];
    this.setNewState('modal', newModal);
  }
  // dealFilter = () => {
  //   const { params } = this.state;
  //   const { dispatch } = this.props;
  //   const newParams = {};
  //   for (const key in params) {
  //     if (key !== undefined) {
  //       if (params[key]) {
  //         newParams[key] = params[key];
  //       }
  //     }
  //   }
  //   dispatch({
  //     type: 'ranking/getRanking',
  //     payload: { ...newParams },
  //   });
  // }


  fetchRanking = (params) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ranking/getRanking',
      payload: params,
    });
  }

  // timeChange = (v, key) => {

  //   // const { params } = this.state;
  //   // const newParams = { ...params };
  //   // newParams[key] = moment(v).format('YYYY-MM-DD');
  //   // this.setState({
  //   //   params: newParams,
  //   // }, () => {
  //   //   this.dealFilter();
  //   // });
  // }

  urlParamsUnicode = (params) => {
    const url = [];
    Object.keys(params).forEach((item) => {
      if (params[item]) {
        url.push(`${item}=${params[item]}`);
      }
    });
    return url.join('&');
  }

  sortReasult = (filters) => {
    this.urlParams = {
      ...this.urlParams,
      ...filters,
    };
    let url = '/ranking';
    const params = this.urlParamsUnicode(this.urlParams);
    url += params ? `?${params}` : '';
    this.props.history.replace(url);

    // const { modal, params } = this.state;
    // const newModal = { ...modal };
    // const newParams = { ...params };
    // newModal.sortModal = false;
    // newParams.group_id = item.id;
    // this.setState({
    //   modal: { ...newModal },
    //   params: newParams,
    // }, () => {
    //   this.dealFilter();
    // });
  }
  renderRankingItem = (item) => {
    const { userInfo } = this;
    if (item.staff_sn === userInfo.staff_sn) {
      return (
        <Flex
          justify="between"
          key={item.staff_sn}
          style={{
            borderBottom: '1px solid rgb(250,250,250)',
            position: 'relative',
            height: '50px',
            padding: '0 0.48rem',
          }}
        >
          <Flex.Item
            style={{ fontSize: '16px', color: 'rgb(24,116,208)' }}
          >
            <span>{item.rank}&nbsp;&nbsp;{item.staff_name}</span>
            <span
              id="my"
              style={{ position: 'absolute', top: '-40px' }}
            >看不见我
            </span>
          </Flex.Item>
          <Flex.Item
            style={{
              color: 'rgb(24,116,208)',
              fontSize: '16px',
              textAlign: 'right',
            }}
          >
            {item.total}
          </Flex.Item>
        </Flex>
      );
    }
    return (
      <Flex
        key={item.staff_sn}

        justify="between"
        style={{
          height: '50px',
          padding: '0 0.48rem',
          borderBottom: '1px solid rgb(250,250,250)',
        }}
      >
        <Flex.Item
          style={{
            fontSize: '16px',
          }}
        >
          {item.rank}&nbsp;&nbsp;{item.staff_name}
        </Flex.Item>
        <Flex.Item
          style={{
            color: 'rgb(155,155,155)',
            fontSize: '16px',
            textAlign: 'right',
          }}
        >
          {item.total}
        </Flex.Item>
      </Flex>
    );
  }
  render() {
    const { ranking, loading, group } = this.props;
    const { list, user } = ranking;
    const { userInfo } = this;

    const params = this.urlParams;
    const sortItem = group.find(item => item.id.toString() === this.urlParams.group_id);
    return (
      <Flex direction="column" style={{ height: '100%' }}>
        <Flex.Item className={style.header}>
          <div className={style.filter_con} >
            <Flex
              justify="between"
              style={{ padding: '0 1.68rem' }}
            >
              <Flex.Item>
                <div
                  className={[style.dosort].join(' ')}
                  onClick={() => this.selFilter('sortModal')}
                  // style={{ background: 'none' }}
                >
                  {sortItem ? sortItem.name : '选择部门'}
                </div>
              </Flex.Item>
              <Flex.Item>
                <DatePicker
                  value={new Date(params.datetime)}
                  mode="date"
                  onChange={(date) => {
                    const time = moment(date).format('YYYY-MM-DD');
                    if (time !== this.urlParams.datetime) {
                      this.sortReasult({ datetime: time });
                    }
                  }
                  }
                >
                  <div
                    className={[style.filter].join(' ')}

                  >{params.datetime}
                  </div>
                </DatePicker>

              </Flex.Item>
            </Flex>
            <ListSort
              contentStyle={{
                position: 'fixed',
                zIndex: 99,
                left: 0,
                top: '1.17333rem',
                bottom: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.1)',
              }}
              visible={this.state.modal.sortModal}
              onCancel={this.onCancel}
              filterKey="sortModal"
            >
              {group.map((item, i) => {
                const idx = i;
                return (
                  <div
                    className={style.sort_item}
                    key={idx}
                    onClick={(e) => {
                      this.onCancel(e, 'sortModal');
                      if (item.id.toString() !== this.urlParams.group_id) {
                        this.sortReasult({ group_id: item.id });
                      }
                    }}
                  >{item.name}
                  </div>
                );
              })}
            </ListSort>
          </div>
          <WhiteSpace size="md" />
          <WingBlank size="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ padding: '0.26667rem 0.48rem', fontSize: '14px' }}>我的排名</p>
              <a
                style={{ fontSize: '12px', color: 'rgb(24, 116, 208)' }}
                href="#my"
              >在列表中查看
              </a>
            </div>
            <Flex
              justify="between"
              style={{
                height: '50px',
                padding: '0 0.48rem',
                borderBottom: '1px solid rgb(250,250,250)',
                background: '#fff',
              }}
            >
              <Flex.Item
                style={{
                  fontSize: '16px',
                }}
              >
                {user ? user.rank : ''}&nbsp;&nbsp;{userInfo.realname}
              </Flex.Item>
              <Flex.Item
                style={{
                  color: 'rgb(155,155,155)',
                  fontSize: '16px',
                  textAlign: 'right',
                }}
              >
                {user ? user.total : ''}
              </Flex.Item>
            </Flex>
          </WingBlank>
          <WhiteSpace size="md" />
          <WingBlank size="lg">
            <p style={{ padding: '0.26667rem 0.48rem', fontSize: '14px' }}>排名详情</p>
          </WingBlank>
        </Flex.Item>
        <Flex.Item className={style.content}>
          {list && !list.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
              <Nothing src={nothing} />
            </div>
          ) : (
            <WingBlank>
              <List
                style={{ ...(loading.global ? { display: 'none' } : null) }}
                className={style.rank_list}
              >
                {(list || []).map((item) => {
                    return this.renderRankingItem(item);
                  })}

              </List>
            </WingBlank>
            )}
        </Flex.Item>

      </Flex>
    );
  }
}
