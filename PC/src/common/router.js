import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) => (
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  })
);

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach((model) => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return (props) => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () => models.filter(
      model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)
    ),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return props => createElement(Component, {
          ...props,
          routerData: routerDataCache,
        });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

const model = [
  'currentUser',
  'brand',
  'position',
  'department',
  'staffs',
  'event',
  'buckle',
  'table',
  'tabs',
  'point',
];

export const getRouterData = (app) => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, model, () => import('../layouts/BasicLayout')),
    },
    '/test': {
      component: dynamicWrapper(app, [], () => import('../routes/Test')),
    },
    '/reward/buckle': {
      component: dynamicWrapper(app, [], () => import('../routes/Reward/Buckle')),
    },
    '/reward/insert-record': {
      component: dynamicWrapper(app, [], () => import('../routes/Reward/InsertRecord')),
    },
    '/reward/buckle/submission/:id': {
      component: dynamicWrapper(app, [], () => import('../routes/Reward/Buckle/Form')),
    },
    '/reward/buckle/success/:id': {
      component: dynamicWrapper(app, [], () => import('../routes/Reward/Success')),
    },
    '/reward/my': {
      component: dynamicWrapper(app, [], () => import('../routes/Reward/MyBuckle')),
    },
    '/check/audit': {
      component: dynamicWrapper(app, [], () => import('../routes/Check/Audit')),
    },
    '/check/my-peruser': {
      component: dynamicWrapper(app, [], () => import('../routes/Check/MyPeruser')),
    },
    '/point/my': {
      component: dynamicWrapper(app, [], () => import('../routes/Point/my')),
    },
    '/point/ranking': {
      component: dynamicWrapper(app, [], () => import('../routes/Point/ranking')),
    },
    '/point/ranking/count/:staff_sn': {
      component: dynamicWrapper(app, [], () => import('../routes/Point/ranking/count')),
    },

    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/triggerException')),
    },
    '/blank': {
      component: dynamicWrapper(app, [], () => import('../layouts/BlankLayout')),
    },
    '/passport/get_access_token': {
      component: dynamicWrapper(app, ['oauth'], () => import('../routes/Oauth/GetAccessToken')),
    },
    '/passport/refresh_access_token': {
      component: dynamicWrapper(app, ['oauth'], () => import('../routes/Oauth/RefreshAccessToken')),
      authority: 'refresh-token',
      redirectPath: '/passport/redirect_to_authorize',
    },
    '/passport/redirect_to_authorize': {
      component: dynamicWrapper(app, [], () => import('../routes/Oauth/RedirectToAuthorize')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());
  const routerData = {};
  Object.keys(routerConfig).forEach((item) => {
    const menuItem = menuData[item.replace(/^\//, '')] || {};
    routerData[item] = {
      ...routerConfig[item],
      name: routerConfig[item].name || menuItem.name,
      authority: routerConfig[item].authority || menuItem.authority,
    };
  });

  return routerData;
};
