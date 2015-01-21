var bannedWindowProperties = [
  'fuckAdBlock'
];

function getScriptElement(name) {
  var script       = document.createElement('script');
  script.innerHTML = "Object.defineProperty(window, '" + name + "', { value: null, writable: false, configurable: false });";
  return script;
}

function injectScript() {
  if (document.head) {
    bannedWindowProperties.forEach(function(property) {
      document.head.appendChild(getScriptElement(property));
    });
    clearInterval(injectCheck);
  }
}

var injectCheck = setInterval(injectScript, 1);