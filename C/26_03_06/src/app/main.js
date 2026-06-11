import "./initVueGlobal.js";
import Vue from "vue";
import VueRouter from "vue-router";
import store from "@store/index.js";
import "@styles/global.scss";
import { setupHttpClient } from "@shared/http/httpClient";
import { setupRouter } from "./vueRouter";
import { loadAllScript } from "./loadScript";
import { setupSsrDataInit } from "./initialize";
import pluginDayJs from "./plugins/dayjs";
import Meta from "vue-meta";
import Affix from "vue-affix";
import VTooltip from "v-tooltip";
import VModal from "vue-js-modal";
import affixResize from "./directives/affixResize";

// Vue 실행 전 준비 로직
async function prepareApp() {
  console.log("%c[prepareApp] 앱 실행 전 준비", "color: #219ebc; font-weight: bold; font-size: 16px;");
  console.group("prepareApp");

  // 필수 스크립트 로드
  await loadAllScript({ isNoCache: false });

  // SSR DATA 초기화
  const setupSsrData = setupSsrDataInit();
  await store.dispatch("ssrData/ssrInitAction", setupSsrData);

  // 라우터 셋팅
  const router = setupRouter(VueRouter, setupSsrData);

  // Vue 라이브러리 설치 (VueRouter는 먼저 설치)
  Vue.use(VueRouter);
  Vue.use(Meta);
  Vue.use(pluginDayJs);

  // 퍼블 관련
  Vue.use(Affix);
  Vue.use(VTooltip);
  Vue.use(VModal, {
    dynamic: true,
    injectModalsContainer: true
  });
  Vue.directive("affix-resize", affixResize);

  // foCommon 스크립트 로드 후 window.Vue가 바뀔 수 있음 → 앱과 동일한 Vue(esm)로 복구 (이중 Vue 방지)
  window.Vue = Vue;

  // foCommon 플러그인 설치 (라우터와 store가 이미 초기화된 후)
  if (window["foCommon.v1.0"]?.install) {
    try {
      Vue.use(window["foCommon.v1.0"].install);
    } catch (error) {
      console.error("Error during foCommon plugin installation:", error);
    }
  }

  if (window.Vue && Vue.loadScript && !window.Vue.loadScript) {
    window.Vue.loadScript = Vue.loadScript;
  } else if (Vue.loadScript && !window.Vue?.loadScript) {
    console.error("[main.js] window.Vue.loadScript 동기화 실패");
  }

  const app = new Vue({
    router,
    render: h => h("router-view"),
    store
  });

  setupHttpClient({
    withCredentials: true
  });

  console.groupEnd();
  return Promise.resolve({
    app,
    setupSsrData
  });
}

function appMount({ app, setupSsrData }) {
  console.log("%c[appMount]", "color: #2a9d8f; font-weight: bold; font-size: 16px;");
  console.group("appMount");
  app.$mount("#app");
  console.groupEnd();
  return {
    setupSsrData
  };
}

prepareApp().then(appMount);
