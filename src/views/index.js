const counter = document.getElementById('test');
const logBox = document.getElementById('log');
const enter = document.getElementById('enter');
const doScroll = document.getElementById('doScroll');

// api.handleCounter((_, count) => {
//   console.log(_);
//   counter.innerText = count;
// });

api.handleLog((...args) => {
  console.log(logBox.innerText);
  logBox.value += args.join(' ') + '\n';
  if (doScroll.checked) logBox.scrollTop = logBox.scrollHeight;
});
// enter.onkeydown((key) => {
//   console.log(key);
// });
