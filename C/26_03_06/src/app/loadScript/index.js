/**
 * 동적 스크립트 로드
 * @param {*} url
 * @param {*} isNoCache false || true
 * @param {*} addLocation body || head
 * @returns
 */
function loadScriptPromise(url, isNoCache = false, addLocation = "body") {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = (() => {
      if (isNoCache) {
        return `${url}?v=${Date.now()}`; // 현재 시간을 버전으로 추가
      } else {
        return url;
      }
    })();
    script.onload = resolve;
    script.onerror = reject;

    addElement({ target: addLocation, element: script });
  });
}

// 요소 추가
function addElement({ target = "body", element }) {
  document[target].appendChild(element);
}

/**
 * 동적으로 로드되는 <script>
 */
export const loadAllScript = async ({ isNoCache = false }) => {
  console.log("[loadAllScript] 동적으로 로드되는 <script>");
  const VITE_APP_STATIC_URL = import.meta.env.VITE_APP_STATIC_URL;
  /**
   * 동적으로 추가될 스크립트 영역
   * - loadScriptPromise(url)
   */
  const loadScriptList = [loadScriptPromise(`${VITE_APP_STATIC_URL}/p/common/foCommon/foCommon.v1.0.umd.min.js`, isNoCache)];
  return await Promise.all(loadScriptList);
};
