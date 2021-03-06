import React from 'react';
import { Input, Button } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import OAForm, {
  DatePicker,
  SearchTable,
} from '../../../components/OAForm';
import { EventSearch } from '../../../components/SearchSelect';
import WorkingStaff from '../../common/Table/workingStaff';
// import { unicodeFieldsError } from '../../../utils/utils';

const FormItem = OAForm.Item;
const { TextArea } = Input;
@connect(({ event, loading }) => ({
  finalStaff: event.finalStaff,
  loading: loading.effects['buckle/addBuckle'],
  finalLoading: loading.effects['event/fetchFinalStaff'],
}))
@OAForm.create()
export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      eventId: null,
      pointRange: {
        point_a: {},
        point_b: {},
      },
      defaultPoint: {
        point_b: 0,
        point_a: 0,
        count: 1,
      },
    };
  }

  handleChange = (value) => {
    const a = parseFloat(value.point_a_default);
    const pointA = Math.floor(value.point_a_default) === a;
    const b = parseFloat(value.point_b_default);
    const pointB = Math.floor(value.point_b_default) === b;
    let addressees = value.default_cc_addressees || [];
    addressees = addressees.map(item => ({ ...item, disabled: true })) || [];
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ addressees: [...addressees] });
    if (value.first_approver_sn) {
      setFieldsValue({
        first: {
          first_approver_sn: value.first_approver_sn || '',
          first_approver_name: value.first_approver_name || '',
          disabled: value.first_approver_locked === 1,
        },
      });
    }

    if (value.final_approver_sn) {
      setFieldsValue({
        last: {
          final_approver_sn: value.final_approver_sn || '',
          final_approver_name: value.final_approver_name || '',
          disabled: value.final_approver_locked === 1,
        },
      });
    }

    setFieldsValue({ addressees: [...addressees] });
    this.setState({
      eventId: value.id,
      pointRange: {
        point_a: {
          min: value.point_a_min,
          max: value.point_a_max,
        },
        point_b: {
          min: value.point_b_min,
          max: value.point_b_max,
        },
      },
      defaultPoint: {
        point_a: pointA ? a : value.point_a_default,
        point_b: pointB ? b : value.point_b_default,
      },
    });
  }


  extraError = (error, values) => {
    const { setFields } = this.props.form;
    if (error.events && error.events[0]) {
      const eventError = error.events[0];
      Object.keys(eventError).forEach((key) => {
        setFields({ [key]: { ...eventError[key], value: values[key] } });
      });
    }
  }

  handleError = (error) => {
    const { onError } = this.props;
    onError(error, {
      final_approver_name: 'last',
      first_approver_name: 'first',
    }, this.extraError);
  }

  handleSubmit = (values) => {
    const { dispatch } = this.props;
    const events = [];
    events.push({
      event_id: values.event_id.id || '',
      description: values.description || '',
      participants: values.participants || '',
    });
    const params = { events, ...values };
    params.remaker = values.description || '';
    params.title = values.event_id.name || '';

    params.first_approver_sn = params.first.first_approver_sn || '';
    params.first_approver_name = params.first.first_approver_name || '';
    params.final_approver_sn = params.last.final_approver_sn || '';
    params.final_approver_name = params.last.final_approver_name || '';
    params.event_count = 1;
    params.participant_count = values.participants.length;

    params.addressees = values.addressees.map((item) => {
      const temp = { ...item };
      delete temp.disabled;
      return temp;
    });


    delete params.first;
    delete params.last;
    delete params.event_id;
    delete params.description;
    delete params.participants;

    dispatch({
      type: 'buckle/addBuckle',
      payload: params,
      onError: this.handleError,
      onSuccess: (result) => {
        dispatch(routerRedux.push(`/reward/buckle/success/${result.id}`));
      },
    });
  }


  fetchFianl = (params) => {
    const { dispatch } = this.props;
    dispatch({ type: 'event/fetchFinalStaff', payload: params });
  }


  makeColumns = () => {
    return [
      {
        title: '编号',
        dataIndex: 'staff_sn',
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
      }, {
        title: '职位',
        dataIndex: 'position_id',
      }, {
        title: '部门',
        dataIndex: 'department_id',
        width: 200,
      },
      {
        title: '状态',
        dataIndex: 'status_id',
        align: 'center',
      },
    ];
  }


  makeLastApproverProps = () => {
    const { finalStaff, finalLoading } = this.props;
    const tableProps = {
      index: 'staff_sn',
      data: finalStaff,
      loading: finalLoading,
      scroll: { x: 700 },
      serverSide: false,
      fetchDataSource: this.fetchFianl,
    };
    tableProps.columns = [
      {
        title: '编号',
        dataIndex: 'staff_sn',
        width: 100,
        sorter: true,
        searcher: true,
      },
      {
        title: '姓名',
        dataIndex: 'staff_name',
        width: 150,
        searcher: true,
      },
      {
        width: 100,
        title: 'A分加分上限',
        dataIndex: 'point_a_awarding_limit',
        rangeFilters: true,
      },
      {
        width: 100,
        title: 'A分减分上限',
        dataIndex: 'point_a_deducting_limit',
        rangeFilters: true,
      },
      {
        width: 100,
        title: 'B分加分上限',
        dataIndex: 'point_b_awarding_limit',
        rangeFilters: true,
      },
      {
        width: 100,
        title: 'B分减分上限',
        dataIndex: 'point_b_deducting_limit',
        rangeFilters: true,
      },
    ];
    return tableProps;
  }

  render() {
    const { form: { getFieldDecorator }, validateFields } = this.props;
    const { defaultPoint, eventId, pointRange } = this.state;
    const userInfo = window.user || {};
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const width = 670;

    return (
      <div style={{ width, margin: '0 auto' }}>
        <OAForm
          onSubmit={validateFields(this.handleSubmit)}
          style={{ padding: 10, width }}
        >
          <FormItem label="事件" {...formItemLayout}>
            {getFieldDecorator('event_id', {
              initialValue: {},
            })(
              <EventSearch
                onChange={this.handleChange}
              />
            )}
          </FormItem>
          <FormItem label="描述" {...formItemLayout}>
            {getFieldDecorator('description', {
              initialValue: '',
            })(
              <TextArea placeholder="请输入" />
            )}
          </FormItem>
          <FormItem label="参与人" {...formItemLayout} >
            {getFieldDecorator('participants', {
              initialValue: [],
            })(
              <WorkingStaff
                width={560}
                eventId={eventId}
                pointRange={pointRange}
                defaultPoint={defaultPoint}
              />
            )}
          </FormItem>
          <FormItem label="事件日期" {...formItemLayout}>
            {getFieldDecorator('executed_at', {
              initialValue: moment().format('L'),
            })(
              <DatePicker
                disabledDate={(currentData) => {
                  return currentData > moment();
                }}
                placeholder="请输入"
                showToday={false}
                style={{ width: '100%' }}
              />
            )}
          </FormItem>
          <FormItem label="初审人" {...formItemLayout} >
            {getFieldDecorator('first', {
              initialValue: {
                first_approver_sn: userInfo.staff_sn || '',
                first_approver_name: userInfo.realname || '',
              },
            })(
              <SearchTable.Staff
                mode="user"
                name={{
                  first_approver_sn: 'staff_sn',
                  first_approver_name: 'realname',
                }}
                showName="first_approver_name"
              />
            )}
          </FormItem>
          <FormItem label="终审人" {...formItemLayout} >
            {getFieldDecorator('last', {
              initialValue: {},
            })(
              <SearchTable
                mode="user"
                name={{
                  final_approver_sn: 'staff_sn',
                  final_approver_name: 'staff_name',
                }}
                showName="final_approver_name"
                tableProps={{
                  ...this.makeLastApproverProps(),
                }}
              />
            )}
          </FormItem>
          <FormItem label="抄送人" {...formItemLayout} >
            {getFieldDecorator('addressees', {
              initialValue: [],
            })(
              <SearchTable.Staff
                mode="user"
                multiple
                name={{ staff_sn: 'staff_sn', staff_name: 'realname', disabled: 'disabled' }}
                showName="staff_name"
              />
            )}
          </FormItem>
          <FormItem style={{ left: '50%', marginLeft: '-60px' }}>
            <Button style={{ width: 120 }} type="primary" htmlType="submit" >提交</Button>
          </FormItem>
        </OAForm>
      </div>
    );
  }
}
