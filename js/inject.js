var bannedWindowProperties = [
  'fuckAdBlock'
];

function getScriptElement(name) {
  var script = document.createElement('script');
  script.innerHTML = "Object.defineProperty(window, '"+name+"', {value: null, writable: false, configurable: false});";
  return script;
}

function inject() {
  if (document.head) {
    for (var i=0; i < bannedWindowProperties.length; i++) {
      document.head.appendChild(getScriptElement(bannedWindowProperties[i]));
    }
  } else {
    setTimeout(inject, 1);
  }
}

setTimeout(inject, 1);