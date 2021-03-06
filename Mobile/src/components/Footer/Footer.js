import React from 'react';
import { TabBar } from 'antd-mobile';
import { tabbar } from '../../utils/convert';

export default class FooterBar extends React.Component {
  render() {
    const { pathname } = this.props;

    return (
      <div style={{ position: 'fixed', width: '100%', bottom: 0 }}>
        <TabBar
          unselectedTintColor="#949494"
          tintColor="#33A3F4"
          barTintColor="white"
        >
          {tabbar.map((item, i) => {
            const idx = i;
            return (
              <TabBar.Item
                title={item.title}
                key={idx}
                icon={<div style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${item.icon}) center center /  21px 21px no-repeat`,
                }}
                />
                }
                selected={pathname === item.to}
                selectedIcon={<div style={{
                  width: '22px',
                  height: '22px',
                  background: `url(${item.selIcon}) center center /  21px 21px no-repeat`,
                }}
                />
                }
                onPress={() => {
                  // dispatch({
                  //   type: 'common/save',
                  //   payload: {
                  //     key: 'checkedIndex',
                  //     value: i
                  //   }
                  // })
                  this.props.history.push(item.to);
                }}
                data-seed="logId"
              />
            );
          }
          )}
        </TabBar>
      </div>
    );
  }
}
