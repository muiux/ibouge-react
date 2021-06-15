import {
  NEW_NOTIFICATION,
  READ_NEW_NOTIFICATION,
  NOTIFICATION_LOADING,
  NOTIFICATION_SUCCESS,
  SET_GROUP_CHAT_MODAL_STATUS,
} from './action_types/notification';

export const newNotification = (payload) => ({
  type: NEW_NOTIFICATION,
  payload,
});
export const readNewNotification = (payload) => ({
  type: READ_NEW_NOTIFICATION,
  payload,
});
export const loadNotifications = () => ({
  type: NOTIFICATION_LOADING,
});
export const setGroupChatModalStatus = (payload) => ({
  type: SET_GROUP_CHAT_MODAL_STATUS,
  payload,
});
export const notificationSuccess = (payload) => ({
  type: NOTIFICATION_SUCCESS,
  payload,
});
