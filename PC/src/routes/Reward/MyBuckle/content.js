import React from 'react';
import classNames from 'classnames';
import DescriptionList from 'ant-design-pro/lib/DescriptionList';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import styles from '../../Check/Audit/index.less';
import { Approver, StaffCustormer, getApproverData } from '../../Check/Audit/checkInfo';
import { getStatusImg } from '../../../utils/utils';

const { Description } = DescriptionList;


export default function CheckInfo({ data }) {
  const { first, last } = getApproverData(data);
  const addrStaff = data.addressees || [];
  const addressees = addrStaff.map(item => item.staff_name);
  const recorder = data.recorder_name ? [data.recorder_name] : [];
  const participants = data.participants || [];
  const statusImg = getStatusImg(data.status_id);
  const { user } = window || { user: {} };
  return (
    <React.Fragment>
      <div className={styles.contentInfo} style={{ position: 'relative' }}>
        <DescriptionList size="large" title="基础信息" col={1} >
          <Description term="事件标题">
            {data.event_name}
          </Description>
          <Description term="事件时间">
            {data.executed_at}
          </Description>
          <Description term="事件内容">
            {data.description}
          </Description>
        </DescriptionList>
        <img src={statusImg} alt="" style={{ position: 'absolute', top: 10, right: 10 }} />
      </div>
      <div className={styles.contentInfo}>
        <div className={styles.eventTitle}>
          <div>参与人</div>
          <div className={styles.eventCount} />
        </div>
        <DescriptionList size="large" col={1} >
          <Description className={styles.eventInfo} style={{ marginBottom: 0 }}>
            {participants.map((item, index) => {
              const key = index;
              const cls = classNames(styles.user, {
                [styles.userColor]: user.staff_sn === item.staff_sn,
              });
              return (
                <div key={key} className={cls}>
                  <Ellipsis lines={1} className={styles.userName} style={{ marginRight: 36 }}>
                    {item.staff_name}
                  </Ellipsis>
                  <span className={styles.userPoint}>A：<i>{`${item.point_a * item.count} (${item.point_a}x${item.count})`}</i></span>
                  <span className={styles.userPoint}>B：<i>{`${item.point_b * item.count} (${item.point_b}x${item.count})`}</i></span>
                </div>
              );
            })}
          </Description>
        </DescriptionList>
      </div>
      {(first.staff_sn || last.staff_sn || addressees.length > 0 || recorder.length > 0) && (
        <div className={styles.contentInfo}>
          <div className={styles.eventTitle}>
            <div>审核进度</div>
          </div>
          {!!first.staff_sn && <Approver tip="初审人:" data={first} />}
          {!!last.staff_sn && <Approver tip="终审人:" data={last} />}
          {addressees.length > 0 && <StaffCustormer title="抄送人" data={addressees} />}
          {recorder.length > 0 && <StaffCustormer title="记录人" data={recorder} extar={data.revoke_remark} />}
        </div>
      )}
    </React.Fragment>
  );
}
