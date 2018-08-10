import React, { PureComponent } from 'react';
import { Layout, Menu, Icon, Spin, Tag, Dropdown, Avatar } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import Debounce from 'lodash-decorators/debounce';
import { Link } from 'dva/router';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
// import NoticeIcon from '../NoticeIcon';
// import HeaderSearch from '../HeaderSearch';
import SiderMenu from './SiderMenu';
import styles from './index.less';

const { Header } = Layout;

export default class GlobalHeader extends PureComponent {
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{ marginRight: 0 }}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  }

  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  render() {
    const {
      currentUser,
      onMenuClick,
      menuData,
      location,
      logo,
    } = this.props;
    let dropData = [];
    if (currentUser.realname) {
      dropData = [
        (<Menu.Item disabled key="user"><Icon type="user" />个人中心</Menu.Item>),
        (<Menu.Item disabled key="setting"><Icon type="setting" />设置</Menu.Item>),
        (<Menu.Divider key="Divider" />),
      ];
    }
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        {dropData}
        <Menu.Item key="logout">
          <Icon type="logout" />退出登录
        </Menu.Item>
      </Menu>
    );
    // const noticeData = this.getNoticeData();
    return (
      <Header className={styles.header}>
        <Link to="/" className={styles.logo} key="logo">
          <img src={logo} alt="logo" width="84" height="36" />
        </Link>
        <SiderMenu
          menuData={menuData}
          location={location}
        />
        <div className={styles.right}>
          <div className={styles.icon}>
            <span className={`${styles.action}`}>
              <Icon type="message" />
            </span>
            <span className={`${styles.action}`}>
              <Icon type="setting" />
            </span>
          </div>
          {currentUser.realname ? (
            <Dropdown overlay={menu}>
              <span className={`${styles.action} ${styles.account}`}>
                <Avatar size="small" className={styles.avatar} src={currentUser.avatar || '/default_avatar.png'} />
                <Ellipsis
                  tooltip
                  length={5}
                  className={styles.name}
                >
                  {currentUser.realname}
                </Ellipsis>
              </span>
            </Dropdown>
          ) :
            (
              <Dropdown overlay={menu}>
                <Spin size="small" style={{ marginLeft: 8, width: 80, lineHeight: 'inherit' }} />
              </Dropdown>
            )}
        </div>
      </Header>
    );
  }
}
