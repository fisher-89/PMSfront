import React from 'react';
import moment from 'moment';
import {
  connect,
} from 'dva';
import { List, TextareaItem, Flex, WingBlank, WhiteSpace, InputItem, Button, DatePicker, Toast } from 'antd-mobile';
import { PersonIcon, PersonAdd } from '../../../components/index.js';
import { analyzePath } from '../../../utils/util';

import style from '../index.less';
import styles from '../../common.less';
import prompt from '../../../assets/prompt.svg';
@connect(({ buckle, searchStaff, loading, event }) => ({
  buckle,
  loading,
  searchStaff,
  event: event.event,
}))
export default class BuckleRecord extends React.Component {
  state = {
    optAll: {
      pointA: '',
      pointB: '',
      count: '',
    },
    info: {
      executedAt: new Date(),
      description: '',
      participants: [],
      event: null,
    },
  }
  componentWillMount() {
    const { dispatch,
      location, event,
      buckle: { info, optAll },
      searchStaff: { selectStaff },
    } = this.props;
    const eventId = analyzePath(location.pathname, 1);
    if (eventId && event && !Object.keys(event).length) { // 没有赋值过
      dispatch({
        type: 'buckle/getBuckleDetail',
        payload: {
          eventId,
          cb: (data) => {
            const newParticipant = data.participant.map((item) => {
              const obj = { ...item };
              obj.realname = item.staff_name;
              return obj;
            });
            const infos = {
              executedAt: new Date(data.executed_at),
              description: data.description,
              participants: newParticipant,
            };
            const defaultAddr = data.event.default_cc_addressees;
            const addressees = data.addressee.map((item) => {
              const obj = { ...item };
              obj.realname = item.staff_name;
              if ((defaultAddr || []).find(its => its.staff_sn === item.staff_sn)) {
                obj.lock = 1;
              }
              return obj;
            });
            this.setState({
              info: {
                ...infos,
                participants: newParticipant,
              },
            });
            dispatch({
              type: 'buckle/saveData',
              payload: {
                key: 'info',
                used: false,
                value: infos,
              },
            });
            const selectStaffs = {
              first: [{ realname: data.first_approver_name, staff_sn: data.first_approver_sn }],
              final: [{ realname: data.final_approver_name, staff_sn: data.final_approver_sn }],
              participants: data.participant,
              copy: addressees,
            };

            dispatch({
              type: 'searchStaff/saveSelectStaff',
              payload: {
                key: 'selectStaff',
                value: selectStaffs,
              },
            });
            dispatch({
              type: 'event/saveData',
              payload: {
                key: 'event',
                value: {
                  ...data.event,
                },
              },
            });
          },
        },
      });
    } else {
      const { participants } = selectStaff;
      let newParticipant = participants.map((item) => {
        const obj = { ...item };
        obj.realname = item.staff_name || item.realname;
        obj.point_a = (item.point_a === '' || item.point_a === undefined) ?
          (optAll.pointA || event.point_a_default === undefined ? '' : event.point_a_default) : item.point_a;
        obj.point_b = (item.point_b === '' || item.point_b === undefined) ?
          (optAll.pointB || event.point_b_default === undefined ? '' : event.point_b_default) : item.point_b;
        obj.count = item.count === undefined ? optAll.count : item.count;
        return obj;
      });
      if (!info.event || event.id !== info.event.id) {
        newParticipant = newParticipant.map((item) => {
          const obj = { ...item };
          obj.realname = item.staff_name || item.realname;
          obj.point_a = event.point_a_default;
          obj.point_b = event.point_b_default;
          return obj;
        });
      }
      this.setState({
        info: {
          ...info,
          event,
          participants: newParticipant,
        },
        optAll,
      });
      dispatch({
        type: 'buckle/updateModal',
      });
    }
  }


  remove = (e, item, name) => {
    e.stopPropagation();
    const { searchStaff: { selectStaff }, dispatch } = this.props;
    const { info } = this.state;
    const { participants } = info;
    let newParti = [...participants];
    if (name === 'participants') {
      newParti = participants.filter(its => its.staff_sn !== item.staff_sn);
      this.setState({
        info: {
          ...info,
          participants: newParti,
        },
      });
    }
    const newSelectStaff = { ...selectStaff };
    newSelectStaff[name] = selectStaff[name].filter(its => its.staff_sn !== item.staff_sn);

    dispatch({
      type: 'buckle/saveData',
      payload: {
        key: 'info',
        value: {
          ...info,
          participants: newParti,
        },
      },
    });
    dispatch({
      type: 'searchStaff/saveSelectStaff',
      payload: {
        key: 'selectStaff',
        value: newSelectStaff,
      },
    });
  }

  changePerson = (name, type) => {
    const { history } = this.props;
    this.saveAllData();
    history.push(`/testView2/${name}/${type}`);
  }
  addMore = (name = 'first', type) => {
    const { event } = this.props;
    if (name === 'final') {
      if (!Object.keys(event || {}).length) {
        Toast.info('请选择事件，记录分值');
        return;
      }
    }
    const { history } = this.props;
    this.saveAllData();
    history.push(`/testView2/${name}/${type}`);
  }

  savePointData = (newPoint, kind, el) => {
    const { event } = this.props;
    let error = false;
    if (newPoint > event[`${kind}_max`] || newPoint < (-event[`${kind}_min`])) {
      error = true;
    }
    const { optAll, info } = this.state;
    const newOpt = { ...optAll };
    const tempKey = kind === 'point_a' ?
      'pointA' : kind === 'point_b' ?
        'pointB' : kind === 'count' ?
          'count' : '';

    if (el === undefined) {
      newOpt[tempKey] = newPoint;
    } else {
      newOpt[tempKey] = '';
    }
    newOpt[`${kind}_error`] = error;
    const newParticipant = info.participants.map((item) => {
      const tmpItem = { ...item };
      if (el === undefined) {
        tmpItem[kind] = newPoint;
        tmpItem[`${kind}_error`] = error;
      } else
      if (item.staff_sn === el.staff_sn) {
        tmpItem[kind] = newPoint;
        tmpItem[`${kind}_error`] = error;
      }
      return tmpItem;
    });
    this.setState({
      info: { ...info, participants: newParticipant },
      optAll: newOpt,
    });
  }

  // 验证数字
  validNumer = (point, kind, el) => {
    const newPoint = 0;
    if (point && !/^(-?\d+)(\.\d+)?$/.test(point)) {
      this.savePointData(newPoint, kind, el);
    }
  }

  pointChange = (point, kind, el) => {
    // const { event } = this.props;

    // 验证整数;
    if (kind === 'count' && point && !/^\d+$/.test(point)) {
      return;
    }
    // if (point && point !== '-' && !/^(-?\d+)(\.\d+)?$/.test(point)) {
    //   return;
    // }
    // const newPoint = this.clearNoNum(point);
    const newPoint = point;
    this.savePointData(newPoint, kind, el);
  }
  stateChange = (v, key) => {
    const { info } = this.state;
    if (key === 'description') {
      if (v.length > 100) {
        return;
      }
    }
    const newInfo = { ...info };
    newInfo[key] = v;
    this.setState({
      info: newInfo,
    });
  }
  saveAllData = () => {
    const { dispatch, searchStaff: { selectStaff } } = this.props;
    const { info, optAll } = this.state;
    const newSelectStaff = { ...selectStaff };
    newSelectStaff.participants = info.participants;
    dispatch({
      type: 'searchStaff/saveSelectStaff',
      payload: {
        key: 'selectStaff',
        value: newSelectStaff,
      },
    });
    dispatch({
      type: 'buckle/saveData',
      payload: {
        key: 'info',
        value: { ...info },
      },
    });
    dispatch({
      type: 'buckle/saveData',
      payload: {
        key: 'optAll',
        value: { ...optAll },
      },
    });
  }
  record = () => {
    this.saveAllData();
    const { info } = this.state;
    const { searchStaff: { selectStaff }, event, dispatch, history } = this.props;
    const { first, final, copy } = selectStaff;
    const newCopy = copy.map((item) => {
      const obj = {};
      obj.staff_sn = item.staff_sn;
      obj.staff_name = item.realname;
      return obj;
    });
    const newParticipant = info.participants.map((item) => {
      const obj = {};
      obj.staff_sn = item.staff_sn;
      obj.staff_name = item.realname;
      obj.point_a = item.point_a;
      obj.point_b = item.point_b;
      obj.count = item.count;
      return obj;
    });
    let msg = '';
    msg = event.id === undefined ?
      '请选择事件' : !info.participants.length ?
        '请选择参与人' : !first.length ?
          '请选择初审人' : !final.length ?
            '请选择终审人' : !copy.length ?
              '请选择抄送人' : '';
    if (msg) {
      Toast.fail(msg);
      return;
    }
    const pointError = newParticipant.find(item =>
      isNaN(item.point_a) || isNaN(item.point_b)
    );
    if (pointError) {
      Toast.fail('请输入正确格式的数字');
      return;
    }
    dispatch({
      type: 'buckle/recordBuckle',
      payload: {
        data: {
          event_id: event.id,
          participants: newParticipant,
          description: info.description,
          first_approver_sn: first[0].staff_sn,
          first_approver_name: first[0].realname,
          final_approver_sn: final[0].staff_sn,
          final_approver_name: final[0].staff_name,
          executed_at: moment(info.executedAt).format('YYYY-MM-DD'),
          addressees: newCopy,
        },
        cb: () => {
          history.replace('/home');
        },
      },
    });
  }
  selEvent = () => {
    const { history, dispatch, searchStaff: { selectStaff } } = this.props;
    const { info } = this.state;
    const newSelectStaff = { ...selectStaff };
    newSelectStaff.participants = info.participants;
    dispatch({
      type: 'searchStaff/saveSelectStaff',
      payload: {
        key: 'selectStaff',
        value: newSelectStaff,
      },
    });
    dispatch({
      type: 'buckle/saveData',
      payload: {
        key: 'info',
        value: { ...info },
      },
    });

    history.push('/sel_event');
  }
  infoToast = () => {
    const { event } = this.props;
    if (event.id) {
      Toast.info(
        <div>
          <p>A分范围：
            {event.point_a_min === 0 ? event.point_a_min : -event.point_a_min}-{event.point_a_max}
          </p>
          <p>B分范围：
            {event.point_b_min === 0 ? event.point_b_min : -event.point_b_min}-{event.point_b_max}
          </p>
        </div>);
    } else {
      Toast.info('请先选择事件');
    }
  }
  render() {
    const { searchStaff: { selectStaff }, event } = this.props;
    const { first, final, copy } = selectStaff;
    const {
      info: { participants, description, executedAt },
      optAll,
    } = this.state;
    let tmpPointA = participants[0] ? participants[0].point_a : '';
    let tmpPointB = participants[0] ? participants[0].point_b : '';
    let tmpCount = participants[0] ? participants[0].count : '';
    const newTempA = (participants || []).filter(item => item.point_a !== tmpPointA);
    if (newTempA.length) {
      tmpPointA = '';
    }
    const newTempB = (participants || []).filter(item => item.point_b !== tmpPointB);
    if (newTempB.length) {
      tmpPointB = '';
    }
    if ((participants || []).filter(item => item.count !== tmpCount).length) {
      tmpCount = '';
    }
    this.state.optAll.pointA = tmpPointA;
    this.state.optAll.pointB = tmpPointB;
    this.state.optAll.count = tmpCount;
    return (
      <div
        className={styles.con}
        direction="column"
      >
        <div className={styles.con_content}>
          <WhiteSpace size="sm" />

          <WingBlank className={style.parcel}>
            <List>
              <List.Item arrow="horizontal" onClick={this.selEvent}>
                {event && event.name ? event.name : '事件标题'}
              </List.Item>
              <TextareaItem
                placeholder="输入事件描述"
                rows={5}
                labelNumber={5}
                value={description}
                onChange={e => this.stateChange(e, 'description')}
              />
              <div className={style.textinfo}>
                还可输入{100 - description.length}字
              </div>
            </List>
          </WingBlank>
          <WhiteSpace size="sm" />

          <WingBlank className={style.parcel}>
            <DatePicker
              mode="date"
              value={executedAt}
              maxDate={new Date()}
              onChange={e => this.stateChange(e, 'executedAt')}
            >
              <List.Item arrow="horizontal">事件时间</List.Item>
            </DatePicker>

          </WingBlank>
          <WhiteSpace size="sm" />
          <WingBlank className={style.parcel}>
            <div className={style.players}>
              <Flex className={style.title}> 参与人</Flex>
              <Flex
                className={style.person_list}
                wrap="wrap"
              >
                {(participants || []).map((item, i) => {
                  const idx = i;
                  return (
                    <PersonIcon
                      key={idx}
                      value={item}
                      type="2"
                      nameKey="realname"
                      showNum={2}
                      handleDelClick={(e, v) => this.remove(e, v, 'participants')}
                    />
                  );
                })}
                <PersonAdd handleClick={() => this.addMore('participants', 2)} />
              </Flex>
            </div>
          </WingBlank>
          <WhiteSpace size="sm" />
          <WingBlank className={style.parcel}>
            <div className={style.players} style={{ paddingBottom: '0.48rem' }}>
              <Flex className={style.title}>
                <Flex.Item>参与人列表</Flex.Item>
                <Flex.Item
                  style={{
                    textAlign: 'right',
                    fontSize: '12px',
                    color: '#9b9b9b',
                    paddingRight: '0.48rem',
                    backgroundImage: `url(${prompt})`,
                    backgroundPosition: 'right center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '0.32rem',
                  }}
                  onClick={this.infoToast}
                >分值范围
                </Flex.Item>
              </Flex>
              <Flex className={style.table_head}>
                <Flex.Item className={style.table_item}>姓名</Flex.Item>
                <Flex.Item className={style.table_item}>A分</Flex.Item>
                <Flex.Item className={style.table_item}>B分</Flex.Item>
                <Flex.Item className={style.table_item}>计件</Flex.Item>
              </Flex>
              <div className={style.table_body}>
                <Flex>
                  <Flex.Item className={style.table_item}>全部操作</Flex.Item>
                  <Flex.Item className={style.table_item}>
                    <InputItem
                      value={tmpPointA}
                      style={{ ...(optAll.point_a_error ? { color: 'red' } : null) }}

                      onChange={e => this.pointChange(e, 'point_a')}
                    // onBlur={e => this.validNumer(e, 'point_a')}
                    />
                  </Flex.Item>
                  <Flex.Item className={style.table_item}>
                    <InputItem
                      value={tmpPointB}
                      style={{ ...(optAll.point_b_error ? { color: 'red' } : null) }}
                      onChange={e => this.pointChange(e, 'point_b')}
                    // onBlur={e => this.validNumer(e, 'point_b')}
                    />
                  </Flex.Item>
                  <Flex.Item className={style.table_item}>
                    <InputItem
                      value={tmpCount}
                      onChange={e => this.pointChange(e, 'count')}
                    // onBlur={e => this.validNumer(e, 'count')}
                    />
                  </Flex.Item>
                </Flex>
                {(participants || []).map((item, i) => {
                  const idx = i;
                  return (
                    <Flex key={idx}>
                      <Flex.Item className={style.table_item}>{item.realname}</Flex.Item>
                      <Flex.Item className={style.table_item}>
                        <InputItem
                          value={`${item.point_a}`}
                          style={{ ...(item.point_a_error ? { color: 'red' } : null) }}
                          onChange={e => this.pointChange(e, 'point_a', item)}
                          // onBlur={e => this.validNumer(e, 'point_a', item)}
                        />
                      </Flex.Item>
                      <Flex.Item className={style.table_item}>
                        <InputItem
                          style={{ ...(item.point_b_error ? { color: 'red' } : null) }}
                          value={`${item.point_b}`}
                          onChange={e => this.pointChange(e, 'point_b', item)}
                          // onBlur={e => this.validNumer(e, 'point_b', item)}
                        />
                      </Flex.Item>
                      <Flex.Item className={style.table_item}>
                        <InputItem
                          value={item.count}
                          style={{ ...(item.count_error ? { color: 'red' } : null) }}
                          onChange={e => this.pointChange(e, 'count', item)}
                        // onBlur={e => this.validNumer(e, 'count', item)}
                        />
                      </Flex.Item>
                    </Flex>);
                })
                }
              </div>
            </div>
          </WingBlank>
          <WhiteSpace size="sm" />
          <WingBlank className={style.parcel}>
            <div className={style.players}>
              <Flex className={style.title}> 初审人</Flex>
              <Flex
                className={style.person_list}
                wrap="wrap"
              >
                {(first || []).map((item, i) => {
                  const idx = i;
                  return (
                    <PersonIcon
                      key={idx}
                      value={item}
                      nameKey="realname"
                      showNum={2}
                      handleClick={event.first_approver_locked === 1 ? null : () => this.changePerson('first', 1)}
                      handleDelClick={event.first_approver_locked === 1 ? null : (e, v) => this.remove(e, v, 'first')}
                    />
                  );
                })}
                {first && (!first.length) ? <PersonAdd handleClick={() => this.addMore('first', 1)} /> : null}
              </Flex>
            </div>
          </WingBlank>
          <WhiteSpace size="sm" />
          <WingBlank className={style.parcel}>
            <div className={style.players}>
              <Flex className={style.title}> 终审人</Flex>
              <Flex
                className={style.person_list}
                wrap="wrap"
              >
                {(final || []).map((item, i) => {
                  const idx = i;
                  return (
                    <PersonIcon
                      key={idx}
                      value={item}
                      nameKey="realname"
                      showNum={2}
                      handleClick={event.final_approver_locked === 1 ? null : () => this.changePerson('final', 1)}
                      handleDelClick={event.final_approver_locked === 1 ? null : (e, v) => this.remove(e, v, 'final')}
                    />
                  );
                })}
                {final && (!final.length) ? <PersonAdd handleClick={() => this.addMore('final', 1)} /> : null}
              </Flex>
            </div>
          </WingBlank>
          <WhiteSpace size="sm" />
          <WingBlank className={style.parcel}>
            <div className={style.players}>
              <Flex className={style.title}> 抄送人</Flex>
              <Flex
                className={style.person_list}
                wrap="wrap"
              >
                {(copy || []).map((item, i) => {
                  const idx = i;
                  return (
                    <PersonIcon
                      key={idx}
                      value={item}
                      nameKey="realname"
                      showNum={2}
                      type="2"
                      handleDelClick={item.lock === 1 ? null : (e, v) => this.remove(e, v, 'copy')}
                    />
                  );
                })}
                <PersonAdd handleClick={() => this.addMore('copy', 2)} />
              </Flex>
            </div>
          </WingBlank>
        </div>
        <div className={styles.footer}>
          <WingBlank>
            <div className={style.opt}>
              <Button
                type="primary"
                onClick={this.record}
              >提交
              </Button>
            </div>
          </WingBlank>
        </div>
      </div>
    );
  }
}

