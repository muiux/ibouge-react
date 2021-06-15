import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link, useHistory} from 'react-router-dom';
import useSocket from 'use-socket.io-client';
import {socketUrl} from '../../constants';
import DropForm from '../DropForm';

import {logOutUser} from '../../actions/authActions';
import {setTitle} from '../../actions/commonAction';
import {loadMeta} from '../../actions/userActions';
import {loadMyInbox} from '../../actions/inboxAction';
import {getAllUsers} from '../../actions/userActions';

import {
  newNotification,
  loadNotifications,
  readNewNotification,
  // notificationSuccess,
} from '../../actions/notificationAction';
import './styles.scss';

import logo from '../../assets/img/ibouge-home-logo.png';
import inboxEmpty from '../../assets/img/inbox-empty.png';
import inboxExist from '../../assets/img/inbox.png';
import notificationEmtpy from '../../assets/img/notification-empty.png';
import notificationExist from '../../assets/img/notification.png';
import emptyUser from '../../assets/img/upload-photo.png';

const Navbar = (props) => {
  const [pageTitle] = useState(props.title);
  const auth = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notification);
  const inbox = useSelector((state) => state.inbox);

  const [showMailDrop, setShowMailDrop] = useState(false);
  const [showNotificationDrop, setShowNotificationDrop] = useState(false);
  const [showMenuDrop, setShowMenuDrop] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [userList, setUserList] = useState([]);
  const [myInbox, setMyInbox] = useState(inbox);
  const [myNotifications, setMyNotification] = useState(notifications);
  const users = useSelector((state)=> state.users.users);
  const dispatch = useDispatch();
  const history = useHistory();

  const [socket] = useSocket(socketUrl);
  socket.connect();

  const onLogOut = () => {
    // event.preventDefault();
    dispatch(logOutUser());
    history.push('/login');
  };
  useEffect(() => {
    console.log(users)
    const userList = users.filter(x => searchName!=='' && (x.fname.toLowerCase().indexOf(searchName.toLowerCase()) > -1 || x.lname.toLowerCase().indexOf(searchName.toLowerCase()) > -1))
    setUserList(userList)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[searchName])
  useEffect(() => {
    setMyNotification(notifications)
  }, [notifications])
  useEffect(() => {
    dispatch(setTitle(pageTitle));
    dispatch(loadNotifications());
    dispatch(loadMyInbox());
    dispatch(getAllUsers());
    let interval = setInterval(function () {
      if (!auth.sess.is_online) {
        socket.emit('addUserID', {
          id: auth.sess._id,
        });
        clearInterval(interval);
      }
    }, 3000);
    socket.on('new-notification-to-show', function (event) {
      console.log('new notification to show')
      dispatch(newNotification({hasmessage: true}));
      dispatch(loadNotifications());
      setMyNotification({
        ...myNotifications,
        hasNewMessage: true,
      });
    });
    socket.on('newNotification', function (data) {
      dispatch(loadNotifications());
      console.log('----------------------newNotification navbar', data)
      if (data.type) {
        switch (data.type) {
          case 'addAsFriend':
            break;
          case 'unfriend':
            // dispatch(notificationSuccess({ text: 'qweqwe' }))
            // dispatch(newNotification())
            // socket.emit('new-notification', {
            //   from: data.to,
            //   to: data.from,
            //   type: 'addFriendSuccess',
            // });
            break;
          case 'acceptFriendRequest':
            console.log(data)
            // dispatch(notificationSuccess({
            //   text: 'You have a friend request from ' + data.username,
            //   date: Date.now(),
            //   link: '/profile/' + data.from,
            // }))
            dispatch(newNotification())
            break;
          case 'addFriendSuccess':
            // dispatch(notificationSuccess({ text: 'you are become friend with ' + data.from }))
            // dispatch(newNotification())
            break;
          default:
            break;
        }
      }
      if (myNotifications.isOpen) {
        dispatch(loadNotifications());
      } else if (myInbox.isOpen) {
        dispatch(loadNotifications());
        dispatch(loadMyInbox());
      } else {
        dispatch(loadMeta());
      }
    });

    socket.on('presence', function (presenceData) {
      const newData = [...myInbox.data];
      if (myInbox.data[0] && myInbox.data[0].users) {
        for (let j = 0; j < myInbox.data.length; j++) {
          for (let i = 0; i < myInbox.data[j].users.length; i++) {
            if (myInbox.data[j].users[i].user_id === presenceData.user_id) {
              newData[j].is_online = presenceData.status;
              break;
            }
          }
        }
        setMyInbox({...myInbox, data: newData});
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  window.onclick = function (event) {
    if (event.path.filter(x => x.id === 'notificationBox').length === 0 && showNotificationDrop) {
      setShowNotificationDrop(!showNotificationDrop);
    }
    else if (event.path.filter(x => x.id === 'emailBox').length === 0 && showMailDrop) {
      setShowMailDrop(!showMailDrop);
    }
  }
  return (
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
            aria-controls="#bs-example-navbar-collapse-1"
            aria-expanded="false"
            style={{
              marginTop: '8px',
              marginBottom: '0px',
              marginRight: '15px',
            }}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="logo" />
          </Link>
        </div>
        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav">
            <li className="navi-heads-subhead">
              <Link to="/mydashboard">MY DASHBOARD</Link>
            </li>
            <li className="navi-heads-subhead">
              <Link to="/mapOverview">MAP OVERVIEW</Link>
            </li>
            <li className="navi-heads-subhead">
              <Link to={`/profile/${auth.sess?._id}`}>MY PROFILE</Link>
            </li>
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <li>
              <div className="header-search">
                <input
                  id="searchText"
                  type="text"
                  className="search-form"
                  value={searchName}
                  placeholder="Type to search..."
                  onChange={(e) => { setSearchName(e.target.value) }}
                  // onBlur={(e) => { setSearchName('') }}
                />
                <button className="btn  search-form-search-btn" type="button">
                  <i className="fa fa-search"></i>
                </button>
                {userList.length > 0 &&
                  <ul className="user-list">
                    {userList.map(user => (
                      <li>
                        <img
                          src={'/static/media/' + (user.profile_pic ? user.profile_pic : 'upload-photo.2fda6558.png')}
                          alt=""
                          style={{
                            width: '40px',
                            height: '40px',
                            marginRight: '5px',
                          }}
                        />
                        <Link to={`/profile/${user._id}`}>
                          {user.fname + ' ' + user.lname}
                        </Link>
                      </li>
                    ))}
                  </ul>
                }
              </div>
            </li>
            <li className="hidden-xs">
              <div className="header-search">
                <div className="btn-group" id="emailBox">
                  <button
                    className="btn  search-form-search-btn"
                    type="button"
                    onClick={() => {
                      setShowMailDrop(!showMailDrop);
                    }}
                  >
                    <img
                      src={myInbox.hasNewMessage ? inboxExist : inboxEmpty}
                      className="top-nav-icons btnd"
                      alt="inbox"
                    />
                  </button>
                  {showMailDrop && (
                    <DropForm
                      name="Inbox"
                      data={myInbox}
                      cName="mail-dropdown"
                    />
                  )}
                </div>
              </div>
            </li>
            <li className="hidden-xs">
              <div className="header-search">
                <div className="btn-group" id="notificationBox">
                  <button
                    className="btn  dropdown-toggle search-form-search-btn"
                    type="button"
                    onClick={() => {
                      setShowNotificationDrop(!showNotificationDrop);
                      dispatch(readNewNotification())
                    }}
                  >
                    <img
                      src={
                        myNotifications.hasNewMessage
                          ? notificationExist
                          : notificationEmtpy
                      }
                      className="top-nav-icons"
                      alt="notification"
                    />
                  </button>
                  <div 
                  >
                    {showNotificationDrop && (
                      <DropForm
                        name="Notification"
                        data={myNotifications}
                        cName="notification-dropdown"
                        />
                        )}
                  </div>
                </div>
              </div>
            </li>
            <li className="hidden-xs">
              <div className="header-search">
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn  dropdown-toggle search-form-prof-btn"
                    id="dropdownMenu1"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    onClick={() => setShowMenuDrop(!showMenuDrop)}
                  >
                    <img
                      src={
                        auth.sess.profile_pic
                          ? auth.sess.profile_pic
                          : emptyUser
                      }
                      className="top-nav-prof-icons"
                      alt="user"
                    />
                    <span className="top-prof-name">
                      {auth.sess?.fname} {auth.sess?.lname}
                    </span>
                    <span className="caret prof-name-drop-ico"></span>
                  </button>
                  <ul
                    className={
                      showMenuDrop
                        ? 'dropdown-menu showMenuDrop'
                        : 'dropdown-menu'
                    }
                    aria-labelledby="dropdownMenu1"
                    role="menu"
                  >
                    <li>
                      <Link to="/myprofilesettings">Profile</Link>
                    </li>
                    <li>
                      <Link to="/myprofilesettings">Account</Link>
                    </li>
                    <li>
                      <Link to="/myprofilesettings">Privacy</Link>
                    </li>
                    <li>
                      <Link to="/myprofilesettings">Notifications</Link>
                    </li>
                    <li className="divider hidden-xs"></li>
                    <li style={{cursor: 'pointer'}}>
                      <a onClick={() => onLogOut()}>Sign Out</a>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
