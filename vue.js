onMounted(() => {
  loadExScript();
});

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function testView() {
  if (window.myTest) {
    const msg = window.myTest.hello('지영');
    console.log(msg);
  }
}

async function loadExScript() {
  try {
    await loadScript('https://jignuoy.github.io/sample/test.js');
    testView();
  } catch (error) {
    console.log(error);
  }
}
