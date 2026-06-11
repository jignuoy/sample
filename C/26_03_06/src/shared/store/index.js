import Vue from "vue";
import Vuex from "vuex";

import packageStore from "@features/package/store";
import accommodation from "@features/accommodation/store";
import loading from "./loading";
import ssrData from "./ssrData";
import login from "./login";
import wish from "./wish";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    package: packageStore,
    accommodation,
    loading,
    ssrData,
    login,
    wish
  },
  strict: process.env.NODE_ENV !== "production"
});
