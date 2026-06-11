import { getSsrInfo } from "@shared/utils/index";

export default {
  // 프로모션 정보
  isLoadingPromotion: state => state?.isLoadingPromotion,
  promotionInfo: state => {
    // /promotion/travel/qty 응답을 그대로 저장했으므로, 필요한 형식으로 변환
    const travelQtyResponse = state.promotionInfo;

    if (!travelQtyResponse) {
      return {
        orderFavors: [],
        discountApplyProductList: [],
        rawData: null
      };
    }

    // fvrCnts를 orderFavor.orderFavors[0].fvrCnts 형식으로 변환하여 기존 코드와 호환
    const orderFavors = travelQtyResponse.fvrCnts
      ? [
          {
            fvrCnts: travelQtyResponse.fvrCnts,
            fvrSubCnts: travelQtyResponse.orderDcAplyDispNm || null,
            fvrAplyAmt: travelQtyResponse.orderDcAplyTotAmt || 0
          }
        ]
      : [];

    return {
      orderFavors,
      discountApplyProductList: travelQtyResponse.discountApplyProductList || [],
      rawData: travelQtyResponse // 원본 응답도 함께 제공
    };
  },

  /**
   * 대표 이미지
   */
  mainImageInfo: () => {
    const ssrInfo = getSsrInfo();
    const propertyPhotoList = ssrInfo?.propertyPhotoList || [];

    return { propertyPhotoList };
  },

  /**
   * 기본 정보
   */
  basicInfo: () => {
    const ssrInfo = getSsrInfo();
    if (!ssrInfo?.saleProductCode) return {};

    const isSeason = ssrInfo?.isSeason ?? false;
    const isSpecial = ssrInfo?.isSpecial ?? false;

    // saleProduct 정보 세팅
    const saleProduct = {
      division: ssrInfo?.division,
      availFrom: ssrInfo?.availFrom,
      availTo: ssrInfo?.availTo,
      exhibitDate: ssrInfo?.exhibitDate,
      exhibitMinPrice: ssrInfo?.exhibitDate,
      exhibitMaxPrice: ssrInfo?.exhibitMaxPrice,
      isOpen: ssrInfo?.isOpen,
      isDomestic: ssrInfo?.isDomestic,
      country: ssrInfo?.country,
      countryName: ssrInfo?.countryName,
      city: ssrInfo?.city,
      cityName: ssrInfo?.cityName,
      flightInfo: ssrInfo?.flightInfo,
      nightCount: ssrInfo?.nightCount,
      dayCount: ssrInfo?.dayCount,
      shoppingCount: ssrInfo?.shoppingCount,
      saleProductCode: ssrInfo?.saleProductCode,
      adultPrice: ssrInfo?.adultPrice,
      reservationDivision: ssrInfo?.reservationDivision,
      hotelGradeCode: ssrInfo?.hotelGradeCode
    };

    // flightRemainSeatInfo 정보
    const flightRemainSeatInfo = {
      remainSeatCount: ssrInfo?.remainSeatCount,
      returnChange: ssrInfo?.returnChange,
      priceInfo: [
        {
          ageType: "A",
          amount: ssrInfo?.adultPrice
        },
        {
          ageType: "C",
          amount: 0
        },
        {
          ageType: "I",
          amount: 0
        }
      ]
    };

    return {
      ...ssrInfo,
      saleProduct,
      flightRemainSeatInfo,
      isSeason,
      isSpecial
    };
  }
};
