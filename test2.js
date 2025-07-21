import { name } from './test1.js';

window.myTest = {
  hello: function(a) {
    console.log(name);
    return 'Hello,' + a;
  }
}
