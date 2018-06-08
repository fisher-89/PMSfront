import React from 'react';
import { TabBar } from 'antd-mobile';
import { tabbar } from '../../utils/convert'

export default class Footer extends React.Component {
  render() {
    const { pathname } = this.props

    return (
      <div>
        <TabBar
          unselectedTintColor="#949494"
          tintColor="#33A3F4"
          barTintColor="white"
        >
          {tabbar.map((item, i) => (
            <TabBar.Item
              title={item.title}
              key={i}
              icon={<div style={{
                width: '22px',
                height: '22px',
                background: `url(${item.icon}) center center /  21px 21px no-repeat`
              }}
                    />
              }
              selected={pathname == item.to}
              selectedIcon={<div style={{
                width: '22px',
                height: '22px',
                background: `url(${item.selIcon}) center center /  21px 21px no-repeat`
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
                this.props.history.push(item.to)
              }}
              data-seed="logId"
            >
            </TabBar.Item>
          )
          )}
        </TabBar>
      </div>
    );
  }
}
