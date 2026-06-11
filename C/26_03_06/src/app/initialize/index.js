/**
 * SSR 정보 초기화
 */
export const setupSsrDataInit = () => {
  let setupSsrData = null;
  try {
    const appElement = document.querySelector("#app");
    const appElementDataset = appElement.dataset;
    const travelType = appElementDataset?.travelType;
    const productType = appElementDataset?.productType;
    const ssrInfo = appElementDataset?.ssrInfo;
    console.groupCollapsed("%c[metaData]: ssrInfo", "color: #219ebc; font-weight: bold; font-size: 12px;");
    console.log(ssrInfo);
    console.groupEnd();

    let data;
    if (ssrInfo) {
      data = JSON.parse(ssrInfo); // JSON TYPE
    }

    setupSsrData = {
      travelType,
      productType,
      data
    };
  } catch (e) {
    console.error("setupSsrDataInit: ", e);
  }
  console.groupCollapsed("%c[ssrInfo]: JSON", "color: #219ebc; font-weight: bold; font-size: 12px;");
  console.log(setupSsrData);
  console.groupEnd();

  return setupSsrData;
};
