/**
 * Program: SDLUtil.js
 * Author: SDL
 * Description: SDL Common Util
 */
import _ from 'lodash';
import SdlModal from '@/components/common/control/modal';
import UserPopup from '@/components/common/popup/UserListPopup.vue';
import Vuei18n from '@/i18n';
import constants from '@/constants';
import { popups } from '../plugins/modal';

const API_URL = `${constants.API_URL}`;
const WEB_CONTEXT_PATH = `${constants.WEB_CONTEXT_PATH.replace(/\/$/, '')}`;
const DEFAULT_LANG = `${constants.DEFAULT_LANG}`;
const RESOURCE_MODE = `${constants.RESOURCE_MODE}`;
const STREAMDOCS_URL = `${constants.STREAMDOCS_URL}`;
// let codeList = [];     // nspCodeUtil.js 로 이관

/**
 * param:
 * return: boolean
 * exception:
 * Description : Check whether you are logged in or not
 */
const isLogin = () => localStorage.getItem('user') !== null && localStorage.getItem('user') !== '' && localStorage.getItem('userToken') !== null && localStorage.getItem('userToken') !== '';

/**
 * param:
 * return: json userinfo
 * exception:
 * Description : Logged in User Information
 */
const getLoginedUserInfo = () => {
  return isLogin() ? JSON.parse(localStorage.getItem('user')) : undefined;
};

/**
 * param: key : message key(String)
 * param: replaces : param(Array) ex) properties text : {0} {1} three => param ["one", "two"]
 * return: string
 * exception:
 * Description : get message properties
 */
// i18n 에 key등록 안되어 있으면 key 에서 replace 해주는 로직 추가.
// const getMsgProp = (key, replaces) => Vuei18n.global.t(key, replaces);
const getMsgProp = (key, replaces) => (Vuei18n.global.t(key) !== key ? Vuei18n.global.t(key, replaces) : key.replace(/\{(\d+)\}/g, (_, i) => replaces[i] ?? `{${i}}`));

/**
 * param:
 * return: string
 * exception:
 * Description : the language currently set
 */
const getI18nLanguage = () => Vuei18n.locale;

/**
 * param: lang(String)
 * return:
 * exception:
 * Description : Language Settings
 */
const setI18nLanguage = lang => {
  Vuei18n.locale = lang;
};

/**
 *
 * @param param
 * Description : alert, confirm button handler
 */
const okHandler = param => {
  SdlModal.app.config.globalProperties.$modal.hide('dialog');
  if (param.onOkEvt !== null && typeof param.onOkEvt === 'function') {
    param.onOkEvt();
  }
};
const cancelHandler = param => {
  SdlModal.app.config.globalProperties.$modal.hide('dialog');
  if (param.onCancelEvt !== null && typeof param.onCancelEvt === 'function') {
    param.onCancelEvt();
  }
};

/**
 * param: msg -> message(String)
 * param: title -> title(String)
 * param: okLabel -> ok button text(String)
 * param: onOkEvt -> ok click event(Function)
 * return:
 * exception:
 * Description : alert
 */
const alert = (params, replaces) => {
  let param = {
    msg: '',
    title: '',
    okLabel: '',
    onOkEvt: () => {},
  };
  if (typeof params === 'string') {
    param = Object.assign(param, { msg: params });
  } else {
    param = Object.assign(param, params);
  }
  SdlModal.app.config.globalProperties.$modal.show('dialog', {
    title: getMsgProp(param.title) || getMsgProp('sdl.common.label.confirm'),
    text: getMsgProp(param.msg, replaces),
    buttons: [
      {
        title: getMsgProp(param.okLabel) || getMsgProp('sdl.common.label.confirm'),
        default: false,
        handler: () => {
          okHandler(param);
        },
      },
    ],
  });
};

/**
 * param: error message(json)
 * return:
 * exception:
 * Description : error alert
 */
const errorAlert = err => {
  let msg = 'sdl.commonError'; // default error 메세지
  let title = 'EH0005'; // default title : Error
  if (err && err.data && err.data.error) {
    if (err.data.error.message && err.data.error.message !== '') {
      msg = err.data.error.message;
      //SDLUTil 의 메세징은 \n 이 아니고 <br> 이다.
      msg = msg.replaceAll('\\n', '\n');
      msg = msg.replaceAll('\n', '<br/>');
      // reason 에 java stack 이 출력되어 임시 주석처리
      // } else if (err.data.error.reason && err.data.error.reason !== '') {
      // msg = err.data.error.reason;
    }
    if (err.data.error.title) {
      title = err.data.error.title;
    }
  }
  alert({ title: title, msg, okLabel: 'Close' });
};

/**
 * param: msg -> message(String)
 * param: title -> title(String)
 * param: okLabel -> ok button text(String)
 * param: cancelLabel -> cancel button text(String)
 * param: onOkEvt -> ok click event(Function)
 * param: onCancelEvt -> cancel click event(Function)
 * return:
 * exception:
 * Description : confirm
 */
const confirm = params => {
  let param = {
    msg: '',
    title: '',
    okLabel: '',
    cancelLabel: '',
    onOkEvt: () => {},
    onCancelEvt: () => {},
  };
  param = Object.assign(param, params);
  SdlModal.app.config.globalProperties.$modal.show('dialog', {
    title: getMsgProp(param.title) || getMsgProp('sdl.common.label.confirm'),
    text: getMsgProp(param.msg),
    buttons: [
      {
        title: getMsgProp(param.cancelLabel) || getMsgProp('sdl.common.label.cancel'),
        default: true,
        handler: () => {
          cancelHandler(param);
        },
      },
      {
        title: getMsgProp(param.okLabel) || getMsgProp('sdl.common.label.confirm'),
        default: false,
        handler: () => {
          okHandler(param);
        },
      },
    ],
  });
};

/**
 * param: modal (import vue)
 * param: Please refer to http://devops.sdsdev.co.kr/confluence/display/SDL/Modal
 * return:
 * exception:
 * Description : modal popup
 */
const show = (modal, props, params, callback) => {
  if (typeof modal === 'string') {
    modal = defineAsyncComponent(popups[modal].component);
  }
  SdlModal.app.config.globalProperties.$modal.show(modal, props, params, callback);
};

/**
 * param: true/false (Boolean)
 * return:
 * exception:
 * Description : default loading bar show/hide
 */
const showLoadingBar = (flag, args) => {
  if (flag) {
    SdlModal.app.config.globalProperties.$modal.show('loadingbar', args);
  } else {
    SdlModal.app.config.globalProperties.$modal.hide('loadingbar');
  }
};

/**
 * param:
 * return: array
 * exception:
 * Description : Import a complete list of codes.
 */
// const loadAllCommCodeList = () =>
//   axios
//     .get(`${API_URL}/commcode/groupcodes/all-commcodes`)
//     .then(response => {
//       codeList = response.data;
//     })
//     .catch(error => {
//       // handle error
//       console.log(error);
//     });

/**
 * param: commCodeTypeId -> groupcode(String)
 * param: sort -> {sortColumn : String, sortType : asc/desc}
 * return: array
 * exception:
 * Description : Code list return for a specific parentId in the entire code list
 */
// const getCommCodeList = params => {
//   let param = {
//     commCodeTypeId: '',
//     sort: { sortColumn: 'ord', sortType: 'asc' },
//   };
//   param = Object.assign(param, params);
//
//   return _.orderBy(
//     codeList.filter(code => code.commCodeTypeId === param.commCodeTypeId),
//     param.sort.sortColumn,
//     param.sort.sortType,
//   );
// };

/**
 * param: searchColumn(userName, knoxId, epId, email)
 * param: searchTxt -> search text(String)
 * param: rtnFunc -> Function to receive a list of discovered users
 * param: knoxSearch -> true(knox search), false(db search(default))
 * return:
 * exception:
 * Description : user search popup
 */
const openUserPopup = param => {
  show(
    UserPopup,
    param, // component에서 props 로 선언한 인자 전달
    {
      width: 850,
      height: 'auto',
    }, // 모달로 전달할 Properties
  );
};

/**
 * param: url -> script url path
 * return:
 * exception:
 * Description : es6 can not be imported from es legacy script.
 */
const importJS = url =>
  new Promise((resolve, reject) => {
    // Skip if it already exists
    if (document.querySelectorAll(`script[src="${url}"]`).length !== 0) {
      setTimeout(() => {
        if (window.cafe) resolve(window);
        else {
          setTimeout(() => {
            if (window.cafe) resolve(window);
            else reject({ data: { error: { reason: 'Script is not loaded' } } });
          }, 700);
        }
      }, 300);
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.addEventListener('load', () => resolve(window), false);
    script.addEventListener('error', () => reject(script), false);
    document.body.appendChild(script);
  });

/**
 * param:
 * return:
 * exception:
 * Description : es6 can not be imported from es legacy script.
 */
const importChartJS = () =>
  new Promise((resolve, reject) => {
    // Skip if it already exists
    if (document.querySelectorAll(`script[src="/rMateChartH5/JS/rMateChartH5.js"]`).length !== 0) {
      setTimeout(() => {
        if (window) resolve(window);
        else {
          setTimeout(() => {
            if (window) resolve(window);
            else reject({ data: { error: { reason: 'Script is not loaded' } } });
          }, 700);
        }
      }, 300);
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/rMateChartH5/JS/rMateChartH5.js';
    script.addEventListener('load', () => resolve(window), false);
    script.addEventListener('error', () => reject(script), false);
    document.body.appendChild(script);
  });

/**
 * param: boardId(String)
 * return: Array
 * exception:
 * Description : Information generated. list in menu management boards page/api
 */
const getBoardPageApiList = (boardId, boardType, roleType) => ({
  page: [
    {
      authorizationType: 'READ',
      pageName: '게시글 목록',
      pagePath: `/board/${boardId}/${roleType}/list`,
      componentName: 'admin/board/PostList',
      isEdited: true,
    },
    {
      authorizationType: 'EXECUTE',
      pageName: '게시글 등록',
      pagePath: `/board/${boardId}/${roleType}/regist`,
      componentName: 'admin/board/PostEdit',
      isEdited: true,
    },
    {
      authorizationType: 'READ',
      pageName: '게시글 상세',
      pagePath: `/board/${boardId}/${roleType}/view/:postId/:viewType`,
      componentName: 'admin/board/PostView',
      isEdited: true,
    },
    {
      authorizationType: 'UPDATE',
      pageName: '게시글 수정',
      pagePath: `/board/${boardId}/${roleType}/edit/:postId`,
      componentName: 'admin/board/PostEdit',
      isEdited: true,
    },
    {
      authorizationType: 'EXECUTE',
      pageName: '답글 등록',
      pagePath: `/board/${boardId}/${roleType}/reply/:postId`,
      componentName: 'admin/board/PostEdit',
      isEdited: true,
    },
  ],
  api: [
    {
      authorizationType: 'READ',
      apiName: '게시판 상세 정보 조회',
      httpMethod: 'GET',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'READ',
      apiName: '공지사항 목록 조회',
      httpMethod: 'GET',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/notice-label-posts`,
      useYn: 'Y',
    },
    {
      authorizationType: 'READ',
      apiName: '게시글 목록 조회(페이징)',
      httpMethod: 'GET',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts-with-paging`,
      useYn: 'Y',
    },
    {
      authorizationType: 'READ',
      apiName: '게시글 상세조회',
      httpMethod: 'GET',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts/{postId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'EXECUTE',
      apiName: '게시글 등록',
      httpMethod: 'POST',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts`,
      useYn: 'Y',
    },
    {
      authorizationType: 'UPDATE',
      apiName: '게시글 수정',
      httpMethod: 'PUT',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts/{postId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'EXECUTE',
      apiName: '게시글 삭제',
      httpMethod: 'DELETE',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts/{postId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'EXECUTE',
      apiName: '게시글 추천',
      httpMethod: 'POST',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts-recommend/{postId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'READ',
      apiName: '댓글 목록 조회',
      httpMethod: 'GET',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts/{postId}/comments`,
      useYn: 'Y',
    },
    {
      authorizationType: 'EXECUTE',
      apiName: '댓글 등록',
      httpMethod: 'POST',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts/{postId}/comments`,
      useYn: 'Y',
    },
    {
      authorizationType: 'UPDATE',
      apiName: '댓글 수정',
      httpMethod: 'PUT',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts/{postId}/comments/{commentId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'EXECUTE',
      apiName: '댓글 삭제',
      httpMethod: 'DELETE',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts/{postId}/comments/{commentId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'EXECUTE',
      apiName: '댓글 평가(추천/반대)',
      httpMethod: 'POST',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/boards/${boardId}/posts/{postId}/comment-consent/{commentId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'EXECUTE',
      apiName: '파일 업로드',
      httpMethod: 'POST',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: '/resource/attachments/multifile-upload',
      useYn: 'Y',
    },
    {
      authorizationType: 'DOWNLOAD',
      apiName: '파일 다운로드',
      httpMethod: 'GET',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/resource/attachments/file-download/{fileId}?downloadType=${boardId}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'DOWNLOAD',
      apiName: '파일 다운로드(Multi)',
      httpMethod: 'GET',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/resource/attachments/multifile-download?downloadType=${boardId}${_.eq(boardType, 'BASIC') ? '' : '_IMAGE'}`,
      useYn: 'Y',
    },
    {
      authorizationType: 'READ',
      apiName: '이미지 다운로드',
      httpMethod: 'GET',
      serverId: 'AWwHn0OqABHw5fDS',
      apiUrl: `/resource/attachments/file-download/{fileId}?downloadType=${boardId}_IMAGE`,
      useYn: 'Y',
    },
  ],
});

/**
 * param: Object
 * return: formData
 * exception:
 * Description : change object to formData
 */
const formParameters = obj => {
  const formData = new FormData();
  Object.keys(obj).forEach(key => {
    if (obj[key]) {
      formData.append(key, obj[key]);
    }
  });
  return formData;
};

const validList = [];

/**
 * param: Object
 * return:
 * exception:
 * Description : Save Validation on Page as a list
 */
const setValidList = el => {
  validList.push(el);
};

/**
 * param: groupId => String
 * return:
 * exception:
 * Description : Delete Validation list corresponding to groupId
 */
const deleteValidList = (el, groupId) => {
  for (let i = 0; i < validList.length; i += 1) {
    if (validList[i].groupId === groupId && validList[i].el === el) {
      validList.splice(i, 1);
      // i -= -1;
      break;
    }
  }
};

/**
 * param: groupId => String
 * return:
 * exception:
 * Description : Call all onBlur events on page
 */
const onSubmitValidation = groupId => {
  if (!groupId) {
    groupId = '';
  }
  let flag = false;
  for (let i = 0; i < validList.length; i += 1) {
    if (validList[i].groupId === groupId) {
      validList[i].el.focus();
      validList[i].el.blur();
      if (validList[i].el.classList.contains('is-invalid')) {
        // validList[i].focus();
        flag = true;
        break;
      }
    }
  }
  return flag;
};

/**
 * param:
 * return:
 * exception:
 * Description : delete all is-invalid css
 */
const clearAllIsInvalidCss = () => {
  Array.from(document.querySelectorAll('.is-invalid')).forEach(ele => ele.classList.remove('is-invalid'));
};

/**
 * param:
 * return:
 * exception:
 * Description : parse jwttoken
 */
const parseJwt = token => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );

  return JSON.parse(jsonPayload);
};

/**
 *
 */
const getCodeResourceUrl = () => {
  const ver = localStorage.getItem('code-ver');
  const mode = localStorage.getItem('mode');
  if (_.isEmpty(ver) || mode != 'CACHE') return API_URL + '/commcode/groupcodes/all-commcodes';
  else {
    const user = getLoginedUserInfo();
    return '/cache/code/' + ver + '/commcodes-' + user.language + '.json';
  }
};

const getAllMessageResourceUrl = () => {
  const ver = localStorage.getItem('message-ver');
  const mode = localStorage.getItem('mode');
  if (_.isEmpty(ver) || mode != 'CACHE') return API_URL + '/noauth/messages/all';
  else {
    return '/cache/message/' + ver + '/messages-default.json';
  }
};

const getMessageResourceUrl = () => {
  const ver = localStorage.getItem('message-ver');
  const mode = localStorage.getItem('mode');
  if (_.isEmpty(ver) || mode != 'CACHE') return API_URL + '/my-messages';
  else {
    return '/cache/message/' + ver + '/messages-default.json';
  }
};

const getUserLocaleMessageUrl = () => {
  const ver = localStorage.getItem('message-ver');
  const mode = localStorage.getItem('mode');
  if (_.isEmpty(ver) || mode != 'CACHE') return undefined;
  else {
    return API_URL + '/my-locale-messages';
  }
};

/**
 * param: 개행문자를 <br> 태그로 변경
 * return:
 * exception:
 */
const nl2Br = str => _.replace(str, /(\r?\n)/g, '<br/>');

export default {
  API_URL,
  WEB_CONTEXT_PATH,
  DEFAULT_LANG,
  isLogin,
  getLoginedUserInfo,
  getMsgProp,
  getI18nLanguage,
  setI18nLanguage,
  alert,
  errorAlert,
  confirm,
  show,
  showLoadingBar,
  // loadAllCommCodeList,    // nspCodeUtil.js 로 이관
  // getCommCodeList,    // nspCodeUtil.js 로 이관
  openUserPopup,
  importJS,
  importChartJS,
  getBoardPageApiList,
  formParameters,
  // onBlurValidation,
  onSubmitValidation,
  // etcValidationObj,
  setValidList,
  deleteValidList,
  clearAllIsInvalidCss,
  parseJwt,
  nl2Br,
  getAllMessageResourceUrl,
  getMessageResourceUrl, // default message  URL  all lang _99
  getCodeResourceUrl, // Code Resource RUL
  getUserLocaleMessageUrl, // user local message url userLang_99
  STREAMDOCS_URL,
};
