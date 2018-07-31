import React from 'react';
import DescriptionList from 'ant-design-pro/lib/DescriptionList';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import styles from '../../Check/Audit/index.less';
import { Approver, StaffCustormer, getApproverData } from '../../Check/Audit/checkInfo';
// import { getBuckleStatus } from '../../../utils/utils';

const { Description } = DescriptionList;


export default function CheckInfo({ data }) {
  const able = Object.keys(data).length;
  const { first, last } = getApproverData(data);
  const addrStaff = data.addressees || [];
  const addressees = addrStaff.map(item => item.staff_name);
  const recorder = data.recorder_name ? [data.recorder_name] : [];
  const participants = data.participants || [];
  return (
    <React.Fragment>
      <div className={styles.contentInfo}>
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
      </div>
      <div className={styles.contentInfo}>
        <div className={styles.eventTitle}>
          <div>事件配置</div>
          <div className={styles.eventCount} />
        </div>
        <DescriptionList size="large" col={1} >
          <Description className={styles.eventInfo}>
            {participants.map((item, index) => {
              const key = index;
              return (
                <p key={key}>
                  <Ellipsis length={3} className={styles.userName}>
                    {item.staff_name}
                  </Ellipsis>
                  <span className={styles.userPoint}>A：<i>{`${item.point_a * item.count} (${item.point_a}x${item.count})`}</i></span>
                  <span className={styles.userPoint}>B：<i>{`${item.point_b * item.count} (${item.point_b}x${item.count})`}</i></span>
                </p>
              );
            })}
          </Description>
        </DescriptionList>
      </div>
      <div className={styles.contentInfo}>
        <div className={styles.eventTitle}>
          <div>审核进度</div>
        </div>
        {able !== 0 && <Approver tip="初审人" data={first} />}
        {able !== 0 && <Approver tip="终审人" data={last} />}
        {addressees.length > 0 && (<StaffCustormer title="抄送人" data={addressees} />)}
        <StaffCustormer title="记录人" data={recorder} />
      </div>
    </React.Fragment>
  );
}