import { getMaxFavorChageInfoService, getFavorBoxBenefitsService } from "@features/package/services/promotion";
import { getSsrInfo } from "@shared/utils";

export default {
  /**
   * 최초 진입시 프로모션 정보 가져오기
   * - SSR 데이터의 가격 정보 기준
   * - /promotion/travel/qty API 사용
   */
  async promotionAction({ commit }) {
    commit("SET_IS_LOADING_PROMOTION", true);
    try {
      const ssrInfo = getSsrInfo();
      const result = await getMaxFavorChageInfoService({
        slQty: 1,
        discountApplyProductList: [],
        priceInfo: { slPrc: ssrInfo?.slPrc },
        basicInfo: {},
        aplyBestPrcChk: "Y"
      });

      if (result.success && result.data) {
        // /promotion/travel/qty 응답을 그대로 저장
        commit("SET_IS_LOADING_PROMOTION", false);
        commit("SET_PROMOTION_INFO", result.data);
      } else {
        console.warn("프로모션 정보 조회 실패:", result.message);
        commit("SET_IS_LOADING_PROMOTION", false);
        commit("SET_PROMOTION_INFO", null);
      }
    } catch (error) {
      console.error("promotionAction 에러:", error);
      commit("SET_IS_LOADING_PROMOTION", false);
      commit("SET_PROMOTION_INFO", null);
    }
  },

  /**
   * 혜택함 정보 조회
   * - SSR 데이터의 가격 정보 기준
   * - /favorBox/benefits API 사용
   * @param {Object} context - Vuex context
   * @param {Object} payload - 요청 파라미터
   * @param {Array} payload.discountApplyProductList - 적용된 할인 상품 리스트
   * @param {string} payload.aplyBestPrcChk - 최대 할인혜택 적용 체크 ("Y"/"N")
   */
  async benefits({ commit }, payload = {}) {
    try {
      const ssrInfo = getSsrInfo();
      const priceInfo = {
        slPrc: payload.slPrc || ssrInfo?.slPrc,
        slQty: payload.slQty || 1
      };
      const basicInfo = {
        pyMnsExcpLst: payload.pyMnsExcpLst || ssrInfo?.pyMnsExcpLst || []
      };

      const response = await getFavorBoxBenefitsService({
        discountApplyProductList: payload.discountApplyProductList || [],
        aplyBestPrcChk: payload.aplyBestPrcChk || "N",
        priceInfo,
        basicInfo
      });

      // getFavorBoxBenefitsService는 response.data를 반환하므로
      // response가 { returnCode, message, data } 형식일 수 있음
      let dataToCommit = response;
      if (response?.data?.data) {
        // response.data.data 구조인 경우
        dataToCommit = response.data.data;
      } else if (response?.data) {
        // response.data 구조인 경우
        dataToCommit = response.data;
      }
      console.debug("dataToCommit", dataToCommit);
      // promotionInfo 모듈에 저장
      commit("promotionInfo/SET_FAVOR_BOX_BENEFITS", dataToCommit, { root: true });

      return { success: true, data: dataToCommit };
    } catch (error) {
      console.error("benefits 액션 에러:", error);
      commit("promotionInfo/SET_FAVOR_BOX_BENEFITS", null, { root: true });
      return { success: false, data: null, message: error.message || "혜택함 정보 조회 실패" };
    }
  }
};
