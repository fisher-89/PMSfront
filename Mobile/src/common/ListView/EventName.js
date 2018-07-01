import React, { Component } from 'react';
import ListView from '../../components/ListView';
import style from './index.less';

@ListView
export default class EventName extends Component {
  render() {
    const { value, onClick, checked, multiple, name } = this.props;
    const className = multiple ? { className: [style.item, checked ? style.checked : null].join(' ') } : null;
    return (
      <div className={style.action_item}>
        <div
          {...className}
          onClick={() => onClick(value)}
        >
          <span>{value[name]}</span>
        </div>
      </div>
    );
  }
}
EventName.defaultProps = {
  multiple: false,
};