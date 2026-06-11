import PackageProductDetailPage from "@widgets/package/PackageProductDetailPage.vue";
import { BASE_ROUTE_PATH } from "../index";

/**
 * 패키지 상세 페이지
 */
function getRoutes() {
  const routes = [
    {
      path: `${BASE_ROUTE_PATH}/:product_id`,
      component: PackageProductDetailPage
    }
  ];
  return routes;
}

export default {
  getRoutes
};
