import listToStyles from './listToStyles'

export default function addStylesToShadowDOM (parentId, list, shadowRoot, options) {
  var styles = listToStyles(parentId, list)
  addStyles(styles, shadowRoot, options)
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

function addStyles (styles /* Array<StyleObject> */, shadowRoot, options) {
  const injectedStyles =
    shadowRoot._injectedStyles ||
    (shadowRoot._injectedStyles = {})
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var style = injectedStyles[item.id]
    if (!style) {
      for (var j = 0; j < item.parts.length; j++) {
        addStyle(item.parts[j], shadowRoot, options)
      }
      injectedStyles[item.id] = true
    }
  }
}

function createStyleElement (shadowRoot, doc, options) {
  var styleElement = doc.createElement('style')
  var head = doc.head || doc.getElementsByTagName('head')
  var parentEl = shadowRoot.nodeType === Node.DOCUMENT_NODE ? head : shadowRoot
  styleElement.type = 'text/css'
  setAttributes(styleElement, options.attrs || {});
  parentEl.appendChild(styleElement)
  return styleElement
}

function setAttributes (el, attributes) {
  Object.keys(attributes).forEach(function (key) {
    el.setAttribute(key, attributes[key]);
  });
}

function addStyle (obj /* StyleObjectPart */, shadowRoot, options) {
  var doc = shadowRoot.nodeType === Node.DOCUMENT_NODE ? shadowRoot : document
  var styleElement = createStyleElement(shadowRoot, doc, options)
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(doc.createTextNode(css))
  }
}
