import state from "./state";
import mutations from "./mutations";
import actions from "./actions";
import getters from "./getters";

// modules
import ageInfo from "./modules/ageInfo";
import detailInfo from "./detailInfo/index";
import promotionInfo from "./promotionInfo/index";
import selectDateAndPersons from "./modules/selectDateAndPersons";

export default {
  namespaced: true,
  modules: {
    ageInfo,
    detailInfo,
    promotionInfo,
    selectDateAndPersons
  },
  state,
  mutations,
  actions,
  getters
};
