import NoProductInfoPage from "@widgets/error/NoProductInfoPage.vue";
import accommodationRoutes from "./accommodation";
import packageRoutes from "./package";
import stopRoutes from "./stop";
import errorRoutes from "./error";

export const BASE_ROUTE_PATH = "/:device(m|p)/product";

const SSR_TRAVEL_TYPE = {
  ACCOMMODATION: ["accommodation", "DMST_ACCOM"], // 숙박상세
  PACKAGE: ["package", "INTL_PKG"] // 패키지 상세
};

const SSR_TYPE = {
  ACCOMMODATION: ["accommodation", "sale"], // 숙박상세
  PACKAGE: ["package", "sale"], // 패키지 상세
  STOP: "stop", // 판매종료 (isOpen/isExposed 실패)
  SOLDOUT: "soldout", // 판매종료/중지 (BFF 3001)
  ERROR: "error" // API 오류 (BFF 1002/3000/기타)
};

// 페이지 정보를 기반으로 라우트 셋팅
function setupPageRoute({ travelType, productType }) {
  if ((!travelType || SSR_TRAVEL_TYPE.ACCOMMODATION.includes(travelType)) && SSR_TYPE.ACCOMMODATION.includes(productType)) {
    return accommodationRoutes.getRoutes();
  }
  if ((!travelType || SSR_TRAVEL_TYPE.PACKAGE.includes(travelType)) && SSR_TYPE.PACKAGE.includes(productType)) {
    return packageRoutes.getRoutes();
  }
  if (productType === SSR_TYPE.STOP || productType === SSR_TYPE.SOLDOUT) {
    return stopRoutes.getRoutes();
  }
  if (productType === SSR_TYPE.ERROR) {
    return errorRoutes.getRoutes();
  }
}

export const setupRouter = (VueRouter, setupSsrData) => {
  const pageRoutes = setupPageRoute(setupSsrData);
  // const pageRoutes = stopRoutes.getRoutes(); // 에러페이지 테스트용
  // const pageRoutes = errorRoutes.getRoutes(); // 에러페이지 테스트용

  return new VueRouter({
    mode: "history",
    routes: [
      ...pageRoutes,
      {
        path: "/:catchAll(.*)",
        component: NoProductInfoPage,
        name: "NotFound"
      }
    ]
  });
};
