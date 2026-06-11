import { getCookieVal, isEmpty } from "@shared/utils";

export default {
  namespaced: true,
  state: () => ({
    foMno: null,
    isLogin: false
  }),

  mutations: {
    SET_FO_M_NO(state, payload) {
      state.foMno = payload;
    },
    SET_IS_LOGIN(state, payload) {
      state.isLogin = payload;
    }
  },

  getters: {
    isLogin: state => state.isLogin
  },

  actions: {
    // 쿠키 업데이트
    cookieUpdateAction({ commit }) {
      const foMno = getCookieVal("fo_mno");
      commit("SET_FO_M_NO", foMno);
    },

    async checkLoginAction({ state, commit, dispatch }) {
      // 1. 쿠키 업데이트
      await dispatch("cookieUpdateAction");
      const { foMno } = state;

      // 2-1. 기본 로그인 체크
      const isNormalLogin = isEmpty(foMno) ? false : true;
      if (isNormalLogin) {
        commit("SET_IS_LOGIN", true);
        return;
      }

      commit("SET_IS_LOGIN", false);
    },

    goLoginAction() {
      /* 로그인페이지 이동  */
      const { href } = window.location;
      const url = `${import.meta.env.VITE_APP_SERVICE_URL}/member/gate/forwarding/login?rtnUrl=${href}`;
      window.location.assign(url);
    }
  }
};
