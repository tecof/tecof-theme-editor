import { MediaDrawer } from './chunk-7DE7RWPS.mjs';
import { useTecof, TecofPicture } from './chunk-6SZFDZOT.mjs';
import React, { createElement as createElement$2, useState, useRef, useCallback } from 'react';
import { ImagePlus, Upload, Code, FileIcon, X } from 'lucide-react';
import { jsxs, jsx } from 'react/jsx-runtime';

// node_modules/filepond/dist/filepond.esm.js
var isNode = (value) => value instanceof HTMLElement;
var createStore = (initialState, queries3 = [], actions3 = []) => {
  const state3 = {
    ...initialState
  };
  const actionQueue = [];
  const dispatchQueue = [];
  const getState = () => ({ ...state3 });
  const processActionQueue = () => {
    const queue = [...actionQueue];
    actionQueue.length = 0;
    return queue;
  };
  const processDispatchQueue = () => {
    const queue = [...dispatchQueue];
    dispatchQueue.length = 0;
    queue.forEach(({ type, data: data3 }) => {
      dispatch(type, data3);
    });
  };
  const dispatch = (type, data3, isBlocking) => {
    if (isBlocking && !document.hidden) {
      dispatchQueue.push({ type, data: data3 });
      return;
    }
    if (actionHandlers[type]) {
      actionHandlers[type](data3);
    }
    actionQueue.push({
      type,
      data: data3
    });
  };
  const query = (str, ...args) => queryHandles[str] ? queryHandles[str](...args) : null;
  const api = {
    getState,
    processActionQueue,
    processDispatchQueue,
    dispatch,
    query
  };
  let queryHandles = {};
  queries3.forEach((query2) => {
    queryHandles = {
      ...query2(state3),
      ...queryHandles
    };
  });
  let actionHandlers = {};
  actions3.forEach((action) => {
    actionHandlers = {
      ...action(dispatch, query, state3),
      ...actionHandlers
    };
  });
  return api;
};
var defineProperty = (obj, property, definition) => {
  if (typeof definition === "function") {
    obj[property] = definition;
    return;
  }
  Object.defineProperty(obj, property, { ...definition });
};
var forin = (obj, cb) => {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    cb(key, obj[key]);
  }
};
var createObject = (definition) => {
  const obj = {};
  forin(definition, (property) => {
    defineProperty(obj, property, definition[property]);
  });
  return obj;
};
var attr = (node, name3, value = null) => {
  if (value === null) {
    return node.getAttribute(name3) || node.hasAttribute(name3);
  }
  node.setAttribute(name3, value);
};
var ns = "http://www.w3.org/2000/svg";
var svgElements = ["svg", "path"];
var isSVGElement = (tag) => svgElements.includes(tag);
var createElement = (tag, className, attributes = {}) => {
  if (typeof className === "object") {
    attributes = className;
    className = null;
  }
  const element = isSVGElement(tag) ? document.createElementNS(ns, tag) : document.createElement(tag);
  if (className) {
    if (isSVGElement(tag)) {
      attr(element, "class", className);
    } else {
      element.className = className;
    }
  }
  forin(attributes, (name3, value) => {
    attr(element, name3, value);
  });
  return element;
};
var appendChild = (parent) => (child, index) => {
  if (typeof index !== "undefined" && parent.children[index]) {
    parent.insertBefore(child, parent.children[index]);
  } else {
    parent.appendChild(child);
  }
};
var appendChildView = (parent, childViews) => (view, index) => {
  if (typeof index !== "undefined") {
    childViews.splice(index, 0, view);
  } else {
    childViews.push(view);
  }
  return view;
};
var removeChildView = (parent, childViews) => (view) => {
  childViews.splice(childViews.indexOf(view), 1);
  if (view.element.parentNode) {
    parent.removeChild(view.element);
  }
  return view;
};
var IS_BROWSER = (() => typeof window !== "undefined" && typeof window.document !== "undefined")();
var isBrowser = () => IS_BROWSER;
var testElement = isBrowser() ? createElement("svg") : {};
var getChildCount = "children" in testElement ? (el) => el.children.length : (el) => el.childNodes.length;
var getViewRect = (elementRect, childViews, offset, scale2) => {
  const left = offset[0] || elementRect.left;
  const top = offset[1] || elementRect.top;
  const right = left + elementRect.width;
  const bottom = top + elementRect.height * (scale2[1] || 1);
  const rect = {
    // the rectangle of the element itself
    element: {
      ...elementRect
    },
    // the rectangle of the element expanded to contain its children, does not include any margins
    inner: {
      left: elementRect.left,
      top: elementRect.top,
      right: elementRect.right,
      bottom: elementRect.bottom
    },
    // the rectangle of the element expanded to contain its children including own margin and child margins
    // margins will be added after we've recalculated the size
    outer: {
      left,
      top,
      right,
      bottom
    }
  };
  childViews.filter((childView) => !childView.isRectIgnored()).map((childView) => childView.rect).forEach((childViewRect) => {
    expandRect(rect.inner, { ...childViewRect.inner });
    expandRect(rect.outer, { ...childViewRect.outer });
  });
  calculateRectSize(rect.inner);
  rect.outer.bottom += rect.element.marginBottom;
  rect.outer.right += rect.element.marginRight;
  calculateRectSize(rect.outer);
  return rect;
};
var expandRect = (parent, child) => {
  child.top += parent.top;
  child.right += parent.left;
  child.bottom += parent.top;
  child.left += parent.left;
  if (child.bottom > parent.bottom) {
    parent.bottom = child.bottom;
  }
  if (child.right > parent.right) {
    parent.right = child.right;
  }
};
var calculateRectSize = (rect) => {
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
};
var isNumber = (value) => typeof value === "number";
var thereYet = (position, destination, velocity, errorMargin = 1e-3) => {
  return Math.abs(position - destination) < errorMargin && Math.abs(velocity) < errorMargin;
};
var spring = (
  // default options
  ({ stiffness = 0.5, damping = 0.75, mass = 10 } = {}) => {
    let target = null;
    let position = null;
    let velocity = 0;
    let resting = false;
    const interpolate = (ts, skipToEndState) => {
      if (resting) return;
      if (!(isNumber(target) && isNumber(position))) {
        resting = true;
        velocity = 0;
        return;
      }
      const f2 = -(position - target) * stiffness;
      velocity += f2 / mass;
      position += velocity;
      velocity *= damping;
      if (thereYet(position, target, velocity) || skipToEndState) {
        position = target;
        velocity = 0;
        resting = true;
        api.onupdate(position);
        api.oncomplete(position);
      } else {
        api.onupdate(position);
      }
    };
    const setTarget = (value) => {
      if (isNumber(value) && !isNumber(position)) {
        position = value;
      }
      if (target === null) {
        target = value;
        position = value;
      }
      target = value;
      if (position === target || typeof target === "undefined") {
        resting = true;
        velocity = 0;
        api.onupdate(position);
        api.oncomplete(position);
        return;
      }
      resting = false;
    };
    const api = createObject({
      interpolate,
      target: {
        set: setTarget,
        get: () => target
      },
      resting: {
        get: () => resting
      },
      onupdate: (value) => {
      },
      oncomplete: (value) => {
      }
    });
    return api;
  }
);
var easeInOutQuad = (t2) => t2 < 0.5 ? 2 * t2 * t2 : -1 + (4 - 2 * t2) * t2;
var tween = (
  // default values
  ({ duration = 500, easing = easeInOutQuad, delay = 0 } = {}) => {
    let start = null;
    let t2;
    let p;
    let resting = true;
    let reverse = false;
    let target = null;
    const interpolate = (ts, skipToEndState) => {
      if (resting || target === null) return;
      if (start === null) {
        start = ts;
      }
      if (ts - start < delay) return;
      t2 = ts - start - delay;
      if (t2 >= duration || skipToEndState) {
        t2 = 1;
        p = reverse ? 0 : 1;
        api.onupdate(p * target);
        api.oncomplete(p * target);
        resting = true;
      } else {
        p = t2 / duration;
        api.onupdate((t2 >= 0 ? easing(reverse ? 1 - p : p) : 0) * target);
      }
    };
    const api = createObject({
      interpolate,
      target: {
        get: () => reverse ? 0 : target,
        set: (value) => {
          if (target === null) {
            target = value;
            api.onupdate(value);
            api.oncomplete(value);
            return;
          }
          if (value < target) {
            target = 1;
            reverse = true;
          } else {
            reverse = false;
            target = value;
          }
          resting = false;
          start = null;
        }
      },
      resting: {
        get: () => resting
      },
      onupdate: (value) => {
      },
      oncomplete: (value) => {
      }
    });
    return api;
  }
);
var animator = {
  spring,
  tween
};
var createAnimator = (definition, category, property) => {
  const def = definition[category] && typeof definition[category][property] === "object" ? definition[category][property] : definition[category] || definition;
  const type = typeof def === "string" ? def : def.type;
  const props = typeof def === "object" ? { ...def } : {};
  return animator[type] ? animator[type](props) : null;
};
var addGetSet = (keys, obj, props, overwrite = false) => {
  obj = Array.isArray(obj) ? obj : [obj];
  obj.forEach((o2) => {
    keys.forEach((key) => {
      let name3 = key;
      let getter = () => props[key];
      let setter = (value) => props[key] = value;
      if (typeof key === "object") {
        name3 = key.key;
        getter = key.getter || getter;
        setter = key.setter || setter;
      }
      if (o2[name3] && !overwrite) {
        return;
      }
      o2[name3] = {
        get: getter,
        set: setter
      };
    });
  });
};
var animations = ({ mixinConfig, viewProps, viewInternalAPI, viewExternalAPI }) => {
  const initialProps = { ...viewProps };
  const animations3 = [];
  forin(mixinConfig, (property, animation) => {
    const animator3 = createAnimator(animation);
    if (!animator3) {
      return;
    }
    animator3.onupdate = (value) => {
      viewProps[property] = value;
    };
    animator3.target = initialProps[property];
    const prop = {
      key: property,
      setter: (value) => {
        if (animator3.target === value) {
          return;
        }
        animator3.target = value;
      },
      getter: () => viewProps[property]
    };
    addGetSet([prop], [viewInternalAPI, viewExternalAPI], viewProps, true);
    animations3.push(animator3);
  });
  return {
    write: (ts) => {
      let skipToEndState = document.hidden;
      let resting = true;
      animations3.forEach((animation) => {
        if (!animation.resting) resting = false;
        animation.interpolate(ts, skipToEndState);
      });
      return resting;
    },
    destroy: () => {
    }
  };
};
var addEvent = (element) => (type, fn3) => {
  element.addEventListener(type, fn3);
};
var removeEvent = (element) => (type, fn3) => {
  element.removeEventListener(type, fn3);
};
var listeners = ({
  mixinConfig,
  viewProps,
  viewInternalAPI,
  viewExternalAPI,
  viewState,
  view
}) => {
  const events = [];
  const add = addEvent(view.element);
  const remove = removeEvent(view.element);
  viewExternalAPI.on = (type, fn3) => {
    events.push({
      type,
      fn: fn3
    });
    add(type, fn3);
  };
  viewExternalAPI.off = (type, fn3) => {
    events.splice(events.findIndex((event) => event.type === type && event.fn === fn3), 1);
    remove(type, fn3);
  };
  return {
    write: () => {
      return true;
    },
    destroy: () => {
      events.forEach((event) => {
        remove(event.type, event.fn);
      });
    }
  };
};
var apis = ({ mixinConfig, viewProps, viewExternalAPI }) => {
  addGetSet(mixinConfig, viewExternalAPI, viewProps);
};
var isDefined = (value) => value != null;
var defaults = {
  opacity: 1,
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  originX: 0,
  originY: 0
};
var styles = ({ mixinConfig, viewProps, viewInternalAPI, viewExternalAPI, view }) => {
  const initialProps = { ...viewProps };
  const currentProps = {};
  addGetSet(mixinConfig, [viewInternalAPI, viewExternalAPI], viewProps);
  const getOffset = () => [viewProps["translateX"] || 0, viewProps["translateY"] || 0];
  const getScale = () => [viewProps["scaleX"] || 0, viewProps["scaleY"] || 0];
  const getRect = () => view.rect ? getViewRect(view.rect, view.childViews, getOffset(), getScale()) : null;
  viewInternalAPI.rect = { get: getRect };
  viewExternalAPI.rect = { get: getRect };
  mixinConfig.forEach((key) => {
    viewProps[key] = typeof initialProps[key] === "undefined" ? defaults[key] : initialProps[key];
  });
  return {
    write: () => {
      if (!propsHaveChanged(currentProps, viewProps)) {
        return;
      }
      applyStyles(view.element, viewProps);
      Object.assign(currentProps, { ...viewProps });
      return true;
    },
    destroy: () => {
    }
  };
};
var propsHaveChanged = (currentProps, newProps) => {
  if (Object.keys(currentProps).length !== Object.keys(newProps).length) {
    return true;
  }
  for (const prop in newProps) {
    if (newProps[prop] !== currentProps[prop]) {
      return true;
    }
  }
  return false;
};
var applyStyles = (element, {
  opacity,
  perspective: perspective2,
  translateX,
  translateY,
  scaleX,
  scaleY,
  rotateX: rotateX2,
  rotateY: rotateY2,
  rotateZ: rotateZ2,
  originX,
  originY,
  width,
  height
}) => {
  let transforms2 = "";
  let styles3 = "";
  if (isDefined(originX) || isDefined(originY)) {
    styles3 += `transform-origin: ${originX || 0}px ${originY || 0}px;`;
  }
  if (isDefined(perspective2)) {
    transforms2 += `perspective(${perspective2}px) `;
  }
  if (isDefined(translateX) || isDefined(translateY)) {
    transforms2 += `translate3d(${translateX || 0}px, ${translateY || 0}px, 0) `;
  }
  if (isDefined(scaleX) || isDefined(scaleY)) {
    transforms2 += `scale3d(${isDefined(scaleX) ? scaleX : 1}, ${isDefined(scaleY) ? scaleY : 1}, 1) `;
  }
  if (isDefined(rotateZ2)) {
    transforms2 += `rotateZ(${rotateZ2}rad) `;
  }
  if (isDefined(rotateX2)) {
    transforms2 += `rotateX(${rotateX2}rad) `;
  }
  if (isDefined(rotateY2)) {
    transforms2 += `rotateY(${rotateY2}rad) `;
  }
  if (transforms2.length) {
    styles3 += `transform:${transforms2};`;
  }
  if (isDefined(opacity)) {
    styles3 += `opacity:${opacity};`;
    if (opacity === 0) {
      styles3 += `visibility:hidden;`;
    }
    if (opacity < 1) {
      styles3 += `pointer-events:none;`;
    }
  }
  if (isDefined(height)) {
    styles3 += `height:${height}px;`;
  }
  if (isDefined(width)) {
    styles3 += `width:${width}px;`;
  }
  const elementCurrentStyle = element.elementCurrentStyle || "";
  if (styles3.length !== elementCurrentStyle.length || styles3 !== elementCurrentStyle) {
    element.style.cssText = styles3;
    element.elementCurrentStyle = styles3;
  }
};
var Mixins = {
  styles,
  listeners,
  animations,
  apis
};
var updateRect = (rect = {}, element = {}, style = {}) => {
  if (!element.layoutCalculated) {
    rect.paddingTop = parseInt(style.paddingTop, 10) || 0;
    rect.marginTop = parseInt(style.marginTop, 10) || 0;
    rect.marginRight = parseInt(style.marginRight, 10) || 0;
    rect.marginBottom = parseInt(style.marginBottom, 10) || 0;
    rect.marginLeft = parseInt(style.marginLeft, 10) || 0;
    element.layoutCalculated = true;
  }
  rect.left = element.offsetLeft || 0;
  rect.top = element.offsetTop || 0;
  rect.width = element.offsetWidth || 0;
  rect.height = element.offsetHeight || 0;
  rect.right = rect.left + rect.width;
  rect.bottom = rect.top + rect.height;
  rect.scrollTop = element.scrollTop;
  rect.hidden = element.offsetParent === null;
  return rect;
};
var createView = (
  // default view definition
  ({
    // element definition
    tag = "div",
    name: name3 = null,
    attributes = {},
    // view interaction
    read = () => {
    },
    write: write2 = () => {
    },
    create: create3 = () => {
    },
    destroy: destroy3 = () => {
    },
    // hooks
    filterFrameActionsForChild = (child, actions3) => actions3,
    didCreateView = () => {
    },
    didWriteView = () => {
    },
    // rect related
    ignoreRect = false,
    ignoreRectUpdate = false,
    // mixins
    mixins = []
  } = {}) => (store, props = {}) => {
    const element = createElement(tag, `filepond--${name3}`, attributes);
    const style = window.getComputedStyle(element, null);
    const rect = updateRect();
    let frameRect = null;
    let isResting = false;
    const childViews = [];
    const activeMixins = [];
    const ref = {};
    const state3 = {};
    const writers = [
      write2
      // default writer
    ];
    const readers = [
      read
      // default reader
    ];
    const destroyers = [
      destroy3
      // default destroy
    ];
    const getElement = () => element;
    const getChildViews = () => childViews.concat();
    const getReference = () => ref;
    const createChildView = (store2) => (view, props2) => view(store2, props2);
    const getRect = () => {
      if (frameRect) {
        return frameRect;
      }
      frameRect = getViewRect(rect, childViews, [0, 0], [1, 1]);
      return frameRect;
    };
    const getStyle = () => style;
    const _read = () => {
      frameRect = null;
      childViews.forEach((child) => child._read());
      const shouldUpdate = !(ignoreRectUpdate && rect.width && rect.height);
      if (shouldUpdate) {
        updateRect(rect, element, style);
      }
      const api = { root: internalAPI, props, rect };
      readers.forEach((reader) => reader(api));
    };
    const _write = (ts, frameActions, shouldOptimize) => {
      let resting = frameActions.length === 0;
      writers.forEach((writer) => {
        const writerResting = writer({
          props,
          root: internalAPI,
          actions: frameActions,
          timestamp: ts,
          shouldOptimize
        });
        if (writerResting === false) {
          resting = false;
        }
      });
      activeMixins.forEach((mixin) => {
        const mixinResting = mixin.write(ts);
        if (mixinResting === false) {
          resting = false;
        }
      });
      childViews.filter((child) => !!child.element.parentNode).forEach((child) => {
        const childResting = child._write(
          ts,
          filterFrameActionsForChild(child, frameActions),
          shouldOptimize
        );
        if (!childResting) {
          resting = false;
        }
      });
      childViews.forEach((child, index) => {
        if (child.element.parentNode) {
          return;
        }
        internalAPI.appendChild(child.element, index);
        child._read();
        child._write(
          ts,
          filterFrameActionsForChild(child, frameActions),
          shouldOptimize
        );
        resting = false;
      });
      isResting = resting;
      didWriteView({
        props,
        root: internalAPI,
        actions: frameActions,
        timestamp: ts
      });
      return resting;
    };
    const _destroy = () => {
      activeMixins.forEach((mixin) => mixin.destroy());
      destroyers.forEach((destroyer) => {
        destroyer({ root: internalAPI, props });
      });
      childViews.forEach((child) => child._destroy());
    };
    const sharedAPIDefinition = {
      element: {
        get: getElement
      },
      style: {
        get: getStyle
      },
      childViews: {
        get: getChildViews
      }
    };
    const internalAPIDefinition = {
      ...sharedAPIDefinition,
      rect: {
        get: getRect
      },
      // access to custom children references
      ref: {
        get: getReference
      },
      // dom modifiers
      is: (needle) => name3 === needle,
      appendChild: appendChild(element),
      createChildView: createChildView(store),
      linkView: (view) => {
        childViews.push(view);
        return view;
      },
      unlinkView: (view) => {
        childViews.splice(childViews.indexOf(view), 1);
      },
      appendChildView: appendChildView(element, childViews),
      removeChildView: removeChildView(element, childViews),
      registerWriter: (writer) => writers.push(writer),
      registerReader: (reader) => readers.push(reader),
      registerDestroyer: (destroyer) => destroyers.push(destroyer),
      invalidateLayout: () => element.layoutCalculated = false,
      // access to data store
      dispatch: store.dispatch,
      query: store.query
    };
    const externalAPIDefinition = {
      element: {
        get: getElement
      },
      childViews: {
        get: getChildViews
      },
      rect: {
        get: getRect
      },
      resting: {
        get: () => isResting
      },
      isRectIgnored: () => ignoreRect,
      _read,
      _write,
      _destroy
    };
    const mixinAPIDefinition = {
      ...sharedAPIDefinition,
      rect: {
        get: () => rect
      }
    };
    Object.keys(mixins).sort((a2, b) => {
      if (a2 === "styles") {
        return 1;
      } else if (b === "styles") {
        return -1;
      }
      return 0;
    }).forEach((key) => {
      const mixinAPI = Mixins[key]({
        mixinConfig: mixins[key],
        viewProps: props,
        viewState: state3,
        viewInternalAPI: internalAPIDefinition,
        viewExternalAPI: externalAPIDefinition,
        view: createObject(mixinAPIDefinition)
      });
      if (mixinAPI) {
        activeMixins.push(mixinAPI);
      }
    });
    const internalAPI = createObject(internalAPIDefinition);
    create3({
      root: internalAPI,
      props
    });
    const childCount = getChildCount(element);
    childViews.forEach((child, index) => {
      internalAPI.appendChild(child.element, childCount + index);
    });
    didCreateView(internalAPI);
    return createObject(externalAPIDefinition);
  }
);
var createPainter = (read, write2, fps = 60) => {
  const name3 = "__framePainter";
  if (window[name3]) {
    window[name3].readers.push(read);
    window[name3].writers.push(write2);
    return;
  }
  window[name3] = {
    readers: [read],
    writers: [write2]
  };
  const painter = window[name3];
  const interval = 1e3 / fps;
  let last = null;
  let id = null;
  let requestTick = null;
  let cancelTick = null;
  const setTimerType = () => {
    if (document.hidden) {
      requestTick = () => window.setTimeout(() => tick(performance.now()), interval);
      cancelTick = () => window.clearTimeout(id);
    } else {
      requestTick = () => window.requestAnimationFrame(tick);
      cancelTick = () => window.cancelAnimationFrame(id);
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (cancelTick) cancelTick();
    setTimerType();
    tick(performance.now());
  });
  const tick = (ts) => {
    id = requestTick(tick);
    if (!last) {
      last = ts;
    }
    const delta = ts - last;
    if (delta <= interval) {
      return;
    }
    last = ts - delta % interval;
    painter.readers.forEach((read2) => read2());
    painter.writers.forEach((write3) => write3(ts));
  };
  setTimerType();
  tick(performance.now());
  return {
    pause: () => {
      cancelTick(id);
    }
  };
};
var createRoute = (routes, fn3) => ({ root: root3, props, actions: actions3 = [], timestamp, shouldOptimize }) => {
  actions3.filter((action) => routes[action.type]).forEach(
    (action) => routes[action.type]({ root: root3, props, action: action.data, timestamp, shouldOptimize })
  );
  if (fn3) {
    fn3({ root: root3, props, actions: actions3, timestamp, shouldOptimize });
  }
};
var insertBefore = (newNode, referenceNode) => referenceNode.parentNode.insertBefore(newNode, referenceNode);
var insertAfter = (newNode, referenceNode) => {
  return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};
var isArray = (value) => Array.isArray(value);
var isEmpty = (value) => value == null;
var trim = (str) => str.trim();
var toString = (value) => "" + value;
var toArray = (value, splitter = ",") => {
  if (isEmpty(value)) {
    return [];
  }
  if (isArray(value)) {
    return value;
  }
  return toString(value).split(splitter).map(trim).filter((str) => str.length);
};
var isBoolean = (value) => typeof value === "boolean";
var toBoolean = (value) => isBoolean(value) ? value : value === "true";
var isString = (value) => typeof value === "string";
var toNumber = (value) => isNumber(value) ? value : isString(value) ? toString(value).replace(/[a-z]+/gi, "") : 0;
var toInt = (value) => parseInt(toNumber(value), 10);
var toFloat = (value) => parseFloat(toNumber(value));
var isInt = (value) => isNumber(value) && isFinite(value) && Math.floor(value) === value;
var toBytes = (value, base = 1e3) => {
  if (isInt(value)) {
    return value;
  }
  let naturalFileSize = toString(value).trim();
  if (/MB$/i.test(naturalFileSize)) {
    naturalFileSize = naturalFileSize.replace(/MB$i/, "").trim();
    return toInt(naturalFileSize) * base * base;
  }
  if (/KB/i.test(naturalFileSize)) {
    naturalFileSize = naturalFileSize.replace(/KB$i/, "").trim();
    return toInt(naturalFileSize) * base;
  }
  return toInt(naturalFileSize);
};
var isFunction = (value) => typeof value === "function";
var toFunctionReference = (string) => {
  let ref = self;
  let levels = string.split(".");
  let level = null;
  while (level = levels.shift()) {
    ref = ref[level];
    if (!ref) {
      return null;
    }
  }
  return ref;
};
var methods = {
  process: "POST",
  patch: "PATCH",
  revert: "DELETE",
  fetch: "GET",
  restore: "GET",
  load: "GET"
};
var createServerAPI = (outline) => {
  const api = {};
  api.url = isString(outline) ? outline : outline.url || "";
  api.timeout = outline.timeout ? parseInt(outline.timeout, 10) : 0;
  api.headers = outline.headers ? outline.headers : {};
  forin(methods, (key) => {
    api[key] = createAction(key, outline[key], methods[key], api.timeout, api.headers);
  });
  api.process = outline.process || isString(outline) || outline.url ? api.process : null;
  api.remove = outline.remove || null;
  delete api.headers;
  return api;
};
var createAction = (name3, outline, method, timeout, headers) => {
  if (outline === null) {
    return null;
  }
  if (typeof outline === "function") {
    return outline;
  }
  const action = {
    url: method === "GET" || method === "PATCH" ? `?${name3}=` : "",
    method,
    headers,
    withCredentials: false,
    timeout,
    onload: null,
    ondata: null,
    onerror: null
  };
  if (isString(outline)) {
    action.url = outline;
    return action;
  }
  Object.assign(action, outline);
  if (isString(action.headers)) {
    const parts = action.headers.split(/:(.+)/);
    action.headers = {
      header: parts[0],
      value: parts[1]
    };
  }
  action.withCredentials = toBoolean(action.withCredentials);
  return action;
};
var toServerAPI = (value) => createServerAPI(value);
var isNull = (value) => value === null;
var isObject = (value) => typeof value === "object" && value !== null;
var isAPI = (value) => {
  return isObject(value) && isString(value.url) && isObject(value.process) && isObject(value.revert) && isObject(value.restore) && isObject(value.fetch);
};
var getType = (value) => {
  if (isArray(value)) {
    return "array";
  }
  if (isNull(value)) {
    return "null";
  }
  if (isInt(value)) {
    return "int";
  }
  if (/^[0-9]+ ?(?:GB|MB|KB)$/gi.test(value)) {
    return "bytes";
  }
  if (isAPI(value)) {
    return "api";
  }
  return typeof value;
};
var replaceSingleQuotes = (str) => str.replace(/{\s*'/g, '{"').replace(/'\s*}/g, '"}').replace(/'\s*:/g, '":').replace(/:\s*'/g, ':"').replace(/,\s*'/g, ',"').replace(/'\s*,/g, '",');
var conversionTable = {
  array: toArray,
  boolean: toBoolean,
  int: (value) => getType(value) === "bytes" ? toBytes(value) : toInt(value),
  number: toFloat,
  float: toFloat,
  bytes: toBytes,
  string: (value) => isFunction(value) ? value : toString(value),
  function: (value) => toFunctionReference(value),
  serverapi: toServerAPI,
  object: (value) => {
    try {
      return JSON.parse(replaceSingleQuotes(value));
    } catch (e3) {
      return null;
    }
  }
};
var convertTo = (value, type) => conversionTable[type](value);
var getValueByType = (newValue, defaultValue, valueType) => {
  if (newValue === defaultValue) {
    return newValue;
  }
  let newValueType = getType(newValue);
  if (newValueType !== valueType) {
    const convertedValue = convertTo(newValue, valueType);
    newValueType = getType(convertedValue);
    if (convertedValue === null) {
      throw `Trying to assign value with incorrect type to "${option}", allowed type: "${valueType}"`;
    } else {
      newValue = convertedValue;
    }
  }
  return newValue;
};
var createOption = (defaultValue, valueType) => {
  let currentValue = defaultValue;
  return {
    enumerable: true,
    get: () => currentValue,
    set: (newValue) => {
      currentValue = getValueByType(newValue, defaultValue, valueType);
    }
  };
};
var createOptions = (options) => {
  const obj = {};
  forin(options, (prop) => {
    const optionDefinition = options[prop];
    obj[prop] = createOption(optionDefinition[0], optionDefinition[1]);
  });
  return createObject(obj);
};
var createInitialState = (options) => ({
  // model
  items: [],
  // timeout used for calling update items
  listUpdateTimeout: null,
  // timeout used for stacking metadata updates
  itemUpdateTimeout: null,
  // queue of items waiting to be processed
  processingQueue: [],
  // options
  options: createOptions(options)
});
var fromCamels = (string, separator = "-") => string.split(/(?=[A-Z])/).map((part) => part.toLowerCase()).join(separator);
var createOptionAPI = (store, options) => {
  const obj = {};
  forin(options, (key) => {
    obj[key] = {
      get: () => store.getState().options[key],
      set: (value) => {
        store.dispatch(`SET_${fromCamels(key, "_").toUpperCase()}`, {
          value
        });
      }
    };
  });
  return obj;
};
var createOptionActions = (options) => (dispatch, query, state3) => {
  const obj = {};
  forin(options, (key) => {
    const name3 = fromCamels(key, "_").toUpperCase();
    obj[`SET_${name3}`] = (action) => {
      try {
        state3.options[key] = action.value;
      } catch (e3) {
      }
      dispatch(`DID_SET_${name3}`, { value: state3.options[key] });
    };
  });
  return obj;
};
var createOptionQueries = (options) => (state3) => {
  const obj = {};
  forin(options, (key) => {
    obj[`GET_${fromCamels(key, "_").toUpperCase()}`] = (action) => state3.options[key];
  });
  return obj;
};
var InteractionMethod = {
  API: 1,
  DROP: 2,
  BROWSE: 3,
  PASTE: 4,
  NONE: 5
};
var getUniqueId = () => Math.random().toString(36).substring(2, 11);
var arrayRemove = (arr, index) => arr.splice(index, 1);
var run = (cb, sync) => {
  if (sync) {
    cb();
  } else if (document.hidden) {
    Promise.resolve(1).then(cb);
  } else {
    setTimeout(cb, 0);
  }
};
var on = () => {
  const listeners3 = [];
  const off = (event, cb) => {
    arrayRemove(
      listeners3,
      listeners3.findIndex((listener) => listener.event === event && (listener.cb === cb || !cb))
    );
  };
  const fire = (event, args, sync) => {
    listeners3.filter((listener) => listener.event === event).map((listener) => listener.cb).forEach((cb) => run(() => cb(...args), sync));
  };
  return {
    fireSync: (event, ...args) => {
      fire(event, args, true);
    },
    fire: (event, ...args) => {
      fire(event, args, false);
    },
    on: (event, cb) => {
      listeners3.push({ event, cb });
    },
    onOnce: (event, cb) => {
      listeners3.push({
        event,
        cb: (...args) => {
          off(event, cb);
          cb(...args);
        }
      });
    },
    off
  };
};
var copyObjectPropertiesToObject = (src, target, excluded) => {
  Object.getOwnPropertyNames(src).filter((property) => !excluded.includes(property)).forEach(
    (key) => Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(src, key))
  );
};
var PRIVATE = [
  "fire",
  "process",
  "revert",
  "load",
  "on",
  "off",
  "onOnce",
  "retryLoad",
  "extend",
  "archive",
  "archived",
  "release",
  "released",
  "requestProcessing",
  "freeze"
];
var createItemAPI = (item2) => {
  const api = {};
  copyObjectPropertiesToObject(item2, api, PRIVATE);
  return api;
};
var removeReleasedItems = (items) => {
  items.forEach((item2, index) => {
    if (item2.released) {
      arrayRemove(items, index);
    }
  });
};
var ItemStatus = {
  INIT: 1,
  IDLE: 2,
  PROCESSING_QUEUED: 9,
  PROCESSING: 3,
  PROCESSING_COMPLETE: 5,
  PROCESSING_ERROR: 6,
  PROCESSING_REVERT_ERROR: 10,
  LOADING: 7,
  LOAD_ERROR: 8
};
var FileOrigin = {
  INPUT: 1,
  LIMBO: 2,
  LOCAL: 3
};
var getNonNumeric = (str) => /[^0-9]+/.exec(str);
var getDecimalSeparator = () => getNonNumeric(1.1.toLocaleString())[0];
var getThousandsSeparator = () => {
  const decimalSeparator = getDecimalSeparator();
  const thousandsStringWithSeparator = 1e3.toLocaleString();
  const thousandsStringWithoutSeparator = 1e3.toString();
  if (thousandsStringWithSeparator !== thousandsStringWithoutSeparator) {
    return getNonNumeric(thousandsStringWithSeparator)[0];
  }
  return decimalSeparator === "." ? "," : ".";
};
var Type = {
  BOOLEAN: "boolean",
  INT: "int",
  NUMBER: "number",
  STRING: "string",
  ARRAY: "array",
  OBJECT: "object",
  FUNCTION: "function",
  ACTION: "action",
  SERVER_API: "serverapi",
  REGEX: "regex"
};
var filters = [];
var applyFilterChain = (key, value, utils) => new Promise((resolve, reject) => {
  const matchingFilters = filters.filter((f2) => f2.key === key).map((f2) => f2.cb);
  if (matchingFilters.length === 0) {
    resolve(value);
    return;
  }
  const initialFilter = matchingFilters.shift();
  matchingFilters.reduce(
    // loop over promises passing value to next promise
    (current, next) => current.then((value2) => next(value2, utils)),
    // call initial filter, will return a promise
    initialFilter(value, utils)
    // all executed
  ).then((value2) => resolve(value2)).catch((error2) => reject(error2));
});
var applyFilters = (key, value, utils) => filters.filter((f2) => f2.key === key).map((f2) => f2.cb(value, utils));
var addFilter = (key, cb) => filters.push({ key, cb });
var extendDefaultOptions = (additionalOptions) => Object.assign(defaultOptions, additionalOptions);
var getOptions = () => ({ ...defaultOptions });
var setOptions = (opts) => {
  forin(opts, (key, value) => {
    if (!defaultOptions[key]) {
      return;
    }
    defaultOptions[key][0] = getValueByType(
      value,
      defaultOptions[key][0],
      defaultOptions[key][1]
    );
  });
};
var defaultOptions = {
  // the id to add to the root element
  id: [null, Type.STRING],
  // input field name to use
  name: ["filepond", Type.STRING],
  // disable the field
  disabled: [false, Type.BOOLEAN],
  // classname to put on wrapper
  className: [null, Type.STRING],
  // is the field required
  required: [false, Type.BOOLEAN],
  // Allow media capture when value is set
  captureMethod: [null, Type.STRING],
  // - "camera", "microphone" or "camcorder",
  // - Does not work with multiple on apple devices
  // - If set, acceptedFileTypes must be made to match with media wildcard "image/*", "audio/*" or "video/*"
  // sync `acceptedFileTypes` property with `accept` attribute
  allowSyncAcceptAttribute: [true, Type.BOOLEAN],
  // Feature toggles
  allowDrop: [true, Type.BOOLEAN],
  // Allow dropping of files
  allowBrowse: [true, Type.BOOLEAN],
  // Allow browsing the file system
  allowPaste: [true, Type.BOOLEAN],
  // Allow pasting files
  allowMultiple: [false, Type.BOOLEAN],
  // Allow multiple files (disabled by default, as multiple attribute is also required on input to allow multiple)
  allowReplace: [true, Type.BOOLEAN],
  // Allow dropping a file on other file to replace it (only works when multiple is set to false)
  allowRevert: [true, Type.BOOLEAN],
  // Allows user to revert file upload
  allowRemove: [true, Type.BOOLEAN],
  // Allow user to remove a file
  allowProcess: [true, Type.BOOLEAN],
  // Allows user to process a file, when set to false, this removes the file upload button
  allowReorder: [false, Type.BOOLEAN],
  // Allow reordering of files
  allowDirectoriesOnly: [false, Type.BOOLEAN],
  // Allow only selecting directories with browse (no support for filtering dnd at this point)
  // Try store file if `server` not set
  storeAsFile: [false, Type.BOOLEAN],
  // Revert mode
  forceRevert: [false, Type.BOOLEAN],
  // Set to 'force' to require the file to be reverted before removal
  // Input requirements
  maxFiles: [null, Type.INT],
  // Max number of files
  checkValidity: [false, Type.BOOLEAN],
  // Enables custom validity messages
  // Where to put file
  itemInsertLocationFreedom: [true, Type.BOOLEAN],
  // Set to false to always add items to begin or end of list
  itemInsertLocation: ["before", Type.STRING],
  // Default index in list to add items that have been dropped at the top of the list
  itemInsertInterval: [75, Type.INT],
  // Drag 'n Drop related
  dropOnPage: [false, Type.BOOLEAN],
  // Allow dropping of files anywhere on page (prevents browser from opening file if dropped outside of Up)
  dropOnElement: [true, Type.BOOLEAN],
  // Drop needs to happen on element (set to false to also load drops outside of Up)
  dropValidation: [false, Type.BOOLEAN],
  // Enable or disable validating files on drop
  ignoredFiles: [[".ds_store", "thumbs.db", "desktop.ini"], Type.ARRAY],
  // Upload related
  instantUpload: [true, Type.BOOLEAN],
  // Should upload files immediately on drop
  maxParallelUploads: [2, Type.INT],
  // Maximum files to upload in parallel
  allowMinimumUploadDuration: [true, Type.BOOLEAN],
  // if true uploads take at least 750 ms, this ensures the user sees the upload progress giving trust the upload actually happened
  // Chunks
  chunkUploads: [false, Type.BOOLEAN],
  // Enable chunked uploads
  chunkForce: [false, Type.BOOLEAN],
  // Force use of chunk uploads even for files smaller than chunk size
  chunkSize: [5e6, Type.INT],
  // Size of chunks (5MB default)
  chunkRetryDelays: [[500, 1e3, 3e3], Type.ARRAY],
  // Amount of times to retry upload of a chunk when it fails
  // The server api end points to use for uploading (see docs)
  server: [null, Type.SERVER_API],
  // File size calculations, can set to 1024, this is only used for display, properties use file size base 1000
  fileSizeBase: [1e3, Type.INT],
  // Labels and status messages
  labelFileSizeBytes: ["bytes", Type.STRING],
  labelFileSizeKilobytes: ["KB", Type.STRING],
  labelFileSizeMegabytes: ["MB", Type.STRING],
  labelFileSizeGigabytes: ["GB", Type.STRING],
  labelDecimalSeparator: [getDecimalSeparator(), Type.STRING],
  // Default is locale separator
  labelThousandsSeparator: [getThousandsSeparator(), Type.STRING],
  // Default is locale separator
  labelIdle: [
    'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
    Type.STRING
  ],
  labelInvalidField: ["Field contains invalid files", Type.STRING],
  labelFileWaitingForSize: ["Waiting for size", Type.STRING],
  labelFileSizeNotAvailable: ["Size not available", Type.STRING],
  labelFileCountSingular: ["file in list", Type.STRING],
  labelFileCountPlural: ["files in list", Type.STRING],
  labelFileLoading: ["Loading", Type.STRING],
  labelFileAdded: ["Added", Type.STRING],
  // assistive only
  labelFileLoadError: ["Error during load", Type.STRING],
  labelFileRemoved: ["Removed", Type.STRING],
  // assistive only
  labelFileRemoveError: ["Error during remove", Type.STRING],
  labelFileProcessing: ["Uploading", Type.STRING],
  labelFileProcessingComplete: ["Upload complete", Type.STRING],
  labelFileProcessingAborted: ["Upload cancelled", Type.STRING],
  labelFileProcessingError: ["Error during upload", Type.STRING],
  labelFileProcessingRevertError: ["Error during revert", Type.STRING],
  labelTapToCancel: ["tap to cancel", Type.STRING],
  labelTapToRetry: ["tap to retry", Type.STRING],
  labelTapToUndo: ["tap to undo", Type.STRING],
  labelButtonRemoveItem: ["Remove", Type.STRING],
  labelButtonAbortItemLoad: ["Abort", Type.STRING],
  labelButtonRetryItemLoad: ["Retry", Type.STRING],
  labelButtonAbortItemProcessing: ["Cancel", Type.STRING],
  labelButtonUndoItemProcessing: ["Undo", Type.STRING],
  labelButtonRetryItemProcessing: ["Retry", Type.STRING],
  labelButtonProcessItem: ["Upload", Type.STRING],
  // make sure width and height plus viewpox are even numbers so icons are nicely centered
  iconRemove: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M11.586 13l-2.293 2.293a1 1 0 0 0 1.414 1.414L13 14.414l2.293 2.293a1 1 0 0 0 1.414-1.414L14.414 13l2.293-2.293a1 1 0 0 0-1.414-1.414L13 11.586l-2.293-2.293a1 1 0 0 0-1.414 1.414L11.586 13z" fill="currentColor" fill-rule="nonzero"/></svg>',
    Type.STRING
  ],
  iconProcess: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.414v3.585a1 1 0 0 1-2 0v-3.585l-1.293 1.293a1 1 0 0 1-1.414-1.415l3-3a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.415L14 10.414zM9 18a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2H9z" fill="currentColor" fill-rule="evenodd"/></svg>',
    Type.STRING
  ],
  iconRetry: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M10.81 9.185l-.038.02A4.997 4.997 0 0 0 8 13.683a5 5 0 0 0 5 5 5 5 0 0 0 5-5 1 1 0 0 1 2 0A7 7 0 1 1 9.722 7.496l-.842-.21a.999.999 0 1 1 .484-1.94l3.23.806c.535.133.86.675.73 1.21l-.804 3.233a.997.997 0 0 1-1.21.73.997.997 0 0 1-.73-1.21l.23-.928v-.002z" fill="currentColor" fill-rule="nonzero"/></svg>',
    Type.STRING
  ],
  iconUndo: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M9.185 10.81l.02-.038A4.997 4.997 0 0 1 13.683 8a5 5 0 0 1 5 5 5 5 0 0 1-5 5 1 1 0 0 0 0 2A7 7 0 1 0 7.496 9.722l-.21-.842a.999.999 0 1 0-1.94.484l.806 3.23c.133.535.675.86 1.21.73l3.233-.803a.997.997 0 0 0 .73-1.21.997.997 0 0 0-1.21-.73l-.928.23-.002-.001z" fill="currentColor" fill-rule="nonzero"/></svg>',
    Type.STRING
  ],
  iconDone: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M18.293 9.293a1 1 0 0 1 1.414 1.414l-7.002 7a1 1 0 0 1-1.414 0l-3.998-4a1 1 0 1 1 1.414-1.414L12 15.586l6.294-6.293z" fill="currentColor" fill-rule="nonzero"/></svg>',
    Type.STRING
  ],
  // event handlers
  oninit: [null, Type.FUNCTION],
  onwarning: [null, Type.FUNCTION],
  onerror: [null, Type.FUNCTION],
  onactivatefile: [null, Type.FUNCTION],
  oninitfile: [null, Type.FUNCTION],
  onaddfilestart: [null, Type.FUNCTION],
  onaddfileprogress: [null, Type.FUNCTION],
  onaddfile: [null, Type.FUNCTION],
  onprocessfilestart: [null, Type.FUNCTION],
  onprocessfileprogress: [null, Type.FUNCTION],
  onprocessfileabort: [null, Type.FUNCTION],
  onprocessfilerevert: [null, Type.FUNCTION],
  onprocessfile: [null, Type.FUNCTION],
  onprocessfiles: [null, Type.FUNCTION],
  onremovefile: [null, Type.FUNCTION],
  onpreparefile: [null, Type.FUNCTION],
  onupdatefiles: [null, Type.FUNCTION],
  onreorderfiles: [null, Type.FUNCTION],
  // hooks
  beforeDropFile: [null, Type.FUNCTION],
  beforeAddFile: [null, Type.FUNCTION],
  beforeRemoveFile: [null, Type.FUNCTION],
  beforePrepareFile: [null, Type.FUNCTION],
  // styles
  stylePanelLayout: [null, Type.STRING],
  // null 'integrated', 'compact', 'circle'
  stylePanelAspectRatio: [null, Type.STRING],
  // null or '3:2' or 1
  styleItemPanelAspectRatio: [null, Type.STRING],
  styleButtonRemoveItemPosition: ["left", Type.STRING],
  styleButtonProcessItemPosition: ["right", Type.STRING],
  styleLoadIndicatorPosition: ["right", Type.STRING],
  styleProgressIndicatorPosition: ["right", Type.STRING],
  styleButtonRemoveItemAlign: [false, Type.BOOLEAN],
  // custom initial files array
  files: [[], Type.ARRAY],
  // show support by displaying credits
  credits: [["https://filepond.com", "Powered by FilePond"], Type.ARRAY]
};
var getItemByQuery = (items, query) => {
  if (isEmpty(query)) {
    return items[0] || null;
  }
  if (isInt(query)) {
    return items[query] || null;
  }
  if (typeof query === "object") {
    query = query.id;
  }
  return items.find((item2) => item2.id === query) || null;
};
var getNumericAspectRatioFromString = (aspectRatio) => {
  if (isEmpty(aspectRatio)) {
    return aspectRatio;
  }
  if (/:/.test(aspectRatio)) {
    const parts = aspectRatio.split(":");
    return parts[1] / parts[0];
  }
  return parseFloat(aspectRatio);
};
var getActiveItems = (items) => items.filter((item2) => !item2.archived);
var Status = {
  EMPTY: 0,
  IDLE: 1,
  // waiting
  ERROR: 2,
  // a file is in error state
  BUSY: 3,
  // busy processing or loading
  READY: 4
  // all files uploaded
};
var res = null;
var canUpdateFileInput = () => {
  if (res === null) {
    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(["hello world"], "This_Works.txt"));
      const el = document.createElement("input");
      el.setAttribute("type", "file");
      el.files = dataTransfer.files;
      res = el.files.length === 1;
    } catch (err) {
      res = false;
    }
  }
  return res;
};
var ITEM_ERROR = [
  ItemStatus.LOAD_ERROR,
  ItemStatus.PROCESSING_ERROR,
  ItemStatus.PROCESSING_REVERT_ERROR
];
var ITEM_BUSY = [
  ItemStatus.LOADING,
  ItemStatus.PROCESSING,
  ItemStatus.PROCESSING_QUEUED,
  ItemStatus.INIT
];
var ITEM_READY = [ItemStatus.PROCESSING_COMPLETE];
var isItemInErrorState = (item2) => ITEM_ERROR.includes(item2.status);
var isItemInBusyState = (item2) => ITEM_BUSY.includes(item2.status);
var isItemInReadyState = (item2) => ITEM_READY.includes(item2.status);
var isAsync = (state3) => isObject(state3.options.server) && (isObject(state3.options.server.process) || isFunction(state3.options.server.process));
var queries = (state3) => ({
  GET_STATUS: () => {
    const items = getActiveItems(state3.items);
    const { EMPTY, ERROR, BUSY, IDLE, READY } = Status;
    if (items.length === 0) return EMPTY;
    if (items.some(isItemInErrorState)) return ERROR;
    if (items.some(isItemInBusyState)) return BUSY;
    if (items.some(isItemInReadyState)) return READY;
    return IDLE;
  },
  GET_ITEM: (query) => getItemByQuery(state3.items, query),
  GET_ACTIVE_ITEM: (query) => getItemByQuery(getActiveItems(state3.items), query),
  GET_ACTIVE_ITEMS: () => getActiveItems(state3.items),
  GET_ITEMS: () => state3.items,
  GET_ITEM_NAME: (query) => {
    const item2 = getItemByQuery(state3.items, query);
    return item2 ? item2.filename : null;
  },
  GET_ITEM_SIZE: (query) => {
    const item2 = getItemByQuery(state3.items, query);
    return item2 ? item2.fileSize : null;
  },
  GET_STYLES: () => Object.keys(state3.options).filter((key) => /^style/.test(key)).map((option2) => ({
    name: option2,
    value: state3.options[option2]
  })),
  GET_PANEL_ASPECT_RATIO: () => {
    const isShapeCircle = /circle/.test(state3.options.stylePanelLayout);
    const aspectRatio = isShapeCircle ? 1 : getNumericAspectRatioFromString(state3.options.stylePanelAspectRatio);
    return aspectRatio;
  },
  GET_ITEM_PANEL_ASPECT_RATIO: () => state3.options.styleItemPanelAspectRatio,
  GET_ITEMS_BY_STATUS: (status) => getActiveItems(state3.items).filter((item2) => item2.status === status),
  GET_TOTAL_ITEMS: () => getActiveItems(state3.items).length,
  SHOULD_UPDATE_FILE_INPUT: () => state3.options.storeAsFile && canUpdateFileInput() && !isAsync(state3),
  IS_ASYNC: () => isAsync(state3),
  GET_FILE_SIZE_LABELS: (query) => ({
    labelBytes: query("GET_LABEL_FILE_SIZE_BYTES") || void 0,
    labelKilobytes: query("GET_LABEL_FILE_SIZE_KILOBYTES") || void 0,
    labelMegabytes: query("GET_LABEL_FILE_SIZE_MEGABYTES") || void 0,
    labelGigabytes: query("GET_LABEL_FILE_SIZE_GIGABYTES") || void 0
  })
});
var hasRoomForItem = (state3) => {
  const count = getActiveItems(state3.items).length;
  if (!state3.options.allowMultiple) {
    return count === 0;
  }
  const maxFileCount = state3.options.maxFiles;
  if (maxFileCount === null) {
    return true;
  }
  if (count < maxFileCount) {
    return true;
  }
  return false;
};
var limit = (value, min, max) => Math.max(Math.min(max, value), min);
var arrayInsert = (arr, index, item2) => arr.splice(index, 0, item2);
var insertItem = (items, item2, index) => {
  if (isEmpty(item2)) {
    return null;
  }
  if (typeof index === "undefined") {
    items.push(item2);
    return item2;
  }
  index = limit(index, 0, items.length);
  arrayInsert(items, index, item2);
  return item2;
};
var isBase64DataURI = (str) => /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i.test(
  str
);
var getFilenameFromURL = (url) => `${url}`.split("/").pop().split("?").shift();
var getExtensionFromFilename = (name3) => name3.split(".").pop();
var guesstimateExtension = (type) => {
  if (typeof type !== "string") {
    return "";
  }
  const subtype = type.split("/").pop();
  if (/svg/.test(subtype)) {
    return "svg";
  }
  if (/zip|compressed/.test(subtype)) {
    return "zip";
  }
  if (/plain/.test(subtype)) {
    return "txt";
  }
  if (/msword/.test(subtype)) {
    return "doc";
  }
  if (/[a-z]+/.test(subtype)) {
    if (subtype === "jpeg") {
      return "jpg";
    }
    return subtype;
  }
  return "";
};
var leftPad = (value, padding = "") => (padding + value).slice(-padding.length);
var getDateString = (date = /* @__PURE__ */ new Date()) => `${date.getFullYear()}-${leftPad(date.getMonth() + 1, "00")}-${leftPad(
  date.getDate(),
  "00"
)}_${leftPad(date.getHours(), "00")}-${leftPad(date.getMinutes(), "00")}-${leftPad(
  date.getSeconds(),
  "00"
)}`;
var getFileFromBlob = (blob2, filename, type = null, extension = null) => {
  const file2 = typeof type === "string" ? blob2.slice(0, blob2.size, type) : blob2.slice(0, blob2.size, blob2.type);
  file2.lastModifiedDate = /* @__PURE__ */ new Date();
  if (blob2._relativePath) file2._relativePath = blob2._relativePath;
  if (!isString(filename)) {
    filename = getDateString();
  }
  if (filename && extension === null && getExtensionFromFilename(filename)) {
    file2.name = filename;
  } else {
    extension = extension || guesstimateExtension(file2.type);
    file2.name = filename + (extension ? "." + extension : "");
  }
  return file2;
};
var getBlobBuilder = () => {
  return window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
};
var createBlob = (arrayBuffer, mimeType) => {
  const BB = getBlobBuilder();
  if (BB) {
    const bb = new BB();
    bb.append(arrayBuffer);
    return bb.getBlob(mimeType);
  }
  return new Blob([arrayBuffer], {
    type: mimeType
  });
};
var getBlobFromByteStringWithMimeType = (byteString, mimeType) => {
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i2 = 0; i2 < byteString.length; i2++) {
    ia[i2] = byteString.charCodeAt(i2);
  }
  return createBlob(ab, mimeType);
};
var getMimeTypeFromBase64DataURI = (dataURI) => {
  return (/^data:(.+);/.exec(dataURI) || [])[1] || null;
};
var getBase64DataFromBase64DataURI = (dataURI) => {
  const data3 = dataURI.split(",")[1];
  return data3.replace(/\s/g, "");
};
var getByteStringFromBase64DataURI = (dataURI) => {
  return atob(getBase64DataFromBase64DataURI(dataURI));
};
var getBlobFromBase64DataURI = (dataURI) => {
  const mimeType = getMimeTypeFromBase64DataURI(dataURI);
  const byteString = getByteStringFromBase64DataURI(dataURI);
  return getBlobFromByteStringWithMimeType(byteString, mimeType);
};
var getFileFromBase64DataURI = (dataURI, filename, extension) => {
  return getFileFromBlob(getBlobFromBase64DataURI(dataURI), filename, null, extension);
};
var getFileNameFromHeader = (header) => {
  if (!/^content-disposition:/i.test(header)) return null;
  const matches = header.split(/filename=|filename\*=.+''/).splice(1).map((name3) => name3.trim().replace(/^["']|[;"']{0,2}$/g, "")).filter((name3) => name3.length);
  return matches.length ? decodeURI(matches[matches.length - 1]) : null;
};
var getFileSizeFromHeader = (header) => {
  if (/content-length:/i.test(header)) {
    const size = header.match(/[0-9]+/)[0];
    return size ? parseInt(size, 10) : null;
  }
  return null;
};
var getTranfserIdFromHeader = (header) => {
  if (/x-content-transfer-id:/i.test(header)) {
    const id = (header.split(":")[1] || "").trim();
    return id || null;
  }
  return null;
};
var getFileInfoFromHeaders = (headers) => {
  const info = {
    source: null,
    name: null,
    size: null
  };
  const rows = headers.split("\n");
  for (let header of rows) {
    const name3 = getFileNameFromHeader(header);
    if (name3) {
      info.name = name3;
      continue;
    }
    const size = getFileSizeFromHeader(header);
    if (size) {
      info.size = size;
      continue;
    }
    const source = getTranfserIdFromHeader(header);
    if (source) {
      info.source = source;
      continue;
    }
  }
  return info;
};
var createFileLoader = (fetchFn) => {
  const state3 = {
    source: null,
    complete: false,
    progress: 0,
    size: null,
    timestamp: null,
    duration: 0,
    request: null
  };
  const getProgress = () => state3.progress;
  const abort = () => {
    if (state3.request && state3.request.abort) {
      state3.request.abort();
    }
  };
  const load = () => {
    const source = state3.source;
    api.fire("init", source);
    if (source instanceof File) {
      api.fire("load", source);
    } else if (source instanceof Blob) {
      api.fire("load", getFileFromBlob(source, source.name));
    } else if (isBase64DataURI(source)) {
      api.fire("load", getFileFromBase64DataURI(source));
    } else {
      loadURL(source);
    }
  };
  const loadURL = (url) => {
    if (!fetchFn) {
      api.fire("error", {
        type: "error",
        body: "Can't load URL",
        code: 400
      });
      return;
    }
    state3.timestamp = Date.now();
    state3.request = fetchFn(
      url,
      (response) => {
        state3.duration = Date.now() - state3.timestamp;
        state3.complete = true;
        if (response instanceof Blob) {
          response = getFileFromBlob(response, response.name || getFilenameFromURL(url));
        }
        api.fire(
          "load",
          // if has received blob, we go with blob, if no response, we return null
          response instanceof Blob ? response : response ? response.body : null
        );
      },
      (error2) => {
        api.fire(
          "error",
          typeof error2 === "string" ? {
            type: "error",
            code: 0,
            body: error2
          } : error2
        );
      },
      (computable, current, total) => {
        if (total) {
          state3.size = total;
        }
        state3.duration = Date.now() - state3.timestamp;
        if (!computable) {
          state3.progress = null;
          return;
        }
        state3.progress = current / total;
        api.fire("progress", state3.progress);
      },
      () => {
        api.fire("abort");
      },
      (response) => {
        const fileinfo = getFileInfoFromHeaders(
          typeof response === "string" ? response : response.headers
        );
        api.fire("meta", {
          size: state3.size || fileinfo.size,
          filename: fileinfo.name,
          source: fileinfo.source
        });
      }
    );
  };
  const api = {
    ...on(),
    setSource: (source) => state3.source = source,
    getProgress,
    // file load progress
    abort,
    // abort file load
    load
    // start load
  };
  return api;
};
var isGet = (method) => /GET|HEAD/.test(method);
var sendRequest = (data3, url, options) => {
  const api = {
    onheaders: () => {
    },
    onprogress: () => {
    },
    onload: () => {
    },
    ontimeout: () => {
    },
    onerror: () => {
    },
    onabort: () => {
    },
    abort: () => {
      aborted = true;
      xhr.abort();
    }
  };
  let aborted = false;
  let headersReceived = false;
  options = {
    method: "POST",
    headers: {},
    withCredentials: false,
    ...options
  };
  url = encodeURI(url);
  if (isGet(options.method) && data3) {
    url = `${url}${encodeURIComponent(typeof data3 === "string" ? data3 : JSON.stringify(data3))}`;
  }
  const xhr = new XMLHttpRequest();
  const process = isGet(options.method) ? xhr : xhr.upload;
  process.onprogress = (e3) => {
    if (aborted) {
      return;
    }
    api.onprogress(e3.lengthComputable, e3.loaded, e3.total);
  };
  xhr.onreadystatechange = () => {
    if (xhr.readyState < 2) {
      return;
    }
    if (xhr.readyState === 4 && xhr.status === 0) {
      return;
    }
    if (headersReceived) {
      return;
    }
    headersReceived = true;
    api.onheaders(xhr);
  };
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      api.onload(xhr);
    } else {
      api.onerror(xhr);
    }
  };
  xhr.onerror = () => api.onerror(xhr);
  xhr.onabort = () => {
    aborted = true;
    api.onabort();
  };
  xhr.ontimeout = () => api.ontimeout(xhr);
  xhr.open(options.method, url, true);
  if (isInt(options.timeout)) {
    xhr.timeout = options.timeout;
  }
  Object.keys(options.headers).forEach((key) => {
    const value = unescape(encodeURIComponent(options.headers[key]));
    xhr.setRequestHeader(key, value);
  });
  if (options.responseType) {
    xhr.responseType = options.responseType;
  }
  if (options.withCredentials) {
    xhr.withCredentials = true;
  }
  xhr.send(data3);
  return api;
};
var createResponse = (type, code, body, headers) => ({
  type,
  code,
  body,
  headers
});
var createTimeoutResponse = (cb) => (xhr) => {
  cb(createResponse("error", 0, "Timeout", xhr.getAllResponseHeaders()));
};
var hasQS = (str) => /\?/.test(str);
var buildURL = (...parts) => {
  let url = "";
  parts.forEach((part) => {
    url += hasQS(url) && hasQS(part) ? part.replace(/\?/, "&") : part;
  });
  return url;
};
var createFetchFunction = (apiUrl = "", action) => {
  if (typeof action === "function") {
    return action;
  }
  if (!action || !isString(action.url)) {
    return null;
  }
  const onload = action.onload || ((res2) => res2);
  const onerror = action.onerror || ((res2) => null);
  return (url, load, error2, progress, abort, headers) => {
    const request = sendRequest(url, buildURL(apiUrl, action.url), {
      ...action,
      responseType: "blob"
    });
    request.onload = (xhr) => {
      const headers2 = xhr.getAllResponseHeaders();
      const filename = getFileInfoFromHeaders(headers2).name || getFilenameFromURL(url);
      load(
        createResponse(
          "load",
          xhr.status,
          action.method === "HEAD" ? null : getFileFromBlob(onload(xhr.response), filename),
          headers2
        )
      );
    };
    request.onerror = (xhr) => {
      error2(
        createResponse(
          "error",
          xhr.status,
          onerror(xhr.response) || xhr.statusText,
          xhr.getAllResponseHeaders()
        )
      );
    };
    request.onheaders = (xhr) => {
      headers(createResponse("headers", xhr.status, null, xhr.getAllResponseHeaders()));
    };
    request.ontimeout = createTimeoutResponse(error2);
    request.onprogress = progress;
    request.onabort = abort;
    return request;
  };
};
var ChunkStatus = {
  QUEUED: 0,
  COMPLETE: 1,
  PROCESSING: 2,
  ERROR: 3,
  WAITING: 4
};
var processFileChunked = (apiUrl, action, name3, file2, metadata, load, error2, progress, abort, transfer, options) => {
  const chunks = [];
  const { chunkTransferId, chunkServer, chunkSize, chunkRetryDelays } = options;
  const state3 = {
    serverId: chunkTransferId,
    aborted: false
  };
  const ondata = action.ondata || ((fd) => fd);
  const onload = action.onload || ((xhr, method) => method === "HEAD" ? xhr.getResponseHeader("Upload-Offset") : xhr.response);
  const onerror = action.onerror || ((res2) => null);
  const requestTransferId = (cb) => {
    const formData = new FormData();
    if (isObject(metadata)) formData.append(name3, JSON.stringify(metadata));
    const headers = typeof action.headers === "function" ? action.headers(file2, metadata) : {
      ...action.headers,
      "Upload-Length": file2.size
    };
    const requestParams = {
      ...action,
      headers
    };
    const request = sendRequest(ondata(formData), buildURL(apiUrl, action.url), requestParams);
    request.onload = (xhr) => cb(onload(xhr, requestParams.method));
    request.onerror = (xhr) => error2(
      createResponse(
        "error",
        xhr.status,
        onerror(xhr.response) || xhr.statusText,
        xhr.getAllResponseHeaders()
      )
    );
    request.ontimeout = createTimeoutResponse(error2);
  };
  const requestTransferOffset = (cb) => {
    const requestUrl = buildURL(apiUrl, chunkServer.url, state3.serverId);
    const headers = typeof action.headers === "function" ? action.headers(state3.serverId) : {
      ...action.headers
    };
    const requestParams = {
      headers,
      method: "HEAD"
    };
    const request = sendRequest(null, requestUrl, requestParams);
    request.onload = (xhr) => cb(onload(xhr, requestParams.method));
    request.onerror = (xhr) => error2(
      createResponse(
        "error",
        xhr.status,
        onerror(xhr.response) || xhr.statusText,
        xhr.getAllResponseHeaders()
      )
    );
    request.ontimeout = createTimeoutResponse(error2);
  };
  const lastChunkIndex = Math.floor(file2.size / chunkSize);
  for (let i2 = 0; i2 <= lastChunkIndex; i2++) {
    const offset = i2 * chunkSize;
    const data3 = file2.slice(offset, offset + chunkSize, "application/offset+octet-stream");
    chunks[i2] = {
      index: i2,
      size: data3.size,
      offset,
      data: data3,
      file: file2,
      progress: 0,
      retries: [...chunkRetryDelays],
      status: ChunkStatus.QUEUED,
      error: null,
      request: null,
      timeout: null
    };
  }
  const completeProcessingChunks = () => load(state3.serverId);
  const canProcessChunk = (chunk) => chunk.status === ChunkStatus.QUEUED || chunk.status === ChunkStatus.ERROR;
  const processChunk = (chunk) => {
    if (state3.aborted) return;
    chunk = chunk || chunks.find(canProcessChunk);
    if (!chunk) {
      if (chunks.every((chunk2) => chunk2.status === ChunkStatus.COMPLETE)) {
        completeProcessingChunks();
      }
      return;
    }
    chunk.status = ChunkStatus.PROCESSING;
    chunk.progress = null;
    const ondata2 = chunkServer.ondata || ((fd) => fd);
    const onerror2 = chunkServer.onerror || ((res2) => null);
    const onload2 = chunkServer.onload || (() => {
    });
    const requestUrl = buildURL(apiUrl, chunkServer.url, state3.serverId);
    const headers = typeof chunkServer.headers === "function" ? chunkServer.headers(chunk) : {
      ...chunkServer.headers,
      "Content-Type": "application/offset+octet-stream",
      "Upload-Offset": chunk.offset,
      "Upload-Length": file2.size,
      "Upload-Name": file2.name
    };
    const request = chunk.request = sendRequest(ondata2(chunk.data), requestUrl, {
      ...chunkServer,
      headers
    });
    request.onload = (xhr) => {
      onload2(xhr, chunk.index, chunks.length);
      chunk.status = ChunkStatus.COMPLETE;
      chunk.request = null;
      processChunks();
    };
    request.onprogress = (lengthComputable, loaded, total) => {
      chunk.progress = lengthComputable ? loaded : null;
      updateTotalProgress();
    };
    request.onerror = (xhr) => {
      chunk.status = ChunkStatus.ERROR;
      chunk.request = null;
      chunk.error = onerror2(xhr.response) || xhr.statusText;
      if (!retryProcessChunk(chunk)) {
        error2(
          createResponse(
            "error",
            xhr.status,
            onerror2(xhr.response) || xhr.statusText,
            xhr.getAllResponseHeaders()
          )
        );
      }
    };
    request.ontimeout = (xhr) => {
      chunk.status = ChunkStatus.ERROR;
      chunk.request = null;
      if (!retryProcessChunk(chunk)) {
        createTimeoutResponse(error2)(xhr);
      }
    };
    request.onabort = () => {
      chunk.status = ChunkStatus.QUEUED;
      chunk.request = null;
      abort();
    };
  };
  const retryProcessChunk = (chunk) => {
    if (chunk.retries.length === 0) return false;
    chunk.status = ChunkStatus.WAITING;
    clearTimeout(chunk.timeout);
    chunk.timeout = setTimeout(() => {
      processChunk(chunk);
    }, chunk.retries.shift());
    return true;
  };
  const updateTotalProgress = () => {
    const totalBytesTransfered = chunks.reduce((p, chunk) => {
      if (p === null || chunk.progress === null) return null;
      return p + chunk.progress;
    }, 0);
    if (totalBytesTransfered === null) return progress(false, 0, 0);
    const totalSize = chunks.reduce((total, chunk) => total + chunk.size, 0);
    progress(true, totalBytesTransfered, totalSize);
  };
  const processChunks = () => {
    const totalProcessing = chunks.filter((chunk) => chunk.status === ChunkStatus.PROCESSING).length;
    if (totalProcessing >= 1) return;
    processChunk();
  };
  const abortChunks = () => {
    chunks.forEach((chunk) => {
      clearTimeout(chunk.timeout);
      if (chunk.request) {
        chunk.request.abort();
      }
    });
  };
  if (!state3.serverId) {
    requestTransferId((serverId) => {
      if (state3.aborted) return;
      transfer(serverId);
      state3.serverId = serverId;
      processChunks();
    });
  } else {
    requestTransferOffset((offset) => {
      if (state3.aborted) return;
      chunks.filter((chunk) => chunk.offset < offset).forEach((chunk) => {
        chunk.status = ChunkStatus.COMPLETE;
        chunk.progress = chunk.size;
      });
      processChunks();
    });
  }
  return {
    abort: () => {
      state3.aborted = true;
      abortChunks();
    }
  };
};
var createFileProcessorFunction = (apiUrl, action, name3, options) => (file2, metadata, load, error2, progress, abort, transfer) => {
  if (!file2) return;
  const canChunkUpload = options.chunkUploads;
  const shouldChunkUpload = canChunkUpload && file2.size > options.chunkSize;
  const willChunkUpload = canChunkUpload && (shouldChunkUpload || options.chunkForce);
  if (file2 instanceof Blob && willChunkUpload)
    return processFileChunked(
      apiUrl,
      action,
      name3,
      file2,
      metadata,
      load,
      error2,
      progress,
      abort,
      transfer,
      options
    );
  const ondata = action.ondata || ((fd) => fd);
  const onload = action.onload || ((res2) => res2);
  const onerror = action.onerror || ((res2) => null);
  const headers = typeof action.headers === "function" ? action.headers(file2, metadata) || {} : {
    ...action.headers
  };
  const requestParams = {
    ...action,
    headers
  };
  var formData = new FormData();
  if (isObject(metadata)) {
    formData.append(name3, JSON.stringify(metadata));
  }
  (file2 instanceof Blob ? [{ name: null, file: file2 }] : file2).forEach((item2) => {
    formData.append(
      name3,
      item2.file,
      item2.name === null ? item2.file.name : `${item2.name}${item2.file.name}`
    );
  });
  const request = sendRequest(ondata(formData), buildURL(apiUrl, action.url), requestParams);
  request.onload = (xhr) => {
    load(createResponse("load", xhr.status, onload(xhr.response), xhr.getAllResponseHeaders()));
  };
  request.onerror = (xhr) => {
    error2(
      createResponse(
        "error",
        xhr.status,
        onerror(xhr.response) || xhr.statusText,
        xhr.getAllResponseHeaders()
      )
    );
  };
  request.ontimeout = createTimeoutResponse(error2);
  request.onprogress = progress;
  request.onabort = abort;
  return request;
};
var createProcessorFunction = (apiUrl = "", action, name3, options) => {
  if (typeof action === "function") return (...params) => action(name3, ...params, options);
  if (!action || !isString(action.url)) return null;
  return createFileProcessorFunction(apiUrl, action, name3, options);
};
var createRevertFunction = (apiUrl = "", action) => {
  if (typeof action === "function") {
    return action;
  }
  if (!action || !isString(action.url)) {
    return (uniqueFileId, load) => load();
  }
  const onload = action.onload || ((res2) => res2);
  const onerror = action.onerror || ((res2) => null);
  return (uniqueFileId, load, error2) => {
    const request = sendRequest(
      uniqueFileId,
      apiUrl + action.url,
      action
      // contains method, headers and withCredentials properties
    );
    request.onload = (xhr) => {
      load(
        createResponse(
          "load",
          xhr.status,
          onload(xhr.response),
          xhr.getAllResponseHeaders()
        )
      );
    };
    request.onerror = (xhr) => {
      error2(
        createResponse(
          "error",
          xhr.status,
          onerror(xhr.response) || xhr.statusText,
          xhr.getAllResponseHeaders()
        )
      );
    };
    request.ontimeout = createTimeoutResponse(error2);
    return request;
  };
};
var getRandomNumber = (min = 0, max = 1) => min + Math.random() * (max - min);
var createPerceivedPerformanceUpdater = (cb, duration = 1e3, offset = 0, tickMin = 25, tickMax = 250) => {
  let timeout = null;
  const start = Date.now();
  const tick = () => {
    let runtime = Date.now() - start;
    let delay = getRandomNumber(tickMin, tickMax);
    if (runtime + delay > duration) {
      delay = runtime + delay - duration;
    }
    let progress = runtime / duration;
    if (progress >= 1 || document.hidden) {
      cb(1);
      return;
    }
    cb(progress);
    timeout = setTimeout(tick, delay);
  };
  if (duration > 0) tick();
  return {
    clear: () => {
      clearTimeout(timeout);
    }
  };
};
var createFileProcessor = (processFn, options) => {
  const state3 = {
    complete: false,
    perceivedProgress: 0,
    perceivedPerformanceUpdater: null,
    progress: null,
    timestamp: null,
    perceivedDuration: 0,
    duration: 0,
    request: null,
    response: null
  };
  const { allowMinimumUploadDuration } = options;
  const process = (file2, metadata) => {
    const progressFn = () => {
      if (state3.duration === 0 || state3.progress === null) return;
      api.fire("progress", api.getProgress());
    };
    const completeFn = () => {
      state3.complete = true;
      api.fire("load-perceived", state3.response.body);
    };
    api.fire("start");
    state3.timestamp = Date.now();
    state3.perceivedPerformanceUpdater = createPerceivedPerformanceUpdater(
      (progress) => {
        state3.perceivedProgress = progress;
        state3.perceivedDuration = Date.now() - state3.timestamp;
        progressFn();
        if (state3.response && state3.perceivedProgress === 1 && !state3.complete) {
          completeFn();
        }
      },
      // random delay as in a list of files you start noticing
      // files uploading at the exact same speed
      allowMinimumUploadDuration ? getRandomNumber(750, 1500) : 0
    );
    state3.request = processFn(
      // the file to process
      file2,
      // the metadata to send along
      metadata,
      // callbacks (load, error, progress, abort, transfer)
      // load expects the body to be a server id if
      // you want to make use of revert
      (response) => {
        state3.response = isObject(response) ? response : {
          type: "load",
          code: 200,
          body: `${response}`,
          headers: {}
        };
        state3.duration = Date.now() - state3.timestamp;
        state3.progress = 1;
        api.fire("load", state3.response.body);
        if (!allowMinimumUploadDuration || allowMinimumUploadDuration && state3.perceivedProgress === 1) {
          completeFn();
        }
      },
      // error is expected to be an object with type, code, body
      (error2) => {
        state3.perceivedPerformanceUpdater.clear();
        api.fire(
          "error",
          isObject(error2) ? error2 : {
            type: "error",
            code: 0,
            body: `${error2}`
          }
        );
      },
      // actual processing progress
      (computable, current, total) => {
        state3.duration = Date.now() - state3.timestamp;
        state3.progress = computable ? current / total : null;
        progressFn();
      },
      // abort does not expect a value
      () => {
        state3.perceivedPerformanceUpdater.clear();
        api.fire("abort", state3.response ? state3.response.body : null);
      },
      // register the id for this transfer
      (transferId) => {
        api.fire("transfer", transferId);
      }
    );
  };
  const abort = () => {
    if (!state3.request) return;
    state3.perceivedPerformanceUpdater.clear();
    if (state3.request.abort) state3.request.abort();
    state3.complete = true;
  };
  const reset2 = () => {
    abort();
    state3.complete = false;
    state3.perceivedProgress = 0;
    state3.progress = 0;
    state3.timestamp = null;
    state3.perceivedDuration = 0;
    state3.duration = 0;
    state3.request = null;
    state3.response = null;
  };
  const getProgress = allowMinimumUploadDuration ? () => state3.progress ? Math.min(state3.progress, state3.perceivedProgress) : null : () => state3.progress || null;
  const getDuration = allowMinimumUploadDuration ? () => Math.min(state3.duration, state3.perceivedDuration) : () => state3.duration;
  const api = {
    ...on(),
    process,
    // start processing file
    abort,
    // abort active process request
    getProgress,
    getDuration,
    reset: reset2
  };
  return api;
};
var getFilenameWithoutExtension = (name3) => name3.substring(0, name3.lastIndexOf(".")) || name3;
var createFileStub = (source) => {
  let data3 = [source.name, source.size, source.type];
  if (source instanceof Blob || isBase64DataURI(source)) {
    data3[0] = source.name || getDateString();
  } else if (isBase64DataURI(source)) {
    data3[1] = source.length;
    data3[2] = getMimeTypeFromBase64DataURI(source);
  } else if (isString(source)) {
    data3[0] = getFilenameFromURL(source);
    data3[1] = 0;
    data3[2] = "application/octet-stream";
  }
  return {
    name: data3[0],
    size: data3[1],
    type: data3[2]
  };
};
var isFile = (value) => !!(value instanceof File || value instanceof Blob && value.name);
var deepCloneObject = (src) => {
  if (!isObject(src)) return src;
  const target = isArray(src) ? [] : {};
  for (const key in src) {
    if (!src.hasOwnProperty(key)) continue;
    const v = src[key];
    target[key] = v && isObject(v) ? deepCloneObject(v) : v;
  }
  return target;
};
var createItem = (origin = null, serverFileReference = null, file2 = null) => {
  const id = getUniqueId();
  const state3 = {
    // is archived
    archived: false,
    // if is frozen, no longer fires events
    frozen: false,
    // removed from view
    released: false,
    // original source
    source: null,
    // file model reference
    file: file2,
    // id of file on server
    serverFileReference,
    // id of file transfer on server
    transferId: null,
    // is aborted
    processingAborted: false,
    // current item status
    status: serverFileReference ? ItemStatus.PROCESSING_COMPLETE : ItemStatus.INIT,
    // active processes
    activeLoader: null,
    activeProcessor: null
  };
  let abortProcessingRequestComplete = null;
  const metadata = {};
  const setStatus = (status) => state3.status = status;
  const fire = (event, ...params) => {
    if (state3.released || state3.frozen) return;
    api.fire(event, ...params);
  };
  const getFileExtension2 = () => getExtensionFromFilename(state3.file.name);
  const getFileType = () => state3.file.type;
  const getFileSize = () => state3.file.size;
  const getFile = () => state3.file;
  const load = (source, loader, onload) => {
    state3.source = source;
    api.fireSync("init");
    if (state3.file) {
      api.fireSync("load-skip");
      return;
    }
    state3.file = createFileStub(source);
    loader.on("init", () => {
      fire("load-init");
    });
    loader.on("meta", (meta) => {
      state3.file.size = meta.size;
      state3.file.filename = meta.filename;
      if (meta.source) {
        origin = FileOrigin.LIMBO;
        state3.serverFileReference = meta.source;
        state3.status = ItemStatus.PROCESSING_COMPLETE;
      }
      fire("load-meta");
    });
    loader.on("progress", (progress) => {
      setStatus(ItemStatus.LOADING);
      fire("load-progress", progress);
    });
    loader.on("error", (error2) => {
      setStatus(ItemStatus.LOAD_ERROR);
      fire("load-request-error", error2);
    });
    loader.on("abort", () => {
      setStatus(ItemStatus.INIT);
      fire("load-abort");
    });
    loader.on("load", (file3) => {
      state3.activeLoader = null;
      const success = (result) => {
        state3.file = isFile(result) ? result : state3.file;
        if (origin === FileOrigin.LIMBO && state3.serverFileReference) {
          setStatus(ItemStatus.PROCESSING_COMPLETE);
        } else {
          setStatus(ItemStatus.IDLE);
        }
        fire("load");
      };
      const error2 = (result) => {
        state3.file = file3;
        fire("load-meta");
        setStatus(ItemStatus.LOAD_ERROR);
        fire("load-file-error", result);
      };
      if (state3.serverFileReference) {
        success(file3);
        return;
      }
      onload(file3, success, error2);
    });
    loader.setSource(source);
    state3.activeLoader = loader;
    loader.load();
  };
  const retryLoad = () => {
    if (!state3.activeLoader) {
      return;
    }
    state3.activeLoader.load();
  };
  const abortLoad = () => {
    if (state3.activeLoader) {
      state3.activeLoader.abort();
      return;
    }
    setStatus(ItemStatus.INIT);
    fire("load-abort");
  };
  const process = (processor, onprocess) => {
    if (state3.processingAborted) {
      state3.processingAborted = false;
      return;
    }
    setStatus(ItemStatus.PROCESSING);
    abortProcessingRequestComplete = null;
    if (!(state3.file instanceof Blob)) {
      api.on("load", () => {
        process(processor, onprocess);
      });
      return;
    }
    processor.on("load", (serverFileReference2) => {
      state3.transferId = null;
      state3.serverFileReference = serverFileReference2;
    });
    processor.on("transfer", (transferId) => {
      state3.transferId = transferId;
    });
    processor.on("load-perceived", (serverFileReference2) => {
      state3.activeProcessor = null;
      state3.transferId = null;
      state3.serverFileReference = serverFileReference2;
      setStatus(ItemStatus.PROCESSING_COMPLETE);
      fire("process-complete", serverFileReference2);
    });
    processor.on("start", () => {
      fire("process-start");
    });
    processor.on("error", (error3) => {
      state3.activeProcessor = null;
      setStatus(ItemStatus.PROCESSING_ERROR);
      fire("process-error", error3);
    });
    processor.on("abort", (serverFileReference2) => {
      state3.activeProcessor = null;
      state3.serverFileReference = serverFileReference2;
      setStatus(ItemStatus.IDLE);
      fire("process-abort");
      if (abortProcessingRequestComplete) {
        abortProcessingRequestComplete();
      }
    });
    processor.on("progress", (progress) => {
      fire("process-progress", progress);
    });
    const success = (file3) => {
      if (state3.archived) return;
      processor.process(file3, { ...metadata });
    };
    const error2 = console.error;
    onprocess(state3.file, success, error2);
    state3.activeProcessor = processor;
  };
  const requestProcessing = () => {
    state3.processingAborted = false;
    setStatus(ItemStatus.PROCESSING_QUEUED);
  };
  const abortProcessing = () => new Promise((resolve) => {
    if (!state3.activeProcessor) {
      state3.processingAborted = true;
      setStatus(ItemStatus.IDLE);
      fire("process-abort");
      resolve();
      return;
    }
    abortProcessingRequestComplete = () => {
      resolve();
    };
    state3.activeProcessor.abort();
  });
  const revert = (revertFileUpload, forceRevert) => new Promise((resolve, reject) => {
    const serverTransferId = state3.serverFileReference !== null ? state3.serverFileReference : state3.transferId;
    if (serverTransferId === null) {
      resolve();
      return;
    }
    revertFileUpload(
      serverTransferId,
      () => {
        state3.serverFileReference = null;
        state3.transferId = null;
        resolve();
      },
      (error2) => {
        if (!forceRevert) {
          resolve();
          return;
        }
        setStatus(ItemStatus.PROCESSING_REVERT_ERROR);
        fire("process-revert-error");
        reject(error2);
      }
    );
    setStatus(ItemStatus.IDLE);
    fire("process-revert");
  });
  const setMetadata = (key, value, silent) => {
    const keys = key.split(".");
    const root3 = keys[0];
    const last = keys.pop();
    let data3 = metadata;
    keys.forEach((key2) => data3 = data3[key2]);
    if (JSON.stringify(data3[last]) === JSON.stringify(value)) return;
    data3[last] = value;
    fire("metadata-update", {
      key: root3,
      value: metadata[root3],
      silent
    });
  };
  const getMetadata = (key) => deepCloneObject(key ? metadata[key] : metadata);
  const api = {
    id: { get: () => id },
    origin: { get: () => origin, set: (value) => origin = value },
    serverId: { get: () => state3.serverFileReference },
    transferId: { get: () => state3.transferId },
    status: { get: () => state3.status },
    filename: { get: () => state3.file.name },
    filenameWithoutExtension: { get: () => getFilenameWithoutExtension(state3.file.name) },
    fileExtension: { get: getFileExtension2 },
    fileType: { get: getFileType },
    fileSize: { get: getFileSize },
    file: { get: getFile },
    relativePath: { get: () => state3.file._relativePath },
    source: { get: () => state3.source },
    getMetadata,
    setMetadata: (key, value, silent) => {
      if (isObject(key)) {
        const data3 = key;
        Object.keys(data3).forEach((key2) => {
          setMetadata(key2, data3[key2], value);
        });
        return key;
      }
      setMetadata(key, value, silent);
      return value;
    },
    extend: (name3, handler) => itemAPI[name3] = handler,
    abortLoad,
    retryLoad,
    requestProcessing,
    abortProcessing,
    load,
    process,
    revert,
    ...on(),
    freeze: () => state3.frozen = true,
    release: () => state3.released = true,
    released: { get: () => state3.released },
    archive: () => state3.archived = true,
    archived: { get: () => state3.archived },
    // replace source and file object
    setFile: (file3) => state3.file = file3
  };
  const itemAPI = createObject(api);
  return itemAPI;
};
var getItemIndexByQuery = (items, query) => {
  if (isEmpty(query)) {
    return 0;
  }
  if (!isString(query)) {
    return -1;
  }
  return items.findIndex((item2) => item2.id === query);
};
var getItemById = (items, itemId) => {
  const index = getItemIndexByQuery(items, itemId);
  if (index < 0) {
    return;
  }
  return items[index] || null;
};
var fetchBlob = (url, load, error2, progress, abort, headers) => {
  const request = sendRequest(null, url, {
    method: "GET",
    responseType: "blob"
  });
  request.onload = (xhr) => {
    const headers2 = xhr.getAllResponseHeaders();
    const filename = getFileInfoFromHeaders(headers2).name || getFilenameFromURL(url);
    load(createResponse("load", xhr.status, getFileFromBlob(xhr.response, filename), headers2));
  };
  request.onerror = (xhr) => {
    error2(createResponse("error", xhr.status, xhr.statusText, xhr.getAllResponseHeaders()));
  };
  request.onheaders = (xhr) => {
    headers(createResponse("headers", xhr.status, null, xhr.getAllResponseHeaders()));
  };
  request.ontimeout = createTimeoutResponse(error2);
  request.onprogress = progress;
  request.onabort = abort;
  return request;
};
var getDomainFromURL = (url) => {
  if (url.indexOf("//") === 0) {
    url = location.protocol + url;
  }
  return url.toLowerCase().replace("blob:", "").replace(/([a-z])?:\/\//, "$1").split("/")[0];
};
var isExternalURL = (url) => (url.indexOf(":") > -1 || url.indexOf("//") > -1) && getDomainFromURL(location.href) !== getDomainFromURL(url);
var dynamicLabel = (label) => (...params) => isFunction(label) ? label(...params) : label;
var isMockItem = (item2) => !isFile(item2.file);
var listUpdated = (dispatch, state3) => {
  clearTimeout(state3.listUpdateTimeout);
  state3.listUpdateTimeout = setTimeout(() => {
    dispatch("DID_UPDATE_ITEMS", { items: getActiveItems(state3.items) });
  }, 0);
};
var optionalPromise = (fn3, ...params) => new Promise((resolve) => {
  if (!fn3) {
    return resolve(true);
  }
  const result = fn3(...params);
  if (result == null) {
    return resolve(true);
  }
  if (typeof result === "boolean") {
    return resolve(result);
  }
  if (typeof result.then === "function") {
    result.then(resolve);
  }
});
var sortItems = (state3, compare) => {
  state3.items.sort((a2, b) => compare(createItemAPI(a2), createItemAPI(b)));
};
var getItemByQueryFromState = (state3, itemHandler) => ({
  query,
  success = () => {
  },
  failure = () => {
  },
  ...options
} = {}) => {
  const item2 = getItemByQuery(state3.items, query);
  if (!item2) {
    failure({
      error: createResponse("error", 0, "Item not found"),
      file: null
    });
    return;
  }
  itemHandler(item2, success, failure, options || {});
};
var actions = (dispatch, query, state3) => ({
  /**
   * Aborts all ongoing processes
   */
  ABORT_ALL: () => {
    getActiveItems(state3.items).forEach((item2) => {
      item2.freeze();
      item2.abortLoad();
      item2.abortProcessing();
    });
  },
  /**
   * Sets initial files
   */
  DID_SET_FILES: ({ value = [] }) => {
    const files = value.map((file2) => ({
      source: file2.source ? file2.source : file2,
      options: file2.options
    }));
    let activeItems = getActiveItems(state3.items);
    activeItems.forEach((item2) => {
      if (!files.find((file2) => file2.source === item2.source || file2.source === item2.file)) {
        dispatch("REMOVE_ITEM", { query: item2, remove: false });
      }
    });
    activeItems = getActiveItems(state3.items);
    files.forEach((file2, index) => {
      if (activeItems.find((item2) => item2.source === file2.source || item2.file === file2.source))
        return;
      dispatch("ADD_ITEM", {
        ...file2,
        interactionMethod: InteractionMethod.NONE,
        index
      });
    });
  },
  DID_UPDATE_ITEM_METADATA: ({ id, action, change }) => {
    if (change.silent) return;
    clearTimeout(state3.itemUpdateTimeout);
    state3.itemUpdateTimeout = setTimeout(() => {
      const item2 = getItemById(state3.items, id);
      if (!query("IS_ASYNC")) {
        applyFilterChain("SHOULD_PREPARE_OUTPUT", false, {
          item: item2,
          query,
          action,
          change
        }).then((shouldPrepareOutput) => {
          const beforePrepareFile = query("GET_BEFORE_PREPARE_FILE");
          if (beforePrepareFile)
            shouldPrepareOutput = beforePrepareFile(item2, shouldPrepareOutput);
          if (!shouldPrepareOutput) return;
          dispatch(
            "REQUEST_PREPARE_OUTPUT",
            {
              query: id,
              item: item2,
              success: (file2) => {
                dispatch("DID_PREPARE_OUTPUT", { id, file: file2 });
              }
            },
            true
          );
        });
        return;
      }
      if (item2.origin === FileOrigin.LOCAL) {
        dispatch("DID_LOAD_ITEM", {
          id: item2.id,
          error: null,
          serverFileReference: item2.source
        });
      }
      const upload = () => {
        setTimeout(() => {
          dispatch("REQUEST_ITEM_PROCESSING", { query: id });
        }, 32);
      };
      const revert = (doUpload) => {
        item2.revert(
          createRevertFunction(state3.options.server.url, state3.options.server.revert),
          query("GET_FORCE_REVERT")
        ).then(doUpload ? upload : () => {
        }).catch(() => {
        });
      };
      const abort = (doUpload) => {
        item2.abortProcessing().then(doUpload ? upload : () => {
        });
      };
      if (item2.status === ItemStatus.PROCESSING_COMPLETE) {
        return revert(state3.options.instantUpload);
      }
      if (item2.status === ItemStatus.PROCESSING) {
        return abort(state3.options.instantUpload);
      }
      if (state3.options.instantUpload) {
        upload();
      }
    }, 0);
  },
  MOVE_ITEM: ({ query: query2, index }) => {
    const item2 = getItemByQuery(state3.items, query2);
    if (!item2) return;
    const currentIndex = state3.items.indexOf(item2);
    index = limit(index, 0, state3.items.length - 1);
    if (currentIndex === index) return;
    state3.items.splice(index, 0, state3.items.splice(currentIndex, 1)[0]);
  },
  SORT: ({ compare }) => {
    sortItems(state3, compare);
    dispatch("DID_SORT_ITEMS", {
      items: query("GET_ACTIVE_ITEMS")
    });
  },
  ADD_ITEMS: ({ items, index, interactionMethod, success = () => {
  }, failure = () => {
  } }) => {
    let currentIndex = index;
    if (index === -1 || typeof index === "undefined") {
      const insertLocation = query("GET_ITEM_INSERT_LOCATION");
      const totalItems = query("GET_TOTAL_ITEMS");
      currentIndex = insertLocation === "before" ? 0 : totalItems;
    }
    const ignoredFiles = query("GET_IGNORED_FILES");
    const isValidFile = (source) => isFile(source) ? !ignoredFiles.includes(source.name.toLowerCase()) : !isEmpty(source);
    const validItems = items.filter(isValidFile);
    const promises = validItems.map(
      (source) => new Promise((resolve, reject) => {
        dispatch("ADD_ITEM", {
          interactionMethod,
          source: source.source || source,
          success: resolve,
          failure: reject,
          index: currentIndex++,
          options: source.options || {}
        });
      })
    );
    Promise.all(promises).then(success).catch(failure);
  },
  /**
   * @param source
   * @param index
   * @param interactionMethod
   */
  ADD_ITEM: ({
    source,
    index = -1,
    interactionMethod,
    success = () => {
    },
    failure = () => {
    },
    options = {}
  }) => {
    if (isEmpty(source)) {
      failure({
        error: createResponse("error", 0, "No source"),
        file: null
      });
      return;
    }
    if (isFile(source) && state3.options.ignoredFiles.includes(source.name.toLowerCase())) {
      return;
    }
    if (!hasRoomForItem(state3)) {
      if (state3.options.allowMultiple || !state3.options.allowMultiple && !state3.options.allowReplace) {
        const error2 = createResponse("warning", 0, "Max files");
        dispatch("DID_THROW_MAX_FILES", {
          source,
          error: error2
        });
        failure({ error: error2, file: null });
        return;
      }
      const item3 = getActiveItems(state3.items)[0];
      if (item3.status === ItemStatus.PROCESSING_COMPLETE || item3.status === ItemStatus.PROCESSING_REVERT_ERROR) {
        const forceRevert = query("GET_FORCE_REVERT");
        item3.revert(
          createRevertFunction(state3.options.server.url, state3.options.server.revert),
          forceRevert
        ).then(() => {
          if (!forceRevert) return;
          dispatch("ADD_ITEM", {
            source,
            index,
            interactionMethod,
            success,
            failure,
            options
          });
        }).catch(() => {
        });
        if (forceRevert) return;
      }
      dispatch("REMOVE_ITEM", { query: item3.id });
    }
    const origin = options.type === "local" ? FileOrigin.LOCAL : options.type === "limbo" ? FileOrigin.LIMBO : FileOrigin.INPUT;
    const item2 = createItem(
      // where did this file come from
      origin,
      // an input file never has a server file reference
      origin === FileOrigin.INPUT ? null : source,
      // file mock data, if defined
      options.file
    );
    Object.keys(options.metadata || {}).forEach((key) => {
      item2.setMetadata(key, options.metadata[key]);
    });
    applyFilters("DID_CREATE_ITEM", item2, { query, dispatch });
    const itemInsertLocation = query("GET_ITEM_INSERT_LOCATION");
    if (!state3.options.itemInsertLocationFreedom) {
      index = itemInsertLocation === "before" ? -1 : state3.items.length;
    }
    insertItem(state3.items, item2, index);
    if (isFunction(itemInsertLocation) && source) {
      sortItems(state3, itemInsertLocation);
    }
    const id = item2.id;
    item2.on("init", () => {
      dispatch("DID_INIT_ITEM", { id });
    });
    item2.on("load-init", () => {
      dispatch("DID_START_ITEM_LOAD", { id });
    });
    item2.on("load-meta", () => {
      dispatch("DID_UPDATE_ITEM_META", { id });
    });
    item2.on("load-progress", (progress) => {
      dispatch("DID_UPDATE_ITEM_LOAD_PROGRESS", { id, progress });
    });
    item2.on("load-request-error", (error2) => {
      const mainStatus = dynamicLabel(state3.options.labelFileLoadError)(error2);
      if (error2.code >= 400 && error2.code < 500) {
        dispatch("DID_THROW_ITEM_INVALID", {
          id,
          error: error2,
          status: {
            main: mainStatus,
            sub: `${error2.code} (${error2.body})`
          }
        });
        failure({ error: error2, file: createItemAPI(item2) });
        return;
      }
      dispatch("DID_THROW_ITEM_LOAD_ERROR", {
        id,
        error: error2,
        status: {
          main: mainStatus,
          sub: state3.options.labelTapToRetry
        }
      });
    });
    item2.on("load-file-error", (error2) => {
      dispatch("DID_THROW_ITEM_INVALID", {
        id,
        error: error2.status,
        status: error2.status
      });
      failure({ error: error2.status, file: createItemAPI(item2) });
    });
    item2.on("load-abort", () => {
      dispatch("REMOVE_ITEM", { query: id });
    });
    item2.on("load-skip", () => {
      item2.on("metadata-update", (change) => {
        if (!isFile(item2.file)) return;
        dispatch("DID_UPDATE_ITEM_METADATA", { id, change });
      });
      dispatch("COMPLETE_LOAD_ITEM", {
        query: id,
        item: item2,
        data: {
          source,
          success
        }
      });
    });
    item2.on("load", () => {
      const handleAdd = (shouldAdd) => {
        if (!shouldAdd) {
          dispatch("REMOVE_ITEM", {
            query: id
          });
          return;
        }
        item2.on("metadata-update", (change) => {
          dispatch("DID_UPDATE_ITEM_METADATA", { id, change });
        });
        applyFilterChain("SHOULD_PREPARE_OUTPUT", false, { item: item2, query }).then(
          (shouldPrepareOutput) => {
            const beforePrepareFile = query("GET_BEFORE_PREPARE_FILE");
            if (beforePrepareFile)
              shouldPrepareOutput = beforePrepareFile(item2, shouldPrepareOutput);
            const loadComplete = () => {
              dispatch("COMPLETE_LOAD_ITEM", {
                query: id,
                item: item2,
                data: {
                  source,
                  success
                }
              });
              listUpdated(dispatch, state3);
            };
            if (shouldPrepareOutput) {
              dispatch(
                "REQUEST_PREPARE_OUTPUT",
                {
                  query: id,
                  item: item2,
                  success: (file2) => {
                    dispatch("DID_PREPARE_OUTPUT", { id, file: file2 });
                    loadComplete();
                  }
                },
                true
              );
              return;
            }
            loadComplete();
          }
        );
      };
      applyFilterChain("DID_LOAD_ITEM", item2, { query, dispatch }).then(() => {
        optionalPromise(query("GET_BEFORE_ADD_FILE"), createItemAPI(item2)).then(
          handleAdd
        );
      }).catch((e3) => {
        if (!e3 || !e3.error || !e3.status) return handleAdd(false);
        dispatch("DID_THROW_ITEM_INVALID", {
          id,
          error: e3.error,
          status: e3.status
        });
      });
    });
    item2.on("process-start", () => {
      dispatch("DID_START_ITEM_PROCESSING", { id });
    });
    item2.on("process-progress", (progress) => {
      dispatch("DID_UPDATE_ITEM_PROCESS_PROGRESS", { id, progress });
    });
    item2.on("process-error", (error2) => {
      dispatch("DID_THROW_ITEM_PROCESSING_ERROR", {
        id,
        error: error2,
        status: {
          main: dynamicLabel(state3.options.labelFileProcessingError)(error2),
          sub: state3.options.labelTapToRetry
        }
      });
    });
    item2.on("process-revert-error", (error2) => {
      dispatch("DID_THROW_ITEM_PROCESSING_REVERT_ERROR", {
        id,
        error: error2,
        status: {
          main: dynamicLabel(state3.options.labelFileProcessingRevertError)(error2),
          sub: state3.options.labelTapToRetry
        }
      });
    });
    item2.on("process-complete", (serverFileReference) => {
      dispatch("DID_COMPLETE_ITEM_PROCESSING", {
        id,
        error: null,
        serverFileReference
      });
      dispatch("DID_DEFINE_VALUE", { id, value: serverFileReference });
    });
    item2.on("process-abort", () => {
      dispatch("DID_ABORT_ITEM_PROCESSING", { id });
    });
    item2.on("process-revert", () => {
      dispatch("DID_REVERT_ITEM_PROCESSING", { id });
      dispatch("DID_DEFINE_VALUE", { id, value: null });
    });
    dispatch("DID_ADD_ITEM", { id, index, interactionMethod });
    listUpdated(dispatch, state3);
    const { url, load, restore, fetch: fetch2 } = state3.options.server || {};
    item2.load(
      source,
      // this creates a function that loads the file based on the type of file (string, base64, blob, file) and location of file (local, remote, limbo)
      createFileLoader(
        origin === FileOrigin.INPUT ? (
          // input, if is remote, see if should use custom fetch, else use default fetchBlob
          isString(source) && isExternalURL(source) ? fetch2 ? createFetchFunction(url, fetch2) : fetchBlob : fetchBlob
        ) : (
          // limbo or local
          origin === FileOrigin.LIMBO ? createFetchFunction(url, restore) : createFetchFunction(url, load)
        )
        // local
      ),
      // called when the file is loaded so it can be piped through the filters
      (file2, success2, error2) => {
        applyFilterChain("LOAD_FILE", file2, { query }).then(success2).catch(error2);
      }
    );
  },
  REQUEST_PREPARE_OUTPUT: ({ item: item2, success, failure = () => {
  } }) => {
    const err = {
      error: createResponse("error", 0, "Item not found"),
      file: null
    };
    if (item2.archived) return failure(err);
    applyFilterChain("PREPARE_OUTPUT", item2.file, { query, item: item2 }).then((result) => {
      applyFilterChain("COMPLETE_PREPARE_OUTPUT", result, { query, item: item2 }).then((result2) => {
        if (item2.archived) return failure(err);
        success(result2);
      });
    });
  },
  COMPLETE_LOAD_ITEM: ({ item: item2, data: data3 }) => {
    const { success, source } = data3;
    const itemInsertLocation = query("GET_ITEM_INSERT_LOCATION");
    if (isFunction(itemInsertLocation) && source) {
      sortItems(state3, itemInsertLocation);
    }
    dispatch("DID_LOAD_ITEM", {
      id: item2.id,
      error: null,
      serverFileReference: item2.origin === FileOrigin.INPUT ? null : source
    });
    success(createItemAPI(item2));
    if (item2.origin === FileOrigin.LOCAL) {
      dispatch("DID_LOAD_LOCAL_ITEM", { id: item2.id });
      return;
    }
    if (item2.origin === FileOrigin.LIMBO) {
      dispatch("DID_COMPLETE_ITEM_PROCESSING", {
        id: item2.id,
        error: null,
        serverFileReference: source
      });
      dispatch("DID_DEFINE_VALUE", {
        id: item2.id,
        value: item2.serverId || source
      });
      return;
    }
    if (query("IS_ASYNC") && state3.options.instantUpload) {
      dispatch("REQUEST_ITEM_PROCESSING", { query: item2.id });
    }
  },
  RETRY_ITEM_LOAD: getItemByQueryFromState(state3, (item2) => {
    item2.retryLoad();
  }),
  REQUEST_ITEM_PREPARE: getItemByQueryFromState(state3, (item2, success, failure) => {
    dispatch(
      "REQUEST_PREPARE_OUTPUT",
      {
        query: item2.id,
        item: item2,
        success: (file2) => {
          dispatch("DID_PREPARE_OUTPUT", { id: item2.id, file: file2 });
          success({
            file: item2,
            output: file2
          });
        },
        failure
      },
      true
    );
  }),
  REQUEST_ITEM_PROCESSING: getItemByQueryFromState(state3, (item2, success, failure) => {
    const itemCanBeQueuedForProcessing = (
      // waiting for something
      item2.status === ItemStatus.IDLE || // processing went wrong earlier
      item2.status === ItemStatus.PROCESSING_ERROR
    );
    if (!itemCanBeQueuedForProcessing) {
      const processNow = () => dispatch("REQUEST_ITEM_PROCESSING", { query: item2, success, failure });
      const process = () => document.hidden ? processNow() : setTimeout(processNow, 32);
      if (item2.status === ItemStatus.PROCESSING_COMPLETE || item2.status === ItemStatus.PROCESSING_REVERT_ERROR) {
        item2.revert(
          createRevertFunction(state3.options.server.url, state3.options.server.revert),
          query("GET_FORCE_REVERT")
        ).then(process).catch(() => {
        });
      } else if (item2.status === ItemStatus.PROCESSING) {
        item2.abortProcessing().then(process);
      }
      return;
    }
    if (item2.status === ItemStatus.PROCESSING_QUEUED) return;
    item2.requestProcessing();
    dispatch("DID_REQUEST_ITEM_PROCESSING", { id: item2.id });
    dispatch("PROCESS_ITEM", { query: item2, success, failure }, true);
  }),
  PROCESS_ITEM: getItemByQueryFromState(state3, (item2, success, failure) => {
    const maxParallelUploads = query("GET_MAX_PARALLEL_UPLOADS");
    const totalCurrentUploads = query("GET_ITEMS_BY_STATUS", ItemStatus.PROCESSING).length;
    if (totalCurrentUploads === maxParallelUploads) {
      state3.processingQueue.push({
        id: item2.id,
        success,
        failure
      });
      return;
    }
    if (item2.status === ItemStatus.PROCESSING) return;
    const processNext = () => {
      const queueEntry = state3.processingQueue.shift();
      if (!queueEntry) return;
      const { id, success: success2, failure: failure2 } = queueEntry;
      const itemReference = getItemByQuery(state3.items, id);
      if (!itemReference || itemReference.archived) {
        processNext();
        return;
      }
      dispatch("PROCESS_ITEM", { query: id, success: success2, failure: failure2 }, true);
    };
    item2.onOnce("process-complete", () => {
      success(createItemAPI(item2));
      processNext();
      const server = state3.options.server;
      const instantUpload = state3.options.instantUpload;
      if (instantUpload && item2.origin === FileOrigin.LOCAL && isFunction(server.remove)) {
        const noop = () => {
        };
        item2.origin = FileOrigin.LIMBO;
        state3.options.server.remove(item2.source, noop, noop);
      }
      const allItemsProcessed = query("GET_ITEMS_BY_STATUS", ItemStatus.PROCESSING_COMPLETE).length === state3.items.length;
      if (allItemsProcessed) {
        dispatch("DID_COMPLETE_ITEM_PROCESSING_ALL");
      }
    });
    item2.onOnce("process-error", (error2) => {
      failure({ error: error2, file: createItemAPI(item2) });
      processNext();
    });
    item2.onOnce("process-abort", () => {
      processNext();
    });
    const options = state3.options;
    item2.process(
      createFileProcessor(
        createProcessorFunction(options.server.url, options.server.process, options.name, {
          chunkTransferId: item2.transferId,
          chunkServer: options.server.patch,
          chunkUploads: options.chunkUploads,
          chunkForce: options.chunkForce,
          chunkSize: options.chunkSize,
          chunkRetryDelays: options.chunkRetryDelays
        }),
        {
          allowMinimumUploadDuration: query("GET_ALLOW_MINIMUM_UPLOAD_DURATION")
        }
      ),
      // called when the file is about to be processed so it can be piped through the transform filters
      (file2, success2, error2) => {
        applyFilterChain("PREPARE_OUTPUT", file2, { query, item: item2 }).then((file3) => {
          dispatch("DID_PREPARE_OUTPUT", { id: item2.id, file: file3 });
          success2(file3);
        }).catch(error2);
      }
    );
  }),
  RETRY_ITEM_PROCESSING: getItemByQueryFromState(state3, (item2) => {
    dispatch("REQUEST_ITEM_PROCESSING", { query: item2 });
  }),
  REQUEST_REMOVE_ITEM: getItemByQueryFromState(state3, (item2) => {
    optionalPromise(query("GET_BEFORE_REMOVE_FILE"), createItemAPI(item2)).then((shouldRemove) => {
      if (!shouldRemove) {
        return;
      }
      dispatch("REMOVE_ITEM", { query: item2 });
    });
  }),
  RELEASE_ITEM: getItemByQueryFromState(state3, (item2) => {
    item2.release();
  }),
  REMOVE_ITEM: getItemByQueryFromState(state3, (item2, success, failure, options) => {
    const removeFromView = () => {
      const id = item2.id;
      getItemById(state3.items, id).archive();
      dispatch("DID_REMOVE_ITEM", { error: null, id, item: item2 });
      listUpdated(dispatch, state3);
      success(createItemAPI(item2));
    };
    const server = state3.options.server;
    if (item2.origin === FileOrigin.LOCAL && server && isFunction(server.remove) && options.remove !== false) {
      dispatch("DID_START_ITEM_REMOVE", { id: item2.id });
      server.remove(
        item2.source,
        () => removeFromView(),
        (status) => {
          dispatch("DID_THROW_ITEM_REMOVE_ERROR", {
            id: item2.id,
            error: createResponse("error", 0, status, null),
            status: {
              main: dynamicLabel(state3.options.labelFileRemoveError)(status),
              sub: state3.options.labelTapToRetry
            }
          });
        }
      );
    } else {
      if (options.revert && item2.origin !== FileOrigin.LOCAL && item2.serverId !== null || // if chunked uploads are enabled and we're uploading in chunks for this specific file
      // or if the file isn't big enough for chunked uploads but chunkForce is set then call
      // revert before removing from the view...
      state3.options.chunkUploads && item2.file.size > state3.options.chunkSize || state3.options.chunkUploads && state3.options.chunkForce) {
        item2.revert(
          createRevertFunction(state3.options.server.url, state3.options.server.revert),
          query("GET_FORCE_REVERT")
        );
      }
      removeFromView();
    }
  }),
  ABORT_ITEM_LOAD: getItemByQueryFromState(state3, (item2) => {
    item2.abortLoad();
  }),
  ABORT_ITEM_PROCESSING: getItemByQueryFromState(state3, (item2) => {
    if (item2.serverId) {
      dispatch("REVERT_ITEM_PROCESSING", { id: item2.id });
      return;
    }
    item2.abortProcessing().then(() => {
      const shouldRemove = state3.options.instantUpload;
      if (shouldRemove) {
        dispatch("REMOVE_ITEM", { query: item2.id });
      }
    });
  }),
  REQUEST_REVERT_ITEM_PROCESSING: getItemByQueryFromState(state3, (item2) => {
    if (!state3.options.instantUpload) {
      dispatch("REVERT_ITEM_PROCESSING", { query: item2 });
      return;
    }
    const handleRevert2 = (shouldRevert) => {
      if (!shouldRevert) return;
      dispatch("REVERT_ITEM_PROCESSING", { query: item2 });
    };
    const fn3 = query("GET_BEFORE_REMOVE_FILE");
    if (!fn3) {
      return handleRevert2(true);
    }
    const requestRemoveResult = fn3(createItemAPI(item2));
    if (requestRemoveResult == null) {
      return handleRevert2(true);
    }
    if (typeof requestRemoveResult === "boolean") {
      return handleRevert2(requestRemoveResult);
    }
    if (typeof requestRemoveResult.then === "function") {
      requestRemoveResult.then(handleRevert2);
    }
  }),
  REVERT_ITEM_PROCESSING: getItemByQueryFromState(state3, (item2) => {
    item2.revert(
      createRevertFunction(state3.options.server.url, state3.options.server.revert),
      query("GET_FORCE_REVERT")
    ).then(() => {
      const shouldRemove = state3.options.instantUpload || isMockItem(item2);
      if (shouldRemove) {
        dispatch("REMOVE_ITEM", { query: item2.id });
      }
    }).catch(() => {
    });
  }),
  SET_OPTIONS: ({ options }) => {
    const optionKeys = Object.keys(options);
    const prioritizedOptionKeys = PrioritizedOptions.filter((key) => optionKeys.includes(key));
    const orderedOptionKeys = [
      // add prioritized first if passed to options, else remove
      ...prioritizedOptionKeys,
      // prevent duplicate keys
      ...Object.keys(options).filter((key) => !prioritizedOptionKeys.includes(key))
    ];
    orderedOptionKeys.forEach((key) => {
      dispatch(`SET_${fromCamels(key, "_").toUpperCase()}`, {
        value: options[key]
      });
    });
  }
});
var PrioritizedOptions = [
  "server"
  // must be processed before "files"
];
var formatFilename = (name3) => name3;
var createElement$1 = (tagName) => {
  return document.createElement(tagName);
};
var text = (node, value) => {
  let textNode2 = node.childNodes[0];
  if (!textNode2) {
    textNode2 = document.createTextNode(value);
    node.appendChild(textNode2);
  } else if (value !== textNode2.nodeValue) {
    textNode2.nodeValue = value;
  }
};
var polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees % 360 - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};
var describeArc = (x, y, radius, startAngle, endAngle, arcSweep) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  return ["M", start.x, start.y, "A", radius, radius, 0, arcSweep, 0, end.x, end.y].join(" ");
};
var percentageArc = (x, y, radius, from, to) => {
  let arcSweep = 1;
  if (to > from && to - from <= 0.5) {
    arcSweep = 0;
  }
  if (from > to && from - to >= 0.5) {
    arcSweep = 0;
  }
  return describeArc(
    x,
    y,
    radius,
    Math.min(0.9999, from) * 360,
    Math.min(0.9999, to) * 360,
    arcSweep
  );
};
var create = ({ root: root3, props }) => {
  props.spin = false;
  props.progress = 0;
  props.opacity = 0;
  const svg4 = createElement("svg");
  root3.ref.path = createElement("path", {
    "stroke-width": 2,
    "stroke-linecap": "round"
  });
  svg4.appendChild(root3.ref.path);
  root3.ref.svg = svg4;
  root3.appendChild(svg4);
};
var write = ({ root: root3, props }) => {
  if (props.opacity === 0) {
    return;
  }
  if (props.align) {
    root3.element.dataset.align = props.align;
  }
  const ringStrokeWidth = parseInt(attr(root3.ref.path, "stroke-width"), 10);
  const size = root3.rect.element.width * 0.5;
  let ringFrom = 0;
  let ringTo = 0;
  if (props.spin) {
    ringFrom = 0;
    ringTo = 0.5;
  } else {
    ringFrom = 0;
    ringTo = props.progress;
  }
  const coordinates = percentageArc(size, size, size - ringStrokeWidth, ringFrom, ringTo);
  attr(root3.ref.path, "d", coordinates);
  attr(root3.ref.path, "stroke-opacity", props.spin || props.progress > 0 ? 1 : 0);
};
var progressIndicator = createView({
  tag: "div",
  name: "progress-indicator",
  ignoreRectUpdate: true,
  ignoreRect: true,
  create,
  write,
  mixins: {
    apis: ["progress", "spin", "align"],
    styles: ["opacity"],
    animations: {
      opacity: { type: "tween", duration: 500 },
      progress: {
        type: "spring",
        stiffness: 0.95,
        damping: 0.65,
        mass: 10
      }
    }
  }
});
var create$1 = ({ root: root3, props }) => {
  root3.element.innerHTML = (props.icon || "") + `<span>${props.label}</span>`;
  props.isDisabled = false;
};
var write$1 = ({ root: root3, props }) => {
  const { isDisabled } = props;
  const shouldDisable = root3.query("GET_DISABLED") || props.opacity === 0;
  if (shouldDisable && !isDisabled) {
    props.isDisabled = true;
    attr(root3.element, "disabled", "disabled");
  } else if (!shouldDisable && isDisabled) {
    props.isDisabled = false;
    root3.element.removeAttribute("disabled");
  }
};
var fileActionButton = createView({
  tag: "button",
  attributes: {
    type: "button"
  },
  ignoreRect: true,
  ignoreRectUpdate: true,
  name: "file-action-button",
  mixins: {
    apis: ["label"],
    styles: ["translateX", "translateY", "scaleX", "scaleY", "opacity"],
    animations: {
      scaleX: "spring",
      scaleY: "spring",
      translateX: "spring",
      translateY: "spring",
      opacity: { type: "tween", duration: 250 }
    },
    listeners: true
  },
  create: create$1,
  write: write$1
});
var toNaturalFileSize = (bytes, decimalSeparator = ".", base = 1e3, options = {}) => {
  const {
    labelBytes = "bytes",
    labelKilobytes = "KB",
    labelMegabytes = "MB",
    labelGigabytes = "GB"
  } = options;
  bytes = Math.round(Math.abs(bytes));
  const KB = base;
  const MB = base * base;
  const GB = base * base * base;
  if (bytes < KB) {
    return `${bytes} ${labelBytes}`;
  }
  if (bytes < MB) {
    return `${Math.floor(bytes / KB)} ${labelKilobytes}`;
  }
  if (bytes < GB) {
    return `${removeDecimalsWhenZero(bytes / MB, 1, decimalSeparator)} ${labelMegabytes}`;
  }
  return `${removeDecimalsWhenZero(bytes / GB, 2, decimalSeparator)} ${labelGigabytes}`;
};
var removeDecimalsWhenZero = (value, decimalCount, separator) => {
  return value.toFixed(decimalCount).split(".").filter((part) => part !== "0").join(separator);
};
var create$2 = ({ root: root3, props }) => {
  const fileName = createElement$1("span");
  fileName.className = "filepond--file-info-main";
  attr(fileName, "aria-hidden", "true");
  root3.appendChild(fileName);
  root3.ref.fileName = fileName;
  const fileSize = createElement$1("span");
  fileSize.className = "filepond--file-info-sub";
  root3.appendChild(fileSize);
  root3.ref.fileSize = fileSize;
  text(fileSize, root3.query("GET_LABEL_FILE_WAITING_FOR_SIZE"));
  text(fileName, formatFilename(root3.query("GET_ITEM_NAME", props.id)));
};
var updateFile = ({ root: root3, props }) => {
  text(
    root3.ref.fileSize,
    toNaturalFileSize(
      root3.query("GET_ITEM_SIZE", props.id),
      ".",
      root3.query("GET_FILE_SIZE_BASE"),
      root3.query("GET_FILE_SIZE_LABELS", root3.query)
    )
  );
  text(root3.ref.fileName, formatFilename(root3.query("GET_ITEM_NAME", props.id)));
};
var updateFileSizeOnError = ({ root: root3, props }) => {
  if (isInt(root3.query("GET_ITEM_SIZE", props.id))) {
    updateFile({ root: root3, props });
    return;
  }
  text(root3.ref.fileSize, root3.query("GET_LABEL_FILE_SIZE_NOT_AVAILABLE"));
};
var fileInfo = createView({
  name: "file-info",
  ignoreRect: true,
  ignoreRectUpdate: true,
  write: createRoute({
    DID_LOAD_ITEM: updateFile,
    DID_UPDATE_ITEM_META: updateFile,
    DID_THROW_ITEM_LOAD_ERROR: updateFileSizeOnError,
    DID_THROW_ITEM_INVALID: updateFileSizeOnError
  }),
  didCreateView: (root3) => {
    applyFilters("CREATE_VIEW", { ...root3, view: root3 });
  },
  create: create$2,
  mixins: {
    styles: ["translateX", "translateY"],
    animations: {
      translateX: "spring",
      translateY: "spring"
    }
  }
});
var toPercentage = (value) => Math.round(value * 100);
var create$3 = ({ root: root3 }) => {
  const main = createElement$1("span");
  main.className = "filepond--file-status-main";
  root3.appendChild(main);
  root3.ref.main = main;
  const sub = createElement$1("span");
  sub.className = "filepond--file-status-sub";
  root3.appendChild(sub);
  root3.ref.sub = sub;
  didSetItemLoadProgress({ root: root3, action: { progress: null } });
};
var didSetItemLoadProgress = ({ root: root3, action }) => {
  const title = action.progress === null ? root3.query("GET_LABEL_FILE_LOADING") : `${root3.query("GET_LABEL_FILE_LOADING")} ${toPercentage(action.progress)}%`;
  text(root3.ref.main, title);
  text(root3.ref.sub, root3.query("GET_LABEL_TAP_TO_CANCEL"));
};
var didSetItemProcessProgress = ({ root: root3, action }) => {
  const title = action.progress === null ? root3.query("GET_LABEL_FILE_PROCESSING") : `${root3.query("GET_LABEL_FILE_PROCESSING")} ${toPercentage(action.progress)}%`;
  text(root3.ref.main, title);
  text(root3.ref.sub, root3.query("GET_LABEL_TAP_TO_CANCEL"));
};
var didRequestItemProcessing = ({ root: root3 }) => {
  text(root3.ref.main, root3.query("GET_LABEL_FILE_PROCESSING"));
  text(root3.ref.sub, root3.query("GET_LABEL_TAP_TO_CANCEL"));
};
var didAbortItemProcessing = ({ root: root3 }) => {
  text(root3.ref.main, root3.query("GET_LABEL_FILE_PROCESSING_ABORTED"));
  text(root3.ref.sub, root3.query("GET_LABEL_TAP_TO_RETRY"));
};
var didCompleteItemProcessing = ({ root: root3 }) => {
  text(root3.ref.main, root3.query("GET_LABEL_FILE_PROCESSING_COMPLETE"));
  text(root3.ref.sub, root3.query("GET_LABEL_TAP_TO_UNDO"));
};
var clear = ({ root: root3 }) => {
  text(root3.ref.main, "");
  text(root3.ref.sub, "");
};
var error = ({ root: root3, action }) => {
  text(root3.ref.main, action.status.main);
  text(root3.ref.sub, action.status.sub);
};
var fileStatus = createView({
  name: "file-status",
  ignoreRect: true,
  ignoreRectUpdate: true,
  write: createRoute({
    DID_LOAD_ITEM: clear,
    DID_REVERT_ITEM_PROCESSING: clear,
    DID_REQUEST_ITEM_PROCESSING: didRequestItemProcessing,
    DID_ABORT_ITEM_PROCESSING: didAbortItemProcessing,
    DID_COMPLETE_ITEM_PROCESSING: didCompleteItemProcessing,
    DID_UPDATE_ITEM_PROCESS_PROGRESS: didSetItemProcessProgress,
    DID_UPDATE_ITEM_LOAD_PROGRESS: didSetItemLoadProgress,
    DID_THROW_ITEM_LOAD_ERROR: error,
    DID_THROW_ITEM_INVALID: error,
    DID_THROW_ITEM_PROCESSING_ERROR: error,
    DID_THROW_ITEM_PROCESSING_REVERT_ERROR: error,
    DID_THROW_ITEM_REMOVE_ERROR: error
  }),
  didCreateView: (root3) => {
    applyFilters("CREATE_VIEW", { ...root3, view: root3 });
  },
  create: create$3,
  mixins: {
    styles: ["translateX", "translateY", "opacity"],
    animations: {
      opacity: { type: "tween", duration: 250 },
      translateX: "spring",
      translateY: "spring"
    }
  }
});
var Buttons = {
  AbortItemLoad: {
    label: "GET_LABEL_BUTTON_ABORT_ITEM_LOAD",
    action: "ABORT_ITEM_LOAD",
    className: "filepond--action-abort-item-load",
    align: "LOAD_INDICATOR_POSITION"
    // right
  },
  RetryItemLoad: {
    label: "GET_LABEL_BUTTON_RETRY_ITEM_LOAD",
    action: "RETRY_ITEM_LOAD",
    icon: "GET_ICON_RETRY",
    className: "filepond--action-retry-item-load",
    align: "BUTTON_PROCESS_ITEM_POSITION"
    // right
  },
  RemoveItem: {
    label: "GET_LABEL_BUTTON_REMOVE_ITEM",
    action: "REQUEST_REMOVE_ITEM",
    icon: "GET_ICON_REMOVE",
    className: "filepond--action-remove-item",
    align: "BUTTON_REMOVE_ITEM_POSITION"
    // left
  },
  ProcessItem: {
    label: "GET_LABEL_BUTTON_PROCESS_ITEM",
    action: "REQUEST_ITEM_PROCESSING",
    icon: "GET_ICON_PROCESS",
    className: "filepond--action-process-item",
    align: "BUTTON_PROCESS_ITEM_POSITION"
    // right
  },
  AbortItemProcessing: {
    label: "GET_LABEL_BUTTON_ABORT_ITEM_PROCESSING",
    action: "ABORT_ITEM_PROCESSING",
    className: "filepond--action-abort-item-processing",
    align: "BUTTON_PROCESS_ITEM_POSITION"
    // right
  },
  RetryItemProcessing: {
    label: "GET_LABEL_BUTTON_RETRY_ITEM_PROCESSING",
    action: "RETRY_ITEM_PROCESSING",
    icon: "GET_ICON_RETRY",
    className: "filepond--action-retry-item-processing",
    align: "BUTTON_PROCESS_ITEM_POSITION"
    // right
  },
  RevertItemProcessing: {
    label: "GET_LABEL_BUTTON_UNDO_ITEM_PROCESSING",
    action: "REQUEST_REVERT_ITEM_PROCESSING",
    icon: "GET_ICON_UNDO",
    className: "filepond--action-revert-item-processing",
    align: "BUTTON_PROCESS_ITEM_POSITION"
    // right
  }
};
var ButtonKeys = [];
forin(Buttons, (key) => {
  ButtonKeys.push(key);
});
var calculateFileInfoOffset = (root3) => {
  if (getRemoveIndicatorAligment(root3) === "right") return 0;
  const buttonRect = root3.ref.buttonRemoveItem.rect.element;
  return buttonRect.hidden ? null : buttonRect.width + buttonRect.left;
};
var calculateButtonWidth = (root3) => {
  const buttonRect = root3.ref.buttonAbortItemLoad.rect.element;
  return buttonRect.width;
};
var calculateFileVerticalCenterOffset = (root3) => Math.floor(root3.ref.buttonRemoveItem.rect.element.height / 4);
var calculateFileHorizontalCenterOffset = (root3) => Math.floor(root3.ref.buttonRemoveItem.rect.element.left / 2);
var getLoadIndicatorAlignment = (root3) => root3.query("GET_STYLE_LOAD_INDICATOR_POSITION");
var getProcessIndicatorAlignment = (root3) => root3.query("GET_STYLE_PROGRESS_INDICATOR_POSITION");
var getRemoveIndicatorAligment = (root3) => root3.query("GET_STYLE_BUTTON_REMOVE_ITEM_POSITION");
var DefaultStyle = {
  buttonAbortItemLoad: { opacity: 0 },
  buttonRetryItemLoad: { opacity: 0 },
  buttonRemoveItem: { opacity: 0 },
  buttonProcessItem: { opacity: 0 },
  buttonAbortItemProcessing: { opacity: 0 },
  buttonRetryItemProcessing: { opacity: 0 },
  buttonRevertItemProcessing: { opacity: 0 },
  loadProgressIndicator: { opacity: 0, align: getLoadIndicatorAlignment },
  processProgressIndicator: { opacity: 0, align: getProcessIndicatorAlignment },
  processingCompleteIndicator: { opacity: 0, scaleX: 0.75, scaleY: 0.75 },
  info: { translateX: 0, translateY: 0, opacity: 0 },
  status: { translateX: 0, translateY: 0, opacity: 0 }
};
var IdleStyle = {
  buttonRemoveItem: { opacity: 1 },
  buttonProcessItem: { opacity: 1 },
  info: { translateX: calculateFileInfoOffset },
  status: { translateX: calculateFileInfoOffset }
};
var ProcessingStyle = {
  buttonAbortItemProcessing: { opacity: 1 },
  processProgressIndicator: { opacity: 1 },
  status: { opacity: 1 }
};
var StyleMap = {
  DID_THROW_ITEM_INVALID: {
    buttonRemoveItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { translateX: calculateFileInfoOffset, opacity: 1 }
  },
  DID_START_ITEM_LOAD: {
    buttonAbortItemLoad: { opacity: 1 },
    loadProgressIndicator: { opacity: 1 },
    status: { opacity: 1 }
  },
  DID_THROW_ITEM_LOAD_ERROR: {
    buttonRetryItemLoad: { opacity: 1 },
    buttonRemoveItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { opacity: 1 }
  },
  DID_START_ITEM_REMOVE: {
    processProgressIndicator: { opacity: 1, align: getRemoveIndicatorAligment },
    info: { translateX: calculateFileInfoOffset },
    status: { opacity: 0 }
  },
  DID_THROW_ITEM_REMOVE_ERROR: {
    processProgressIndicator: { opacity: 0, align: getRemoveIndicatorAligment },
    buttonRemoveItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { opacity: 1, translateX: calculateFileInfoOffset }
  },
  DID_LOAD_ITEM: IdleStyle,
  DID_LOAD_LOCAL_ITEM: {
    buttonRemoveItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { translateX: calculateFileInfoOffset }
  },
  DID_START_ITEM_PROCESSING: ProcessingStyle,
  DID_REQUEST_ITEM_PROCESSING: ProcessingStyle,
  DID_UPDATE_ITEM_PROCESS_PROGRESS: ProcessingStyle,
  DID_COMPLETE_ITEM_PROCESSING: {
    buttonRevertItemProcessing: { opacity: 1 },
    info: { opacity: 1 },
    status: { opacity: 1 }
  },
  DID_THROW_ITEM_PROCESSING_ERROR: {
    buttonRemoveItem: { opacity: 1 },
    buttonRetryItemProcessing: { opacity: 1 },
    status: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset }
  },
  DID_THROW_ITEM_PROCESSING_REVERT_ERROR: {
    buttonRevertItemProcessing: { opacity: 1 },
    status: { opacity: 1 },
    info: { opacity: 1 }
  },
  DID_ABORT_ITEM_PROCESSING: {
    buttonRemoveItem: { opacity: 1 },
    buttonProcessItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { opacity: 1 }
  },
  DID_REVERT_ITEM_PROCESSING: IdleStyle
};
var processingCompleteIndicatorView = createView({
  create: ({ root: root3 }) => {
    root3.element.innerHTML = root3.query("GET_ICON_DONE");
  },
  name: "processing-complete-indicator",
  ignoreRect: true,
  mixins: {
    styles: ["scaleX", "scaleY", "opacity"],
    animations: {
      scaleX: "spring",
      scaleY: "spring",
      opacity: { type: "tween", duration: 250 }
    }
  }
});
var create$4 = ({ root: root3, props }) => {
  const LocalButtons = Object.keys(Buttons).reduce((prev, curr) => {
    prev[curr] = { ...Buttons[curr] };
    return prev;
  }, {});
  const { id } = props;
  const allowRevert = root3.query("GET_ALLOW_REVERT");
  const allowRemove = root3.query("GET_ALLOW_REMOVE");
  const allowProcess = root3.query("GET_ALLOW_PROCESS");
  const instantUpload = root3.query("GET_INSTANT_UPLOAD");
  const isAsync2 = root3.query("IS_ASYNC");
  const alignRemoveItemButton = root3.query("GET_STYLE_BUTTON_REMOVE_ITEM_ALIGN");
  let buttonFilter;
  if (isAsync2) {
    if (allowProcess && !allowRevert) {
      buttonFilter = (key) => !/RevertItemProcessing/.test(key);
    } else if (!allowProcess && allowRevert) {
      buttonFilter = (key) => !/ProcessItem|RetryItemProcessing|AbortItemProcessing/.test(key);
    } else if (!allowProcess && !allowRevert) {
      buttonFilter = (key) => !/Process/.test(key);
    }
  } else {
    buttonFilter = (key) => !/Process/.test(key);
  }
  const enabledButtons = buttonFilter ? ButtonKeys.filter(buttonFilter) : ButtonKeys.concat();
  if (instantUpload && allowRevert) {
    LocalButtons["RevertItemProcessing"].label = "GET_LABEL_BUTTON_REMOVE_ITEM";
    LocalButtons["RevertItemProcessing"].icon = "GET_ICON_REMOVE";
  }
  if (isAsync2 && !allowRevert) {
    const map2 = StyleMap["DID_COMPLETE_ITEM_PROCESSING"];
    map2.info.translateX = calculateFileHorizontalCenterOffset;
    map2.info.translateY = calculateFileVerticalCenterOffset;
    map2.status.translateY = calculateFileVerticalCenterOffset;
    map2.processingCompleteIndicator = { opacity: 1, scaleX: 1, scaleY: 1 };
  }
  if (isAsync2 && !allowProcess) {
    [
      "DID_START_ITEM_PROCESSING",
      "DID_REQUEST_ITEM_PROCESSING",
      "DID_UPDATE_ITEM_PROCESS_PROGRESS",
      "DID_THROW_ITEM_PROCESSING_ERROR"
    ].forEach((key) => {
      StyleMap[key].status.translateY = calculateFileVerticalCenterOffset;
    });
    StyleMap["DID_THROW_ITEM_PROCESSING_ERROR"].status.translateX = calculateButtonWidth;
  }
  if (alignRemoveItemButton && allowRevert) {
    LocalButtons["RevertItemProcessing"].align = "BUTTON_REMOVE_ITEM_POSITION";
    const map2 = StyleMap["DID_COMPLETE_ITEM_PROCESSING"];
    map2.info.translateX = calculateFileInfoOffset;
    map2.status.translateY = calculateFileVerticalCenterOffset;
    map2.processingCompleteIndicator = { opacity: 1, scaleX: 1, scaleY: 1 };
  }
  if (!allowRemove) {
    LocalButtons["RemoveItem"].disabled = true;
  }
  forin(LocalButtons, (key, definition) => {
    const buttonView = root3.createChildView(fileActionButton, {
      label: root3.query(definition.label),
      icon: root3.query(definition.icon),
      opacity: 0
    });
    if (enabledButtons.includes(key)) {
      root3.appendChildView(buttonView);
    }
    if (definition.disabled) {
      buttonView.element.setAttribute("disabled", "disabled");
      buttonView.element.setAttribute("hidden", "hidden");
    }
    buttonView.element.dataset.align = root3.query(`GET_STYLE_${definition.align}`);
    buttonView.element.classList.add(definition.className);
    buttonView.on("click", (e3) => {
      e3.stopPropagation();
      if (definition.disabled) return;
      root3.dispatch(definition.action, { query: id });
    });
    root3.ref[`button${key}`] = buttonView;
  });
  root3.ref.processingCompleteIndicator = root3.appendChildView(
    root3.createChildView(processingCompleteIndicatorView)
  );
  root3.ref.processingCompleteIndicator.element.dataset.align = root3.query(
    `GET_STYLE_BUTTON_PROCESS_ITEM_POSITION`
  );
  root3.ref.info = root3.appendChildView(root3.createChildView(fileInfo, { id }));
  root3.ref.status = root3.appendChildView(root3.createChildView(fileStatus, { id }));
  const loadIndicatorView = root3.appendChildView(
    root3.createChildView(progressIndicator, {
      opacity: 0,
      align: root3.query(`GET_STYLE_LOAD_INDICATOR_POSITION`)
    })
  );
  loadIndicatorView.element.classList.add("filepond--load-indicator");
  root3.ref.loadProgressIndicator = loadIndicatorView;
  const progressIndicatorView = root3.appendChildView(
    root3.createChildView(progressIndicator, {
      opacity: 0,
      align: root3.query(`GET_STYLE_PROGRESS_INDICATOR_POSITION`)
    })
  );
  progressIndicatorView.element.classList.add("filepond--process-indicator");
  root3.ref.processProgressIndicator = progressIndicatorView;
  root3.ref.activeStyles = [];
};
var write$2 = ({ root: root3, actions: actions3, props }) => {
  route({ root: root3, actions: actions3, props });
  let action = actions3.concat().filter((action2) => /^DID_/.test(action2.type)).reverse().find((action2) => StyleMap[action2.type]);
  if (action) {
    root3.ref.activeStyles = [];
    const stylesToApply = StyleMap[action.type];
    forin(DefaultStyle, (name3, defaultStyles) => {
      const control = root3.ref[name3];
      forin(defaultStyles, (key, defaultValue) => {
        const value = stylesToApply[name3] && typeof stylesToApply[name3][key] !== "undefined" ? stylesToApply[name3][key] : defaultValue;
        root3.ref.activeStyles.push({ control, key, value });
      });
    });
  }
  root3.ref.activeStyles.forEach(({ control, key, value }) => {
    control[key] = typeof value === "function" ? value(root3) : value;
  });
};
var route = createRoute({
  DID_SET_LABEL_BUTTON_ABORT_ITEM_PROCESSING: ({ root: root3, action }) => {
    root3.ref.buttonAbortItemProcessing.label = action.value;
  },
  DID_SET_LABEL_BUTTON_ABORT_ITEM_LOAD: ({ root: root3, action }) => {
    root3.ref.buttonAbortItemLoad.label = action.value;
  },
  DID_SET_LABEL_BUTTON_ABORT_ITEM_REMOVAL: ({ root: root3, action }) => {
    root3.ref.buttonAbortItemRemoval.label = action.value;
  },
  DID_REQUEST_ITEM_PROCESSING: ({ root: root3 }) => {
    root3.ref.processProgressIndicator.spin = true;
    root3.ref.processProgressIndicator.progress = 0;
  },
  DID_START_ITEM_LOAD: ({ root: root3 }) => {
    root3.ref.loadProgressIndicator.spin = true;
    root3.ref.loadProgressIndicator.progress = 0;
  },
  DID_START_ITEM_REMOVE: ({ root: root3 }) => {
    root3.ref.processProgressIndicator.spin = true;
    root3.ref.processProgressIndicator.progress = 0;
  },
  DID_UPDATE_ITEM_LOAD_PROGRESS: ({ root: root3, action }) => {
    root3.ref.loadProgressIndicator.spin = false;
    root3.ref.loadProgressIndicator.progress = action.progress;
  },
  DID_UPDATE_ITEM_PROCESS_PROGRESS: ({ root: root3, action }) => {
    root3.ref.processProgressIndicator.spin = false;
    root3.ref.processProgressIndicator.progress = action.progress;
  }
});
var file = createView({
  create: create$4,
  write: write$2,
  didCreateView: (root3) => {
    applyFilters("CREATE_VIEW", { ...root3, view: root3 });
  },
  name: "file"
});
var create$5 = ({ root: root3, props }) => {
  root3.ref.fileName = createElement$1("legend");
  root3.appendChild(root3.ref.fileName);
  root3.ref.file = root3.appendChildView(root3.createChildView(file, { id: props.id }));
  root3.ref.data = false;
};
var didLoadItem = ({ root: root3, props }) => {
  text(root3.ref.fileName, formatFilename(root3.query("GET_ITEM_NAME", props.id)));
};
var fileWrapper = createView({
  create: create$5,
  ignoreRect: true,
  write: createRoute({
    DID_LOAD_ITEM: didLoadItem
  }),
  didCreateView: (root3) => {
    applyFilters("CREATE_VIEW", { ...root3, view: root3 });
  },
  tag: "fieldset",
  name: "file-wrapper"
});
var PANEL_SPRING_PROPS = { type: "spring", damping: 0.6, mass: 7 };
var create$6 = ({ root: root3, props }) => {
  [
    {
      name: "top"
    },
    {
      name: "center",
      props: {
        translateY: null,
        scaleY: null
      },
      mixins: {
        animations: {
          scaleY: PANEL_SPRING_PROPS
        },
        styles: ["translateY", "scaleY"]
      }
    },
    {
      name: "bottom",
      props: {
        translateY: null
      },
      mixins: {
        animations: {
          translateY: PANEL_SPRING_PROPS
        },
        styles: ["translateY"]
      }
    }
  ].forEach((section) => {
    createSection(root3, section, props.name);
  });
  root3.element.classList.add(`filepond--${props.name}`);
  root3.ref.scalable = null;
};
var createSection = (root3, section, className) => {
  const viewConstructor = createView({
    name: `panel-${section.name} filepond--${className}`,
    mixins: section.mixins,
    ignoreRectUpdate: true
  });
  const view = root3.createChildView(viewConstructor, section.props);
  root3.ref[section.name] = root3.appendChildView(view);
};
var write$3 = ({ root: root3, props }) => {
  if (root3.ref.scalable === null || props.scalable !== root3.ref.scalable) {
    root3.ref.scalable = isBoolean(props.scalable) ? props.scalable : true;
    root3.element.dataset.scalable = root3.ref.scalable;
  }
  if (!props.height) return;
  const topRect = root3.ref.top.rect.element;
  const bottomRect = root3.ref.bottom.rect.element;
  const height = Math.max(topRect.height + bottomRect.height, props.height);
  root3.ref.center.translateY = topRect.height;
  root3.ref.center.scaleY = (height - topRect.height - bottomRect.height) / 100;
  root3.ref.bottom.translateY = height - bottomRect.height;
};
var panel = createView({
  name: "panel",
  read: ({ root: root3, props }) => props.heightCurrent = root3.ref.bottom.translateY,
  write: write$3,
  create: create$6,
  ignoreRect: true,
  mixins: {
    apis: ["height", "heightCurrent", "scalable"]
  }
});
var createDragHelper = (items) => {
  const itemIds = items.map((item2) => item2.id);
  let prevIndex = void 0;
  return {
    setIndex: (index) => {
      prevIndex = index;
    },
    getIndex: () => prevIndex,
    getItemIndex: (item2) => itemIds.indexOf(item2.id)
  };
};
var ITEM_TRANSLATE_SPRING = {
  type: "spring",
  stiffness: 0.75,
  damping: 0.45,
  mass: 10
};
var ITEM_SCALE_SPRING = "spring";
var StateMap = {
  DID_START_ITEM_LOAD: "busy",
  DID_UPDATE_ITEM_LOAD_PROGRESS: "loading",
  DID_THROW_ITEM_INVALID: "load-invalid",
  DID_THROW_ITEM_LOAD_ERROR: "load-error",
  DID_LOAD_ITEM: "idle",
  DID_THROW_ITEM_REMOVE_ERROR: "remove-error",
  DID_START_ITEM_REMOVE: "busy",
  DID_START_ITEM_PROCESSING: "busy processing",
  DID_REQUEST_ITEM_PROCESSING: "busy processing",
  DID_UPDATE_ITEM_PROCESS_PROGRESS: "processing",
  DID_COMPLETE_ITEM_PROCESSING: "processing-complete",
  DID_THROW_ITEM_PROCESSING_ERROR: "processing-error",
  DID_THROW_ITEM_PROCESSING_REVERT_ERROR: "processing-revert-error",
  DID_ABORT_ITEM_PROCESSING: "cancelled",
  DID_REVERT_ITEM_PROCESSING: "idle"
};
var create$7 = ({ root: root3, props }) => {
  root3.ref.handleClick = (e3) => root3.dispatch("DID_ACTIVATE_ITEM", { id: props.id });
  root3.element.id = `filepond--item-${props.id}`;
  root3.element.addEventListener("click", root3.ref.handleClick);
  root3.ref.container = root3.appendChildView(root3.createChildView(fileWrapper, { id: props.id }));
  root3.ref.panel = root3.appendChildView(root3.createChildView(panel, { name: "item-panel" }));
  root3.ref.panel.height = null;
  props.markedForRemoval = false;
  if (!root3.query("GET_ALLOW_REORDER")) return;
  root3.element.dataset.dragState = "idle";
  const grab = (e3) => {
    if (!e3.isPrimary) return;
    let removedActivateListener = false;
    const origin = {
      x: e3.pageX,
      y: e3.pageY
    };
    props.dragOrigin = {
      x: root3.translateX,
      y: root3.translateY
    };
    props.dragCenter = {
      x: e3.offsetX,
      y: e3.offsetY
    };
    const dragState = createDragHelper(root3.query("GET_ACTIVE_ITEMS"));
    root3.dispatch("DID_GRAB_ITEM", { id: props.id, dragState });
    const drag = (e4) => {
      if (!e4.isPrimary) return;
      e4.stopPropagation();
      e4.preventDefault();
      props.dragOffset = {
        x: e4.pageX - origin.x,
        y: e4.pageY - origin.y
      };
      const dist = props.dragOffset.x * props.dragOffset.x + props.dragOffset.y * props.dragOffset.y;
      if (dist > 16 && !removedActivateListener) {
        removedActivateListener = true;
        root3.element.removeEventListener("click", root3.ref.handleClick);
      }
      root3.dispatch("DID_DRAG_ITEM", { id: props.id, dragState });
    };
    const drop2 = (e4) => {
      if (!e4.isPrimary) return;
      props.dragOffset = {
        x: e4.pageX - origin.x,
        y: e4.pageY - origin.y
      };
      reset2();
    };
    const cancel = () => {
      reset2();
    };
    const reset2 = () => {
      document.removeEventListener("pointercancel", cancel);
      document.removeEventListener("pointermove", drag);
      document.removeEventListener("pointerup", drop2);
      root3.dispatch("DID_DROP_ITEM", { id: props.id, dragState });
      if (removedActivateListener) {
        setTimeout(() => root3.element.addEventListener("click", root3.ref.handleClick), 0);
      }
    };
    document.addEventListener("pointercancel", cancel);
    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", drop2);
  };
  root3.element.addEventListener("pointerdown", grab);
};
var route$1 = createRoute({
  DID_UPDATE_PANEL_HEIGHT: ({ root: root3, action }) => {
    root3.height = action.height;
  }
});
var write$4 = createRoute(
  {
    DID_GRAB_ITEM: ({ root: root3, props }) => {
      props.dragOrigin = {
        x: root3.translateX,
        y: root3.translateY
      };
    },
    DID_DRAG_ITEM: ({ root: root3 }) => {
      root3.element.dataset.dragState = "drag";
    },
    DID_DROP_ITEM: ({ root: root3, props }) => {
      props.dragOffset = null;
      props.dragOrigin = null;
      root3.element.dataset.dragState = "drop";
    }
  },
  ({ root: root3, actions: actions3, props, shouldOptimize }) => {
    if (root3.element.dataset.dragState === "drop") {
      if (root3.scaleX <= 1) {
        root3.element.dataset.dragState = "idle";
      }
    }
    let action = actions3.concat().filter((action2) => /^DID_/.test(action2.type)).reverse().find((action2) => StateMap[action2.type]);
    if (action && action.type !== props.currentState) {
      props.currentState = action.type;
      root3.element.dataset.filepondItemState = StateMap[props.currentState] || "";
    }
    const aspectRatio = root3.query("GET_ITEM_PANEL_ASPECT_RATIO") || root3.query("GET_PANEL_ASPECT_RATIO");
    if (!aspectRatio) {
      route$1({ root: root3, actions: actions3, props });
      if (!root3.height && root3.ref.container.rect.element.height > 0) {
        root3.height = root3.ref.container.rect.element.height;
      }
    } else if (!shouldOptimize) {
      root3.height = root3.rect.element.width * aspectRatio;
    }
    if (shouldOptimize) {
      root3.ref.panel.height = null;
    }
    root3.ref.panel.height = root3.height;
  }
);
var item = createView({
  create: create$7,
  write: write$4,
  destroy: ({ root: root3, props }) => {
    root3.element.removeEventListener("click", root3.ref.handleClick);
    root3.dispatch("RELEASE_ITEM", { query: props.id });
  },
  tag: "li",
  name: "item",
  mixins: {
    apis: [
      "id",
      "interactionMethod",
      "markedForRemoval",
      "spawnDate",
      "dragCenter",
      "dragOrigin",
      "dragOffset"
    ],
    styles: ["translateX", "translateY", "scaleX", "scaleY", "opacity", "height"],
    animations: {
      scaleX: ITEM_SCALE_SPRING,
      scaleY: ITEM_SCALE_SPRING,
      translateX: ITEM_TRANSLATE_SPRING,
      translateY: ITEM_TRANSLATE_SPRING,
      opacity: { type: "tween", duration: 150 }
    }
  }
});
var getItemsPerRow = (horizontalSpace, itemWidth) => {
  return Math.max(1, Math.floor((horizontalSpace + 1) / itemWidth));
};
var getItemIndexByPosition = (view, children, positionInView) => {
  if (!positionInView) return;
  const horizontalSpace = view.rect.element.width;
  const l2 = children.length;
  let last = null;
  if (l2 === 0 || positionInView.top < children[0].rect.element.top) return -1;
  const item2 = children[0];
  const itemRect = item2.rect.element;
  const itemHorizontalMargin = itemRect.marginLeft + itemRect.marginRight;
  const itemWidth = itemRect.width + itemHorizontalMargin;
  const itemsPerRow = getItemsPerRow(horizontalSpace, itemWidth);
  if (itemsPerRow === 1) {
    for (let index = 0; index < l2; index++) {
      const child = children[index];
      const childMid = child.rect.outer.top + child.rect.element.height * 0.5;
      if (positionInView.top < childMid) {
        return index;
      }
    }
    return l2;
  }
  const itemVerticalMargin = itemRect.marginTop + itemRect.marginBottom;
  const itemHeight = itemRect.height + itemVerticalMargin;
  for (let index = 0; index < l2; index++) {
    const indexX = index % itemsPerRow;
    const indexY = Math.floor(index / itemsPerRow);
    const offsetX = indexX * itemWidth;
    const offsetY = indexY * itemHeight;
    const itemTop = offsetY - itemRect.marginTop;
    const itemRight = offsetX + itemWidth;
    const itemBottom = offsetY + itemHeight + itemRect.marginBottom;
    if (positionInView.top < itemBottom && positionInView.top > itemTop) {
      if (positionInView.left < itemRight) {
        return index;
      } else if (index !== l2 - 1) {
        last = index;
      } else {
        last = null;
      }
    }
  }
  if (last !== null) {
    return last;
  }
  return l2;
};
var dropAreaDimensions = {
  height: 0,
  width: 0,
  get getHeight() {
    return this.height;
  },
  set setHeight(val) {
    if (this.height === 0 || val === 0) this.height = val;
  },
  get getWidth() {
    return this.width;
  },
  set setWidth(val) {
    if (this.width === 0 || val === 0) this.width = val;
  }};
var create$8 = ({ root: root3 }) => {
  attr(root3.element, "role", "list");
  root3.ref.lastItemSpanwDate = Date.now();
};
var addItemView = ({ root: root3, action }) => {
  const { id, index, interactionMethod } = action;
  root3.ref.addIndex = index;
  const now2 = Date.now();
  let spawnDate = now2;
  let opacity = 1;
  if (interactionMethod !== InteractionMethod.NONE) {
    opacity = 0;
    const cooldown = root3.query("GET_ITEM_INSERT_INTERVAL");
    const dist = now2 - root3.ref.lastItemSpanwDate;
    spawnDate = dist < cooldown ? now2 + (cooldown - dist) : now2;
  }
  root3.ref.lastItemSpanwDate = spawnDate;
  root3.appendChildView(
    root3.createChildView(
      // view type
      item,
      // props
      {
        spawnDate,
        id,
        opacity,
        interactionMethod
      }
    ),
    index
  );
};
var moveItem = (item2, x, y, vx = 0, vy = 1) => {
  if (item2.dragOffset) {
    item2.translateX = null;
    item2.translateY = null;
    item2.translateX = item2.dragOrigin.x + item2.dragOffset.x;
    item2.translateY = item2.dragOrigin.y + item2.dragOffset.y;
    item2.scaleX = 1.025;
    item2.scaleY = 1.025;
  } else {
    item2.translateX = x;
    item2.translateY = y;
    if (Date.now() > item2.spawnDate) {
      if (item2.opacity === 0) {
        introItemView(item2, x, y, vx, vy);
      }
      item2.scaleX = 1;
      item2.scaleY = 1;
      item2.opacity = 1;
    }
  }
};
var introItemView = (item2, x, y, vx, vy) => {
  if (item2.interactionMethod === InteractionMethod.NONE) {
    item2.translateX = null;
    item2.translateX = x;
    item2.translateY = null;
    item2.translateY = y;
  } else if (item2.interactionMethod === InteractionMethod.DROP) {
    item2.translateX = null;
    item2.translateX = x - vx * 20;
    item2.translateY = null;
    item2.translateY = y - vy * 10;
    item2.scaleX = 0.8;
    item2.scaleY = 0.8;
  } else if (item2.interactionMethod === InteractionMethod.BROWSE) {
    item2.translateY = null;
    item2.translateY = y - 30;
  } else if (item2.interactionMethod === InteractionMethod.API) {
    item2.translateX = null;
    item2.translateX = x - 30;
    item2.translateY = null;
  }
};
var removeItemView = ({ root: root3, action }) => {
  const { id } = action;
  const view = root3.childViews.find((child) => child.id === id);
  if (!view) {
    return;
  }
  view.scaleX = 0.9;
  view.scaleY = 0.9;
  view.opacity = 0;
  view.markedForRemoval = true;
};
var getItemHeight = (child) => child.rect.element.height + child.rect.element.marginBottom + child.rect.element.marginTop;
var getItemWidth = (child) => child.rect.element.width + child.rect.element.marginLeft * 0.5 + child.rect.element.marginRight * 0.5;
var dragItem = ({ root: root3, action }) => {
  const { id, dragState } = action;
  const item2 = root3.query("GET_ITEM", { id });
  const view = root3.childViews.find((child) => child.id === id);
  const numItems = root3.childViews.length;
  const oldIndex = dragState.getItemIndex(item2);
  if (!view) return;
  const dragPosition = {
    x: view.dragOrigin.x + view.dragOffset.x + view.dragCenter.x,
    y: view.dragOrigin.y + view.dragOffset.y + view.dragCenter.y
  };
  const dragHeight = getItemHeight(view);
  const dragWidth = getItemWidth(view);
  let cols = Math.floor(root3.rect.outer.width / dragWidth);
  if (cols > numItems) cols = numItems;
  const rows = Math.floor(numItems / cols + 1);
  dropAreaDimensions.setHeight = dragHeight * rows;
  dropAreaDimensions.setWidth = dragWidth * cols;
  var location2 = {
    y: Math.floor(dragPosition.y / dragHeight),
    x: Math.floor(dragPosition.x / dragWidth),
    getGridIndex: function getGridIndex() {
      if (dragPosition.y > dropAreaDimensions.getHeight || dragPosition.y < 0 || dragPosition.x > dropAreaDimensions.getWidth || dragPosition.x < 0)
        return oldIndex;
      return this.y * cols + this.x;
    },
    getColIndex: function getColIndex() {
      const items = root3.query("GET_ACTIVE_ITEMS");
      const visibleChildren = root3.childViews.filter((child) => child.rect.element.height);
      const children = items.map(
        (item3) => visibleChildren.find((childView) => childView.id === item3.id)
      );
      const currentIndex2 = children.findIndex((child) => child === view);
      const dragHeight2 = getItemHeight(view);
      const l2 = children.length;
      let idx = l2;
      let childHeight = 0;
      let childBottom = 0;
      let childTop = 0;
      for (let i2 = 0; i2 < l2; i2++) {
        childHeight = getItemHeight(children[i2]);
        childTop = childBottom;
        childBottom = childTop + childHeight;
        if (dragPosition.y < childBottom) {
          if (currentIndex2 > i2) {
            if (dragPosition.y < childTop + dragHeight2) {
              idx = i2;
              break;
            }
            continue;
          }
          idx = i2;
          break;
        }
      }
      return idx;
    }
  };
  const index = cols > 1 ? location2.getGridIndex() : location2.getColIndex();
  root3.dispatch("MOVE_ITEM", { query: view, index });
  const currentIndex = dragState.getIndex();
  if (currentIndex === void 0 || currentIndex !== index) {
    dragState.setIndex(index);
    if (currentIndex === void 0) return;
    root3.dispatch("DID_REORDER_ITEMS", {
      items: root3.query("GET_ACTIVE_ITEMS"),
      origin: oldIndex,
      target: index
    });
  }
};
var route$2 = createRoute({
  DID_ADD_ITEM: addItemView,
  DID_REMOVE_ITEM: removeItemView,
  DID_DRAG_ITEM: dragItem
});
var write$5 = ({ root: root3, props, actions: actions3, shouldOptimize }) => {
  route$2({ root: root3, props, actions: actions3 });
  const { dragCoordinates } = props;
  const horizontalSpace = root3.rect.element.width;
  const visibleChildren = root3.childViews.filter((child) => child.rect.element.height);
  const children = root3.query("GET_ACTIVE_ITEMS").map((item2) => visibleChildren.find((child) => child.id === item2.id)).filter((item2) => item2);
  const dragIndex = dragCoordinates ? getItemIndexByPosition(root3, children, dragCoordinates) : null;
  const addIndex = root3.ref.addIndex || null;
  root3.ref.addIndex = null;
  let dragIndexOffset = 0;
  let removeIndexOffset = 0;
  let addIndexOffset = 0;
  if (children.length === 0) return;
  const childRect = children[0].rect.element;
  const itemVerticalMargin = childRect.marginTop + childRect.marginBottom;
  const itemHorizontalMargin = childRect.marginLeft + childRect.marginRight;
  const itemWidth = childRect.width + itemHorizontalMargin;
  const itemHeight = childRect.height + itemVerticalMargin;
  const itemsPerRow = getItemsPerRow(horizontalSpace, itemWidth);
  if (itemsPerRow === 1) {
    let offsetY = 0;
    let dragOffset = 0;
    children.forEach((child, index) => {
      if (dragIndex) {
        let dist = index - dragIndex;
        if (dist === -2) {
          dragOffset = -itemVerticalMargin * 0.25;
        } else if (dist === -1) {
          dragOffset = -itemVerticalMargin * 0.75;
        } else if (dist === 0) {
          dragOffset = itemVerticalMargin * 0.75;
        } else if (dist === 1) {
          dragOffset = itemVerticalMargin * 0.25;
        } else {
          dragOffset = 0;
        }
      }
      if (shouldOptimize) {
        child.translateX = null;
        child.translateY = null;
      }
      if (!child.markedForRemoval) {
        moveItem(child, 0, offsetY + dragOffset);
      }
      let itemHeight2 = child.rect.element.height + itemVerticalMargin;
      let visualHeight = itemHeight2 * (child.markedForRemoval ? child.opacity : 1);
      offsetY += visualHeight;
    });
  } else {
    let prevX = 0;
    let prevY = 0;
    children.forEach((child, index) => {
      if (index === dragIndex) {
        dragIndexOffset = 1;
      }
      if (index === addIndex) {
        addIndexOffset += 1;
      }
      if (child.markedForRemoval && child.opacity < 0.5) {
        removeIndexOffset -= 1;
      }
      const visualIndex = index + addIndexOffset + dragIndexOffset + removeIndexOffset;
      const indexX = visualIndex % itemsPerRow;
      const indexY = Math.floor(visualIndex / itemsPerRow);
      const offsetX = indexX * itemWidth;
      const offsetY = indexY * itemHeight;
      const vectorX = Math.sign(offsetX - prevX);
      const vectorY = Math.sign(offsetY - prevY);
      prevX = offsetX;
      prevY = offsetY;
      if (child.markedForRemoval) return;
      if (shouldOptimize) {
        child.translateX = null;
        child.translateY = null;
      }
      moveItem(child, offsetX, offsetY, vectorX, vectorY);
    });
  }
};
var filterSetItemActions = (child, actions3) => actions3.filter((action) => {
  if (action.data && action.data.id) {
    return child.id === action.data.id;
  }
  return true;
});
var list = createView({
  create: create$8,
  write: write$5,
  tag: "ul",
  name: "list",
  didWriteView: ({ root: root3 }) => {
    root3.childViews.filter((view) => view.markedForRemoval && view.opacity === 0 && view.resting).forEach((view) => {
      view._destroy();
      root3.removeChildView(view);
    });
  },
  filterFrameActionsForChild: filterSetItemActions,
  mixins: {
    apis: ["dragCoordinates"]
  }
});
var create$9 = ({ root: root3, props }) => {
  root3.ref.list = root3.appendChildView(root3.createChildView(list));
  props.dragCoordinates = null;
  props.overflowing = false;
};
var storeDragCoordinates = ({ root: root3, props, action }) => {
  if (!root3.query("GET_ITEM_INSERT_LOCATION_FREEDOM")) return;
  props.dragCoordinates = {
    left: action.position.scopeLeft - root3.ref.list.rect.element.left,
    top: action.position.scopeTop - (root3.rect.outer.top + root3.rect.element.marginTop + root3.rect.element.scrollTop)
  };
};
var clearDragCoordinates = ({ props }) => {
  props.dragCoordinates = null;
};
var route$3 = createRoute({
  DID_DRAG: storeDragCoordinates,
  DID_END_DRAG: clearDragCoordinates
});
var write$6 = ({ root: root3, props, actions: actions3 }) => {
  route$3({ root: root3, props, actions: actions3 });
  root3.ref.list.dragCoordinates = props.dragCoordinates;
  if (props.overflowing && !props.overflow) {
    props.overflowing = false;
    root3.element.dataset.state = "";
    root3.height = null;
  }
  if (props.overflow) {
    const newHeight = Math.round(props.overflow);
    if (newHeight !== root3.height) {
      props.overflowing = true;
      root3.element.dataset.state = "overflow";
      root3.height = newHeight;
    }
  }
};
var listScroller = createView({
  create: create$9,
  write: write$6,
  name: "list-scroller",
  mixins: {
    apis: ["overflow", "dragCoordinates"],
    styles: ["height", "translateY"],
    animations: {
      translateY: "spring"
    }
  }
});
var attrToggle = (element, name3, state3, enabledValue = "") => {
  if (state3) {
    attr(element, name3, enabledValue);
  } else {
    element.removeAttribute(name3);
  }
};
var resetFileInput = (input) => {
  if (!input || input.value === "") {
    return;
  }
  try {
    input.value = "";
  } catch (err) {
  }
  if (input.value) {
    const form = createElement$1("form");
    const parentNode = input.parentNode;
    const ref = input.nextSibling;
    form.appendChild(input);
    form.reset();
    if (ref) {
      parentNode.insertBefore(input, ref);
    } else {
      parentNode.appendChild(input);
    }
  }
};
var create$a = ({ root: root3, props }) => {
  root3.element.id = `filepond--browser-${props.id}`;
  attr(root3.element, "name", root3.query("GET_NAME"));
  attr(root3.element, "aria-controls", `filepond--assistant-${props.id}`);
  attr(root3.element, "aria-labelledby", `filepond--drop-label-${props.id}`);
  setAcceptedFileTypes({ root: root3, action: { value: root3.query("GET_ACCEPTED_FILE_TYPES") } });
  toggleAllowMultiple({ root: root3, action: { value: root3.query("GET_ALLOW_MULTIPLE") } });
  toggleDirectoryFilter({ root: root3, action: { value: root3.query("GET_ALLOW_DIRECTORIES_ONLY") } });
  toggleDisabled({ root: root3 });
  toggleRequired({ root: root3, action: { value: root3.query("GET_REQUIRED") } });
  setCaptureMethod({ root: root3, action: { value: root3.query("GET_CAPTURE_METHOD") } });
  root3.ref.handleChange = (e3) => {
    if (!root3.element.value) {
      return;
    }
    const files = Array.from(root3.element.files).map((file2) => {
      file2._relativePath = file2.webkitRelativePath;
      return file2;
    });
    setTimeout(() => {
      props.onload(files);
      resetFileInput(root3.element);
    }, 250);
  };
  root3.element.addEventListener("change", root3.ref.handleChange);
};
var setAcceptedFileTypes = ({ root: root3, action }) => {
  if (!root3.query("GET_ALLOW_SYNC_ACCEPT_ATTRIBUTE")) return;
  attrToggle(root3.element, "accept", !!action.value, action.value ? action.value.join(",") : "");
};
var toggleAllowMultiple = ({ root: root3, action }) => {
  attrToggle(root3.element, "multiple", action.value);
};
var toggleDirectoryFilter = ({ root: root3, action }) => {
  attrToggle(root3.element, "webkitdirectory", action.value);
};
var toggleDisabled = ({ root: root3 }) => {
  const isDisabled = root3.query("GET_DISABLED");
  const doesAllowBrowse = root3.query("GET_ALLOW_BROWSE");
  const disableField = isDisabled || !doesAllowBrowse;
  attrToggle(root3.element, "disabled", disableField);
};
var toggleRequired = ({ root: root3, action }) => {
  if (!action.value) {
    attrToggle(root3.element, "required", false);
  } else if (root3.query("GET_TOTAL_ITEMS") === 0) {
    attrToggle(root3.element, "required", true);
  }
};
var setCaptureMethod = ({ root: root3, action }) => {
  attrToggle(root3.element, "capture", !!action.value, action.value === true ? "" : action.value);
};
var updateRequiredStatus = ({ root: root3 }) => {
  const { element } = root3;
  if (root3.query("GET_TOTAL_ITEMS") > 0) {
    attrToggle(element, "required", false);
    attrToggle(element, "name", false);
    const activeItems = root3.query("GET_ACTIVE_ITEMS");
    let hasInvalidField = false;
    for (let i2 = 0; i2 < activeItems.length; i2++) {
      if (activeItems[i2].status === ItemStatus.LOAD_ERROR) {
        hasInvalidField = true;
      }
    }
    root3.element.setCustomValidity(
      hasInvalidField ? root3.query("GET_LABEL_INVALID_FIELD") : ""
    );
  } else {
    attrToggle(element, "name", true, root3.query("GET_NAME"));
    const shouldCheckValidity = root3.query("GET_CHECK_VALIDITY");
    if (shouldCheckValidity) {
      element.setCustomValidity("");
    }
    if (root3.query("GET_REQUIRED")) {
      attrToggle(element, "required", true);
    }
  }
};
var updateFieldValidityStatus = ({ root: root3 }) => {
  const shouldCheckValidity = root3.query("GET_CHECK_VALIDITY");
  if (!shouldCheckValidity) return;
  root3.element.setCustomValidity(root3.query("GET_LABEL_INVALID_FIELD"));
};
var browser = createView({
  tag: "input",
  name: "browser",
  ignoreRect: true,
  ignoreRectUpdate: true,
  attributes: {
    type: "file"
  },
  create: create$a,
  destroy: ({ root: root3 }) => {
    root3.element.removeEventListener("change", root3.ref.handleChange);
  },
  write: createRoute({
    DID_LOAD_ITEM: updateRequiredStatus,
    DID_REMOVE_ITEM: updateRequiredStatus,
    DID_THROW_ITEM_INVALID: updateFieldValidityStatus,
    DID_SET_DISABLED: toggleDisabled,
    DID_SET_ALLOW_BROWSE: toggleDisabled,
    DID_SET_ALLOW_DIRECTORIES_ONLY: toggleDirectoryFilter,
    DID_SET_ALLOW_MULTIPLE: toggleAllowMultiple,
    DID_SET_ACCEPTED_FILE_TYPES: setAcceptedFileTypes,
    DID_SET_CAPTURE_METHOD: setCaptureMethod,
    DID_SET_REQUIRED: toggleRequired
  })
});
var Key = {
  ENTER: 13,
  SPACE: 32
};
var create$b = ({ root: root3, props }) => {
  const label = createElement$1("label");
  attr(label, "for", `filepond--browser-${props.id}`);
  attr(label, "id", `filepond--drop-label-${props.id}`);
  root3.ref.handleKeyDown = (e3) => {
    const isActivationKey = e3.keyCode === Key.ENTER || e3.keyCode === Key.SPACE;
    if (!isActivationKey) return;
    e3.preventDefault();
    root3.ref.label.click();
  };
  root3.ref.handleClick = (e3) => {
    const isLabelClick = e3.target === label || label.contains(e3.target);
    if (isLabelClick) return;
    root3.ref.label.click();
  };
  label.addEventListener("keydown", root3.ref.handleKeyDown);
  root3.element.addEventListener("click", root3.ref.handleClick);
  updateLabelValue(label, props.caption);
  root3.appendChild(label);
  root3.ref.label = label;
};
var updateLabelValue = (label, value) => {
  label.innerHTML = value;
  const clickable = label.querySelector(".filepond--label-action");
  if (clickable) {
    attr(clickable, "tabindex", "0");
  }
  return value;
};
var dropLabel = createView({
  name: "drop-label",
  ignoreRect: true,
  create: create$b,
  destroy: ({ root: root3 }) => {
    root3.ref.label.addEventListener("keydown", root3.ref.handleKeyDown);
    root3.element.removeEventListener("click", root3.ref.handleClick);
  },
  write: createRoute({
    DID_SET_LABEL_IDLE: ({ root: root3, action }) => {
      updateLabelValue(root3.ref.label, action.value);
    }
  }),
  mixins: {
    styles: ["opacity", "translateX", "translateY"],
    animations: {
      opacity: { type: "tween", duration: 150 },
      translateX: "spring",
      translateY: "spring"
    }
  }
});
var blob = createView({
  name: "drip-blob",
  ignoreRect: true,
  mixins: {
    styles: ["translateX", "translateY", "scaleX", "scaleY", "opacity"],
    animations: {
      scaleX: "spring",
      scaleY: "spring",
      translateX: "spring",
      translateY: "spring",
      opacity: { type: "tween", duration: 250 }
    }
  }
});
var addBlob = ({ root: root3 }) => {
  const centerX = root3.rect.element.width * 0.5;
  const centerY = root3.rect.element.height * 0.5;
  root3.ref.blob = root3.appendChildView(
    root3.createChildView(blob, {
      opacity: 0,
      scaleX: 2.5,
      scaleY: 2.5,
      translateX: centerX,
      translateY: centerY
    })
  );
};
var moveBlob = ({ root: root3, action }) => {
  if (!root3.ref.blob) {
    addBlob({ root: root3 });
    return;
  }
  root3.ref.blob.translateX = action.position.scopeLeft;
  root3.ref.blob.translateY = action.position.scopeTop;
  root3.ref.blob.scaleX = 1;
  root3.ref.blob.scaleY = 1;
  root3.ref.blob.opacity = 1;
};
var hideBlob = ({ root: root3 }) => {
  if (!root3.ref.blob) {
    return;
  }
  root3.ref.blob.opacity = 0;
};
var explodeBlob = ({ root: root3 }) => {
  if (!root3.ref.blob) {
    return;
  }
  root3.ref.blob.scaleX = 2.5;
  root3.ref.blob.scaleY = 2.5;
  root3.ref.blob.opacity = 0;
};
var write$7 = ({ root: root3, props, actions: actions3 }) => {
  route$4({ root: root3, props, actions: actions3 });
  const { blob: blob2 } = root3.ref;
  if (actions3.length === 0 && blob2 && blob2.opacity === 0) {
    root3.removeChildView(blob2);
    root3.ref.blob = null;
  }
};
var route$4 = createRoute({
  DID_DRAG: moveBlob,
  DID_DROP: explodeBlob,
  DID_END_DRAG: hideBlob
});
var drip = createView({
  ignoreRect: true,
  ignoreRectUpdate: true,
  name: "drip",
  write: write$7
});
var setInputFiles = (element, files) => {
  try {
    const dataTransfer = new DataTransfer();
    files.forEach((file2) => {
      if (file2 instanceof File) {
        dataTransfer.items.add(file2);
      } else {
        dataTransfer.items.add(
          new File([file2], file2.name, {
            type: file2.type
          })
        );
      }
    });
    element.files = dataTransfer.files;
  } catch (err) {
    return false;
  }
  return true;
};
var create$c = ({ root: root3 }) => {
  root3.ref.fields = {};
  const legend = document.createElement("legend");
  legend.textContent = "Files";
  root3.element.appendChild(legend);
};
var getField = (root3, id) => root3.ref.fields[id];
var syncFieldPositionsWithItems = (root3) => {
  root3.query("GET_ACTIVE_ITEMS").forEach((item2) => {
    if (!root3.ref.fields[item2.id]) return;
    root3.element.appendChild(root3.ref.fields[item2.id]);
  });
};
var didReorderItems = ({ root: root3 }) => syncFieldPositionsWithItems(root3);
var didAddItem = ({ root: root3, action }) => {
  const fileItem = root3.query("GET_ITEM", action.id);
  const isLocalFile = fileItem.origin === FileOrigin.LOCAL;
  const shouldUseFileInput = !isLocalFile && root3.query("SHOULD_UPDATE_FILE_INPUT");
  const dataContainer = createElement$1("input");
  dataContainer.type = shouldUseFileInput ? "file" : "hidden";
  dataContainer.name = root3.query("GET_NAME");
  root3.ref.fields[action.id] = dataContainer;
  syncFieldPositionsWithItems(root3);
};
var didLoadItem$1 = ({ root: root3, action }) => {
  const field = getField(root3, action.id);
  if (!field) return;
  if (action.serverFileReference !== null) field.value = action.serverFileReference;
  if (!root3.query("SHOULD_UPDATE_FILE_INPUT")) return;
  const fileItem = root3.query("GET_ITEM", action.id);
  setInputFiles(field, [fileItem.file]);
};
var didPrepareOutput = ({ root: root3, action }) => {
  if (!root3.query("SHOULD_UPDATE_FILE_INPUT")) return;
  setTimeout(() => {
    const field = getField(root3, action.id);
    if (!field) return;
    setInputFiles(field, [action.file]);
  }, 0);
};
var didSetDisabled = ({ root: root3 }) => {
  root3.element.disabled = root3.query("GET_DISABLED");
};
var didRemoveItem = ({ root: root3, action }) => {
  const field = getField(root3, action.id);
  if (!field) return;
  if (field.parentNode) field.parentNode.removeChild(field);
  delete root3.ref.fields[action.id];
};
var didDefineValue = ({ root: root3, action }) => {
  const field = getField(root3, action.id);
  if (!field) return;
  if (action.value === null) {
    field.removeAttribute("value");
  } else {
    if (field.type != "file") {
      field.value = action.value;
    }
  }
  syncFieldPositionsWithItems(root3);
};
var write$8 = createRoute({
  DID_SET_DISABLED: didSetDisabled,
  DID_ADD_ITEM: didAddItem,
  DID_LOAD_ITEM: didLoadItem$1,
  DID_REMOVE_ITEM: didRemoveItem,
  DID_DEFINE_VALUE: didDefineValue,
  DID_PREPARE_OUTPUT: didPrepareOutput,
  DID_REORDER_ITEMS: didReorderItems,
  DID_SORT_ITEMS: didReorderItems
});
var data2 = createView({
  tag: "fieldset",
  name: "data",
  create: create$c,
  write: write$8,
  ignoreRect: true
});
var getRootNode = (element) => "getRootNode" in element ? element.getRootNode() : document;
var images = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff"];
var text$1 = ["css", "csv", "html", "txt"];
var map = {
  zip: "zip|compressed",
  epub: "application/epub+zip"
};
var guesstimateMimeType = (extension = "") => {
  extension = extension.toLowerCase();
  if (images.includes(extension)) {
    return "image/" + (extension === "jpg" ? "jpeg" : extension === "svg" ? "svg+xml" : extension);
  }
  if (text$1.includes(extension)) {
    return "text/" + extension;
  }
  return map[extension] || "";
};
var requestDataTransferItems = (dataTransfer) => new Promise((resolve, reject) => {
  const links = getLinks(dataTransfer);
  if (links.length && !hasFiles(dataTransfer)) {
    return resolve(links);
  }
  getFiles(dataTransfer).then(resolve);
});
var hasFiles = (dataTransfer) => {
  if (dataTransfer.files) return dataTransfer.files.length > 0;
  return false;
};
var getFiles = (dataTransfer) => new Promise((resolve, reject) => {
  const promisedFiles = (dataTransfer.items ? Array.from(dataTransfer.items) : []).filter((item2) => isFileSystemItem(item2)).map((item2) => getFilesFromItem(item2));
  if (!promisedFiles.length) {
    resolve(dataTransfer.files ? Array.from(dataTransfer.files) : []);
    return;
  }
  Promise.all(promisedFiles).then((returnedFileGroups) => {
    const files = [];
    returnedFileGroups.forEach((group) => {
      files.push.apply(files, group);
    });
    resolve(
      files.filter((file2) => file2).map((file2) => {
        if (!file2._relativePath) file2._relativePath = file2.webkitRelativePath;
        return file2;
      })
    );
  }).catch(console.error);
});
var isFileSystemItem = (item2) => {
  if (isEntry(item2)) {
    const entry = getAsEntry(item2);
    if (entry) {
      return entry.isFile || entry.isDirectory;
    }
  }
  return item2.kind === "file";
};
var getFilesFromItem = (item2) => new Promise((resolve, reject) => {
  if (isDirectoryEntry(item2)) {
    getFilesInDirectory(getAsEntry(item2)).then(resolve).catch(reject);
    return;
  }
  resolve([item2.getAsFile()]);
});
var getFilesInDirectory = (entry) => new Promise((resolve, reject) => {
  const files = [];
  let dirCounter = 0;
  let fileCounter = 0;
  const resolveIfDone = () => {
    if (fileCounter === 0 && dirCounter === 0) {
      resolve(files);
    }
  };
  const readEntries = (dirEntry) => {
    dirCounter++;
    const directoryReader = dirEntry.createReader();
    const readBatch = () => {
      directoryReader.readEntries((entries) => {
        if (entries.length === 0) {
          dirCounter--;
          resolveIfDone();
          return;
        }
        entries.forEach((entry2) => {
          if (entry2.isDirectory) {
            readEntries(entry2);
          } else {
            fileCounter++;
            entry2.file((file2) => {
              const correctedFile = correctMissingFileType(file2);
              if (entry2.fullPath) correctedFile._relativePath = entry2.fullPath;
              files.push(correctedFile);
              fileCounter--;
              resolveIfDone();
            });
          }
        });
        readBatch();
      }, reject);
    };
    readBatch();
  };
  readEntries(entry);
});
var correctMissingFileType = (file2) => {
  if (file2.type.length) return file2;
  const date = file2.lastModifiedDate;
  const name3 = file2.name;
  const type = guesstimateMimeType(getExtensionFromFilename(file2.name));
  if (!type.length) return file2;
  file2 = file2.slice(0, file2.size, type);
  file2.name = name3;
  file2.lastModifiedDate = date;
  return file2;
};
var isDirectoryEntry = (item2) => isEntry(item2) && (getAsEntry(item2) || {}).isDirectory;
var isEntry = (item2) => "webkitGetAsEntry" in item2;
var getAsEntry = (item2) => item2.webkitGetAsEntry();
var getLinks = (dataTransfer) => {
  let links = [];
  try {
    links = getLinksFromTransferMetaData(dataTransfer);
    if (links.length) {
      return links;
    }
    links = getLinksFromTransferURLData(dataTransfer);
  } catch (e3) {
  }
  return links;
};
var getLinksFromTransferURLData = (dataTransfer) => {
  let data3 = dataTransfer.getData("url");
  if (typeof data3 === "string" && data3.length) {
    return [data3];
  }
  return [];
};
var getLinksFromTransferMetaData = (dataTransfer) => {
  let data3 = dataTransfer.getData("text/html");
  if (typeof data3 === "string" && data3.length) {
    const matches = data3.match(/src\s*=\s*"(.+?)"/);
    if (matches) {
      return [matches[1]];
    }
  }
  return [];
};
var dragNDropObservers = [];
var eventPosition = (e3) => ({
  pageLeft: e3.pageX,
  pageTop: e3.pageY,
  scopeLeft: e3.offsetX || e3.layerX,
  scopeTop: e3.offsetY || e3.layerY
});
var createDragNDropClient = (element, scopeToObserve, filterElement) => {
  const observer = getDragNDropObserver(scopeToObserve);
  const client = {
    element,
    filterElement,
    state: null,
    ondrop: () => {
    },
    onenter: () => {
    },
    ondrag: () => {
    },
    onexit: () => {
    },
    onload: () => {
    },
    allowdrop: () => {
    }
  };
  client.destroy = observer.addListener(client);
  return client;
};
var getDragNDropObserver = (element) => {
  const observer = dragNDropObservers.find((item2) => item2.element === element);
  if (observer) {
    return observer;
  }
  const newObserver = createDragNDropObserver(element);
  dragNDropObservers.push(newObserver);
  return newObserver;
};
var createDragNDropObserver = (element) => {
  const clients = [];
  const routes = {
    dragenter,
    dragover,
    dragleave,
    drop
  };
  const handlers = {};
  forin(routes, (event, createHandler) => {
    handlers[event] = createHandler(element, clients);
    element.addEventListener(event, handlers[event], false);
  });
  const observer = {
    element,
    addListener: (client) => {
      clients.push(client);
      return () => {
        clients.splice(clients.indexOf(client), 1);
        if (clients.length === 0) {
          dragNDropObservers.splice(dragNDropObservers.indexOf(observer), 1);
          forin(routes, (event) => {
            element.removeEventListener(event, handlers[event], false);
          });
        }
      };
    }
  };
  return observer;
};
var elementFromPoint = (root3, point) => {
  if (!("elementFromPoint" in root3)) {
    root3 = document;
  }
  return root3.elementFromPoint(point.x, point.y);
};
var isEventTarget = (e3, target) => {
  const root3 = getRootNode(target);
  const elementAtPosition = elementFromPoint(root3, {
    x: e3.pageX - window.pageXOffset,
    y: e3.pageY - window.pageYOffset
  });
  return elementAtPosition === target || target.contains(elementAtPosition);
};
var initialTarget = null;
var setDropEffect = (dataTransfer, effect) => {
  try {
    dataTransfer.dropEffect = effect;
  } catch (e3) {
  }
};
var dragenter = (root3, clients) => (e3) => {
  e3.preventDefault();
  initialTarget = e3.target;
  clients.forEach((client) => {
    const { element, onenter } = client;
    if (isEventTarget(e3, element)) {
      client.state = "enter";
      onenter(eventPosition(e3));
    }
  });
};
var dragover = (root3, clients) => (e3) => {
  e3.preventDefault();
  const dataTransfer = e3.dataTransfer;
  requestDataTransferItems(dataTransfer).then((items) => {
    let overDropTarget = false;
    clients.some((client) => {
      const { filterElement, element, onenter, onexit, ondrag, allowdrop } = client;
      setDropEffect(dataTransfer, "copy");
      const allowsTransfer = allowdrop(items);
      if (!allowsTransfer) {
        setDropEffect(dataTransfer, "none");
        return;
      }
      if (isEventTarget(e3, element)) {
        overDropTarget = true;
        if (client.state === null) {
          client.state = "enter";
          onenter(eventPosition(e3));
          return;
        }
        client.state = "over";
        if (filterElement && !allowsTransfer) {
          setDropEffect(dataTransfer, "none");
          return;
        }
        ondrag(eventPosition(e3));
      } else {
        if (filterElement && !overDropTarget) {
          setDropEffect(dataTransfer, "none");
        }
        if (client.state) {
          client.state = null;
          onexit(eventPosition(e3));
        }
      }
    });
  });
};
var drop = (root3, clients) => (e3) => {
  e3.preventDefault();
  const dataTransfer = e3.dataTransfer;
  requestDataTransferItems(dataTransfer).then((items) => {
    clients.forEach((client) => {
      const { filterElement, element, ondrop, onexit, allowdrop } = client;
      client.state = null;
      if (filterElement && !isEventTarget(e3, element)) return;
      if (!allowdrop(items)) return onexit(eventPosition(e3));
      ondrop(eventPosition(e3), items);
    });
  });
};
var dragleave = (root3, clients) => (e3) => {
  if (initialTarget !== e3.target) {
    return;
  }
  clients.forEach((client) => {
    const { onexit } = client;
    client.state = null;
    onexit(eventPosition(e3));
  });
};
var createHopper = (scope, validateItems, options) => {
  scope.classList.add("filepond--hopper");
  const { catchesDropsOnPage, requiresDropOnElement, filterItems = (items) => items } = options;
  const client = createDragNDropClient(
    scope,
    catchesDropsOnPage ? document.documentElement : scope,
    requiresDropOnElement
  );
  let lastState = "";
  let currentState = "";
  client.allowdrop = (items) => {
    return validateItems(filterItems(items));
  };
  client.ondrop = (position, items) => {
    const filteredItems = filterItems(items);
    if (!validateItems(filteredItems)) {
      api.ondragend(position);
      return;
    }
    currentState = "drag-drop";
    api.onload(filteredItems, position);
  };
  client.ondrag = (position) => {
    api.ondrag(position);
  };
  client.onenter = (position) => {
    currentState = "drag-over";
    api.ondragstart(position);
  };
  client.onexit = (position) => {
    currentState = "drag-exit";
    api.ondragend(position);
  };
  const api = {
    updateHopperState: () => {
      if (lastState !== currentState) {
        scope.dataset.hopperState = currentState;
        lastState = currentState;
      }
    },
    onload: () => {
    },
    ondragstart: () => {
    },
    ondrag: () => {
    },
    ondragend: () => {
    },
    destroy: () => {
      client.destroy();
    }
  };
  return api;
};
var listening = false;
var listeners$1 = [];
var handlePaste = (e3) => {
  const activeEl = document.activeElement;
  const isActiveElementEditable = activeEl && (/textarea|input/i.test(activeEl.nodeName) || activeEl.getAttribute("contenteditable") === "true" || activeEl.getAttribute("contenteditable") === "");
  if (isActiveElementEditable) {
    let inScope = false;
    let element = activeEl;
    while (element !== document.body) {
      if (element.classList.contains("filepond--root")) {
        inScope = true;
        break;
      }
      element = element.parentNode;
    }
    if (!inScope) return;
  }
  requestDataTransferItems(e3.clipboardData).then((files) => {
    if (!files.length) {
      return;
    }
    listeners$1.forEach((listener) => listener(files));
  });
};
var listen = (cb) => {
  if (listeners$1.includes(cb)) {
    return;
  }
  listeners$1.push(cb);
  if (listening) {
    return;
  }
  listening = true;
  document.addEventListener("paste", handlePaste);
};
var unlisten = (listener) => {
  arrayRemove(listeners$1, listeners$1.indexOf(listener));
  if (listeners$1.length === 0) {
    document.removeEventListener("paste", handlePaste);
    listening = false;
  }
};
var createPaster = () => {
  const cb = (files) => {
    api.onload(files);
  };
  const api = {
    destroy: () => {
      unlisten(cb);
    },
    onload: () => {
    }
  };
  listen(cb);
  return api;
};
var create$d = ({ root: root3, props }) => {
  root3.element.id = `filepond--assistant-${props.id}`;
  attr(root3.element, "role", "alert");
  attr(root3.element, "aria-live", "polite");
  attr(root3.element, "aria-relevant", "additions");
};
var addFilesNotificationTimeout = null;
var notificationClearTimeout = null;
var filenames = [];
var assist = (root3, message) => {
  root3.element.textContent = message;
};
var clear$1 = (root3) => {
  root3.element.textContent = "";
};
var listModified = (root3, filename, label) => {
  const total = root3.query("GET_TOTAL_ITEMS");
  assist(
    root3,
    `${label} ${filename}, ${total} ${total === 1 ? root3.query("GET_LABEL_FILE_COUNT_SINGULAR") : root3.query("GET_LABEL_FILE_COUNT_PLURAL")}`
  );
  clearTimeout(notificationClearTimeout);
  notificationClearTimeout = setTimeout(() => {
    clear$1(root3);
  }, 1500);
};
var isUsingFilePond = (root3) => root3.element.parentNode.contains(document.activeElement);
var itemAdded = ({ root: root3, action }) => {
  if (!isUsingFilePond(root3)) {
    return;
  }
  root3.element.textContent = "";
  const item2 = root3.query("GET_ITEM", action.id);
  filenames.push(item2.filename);
  clearTimeout(addFilesNotificationTimeout);
  addFilesNotificationTimeout = setTimeout(() => {
    listModified(root3, filenames.join(", "), root3.query("GET_LABEL_FILE_ADDED"));
    filenames.length = 0;
  }, 750);
};
var itemRemoved = ({ root: root3, action }) => {
  if (!isUsingFilePond(root3)) {
    return;
  }
  const item2 = action.item;
  listModified(root3, item2.filename, root3.query("GET_LABEL_FILE_REMOVED"));
};
var itemProcessed = ({ root: root3, action }) => {
  const item2 = root3.query("GET_ITEM", action.id);
  const filename = item2.filename;
  const label = root3.query("GET_LABEL_FILE_PROCESSING_COMPLETE");
  assist(root3, `${filename} ${label}`);
};
var itemProcessedUndo = ({ root: root3, action }) => {
  const item2 = root3.query("GET_ITEM", action.id);
  const filename = item2.filename;
  const label = root3.query("GET_LABEL_FILE_PROCESSING_ABORTED");
  assist(root3, `${filename} ${label}`);
};
var itemError = ({ root: root3, action }) => {
  const item2 = root3.query("GET_ITEM", action.id);
  const filename = item2.filename;
  assist(root3, `${action.status.main} ${filename} ${action.status.sub}`);
};
var assistant = createView({
  create: create$d,
  ignoreRect: true,
  ignoreRectUpdate: true,
  write: createRoute({
    DID_LOAD_ITEM: itemAdded,
    DID_REMOVE_ITEM: itemRemoved,
    DID_COMPLETE_ITEM_PROCESSING: itemProcessed,
    DID_ABORT_ITEM_PROCESSING: itemProcessedUndo,
    DID_REVERT_ITEM_PROCESSING: itemProcessedUndo,
    DID_THROW_ITEM_REMOVE_ERROR: itemError,
    DID_THROW_ITEM_LOAD_ERROR: itemError,
    DID_THROW_ITEM_INVALID: itemError,
    DID_THROW_ITEM_PROCESSING_ERROR: itemError
  }),
  tag: "span",
  name: "assistant"
});
var toCamels = (string, separator = "-") => string.replace(new RegExp(`${separator}.`, "g"), (sub) => sub.charAt(1).toUpperCase());
var debounce = (func, interval = 16, immidiateOnly = true) => {
  let last = Date.now();
  let timeout = null;
  return (...args) => {
    clearTimeout(timeout);
    const dist = Date.now() - last;
    const fn3 = () => {
      last = Date.now();
      func(...args);
    };
    if (dist < interval) {
      if (!immidiateOnly) {
        timeout = setTimeout(fn3, interval - dist);
      }
    } else {
      fn3();
    }
  };
};
var MAX_FILES_LIMIT = 1e6;
var prevent = (e3) => e3.preventDefault();
var create$e = ({ root: root3, props }) => {
  const id = root3.query("GET_ID");
  if (id) {
    root3.element.id = id;
  }
  const className = root3.query("GET_CLASS_NAME");
  if (className) {
    className.split(" ").filter((name3) => name3.length).forEach((name3) => {
      root3.element.classList.add(name3);
    });
  }
  root3.ref.label = root3.appendChildView(
    root3.createChildView(dropLabel, {
      ...props,
      translateY: null,
      caption: root3.query("GET_LABEL_IDLE")
    })
  );
  root3.ref.list = root3.appendChildView(root3.createChildView(listScroller, { translateY: null }));
  root3.ref.panel = root3.appendChildView(root3.createChildView(panel, { name: "panel-root" }));
  root3.ref.assistant = root3.appendChildView(root3.createChildView(assistant, { ...props }));
  root3.ref.data = root3.appendChildView(root3.createChildView(data2, { ...props }));
  root3.ref.measure = createElement$1("div");
  root3.ref.measure.style.height = "100%";
  root3.element.appendChild(root3.ref.measure);
  root3.ref.bounds = null;
  root3.query("GET_STYLES").filter((style) => !isEmpty(style.value)).map(({ name: name3, value }) => {
    root3.element.dataset[name3] = value;
  });
  root3.ref.widthPrevious = null;
  root3.ref.widthUpdated = debounce(() => {
    root3.ref.updateHistory = [];
    root3.dispatch("DID_RESIZE_ROOT");
  }, 250);
  root3.ref.previousAspectRatio = null;
  root3.ref.updateHistory = [];
  const canHover2 = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const hasPointerEvents = "PointerEvent" in window;
  if (root3.query("GET_ALLOW_REORDER") && hasPointerEvents && !canHover2) {
    root3.element.addEventListener("touchmove", prevent, { passive: false });
    root3.element.addEventListener("gesturestart", prevent);
  }
  const credits = root3.query("GET_CREDITS");
  const hasCredits = credits.length === 2;
  if (hasCredits) {
    const frag = document.createElement("a");
    frag.className = "filepond--credits";
    frag.href = credits[0];
    frag.tabIndex = -1;
    frag.target = "_blank";
    frag.rel = "noopener noreferrer nofollow";
    frag.textContent = credits[1];
    root3.element.appendChild(frag);
    root3.ref.credits = frag;
  }
};
var write$9 = ({ root: root3, props, actions: actions3 }) => {
  route$5({ root: root3, props, actions: actions3 });
  actions3.filter((action) => /^DID_SET_STYLE_/.test(action.type)).filter((action) => !isEmpty(action.data.value)).map(({ type, data: data3 }) => {
    const name3 = toCamels(type.substring(8).toLowerCase(), "_");
    root3.element.dataset[name3] = data3.value;
    root3.invalidateLayout();
  });
  if (root3.rect.element.hidden) return;
  if (root3.rect.element.width !== root3.ref.widthPrevious) {
    root3.ref.widthPrevious = root3.rect.element.width;
    root3.ref.widthUpdated();
  }
  let bounds = root3.ref.bounds;
  if (!bounds) {
    bounds = root3.ref.bounds = calculateRootBoundingBoxHeight(root3);
    root3.element.removeChild(root3.ref.measure);
    root3.ref.measure = null;
  }
  const { hopper, label, list: list3, panel: panel2 } = root3.ref;
  if (hopper) {
    hopper.updateHopperState();
  }
  const aspectRatio = root3.query("GET_PANEL_ASPECT_RATIO");
  const isMultiItem = root3.query("GET_ALLOW_MULTIPLE");
  const totalItems = root3.query("GET_TOTAL_ITEMS");
  const maxItems = isMultiItem ? root3.query("GET_MAX_FILES") || MAX_FILES_LIMIT : 1;
  const atMaxCapacity = totalItems === maxItems;
  const addAction = actions3.find((action) => action.type === "DID_ADD_ITEM");
  if (atMaxCapacity && addAction) {
    const interactionMethod = addAction.data.interactionMethod;
    label.opacity = 0;
    if (isMultiItem) {
      label.translateY = -40;
    } else {
      if (interactionMethod === InteractionMethod.API) {
        label.translateX = 40;
      } else if (interactionMethod === InteractionMethod.BROWSE) {
        label.translateY = 40;
      } else {
        label.translateY = 30;
      }
    }
  } else if (!atMaxCapacity) {
    label.opacity = 1;
    label.translateX = 0;
    label.translateY = 0;
  }
  const listItemMargin = calculateListItemMargin(root3);
  const listHeight = calculateListHeight(root3);
  const labelHeight = label.rect.element.height;
  const currentLabelHeight = !isMultiItem || atMaxCapacity ? 0 : labelHeight;
  const listMarginTop = atMaxCapacity ? list3.rect.element.marginTop : 0;
  const listMarginBottom = totalItems === 0 ? 0 : list3.rect.element.marginBottom;
  const visualHeight = currentLabelHeight + listMarginTop + listHeight.visual + listMarginBottom;
  const boundsHeight = currentLabelHeight + listMarginTop + listHeight.bounds + listMarginBottom;
  list3.translateY = Math.max(0, currentLabelHeight - list3.rect.element.marginTop) - listItemMargin.top;
  if (aspectRatio) {
    const width = root3.rect.element.width;
    const height = width * aspectRatio;
    if (aspectRatio !== root3.ref.previousAspectRatio) {
      root3.ref.previousAspectRatio = aspectRatio;
      root3.ref.updateHistory = [];
    }
    const history = root3.ref.updateHistory;
    history.push(width);
    const MAX_BOUNCES = 2;
    if (history.length > MAX_BOUNCES * 2) {
      const l2 = history.length;
      const bottom = l2 - 10;
      let bounces = 0;
      for (let i2 = l2; i2 >= bottom; i2--) {
        if (history[i2] === history[i2 - 2]) {
          bounces++;
        }
        if (bounces >= MAX_BOUNCES) {
          return;
        }
      }
    }
    panel2.scalable = false;
    panel2.height = height;
    const listAvailableHeight = (
      // the height of the panel minus the label height
      height - currentLabelHeight - // the room we leave open between the end of the list and the panel bottom
      (listMarginBottom - listItemMargin.bottom) - // if we're full we need to leave some room between the top of the panel and the list
      (atMaxCapacity ? listMarginTop : 0)
    );
    if (listHeight.visual > listAvailableHeight) {
      list3.overflow = listAvailableHeight;
    } else {
      list3.overflow = null;
    }
    root3.height = height;
  } else if (bounds.fixedHeight) {
    panel2.scalable = false;
    const listAvailableHeight = (
      // the height of the panel minus the label height
      bounds.fixedHeight - currentLabelHeight - // the room we leave open between the end of the list and the panel bottom
      (listMarginBottom - listItemMargin.bottom) - // if we're full we need to leave some room between the top of the panel and the list
      (atMaxCapacity ? listMarginTop : 0)
    );
    if (listHeight.visual > listAvailableHeight) {
      list3.overflow = listAvailableHeight;
    } else {
      list3.overflow = null;
    }
  } else if (bounds.cappedHeight) {
    const isCappedHeight = visualHeight >= bounds.cappedHeight;
    const panelHeight = Math.min(bounds.cappedHeight, visualHeight);
    panel2.scalable = true;
    panel2.height = isCappedHeight ? panelHeight : panelHeight - listItemMargin.top - listItemMargin.bottom;
    const listAvailableHeight = (
      // the height of the panel minus the label height
      panelHeight - currentLabelHeight - // the room we leave open between the end of the list and the panel bottom
      (listMarginBottom - listItemMargin.bottom) - // if we're full we need to leave some room between the top of the panel and the list
      (atMaxCapacity ? listMarginTop : 0)
    );
    if (visualHeight > bounds.cappedHeight && listHeight.visual > listAvailableHeight) {
      list3.overflow = listAvailableHeight;
    } else {
      list3.overflow = null;
    }
    root3.height = Math.min(
      bounds.cappedHeight,
      boundsHeight - listItemMargin.top - listItemMargin.bottom
    );
  } else {
    const itemMargin = totalItems > 0 ? listItemMargin.top + listItemMargin.bottom : 0;
    panel2.scalable = true;
    panel2.height = Math.max(labelHeight, visualHeight - itemMargin);
    root3.height = Math.max(labelHeight, boundsHeight - itemMargin);
  }
  if (root3.ref.credits && panel2.heightCurrent)
    root3.ref.credits.style.transform = `translateY(${panel2.heightCurrent}px)`;
};
var calculateListItemMargin = (root3) => {
  const item2 = root3.ref.list.childViews[0].childViews[0];
  return item2 ? {
    top: item2.rect.element.marginTop,
    bottom: item2.rect.element.marginBottom
  } : {
    top: 0,
    bottom: 0
  };
};
var calculateListHeight = (root3) => {
  let visual = 0;
  let bounds = 0;
  const scrollList = root3.ref.list;
  const itemList = scrollList.childViews[0];
  const visibleChildren = itemList.childViews.filter((child) => child.rect.element.height);
  const children = root3.query("GET_ACTIVE_ITEMS").map((item2) => visibleChildren.find((child) => child.id === item2.id)).filter((item2) => item2);
  if (children.length === 0) return { visual, bounds };
  const horizontalSpace = itemList.rect.element.width;
  const dragIndex = getItemIndexByPosition(itemList, children, scrollList.dragCoordinates);
  const childRect = children[0].rect.element;
  const itemVerticalMargin = childRect.marginTop + childRect.marginBottom;
  const itemHorizontalMargin = childRect.marginLeft + childRect.marginRight;
  const itemWidth = childRect.width + itemHorizontalMargin;
  const itemHeight = childRect.height + itemVerticalMargin;
  const newItem = typeof dragIndex !== "undefined" && dragIndex >= 0 ? 1 : 0;
  const removedItem = children.find((child) => child.markedForRemoval && child.opacity < 0.45) ? -1 : 0;
  const verticalItemCount = children.length + newItem + removedItem;
  const itemsPerRow = getItemsPerRow(horizontalSpace, itemWidth);
  if (itemsPerRow === 1) {
    children.forEach((item2) => {
      const height = item2.rect.element.height + itemVerticalMargin;
      bounds += height;
      visual += height * item2.opacity;
    });
  } else {
    bounds = Math.ceil(verticalItemCount / itemsPerRow) * itemHeight;
    visual = bounds;
  }
  return { visual, bounds };
};
var calculateRootBoundingBoxHeight = (root3) => {
  const height = root3.ref.measureHeight || null;
  const cappedHeight = parseInt(root3.style.maxHeight, 10) || null;
  const fixedHeight = height === 0 ? null : height;
  return {
    cappedHeight,
    fixedHeight
  };
};
var exceedsMaxFiles = (root3, items) => {
  const allowReplace = root3.query("GET_ALLOW_REPLACE");
  const allowMultiple = root3.query("GET_ALLOW_MULTIPLE");
  const totalItems = root3.query("GET_TOTAL_ITEMS");
  let maxItems = root3.query("GET_MAX_FILES");
  const totalBrowseItems = items.length;
  if (!allowMultiple && totalBrowseItems > 1) {
    root3.dispatch("DID_THROW_MAX_FILES", {
      source: items,
      error: createResponse("warning", 0, "Max files")
    });
    return true;
  }
  maxItems = allowMultiple ? maxItems : 1;
  if (!allowMultiple && allowReplace) {
    return false;
  }
  const hasMaxItems = isInt(maxItems);
  if (hasMaxItems && totalItems + totalBrowseItems > maxItems) {
    root3.dispatch("DID_THROW_MAX_FILES", {
      source: items,
      error: createResponse("warning", 0, "Max files")
    });
    return true;
  }
  return false;
};
var getDragIndex = (list3, children, position) => {
  const itemList = list3.childViews[0];
  return getItemIndexByPosition(itemList, children, {
    left: position.scopeLeft - itemList.rect.element.left,
    top: position.scopeTop - (list3.rect.outer.top + list3.rect.element.marginTop + list3.rect.element.scrollTop)
  });
};
var toggleDrop = (root3) => {
  const isAllowed = root3.query("GET_ALLOW_DROP");
  const isDisabled = root3.query("GET_DISABLED");
  const enabled = isAllowed && !isDisabled;
  if (enabled && !root3.ref.hopper) {
    const hopper = createHopper(
      root3.element,
      (items) => {
        const beforeDropFile = root3.query("GET_BEFORE_DROP_FILE") || (() => true);
        const dropValidation = root3.query("GET_DROP_VALIDATION");
        return dropValidation ? items.every(
          (item2) => applyFilters("ALLOW_HOPPER_ITEM", item2, {
            query: root3.query
          }).every((result) => result === true) && beforeDropFile(item2)
        ) : true;
      },
      {
        filterItems: (items) => {
          const ignoredFiles = root3.query("GET_IGNORED_FILES");
          return items.filter((item2) => {
            if (isFile(item2)) {
              return !ignoredFiles.includes(item2.name.toLowerCase());
            }
            return true;
          });
        },
        catchesDropsOnPage: root3.query("GET_DROP_ON_PAGE"),
        requiresDropOnElement: root3.query("GET_DROP_ON_ELEMENT")
      }
    );
    hopper.onload = (items, position) => {
      const list3 = root3.ref.list.childViews[0];
      const visibleChildren = list3.childViews.filter((child) => child.rect.element.height);
      const children = root3.query("GET_ACTIVE_ITEMS").map((item2) => visibleChildren.find((child) => child.id === item2.id)).filter((item2) => item2);
      applyFilterChain("ADD_ITEMS", items, { dispatch: root3.dispatch }).then((queue) => {
        if (exceedsMaxFiles(root3, queue)) return false;
        root3.dispatch("ADD_ITEMS", {
          items: queue,
          index: getDragIndex(root3.ref.list, children, position),
          interactionMethod: InteractionMethod.DROP
        });
      });
      root3.dispatch("DID_DROP", { position });
      root3.dispatch("DID_END_DRAG", { position });
    };
    hopper.ondragstart = (position) => {
      root3.dispatch("DID_START_DRAG", { position });
    };
    hopper.ondrag = debounce((position) => {
      root3.dispatch("DID_DRAG", { position });
    });
    hopper.ondragend = (position) => {
      root3.dispatch("DID_END_DRAG", { position });
    };
    root3.ref.hopper = hopper;
    root3.ref.drip = root3.appendChildView(root3.createChildView(drip));
  } else if (!enabled && root3.ref.hopper) {
    root3.ref.hopper.destroy();
    root3.ref.hopper = null;
    root3.removeChildView(root3.ref.drip);
  }
};
var toggleBrowse = (root3, props) => {
  const isAllowed = root3.query("GET_ALLOW_BROWSE");
  const isDisabled = root3.query("GET_DISABLED");
  const enabled = isAllowed && !isDisabled;
  if (enabled && !root3.ref.browser) {
    root3.ref.browser = root3.appendChildView(
      root3.createChildView(browser, {
        ...props,
        onload: (items) => {
          applyFilterChain("ADD_ITEMS", items, {
            dispatch: root3.dispatch
          }).then((queue) => {
            if (exceedsMaxFiles(root3, queue)) return false;
            root3.dispatch("ADD_ITEMS", {
              items: queue,
              index: -1,
              interactionMethod: InteractionMethod.BROWSE
            });
          });
        }
      }),
      0
    );
  } else if (!enabled && root3.ref.browser) {
    root3.removeChildView(root3.ref.browser);
    root3.ref.browser = null;
  }
};
var togglePaste = (root3) => {
  const isAllowed = root3.query("GET_ALLOW_PASTE");
  const isDisabled = root3.query("GET_DISABLED");
  const enabled = isAllowed && !isDisabled;
  if (enabled && !root3.ref.paster) {
    root3.ref.paster = createPaster();
    root3.ref.paster.onload = (items) => {
      applyFilterChain("ADD_ITEMS", items, { dispatch: root3.dispatch }).then((queue) => {
        if (exceedsMaxFiles(root3, queue)) return false;
        root3.dispatch("ADD_ITEMS", {
          items: queue,
          index: -1,
          interactionMethod: InteractionMethod.PASTE
        });
      });
    };
  } else if (!enabled && root3.ref.paster) {
    root3.ref.paster.destroy();
    root3.ref.paster = null;
  }
};
var route$5 = createRoute({
  DID_SET_ALLOW_BROWSE: ({ root: root3, props }) => {
    toggleBrowse(root3, props);
  },
  DID_SET_ALLOW_DROP: ({ root: root3 }) => {
    toggleDrop(root3);
  },
  DID_SET_ALLOW_PASTE: ({ root: root3 }) => {
    togglePaste(root3);
  },
  DID_SET_DISABLED: ({ root: root3, props }) => {
    toggleDrop(root3);
    togglePaste(root3);
    toggleBrowse(root3, props);
    const isDisabled = root3.query("GET_DISABLED");
    if (isDisabled) {
      root3.element.dataset.disabled = "disabled";
    } else {
      root3.element.removeAttribute("data-disabled");
    }
  }
});
var root = createView({
  name: "root",
  read: ({ root: root3 }) => {
    if (root3.ref.measure) {
      root3.ref.measureHeight = root3.ref.measure.offsetHeight;
    }
  },
  create: create$e,
  write: write$9,
  destroy: ({ root: root3 }) => {
    if (root3.ref.paster) {
      root3.ref.paster.destroy();
    }
    if (root3.ref.hopper) {
      root3.ref.hopper.destroy();
    }
    root3.element.removeEventListener("touchmove", prevent);
    root3.element.removeEventListener("gesturestart", prevent);
  },
  mixins: {
    styles: ["height"]
  }
});
var createApp = (initialOptions = {}) => {
  let originalElement = null;
  const defaultOptions3 = getOptions();
  const store = createStore(
    // initial state (should be serializable)
    createInitialState(defaultOptions3),
    // queries
    [queries, createOptionQueries(defaultOptions3)],
    // action handlers
    [actions, createOptionActions(defaultOptions3)]
  );
  store.dispatch("SET_OPTIONS", { options: initialOptions });
  const visibilityHandler = () => {
    if (document.hidden) return;
    store.dispatch("KICK");
  };
  document.addEventListener("visibilitychange", visibilityHandler);
  let resizeDoneTimer = null;
  let isResizing = false;
  let isResizingHorizontally = false;
  let initialWindowWidth = null;
  let currentWindowWidth = null;
  const resizeHandler = () => {
    if (!isResizing) {
      isResizing = true;
    }
    clearTimeout(resizeDoneTimer);
    resizeDoneTimer = setTimeout(() => {
      isResizing = false;
      initialWindowWidth = null;
      currentWindowWidth = null;
      if (isResizingHorizontally) {
        isResizingHorizontally = false;
        store.dispatch("DID_STOP_RESIZE");
      }
    }, 500);
  };
  window.addEventListener("resize", resizeHandler);
  const view = root(store, { id: getUniqueId() });
  let isResting = false;
  let isHidden = false;
  const readWriteApi = {
    // necessary for update loop
    /**
     * Reads from dom (never call manually)
     * @private
     */
    _read: () => {
      if (isResizing) {
        currentWindowWidth = window.innerWidth;
        if (!initialWindowWidth) {
          initialWindowWidth = currentWindowWidth;
        }
        if (!isResizingHorizontally && currentWindowWidth !== initialWindowWidth) {
          store.dispatch("DID_START_RESIZE");
          isResizingHorizontally = true;
        }
      }
      if (isHidden && isResting) {
        isResting = view.element.offsetParent === null;
      }
      if (isResting) return;
      view._read();
      isHidden = view.rect.element.hidden;
    },
    /**
     * Writes to dom (never call manually)
     * @private
     */
    _write: (ts) => {
      const actions3 = store.processActionQueue().filter((action) => !/^SET_/.test(action.type));
      if (isResting && !actions3.length) return;
      routeActionsToEvents(actions3);
      isResting = view._write(ts, actions3, isResizingHorizontally);
      removeReleasedItems(store.query("GET_ITEMS"));
      if (isResting) {
        store.processDispatchQueue();
      }
    }
  };
  const createEvent = (name3) => (data3) => {
    const event = {
      type: name3
    };
    if (!data3) {
      return event;
    }
    if (data3.hasOwnProperty("error")) {
      event.error = data3.error ? { ...data3.error } : null;
    }
    if (data3.status) {
      event.status = { ...data3.status };
    }
    if (data3.file) {
      event.output = data3.file;
    }
    if (data3.source) {
      event.file = data3.source;
    } else if (data3.item || data3.id) {
      const item2 = data3.item ? data3.item : store.query("GET_ITEM", data3.id);
      event.file = item2 ? createItemAPI(item2) : null;
    }
    if (data3.items) {
      event.items = data3.items.map(createItemAPI);
    }
    if (/progress/.test(name3)) {
      event.progress = data3.progress;
    }
    if (data3.hasOwnProperty("origin") && data3.hasOwnProperty("target")) {
      event.origin = data3.origin;
      event.target = data3.target;
    }
    return event;
  };
  const eventRoutes = {
    DID_DESTROY: createEvent("destroy"),
    DID_INIT: createEvent("init"),
    DID_THROW_MAX_FILES: createEvent("warning"),
    DID_INIT_ITEM: createEvent("initfile"),
    DID_START_ITEM_LOAD: createEvent("addfilestart"),
    DID_UPDATE_ITEM_LOAD_PROGRESS: createEvent("addfileprogress"),
    DID_LOAD_ITEM: createEvent("addfile"),
    DID_THROW_ITEM_INVALID: [createEvent("error"), createEvent("addfile")],
    DID_THROW_ITEM_LOAD_ERROR: [createEvent("error"), createEvent("addfile")],
    DID_THROW_ITEM_REMOVE_ERROR: [createEvent("error"), createEvent("removefile")],
    DID_PREPARE_OUTPUT: createEvent("preparefile"),
    DID_START_ITEM_PROCESSING: createEvent("processfilestart"),
    DID_UPDATE_ITEM_PROCESS_PROGRESS: createEvent("processfileprogress"),
    DID_ABORT_ITEM_PROCESSING: createEvent("processfileabort"),
    DID_COMPLETE_ITEM_PROCESSING: createEvent("processfile"),
    DID_COMPLETE_ITEM_PROCESSING_ALL: createEvent("processfiles"),
    DID_REVERT_ITEM_PROCESSING: createEvent("processfilerevert"),
    DID_THROW_ITEM_PROCESSING_ERROR: [createEvent("error"), createEvent("processfile")],
    DID_REMOVE_ITEM: createEvent("removefile"),
    DID_UPDATE_ITEMS: createEvent("updatefiles"),
    DID_ACTIVATE_ITEM: createEvent("activatefile"),
    DID_REORDER_ITEMS: createEvent("reorderfiles")
  };
  const exposeEvent = (event) => {
    const detail = { pond: exports$1, ...event };
    delete detail.type;
    view.element.dispatchEvent(
      new CustomEvent(`FilePond:${event.type}`, {
        // event info
        detail,
        // event behaviour
        bubbles: true,
        cancelable: true,
        composed: true
        // triggers listeners outside of shadow root
      })
    );
    const params = [];
    if (event.hasOwnProperty("error")) {
      params.push(event.error);
    }
    if (event.hasOwnProperty("file")) {
      params.push(event.file);
    }
    const filtered = ["type", "error", "file"];
    Object.keys(event).filter((key) => !filtered.includes(key)).forEach((key) => params.push(event[key]));
    exports$1.fire(event.type, ...params);
    const handler = store.query(`GET_ON${event.type.toUpperCase()}`);
    if (handler) {
      handler(...params);
    }
  };
  const routeActionsToEvents = (actions3) => {
    if (!actions3.length) return;
    actions3.filter((action) => eventRoutes[action.type]).forEach((action) => {
      const routes = eventRoutes[action.type];
      (Array.isArray(routes) ? routes : [routes]).forEach((route2) => {
        if (action.type === "DID_INIT_ITEM") {
          exposeEvent(route2(action.data));
        } else {
          setTimeout(() => {
            exposeEvent(route2(action.data));
          }, 0);
        }
      });
    });
  };
  const setOptions3 = (options) => store.dispatch("SET_OPTIONS", { options });
  const getFile = (query) => store.query("GET_ACTIVE_ITEM", query);
  const prepareFile = (query) => new Promise((resolve, reject) => {
    store.dispatch("REQUEST_ITEM_PREPARE", {
      query,
      success: (item2) => {
        resolve(item2);
      },
      failure: (error2) => {
        reject(error2);
      }
    });
  });
  const addFile = (source, options = {}) => new Promise((resolve, reject) => {
    addFiles([{ source, options }], { index: options.index }).then((items) => resolve(items && items[0])).catch(reject);
  });
  const isFilePondFile = (obj) => obj.file && obj.id;
  const removeFile = (query, options) => {
    if (typeof query === "object" && !isFilePondFile(query) && !options) {
      options = query;
      query = void 0;
    }
    store.dispatch("REMOVE_ITEM", { ...options, query });
    return store.query("GET_ACTIVE_ITEM", query) === null;
  };
  const addFiles = (...args) => new Promise((resolve, reject) => {
    const sources = [];
    const options = {};
    if (isArray(args[0])) {
      sources.push.apply(sources, args[0]);
      Object.assign(options, args[1] || {});
    } else {
      const lastArgument = args[args.length - 1];
      if (typeof lastArgument === "object" && !(lastArgument instanceof Blob)) {
        Object.assign(options, args.pop());
      }
      sources.push(...args);
    }
    store.dispatch("ADD_ITEMS", {
      items: sources,
      index: options.index,
      interactionMethod: InteractionMethod.API,
      success: resolve,
      failure: reject
    });
  });
  const getFiles2 = () => store.query("GET_ACTIVE_ITEMS");
  const processFile = (query) => new Promise((resolve, reject) => {
    store.dispatch("REQUEST_ITEM_PROCESSING", {
      query,
      success: (item2) => {
        resolve(item2);
      },
      failure: (error2) => {
        reject(error2);
      }
    });
  });
  const prepareFiles = (...args) => {
    const queries3 = Array.isArray(args[0]) ? args[0] : args;
    const items = queries3.length ? queries3 : getFiles2();
    return Promise.all(items.map(prepareFile));
  };
  const processFiles = (...args) => {
    const queries3 = Array.isArray(args[0]) ? args[0] : args;
    if (!queries3.length) {
      const files = getFiles2().filter(
        (item2) => !(item2.status === ItemStatus.IDLE && item2.origin === FileOrigin.LOCAL) && item2.status !== ItemStatus.PROCESSING && item2.status !== ItemStatus.PROCESSING_COMPLETE && item2.status !== ItemStatus.PROCESSING_REVERT_ERROR
      );
      return Promise.all(files.map(processFile));
    }
    return Promise.all(queries3.map(processFile));
  };
  const removeFiles = (...args) => {
    const queries3 = Array.isArray(args[0]) ? args[0] : args;
    let options;
    if (typeof queries3[queries3.length - 1] === "object") {
      options = queries3.pop();
    } else if (Array.isArray(args[0])) {
      options = args[1];
    }
    const files = getFiles2();
    if (!queries3.length) return Promise.all(files.map((file2) => removeFile(file2, options)));
    const mappedQueries = queries3.map((query) => isNumber(query) ? files[query] ? files[query].id : null : query).filter((query) => query);
    return mappedQueries.map((q) => removeFile(q, options));
  };
  const exports$1 = {
    // supports events
    ...on(),
    // inject private api methods
    ...readWriteApi,
    // inject all getters and setters
    ...createOptionAPI(store, defaultOptions3),
    /**
     * Override options defined in options object
     * @param options
     */
    setOptions: setOptions3,
    /**
     * Load the given file
     * @param source - the source of the file (either a File, base64 data uri or url)
     * @param options - object, { index: 0 }
     */
    addFile,
    /**
     * Load the given files
     * @param sources - the sources of the files to load
     * @param options - object, { index: 0 }
     */
    addFiles,
    /**
     * Returns the file objects matching the given query
     * @param query { string, number, null }
     */
    getFile,
    /**
     * Upload file with given name
     * @param query { string, number, null  }
     */
    processFile,
    /**
     * Request prepare output for file with given name
     * @param query { string, number, null  }
     */
    prepareFile,
    /**
     * Removes a file by its name
     * @param query { string, number, null  }
     */
    removeFile,
    /**
     * Moves a file to a new location in the files list
     */
    moveFile: (query, index) => store.dispatch("MOVE_ITEM", { query, index }),
    /**
     * Returns all files (wrapped in public api)
     */
    getFiles: getFiles2,
    /**
     * Starts uploading all files
     */
    processFiles,
    /**
     * Clears all files from the files list
     */
    removeFiles,
    /**
     * Starts preparing output of all files
     */
    prepareFiles,
    /**
     * Sort list of files
     */
    sort: (compare) => store.dispatch("SORT", { compare }),
    /**
     * Browse the file system for a file
     */
    browse: () => {
      var input = view.element.querySelector("input[type=file]");
      if (input) {
        input.click();
      }
    },
    /**
     * Destroys the app
     */
    destroy: () => {
      exports$1.fire("destroy", view.element);
      store.dispatch("ABORT_ALL");
      view._destroy();
      window.removeEventListener("resize", resizeHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);
      store.dispatch("DID_DESTROY");
    },
    /**
     * Inserts the plugin before the target element
     */
    insertBefore: (element) => insertBefore(view.element, element),
    /**
     * Inserts the plugin after the target element
     */
    insertAfter: (element) => insertAfter(view.element, element),
    /**
     * Appends the plugin to the target element
     */
    appendTo: (element) => element.appendChild(view.element),
    /**
     * Replaces an element with the app
     */
    replaceElement: (element) => {
      insertBefore(view.element, element);
      element.parentNode.removeChild(element);
      originalElement = element;
    },
    /**
     * Restores the original element
     */
    restoreElement: () => {
      if (!originalElement) {
        return;
      }
      insertAfter(originalElement, view.element);
      view.element.parentNode.removeChild(view.element);
      originalElement = null;
    },
    /**
     * Returns true if the app root is attached to given element
     * @param element
     */
    isAttachedTo: (element) => view.element === element || originalElement === element,
    /**
     * Returns the root element
     */
    element: {
      get: () => view.element
    },
    /**
     * Returns the current pond status
     */
    status: {
      get: () => store.query("GET_STATUS")
    }
  };
  store.dispatch("DID_INIT");
  return createObject(exports$1);
};
var createAppObject = (customOptions = {}) => {
  const defaultOptions3 = {};
  forin(getOptions(), (key, value) => {
    defaultOptions3[key] = value[0];
  });
  const app = createApp({
    // default options
    ...defaultOptions3,
    // custom options
    ...customOptions
  });
  return app;
};
var lowerCaseFirstLetter = (string) => string.charAt(0).toLowerCase() + string.slice(1);
var attributeNameToPropertyName = (attributeName) => toCamels(attributeName.replace(/^data-/, ""));
var mapObject = (object, propertyMap) => {
  forin(propertyMap, (selector, mapping) => {
    forin(object, (property, value) => {
      const selectorRegExp = new RegExp(selector);
      const matches = selectorRegExp.test(property);
      if (!matches) {
        return;
      }
      delete object[property];
      if (mapping === false) {
        return;
      }
      if (isString(mapping)) {
        object[mapping] = value;
        return;
      }
      const group = mapping.group;
      if (isObject(mapping) && !object[group]) {
        object[group] = {};
      }
      object[group][lowerCaseFirstLetter(property.replace(selectorRegExp, ""))] = value;
    });
    if (mapping.mapping) {
      mapObject(object[mapping.group], mapping.mapping);
    }
  });
};
var getAttributesAsObject = (node, attributeMapping = {}) => {
  const attributes = [];
  forin(node.attributes, (index) => {
    attributes.push(node.attributes[index]);
  });
  const output = attributes.filter((attribute) => attribute.name).reduce((obj, attribute) => {
    const value = attr(node, attribute.name);
    obj[attributeNameToPropertyName(attribute.name)] = value === attribute.name ? true : value;
    return obj;
  }, {});
  mapObject(output, attributeMapping);
  return output;
};
var createAppAtElement = (element, options = {}) => {
  const attributeMapping = {
    // translate to other name
    "^class$": "className",
    "^multiple$": "allowMultiple",
    "^capture$": "captureMethod",
    "^webkitdirectory$": "allowDirectoriesOnly",
    // group under single property
    "^server": {
      group: "server",
      mapping: {
        "^process": {
          group: "process"
        },
        "^revert": {
          group: "revert"
        },
        "^fetch": {
          group: "fetch"
        },
        "^restore": {
          group: "restore"
        },
        "^load": {
          group: "load"
        }
      }
    },
    // don't include in object
    "^type$": false,
    "^files$": false
  };
  applyFilters("SET_ATTRIBUTE_TO_OPTION_MAP", attributeMapping);
  const mergedOptions = {
    ...options
  };
  const attributeOptions = getAttributesAsObject(
    element.nodeName === "FIELDSET" ? element.querySelector("input[type=file]") : element,
    attributeMapping
  );
  Object.keys(attributeOptions).forEach((key) => {
    if (isObject(attributeOptions[key])) {
      if (!isObject(mergedOptions[key])) {
        mergedOptions[key] = {};
      }
      Object.assign(mergedOptions[key], attributeOptions[key]);
    } else {
      mergedOptions[key] = attributeOptions[key];
    }
  });
  mergedOptions.files = (options.files || []).concat(
    Array.from(element.querySelectorAll("input:not([type=file])")).map((input) => ({
      source: input.value,
      options: {
        type: input.dataset.type
      }
    }))
  );
  const app = createAppObject(mergedOptions);
  if (element.files) {
    Array.from(element.files).forEach((file2) => {
      app.addFile(file2);
    });
  }
  app.replaceElement(element);
  return app;
};
var createApp$1 = (...args) => isNode(args[0]) ? createAppAtElement(...args) : createAppObject(...args);
var PRIVATE_METHODS = ["fire", "_read", "_write"];
var createAppAPI = (app) => {
  const api = {};
  copyObjectPropertiesToObject(app, api, PRIVATE_METHODS);
  return api;
};
var replaceInString = (string, replacements) => string.replace(/(?:{([a-zA-Z]+)})/g, (match, group) => replacements[group]);
var createWorker = (fn3) => {
  const workerBlob = new Blob(["(", fn3.toString(), ")()"], {
    type: "application/javascript"
  });
  const workerURL = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerURL);
  return {
    transfer: (message, cb) => {
    },
    post: (message, cb, transferList) => {
      const id = getUniqueId();
      worker.onmessage = (e3) => {
        if (e3.data.id === id) {
          cb(e3.data.message);
        }
      };
      worker.postMessage(
        {
          id,
          message
        },
        transferList
      );
    },
    terminate: () => {
      worker.terminate();
      URL.revokeObjectURL(workerURL);
    }
  };
};
var loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    resolve(img);
  };
  img.onerror = (e3) => {
    reject(e3);
  };
  img.src = url;
});
var renameFile = (file2, name3) => {
  const renamedFile = file2.slice(0, file2.size, file2.type);
  renamedFile.lastModifiedDate = file2.lastModifiedDate;
  renamedFile.name = name3;
  return renamedFile;
};
var copyFile = (file2) => renameFile(file2, file2.name);
var registeredPlugins = [];
var createAppPlugin = (plugin9) => {
  if (registeredPlugins.includes(plugin9)) {
    return;
  }
  registeredPlugins.push(plugin9);
  const pluginOutline = plugin9({
    addFilter,
    utils: {
      Type,
      forin,
      isString,
      isFile,
      toNaturalFileSize,
      replaceInString,
      getExtensionFromFilename,
      getFilenameWithoutExtension,
      guesstimateMimeType,
      getFileFromBlob,
      getFilenameFromURL,
      createRoute,
      createWorker,
      createView,
      createItemAPI,
      loadImage,
      copyFile,
      renameFile,
      createBlob,
      applyFilterChain,
      text,
      getNumericAspectRatioFromString
    },
    views: {
      fileActionButton
    }
  });
  extendDefaultOptions(pluginOutline.options);
};
var isOperaMini = () => Object.prototype.toString.call(window.operamini) === "[object OperaMini]";
var hasPromises = () => "Promise" in window;
var hasBlobSlice = () => "slice" in Blob.prototype;
var hasCreateObjectURL = () => "URL" in window && "createObjectURL" in window.URL;
var hasVisibility = () => "visibilityState" in document;
var hasTiming = () => "performance" in window;
var hasCSSSupports = () => "supports" in (window.CSS || {});
var isIE11 = () => /MSIE|Trident/.test(window.navigator.userAgent);
var supported = (() => {
  const isSupported2 = (
    // Has to be a browser
    isBrowser() && // Can't run on Opera Mini due to lack of everything
    !isOperaMini() && // Require these APIs to feature detect a modern browser
    hasVisibility() && hasPromises() && hasBlobSlice() && hasCreateObjectURL() && hasTiming() && // doesn't need CSSSupports but is a good way to detect Safari 9+ (we do want to support IE11 though)
    (hasCSSSupports() || isIE11())
  );
  return () => isSupported2;
})();
var state = {
  // active app instances, used to redraw the apps and to find the later
  apps: []
};
var name = "filepond";
var fn = () => {
};
var OptionTypes = {};
var create$f = fn;
var destroy = fn;
var parse = fn;
var find = fn;
var registerPlugin = fn;
var getOptions$1 = fn;
var setOptions$1 = fn;
if (supported()) {
  createPainter(
    () => {
      state.apps.forEach((app) => app._read());
    },
    (ts) => {
      state.apps.forEach((app) => app._write(ts));
    }
  );
  const dispatch = () => {
    document.dispatchEvent(
      new CustomEvent("FilePond:loaded", {
        detail: {
          supported,
          create: create$f,
          destroy,
          parse,
          find,
          registerPlugin,
          setOptions: setOptions$1
        }
      })
    );
    document.removeEventListener("DOMContentLoaded", dispatch);
  };
  if (document.readyState !== "loading") {
    setTimeout(() => dispatch(), 0);
  } else {
    document.addEventListener("DOMContentLoaded", dispatch);
  }
  const updateOptionTypes = () => forin(getOptions(), (key, value) => {
    OptionTypes[key] = value[1];
  });
  OptionTypes = {};
  updateOptionTypes();
  create$f = (...args) => {
    const app = createApp$1(...args);
    app.on("destroy", destroy);
    state.apps.push(app);
    return createAppAPI(app);
  };
  destroy = (hook) => {
    const indexToRemove = state.apps.findIndex((app) => app.isAttachedTo(hook));
    if (indexToRemove >= 0) {
      const app = state.apps.splice(indexToRemove, 1)[0];
      app.restoreElement();
      return true;
    }
    return false;
  };
  parse = (context) => {
    const matchedHooks = Array.from(context.querySelectorAll(`.${name}`));
    const newHooks = matchedHooks.filter(
      (newHook) => !state.apps.find((app) => app.isAttachedTo(newHook))
    );
    return newHooks.map((hook) => create$f(hook));
  };
  find = (hook) => {
    const app = state.apps.find((app2) => app2.isAttachedTo(hook));
    if (!app) {
      return null;
    }
    return createAppAPI(app);
  };
  registerPlugin = (...plugins) => {
    plugins.forEach(createAppPlugin);
    updateOptionTypes();
  };
  getOptions$1 = () => {
    const opts = {};
    forin(getOptions(), (key, value) => {
      opts[key] = value[0];
    });
    return opts;
  };
  setOptions$1 = (opts) => {
    if (isObject(opts)) {
      state.apps.forEach((app) => {
        app.setOptions(opts);
      });
      setOptions(opts);
    }
    return getOptions$1();
  };
}

// node_modules/react-filepond/dist/react-filepond.esm.js
var isSupported = supported();
var filteredMethods = [
  "setOptions",
  "on",
  "off",
  "onOnce",
  "appendTo",
  "insertAfter",
  "insertBefore",
  "isAttachedTo",
  "replaceElement",
  "restoreElement",
  "destroy"
];
var FilePond = class extends React.Component {
  constructor(props) {
    super(props);
    this.allowFilesSync = true;
  }
  // Will setup FilePond instance when mounted
  componentDidMount() {
    this._input = this._element.querySelector('input[type="file"]');
    this._inputClone = this._input.cloneNode();
    if (!isSupported) return;
    const options = Object.assign({}, this.props);
    if (options.onupdatefiles) {
      const cb = options.onupdatefiles;
      options.onupdatefiles = (items) => {
        this.allowFilesSync = false;
        cb(items);
      };
    }
    this._pond = create$f(this._input, options);
    Object.keys(this._pond).filter((key) => !filteredMethods.includes(key)).forEach((key) => {
      this[key] = this._pond[key];
    });
  }
  // Will clean up FilePond instance when unmounted
  componentWillUnmount() {
    if (!this._pond) return;
    const bin = document.createElement("div");
    bin.append(this._pond.element);
    bin.id = "foo";
    this._pond.destroy();
    this._pond = void 0;
    this._element.append(this._inputClone);
  }
  shouldComponentUpdate() {
    if (!this.allowFilesSync) {
      this.allowFilesSync = true;
      return false;
    }
    return true;
  }
  // Something changed
  componentDidUpdate() {
    if (!this._pond) return;
    const options = Object.assign({}, this.props);
    delete options.onupdatefiles;
    this._pond.setOptions(options);
  }
  // Renders basic element hook for FilePond to attach to
  render() {
    const {
      id,
      name: name3,
      className,
      allowMultiple,
      required,
      captureMethod,
      acceptedFileTypes
    } = this.props;
    return createElement$2(
      "div",
      {
        className: "filepond--wrapper",
        ref: (element) => this._element = element
      },
      createElement$2("input", {
        type: "file",
        name: name3,
        id,
        accept: acceptedFileTypes,
        multiple: allowMultiple,
        required,
        className,
        capture: captureMethod
      })
    );
  }
};

// node_modules/filepond-plugin-file-validate-size/dist/filepond-plugin-file-validate-size.esm.js
var plugin = ({ addFilter: addFilter2, utils }) => {
  const { Type: Type3, replaceInString: replaceInString2, toNaturalFileSize: toNaturalFileSize2 } = utils;
  addFilter2("ALLOW_HOPPER_ITEM", (file2, { query }) => {
    if (!query("GET_ALLOW_FILE_SIZE_VALIDATION")) {
      return true;
    }
    const sizeMax = query("GET_MAX_FILE_SIZE");
    if (sizeMax !== null && file2.size > sizeMax) {
      return false;
    }
    const sizeMin = query("GET_MIN_FILE_SIZE");
    if (sizeMin !== null && file2.size < sizeMin) {
      return false;
    }
    return true;
  });
  addFilter2(
    "LOAD_FILE",
    (file2, { query }) => new Promise((resolve, reject) => {
      if (!query("GET_ALLOW_FILE_SIZE_VALIDATION")) {
        return resolve(file2);
      }
      const fileFilter = query("GET_FILE_VALIDATE_SIZE_FILTER");
      if (fileFilter && !fileFilter(file2)) {
        return resolve(file2);
      }
      const sizeMax = query("GET_MAX_FILE_SIZE");
      if (sizeMax !== null && file2.size > sizeMax) {
        reject({
          status: {
            main: query("GET_LABEL_MAX_FILE_SIZE_EXCEEDED"),
            sub: replaceInString2(query("GET_LABEL_MAX_FILE_SIZE"), {
              filesize: toNaturalFileSize2(
                sizeMax,
                ".",
                query("GET_FILE_SIZE_BASE"),
                query("GET_FILE_SIZE_LABELS", query)
              )
            })
          }
        });
        return;
      }
      const sizeMin = query("GET_MIN_FILE_SIZE");
      if (sizeMin !== null && file2.size < sizeMin) {
        reject({
          status: {
            main: query("GET_LABEL_MIN_FILE_SIZE_EXCEEDED"),
            sub: replaceInString2(query("GET_LABEL_MIN_FILE_SIZE"), {
              filesize: toNaturalFileSize2(
                sizeMin,
                ".",
                query("GET_FILE_SIZE_BASE"),
                query("GET_FILE_SIZE_LABELS", query)
              )
            })
          }
        });
        return;
      }
      const totalSizeMax = query("GET_MAX_TOTAL_FILE_SIZE");
      if (totalSizeMax !== null) {
        const currentTotalSize = query("GET_ACTIVE_ITEMS").reduce((total, item2) => {
          return total + item2.fileSize;
        }, 0);
        if (currentTotalSize > totalSizeMax) {
          reject({
            status: {
              main: query("GET_LABEL_MAX_TOTAL_FILE_SIZE_EXCEEDED"),
              sub: replaceInString2(query("GET_LABEL_MAX_TOTAL_FILE_SIZE"), {
                filesize: toNaturalFileSize2(
                  totalSizeMax,
                  ".",
                  query("GET_FILE_SIZE_BASE"),
                  query("GET_FILE_SIZE_LABELS", query)
                )
              })
            }
          });
          return;
        }
      }
      resolve(file2);
    })
  );
  return {
    options: {
      // Enable or disable file type validation
      allowFileSizeValidation: [true, Type3.BOOLEAN],
      // Max individual file size in bytes
      maxFileSize: [null, Type3.INT],
      // Min individual file size in bytes
      minFileSize: [null, Type3.INT],
      // Max total file size in bytes
      maxTotalFileSize: [null, Type3.INT],
      // Filter the files that need to be validated for size
      fileValidateSizeFilter: [null, Type3.FUNCTION],
      // error labels
      labelMinFileSizeExceeded: ["File is too small", Type3.STRING],
      labelMinFileSize: ["Minimum file size is {filesize}", Type3.STRING],
      labelMaxFileSizeExceeded: ["File is too large", Type3.STRING],
      labelMaxFileSize: ["Maximum file size is {filesize}", Type3.STRING],
      labelMaxTotalFileSizeExceeded: ["Maximum total size exceeded", Type3.STRING],
      labelMaxTotalFileSize: ["Maximum total file size is {filesize}", Type3.STRING]
    }
  };
};
var isBrowser2 = typeof window !== "undefined" && typeof window.document !== "undefined";
if (isBrowser2) {
  document.dispatchEvent(new CustomEvent("FilePond:pluginloaded", { detail: plugin }));
}
var filepond_plugin_file_validate_size_esm_default = plugin;

// node_modules/filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js
var plugin2 = ({ addFilter: addFilter2, utils }) => {
  const {
    Type: Type3,
    isString: isString3,
    replaceInString: replaceInString2,
    guesstimateMimeType: guesstimateMimeType2,
    getExtensionFromFilename: getExtensionFromFilename3,
    getFilenameFromURL: getFilenameFromURL3
  } = utils;
  const mimeTypeMatchesWildCard = (mimeType, wildcard) => {
    const mimeTypeGroup = (/^[^/]+/.exec(mimeType) || []).pop();
    const wildcardGroup = wildcard.slice(0, -2);
    return mimeTypeGroup === wildcardGroup;
  };
  const isValidMimeType = (acceptedTypes, userInputType) => acceptedTypes.some((acceptedType) => {
    if (/\*$/.test(acceptedType)) {
      return mimeTypeMatchesWildCard(userInputType, acceptedType);
    }
    return acceptedType === userInputType;
  });
  const getItemType = (item2) => {
    let type = "";
    if (isString3(item2)) {
      const filename = getFilenameFromURL3(item2);
      const extension = getExtensionFromFilename3(filename);
      if (extension) {
        type = guesstimateMimeType2(extension);
      }
    } else {
      type = item2.type;
    }
    return type;
  };
  const validateFile = (item2, acceptedFileTypes, typeDetector) => {
    if (acceptedFileTypes.length === 0) {
      return true;
    }
    const type = getItemType(item2);
    if (!typeDetector) {
      return isValidMimeType(acceptedFileTypes, type);
    }
    return new Promise((resolve, reject) => {
      typeDetector(item2, type).then((detectedType) => {
        if (isValidMimeType(acceptedFileTypes, detectedType)) {
          resolve();
        } else {
          reject();
        }
      }).catch(reject);
    });
  };
  const applyMimeTypeMap = (map2) => (acceptedFileType) => map2[acceptedFileType] === null ? false : map2[acceptedFileType] || acceptedFileType;
  addFilter2(
    "SET_ATTRIBUTE_TO_OPTION_MAP",
    (map2) => Object.assign(map2, {
      accept: "acceptedFileTypes"
    })
  );
  addFilter2("ALLOW_HOPPER_ITEM", (file2, { query }) => {
    if (!query("GET_ALLOW_FILE_TYPE_VALIDATION")) {
      return true;
    }
    return validateFile(file2, query("GET_ACCEPTED_FILE_TYPES"));
  });
  addFilter2(
    "LOAD_FILE",
    (file2, { query }) => new Promise((resolve, reject) => {
      if (!query("GET_ALLOW_FILE_TYPE_VALIDATION")) {
        resolve(file2);
        return;
      }
      const acceptedFileTypes = query("GET_ACCEPTED_FILE_TYPES");
      const typeDetector = query("GET_FILE_VALIDATE_TYPE_DETECT_TYPE");
      const validationResult = validateFile(file2, acceptedFileTypes, typeDetector);
      const handleRejection = () => {
        const acceptedFileTypesMapped = acceptedFileTypes.map(
          applyMimeTypeMap(
            query("GET_FILE_VALIDATE_TYPE_LABEL_EXPECTED_TYPES_MAP")
          )
        ).filter((label) => label !== false);
        const acceptedFileTypesMappedUnique = acceptedFileTypesMapped.filter(
          (item2, index) => acceptedFileTypesMapped.indexOf(item2) === index
        );
        reject({
          status: {
            main: query("GET_LABEL_FILE_TYPE_NOT_ALLOWED"),
            sub: replaceInString2(
              query("GET_FILE_VALIDATE_TYPE_LABEL_EXPECTED_TYPES"),
              {
                allTypes: acceptedFileTypesMappedUnique.join(", "),
                allButLastType: acceptedFileTypesMappedUnique.slice(0, -1).join(", "),
                lastType: acceptedFileTypesMappedUnique[acceptedFileTypesMappedUnique.length - 1]
              }
            )
          }
        });
      };
      if (typeof validationResult === "boolean") {
        if (!validationResult) {
          return handleRejection();
        }
        return resolve(file2);
      }
      validationResult.then(() => {
        resolve(file2);
      }).catch(handleRejection);
    })
  );
  return {
    // default options
    options: {
      // Enable or disable file type validation
      allowFileTypeValidation: [true, Type3.BOOLEAN],
      // What file types to accept
      acceptedFileTypes: [[], Type3.ARRAY],
      // - must be comma separated
      // - mime types: image/png, image/jpeg, image/gif
      // - extensions: .png, .jpg, .jpeg ( not enabled yet )
      // - wildcards: image/*
      // label to show when a type is not allowed
      labelFileTypeNotAllowed: ["File is of invalid type", Type3.STRING],
      // nicer label
      fileValidateTypeLabelExpectedTypes: [
        "Expects {allButLastType} or {lastType}",
        Type3.STRING
      ],
      // map mime types to extensions
      fileValidateTypeLabelExpectedTypesMap: [{}, Type3.OBJECT],
      // Custom function to detect type of file
      fileValidateTypeDetectType: [null, Type3.FUNCTION]
    }
  };
};
var isBrowser3 = typeof window !== "undefined" && typeof window.document !== "undefined";
if (isBrowser3) {
  document.dispatchEvent(new CustomEvent("FilePond:pluginloaded", { detail: plugin2 }));
}
var filepond_plugin_file_validate_type_esm_default = plugin2;

// node_modules/filepond-plugin-image-exif-orientation/dist/filepond-plugin-image-exif-orientation.esm.js
var isJPEG = (file2) => /^image\/jpeg/.test(file2.type);
var Marker = {
  JPEG: 65496,
  APP1: 65505,
  EXIF: 1165519206,
  TIFF: 18761,
  Orientation: 274,
  Unknown: 65280
};
var getUint16 = (view, offset, little = false) => view.getUint16(offset, little);
var getUint32 = (view, offset, little = false) => view.getUint32(offset, little);
var getImageOrientation = (file2) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = function(e3) {
    const view = new DataView(e3.target.result);
    if (getUint16(view, 0) !== Marker.JPEG) {
      resolve(-1);
      return;
    }
    const length = view.byteLength;
    let offset = 2;
    while (offset < length) {
      const marker = getUint16(view, offset);
      offset += 2;
      if (marker === Marker.APP1) {
        if (getUint32(view, offset += 2) !== Marker.EXIF) {
          break;
        }
        const little = getUint16(view, offset += 6) === Marker.TIFF;
        offset += getUint32(view, offset + 4, little);
        const tags = getUint16(view, offset, little);
        offset += 2;
        for (let i2 = 0; i2 < tags; i2++) {
          if (getUint16(view, offset + i2 * 12, little) === Marker.Orientation) {
            resolve(getUint16(view, offset + i2 * 12 + 8, little));
            return;
          }
        }
      } else if ((marker & Marker.Unknown) !== Marker.Unknown) {
        break;
      } else {
        offset += getUint16(view, offset);
      }
    }
    resolve(-1);
  };
  reader.readAsArrayBuffer(file2.slice(0, 64 * 1024));
});
var IS_BROWSER2 = (() => typeof window !== "undefined" && typeof window.document !== "undefined")();
var isBrowser4 = () => IS_BROWSER2;
var testSrc = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QA6RXhpZgAATU0AKgAAAAgAAwESAAMAAAABAAYAAAEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAIBASIA/8QAJgABAAAAAAAAAAAAAAAAAAAAAxABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwBH/9k=";
var shouldCorrect = void 0;
var testImage = isBrowser4() ? new Image() : {};
testImage.onload = () => shouldCorrect = testImage.naturalWidth > testImage.naturalHeight;
testImage.src = testSrc;
var shouldCorrectImageExifOrientation = () => shouldCorrect;
var plugin3 = ({ addFilter: addFilter2, utils }) => {
  const { Type: Type3, isFile: isFile2 } = utils;
  addFilter2(
    "DID_LOAD_ITEM",
    (item2, { query }) => new Promise((resolve, reject) => {
      const file2 = item2.file;
      if (!isFile2(file2) || !isJPEG(file2) || !query("GET_ALLOW_IMAGE_EXIF_ORIENTATION") || !shouldCorrectImageExifOrientation()) {
        return resolve(item2);
      }
      getImageOrientation(file2).then((orientation) => {
        item2.setMetadata("exif", { orientation });
        resolve(item2);
      });
    })
  );
  return {
    options: {
      // Enable or disable image orientation reading
      allowImageExifOrientation: [true, Type3.BOOLEAN]
    }
  };
};
var isBrowser$1 = typeof window !== "undefined" && typeof window.document !== "undefined";
if (isBrowser$1) {
  document.dispatchEvent(
    new CustomEvent("FilePond:pluginloaded", { detail: plugin3 })
  );
}
var filepond_plugin_image_exif_orientation_esm_default = plugin3;

// node_modules/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js
var isPreviewableImage = (file2) => /^image/.test(file2.type);
var vectorMultiply = (v, amount) => createVector(v.x * amount, v.y * amount);
var vectorAdd = (a2, b) => createVector(a2.x + b.x, a2.y + b.y);
var vectorNormalize = (v) => {
  const l2 = Math.sqrt(v.x * v.x + v.y * v.y);
  if (l2 === 0) {
    return {
      x: 0,
      y: 0
    };
  }
  return createVector(v.x / l2, v.y / l2);
};
var vectorRotate = (v, radians, origin) => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const t2 = createVector(v.x - origin.x, v.y - origin.y);
  return createVector(
    origin.x + cos * t2.x - sin * t2.y,
    origin.y + sin * t2.x + cos * t2.y
  );
};
var createVector = (x = 0, y = 0) => ({ x, y });
var getMarkupValue = (value, size, scalar = 1, axis) => {
  if (typeof value === "string") {
    return parseFloat(value) * scalar;
  }
  if (typeof value === "number") {
    return value * (axis ? size[axis] : Math.min(size.width, size.height));
  }
  return;
};
var getMarkupStyles = (markup, size, scale2) => {
  const lineStyle = markup.borderStyle || markup.lineStyle || "solid";
  const fill = markup.backgroundColor || markup.fontColor || "transparent";
  const stroke = markup.borderColor || markup.lineColor || "transparent";
  const strokeWidth = getMarkupValue(
    markup.borderWidth || markup.lineWidth,
    size,
    scale2
  );
  const lineCap = markup.lineCap || "round";
  const lineJoin = markup.lineJoin || "round";
  const dashes = typeof lineStyle === "string" ? "" : lineStyle.map((v) => getMarkupValue(v, size, scale2)).join(",");
  const opacity = markup.opacity || 1;
  return {
    "stroke-linecap": lineCap,
    "stroke-linejoin": lineJoin,
    "stroke-width": strokeWidth || 0,
    "stroke-dasharray": dashes,
    stroke,
    fill,
    opacity
  };
};
var isDefined2 = (value) => value != null;
var getMarkupRect = (rect, size, scalar = 1) => {
  let left = getMarkupValue(rect.x, size, scalar, "width") || getMarkupValue(rect.left, size, scalar, "width");
  let top = getMarkupValue(rect.y, size, scalar, "height") || getMarkupValue(rect.top, size, scalar, "height");
  let width = getMarkupValue(rect.width, size, scalar, "width");
  let height = getMarkupValue(rect.height, size, scalar, "height");
  let right = getMarkupValue(rect.right, size, scalar, "width");
  let bottom = getMarkupValue(rect.bottom, size, scalar, "height");
  if (!isDefined2(top)) {
    if (isDefined2(height) && isDefined2(bottom)) {
      top = size.height - height - bottom;
    } else {
      top = bottom;
    }
  }
  if (!isDefined2(left)) {
    if (isDefined2(width) && isDefined2(right)) {
      left = size.width - width - right;
    } else {
      left = right;
    }
  }
  if (!isDefined2(width)) {
    if (isDefined2(left) && isDefined2(right)) {
      width = size.width - left - right;
    } else {
      width = 0;
    }
  }
  if (!isDefined2(height)) {
    if (isDefined2(top) && isDefined2(bottom)) {
      height = size.height - top - bottom;
    } else {
      height = 0;
    }
  }
  return {
    x: left || 0,
    y: top || 0,
    width: width || 0,
    height: height || 0
  };
};
var pointsToPathShape = (points) => points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
var setAttributes = (element, attr3) => Object.keys(attr3).forEach((key) => element.setAttribute(key, attr3[key]));
var ns2 = "http://www.w3.org/2000/svg";
var svg = (tag, attr3) => {
  const element = document.createElementNS(ns2, tag);
  if (attr3) {
    setAttributes(element, attr3);
  }
  return element;
};
var updateRect2 = (element) => setAttributes(element, {
  ...element.rect,
  ...element.styles
});
var updateEllipse = (element) => {
  const cx = element.rect.x + element.rect.width * 0.5;
  const cy = element.rect.y + element.rect.height * 0.5;
  const rx = element.rect.width * 0.5;
  const ry = element.rect.height * 0.5;
  return setAttributes(element, {
    cx,
    cy,
    rx,
    ry,
    ...element.styles
  });
};
var IMAGE_FIT_STYLE = {
  contain: "xMidYMid meet",
  cover: "xMidYMid slice"
};
var updateImage = (element, markup) => {
  setAttributes(element, {
    ...element.rect,
    ...element.styles,
    preserveAspectRatio: IMAGE_FIT_STYLE[markup.fit] || "none"
  });
};
var TEXT_ANCHOR = {
  left: "start",
  center: "middle",
  right: "end"
};
var updateText = (element, markup, size, scale2) => {
  const fontSize = getMarkupValue(markup.fontSize, size, scale2);
  const fontFamily = markup.fontFamily || "sans-serif";
  const fontWeight = markup.fontWeight || "normal";
  const textAlign = TEXT_ANCHOR[markup.textAlign] || "start";
  setAttributes(element, {
    ...element.rect,
    ...element.styles,
    "stroke-width": 0,
    "font-weight": fontWeight,
    "font-size": fontSize,
    "font-family": fontFamily,
    "text-anchor": textAlign
  });
  if (element.text !== markup.text) {
    element.text = markup.text;
    element.textContent = markup.text.length ? markup.text : " ";
  }
};
var updateLine = (element, markup, size, scale2) => {
  setAttributes(element, {
    ...element.rect,
    ...element.styles,
    fill: "none"
  });
  const line2 = element.childNodes[0];
  const begin = element.childNodes[1];
  const end = element.childNodes[2];
  const origin = element.rect;
  const target = {
    x: element.rect.x + element.rect.width,
    y: element.rect.y + element.rect.height
  };
  setAttributes(line2, {
    x1: origin.x,
    y1: origin.y,
    x2: target.x,
    y2: target.y
  });
  if (!markup.lineDecoration) return;
  begin.style.display = "none";
  end.style.display = "none";
  const v = vectorNormalize({
    x: target.x - origin.x,
    y: target.y - origin.y
  });
  const l2 = getMarkupValue(0.05, size, scale2);
  if (markup.lineDecoration.indexOf("arrow-begin") !== -1) {
    const arrowBeginRotationPoint = vectorMultiply(v, l2);
    const arrowBeginCenter = vectorAdd(origin, arrowBeginRotationPoint);
    const arrowBeginA = vectorRotate(origin, 2, arrowBeginCenter);
    const arrowBeginB = vectorRotate(origin, -2, arrowBeginCenter);
    setAttributes(begin, {
      style: "display:block;",
      d: `M${arrowBeginA.x},${arrowBeginA.y} L${origin.x},${origin.y} L${arrowBeginB.x},${arrowBeginB.y}`
    });
  }
  if (markup.lineDecoration.indexOf("arrow-end") !== -1) {
    const arrowEndRotationPoint = vectorMultiply(v, -l2);
    const arrowEndCenter = vectorAdd(target, arrowEndRotationPoint);
    const arrowEndA = vectorRotate(target, 2, arrowEndCenter);
    const arrowEndB = vectorRotate(target, -2, arrowEndCenter);
    setAttributes(end, {
      style: "display:block;",
      d: `M${arrowEndA.x},${arrowEndA.y} L${target.x},${target.y} L${arrowEndB.x},${arrowEndB.y}`
    });
  }
};
var updatePath = (element, markup, size, scale2) => {
  setAttributes(element, {
    ...element.styles,
    fill: "none",
    d: pointsToPathShape(
      markup.points.map((point) => ({
        x: getMarkupValue(point.x, size, scale2, "width"),
        y: getMarkupValue(point.y, size, scale2, "height")
      }))
    )
  });
};
var createShape = (node) => (markup) => svg(node, { id: markup.id });
var createImage = (markup) => {
  const shape = svg("image", {
    id: markup.id,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    opacity: "0"
  });
  shape.onload = () => {
    shape.setAttribute("opacity", markup.opacity || 1);
  };
  shape.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    markup.src
  );
  return shape;
};
var createLine = (markup) => {
  const shape = svg("g", {
    id: markup.id,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  const line2 = svg("line");
  shape.appendChild(line2);
  const begin = svg("path");
  shape.appendChild(begin);
  const end = svg("path");
  shape.appendChild(end);
  return shape;
};
var CREATE_TYPE_ROUTES = {
  image: createImage,
  rect: createShape("rect"),
  ellipse: createShape("ellipse"),
  text: createShape("text"),
  path: createShape("path"),
  line: createLine
};
var UPDATE_TYPE_ROUTES = {
  rect: updateRect2,
  ellipse: updateEllipse,
  image: updateImage,
  text: updateText,
  path: updatePath,
  line: updateLine
};
var createMarkupByType = (type, markup) => CREATE_TYPE_ROUTES[type](markup);
var updateMarkupByType = (element, type, markup, size, scale2) => {
  if (type !== "path") {
    element.rect = getMarkupRect(markup, size, scale2);
  }
  element.styles = getMarkupStyles(markup, size, scale2);
  UPDATE_TYPE_ROUTES[type](element, markup, size, scale2);
};
var MARKUP_RECT = [
  "x",
  "y",
  "left",
  "top",
  "right",
  "bottom",
  "width",
  "height"
];
var toOptionalFraction = (value) => typeof value === "string" && /%/.test(value) ? parseFloat(value) / 100 : value;
var prepareMarkup = (markup) => {
  const [type, props] = markup;
  const rect = props.points ? {} : MARKUP_RECT.reduce((prev, curr) => {
    prev[curr] = toOptionalFraction(props[curr]);
    return prev;
  }, {});
  return [
    type,
    {
      zIndex: 0,
      ...props,
      ...rect
    }
  ];
};
var sortMarkupByZIndex = (a2, b) => {
  if (a2[1].zIndex > b[1].zIndex) {
    return 1;
  }
  if (a2[1].zIndex < b[1].zIndex) {
    return -1;
  }
  return 0;
};
var createMarkupView = (_) => _.utils.createView({
  name: "image-preview-markup",
  tag: "svg",
  ignoreRect: true,
  mixins: {
    apis: ["width", "height", "crop", "markup", "resize", "dirty"]
  },
  write: ({ root: root3, props }) => {
    if (!props.dirty) return;
    const { crop, resize, markup } = props;
    const viewWidth = props.width;
    const viewHeight = props.height;
    let cropWidth = crop.width;
    let cropHeight = crop.height;
    if (resize) {
      const { size: size2 } = resize;
      let outputWidth = size2 && size2.width;
      let outputHeight = size2 && size2.height;
      const outputFit = resize.mode;
      const outputUpscale = resize.upscale;
      if (outputWidth && !outputHeight) outputHeight = outputWidth;
      if (outputHeight && !outputWidth) outputWidth = outputHeight;
      const shouldUpscale = cropWidth < outputWidth && cropHeight < outputHeight;
      if (!shouldUpscale || shouldUpscale && outputUpscale) {
        let scalarWidth = outputWidth / cropWidth;
        let scalarHeight = outputHeight / cropHeight;
        if (outputFit === "force") {
          cropWidth = outputWidth;
          cropHeight = outputHeight;
        } else {
          let scalar;
          if (outputFit === "cover") {
            scalar = Math.max(scalarWidth, scalarHeight);
          } else if (outputFit === "contain") {
            scalar = Math.min(scalarWidth, scalarHeight);
          }
          cropWidth = cropWidth * scalar;
          cropHeight = cropHeight * scalar;
        }
      }
    }
    const size = {
      width: viewWidth,
      height: viewHeight
    };
    root3.element.setAttribute("width", size.width);
    root3.element.setAttribute("height", size.height);
    const scale2 = Math.min(viewWidth / cropWidth, viewHeight / cropHeight);
    root3.element.innerHTML = "";
    const markupFilter = root3.query("GET_IMAGE_PREVIEW_MARKUP_FILTER");
    markup.filter(markupFilter).map(prepareMarkup).sort(sortMarkupByZIndex).forEach((markup2) => {
      const [type, settings] = markup2;
      const element = createMarkupByType(type, settings);
      updateMarkupByType(element, type, settings, size, scale2);
      root3.element.appendChild(element);
    });
  }
});
var createVector$1 = (x, y) => ({ x, y });
var vectorDot = (a2, b) => a2.x * b.x + a2.y * b.y;
var vectorSubtract = (a2, b) => createVector$1(a2.x - b.x, a2.y - b.y);
var vectorDistanceSquared = (a2, b) => vectorDot(vectorSubtract(a2, b), vectorSubtract(a2, b));
var vectorDistance = (a2, b) => Math.sqrt(vectorDistanceSquared(a2, b));
var getOffsetPointOnEdge = (length, rotation) => {
  const a2 = length;
  const A = 1.5707963267948966;
  const B = rotation;
  const C = 1.5707963267948966 - rotation;
  const sinA = Math.sin(A);
  const sinB = Math.sin(B);
  const sinC = Math.sin(C);
  const cosC = Math.cos(C);
  const ratio = a2 / sinA;
  const b = ratio * sinB;
  const c2 = ratio * sinC;
  return createVector$1(cosC * b, cosC * c2);
};
var getRotatedRectSize = (rect, rotation) => {
  const w = rect.width;
  const h = rect.height;
  const hor = getOffsetPointOnEdge(w, rotation);
  const ver = getOffsetPointOnEdge(h, rotation);
  const tl = createVector$1(rect.x + Math.abs(hor.x), rect.y - Math.abs(hor.y));
  const tr = createVector$1(
    rect.x + rect.width + Math.abs(ver.y),
    rect.y + Math.abs(ver.x)
  );
  const bl = createVector$1(
    rect.x - Math.abs(ver.y),
    rect.y + rect.height - Math.abs(ver.x)
  );
  return {
    width: vectorDistance(tl, tr),
    height: vectorDistance(tl, bl)
  };
};
var calculateCanvasSize = (image2, canvasAspectRatio, zoom = 1) => {
  const imageAspectRatio = image2.height / image2.width;
  let canvasWidth = 1;
  let canvasHeight = canvasAspectRatio;
  let imgWidth = 1;
  let imgHeight = imageAspectRatio;
  if (imgHeight > canvasHeight) {
    imgHeight = canvasHeight;
    imgWidth = imgHeight / imageAspectRatio;
  }
  const scalar = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
  const width = image2.width / (zoom * scalar * imgWidth);
  const height = width * canvasAspectRatio;
  return {
    width,
    height
  };
};
var getImageRectZoomFactor = (imageRect, cropRect2, rotation, center2) => {
  const cx = center2.x > 0.5 ? 1 - center2.x : center2.x;
  const cy = center2.y > 0.5 ? 1 - center2.y : center2.y;
  const imageWidth = cx * 2 * imageRect.width;
  const imageHeight = cy * 2 * imageRect.height;
  const rotatedCropSize = getRotatedRectSize(cropRect2, rotation);
  return Math.max(
    rotatedCropSize.width / imageWidth,
    rotatedCropSize.height / imageHeight
  );
};
var getCenteredCropRect = (container, aspectRatio) => {
  let width = container.width;
  let height = width * aspectRatio;
  if (height > container.height) {
    height = container.height;
    width = height / aspectRatio;
  }
  const x = (container.width - width) * 0.5;
  const y = (container.height - height) * 0.5;
  return {
    x,
    y,
    width,
    height
  };
};
var getCurrentCropSize = (imageSize, crop = {}) => {
  let { zoom, rotation, center: center2, aspectRatio } = crop;
  if (!aspectRatio) aspectRatio = imageSize.height / imageSize.width;
  const canvasSize = calculateCanvasSize(imageSize, aspectRatio, zoom);
  const stage = {
    width: canvasSize.width,
    height: canvasSize.height};
  const shouldLimit = typeof crop.scaleToFit === "undefined" || crop.scaleToFit;
  const stageZoomFactor = getImageRectZoomFactor(
    imageSize,
    getCenteredCropRect(stage, aspectRatio),
    rotation,
    shouldLimit ? center2 : { x: 0.5, y: 0.5 }
  );
  const scale2 = zoom * stageZoomFactor;
  return {
    widthFloat: canvasSize.width / scale2,
    heightFloat: canvasSize.height / scale2,
    width: Math.round(canvasSize.width / scale2),
    height: Math.round(canvasSize.height / scale2)
  };
};
var IMAGE_SCALE_SPRING_PROPS = {
  type: "spring",
  stiffness: 0.5,
  damping: 0.45,
  mass: 10
};
var createBitmapView = (_) => _.utils.createView({
  name: "image-bitmap",
  ignoreRect: true,
  mixins: { styles: ["scaleX", "scaleY"] },
  create: ({ root: root3, props }) => {
    root3.appendChild(props.image);
  }
});
var createImageCanvasWrapper = (_) => _.utils.createView({
  name: "image-canvas-wrapper",
  tag: "div",
  ignoreRect: true,
  mixins: {
    apis: ["crop", "width", "height"],
    styles: [
      "originX",
      "originY",
      "translateX",
      "translateY",
      "scaleX",
      "scaleY",
      "rotateZ"
    ],
    animations: {
      originX: IMAGE_SCALE_SPRING_PROPS,
      originY: IMAGE_SCALE_SPRING_PROPS,
      scaleX: IMAGE_SCALE_SPRING_PROPS,
      scaleY: IMAGE_SCALE_SPRING_PROPS,
      translateX: IMAGE_SCALE_SPRING_PROPS,
      translateY: IMAGE_SCALE_SPRING_PROPS,
      rotateZ: IMAGE_SCALE_SPRING_PROPS
    }
  },
  create: ({ root: root3, props }) => {
    props.width = props.image.width;
    props.height = props.image.height;
    root3.ref.bitmap = root3.appendChildView(
      root3.createChildView(createBitmapView(_), { image: props.image })
    );
  },
  write: ({ root: root3, props }) => {
    const { flip } = props.crop;
    const { bitmap } = root3.ref;
    bitmap.scaleX = flip.horizontal ? -1 : 1;
    bitmap.scaleY = flip.vertical ? -1 : 1;
  }
});
var createClipView = (_) => _.utils.createView({
  name: "image-clip",
  tag: "div",
  ignoreRect: true,
  mixins: {
    apis: [
      "crop",
      "markup",
      "resize",
      "width",
      "height",
      "dirty",
      "background"
    ],
    styles: ["width", "height", "opacity"],
    animations: {
      opacity: { type: "tween", duration: 250 }
    }
  },
  didWriteView: function({ root: root3, props }) {
    if (!props.background) return;
    root3.element.style.backgroundColor = props.background;
  },
  create: ({ root: root3, props }) => {
    root3.ref.image = root3.appendChildView(
      root3.createChildView(
        createImageCanvasWrapper(_),
        Object.assign({}, props)
      )
    );
    root3.ref.createMarkup = () => {
      if (root3.ref.markup) return;
      root3.ref.markup = root3.appendChildView(
        root3.createChildView(createMarkupView(_), Object.assign({}, props))
      );
    };
    root3.ref.destroyMarkup = () => {
      if (!root3.ref.markup) return;
      root3.removeChildView(root3.ref.markup);
      root3.ref.markup = null;
    };
    const transparencyIndicator = root3.query(
      "GET_IMAGE_PREVIEW_TRANSPARENCY_INDICATOR"
    );
    if (transparencyIndicator === null) return;
    if (transparencyIndicator === "grid") {
      root3.element.dataset.transparencyIndicator = transparencyIndicator;
    } else {
      root3.element.dataset.transparencyIndicator = "color";
    }
  },
  write: ({ root: root3, props, shouldOptimize }) => {
    const { crop, markup, resize, dirty, width, height } = props;
    root3.ref.image.crop = crop;
    const stage = {
      width,
      height,
      center: {
        x: width * 0.5,
        y: height * 0.5
      }
    };
    const image2 = {
      width: root3.ref.image.width,
      height: root3.ref.image.height
    };
    const origin = {
      x: crop.center.x * image2.width,
      y: crop.center.y * image2.height
    };
    const translation = {
      x: stage.center.x - image2.width * crop.center.x,
      y: stage.center.y - image2.height * crop.center.y
    };
    const rotation = Math.PI * 2 + crop.rotation % (Math.PI * 2);
    const cropAspectRatio = crop.aspectRatio || image2.height / image2.width;
    const shouldLimit = typeof crop.scaleToFit === "undefined" || crop.scaleToFit;
    const stageZoomFactor = getImageRectZoomFactor(
      image2,
      getCenteredCropRect(stage, cropAspectRatio),
      rotation,
      shouldLimit ? crop.center : { x: 0.5, y: 0.5 }
    );
    const scale2 = crop.zoom * stageZoomFactor;
    if (markup && markup.length) {
      root3.ref.createMarkup();
      root3.ref.markup.width = width;
      root3.ref.markup.height = height;
      root3.ref.markup.resize = resize;
      root3.ref.markup.dirty = dirty;
      root3.ref.markup.markup = markup;
      root3.ref.markup.crop = getCurrentCropSize(image2, crop);
    } else if (root3.ref.markup) {
      root3.ref.destroyMarkup();
    }
    const imageView = root3.ref.image;
    if (shouldOptimize) {
      imageView.originX = null;
      imageView.originY = null;
      imageView.translateX = null;
      imageView.translateY = null;
      imageView.rotateZ = null;
      imageView.scaleX = null;
      imageView.scaleY = null;
      return;
    }
    imageView.originX = origin.x;
    imageView.originY = origin.y;
    imageView.translateX = translation.x;
    imageView.translateY = translation.y;
    imageView.rotateZ = rotation;
    imageView.scaleX = scale2;
    imageView.scaleY = scale2;
  }
});
var createImageView = (_) => _.utils.createView({
  name: "image-preview",
  tag: "div",
  ignoreRect: true,
  mixins: {
    apis: ["image", "crop", "markup", "resize", "dirty", "background"],
    styles: ["translateY", "scaleX", "scaleY", "opacity"],
    animations: {
      scaleX: IMAGE_SCALE_SPRING_PROPS,
      scaleY: IMAGE_SCALE_SPRING_PROPS,
      translateY: IMAGE_SCALE_SPRING_PROPS,
      opacity: { type: "tween", duration: 400 }
    }
  },
  create: ({ root: root3, props }) => {
    root3.ref.clip = root3.appendChildView(
      root3.createChildView(createClipView(_), {
        id: props.id,
        image: props.image,
        crop: props.crop,
        markup: props.markup,
        resize: props.resize,
        dirty: props.dirty,
        background: props.background
      })
    );
  },
  write: ({ root: root3, props, shouldOptimize }) => {
    const { clip } = root3.ref;
    const { image: image2, crop, markup, resize, dirty } = props;
    clip.crop = crop;
    clip.markup = markup;
    clip.resize = resize;
    clip.dirty = dirty;
    clip.opacity = shouldOptimize ? 0 : 1;
    if (shouldOptimize || root3.rect.element.hidden) return;
    const imageAspectRatio = image2.height / image2.width;
    let aspectRatio = crop.aspectRatio || imageAspectRatio;
    const containerWidth = root3.rect.inner.width;
    const containerHeight = root3.rect.inner.height;
    let fixedPreviewHeight = root3.query("GET_IMAGE_PREVIEW_HEIGHT");
    const minPreviewHeight = root3.query("GET_IMAGE_PREVIEW_MIN_HEIGHT");
    const maxPreviewHeight = root3.query("GET_IMAGE_PREVIEW_MAX_HEIGHT");
    const panelAspectRatio = root3.query("GET_PANEL_ASPECT_RATIO");
    const allowMultiple = root3.query("GET_ALLOW_MULTIPLE");
    if (panelAspectRatio && !allowMultiple) {
      fixedPreviewHeight = containerWidth * panelAspectRatio;
      aspectRatio = panelAspectRatio;
    }
    let clipHeight = fixedPreviewHeight !== null ? fixedPreviewHeight : Math.max(
      minPreviewHeight,
      Math.min(containerWidth * aspectRatio, maxPreviewHeight)
    );
    let clipWidth = clipHeight / aspectRatio;
    if (clipWidth > containerWidth) {
      clipWidth = containerWidth;
      clipHeight = clipWidth * aspectRatio;
    }
    if (clipHeight > containerHeight) {
      clipHeight = containerHeight;
      clipWidth = containerHeight / aspectRatio;
    }
    clip.width = clipWidth;
    clip.height = clipHeight;
  }
});
var SVG_MASK = `<svg width="500" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
    <defs>
        <radialGradient id="gradient-__UID__" cx=".5" cy="1.25" r="1.15">
            <stop offset='50%' stop-color='#000000'/>
            <stop offset='56%' stop-color='#0a0a0a'/>
            <stop offset='63%' stop-color='#262626'/>
            <stop offset='69%' stop-color='#4f4f4f'/>
            <stop offset='75%' stop-color='#808080'/>
            <stop offset='81%' stop-color='#b1b1b1'/>
            <stop offset='88%' stop-color='#dadada'/>
            <stop offset='94%' stop-color='#f6f6f6'/>
            <stop offset='100%' stop-color='#ffffff'/>
        </radialGradient>
        <mask id="mask-__UID__">
            <rect x="0" y="0" width="500" height="200" fill="url(#gradient-__UID__)"></rect>
        </mask>
    </defs>
    <rect x="0" width="500" height="200" fill="currentColor" mask="url(#mask-__UID__)"></rect>
</svg>`;
var SVGMaskUniqueId = 0;
var createImageOverlayView = (fpAPI) => fpAPI.utils.createView({
  name: "image-preview-overlay",
  tag: "div",
  ignoreRect: true,
  create: ({ root: root3, props }) => {
    let mask = SVG_MASK;
    if (document.querySelector("base")) {
      const url = new URL(
        window.location.href.replace(window.location.hash, "")
      ).href;
      mask = mask.replace(/url\(\#/g, "url(" + url + "#");
    }
    SVGMaskUniqueId++;
    root3.element.classList.add(
      `filepond--image-preview-overlay-${props.status}`
    );
    root3.element.innerHTML = mask.replace(/__UID__/g, SVGMaskUniqueId);
  },
  mixins: {
    styles: ["opacity"],
    animations: {
      opacity: { type: "spring", mass: 25 }
    }
  }
});
var BitmapWorker = function() {
  self.onmessage = (e3) => {
    createImageBitmap(e3.data.message.file).then((bitmap) => {
      self.postMessage({ id: e3.data.id, message: bitmap }, [bitmap]);
    });
  };
};
var ColorMatrixWorker = function() {
  self.onmessage = (e3) => {
    const imageData = e3.data.message.imageData;
    const matrix = e3.data.message.colorMatrix;
    const data3 = imageData.data;
    const l2 = data3.length;
    const m11 = matrix[0];
    const m12 = matrix[1];
    const m13 = matrix[2];
    const m14 = matrix[3];
    const m15 = matrix[4];
    const m21 = matrix[5];
    const m22 = matrix[6];
    const m23 = matrix[7];
    const m24 = matrix[8];
    const m25 = matrix[9];
    const m31 = matrix[10];
    const m32 = matrix[11];
    const m33 = matrix[12];
    const m34 = matrix[13];
    const m35 = matrix[14];
    const m41 = matrix[15];
    const m42 = matrix[16];
    const m43 = matrix[17];
    const m44 = matrix[18];
    const m45 = matrix[19];
    let index = 0, r2 = 0, g = 0, b = 0, a2 = 0;
    for (; index < l2; index += 4) {
      r2 = data3[index] / 255;
      g = data3[index + 1] / 255;
      b = data3[index + 2] / 255;
      a2 = data3[index + 3] / 255;
      data3[index] = Math.max(
        0,
        Math.min((r2 * m11 + g * m12 + b * m13 + a2 * m14 + m15) * 255, 255)
      );
      data3[index + 1] = Math.max(
        0,
        Math.min((r2 * m21 + g * m22 + b * m23 + a2 * m24 + m25) * 255, 255)
      );
      data3[index + 2] = Math.max(
        0,
        Math.min((r2 * m31 + g * m32 + b * m33 + a2 * m34 + m35) * 255, 255)
      );
      data3[index + 3] = Math.max(
        0,
        Math.min((r2 * m41 + g * m42 + b * m43 + a2 * m44 + m45) * 255, 255)
      );
    }
    self.postMessage({ id: e3.data.id, message: imageData }, [
      imageData.data.buffer
    ]);
  };
};
var getImageSize = (url, cb) => {
  let image2 = new Image();
  image2.onload = () => {
    const width = image2.naturalWidth;
    const height = image2.naturalHeight;
    image2 = null;
    cb(width, height);
  };
  image2.src = url;
};
var transforms = {
  1: () => [1, 0, 0, 1, 0, 0],
  2: (width) => [-1, 0, 0, 1, width, 0],
  3: (width, height) => [-1, 0, 0, -1, width, height],
  4: (width, height) => [1, 0, 0, -1, 0, height],
  5: () => [0, 1, 1, 0, 0, 0],
  6: (width, height) => [0, 1, -1, 0, height, 0],
  7: (width, height) => [0, -1, -1, 0, height, width],
  8: (width) => [0, -1, 1, 0, 0, width]
};
var fixImageOrientation = (ctx, width, height, orientation) => {
  if (orientation === -1) {
    return;
  }
  ctx.transform.apply(ctx, transforms[orientation](width, height));
};
var createPreviewImage = (data3, width, height, orientation) => {
  width = Math.round(width);
  height = Math.round(height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (orientation >= 5 && orientation <= 8) {
    [width, height] = [height, width];
  }
  fixImageOrientation(ctx, width, height, orientation);
  ctx.drawImage(data3, 0, 0, width, height);
  return canvas;
};
var isBitmap = (file2) => /^image/.test(file2.type) && !/svg/.test(file2.type);
var MAX_WIDTH = 10;
var MAX_HEIGHT = 10;
var calculateAverageColor = (image2) => {
  const scalar = Math.min(MAX_WIDTH / image2.width, MAX_HEIGHT / image2.height);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width = Math.ceil(image2.width * scalar);
  const height = canvas.height = Math.ceil(image2.height * scalar);
  ctx.drawImage(image2, 0, 0, width, height);
  let data3 = null;
  try {
    data3 = ctx.getImageData(0, 0, width, height).data;
  } catch (e3) {
    return null;
  }
  const l2 = data3.length;
  let r2 = 0;
  let g = 0;
  let b = 0;
  let i2 = 0;
  for (; i2 < l2; i2 += 4) {
    r2 += data3[i2] * data3[i2];
    g += data3[i2 + 1] * data3[i2 + 1];
    b += data3[i2 + 2] * data3[i2 + 2];
  }
  r2 = averageColor(r2, l2);
  g = averageColor(g, l2);
  b = averageColor(b, l2);
  return { r: r2, g, b };
};
var averageColor = (c2, l2) => Math.floor(Math.sqrt(c2 / (l2 / 4)));
var cloneCanvas = (origin, target) => {
  target = target || document.createElement("canvas");
  target.width = origin.width;
  target.height = origin.height;
  const ctx = target.getContext("2d");
  ctx.drawImage(origin, 0, 0);
  return target;
};
var cloneImageData = (imageData) => {
  let id;
  try {
    id = new ImageData(imageData.width, imageData.height);
  } catch (e3) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    id = ctx.createImageData(imageData.width, imageData.height);
  }
  id.data.set(new Uint8ClampedArray(imageData.data));
  return id;
};
var loadImage2 = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    resolve(img);
  };
  img.onerror = (e3) => {
    reject(e3);
  };
  img.src = url;
});
var createImageWrapperView = (_) => {
  const OverlayView = createImageOverlayView(_);
  const ImageView = createImageView(_);
  const { createWorker: createWorker4 } = _.utils;
  const applyFilter = (root3, filter, target) => new Promise((resolve) => {
    if (!root3.ref.imageData) {
      root3.ref.imageData = target.getContext("2d").getImageData(0, 0, target.width, target.height);
    }
    const imageData = cloneImageData(root3.ref.imageData);
    if (!filter || filter.length !== 20) {
      target.getContext("2d").putImageData(imageData, 0, 0);
      return resolve();
    }
    const worker = createWorker4(ColorMatrixWorker);
    worker.post(
      {
        imageData,
        colorMatrix: filter
      },
      (response) => {
        target.getContext("2d").putImageData(response, 0, 0);
        worker.terminate();
        resolve();
      },
      [imageData.data.buffer]
    );
  });
  const removeImageView = (root3, imageView) => {
    root3.removeChildView(imageView);
    imageView.image.width = 1;
    imageView.image.height = 1;
    imageView._destroy();
  };
  const shiftImage = ({ root: root3 }) => {
    const imageView = root3.ref.images.shift();
    imageView.opacity = 0;
    imageView.translateY = -15;
    root3.ref.imageViewBin.push(imageView);
    return imageView;
  };
  const pushImage = ({ root: root3, props, image: image2 }) => {
    const id = props.id;
    const item2 = root3.query("GET_ITEM", { id });
    if (!item2) return;
    const crop = item2.getMetadata("crop") || {
      center: {
        x: 0.5,
        y: 0.5
      },
      flip: {
        horizontal: false,
        vertical: false
      },
      zoom: 1,
      rotation: 0,
      aspectRatio: null
    };
    const background = root3.query(
      "GET_IMAGE_TRANSFORM_CANVAS_BACKGROUND_COLOR"
    );
    let markup;
    let resize;
    let dirty = false;
    if (root3.query("GET_IMAGE_PREVIEW_MARKUP_SHOW")) {
      markup = item2.getMetadata("markup") || [];
      resize = item2.getMetadata("resize");
      dirty = true;
    }
    const imageView = root3.appendChildView(
      root3.createChildView(ImageView, {
        id,
        image: image2,
        crop,
        resize,
        markup,
        dirty,
        background,
        opacity: 0,
        scaleX: 1.15,
        scaleY: 1.15,
        translateY: 15
      }),
      root3.childViews.length
    );
    root3.ref.images.push(imageView);
    imageView.opacity = 1;
    imageView.scaleX = 1;
    imageView.scaleY = 1;
    imageView.translateY = 0;
    setTimeout(() => {
      root3.dispatch("DID_IMAGE_PREVIEW_SHOW", { id });
    }, 250);
  };
  const updateImage4 = ({ root: root3, props }) => {
    const item2 = root3.query("GET_ITEM", { id: props.id });
    if (!item2) return;
    const imageView = root3.ref.images[root3.ref.images.length - 1];
    imageView.crop = item2.getMetadata("crop");
    imageView.background = root3.query(
      "GET_IMAGE_TRANSFORM_CANVAS_BACKGROUND_COLOR"
    );
    if (root3.query("GET_IMAGE_PREVIEW_MARKUP_SHOW")) {
      imageView.dirty = true;
      imageView.resize = item2.getMetadata("resize");
      imageView.markup = item2.getMetadata("markup");
    }
  };
  const didUpdateItemMetadata = ({ root: root3, props, action }) => {
    if (!/crop|filter|markup|resize/.test(action.change.key)) return;
    if (!root3.ref.images.length) return;
    const item2 = root3.query("GET_ITEM", { id: props.id });
    if (!item2) return;
    if (/filter/.test(action.change.key)) {
      const imageView = root3.ref.images[root3.ref.images.length - 1];
      applyFilter(root3, action.change.value, imageView.image);
      return;
    }
    if (/crop|markup|resize/.test(action.change.key)) {
      const crop = item2.getMetadata("crop");
      const image2 = root3.ref.images[root3.ref.images.length - 1];
      if (crop && crop.aspectRatio && image2.crop && image2.crop.aspectRatio && Math.abs(crop.aspectRatio - image2.crop.aspectRatio) > 1e-5) {
        const imageView = shiftImage({ root: root3 });
        pushImage({ root: root3, props, image: cloneCanvas(imageView.image) });
      } else {
        updateImage4({ root: root3, props });
      }
    }
  };
  const canCreateImageBitmap2 = (file2) => {
    const userAgent = window.navigator.userAgent;
    const isFirefox = userAgent.match(/Firefox\/([0-9]+)\./);
    const firefoxVersion = isFirefox ? parseInt(isFirefox[1]) : null;
    if (firefoxVersion !== null && firefoxVersion <= 58) return false;
    return "createImageBitmap" in window && isBitmap(file2);
  };
  const didCreatePreviewContainer = ({ root: root3, props }) => {
    const { id } = props;
    const item2 = root3.query("GET_ITEM", id);
    if (!item2) return;
    const fileURL = URL.createObjectURL(item2.file);
    getImageSize(fileURL, (width, height) => {
      root3.dispatch("DID_IMAGE_PREVIEW_CALCULATE_SIZE", {
        id,
        width,
        height
      });
    });
  };
  const drawPreview = ({ root: root3, props }) => {
    const { id } = props;
    const item2 = root3.query("GET_ITEM", id);
    if (!item2) return;
    const fileURL = URL.createObjectURL(item2.file);
    const loadPreviewFallback = () => {
      loadImage2(fileURL).then(previewImageLoaded);
    };
    const previewImageLoaded = (imageData) => {
      URL.revokeObjectURL(fileURL);
      const exif = item2.getMetadata("exif") || {};
      const orientation = exif.orientation || -1;
      let { width, height } = imageData;
      if (!width || !height) return;
      if (orientation >= 5 && orientation <= 8) {
        [width, height] = [height, width];
      }
      const pixelDensityFactor = Math.max(1, window.devicePixelRatio * 0.75);
      const zoomFactor = root3.query("GET_IMAGE_PREVIEW_ZOOM_FACTOR");
      const scaleFactor = zoomFactor * pixelDensityFactor;
      const previewImageRatio = height / width;
      const previewContainerWidth = root3.rect.element.width;
      const previewContainerHeight = root3.rect.element.height;
      let imageWidth = previewContainerWidth;
      let imageHeight = imageWidth * previewImageRatio;
      if (previewImageRatio > 1) {
        imageWidth = Math.min(width, previewContainerWidth * scaleFactor);
        imageHeight = imageWidth * previewImageRatio;
      } else {
        imageHeight = Math.min(height, previewContainerHeight * scaleFactor);
        imageWidth = imageHeight / previewImageRatio;
      }
      const previewImage = createPreviewImage(
        imageData,
        imageWidth,
        imageHeight,
        orientation
      );
      const done = () => {
        const averageColor2 = root3.query(
          "GET_IMAGE_PREVIEW_CALCULATE_AVERAGE_IMAGE_COLOR"
        ) ? calculateAverageColor(data) : null;
        item2.setMetadata("color", averageColor2, true);
        if ("close" in imageData) {
          imageData.close();
        }
        root3.ref.overlayShadow.opacity = 1;
        pushImage({ root: root3, props, image: previewImage });
      };
      const filter = item2.getMetadata("filter");
      if (filter) {
        applyFilter(root3, filter, previewImage).then(done);
      } else {
        done();
      }
    };
    if (canCreateImageBitmap2(item2.file)) {
      const worker = createWorker4(BitmapWorker);
      worker.post(
        {
          file: item2.file
        },
        (imageBitmap) => {
          worker.terminate();
          if (!imageBitmap) {
            loadPreviewFallback();
            return;
          }
          previewImageLoaded(imageBitmap);
        }
      );
    } else {
      loadPreviewFallback();
    }
  };
  const didDrawPreview = ({ root: root3 }) => {
    const image2 = root3.ref.images[root3.ref.images.length - 1];
    image2.translateY = 0;
    image2.scaleX = 1;
    image2.scaleY = 1;
    image2.opacity = 1;
  };
  const restoreOverlay = ({ root: root3 }) => {
    root3.ref.overlayShadow.opacity = 1;
    root3.ref.overlayError.opacity = 0;
    root3.ref.overlaySuccess.opacity = 0;
  };
  const didThrowError = ({ root: root3 }) => {
    root3.ref.overlayShadow.opacity = 0.25;
    root3.ref.overlayError.opacity = 1;
  };
  const didCompleteProcessing = ({ root: root3 }) => {
    root3.ref.overlayShadow.opacity = 0.25;
    root3.ref.overlaySuccess.opacity = 1;
  };
  const create3 = ({ root: root3 }) => {
    root3.ref.images = [];
    root3.ref.imageData = null;
    root3.ref.imageViewBin = [];
    root3.ref.overlayShadow = root3.appendChildView(
      root3.createChildView(OverlayView, {
        opacity: 0,
        status: "idle"
      })
    );
    root3.ref.overlaySuccess = root3.appendChildView(
      root3.createChildView(OverlayView, {
        opacity: 0,
        status: "success"
      })
    );
    root3.ref.overlayError = root3.appendChildView(
      root3.createChildView(OverlayView, {
        opacity: 0,
        status: "failure"
      })
    );
  };
  return _.utils.createView({
    name: "image-preview-wrapper",
    create: create3,
    styles: ["height"],
    apis: ["height"],
    destroy: ({ root: root3 }) => {
      root3.ref.images.forEach((imageView) => {
        imageView.image.width = 1;
        imageView.image.height = 1;
      });
    },
    didWriteView: ({ root: root3 }) => {
      root3.ref.images.forEach((imageView) => {
        imageView.dirty = false;
      });
    },
    write: _.utils.createRoute(
      {
        // image preview stated
        DID_IMAGE_PREVIEW_DRAW: didDrawPreview,
        DID_IMAGE_PREVIEW_CONTAINER_CREATE: didCreatePreviewContainer,
        DID_FINISH_CALCULATE_PREVIEWSIZE: drawPreview,
        DID_UPDATE_ITEM_METADATA: didUpdateItemMetadata,
        // file states
        DID_THROW_ITEM_LOAD_ERROR: didThrowError,
        DID_THROW_ITEM_PROCESSING_ERROR: didThrowError,
        DID_THROW_ITEM_INVALID: didThrowError,
        DID_COMPLETE_ITEM_PROCESSING: didCompleteProcessing,
        DID_START_ITEM_PROCESSING: restoreOverlay,
        DID_REVERT_ITEM_PROCESSING: restoreOverlay
      },
      ({ root: root3 }) => {
        const viewsToRemove = root3.ref.imageViewBin.filter(
          (imageView) => imageView.opacity === 0
        );
        root3.ref.imageViewBin = root3.ref.imageViewBin.filter(
          (imageView) => imageView.opacity > 0
        );
        viewsToRemove.forEach((imageView) => removeImageView(root3, imageView));
        viewsToRemove.length = 0;
      }
    )
  });
};
var plugin4 = (fpAPI) => {
  const { addFilter: addFilter2, utils } = fpAPI;
  const { Type: Type3, createRoute: createRoute3, isFile: isFile2 } = utils;
  const imagePreviewView = createImageWrapperView(fpAPI);
  addFilter2("CREATE_VIEW", (viewAPI) => {
    const { is, view, query } = viewAPI;
    if (!is("file") || !query("GET_ALLOW_IMAGE_PREVIEW")) return;
    const didLoadItem2 = ({ root: root3, props }) => {
      const { id } = props;
      const item2 = query("GET_ITEM", id);
      if (!item2 || !isFile2(item2.file) || item2.archived) return;
      const file2 = item2.file;
      if (!isPreviewableImage(file2)) return;
      if (!query("GET_IMAGE_PREVIEW_FILTER_ITEM")(item2)) return;
      const supportsCreateImageBitmap = "createImageBitmap" in (window || {});
      const maxPreviewFileSize = query("GET_IMAGE_PREVIEW_MAX_FILE_SIZE");
      if (!supportsCreateImageBitmap && (maxPreviewFileSize && file2.size > maxPreviewFileSize))
        return;
      root3.ref.imagePreview = view.appendChildView(
        view.createChildView(imagePreviewView, { id })
      );
      const fixedPreviewHeight = root3.query("GET_IMAGE_PREVIEW_HEIGHT");
      if (fixedPreviewHeight) {
        root3.dispatch("DID_UPDATE_PANEL_HEIGHT", {
          id: item2.id,
          height: fixedPreviewHeight
        });
      }
      const queue = !supportsCreateImageBitmap && file2.size > query("GET_IMAGE_PREVIEW_MAX_INSTANT_PREVIEW_FILE_SIZE");
      root3.dispatch("DID_IMAGE_PREVIEW_CONTAINER_CREATE", { id }, queue);
    };
    const rescaleItem = (root3, props) => {
      if (!root3.ref.imagePreview) return;
      let { id } = props;
      const item2 = root3.query("GET_ITEM", { id });
      if (!item2) return;
      const panelAspectRatio = root3.query("GET_PANEL_ASPECT_RATIO");
      const itemPanelAspectRatio = root3.query("GET_ITEM_PANEL_ASPECT_RATIO");
      const fixedHeight = root3.query("GET_IMAGE_PREVIEW_HEIGHT");
      if (panelAspectRatio || itemPanelAspectRatio || fixedHeight) return;
      let { imageWidth, imageHeight } = root3.ref;
      if (!imageWidth || !imageHeight) return;
      const minPreviewHeight = root3.query("GET_IMAGE_PREVIEW_MIN_HEIGHT");
      const maxPreviewHeight = root3.query("GET_IMAGE_PREVIEW_MAX_HEIGHT");
      const exif = item2.getMetadata("exif") || {};
      const orientation = exif.orientation || -1;
      if (orientation >= 5 && orientation <= 8)
        [imageWidth, imageHeight] = [imageHeight, imageWidth];
      if (!isBitmap(item2.file) || root3.query("GET_IMAGE_PREVIEW_UPSCALE")) {
        const scalar = 2048 / imageWidth;
        imageWidth *= scalar;
        imageHeight *= scalar;
      }
      const imageAspectRatio = imageHeight / imageWidth;
      const previewAspectRatio = (item2.getMetadata("crop") || {}).aspectRatio || imageAspectRatio;
      let previewHeightMax = Math.max(
        minPreviewHeight,
        Math.min(imageHeight, maxPreviewHeight)
      );
      const itemWidth = root3.rect.element.width;
      const previewHeight = Math.min(
        itemWidth * previewAspectRatio,
        previewHeightMax
      );
      root3.dispatch("DID_UPDATE_PANEL_HEIGHT", {
        id: item2.id,
        height: previewHeight
      });
    };
    const didResizeView = ({ root: root3 }) => {
      root3.ref.shouldRescale = true;
    };
    const didUpdateItemMetadata = ({ root: root3, action }) => {
      if (action.change.key !== "crop") return;
      root3.ref.shouldRescale = true;
    };
    const didCalculatePreviewSize = ({ root: root3, action }) => {
      root3.ref.imageWidth = action.width;
      root3.ref.imageHeight = action.height;
      root3.ref.shouldRescale = true;
      root3.ref.shouldDrawPreview = true;
      root3.dispatch("KICK");
    };
    view.registerWriter(
      createRoute3(
        {
          DID_RESIZE_ROOT: didResizeView,
          DID_STOP_RESIZE: didResizeView,
          DID_LOAD_ITEM: didLoadItem2,
          DID_IMAGE_PREVIEW_CALCULATE_SIZE: didCalculatePreviewSize,
          DID_UPDATE_ITEM_METADATA: didUpdateItemMetadata
        },
        ({ root: root3, props }) => {
          if (!root3.ref.imagePreview) return;
          if (root3.rect.element.hidden) return;
          if (root3.ref.shouldRescale) {
            rescaleItem(root3, props);
            root3.ref.shouldRescale = false;
          }
          if (root3.ref.shouldDrawPreview) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                root3.dispatch("DID_FINISH_CALCULATE_PREVIEWSIZE", {
                  id: props.id
                });
              });
            });
            root3.ref.shouldDrawPreview = false;
          }
        }
      )
    );
  });
  return {
    options: {
      // Enable or disable image preview
      allowImagePreview: [true, Type3.BOOLEAN],
      // filters file items to determine which are shown as preview
      imagePreviewFilterItem: [() => true, Type3.FUNCTION],
      // Fixed preview height
      imagePreviewHeight: [null, Type3.INT],
      // Min image height
      imagePreviewMinHeight: [44, Type3.INT],
      // Max image height
      imagePreviewMaxHeight: [256, Type3.INT],
      // Max size of preview file for when createImageBitmap is not supported
      imagePreviewMaxFileSize: [null, Type3.INT],
      // The amount of extra pixels added to the image preview to allow comfortable zooming
      imagePreviewZoomFactor: [2, Type3.INT],
      // Should we upscale small images to fit the max bounding box of the preview area
      imagePreviewUpscale: [false, Type3.BOOLEAN],
      // Max size of preview file that we allow to try to instant preview if createImageBitmap is not supported, else image is queued for loading
      imagePreviewMaxInstantPreviewFileSize: [1e6, Type3.INT],
      // Style of the transparancy indicator used behind images
      imagePreviewTransparencyIndicator: [null, Type3.STRING],
      // Enables or disables reading average image color
      imagePreviewCalculateAverageImageColor: [false, Type3.BOOLEAN],
      // Enables or disables the previewing of markup
      imagePreviewMarkupShow: [true, Type3.BOOLEAN],
      // Allows filtering of markup to only show certain shapes
      imagePreviewMarkupFilter: [() => true, Type3.FUNCTION]
    }
  };
};
var isBrowser5 = typeof window !== "undefined" && typeof window.document !== "undefined";
if (isBrowser5) {
  document.dispatchEvent(
    new CustomEvent("FilePond:pluginloaded", { detail: plugin4 })
  );
}
var filepond_plugin_image_preview_esm_default = plugin4;

// node_modules/filepond-plugin-image-crop/dist/filepond-plugin-image-crop.esm.js
var isImage = (file2) => /^image/.test(file2.type);
var plugin5 = ({ addFilter: addFilter2, utils }) => {
  const { Type: Type3, isFile: isFile2, getNumericAspectRatioFromString: getNumericAspectRatioFromString3 } = utils;
  const allowCrop = (item2, query) => !(!isImage(item2.file) || !query("GET_ALLOW_IMAGE_CROP"));
  const isObject3 = (value) => typeof value === "object";
  const isNumber3 = (value) => typeof value === "number";
  const updateCrop = (item2, obj) => item2.setMetadata("crop", Object.assign({}, item2.getMetadata("crop"), obj));
  addFilter2("DID_CREATE_ITEM", (item2, { query }) => {
    item2.extend("setImageCrop", (crop) => {
      if (!allowCrop(item2, query) || !isObject3(center)) return;
      item2.setMetadata("crop", crop);
      return crop;
    });
    item2.extend("setImageCropCenter", (center2) => {
      if (!allowCrop(item2, query) || !isObject3(center2)) return;
      return updateCrop(item2, { center: center2 });
    });
    item2.extend("setImageCropZoom", (zoom) => {
      if (!allowCrop(item2, query) || !isNumber3(zoom)) return;
      return updateCrop(item2, { zoom: Math.max(1, zoom) });
    });
    item2.extend("setImageCropRotation", (rotation) => {
      if (!allowCrop(item2, query) || !isNumber3(rotation)) return;
      return updateCrop(item2, { rotation });
    });
    item2.extend("setImageCropFlip", (flip) => {
      if (!allowCrop(item2, query) || !isObject3(flip)) return;
      return updateCrop(item2, { flip });
    });
    item2.extend("setImageCropAspectRatio", (newAspectRatio) => {
      if (!allowCrop(item2, query) || typeof newAspectRatio === "undefined")
        return;
      const currentCrop = item2.getMetadata("crop");
      const aspectRatio = getNumericAspectRatioFromString3(newAspectRatio);
      const newCrop = {
        center: {
          x: 0.5,
          y: 0.5
        },
        flip: currentCrop ? Object.assign({}, currentCrop.flip) : {
          horizontal: false,
          vertical: false
        },
        rotation: 0,
        zoom: 1,
        aspectRatio
      };
      item2.setMetadata("crop", newCrop);
      return newCrop;
    });
  });
  addFilter2(
    "DID_LOAD_ITEM",
    (item2, { query }) => new Promise((resolve, reject) => {
      const file2 = item2.file;
      if (!isFile2(file2) || !isImage(file2) || !query("GET_ALLOW_IMAGE_CROP")) {
        return resolve(item2);
      }
      const crop = item2.getMetadata("crop");
      if (crop) {
        return resolve(item2);
      }
      const humanAspectRatio = query("GET_IMAGE_CROP_ASPECT_RATIO");
      item2.setMetadata("crop", {
        center: {
          x: 0.5,
          y: 0.5
        },
        flip: {
          horizontal: false,
          vertical: false
        },
        rotation: 0,
        zoom: 1,
        aspectRatio: humanAspectRatio ? getNumericAspectRatioFromString3(humanAspectRatio) : null
      });
      resolve(item2);
    })
  );
  return {
    options: {
      // enable or disable image cropping
      allowImageCrop: [true, Type3.BOOLEAN],
      // the aspect ratio of the crop ('1:1', '16:9', etc)
      imageCropAspectRatio: [null, Type3.STRING]
    }
  };
};
var isBrowser6 = typeof window !== "undefined" && typeof window.document !== "undefined";
if (isBrowser6) {
  document.dispatchEvent(
    new CustomEvent("FilePond:pluginloaded", { detail: plugin5 })
  );
}
var filepond_plugin_image_crop_esm_default = plugin5;

// node_modules/filepond-plugin-image-resize/dist/filepond-plugin-image-resize.esm.js
var isImage2 = (file2) => /^image/.test(file2.type);
var getImageSize2 = (url, cb) => {
  let image2 = new Image();
  image2.onload = () => {
    const width = image2.naturalWidth;
    const height = image2.naturalHeight;
    image2 = null;
    cb({ width, height });
  };
  image2.onerror = () => cb(null);
  image2.src = url;
};
var plugin6 = ({ addFilter: addFilter2, utils }) => {
  const { Type: Type3 } = utils;
  addFilter2(
    "DID_LOAD_ITEM",
    (item2, { query }) => new Promise((resolve, reject) => {
      const file2 = item2.file;
      if (!isImage2(file2) || !query("GET_ALLOW_IMAGE_RESIZE")) {
        return resolve(item2);
      }
      const mode = query("GET_IMAGE_RESIZE_MODE");
      const width = query("GET_IMAGE_RESIZE_TARGET_WIDTH");
      const height = query("GET_IMAGE_RESIZE_TARGET_HEIGHT");
      const upscale = query("GET_IMAGE_RESIZE_UPSCALE");
      if (width === null && height === null) return resolve(item2);
      const targetWidth = width === null ? height : width;
      const targetHeight = height === null ? targetWidth : height;
      const fileURL = URL.createObjectURL(file2);
      getImageSize2(fileURL, (size) => {
        URL.revokeObjectURL(fileURL);
        if (!size) return resolve(item2);
        let { width: imageWidth, height: imageHeight } = size;
        const orientation = (item2.getMetadata("exif") || {}).orientation || -1;
        if (orientation >= 5 && orientation <= 8) {
          [imageWidth, imageHeight] = [imageHeight, imageWidth];
        }
        if (imageWidth === targetWidth && imageHeight === targetHeight)
          return resolve(item2);
        if (!upscale) {
          if (mode === "cover") {
            if (imageWidth <= targetWidth || imageHeight <= targetHeight)
              return resolve(item2);
          } else if (imageWidth <= targetWidth && imageHeight <= targetWidth) {
            return resolve(item2);
          }
        }
        item2.setMetadata("resize", {
          mode,
          upscale,
          size: {
            width: targetWidth,
            height: targetHeight
          }
        });
        resolve(item2);
      });
    })
  );
  return {
    options: {
      // Enable or disable image resizing
      allowImageResize: [true, Type3.BOOLEAN],
      // the method of rescaling
      // - force => force set size
      // - cover => pick biggest dimension
      // - contain => pick smaller dimension
      imageResizeMode: ["cover", Type3.STRING],
      // set to false to disable upscaling of image smaller than the target width / height
      imageResizeUpscale: [true, Type3.BOOLEAN],
      // target width
      imageResizeTargetWidth: [null, Type3.INT],
      // target height
      imageResizeTargetHeight: [null, Type3.INT]
    }
  };
};
var isBrowser7 = typeof window !== "undefined" && typeof window.document !== "undefined";
if (isBrowser7) {
  document.dispatchEvent(new CustomEvent("FilePond:pluginloaded", { detail: plugin6 }));
}
var filepond_plugin_image_resize_esm_default = plugin6;

// node_modules/filepond-plugin-image-transform/dist/filepond-plugin-image-transform.esm.js
var isImage3 = (file2) => /^image/.test(file2.type);
var getFilenameWithoutExtension2 = (name3) => name3.substr(0, name3.lastIndexOf(".")) || name3;
var ExtensionMap = {
  jpeg: "jpg",
  "svg+xml": "svg"
};
var renameFileToMatchMimeType = (filename, mimeType) => {
  const name3 = getFilenameWithoutExtension2(filename);
  const type = mimeType.split("/")[1];
  const extension = ExtensionMap[type] || type;
  return `${name3}.${extension}`;
};
var getValidOutputMimeType = (type) => /jpeg|png|svg\+xml/.test(type) ? type : "image/jpeg";
var isImage$1 = (file2) => /^image/.test(file2.type);
var MATRICES = {
  1: () => [1, 0, 0, 1, 0, 0],
  2: (width) => [-1, 0, 0, 1, width, 0],
  3: (width, height) => [-1, 0, 0, -1, width, height],
  4: (width, height) => [1, 0, 0, -1, 0, height],
  5: () => [0, 1, 1, 0, 0, 0],
  6: (width, height) => [0, 1, -1, 0, height, 0],
  7: (width, height) => [0, -1, -1, 0, height, width],
  8: (width) => [0, -1, 1, 0, 0, width]
};
var getImageOrientationMatrix = (width, height, orientation) => {
  if (orientation === -1) {
    orientation = 1;
  }
  return MATRICES[orientation](width, height);
};
var createVector2 = (x, y) => ({ x, y });
var vectorDot2 = (a2, b) => a2.x * b.x + a2.y * b.y;
var vectorSubtract2 = (a2, b) => createVector2(a2.x - b.x, a2.y - b.y);
var vectorDistanceSquared2 = (a2, b) => vectorDot2(vectorSubtract2(a2, b), vectorSubtract2(a2, b));
var vectorDistance2 = (a2, b) => Math.sqrt(vectorDistanceSquared2(a2, b));
var getOffsetPointOnEdge2 = (length, rotation) => {
  const a2 = length;
  const A = 1.5707963267948966;
  const B = rotation;
  const C = 1.5707963267948966 - rotation;
  const sinA = Math.sin(A);
  const sinB = Math.sin(B);
  const sinC = Math.sin(C);
  const cosC = Math.cos(C);
  const ratio = a2 / sinA;
  const b = ratio * sinB;
  const c2 = ratio * sinC;
  return createVector2(cosC * b, cosC * c2);
};
var getRotatedRectSize2 = (rect, rotation) => {
  const w = rect.width;
  const h = rect.height;
  const hor = getOffsetPointOnEdge2(w, rotation);
  const ver = getOffsetPointOnEdge2(h, rotation);
  const tl = createVector2(rect.x + Math.abs(hor.x), rect.y - Math.abs(hor.y));
  const tr = createVector2(rect.x + rect.width + Math.abs(ver.y), rect.y + Math.abs(ver.x));
  const bl = createVector2(rect.x - Math.abs(ver.y), rect.y + rect.height - Math.abs(ver.x));
  return {
    width: vectorDistance2(tl, tr),
    height: vectorDistance2(tl, bl)
  };
};
var getImageRectZoomFactor2 = (imageRect, cropRect2, rotation = 0, center2 = { x: 0.5, y: 0.5 }) => {
  const cx = center2.x > 0.5 ? 1 - center2.x : center2.x;
  const cy = center2.y > 0.5 ? 1 - center2.y : center2.y;
  const imageWidth = cx * 2 * imageRect.width;
  const imageHeight = cy * 2 * imageRect.height;
  const rotatedCropSize = getRotatedRectSize2(cropRect2, rotation);
  return Math.max(rotatedCropSize.width / imageWidth, rotatedCropSize.height / imageHeight);
};
var getCenteredCropRect2 = (container, aspectRatio) => {
  let width = container.width;
  let height = width * aspectRatio;
  if (height > container.height) {
    height = container.height;
    width = height / aspectRatio;
  }
  const x = (container.width - width) * 0.5;
  const y = (container.height - height) * 0.5;
  return {
    x,
    y,
    width,
    height
  };
};
var calculateCanvasSize2 = (image2, canvasAspectRatio, zoom = 1) => {
  const imageAspectRatio = image2.height / image2.width;
  let canvasWidth = 1;
  let canvasHeight = canvasAspectRatio;
  let imgWidth = 1;
  let imgHeight = imageAspectRatio;
  if (imgHeight > canvasHeight) {
    imgHeight = canvasHeight;
    imgWidth = imgHeight / imageAspectRatio;
  }
  const scalar = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
  const width = image2.width / (zoom * scalar * imgWidth);
  const height = width * canvasAspectRatio;
  return {
    width,
    height
  };
};
var canvasRelease = (canvas) => {
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 1, 1);
};
var isFlipped = (flip) => flip && (flip.horizontal || flip.vertical);
var getBitmap = (image2, orientation, flip) => {
  if (orientation <= 1 && !isFlipped(flip)) {
    image2.width = image2.naturalWidth;
    image2.height = image2.naturalHeight;
    return image2;
  }
  const canvas = document.createElement("canvas");
  const width = image2.naturalWidth;
  const height = image2.naturalHeight;
  const swapped = orientation >= 5 && orientation <= 8;
  if (swapped) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  if (orientation) {
    ctx.transform.apply(ctx, getImageOrientationMatrix(width, height, orientation));
  }
  if (isFlipped(flip)) {
    const matrix = [1, 0, 0, 1, 0, 0];
    if (!swapped && flip.horizontal || swapped & flip.vertical) {
      matrix[0] = -1;
      matrix[4] = width;
    }
    if (!swapped && flip.vertical || swapped && flip.horizontal) {
      matrix[3] = -1;
      matrix[5] = height;
    }
    ctx.transform(...matrix);
  }
  ctx.drawImage(image2, 0, 0, width, height);
  return canvas;
};
var imageToImageData = (imageElement, orientation, crop = {}, options = {}) => {
  const { canvasMemoryLimit, background = null } = options;
  const zoom = crop.zoom || 1;
  const bitmap = getBitmap(imageElement, orientation, crop.flip);
  const imageSize = {
    width: bitmap.width,
    height: bitmap.height
  };
  const aspectRatio = crop.aspectRatio || imageSize.height / imageSize.width;
  let canvasSize = calculateCanvasSize2(imageSize, aspectRatio, zoom);
  if (canvasMemoryLimit) {
    const requiredMemory = canvasSize.width * canvasSize.height;
    if (requiredMemory > canvasMemoryLimit) {
      const scalar = Math.sqrt(canvasMemoryLimit) / Math.sqrt(requiredMemory);
      imageSize.width = Math.floor(imageSize.width * scalar);
      imageSize.height = Math.floor(imageSize.height * scalar);
      canvasSize = calculateCanvasSize2(imageSize, aspectRatio, zoom);
    }
  }
  const canvas = document.createElement("canvas");
  const canvasCenter = {
    x: canvasSize.width * 0.5,
    y: canvasSize.height * 0.5
  };
  const stage = {
    width: canvasSize.width,
    height: canvasSize.height};
  const shouldLimit = typeof crop.scaleToFit === "undefined" || crop.scaleToFit;
  const scale2 = zoom * getImageRectZoomFactor2(
    imageSize,
    getCenteredCropRect2(stage, aspectRatio),
    crop.rotation,
    shouldLimit ? crop.center : { x: 0.5, y: 0.5 }
  );
  canvas.width = Math.round(canvasSize.width / scale2);
  canvas.height = Math.round(canvasSize.height / scale2);
  canvasCenter.x /= scale2;
  canvasCenter.y /= scale2;
  const imageOffset = {
    x: canvasCenter.x - imageSize.width * (crop.center ? crop.center.x : 0.5),
    y: canvasCenter.y - imageSize.height * (crop.center ? crop.center.y : 0.5)
  };
  const ctx = canvas.getContext("2d");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.translate(canvasCenter.x, canvasCenter.y);
  ctx.rotate(crop.rotation || 0);
  ctx.drawImage(
    bitmap,
    imageOffset.x - canvasCenter.x,
    imageOffset.y - canvasCenter.y,
    imageSize.width,
    imageSize.height
  );
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvasRelease(canvas);
  return imageData;
};
var IS_BROWSER3 = (() => typeof window !== "undefined" && typeof window.document !== "undefined")();
if (IS_BROWSER3) {
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
      value: function(callback, type, quality) {
        var dataURL = this.toDataURL(type, quality).split(",")[1];
        setTimeout(function() {
          var binStr = atob(dataURL);
          var len = binStr.length;
          var arr = new Uint8Array(len);
          for (var i2 = 0; i2 < len; i2++) {
            arr[i2] = binStr.charCodeAt(i2);
          }
          callback(new Blob([arr], { type: type || "image/png" }));
        });
      }
    });
  }
}
var canvasToBlob = (canvas, options, beforeCreateBlob = null) => new Promise((resolve) => {
  const promisedImage = beforeCreateBlob ? beforeCreateBlob(canvas) : canvas;
  Promise.resolve(promisedImage).then((canvas2) => {
    canvas2.toBlob(resolve, options.type, options.quality);
  });
});
var vectorMultiply2 = (v, amount) => createVector$12(v.x * amount, v.y * amount);
var vectorAdd2 = (a2, b) => createVector$12(a2.x + b.x, a2.y + b.y);
var vectorNormalize2 = (v) => {
  const l2 = Math.sqrt(v.x * v.x + v.y * v.y);
  if (l2 === 0) {
    return {
      x: 0,
      y: 0
    };
  }
  return createVector$12(v.x / l2, v.y / l2);
};
var vectorRotate2 = (v, radians, origin) => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const t2 = createVector$12(v.x - origin.x, v.y - origin.y);
  return createVector$12(origin.x + cos * t2.x - sin * t2.y, origin.y + sin * t2.x + cos * t2.y);
};
var createVector$12 = (x = 0, y = 0) => ({ x, y });
var getMarkupValue2 = (value, size, scalar = 1, axis) => {
  if (typeof value === "string") {
    return parseFloat(value) * scalar;
  }
  if (typeof value === "number") {
    return value * (axis ? size[axis] : Math.min(size.width, size.height));
  }
  return;
};
var getMarkupStyles2 = (markup, size, scale2) => {
  const lineStyle = markup.borderStyle || markup.lineStyle || "solid";
  const fill = markup.backgroundColor || markup.fontColor || "transparent";
  const stroke = markup.borderColor || markup.lineColor || "transparent";
  const strokeWidth = getMarkupValue2(markup.borderWidth || markup.lineWidth, size, scale2);
  const lineCap = markup.lineCap || "round";
  const lineJoin = markup.lineJoin || "round";
  const dashes = typeof lineStyle === "string" ? "" : lineStyle.map((v) => getMarkupValue2(v, size, scale2)).join(",");
  const opacity = markup.opacity || 1;
  return {
    "stroke-linecap": lineCap,
    "stroke-linejoin": lineJoin,
    "stroke-width": strokeWidth || 0,
    "stroke-dasharray": dashes,
    stroke,
    fill,
    opacity
  };
};
var isDefined3 = (value) => value != null;
var getMarkupRect2 = (rect, size, scalar = 1) => {
  let left = getMarkupValue2(rect.x, size, scalar, "width") || getMarkupValue2(rect.left, size, scalar, "width");
  let top = getMarkupValue2(rect.y, size, scalar, "height") || getMarkupValue2(rect.top, size, scalar, "height");
  let width = getMarkupValue2(rect.width, size, scalar, "width");
  let height = getMarkupValue2(rect.height, size, scalar, "height");
  let right = getMarkupValue2(rect.right, size, scalar, "width");
  let bottom = getMarkupValue2(rect.bottom, size, scalar, "height");
  if (!isDefined3(top)) {
    if (isDefined3(height) && isDefined3(bottom)) {
      top = size.height - height - bottom;
    } else {
      top = bottom;
    }
  }
  if (!isDefined3(left)) {
    if (isDefined3(width) && isDefined3(right)) {
      left = size.width - width - right;
    } else {
      left = right;
    }
  }
  if (!isDefined3(width)) {
    if (isDefined3(left) && isDefined3(right)) {
      width = size.width - left - right;
    } else {
      width = 0;
    }
  }
  if (!isDefined3(height)) {
    if (isDefined3(top) && isDefined3(bottom)) {
      height = size.height - top - bottom;
    } else {
      height = 0;
    }
  }
  return {
    x: left || 0,
    y: top || 0,
    width: width || 0,
    height: height || 0
  };
};
var pointsToPathShape2 = (points) => points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
var setAttributes2 = (element, attr3) => Object.keys(attr3).forEach((key) => element.setAttribute(key, attr3[key]));
var ns3 = "http://www.w3.org/2000/svg";
var svg2 = (tag, attr3) => {
  const element = document.createElementNS(ns3, tag);
  if (attr3) {
    setAttributes2(element, attr3);
  }
  return element;
};
var updateRect3 = (element) => setAttributes2(element, {
  ...element.rect,
  ...element.styles
});
var updateEllipse2 = (element) => {
  const cx = element.rect.x + element.rect.width * 0.5;
  const cy = element.rect.y + element.rect.height * 0.5;
  const rx = element.rect.width * 0.5;
  const ry = element.rect.height * 0.5;
  return setAttributes2(element, {
    cx,
    cy,
    rx,
    ry,
    ...element.styles
  });
};
var IMAGE_FIT_STYLE2 = {
  contain: "xMidYMid meet",
  cover: "xMidYMid slice"
};
var updateImage2 = (element, markup) => {
  setAttributes2(element, {
    ...element.rect,
    ...element.styles,
    preserveAspectRatio: IMAGE_FIT_STYLE2[markup.fit] || "none"
  });
};
var TEXT_ANCHOR2 = {
  left: "start",
  center: "middle",
  right: "end"
};
var updateText2 = (element, markup, size, scale2) => {
  const fontSize = getMarkupValue2(markup.fontSize, size, scale2);
  const fontFamily = markup.fontFamily || "sans-serif";
  const fontWeight = markup.fontWeight || "normal";
  const textAlign = TEXT_ANCHOR2[markup.textAlign] || "start";
  setAttributes2(element, {
    ...element.rect,
    ...element.styles,
    "stroke-width": 0,
    "font-weight": fontWeight,
    "font-size": fontSize,
    "font-family": fontFamily,
    "text-anchor": textAlign
  });
  if (element.text !== markup.text) {
    element.text = markup.text;
    element.textContent = markup.text.length ? markup.text : " ";
  }
};
var updateLine2 = (element, markup, size, scale2) => {
  setAttributes2(element, {
    ...element.rect,
    ...element.styles,
    fill: "none"
  });
  const line2 = element.childNodes[0];
  const begin = element.childNodes[1];
  const end = element.childNodes[2];
  const origin = element.rect;
  const target = {
    x: element.rect.x + element.rect.width,
    y: element.rect.y + element.rect.height
  };
  setAttributes2(line2, {
    x1: origin.x,
    y1: origin.y,
    x2: target.x,
    y2: target.y
  });
  if (!markup.lineDecoration) return;
  begin.style.display = "none";
  end.style.display = "none";
  const v = vectorNormalize2({
    x: target.x - origin.x,
    y: target.y - origin.y
  });
  const l2 = getMarkupValue2(0.05, size, scale2);
  if (markup.lineDecoration.indexOf("arrow-begin") !== -1) {
    const arrowBeginRotationPoint = vectorMultiply2(v, l2);
    const arrowBeginCenter = vectorAdd2(origin, arrowBeginRotationPoint);
    const arrowBeginA = vectorRotate2(origin, 2, arrowBeginCenter);
    const arrowBeginB = vectorRotate2(origin, -2, arrowBeginCenter);
    setAttributes2(begin, {
      style: "display:block;",
      d: `M${arrowBeginA.x},${arrowBeginA.y} L${origin.x},${origin.y} L${arrowBeginB.x},${arrowBeginB.y}`
    });
  }
  if (markup.lineDecoration.indexOf("arrow-end") !== -1) {
    const arrowEndRotationPoint = vectorMultiply2(v, -l2);
    const arrowEndCenter = vectorAdd2(target, arrowEndRotationPoint);
    const arrowEndA = vectorRotate2(target, 2, arrowEndCenter);
    const arrowEndB = vectorRotate2(target, -2, arrowEndCenter);
    setAttributes2(end, {
      style: "display:block;",
      d: `M${arrowEndA.x},${arrowEndA.y} L${target.x},${target.y} L${arrowEndB.x},${arrowEndB.y}`
    });
  }
};
var updatePath2 = (element, markup, size, scale2) => {
  setAttributes2(element, {
    ...element.styles,
    fill: "none",
    d: pointsToPathShape2(
      markup.points.map((point) => ({
        x: getMarkupValue2(point.x, size, scale2, "width"),
        y: getMarkupValue2(point.y, size, scale2, "height")
      }))
    )
  });
};
var createShape2 = (node) => (markup) => svg2(node, { id: markup.id });
var createImage2 = (markup) => {
  const shape = svg2("image", {
    id: markup.id,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    opacity: "0"
  });
  shape.onload = () => {
    shape.setAttribute("opacity", markup.opacity || 1);
  };
  shape.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", markup.src);
  return shape;
};
var createLine2 = (markup) => {
  const shape = svg2("g", {
    id: markup.id,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  const line2 = svg2("line");
  shape.appendChild(line2);
  const begin = svg2("path");
  shape.appendChild(begin);
  const end = svg2("path");
  shape.appendChild(end);
  return shape;
};
var CREATE_TYPE_ROUTES2 = {
  image: createImage2,
  rect: createShape2("rect"),
  ellipse: createShape2("ellipse"),
  text: createShape2("text"),
  path: createShape2("path"),
  line: createLine2
};
var UPDATE_TYPE_ROUTES2 = {
  rect: updateRect3,
  ellipse: updateEllipse2,
  image: updateImage2,
  text: updateText2,
  path: updatePath2,
  line: updateLine2
};
var createMarkupByType2 = (type, markup) => CREATE_TYPE_ROUTES2[type](markup);
var updateMarkupByType2 = (element, type, markup, size, scale2) => {
  if (type !== "path") {
    element.rect = getMarkupRect2(markup, size, scale2);
  }
  element.styles = getMarkupStyles2(markup, size, scale2);
  UPDATE_TYPE_ROUTES2[type](element, markup, size, scale2);
};
var sortMarkupByZIndex2 = (a2, b) => {
  if (a2[1].zIndex > b[1].zIndex) {
    return 1;
  }
  if (a2[1].zIndex < b[1].zIndex) {
    return -1;
  }
  return 0;
};
var cropSVG = (blob2, crop = {}, markup, options) => new Promise((resolve) => {
  const { background = null } = options;
  const fr = new FileReader();
  fr.onloadend = () => {
    const text2 = fr.result;
    const original = document.createElement("div");
    original.style.cssText = `position:absolute;pointer-events:none;width:0;height:0;visibility:hidden;`;
    original.innerHTML = text2;
    const originalNode = original.querySelector("svg");
    document.body.appendChild(original);
    const bBox = originalNode.getBBox();
    original.parentNode.removeChild(original);
    const titleNode = original.querySelector("title");
    const viewBoxAttribute = originalNode.getAttribute("viewBox") || "";
    const widthAttribute = originalNode.getAttribute("width") || "";
    const heightAttribute = originalNode.getAttribute("height") || "";
    let width = parseFloat(widthAttribute) || null;
    let height = parseFloat(heightAttribute) || null;
    const widthUnits = (widthAttribute.match(/[a-z]+/) || [])[0] || "";
    const heightUnits = (heightAttribute.match(/[a-z]+/) || [])[0] || "";
    const viewBoxList = viewBoxAttribute.split(" ").map(parseFloat);
    const viewBox = viewBoxList.length ? {
      x: viewBoxList[0],
      y: viewBoxList[1],
      width: viewBoxList[2],
      height: viewBoxList[3]
    } : bBox;
    let imageWidth = width != null ? width : viewBox.width;
    let imageHeight = height != null ? height : viewBox.height;
    originalNode.style.overflow = "visible";
    originalNode.setAttribute("width", imageWidth);
    originalNode.setAttribute("height", imageHeight);
    let markupSVG = "";
    if (markup && markup.length) {
      const size = {
        width: imageWidth,
        height: imageHeight
      };
      markupSVG = markup.sort(sortMarkupByZIndex2).reduce((prev, shape) => {
        const el = createMarkupByType2(shape[0], shape[1]);
        updateMarkupByType2(el, shape[0], shape[1], size);
        el.removeAttribute("id");
        if (el.getAttribute("opacity") === 1) {
          el.removeAttribute("opacity");
        }
        return prev + "\n" + el.outerHTML + "\n";
      }, "");
      markupSVG = `

<g>${markupSVG.replace(/&nbsp;/g, " ")}</g>

`;
    }
    const aspectRatio = crop.aspectRatio || imageHeight / imageWidth;
    const canvasWidth = imageWidth;
    const canvasHeight = canvasWidth * aspectRatio;
    const shouldLimit = typeof crop.scaleToFit === "undefined" || crop.scaleToFit;
    const cropCenterX = crop.center ? crop.center.x : 0.5;
    const cropCenterY = crop.center ? crop.center.y : 0.5;
    const canvasZoomFactor = getImageRectZoomFactor2(
      {
        width: imageWidth,
        height: imageHeight
      },
      getCenteredCropRect2(
        {
          width: canvasWidth,
          height: canvasHeight
        },
        aspectRatio
      ),
      crop.rotation,
      shouldLimit ? { x: cropCenterX, y: cropCenterY } : {
        x: 0.5,
        y: 0.5
      }
    );
    const scale2 = crop.zoom * canvasZoomFactor;
    const rotation = crop.rotation * (180 / Math.PI);
    const canvasCenter = {
      x: canvasWidth * 0.5,
      y: canvasHeight * 0.5
    };
    const imageOffset = {
      x: canvasCenter.x - imageWidth * cropCenterX,
      y: canvasCenter.y - imageHeight * cropCenterY
    };
    const cropTransforms = [
      // rotate
      `rotate(${rotation} ${canvasCenter.x} ${canvasCenter.y})`,
      // scale
      `translate(${canvasCenter.x} ${canvasCenter.y})`,
      `scale(${scale2})`,
      `translate(${-canvasCenter.x} ${-canvasCenter.y})`,
      // offset
      `translate(${imageOffset.x} ${imageOffset.y})`
    ];
    const cropFlipHorizontal = crop.flip && crop.flip.horizontal;
    const cropFlipVertical = crop.flip && crop.flip.vertical;
    const flipTransforms = [
      `scale(${cropFlipHorizontal ? -1 : 1} ${cropFlipVertical ? -1 : 1})`,
      `translate(${cropFlipHorizontal ? -imageWidth : 0} ${cropFlipVertical ? -imageHeight : 0})`
    ];
    const transformed = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasWidth}${widthUnits}" height="${canvasHeight}${heightUnits}" 
viewBox="0 0 ${canvasWidth} ${canvasHeight}" ${background ? 'style="background:' + background + '" ' : ""}
preserveAspectRatio="xMinYMin"
xmlns:xlink="http://www.w3.org/1999/xlink"
xmlns="http://www.w3.org/2000/svg">
<!-- Generated by PQINA - https://pqina.nl/ -->
<title>${titleNode ? titleNode.textContent : ""}</title>
<g transform="${cropTransforms.join(" ")}">
<g transform="${flipTransforms.join(" ")}">
${originalNode.outerHTML}${markupSVG}
</g>
</g>
</svg>`;
    resolve(transformed);
  };
  fr.readAsText(blob2);
});
var objectToImageData = (obj) => {
  let imageData;
  try {
    imageData = new ImageData(obj.width, obj.height);
  } catch (e3) {
    const canvas = document.createElement("canvas");
    imageData = canvas.getContext("2d").createImageData(obj.width, obj.height);
  }
  imageData.data.set(obj.data);
  return imageData;
};
var TransformWorker = () => {
  const TRANSFORMS = { resize, filter };
  const applyTransforms = (transforms2, imageData) => {
    transforms2.forEach((transform2) => {
      imageData = TRANSFORMS[transform2.type](imageData, transform2.data);
    });
    return imageData;
  };
  const transform = (data3, cb) => {
    let transforms2 = data3.transforms;
    let filterTransform = null;
    transforms2.forEach((transform2) => {
      if (transform2.type === "filter") {
        filterTransform = transform2;
      }
    });
    if (filterTransform) {
      let resizeTransform = null;
      transforms2.forEach((transform2) => {
        if (transform2.type === "resize") {
          resizeTransform = transform2;
        }
      });
      if (resizeTransform) {
        resizeTransform.data.matrix = filterTransform.data;
        transforms2 = transforms2.filter((transform2) => transform2.type !== "filter");
      }
    }
    cb(applyTransforms(transforms2, data3.imageData));
  };
  self.onmessage = (e3) => {
    transform(e3.data.message, (response) => {
      self.postMessage({ id: e3.data.id, message: response }, [response.data.buffer]);
    });
  };
  const br = 1;
  const bg = 1;
  const bb = 1;
  function applyFilterMatrix(index, data3, m) {
    const ir = data3[index] / 255;
    const ig = data3[index + 1] / 255;
    const ib = data3[index + 2] / 255;
    const ia = data3[index + 3] / 255;
    const mr = ir * m[0] + ig * m[1] + ib * m[2] + ia * m[3] + m[4];
    const mg = ir * m[5] + ig * m[6] + ib * m[7] + ia * m[8] + m[9];
    const mb = ir * m[10] + ig * m[11] + ib * m[12] + ia * m[13] + m[14];
    const ma = ir * m[15] + ig * m[16] + ib * m[17] + ia * m[18] + m[19];
    const or = Math.max(0, mr * ma) + br * (1 - ma);
    const og = Math.max(0, mg * ma) + bg * (1 - ma);
    const ob = Math.max(0, mb * ma) + bb * (1 - ma);
    data3[index] = Math.max(0, Math.min(1, or)) * 255;
    data3[index + 1] = Math.max(0, Math.min(1, og)) * 255;
    data3[index + 2] = Math.max(0, Math.min(1, ob)) * 255;
  }
  const identityMatrix = self.JSON.stringify([
    1,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    1,
    0
  ]);
  function isIdentityMatrix(filter2) {
    return self.JSON.stringify(filter2 || []) === identityMatrix;
  }
  function filter(imageData, matrix) {
    if (!matrix || isIdentityMatrix(matrix)) return imageData;
    const data3 = imageData.data;
    const l2 = data3.length;
    const m11 = matrix[0];
    const m12 = matrix[1];
    const m13 = matrix[2];
    const m14 = matrix[3];
    const m15 = matrix[4];
    const m21 = matrix[5];
    const m22 = matrix[6];
    const m23 = matrix[7];
    const m24 = matrix[8];
    const m25 = matrix[9];
    const m31 = matrix[10];
    const m32 = matrix[11];
    const m33 = matrix[12];
    const m34 = matrix[13];
    const m35 = matrix[14];
    const m41 = matrix[15];
    const m42 = matrix[16];
    const m43 = matrix[17];
    const m44 = matrix[18];
    const m45 = matrix[19];
    let index = 0, r2 = 0, g = 0, b = 0, a2 = 0, mr = 0, mg = 0, mb = 0, ma = 0, or = 0, og = 0, ob = 0;
    for (; index < l2; index += 4) {
      r2 = data3[index] / 255;
      g = data3[index + 1] / 255;
      b = data3[index + 2] / 255;
      a2 = data3[index + 3] / 255;
      mr = r2 * m11 + g * m12 + b * m13 + a2 * m14 + m15;
      mg = r2 * m21 + g * m22 + b * m23 + a2 * m24 + m25;
      mb = r2 * m31 + g * m32 + b * m33 + a2 * m34 + m35;
      ma = r2 * m41 + g * m42 + b * m43 + a2 * m44 + m45;
      or = Math.max(0, mr * ma) + br * (1 - ma);
      og = Math.max(0, mg * ma) + bg * (1 - ma);
      ob = Math.max(0, mb * ma) + bb * (1 - ma);
      data3[index] = Math.max(0, Math.min(1, or)) * 255;
      data3[index + 1] = Math.max(0, Math.min(1, og)) * 255;
      data3[index + 2] = Math.max(0, Math.min(1, ob)) * 255;
    }
    return imageData;
  }
  function resize(imageData, data3) {
    let { mode = "contain", upscale = false, width, height, matrix } = data3;
    matrix = !matrix || isIdentityMatrix(matrix) ? null : matrix;
    if (!width && !height) {
      return filter(imageData, matrix);
    }
    if (width === null) {
      width = height;
    } else if (height === null) {
      height = width;
    }
    if (mode !== "force") {
      let scalarWidth = width / imageData.width;
      let scalarHeight = height / imageData.height;
      let scalar = 1;
      if (mode === "cover") {
        scalar = Math.max(scalarWidth, scalarHeight);
      } else if (mode === "contain") {
        scalar = Math.min(scalarWidth, scalarHeight);
      }
      if (scalar > 1 && upscale === false) {
        return filter(imageData, matrix);
      }
      width = imageData.width * scalar;
      height = imageData.height * scalar;
    }
    const originWidth = imageData.width;
    const originHeight = imageData.height;
    const targetWidth = Math.round(width);
    const targetHeight = Math.round(height);
    const inputData = imageData.data;
    const outputData = new Uint8ClampedArray(targetWidth * targetHeight * 4);
    const ratioWidth = originWidth / targetWidth;
    const ratioHeight = originHeight / targetHeight;
    const ratioWidthHalf = Math.ceil(ratioWidth * 0.5);
    const ratioHeightHalf = Math.ceil(ratioHeight * 0.5);
    for (let j = 0; j < targetHeight; j++) {
      for (let i2 = 0; i2 < targetWidth; i2++) {
        let x2 = (i2 + j * targetWidth) * 4;
        let weight = 0;
        let weights = 0;
        let weightsAlpha = 0;
        let r2 = 0;
        let g = 0;
        let b = 0;
        let a2 = 0;
        let centerY = (j + 0.5) * ratioHeight;
        for (let yy = Math.floor(j * ratioHeight); yy < (j + 1) * ratioHeight; yy++) {
          let dy = Math.abs(centerY - (yy + 0.5)) / ratioHeightHalf;
          let centerX = (i2 + 0.5) * ratioWidth;
          let w0 = dy * dy;
          for (let xx = Math.floor(i2 * ratioWidth); xx < (i2 + 1) * ratioWidth; xx++) {
            let dx = Math.abs(centerX - (xx + 0.5)) / ratioWidthHalf;
            let w = Math.sqrt(w0 + dx * dx);
            if (w >= -1 && w <= 1) {
              weight = 2 * w * w * w - 3 * w * w + 1;
              if (weight > 0) {
                dx = 4 * (xx + yy * originWidth);
                let ref = inputData[dx + 3];
                a2 += weight * ref;
                weightsAlpha += weight;
                if (ref < 255) {
                  weight = weight * ref / 250;
                }
                r2 += weight * inputData[dx];
                g += weight * inputData[dx + 1];
                b += weight * inputData[dx + 2];
                weights += weight;
              }
            }
          }
        }
        outputData[x2] = r2 / weights;
        outputData[x2 + 1] = g / weights;
        outputData[x2 + 2] = b / weights;
        outputData[x2 + 3] = a2 / weightsAlpha;
        matrix && applyFilterMatrix(x2, outputData, matrix);
      }
    }
    return {
      data: outputData,
      width: targetWidth,
      height: targetHeight
    };
  }
};
var correctOrientation = (view, offset) => {
  if (view.getUint32(offset + 4, false) !== 1165519206) return;
  offset += 4;
  const intelByteAligned = view.getUint16(offset += 6, false) === 18761;
  offset += view.getUint32(offset + 4, intelByteAligned);
  const tags = view.getUint16(offset, intelByteAligned);
  offset += 2;
  for (let i2 = 0; i2 < tags; i2++) {
    if (view.getUint16(offset + i2 * 12, intelByteAligned) === 274) {
      view.setUint16(offset + i2 * 12 + 8, 1, intelByteAligned);
      return true;
    }
  }
  return false;
};
var readData = (data3) => {
  const view = new DataView(data3);
  if (view.getUint16(0) !== 65496) return null;
  let offset = 2;
  let marker;
  let markerLength;
  let orientationCorrected = false;
  while (offset < view.byteLength) {
    marker = view.getUint16(offset, false);
    markerLength = view.getUint16(offset + 2, false) + 2;
    const isData = marker >= 65504 && marker <= 65519 || marker === 65534;
    if (!isData) {
      break;
    }
    if (!orientationCorrected) {
      orientationCorrected = correctOrientation(view, offset);
    }
    if (offset + markerLength > view.byteLength) {
      break;
    }
    offset += markerLength;
  }
  return data3.slice(0, offset);
};
var getImageHead = (file2) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(readData(reader.result) || null);
  reader.readAsArrayBuffer(file2.slice(0, 256 * 1024));
});
var getBlobBuilder2 = () => {
  return window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
};
var createBlob2 = (arrayBuffer, mimeType) => {
  const BB = getBlobBuilder2();
  if (BB) {
    const bb = new BB();
    bb.append(arrayBuffer);
    return bb.getBlob(mimeType);
  }
  return new Blob([arrayBuffer], {
    type: mimeType
  });
};
var getUniqueId2 = () => Math.random().toString(36).substr(2, 9);
var createWorker2 = (fn3) => {
  const workerBlob = new Blob(["(", fn3.toString(), ")()"], { type: "application/javascript" });
  const workerURL = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerURL);
  const trips = [];
  return {
    transfer: () => {
    },
    // (message, cb) => {}
    post: (message, cb, transferList) => {
      const id = getUniqueId2();
      trips[id] = cb;
      worker.onmessage = (e3) => {
        const cb2 = trips[e3.data.id];
        if (!cb2) return;
        cb2(e3.data.message);
        delete trips[e3.data.id];
      };
      worker.postMessage(
        {
          id,
          message
        },
        transferList
      );
    },
    terminate: () => {
      worker.terminate();
      URL.revokeObjectURL(workerURL);
    }
  };
};
var loadImage3 = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    resolve(img);
  };
  img.onerror = (e3) => {
    reject(e3);
  };
  img.src = url;
});
var chain = (funcs) => funcs.reduce(
  (promise, func) => promise.then((result) => func().then(Array.prototype.concat.bind(result))),
  Promise.resolve([])
);
var canvasApplyMarkup = (canvas, markup) => new Promise((resolve) => {
  const size = {
    width: canvas.width,
    height: canvas.height
  };
  const ctx = canvas.getContext("2d");
  const drawers = markup.sort(sortMarkupByZIndex2).map(
    (item2) => () => new Promise((resolve2) => {
      const result = TYPE_DRAW_ROUTES[item2[0]](ctx, size, item2[1], resolve2);
      if (result) resolve2();
    })
  );
  chain(drawers).then(() => resolve(canvas));
});
var applyMarkupStyles = (ctx, styles3) => {
  ctx.beginPath();
  ctx.lineCap = styles3["stroke-linecap"];
  ctx.lineJoin = styles3["stroke-linejoin"];
  ctx.lineWidth = styles3["stroke-width"];
  if (styles3["stroke-dasharray"].length) {
    ctx.setLineDash(styles3["stroke-dasharray"].split(","));
  }
  ctx.fillStyle = styles3["fill"];
  ctx.strokeStyle = styles3["stroke"];
  ctx.globalAlpha = styles3.opacity || 1;
};
var drawMarkupStyles = (ctx) => {
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;
};
var drawRect = (ctx, size, markup) => {
  const rect = getMarkupRect2(markup, size);
  const styles3 = getMarkupStyles2(markup, size);
  applyMarkupStyles(ctx, styles3);
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  drawMarkupStyles(ctx);
  return true;
};
var drawEllipse = (ctx, size, markup) => {
  const rect = getMarkupRect2(markup, size);
  const styles3 = getMarkupStyles2(markup, size);
  applyMarkupStyles(ctx, styles3);
  const x = rect.x, y = rect.y, w = rect.width, h = rect.height, kappa = 0.5522848, ox = w / 2 * kappa, oy = h / 2 * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  drawMarkupStyles(ctx);
  return true;
};
var drawImage = (ctx, size, markup, done) => {
  const rect = getMarkupRect2(markup, size);
  const styles3 = getMarkupStyles2(markup, size);
  applyMarkupStyles(ctx, styles3);
  const image2 = new Image();
  const isCrossOriginImage = new URL(markup.src, window.location.href).origin !== window.location.origin;
  if (isCrossOriginImage) image2.crossOrigin = "";
  image2.onload = () => {
    if (markup.fit === "cover") {
      const ar = rect.width / rect.height;
      const width = ar > 1 ? image2.width : image2.height * ar;
      const height = ar > 1 ? image2.width / ar : image2.height;
      const x = image2.width * 0.5 - width * 0.5;
      const y = image2.height * 0.5 - height * 0.5;
      ctx.drawImage(image2, x, y, width, height, rect.x, rect.y, rect.width, rect.height);
    } else if (markup.fit === "contain") {
      const scalar = Math.min(rect.width / image2.width, rect.height / image2.height);
      const width = scalar * image2.width;
      const height = scalar * image2.height;
      const x = rect.x + rect.width * 0.5 - width * 0.5;
      const y = rect.y + rect.height * 0.5 - height * 0.5;
      ctx.drawImage(image2, 0, 0, image2.width, image2.height, x, y, width, height);
    } else {
      ctx.drawImage(
        image2,
        0,
        0,
        image2.width,
        image2.height,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );
    }
    drawMarkupStyles(ctx);
    done();
  };
  image2.src = markup.src;
};
var drawText = (ctx, size, markup) => {
  const rect = getMarkupRect2(markup, size);
  const styles3 = getMarkupStyles2(markup, size);
  applyMarkupStyles(ctx, styles3);
  const fontSize = getMarkupValue2(markup.fontSize, size);
  const fontFamily = markup.fontFamily || "sans-serif";
  const fontWeight = markup.fontWeight || "normal";
  const textAlign = markup.textAlign || "left";
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = textAlign;
  ctx.fillText(markup.text, rect.x, rect.y);
  drawMarkupStyles(ctx);
  return true;
};
var drawPath = (ctx, size, markup) => {
  const styles3 = getMarkupStyles2(markup, size);
  applyMarkupStyles(ctx, styles3);
  ctx.beginPath();
  const points = markup.points.map((point) => ({
    x: getMarkupValue2(point.x, size, 1, "width"),
    y: getMarkupValue2(point.y, size, 1, "height")
  }));
  ctx.moveTo(points[0].x, points[0].y);
  const l2 = points.length;
  for (let i2 = 1; i2 < l2; i2++) {
    ctx.lineTo(points[i2].x, points[i2].y);
  }
  drawMarkupStyles(ctx);
  return true;
};
var drawLine = (ctx, size, markup) => {
  const rect = getMarkupRect2(markup, size);
  const styles3 = getMarkupStyles2(markup, size);
  applyMarkupStyles(ctx, styles3);
  ctx.beginPath();
  const origin = {
    x: rect.x,
    y: rect.y
  };
  const target = {
    x: rect.x + rect.width,
    y: rect.y + rect.height
  };
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(target.x, target.y);
  const v = vectorNormalize2({
    x: target.x - origin.x,
    y: target.y - origin.y
  });
  const l2 = 0.04 * Math.min(size.width, size.height);
  if (markup.lineDecoration.indexOf("arrow-begin") !== -1) {
    const arrowBeginRotationPoint = vectorMultiply2(v, l2);
    const arrowBeginCenter = vectorAdd2(origin, arrowBeginRotationPoint);
    const arrowBeginA = vectorRotate2(origin, 2, arrowBeginCenter);
    const arrowBeginB = vectorRotate2(origin, -2, arrowBeginCenter);
    ctx.moveTo(arrowBeginA.x, arrowBeginA.y);
    ctx.lineTo(origin.x, origin.y);
    ctx.lineTo(arrowBeginB.x, arrowBeginB.y);
  }
  if (markup.lineDecoration.indexOf("arrow-end") !== -1) {
    const arrowEndRotationPoint = vectorMultiply2(v, -l2);
    const arrowEndCenter = vectorAdd2(target, arrowEndRotationPoint);
    const arrowEndA = vectorRotate2(target, 2, arrowEndCenter);
    const arrowEndB = vectorRotate2(target, -2, arrowEndCenter);
    ctx.moveTo(arrowEndA.x, arrowEndA.y);
    ctx.lineTo(target.x, target.y);
    ctx.lineTo(arrowEndB.x, arrowEndB.y);
  }
  drawMarkupStyles(ctx);
  return true;
};
var TYPE_DRAW_ROUTES = {
  rect: drawRect,
  ellipse: drawEllipse,
  image: drawImage,
  text: drawText,
  line: drawLine,
  path: drawPath
};
var imageDataToCanvas = (imageData) => {
  const image2 = document.createElement("canvas");
  image2.width = imageData.width;
  image2.height = imageData.height;
  const ctx = image2.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
  return image2;
};
var transformImage = (file2, instructions, options = {}) => new Promise((resolve, reject) => {
  if (!file2 || !isImage$1(file2)) return reject({ status: "not an image file", file: file2 });
  const { stripImageHead, beforeCreateBlob, afterCreateBlob, canvasMemoryLimit } = options;
  const { crop, size, filter, markup, output } = instructions;
  const orientation = instructions.image && instructions.image.orientation ? Math.max(1, Math.min(8, instructions.image.orientation)) : null;
  const qualityAsPercentage = output && output.quality;
  const quality = qualityAsPercentage === null ? null : qualityAsPercentage / 100;
  const type = output && output.type || null;
  const background = output && output.background || null;
  const transforms2 = [];
  if (size && (typeof size.width === "number" || typeof size.height === "number")) {
    transforms2.push({ type: "resize", data: size });
  }
  if (filter && filter.length === 20) {
    transforms2.push({ type: "filter", data: filter });
  }
  const resolveWithBlob = (blob2) => {
    const promisedBlob = afterCreateBlob ? afterCreateBlob(blob2) : blob2;
    Promise.resolve(promisedBlob).then(resolve);
  };
  const toBlob = (imageData, options2) => {
    const canvas = imageDataToCanvas(imageData);
    const promisedCanvas = markup.length ? canvasApplyMarkup(canvas, markup) : canvas;
    Promise.resolve(promisedCanvas).then((canvas2) => {
      canvasToBlob(canvas2, options2, beforeCreateBlob).then((blob2) => {
        canvasRelease(canvas2);
        if (stripImageHead) return resolveWithBlob(blob2);
        getImageHead(file2).then((imageHead) => {
          if (imageHead !== null) {
            blob2 = new Blob([imageHead, blob2.slice(20)], { type: blob2.type });
          }
          resolveWithBlob(blob2);
        });
      }).catch(reject);
    });
  };
  if (/svg/.test(file2.type) && type === null) {
    return cropSVG(file2, crop, markup, { background }).then((text2) => {
      resolve(createBlob2(text2, "image/svg+xml"));
    });
  }
  const url = URL.createObjectURL(file2);
  loadImage3(url).then((image2) => {
    URL.revokeObjectURL(url);
    const imageData = imageToImageData(image2, orientation, crop, {
      canvasMemoryLimit,
      background
    });
    const outputFormat = {
      quality,
      type: type || file2.type
    };
    if (!transforms2.length) {
      return toBlob(imageData, outputFormat);
    }
    const worker = createWorker2(TransformWorker);
    worker.post(
      {
        transforms: transforms2,
        imageData
      },
      (response) => {
        toBlob(objectToImageData(response), outputFormat);
        worker.terminate();
      },
      [imageData.data.buffer]
    );
  }).catch(reject);
});
var MARKUP_RECT2 = ["x", "y", "left", "top", "right", "bottom", "width", "height"];
var toOptionalFraction2 = (value) => typeof value === "string" && /%/.test(value) ? parseFloat(value) / 100 : value;
var prepareMarkup2 = (markup) => {
  const [type, props] = markup;
  const rect = props.points ? {} : MARKUP_RECT2.reduce((prev, curr) => {
    prev[curr] = toOptionalFraction2(props[curr]);
    return prev;
  }, {});
  return [
    type,
    {
      zIndex: 0,
      ...props,
      ...rect
    }
  ];
};
var getImageSize3 = (file2) => new Promise((resolve, reject) => {
  const imageElement = new Image();
  imageElement.src = URL.createObjectURL(file2);
  const measure = () => {
    const width = imageElement.naturalWidth;
    const height = imageElement.naturalHeight;
    const hasSize = width && height;
    if (!hasSize) return;
    URL.revokeObjectURL(imageElement.src);
    clearInterval(intervalId);
    resolve({ width, height });
  };
  imageElement.onerror = (err) => {
    URL.revokeObjectURL(imageElement.src);
    clearInterval(intervalId);
    reject(err);
  };
  const intervalId = setInterval(measure, 1);
  measure();
});
if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
      value: function(cb, type, quality) {
        const canvas = this;
        setTimeout(() => {
          const dataURL = canvas.toDataURL(type, quality).split(",")[1];
          const binStr = atob(dataURL);
          let index = binStr.length;
          const data3 = new Uint8Array(index);
          while (index--) {
            data3[index] = binStr.charCodeAt(index);
          }
          cb(new Blob([data3], { type: type || "image/png" }));
        });
      }
    });
  }
}
var isBrowser8 = typeof window !== "undefined" && typeof window.document !== "undefined";
var isIOS = isBrowser8 && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var plugin7 = ({ addFilter: addFilter2, utils }) => {
  const { Type: Type3, forin: forin3, getFileFromBlob: getFileFromBlob3, isFile: isFile2 } = utils;
  const TRANSFORM_LIST = ["crop", "resize", "filter", "markup", "output"];
  const createVariantCreator = (updateMetadata) => (transform, file2, metadata) => transform(file2, updateMetadata ? updateMetadata(metadata) : metadata);
  const isDefaultCrop = (crop) => crop.aspectRatio === null && crop.rotation === 0 && crop.zoom === 1 && crop.center && crop.center.x === 0.5 && crop.center.y === 0.5 && crop.flip && crop.flip.horizontal === false && crop.flip.vertical === false;
  addFilter2(
    "SHOULD_PREPARE_OUTPUT",
    (shouldPrepareOutput, { query }) => new Promise((resolve) => {
      resolve(!query("IS_ASYNC"));
    })
  );
  const shouldTransformFile = (query, file2, item2) => new Promise((resolve) => {
    if (!query("GET_ALLOW_IMAGE_TRANSFORM") || item2.archived || !isFile2(file2) || !isImage3(file2)) {
      return resolve(false);
    }
    getImageSize3(file2).then(() => {
      const fn3 = query("GET_IMAGE_TRANSFORM_IMAGE_FILTER");
      if (fn3) {
        const filterResult = fn3(file2);
        if (filterResult == null) {
          return handleRevert(true);
        }
        if (typeof filterResult === "boolean") {
          return resolve(filterResult);
        }
        if (typeof filterResult.then === "function") {
          return filterResult.then(resolve);
        }
      }
      resolve(true);
    }).catch((err) => {
      resolve(false);
    });
  });
  addFilter2("DID_CREATE_ITEM", (item2, { query, dispatch }) => {
    if (!query("GET_ALLOW_IMAGE_TRANSFORM")) return;
    item2.extend(
      "requestPrepare",
      () => new Promise((resolve, reject) => {
        dispatch(
          "REQUEST_PREPARE_OUTPUT",
          {
            query: item2.id,
            item: item2,
            success: resolve,
            failure: reject
          },
          true
        );
      })
    );
  });
  addFilter2(
    "PREPARE_OUTPUT",
    (file2, { query, item: item2 }) => new Promise((resolve) => {
      shouldTransformFile(query, file2, item2).then((shouldTransform) => {
        if (!shouldTransform) return resolve(file2);
        const variants = [];
        if (query("GET_IMAGE_TRANSFORM_VARIANTS_INCLUDE_ORIGINAL")) {
          variants.push(
            () => new Promise((resolve2) => {
              resolve2({
                name: query("GET_IMAGE_TRANSFORM_VARIANTS_ORIGINAL_NAME"),
                file: file2
              });
            })
          );
        }
        if (query("GET_IMAGE_TRANSFORM_VARIANTS_INCLUDE_DEFAULT")) {
          variants.push(
            (transform2, file3, metadata) => new Promise((resolve2) => {
              transform2(file3, metadata).then(
                (file4) => resolve2({
                  name: query(
                    "GET_IMAGE_TRANSFORM_VARIANTS_DEFAULT_NAME"
                  ),
                  file: file4
                })
              );
            })
          );
        }
        const variantsDefinition = query("GET_IMAGE_TRANSFORM_VARIANTS") || {};
        forin3(variantsDefinition, (key, fn3) => {
          const createVariant = createVariantCreator(fn3);
          variants.push(
            (transform2, file3, metadata) => new Promise((resolve2) => {
              createVariant(transform2, file3, metadata).then(
                (file4) => resolve2({ name: key, file: file4 })
              );
            })
          );
        });
        const qualityAsPercentage = query("GET_IMAGE_TRANSFORM_OUTPUT_QUALITY");
        const qualityMode = query("GET_IMAGE_TRANSFORM_OUTPUT_QUALITY_MODE");
        const quality = qualityAsPercentage === null ? null : qualityAsPercentage / 100;
        const type = query("GET_IMAGE_TRANSFORM_OUTPUT_MIME_TYPE");
        const clientTransforms = query("GET_IMAGE_TRANSFORM_CLIENT_TRANSFORMS") || TRANSFORM_LIST;
        item2.setMetadata(
          "output",
          {
            type,
            quality,
            client: clientTransforms
          },
          true
        );
        const transform = (file3, metadata) => new Promise((resolve2, reject) => {
          const filteredMetadata = { ...metadata };
          Object.keys(filteredMetadata).filter((instruction) => instruction !== "exif").forEach((instruction) => {
            if (clientTransforms.indexOf(instruction) === -1) {
              delete filteredMetadata[instruction];
            }
          });
          const { resize, exif, output, crop, filter, markup } = filteredMetadata;
          const instructions = {
            image: {
              orientation: exif ? exif.orientation : null
            },
            output: output && (output.type || typeof output.quality === "number" || output.background) ? {
              type: output.type,
              quality: typeof output.quality === "number" ? output.quality * 100 : null,
              background: output.background || query(
                "GET_IMAGE_TRANSFORM_CANVAS_BACKGROUND_COLOR"
              ) || null
            } : void 0,
            size: resize && (resize.size.width || resize.size.height) ? {
              mode: resize.mode,
              upscale: resize.upscale,
              ...resize.size
            } : void 0,
            crop: crop && !isDefaultCrop(crop) ? {
              ...crop
            } : void 0,
            markup: markup && markup.length ? markup.map(prepareMarkup2) : [],
            filter
          };
          if (instructions.output) {
            const willChangeType = output.type ? (
              // type set
              output.type !== file3.type
            ) : (
              // type not set
              false
            );
            const canChangeQuality = /\/jpe?g$/.test(file3.type);
            const willChangeQuality = output.quality !== null ? (
              // quality set
              canChangeQuality && qualityMode === "always"
            ) : (
              // quality not set
              false
            );
            const willModifyImageData = !!(instructions.size || instructions.crop || instructions.filter || willChangeType || willChangeQuality);
            if (!willModifyImageData) return resolve2(file3);
          }
          const options = {
            beforeCreateBlob: query("GET_IMAGE_TRANSFORM_BEFORE_CREATE_BLOB"),
            afterCreateBlob: query("GET_IMAGE_TRANSFORM_AFTER_CREATE_BLOB"),
            canvasMemoryLimit: query("GET_IMAGE_TRANSFORM_CANVAS_MEMORY_LIMIT"),
            stripImageHead: query(
              "GET_IMAGE_TRANSFORM_OUTPUT_STRIP_IMAGE_HEAD"
            )
          };
          transformImage(file3, instructions, options).then((blob2) => {
            const out = getFileFromBlob3(
              blob2,
              // rename the original filename to match the mime type of the output image
              renameFileToMatchMimeType(
                file3.name,
                getValidOutputMimeType(blob2.type)
              )
            );
            resolve2(out);
          }).catch(reject);
        });
        const variantPromises = variants.map(
          (create3) => create3(transform, file2, item2.getMetadata())
        );
        Promise.all(variantPromises).then((files) => {
          resolve(
            files.length === 1 && files[0].name === null ? (
              // return the File object
              files[0].file
            ) : (
              // return an array of files { name:'name', file:File }
              files
            )
          );
        });
      });
    })
  );
  return {
    options: {
      allowImageTransform: [true, Type3.BOOLEAN],
      // filter images to transform
      imageTransformImageFilter: [null, Type3.FUNCTION],
      // null, 'image/jpeg', 'image/png'
      imageTransformOutputMimeType: [null, Type3.STRING],
      // null, 0 - 100
      imageTransformOutputQuality: [null, Type3.INT],
      // set to false to copy image exif data to output
      imageTransformOutputStripImageHead: [true, Type3.BOOLEAN],
      // only apply transforms in this list
      imageTransformClientTransforms: [null, Type3.ARRAY],
      // only apply output quality when a transform is required
      imageTransformOutputQualityMode: ["always", Type3.STRING],
      // 'always'
      // 'optional'
      // 'mismatch' (future feature, only applied if quality differs from input)
      // get image transform variants
      imageTransformVariants: [null, Type3.OBJECT],
      // should we post the default transformed file
      imageTransformVariantsIncludeDefault: [true, Type3.BOOLEAN],
      // which name to prefix the default transformed file with
      imageTransformVariantsDefaultName: [null, Type3.STRING],
      // should we post the original file
      imageTransformVariantsIncludeOriginal: [false, Type3.BOOLEAN],
      // which name to prefix the original file with
      imageTransformVariantsOriginalName: ["original_", Type3.STRING],
      // called before creating the blob, receives canvas, expects promise resolve with canvas
      imageTransformBeforeCreateBlob: [null, Type3.FUNCTION],
      // expects promise resolved with blob
      imageTransformAfterCreateBlob: [null, Type3.FUNCTION],
      // canvas memory limit
      imageTransformCanvasMemoryLimit: [isBrowser8 && isIOS ? 4096 * 4096 : null, Type3.INT],
      // background image of the output canvas
      imageTransformCanvasBackgroundColor: [null, Type3.STRING]
    }
  };
};
if (isBrowser8) {
  document.dispatchEvent(new CustomEvent("FilePond:pluginloaded", { detail: plugin7 }));
}
var filepond_plugin_image_transform_esm_default = plugin7;

// node_modules/filepond-plugin-image-edit/dist/filepond-plugin-image-edit.esm.js
var isPreviewableImage2 = (file2) => /^image/.test(file2.type);
var plugin8 = (_) => {
  const { addFilter: addFilter2, utils, views } = _;
  const { Type: Type3, createRoute: createRoute3, createItemAPI: createItemAPI2 = (item2) => item2 } = utils;
  const { fileActionButton: fileActionButton2 } = views;
  addFilter2(
    "SHOULD_REMOVE_ON_REVERT",
    (shouldRemove, { item: item2, query }) => new Promise((resolve) => {
      const { file: file2 } = item2;
      const canEdit = query("GET_ALLOW_IMAGE_EDIT") && query("GET_IMAGE_EDIT_ALLOW_EDIT") && isPreviewableImage2(file2);
      resolve(!canEdit);
    })
  );
  addFilter2(
    "DID_LOAD_ITEM",
    (item2, { query, dispatch }) => new Promise((resolve, reject) => {
      if (item2.origin > 1) {
        resolve(item2);
        return;
      }
      const { file: file2 } = item2;
      if (!query("GET_ALLOW_IMAGE_EDIT") || !query("GET_IMAGE_EDIT_INSTANT_EDIT")) {
        resolve(item2);
        return;
      }
      if (!isPreviewableImage2(file2)) {
        resolve(item2);
        return;
      }
      const createEditorResponseHandler = (item3, resolve2, reject2) => (userDidConfirm) => {
        editRequestQueue.shift();
        if (userDidConfirm) {
          resolve2(item3);
        } else {
          reject2(item3);
        }
        dispatch("KICK");
        requestEdit();
      };
      const requestEdit = () => {
        if (!editRequestQueue.length) return;
        const { item: item3, resolve: resolve2, reject: reject2 } = editRequestQueue[0];
        dispatch("EDIT_ITEM", {
          id: item3.id,
          handleEditorResponse: createEditorResponseHandler(
            item3,
            resolve2,
            reject2
          )
        });
      };
      queueEditRequest({ item: item2, resolve, reject });
      if (editRequestQueue.length === 1) {
        requestEdit();
      }
    })
  );
  addFilter2("DID_CREATE_ITEM", (item2, { query, dispatch }) => {
    item2.extend("edit", () => {
      dispatch("EDIT_ITEM", { id: item2.id });
    });
  });
  const editRequestQueue = [];
  const queueEditRequest = (editRequest) => {
    editRequestQueue.push(editRequest);
    return editRequest;
  };
  addFilter2("CREATE_VIEW", (viewAPI) => {
    const { is, view, query } = viewAPI;
    if (!query("GET_ALLOW_IMAGE_EDIT")) return;
    const canShowImagePreview = query("GET_ALLOW_IMAGE_PREVIEW");
    const shouldExtendView = is("file-info") && !canShowImagePreview || is("file") && canShowImagePreview;
    if (!shouldExtendView) return;
    const editor2 = query("GET_IMAGE_EDIT_EDITOR");
    if (!editor2) return;
    if (!editor2.filepondCallbackBridge) {
      editor2.outputData = true;
      editor2.outputFile = false;
      editor2.filepondCallbackBridge = {
        onconfirm: editor2.onconfirm || (() => {
        }),
        oncancel: editor2.oncancel || (() => {
        })
      };
    }
    const openEditor = ({ root: root3, props, action }) => {
      const { id } = props;
      const { handleEditorResponse } = action;
      editor2.cropAspectRatio = root3.query("GET_IMAGE_CROP_ASPECT_RATIO") || editor2.cropAspectRatio;
      editor2.outputCanvasBackgroundColor = root3.query("GET_IMAGE_TRANSFORM_CANVAS_BACKGROUND_COLOR") || editor2.outputCanvasBackgroundColor;
      const item2 = root3.query("GET_ITEM", id);
      if (!item2) return;
      const file2 = item2.file;
      const crop = item2.getMetadata("crop");
      const cropDefault = {
        center: {
          x: 0.5,
          y: 0.5
        },
        flip: {
          horizontal: false,
          vertical: false
        },
        zoom: 1,
        rotation: 0,
        aspectRatio: null
      };
      const resize = item2.getMetadata("resize");
      const filter = item2.getMetadata("filter") || null;
      const filters2 = item2.getMetadata("filters") || null;
      const colors = item2.getMetadata("colors") || null;
      const markup = item2.getMetadata("markup") || null;
      const imageParameters = {
        crop: crop || cropDefault,
        size: resize ? {
          upscale: resize.upscale,
          mode: resize.mode,
          width: resize.size.width,
          height: resize.size.height
        } : null,
        filter: filters2 ? filters2.id || filters2.matrix : root3.query("GET_ALLOW_IMAGE_FILTER") && root3.query("GET_IMAGE_FILTER_COLOR_MATRIX") && !colors ? filter : null,
        color: colors,
        markup
      };
      editor2.onconfirm = ({ data: data3 }) => {
        const { crop: crop2, size, filter: filter2, color, colorMatrix, markup: markup2 } = data3;
        const metadata = {};
        if (crop2) {
          metadata.crop = crop2;
        }
        if (size) {
          const initialSize = (item2.getMetadata("resize") || {}).size;
          const targetSize = {
            width: size.width,
            height: size.height
          };
          if (!(targetSize.width && targetSize.height) && initialSize) {
            targetSize.width = initialSize.width;
            targetSize.height = initialSize.height;
          }
          if (targetSize.width || targetSize.height) {
            metadata.resize = {
              upscale: size.upscale,
              mode: size.mode,
              size: targetSize
            };
          }
        }
        if (markup2) {
          metadata.markup = markup2;
        }
        metadata.colors = color;
        metadata.filters = filter2;
        metadata.filter = colorMatrix;
        item2.setMetadata(metadata);
        editor2.filepondCallbackBridge.onconfirm(data3, createItemAPI2(item2));
        if (!handleEditorResponse) return;
        editor2.onclose = () => {
          handleEditorResponse(true);
          editor2.onclose = null;
        };
      };
      editor2.oncancel = () => {
        editor2.filepondCallbackBridge.oncancel(createItemAPI2(item2));
        if (!handleEditorResponse) return;
        editor2.onclose = () => {
          handleEditorResponse(false);
          editor2.onclose = null;
        };
      };
      editor2.open(file2, imageParameters);
    };
    const didLoadItem2 = ({ root: root3, props }) => {
      if (!query("GET_IMAGE_EDIT_ALLOW_EDIT")) return;
      const { id } = props;
      const item2 = query("GET_ITEM", id);
      if (!item2) return;
      const file2 = item2.file;
      if (!isPreviewableImage2(file2)) return;
      root3.ref.handleEdit = (e3) => {
        e3.stopPropagation();
        root3.dispatch("EDIT_ITEM", { id });
      };
      if (canShowImagePreview) {
        const buttonView = view.createChildView(fileActionButton2, {
          label: "edit",
          icon: query("GET_IMAGE_EDIT_ICON_EDIT"),
          opacity: 0
        });
        buttonView.element.classList.add("filepond--action-edit-item");
        buttonView.element.dataset.align = query(
          "GET_STYLE_IMAGE_EDIT_BUTTON_EDIT_ITEM_POSITION"
        );
        buttonView.on("click", root3.ref.handleEdit);
        root3.ref.buttonEditItem = view.appendChildView(buttonView);
      } else {
        const filenameElement = view.element.querySelector(
          ".filepond--file-info-main"
        );
        const editButton = document.createElement("button");
        editButton.className = "filepond--action-edit-item-alt";
        editButton.innerHTML = query("GET_IMAGE_EDIT_ICON_EDIT") + "<span>edit</span>";
        editButton.addEventListener("click", root3.ref.handleEdit);
        filenameElement.appendChild(editButton);
        root3.ref.editButton = editButton;
      }
    };
    view.registerDestroyer(({ root: root3 }) => {
      if (root3.ref.buttonEditItem) {
        root3.ref.buttonEditItem.off("click", root3.ref.handleEdit);
      }
      if (root3.ref.editButton) {
        root3.ref.editButton.removeEventListener("click", root3.ref.handleEdit);
      }
    });
    const routes = {
      EDIT_ITEM: openEditor,
      DID_LOAD_ITEM: didLoadItem2
    };
    if (canShowImagePreview) {
      const didPreviewUpdate = ({ root: root3 }) => {
        if (!root3.ref.buttonEditItem) return;
        root3.ref.buttonEditItem.opacity = 1;
      };
      routes.DID_IMAGE_PREVIEW_SHOW = didPreviewUpdate;
    }
    view.registerWriter(createRoute3(routes));
  });
  return {
    options: {
      // enable or disable image editing
      allowImageEdit: [true, Type3.BOOLEAN],
      // location of processing button
      styleImageEditButtonEditItemPosition: ["bottom center", Type3.STRING],
      // open editor when image is dropped
      imageEditInstantEdit: [false, Type3.BOOLEAN],
      // allow editing
      imageEditAllowEdit: [true, Type3.BOOLEAN],
      // the icon to use for the edit button
      imageEditIconEdit: [
        '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M8.5 17h1.586l7-7L15.5 8.414l-7 7V17zm-1.707-2.707l8-8a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-8 8A1 1 0 0 1 10.5 19h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 .293-.707z" fill="currentColor" fill-rule="nonzero"/></svg>',
        Type3.STRING
      ],
      // editor object
      imageEditEditor: [null, Type3.OBJECT]
    }
  };
};
var isBrowser9 = typeof window !== "undefined" && typeof window.document !== "undefined";
if (isBrowser9) {
  document.dispatchEvent(
    new CustomEvent("FilePond:pluginloaded", { detail: plugin8 })
  );
}
var filepond_plugin_image_edit_esm_default = plugin8;

// src/vendor/doka.esm.min.js
function _typeof(e3) {
  return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
    return typeof e4;
  } : function(e4) {
    return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
  })(e3);
}
function _defineProperty(e3, t2, r2) {
  return t2 in e3 ? Object.defineProperty(e3, t2, { value: r2, enumerable: true, configurable: true, writable: true }) : e3[t2] = r2, e3;
}
function _objectSpread(e3) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var r2 = null != arguments[t2] ? arguments[t2] : {}, n = Object.keys(r2);
    "function" == typeof Object.getOwnPropertySymbols && (n = n.concat(Object.getOwnPropertySymbols(r2).filter(function(e4) {
      return Object.getOwnPropertyDescriptor(r2, e4).enumerable;
    }))), n.forEach(function(t3) {
      _defineProperty(e3, t3, r2[t3]);
    });
  }
  return e3;
}
function _slicedToArray(e3, t2) {
  return _arrayWithHoles(e3) || _iterableToArrayLimit(e3, t2) || _nonIterableRest();
}
function _toConsumableArray(e3) {
  return _arrayWithoutHoles(e3) || _iterableToArray(e3) || _nonIterableSpread();
}
function _arrayWithoutHoles(e3) {
  if (Array.isArray(e3)) {
    for (var t2 = 0, r2 = new Array(e3.length); t2 < e3.length; t2++) r2[t2] = e3[t2];
    return r2;
  }
}
function _arrayWithHoles(e3) {
  if (Array.isArray(e3)) return e3;
}
function _iterableToArray(e3) {
  if (Symbol.iterator in Object(e3) || "[object Arguments]" === Object.prototype.toString.call(e3)) return Array.from(e3);
}
function _iterableToArrayLimit(e3, t2) {
  var r2 = [], n = true, i2 = false, o2 = void 0;
  try {
    for (var a2, c2 = e3[Symbol.iterator](); !(n = (a2 = c2.next()).done) && (r2.push(a2.value), !t2 || r2.length !== t2); n = true) ;
  } catch (e4) {
    i2 = true, o2 = e4;
  } finally {
    try {
      n || null == c2.return || c2.return();
    } finally {
      if (i2) throw o2;
    }
  }
  return r2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}
var isNode2 = function(e3) {
  return e3 instanceof HTMLElement;
};
var insertBefore2 = function(e3, t2) {
  return t2.parentNode.insertBefore(e3, t2);
};
var insertAfter2 = function(e3, t2) {
  return t2.parentNode.insertBefore(e3, t2.nextSibling);
};
var isObject2 = function(e3) {
  return "object" === _typeof(e3) && null !== e3;
};
var createStore2 = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [], r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : [], n = _objectSpread({}, e3), i2 = [], o2 = [], a2 = function(e4, t3, r3) {
    r3 ? o2.push({ type: e4, data: t3 }) : (s2[e4] && s2[e4](t3), i2.push({ type: e4, data: t3 }));
  }, c2 = function(e4) {
    for (var t3, r3 = arguments.length, n2 = new Array(r3 > 1 ? r3 - 1 : 0), i3 = 1; i3 < r3; i3++) n2[i3 - 1] = arguments[i3];
    return u[e4] ? (t3 = u)[e4].apply(t3, n2) : null;
  }, l2 = { getState: function() {
    return _objectSpread({}, n);
  }, processActionQueue: function() {
    var e4 = [].concat(i2);
    return i2.length = 0, e4;
  }, processDispatchQueue: function() {
    var e4 = [].concat(o2);
    o2.length = 0, e4.forEach(function(e5) {
      var t3 = e5.type, r3 = e5.data;
      a2(t3, r3);
    });
  }, dispatch: a2, query: c2 }, u = {};
  t2.forEach(function(e4) {
    u = _objectSpread({}, e4(n), u);
  });
  var s2 = {};
  return r2.forEach(function(e4) {
    s2 = _objectSpread({}, e4(a2, c2, n), s2);
  }), l2;
};
var defineProperty2 = function(e3, t2, r2) {
  "function" != typeof r2 ? Object.defineProperty(e3, t2, r2) : e3[t2] = r2;
};
var forin2 = function(e3, t2) {
  for (var r2 in e3) e3.hasOwnProperty(r2) && t2(r2, e3[r2]);
};
var createObject2 = function(e3) {
  var t2 = {};
  return forin2(e3, function(r2) {
    defineProperty2(t2, r2, e3[r2]);
  }), t2;
};
var attr2 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
  if (null === r2) return e3.getAttribute(t2) || e3.hasAttribute(t2);
  e3.setAttribute(t2, r2);
};
var ns4 = "http://www.w3.org/2000/svg";
var svgElements2 = ["svg", "path"];
var isSVGElement2 = function(e3) {
  return svgElements2.includes(e3);
};
var createElement3 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  "object" === _typeof(t2) && (r2 = t2, t2 = null);
  var n = isSVGElement2(e3) ? document.createElementNS(ns4, e3) : document.createElement(e3);
  return t2 && (isSVGElement2(e3) ? attr2(n, "class", t2) : n.className = t2), forin2(r2, function(e4, t3) {
    attr2(n, e4, t3);
  }), n;
};
var appendChild2 = function(e3) {
  return function(t2, r2) {
    void 0 !== r2 && e3.children[r2] ? e3.insertBefore(t2, e3.children[r2]) : e3.appendChild(t2);
  };
};
var appendChildView2 = function(e3, t2) {
  return function(e4, r2) {
    return void 0 !== r2 ? t2.splice(r2, 0, e4) : t2.push(e4), e4;
  };
};
var removeChildView2 = function(e3, t2) {
  return function(r2) {
    var n = t2.splice(t2.indexOf(r2), 1);
    return n.length && n[0]._destroy(), r2.element.parentNode && e3.removeChild(r2.element), r2;
  };
};
var getViewRect2 = function(e3, t2, r2, n) {
  var i2 = r2[0] || e3.left, o2 = r2[1] || e3.top, a2 = i2 + e3.width, c2 = o2 + e3.height * (n[1] || 1), l2 = { element: _objectSpread({}, e3), inner: { left: e3.left, top: e3.top, right: e3.right, bottom: e3.bottom }, outer: { left: i2, top: o2, right: a2, bottom: c2 } };
  return t2.filter(function(e4) {
    return !e4.isRectIgnored();
  }).map(function(e4) {
    return e4.rect;
  }).forEach(function(e4) {
    expandRect2(l2.inner, _objectSpread({}, e4.inner)), expandRect2(l2.outer, _objectSpread({}, e4.outer));
  }), calculateRectSize2(l2.inner), l2.outer.bottom += l2.element.marginBottom, l2.outer.right += l2.element.marginRight, calculateRectSize2(l2.outer), l2;
};
var expandRect2 = function(e3, t2) {
  t2.top += e3.top, t2.right += e3.left, t2.bottom += e3.top, t2.left += e3.left, t2.bottom > e3.bottom && (e3.bottom = t2.bottom), t2.right > e3.right && (e3.right = t2.right);
};
var calculateRectSize2 = function(e3) {
  e3.width = e3.right - e3.left, e3.height = e3.bottom - e3.top;
};
var isNumber2 = function(e3) {
  return "number" == typeof e3;
};
var thereYet2 = function(e3, t2, r2) {
  var n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 1e-3;
  return Math.abs(e3 - t2) < n && Math.abs(r2) < n;
};
var spring2 = function() {
  var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t2 = e3.stiffness, r2 = void 0 === t2 ? 0.5 : t2, n = e3.damping, i2 = void 0 === n ? 0.75 : n, o2 = e3.mass, a2 = void 0 === o2 ? 10 : o2, c2 = e3.delay, l2 = void 0 === c2 ? 0 : c2, u = null, s2 = null, d = 0, p = false, f2 = null, h = createObject2({ interpolate: function(e4) {
    if (null === f2 && (f2 = e4), !(e4 - l2 < f2 || p)) {
      if (!isNumber2(u) || !isNumber2(s2)) return p = true, void (d = 0);
      thereYet2(s2 += d += -(s2 - u) * r2 / a2, u, d *= i2) ? (s2 = u, d = 0, p = true, h.onupdate(s2), h.oncomplete(s2)) : h.onupdate(s2);
    }
  }, target: { set: function(e4) {
    if (isNumber2(e4) && !isNumber2(s2) && (s2 = e4, f2 = null), null === u && (u = e4, s2 = e4, f2 = null), p && (f2 = null), s2 === (u = e4) || void 0 === u) return p = true, d = 0, f2 = null, h.onupdate(s2), void h.oncomplete(s2);
    p = false;
  }, get: function() {
    return u;
  } }, resting: { get: function() {
    return p;
  } }, onupdate: function() {
  }, oncomplete: function() {
  }, position: { get: function() {
    return s2;
  } } });
  return h;
};
var easeInOutQuad2 = function(e3) {
  return e3 < 0.5 ? 2 * e3 * e3 : (4 - 2 * e3) * e3 - 1;
};
var tween2 = function() {
  var e3, t2, r2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, n = r2.duration, i2 = void 0 === n ? 500 : n, o2 = r2.easing, a2 = void 0 === o2 ? easeInOutQuad2 : o2, c2 = r2.delay, l2 = void 0 === c2 ? 0 : c2, u = null, s2 = true, d = false, p = null, f2 = createObject2({ interpolate: function(r3) {
    s2 || null === p || (null === u && (u = r3), r3 - u < l2 || ((e3 = r3 - u - l2) < i2 ? (t2 = e3 / i2, f2.onupdate((e3 >= 0 ? a2(d ? 1 - t2 : t2) : 0) * p)) : (e3 = 1, t2 = d ? 0 : 1, f2.onupdate(t2 * p), f2.oncomplete(t2 * p), s2 = true)));
  }, target: { get: function() {
    return d ? 0 : p;
  }, set: function(e4) {
    if (null === p) return p = e4, f2.onupdate(e4), void f2.oncomplete(e4);
    e4 < p ? (p = 1, d = true) : (d = false, p = e4), s2 = false, u = null;
  } }, resting: { get: function() {
    return s2;
  } }, onupdate: function() {
  }, oncomplete: function() {
  } });
  return f2;
};
var animator2 = { spring: spring2, tween: tween2 };
var createAnimator2 = function(e3, t2, r2) {
  var n = e3[t2] && "object" === _typeof(e3[t2][r2]) ? e3[t2][r2] : e3[t2] || e3, i2 = "string" == typeof n ? n : n.type, o2 = "object" === _typeof(n) ? _objectSpread({}, n) : {};
  return animator2[i2] ? animator2[i2](o2) : null;
};
var addGetSet2 = function(e3, t2, r2) {
  var n = arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
  (t2 = Array.isArray(t2) ? t2 : [t2]).forEach(function(t3) {
    e3.forEach(function(e4) {
      var i2 = e4, o2 = function() {
        return r2[e4];
      }, a2 = function(t4) {
        return r2[e4] = t4;
      };
      "object" === _typeof(e4) && (i2 = e4.key, o2 = e4.getter || o2, a2 = e4.setter || a2), t3[i2] && !n || (t3[i2] = { get: o2, set: a2 });
    });
  });
};
var animations2 = function(e3) {
  var t2 = e3.mixinConfig, r2 = e3.viewProps, n = e3.viewInternalAPI, i2 = e3.viewExternalAPI, o2 = _objectSpread({}, r2), a2 = [];
  return forin2(t2, function(e4, t3) {
    var c2 = createAnimator2(t3);
    c2 && (c2.onupdate = function(t4) {
      r2[e4] = t4;
    }, c2.target = o2[e4], addGetSet2([{ key: e4, setter: function(e5) {
      c2.target !== e5 && (c2.target = e5);
    }, getter: function() {
      return r2[e4];
    } }], [n, i2], r2, true), a2.push(c2));
  }), { write: function(e4) {
    var t3 = true;
    return a2.forEach(function(r3) {
      r3.resting || (t3 = false), r3.interpolate(e4);
    }), t3;
  }, destroy: function() {
  } };
};
var addEvent2 = function(e3) {
  return function(t2, r2) {
    e3.addEventListener(t2, r2);
  };
};
var removeEvent2 = function(e3) {
  return function(t2, r2) {
    e3.removeEventListener(t2, r2);
  };
};
var listeners2 = function(e3) {
  var t2 = e3.viewExternalAPI, r2 = e3.view, n = [], i2 = addEvent2(r2.element), o2 = removeEvent2(r2.element);
  return t2.on = function(e4, t3) {
    n.push({ type: e4, fn: t3 }), i2(e4, t3);
  }, t2.off = function(e4, t3) {
    n.splice(n.findIndex(function(r3) {
      return r3.type === e4 && r3.fn === t3;
    }), 1), o2(e4, t3);
  }, { write: function() {
    return true;
  }, destroy: function() {
    n.forEach(function(e4) {
      o2(e4.type, e4.fn);
    });
  } };
};
var apis2 = function(e3) {
  var t2 = e3.mixinConfig, r2 = e3.viewProps, n = e3.viewExternalAPI;
  addGetSet2(t2, n, r2);
};
var defaults2 = { opacity: 1, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0, rotateX: 0, rotateY: 0, rotateZ: 0, originX: 0, originY: 0 };
var styles2 = function(e3) {
  var t2 = e3.mixinConfig, r2 = e3.viewProps, n = e3.viewInternalAPI, i2 = e3.viewExternalAPI, o2 = e3.view, a2 = _objectSpread({}, r2), c2 = {};
  addGetSet2(t2, [n, i2], r2);
  var l2 = function() {
    return o2.rect ? getViewRect2(o2.rect, o2.childViews, [r2.translateX || 0, r2.translateY || 0], [r2.scaleX || 0, r2.scaleY || 0]) : null;
  };
  return n.rect = { get: l2 }, i2.rect = { get: l2 }, t2.forEach(function(e4) {
    r2[e4] = void 0 === a2[e4] ? defaults2[e4] : a2[e4];
  }), { write: function() {
    if (propsHaveChanged2(c2, r2)) return applyStyles2(o2.element, r2), Object.assign(c2, _objectSpread({}, r2)), true;
  }, destroy: function() {
  } };
};
var propsHaveChanged2 = function(e3, t2) {
  if (Object.keys(e3).length !== Object.keys(t2).length) return true;
  for (var r2 in t2) if (t2[r2] !== e3[r2]) return true;
  return false;
};
var applyStyles2 = function(e3, t2) {
  var r2 = t2.opacity, n = t2.perspective, i2 = t2.translateX, o2 = t2.translateY, a2 = t2.scaleX, c2 = t2.scaleY, l2 = t2.rotateX, u = t2.rotateY, s2 = t2.rotateZ, d = t2.originX, p = t2.originY, f2 = t2.width, h = t2.height, g = "", m = "";
  null == d && null == p || (m += "transform-origin: ".concat(d || 0, "px ").concat(p || 0, "px;")), null != n && (g += "perspective(".concat(n, "px) ")), null == i2 && null == o2 || (g += "translate3d(".concat(i2 || 0, "px, ").concat(o2 || 0, "px, 0) ")), null == a2 && null == c2 || (g += "scale3d(".concat(null != a2 ? a2 : 1, ", ").concat(null != c2 ? c2 : 1, ", 1) ")), null != s2 && (g += "rotateZ(".concat(s2, "rad) ")), null != l2 && (g += "rotateX(".concat(l2, "rad) ")), null != u && (g += "rotateY(".concat(u, "rad) ")), "" != g && (m += "transform:".concat(g, ";")), null != r2 && (m += "opacity:".concat(r2, ";"), r2 < 1 && (m += "pointer-events:none;"), 0 === r2 && "BUTTON" === e3.nodeName && (m += "visibility:hidden;")), null != f2 && (m += "width:".concat(f2, "px;")), null != h && (m += "height:".concat(h, "px;"));
  var v = e3.elementCurrentStyle || "";
  m.length === v.length && m === v || (e3.style.cssText = m, e3.elementCurrentStyle = m);
};
var Mixins2 = { styles: styles2, listeners: listeners2, animations: animations2, apis: apis2 };
var updateRect4 = function() {
  var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  return t2.layoutCalculated || (e3.paddingTop = parseInt(r2.paddingTop, 10) || 0, e3.marginTop = parseInt(r2.marginTop, 10) || 0, e3.marginRight = parseInt(r2.marginRight, 10) || 0, e3.marginBottom = parseInt(r2.marginBottom, 10) || 0, e3.marginLeft = parseInt(r2.marginLeft, 10) || 0, t2.layoutCalculated = true), e3.left = t2.offsetLeft || 0, e3.top = t2.offsetTop || 0, e3.width = t2.offsetWidth || 0, e3.height = t2.offsetHeight || 0, e3.right = e3.left + e3.width, e3.bottom = e3.top + e3.height, e3.scrollTop = t2.scrollTop, e3.hidden = null === t2.offsetParent && "fixed" !== r2.position, e3;
};
var IS_BROWSER4 = "undefined" != typeof window && void 0 !== window.document;
var isBrowser10 = function() {
  return IS_BROWSER4;
};
var testElement2 = isBrowser10() ? createElement3("svg") : {};
var getChildCount2 = "children" in testElement2 ? function(e3) {
  return e3.children.length;
} : function(e3) {
  return e3.childNodes.length;
};
var createView2 = function() {
  var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t2 = e3.tag, r2 = void 0 === t2 ? "div" : t2, n = e3.name, i2 = void 0 === n ? null : n, o2 = e3.attributes, a2 = void 0 === o2 ? {} : o2, c2 = e3.read, l2 = void 0 === c2 ? function() {
  } : c2, u = e3.write, s2 = void 0 === u ? function() {
  } : u, d = e3.create, p = void 0 === d ? function() {
  } : d, f2 = e3.destroy, h = void 0 === f2 ? function() {
  } : f2, g = e3.filterFrameActionsForChild, m = void 0 === g ? function(e4, t3) {
    return t3;
  } : g, v = e3.didCreateView, y = void 0 === v ? function() {
  } : v, E = e3.didWriteView, T = void 0 === E ? function() {
  } : E, _ = e3.shouldUpdateChildViews, R = void 0 === _ ? function() {
    return true;
  } : _, w = e3.ignoreRect, A = void 0 !== w && w, I = e3.ignoreRectUpdate, S = void 0 !== I && I, C = e3.mixins, O = void 0 === C ? [] : C;
  return function(e4) {
    var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, n2 = createElement3(r2, i2 ? "doka--".concat(i2) : null, a2), o3 = window.getComputedStyle(n2, null), c3 = updateRect4(), u2 = null, d2 = false, f3 = [], g2 = [], v2 = {}, E2 = {}, _2 = [s2], w2 = [l2], I2 = [h], C2 = function() {
      return n2;
    }, x = function() {
      return [].concat(f3);
    }, b = function() {
      return u2 || (u2 = getViewRect2(c3, f3, [0, 0], [1, 1]));
    }, M = function() {
      return n2.layoutCalculated = false;
    }, L = { element: { get: C2 }, style: { get: function() {
      return o3;
    } }, childViews: { get: x } }, P = _objectSpread({}, L, { rect: { get: b }, ref: { get: function() {
      return v2;
    } }, is: function(e5) {
      return i2 === e5;
    }, appendChild: appendChild2(n2), createChildView: /* @__PURE__ */ (function(e5) {
      return function(t4, r3) {
        return t4(e5, r3);
      };
    })(e4), linkView: function(e5) {
      return f3.push(e5), e5;
    }, unlinkView: function(e5) {
      f3.splice(f3.indexOf(e5), 1);
    }, appendChildView: appendChildView2(n2, f3), removeChildView: removeChildView2(n2, f3), registerWriter: function(e5) {
      return _2.push(e5);
    }, registerReader: function(e5) {
      return w2.push(e5);
    }, registerDestroyer: function(e5) {
      return I2.push(e5);
    }, invalidateLayout: M, dispatch: e4.dispatch, query: e4.query }), G = { element: { get: C2 }, childViews: { get: x }, rect: { get: b }, resting: { get: function() {
      return d2;
    } }, isRectIgnored: function() {
      return A;
    }, invalidateLayout: M, _read: function() {
      u2 = null, R({ root: D, props: t3 }) && f3.forEach(function(e6) {
        return e6._read();
      }), !(S && c3.width && c3.height) && updateRect4(c3, n2, o3);
      var e5 = { root: D, props: t3, rect: c3 };
      w2.forEach(function(t4) {
        return t4(e5);
      });
    }, _write: function(e5) {
      var r3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [], n3 = 0 === r3.length;
      return _2.forEach(function(i3) {
        false === i3({ props: t3, root: D, actions: r3, timestamp: e5 }) && (n3 = false);
      }), g2.forEach(function(t4) {
        false === t4.write(e5) && (n3 = false);
      }), R({ props: t3, root: D, actions: r3, timestamp: e5 }) && (f3.filter(function(e6) {
        return !!e6.element.parentNode;
      }).forEach(function(t4) {
        t4._write(e5, m(t4, r3)) || (n3 = false);
      }), f3.forEach(function(t4, i3) {
        t4.element.parentNode || (D.appendChild(t4.element, i3), t4._read(), t4._write(e5, m(t4, r3)), n3 = false);
      })), d2 = n3, T({ props: t3, root: D, actions: r3, timestamp: e5 }), n3;
    }, _destroy: function() {
      g2.forEach(function(e5) {
        return e5.destroy();
      }), I2.forEach(function(e5) {
        e5({ root: D });
      }), f3.forEach(function(e5) {
        return e5._destroy();
      });
    } }, k = _objectSpread({}, L, { rect: { get: function() {
      return c3;
    } } });
    Object.keys(O).sort(function(e5, t4) {
      return "styles" === e5 ? 1 : "styles" === t4 ? -1 : 0;
    }).forEach(function(e5) {
      var r3 = Mixins2[e5]({ mixinConfig: O[e5], viewProps: t3, viewState: E2, viewInternalAPI: P, viewExternalAPI: G, view: createObject2(k) });
      r3 && g2.push(r3);
    });
    var D = createObject2(P);
    p({ root: D, props: t3 });
    var U = getChildCount2(n2) || 0;
    return f3.forEach(function(e5, t4) {
      D.appendChild(e5.element, U + t4);
    }), y(D), createObject2(G);
  };
};
var createPainter2 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 60, n = "__framePainter";
  if (window[n]) return window[n].readers.push(e3), void window[n].writers.push(t2);
  window[n] = { readers: [e3], writers: [t2] };
  var i2 = window[n], o2 = 1e3 / r2, a2 = null, c2 = null, l2 = null, u = null, s2 = function() {
    document.hidden ? (l2 = function() {
      return window.setTimeout(function() {
        return d(performance.now());
      }, o2);
    }, u = function() {
      return window.clearTimeout(c2);
    }) : (l2 = function() {
      return window.requestAnimationFrame(d);
    }, u = function() {
      return window.cancelAnimationFrame(c2);
    });
  };
  document.addEventListener("visibilitychange", function() {
    u && u(), s2(), d(performance.now());
  });
  var d = function e4(t3) {
    c2 = l2(e4), a2 || (a2 = t3);
    var r3 = t3 - a2;
    r3 <= o2 || (a2 = t3 - r3 % o2, i2.readers.forEach(function(e5) {
      return e5();
    }), i2.writers.forEach(function(e5) {
      return e5(t3);
    }));
  };
  return s2(), d(performance.now()), { pause: function() {
    u(c2);
  } };
};
var createRoute2 = function(e3, t2) {
  return function(r2) {
    var n = r2.root, i2 = r2.props, o2 = r2.actions, a2 = void 0 === o2 ? [] : o2, c2 = r2.timestamp;
    if (a2.filter(function(t3) {
      return e3[t3.type];
    }).forEach(function(t3) {
      return e3[t3.type]({ root: n, props: i2, action: t3.data, timestamp: c2 });
    }), t2) return t2({ root: n, props: i2, actions: a2, timestamp: c2 });
  };
};
var isArray2 = function(e3) {
  return Array.isArray(e3);
};
var isEmpty2 = function(e3) {
  return null == e3;
};
var trim2 = function(e3) {
  return e3.trim();
};
var toString2 = function(e3) {
  return "" + e3;
};
var toArray2 = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : ",";
  return isEmpty2(e3) ? [] : isArray2(e3) ? e3 : toString2(e3).split(t2).map(trim2).filter(function(e4) {
    return e4.length;
  });
};
var isBoolean2 = function(e3) {
  return "boolean" == typeof e3;
};
var toBoolean2 = function(e3) {
  return isBoolean2(e3) ? e3 : "true" === e3;
};
var isString2 = function(e3) {
  return "string" == typeof e3;
};
var toNumber2 = function(e3) {
  return isNumber2(e3) ? e3 : isString2(e3) ? toString2(e3).replace(/[a-z]+/gi, "") : 0;
};
var toInt2 = function(e3) {
  return parseInt(toNumber2(e3), 10);
};
var toFloat2 = function(e3) {
  return parseFloat(toNumber2(e3));
};
var isInt2 = function(e3) {
  return isNumber2(e3) && isFinite(e3) && Math.floor(e3) === e3;
};
var toBytes2 = function(e3) {
  if (isInt2(e3)) return e3;
  var t2 = toString2(e3).trim();
  return /MB$/i.test(t2) ? (t2 = t2.replace(/MB$i/, "").trim(), 1e3 * toInt2(t2) * 1e3) : /KB/i.test(t2) ? (t2 = t2.replace(/KB$i/, "").trim(), 1e3 * toInt2(t2)) : toInt2(t2);
};
var isFunction2 = function(e3) {
  return "function" == typeof e3;
};
var toFunctionReference2 = function(e3) {
  for (var t2 = self, r2 = e3.split("."), n = null; n = r2.shift(); ) if (!(t2 = t2[n])) return null;
  return t2;
};
var isNull2 = function(e3) {
  return null === e3;
};
var getType2 = function(e3) {
  return isArray2(e3) ? "array" : isNull2(e3) ? "null" : isInt2(e3) ? "int" : /^[0-9]+ ?(?:GB|MB|KB)$/gi.test(e3) ? "bytes" : _typeof(e3);
};
var replaceSingleQuotes2 = function(e3) {
  return e3.replace(/{\s*'/g, '{"').replace(/'\s*}/g, '"}').replace(/'\s*:/g, '":').replace(/:\s*'/g, ':"').replace(/,\s*'/g, ',"').replace(/'\s*,/g, '",');
};
var conversionTable2 = { array: toArray2, boolean: toBoolean2, int: function(e3) {
  return "bytes" === getType2(e3) ? toBytes2(e3) : toInt2(e3);
}, float: toFloat2, bytes: toBytes2, number: toFloat2, string: function(e3) {
  return isFunction2(e3) ? e3 : toString2(e3);
}, object: function(e3) {
  try {
    return JSON.parse(replaceSingleQuotes2(e3));
  } catch (t2) {
    return e3;
  }
}, file: function(e3) {
  return e3;
}, function: function(e3) {
  return toFunctionReference2(e3);
} };
var convertTo2 = function(e3, t2) {
  return conversionTable2[t2](e3);
};
var getValueByType2 = function(e3, t2, r2) {
  if (e3 === t2) return e3;
  var n = getType2(e3);
  if (n !== r2) {
    var i2 = convertTo2(e3, r2);
    if (n = getType2(i2), null === i2) throw 'Trying to assign value with incorrect type, allowed type: "'.concat(r2, '"');
    e3 = i2;
  }
  return e3;
};
var createOption2 = function(e3, t2) {
  var r2 = e3;
  return { enumerable: true, get: function() {
    return r2;
  }, set: function(n) {
    r2 = getValueByType2(n, e3, t2);
  } };
};
var createOptions2 = function(e3) {
  var t2 = {};
  return forin2(e3, function(r2) {
    var n = isString2(e3[r2]) ? e3[r2] : r2, i2 = e3[n];
    t2[r2] = n === r2 ? createOption2(i2[0], i2[1]) : t2[n];
  }), createObject2(t2);
};
var resetState = function(e3) {
  e3.file = null, e3.activeView = null, e3.markup = [], e3.markupToolValues = {}, e3.rootRect = { x: 0, y: 0, left: 0, top: 0, width: 0, height: 0 }, e3.stage = null, e3.stageOffset = null, e3.image = null, e3.zoomTimeoutId = null, e3.instantUpdate = false, e3.filePromise = null, e3.fileLoader = null, e3.instructions = { size: null, crop: null, filter: null, color: null }, e3.filter = null, e3.filterName = null, e3.filterValue = null, e3.colorValues = {}, e3.colorMatrices = {}, e3.size = { width: false, height: false, aspectRatioLocked: true, aspectRatioPrevious: false }, e3.crop = { rectangle: null, transforms: null, rotation: null, flip: null, aspectRatio: null, isRotating: false, isDirty: false, limitToImageBounds: true, draft: { rectangle: null, transforms: null } };
};
var createInitialState2 = function(e3) {
  var t2 = { noImageTimeout: null, options: createOptions2(e3) };
  return resetState(t2), t2;
};
var fromCamels2 = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "-";
  return e3.split(/(?=[A-Z])/).map(function(e4) {
    return e4.toLowerCase();
  }).join(t2);
};
var createOptionAPI2 = function(e3, t2) {
  var r2 = {};
  return forin2(t2, function(n) {
    var i2 = isString2(t2[n]) ? t2[n] : n;
    r2[n] = { get: function() {
      return e3.getState().options[i2];
    }, set: function(t3) {
      e3.dispatch("SET_".concat(fromCamels2(i2, "_").toUpperCase()), { value: t3 });
    } };
  }), r2;
};
var createOptionActions2 = function(e3) {
  return function(t2, r2, n) {
    var i2 = {};
    return forin2(e3, function(e4) {
      var r3 = fromCamels2(e4, "_").toUpperCase();
      i2["SET_".concat(r3)] = function(i3) {
        var o2;
        try {
          o2 = n.options[e4], n.options[e4] = i3.value;
        } catch (e5) {
        }
        t2("DID_SET_".concat(r3), { value: n.options[e4], prevValue: o2 });
      };
    }), i2;
  };
};
var createOptionQueries2 = function(e3) {
  return function(t2) {
    var r2 = {};
    return forin2(e3, function(e4) {
      r2["GET_".concat(fromCamels2(e4, "_").toUpperCase())] = function() {
        return t2.options[e4];
      };
    }), r2;
  };
};
var getUniqueId3 = function() {
  return Math.random().toString(36).substr(2, 9);
};
var arrayRemove2 = function(e3, t2) {
  return e3.splice(t2, 1);
};
var on2 = function() {
  var e3 = [], t2 = function(t3, r2) {
    arrayRemove2(e3, e3.findIndex(function(e4) {
      return e4.event === t3 && (e4.cb === r2 || !r2);
    }));
  };
  return { fire: function(t3) {
    for (var r2 = arguments.length, n = new Array(r2 > 1 ? r2 - 1 : 0), i2 = 1; i2 < r2; i2++) n[i2 - 1] = arguments[i2];
    e3.filter(function(e4) {
      return e4.event === t3;
    }).map(function(e4) {
      return e4.cb;
    }).forEach(function(e4) {
      setTimeout(function() {
        e4.apply(void 0, n);
      }, 0);
    });
  }, on: function(t3, r2) {
    e3.push({ event: t3, cb: r2 });
  }, onOnce: function(r2, n) {
    e3.push({ event: r2, cb: function() {
      t2(r2, n), n.apply(void 0, arguments);
    } });
  }, off: t2 };
};
var Type2 = { BOOLEAN: "boolean", INT: "int", NUMBER: "number", STRING: "string", ARRAY: "array", OBJECT: "object", FUNCTION: "function", FILE: "file" };
var testResult = null;
var isIOS2 = function() {
  return null === testResult && (testResult = (/iPad|iPhone|iPod/.test(navigator.userAgent) || "MacIntel" === navigator.platform && navigator.maxTouchPoints > 1) && !window.MSStream), testResult;
};
var getOptions2 = function() {
  return _objectSpread({}, defaultOptions2);
};
var setOptions2 = function(e3) {
  forin2(e3, function(e4, t2) {
    defaultOptions2[e4] && setOption(e4, t2);
  });
};
var correctDeprecatedOption = function(e3) {
  return isString2(defaultOptions2[e3]) ? defaultOptions2[e3] : e3;
};
var setOption = function(e3, t2) {
  e3 = correctDeprecatedOption(e3), defaultOptions2[e3][0] = getValueByType2(t2, defaultOptions2[e3][0], defaultOptions2[e3][1]);
};
var defaultOptions2 = { id: [null, Type2.STRING], className: [null, Type2.STRING], src: [null, Type2.FILE], storageName: ["doka", Type2.STRING], maxImagePreviewWidth: [1500, Type2.INT], maxImagePreviewHeight: [1500, Type2.INT], imagePreviewScaleMode: ["stage", Type2.STRING], allowPreviewFitToView: [true, Type2.BOOLEAN], allowButtonCancel: [true, Type2.BOOLEAN], allowButtonConfirm: [true, Type2.BOOLEAN], allowButtonReset: [true, Type2.BOOLEAN], allowDropFiles: [false, Type2.BOOLEAN], allowBrowseFiles: [true, Type2.BOOLEAN], allowAutoClose: [true, Type2.BOOLEAN], allowAutoDestroy: [false, Type2.BOOLEAN], utils: [["crop", "filter", "color", "markup"], Type2.ARRAY], util: [null, Type2.STRING], initialState: [null, Type2.OBJECT], outputData: [false, Type2.BOOLEAN], outputFile: [true, Type2.BOOLEAN], outputCorrectImageExifOrientation: [true, Type2.BOOLEAN], outputStripImageHead: [true, Type2.BOOLEAN], outputType: [null, Type2.STRING], outputQuality: [null, Type2.INT], outputFit: ["cover", Type2.STRING], outputUpscale: [true, Type2.BOOLEAN], outputWidth: [null, Type2.INT], outputHeight: [null, Type2.INT], outputCanvasBackgroundColor: [null, Type2.STRING], outputCanvasMemoryLimit: [isBrowser10() && isIOS2() ? 16777216 : null, Type2.INT], outputCanvasSyncTarget: [null, Type2.OBJECT], size: [null, Type2.OBJECT], sizeMin: [{ width: 1, height: 1 }, Type2.OBJECT], sizeMax: [{ width: 9999, height: 9999 }, Type2.OBJECT], filter: [null, Type2.OBJECT], filters: [{ original: { label: "Original", matrix: function() {
  return null;
} }, chrome: { label: "Chrome", matrix: function() {
  return [1.398, -0.316, 0.065, -0.273, 0.201, -0.051, 1.278, -0.08, -0.273, 0.201, -0.051, 0.119, 1.151, -0.29, 0.215, 0, 0, 0, 1, 0];
} }, fade: { label: "Fade", matrix: function() {
  return [1.073, -0.015, 0.092, -0.115, -0.017, 0.107, 0.859, 0.184, -0.115, -0.017, 0.015, 0.077, 1.104, -0.115, -0.017, 0, 0, 0, 1, 0];
} }, mono: { label: "Mono", matrix: function() {
  return [0.212, 0.715, 0.114, 0, 0, 0.212, 0.715, 0.114, 0, 0, 0.212, 0.715, 0.114, 0, 0, 0, 0, 0, 1, 0];
} }, noir: { label: "Noir", matrix: function() {
  return [0.15, 1.3, -0.25, 0.1, -0.2, 0.15, 1.3, -0.25, 0.1, -0.2, 0.15, 1.3, -0.25, 0.1, -0.2, 0, 0, 0, 1, 0];
} } }, Type2.OBJECT], crop: [null, Type2.OBJECT], cropShowSize: [false, Type2.BOOLEAN], cropZoomTimeout: [null, Type2.INT], cropMask: [null, Type2.FUNCTION], cropMaskInset: [0, Type2.INT], cropAllowResizeRect: [true, Type2.BOOLEAN], cropAllowImageTurnLeft: [true, Type2.BOOLEAN], cropAllowImageTurnRight: [false, Type2.BOOLEAN], cropAllowImageFlipHorizontal: [true, Type2.BOOLEAN], cropAllowImageFlipVertical: [true, Type2.BOOLEAN], cropAllowToggleLimit: [false, Type2.BOOLEAN], cropLimitToImageBounds: [true, Type2.BOOLEAN], cropAllowInstructionZoom: [false, Type2.BOOLEAN], cropAllowRotate: [true, Type2.BOOLEAN], cropResizeMatchImageAspectRatio: [false, Type2.BOOLEAN], cropResizeKeyCodes: [[18, 91, 92, 93], Type2.ARRAY], cropResizeScrollRectOnly: [false, Type2.BOOLEAN], cropAspectRatio: [null, Type2.STRING], cropAspectRatioOptions: [null, Type2.ARRAY], cropMinImageWidth: [1, Type2.INT], cropMinImageHeight: [1, Type2.INT], color: [void 0, Type2.OBJECT], colorBrightness: [0, Type2.NUMBER], colorBrightnessRange: [[-0.25, 0.25], Type2.ARRAY], colorContrast: [1, Type2.NUMBER], colorContrastRange: [[0.5, 1.5], Type2.ARRAY], colorExposure: [1, Type2.NUMBER], colorExposureRange: [[0.5, 1.5], Type2.ARRAY], colorSaturation: [1, Type2.NUMBER], colorSaturationRange: [[0, 2], Type2.ARRAY], markup: [null, Type2.ARRAY], markupUtil: ["select", Type2.STRING], markupFilter: [function() {
  return true;
}, Type2.FUNCTION], markupAllowAddMarkup: [true, Type2.BOOLEAN], markupAllowCustomColor: [true, Type2.BOOLEAN], markupDrawDistance: [4, Type2.NUMBER], markupColor: ["#000", Type2.STRING], markupColorOptions: [[["White", "#fff", "#f6f6f6"], ["Silver", "#9e9e9e"], ["Black", "#000", "#333"], ["Red", "#f44336"], ["Orange", "#ff9800"], ["Yellow", "#ffeb3b"], ["Green", "#4caf50"], ["Blue", "#2196f3"], ["Violet", "#3f51b5"], ["Purple", "#9c27b0"]], Type2.ARRAY], markupFontSize: [0.1, Type2.NUMBER], markupFontSizeOptions: [[["XL", 0.15], ["L", 0.125], ["M", 0.1], ["S", 0.075], ["XS", 0.05]], Type2.ARRAY], markupFontFamily: ["Helvetica, Arial, Verdana", Type2.STRING], markupFontFamilyOptions: [[["Serif", "Palatino, 'Times New Roman', serif"], ["Sans Serif", "Helvetica, Arial, Verdana"], ["Monospaced", "Monaco, 'Lucida Console', monospaced"]], Type2.ARRAY], markupShapeStyle: [[0.015, null], Type2.ARRAY], markupShapeStyleOptions: [[["Fill", 0, null, 0], ["Outline thick", 0.025, null, 4], ["Outline default", 0.015, null, 2], ["Outline thin", 5e-3, null, 1], ["Outline dashed", 5e-3, [0.01], 1]], Type2.ARRAY], markupLineStyle: [[0.015, null], Type2.ARRAY], markupLineStyleOptions: [[["Thick", 0.025, null, 4], ["Default", 0.015, null, 2], ["Thin", 5e-3, null, 1], ["Dashed", 5e-3, [0.01], 1]], Type2.ARRAY], markupLineDecoration: [["arrow-end"], Type2.ARRAY], markupLineDecorationOptions: [[["None", []], ["Single arrow", ["arrow-end"]], ["Double arrow", ["arrow-begin", "arrow-end"]]], Type2.ARRAY], stickers: [null, Type2.ARRAY], beforeReset: [null, Type2.FUNCTION], beforeLoadImage: [null, Type2.FUNCTION], beforeCreateBlob: [null, Type2.FUNCTION], afterCreateBlob: [null, Type2.FUNCTION], afterCreateOutput: [null, Type2.FUNCTION], onconfirm: [null, Type2.FUNCTION], oncancel: [null, Type2.FUNCTION], onclose: [null, Type2.FUNCTION], onloadstart: [null, Type2.FUNCTION], onload: [null, Type2.FUNCTION], onloaderror: [null, Type2.FUNCTION], oninit: [null, Type2.FUNCTION], onready: [null, Type2.FUNCTION], onupdate: [null, Type2.FUNCTION], ondestroy: [null, Type2.FUNCTION], labelButtonReset: ["Reset", Type2.STRING], labelButtonCancel: ["Cancel", Type2.STRING], labelButtonConfirm: ["Done", Type2.STRING], labelButtonUtilCrop: ["Crop", Type2.STRING], labelButtonUtilResize: ["Resize", Type2.STRING], labelButtonUtilFilter: ["Filter", Type2.STRING], labelButtonUtilColor: ["Colors", Type2.STRING], labelButtonUtilMarkup: ["Markup", Type2.STRING], labelButtonUtilSticker: ["Stickers", Type2.STRING], labelStatusMissingWebGL: ["WebGL is required but is disabled on your browser", Type2.STRING], labelStatusAwaitingImage: ["Waiting for image\u2026", Type2.STRING], labelStatusLoadImageError: ["Error loading image\u2026", Type2.STRING], labelStatusLoadingImage: ["Loading image\u2026", Type2.STRING], labelStatusProcessingImage: ["Processing image\u2026", Type2.STRING], labelColorBrightness: ["Brightness", Type2.STRING], labelColorContrast: ["Contrast", Type2.STRING], labelColorExposure: ["Exposure", Type2.STRING], labelColorSaturation: ["Saturation", Type2.STRING], labelMarkupTypeRectangle: ["Square", Type2.STRING], labelMarkupTypeEllipse: ["Circle", Type2.STRING], labelMarkupTypeText: ["Text", Type2.STRING], labelMarkupTypeLine: ["Arrow", Type2.STRING], labelMarkupSelectFontSize: ["Size", Type2.STRING], labelMarkupSelectFontFamily: ["Font", Type2.STRING], labelMarkupSelectLineDecoration: ["Decoration", Type2.STRING], labelMarkupSelectLineStyle: ["Style", Type2.STRING], labelMarkupSelectShapeStyle: ["Style", Type2.STRING], labelMarkupRemoveShape: ["Remove", Type2.STRING], labelMarkupToolSelect: ["Select", Type2.STRING], labelMarkupToolDraw: ["Draw", Type2.STRING], labelMarkupToolLine: ["Arrow", Type2.STRING], labelMarkupToolText: ["Text", Type2.STRING], labelMarkupToolRect: ["Square", Type2.STRING], labelMarkupToolEllipse: ["Circle", Type2.STRING], labelResizeWidth: ["Width", Type2.STRING], labelResizeHeight: ["Height", Type2.STRING], labelResizeApplyChanges: ["Apply", Type2.STRING], labelCropInstructionZoom: ["Zoom in and out with your scroll wheel or touchpad.", Type2.STRING], labelButtonCropZoom: ["Zoom", Type2.STRING], labelButtonCropRotateLeft: ["Rotate left", Type2.STRING], labelButtonCropRotateRight: ["Rotate right", Type2.STRING], labelButtonCropRotateCenter: ["Center rotation", Type2.STRING], labelButtonCropFlipHorizontal: ["Flip horizontal", Type2.STRING], labelButtonCropFlipVertical: ["Flip vertical", Type2.STRING], labelButtonCropAspectRatio: ["Aspect ratio", Type2.STRING], labelButtonCropToggleLimit: ["Crop selection", Type2.STRING], labelButtonCropToggleLimitEnable: ["Limited to image", Type2.STRING], labelButtonCropToggleLimitDisable: ["Select outside image", Type2.STRING], pointerEventsPolyfillScope: ["root", Type2.STRING], styleCropCorner: ["circle", Type2.STRING], styleFullscreenSafeArea: [isBrowser10() && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ? "bottom" : "none", Type2.STRING], styleLayoutMode: [null, Type2.STRING] };
var limit2 = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0, r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1;
  return Math.min(r2, Math.max(t2, e3));
};
var roundFloat = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 10;
  return parseFloat(e3.toFixed(t2));
};
var vectorEqual = function(e3, t2) {
  return roundFloat(e3.x) === roundFloat(t2.x) && roundFloat(e3.y) === roundFloat(t2.y);
};
var roundVector = function(e3, t2) {
  return { x: roundFloat(e3.x, t2), y: roundFloat(e3.y, t2) };
};
var vectorSubtract3 = function(e3, t2) {
  return createVector3(e3.x - t2.x, e3.y - t2.y);
};
var vectorDot3 = function(e3, t2) {
  return e3.x * t2.x + e3.y * t2.y;
};
var vectorDistanceSquared3 = function(e3, t2) {
  return vectorDot3(vectorSubtract3(e3, t2), vectorSubtract3(e3, t2));
};
var vectorDistance3 = function(e3, t2) {
  return Math.sqrt(vectorDistanceSquared3(e3, t2));
};
var vectorAngleBetween = function(e3, t2) {
  var r2 = vectorSubtract3(e3, t2);
  return Math.atan2(r2.y, r2.x);
};
var vectorLimit = function(e3, t2) {
  return createVector3(limit2(e3.x, t2.x, t2.x + t2.width), limit2(e3.y, t2.y, t2.y + t2.height));
};
var vectorRotate3 = function(e3, t2, r2) {
  var n = Math.cos(t2), i2 = Math.sin(t2), o2 = createVector3(e3.x - r2.x, e3.y - r2.y);
  return createVector3(r2.x + n * o2.x - i2 * o2.y, r2.y + i2 * o2.x + n * o2.y);
};
var createVector3 = function() {
  return { x: arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0, y: arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0 };
};
var rectEqualsRect = function(e3, t2) {
  return e3.x === t2.x && e3.y === t2.y && e3.width === t2.width && e3.height === t2.height;
};
var rectFitsInRect = function(e3, t2) {
  var r2 = rectBounds(e3), n = rectBounds(t2);
  return r2.left >= n.left && r2.top >= n.top && r2.bottom <= n.bottom && r2.right <= n.right;
};
var rotateRectCorners = function(e3, t2, r2) {
  return 0 === t2 ? { tl: e3.tl, tr: e3.tr, br: e3.br, bl: e3.bl } : { tl: vectorRotate3(e3.tl, t2, r2), tr: vectorRotate3(e3.tr, t2, r2), br: vectorRotate3(e3.br, t2, r2), bl: vectorRotate3(e3.bl, t2, r2) };
};
var rectRotate = function(e3, t2, r2) {
  var n = rotateRectCorners(rectCorners(e3), t2, r2), i2 = n.tl, o2 = n.tr, a2 = n.br, c2 = n.bl, l2 = Math.min(i2.x, o2.x, a2.x, c2.x), u = Math.min(i2.y, o2.y, a2.y, c2.y), s2 = Math.max(i2.x, o2.x, a2.x, c2.x), d = Math.max(i2.y, o2.y, a2.y, c2.y);
  return createRect(l2, u, s2 - l2, d - u);
};
var rectScale = function(e3, t2, r2) {
  return createRect(t2 * (e3.x - r2.x) + r2.x, t2 * (e3.y - r2.y) + r2.y, t2 * e3.width, t2 * e3.height);
};
var rectTranslate = function(e3, t2) {
  return createRect(e3.x + t2.x, e3.y + t2.y, e3.width, e3.height);
};
var TRANSFORM_MAP = { translate: rectTranslate, rotate: rectRotate, scale: rectScale };
var rectTransform = function(e3, t2, r2) {
  return t2.reduce(function(e4, t3) {
    return (0, TRANSFORM_MAP[t3[0]])(e4, t3[1], r2);
  }, e3);
};
var rectClone = function(e3) {
  return createRect(e3.x, e3.y, e3.width, e3.height);
};
var rectBounds = function(e3) {
  return { top: e3.y, right: e3.x + e3.width, bottom: e3.y + e3.height, left: e3.x };
};
var rectFromBounds = function(e3) {
  var t2 = e3.top, r2 = e3.right, n = e3.bottom, i2 = e3.left;
  return { x: i2, y: t2, width: r2 - i2, height: n - t2 };
};
var rectCenter = function(e3) {
  return createVector3(e3.x + 0.5 * e3.width, e3.y + 0.5 * e3.height);
};
var rectCorners = function(e3) {
  return { tl: { x: e3.x, y: e3.y }, tr: { x: e3.x + e3.width, y: e3.y }, br: { x: e3.x + e3.width, y: e3.y + e3.height }, bl: { x: e3.x, y: e3.y + e3.height } };
};
var createRect = function(e3, t2, r2, n) {
  return { x: e3, y: t2, width: r2, height: n };
};
var getNumericAspectRatioFromString2 = function(e3) {
  if (isEmpty2(e3)) return e3;
  if (/:/.test(e3)) {
    var t2 = e3.split(":"), r2 = t2[0];
    return t2[1] / r2;
  }
  return parseFloat(e3);
};
var getCenteredCropRect3 = function(e3, t2) {
  var r2 = e3.width, n = r2 * t2;
  return n > e3.height && (r2 = (n = e3.height) / t2), { x: 0.5 * (e3.width - r2), y: 0.5 * (e3.height - n), width: r2, height: n };
};
var calculateCanvasSize3 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1, n = e3.height / e3.width, i2 = t2, o2 = 1, a2 = n;
  a2 > i2 && (o2 = (a2 = i2) / n);
  var c2 = Math.max(1 / o2, i2 / a2), l2 = e3.width / (r2 * c2 * o2);
  return { width: l2, height: l2 * t2 };
};
var createVector$13 = function(e3, t2) {
  return { x: e3, y: t2 };
};
var vectorDot$1 = function(e3, t2) {
  return e3.x * t2.x + e3.y * t2.y;
};
var vectorSubtract$1 = function(e3, t2) {
  return createVector$13(e3.x - t2.x, e3.y - t2.y);
};
var vectorDistanceSquared$1 = function(e3, t2) {
  return vectorDot$1(vectorSubtract$1(e3, t2), vectorSubtract$1(e3, t2));
};
var vectorDistance$1 = function(e3, t2) {
  return Math.sqrt(vectorDistanceSquared$1(e3, t2));
};
var getOffsetPointOnEdge3 = function(e3, t2) {
  var r2 = e3, n = t2, i2 = 1.5707963267948966 - t2, o2 = Math.sin(1.5707963267948966), a2 = Math.sin(n), c2 = Math.sin(i2), l2 = Math.cos(i2), u = r2 / o2;
  return createVector$13(l2 * (u * a2), l2 * (u * c2));
};
var getRotatedRectSize3 = function(e3, t2) {
  var r2 = e3.width, n = e3.height, i2 = getOffsetPointOnEdge3(r2, t2), o2 = getOffsetPointOnEdge3(n, t2), a2 = createVector$13(e3.x + Math.abs(i2.x), e3.y - Math.abs(i2.y)), c2 = createVector$13(e3.x + e3.width + Math.abs(o2.y), e3.y + Math.abs(o2.x)), l2 = createVector$13(e3.x - Math.abs(o2.y), e3.y + e3.height - Math.abs(o2.x));
  return { width: vectorDistance$1(a2, c2), height: vectorDistance$1(a2, l2) };
};
var getImageRectZoomFactor3 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0, n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : { x: 0.5, y: 0.5 }, i2 = n.x > 0.5 ? 1 - n.x : n.x, o2 = n.y > 0.5 ? 1 - n.y : n.y, a2 = 2 * i2 * e3.width, c2 = 2 * o2 * e3.height, l2 = getRotatedRectSize3(t2, r2);
  return Math.max(l2.width / a2, l2.height / c2);
};
var getAxisAlignedImageRect = function(e3, t2) {
  var r2 = t2.origin, n = t2.translation, i2 = t2.scale;
  return rectTransform(e3, [["scale", i2], ["translate", n]], r2);
};
var getOffsetPointOnEdge$1 = function(e3, t2) {
  var r2 = e3, n = t2, i2 = 1.5707963267948966 - t2, o2 = Math.sin(1.5707963267948966), a2 = Math.sin(n), c2 = Math.sin(i2), l2 = Math.cos(i2), u = r2 / o2;
  return createVector3(l2 * (u * a2), l2 * (u * c2));
};
var getRotatedRectCorners = function(e3, t2) {
  var r2 = e3.width, n = e3.height, i2 = t2 % (Math.PI / 2), o2 = getOffsetPointOnEdge$1(r2, i2), a2 = getOffsetPointOnEdge$1(n, i2), c2 = rectCorners(e3);
  return { tl: createVector3(c2.tl.x + Math.abs(o2.x), c2.tl.y - Math.abs(o2.y)), tr: createVector3(c2.tr.x + Math.abs(a2.y), c2.tr.y + Math.abs(a2.x)), br: createVector3(c2.br.x - Math.abs(o2.x), c2.br.y + Math.abs(o2.y)), bl: createVector3(c2.bl.x - Math.abs(a2.y), c2.bl.y - Math.abs(a2.x)) };
};
var getAxisAlignedCropRect = function(e3, t2, r2, n) {
  var i2 = { x: e3.x + t2.x, y: e3.y + t2.y }, o2 = getRotatedRectCorners(n, r2), a2 = vectorRotate3(o2.tl, -r2, i2), c2 = vectorRotate3(o2.tr, -r2, i2), l2 = vectorRotate3(o2.br, -r2, i2);
  return createRect(Math.min(a2.x, c2.x, l2.x), Math.min(a2.y, c2.y, l2.y), Math.max(a2.x, c2.x, l2.x) - Math.min(a2.x, c2.x, l2.x), Math.max(a2.y, c2.y, l2.y) - Math.min(a2.y, c2.y, l2.y));
};
var getCropFromView = function(e3, t2, r2) {
  var n = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3], i2 = r2.origin, o2 = r2.translation, a2 = getAxisAlignedImageRect(e3, r2), c2 = 2 * Math.PI + r2.rotation % (2 * Math.PI), l2 = getAxisAlignedCropRect(i2, o2, c2, t2), u = rectCenter(l2), s2 = t2.height / t2.width, d = { x: (u.x - a2.x) / a2.width, y: (u.y - a2.y) / a2.height }, p = d.y > 0.5 ? 1 - d.y : d.y, f2 = 2 * (d.x > 0.5 ? 1 - d.x : d.x) * a2.width, h = 2 * p * a2.height;
  return { center: d, zoom: n ? Math.min(f2 / l2.width, h / l2.height) : Math.min(a2.width / l2.width, a2.height / l2.height), rotation: r2.rotation, aspectRatio: s2, scaleToFit: n };
};
var getCropFromStateRounded = function(e3, t2) {
  var r2 = getCropFromState(e3, t2);
  return { center: { x: roundFloat(r2.center.x), y: roundFloat(r2.center.y) }, rotation: roundFloat(r2.rotation), zoom: roundFloat(r2.zoom), aspectRatio: roundFloat(r2.aspectRatio), flip: _objectSpread({}, t2.flip), scaleToFit: r2.scaleToFit };
};
var getCropFromState = function(e3, t2) {
  var r2 = getCropFromView(e3, t2.rectangle, t2.transforms, t2.limitToImageBounds);
  return { center: { x: r2.center.x, y: r2.center.y }, rotation: r2.rotation, zoom: r2.zoom, aspectRatio: r2.aspectRatio, flip: _objectSpread({}, t2.flip), scaleToFit: r2.scaleToFit };
};
var limitSize = function(e3, t2, r2, n) {
  var i2 = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : "width", o2 = e3.width, a2 = e3.height;
  if (!o2 && !a2) return { width: o2, height: a2 };
  if (o2 = o2 && limit2(o2, t2.width, r2.width), a2 = a2 && limit2(a2, t2.height, r2.height), !n) return { width: o2, height: a2 };
  if (a2) if (o2) "width" === i2 ? a2 = o2 / n : "height" === i2 ? o2 = a2 * n : (a2 * n < t2.width ? a2 = (o2 = t2.width) / n : o2 / n < t2.height && (o2 = (a2 = t2.height) * n), a2 * n > r2.width ? a2 = (o2 = r2.width) / n : o2 / n > r2.height && (o2 = (a2 = r2.height) * n));
  else {
    a2 = limit2(a2 * n, t2.width, r2.width) / n;
  }
  else o2 = limit2(o2 / n, t2.height, r2.height) * n;
  return { width: o2, height: a2 };
};
var dotColorMatrix = function(e3, t2) {
  var r2 = new Array(20);
  return r2[0] = e3[0] * t2[0] + e3[1] * t2[5] + e3[2] * t2[10] + e3[3] * t2[15], r2[1] = e3[0] * t2[1] + e3[1] * t2[6] + e3[2] * t2[11] + e3[3] * t2[16], r2[2] = e3[0] * t2[2] + e3[1] * t2[7] + e3[2] * t2[12] + e3[3] * t2[17], r2[3] = e3[0] * t2[3] + e3[1] * t2[8] + e3[2] * t2[13] + e3[3] * t2[18], r2[4] = e3[0] * t2[4] + e3[1] * t2[9] + e3[2] * t2[14] + e3[3] * t2[19] + e3[4], r2[5] = e3[5] * t2[0] + e3[6] * t2[5] + e3[7] * t2[10] + e3[8] * t2[15], r2[6] = e3[5] * t2[1] + e3[6] * t2[6] + e3[7] * t2[11] + e3[8] * t2[16], r2[7] = e3[5] * t2[2] + e3[6] * t2[7] + e3[7] * t2[12] + e3[8] * t2[17], r2[8] = e3[5] * t2[3] + e3[6] * t2[8] + e3[7] * t2[13] + e3[8] * t2[18], r2[9] = e3[5] * t2[4] + e3[6] * t2[9] + e3[7] * t2[14] + e3[8] * t2[19] + e3[9], r2[10] = e3[10] * t2[0] + e3[11] * t2[5] + e3[12] * t2[10] + e3[13] * t2[15], r2[11] = e3[10] * t2[1] + e3[11] * t2[6] + e3[12] * t2[11] + e3[13] * t2[16], r2[12] = e3[10] * t2[2] + e3[11] * t2[7] + e3[12] * t2[12] + e3[13] * t2[17], r2[13] = e3[10] * t2[3] + e3[11] * t2[8] + e3[12] * t2[13] + e3[13] * t2[18], r2[14] = e3[10] * t2[4] + e3[11] * t2[9] + e3[12] * t2[14] + e3[13] * t2[19] + e3[14], r2[15] = e3[15] * t2[0] + e3[16] * t2[5] + e3[17] * t2[10] + e3[18] * t2[15], r2[16] = e3[15] * t2[1] + e3[16] * t2[6] + e3[17] * t2[11] + e3[18] * t2[16], r2[17] = e3[15] * t2[2] + e3[16] * t2[7] + e3[17] * t2[12] + e3[18] * t2[17], r2[18] = e3[15] * t2[3] + e3[16] * t2[8] + e3[17] * t2[13] + e3[18] * t2[18], r2[19] = e3[15] * t2[4] + e3[16] * t2[9] + e3[17] * t2[14] + e3[18] * t2[19] + e3[19], r2;
};
var toRGBColorArray = function(e3) {
  var t2;
  if (/^#/.test(e3)) {
    if (4 === e3.length) {
      var r2 = e3.split("");
      e3 = "#" + r2[1] + r2[1] + r2[2] + r2[2] + r2[3] + r2[3];
    }
    var n = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e3);
    t2 = [parseInt(n[1], 16), parseInt(n[2], 16), parseInt(n[3], 16)];
  } else if (/^rgb/.test(e3)) {
    (t2 = e3.match(/\d+/g).map(function(e4) {
      return parseInt(e4, 10);
    })).length = 3;
  }
  return t2;
};
var viewCache = [];
var getColorMatrixFromMatrices = function(e3) {
  var t2 = [];
  return forin2(e3, function(e4, r2) {
    return t2.push(r2);
  }), t2.length ? t2.reduce(function(e4, t3) {
    return dotColorMatrix(_toConsumableArray(e4), t3);
  }, t2.shift()) : [];
};
var getImageScalar = function(e3) {
  return e3.crop.draft.transforms ? e3.crop.draft.transforms.scale : e3.crop.transforms.scale;
};
var getMinCropSize = function(e3) {
  var t2 = e3.image.width / e3.image.naturalWidth, r2 = getImageScalar(e3);
  return { width: e3.options.cropMinImageWidth * r2 * t2, height: e3.options.cropMinImageHeight * r2 * t2 };
};
var getMaxCropSize = function(e3) {
  var t2 = getImageScalar(e3);
  return { width: e3.image.width * t2, height: e3.image.height * t2 };
};
var getWidth = function(e3) {
  return e3.options.size ? e3.options.size.width : null;
};
var getHeight = function(e3) {
  return e3.options.size ? e3.options.size.height : null;
};
var getOutputSizeWidth = function(e3) {
  return false === e3.size.width ? getWidth(e3) : e3.size.width;
};
var getOutputSizeHeight = function(e3) {
  return false === e3.size.height ? getHeight(e3) : e3.size.height;
};
var getAspectRatioOptions = function(e3) {
  return e3.options.cropAspectRatioOptions ? e3.options.cropAspectRatioOptions.map(function(e4) {
    var t2 = { aspectRatio: null, width: null, height: null };
    return "number" == typeof e4.value && (t2.aspectRatio = e4.value), "string" == typeof e4.value && (t2.aspectRatio = getNumericAspectRatioFromString2(e4.value)), "object" === _typeof(e4.value) && null !== e4.value && (t2.width = e4.value.width, t2.height = e4.value.height, t2.aspectRatio = t2.height / t2.width), { label: e4.label, value: t2 };
  }) : null;
};
var getCropStageRect = function(e3, t2) {
  t2.aspectRatio || (t2.aspectRatio = e3.image.height / e3.image.width);
  var r2 = getCurrentCropSize2(e3.image, t2, t2.scaleToFit), n = r2.width / r2.height;
  return e3.stage.width < r2.width && (r2.width = e3.stage.width, r2.height = r2.width / n), e3.stage.height < r2.height && (r2.height = e3.stage.height, r2.width = r2.height * n), createRect(0.5 * e3.stage.width - 0.5 * r2.width, 0.5 * e3.stage.height - 0.5 * r2.height, r2.width, r2.height);
};
var getImageStageRect = function(e3) {
  var t2 = e3.image.naturalWidth, r2 = e3.image.naturalHeight, n = r2 / t2;
  return e3.stage.width < t2 && (r2 = n * (t2 = e3.stage.width)), e3.stage.height < r2 && (t2 = (r2 = e3.stage.height) / n), createRect(0.5 * e3.stage.width - 0.5 * t2, 0.5 * e3.stage.height - 0.5 * r2, t2, r2);
};
var queries2 = function(e3) {
  return { GET_SIZE: function() {
    return false !== e3.size.width && false !== e3.size.height ? { width: e3.size.width, height: e3.size.height } : { width: null, height: null };
  }, GET_SIZE_INPUT: function() {
    return { width: e3.size.width, height: e3.size.height };
  }, GET_SIZE_ASPECT_RATIO_LOCK: function() {
    return e3.size.aspectRatioLocked;
  }, IS_ACTIVE_VIEW: function(t2) {
    return e3.activeView === t2;
  }, GET_ACTIVE_VIEW: function() {
    return e3.activeView;
  }, GET_STYLES: function() {
    return Object.keys(e3.options).filter(function(e4) {
      return /^style/.test(e4);
    }).map(function(t2) {
      return { name: t2, value: e3.options[t2] };
    });
  }, GET_FILE: function() {
    return e3.file;
  }, GET_IMAGE: function() {
    return e3.image;
  }, GET_STAGE: function() {
    return _objectSpread({}, e3.stage, e3.stageOffset);
  }, GET_STAGE_RECT: function(t2) {
    var r2, n = e3.options.imagePreviewScaleMode;
    return (r2 = "crop" === n ? t2 ? getCropStageRect(e3, t2) : getImageStageRect(e3) : "image" === n ? getImageStageRect(e3) : _objectSpread({}, e3.stage)).fits = r2.width < e3.stage.width && r2.height < e3.stage.height, r2.mode = n, r2;
  }, GET_IMAGE_STAGE_RECT: function() {
    return getImageStageRect(e3);
  }, GET_ROOT: function() {
    return e3.rootRect;
  }, GET_ROOT_SIZE: function() {
    return { width: e3.rootRect.width, height: e3.rootRect.height };
  }, GET_MIN_IMAGE_SIZE: function() {
    return { width: e3.options.cropMinImageWidth, height: e3.options.cropMinImageHeight };
  }, GET_IMAGE_PREVIEW_SCALE_FACTOR: function() {
    return e3.image.width / e3.image.naturalWidth;
  }, GET_MIN_PREVIEW_IMAGE_SIZE: function() {
    var t2 = e3.image.width / e3.image.naturalWidth;
    return { width: e3.options.cropMinImageWidth * t2, height: e3.options.cropMinImageHeight * t2 };
  }, GET_MIN_CROP_SIZE: function() {
    return getMinCropSize(e3);
  }, GET_MAX_CROP_SIZE: function() {
    return getMaxCropSize(e3);
  }, GET_MIN_PIXEL_CROP_SIZE: function() {
    var t2 = e3.crop.transforms.scale, r2 = getMinCropSize(e3);
    return { width: r2.width / t2, height: r2.height / t2 };
  }, GET_MAX_PIXEL_CROP_SIZE: function() {
    var t2 = e3.crop.transforms.scale, r2 = getMaxCropSize(e3);
    return { width: r2.width / t2, height: r2.height / t2 };
  }, GET_CROP_ASPECT_RATIO_OPTIONS: function() {
    return getAspectRatioOptions(e3);
  }, GET_ACTIVE_CROP_ASPECT_RATIO: function() {
    var t2 = e3.crop.aspectRatio;
    return isString2(t2) ? getNumericAspectRatioFromString2(t2) : t2;
  }, GET_CROP_ASPECT_RATIO: function() {
    var t2 = isString2(e3.options.cropAspectRatio) ? getNumericAspectRatioFromString2(e3.options.cropAspectRatio) : e3.options.cropAspectRatio, r2 = getAspectRatioOptions(e3);
    return !r2 || r2 && !r2.length ? t2 : r2.find(function(e4) {
      return e4.value.aspectRatio === t2;
    }) ? t2 : r2[0].value.aspectRatio;
  }, GET_CROP_RECTANGLE_ASPECT_RATIO: function() {
    var t2 = e3.crop, r2 = t2.rectangle, n = t2.aspectRatio;
    return r2 ? r2.width / r2.height : n;
  }, GET_CROP_RECT: function() {
    return _objectSpread({}, e3.crop.rectangle);
  }, GET_CROP: function(t2, r2) {
    var n = viewCache[t2];
    if (n && n.ts === r2) return n;
    var i2 = getCropView(e3);
    return i2 && (i2.ts = r2, viewCache[t2] = i2), i2;
  }, GET_COLOR_MATRIX: function() {
    return getColorMatrixFromMatrices(e3.colorMatrices);
  }, GET_COLOR_VALUES: function() {
    return _objectSpread({ exposure: e3.options.colorExposure, brightness: e3.options.colorBrightness, contrast: e3.options.colorContrast, saturation: e3.options.colorSaturation }, e3.colorValues);
  }, GET_MARKUP_TOOL_VALUES: function() {
    return _objectSpread({ color: e3.options.markupColor, fontFamily: e3.options.markupFontFamily, fontSize: e3.options.markupFontSize, shapeStyle: e3.options.markupShapeStyle, lineStyle: e3.options.markupLineStyle, lineDecoration: e3.options.markupLineDecoration }, e3.markupToolValues);
  }, GET_PREVIEW_IMAGE_DATA: function() {
    return e3.file.preview;
  }, GET_THUMB_IMAGE_DATA: function() {
    return e3.file.thumb;
  }, GET_FILTER: function() {
    return e3.filter;
  }, GET_UID: function() {
    return e3.uid;
  }, GET_MARKUP_BY_ID: function(t2) {
    return e3.markup.find(function(e4) {
      return e4[1].id === t2;
    });
  }, GET_BACKGROUND_COLOR: function() {
    var t2 = e3.options.outputCanvasBackgroundColor;
    if (!t2) return COLOR_TRANSPARENT;
    if (ColorTable[t2]) return ColorTable[t2];
    var r2 = toRGBColorArray(t2);
    return ColorTable[t2] = r2.concat(1), ColorTable[t2];
  } };
};
var ColorTable = {};
var COLOR_TRANSPARENT = [0, 0, 0, 0];
var getCurrentImageSize = function(e3, t2) {
  var r2 = getOutputSizeWidth(e3), n = getOutputSizeHeight(e3), i2 = t2.width / t2.height;
  return limitSize({ width: r2, height: n }, e3.options.sizeMin, e3.options.sizeMax, i2);
};
var getCurrentCropSize2 = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, r2 = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2], n = t2.zoom, i2 = t2.rotation, o2 = t2.center, a2 = t2.aspectRatio, c2 = calculateCanvasSize3(e3, a2, n); ({ x: 0.5 * c2.width, y: 0.5 * c2.height }); var u = { width: c2.width, height: c2.height}, s2 = n * getImageRectZoomFactor3(e3, getCenteredCropRect3(u, a2), i2, r2 ? o2 : { x: 0.5, y: 0.5 });
  return { widthFloat: c2.width / s2, heightFloat: c2.height / s2, width: Math.round(c2.width / s2), height: Math.round(c2.height / s2) };
};
var canZoom = function(e3, t2) {
  var r2 = rectCenter(t2), n = rectCenter(e3);
  return !vectorEqual(n, r2);
};
var getCropView = function(e3) {
  if (!e3.stage || !e3.image) return null;
  var t2 = e3.crop.draft.rectangle || { free: e3.crop.rectangle, limited: e3.crop.rectangle }, r2 = e3.crop.draft.transforms || e3.crop.transforms, n = r2.origin, i2 = r2.translation, o2 = r2.scale, a2 = r2.interaction, c2 = e3.crop.rotation, l2 = e3.crop.flip, u = !(!e3.crop.draft.rectangle && !e3.crop.draft.transforms), s2 = u || e3.instantUpdate, d = canZoom(t2.limited, e3.stage), p = e3.crop.isDirty || u, f2 = e3.crop.isRotating, h = void 0 === e3.crop.limitToImageBounds || e3.crop.limitToImageBounds, g = { width: e3.image.naturalWidth, height: e3.image.naturalHeight }, m = getColorMatrixFromMatrices(e3.colorMatrices), v = getCropFromState(e3.image, { rectangle: t2.limited, transforms: { origin: n, translation: i2, scale: o2, rotation: c2.main + c2.sub }, flip: l2, limitToImageBounds: e3.crop.limitToImageBounds }), y = { props: v, crop: getCurrentCropSize2(g, v, e3.crop.limitToImageBounds), image: getCurrentImageSize(e3, t2.limited) }, E = y.image, T = y.crop, _ = T.width, R = T.height, w = T.widthFloat / T.heightFloat;
  E.width && E.height ? (_ = E.width, R = E.height) : E.width && !E.height ? (_ = E.width, R = E.width / w) : E.height && !E.width && (R = E.height, _ = E.height * w), y.currentWidth = Math.round(_), y.currentHeight = Math.round(R);
  var A = { x: 0, y: 0 }, I = 0, S = 0;
  if (s2 && a2) {
    if (a2.translation) {
      var C = a2.translation.x - i2.x, O = a2.translation.y - i2.y;
      A.x = 100 * Math.sign(C) * Math.log10(1 + Math.abs(C) / 100), A.y = 100 * Math.sign(O) * Math.log10(1 + Math.abs(O) / 100);
    }
    if (a2.scale) {
      var x = a2.scale - o2;
      I = 0.25 * Math.sign(x) * Math.log10(1 + Math.abs(x) / 0.25);
    }
    if (a2.rotation) {
      var b = a2.rotation - (c2.main + c2.sub);
      S = 0.05 * Math.sign(b) * Math.log10(1 + Math.abs(b) / 0.05);
    }
  }
  var M = {}, L = t2.free, P = rectBounds(L), G = rectBounds(t2.limited);
  return forin2(P, function(e4) {
    var t3 = P[e4] - G[e4];
    M[e4] = G[e4] + 5 * Math.sign(t3) * Math.log10(1 + Math.abs(t3) / 5);
  }), { canRecenter: d, canReset: p, isDraft: s2, isRotating: f2, isLimitedToImageBounds: h, cropRect: { x: M.left, y: M.top, width: M.right - M.left, height: M.bottom - M.top }, origin: n, translation: i2, translationBand: A, scale: o2, scaleBand: I, rotation: c2, rotationBand: S, flip: l2, interaction: a2, cropStatus: y, colorMatrix: m, markup: e3.markup, previewSize: { width: e3.image.width, height: e3.image.height } };
};
var isImage4 = function(e3) {
  return /^image/.test(e3);
};
var MATRICES2 = { 1: function() {
  return [1, 0, 0, 1, 0, 0];
}, 2: function(e3) {
  return [-1, 0, 0, 1, e3, 0];
}, 3: function(e3, t2) {
  return [-1, 0, 0, -1, e3, t2];
}, 4: function(e3, t2) {
  return [1, 0, 0, -1, 0, t2];
}, 5: function() {
  return [0, 1, 1, 0, 0, 0];
}, 6: function(e3, t2) {
  return [0, 1, -1, 0, t2, 0];
}, 7: function(e3, t2) {
  return [0, -1, -1, 0, t2, e3];
}, 8: function(e3) {
  return [0, -1, 1, 0, 0, e3];
} };
var getImageOrientationMatrix2 = function(e3, t2, r2) {
  return -1 === r2 && (r2 = 1), MATRICES2[r2](e3, t2);
};
var canvasRelease2 = function(e3) {
  e3.width = 1, e3.height = 1, e3.getContext("2d").clearRect(0, 0, 1, 1);
};
var isFlipped2 = function(e3) {
  return e3 && (e3.horizontal || e3.vertical);
};
var getBitmap2 = function(e3, t2, r2) {
  if (t2 <= 1 && !isFlipped2(r2)) return e3.width = e3.naturalWidth, e3.height = e3.naturalHeight, e3;
  var n = document.createElement("canvas"), i2 = e3.naturalWidth, o2 = e3.naturalHeight, a2 = t2 >= 5 && t2 <= 8;
  a2 ? (n.width = o2, n.height = i2) : (n.width = i2, n.height = o2);
  var c2 = n.getContext("2d");
  if (t2 && c2.transform.apply(c2, getImageOrientationMatrix2(i2, o2, t2)), isFlipped2(r2)) {
    var l2 = [1, 0, 0, 1, 0, 0];
    (!a2 && r2.horizontal || a2 & r2.vertical) && (l2[0] = -1, l2[4] = i2), (!a2 && r2.vertical || a2 && r2.horizontal) && (l2[3] = -1, l2[5] = o2), c2.transform.apply(c2, l2);
  }
  return c2.drawImage(e3, 0, 0, i2, o2), n;
};
var imageToImageData2 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}, i2 = n.canvasMemoryLimit, o2 = n.background, a2 = void 0 === o2 ? null : o2, c2 = r2.zoom || 1, l2 = getBitmap2(e3, t2, r2.flip), u = { width: l2.width, height: l2.height }, s2 = r2.aspectRatio || u.height / u.width, d = calculateCanvasSize3(u, s2, c2);
  if (i2) {
    var p = d.width * d.height;
    if (p > i2) {
      var f2 = Math.sqrt(i2) / Math.sqrt(p);
      u.width = Math.floor(u.width * f2), u.height = Math.floor(u.height * f2), d = calculateCanvasSize3(u, s2, c2);
    }
  }
  var h = document.createElement("canvas"), g = { x: 0.5 * d.width, y: 0.5 * d.height }, m = { width: d.width, height: d.height}, v = void 0 === r2.scaleToFit || r2.scaleToFit, y = c2 * getImageRectZoomFactor3(u, getCenteredCropRect3(m, s2), r2.rotation, v ? r2.center : { x: 0.5, y: 0.5 });
  h.width = Math.round(d.width / y), h.height = Math.round(d.height / y), g.x /= y, g.y /= y;
  var E = g.x - u.width * (r2.center ? r2.center.x : 0.5), T = g.y - u.height * (r2.center ? r2.center.y : 0.5), _ = h.getContext("2d");
  a2 && (_.fillStyle = a2, _.fillRect(0, 0, h.width, h.height)), _.translate(g.x, g.y), _.rotate(r2.rotation || 0), _.drawImage(l2, E - g.x, T - g.y, u.width, u.height);
  var R = _.getImageData(0, 0, h.width, h.height);
  return canvasRelease2(h), R;
};
var IS_BROWSER$1 = "undefined" != typeof window && void 0 !== window.document;
IS_BROWSER$1 && (HTMLCanvasElement.prototype.toBlob || Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", { value: function(e3, t2, r2) {
  var n = this.toDataURL(t2, r2).split(",")[1];
  setTimeout(function() {
    for (var r3 = atob(n), i2 = r3.length, o2 = new Uint8Array(i2), a2 = 0; a2 < i2; a2++) o2[a2] = r3.charCodeAt(a2);
    e3(new Blob([o2], { type: t2 || "image/png" }));
  });
} }));
var canvasToBlob2 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
  return new Promise(function(n) {
    var i2 = r2 ? r2(e3) : e3;
    Promise.resolve(i2).then(function(e4) {
      e4.toBlob(n, t2.type, t2.quality);
    });
  });
};
var vectorMultiply$1 = function(e3, t2) {
  return createVector$2(e3.x * t2, e3.y * t2);
};
var vectorAdd$1 = function(e3, t2) {
  return createVector$2(e3.x + t2.x, e3.y + t2.y);
};
var vectorNormalize$1 = function(e3) {
  var t2 = Math.sqrt(e3.x * e3.x + e3.y * e3.y);
  return 0 === t2 ? { x: 0, y: 0 } : createVector$2(e3.x / t2, e3.y / t2);
};
var vectorRotate$1 = function(e3, t2, r2) {
  var n = Math.cos(t2), i2 = Math.sin(t2), o2 = createVector$2(e3.x - r2.x, e3.y - r2.y);
  return createVector$2(r2.x + n * o2.x - i2 * o2.y, r2.y + i2 * o2.x + n * o2.y);
};
var createVector$2 = function() {
  return { x: arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0, y: arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0 };
};
var getMarkupValue3 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1, n = arguments.length > 3 ? arguments[3] : void 0;
  return "string" == typeof e3 ? parseFloat(e3) * r2 : "number" == typeof e3 ? e3 * (n ? t2[n] : Math.min(t2.width, t2.height)) : void 0;
};
var getMarkupStyles3 = function(e3, t2, r2) {
  var n = e3.borderStyle || e3.lineStyle || "solid", i2 = e3.backgroundColor || e3.fontColor || "transparent", o2 = e3.borderColor || e3.lineColor || "transparent", a2 = getMarkupValue3(e3.borderWidth || e3.lineWidth, t2, r2);
  return { "stroke-linecap": e3.lineCap || "round", "stroke-linejoin": e3.lineJoin || "round", "stroke-width": a2 || 0, "stroke-dasharray": "string" == typeof n ? "" : n.map(function(e4) {
    return getMarkupValue3(e4, t2, r2);
  }).join(","), stroke: o2, fill: i2, opacity: e3.opacity || 1 };
};
var isDefined4 = function(e3) {
  return null != e3;
};
var getMarkupRect3 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1, n = getMarkupValue3(e3.x, t2, r2, "width") || getMarkupValue3(e3.left, t2, r2, "width"), i2 = getMarkupValue3(e3.y, t2, r2, "height") || getMarkupValue3(e3.top, t2, r2, "height"), o2 = getMarkupValue3(e3.width, t2, r2, "width"), a2 = getMarkupValue3(e3.height, t2, r2, "height"), c2 = getMarkupValue3(e3.right, t2, r2, "width"), l2 = getMarkupValue3(e3.bottom, t2, r2, "height");
  return isDefined4(i2) || (i2 = isDefined4(a2) && isDefined4(l2) ? t2.height - a2 - l2 : l2), isDefined4(n) || (n = isDefined4(o2) && isDefined4(c2) ? t2.width - o2 - c2 : c2), isDefined4(o2) || (o2 = isDefined4(n) && isDefined4(c2) ? t2.width - n - c2 : 0), isDefined4(a2) || (a2 = isDefined4(i2) && isDefined4(l2) ? t2.height - i2 - l2 : 0), { x: n || 0, y: i2 || 0, width: o2 || 0, height: a2 || 0 };
};
var pointsToPathShape3 = function(e3) {
  return e3.map(function(e4, t2) {
    return "".concat(0 === t2 ? "M" : "L", " ").concat(e4.x, " ").concat(e4.y);
  }).join(" ");
};
var setAttributes3 = function(e3, t2) {
  return Object.keys(t2).forEach(function(r2) {
    return e3.setAttribute(r2, t2[r2]);
  });
};
var ns$1 = "http://www.w3.org/2000/svg";
var svg3 = function(e3, t2) {
  var r2 = document.createElementNS(ns$1, e3);
  return t2 && setAttributes3(r2, t2), r2;
};
var updateRect$1 = function(e3) {
  return setAttributes3(e3, _objectSpread({}, e3.rect, e3.styles));
};
var updateEllipse3 = function(e3) {
  var t2 = e3.rect.x + 0.5 * e3.rect.width, r2 = e3.rect.y + 0.5 * e3.rect.height, n = 0.5 * e3.rect.width, i2 = 0.5 * e3.rect.height;
  return setAttributes3(e3, _objectSpread({ cx: t2, cy: r2, rx: n, ry: i2 }, e3.styles));
};
var IMAGE_FIT_STYLE3 = { contain: "xMidYMid meet", cover: "xMidYMid slice" };
var updateImage3 = function(e3, t2) {
  setAttributes3(e3, _objectSpread({}, e3.rect, e3.styles, { preserveAspectRatio: IMAGE_FIT_STYLE3[t2.fit] || "none" }));
};
var TEXT_ANCHOR3 = { left: "start", center: "middle", right: "end" };
var updateText3 = function(e3, t2, r2, n) {
  var i2 = getMarkupValue3(t2.fontSize, r2, n), o2 = t2.fontFamily || "sans-serif", a2 = t2.fontWeight || "normal", c2 = TEXT_ANCHOR3[t2.textAlign] || "start";
  setAttributes3(e3, _objectSpread({}, e3.rect, e3.styles, { "stroke-width": 0, "font-weight": a2, "font-size": i2, "font-family": o2, "text-anchor": c2 })), e3.text !== t2.text && (e3.text = t2.text, e3.textContent = t2.text.length ? t2.text : " ");
};
var updateLine3 = function(e3, t2, r2, n) {
  setAttributes3(e3, _objectSpread({}, e3.rect, e3.styles, { fill: "none" }));
  var i2 = e3.childNodes[0], o2 = e3.childNodes[1], a2 = e3.childNodes[2], c2 = e3.childNodes[3], l2 = e3.rect, u = { x: e3.rect.x + e3.rect.width, y: e3.rect.y + e3.rect.height };
  if (setAttributes3(i2, { x1: l2.x, y1: l2.y, x2: u.x, y2: u.y }), setAttributes3(c2, { x1: l2.x, y1: l2.y, x2: u.x, y2: u.y }), t2.lineDecoration) {
    o2.style.display = "none", a2.style.display = "none";
    var s2 = vectorNormalize$1({ x: u.x - l2.x, y: u.y - l2.y }), d = getMarkupValue3(0.05, r2, n);
    if (-1 !== t2.lineDecoration.indexOf("arrow-begin")) {
      var p = vectorMultiply$1(s2, d), f2 = vectorAdd$1(l2, p), h = vectorRotate$1(l2, 2, f2), g = vectorRotate$1(l2, -2, f2);
      setAttributes3(o2, { style: "display:block;", d: "M".concat(h.x, ",").concat(h.y, " L").concat(l2.x, ",").concat(l2.y, " L").concat(g.x, ",").concat(g.y) });
    }
    if (-1 !== t2.lineDecoration.indexOf("arrow-end")) {
      var m = vectorMultiply$1(s2, -d), v = vectorAdd$1(u, m), y = vectorRotate$1(u, 2, v), E = vectorRotate$1(u, -2, v);
      setAttributes3(a2, { style: "display:block;", d: "M".concat(y.x, ",").concat(y.y, " L").concat(u.x, ",").concat(u.y, " L").concat(E.x, ",").concat(E.y) });
    }
  }
};
var updatePath3 = function(e3, t2, r2, n) {
  setAttributes3(e3, _objectSpread({}, e3.styles, { fill: "none" }));
  var i2 = e3.childNodes[0], o2 = e3.childNodes[1], a2 = pointsToPathShape3(t2.points.map(function(e4) {
    return { x: getMarkupValue3(e4.x, r2, n, "width"), y: getMarkupValue3(e4.y, r2, n, "height") };
  }));
  setAttributes3(i2, { d: a2 }), setAttributes3(o2, { d: a2 });
};
var createShape3 = function(e3) {
  return function(t2) {
    return svg3(e3, { id: t2.id });
  };
};
var createImage3 = function(e3) {
  var t2 = svg3("image", { id: e3.id, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: "0" });
  return t2.onload = function() {
    t2.setAttribute("opacity", e3.opacity || 1);
  }, t2.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", e3.src), t2;
};
var createLine3 = function(e3) {
  var t2 = svg3("g", { id: e3.id, "stroke-linecap": "round", "stroke-linejoin": "round" }), r2 = svg3("line");
  t2.appendChild(r2);
  var n = svg3("path");
  t2.appendChild(n);
  var i2 = svg3("path");
  t2.appendChild(i2);
  var o2 = svg3("line", { style: "stroke-width: 40; stroke-opacity: 0;" });
  return t2.appendChild(o2), t2;
};
var createPath = function(e3) {
  var t2 = svg3("g", { id: e3.id }), r2 = svg3("path");
  t2.appendChild(r2);
  var n = svg3("path", { style: "stroke-width: 40; stroke-opacity: 0;" });
  return t2.appendChild(n), t2;
};
var CREATE_TYPE_ROUTES3 = { image: createImage3, rect: createShape3("rect"), ellipse: createShape3("ellipse"), text: createShape3("text"), path: createPath, line: createLine3 };
var UPDATE_TYPE_ROUTES3 = { rect: updateRect$1, ellipse: updateEllipse3, image: updateImage3, text: updateText3, path: updatePath3, line: updateLine3 };
var createMarkupByType3 = function(e3, t2) {
  return CREATE_TYPE_ROUTES3[e3](t2);
};
var updateMarkupByType3 = function(e3, t2, r2, n, i2) {
  "path" !== t2 && (e3.rect = getMarkupRect3(r2, n, i2)), e3.styles = getMarkupStyles3(r2, n, i2), UPDATE_TYPE_ROUTES3[t2](e3, r2, n, i2);
};
var sortMarkupByZIndex3 = function(e3, t2) {
  return e3[1].zIndex > t2[1].zIndex ? 1 : e3[1].zIndex < t2[1].zIndex ? -1 : 0;
};
var cropSVG2 = function(e3, t2, r2, n) {
  return new Promise(function(i2) {
    var o2 = n.background, a2 = void 0 === o2 ? null : o2, c2 = new FileReader();
    c2.onloadend = function() {
      var e4 = c2.result, n2 = document.createElement("div");
      n2.style.cssText = "position:absolute;pointer-events:none;width:0;height:0;visibility:hidden;", n2.innerHTML = e4;
      var o3 = n2.querySelector("svg");
      document.body.appendChild(n2);
      var l2 = o3.getBBox();
      n2.parentNode.removeChild(n2);
      var u = n2.querySelector("title"), s2 = o3.getAttribute("viewBox") || "", d = o3.getAttribute("width") || "", p = o3.getAttribute("height") || "", f2 = parseFloat(d) || null, h = parseFloat(p) || null, g = (d.match(/[a-z]+/) || [])[0] || "", m = (p.match(/[a-z]+/) || [])[0] || "", v = s2.split(" ").map(parseFloat), y = v.length ? { x: v[0], y: v[1], width: v[2], height: v[3] } : l2, E = null != f2 ? f2 : y.width, T = null != h ? h : y.height;
      o3.style.overflow = "visible", o3.setAttribute("width", E), o3.setAttribute("height", T);
      var _ = "";
      if (r2 && r2.length) {
        var R = { width: E, height: T };
        _ = r2.sort(sortMarkupByZIndex3).reduce(function(e5, t3) {
          var r3 = createMarkupByType3(t3[0], t3[1]);
          return updateMarkupByType3(r3, t3[0], t3[1], R), r3.removeAttribute("id"), 1 === r3.getAttribute("opacity") && r3.removeAttribute("opacity"), e5 + "\n" + r3.outerHTML + "\n";
        }, ""), _ = "\n\n<g>".concat(_.replace(/&nbsp;/g, " "), "</g>\n\n");
      }
      var w = t2.aspectRatio || T / E, A = E, I = A * w, S = void 0 === t2.scaleToFit || t2.scaleToFit, C = getImageRectZoomFactor3({ width: E, height: T }, getCenteredCropRect3({ width: A, height: I }, w), t2.rotation, S ? t2.center : { x: 0.5, y: 0.5 }), O = t2.zoom * C, x = t2.rotation * (180 / Math.PI), b = { x: 0.5 * A, y: 0.5 * I }, M = { x: b.x - E * t2.center.x, y: b.y - T * t2.center.y }, L = ["rotate(".concat(x, " ").concat(b.x, " ").concat(b.y, ")"), "translate(".concat(b.x, " ").concat(b.y, ")"), "scale(".concat(O, ")"), "translate(".concat(-b.x, " ").concat(-b.y, ")"), "translate(".concat(M.x, " ").concat(M.y, ")")], P = ["scale(".concat(t2.flip.horizontal ? -1 : 1, " ").concat(t2.flip.vertical ? -1 : 1, ")"), "translate(".concat(t2.flip.horizontal ? -E : 0, " ").concat(t2.flip.vertical ? -T : 0, ")")], G = '<?xml version="1.0" encoding="UTF-8"?>\n<svg width="'.concat(A).concat(g, '" height="').concat(I).concat(m, '" \nviewBox="0 0 ').concat(A, " ").concat(I, '" ').concat(a2 ? 'style="background:' + a2 + '" ' : "", '\npreserveAspectRatio="xMinYMin"\nxmlns:xlink="http://www.w3.org/1999/xlink"\nxmlns="http://www.w3.org/2000/svg">\n<!-- Generated by PQINA - https://pqina.nl/ -->\n<title>').concat(u ? u.textContent : "", '</title>\n<g transform="').concat(L.join(" "), '">\n<g transform="').concat(P.join(" "), '">\n').concat(o3.outerHTML).concat(_, "\n</g>\n</g>\n</svg>");
      i2(G);
    }, c2.readAsText(e3);
  });
};
var objectToImageData2 = function(e3) {
  var t2;
  try {
    t2 = new ImageData(e3.width, e3.height);
  } catch (r2) {
    t2 = document.createElement("canvas").getContext("2d").createImageData(e3.width, e3.height);
  }
  return t2.data.set(e3.data), t2;
};
var TransformWorker2 = function() {
  var e3 = { resize: function(e4, t3) {
    var r3 = t3.mode, n2 = void 0 === r3 ? "contain" : r3, i3 = t3.upscale, a3 = void 0 !== i3 && i3, u = t3.width, s2 = t3.height, d = t3.matrix;
    if (d = !d || c2(d) ? null : d, !u && !s2) return l2(e4, d);
    null === u ? u = s2 : null === s2 && (s2 = u);
    if ("force" !== n2) {
      var p = u / e4.width, f2 = s2 / e4.height, h = 1;
      if ("cover" === n2 ? h = Math.max(p, f2) : "contain" === n2 && (h = Math.min(p, f2)), h > 1 && false === a3) return l2(e4, d);
      u = e4.width * h, s2 = e4.height * h;
    }
    for (var g = e4.width, m = e4.height, v = Math.round(u), y = Math.round(s2), E = e4.data, T = new Uint8ClampedArray(v * y * 4), _ = g / v, R = m / y, w = Math.ceil(0.5 * _), A = Math.ceil(0.5 * R), I = 0; I < y; I++) for (var S = 0; S < v; S++) {
      for (var C = 4 * (S + I * v), O = 0, x = 0, b = 0, M = 0, L = 0, P = 0, G = 0, k = (I + 0.5) * R, D = Math.floor(I * R); D < (I + 1) * R; D++) for (var U = Math.abs(k - (D + 0.5)) / A, B = (S + 0.5) * _, V = U * U, N = Math.floor(S * _); N < (S + 1) * _; N++) {
        var F = Math.abs(B - (N + 0.5)) / w, z = Math.sqrt(V + F * F);
        if (z >= -1 && z <= 1 && (O = 2 * z * z * z - 3 * z * z + 1) > 0) {
          var W = E[(F = 4 * (N + D * g)) + 3];
          G += O * W, b += O, W < 255 && (O = O * W / 250), M += O * E[F], L += O * E[F + 1], P += O * E[F + 2], x += O;
        }
      }
      T[C] = M / x, T[C + 1] = L / x, T[C + 2] = P / x, T[C + 3] = G / b, d && o2(C, T, d);
    }
    return { data: T, width: v, height: y };
  }, filter: l2 }, t2 = function(t3, r3) {
    var n2 = t3.transforms, i3 = null;
    if (n2.forEach(function(e4) {
      "filter" === e4.type && (i3 = e4);
    }), i3) {
      var o3 = null;
      n2.forEach(function(e4) {
        "resize" === e4.type && (o3 = e4);
      }), o3 && (o3.data.matrix = i3.data, n2 = n2.filter(function(e4) {
        return "filter" !== e4.type;
      }));
    }
    r3((function(t4, r4) {
      return t4.forEach(function(t5) {
        r4 = e3[t5.type](r4, t5.data);
      }), r4;
    })(n2, t3.imageData));
  };
  self.onmessage = function(e4) {
    t2(e4.data.message, function(t3) {
      self.postMessage({ id: e4.data.id, message: t3 }, [t3.data.buffer]);
    });
  };
  var r2 = 1, n = 1, i2 = 1;
  function o2(e4, t3, o3) {
    var a3 = t3[e4] / 255, c3 = t3[e4 + 1] / 255, l3 = t3[e4 + 2] / 255, u = t3[e4 + 3] / 255, s2 = a3 * o3[0] + c3 * o3[1] + l3 * o3[2] + u * o3[3] + o3[4], d = a3 * o3[5] + c3 * o3[6] + l3 * o3[7] + u * o3[8] + o3[9], p = a3 * o3[10] + c3 * o3[11] + l3 * o3[12] + u * o3[13] + o3[14], f2 = a3 * o3[15] + c3 * o3[16] + l3 * o3[17] + u * o3[18] + o3[19], h = Math.max(0, s2 * f2) + r2 * (1 - f2), g = Math.max(0, d * f2) + n * (1 - f2), m = Math.max(0, p * f2) + i2 * (1 - f2);
    t3[e4] = 255 * Math.max(0, Math.min(1, h)), t3[e4 + 1] = 255 * Math.max(0, Math.min(1, g)), t3[e4 + 2] = 255 * Math.max(0, Math.min(1, m));
  }
  var a2 = self.JSON.stringify([1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]);
  function c2(e4) {
    return self.JSON.stringify(e4 || []) === a2;
  }
  function l2(e4, t3) {
    if (!t3 || c2(t3)) return e4;
    for (var o3 = e4.data, a3 = o3.length, l3 = t3[0], u = t3[1], s2 = t3[2], d = t3[3], p = t3[4], f2 = t3[5], h = t3[6], g = t3[7], m = t3[8], v = t3[9], y = t3[10], E = t3[11], T = t3[12], _ = t3[13], R = t3[14], w = t3[15], A = t3[16], I = t3[17], S = t3[18], C = t3[19], O = 0, x = 0, b = 0, M = 0, L = 0, P = 0, G = 0, k = 0, D = 0, U = 0, B = 0, V = 0; O < a3; O += 4) P = (x = o3[O] / 255) * l3 + (b = o3[O + 1] / 255) * u + (M = o3[O + 2] / 255) * s2 + (L = o3[O + 3] / 255) * d + p, G = x * f2 + b * h + M * g + L * m + v, k = x * y + b * E + M * T + L * _ + R, D = x * w + b * A + M * I + L * S + C, U = Math.max(0, P * D) + r2 * (1 - D), B = Math.max(0, G * D) + n * (1 - D), V = Math.max(0, k * D) + i2 * (1 - D), o3[O] = 255 * Math.max(0, Math.min(1, U)), o3[O + 1] = 255 * Math.max(0, Math.min(1, B)), o3[O + 2] = 255 * Math.max(0, Math.min(1, V));
    return e4;
  }
};
var correctOrientation2 = function(e3, t2) {
  if (1165519206 === e3.getUint32(t2 + 4, false)) {
    t2 += 4;
    var r2 = 18761 === e3.getUint16(t2 += 6, false);
    t2 += e3.getUint32(t2 + 4, r2);
    var n = e3.getUint16(t2, r2);
    t2 += 2;
    for (var i2 = 0; i2 < n; i2++) if (274 === e3.getUint16(t2 + 12 * i2, r2)) return e3.setUint16(t2 + 12 * i2 + 8, 1, r2), true;
    return false;
  }
};
var readData2 = function(e3) {
  var t2 = new DataView(e3);
  if (65496 !== t2.getUint16(0)) return null;
  for (var r2, n, i2 = 2, o2 = false; i2 < t2.byteLength; ) {
    if (r2 = t2.getUint16(i2, false), n = t2.getUint16(i2 + 2, false) + 2, !(r2 >= 65504 && r2 <= 65519 || 65534 === r2)) break;
    if (o2 || (o2 = correctOrientation2(t2, i2)), i2 + n > t2.byteLength) break;
    i2 += n;
  }
  return e3.slice(0, i2);
};
var getImageHead2 = function(e3) {
  return new Promise(function(t2) {
    var r2 = new FileReader();
    r2.onload = function() {
      return t2(readData2(r2.result) || null);
    }, r2.readAsArrayBuffer(e3.slice(0, 262144));
  });
};
var getBlobBuilder3 = function() {
  return window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
};
var createBlob3 = function(e3, t2) {
  var r2 = getBlobBuilder3();
  if (r2) {
    var n = new r2();
    return n.append(e3), n.getBlob(t2);
  }
  return new Blob([e3], { type: t2 });
};
var getUniqueId$1 = function() {
  return Math.random().toString(36).substr(2, 9);
};
var createWorker3 = function(e3) {
  var t2 = new Blob(["(", e3.toString(), ")()"], { type: "application/javascript" }), r2 = URL.createObjectURL(t2), n = new Worker(r2), i2 = [];
  return { transfer: function() {
  }, post: function(e4, t3, r3) {
    var o2 = getUniqueId$1();
    i2[o2] = t3, n.onmessage = function(e5) {
      var t4 = i2[e5.data.id];
      t4 && (t4(e5.data.message), delete i2[e5.data.id]);
    }, n.postMessage({ id: o2, message: e4 }, r3);
  }, terminate: function() {
    n.terminate(), URL.revokeObjectURL(r2);
  } };
};
var loadImage4 = function(e3) {
  return new Promise(function(t2, r2) {
    var n = new Image();
    n.onload = function() {
      t2(n);
    }, n.onerror = function(e4) {
      r2(e4);
    }, n.src = e3;
  });
};
var chain2 = function(e3) {
  return e3.reduce(function(e4, t2) {
    return e4.then(function(e5) {
      return t2().then(Array.prototype.concat.bind(e5));
    });
  }, Promise.resolve([]));
};
var canvasApplyMarkup2 = function(e3, t2) {
  return new Promise(function(r2) {
    var n = { width: e3.width, height: e3.height }, i2 = e3.getContext("2d"), o2 = t2.sort(sortMarkupByZIndex3).map(function(e4) {
      return function() {
        return new Promise(function(t3) {
          TYPE_DRAW_ROUTES2[e4[0]](i2, n, e4[1], t3) && t3();
        });
      };
    });
    chain2(o2).then(function() {
      return r2(e3);
    });
  });
};
var applyMarkupStyles2 = function(e3, t2) {
  e3.beginPath(), e3.lineCap = t2["stroke-linecap"], e3.lineJoin = t2["stroke-linejoin"], e3.lineWidth = t2["stroke-width"], t2["stroke-dasharray"].length && e3.setLineDash(t2["stroke-dasharray"].split(",")), e3.fillStyle = t2.fill, e3.strokeStyle = t2.stroke, e3.globalAlpha = t2.opacity || 1;
};
var drawMarkupStyles2 = function(e3) {
  e3.fill(), e3.stroke(), e3.globalAlpha = 1;
};
var drawRect2 = function(e3, t2, r2) {
  var n = getMarkupRect3(r2, t2), i2 = getMarkupStyles3(r2, t2);
  return applyMarkupStyles2(e3, i2), e3.rect(n.x, n.y, n.width, n.height), drawMarkupStyles2(e3), true;
};
var drawEllipse2 = function(e3, t2, r2) {
  var n = getMarkupRect3(r2, t2), i2 = getMarkupStyles3(r2, t2);
  applyMarkupStyles2(e3, i2);
  var o2 = n.x, a2 = n.y, c2 = n.width, l2 = n.height, u = c2 / 2 * 0.5522848, s2 = l2 / 2 * 0.5522848, d = o2 + c2, p = a2 + l2, f2 = o2 + c2 / 2, h = a2 + l2 / 2;
  return e3.moveTo(o2, h), e3.bezierCurveTo(o2, h - s2, f2 - u, a2, f2, a2), e3.bezierCurveTo(f2 + u, a2, d, h - s2, d, h), e3.bezierCurveTo(d, h + s2, f2 + u, p, f2, p), e3.bezierCurveTo(f2 - u, p, o2, h + s2, o2, h), drawMarkupStyles2(e3), true;
};
var drawImage2 = function(e3, t2, r2, n) {
  var i2 = getMarkupRect3(r2, t2), o2 = getMarkupStyles3(r2, t2);
  applyMarkupStyles2(e3, o2);
  var a2 = new Image();
  new URL(r2.src, window.location.href).origin !== window.location.origin && (a2.crossOrigin = ""), a2.onload = function() {
    if ("cover" === r2.fit) {
      var t3 = i2.width / i2.height, c2 = t3 > 1 ? a2.width : a2.height * t3, l2 = t3 > 1 ? a2.width / t3 : a2.height, u = 0.5 * a2.width - 0.5 * c2, s2 = 0.5 * a2.height - 0.5 * l2;
      e3.drawImage(a2, u, s2, c2, l2, i2.x, i2.y, i2.width, i2.height);
    } else if ("contain" === r2.fit) {
      var d = Math.min(i2.width / a2.width, i2.height / a2.height), p = d * a2.width, f2 = d * a2.height, h = i2.x + 0.5 * i2.width - 0.5 * p, g = i2.y + 0.5 * i2.height - 0.5 * f2;
      e3.drawImage(a2, 0, 0, a2.width, a2.height, h, g, p, f2);
    } else e3.drawImage(a2, 0, 0, a2.width, a2.height, i2.x, i2.y, i2.width, i2.height);
    drawMarkupStyles2(e3), n();
  }, a2.src = r2.src;
};
var drawText2 = function(e3, t2, r2) {
  var n = getMarkupRect3(r2, t2), i2 = getMarkupStyles3(r2, t2);
  applyMarkupStyles2(e3, i2);
  var o2 = getMarkupValue3(r2.fontSize, t2), a2 = r2.fontFamily || "sans-serif", c2 = r2.fontWeight || "normal", l2 = r2.textAlign || "left";
  return e3.font = "".concat(c2, " ").concat(o2, "px ").concat(a2), e3.textAlign = l2, e3.fillText(r2.text, n.x, n.y), drawMarkupStyles2(e3), true;
};
var drawPath2 = function(e3, t2, r2) {
  var n = getMarkupStyles3(r2, t2);
  applyMarkupStyles2(e3, n), e3.beginPath();
  var i2 = r2.points.map(function(e4) {
    return { x: getMarkupValue3(e4.x, t2, 1, "width"), y: getMarkupValue3(e4.y, t2, 1, "height") };
  });
  e3.moveTo(i2[0].x, i2[0].y);
  for (var o2 = i2.length, a2 = 1; a2 < o2; a2++) e3.lineTo(i2[a2].x, i2[a2].y);
  return drawMarkupStyles2(e3), true;
};
var drawLine2 = function(e3, t2, r2) {
  var n = getMarkupRect3(r2, t2), i2 = getMarkupStyles3(r2, t2);
  applyMarkupStyles2(e3, i2), e3.beginPath();
  var o2 = { x: n.x, y: n.y }, a2 = { x: n.x + n.width, y: n.y + n.height };
  e3.moveTo(o2.x, o2.y), e3.lineTo(a2.x, a2.y);
  var c2 = vectorNormalize$1({ x: a2.x - o2.x, y: a2.y - o2.y }), l2 = 0.04 * Math.min(t2.width, t2.height);
  if (-1 !== r2.lineDecoration.indexOf("arrow-begin")) {
    var u = vectorMultiply$1(c2, l2), s2 = vectorAdd$1(o2, u), d = vectorRotate$1(o2, 2, s2), p = vectorRotate$1(o2, -2, s2);
    e3.moveTo(d.x, d.y), e3.lineTo(o2.x, o2.y), e3.lineTo(p.x, p.y);
  }
  if (-1 !== r2.lineDecoration.indexOf("arrow-end")) {
    var f2 = vectorMultiply$1(c2, -l2), h = vectorAdd$1(a2, f2), g = vectorRotate$1(a2, 2, h), m = vectorRotate$1(a2, -2, h);
    e3.moveTo(g.x, g.y), e3.lineTo(a2.x, a2.y), e3.lineTo(m.x, m.y);
  }
  return drawMarkupStyles2(e3), true;
};
var TYPE_DRAW_ROUTES2 = { rect: drawRect2, ellipse: drawEllipse2, image: drawImage2, text: drawText2, line: drawLine2, path: drawPath2 };
var imageDataToCanvas2 = function(e3) {
  var t2 = document.createElement("canvas");
  return t2.width = e3.width, t2.height = e3.height, t2.getContext("2d").putImageData(e3, 0, 0), t2;
};
var transformImage2 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  return new Promise(function(n, i2) {
    if (!e3 || !isImage4(e3.type)) return i2({ status: "not an image file", file: e3 });
    var o2 = r2.stripImageHead, a2 = r2.beforeCreateBlob, c2 = r2.afterCreateBlob, l2 = r2.canvasMemoryLimit, u = t2.crop, s2 = t2.size, d = t2.filter, p = t2.markup, f2 = t2.output, h = t2.image && t2.image.orientation ? Math.max(1, Math.min(8, t2.image.orientation)) : null, g = f2 && f2.quality, m = null === g ? null : g / 100, v = f2 && f2.type || null, y = f2 && f2.background || null, E = [];
    !s2 || "number" != typeof s2.width && "number" != typeof s2.height || E.push({ type: "resize", data: s2 }), d && 20 === d.length && E.push({ type: "filter", data: d });
    var T = function(e4) {
      var t3 = c2 ? c2(e4) : e4;
      Promise.resolve(t3).then(n);
    }, _ = function(t3, r3) {
      var n2 = imageDataToCanvas2(t3), c3 = p.length ? canvasApplyMarkup2(n2, p) : n2;
      Promise.resolve(c3).then(function(t4) {
        canvasToBlob2(t4, r3, a2).then(function(r4) {
          if (canvasRelease2(t4), o2) return T(r4);
          getImageHead2(e3).then(function(e4) {
            null !== e4 && (r4 = new Blob([e4, r4.slice(20)], { type: r4.type })), T(r4);
          });
        }).catch(i2);
      });
    };
    if (/svg/.test(e3.type) && null === v) return cropSVG2(e3, u, p, { background: y }).then(function(e4) {
      n(createBlob3(e4, "image/svg+xml"));
    });
    var R = URL.createObjectURL(e3);
    loadImage4(R).then(function(t3) {
      URL.revokeObjectURL(R);
      var r3 = imageToImageData2(t3, h, u, { canvasMemoryLimit: l2, background: y }), n2 = { quality: m, type: v || e3.type };
      if (!E.length) return _(r3, n2);
      var i3 = createWorker3(TransformWorker2);
      i3.post({ transforms: E, imageData: r3 }, function(e4) {
        _(objectToImageData2(e4), n2), i3.terminate();
      }, [r3.data.buffer]);
    }).catch(i2);
  });
};
var readExif = function(e3, t2) {
  if (1165519206 !== e3.getUint32(t2 += 2, false)) return -1;
  var r2 = 18761 === e3.getUint16(t2 += 6, false);
  t2 += e3.getUint32(t2 + 4, r2);
  var n = e3.getUint16(t2, r2);
  t2 += 2;
  for (var i2 = 0; i2 < n; i2++) if (274 === e3.getUint16(t2 + 12 * i2, r2)) return e3.getUint16(t2 + 12 * i2 + 8, r2);
};
var readData$1 = function(e3) {
  var t2 = new DataView(e3);
  if (65496 != t2.getUint16(0, false)) return null;
  for (var r2, n = t2.byteLength, i2 = 2; i2 < n; ) {
    if (t2.getUint16(i2 + 2, false) <= 8) return -1;
    if (r2 = t2.getUint16(i2, false), i2 += 2, 65505 === r2) return readExif(t2, i2);
    if (65280 != (65280 & r2)) return null;
    i2 += t2.getUint16(i2, false);
  }
};
var getImageOrientation2 = function(e3) {
  return new Promise(function(t2) {
    var r2 = new FileReader();
    r2.onload = function() {
      return t2(readData$1(r2.result) || -1);
    }, r2.readAsArrayBuffer(e3.slice(0, 262144));
  });
};
var Direction = { HORIZONTAL: 1, VERTICAL: 2 };
var getImageTransformsFromCrop = function(e3, t2, r2) {
  var n = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3], i2 = e3.center, o2 = e3.zoom, a2 = e3.aspectRatio, c2 = rectCenter(t2), l2 = { x: c2.x - r2.width * i2.x, y: c2.y - r2.height * i2.y }, u = 2 * Math.PI + e3.rotation % (2 * Math.PI), s2 = o2 * getImageRectZoomFactor3(r2, getCenteredCropRect3(t2, a2 || r2.height / r2.width), u, n ? i2 : { x: 0.5, y: 0.5 });
  return { origin: { x: i2.x * r2.width, y: i2.y * r2.height }, translation: l2, scale: s2, rotation: e3.rotation };
};
var copyImageTransforms = function(e3) {
  return { origin: _objectSpread({}, e3.origin), translation: _objectSpread({}, e3.translation), rotation: e3.rotation, scale: e3.scale };
};
var limitImageTransformsToCropRect = function(e3, t2, r2, n) {
  var i2 = r2.translation, o2 = r2.scale, a2 = r2.rotation, c2 = r2.origin, l2 = { origin: _objectSpread({}, c2), translation: _objectSpread({}, i2), scale: o2, rotation: 2 * Math.PI + a2 % (2 * Math.PI) }, u = e3.height / e3.width, s2 = getAxisAlignedCropRect(c2, i2, l2.rotation, t2), d = rectCenter(s2), p = rectBounds(s2), f2 = getAxisAlignedImageRect(e3, r2), h = rectCenter(f2), g = { x: f2.x, y: f2.y }, m = { x: h.x, y: h.y }, v = d.x, y = d.y, E = { x: g.x, y: g.y, width: f2.width, height: f2.height };
  if (!rectFitsInRect(s2, f2)) {
    if ("moving" === n) {
      E.y > s2.y ? E.y = s2.y : E.y + E.height < p.bottom && (E.y = p.bottom - E.height), E.x > s2.x ? E.x = s2.x : E.x + E.width < p.right && (E.x = p.right - E.width);
      var T = getAxisAlignedImageRect(e3, _objectSpread({}, r2, { scale: l2.scale })), _ = rectCenter(T);
      m.x = _.x, m.y = _.y, g.x = T.x, g.y = T.y, E.x = m.x - 0.5 * E.width, E.y = m.y - 0.5 * E.height, E.y > s2.y ? E.y = s2.y : E.y + E.height < p.bottom && (E.y = p.bottom - E.height), E.x > s2.x ? E.x = s2.x : E.x + E.width < p.right && (E.x = p.right - E.width);
      var R = { x: E.x - g.x, y: E.y - g.y }, w = { x: R.x * Math.cos(l2.rotation) - R.y * Math.sin(l2.rotation), y: R.x * Math.sin(l2.rotation) + R.y * Math.cos(l2.rotation) };
      l2.translation.x += w.x, l2.translation.y += w.y;
    } else if ("resizing" === n) {
      f2.width < s2.width && (E.width = s2.width, E.height = E.width * u, E.height < s2.height && (E.height = s2.height, E.width = E.height / u)), f2.height < s2.height && (E.height = s2.height, E.width = E.height / u, E.width < s2.width && (E.width = s2.width, E.height = E.width * u)), E.x = m.x - 0.5 * E.width, E.y = m.y - 0.5 * E.height, E.y > s2.y ? E.y = s2.y : E.y + E.height < p.bottom && (E.y = p.bottom - E.height), E.x > s2.x ? E.x = s2.x : E.x + E.width < p.right && (E.x = p.right - E.width), l2.scale = getImageRectZoomFactor3(e3, t2, l2.rotation, { x: (v - E.x) / E.width, y: (y - E.y) / E.height });
      var A = getAxisAlignedImageRect(e3, _objectSpread({}, r2, { scale: l2.scale })), I = rectCenter(A);
      m.x = I.x, m.y = I.y, g.x = A.x, g.y = A.y, E.x = m.x - 0.5 * E.width, E.y = m.y - 0.5 * E.height, E.y > s2.y ? E.y = s2.y : E.y + E.height < p.bottom && (E.y = p.bottom - E.height), E.x > s2.x ? E.x = s2.x : E.x + E.width < p.right && (E.x = p.right - E.width);
      var S = { x: E.x - g.x, y: E.y - g.y }, C = { x: S.x * Math.cos(l2.rotation) - S.y * Math.sin(l2.rotation), y: S.x * Math.sin(l2.rotation) + S.y * Math.cos(l2.rotation) };
      l2.translation.x += C.x, l2.translation.y += C.y;
    } else if ("rotating" === n) {
      var O = false;
      if (E.y > s2.y) {
        var x = E.y - s2.y;
        E.y = s2.y, E.height += 2 * x, O = true;
      }
      if (E.y + E.height < p.bottom) {
        var b = p.bottom - (E.y + E.height);
        E.y = p.bottom - E.height, E.height += 2 * b, O = true;
      }
      if (E.x > s2.x) {
        var M = E.x - s2.x;
        E.x = s2.x, E.width += 2 * M, O = true;
      }
      if (E.x + E.width < p.right) {
        var L = p.right - (E.x + E.width);
        E.x = p.right - E.width, E.width += 2 * L, O = true;
      }
      O && (l2.scale = getImageRectZoomFactor3(e3, t2, l2.rotation, { x: (v - f2.x) / f2.width, y: (y - f2.y) / f2.height }));
    }
  }
  return _objectSpread({}, l2, { rotation: r2.rotation });
};
var getTransformOrigin = function(e3, t2, r2) {
  var n = r2.origin, i2 = r2.translation, o2 = r2.scale, a2 = 2 * Math.PI + r2.rotation % (2 * Math.PI), c2 = { x: n.x + i2.x, y: n.y + i2.y }, l2 = getAxisAlignedCropRect(n, i2, a2, t2), u = getAxisAlignedImageRect(e3, r2), s2 = rectCorners(u), d = rectCenter(u), p = vectorRotate3(s2.tl, a2, c2), f2 = vectorRotate3(s2.br, a2, c2), h = p.x + 0.5 * (f2.x - p.x), g = p.y + 0.5 * (f2.y - p.y), m = rectTranslate(u, { x: h - d.x, y: g - d.y }), v = rectTranslate(l2, { x: h - d.x, y: g - d.y }), y = rectCenter(v), E = { x: m.x, y: m.y }, T = m.width, _ = m.height, R = (y.x - E.x) / T, w = (y.y - E.y) / _, A = { x: R * e3.width, y: w * e3.height }, I = 1 - o2, S = A.x * I, C = A.y * I, O = { x: E.x + T * R, y: E.y + _ * w }, x = vectorRotate3(E, a2, { x: E.x + 0.5 * T, y: E.y + 0.5 * _ }), b = vectorRotate3(E, a2, O), M = x.x - b.x, L = x.y - b.y;
  return { origin: roundVector(A), translation: roundVector({ x: E.x - S + M, y: E.y - C + L }) };
};
var EdgeMap = { n: function(e3) {
  return { x: e3.x + 0.5 * e3.width, y: e3.y };
}, e: function(e3) {
  return { x: e3.x + e3.width, y: e3.y + 0.5 * e3.height };
}, s: function(e3) {
  return { x: e3.x + 0.5 * e3.width, y: e3.y + e3.height };
}, w: function(e3) {
  return { x: e3.x, y: e3.y + 0.5 * e3.height };
} };
var getEdgeCenterCoordinates = function(e3, t2) {
  return EdgeMap[e3](t2);
};
var getImageTransformsFromRect = function(e3, t2, r2) {
  var n = r2.origin, i2 = r2.translation, o2 = 2 * Math.PI + r2.rotation % (2 * Math.PI), a2 = getAxisAlignedImageRect(e3, r2), c2 = { x: n.x + i2.x, y: n.y + i2.y }, l2 = getAxisAlignedCropRect(n, i2, o2, t2), u = rectBounds(l2), s2 = rectBounds(a2), d = a2;
  if (u.top < s2.top || u.right > s2.right || u.bottom > s2.bottom || u.left < s2.left) {
    var p = _objectSpread({}, s2);
    if (u.top <= p.top) {
      var f2 = p.bottom - p.top, h = p.right - p.left, g = Math.max(1, l2.height / f2), m = f2 * g, v = h * g - h;
      p.bottom = u.top + m, p.top = u.top, p.left -= 0.5 * v, p.right += 0.5 * v;
    }
    if (u.bottom >= p.bottom) {
      var y = p.bottom - p.top, E = p.right - p.left, T = Math.max(1, l2.height / y), _ = y * T, R = E * T - E;
      p.bottom = u.bottom, p.top = u.bottom - _, p.left -= 0.5 * R, p.right += 0.5 * R;
    }
    if (u.left <= p.left) {
      var w = p.bottom - p.top, A = p.right - p.left, I = Math.max(1, l2.width / A), S = A * I, C = w * I - w;
      p.right = u.left + S, p.left = u.left, p.top -= 0.5 * C, p.bottom += 0.5 * C;
    }
    if (u.right >= p.right) {
      var O = p.bottom - p.top, x = p.right - p.left, b = Math.max(1, l2.width / x), M = x * b, L = O * b - O;
      p.right = u.right, p.left = u.right - M, p.top -= 0.5 * L, p.bottom += 0.5 * L;
    }
    d = createRect(p.left, p.top, p.right - p.left, p.bottom - p.top);
  }
  var P = rectCorners(d), G = rectCenter(d), k = vectorRotate3(P.tl, o2, c2), D = vectorRotate3(P.br, o2, c2), U = k.x + 0.5 * (D.x - k.x), B = k.y + 0.5 * (D.y - k.y), V = rectTranslate(d, { x: U - G.x, y: B - G.y }), N = rectTranslate(l2, { x: U - G.x, y: B - G.y }), F = rectCenter(N), z = { x: V.x, y: V.y }, W = V.width, q = V.height, H = (F.x - z.x) / W, Y = (F.y - z.y) / q, j = W / e3.width, X2 = { x: H * e3.width, y: Y * e3.height }, Z = 1 - j, $ = X2.x * Z, K = X2.y * Z, Q = { x: z.x + W * H, y: z.y + q * Y }, J = vectorRotate3(z, o2, { x: z.x + 0.5 * W, y: z.y + 0.5 * q }), ee = vectorRotate3(z, o2, Q), te = J.x - ee.x, re = J.y - ee.y;
  return { origin: X2, translation: { x: z.x - $ + te, y: z.y - K + re }, scale: j, rotation: r2.rotation };
};
var getEdgeTargetRect = function(e3, t2, r2, n, i2, o2, a2, c2, l2) {
  var u = o2.left, s2 = o2.right, d = o2.top, p = o2.bottom, f2 = s2 - u, h = p - d, g = i2.left, m = i2.right, v = i2.top, y = i2.bottom;
  if (r2 === Direction.VERTICAL) {
    if (v = e3.y > 0 ? n.y : Math.min(n.y, Math.max(t2.y, d)), y = e3.y > 0 ? Math.max(n.y, Math.min(t2.y, p)) : n.y, a2) {
      var E = (y - v) / a2;
      g = n.x - 0.5 * E, m = n.x + 0.5 * E;
    }
  } else if (g = e3.x > 0 ? n.x : Math.min(n.x, Math.max(t2.x, u)), m = e3.x > 0 ? Math.max(n.x, Math.min(t2.x, s2)) : n.x, a2) {
    var T = (m - g) * a2;
    v = n.y - 0.5 * T, y = n.y + 0.5 * T;
  }
  var _, R, w, A, I = c2.width, S = c2.height;
  if (r2 === Direction.VERTICAL ? (_ = n.x - 0.5 * I, R = n.x + 0.5 * I, e3.y < 0 ? (w = n.y - S, A = n.y) : e3.y > 0 && (w = n.y, A = n.y + S)) : (w = n.y - 0.5 * S, A = n.y + 0.5 * S, e3.x < 0 ? (_ = n.x - I, R = n.x) : e3.x > 0 && (_ = n.x, R = n.x + I)), a2) if (r2 === Direction.VERTICAL) {
    var C = Math.min((y - v) / a2, f2), O = C * a2;
    g < u && (m = (g = u) + C), m > s2 && (g = (m = s2) - C), n.x = g + 0.5 * C, e3.y < 0 ? v = n.y - O : e3.y > 0 && (y = n.y + O);
  } else {
    var x = Math.min((m - g) * a2, h), b = x / a2;
    v < d && (y = (v = d) + x), y > p && (v = (y = p) - x), n.y = v + 0.5 * x, e3.x < 0 ? g = n.x - b : e3.x > 0 && (m = n.x + b);
  }
  var M = rectFromBounds({ top: v, right: m, bottom: y, left: g }), L = function() {
    var t3 = I * a2;
    r2 === Direction.HORIZONTAL ? (v = n.y - 0.5 * t3, y = n.y + 0.5 * t3) : e3.y < 0 ? (y = n.y, v = y - t3) : e3.y > 0 && (v = n.y, y = v + t3);
  }, P = function() {
    var t3 = S / a2;
    r2 === Direction.VERTICAL ? (g = n.x - 0.5 * t3, m = n.x + 0.5 * t3) : e3.x < 0 ? (m = n.x, g = m - t3) : e3.x > 0 && (g = n.x, m = g + t3);
  };
  m < R && (m = R, g = R - I, a2 && L()), g > _ && (g = _, m = _ + I, a2 && L()), v > w && (v = w, y = w + S, a2 && P()), y < A && (y = A, v = A - S, a2 && P());
  var G = l2.width, k = l2.height;
  if (a2 && (a2 < 1 ? G = k / a2 : k = G * a2), m - g > G && (e3.x < 0 ? g = n.x - G : m = n.x + G), y - v > k && (e3.y < 0 ? v = n.y - k : y = n.y + k), m - g == 0 && (e3.x > 0 ? m = n.x + 2 : g = n.x - 2), y - v == 0 && (e3.y > 0 ? y = n.y + 2 : v = n.y - 2), Math.round(g) < u || Math.round(m) > s2 || Math.round(v) < d || Math.round(y) > p) {
    var D = p - d, U = s2 - u;
    if (g < u) {
      g = u;
      var B = Math.min(m - g, U);
      m = g + B;
    }
    if (m > s2) {
      m = s2;
      var V = Math.min(m - g, U);
      g = m - V;
    }
    if (v < d) {
      v = d;
      var N = Math.min(y - v, D);
      y = v + N;
    }
    if (y > p) {
      y = p;
      var F = Math.min(y - v, D);
      v = y - F;
    }
    M = rectFromBounds({ top: v, right: m, bottom: y, left: g });
  }
  return { free: M, limited: rectFromBounds({ top: v, right: m, bottom: y, left: g }) };
};
var CornerMap = { nw: function(e3) {
  return { x: e3.x, y: e3.y };
}, ne: function(e3) {
  return { x: e3.x + e3.width, y: e3.y };
}, se: function(e3) {
  return { x: e3.x + e3.width, y: e3.y + e3.height };
}, sw: function(e3) {
  return { x: e3.x, y: e3.y + e3.height };
} };
var getCornerCoordinates = function(e3, t2) {
  return CornerMap[e3](t2);
};
var getCornerTargetRect = function(e3, t2, r2, n, i2, o2, a2) {
  var c2 = rectBounds(n), l2 = c2.left, u = c2.right, s2 = c2.top, d = c2.bottom, p = vectorLimit({ x: t2.x, y: t2.y }, n), f2 = e3.x > 0 ? r2.x : Math.min(p.x, r2.x), h = e3.x > 0 ? Math.max(r2.x, p.x) : r2.x, g = e3.y > 0 ? r2.y : Math.min(p.y, r2.y), m = e3.y > 0 ? Math.max(r2.y, p.y) : r2.y;
  if (i2) {
    var v = p.x - r2.x;
    e3.x > 0 ? h = Math.max(r2.x, r2.x + e3.x * v) : f2 = Math.min(r2.x, r2.x - e3.x * v), e3.y > 0 ? m = Math.max(r2.y, r2.y + e3.x * v * i2) : g = Math.min(r2.y, r2.y - e3.x * v * i2);
  }
  var y = rectFromBounds({ top: g, right: h, bottom: m, left: f2 });
  rectFromBounds({ top: g, right: h, bottom: m, left: f2 });
  if (o2.width && o2.height) {
    var E = o2.width, T = o2.height;
    i2 && (1 === i2 ? T = E = Math.max(E, T) : E < T ? E = T / i2 : E > T ? T = E * i2 : E = T / i2), h - f2 < E && (e3.x > 0 ? h = r2.x + E : f2 = r2.x - E), m - g < T && (e3.y > 0 ? m = r2.y + T : g = r2.y - T);
    var _ = a2.width, R = a2.height;
    i2 && (i2 < 1 ? _ = R / i2 : R = _ * i2), h - f2 > _ && (e3.x < 0 ? f2 = r2.x - _ : h = r2.x + _), m - g > R && (e3.y < 0 ? g = r2.y - R : m = r2.y + R);
  }
  if (h - f2 == 0 && (e3.x > 0 ? h = r2.x + 2 : f2 = r2.x - 2), m - g == 0 && (e3.y > 0 ? m = r2.y + 2 : g = r2.y - 2), Math.round(f2) < l2 || Math.round(h) > u || Math.round(g) < s2 || Math.round(m) > d) {
    var w = d - s2, A = u - l2;
    if (f2 < l2) {
      f2 = l2;
      var I = Math.min(h - f2, A);
      h = f2 + I, i2 && (e3.y > 0 && (m = r2.y + I * i2), e3.y < 0 && (g = r2.y - I * i2));
    }
    if (h > u) {
      h = u;
      var S = Math.min(h - f2, A);
      f2 = h - S, i2 && (e3.y > 0 && (m = r2.y + S * i2), e3.y < 0 && (g = r2.y - S * i2));
    }
    if (g < s2) {
      g = s2;
      var C = Math.min(m - g, w);
      m = g + C, i2 && (e3.x > 0 && (h = r2.x + C / i2), e3.x < 0 && (f2 = r2.x - C / i2));
    }
    if (m > d) {
      m = d;
      var O = Math.min(m - g, w);
      g = m - O, i2 && (e3.x > 0 && (h = r2.x + O / i2), e3.x < 0 && (f2 = r2.x - O / i2));
    }
    y = rectFromBounds({ top: g, right: h, bottom: m, left: f2 });
  }
  return { free: y, limited: rectFromBounds({ top: g, right: h, bottom: m, left: f2 }) };
};
var getTargetRect = function(e3, t2, r2) {
  var n = rectClone(e3);
  return n.width = Math.min(n.height, n.width), n.height = n.width, n.height = n.width * t2, n.height < r2.height && (n.height = r2.height, n.width = n.height / t2), n.width < r2.width && (n.width = r2.width, n.height = n.width * t2), n;
};
var TURN = Math.PI / 2;
var PI_QUARTER = Math.PI / 4;
var splitRotation = function(e3) {
  var t2 = roundFloat(PI_QUARTER), r2 = roundFloat(TURN), n = e3 / r2, i2 = Math.floor(n) * r2, o2 = e3 - i2;
  return o2 > t2 && (o2 -= r2, i2 += r2), { main: i2, sub: o2 };
};
var getImageSize4 = function(e3) {
  return new Promise(function(t2, r2) {
    var n = new Image();
    n.src = URL.createObjectURL(e3), n.onerror = function(e4) {
      clearInterval(i2), r2(e4);
    };
    var i2 = setInterval(function() {
      n.naturalWidth && n.naturalHeight && (clearInterval(i2), URL.revokeObjectURL(n.src), t2({ width: n.naturalWidth, height: n.naturalHeight }));
    }, 1);
  });
};
var scaleImageSize = function(e3, t2) {
  var r2 = { width: e3.width, height: e3.height };
  if (e3.width > t2.width || e3.height > t2.height) {
    var n = e3.height / e3.width, i2 = t2.width / e3.width, o2 = t2.height / e3.height;
    i2 < o2 ? (r2.width = e3.width * i2, r2.height = r2.width * n) : (r2.height = e3.height * o2, r2.width = r2.height / n);
  }
  return r2;
};
var leftPad2 = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
  return (t2 + e3).slice(-t2.length);
};
var getDateString2 = function() {
  var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : /* @__PURE__ */ new Date();
  return "".concat(e3.getFullYear(), "-").concat(leftPad2(e3.getMonth() + 1, "00"), "-").concat(leftPad2(e3.getDate(), "00"), "_").concat(leftPad2(e3.getHours(), "00"), "-").concat(leftPad2(e3.getMinutes(), "00"), "-").concat(leftPad2(e3.getSeconds(), "00"));
};
var getBaseCropInstructions = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}, i2 = e3("GET_CROP_ASPECT_RATIO"), o2 = { center: { x: 0.5, y: 0.5 }, flip: { horizontal: false, vertical: false }, zoom: 1, rotation: 0, aspectRatio: null };
  r2 ? Object.assign(o2, r2) : t2.options.crop ? Object.assign(o2, t2.options.crop) : o2.aspectRatio = i2;
  var a2 = n.width, c2 = n.height;
  if (a2 && c2) o2.aspectRatio = c2 / a2;
  else if (t2.instructions.size) {
    var l2 = t2.instructions.size, u = l2.width, s2 = l2.height;
    u && s2 && (o2.aspectRatio = s2 / u);
  }
  return o2;
};
var capitalizeFirstLetter = function(e3) {
  return e3.charAt(0).toUpperCase() + e3.slice(1);
};
var getExtensionFromFilename2 = function(e3) {
  return e3.split(".").pop();
};
var guesstimateExtension2 = function(e3) {
  if ("string" != typeof e3) return "";
  var t2 = e3.split("/").pop();
  return /svg/.test(t2) ? "svg" : /zip|compressed/.test(t2) ? "zip" : /plain/.test(t2) ? "txt" : /msword/.test(t2) ? "doc" : /[a-z]+/.test(t2) ? "jpeg" === t2 ? "jpg" : t2 : "";
};
var getFileFromBlob2 = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null, n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null, i2 = "string" == typeof r2 ? e3.slice(0, e3.size, r2) : e3.slice(0, e3.size, e3.type);
  return i2.lastModifiedDate = /* @__PURE__ */ new Date(), isString2(t2) || (t2 = getDateString2()), t2 && null === n && getExtensionFromFilename2(t2) ? i2.name = t2 : (n = n || guesstimateExtension2(i2.type), i2.name = t2 + (n ? "." + n : "")), i2;
};
var getFilenameWithoutExtension3 = function(e3) {
  return e3.substr(0, e3.lastIndexOf(".")) || e3;
};
var ExtensionMap2 = { jpeg: "jpg", "svg+xml": "svg" };
var renameFileToMatchMimeType2 = function(e3, t2) {
  var r2 = getFilenameWithoutExtension3(e3), n = t2.split("/")[1], i2 = ExtensionMap2[n] || n;
  return "".concat(r2, ".").concat(i2);
};
var getValidOutputMimeType2 = function(e3) {
  return /jpeg|png|svg\+xml/.test(e3) ? e3 : "image/jpeg";
};
var isColorMatrix = function(e3) {
  return Array.isArray(e3) && 20 === e3.length;
};
var MARKUP_RECT3 = ["x", "y", "left", "top", "right", "bottom", "width", "height"];
var toOptionalFraction3 = function(e3) {
  return "string" == typeof e3 && /%/.test(e3) ? parseFloat(e3) / 100 : e3;
};
var getUniqueId$2 = function() {
  return Math.random().toString(36).substr(2, 9);
};
var prepareMarkup3 = function(e3) {
  var t2 = _slicedToArray(e3, 2), r2 = t2[0], n = t2[1], i2 = false !== n.allowSelect, o2 = false !== n.allowMove, a2 = false !== n.allowResize, c2 = false !== n.allowInput, l2 = false !== n.allowDestroy, u = void 0 === n.allowEdit || n.allowEdit;
  (true === n.allowResize || true === n.allowMove || true === n.allowInput || n.allowEdit) && (i2 = true), false === n.allowMove && (a2 = false), true === n.allowResize && (o2 = true);
  var s2 = n.points ? {} : MARKUP_RECT3.reduce(function(e4, t3) {
    return e4[t3] = toOptionalFraction3(n[t3]), e4;
  }, {});
  return n.points && (a2 = false), [r2, _objectSpread({ zIndex: 0, id: getUniqueId$2() }, n, s2, { isDestroyed: false, isSelected: false, isDirty: true, allowDestroy: l2, allowSelect: i2, allowMove: o2, allowResize: a2, allowInput: c2, allowEdit: u })];
};
var getFilenameFromHeader = function(e3) {
  if (!e3) return null;
  var t2 = e3.split(/filename=|filename\*=.+''/).splice(1).map(function(e4) {
    return e4.trim().replace(/^["']|[;"']{0,2}$/g, "");
  }).filter(function(e4) {
    return e4.length;
  });
  return t2.length ? decodeURI(t2[t2.length - 1]) : null;
};
var brightness = function(e3) {
  return [1, 0, 0, 0, e3, 0, 1, 0, 0, e3, 0, 0, 1, 0, e3, 0, 0, 0, 1, 0];
};
var contrast = function(e3) {
  return [e3, 0, 0, 0, 0.5 * (1 - e3), 0, e3, 0, 0, 0.5 * (1 - e3), 0, 0, e3, 0, 0.5 * (1 - e3), 0, 0, 0, 1, 0];
};
var saturation = function() {
  var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
  return [0.213 + 0.787 * e3, 0.715 - 0.715 * e3, 0.072 - 0.072 * e3, 0, 0, 0.213 - 0.213 * e3, 0.715 + 0.285 * e3, 0.072 - 0.072 * e3, 0, 0, 0.213 - 0.213 * e3, 0.715 - 0.715 * e3, 0.072 + 0.928 * e3, 0, 0, 0, 0, 0, 1, 0];
};
var exposure = function(e3) {
  return [e3, 0, 0, 0, 0, 0, e3, 0, 0, 0, 0, 0, e3, 0, 0, 0, 0, 0, 1, 0];
};
var testSrc2 = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QA6RXhpZgAATU0AKgAAAAgAAwESAAMAAAABAAYAAAEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAIBASIA/8QAJgABAAAAAAAAAAAAAAAAAAAAAxABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwBH/9k=";
var shouldCorrect2 = void 0;
var testImage2 = isBrowser10() ? new Image() : {};
testImage2.onload = function() {
  shouldCorrect2 = testImage2.naturalWidth > testImage2.naturalHeight, testImage2 = void 0;
}, testImage2.src = testSrc2;
var shouldCorrectImageExifOrientation2 = function() {
  return shouldCorrect2;
};
var testResult$1 = null;
var isIE = function() {
  return null === testResult$1 && (testResult$1 = /MSIE|Trident/.test(window.navigator.userAgent)), testResult$1;
};
var COLOR_TOOLS = { contrast, exposure, brightness, saturation };
var getColorProperty = function(e3) {
  return e3.borderWidth ? "borderColor" : e3.lineWidth ? "lineColor" : e3.fontColor ? "fontColor" : e3.backgroundColor ? "backgroundColor" : void 0;
};
var getColor = function(e3) {
  var t2 = e3.fontColor, r2 = e3.backgroundColor, n = e3.lineColor, i2 = e3.borderColor;
  return t2 || r2 || n || i2;
};
var TURN$1 = Math.PI / 2;
var getOutputSize = function(e3) {
  var t2 = { upscale: e3("GET_OUTPUT_UPSCALE"), mode: e3("GET_OUTPUT_FIT"), width: e3("GET_OUTPUT_WIDTH"), height: e3("GET_OUTPUT_HEIGHT") }, r2 = e3("GET_SIZE_INPUT");
  if (r2.width || r2.height) {
    var n = r2.width, i2 = r2.height, o2 = e3("GET_CROP_RECTANGLE_ASPECT_RATIO");
    n && !i2 ? i2 = n / o2 : i2 && !n && (n = i2 * o2), t2.width = n, t2.height = i2, t2.upscale = true, t2.mode = "force";
  }
  return t2;
};
var getPreparedImageSize = function(e3, t2) {
  var r2 = t2("GET_UID"), n = t2("GET_CROP", r2, Date.now()), i2 = { width: n.cropStatus.currentWidth, height: n.cropStatus.currentHeight }, o2 = e3.mode, a2 = e3.width, c2 = e3.height, l2 = e3.upscale;
  if (!a2 && !c2) return i2;
  if (null === a2 ? a2 = c2 : null === c2 && (c2 = a2), "force" !== o2) {
    var u = a2 / i2.width, s2 = c2 / i2.height, d = 1;
    if ("cover" === o2 ? d = Math.max(u, s2) : "contain" === o2 && (d = Math.min(u, s2)), d > 1 && false === l2) return i2;
    a2 = i2.width * d, c2 = i2.height * d;
  }
  return { width: Math.round(a2), height: Math.round(c2) };
};
var getActiveMarkupFromState = function(e3) {
  return e3.markup.filter(function(e4) {
    return !e4[1].isDestroyed;
  });
};
var cleanMarkupForExport = function(e3) {
  return e3.map(function(e4) {
    var t2 = _objectSpread({}, e4[1]);
    return Object.keys(t2).forEach(function(e5) {
      void 0 === t2[e5] && delete t2[e5];
    }), delete t2.isDestroyed, delete t2.isSelected, delete t2.isDirty, [e4[0], t2];
  });
};
var prepareOutput = function(e3, t2, r2) {
  return new Promise(function(n, i2) {
    var o2 = { data: null, file: null }, a2 = getCropFromStateRounded(t2.image, t2.crop), c2 = getOutputSize(r2), l2 = { crop: a2, image: _objectSpread({}, getPreparedImageSize(c2, r2), { orientation: t2.file.orientation }), size: c2, output: { type: r2("GET_OUTPUT_TYPE"), quality: r2("GET_OUTPUT_QUALITY"), background: t2.options.outputCanvasBackgroundColor }, filter: t2.colorMatrices.filter ? { id: t2.filterName, value: t2.filterValue, matrix: t2.colorMatrices.filter } : null, color: Object.keys(t2.colorValues).length ? Object.keys(t2.colorValues).reduce(function(e4, r3) {
      return e4[r3] = { value: t2.colorValues[r3], matrix: t2.colorMatrices[r3].map(function(e5) {
        return roundFloat(e5, 5);
      }) }, e4;
    }, {}) : null, markup: cleanMarkupForExport(getActiveMarkupFromState(t2).map(function(e4) {
      return [e4[0], _objectSpread({}, e4[1])];
    })), colorMatrix: r2("GET_COLOR_MATRIX") };
    if (e3.data && (o2.data = l2), e3.file) {
      var u = { beforeCreateBlob: r2("GET_BEFORE_CREATE_BLOB"), afterCreateBlob: r2("GET_AFTER_CREATE_BLOB"), stripImageHead: r2("GET_OUTPUT_STRIP_IMAGE_HEAD"), canvasMemoryLimit: r2("GET_OUTPUT_CANVAS_MEMORY_LIMIT") }, s2 = t2.file.data, d = _objectSpread({}, l2, { filter: l2.colorMatrix, markup: l2.markup });
      transformImage2(s2, d, u).then(function(e4) {
        o2.file = getFileFromBlob2(e4, renameFileToMatchMimeType2(s2.name, getValidOutputMimeType2(e4.type))), n(o2);
      }).catch(i2);
    } else n(o2);
  });
};
var resetRotationScale = function(e3) {
  e3.crop.draft.rotateMinScale = null;
};
var storeRotationScale = function(e3) {
  e3.crop.draft.rotateMinScale || (e3.crop.draft.rotateMinScale = e3.crop.transforms.scale);
};
var rotate = function(e3, t2, r2) {
  var n = arguments.length > 3 && void 0 !== arguments[3] && arguments[3], i2 = !(arguments.length > 4 && void 0 !== arguments[4]) || arguments[4];
  storeRotationScale(e3);
  var o2 = _objectSpread({}, e3.crop.transforms, { scale: e3.crop.draft.rotateMinScale });
  e3.crop.draft.transforms = getRotateTransforms(e3.image, e3.crop.rectangle, o2, t2.main + t2.sub, r2, e3.crop.draft.transforms ? e3.crop.draft.transforms.rotation : e3.crop.rotation.main + e3.crop.rotation.sub, n, i2), e3.crop.rotation = splitRotation(e3.crop.draft.transforms.rotation);
};
var resetCrop = function(e3, t2) {
  if (null !== e3.stage) {
    var r2 = void 0 === e3.instructions.crop.scaleToFit ? void 0 === e3.crop.limitToImageBounds ? e3.options.cropLimitToImageBounds : e3.crop.limitToImageBounds : e3.instructions.crop.scaleToFit, n = t2("GET_STAGE_RECT", e3.instructions.crop);
    e3.crop.rectangle = getCenteredCropRect3(n.fits ? n : e3.stage, e3.instructions.crop.aspectRatio || e3.image.aspectRatio), e3.crop.draft.rectangle = null, "stage" !== n.mode && n.fits && (e3.crop.rectangle.x = n.x, e3.crop.rectangle.y = n.y), e3.crop.transforms = getImageTransformsFromCrop(e3.instructions.crop, n, e3.image, r2), e3.crop.draft.transforms = null, e3.crop.rotation = splitRotation(e3.instructions.crop.rotation), e3.crop.flip = _objectSpread({}, e3.instructions.crop.flip);
    var i2 = t2("GET_CROP_ASPECT_RATIO_OPTIONS") || [], o2 = i2.map(function(e4) {
      return e4.value.aspectRatio;
    }).find(function(t3) {
      return t3 === e3.instructions.crop.aspectRatio;
    }), a2 = i2.find(function(e4) {
      return null === e4.value.aspectRatio;
    });
    o2 ? e3.crop.aspectRatio = o2 : a2 && i2.length ? e3.crop.aspectRatio = null : e3.crop.aspectRatio = t2("GET_CROP_ASPECT_RATIO"), e3.crop.isDirty = false;
  }
};
var reset = function(e3, t2, r2) {
  if (null !== e3.stage) {
    clearCenterTimeout(e3), e3.size.width = !!e3.instructions.size && e3.instructions.size.width, e3.size.height = !!e3.instructions.size && e3.instructions.size.height, e3.size.aspectRatioLocked = true, e3.size.aspectRatioPrevious = false;
    var n = void 0 === e3.instructions.crop.scaleToFit ? void 0 === e3.crop.limitToImageBounds ? e3.options.cropLimitToImageBounds : e3.crop.limitToImageBounds : e3.instructions.crop.scaleToFit;
    resetCrop(e3, t2), e3.instructions.markup && r2("MARKUP_SET_VALUE", { value: e3.instructions.markup }), r2("CROP_SET_LIMIT", { value: n, silent: true }), Object.keys(e3.instructions.color).forEach(function(t3) {
      return r2("COLOR_SET_VALUE", { key: t3, value: e3.instructions.color[t3] });
    }), r2("FILTER_SET_VALUE", { value: e3.instructions.filter }), resetRotationScale(e3);
  }
};
var recenter = function(e3, t2) {
  if (e3.stage) {
    clearCenterTimeout(e3);
    var r2 = e3.crop.rectangle, n = r2.height / r2.width, i2 = e3.crop.aspectRatio;
    if (null !== i2 && roundFloat(n, 3) !== roundFloat(i2, 3)) {
      var o2 = t2("GET_MIN_CROP_SIZE");
      o2.width = roundFloat(o2.width), o2.height = roundFloat(o2.height);
      var a2 = Math.min(r2.width, r2.height);
      Math.min(a2 * i2, a2 / i2) < Math.max(o2.width, o2.height) && (e3.crop.rectangle = getTargetRect(_objectSpread({}, e3.crop.rectangle), i2, o2), e3.crop.draft.transforms = getImageTransformsFromRect(e3.image, e3.crop.rectangle, e3.crop.transforms));
    }
    var c2 = e3.crop.draft.transforms || e3.crop.transforms, l2 = getCropFromView(e3.image, e3.crop.rectangle, c2, e3.crop.limitToImageBounds);
    e3.crop.aspectRatio && (l2.aspectRatio = e3.crop.aspectRatio);
    var u = t2("GET_STAGE_RECT", l2);
    e3.crop.transforms = getImageTransformsFromCrop(l2, u, e3.image, l2.scaleToFit), e3.crop.draft.transforms = null;
    var s2 = e3.crop.aspectRatio || e3.crop.rectangle.height / e3.crop.rectangle.width;
    e3.crop.rectangle = getCenteredCropRect3(u, s2), e3.crop.draft.rectangle = null, "stage" !== u.mode && (e3.crop.rectangle.x += u.x, e3.crop.rectangle.y += u.y), resetRotationScale(e3);
  }
};
var startCenterTimeout = function(e3, t2, r2) {
  var n = t2("GET_CROP_ZOOM_TIMEOUT");
  n && (clearTimeout(e3.zoomTimeoutId), e3.zoomTimeoutId = setTimeout(function() {
    r2("CROP_ZOOM");
  }, n));
};
var resetCenterTimeout = function(e3, t2, r2) {
  clearCenterTimeout(e3), startCenterTimeout(e3, t2, r2);
};
var clearCenterTimeout = function(e3) {
  clearTimeout(e3.zoomTimeoutId);
};
var confirmCropDraft = function(e3) {
  e3.crop.rectangle = e3.crop.draft.rectangle.limited, e3.crop.draft.rectangle = null, confirmImageDraft(e3), resetRotationScale(e3);
};
var copyConfirmed = function(e3) {
  e3.crop.draft.transforms = copyImageTransforms(e3.crop.transforms), e3.crop.draft.rectangle = { limited: rectClone(e3.crop.rectangle), free: rectClone(e3.crop.rectangle) }, clearCenterTimeout(e3);
};
var getMinScale = function(e3, t2) {
  return Math.min(e3.width / t2.width, e3.height / t2.height);
};
var getRotateTransforms = function(e3, t2, r2, n, i2, o2, a2, c2) {
  var l2 = _objectSpread({}, copyImageTransforms(r2), { rotation: n }), u = c2 ? limitImageTransformsToCropRect(e3, t2, l2, "rotating") : l2, s2 = getMinScale(t2, i2);
  return roundFloat(u.scale, 5) > roundFloat(s2, 5) ? (a2 && (o2 += 2 * a2), _objectSpread({}, copyImageTransforms(r2), { rotation: o2, interaction: { rotation: u.rotation } })) : (u.scale = Math.min(s2, u.scale), u.interaction = { rotation: u.rotation }, u);
};
var getResizeTransforms = function(e3, t2, r2, n, i2, o2) {
  var a2 = Math.max(1e-10, n), c2 = _objectSpread({}, copyImageTransforms(r2), { scale: a2 }), l2 = o2 ? limitImageTransformsToCropRect(e3, t2, c2, "resizing") : c2, u = getMinScale(t2, i2);
  return l2.scale = Math.min(u, l2.scale), l2.interaction = { scale: a2 }, l2;
};
var getTranslateTransforms = function(e3, t2, r2, n, i2) {
  var o2 = { x: r2.translation.x + n.x, y: r2.translation.y + n.y }, a2 = _objectSpread({}, copyImageTransforms(r2), { translation: o2 }), c2 = i2 ? limitImageTransformsToCropRect(e3, t2, a2, "moving") : a2;
  return c2.interaction = { translation: o2 }, c2;
};
var correctCropRectangleByResize = function(e3, t2) {
  var r2 = roundFloat(e3.crop.draft.transforms.scale, 5);
  if (!(roundFloat(e3.crop.draft.targetSize, 5) < r2)) return false;
  if (null !== e3.crop.aspectRatio) return false;
  if (false === e3.crop.limitToImageBounds) return false;
  if (0 !== roundFloat(e3.crop.rotation.sub, 5)) return false;
  var n = !(roundFloat(e3.crop.rotation.main / TURN$1, 5) % 2 == 0) ? e3.image.width / e3.image.height : e3.image.height / e3.image.width;
  if (n === e3.crop.rectangle.height / e3.crop.rectangle.width) return false;
  var i2 = e3.stage.x + 0.5 * e3.stage.width, o2 = e3.stage.y + 0.5 * e3.stage.height, a2 = e3.crop.rectangle.x + 0.5 * e3.crop.rectangle.width, c2 = e3.crop.rectangle.y + 0.5 * e3.crop.rectangle.height;
  if (a2 !== i2 || c2 !== o2) return false;
  var l2 = t2("GET_STAGE_RECT");
  return e3.crop.rectangle = getCenteredCropRect3(l2, n), "stage" !== l2.mode && (e3.crop.rectangle.x += l2.x, e3.crop.rectangle.y += l2.y), e3.crop.transforms = getImageTransformsFromCrop({ center: { x: 0.5, y: 0.5 }, rotation: e3.crop.transforms.rotation, zoom: 1, aspectRatio: n }, l2, e3.image, true), e3.crop.draft.transforms = null, true;
};
var confirmImageDraft = function(e3) {
  e3.crop.draft.rectangle = null, e3.crop.transforms = e3.crop.draft.transforms || e3.crop.transforms, e3.crop.transforms.interaction = null, e3.crop.draft.transforms = null, e3.crop.transforms = _objectSpread({}, e3.crop.transforms, getTransformOrigin(e3.image, e3.crop.rectangle, e3.crop.transforms)), e3.crop.isRotating = false, e3.crop.isDirty = true;
};
var getResponseHeaderSilent = function(e3, t2) {
  return e3.getAllResponseHeaders().indexOf(t2) >= 0 ? e3.getResponseHeader(t2) : null;
};
var ImageExtensionMap = { svg: "svg+xml", jpg: "jpeg" };
var getImageMimeType = function(e3, t2) {
  if (isImage4(e3)) return e3;
  if (!t2) return e3;
  var r2 = getExtensionFromFilename2(t2);
  return r2 ? "image/".concat(ImageExtensionMap[r2] || r2) : e3;
};
var getFilenameFromURL2 = function(e3) {
  return e3.split("/").pop().split("?").shift();
};
var loadImageFromURL = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, r2 = t2.progress, n = void 0 === r2 ? function(e4) {
  } : r2, i2 = t2.load, o2 = void 0 === i2 ? function(e4, t3) {
  } : i2, a2 = t2.error, c2 = void 0 === a2 ? function() {
  } : a2, l2 = new XMLHttpRequest();
  l2.onprogress = function(e4) {
    return n(e4.lengthComputable ? e4.loaded / e4.total : null);
  }, l2.onerror = function() {
    return c2(l2);
  }, l2.onload = function() {
    var t3 = l2.status >= 200 && l2.status < 300, r3 = l2.response;
    if (!t3 || !r3) return c2(l2);
    var n2 = getResponseHeaderSilent(l2, "Content-Disposition"), i3 = n2 ? getFilenameFromHeader(n2) : getFilenameFromURL2(e3), a3 = getImageMimeType(l2.getResponseHeader("Content-Type"), i3), u = getResponseHeaderSilent(l2, "Content-Doka"), s2 = null;
    if (u) try {
      s2 = JSON.parse(u);
    } catch (e4) {
    }
    !isImage4(r3.type) && a3 && (r3 = r3.slice(0, r3.size, a3)), "name" in r3 || !i3 || (r3.name = i3), o2(r3, s2);
  }, l2.open("GET", e3), l2.responseType = "blob", l2.send();
};
var dataURIToBlob = function(e3) {
  for (var t2 = e3.split(","), r2 = t2[0].match(/([a-z]+\/[a-z]+)/)[0], n = atob(t2[1]), i2 = n.length, o2 = new ArrayBuffer(n.length), a2 = new Uint8Array(o2), c2 = 0; c2 < i2; c2++) a2[c2] = n.charCodeAt(c2);
  return new Blob([o2], { type: r2 });
};
var isDataURI = function(e3) {
  return /^data:/.test(e3);
};
var loadImage$1 = function(e3, t2) {
  var r2 = t2.progress;
  return new Promise(function(t3, n) {
    if (isString2(e3)) {
      var i2 = isDataURI(e3);
      return i2 && isIE() ? t3({ file: dataURIToBlob(e3) }) : void loadImageFromURL(e3, { progress: i2 ? function() {
      } : r2, error: n, load: function(e4, r3) {
        return t3({ file: e4, fileInstructions: r3 });
      } });
    }
    if (e3 instanceof Blob) t3({ file: e3 });
    else {
      if ("IMG" === e3.nodeName) {
        var o2 = function(e4) {
          var r3 = document.createElement("canvas");
          r3.width = e4.naturalWidth, r3.height = e4.naturalHeight, r3.getContext("2d").drawImage(e4, 0, 0), r3.toBlob(function(e5) {
            return t3({ file: e5 });
          });
        };
        return e3.complete ? void o2(e3) : void (e3.onload = function() {
          return o2(e3);
        });
      }
      "CANVAS" !== e3.nodeName ? n(e3) : e3.toBlob(function(e4) {
        return t3({ file: e4 });
      });
    }
  });
};
var shouldAbortImageLoad = function(e3) {
  return false === e3.file;
};
var actions2 = function(e3, t2, r2) {
  return _objectSpread({ SET_UID: function(e4) {
    var t3 = e4.id;
    r2.uid = t3;
  }, AWAIT_IMAGE: function() {
    r2.file || (r2.noImageTimeout = setTimeout(function() {
      e3("AWAITING_IMAGE");
    }, 250));
  }, REQUEST_REMOVE_IMAGE: function() {
    e3("UNLOAD_IMAGE"), r2.file = false, r2.noImageTimeout = setTimeout(function() {
      e3("AWAITING_IMAGE");
    }, 500);
  }, DID_UNLOAD_IMAGE: function() {
    e3("ABORT_IMAGE");
  }, REQUEST_ABORT_IMAGE: function(t3) {
    e3("UNLOAD_IMAGE"), r2.file = false, r2.queuedFile = t3;
  }, DID_SET_SRC: function(t3) {
    t3.value !== t3.prevValue && (clearTimeout(r2.noImageTimeout), e3("REQUEST_LOAD_IMAGE", { source: t3.value }));
  }, ABORT_IMAGE: function() {
    if (r2.file = null, r2.queuedFile) {
      var t3 = r2.queuedFile;
      r2.queuedFile = null, e3("REQUEST_LOAD_IMAGE", t3);
    }
  }, REQUEST_LOAD_IMAGE: function(t3) {
    var n = t3.source, i2 = t3.success, o2 = void 0 === i2 ? function() {
    } : i2, a2 = t3.failure, c2 = void 0 === a2 ? function(e4) {
    } : a2, l2 = t3.options, u = t3.resolveOnConfirm, s2 = void 0 !== u && u;
    if (clearTimeout(r2.noImageTimeout), !n) return c2("no-image-source");
    if (null !== r2.file) return r2.file.error ? (r2.file = null, void e3("REQUEST_LOAD_IMAGE", { source: n, success: o2, failure: c2, options: l2, resolveOnConfirm: s2 })) : void e3("REQUEST_ABORT_IMAGE", { source: n, success: o2, failure: c2, options: l2, resolveOnConfirm: s2 });
    resetState(r2), r2.file = { uid: getUniqueId3() }, e3("DID_REQUEST_LOAD_IMAGE", { source: n });
    var d = function(t4) {
      if (shouldAbortImageLoad(r2)) return e3("ABORT_IMAGE");
      r2.file.error = true, e3("DID_LOAD_IMAGE_ERROR", { error: { status: "IMAGE_LOAD_ERROR", data: t4 } }), c2(t4);
    };
    loadImage$1(n, { progress: function(t4) {
      return null !== t4 && e3("DID_MAKE_PROGRESS", { progress: t4 });
    } }).then(function(t4) {
      var n2 = t4.file, i3 = t4.fileInstructions;
      if (!l2 && i3) {
        var a3 = i3.crop, u2 = i3.filter, p = i3.colorMatrix, f2 = i3.color, h = i3.markup, g = i3.size;
        l2 = { crop: a3, filter: u2 ? u2.id || u2.matrix : p, color: f2, markup: h, size: g };
      }
      if (shouldAbortImageLoad(r2)) return e3("ABORT_IMAGE");
      var m = r2.options.beforeLoadImage, v = m ? m(n2) : n2;
      Promise.resolve(v).then(function(t5) {
        t5.name || (t5.name = getDateString2()), r2.file.orientation = -1, r2.file.data = t5, e3("LOAD_IMAGE", { success: o2, failure: c2, options: l2, resolveOnConfirm: s2 }, true), e3("KICK");
      }).catch(function(e4) {
        setTimeout(function() {
          d(e4);
        }, 100);
      });
    }).catch(d);
  }, LOAD_IMAGE: function(n) {
    var i2 = n.success, o2 = n.failure, a2 = n.options, c2 = void 0 === a2 ? {} : a2, l2 = n.resolveOnConfirm;
    if (shouldAbortImageLoad(r2)) return e3("ABORT_IMAGE");
    var u = r2.file.data;
    Promise.all([getImageSize4(u), getImageOrientation2(u)]).then(function(n2) {
      var a3 = _slicedToArray(n2, 2), u2 = a3[0], s2 = a3[1];
      if (shouldAbortImageLoad(r2)) return e3("ABORT_IMAGE");
      if (r2.file.orientation = t2("GET_OUTPUT_CORRECT_IMAGE_EXIF_ORIENTATION") && shouldCorrectImageExifOrientation2() ? s2 : -1, r2.file.orientation > -1) {
        var d = u2.width, p = u2.height;
        s2 >= 5 && s2 <= 8 && (u2.width = p, u2.height = d);
      }
      var f2 = t2("GET_MIN_IMAGE_SIZE");
      if (u2.width < f2.width || u2.height < f2.height) return e3("DID_LOAD_IMAGE_ERROR", { error: { status: "IMAGE_MIN_SIZE_VALIDATION_ERROR", data: { size: u2, minImageSize: f2 } } }), resetState(r2), void o2();
      var h = scaleImageSize(u2, { width: t2("GET_MAX_IMAGE_PREVIEW_WIDTH"), height: t2("GET_MAX_IMAGE_PREVIEW_HEIGHT") });
      if (r2.image = { x: 0, y: 0, width: h.width, height: h.height, naturalWidth: u2.width, naturalHeight: u2.height, aspectRatio: u2.height / u2.width, orientation: s2 }, c2.size && (c2.size.hasOwnProperty("mode") && c2.size.hasOwnProperty("upscale") ? (r2.options.outputWidth = c2.size.width, r2.options.outputHeight = c2.size.height, r2.options.outputFit = c2.size.mode, r2.options.upscale = c2.size.upscale) : (r2.size.width = c2.size.width, r2.size.height = c2.size.height, r2.size.aspectRatioLocked = true, r2.size.aspectRatioPrevious = false, r2.instructions.size = { width: c2.size.width, height: c2.size.height })), r2.instructions.crop = getBaseCropInstructions(t2, r2, c2.crop ? _objectSpread({}, c2.crop) : null, r2.size), r2.crop.limitToImageBounds = r2.options.cropLimitToImageBounds, false === r2.instructions.crop.scaleToFit && (r2.crop.limitToImageBounds = r2.instructions.crop.scaleToFit), void 0 === c2.filter) r2.options.filter ? "string" == typeof r2.options.filter ? r2.instructions.filter = r2.options.filter : r2.options.filter.id && (r2.instructions.filter = r2.options.filter.id) : r2.instructions.filter = void 0;
      else {
        var g = c2.filter;
        r2.instructions.filter = null === g ? g : g.id || g.matrix || g;
      }
      var m = r2.options.markup || [];
      r2.instructions.markup = m.concat(c2.markup || []), r2.instructions.color = Object.keys(COLOR_TOOLS).reduce(function(e4, t3) {
        var n3 = null;
        return r2.options.color && r2.options.color[t3] && (n3 = r2.options.color[t3].value), e4[t3] = c2.color && void 0 !== c2.color[t3] ? "number" == typeof c2.color[t3] ? c2.color[t3] : c2.color[t3].value : null === n3 ? r2.options["color".concat(capitalizeFirstLetter(t3))] : n3, e4;
      }, {}), e3("DID_LOAD_IMAGE", { image: _objectSpread({ size: r2.file.data.size, name: r2.file.data.name, type: r2.file.data.type, orientation: s2 }, u2) }), r2.filePromise = { resolveOnConfirm: l2, success: i2, failure: o2 };
    }).catch(function(t3) {
      if (shouldAbortImageLoad(r2)) return e3("ABORT_IMAGE");
      e3("DID_LOAD_IMAGE_ERROR", { error: { status: "IMAGE_UNKNOWN_ERROR", data: t3 } }), resetState(r2), o2();
    });
  }, CHANGE_VIEW: function(t3) {
    var n = t3.id;
    r2.activeView = n, e3("SHOW_VIEW", { id: n });
  }, UPDATE_ROOT_RECT: function(e4) {
    var t3 = e4.rect;
    r2.rootRect = t3;
  }, DID_RESIZE_STAGE: function(n) {
    var i2 = n.size, o2 = n.offset, a2 = n.animate, c2 = null === r2.stage;
    if (r2.stage = createRect(0, 0, i2.width, i2.height), r2.stageOffset = createVector3(o2.x, o2.y), !t2("GET_ALLOW_PREVIEW_FIT_TO_VIEW")) {
      var l2 = t2("GET_IMAGE_STAGE_RECT");
      r2.stage = createRect(0, 0, l2.width, l2.height), r2.stageOffset = createVector3(r2.stageOffset.x + l2.x, r2.stageOffset.y + l2.y);
    }
    if (c2) {
      if (reset(r2, t2, e3), e3("DID_SHOW_IMAGE", { image: { size: r2.file.data.size, name: r2.file.data.name, type: r2.file.data.type, orientation: r2.image.orientation, width: r2.image.naturalWidth, height: r2.image.naturalHeight } }), !r2.filePromise.resolveOnConfirm) {
        var u = getCropFromStateRounded(r2.image, r2.crop), s2 = getOutputSize(t2);
        r2.filePromise.success({ crop: u, image: { orientation: r2.file.orientation }, size: s2, output: { type: t2("GET_OUTPUT_TYPE"), quality: t2("GET_OUTPUT_QUALITY") } });
      }
    } else r2.instantUpdate = !a2, recenter(r2, t2), setTimeout(function() {
      r2.instantUpdate = false;
    }, 16);
  }, RESIZE_SET_OUTPUT_SIZE_ASPECT_RATIO_LOCK: function(e4) {
    var t3 = e4.value;
    r2.size.aspectRatioLocked = t3;
  }, RESIZE_SET_OUTPUT_SIZE: function(n) {
    var i2 = n.width, o2 = n.height, a2 = limitSize({ width: i2 = i2 || null, height: o2 = o2 || null }, t2("GET_SIZE_MIN"), t2("GET_SIZE_MAX"), t2("GET_CROP_RECTANGLE_ASPECT_RATIO"));
    if (r2.size.width = a2.width ? Math.round(a2.width) : null, r2.size.height = a2.height ? Math.round(a2.height) : null, i2 && o2) {
      var c2 = o2 / i2;
      if (c2 === r2.crop.aspectRatio) return;
      false === r2.size.aspectRatioPrevious && (r2.size.aspectRatioPrevious = r2.crop.aspectRatio), e3("CROP_SET_ASPECT_RATIO", { value: c2 });
    } else false !== r2.size.aspectRatioPrevious && (e3("CROP_SET_ASPECT_RATIO", { value: r2.size.aspectRatioPrevious }), r2.size.aspectRatioPrevious = false);
  }, CROP_SET_ASPECT_RATIO: function(e4) {
    var n = e4.value;
    if (clearCenterTimeout(r2), r2.crop.aspectRatio = isString2(n) ? getNumericAspectRatioFromString2(n) : n, r2.crop.aspectRatio && recenter(r2, t2), r2.crop.isDirty = true, r2.size.width && r2.size.height) if (r2.crop.aspectRatio) {
      var i2 = r2.size.width * r2.crop.aspectRatio, o2 = limit2(i2, t2("GET_SIZE_MIN").height, t2("GET_SIZE_MAX").height);
      r2.size.height = o2, r2.size.width = o2 / r2.crop.aspectRatio;
    } else r2.size.height = null;
  }, DID_SET_CROP_ASPECT_RATIO: function(t3) {
    var r3 = t3.value, n = t3.prevValue;
    getNumericAspectRatioFromString2(r3) !== getNumericAspectRatioFromString2(n) && e3("CROP_SET_ASPECT_RATIO", { value: r3 });
  }, CROP_ZOOM: function() {
    r2.stage && (clearCenterTimeout(r2), recenter(r2, t2));
  }, DID_SET_CROP_LIMIT_TO_IMAGE_BOUNDS: function(t3) {
    var n = t3.value, i2 = t3.prevValue;
    r2.crop.limitToImageBounds = n, false === i2 && true === n && e3("CROP_ENABLED_LIMIT_TO_IMAGE_BOUNDS");
  }, CROP_ENABLED_LIMIT_TO_IMAGE_BOUNDS: function() {
    var e4 = r2.stage, n = r2.image;
    if (r2.crop.rectangle) {
      var i2 = r2.crop.rectangle.height / r2.crop.rectangle.width, o2 = getCenteredCropRect3(e4, i2);
      r2.crop.rectangle = o2, r2.crop.transforms = limitImageTransformsToCropRect(n, r2.crop.rectangle, r2.crop.transforms, "moving"), r2.crop.transforms = limitImageTransformsToCropRect(n, r2.crop.rectangle, r2.crop.transforms, "resizing"), r2.crop.transforms = limitImageTransformsToCropRect(n, r2.crop.rectangle, r2.crop.transforms, "rotating"), r2.crop.draft.rectangle = null, r2.crop.draft.transforms = null, recenter(r2, t2);
    }
  }, CROP_SET_LIMIT: function(t3) {
    var n = t3.value, i2 = t3.silent, o2 = void 0 !== i2 && i2, a2 = r2.crop.limitToImageBounds !== n;
    r2.crop.limitToImageBounds = n, a2 && !o2 && (r2.crop.isDirty = true), a2 && n && e3("CROP_ENABLED_LIMIT_TO_IMAGE_BOUNDS");
  }, CROP_IMAGE_RESIZE_GRAB: function() {
    copyConfirmed(r2), clearCenterTimeout(r2);
  }, CROP_IMAGE_ROTATE_GRAB: function() {
    copyConfirmed(r2), clearCenterTimeout(r2), r2.crop.isRotating = true;
  }, CROP_RECT_DRAG_GRAB: function() {
    copyConfirmed(r2), clearCenterTimeout(r2);
  }, CROP_RECT_DRAG_RELEASE: function() {
    confirmCropDraft(r2), startCenterTimeout(r2, t2, e3);
  }, CROP_RECT_EDGE_DRAG: function(e4) {
    var n = e4.offset, i2 = e4.origin, o2 = e4.anchor, a2 = r2.image, c2 = r2.stage, l2 = /n|s/.test(i2) ? Direction.VERTICAL : Direction.HORIZONTAL, u = getEdgeCenterCoordinates(i2, r2.crop.rectangle), s2 = getEdgeCenterCoordinates(o2, r2.crop.rectangle), d = vectorLimit({ x: u.x + (l2 === Direction.HORIZONTAL ? n.x : 0), y: u.y + (l2 === Direction.VERTICAL ? n.y : 0) }, c2), p = t2("GET_MIN_CROP_SIZE"), f2 = t2("GET_MAX_CROP_SIZE");
    p.width = roundFloat(p.width), p.height = roundFloat(p.height);
    var h = getMinScale(r2.crop.rectangle, t2("GET_MIN_PREVIEW_IMAGE_SIZE")) / (r2.crop.draft.transforms.scale || r2.crop.transforms.scale);
    f2.width = roundFloat(f2.width * h), f2.height = roundFloat(f2.height * h);
    var g = { x: Math.sign(u.x - s2.x), y: Math.sign(u.y - s2.y) };
    r2.crop.draft.rectangle = getEdgeTargetRect(g, d, l2, s2, rectBounds(r2.crop.rectangle), rectBounds(c2), r2.crop.aspectRatio, p, f2), r2.crop.limitToImageBounds && (r2.crop.draft.transforms = getImageTransformsFromRect(a2, r2.crop.draft.rectangle.limited, r2.crop.transforms));
  }, CROP_RECT_CORNER_DRAG: function(e4) {
    var n = e4.offset, i2 = e4.origin, o2 = e4.anchor, a2 = r2.image, c2 = r2.stage, l2 = getCornerCoordinates(i2, r2.crop.rectangle), u = getCornerCoordinates(o2, r2.crop.rectangle), s2 = { x: l2.x + n.x, y: l2.y + n.y }, d = t2("GET_MIN_CROP_SIZE"), p = t2("GET_MAX_CROP_SIZE");
    d.width = roundFloat(d.width), d.height = roundFloat(d.height);
    var f2 = getMinScale(r2.crop.rectangle, t2("GET_MIN_PREVIEW_IMAGE_SIZE")) / (r2.crop.draft.transforms.scale || r2.crop.transforms.scale);
    p.width = roundFloat(p.width * f2), p.height = roundFloat(p.height * f2);
    var h = { x: Math.sign(l2.x - u.x), y: Math.sign(l2.y - u.y) };
    r2.crop.draft.rectangle = getCornerTargetRect(h, s2, u, c2, r2.crop.aspectRatio, d, p), r2.crop.limitToImageBounds && (r2.crop.draft.transforms = getImageTransformsFromRect(a2, r2.crop.draft.rectangle.limited, r2.crop.transforms));
  }, CROP_IMAGE_DRAG_GRAB: function() {
    return copyConfirmed(r2) || clearCenterTimeout(r2);
  }, CROP_IMAGE_DRAG_RELEASE: function() {
    confirmImageDraft(r2), resetRotationScale(r2), startCenterTimeout(r2, t2, e3);
  }, CROP_IMAGE_ROTATE_RELEASE: function() {
    confirmImageDraft(r2), startCenterTimeout(r2, t2, e3);
  }, CROP_IMAGE_DRAG: function(e4) {
    var t3 = e4.value;
    clearCenterTimeout(r2), r2.crop.draft.transforms = getTranslateTransforms(r2.image, r2.crop.rectangle, r2.crop.transforms, t3, r2.crop.limitToImageBounds);
  }, CROP_IMAGE_RESIZE_RELEASE: function() {
    t2("GET_CROP_RESIZE_MATCH_IMAGE_ASPECT_RATIO") && correctCropRectangleByResize(r2, t2), confirmImageDraft(r2), resetRotationScale(r2), startCenterTimeout(r2, t2, e3);
  }, CROP_IMAGE_RESIZE: function(e4) {
    var n = e4.value;
    clearCenterTimeout(r2);
    var i2 = r2.crop.transforms;
    r2.crop.draft.targetSize = i2.scale + i2.scale * n, r2.crop.draft.transforms = getResizeTransforms(r2.image, r2.crop.rectangle, i2, r2.crop.draft.targetSize, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), r2.crop.limitToImageBounds);
  }, CROP_IMAGE_RESIZE_SET: function(e4) {
    var n = e4.value, i2 = Math.max(r2.crop.rectangle.width / r2.image.width, r2.crop.rectangle.height / r2.image.height);
    clearCenterTimeout(r2);
    var o2 = r2.crop.transforms;
    r2.crop.draft.targetSize = n * i2, r2.crop.draft.transforms = getResizeTransforms(r2.image, r2.crop.rectangle, o2, r2.crop.draft.targetSize, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), r2.crop.limitToImageBounds);
  }, CROP_IMAGE_RESIZE_MULTIPLY: function(e4) {
    var n = e4.value;
    clearCenterTimeout(r2);
    var i2 = r2.crop.transforms;
    r2.crop.draft.targetSize = i2.scale * n, r2.crop.draft.transforms = getResizeTransforms(r2.image, r2.crop.rectangle, i2, r2.crop.draft.targetSize, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), r2.crop.limitToImageBounds);
  }, CROP_IMAGE_RESIZE_AMOUNT: function(e4) {
    var n = e4.value;
    clearCenterTimeout(r2);
    var i2 = r2.crop.transforms;
    r2.crop.draft.targetSize = (r2.crop.draft.transforms ? r2.crop.draft.transforms.scale : i2.scale) + n, r2.crop.draft.transforms = getResizeTransforms(r2.image, r2.crop.rectangle, i2, r2.crop.draft.targetSize, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), r2.crop.limitToImageBounds);
  }, CROP_IMAGE_ROTATE: function(e4) {
    var n = e4.value;
    clearCenterTimeout(r2), r2.crop.isRotating = true, rotate(r2, { main: r2.crop.rotation.main, sub: n }, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), false, r2.crop.limitToImageBounds);
  }, CROP_IMAGE_ROTATE_ADJUST: function(e4) {
    var n = e4.value;
    clearCenterTimeout(r2), rotate(r2, { main: r2.crop.rotation.main, sub: Math.min(Math.PI / 4, Math.max(-Math.PI / 4, r2.crop.rotation.sub + n)) }, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), false, r2.crop.limitToImageBounds), confirmImageDraft(r2);
  }, CROP_IMAGE_ROTATE_CENTER: function() {
    clearCenterTimeout(r2), rotate(r2, { main: r2.crop.rotation.main, sub: 0 }, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), false, r2.crop.limitToImageBounds), confirmImageDraft(r2);
  }, CROP_IMAGE_ROTATE_LEFT: function() {
    resetCenterTimeout(r2, t2, e3), rotate(r2, { main: r2.crop.rotation.main - TURN$1, sub: r2.crop.rotation.sub }, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), -TURN$1, r2.crop.limitToImageBounds), confirmImageDraft(r2), t2("GET_CROP_FORCE_LETTERBOX") && e3("CROP_UPDATE_LETTERBOX");
  }, CROP_IMAGE_ROTATE_RIGHT: function() {
    resetCenterTimeout(r2, t2, e3), rotate(r2, { main: r2.crop.rotation.main + TURN$1, sub: r2.crop.rotation.sub }, t2("GET_MIN_PREVIEW_IMAGE_SIZE"), TURN$1, r2.crop.limitToImageBounds), confirmImageDraft(r2), t2("GET_CROP_FORCE_LETTERBOX") && e3("CROP_UPDATE_LETTERBOX");
  }, CROP_IMAGE_FLIP_HORIZONTAL: function() {
    resetCenterTimeout(r2, t2, e3), 0 === roundFloat(r2.crop.rotation.main % Math.PI / 2, 5) ? r2.crop.flip.horizontal = !r2.crop.flip.horizontal : r2.crop.flip.vertical = !r2.crop.flip.vertical, r2.crop.isDirty = true;
  }, CROP_IMAGE_FLIP_VERTICAL: function() {
    resetCenterTimeout(r2, t2, e3), 0 === roundFloat(r2.crop.rotation.main % Math.PI / 2, 5) ? r2.crop.flip.vertical = !r2.crop.flip.vertical : r2.crop.flip.horizontal = !r2.crop.flip.horizontal, r2.crop.isDirty = true;
  }, DID_RECEIVE_IMAGE_DATA: function(e4) {
    var t3 = e4.previewData, n = e4.thumbData;
    r2.file.preview = t3, r2.file.thumb = n;
  }, MARKUP_SET_VALUE: function(e4) {
    var t3 = e4.value;
    r2.markup = (t3 || []).map(prepareMarkup3).sort(sortMarkupByZIndex3);
  }, MARKUP_ADD_DEFAULT: function(r3) {
    var n = r3.value, i2 = function() {
      return -0.5 + Math.random();
    }, o2 = t2("GET_CROP_RECTANGLE_ASPECT_RATIO"), a2 = o2 > 1 ? 0.5 / o2 : 0.5, c2 = o2 > 1 ? 0.5 : 0.5 * o2, l2 = function() {
      return { width: a2, height: c2, x: 0.5 + 0.5 * i2() - 0.5 * a2, y: 0.5 + 0.5 * i2() - 0.5 * c2 };
    }, u = function(e4) {
      return t2("GET_MARKUP_TOOL_VALUES")[e4];
    }, s2 = function() {
      var e4 = u("shapeStyle"), t3 = u("color"), r4 = e4[0] || e4[1] ? null : t3;
      return { backgroundColor: r4, borderWidth: e4[0], borderStyle: e4[1] ? e4[1] : null, borderColor: null !== r4 ? null : t3 };
    }, d = { rect: function() {
      return _objectSpread({}, l2(), s2());
    }, ellipse: function() {
      return _objectSpread({}, l2(), s2());
    }, text: function() {
      return { x: 0.5 + 0.5 * i2() - 0.1, y: 0.5 + 0.5 * i2(), width: 0, height: 0, fontColor: u("color"), fontSize: u("fontSize"), fontFamily: u("fontFamily"), text: "Text" };
    }, line: function() {
      var e4 = u("lineStyle");
      return _objectSpread({}, l2(), { lineColor: u("color"), lineWidth: e4[0], lineStyle: e4[1] ? e4[1] : null, lineDecoration: u("lineDecoration") });
    } }[n]();
    e3("MARKUP_ADD", [n, d]);
  }, MARKUP_ADD: function(n) {
    r2.markup.forEach(function(e4) {
      return e4[1].isSelected = false;
    }), r2.markup = r2.markup.filter(function(e4) {
      return !e4[1].isDestroyed;
    });
    var i2 = prepareMarkup3(n);
    r2.markup.push(i2), r2.markup.sort(sortMarkupByZIndex3), "draw" !== t2("GET_MARKUP_UTIL") && e3("MARKUP_SELECT", { id: i2[1].id }), r2.crop.isDirty = true;
  }, MARKUP_SELECT: function(e4) {
    var t3 = e4.id;
    r2.markup.forEach(function(e5) {
      e5[1].isSelected = e5[1].id === t3, e5[1].isDirty = true;
    });
  }, MARKUP_ELEMENT_DRAG: function(e4) {
    var t3 = e4.id, n = e4.origin, i2 = e4.offset, o2 = e4.size, a2 = r2.markup.find(function(e5) {
      return e5[1].id === t3;
    });
    if (a2) {
      var c2 = a2[1], l2 = n.x / o2.width, u = n.y / o2.height, s2 = n.width / o2.width, d = n.height / o2.height, p = i2.x / o2.width, f2 = i2.y / o2.height;
      c2.x = l2 + p, c2.y = u + f2, c2.width = s2, c2.height = d, c2.left = void 0, c2.top = void 0, c2.right = void 0, c2.bottom = void 0, c2.isDirty = true, r2.crop.isDirty = true;
    }
  }, MARKUP_ELEMENT_RESIZE: function(e4) {
    var t3 = e4.id, n = e4.corner, i2 = e4.origin, o2 = e4.offset, a2 = e4.size, c2 = r2.markup.find(function(e5) {
      return e5[1].id === t3;
    });
    if (c2) {
      var l2 = _slicedToArray(c2, 2), u = l2[0], s2 = l2[1], d = (i2.x + o2.x) / a2.width, p = (i2.y + o2.y) / a2.height;
      if (/n/.test(n)) if ("line" === u) s2.height = s2.height - (p - s2.y), s2.y = p;
      else {
        var f2 = s2.y + s2.height;
        p > f2 && (p = f2), s2.height = s2.height - (p - s2.y), s2.y = p;
      }
      if (/w/.test(n)) if ("line" === u) s2.width = s2.width - (d - s2.x), s2.x = d;
      else {
        var h = s2.x + s2.width;
        d > h && (d = h), s2.width = s2.width - (d - s2.x), s2.x = d;
      }
      /s/.test(n) && (s2.height = "line" === u ? p - s2.y : Math.max(0, p - s2.y)), /e/.test(n) && (s2.width = "line" === u ? d - s2.x : Math.max(0, d - s2.x)), s2.left = void 0, s2.top = void 0, s2.right = void 0, s2.bottom = void 0, s2.isDirty = true, r2.crop.isDirty = true;
    }
  }, MARKUP_DELETE: function(t3) {
    var n = t3.id, i2 = r2.markup.find(function(e4) {
      return e4[1].id === n;
    });
    if (i2) {
      var o2 = i2[1];
      o2.allowDestroy && (o2.isDestroyed = true, o2.isSelected = false, o2.isDirty = true);
      for (var a2 = null, c2 = r2.markup.length; c2 > 0; ) {
        c2--;
        var l2 = r2.markup[c2][1];
        if (!l2.isDestroyed && l2.allowDestroy) {
          a2 = l2.id;
          break;
        }
      }
      e3("MARKUP_SELECT", { id: a2 });
    }
  }, MARKUP_UPDATE: function(e4) {
    var t3 = e4.style, n = e4.value;
    r2.markupToolValues[t3] = n, r2.markup.map(function(e5) {
      return e5[1];
    }).filter(function(e5) {
      return e5.isSelected;
    }).forEach(function(e5) {
      if ("color" === t3) e5[getColorProperty(e5)] = n;
      else if ("shapeStyle" === t3) {
        var r3 = getColor(e5);
        e5.borderColor = r3, e5.borderWidth = n[0], e5.borderStyle = n[1], e5.backgroundColor = n[0] || n[1] ? null : r3, null !== e5.backgroundColor && (e5.borderColor = null);
      } else "lineStyle" === t3 ? (e5.lineWidth = n[0], e5.lineStyle = n[1]) : e5[t3] = n;
      e5.isDirty = true;
    }), r2.crop.isDirty = true;
  } }, ["color", "shapeStyle", "lineStyle", "textDecoration", "fontSize", "fontFamily"].reduce(function(t3, n) {
    var i2 = n.split(/(?=[A-Z])/).join("_").toUpperCase(), o2 = capitalizeFirstLetter(n);
    return t3["SET_MARKUP_" + i2] = function(t4) {
      var i3 = t4.value;
      i3 !== t4.prevValue && (r2.options["markup".concat(o2)] = i3, e3("MARKUP_UPDATE", { style: n, value: i3 }));
    }, t3;
  }, {}), { DID_SET_CROP: function(t3) {
    var r3 = t3.value;
    r3 !== t3.prevValue && e3("SET_DATA", { crop: r3 });
  }, COLOR_SET_COLOR_VALUE: function(t3) {
    var n = t3.key, i2 = t3.value;
    r2.crop.isDirty = true, e3("COLOR_SET_VALUE", { key: n, value: i2 });
  }, COLOR_SET_VALUE: function(t3) {
    var n = t3.key, i2 = t3.value;
    r2.colorValues[n] = i2, e3("SET_COLOR_MATRIX", { key: n, matrix: COLOR_TOOLS[n](i2) });
  } }, Object.keys(COLOR_TOOLS).reduce(function(n, i2) {
    var o2 = i2.toUpperCase(), a2 = capitalizeFirstLetter(i2);
    return n["SET_COLOR_".concat(o2)] = function(n2) {
      var c2 = n2.value;
      if (c2 !== n2.prevValue) {
        var l2 = _slicedToArray(t2("GET_COLOR_".concat(o2, "_RANGE")), 2), u = l2[0], s2 = l2[1], d = limit2(c2, u, s2);
        r2.options["color".concat(a2)] = d, r2.instructions.color || (r2.instructions.color = {}), r2.instructions.color[i2] = d, e3("COLOR_SET_VALUE", { key: i2, value: d });
      }
    }, n;
  }, {}), { SET_COLOR_MATRIX: function(t3) {
    var n = t3.key, i2 = t3.matrix;
    i2 ? r2.colorMatrices[n] = _toConsumableArray(i2) : delete r2.colorMatrices[n], e3("DID_SET_COLOR_MATRIX", { key: n, matrix: i2 });
  }, FILTER_SET_FILTER: function(t3) {
    var n = t3.value;
    r2.crop.isDirty = true, e3("FILTER_SET_VALUE", { value: n });
  }, FILTER_SET_VALUE: function(n) {
    var i2 = n.value, o2 = isColorMatrix(i2) ? i2 : null;
    if (isString2(i2)) {
      var a2 = t2("GET_FILTERS");
      forin2(a2, function(e4, t3) {
        e4 === i2 && (o2 = t3.matrix());
      });
    }
    r2.filter = i2, r2.filterName = isString2(i2) ? i2 : null, e3("SET_COLOR_MATRIX", { key: "filter", matrix: o2 });
  }, DID_SET_UTIL: function(t3) {
    var n = t3.value;
    t3.prevValue;
    -1 !== r2.options.utils.indexOf(n) && e3("CHANGE_VIEW", { id: n });
  }, DID_SET_FILTER: function(t3) {
    var r3 = t3.value;
    r3 !== t3.prevValue && (r3 && r3.id && (r3 = r3.id), e3("FILTER_SET_VALUE", { value: r3 }), e3("SET_DATA", { filter: r3 }));
  }, DID_SET_SIZE: function(t3) {
    var r3 = t3.value;
    r3 !== t3.prevValue && e3("SET_DATA", { size: r3 });
  }, DID_SET_MARKUP_UTIL: function(t3) {
    var r3 = t3.value;
    r3 !== t3.prevValue && r3 && (/^(draw|line|text|rect|ellipse)$/.test(r3) || (r3 = "select"), e3("SWITCH_MARKUP_UTIL", { util: r3 }));
  }, DID_SET_MARKUP: function(t3) {
    var r3 = t3.value, n = t3.prevValue;
    r3 !== n && JSON.stringify(r3) === JSON.stringify(n) || (e3("MARKUP_SET_VALUE", { value: r3 }), e3("SET_DATA", { markup: r3 }));
  }, SET_DATA: function(n) {
    if (n.size) {
      var i2 = _objectSpread({ width: null, height: null }, n.size), o2 = limitSize(i2, t2("GET_SIZE_MIN"), t2("GET_SIZE_MAX"), null);
      r2.instructions.size = _objectSpread({}, o2), e3("RESIZE_SET_OUTPUT_SIZE", o2);
    }
    n.filter && (r2.instructions.filter = n.filter ? n.filter.id || n.filter.matrix : n.colorMatrix), r2.instructions.markup = n.markup || [], r2.instructions.markup.forEach(function(e4) {
      return e4[1].isDirty = true;
    }), r2.instructions.color = Object.keys(COLOR_TOOLS).reduce(function(e4, t3) {
      var i3 = void 0 === n.color || void 0 === n.color[t3], o3 = r2.options["color".concat(capitalizeFirstLetter(t3))];
      return e4[t3] = i3 ? o3 : isNumber2(n.color[t3]) ? n.color[t3] : n.color[t3].value, e4;
    }, {}), n.crop && (r2.instructions.crop = getBaseCropInstructions(t2, r2, n.crop, r2.size), r2.crop.limitToImageBounds = r2.options.cropLimitToImageBounds, false === r2.instructions.crop.scaleToFit && (r2.crop.limitToImageBounds = r2.instructions.crop.scaleToFit), resetCrop(r2, t2));
  }, DID_SET_INITIAL_STATE: function(e4) {
    var n = e4.value || {}, i2 = n.crop, o2 = n.filter, a2 = n.color, c2 = n.size, l2 = void 0 === c2 ? {} : c2, u = n.markup, s2 = void 0 === u ? [] : u, d = _objectSpread({ width: null, height: null }, l2), p = limitSize(d, t2("GET_SIZE_MIN"), t2("GET_SIZE_MAX"), null);
    r2.instructions.size = _objectSpread({}, p), r2.instructions.crop = getBaseCropInstructions(t2, r2, i2), r2.crop.limitToImageBounds = r2.options.cropLimitToImageBounds, false === r2.instructions.crop.scaleToFit && (r2.crop.limitToImageBounds = r2.instructions.crop.scaleToFit), r2.instructions.filter = o2 || null, r2.instructions.color = Object.keys(COLOR_TOOLS).reduce(function(e5, t3) {
      return e5[t3] = void 0 === a2 || void 0 === a2[t3] ? r2.options["color".concat(capitalizeFirstLetter(t3))] : a2[t3], e5;
    }, {}), r2.instructions.markup = s2, r2.crop.isDirty = true;
  }, GET_DATA: function(n) {
    var i2 = n.success, o2 = n.failure, a2 = n.file, c2 = n.data;
    if (!r2.file) return o2("no-image-source");
    if (!r2.stage) return o2("image-not-fully-loaded");
    var l2 = { file: isBoolean2(a2) ? a2 : t2("GET_OUTPUT_FILE"), data: isBoolean2(c2) ? c2 : t2("GET_OUTPUT_DATA"), success: i2, failure: o2 };
    e3(l2.file ? "REQUEST_PREPARE_OUTPUT" : "PREPARE_OUTPUT", l2);
  }, REQUEST_PREPARE_OUTPUT: function(t3) {
    var r3 = t3.file, n = t3.data, i2 = t3.success, o2 = t3.failure;
    e3("PREPARE_OUTPUT", { file: r3, data: n, success: i2, failure: o2 }, true), e3("DID_REQUEST_PREPARE_OUTPUT");
  }, PREPARE_OUTPUT: function(n) {
    var i2 = n.file, o2 = n.data, a2 = n.success, c2 = void 0 === a2 ? function() {
    } : a2, l2 = n.failure, u = void 0 === l2 ? function() {
    } : l2;
    if (shouldAbortImageLoad(r2)) return e3("ABORT_IMAGE");
    var s2 = function(t3) {
      if (e3("DID_PREPARE_OUTPUT"), shouldAbortImageLoad(r2)) return e3("ABORT_IMAGE");
      c2(t3);
    };
    prepareOutput({ file: i2, data: o2 }, r2, t2).then(function(t3) {
      var n2 = r2.options.afterCreateOutput, i3 = n2 ? n2(t3, function(t4, r3) {
        return e3("DID_REQUEST_POSTPROCESS_OUTPUT", { label: t4, progress: r3 }), function(t5) {
          e3("DID_MAKE_PROGRESS", { progress: t5 });
        };
      }) : t3;
      Promise.resolve(i3).then(s2).catch(function(t4) {
        e3("DID_REQUEST_POSTPROCESS_OUTPUT_ERROR", { error: t4 });
      });
    }).catch(function(t3) {
      if (shouldAbortImageLoad(r2)) return e3("ABORT_IMAGE");
      u(t3);
    });
  }, EDIT_RESET: function() {
    clearCenterTimeout(r2), reset(r2, t2, e3);
  }, EDIT_CONFIRM: function() {
    if (r2.file && r2.stage) {
      clearCenterTimeout(r2), e3("CROP_ZOOM");
      var n = { file: t2("GET_OUTPUT_FILE"), data: t2("GET_OUTPUT_DATA"), success: function(t3) {
        r2.filePromise.resolveOnConfirm && r2.filePromise.success(t3), e3("DID_CONFIRM", { output: t3 });
      }, failure: console.error };
      e3(n.file ? "REQUEST_PREPARE_OUTPUT" : "PREPARE_OUTPUT", n);
    }
  }, EDIT_CANCEL: function() {
    r2.filePromise && r2.filePromise.success(null), e3("DID_CANCEL");
  }, EDIT_CLOSE: function() {
    clearCenterTimeout(r2);
  }, EDIT_DESTROY: function() {
    resetState(r2);
  }, SET_OPTIONS: function(t3) {
    var r3 = t3.options;
    forin2(r3, function(t4, r4) {
      e3("SET_".concat(fromCamels2(t4, "_").toUpperCase()), { value: r4 });
    });
  } });
};
var createIcon = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 24;
  return '<svg width="'.concat(t2, '" height="').concat(t2, '" viewBox="0 0 ').concat(t2, " ").concat(t2, '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">').concat(e3, "</svg>");
};
var button = createView2({ ignoreRect: true, ignoreRectUpdate: true, name: "button", mixins: { styles: ["opacity"], animations: { opacity: { type: "tween", duration: 250 } }, apis: ["id"], listeners: true }, tag: "button", create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.element.innerHTML = "".concat(r2.icon || "", "<span>").concat(r2.label, "</span>"), t2.element.setAttribute("type", r2.type || "button"), r2.name && r2.name.split(" ").forEach(function(e4) {
    t2.element.className += " doka--button-".concat(e4);
  }), t2.ref.handleClick = function() {
    "string" == typeof r2.action ? t2.dispatch(r2.action) : r2.action();
  }, t2.element.addEventListener("click", t2.ref.handleClick), t2.ref.handlePointer = function(e4) {
    return e4.stopPropagation();
  }, t2.element.addEventListener("pointerdown", t2.ref.handlePointer), r2.create && r2.create({ root: t2, props: r2 });
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.element.removeEventListener("pointerdown", t2.ref.handlePointer), t2.element.removeEventListener("click", t2.ref.handleClick);
} });
var textNode = function(e3) {
  return createView2({ ignoreRect: true, tag: e3, create: function(e4) {
    var t2 = e4.root, r2 = e4.props;
    t2.element.textContent = r2.text;
  } });
};
var progressIndicator2 = createView2({ name: "status-progress", tag: "svg", ignoreRect: true, ignoreRectUpdate: true, mixins: { apis: ["progress"], animations: { progress: { type: "spring", stiffness: 0.25, damping: 0.25, mass: 2.5 } } }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.element.setAttribute("data-value", 0), t2.element.setAttribute("width", 24), t2.element.setAttribute("height", 24), t2.element.setAttribute("viewBox", "0 0 20 20");
  var n = t2.ref.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"), i2 = { r: 5, cx: 10, cy: 10, fill: "none", stroke: "currentColor", "stroke-width": 10, transform: "rotate(-90) translate(-20)" };
  t2.element.appendChild(n), Object.keys(i2).forEach(function(e4) {
    n.setAttribute(e4, i2[e4]);
  }), t2.ref.updateStroke = function(e4) {
    t2.ref.circle.setAttribute("stroke-dasharray", "".concat(31.42 * Math.min(1, e4), " 31.42"));
  }, "number" == typeof r2.progress ? (t2.progress = r2.progress, t2.element.setAttribute("data-value", Math.max(r2.progress, 1e-3)), t2.ref.updateStroke(t2.progress)) : t2.progress = 0;
}, write: createRoute2({ DID_MAKE_PROGRESS: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  t2.progress = r2.progress, t2.element.setAttribute("data-value", Math.max(r2.progress, 1e-3));
} }, function(e3) {
  var t2 = e3.root;
  t2.ref.updateStroke(t2.progress);
}) });
var statusBubbleInner = createView2({ name: "status-bubble-inner", create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  r2.onClose ? t2.appendChildView(t2.createChildView(button, { label: "Close", name: "icon-only status-bubble-close", icon: createIcon('<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></g>'), action: r2.onClose })) : t2.ref.progressIndicator = t2.appendChildView(t2.createChildView(progressIndicator2, { progress: r2.progress })), t2.appendChildView(t2.createChildView(textNode("p"), { text: r2.label }));
} });
var statusBubble = createView2({ name: "status-bubble", mixins: { styles: ["opacity", "translateY"], apis: ["markedForRemoval"], animations: { opacity: { type: "tween", duration: 500 }, translateY: { type: "spring", mass: 20 } } }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  return t2.appendChildView(t2.createChildView(statusBubbleInner, r2));
} });
var hideBusyIndicators = function(e3) {
  e3.element.dataset.viewStatus = "idle", hideBusyIndicatorsAnimated(e3);
};
var hideBusyIndicatorsAnimated = function(e3) {
  e3.ref.busyIndicators.forEach(function(e4) {
    e4.translateY = -10, e4.opacity = 0, e4.markedForRemoval = true;
  });
};
var showBusyIndicator = function(e3, t2, r2, n) {
  e3.element.dataset.viewStatus = "busy";
  var i2 = addBusyIndicator(e3, t2, r2, n);
  hideBusyIndicatorsAnimated(e3), e3.ref.busyIndicators.push(i2), i2.markedForRemoval = false, i2.translateY = 0, i2.opacity = 1;
};
var addBusyIndicator = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
  return e3.appendChildView(e3.createChildView(statusBubble, { translateY: 20, opacity: 0, label: t2, onClose: r2, progress: n }));
};
var editStatus = createView2({ name: "edit-status", ignoreRect: true, create: function(e3) {
  var t2 = e3.root;
  t2.ref.busyIndicators = [], t2.element.setAttribute("tabindex", -1);
}, write: createRoute2({ MISSING_WEBGL: function(e3) {
  var t2 = e3.root, r2 = /fullscreen/.test(t2.query("GET_STYLE_LAYOUT_MODE"));
  showBusyIndicator(t2, t2.query("GET_LABEL_STATUS_MISSING_WEB_G_L"), r2 ? function() {
    t2.dispatch("EDIT_CANCEL");
  } : null);
}, AWAITING_IMAGE: function(e3) {
  var t2 = e3.root;
  showBusyIndicator(t2, t2.query("GET_LABEL_STATUS_AWAITING_IMAGE"));
}, DID_PRESENT_IMAGE: function(e3) {
  var t2 = e3.root;
  hideBusyIndicators(t2);
}, DID_LOAD_IMAGE_ERROR: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = /fullscreen/.test(t2.query("GET_STYLE_LAYOUT_MODE")), i2 = t2.query("GET_LABEL_STATUS_LOAD_IMAGE_ERROR"), o2 = "function" == typeof i2 ? i2(r2.error) : i2;
  showBusyIndicator(t2, o2, n ? function() {
    t2.dispatch("EDIT_CANCEL");
  } : null);
}, DID_REQUEST_LOAD_IMAGE: function(e3) {
  var t2 = e3.root;
  showBusyIndicator(t2, t2.query("GET_LABEL_STATUS_LOADING_IMAGE"));
}, DID_REQUEST_PREPARE_OUTPUT: function(e3) {
  var t2 = e3.root;
  showBusyIndicator(t2, t2.query("GET_LABEL_STATUS_PROCESSING_IMAGE"));
}, DID_REQUEST_POSTPROCESS_OUTPUT: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  showBusyIndicator(t2, r2.label, null, r2.progress);
}, DID_REQUEST_POSTPROCESS_OUTPUT_ERROR: function(e3) {
  var t2 = e3.root, r2 = e3.action.error;
  showBusyIndicator(t2, r2, function() {
    return t2.dispatch("DID_PREPARE_OUTPUT");
  });
}, DID_PREPARE_OUTPUT: function(e3) {
  var t2 = e3.root;
  hideBusyIndicators(t2);
} }), didWriteView: function(e3) {
  var t2 = e3.root;
  t2.ref.busyIndicators = t2.ref.busyIndicators.filter(function(e4) {
    return !e4.markedForRemoval || 0 !== e4.opacity || (t2.removeChildView(e4), false);
  });
} });
var Interaction = { down: "pointerdown", move: "pointermove", up: "pointerup" };
var createPointerRegistry = function() {
  var e3 = [], t2 = function(t3) {
    return e3.findIndex(function(e4) {
      return e4.pointerId === t3.pointerId;
    });
  };
  return { update: function(r2) {
    var n = t2(r2);
    n < 0 || (e3[n] = r2);
  }, multiple: function() {
    return e3.length > 1;
  }, count: function() {
    return e3.length;
  }, active: function() {
    return e3.concat();
  }, push: function(r2) {
    (function(e4) {
      return t2(e4) >= 0;
    })(r2) || e3.push(r2);
  }, pop: function(r2) {
    var n = t2(r2);
    n < 0 || e3.splice(n, 1);
  } };
};
var addEvent$1 = function(e3, t2, r2, n) {
  return e3.addEventListener(Interaction[t2], r2, n);
};
var removeEvent$1 = function(e3, t2, r2) {
  return e3.removeEventListener(Interaction[t2], r2);
};
var contains = function(e3, t2) {
  if ("contains" in e3) return e3.contains(t2);
  var r2 = t2;
  do {
    if (r2 === e3) return true;
  } while (r2 = r2.parentNode);
  return false;
};
var createDragger = function(e3, t2, r2, n) {
  var i2 = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : { stopPropagation: true, cancelOnMultiple: false }, o2 = { x: 0, y: 0 }, a2 = { enabled: true, cancel: false, cancelled: false, pointers: createPointerRegistry() }, c2 = null, l2 = function(e4, t3) {
    t3 && (c2 || u(e4, t3), cancelAnimationFrame(c2), c2 = requestAnimationFrame(function() {
      u(e4, t3), c2 = null;
    }));
  }, u = function(e4, t3) {
    return t3.apply(null, [e4, (function(e5) {
      return { x: e5.pageX - o2.x, y: e5.pageY - o2.y };
    })(e4)]);
  }, s2 = function(r3) {
    var n2 = 0 === a2.pointers.count();
    n2 && (a2.active = false, a2.cancel = false, a2.cancelled = false), (e3 === r3.target || contains(e3, r3.target)) && (n2 ? r3.isPrimary && (a2.pointers.push(r3), addEvent$1(document.documentElement, "up", p), r3.preventDefault(), i2.stopPropagation && (r3.stopPropagation(), r3.stopImmediatePropagation()), a2.active = true, o2.x = r3.pageX, o2.y = r3.pageY, addEvent$1(document.documentElement, "move", d), t2(r3)) : i2.cancelOnMultiple && (a2.cancel = true));
  }, d = function(e4) {
    e4.isPrimary && (a2.cancelled || (e4.preventDefault(), i2.stopPropagation && e4.stopPropagation(), l2(e4, r2), a2.cancel && (a2.cancelled = true, l2(e4, n))));
  }, p = function e4(t3) {
    a2.pointers.pop(t3), 0 === a2.pointers.count() && (removeEvent$1(document.documentElement, "move", d), removeEvent$1(document.documentElement, "up", e4)), a2.active && (a2.cancelled || (t3.preventDefault(), i2.stopPropagation && t3.stopPropagation(), l2(t3, r2), l2(t3, n)));
  };
  return addEvent$1(document.documentElement, "down", s2), { enable: function() {
    a2.enabled || addEvent$1(document.documentElement, "down", s2), a2.enabled = true;
  }, disable: function() {
    a2.enabled && removeEvent$1(document.documentElement, "down", s2), a2.enabled = false;
  }, destroy: function() {
    removeEvent$1(document.documentElement, "up", p), removeEvent$1(document.documentElement, "move", d), removeEvent$1(document.documentElement, "down", s2);
  } };
};
var imageOverlaySpring = { type: "spring", stiffness: 0.4, damping: 0.65, mass: 7 };
var activateMarkupUtil = function(e3, t2, r2) {
  if (/^(line|text|ellipse|rect)$/.test(r2)) e3.dispatch("MARKUP_ADD_DEFAULT", { value: r2 }), e3.dispatch("SET_MARKUP_UTIL", { value: "select" });
  else if ("draw" === r2 && !e3.ref.drawInput) {
    var n = e3.ref, i2 = n.drawState, o2 = n.viewSize, a2 = 0, c2 = 0, l2 = {}, u = e3.query("GET_MARKUP_DRAW_DISTANCE");
    e3.ref.drawInput = createDragger(e3.element, function(r3) {
      var n2 = e3.query("GET_MARKUP_TOOL_VALUES"), u2 = n2.lineStyle[0], s2 = n2.lineStyle[1];
      i2.lineColor = n2.color, i2.lineWidth = u2, i2.lineStyle = s2;
      var d = e3.query("GET_ROOT"), p = void 0 !== r3.offsetX ? r3.offsetX : r3.pageX - d.x - t2.stageOffsetX - window.pageXOffset, f2 = void 0 !== r3.offsetY ? r3.offsetY : r3.pageY - d.y - t2.stageOffsetY - window.pageYOffset;
      a2 = p - e3.markupX, c2 = f2 - e3.markupY, l2.x = 0, l2.y = 0, i2.points.push({ x: a2 / o2.width, y: c2 / o2.height });
    }, function(t3, r3) {
      if (e3.dispatch("KICK"), u) {
        var n2 = vectorDistance3(r3, l2);
        if (n2 > u) {
          var s2 = vectorAngleBetween(l2, r3) + Math.PI / 2, d = u - n2;
          l2.x += Math.sin(s2) * d, l2.y -= Math.cos(s2) * d, i2.points.push({ x: (a2 + l2.x) / o2.width, y: (c2 + l2.y) / o2.height });
        }
      } else i2.points.push({ x: (a2 + r3.x) / o2.width, y: (c2 + r3.y) / o2.height });
    }, function(t3, r3) {
      i2.points.length > 1 && e3.dispatch("MARKUP_ADD", ["path", _objectSpread({}, i2)]), i2.points = [];
    });
  }
  "draw" !== r2 && e3.ref.drawInput && (e3.ref.drawInput.destroy(), e3.ref.drawInput = null);
};
var getColor$1 = function(e3) {
  var t2 = e3.fontColor, r2 = e3.backgroundColor, n = e3.lineColor, i2 = e3.borderColor;
  return t2 || r2 || n || i2;
};
var MARKUP_MARGIN = 10;
var setAttributes$1 = function(e3, t2) {
  return Object.keys(t2).forEach(function(r2) {
    e3.setAttribute(r2, t2[r2]);
  });
};
var ns$2 = "http://www.w3.org/2000/svg";
var svg$1 = function(e3, t2) {
  var r2 = document.createElementNS(ns$2, e3);
  return t2 && setAttributes$1(r2, t2), r2;
};
var LINE_CORNERS = ["nw", "se"];
var RECT_CORNERS = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
var CORNER_CURSOR = { nw: "nwse", n: "ns", ne: "nesw", w: "ew", e: "ew", sw: "nesw", s: "ns", se: "nwse" };
var CORNER_COORDINATES = { nw: function(e3) {
  return { x: e3.x, y: e3.y };
}, n: function(e3) {
  return { x: e3.x + 0.5 * e3.width, y: e3.y };
}, ne: function(e3) {
  return { x: e3.x + e3.width, y: e3.y };
}, w: function(e3) {
  return { x: e3.x, y: e3.y + 0.5 * e3.height };
}, e: function(e3) {
  return { x: e3.x + e3.width, y: e3.y + 0.5 * e3.height };
}, sw: function(e3) {
  return { x: e3.x, y: e3.y + e3.height };
}, s: function(e3) {
  return { x: e3.x + 0.5 * e3.width, y: e3.y + e3.height };
}, se: function(e3) {
  return { x: e3.x + e3.width, y: e3.y + e3.height };
} };
var HITBOX_OFFSET = 5;
var HITBOX_COORDINATES = { nw: function(e3) {
  return { x: e3.x - HITBOX_OFFSET, y: e3.y - HITBOX_OFFSET };
}, n: function(e3) {
  return { x: e3.x + 0.5 * e3.width, y: e3.y - HITBOX_OFFSET };
}, ne: function(e3) {
  return { x: e3.x + e3.width + HITBOX_OFFSET, y: e3.y - HITBOX_OFFSET };
}, w: function(e3) {
  return { x: e3.x - HITBOX_OFFSET, y: e3.y + 0.5 * e3.height };
}, e: function(e3) {
  return { x: e3.x + e3.width + HITBOX_OFFSET, y: e3.y + 0.5 * e3.height };
}, sw: function(e3) {
  return { x: e3.x - HITBOX_OFFSET, y: e3.y + e3.height + HITBOX_OFFSET };
}, s: function(e3) {
  return { x: e3.x + 0.5 * e3.width, y: e3.y + e3.height + HITBOX_OFFSET };
}, se: function(e3) {
  return { x: e3.x + e3.width + HITBOX_OFFSET, y: e3.y + e3.height + HITBOX_OFFSET };
} };
var imageMarkup = createView2({ tag: "div", name: "image-markup", ignoreRect: true, mixins: { styles: ["opacity"], animations: { opacity: "spring", markupX: imageOverlaySpring, markupY: imageOverlaySpring, markupWidth: imageOverlaySpring, markupHeight: imageOverlaySpring }, listeners: true, apis: ["toolsReference", "onSelect", "onDrag", "markupX", "markupY", "markupWidth", "markupHeight", "allowInteraction", "stageOffsetX", "stageOffsetY"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = r2.onSelect, i2 = void 0 === n ? function() {
  } : n, o2 = r2.onUpdate, a2 = void 0 === o2 ? function() {
  } : o2, c2 = svg$1("svg", { xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink" });
  t2.ref.canvas = c2;
  var l2 = t2.query("GET_ROOT_SIZE");
  c2.setAttribute("width", l2.width), c2.setAttribute("height", l2.height);
  var u = document.createElement("input");
  setAttributes$1(u, { type: "text", autocomplete: "off", autocapitalize: "off" }), u.addEventListener("keydown", function(e4) {
    e4.stopPropagation(), 13 === e4.keyCode || 9 === e4.keyCode ? (e4.target.blur(), d()) : 8 !== e4.keyCode || t2.ref.input.value.length || t2.dispatch("MARKUP_DELETE", { id: t2.ref.selected.id });
  }), t2.ref.input = u, t2.ref.elements = [], t2.ref.viewSize = { width: 0, height: 0, scale: 0 }, t2.ref.resetSelected = function() {
    return t2.ref.selected = { id: null, type: null, settings: {} }, t2.ref.selected;
  }, t2.ref.resetSelected();
  var s2 = function(e4) {
    return e4.id ? e4 : e4.parentNode;
  }, d = function() {
    t2.ref.resetSelected(), i2(null);
  };
  t2.ref.handleDeselect = function(e4) {
    var n2;
    (t2.query("IS_ACTIVE_VIEW", "markup") || t2.query("IS_ACTIVE_VIEW", "sticker")) && (t2.ref.selected.id && e4.target !== t2.ref.removeButton.element && (n2 = e4.target, t2.ref.selected.id !== s2(n2).id && ((function(e5) {
      return contains(t2.ref.manipulatorGroup, e5) || e5 === t2.ref.input;
    })(e4.target) || r2.isMarkupUtil(e4.target) || d())));
  }, addEvent$1(document.body, "down", t2.ref.handleDeselect), t2.ref.handleTextInput = function() {
    return a2("text", t2.ref.input.value);
  }, t2.ref.input.addEventListener("input", t2.ref.handleTextInput), t2.ref.handleAttemptDelete = function(e4) {
    (t2.query("IS_ACTIVE_VIEW", "markup") || t2.query("IS_ACTIVE_VIEW", "sticker")) && (!t2.ref.selected.id || 8 !== e4.keyCode && 46 !== e4.keyCode || (e4.stopPropagation(), e4.preventDefault(), t2.dispatch("MARKUP_DELETE", { id: t2.ref.selected.id })));
  }, document.body.addEventListener("keydown", t2.ref.handleAttemptDelete);
  var p = svg$1("g"), f2 = svg$1("g", { class: "doka--shape-group" });
  p.appendChild(f2), t2.ref.shapeGroup = f2;
  var h = svg$1("g", { fill: "none", class: "doka--manipulator-group" }), g = svg$1("rect", { x: 0, y: 0, width: 0, height: 0, fill: "none" }), m = svg$1("path");
  h.appendChild(m), h.appendChild(g), t2.ref.manipulatorPath = m, t2.ref.manipulatorRect = g, t2.ref.manipulators = [];
  for (var v = 0; v < 10; v++) {
    var y = svg$1("circle", { r: 6, "stroke-width": 2 }), E = svg$1("circle", { r: 22, class: "doka--hitbox", style: "opacity: 0" });
    h.appendChild(E), h.appendChild(y), t2.ref.manipulators.push({ visual: y, hitbox: E, dragger: null });
  }
  p.appendChild(h), t2.ref.manipulatorGroup = h, c2.appendChild(p), t2.ref.shapeOffsetGroup = p, t2.ref.removeButton = t2.appendChildView(t2.createChildView(button, { label: t2.query("GET_LABEL_MARKUP_REMOVE_SHAPE"), name: "destroy-shape", action: function() {
    t2.dispatch("MARKUP_DELETE", { id: t2.ref.selected.id });
  } })), (t2.query("IS_ACTIVE_VIEW", "markup") || t2.query("IS_ACTIVE_VIEW", "sticker")) && (t2.element.dataset.active = true), t2.ref.drawInput = null, t2.ref.drawState = { lineColor: null, lineWidth: null, lineStyle: null, points: [] };
  var T = svg$1("path", { fill: "none", class: "doka--draw-path" });
  t2.ref.drawPath = T, c2.appendChild(T);
  var _ = createElement3("div", "doka--image-markup-clip");
  _.appendChild(u), _.appendChild(c2), t2.ref.clip = _, t2.element.appendChild(_), "draw" === t2.query("GET_MARKUP_UTIL") && activateMarkupUtil(t2, r2, "draw");
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.ref.elements.concat(t2.ref.manipulators).forEach(function(e4) {
    e4.dragger && e4.dragger.destroy();
  }), t2.ref.input.removeEventListener("input", t2.ref.handleTextInput), document.body.removeEventListener("keydown", t2.ref.handleAttemptDelete), removeEvent$1(document.body, "down", t2.ref.handleDeselect);
}, read: function(e3) {
  var t2 = e3.root;
  if (!t2.rect.element.hidden) for (var r2 in t2.ref.elements) {
    var n = t2.ref.elements[r2];
    if (n && "text" === n.nodeName && n.parentNode) {
      var i2 = n.getBBox();
      n.bbox = { x: i2.x, y: i2.y, width: i2.width, height: i2.height };
    }
  }
}, write: createRoute2({ SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.action;
  "markup" === n.id || "sticker" === n.id ? t2.element.dataset.active = true : (t2.element.dataset.active = false, r2.onSelect(null));
}, MARKUP_SET_VALUE: function(e3) {
  var t2 = e3.root;
  forin2(t2.ref.elements, function(e4, t3) {
    t3 && t3.dragger && t3.dragger.destroy();
  }), t2.ref.elements = [], t2.ref.shapeGroup.innerHTML = "";
}, UPDATE_ROOT_RECT: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = t2.ref.canvas;
  n.setAttribute("width", r2.rect.width), n.setAttribute("height", r2.rect.height), t2.ref.previousScale = null;
}, SWITCH_MARKUP_UTIL: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = e3.props, i2 = r2.util;
  activateMarkupUtil(t2, n, i2);
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp;
  if (!(t2.opacity <= 0)) {
    var i2 = t2.query("GET_CROP", r2.id, n);
    if (i2) {
      var o2 = t2.query("GET_MARKUP_UTIL");
      t2.element.dataset.util = o2 || "";
      var a2 = i2.markup, c2 = i2.cropStatus, l2 = r2.onSelect, u = r2.onDrag, s2 = t2.ref, d = s2.clip, p = s2.manipulatorGroup, f2 = s2.drawPath, h = s2.viewSize, g = s2.shapeOffsetGroup, m = s2.manipulators, v = s2.manipulatorPath, y = s2.manipulatorRect, E = s2.removeButton, T = s2.drawState, _ = t2.query("GET_OUTPUT_WIDTH"), R = t2.query("GET_OUTPUT_HEIGHT"), w = c2.image, A = c2.crop, I = A.width, S = A.height, C = A.widthFloat / A.heightFloat;
      if (_ || R) {
        var O = t2.query("GET_OUTPUT_FIT");
        _ && !R && (R = _), R && !_ && (_ = R);
        var x, b = _ / I, M = R / S;
        if ("force" === O) I = _, S = R;
        else "cover" === O ? x = Math.max(b, M) : "contain" === O && (x = Math.min(b, M)), I *= x, S *= x;
      } else w.width && w.height ? (I = w.width, S = w.height) : w.width && !w.height ? (I = w.width, S = w.width / C) : w.height && !w.width && (S = w.height, I = w.height * C);
      var L = T.points.length, P = roundFloat(t2.markupX, 3), G = roundFloat(t2.markupY, 3), k = roundFloat(t2.markupWidth, 3), D = roundFloat(t2.markupHeight, 3), U = roundFloat(Math.min(t2.markupWidth / I, t2.markupHeight / S), 4);
      if (h.width = k, h.height = D, h.scale = U, stateHasChanged(t2, { drawLength: L, markupX: P, markupY: G, scale: U, markup: a2, currentWidth: I, currentHeight: S })) {
        var B = P, V = t2.rect.element.width - P - k, N = G, F = t2.rect.element.height - G - D, z = "inset(".concat(N, "px ").concat(V, "px ").concat(F, "px ").concat(B, "px)");
        if (d.style.clipPath = z, d.style.webkitClipPath = z, g.setAttribute("transform", "translate(".concat(P, " ").concat(G, ")")), t2.ref.previousDrawLength = L, t2.ref.previousX = P, t2.ref.previousY = G, t2.ref.previousScale = U, t2.ref.previousCurrentHeight = S, t2.ref.previousCurrentWidth = I, t2.ref.previousMarkupLength = a2.length, !(h.width < 1 || h.height < 1)) {
          var W, q = a2.find(function(e4) {
            return e4[1].isSelected;
          }), H = q && t2.ref.selected.id !== q[1].id || t2.ref.selected.id && !q;
          if (W = q ? t2.ref.selected = { id: q[1].id, type: q[0], settings: q[1] } : t2.ref.resetSelected(), T.points.length) {
            var Y = getMarkupStyles3(T, h, U);
            return Y.d = pointsToPathShape3(T.points.map(function(e4) {
              return { x: P + e4.x * h.width, y: G + e4.y * h.height };
            })), void setAttributes$1(f2, Y);
          }
          f2.removeAttribute("d"), t2.ref.input.hidden = "text" !== t2.ref.selected.type || !t2.ref.selected.settings.allowInput, E.element.dataset.active = null !== t2.ref.selected.id, v.setAttribute("style", "opacity:0"), y.setAttribute("style", "opacity:0"), m.forEach(function(e4) {
            e4.visual.setAttribute("style", "opacity:0; pointer-events:none;"), e4.hitbox.setAttribute("style", "pointer-events:none;");
          });
          var j = t2.query("GET_MARKUP_FILTER");
          a2.filter(j).sort(sortMarkupByZIndex3).forEach(function(e4, n2) {
            var i3 = _slicedToArray(e4, 2), o3 = i3[0], a3 = i3[1], c3 = a3.id, s3 = a3.isDestroyed, d2 = a3.isDirty, f3 = a3.isSelected, g2 = a3.allowSelect, T2 = a3.allowMove, _2 = a3.allowResize, R2 = a3.allowInput;
            if (s3) {
              var w2 = t2.ref.elements[c3];
              w2 && (w2.dragger && w2.dragger.destroy(), t2.ref.elements[c3] = null, w2.parentNode.removeChild(w2));
            } else {
              var A2, I2, S2, C2 = t2.ref.elements[c3];
              if (!C2) if (C2 = createMarkupByType3(o3, a3), t2.ref.elements[c3] = C2, g2) C2.dragger = createDragger(C2, function() {
                I2 = Date.now(), A2 = _objectSpread({}, C2.rect), (S2 = c3 === t2.ref.selected.id) || l2(c3);
              }, function(e5, t3) {
                T2 && u(c3, A2, t3, h, U);
              }, function(e5, r3) {
                if (R2 && "text" === o3 && S2) {
                  var n3 = vectorDistanceSquared3({ x: 0, y: 0 }, r3), i4 = Date.now() - I2;
                  if (!(n3 > 10 || i4 > 750)) {
                    t2.ref.input.focus();
                    var a4 = t2.markupX + C2.bbox.x, c4 = C2.bbox.width, l3 = (e5.offsetX - a4) / c4, u2 = Math.round(t2.ref.input.value.length * l3);
                    t2.ref.input.setSelectionRange(u2, u2);
                  }
                }
              }), C2.dragger.disable();
              else C2.setAttribute("style", "pointer-events:none;");
              if (C2.dragger && (r2.allowInteraction ? C2.dragger.enable() : C2.dragger.disable()), n2 !== C2.index) {
                C2.index = n2;
                var O2 = t2.ref.shapeGroup;
                O2.insertBefore(C2, O2.childNodes[n2 + 1]);
              }
              if (d2 && updateMarkupByType3(C2, o3, a3, h, U), f3) {
                var x2 = E.rect.element.width, b2 = E.rect.element.height, M2 = t2.markupX - 0.5 * x2, L2 = t2.markupY - b2 - 15, P2 = "text" === o3 ? C2.bbox : C2.rect, G2 = false, k2 = getColor$1(a3);
                if (k2) {
                  var D2 = toRGBColorArray(k2);
                  G2 = (0.2126 * D2[0] + 0.7152 * D2[1] + 0.0722 * D2[2]) / 255 > 0.65, p.setAttribute("is-bright-color", G2);
                }
                "line" === o3 ? (M2 += P2.x, L2 += P2.y, setAttributes$1(v, { d: "M ".concat(P2.x, " ").concat(P2.y, " L ").concat(P2.x + P2.width, " ").concat(P2.y + P2.height), style: "opacity:1" })) : "path" === o3 ? (M2 += (P2 = { x: a3.points[0].x * h.width, y: a3.points[0].y * h.height, width: 0, height: 0 }).x, L2 += P2.y, setAttributes$1(v, { d: pointsToPathShape3(a3.points.map(function(e5) {
                  return { x: e5.x * h.width, y: e5.y * h.height };
                })), style: "opacity:1" })) : P2 && (M2 += P2.x + 0.5 * P2.width, L2 += P2.y, setAttributes$1(y, { x: P2.x - ("text" === o3 ? 5 : 0), y: P2.y, width: P2.width + ("text" === o3 ? 10 : 0), height: P2.height, style: "opacity:1" }));
                var B2 = t2.markupY + MARKUP_MARGIN, V2 = t2.markupY + t2.markupHeight - MARKUP_MARGIN, N2 = t2.markupX + MARKUP_MARGIN, F2 = t2.markupX + t2.markupWidth - MARKUP_MARGIN;
                if (L2 < B2 ? L2 = B2 : L2 + b2 > V2 && (L2 = V2 - b2), M2 < N2 ? M2 = N2 : M2 + x2 > F2 && (M2 = F2 - x2), P2 || (E.element.dataset.active = "false"), E.element.setAttribute("style", "transform: translate3d(".concat(M2, "px, ").concat(L2, "px, 0)")), "text" === o3 && P2 && R2) {
                  var z2 = P2.width + 65, W2 = t2.markupWidth - P2.x, q2 = "\n                        width: ".concat(Math.min(z2, W2), "px;\n                        height: ").concat(P2.height, "px;\n                        color: ").concat(C2.getAttribute("fill"), ";\n                        font-family: ").concat(C2.getAttribute("font-family"), ";\n                        font-size: ").concat(C2.getAttribute("font-size").replace(/px/, ""), "px;\n                        font-weight: ").concat(C2.getAttribute("font-weight") || "normal", ";\n                    ");
                  isIOS2() ? q2 += "\n                            left: ".concat(Math.round(t2.markupX + P2.x), "px;\n                            top: ").concat(Math.round(t2.markupY + P2.y), "px;\n                        ") : q2 += "\n                            transform: translate3d(".concat(Math.round(t2.markupX + P2.x), "px,").concat(Math.round(t2.markupY + P2.y), "px,0);\n                        "), t2.ref.input.setAttribute("style", q2), C2.setAttribute("fill", "none");
                }
                if ("text" === o3) return;
                if (!_2) return;
                var H2 = "line" === o3 ? LINE_CORNERS : RECT_CORNERS;
                m.forEach(function(e5, t3) {
                  var r3 = H2[t3];
                  if (r3) {
                    var n3 = "line" === o3 ? "move" : "".concat(CORNER_CURSOR[r3], "-resize"), i4 = CORNER_COORDINATES[r3](C2.rect), a4 = C2.rect.width < 100 || C2.rect.height < 100, c4 = 2 === r3.length ? 1 : a4 ? 0 : 1;
                    setAttributes$1(e5.visual, { cx: i4.x, cy: i4.y, style: "opacity:".concat(c4) });
                    var l3 = HITBOX_COORDINATES[r3](C2.rect);
                    setAttributes$1(e5.hitbox, { cx: l3.x, cy: l3.y, style: "cursor:".concat(n3, ";") });
                  }
                });
              }
              a3.isDirty = false;
            }
          }), H && (destroyElementControls(t2), "text" === W.type && t2.ref.selected.settings.allowInput ? t2.ref.input.value = W.settings.text : t2.ref.selected.id && setupElementControls(t2, r2.onResize));
        }
      }
    }
  }
}) });
var markAllAsDirty = function(e3) {
  return e3.forEach(function(e4) {
    return e4[1].isDirty = true;
  });
};
var stateHasChanged = function(e3, t2) {
  var r2 = t2.drawLength, n = t2.markup, i2 = t2.markupX, o2 = t2.markupY, a2 = t2.currentWidth, c2 = t2.currentHeight, l2 = t2.scale;
  return r2 !== e3.ref.previousDrawLength || (i2 !== e3.ref.previousX ? (markAllAsDirty(n), true) : o2 !== e3.ref.previousY ? (markAllAsDirty(n), true) : l2 !== e3.ref.previousScale ? (markAllAsDirty(n), true) : c2 !== e3.ref.previousCurrentHeight ? (markAllAsDirty(n), true) : a2 !== e3.ref.previousCurrentWidth ? (markAllAsDirty(n), true) : n.length !== e3.ref.previousMarkupLength || !!n.find(function(e4) {
    return e4[1].isDirty;
  }));
};
var setupElementControls = function(e3, t2) {
  var r2 = e3.ref.selected.id, n = "g" === e3.ref.elements[r2].nodeName ? LINE_CORNERS : RECT_CORNERS;
  e3.ref.manipulators.forEach(function(i2, o2) {
    var a2 = n[o2];
    if (a2) {
      var c2 = null;
      i2.dragger = createDragger(i2.hitbox, function() {
        c2 = { x: parseFloat(attr2(i2.hitbox, "cx")), y: parseFloat(attr2(i2.hitbox, "cy")) };
      }, function(n2, i3) {
        t2(r2, a2, c2, i3, e3.ref.viewSize);
      }, null, { stopPropagation: true });
    }
  });
};
var destroyElementControls = function(e3) {
  e3.ref.manipulators.forEach(function(e4) {
    e4.dragger && (e4.dragger.destroy(), e4.dragger = null);
  });
};
var KEY_MAP = { 38: "up", 40: "down", 37: "left", 39: "right", 189: "minus", 187: "plus", 72: "h", 76: "l", 81: "q", 82: "r", 84: "t", 86: "v", 90: "z", 219: "left_bracket", 221: "right_bracket" };
var createKeyboard = function(e3, t2, r2, n, i2) {
  var o2 = null, a2 = true, c2 = { enabled: true }, l2 = function(e4) {
    var i3 = KEY_MAP[e4.keyCode] || e4.keyCode;
    r2[i3] && (e4.stopPropagation(), a2 && (o2 = t2(i3), a2 = false), r2[i3](o2), n(o2));
  }, u = function(e4) {
    var t3 = KEY_MAP[e4.keyCode] || e4.keyCode;
    r2[t3] && (e4.stopPropagation(), i2(o2), a2 = true);
  };
  return e3.addEventListener("keydown", l2), e3.addEventListener("keyup", u), { enable: function() {
    c2.enabled || (e3.addEventListener("keydown", l2), e3.addEventListener("keyup", u)), c2.enabled = true;
  }, disable: function() {
    c2.enabled && (e3.removeEventListener("keydown", l2), e3.removeEventListener("keyup", u)), c2.enabled = false;
  }, destroy: function() {
    e3.removeEventListener("keydown", l2), e3.removeEventListener("keyup", u);
  } };
};
var createPreviewImage2 = function(e3, t2, r2) {
  var n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 1, i2 = arguments.length > 4 ? arguments[4] : void 0;
  t2 = Math.round(t2), r2 = Math.round(r2);
  var o2 = i2 || document.createElement("canvas"), a2 = o2.getContext("2d");
  return n >= 5 && n <= 8 ? (o2.width = r2, o2.height = t2) : (o2.width = t2, o2.height = r2), a2.save(), -1 !== n && a2.transform.apply(a2, getImageOrientationMatrix2(t2, r2, n)), a2.drawImage(e3, 0, 0, t2, r2), a2.restore(), o2;
};
var BitmapWorker2 = function() {
  self.onmessage = function(e3) {
    createImageBitmap(e3.data.message.file).then(function(t2) {
      self.postMessage({ id: e3.data.id, message: t2 }, [t2]);
    });
  };
};
var isBitmap2 = function(e3) {
  return /^image/.test(e3.type) && !/svg/.test(e3.type);
};
var canCreateImageBitmap = function(e3) {
  var t2 = window.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
  return !((t2 ? parseInt(t2[1]) : null) <= 58) && ("createImageBitmap" in window && isBitmap2(e3));
};
var loadImage$2 = function(e3) {
  return new Promise(function(t2, r2) {
    var n = new Image();
    n.onload = function() {
      t2(n);
    }, n.onerror = function(e4) {
      r2(e4);
    }, n.src = e3;
  });
};
var compileShader = function(e3, t2, r2) {
  var n = e3.createShader(r2);
  return e3.shaderSource(n, t2), e3.compileShader(n), n;
};
var createProgram = function(e3, t2, r2) {
  var n = e3.createProgram();
  return e3.attachShader(n, compileShader(e3, t2, e3.VERTEX_SHADER)), e3.attachShader(n, compileShader(e3, r2, e3.FRAGMENT_SHADER)), e3.linkProgram(n), n;
};
var createTexture = function(e3, t2, r2, n, i2) {
  var o2 = e3.createTexture();
  e3.activeTexture(e3.TEXTURE0 + n), e3.bindTexture(e3.TEXTURE_2D, o2), e3.texParameteri(e3.TEXTURE_2D, e3.TEXTURE_MIN_FILTER, e3.LINEAR), e3.texParameteri(e3.TEXTURE_2D, e3.TEXTURE_MAG_FILTER, e3.LINEAR), e3.texParameteri(e3.TEXTURE_2D, e3.TEXTURE_WRAP_S, e3.CLAMP_TO_EDGE), e3.texParameteri(e3.TEXTURE_2D, e3.TEXTURE_WRAP_T, e3.CLAMP_TO_EDGE), e3.uniform1i(t2, n), e3.uniform2f(r2, i2.width, i2.height);
  try {
    e3.texImage2D(e3.TEXTURE_2D, 0, e3.RGBA, e3.RGBA, e3.UNSIGNED_BYTE, i2);
  } catch (t3) {
    e3.texImage2D(e3.TEXTURE_2D, 0, e3.RGBA, i2.width, i2.height, 0, e3.RGBA, e3.UNSIGNED_BYTE, null);
  }
  return o2;
};
var create2 = function() {
  var e3 = new Float32Array(16);
  return e3[0] = 1, e3[5] = 1, e3[10] = 1, e3[15] = 1, e3;
};
var perspective = function(e3, t2, r2, n, i2) {
  var o2 = 1 / Math.tan(t2 / 2), a2 = 1 / (n - i2);
  e3[0] = o2 / r2, e3[1] = 0, e3[2] = 0, e3[3] = 0, e3[4] = 0, e3[5] = o2, e3[6] = 0, e3[7] = 0, e3[8] = 0, e3[9] = 0, e3[11] = -1, e3[12] = 0, e3[13] = 0, e3[15] = 0, e3[10] = (i2 + n) * a2, e3[14] = 2 * i2 * n * a2;
};
var translate = function(e3, t2) {
  var r2 = t2[0], n = t2[1], i2 = t2[2];
  e3[12] = e3[0] * r2 + e3[4] * n + e3[8] * i2 + e3[12], e3[13] = e3[1] * r2 + e3[5] * n + e3[9] * i2 + e3[13], e3[14] = e3[2] * r2 + e3[6] * n + e3[10] * i2 + e3[14], e3[15] = e3[3] * r2 + e3[7] * n + e3[11] * i2 + e3[15];
};
var scale = function(e3, t2) {
  var r2 = t2[0], n = t2[1], i2 = t2[2];
  e3[0] = e3[0] * r2, e3[1] = e3[1] * r2, e3[2] = e3[2] * r2, e3[3] = e3[3] * r2, e3[4] = e3[4] * n, e3[5] = e3[5] * n, e3[6] = e3[6] * n, e3[7] = e3[7] * n, e3[8] = e3[8] * i2, e3[9] = e3[9] * i2, e3[10] = e3[10] * i2, e3[11] = e3[11] * i2;
};
var rotateX = function(e3, t2) {
  var r2 = Math.sin(t2), n = Math.cos(t2), i2 = e3[4], o2 = e3[5], a2 = e3[6], c2 = e3[7], l2 = e3[8], u = e3[9], s2 = e3[10], d = e3[11];
  e3[4] = i2 * n + l2 * r2, e3[5] = o2 * n + u * r2, e3[6] = a2 * n + s2 * r2, e3[7] = c2 * n + d * r2, e3[8] = l2 * n - i2 * r2, e3[9] = u * n - o2 * r2, e3[10] = s2 * n - a2 * r2, e3[11] = d * n - c2 * r2;
};
var rotateY = function(e3, t2) {
  var r2 = Math.sin(t2), n = Math.cos(t2), i2 = e3[0], o2 = e3[1], a2 = e3[2], c2 = e3[3], l2 = e3[8], u = e3[9], s2 = e3[10], d = e3[11];
  e3[0] = i2 * n - l2 * r2, e3[1] = o2 * n - u * r2, e3[2] = a2 * n - s2 * r2, e3[3] = c2 * n - d * r2, e3[8] = i2 * r2 + l2 * n, e3[9] = o2 * r2 + u * n, e3[10] = a2 * r2 + s2 * n, e3[11] = c2 * r2 + d * n;
};
var rotateZ = function(e3, t2) {
  var r2 = Math.sin(t2), n = Math.cos(t2), i2 = e3[0], o2 = e3[1], a2 = e3[2], c2 = e3[3], l2 = e3[4], u = e3[5], s2 = e3[6], d = e3[7];
  e3[0] = i2 * n + l2 * r2, e3[1] = o2 * n + u * r2, e3[2] = a2 * n + s2 * r2, e3[3] = c2 * n + d * r2, e3[4] = l2 * n - i2 * r2, e3[5] = u * n - o2 * r2, e3[6] = s2 * n - a2 * r2, e3[7] = d * n - c2 * r2;
};
var mat4 = { create: create2, perspective, translate, scale, rotateX, rotateY, rotateZ };
var degToRad = function(e3) {
  return e3 * Math.PI / 180;
};
var imageFragmentShader = "\nprecision mediump float;\n\nuniform sampler2D uTexture;\nuniform vec2 uTextureSize;\n\nuniform float uColorOpacity;\nuniform mat4 uColorMatrix;\nuniform vec4 uColorOffset;\n\nuniform vec4 uOverlayColor;\nuniform vec2 uOverlayLeftTop;\nuniform vec2 uOverlayRightBottom;\n\nvarying vec2 vTexCoord;\nvarying vec4 vPosition;\n\nvoid main () {\n\n    vec3 cB = vec3(1.0);\n\n	vec4 cF = texture2D(uTexture, vTexCoord);\n	\n	vec4 cM = (cF * uColorMatrix) + uColorOffset;\n\n    float r = max(0.0, cM.r * cM.a) + (cB.r * (1.0 - cM.a));\n    float g = max(0.0, cM.g * cM.a) + (cB.g * (1.0 - cM.a));\n    float b = max(0.0, cM.b * cM.a) + (cB.b * (1.0 - cM.a));\n\n	vec4 color = vec4(r, g, b, cF.a);\n	\n	// test if falls within\n    if ((gl_FragCoord.x < uOverlayLeftTop.x || gl_FragCoord.x > uOverlayRightBottom.x) || \n        (gl_FragCoord.y > uOverlayLeftTop.y || gl_FragCoord.y < uOverlayRightBottom.y)) {\n		color *= uOverlayColor;\n	}\n	\n    gl_FragColor = color * uColorOpacity;\n}\n";
var imageVertexShader = "\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\n\n// send to fragment shader\nvarying vec2 vTexCoord;\nvarying vec4 vPosition;\n\nvoid main () {\n    vPosition = uMatrix * aPosition;\n    gl_Position = vPosition;\n    vTexCoord = aTexCoord;\n}\n";
var backgroundFragmentShader = "\nprecision mediump float;\n\nuniform vec2 uViewportSize;\nuniform vec3 uColorStart;\nuniform vec3 uColorEnd;\nuniform vec2 uOverlayLeftTop;\nuniform vec2 uOverlayRightBottom;\nuniform vec4 uColorCanvasBackground;\n\nvoid main() {\n\n	float x = gl_FragCoord.x;\n	float y = gl_FragCoord.y;\n\n	vec2 center = vec2(.5, .5);\n	vec2 st = vec2(x / uViewportSize.x, y / uViewportSize.y);\n	float mixValue = distance(st, center) * 1.5; // expand outside view (same as doka--root::after)\n	vec3 color = mix(uColorStart, uColorEnd, mixValue);\n\n	if (uColorCanvasBackground[3] == 1.0) {\n\n		float innerLeft = uOverlayLeftTop.x;\n		float innerRight = uOverlayRightBottom.x;\n		float innerTop = uOverlayRightBottom.y;\n		float innerBottom = uOverlayLeftTop.y;\n\n		if (x < innerLeft || x > innerRight || y < innerTop || y > innerBottom) {\n			gl_FragColor = vec4(color, 1.0);\n			return;\n		}\n\n		gl_FragColor = uColorCanvasBackground;\n		return;\n	}\n	\n	gl_FragColor = vec4(color, 1.0);\n}\n";
var outlineFragmentShader = "\nprecision mediump float;\n\nuniform vec2 uOverlayLeftTop;\nuniform vec2 uOverlayRightBottom;\nuniform vec4 uOutlineColor;\nuniform float uOutlineWidth;\n\nvoid main() {\n\n	float x = gl_FragCoord.x;\n	float y = gl_FragCoord.y;\n\n	float innerLeft = uOverlayLeftTop.x;\n	float innerRight = uOverlayRightBottom.x;\n	float innerTop = uOverlayRightBottom.y;\n	float innerBottom = uOverlayLeftTop.y;\n\n	float outerLeft = innerLeft - uOutlineWidth;\n	float outerRight = innerRight + uOutlineWidth;\n	float outerTop = innerTop - uOutlineWidth;\n	float outerBottom = innerBottom + uOutlineWidth;\n	\n	if (x < outerLeft || x >= outerRight || y < outerTop || y >= outerBottom) {\n		discard;\n	}\n\n	if (x < innerLeft || x >= innerRight || y < innerTop || y >= innerBottom) {\n		gl_FragColor = uOutlineColor;\n	}\n}\n";
var simpleVertexShader = "\nattribute vec4 aPosition;\nvoid main() {\n	gl_Position = aPosition;\n}\n";
var setup = function(e3, t2, r2) {
  var n = { width: 0, height: 0 }, i2 = { x: 0, y: 0 }, o2 = null, a2 = degToRad(30), c2 = Math.tan(a2 / 2), l2 = { antialias: false, alpha: false }, u = e3.getContext("webgl", l2) || e3.getContext("experimental-webgl", l2);
  if (!u) return null;
  u.enable(u.BLEND), u.blendFunc(u.SRC_ALPHA, u.ONE_MINUS_SRC_ALPHA);
  var s2 = createProgram(u, simpleVertexShader, backgroundFragmentShader), d = u.getUniformLocation(s2, "uColorStart"), p = u.getUniformLocation(s2, "uColorEnd"), f2 = u.getUniformLocation(s2, "uViewportSize"), h = u.getAttribLocation(s2, "aPosition"), g = u.getUniformLocation(s2, "uOverlayLeftTop"), m = u.getUniformLocation(s2, "uOverlayRightBottom"), v = u.getUniformLocation(s2, "uColorCanvasBackground"), y = u.createBuffer(), E = new Float32Array([1, -1, 1, 1, -1, -1, -1, 1]);
  u.bindBuffer(u.ARRAY_BUFFER, y), u.bufferData(u.ARRAY_BUFFER, E, u.STATIC_DRAW), u.bindBuffer(u.ARRAY_BUFFER, null);
  var T = createProgram(u, simpleVertexShader, outlineFragmentShader), _ = u.getAttribLocation(T, "aPosition"), R = u.getUniformLocation(T, "uOutlineWidth"), w = u.getUniformLocation(T, "uOutlineColor"), A = u.getUniformLocation(T, "uOverlayLeftTop"), I = u.getUniformLocation(T, "uOverlayRightBottom"), S = u.createBuffer(), C = new Float32Array([1, -1, 1, 1, -1, -1, -1, 1]);
  u.bindBuffer(u.ARRAY_BUFFER, S), u.bufferData(u.ARRAY_BUFFER, C, u.STATIC_DRAW), u.bindBuffer(u.ARRAY_BUFFER, null);
  var O = createProgram(u, imageVertexShader, imageFragmentShader);
  u.useProgram(O);
  var x = u.getUniformLocation(O, "uMatrix"), b = u.getUniformLocation(O, "uTexture"), M = u.getUniformLocation(O, "uTextureSize"), L = u.getUniformLocation(O, "uOverlayColor"), P = u.getUniformLocation(O, "uOverlayLeftTop"), G = u.getUniformLocation(O, "uOverlayRightBottom"), k = u.getUniformLocation(O, "uColorOpacity"), D = u.getUniformLocation(O, "uColorOffset"), U = u.getUniformLocation(O, "uColorMatrix"), B = u.getAttribLocation(O, "aPosition"), V = u.getAttribLocation(O, "aTexCoord"), N = createTexture(u, b, M, 0, t2), F = t2.width * r2, z = t2.height * r2, W = -0.5 * F, q = 0.5 * z, H = 0.5 * F, Y = -0.5 * z, j = new Float32Array([W, q, W, Y, H, q, H, Y]), X2 = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]), Z = j.length / 2, $ = u.createBuffer();
  u.bindBuffer(u.ARRAY_BUFFER, $), u.bufferData(u.ARRAY_BUFFER, j, u.STATIC_DRAW), u.bindBuffer(u.ARRAY_BUFFER, null);
  var K = u.createBuffer();
  u.bindBuffer(u.ARRAY_BUFFER, K), u.bufferData(u.ARRAY_BUFFER, X2, u.STATIC_DRAW), u.bindBuffer(u.ARRAY_BUFFER, null);
  var Q = 0, J = 0, ee = { release: function() {
    e3.width = 1, e3.height = 1;
  }, resize: function(t3, a3) {
    e3.width = t3 * r2, e3.height = a3 * r2, e3.style.width = "".concat(t3, "px"), e3.style.height = "".concat(a3, "px"), n.width = t3 * r2, n.height = a3 * r2, i2.x = 0.5 * n.width, i2.y = 0.5 * n.height, o2 = n.width / n.height, u.viewport(0, 0, u.canvas.width, u.canvas.height);
  }, update: function(e4, l3, E2, C2, b2, M2, F2, z2, W2, q2, H2, Y2, j2, X3, te, re, ne, ie, oe) {
    var ae = H2 ? H2.height * r2 : n.height;
    Q = t2.width * r2, J = t2.height * r2, e4 *= r2, l3 *= r2, E2 *= r2, C2 *= r2;
    var ce = J / 2 / c2 * (n.height / ae) * -1;
    ce /= -c2 * ce * 2 / n.height;
    var le = 0.5 * Q, ue = 0.5 * J;
    e4 -= le, l3 -= ue;
    var se = z2, de = -(i2.x - le) + E2, pe = i2.y - ue - C2, fe = mat4.create();
    mat4.perspective(fe, a2, o2, 1, 2 * -ce), mat4.translate(fe, [de, pe, ce]), mat4.translate(fe, [e4, -l3, 0]), mat4.scale(fe, [se, se, se]), mat4.rotateZ(fe, -F2), mat4.translate(fe, [-e4, l3, 0]), mat4.rotateY(fe, M2), mat4.rotateX(fe, b2), u.clearColor(X3[0], X3[1], X3[2], 1), u.clear(u.COLOR_BUFFER_BIT);
    var he = Y2.x * r2, ge = Y2.y * r2, me = Y2.width * r2, ve = Y2.height * r2, ye = he, Ee = ye + me, Te = n.height - ge, _e = n.height - (ge + ve);
    u.useProgram(s2), u.uniform3fv(d, te), u.uniform3fv(p, re), u.uniform4fv(v, oe.map(function(e5, t3) {
      return t3 < 3 ? e5 / 255 : e5;
    })), u.uniform2f(f2, n.width, n.height), u.uniform2f(g, ye, Te), u.uniform2f(m, Ee, _e), u.bindBuffer(u.ARRAY_BUFFER, y), u.vertexAttribPointer(h, 2, u.FLOAT, false, 0, 0), u.enableVertexAttribArray(h), u.drawArrays(u.TRIANGLE_STRIP, 0, 4), u.useProgram(O), u.bindFramebuffer(u.FRAMEBUFFER, null), u.bindTexture(u.TEXTURE_2D, N), u.bindBuffer(u.ARRAY_BUFFER, $), u.vertexAttribPointer(B, 2, u.FLOAT, false, 0, 0), u.enableVertexAttribArray(B), u.bindBuffer(u.ARRAY_BUFFER, K), u.vertexAttribPointer(V, 2, u.FLOAT, false, 0, 0), u.enableVertexAttribArray(V), u.uniformMatrix4fv(x, false, fe), u.uniform2f(P, ye, Te), u.uniform2f(G, Ee, _e), u.uniform4fv(L, j2), u.uniform1f(k, q2), u.uniform4f(D, W2[4], W2[9], W2[14], W2[19]), u.uniformMatrix4fv(U, false, [].concat(_toConsumableArray(W2.slice(0, 4)), _toConsumableArray(W2.slice(5, 9)), _toConsumableArray(W2.slice(10, 14)), _toConsumableArray(W2.slice(15, 19)))), u.drawArrays(u.TRIANGLE_STRIP, 0, Z), u.useProgram(T), u.uniform1f(R, ne), u.uniform4fv(w, ie), u.uniform2f(A, ye, Te), u.uniform2f(I, Ee, _e), u.bindBuffer(u.ARRAY_BUFFER, S), u.vertexAttribPointer(_, 2, u.FLOAT, false, 0, 0), u.enableVertexAttribArray(_), u.drawArrays(u.TRIANGLE_STRIP, 0, 4), ee.onupdate(u);
  }, onupdate: function() {
  } };
  return ee;
};
var createSpringRect = function(e3) {
  var t2 = 0, r2 = {}, n = spring2(e3), i2 = spring2(e3), o2 = spring2(e3), a2 = spring2(e3);
  return n.onupdate = function(e4) {
    return r2.x = e4;
  }, n.oncomplete = function() {
    return t2++;
  }, i2.onupdate = function(e4) {
    return r2.y = e4;
  }, i2.oncomplete = function() {
    return t2++;
  }, o2.onupdate = function(e4) {
    return r2.width = e4;
  }, o2.oncomplete = function() {
    return t2++;
  }, a2.onupdate = function(e4) {
    return r2.height = e4;
  }, a2.oncomplete = function() {
    return t2++;
  }, { interpolate: function(e4) {
    n.interpolate(e4), i2.interpolate(e4), o2.interpolate(e4), a2.interpolate(e4);
  }, setTarget: function(e4) {
    t2 = 0, n.target = e4 ? e4.x : null, i2.target = e4 ? e4.y : null, o2.target = e4 ? e4.width : null, a2.target = e4 ? e4.height : null;
  }, getRect: function() {
    return r2;
  }, isStable: function() {
    return 4 === t2;
  } };
};
var createSpringColor = function(e3) {
  var t2 = 0, r2 = {}, n = spring2(e3), i2 = spring2(e3), o2 = spring2(e3);
  return n.onupdate = function(e4) {
    return r2.r = e4;
  }, n.oncomplete = function() {
    return t2++;
  }, i2.onupdate = function(e4) {
    return r2.g = e4;
  }, i2.oncomplete = function() {
    return t2++;
  }, o2.onupdate = function(e4) {
    return r2.b = e4;
  }, o2.oncomplete = function() {
    return t2++;
  }, { interpolate: function(e4) {
    n.interpolate(e4), i2.interpolate(e4), o2.interpolate(e4);
  }, setTarget: function(e4) {
    t2 = 0, n.target = e4 ? e4[0] : null, i2.target = e4 ? e4[1] : null, o2.target = e4 ? e4[2] : null;
  }, getColor: function() {
    return [r2.r, r2.g, r2.b];
  }, isStable: function() {
    return 3 === t2;
  } };
};
var ColorSpring = { stiffness: 0.25, damping: 0.25, mass: 2.5 };
var IdentityMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
var imageGL = createView2({ name: "image-gl", ignoreRect: true, ignoreRectUpdate: true, mixins: { apis: ["top", "left", "width", "height", "xOrigin", "yOrigin", "xTranslation", "yTranslation", "xRotation", "yRotation", "zRotation", "scale", "overlay", "stage", "colorMatrix", "colorOpacity", "overlayOpacity", "outlineWidth", "isDraft"], animations: { xTranslation: imageOverlaySpring, yTranslation: imageOverlaySpring, xOrigin: imageOverlaySpring, yOrigin: imageOverlaySpring, scale: imageOverlaySpring, xRotation: { type: "spring", stiffness: 0.25, damping: 0.25, mass: 2.5 }, yRotation: { type: "spring", stiffness: 0.25, damping: 0.25, mass: 2.5 }, zRotation: { type: "spring", stiffness: 0.25, damping: 0.25, mass: 2.5 }, colorOpacity: { type: "tween", delay: 150, duration: 750 }, overlayOpacity: "spring", introScale: { type: "spring", stiffness: 0.25, damping: 0.75, mass: 15 }, outlineWidth: imageOverlaySpring } }, create: function(e3) {
  var t2 = e3.root;
  t2.ref.canvas = document.createElement("canvas"), t2.ref.canvas.width = 0, t2.ref.canvas.height = 0, t2.appendChild(t2.ref.canvas), t2.ref.gl = null, t2.introScale = 1, t2.ref.isPreview = "preview" === t2.query("GET_STYLE_LAYOUT_MODE"), t2.ref.shouldZoom = !t2.ref.isPreview, t2.ref.didZoom = false, t2.ref.backgroundColor = null, t2.ref.backgroundColorSpring = createSpringColor(ColorSpring), t2.ref.backgroundColorCenter = null, t2.ref.backgroundColorCenterSpring = createSpringColor(ColorSpring), t2.ref.overlaySpring = createSpringRect(imageOverlaySpring), t2.ref.stageSpring = createSpringRect(imageOverlaySpring), t2.ref.outlineSpring = spring2(imageOverlaySpring), t2.ref.colorMatrixSpring = [], t2.ref.colorMatrixStable = true, t2.ref.colorMatrixStableCount = 0, t2.ref.colorMatrixPositions = [];
  for (var r2 = 0; r2 < 20; r2++) !(function() {
    var e4 = r2, n2 = spring2(ColorSpring);
    n2.target = IdentityMatrix[e4], n2.onupdate = function(r3) {
      t2.ref.colorMatrixPositions[e4] = r3;
    }, n2.oncomplete = function() {
      t2.ref.colorMatrixStableCount++;
    }, t2.ref.colorMatrixSpring[e4] = n2;
  })();
  t2.ref.dragger = createDragger(t2.element, function() {
    t2.dispatch("CROP_IMAGE_DRAG_GRAB");
  }, function(e4, r3) {
    t2.dispatch("CROP_IMAGE_DRAG", { value: r3 });
  }, function() {
    t2.dispatch("CROP_IMAGE_DRAG_RELEASE");
  }, { cancelOnMultiple: true });
  var n = 0, i2 = 0;
  t2.ref.keyboard = createKeyboard(t2.element, function() {
    return n = 0, i2 = 0, { x: 0, y: 0 };
  }, { up: function(e4) {
    e4.y -= 20;
  }, down: function(e4) {
    e4.y += 20;
  }, left: function(e4) {
    e4.x -= 20;
  }, right: function(e4) {
    e4.x += 20;
  }, plus: function() {
    n += 0.1, t2.dispatch("CROP_IMAGE_RESIZE_AMOUNT", { value: n }), t2.dispatch("CROP_IMAGE_RESIZE_RELEASE");
  }, minus: function() {
    n -= 0.1, t2.dispatch("CROP_IMAGE_RESIZE_AMOUNT", { value: n }), t2.dispatch("CROP_IMAGE_RESIZE_RELEASE");
  }, left_bracket: function() {
    i2 -= Math.PI / 128, t2.dispatch("CROP_IMAGE_ROTATE_ADJUST", { value: i2 });
  }, right_bracket: function() {
    i2 += Math.PI / 128, t2.dispatch("CROP_IMAGE_ROTATE_ADJUST", { value: i2 });
  }, h: function() {
    t2.dispatch("CROP_IMAGE_FLIP_HORIZONTAL");
  }, l: function() {
    t2.dispatch("CROP_IMAGE_ROTATE_LEFT");
  }, q: function() {
    t2.dispatch("CROP_RESET");
  }, r: function() {
    t2.dispatch("CROP_IMAGE_ROTATE_RIGHT");
  }, v: function() {
    t2.dispatch("CROP_IMAGE_FLIP_VERTICAL");
  }, z: function() {
    t2.dispatch("CROP_ZOOM");
  } }, function(e4) {
    e4 && t2.dispatch("CROP_IMAGE_DRAG", { value: e4 });
  }, function(e4) {
    e4 && t2.dispatch("CROP_IMAGE_DRAG_RELEASE");
  });
  var o2 = t2.query("GET_FILE"), a2 = URL.createObjectURL(o2.data), c2 = function(e4) {
    var r3 = scaleImageSize(e4, { width: t2.query("GET_MAX_IMAGE_PREVIEW_WIDTH"), height: t2.query("GET_MAX_IMAGE_PREVIEW_HEIGHT") }), n2 = createPreviewImage2(e4, r3.width, r3.height, o2.orientation), i3 = Math.max(1, 0.75 * window.devicePixelRatio), a3 = n2.height / n2.width, c3 = 96 * i3, l3 = createPreviewImage2(n2, a3 > 1 ? c3 : c3 / a3, a3 > 1 ? c3 * a3 : c3), u2 = n2.getContext("2d").getImageData(0, 0, n2.width, n2.height), s2 = l3.getContext("2d").getImageData(0, 0, l3.width, l3.height);
    canvasRelease2(n2), canvasRelease2(l3), t2.ref.gl = setup(t2.ref.canvas, u2, i3);
    var d = t2.query("GET_OUTPUT_CANVAS_SYNC_TARGET");
    d && (t2.ref.gl.onupdate = function() {
      var e5 = t2.ref.overlaySpring.getRect();
      d.getContext("2d").drawImage(t2.ref.canvas, e5.x * i3, e5.y * i3, e5.width * i3, e5.height * i3, 0, 0, d.width, d.height);
    }), t2.ref.gl ? (t2.dispatch("DID_RECEIVE_IMAGE_DATA", { previewData: u2, thumbData: s2 }), t2.dispatch("DID_PRESENT_IMAGE")) : t2.dispatch("MISSING_WEBGL");
  }, l2 = function() {
    loadImage$2(a2).then(c2);
  };
  if (canCreateImageBitmap(o2.data)) {
    var u = createWorker3(BitmapWorker2);
    u.post({ file: o2.data }, function(e4) {
      u.terminate(), e4 ? c2(e4) : l2();
    });
  } else l2();
  t2.ref.canvasStyle = getComputedStyle(t2.ref.canvas), t2.ref.previousBackgroundColor, t2.ref.previousLeft, t2.ref.previousTop, t2.ref.previousWidth, t2.ref.previousHeight, t2.element.dataset.showInteractionIndicator = false, t2.ref.handleFocus = function(e4) {
    9 === e4.keyCode && (t2.element.dataset.showInteractionIndicator = true);
  }, t2.ref.handleBlur = function(e4) {
    t2.element.dataset.showInteractionIndicator = false;
  }, addEvent2(t2.element)("keyup", t2.ref.handleFocus), addEvent2(t2.element)("blur", t2.ref.handleBlur);
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.ref.gl && (t2.ref.gl.release(), t2.ref.gl = null), t2.ref.dragger.destroy(), removeEvent2(t2.element)("keyup", t2.ref.handleFocus), removeEvent2(t2.element)("blur", t2.ref.handleBlur);
}, read: function(e3) {
  var t2 = e3.root, r2 = t2.ref.canvasStyle.backgroundColor, n = t2.ref.canvasStyle.color;
  if ("transparent" !== n && "" !== n || (n = null), "transparent" !== r2 && "" !== r2 || (r2 = null), r2 && r2 !== t2.ref.previousBackgroundColor) {
    var i2 = toRGBColorArray(r2).map(function(e4) {
      return e4 / 255;
    }), o2 = (i2[0] + i2[1] + i2[2]) / 3;
    t2.ref.backgroundColor = i2, t2.ref.backgroundColorCenter = i2.map(function(e4) {
      return o2 > 0.5 ? e4 - 0.15 : e4 + 0.15;
    }), t2.ref.previousBackgroundColor = r2;
  }
  n && n !== t2.ref.previousOutlineColor && (t2.ref.outlineColor = toRGBColorArray(n).map(function(e4) {
    return e4 / 255;
  }).concat(1), t2.ref.previousOutlineColor = n);
}, write: createRoute2({ SHOW_VIEW: function(e3) {
  var t2 = e3.root;
  "crop" === e3.action.id ? (t2.ref.dragger.enable(), t2.element.setAttribute("tabindex", "0")) : (t2.ref.dragger.disable(), t2.element.removeAttribute("tabindex"));
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = (e3.actions, e3.timestamp);
  if (t2.ref.gl && r2.width && r2.height) {
    var i2 = t2.ref, o2 = i2.gl, a2 = i2.previousWidth, c2 = i2.previousHeight, l2 = i2.shouldZoom, u = i2.stageSpring, s2 = i2.overlaySpring, d = i2.backgroundColorSpring, p = i2.backgroundColorCenterSpring;
    r2.width === a2 && r2.height === c2 || (t2.ref.gl.resize(r2.width, r2.height), t2.ref.previousWidth = r2.width, t2.ref.previousHeight = r2.height), r2.left === t2.ref.previousLeft && r2.top === t2.ref.previousTop || (t2.ref.canvas.style.transform = "translate(".concat(-r2.left, "px, ").concat(-r2.top, "px)"), t2.ref.previousLeft = r2.left, t2.ref.previousTop = r2.top), l2 && !t2.ref.didZoom && (t2.introScale = null, t2.introScale = 1.15, t2.introScale = 1, t2.ref.didZoom = true), d.setTarget(t2.ref.backgroundColor), d.interpolate(n);
    var f2 = d.isStable();
    p.setTarget(t2.ref.backgroundColorCenter), p.interpolate(n);
    var h = p.isStable();
    t2.ref.colorMatrixStableCount = 0;
    var g = r2.colorMatrix || IdentityMatrix, m = t2.ref.colorMatrixSpring.map(function(e4, r3) {
      return e4.target = g[r3], e4.interpolate(n), t2.ref.colorMatrixPositions[r3];
    }), v = 20 === t2.ref.colorMatrixStableCount;
    r2.isDraft && s2.setTarget(null), s2.setTarget(r2.overlay), s2.interpolate(n);
    var y = s2.isStable();
    r2.isDraft && u.setTarget(null), u.setTarget(r2.stage), u.interpolate(n);
    var E = u.isStable();
    return o2.update(t2.xOrigin, t2.yOrigin, t2.xTranslation + r2.left, t2.yTranslation + r2.top, t2.xRotation, t2.yRotation, t2.zRotation, t2.scale * t2.introScale, m, t2.ref.isPreview ? 1 : t2.colorOpacity, u.getRect(), s2.getRect(), [1, 1, 1, 1 - t2.overlayOpacity], d.getColor(), p.getColor(), d.getColor(), t2.outlineWidth, t2.ref.outlineColor, t2.query("GET_BACKGROUND_COLOR")), y && E && v && f2 && h;
  }
}) });
var image = createView2({ name: "image", ignoreRect: true, mixins: { apis: ["offsetTop"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.ref.imageGL = t2.appendChildView(t2.createChildView(imageGL)), /markup|sticker/.test(t2.query("GET_UTILS")) && (t2.ref.markup = t2.appendChildView(t2.createChildView(imageMarkup, { id: r2.id, opacity: 0, onSelect: function(e4) {
    t2.dispatch("MARKUP_SELECT", { id: e4 });
  }, onDrag: function(e4, r3, n, i2, o2) {
    t2.dispatch("MARKUP_ELEMENT_DRAG", { id: e4, origin: r3, offset: n, size: i2, scale: o2 });
  }, onResize: function(e4, r3, n, i2, o2) {
    t2.dispatch("MARKUP_ELEMENT_RESIZE", { id: e4, corner: r3, origin: n, offset: i2, size: o2 });
  }, onUpdate: function(e4, r3) {
    t2.dispatch("MARKUP_UPDATE", { style: e4, value: r3 });
  }, isMarkupUtil: function(e4) {
    var t3 = e4;
    do {
      if ("doka--markup-tools" === t3.className) return true;
    } while (t3 = t3.parentNode);
    return false;
  } }))), t2.ref.isModal = /modal/.test(t2.query("GET_STYLE_LAYOUT_MODE"));
}, write: createRoute2({ DID_PRESENT_IMAGE: function(e3) {
  e3.root.ref.imageGL.colorOpacity = 1;
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp, i2 = t2.ref.imageGL, o2 = t2.ref.markup, a2 = t2.query("GET_CROP", r2.id, n);
  if (a2) {
    var c2 = a2.isDraft, l2 = a2.cropRect, u = a2.cropStatus, s2 = a2.origin, d = a2.translation, p = a2.translationBand, f2 = a2.scale, h = a2.scaleBand, g = a2.rotation, m = a2.rotationBand, v = a2.flip, y = a2.colorMatrix, E = t2.query("GET_ROOT"), T = t2.query("GET_STAGE"), _ = T.x, R = T.y;
    c2 && (i2.scale = null, i2.zRotation = null, i2.xTranslation = null, i2.yTranslation = null, i2.xOrigin = null, i2.yOrigin = null), i2.colorMatrix = y;
    var w = t2.query("IS_ACTIVE_VIEW", "crop"), A = t2.query("IS_ACTIVE_VIEW", "markup") || t2.query("IS_ACTIVE_VIEW", "sticker"), I = w ? 0.75 : 0.95, S = _objectSpread({}, l2), C = 1, O = w ? 1 : 5;
    if (t2.query("IS_ACTIVE_VIEW", "resize")) {
      var x = u.image.width, b = u.image.height;
      C = null === x && null === b ? u.crop.width / l2.width : null === x ? b / l2.height : x / l2.width, C /= window.devicePixelRatio;
      var M = l2.width * C, L = l2.height * C;
      S.x = S.x + (0.5 * l2.width - 0.5 * M), S.y = S.y + (0.5 * l2.height - 0.5 * L), S.width = M, S.height = L;
    }
    var P = t2.ref.isModal ? 0 : E.left, G = t2.ref.isModal ? 0 : E.top, k = t2.ref.isModal ? 0 : E.width - t2.rect.element.width, D = t2.ref.isModal ? 0 : E.height - t2.rect.element.height - r2.offsetTop, U = (f2 + h) * C;
    i2.isDraft = c2, i2.overlayOpacity = I, i2.xOrigin = s2.x, i2.yOrigin = s2.y, i2.xTranslation = d.x + p.x + _, i2.yTranslation = d.y + p.y + R, i2.left = P, i2.top = G + r2.offsetTop, i2.width = t2.rect.element.width + k, i2.height = t2.rect.element.height + D + r2.offsetTop, i2.scale = U, i2.xRotation = v.vertical ? Math.PI : 0, i2.yRotation = v.horizontal ? Math.PI : 0, i2.zRotation = g.main + g.sub + m, i2.stage = { x: T.x + P, y: T.y + G + r2.offsetTop, width: T.width, height: T.height }, i2.overlay = { x: S.x + _ + P, y: S.y + R + G + r2.offsetTop, width: S.width, height: S.height }, i2.outlineWidth = O, o2 && (c2 && (o2.translateX = null, o2.translateY = null, o2.markupX = null, o2.markupY = null, o2.markupWidth = null, o2.markupHeight = null), o2.opacity = w ? 0.3 : 1, o2.stageOffsetX = _, o2.stageOffsetY = R, o2.markupX = S.x + _, o2.markupY = S.y + R, o2.markupWidth = S.width, o2.markupHeight = S.height, o2.allowInteraction = A);
  }
}) });
var createGroup = function() {
  var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "group", t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : ["opacity"], r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  return createView2({ ignoreRect: true, name: e3, mixins: { styles: ["opacity"].concat(_toConsumableArray(t2)), animations: _objectSpread({ opacity: { type: "spring", stiffness: 0.25, damping: 0.5, mass: 5 } }, r2) }, create: function(e4) {
    var t3 = e4.root, r3 = e4.props;
    (r3.controls || []).map(function(e5) {
      var r4 = t3.createChildView(e5.view, e5);
      e5.didCreateView && e5.didCreateView(r4), t3.appendChildView(r4);
    }), r3.element && t3.element.appendChild(r3.element);
  } });
};
var list2 = createView2({ ignoreRect: true, tag: "div", name: "dropdown-list", mixins: { styles: ["translateY", "opacity"], apis: ["selectedValue", "options", "onSelect"], animations: { translateY: "spring", opacity: { type: "tween", duration: 250 } } }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.element.setAttribute("role", "list"), t2.ref.handleClick = function() {
    return r2.action && r2.action();
  }, t2.element.addEventListener("click", t2.ref.handleClick), t2.ref.activeOptions = null, t2.ref.activeSelectedValue;
}, write: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  if (r2.options !== t2.ref.activeOptions && (t2.ref.activeOptions = r2.options, t2.childViews.forEach(function(e4) {
    return t2.removeChildView(e4);
  }), r2.options.map(function(e4) {
    var n2 = t2.createChildView(button, _objectSpread({}, e4, { action: function() {
      return r2.onSelect(e4.value);
    } }));
    return t2.appendChildView(n2);
  })), r2.selectedValue !== t2.ref.activeSelectedValue) {
    t2.ref.activeSelectedValue = r2.selectedValue;
    var n = r2.options.findIndex(function(e4) {
      return "object" === _typeof(e4.value) && r2.selectedValue ? e4.value[0] === e4.label && JSON.stringify(e4.value.slice(1)) === JSON.stringify(r2.selectedValue) || JSON.stringify(e4.value) === JSON.stringify(r2.selectedValue) : e4.value === r2.selectedValue;
    });
    t2.childViews.forEach(function(e4, t3) {
      e4.element.setAttribute("aria-selected", t3 === n);
    });
  }
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.element.removeEventListener("click", t2.ref.handleClick);
} });
var dropdown = createView2({ ignoreRect: true, tag: "div", name: "dropdown", mixins: { styles: ["opacity"], animations: { opacity: "spring" }, apis: ["direction", "selectedValue", "options", "onSelect"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.ref.open = false;
  var n = function(e4) {
    t2.ref.open = e4, t2.dispatch("KICK");
  };
  t2.ref.button = t2.appendChildView(t2.createChildView(button, _objectSpread({}, r2, { action: function() {
    n(!t2.ref.open);
  } }))), t2.ref.list = t2.appendChildView(t2.createChildView(list2, _objectSpread({}, r2, { opacity: 0, action: function() {
    n(false);
  } }))), t2.ref.handleBodyClick = function(e4) {
    contains(t2.element, e4.target) || n(false);
  }, t2.element.addEventListener("focusin", function(e4) {
    e4.target !== t2.ref.button.element && n(true);
  }), t2.element.addEventListener("focusout", function(e4) {
    e4.relatedTarget && (contains(t2.element, e4.relatedTarget) || n(false));
  }), document.body.addEventListener("click", t2.ref.handleBodyClick);
}, destroy: function(e3) {
  var t2 = e3.root;
  document.body.removeEventListener("click", t2.ref.handleBodyClick);
}, write: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  if (t2.ref.list.opacity = t2.ref.open ? 1 : 0, t2.ref.list.selectedValue = r2.selectedValue, t2.ref.list.options = r2.options, "up" === r2.direction) {
    var n = t2.ref.list.rect.element.height;
    t2.ref.list.translateY = (t2.ref.open ? -(n + 5) : -n) - t2.rect.element.height;
  } else t2.ref.list.translateY = t2.ref.open ? 0 : -5;
} });
var MAGIC = 312;
var createDiv = function(e3, t2) {
  return createView2({ name: e3, ignoreRect: true, create: t2 });
};
var cropRotatorLine = createView2({ name: "crop-rotator-line", ignoreRect: true, ignoreRectUpdate: true, mixins: { styles: ["translateX"], animations: { translateX: "spring" } }, create: function(e3) {
  for (var t2 = e3.root, r2 = '<svg viewBox="-90 -5 180 10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">', n = 0; n <= 180; n += 2) {
    var i2 = n * (176 / 180) - 90 + 2, o2 = n % 10 == 0 ? 0.5 : 0.2;
    if (r2 += '<circle fill="currentColor" cx="'.concat(i2, '" cy="').concat(0, '" r="').concat(o2, '"/>'), n % 10 == 0) r2 += '<text fill="currentColor" x="'.concat(i2 + (i2 < 0 ? -2.25 : 0 === i2 ? -0.75 : -1.5), '" y="').concat(3.5, '">').concat(-90 + n, "&deg;</text>");
  }
  r2 += "</svg>", t2.element.innerHTML = r2;
} });
var cropRotator = createView2({ name: "crop-rotator", ignoreRect: true, mixins: { styles: ["opacity", "translateY"], animations: { opacity: { type: "spring", damping: 0.5, mass: 5 }, translateY: "spring" }, apis: ["rotation", "animate", "setAllowInteraction"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.element.setAttribute("tabindex", 0);
  var n = document.createElement("button");
  n.innerHTML = "<span>".concat(t2.query("GET_LABEL_BUTTON_CROP_ROTATE_CENTER"), "</span>"), n.className = "doka--crop-rotator-center", n.addEventListener("click", function() {
    t2.dispatch("CROP_IMAGE_ROTATE_CENTER");
  }), t2.appendChild(n);
  var i2 = null;
  t2.appendChildView(t2.createChildView(createDiv("crop-rotator-line-mask", function(e4) {
    var t3 = e4.root, r3 = e4.props;
    i2 = t3.appendChildView(t3.createChildView(cropRotatorLine, { translateX: Math.round(r3.rotation * MAGIC) }));
  }), r2)), t2.ref.line = i2;
  var o2 = document.createElement("div");
  o2.className = "doka--crop-rotator-bar", t2.appendChild(o2);
  var a2 = Math.PI / 4, c2 = 0;
  t2.ref.dragger = createDragger(o2, function() {
    c2 = i2.translateX / MAGIC, t2.dispatch("CROP_IMAGE_ROTATE_GRAB");
  }, function(e4, r3) {
    var n2 = r3.x / t2.rect.element.width * (Math.PI / 2), i3 = limit2(c2 + n2, -a2, a2);
    t2.dispatch("CROP_IMAGE_ROTATE", { value: -i3 });
  }, function() {
    t2.dispatch("CROP_IMAGE_ROTATE_RELEASE");
  }, { stopPropagation: true }), r2.setAllowInteraction = function(e4) {
    e4 ? t2.ref.dragger.enable() : t2.ref.dragger.disable();
  }, t2.ref.keyboard = createKeyboard(t2.element, function() {
    c2 = 0;
  }, { left: function() {
    c2 += Math.PI / 128, t2.dispatch("CROP_IMAGE_ROTATE_ADJUST", { value: c2 });
  }, right: function() {
    c2 -= Math.PI / 128, t2.dispatch("CROP_IMAGE_ROTATE_ADJUST", { value: c2 });
  } }, function() {
  }, function() {
  }), t2.ref.prevRotation;
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.ref.dragger.destroy(), t2.ref.keyboard.destroy();
}, write: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp, i2 = r2.animate, o2 = r2.rotation;
  if (t2.ref.prevRotation !== o2) {
    t2.ref.prevRotation = o2, i2 || 0 === o2 || (t2.ref.line.translateX = null);
    var a2 = 0, c2 = t2.query("GET_CROP", r2.id, n);
    if (c2 && c2.interaction && c2.interaction.rotation) {
      var l2 = splitRotation(c2.interaction.rotation).sub - o2;
      a2 = 0.025 * Math.sign(l2) * Math.log10(1 + Math.abs(l2) / 0.025);
    }
    t2.ref.line.translateX = Math.round((-o2 - a2) * MAGIC);
  }
} });
var corners = ["nw", "ne", "se", "sw"];
var getOppositeCorner = function(e3) {
  return corners[(corners.indexOf(e3) + 2) % corners.length];
};
var edges = ["n", "e", "s", "w"];
var getOppositeEdge = function(e3) {
  return edges[(edges.indexOf(e3) + 2) % edges.length];
};
var autoPrecision = isBrowser10() && 1 === window.devicePixelRatio ? function(e3) {
  return Math.round(e3);
} : function(e3) {
  return e3;
};
var line = createView2({ ignoreRect: true, ignoreRectUpdate: true, name: "crop-rect-focal-line", mixins: { styles: ["translateX", "translateY", "scaleX", "scaleY", "opacity"], animations: { translateX: "spring", translateY: "spring", scaleX: "spring", scaleY: "spring", opacity: "spring" } } });
var createEdge = function(e3) {
  return createView2({ ignoreRect: true, ignoreRectUpdate: true, tag: "div", name: "crop-rect-edge-".concat(e3), mixins: { styles: ["translateX", "translateY", "scaleX", "scaleY"], apis: ["setAllowInteraction"] }, create: function(t2) {
    var r2 = t2.root, n = t2.props;
    r2.element.classList.add("doka--crop-rect-edge"), r2.element.setAttribute("tabindex", 0), r2.element.setAttribute("role", "button");
    var i2 = e3, o2 = getOppositeEdge(e3);
    r2.ref.dragger = createDragger(r2.element, function() {
      r2.dispatch("CROP_RECT_DRAG_GRAB");
    }, function(e4, t3) {
      return r2.dispatch("CROP_RECT_EDGE_DRAG", { offset: t3, origin: i2, anchor: o2 });
    }, function() {
      return r2.dispatch("CROP_RECT_DRAG_RELEASE");
    }, { stopPropagation: true, cancelOnMultiple: true }), n.setAllowInteraction = function(e4) {
      e4 ? r2.ref.dragger.enable() : r2.ref.dragger.disable();
    }, r2.ref.keyboard = createKeyboard(r2.element, function() {
      return { x: 0, y: 0 };
    }, { up: function(e4) {
      e4.y -= 20;
    }, down: function(e4) {
      e4.y += 20;
    }, left: function(e4) {
      e4.x -= 20;
    }, right: function(e4) {
      e4.x += 20;
    } }, function(e4) {
      r2.dispatch("CROP_RECT_DRAG_GRAB"), r2.dispatch("CROP_RECT_EDGE_DRAG", { offset: e4, origin: i2, anchor: o2 });
    }, function() {
      r2.dispatch("CROP_RECT_DRAG_RELEASE");
    });
  }, destroy: function(e4) {
    var t2 = e4.root;
    t2.ref.keyboard.destroy(), t2.ref.dragger.destroy();
  } });
};
var createCorner = function(e3, t2, r2) {
  return createView2({ ignoreRect: true, ignoreRectUpdate: true, tag: "div", name: "crop-rect-corner-".concat(e3), mixins: { styles: ["translateX", "translateY", "scaleX", "scaleY"], animations: { translateX: imageOverlaySpring, translateY: imageOverlaySpring, scaleX: { type: "spring", delay: r2 }, scaleY: { type: "spring", delay: r2 }, opacity: { type: "spring", delay: t2 } }, apis: ["setAllowInteraction"] }, create: function(t3) {
    var r3 = t3.root, n = t3.props;
    r3.element.classList.add("doka--crop-rect-corner"), r3.element.setAttribute("role", "button"), r3.element.setAttribute("tabindex", -1);
    var i2 = e3, o2 = getOppositeCorner(e3);
    r3.ref.dragger = createDragger(r3.element, function() {
      r3.dispatch("CROP_RECT_DRAG_GRAB");
    }, function(e4, t4) {
      r3.dispatch("CROP_RECT_CORNER_DRAG", { offset: t4, origin: i2, anchor: o2 });
    }, function() {
      r3.dispatch("CROP_RECT_DRAG_RELEASE");
    }, { stopPropagation: true, cancelOnMultiple: true }), n.setAllowInteraction = function(e4) {
      e4 ? r3.ref.dragger.enable() : r3.ref.dragger.disable();
    };
  }, destroy: function(e4) {
    e4.root.ref.dragger.destroy();
  } });
};
var cropRect = createView2({ ignoreRect: true, ignoreRectUpdate: true, name: "crop-rect", mixins: { apis: ["rectangle", "draft", "rotating", "enabled"] }, create: function(e3) {
  var t2 = e3.root;
  t2.ref.wasRotating = false;
  corners.forEach(function(e4, r3) {
    var n = 10 * r3, i2 = 250 + n + 50, o2 = 250 + n;
    t2.ref[e4] = t2.appendChildView(t2.createChildView(createCorner(e4, i2, o2), { opacity: 0, scaleX: 0.5, scaleY: 0.5 }));
  }), edges.forEach(function(e4) {
    t2.ref[e4] = t2.appendChildView(t2.createChildView(createEdge(e4)));
  }), t2.ref.lines = [];
  for (var r2 = 0; r2 < 10; r2++) t2.ref.lines.push(t2.appendChildView(t2.createChildView(line, { opacity: 0 })));
  t2.ref.animationDir = null, t2.ref.previousRotating, t2.ref.previousRect = {}, t2.ref.previousEnabled, t2.ref.previousDraft;
}, write: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = r2.rectangle, i2 = r2.draft, o2 = r2.rotating, a2 = r2.enabled;
  if (n && (!rectEqualsRect(n, t2.ref.previousRect) || o2 !== t2.ref.previousRotating || a2 !== t2.ref.previousEnabled || i2 !== t2.ref.previousDraft)) {
    t2.ref.previousRect = n, t2.ref.previousRotating = o2, t2.ref.previousEnabled = a2, t2.ref.previousDraft = i2;
    var c2 = t2.ref, l2 = c2.n, u = c2.e, s2 = c2.s, d = c2.w, p = c2.nw, f2 = c2.ne, h = c2.se, g = c2.sw, m = c2.lines, v = c2.animationDir, y = n.x, E = n.y, T = n.x + n.width, _ = n.y + n.height, R = _ - E, w = T - y, A = Math.min(w, R);
    t2.element.dataset.indicatorSize = A < 80 ? "none" : "default", edges.forEach(function(e4) {
      return t2.ref[e4].setAllowInteraction(a2);
    }), corners.forEach(function(e4) {
      return t2.ref[e4].setAllowInteraction(a2);
    });
    var I = t2.query("IS_ACTIVE_VIEW", "crop");
    if (I && "in" !== v ? (t2.ref.animationDir = "in", corners.map(function(e4) {
      return t2.ref[e4];
    }).forEach(function(e4) {
      e4.opacity = 1, e4.scaleX = 1, e4.scaleY = 1;
    })) : I || "out" === v || (t2.ref.animationDir = "out", corners.map(function(e4) {
      return t2.ref[e4];
    }).forEach(function(e4) {
      e4.opacity = 0, e4.scaleX = 0.5, e4.scaleY = 0.5;
    })), transformTranslate(i2, p, y, E), transformTranslate(i2, f2, T, E), transformTranslate(i2, h, T, _), transformTranslate(i2, g, y, _), transformTranslateScale(i2, l2, y, E, w / 100, 1), transformTranslateScale(i2, u, T, E, 1, R / 100), transformTranslateScale(i2, s2, y, _, w / 100, 1), transformTranslateScale(i2, d, y, E, 1, R / 100), o2) {
      t2.ref.wasRotating = true;
      var S = m.slice(0, 5), C = 1 / S.length;
      S.forEach(function(e4, t3) {
        transformTranslateScale(i2, e4, y, E + R * (C + t3 * C), w / 100, 0.01), e4.opacity = 0.5;
      });
      var O = m.slice(5);
      C = 1 / O.length, O.forEach(function(e4, t3) {
        transformTranslateScale(i2, e4, y + w * (C + t3 * C), E, 0.01, R / 100), e4.opacity = 0.5;
      });
    } else if (i2) {
      t2.ref.wasRotating = false;
      var x = m[0], b = m[1], M = m[2], L = m[3];
      transformTranslateScale(i2, x, y, E + 0.333 * R, w / 100, 0.01), transformTranslateScale(i2, b, y, E + 0.666 * R, w / 100, 0.01), transformTranslateScale(i2, M, y + 0.333 * w, E, 0.01, R / 100), transformTranslateScale(i2, L, y + 0.666 * w, E, 0.01, R / 100), x.opacity = 0.5, b.opacity = 0.5, M.opacity = 0.5, L.opacity = 0.5;
    } else {
      var P = m[0], G = m[1], k = m[2], D = m[3];
      !t2.ref.wasRotating && P.opacity > 0 && (transformTranslateScale(i2, P, y, E + 0.333 * R, w / 100, 0.01), transformTranslateScale(i2, G, y, E + 0.666 * R, w / 100, 0.01), transformTranslateScale(i2, k, y + 0.333 * w, E, 0.01, R / 100), transformTranslateScale(i2, D, y + 0.666 * w, E, 0.01, R / 100)), m.forEach(function(e4) {
        return e4.opacity = 0;
      });
    }
  }
} });
var transformTranslateScale = function(e3, t2, r2, n, i2, o2) {
  e3 && (t2.translateX = null, t2.translateY = null, t2.scaleX = null, t2.scaleY = null), t2.translateX = autoPrecision(r2), t2.translateY = autoPrecision(n), t2.scaleX = i2, t2.scaleY = o2;
};
var transformTranslate = function(e3, t2, r2, n) {
  e3 && (t2.translateX = null, t2.translateY = null), t2.translateX = autoPrecision(r2), t2.translateY = autoPrecision(n);
};
var setInnerHTML = function(e3, t2) {
  if (!/svg/.test(e3.namespaceURI) || "innerHTML" in e3) e3.innerHTML = t2;
  else {
    var r2 = document.createElement("div");
    r2.innerHTML = "<svg>" + t2 + "</svg>";
    for (var n = r2.firstChild; n.firstChild; ) e3.appendChild(n.firstChild);
  }
};
var cropMask = createView2({ ignoreRect: true, ignoreRectUpdate: true, name: "crop-mask", tag: "svg", mixins: { styles: ["opacity", "translateX", "translateY"], animations: { scale: imageOverlaySpring, maskWidth: imageOverlaySpring, maskHeight: imageOverlaySpring, translateX: imageOverlaySpring, translateY: imageOverlaySpring, opacity: { type: "tween", delay: 0, duration: 1e3 } }, apis: ["rectangle", "animate", "maskWidth", "maskHeight", "scale"] }, create: function(e3) {
  e3.root.ref.writer = null;
}, write: function(e3) {
  var t2 = e3.root, r2 = t2.query("GET_CROP_MASK");
  r2 !== t2.ref.writer && (t2.ref.writer = r2, t2.ref.writerFn = r2 ? r2(t2.element, setInnerHTML) : null, t2.ref.writer || setInnerHTML(t2.element, ""));
}, didWriteView: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = r2.maskWidth, i2 = r2.maskHeight, o2 = r2.scale;
  if (t2.ref.writer && n && i2 && (t2.element.setAttribute("width", autoPrecision(n)), t2.element.setAttribute("height", autoPrecision(i2)), t2.ref.writerFn)) {
    var a2 = t2.query("GET_CROP_MASK_INSET");
    t2.ref.writerFn({ x: o2 * a2, y: o2 * a2, width: n - o2 * a2 * 2, height: i2 - o2 * a2 * 2 }, { width: n, height: i2 });
  }
} });
var updateText$1 = function(e3, t2) {
  var r2 = e3.childNodes[0];
  r2 ? t2 !== r2.nodeValue && (r2.nodeValue = t2) : (r2 = document.createTextNode(t2), e3.appendChild(r2));
};
var sizeSpring = { type: "spring", stiffness: 0.25, damping: 0.1, mass: 1 };
var cropSize = createView2({ ignoreRect: true, name: "crop-size", mixins: { styles: ["translateX", "translateY", "opacity"], animations: { translateX: "spring", translateY: "spring", opacity: "spring", sizeWidth: sizeSpring, sizeHeight: sizeSpring }, apis: ["sizeWidth", "sizeHeight"], listeners: true }, create: function(e3) {
  var t2 = e3.root, r2 = createElement3("span");
  r2.className = "doka--crop-size-info doka--crop-resize-percentage", t2.ref.resizePercentage = r2, t2.appendChild(r2);
  var n = createElement3("span");
  n.className = "doka--crop-size-info";
  var i2 = createElement3("span");
  i2.className = "doka--crop-size-multiply", i2.textContent = "\xD7";
  var o2 = createElement3("span"), a2 = createElement3("span");
  t2.ref.outputWidth = o2, t2.ref.outputHeight = a2, n.appendChild(o2), n.appendChild(i2), n.appendChild(a2), t2.appendChild(n), t2.ref.previousValues = { width: 0, height: 0, percentage: 0 };
}, write: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp;
  if (!(t2.opacity <= 0)) {
    var i2 = t2.query("GET_CROP", r2.id, n);
    if (i2) {
      var o2 = i2.cropStatus, a2 = i2.isDraft, c2 = t2.ref, l2 = c2.outputWidth, u = c2.outputHeight, s2 = c2.resizePercentage, d = c2.previousValues, p = o2.image, f2 = o2.crop, h = o2.currentWidth, g = o2.currentHeight, m = p.width ? Math.round(p.width / f2.width * 100) : 0;
      a2 && (t2.sizeWidth = null, t2.sizeHeight = null), t2.sizeWidth = h, t2.sizeHeight = g;
      var v = Math.round(t2.sizeWidth), y = Math.round(t2.sizeHeight);
      v !== d.width && (updateText$1(l2, v), d.width = v), y !== d.height && (updateText$1(u, y), d.height = y), m !== d.percentage && (p.width ? updateText$1(s2, "".concat(m, "%")) : updateText$1(s2, ""), d.percentage = m);
    }
  }
} });
var wrapper = function(e3, t2) {
  return createView2({ ignoreRect: true, name: e3, mixins: t2, create: function(e4) {
    var t3 = e4.root, r2 = e4.props;
    r2.className && t3.element.classList.add(r2.className), r2.controls.map(function(e5) {
      var r3 = t3.createChildView(e5.view, e5);
      e5.didCreateView && e5.didCreateView(r3), t3.appendChildView(r3);
    });
  } });
};
var warn = function() {
  return console.log("Doka: localStorage not available");
};
var getData = function(e3) {
  try {
    JSON.parse(localStorage.getItem(e3) || "{}");
  } catch (e4) {
    warn();
  }
  return {};
};
var setStoredValue = function(e3, t2, r2) {
  var n = getData(e3);
  n[t2] = r2;
  try {
    localStorage.setItem(e3, JSON.stringify(n));
  } catch (e4) {
    warn();
  }
  return r2;
};
var getStoredValue = function(e3, t2, r2) {
  var n = getData(e3);
  return void 0 === n[t2] ? r2 : n[t2];
};
var canHover = function() {
  return window.matchMedia("(pointer: fine) and (hover: hover)").matches;
};
var instructionsBubble = createView2({ ignoreRect: true, ignoreRectUpdate: true, name: "instructions-bubble", mixins: { styles: ["opacity", "translateX", "translateY"], animations: { opacity: { type: "tween", duration: 400 } }, apis: ["seen"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  return t2.element.innerHTML = (r2.iconBefore || "") + r2.text;
}, write: function(e3) {
  var t2 = e3.root;
  e3.props.seen && (t2.opacity = 0);
} });
var SPRING_TRANSLATE = { type: "spring", stiffness: 0.4, damping: 0.65, mass: 7 };
var cropSubject = createView2({ name: "crop-subject", ignoreRect: true, mixins: { styles: ["opacity", "translateX", "translateY"], animations: { opacity: { type: "tween", duration: 250 }, translateX: SPRING_TRANSLATE, translateY: SPRING_TRANSLATE } }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  (t2.opacity = 1, t2.ref.timestampOffset = null, t2.query("GET_CROP_ALLOW_INSTRUCTION_ZOOM") && canHover()) && (getStoredValue(t2.query("GET_STORAGE_NAME"), "instruction_zoom_shown", false) || (t2.ref.instructions = t2.appendChildView(t2.createChildView(instructionsBubble, { opacity: 0, seen: false, text: t2.query("GET_LABEL_CROP_INSTRUCTION_ZOOM"), iconBefore: createIcon('<rect stroke-width="1.5" fill="none" stroke="currentColor" x="5" y="1" width="14" height="22" rx="7" ry="7"></rect><circle fill="currentColor" stroke="none" cx="12" cy="8" r="2"></circle>') }))));
  t2.ref.maskView = t2.appendChildView(t2.createChildView(cropMask)), t2.query("GET_CROP_ALLOW_RESIZE_RECT") && (t2.ref.cropView = t2.appendChildView(t2.createChildView(cropRect))), t2.query("GET_CROP_SHOW_SIZE") && (t2.ref.cropSize = t2.appendChildView(t2.createChildView(cropSize, { id: r2.id, opacity: 1, scaleX: 1, scaleY: 1, translateX: null }))), t2.query("GET_CROP_ZOOM_TIMEOUT") || (t2.ref.btnZoom = t2.appendChildView(t2.createChildView(wrapper("zoom-wrapper", { styles: ["opacity", "translateX", "translateY"], animations: { opacity: { type: "tween", duration: 250 } } }), { opacity: 0, controls: [{ view: button, label: t2.query("GET_LABEL_BUTTON_CROP_ZOOM"), name: "zoom", icon: createIcon('<g fill="currentColor" fill-rule="nonzero"><path d="M12.5 19a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zm0-2a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"/><path d="M15.765 17.18a1 1 0 1 1 1.415-1.415l3.527 3.528a1 1 0 0 1-1.414 1.414l-3.528-3.527z"/></g>', 26), action: function() {
    return t2.dispatch("CROP_ZOOM");
  } }] })));
}, write: createRoute2({ CROP_IMAGE_RESIZE_MULTIPLY: function(e3) {
  var t2 = e3.root, r2 = t2.ref.instructions;
  r2 && !r2.seen && (r2.seen = true, setStoredValue(t2.query("GET_STORAGE_NAME"), "instruction_zoom_shown", true));
}, CROP_RECT_DRAG_RELEASE: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp, i2 = t2.ref.btnZoom;
  if (i2) {
    var o2 = t2.query("GET_CROP", r2.id, n).cropRect, a2 = o2.x + 0.5 * o2.width, c2 = o2.y + 0.5 * o2.height;
    i2.translateX = a2, i2.translateY = c2;
  }
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp, i2 = t2.ref, o2 = i2.cropView, a2 = i2.maskView, c2 = i2.btnZoom, l2 = i2.cropSize, u = i2.instructions;
  if (!t2.query("IS_ACTIVE_VIEW", "crop") && o2) return o2.enabled = false, t2.ref.timestampOffset = null, void (l2 && (l2.opacity = 0));
  t2.ref.timestampOffset || (t2.ref.timestampOffset = n);
  var s2 = t2.query("GET_CROP", r2.id, n);
  if (s2) {
    var d = s2.cropRect, p = s2.isRotating, f2 = s2.isDraft, h = s2.scale, g = t2.query("GET_STAGE");
    if (t2.translateX = g.x - t2.rect.element.left, t2.translateY = g.y - t2.rect.element.top, o2 && (o2.draft = f2, o2.rotating = p, o2.rectangle = d, o2.enabled = true), l2) {
      l2.opacity = 1, f2 && (l2.translateX = null, l2.translateY = null);
      var m = getCropSizeOffset(t2.rect.element, l2.rect.element, d);
      l2.translateX = f2 ? m.x : autoPrecision(m.x), l2.translateY = f2 ? m.y : autoPrecision(m.y);
    }
    if (t2.query("GET_CROP_MASK") && (f2 && (a2.translateX = null, a2.translateY = null, a2.maskWidth = null, a2.maskHeight = null), a2.translateX = autoPrecision(d.x), a2.translateY = autoPrecision(d.y), a2.maskWidth = d.width, a2.maskHeight = d.height, a2.scale = h), s2.canRecenter) u && (u.opacity = 0), c2 && (c2.opacity = s2.isDraft ? 0 : 1);
    else if (c2 && (c2.opacity = 0), u && !u.seen && !s2.isDraft) {
      var v = d.x + 0.5 * d.width, y = d.y + 0.5 * d.height;
      u.translateX = Math.round(v - 0.5 * u.rect.element.width), u.translateY = Math.round(y - 0.5 * u.rect.element.height), n - t2.ref.timestampOffset > 2e3 && (u.opacity = 1);
    }
  }
}) });
var getCropSizeOffset = function(e3, t2, r2) {
  var n = r2.x, i2 = r2.x + r2.width, o2 = r2.y + r2.height, a2 = i2 - t2.width - 16, c2 = o2 - t2.height - 16;
  return t2.width > r2.width - 32 && (a2 = n + (0.5 * r2.width - 0.5 * t2.width), (c2 = o2 + 16) > e3.height - t2.height && (c2 = o2 - t2.height - 16)), { x: a2 = Math.max(0, Math.min(a2, e3.width - t2.width)), y: c2 };
};
var now = function() {
  return performance.now();
};
var throttle = function(e3, t2) {
  var r2 = null, n = null;
  return function() {
    var i2 = arguments;
    if (!n) return e3.apply(null, Array.from(arguments)), void (n = now());
    clearTimeout(r2), r2 = setTimeout(function() {
      now() - n >= t2 && (e3.apply(null, Array.from(i2)), n = now());
    }, t2 - (now() - n));
  };
};
var climb = function(e3, t2) {
  for (; 1 === e3.nodeType && !t2(e3); ) e3 = e3.parentNode;
  return 1 === e3.nodeType ? e3 : null;
};
var isMyTarget = function(e3, t2) {
  var r2 = climb(t2, function(e4) {
    return e4.classList.contains("doka--root");
  });
  return !!r2 && contains(r2, e3);
};
var updateIndicators = function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.action.position, i2 = r2.pivotPoint, o2 = t2.ref, a2 = o2.indicatorA, c2 = o2.indicatorB, l2 = i2.x - n.x, u = i2.y - n.y, s2 = { x: i2.x + l2, y: i2.y + u }, d = { x: i2.x - l2, y: i2.y - u };
  a2.style.cssText = "transform: translate3d(".concat(s2.x, "px, ").concat(s2.y, "px, 0)"), c2.style.cssText = "transform: translate3d(".concat(d.x, "px, ").concat(d.y, "px, 0)");
};
var getPositionFromEvent = function(e3) {
  return { x: e3.pageX, y: e3.pageY };
};
var cropResize = createView2({ ignoreRect: true, ignoreRectUpdate: true, name: "crop-resizer", mixins: { apis: ["pivotPoint", "scrollRect"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.ref.isActive = false, t2.ref.isCropping = false, t2.ref.indicatorA = document.createElement("div"), t2.appendChild(t2.ref.indicatorA), t2.ref.indicatorB = document.createElement("div"), t2.appendChild(t2.ref.indicatorB);
  var n = t2.query("GET_CROP_RESIZE_KEY_CODES");
  t2.ref.hasEnabledResizeModifier = n.length > 0;
  var i2 = { origin: { x: null, y: null }, position: { x: null, y: null }, selecting: false, enabled: false, scrollY: 0, offsetX: 0, offsetY: 0 }, o2 = now();
  t2.ref.state = i2;
  var a2 = createPointerRegistry(), c2 = 0, l2 = false;
  t2.ref.resizeStart = function(e4) {
    if (t2.ref.isActive && (0 === a2.count() && (l2 = false), isMyTarget(t2.element, e4.target) && (a2.push(e4), addEvent$1(document.documentElement, "up", t2.ref.resizeEnd), a2.multiple()))) {
      e4.stopPropagation(), e4.preventDefault();
      var r3 = a2.active(), n2 = getPositionFromEvent(r3[0]), i3 = getPositionFromEvent(r3[1]);
      c2 = vectorDistance3(n2, i3), addEvent$1(document.documentElement, "move", t2.ref.resizeMove), l2 = true;
    }
  }, t2.ref.resizeMove = function(e4) {
    if (t2.ref.isActive && l2 && (e4.preventDefault(), 2 === a2.count())) {
      a2.update(e4);
      var r3 = a2.active(), n2 = getPositionFromEvent(r3[0]), i3 = getPositionFromEvent(r3[1]), o3 = (vectorDistance3(n2, i3) - c2) / c2;
      t2.dispatch("CROP_IMAGE_RESIZE", { value: o3 });
    }
  }, t2.ref.resizeEnd = function(e4) {
    if (t2.ref.isActive) {
      a2.pop(e4);
      var r3 = 0 === a2.count();
      r3 && (removeEvent$1(document.documentElement, "move", t2.ref.resizeMove), removeEvent$1(document.documentElement, "up", t2.ref.resizeEnd)), l2 && (e4.preventDefault(), r3 && t2.dispatch("CROP_IMAGE_RESIZE_RELEASE"));
    }
  }, addEvent$1(document.documentElement, "down", t2.ref.resizeStart);
  var u = performance.now(), s2 = 0, d = 1, p = throttle(function(e4) {
    if (!t2.ref.isCropping) {
      var r3 = Math.sign(e4.wheelDelta || e4.deltaY), n2 = now(), i3 = n2 - u;
      u = n2, (i3 > 750 || s2 !== r3) && (d = 1, s2 = r3), d += 0.05 * r3, t2.dispatch("CROP_IMAGE_RESIZE_MULTIPLY", { value: Math.max(0.1, d) }), t2.dispatch("CROP_IMAGE_RESIZE_RELEASE");
    }
  }, 100);
  t2.ref.wheel = function(e4) {
    if (t2.ref.isActive && isMyTarget(t2.element, e4.target)) {
      if (r2.scrollRect) {
        var n2 = r2.scrollRect, i3 = t2.query("GET_ROOT"), o3 = getPositionFromEvent(e4), a3 = { x: o3.x - i3.leftScroll, y: o3.y - i3.topScroll };
        if (a3.x < n2.x || a3.x > n2.x + n2.width || a3.y < n2.y || a3.y > n2.y + n2.height) return;
      }
      e4.preventDefault(), p(e4);
    }
  }, document.addEventListener("wheel", t2.ref.wheel, { passive: false }), t2.ref.hasEnabledResizeModifier && (t2.ref.move = function(e4) {
    if (t2.ref.isActive && !t2.ref.isCropping && (i2.position.x = e4.pageX - t2.ref.state.offsetX, i2.position.y = e4.pageY - t2.ref.state.scrollY - t2.ref.state.offsetY, i2.enabled)) if (isMyTarget(t2.element, e4.target)) {
      "idle" === t2.element.dataset.state && t2.dispatch("RESIZER_SHOW", { position: _objectSpread({}, i2.position) }), e4.preventDefault(), t2.dispatch("RESIZER_MOVE", { position: _objectSpread({}, i2.position) });
      var n2 = r2.pivotPoint, a3 = n2.x - i2.position.x, l3 = n2.y - i2.position.y, u2 = { x: n2.x + a3, y: n2.y + l3 }, s3 = _objectSpread({}, i2.position);
      if (i2.selecting) {
        var d2 = (vectorDistance3(u2, s3) - c2) / c2, p2 = performance.now();
        p2 - o2 > 25 && (o2 = p2, t2.dispatch("CROP_IMAGE_RESIZE", { value: d2 }));
      }
    } else t2.dispatch("RESIZER_CANCEL");
  }, t2.ref.select = function(e4) {
    if (t2.ref.isActive && isMyTarget(t2.element, e4.target)) {
      var n2 = r2.pivotPoint, o3 = n2.x - i2.position.x, a3 = n2.y - i2.position.y, l3 = { x: n2.x + o3, y: n2.y + a3 }, u2 = i2.position;
      c2 = vectorDistance3(l3, u2), i2.selecting = true, i2.origin.x = e4.pageX, i2.origin.y = e4.pageY, t2.dispatch("CROP_IMAGE_RESIZE_GRAB");
    }
  }, t2.ref.confirm = function(e4) {
    t2.ref.isActive && isMyTarget(t2.element, e4.target) && (i2.selecting = false, t2.dispatch("CROP_IMAGE_RESIZE_RELEASE"));
  }, t2.ref.blur = function() {
    t2.ref.isActive && (i2.selecting = false, i2.enabled = false, document.removeEventListener("mousedown", t2.ref.select), document.removeEventListener("mouseup", t2.ref.confirm), t2.dispatch("RESIZER_CANCEL"));
  }, window.addEventListener("blur", t2.ref.blur), document.addEventListener("mousemove", t2.ref.move), t2.ref.keyDown = function(e4) {
    t2.ref.isActive && n.includes(e4.keyCode) && i2.position && (i2.enabled = true, document.addEventListener("mousedown", t2.ref.select), document.addEventListener("mouseup", t2.ref.confirm), t2.dispatch("RESIZER_SHOW", { position: _objectSpread({}, i2.position) }));
  }, t2.ref.keyUp = function(e4) {
    t2.ref.isActive && n.includes(e4.keyCode) && (i2.enabled = false, document.removeEventListener("mousedown", t2.ref.select), document.removeEventListener("mouseup", t2.ref.confirm), t2.dispatch("RESIZER_CANCEL"));
  }, document.body.addEventListener("keydown", t2.ref.keyDown), document.body.addEventListener("keyup", t2.ref.keyUp));
}, destroy: function(e3) {
  var t2 = e3.root;
  document.removeEventListener("touchmove", t2.ref.resizeMove), document.removeEventListener("touchend", t2.ref.resizeEnd), document.removeEventListener("touchstart", t2.ref.resizeStart), document.removeEventListener("wheel", t2.ref.wheel), document.removeEventListener("mousedown", t2.ref.select), document.removeEventListener("mouseup", t2.ref.confirm), t2.ref.hasEnabledResizeModifier && (document.removeEventListener("mousemove", t2.ref.move), document.body.removeEventListener("keydown", t2.ref.keyDown), document.body.removeEventListener("keyup", t2.ref.keyUp), window.removeEventListener("blur", t2.ref.blur));
}, read: function(e3) {
  var t2 = e3.root;
  t2.ref.state.scrollY = window.scrollY;
  var r2 = t2.element.getBoundingClientRect();
  t2.ref.state.offsetX = r2.x, t2.ref.state.offsetY = r2.y;
}, write: createRoute2({ CROP_RECT_DRAG_GRAB: function(e3) {
  e3.root.ref.isCropping = true;
}, CROP_RECT_DRAG_RELEASE: function(e3) {
  e3.root.ref.isCropping = false;
}, SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  t2.ref.isActive = "crop" === r2.id;
}, RESIZER_SHOW: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.action;
  t2.element.dataset.state = "multi-touch", updateIndicators({ root: t2, props: r2, action: n });
}, RESIZER_CANCEL: function(e3) {
  e3.root.element.dataset.state = "idle";
}, RESIZER_MOVE: updateIndicators }) });
var setOpacity = function(e3, t2) {
  return e3.style.opacity = t2;
};
var updateImageBoundsIcon = function(e3, t2) {
  var r2 = Array.from(e3.element.querySelectorAll(".doka--icon-crop-limit rect"));
  r2.length && (setOpacity(r2[0], t2 ? 0.3 : 0), setOpacity(r2[1], t2 ? 1 : 0), setOpacity(r2[2], t2 ? 0 : 0.3), setOpacity(r2[3], t2 ? 0 : 1));
};
var updateAspectRatioIcon = function(e3, t2) {
  var r2 = e3.element.querySelectorAll(".doka--icon-aspect-ratio rect");
  if (r2.length) {
    if (!t2) return setOpacity(r2[0], 0.2), setOpacity(r2[1], 0.3), void setOpacity(r2[2], 0.4);
    setOpacity(r2[0], t2 > 1 ? 1 : 0.3), setOpacity(r2[1], 1 === t2 ? 0.85 : 0.5), setOpacity(r2[2], t2 < 1 ? 1 : 0.3);
  }
};
var updateTurnIcons = function(e3, t2) {
  Array.from(e3.element.querySelectorAll(".doka--icon-turn rect")).forEach(function(e4) {
    t2 > 1 && (e4.setAttribute("x", e4.previousElementSibling ? 5 : 4), e4.setAttribute("width", 9)), t2 < 1 && (e4.setAttribute("y", 11), e4.setAttribute("height", 10));
  });
};
var createRectangle = function(e3) {
  var t2, r2;
  e3 > 1 ? (r2 = 14, t2 = Math.round(r2 / e3)) : (t2 = 14, r2 = Math.round(t2 * e3));
  var n = Math.round(0.5 * (23 - t2)), i2 = Math.round(0.5 * (23 - r2));
  return '<svg width="23" height="23" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><rect x="'.concat(n, '" y="').concat(i2, '" width="').concat(t2, '" height="').concat(r2, '" rx="2.5"/></g></svg>');
};
var cropRoot = createView2({ name: "crop", ignoreRect: true, mixins: { apis: ["viewId", "stagePosition", "hidden", "offsetTop"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  r2.viewId = "crop", r2.hidden = false, t2.ref.isHiding = false;
  var n = [];
  t2.query("GET_CROP_ALLOW_IMAGE_TURN_LEFT") && n.push({ view: button, name: "tool", label: t2.query("GET_LABEL_BUTTON_CROP_ROTATE_LEFT"), icon: createIcon('<g transform="translate(3 2)" fill="currentColor" fill-rule="evenodd" class="doka--icon-turn"><rect y="9" width="12" height="12" rx="1"/><path d="M9.823 5H11a5 5 0 0 1 5 5 1 1 0 0 0 2 0 7 7 0 0 0-7-7H9.626l.747-.747A1 1 0 0 0 8.958.84L6.603 3.194a1 1 0 0 0 0 1.415l2.355 2.355a1 1 0 0 0 1.415-1.414L9.823 5z" fill-rule="nonzero" /></g>', 26), action: function() {
    return t2.dispatch("CROP_IMAGE_ROTATE_LEFT");
  } }), t2.query("GET_CROP_ALLOW_IMAGE_TURN_RIGHT") && n.push({ view: button, name: "tool", label: t2.query("GET_LABEL_BUTTON_CROP_ROTATE_RIGHT"), icon: createIcon('<g transform="translate(5 2)" fill="currentColor" fill-rule="evenodd" class="doka--icon-turn"><path d="M8.177 5H7a5 5 0 0 0-5 5 1 1 0 0 1-2 0 7 7 0 0 1 7-7h1.374l-.747-.747A1 1 0 0 1 9.042.84l2.355 2.355a1 1 0 0 1 0 1.415L9.042 6.964A1 1 0 0 1 7.627 5.55l.55-.55z" fill-rule="nonzero"/><rect x="6" y="9" width="12" height="12" rx="1"/></g>', 26), action: function() {
    return t2.dispatch("CROP_IMAGE_ROTATE_RIGHT");
  } }), t2.query("GET_CROP_ALLOW_IMAGE_FLIP_HORIZONTAL") && n.push({ view: button, name: "tool", label: t2.query("GET_LABEL_BUTTON_CROP_FLIP_HORIZONTAL"), icon: createIcon('<g fill="currentColor" fill-rule="evenodd"><path d="M11.93 7.007V20a1 1 0 0 1-1 1H5.78a1 1 0 0 1-.93-1.368l5.15-12.993a1 1 0 0 1 1.929.368z"/><path d="M14 7.007V20a1 1 0 0 0 1 1h5.149a1 1 0 0 0 .93-1.368l-5.15-12.993A1 1 0 0 0 14 7.007z" opacity=".6"/></g>', 26), action: function() {
    return t2.dispatch("CROP_IMAGE_FLIP_HORIZONTAL");
  } }), t2.query("GET_CROP_ALLOW_IMAGE_FLIP_VERTICAL") && n.push({ view: button, name: "tool", label: t2.query("GET_LABEL_BUTTON_CROP_FLIP_VERTICAL"), icon: createIcon('<g fill="currentColor" fill-rule="evenodd"><path d="M19.993 12.143H7a1 1 0 0 1-1-1V5.994a1 1 0 0 1 1.368-.93l12.993 5.15a1 1 0 0 1-.368 1.93z"/><path d="M19.993 14a1 1 0 0 1 .368 1.93L7.368 21.078A1 1 0 0 1 6 20.148V15a1 1 0 0 1 1-1h12.993z" opacity=".6"/></g>', 26), action: function() {
    return t2.dispatch("CROP_IMAGE_FLIP_VERTICAL");
  } });
  var i2 = t2.query("GET_CROP_ASPECT_RATIO_OPTIONS");
  i2 && i2.length && n.push({ view: dropdown, name: "tool", label: t2.query("GET_LABEL_BUTTON_CROP_ASPECT_RATIO"), icon: createIcon('<g class="doka--icon-aspect-ratio" fill="currentColor" fill-rule="evenodd"><rect x="2" y="4" opacity=".3" width="10" height="18" rx="1"/><rect opacity=".5" x="4" y="8" width="14" height="14" rx="1"/><rect x="6" y="12" width="17" height="10" rx="1"/></g>', 26), options: null, onSelect: function(e4) {
    e4.width && e4.height ? t2.dispatch("RESIZE_SET_OUTPUT_SIZE", { width: e4.width, height: e4.height }) : (t2.query("GET_CROP_ASPECT_RATIO_OPTIONS").find(function(e5) {
      return e5.value && e5.value.width || e5.value.height;
    }) && t2.dispatch("RESIZE_SET_OUTPUT_SIZE", { width: null, height: null }), t2.dispatch("CROP_SET_ASPECT_RATIO", { value: e4.aspectRatio }));
  }, didCreateView: function(e4) {
    t2.ref.aspectRatioDropdown = e4;
  } }), t2.query("GET_CROP_ALLOW_TOGGLE_LIMIT") && n.push({ view: dropdown, name: "tool", label: t2.query("GET_LABEL_BUTTON_CROP_TOGGLE_LIMIT"), icon: createIcon('<g class="doka--icon-crop-limit" fill="currentColor" fill-rule="evenodd">\n                    <rect x="2" y="3" width="20" height="20" rx="1"/>\n                    <rect x="7" y="8" width="10" height="10" rx="1"/>\n                    <rect x="4" y="8" width="14" height="14" rx="1"/>\n                    <rect x="12" y="4" width="10" height="10" rx="1"/>\n                </g>', 26), options: [{ value: true, label: t2.query("GET_LABEL_BUTTON_CROP_TOGGLE_LIMIT_ENABLE"), icon: '<svg width="23" height="23" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><rect x="3" y="3" width="17" height="17" rx="2.5" opacity=".3"/><rect x="7" y="7" width="9" height="9" rx="2.5"/></g></svg>' }, { value: false, label: t2.query("GET_LABEL_BUTTON_CROP_TOGGLE_LIMIT_DISABLE"), icon: '<svg width="23" height="23" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><rect x="3" y="6" width="13" height="13" rx="2.5" opacity=".3"/><rect x="10" y="3" width="9" height="9" rx="2.5"/></g></svg>' }], onSelect: function(e4) {
    t2.dispatch("CROP_SET_LIMIT", { value: e4 });
  }, didCreateView: function(e4) {
    t2.ref.cropToggleLimitDropdown = e4;
  } }), t2.ref.menu = t2.appendChildView(t2.createChildView(createGroup("toolbar", ["opacity"], { opacity: { type: "spring", mass: 15, delay: 50 } }), { opacity: 0, controls: n })), t2.ref.menuItemsRequiredWidth = null, t2.ref.subject = t2.appendChildView(t2.createChildView(cropSubject, _objectSpread({}, r2))), t2.query("GET_CROP_ALLOW_ROTATE") && (t2.ref.rotator = t2.appendChildView(t2.createChildView(cropRotator, { rotation: 0, opacity: 0, translateY: 20, id: r2.id }))), t2.ref.resizer = t2.appendChildView(t2.createChildView(cropResize, { pivotPoint: { x: 0, y: 0 } })), t2.ref.updateControls = function() {
    var e4 = t2.query("GET_IMAGE");
    if (updateTurnIcons(t2, e4.height / e4.width), t2.ref.cropToggleLimitDropdown && (t2.ref.isLimitedToImageBounds = t2.query("GET_CROP_LIMIT_TO_IMAGE_BOUNDS"), updateImageBoundsIcon(t2, t2.ref.isLimitedToImageBounds), t2.ref.cropToggleLimitDropdown.selectedValue = t2.ref.isLimitedToImageBounds), t2.ref.aspectRatioDropdown) {
      var r3 = t2.query("GET_MIN_IMAGE_SIZE"), n2 = i2.filter(function(t3) {
        if (!t3.value.aspectRatio) return true;
        if (t3.value.aspectRatio < 1) {
          if (e4.naturalWidth * t3.value.aspectRatio < r3.height) return false;
        } else if (e4.naturalHeight / t3.value.aspectRatio < r3.width) return false;
        return true;
      });
      t2.ref.aspectRatioDropdown.options = n2.map(function(e5) {
        return _objectSpread({}, e5, { icon: createRectangle(e5.value.aspectRatio) });
      });
    }
  }, t2.ref.isModal = /modal|fullscreen/.test(t2.query("GET_STYLE_LAYOUT_MODE"));
}, read: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  if (r2.hidden) t2.ref.menuItemsRequiredWidth = null;
  else {
    var n = t2.rect;
    if (0 !== n.element.width && 0 !== n.element.height) {
      if (null === t2.ref.menuItemsRequiredWidth) {
        var i2 = t2.ref.menu.childViews.reduce(function(e4, t3) {
          return e4 + t3.rect.outer.width;
        }, 0);
        t2.ref.menuItemsRequiredWidth = 0 === i2 ? null : i2;
      }
      var o2 = t2.ref.subject.rect.element, a2 = o2.left, c2 = o2.top, l2 = o2.width, u = o2.height;
      r2.stagePosition = { x: a2, y: c2, width: l2, height: u };
    }
  }
}, shouldUpdateChildViews: function(e3) {
  var t2 = e3.props, r2 = e3.actions;
  return !t2.hidden || t2.hidden && r2 && r2.length;
}, write: createRoute2({ SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = e3.props, i2 = t2.ref, o2 = i2.menu, a2 = i2.rotator, c2 = i2.subject;
  n.viewId === r2.id ? (c2.opacity = 1, o2.opacity = 1, a2 && (a2.opacity = 1, a2.translateY = 0), n.hidden = false, t2.ref.isHiding = false, t2.ref.updateControls()) : (c2.opacity = 0, o2.opacity = 0, a2 && (a2.opacity = 0, a2.translateY = 20), t2.ref.isHiding = true);
}, UNLOAD_IMAGE: function(e3) {
  var t2 = e3.root.ref, r2 = t2.menu, n = t2.rotator;
  r2.opacity = 0, n && (n.opacity = 0, n.translateY = 20);
}, DID_PRESENT_IMAGE: function(e3) {
  var t2 = e3.root, r2 = t2.ref, n = r2.menu, i2 = r2.rotator;
  n.opacity = 1, i2 && (i2.opacity = 1, i2.translateY = 0), t2.ref.updateControls();
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp, i2 = t2.ref, o2 = i2.resizer, a2 = i2.subject, c2 = i2.menu, l2 = i2.rotator, u = i2.isHiding, s2 = i2.cropToggleLimitDropdown, d = i2.aspectRatioDropdown, p = r2.hidden, f2 = 0 === a2.opacity && 0 === c2.opacity && (!l2 || l2 && 0 === l2.opacity);
  if (!p && u && f2 && (t2.ref.isHiding = false, r2.hidden = true), !r2.hidden) {
    var h = t2.query("GET_CROP", r2.id, n);
    if (h) {
      if (d) {
        var g = t2.query("GET_ACTIVE_CROP_ASPECT_RATIO"), m = t2.query("GET_SIZE"), v = d.selectedValue;
        v ? (v.aspectRatio !== g && updateAspectRatioIcon(t2, g), v.aspectRatio === g && v.width === m.width && v.height === m.height || (d.selectedValue = { aspectRatio: g, width: m.width, height: m.height })) : (d.selectedValue = { aspectRatio: g, width: m.width, height: m.height }, updateAspectRatioIcon(t2, g));
      }
      if (s2 && t2.ref.isLimitedToImageBounds !== h.isLimitedToImageBounds && (t2.ref.isLimitedToImageBounds = h.isLimitedToImageBounds, updateImageBoundsIcon(t2, h.isLimitedToImageBounds), s2.selectedValue = h.isLimitedToImageBounds), o2.pivotPoint = { x: 0.5 * o2.rect.element.width, y: 0.5 * o2.rect.element.height }, l2 && (l2.animate = !h.isDraft, l2.rotation = h.rotation.sub, l2.setAllowInteraction(t2.query("IS_ACTIVE_VIEW", "crop"))), c2.element.dataset.layout = t2.ref.menuItemsRequiredWidth > t2.ref.menu.rect.element.width ? "compact" : "spacious", t2.query("GET_CROP_RESIZE_SCROLL_RECT_ONLY")) {
        var y = t2.query("GET_STAGE"), E = y.x, T = y.y, _ = t2.query("GET_ROOT"), R = t2.ref.isModal ? _.left : 0, w = t2.ref.isModal ? _.top : 0;
        o2.scrollRect = { x: R + E + h.cropRect.x, y: w + T + h.cropRect.y + r2.offsetTop, width: h.cropRect.width, height: h.cropRect.height };
      }
    }
  }
}) });
var sizeInput = createView2({ name: "size-input", mixins: { listeners: true, apis: ["id", "value", "placeholder", "getValue", "setValue", "setPlaceholder", "hasFocus", "onChange"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = r2.id, i2 = r2.min, o2 = r2.max, a2 = r2.value, c2 = r2.placeholder, l2 = r2.onChange, u = void 0 === l2 ? function() {
  } : l2, s2 = r2.onBlur, d = void 0 === s2 ? function() {
  } : s2, p = "doka--".concat(n, "-").concat(getUniqueId3()), f2 = createElement3("input", { type: "number", step: 1, id: p, min: i2, max: o2, value: a2, placeholder: c2 }), h = f2.getAttribute("max").length, g = createElement3("label", { for: p });
  g.textContent = r2.label;
  var m = function(e4, t3, r3) {
    return isString2(e4) ? ((e4 = e4.replace(/[^0-9]/g, "")).length > h && (e4 = e4.slice(0, h)), e4 = parseInt(e4, 10)) : e4 = Math.round(e4), isNaN(e4) ? null : limit2(e4, t3, r3);
  }, v = function(e4) {
    return e4.length ? parseInt(f2.value, 10) : null;
  };
  t2.ref.handleInput = function() {
    f2.value = m(f2.value, 1, o2), u(v(f2.value));
  }, t2.ref.handleBlur = function() {
    f2.value = m(f2.value, i2, o2), d(v(f2.value));
  }, f2.addEventListener("input", t2.ref.handleInput), f2.addEventListener("blur", t2.ref.handleBlur), t2.appendChild(f2), t2.appendChild(g), t2.ref.input = f2, r2.hasFocus = function() {
    return f2 === document.activeElement;
  }, r2.getValue = function() {
    return v(f2.value);
  }, r2.setValue = function(e4) {
    return f2.value = e4 ? m(e4, 1, 999999) : null;
  }, r2.setPlaceholder = function(e4) {
    return f2.placeholder = e4;
  };
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.ref.input.removeEventListener("input", t2.ref.handleInput), t2.ref.input.removeEventListener("blur", t2.ref.handleBlur);
} });
var checkboxInput = createView2({ name: "checkable", tag: "span", mixins: { listeners: true, apis: ["id", "checked", "onChange", "onSetValue", "setValue", "getValue"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = r2.id, i2 = r2.checked, o2 = r2.onChange, a2 = void 0 === o2 ? function() {
  } : o2, c2 = r2.onSetValue, l2 = void 0 === c2 ? function() {
  } : c2, u = "doka--".concat(n, "-").concat(getUniqueId3()), s2 = createElement3("input", { type: "checkbox", value: 1, id: u });
  s2.checked = i2, t2.ref.input = s2;
  var d = createElement3("label", { for: u });
  d.innerHTML = r2.label, t2.appendChild(s2), t2.appendChild(d), t2.ref.handleChange = function() {
    l2(s2.checked), a2(s2.checked);
  }, s2.addEventListener("change", t2.ref.handleChange), r2.getValue = function() {
    return s2.checked;
  }, r2.setValue = function(e4) {
    s2.checked = e4, l2(s2.checked);
  }, setTimeout(function() {
    l2(s2.checked);
  }, 0);
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.ref.input.removeEventListener("change", t2.ref.handleChange);
} });
var testResult$2 = null;
var isAndroid = function() {
  return null === testResult$2 && (testResult$2 = /Android/i.test(navigator.userAgent)), testResult$2;
};
var resizeForm = createView2({ ignoreRect: true, name: "resize-form", tag: "form", mixins: { styles: ["opacity"], animations: { opacity: { type: "spring", mass: 15, delay: 150 } } }, create: function(e3) {
  var t2 = e3.root;
  t2.element.setAttribute("novalidate", "novalidate"), t2.element.setAttribute("action", "#"), t2.ref.shouldBlurKeyboard = isIOS2() || isAndroid();
  var r2 = t2.query("GET_SIZE_MAX"), n = t2.query("GET_SIZE_MIN"), i2 = function() {
    var e4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, i3 = e4.axisLock, o3 = void 0 === i3 ? "none" : i3, a2 = e4.enforceLimits, c2 = void 0 !== a2 && a2, l2 = t2.ref, u = l2.inputImageWidth, s2 = l2.inputImageHeight, d = l2.buttonConfirm, p = t2.query("GET_SIZE_ASPECT_RATIO_LOCK"), f2 = t2.query("GET_CROP_RECTANGLE_ASPECT_RATIO"), h = { width: u.getValue(), height: s2.getValue() }, g = limitSize(h, c2 ? n : { width: 1, height: 1 }, c2 ? r2 : { width: 999999, height: 999999 }, p ? f2 : null, o3);
    if (p) "width" === o3 ? s2.setValue(g.width / f2) : "height" === o3 ? u.setValue(g.height * f2) : (u.setValue(g.width || g.height * f2), s2.setValue(g.height || g.width / f2));
    else if (g.width && !g.height) {
      var m = Math.round(g.width / f2), v = limitSize({ width: g.width, height: m }, c2 ? n : { width: 1, height: 1 }, c2 ? r2 : { width: 999999, height: 999999 }, f2, o3);
      c2 && u.setValue(Math.round(v.width)), s2.setPlaceholder(Math.round(v.height));
    } else if (g.height && !g.width) {
      var y = Math.round(g.height * f2);
      u.setPlaceholder(y);
    }
    var E = t2.query("GET_SIZE_INPUT"), T = E.width, _ = E.height, R = isNumber2(T) ? Math.round(T) : null, w = isNumber2(_) ? Math.round(_) : null, A = u.getValue(), I = s2.getValue(), S = A !== R || I !== w;
    return d.opacity = S ? 1 : 0, t2.dispatch("KICK"), { width: u.getValue(), height: s2.getValue() };
  }, o2 = t2;
  t2.appendChildView(t2.createChildView(createFieldGroup("Image size", function(e4) {
    var t3 = e4.root, a2 = t3.query("GET_SIZE"), c2 = t3.appendChildView(t3.createChildView(sizeInput, { id: "image-width", label: t3.query("GET_LABEL_RESIZE_WIDTH"), value: isNumber2(a2.width) ? Math.round(a2.width) : null, min: n.width, max: r2.width, placeholder: 0, onChange: function() {
      return i2({ axisLock: "width" });
    }, onBlur: function() {
      return i2({ enforceLimits: false });
    } })), l2 = t3.appendChildView(t3.createChildView(checkboxInput, { id: "aspect-ratio-lock", label: createIcon('<g fill="none" fill-rule="evenodd"><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="doka--aspect-ratio-lock-ring" d="M9.401 10.205v-.804a2.599 2.599 0 0 1 5.198 0V14"/><rect fill="currentColor" x="7" y="10" width="10" height="7" rx="1.5"/></g>'), checked: t3.query("GET_SIZE_ASPECT_RATIO_LOCK"), onSetValue: function(e5) {
      var t4 = e5 ? 0 : -3;
      l2.element.querySelector(".doka--aspect-ratio-lock-ring").setAttribute("transform", "translate(0 ".concat(t4, ")"));
    }, onChange: function(e5) {
      t3.dispatch("RESIZE_SET_OUTPUT_SIZE_ASPECT_RATIO_LOCK", { value: e5 }), i2();
    } })), u = t3.appendChildView(t3.createChildView(sizeInput, { id: "image-height", label: t3.query("GET_LABEL_RESIZE_HEIGHT"), value: isNumber2(a2.height) ? Math.round(a2.height) : null, min: n.height, max: r2.height, placeholder: 0, onChange: function() {
      return i2({ axisLock: "height" });
    }, onBlur: function() {
      return i2({ enforceLimits: false });
    } }));
    o2.ref.aspectRatioLock = l2, o2.ref.inputImageWidth = c2, o2.ref.inputImageHeight = u;
  }))), t2.ref.buttonConfirm = t2.appendChildView(t2.createChildView(button, { name: "app action-confirm icon-only", label: t2.query("GET_LABEL_RESIZE_APPLY_CHANGES"), action: function() {
  }, opacity: 0, icon: createIcon('<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="20 6 9 17 4 12"></polyline>'), type: "submit" })), t2.ref.confirmForm = function(e4) {
    var r3 = i2({ enforceLimits: true });
    e4.preventDefault();
    var n2 = t2.ref, o3 = n2.shouldBlurKeyboard, a2 = n2.buttonConfirm;
    o3 && (document.activeElement.blur(), a2.element.focus()), a2.opacity = 0, t2.dispatch("RESIZE_SET_OUTPUT_SIZE", r3);
  }, t2.element.addEventListener("submit", t2.ref.confirmForm);
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.element.removeEventListener("submit", t2.ref.confirmForm);
}, write: createRoute2({ EDIT_RESET: function(e3) {
  var t2 = e3.root, r2 = t2.query("GET_SIZE"), n = t2.ref, i2 = n.inputImageWidth, o2 = n.inputImageHeight, a2 = n.aspectRatioLock, c2 = n.buttonConfirm;
  i2.setValue(r2.width), o2.setValue(r2.height), a2.setValue(t2.query("GET_SIZE_ASPECT_RATIO_LOCK")), c2.opacity = 0;
}, RESIZE_SET_OUTPUT_SIZE: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = t2.ref, i2 = n.inputImageWidth, o2 = n.inputImageHeight;
  i2.setValue(r2.width), o2.setValue(r2.height);
}, CROP_SET_ASPECT_RATIO: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.action, i2 = e3.timestamp, o2 = t2.query("GET_CROP", r2.id, i2);
  if (o2) {
    var a2 = o2.cropStatus, c2 = t2.ref, l2 = c2.inputImageWidth, u = c2.inputImageHeight;
    null !== n.value ? (l2.setValue(a2.image.width), l2.setPlaceholder(a2.crop.width), u.setValue(a2.image.height), u.setPlaceholder(a2.crop.height)) : l2.getValue() && u.getValue() && (u.setValue(null), u.setPlaceholder(a2.crop.height));
  }
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp, i2 = t2.query("GET_CROP", r2.id, n);
  if (i2) {
    t2.opacity;
    var o2 = i2.cropStatus, a2 = t2.ref, c2 = a2.inputImageWidth, l2 = a2.inputImageHeight;
    if (!c2.hasFocus() && !l2.hasFocus()) {
      var u = t2.query("GET_CROP_RECTANGLE_ASPECT_RATIO");
      if (null === c2.getValue() && null === l2.getValue()) c2.setPlaceholder(o2.crop.width), l2.setPlaceholder(o2.crop.height);
      else if (null === c2.getValue() && null !== o2.image.height) {
        var s2 = Math.round(o2.image.height * u);
        c2.setPlaceholder(s2);
      } else if (null === l2.getValue() && null !== o2.image.width) {
        var d = Math.round(o2.image.width / u);
        l2.setPlaceholder(d);
      }
    }
  }
}) });
var createFieldGroup = function(e3, t2) {
  return createView2({ tag: "fieldset", create: function(r2) {
    var n = r2.root, i2 = createElement3("legend");
    i2.textContent = e3, n.element.appendChild(i2), t2({ root: n });
  } });
};
var resizeRoot = createView2({ name: "resize", ignoreRect: true, mixins: { apis: ["viewId", "stagePosition", "hidden"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  r2.viewId = "resize", r2.hidden = false, t2.ref.isHiding = false, t2.ref.form = t2.appendChildView(t2.createChildView(resizeForm, { opacity: 0, id: r2.id }));
}, read: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  if (!r2.hidden) {
    var n = t2.rect;
    if (0 !== n.element.width && 0 !== n.element.height) {
      var i2 = t2.ref.form.rect;
      r2.stagePosition = { x: n.element.left, y: n.element.top + i2.element.height, width: n.element.width, height: n.element.height - i2.element.height };
    }
  }
}, shouldUpdateChildViews: function(e3) {
  var t2 = e3.props, r2 = e3.actions;
  return !t2.hidden || t2.hidden && r2 && r2.length;
}, write: createRoute2({ SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = e3.props;
  r2.id === n.viewId ? (t2.ref.isHiding = false, t2.ref.form.opacity = 1) : (t2.ref.isHiding = true, t2.ref.form.opacity = 0);
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = t2.ref, i2 = n.form, o2 = n.isHiding, a2 = r2.hidden;
  o2 && 0 === i2.opacity && !a2 ? r2.hidden = true : r2.hidden = false;
}) });
var rangeInput = createView2({ name: "range-input", tag: "span", mixins: { listeners: true, apis: ["onUpdate", "setValue", "getValue", "setAllowInteraction"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = r2.id, i2 = r2.min, o2 = r2.max, a2 = r2.step, c2 = r2.value, l2 = r2.onUpdate, u = void 0 === l2 ? function() {
  } : l2, s2 = "doka--".concat(n, "-").concat(getUniqueId3()), d = createElement3("input", { type: "range", id: s2, min: i2, max: o2, step: a2 });
  d.value = c2, t2.ref.input = d;
  var p = createElement3("span");
  p.className = "doka--range-input-inner";
  var f2 = createElement3("label", { for: s2 });
  f2.innerHTML = r2.label;
  var h = i2 + 0.5 * (o2 - i2);
  t2.element.dataset.centered = c2 === h, t2.ref.handleRecenter = function() {
    r2.setValue(h), t2.ref.handleChange();
  };
  var g = createElement3("button", { type: "button" });
  g.textContent = "center", g.addEventListener("click", t2.ref.handleRecenter), t2.ref.recenter = g, p.appendChild(d), p.appendChild(g), t2.appendChild(f2), t2.appendChild(p), t2.ref.handleChange = function() {
    var e4 = r2.getValue();
    t2.element.dataset.centered = e4 === h, u(e4);
  }, d.addEventListener("input", t2.ref.handleChange);
  var m = null;
  t2.ref.dragger = createDragger(p, function() {
    m = d.getBoundingClientRect();
  }, function(e4) {
    var r3 = (e4.pageX - m.left) / m.width;
    d.value = i2 + r3 * (o2 - i2), t2.ref.handleChange();
  }, function() {
  }, { stopPropagation: true }), r2.getValue = function() {
    return parseFloat(d.value);
  }, r2.setValue = function(e4) {
    return d.value = e4;
  }, r2.setAllowInteraction = function(e4) {
    e4 ? t2.ref.dragger.enable() : t2.ref.dragger.disable();
  };
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.ref.dragger.destroy(), t2.ref.recenter.removeEventListener("click", t2.ref.handleRecenter), t2.ref.input.removeEventListener("input", t2.ref.handleChange);
} });
var COLOR_TOOLS$1 = { brightness: { icon: createIcon('<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></g>') }, contrast: { icon: createIcon('<g fill="none" fill-rule="evenodd"><circle stroke="currentColor" stroke-width="3" cx="12" cy="12" r="10"/><path d="M12 2v20C6.477 22 2 17.523 2 12S6.477 2 12 2z" fill="currentColor"/></g>') }, exposure: { icon: createIcon('<g fill="none" fill-rule="evenodd"><rect stroke="currentColor" stroke-width="3" x="2" y="2" width="20" height="20" rx="4"/><path d="M20.828 3.172L3.172 20.828A3.987 3.987 0 0 1 2 18V6a4 4 0 0 1 4-4h12c1.105 0 2.105.448 2.828 1.172zM7 7H5v2h2v2h2V9h2V7H9V5H7v2zM12 15h5v2h-5z" fill="currentColor"/></g>') }, saturation: { icon: createIcon('<g fill="none" fill-rule="evenodd"><rect stroke="currentColor" stroke-width="3" x="2" y="2" width="20" height="20" rx="4"/><path fill="currentColor" opacity=".3" d="M7 2.5h5v18.75H7z"/><path fill="currentColor" opacity=".6" d="M12 2.5h5v18.75h-5z"/><path fill="currentColor" opacity=".9" d="M17 2.5h4v18.75h-4z"/></g>') } };
var colorForm = createView2({ ignoreRect: true, name: "color-form", tag: "form", mixins: { styles: ["opacity"], animations: { opacity: { type: "spring", mass: 15 } } }, create: function(e3) {
  var t2 = e3.root;
  t2.element.setAttribute("novalidate", "novalidate");
  var r2 = t2.query("GET_COLOR_VALUES");
  t2.ref.tools = Object.keys(COLOR_TOOLS$1).reduce(function(e4, n) {
    var i2 = n, o2 = COLOR_TOOLS$1[n].icon, a2 = t2.query("GET_LABEL_COLOR_".concat(n.toUpperCase())), c2 = t2.query("GET_COLOR_".concat(n.toUpperCase(), "_RANGE")), l2 = r2[n];
    return e4[i2] = { view: t2.appendChildView(t2.createChildView(rangeInput, { id: i2, label: "".concat(o2, "<span>").concat(a2, "</span>"), min: c2[0], max: c2[1], step: 0.01, value: l2, onUpdate: function(e5) {
      return t2.dispatch("COLOR_SET_COLOR_VALUE", { key: i2, value: e5 });
    } })) }, e4;
  }, {});
}, write: createRoute2({ COLOR_SET_VALUE: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  t2.ref.tools[r2.key].view.setValue(r2.value);
}, SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  Object.keys(t2.ref.tools).forEach(function(e4) {
    t2.ref.tools[e4].view.setAllowInteraction("color" === r2.id);
  });
} }) });
var tilePreviewWorker = null;
var tilePreviewWorkerTerminationTimeout = null;
var updateColors = function(e3, t2) {
  var r2 = t2.brightness, n = t2.exposure, i2 = t2.contrast, o2 = t2.saturation;
  if (0 !== r2) {
    var a2 = r2 < 0, c2 = a2 ? "multiply" : "overlay", l2 = a2 ? 0 : 255, u = a2 ? Math.abs(r2) : 1 - r2;
    e3.ref.imageOverlay.style.cssText = "mix-blend-mode: ".concat(c2, "; background: rgba(").concat(l2, ",").concat(l2, ",").concat(l2, ",").concat(u, ")");
  }
  return e3.ref.imageOverlay.style.cssText = "background:transparent", e3.ref.image.style.cssText = "filter: brightness(".concat(n, ") contrast(").concat(i2, ") saturate(").concat(o2, ")"), t2;
};
var colorKeys = Object.keys(COLOR_TOOLS$1);
var colorEquals = function(e3, t2) {
  return colorKeys.findIndex(function(r2) {
    return e3[r2] !== t2[r2];
  }) < 0;
};
var createFilterTile = function(e3) {
  return createView2({ ignoreRect: true, tag: "li", name: "filter-tile", mixins: { styles: ["opacity", "translateY"], animations: { translateY: { type: "spring", delay: 10 * e3 }, opacity: { type: "spring", delay: 30 * e3 } } }, create: function(e4) {
    var t2 = e4.root, r2 = e4.props, n = "doka--filter-".concat(r2.style, "-").concat(getUniqueId3()), i2 = createElement3("input", { id: n, type: "radio", name: "filter" });
    t2.appendChild(i2), i2.checked = r2.selected, i2.value = r2.style, i2.addEventListener("change", function() {
      i2.checked && r2.onSelect();
    });
    var o2 = createElement3("label", { for: n });
    o2.textContent = r2.label, t2.appendChild(o2);
    var a2 = r2.imageData, c2 = Math.min(a2.width, a2.height), l2 = c2, u = createElement3("canvas");
    u.width = c2, u.height = l2;
    var s2 = u.getContext("2d");
    t2.ref.image = u;
    var d = createElement3("div");
    t2.ref.imageOverlay = d;
    var p = { x: 0.5 * c2 - 0.5 * a2.width, y: 0.5 * l2 - 0.5 * a2.height }, f2 = createElement3("div");
    f2.appendChild(u), f2.appendChild(d), t2.appendChild(f2), t2.ref.imageWrapper = f2, r2.matrix ? (tilePreviewWorker || (tilePreviewWorker = createWorker3(TransformWorker2)), clearTimeout(tilePreviewWorkerTerminationTimeout), tilePreviewWorker.post({ transforms: [{ type: "filter", data: r2.matrix }], imageData: a2 }, function(e5) {
      s2.putImageData(e5, p.x, p.y), clearTimeout(tilePreviewWorkerTerminationTimeout), tilePreviewWorkerTerminationTimeout = setTimeout(function() {
        tilePreviewWorker.terminate(), tilePreviewWorker = null;
      }, 1e3);
    }, [a2.data.buffer]), t2.ref.activeColors = updateColors(t2, t2.query("GET_COLOR_VALUES"))) : s2.putImageData(a2, p.x, p.y);
  }, write: function(e4) {
    var t2 = e4.root;
    if (!(t2.opacity <= 0)) {
      var r2 = t2.query("GET_COLOR_VALUES"), n = t2.ref.activeColors;
      (!n && r2 || !colorEquals(n, r2)) && (t2.ref.activeColors = r2, updateColors(t2, r2));
    }
  } });
};
var cloneImageData2 = function(e3) {
  var t2;
  try {
    t2 = new ImageData(e3.width, e3.height);
  } catch (r2) {
    t2 = document.createElement("canvas").getContext("2d").createImageData(e3.width, e3.height);
  }
  return t2.data.set(new Uint8ClampedArray(e3.data)), t2;
};
var arrayEqual = function(e3, t2) {
  return Array.isArray(e3) && Array.isArray(t2) && e3.length === t2.length && e3.every(function(e4, r2) {
    return e4 === t2[r2];
  });
};
var filterList = createView2({ ignoreRect: true, tag: "ul", name: "filter-list", mixins: { apis: ["filterOpacity", "hidden"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.element.setAttribute("role", "list"), t2.ref.tiles = [];
  var n = t2.query("GET_THUMB_IMAGE_DATA"), i2 = t2.query("GET_FILTERS"), o2 = [];
  forin2(i2, function(e4, t3) {
    o2.push(_objectSpread({ id: e4 }, t3));
  }), t2.ref.activeFilter = t2.query("GET_FILTER"), t2.ref.tiles = o2.map(function(e4, i3) {
    var o3 = e4.matrix(), a2 = t2.ref.activeFilter === e4.id || arrayEqual(t2.ref.activeFilter, o3) || 0 === i3;
    return t2.appendChildView(t2.createChildView(createFilterTile(i3), { opacity: 0, translateY: -5, id: r2.id, style: e4.id, label: e4.label, matrix: o3, imageData: cloneImageData2(n), selected: a2, onSelect: function() {
      return t2.dispatch("FILTER_SET_FILTER", { value: o3 ? e4.id : null });
    } }));
  });
}, write: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  if (!r2.hidden) {
    var n = t2.query("GET_FILTER");
    if (n !== t2.ref.activeFilter) {
      t2.ref.activeFilter = n;
      var i2 = t2.query("GET_FILTERS"), o2 = n ? isString2(n) ? n : isColorMatrix(n) ? Object.keys(i2).find(function(e4) {
        return arrayEqual(i2[e4].matrix(), n);
      }) : null : "original";
      Array.from(t2.element.querySelectorAll("input")).forEach(function(e4) {
        return e4.checked = e4.value === o2;
      });
    }
    t2.query("IS_ACTIVE_VIEW", "filter") ? t2.ref.tiles.forEach(function(e4) {
      e4.opacity = 1, e4.translateY = 0;
    }) : t2.ref.tiles.forEach(function(e4) {
      e4.opacity = 0, e4.translateY = -5;
    }), r2.filterOpacity = t2.ref.tiles.reduce(function(e4, t3) {
      return e4 + t3.opacity;
    }, 0) / t2.ref.tiles.length;
  }
} });
var createScroller = function(e3, t2) {
  var r2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : [];
  return createView2({ name: "scroller doka--".concat(e3, "-scroller"), ignoreRect: true, ignoreRectUpdate: true, mixins: { styles: ["opacity"], animations: { opacity: { type: "spring" } }, apis: r2 }, create: function(e4) {
    var r3, n = e4.root, i2 = e4.props;
    (n.ref.content = n.appendChildView(n.createChildView(t2, { id: i2.id })), n.element.isScrollContainer = true, canHover()) && (n.ref.handleMouseWheel = function(e5) {
      var t3 = n.element.scrollLeft, r4 = n.ref.scrollWidth - n.rect.element.width, i3 = t3 + e5.deltaX;
      (i3 < 0 || i3 > r4) && (n.element.scrollLeft = Math.min(Math.max(i3, 0), r4), e5.preventDefault());
    }, n.element.addEventListener("mousewheel", n.ref.handleMouseWheel), n.element.dataset.dragState = "end", n.ref.dragger = createDragger(n.ref.content.element, function() {
      n.element.dataset.dragState = "start", r3 = n.element.scrollLeft;
    }, function(e5, t3) {
      n.element.scrollLeft = r3 - t3.x, n.ref.scrollWidth - n.rect.element.width != 0 && vectorDistanceSquared3({ x: 0, y: 0 }, t3) > 0 && (n.element.dataset.dragState = "dragging");
    }, function() {
      n.element.dataset.dragState = "end";
    }, { stopPropagation: true }));
  }, destroy: function(e4) {
    var t3 = e4.root;
    t3.ref.handleMouseWheel && t3.element.removeEventListener("mousewheel", t3.ref.handleMouseWheel), t3.ref.dragger && t3.ref.dragger.destroy();
  }, read: function(e4) {
    var t3 = e4.root;
    t3.ref.scrollWidth = t3.element.scrollWidth;
  }, write: function(e4) {
    var t3 = e4.root, r3 = e4.props;
    t3.ref.content.hidden = r3.hidden, r3.contentOpacity = t3.ref.content.contentOpacity;
  } });
};
var createSelectionView = function(e3, t2) {
  return createView2({ name: e3, ignoreRect: true, mixins: { apis: ["viewId", "stagePosition", "hidden"] }, create: function(r2) {
    var n = r2.root, i2 = r2.props;
    i2.viewId = e3, i2.hidden = false, n.ref.isHiding = false, n.ref.content = n.appendChildView(n.createChildView(createScroller(e3, t2, ["hidden", "contentOpacity"]), { id: i2.id }));
  }, read: function(e4) {
    var t3 = e4.root, r2 = e4.props;
    if (t3.ref.content && !r2.hidden) {
      var n = t3.rect;
      if (0 !== n.element.width && 0 !== n.element.height) {
        var i2 = t3.ref.content.rect, o2 = 0 === i2.element.top, a2 = o2 ? n.element.top + i2.element.height + i2.element.marginBottom : n.element.top, c2 = o2 ? n.element.height - i2.element.height - i2.element.marginBottom : n.element.height - i2.element.height - n.element.top;
        r2.stagePosition = { x: n.element.left, y: a2, width: n.element.width, height: c2 };
      }
    }
  }, shouldUpdateChildViews: function(e4) {
    var t3 = e4.props, r2 = e4.actions;
    return !t3.hidden || t3.hidden && r2 && r2.length;
  }, write: createRoute2({ SHOW_VIEW: function(e4) {
    var t3 = e4.root, r2 = e4.action, n = e4.props;
    t3.ref.content && (r2.id === n.viewId ? (t3.ref.isHiding = false, n.hidden = false, t3.ref.content.hidden = false) : t3.ref.isHiding = true);
  } }, function(e4) {
    var t3 = e4.root, r2 = e4.props;
    t3.ref.content.opacity = t3.ref.isHiding || t3.ref.content.hidden ? 0 : 1, t3.ref.isHiding && t3.ref.content.contentOpacity <= 0 && (t3.ref.isHiding = false, r2.hidden = true, t3.ref.content.hidden = true);
  }) });
};
var filterRoot = createSelectionView("filter", filterList);
var colorRoot = createView2({ name: "color", ignoreRect: true, mixins: { apis: ["viewId", "stagePosition", "hidden"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  r2.viewId = "color", r2.hidden = false, t2.ref.isHiding = false, t2.ref.form = t2.appendChildView(t2.createChildView(colorForm, { opacity: 0, id: r2.id }));
}, read: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  if (!r2.hidden) {
    var n = t2.rect;
    if (0 !== n.element.width && 0 !== n.element.height) {
      var i2 = t2.ref.form.rect, o2 = i2.element.height, a2 = 0 === i2.element.top, c2 = a2 ? n.element.top + o2 : n.element.top, l2 = a2 ? n.element.height - o2 : n.element.height - o2 - n.element.top;
      r2.stagePosition = { x: n.element.left, y: c2, width: n.element.width, height: l2 };
    }
  }
}, shouldUpdateChildViews: function(e3) {
  var t2 = e3.props, r2 = e3.actions;
  return !t2.hidden || t2.hidden && r2 && r2.length;
}, write: createRoute2({ SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = e3.props;
  r2.id === n.viewId ? (t2.ref.isHiding = false, t2.ref.form.opacity = 1, n.hidden = false) : (t2.ref.isHiding = true, t2.ref.form.opacity = 0);
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.ref.isHiding && 0 === t2.ref.form.opacity && (t2.ref.isHiding = false, r2.hidden = true);
}) });
var supportsColorPicker = function() {
  try {
    var e3 = createElement3("input", { type: "color" }), t2 = "color" === e3.type;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? t2 : t2 && "number" != typeof e3.selectionStart;
  } catch (e4) {
    return false;
  }
};
var toHSL = function(e3, t2, r2) {
  var n, i2 = Math.max(e3, t2, r2), o2 = Math.min(e3, t2, r2), a2 = i2 - o2, c2 = 0 === i2 ? 0 : a2 / i2, l2 = i2 / 255;
  switch (i2) {
    case o2:
      n = 0;
      break;
    case e3:
      n = t2 - r2 + a2 * (t2 < r2 ? 6 : 0), n /= 6 * a2;
      break;
    case t2:
      n = r2 - e3 + 2 * a2, n /= 6 * a2;
      break;
    case r2:
      n = e3 - t2 + 4 * a2, n /= 6 * a2;
  }
  return [n, c2, l2];
};
var markupColor = createView2({ ignoreRect: true, tag: "div", name: "markup-color", mixins: { animations: { opacity: "spring" }, styles: ["opacity"], apis: ["onSelect", "selectedValue"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = r2.colors, i2 = r2.name, o2 = r2.onSelect;
  t2.ref.handleChange = function(e4) {
    o2(e4.target.value), e4.stopPropagation();
  }, t2.element.addEventListener("change", t2.ref.handleChange);
  var a2 = createElement3("ul");
  if (t2.ref.inputs = n.map(function(e4) {
    var t3 = "doka--color-" + getUniqueId3(), r3 = createElement3("li"), n2 = createElement3("input", { id: t3, name: i2, type: "radio", value: e4[1] }), o3 = createElement3("label", { for: t3, title: e4[0], style: "background-color: " + (e4[2] || e4[1]) });
    return o3.textContent = e4[0], appendChild2(r3)(n2), appendChild2(r3)(o3), appendChild2(a2)(r3), n2;
  }), t2.element.appendChild(a2), t2.query("GET_MARKUP_ALLOW_CUSTOM_COLOR") && supportsColorPicker()) {
    var c2 = createElement3("div", { class: "doka--color-input" }), l2 = "doka--color-" + getUniqueId3(), u = createElement3("label", { for: l2 });
    u.textContent = "Choose color";
    var s2 = createElement3("input", { id: l2, name: i2, type: "color" }), d = createElement3("span", { class: "doka--color-visualizer" }), p = createElement3("span", { class: "doka--color-brightness" });
    t2.ref.handleCustomColorChange = function() {
      var e4 = toRGBColorArray(s2.value), t3 = toHSL.apply(void 0, _toConsumableArray(e4)), r3 = 360 * t3[0] - 90, n2 = 0.625 * t3[1], i3 = 1 - t3[2];
      d.style.backgroundColor = s2.value, d.style.transform = "rotateZ(".concat(r3, "deg) translateX(").concat(n2, "em)"), p.style.opacity = i3, o2(s2.value);
    };
    var f2 = true;
    t2.ref.handleCustomColorSelect = function(e4) {
      f2 ? o2(e4.target.value) : t2.ref.handleCustomColorChange(), f2 = false;
    }, s2.addEventListener("click", t2.ref.handleCustomColorSelect), s2.addEventListener("input", t2.ref.handleCustomColorChange), appendChild2(c2)(s2), appendChild2(c2)(u), appendChild2(c2)(d), appendChild2(c2)(p), t2.appendChild(c2), t2.ref.customInput = s2;
  }
}, write: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  if (r2.selectedValue !== t2.ref.activeSelectedValue) {
    t2.ref.activeSelectedValue = r2.selectedValue;
    var n = false;
    if (t2.ref.inputs.forEach(function(e4) {
      e4.checked = e4.value === r2.selectedValue, e4.checked && (n = true);
    }), !t2.ref.customInput) return;
    t2.ref.customInput.dataset.selected = t2.ref.inputs.length && !n, n || (t2.ref.customInput.value = r2.selectedValue, t2.ref.handleCustomColorChange());
  }
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.element.removeEventListener("change", t2.ref.handleChange), t2.ref.customInput && (t2.ref.customInput.removeEventListener("click", t2.ref.handleCustomColorSelect), t2.ref.customInput.removeEventListener("input", t2.ref.handleCustomColorChange));
} });
var showDrawTool = function(e3) {
  var t2 = e3.ref, r2 = t2.colorSelect, n = t2.fontFamilySelect, i2 = t2.fontSizeSelect, o2 = t2.shapeStyleSelect, a2 = t2.lineStyleSelect;
  [n, i2, o2, t2.lineDecorationSelect].forEach(function(e4) {
    e4.element.dataset.active = "false";
  }), [r2, a2].forEach(function(e4) {
    e4.element.dataset.active = "true";
  });
};
var ALL_SETTINGS = ["fontFamily", "fontSize", "fontWeight", "textAlign", "backgroundColor", "fontColor", "borderColor", "borderWidth", "borderStyle", "lineColor", "lineWidth", "lineDecoration", "lineJoin", "lineCap"];
var createSVG = function(e3) {
  return '<svg width="23" height="23" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'.concat(e3, "</svg>");
};
var createShapeStyleIcon = function(e3) {
  var t2 = 0 === e3 ? "currentColor" : "none", r2 = e3;
  return createSVG('<rect stroke="'.concat(0 === e3 ? "none" : "currentColor", '" fill="').concat(t2, '" stroke-width="').concat(r2, '" x="2" y="3" width="17" height="17" rx="3"/>'));
};
var createLineStyleIcon = function(e3) {
  return createSVG('<line stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width="'.concat(e3, '" x1="3" y1="12" x2="20" y2="12"/>'));
};
var markupTools = createView2({ name: "markup-tools", ignoreRect: true, mixins: { apis: ["onUpdate"], animations: { translateY: "spring", opacity: "spring" }, styles: ["translateY", "opacity"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props.onUpdate;
  t2.ref.colorSelect = t2.appendChildView(t2.createChildView(markupColor, { onSelect: function(e4) {
    t2.ref.colorSelect.selectedValue = e4, r2("color", e4);
  }, name: "color-select", colors: t2.query("GET_MARKUP_COLOR_OPTIONS") })), t2.ref.shapeStyleSelect = t2.appendChildView(t2.createChildView(dropdown, { onSelect: function(e4) {
    t2.ref.shapeStyleSelect.selectedValue = e4, r2("shapeStyle", e4.slice(1));
  }, name: "tool", label: t2.query("GET_LABEL_MARKUP_SELECT_SHAPE_STYLE"), direction: "up", options: t2.query("GET_MARKUP_SHAPE_STYLE_OPTIONS").map(function(e4) {
    return { value: e4, label: e4[0], icon: createShapeStyleIcon(e4[3]) };
  }) })), t2.ref.lineStyleSelect = t2.appendChildView(t2.createChildView(dropdown, { onSelect: function(e4) {
    t2.ref.lineStyleSelect.selectedValue = e4, r2("lineStyle", e4.slice(1));
  }, name: "tool", label: t2.query("GET_LABEL_MARKUP_SELECT_LINE_STYLE"), direction: "up", options: t2.query("GET_MARKUP_LINE_STYLE_OPTIONS").map(function(e4) {
    return { value: e4, label: e4[0], icon: createLineStyleIcon(e4[3]) };
  }) })), t2.ref.lineDecorationSelect = t2.appendChildView(t2.createChildView(dropdown, { onSelect: function(e4) {
    t2.ref.lineDecorationSelect.selectedValue = e4, r2("lineDecoration", e4);
  }, name: "tool", label: t2.query("GET_LABEL_MARKUP_SELECT_LINE_DECORATION"), direction: "up", options: t2.query("GET_MARKUP_LINE_DECORATION_OPTIONS").map(function(e4) {
    return { value: e4[1], label: e4[0] };
  }) })), t2.ref.fontFamilySelect = t2.appendChildView(t2.createChildView(dropdown, { onSelect: function(e4) {
    t2.ref.fontFamilySelect.selectedValue = e4, r2("fontFamily", e4);
  }, name: "tool", label: t2.query("GET_LABEL_MARKUP_SELECT_FONT_FAMILY"), direction: "up", options: t2.query("GET_MARKUP_FONT_FAMILY_OPTIONS").map(function(e4) {
    return { value: e4[1], label: '<span style="font-family:'.concat(e4[1], ';font-weight:600;">').concat(e4[0], "</span>") };
  }) })), t2.ref.fontSizeSelect = t2.appendChildView(t2.createChildView(dropdown, { onSelect: function(e4) {
    t2.ref.fontSizeSelect.selectedValue = e4, r2("fontSize", e4);
  }, name: "tool", label: t2.query("GET_LABEL_MARKUP_SELECT_FONT_SIZE"), direction: "up", options: t2.query("GET_MARKUP_FONT_SIZE_OPTIONS").map(function(e4) {
    return { value: e4[1], label: e4[0] };
  }) })), "draw" === t2.query("GET_MARKUP_UTIL") && showDrawTool(t2);
}, write: createRoute2({ SWITCH_MARKUP_UTIL: function(e3) {
  var t2 = e3.root;
  "draw" === e3.action.util && showDrawTool(t2);
}, MARKUP_SELECT: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = t2.ref, i2 = n.colorSelect, o2 = n.fontFamilySelect, a2 = n.fontSizeSelect, c2 = n.shapeStyleSelect, l2 = n.lineStyleSelect, u = n.lineDecorationSelect, s2 = r2.id ? t2.query("GET_MARKUP_BY_ID", r2.id) : null, d = [i2, o2, a2, c2, l2, u], p = [];
  if (s2) {
    var f2 = _slicedToArray(s2, 2), h = f2[0], g = f2[1], m = Array.isArray(g.allowEdit) ? g.allowEdit : false === g.allowEdit ? [] : ALL_SETTINGS, v = ALL_SETTINGS.reduce(function(e4, t3) {
      return e4[t3] = -1 !== m.indexOf(t3), e4;
    }, {});
    if (v.color = !!m.find(function(e4) {
      return /[a-z]Color/.test(e4);
    }), "image" !== h && v.color && (i2.selectedValue = getColor$2(g), p.push(i2)), "text" === h && (v.fontFamily && (o2.selectedValue = g.fontFamily, p.push(o2)), v.fontSize && (a2.selectedValue = g.fontSize, p.push(a2))), ("rect" === h || "ellipse" === h) && v.borderStyle) {
      var y = t2.query("GET_MARKUP_SHAPE_STYLE_OPTIONS").find(function(e4) {
        var t3 = g.borderWidth === e4[1], r3 = g.borderStyle === e4[2] || arrayEqual(g.borderStyle, e4[2]);
        return t3 && r3;
      });
      c2.selectedValue = y, p.push(c2);
    }
    if ("line" === h || "path" === h) {
      if (v.lineWidth) {
        var E = t2.query("GET_MARKUP_LINE_STYLE_OPTIONS").find(function(e4) {
          var t3 = g.lineWidth === e4[1], r3 = g.lineStyle === e4[2] || arrayEqual(g.lineStyle, e4[2]);
          return t3 && r3;
        });
        l2.selectedValue = E, p.push(l2);
      }
      "line" === h && v.lineDecoration && (u.selectedValue = g.lineDecoration, p.push(u));
    }
    d.forEach(function(e4) {
      e4.element.dataset.active = "false";
    }), p.forEach(function(e4) {
      e4.element.dataset.active = "true";
    });
  }
}, MARKUP_UPDATE: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = r2.style, i2 = r2.value;
  t2.ref[n + "Select"] && (t2.ref[n + "Select"].selectedValue = i2);
} }) });
var getColor$2 = function(e3) {
  var t2 = e3.fontColor, r2 = e3.backgroundColor, n = e3.lineColor, i2 = e3.borderColor;
  return t2 || r2 || n || i2;
};
var markupRoot = createView2({ name: "markup", ignoreRect: true, mixins: { apis: ["viewId", "stagePosition", "hidden"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  r2.viewId = "markup", r2.hidden = false, t2.ref.isHiding = false;
  var n = [["select", { label: t2.query("GET_LABEL_MARKUP_TOOL_SELECT"), icon: createIcon('<g fill="none" fill-rule="evenodd"><path d="M7 13H5a1 1 0 01-1-1V5a1 1 0 011-1h7a1 1 0 011 1v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10.22 8.914l12.58 5.18a1 1 0 01.012 1.844l-4.444 1.904a1 1 0 00-.526.526l-1.904 4.444a1 1 0 01-1.844-.013l-5.18-12.58a1 1 0 011.305-1.305z" fill="currentColor"/></g>', 26) }], ["draw", { label: t2.query("GET_LABEL_MARKUP_TOOL_DRAW"), icon: createIcon('<g fill="currentColor"><path d="M17.86 5.71a2.425 2.425 0 013.43 3.43L9.715 20.714 5 22l1.286-4.715L17.86 5.71z"/></g>', 26) }], ["line", { label: t2.query("GET_LABEL_MARKUP_TOOL_LINE"), icon: createIcon('<g transform="translate(3 4.5)" fill-rule="nonzero" fill="currentColor" stroke="none"><path d="M15.414 9.414l-6.01 6.01a2 2 0 1 1-2.829-2.828L9.172 10H2a2 2 0 1 1 0-4h7.172L6.575 3.404A2 2 0 1 1 9.404.575l6.01 6.01c.362.363.586.863.586 1.415s-.224 1.052-.586 1.414z"/></g>', 26) }], ["text", { label: t2.query("GET_LABEL_MARKUP_TOOL_TEXT"), icon: createIcon('<g transform="translate(5 5)" fill="currentColor" fill-rule="evenodd"><path d="M10 4v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5z"/></g>', 26) }], ["rect", { label: t2.query("GET_LABEL_MARKUP_TOOL_RECT"), icon: createIcon('<g fill="currentColor"><rect x="5" y="5" width="16" height="16" rx="2"/></g>', 26) }], ["ellipse", { label: t2.query("GET_LABEL_MARKUP_TOOL_ELLIPSE"), icon: createIcon('<g fill="currentColor"><circle cx="13" cy="13" r="9"/></g>', 26) }]];
  t2.ref.utils = createElement3("fieldset"), t2.ref.utils.className = "doka--markup-utils", t2.ref.utilsList = createElement3("ul");
  var i2 = "markup-utils-".concat(getUniqueId3());
  t2.ref.inputs = n.map(function(e4) {
    var r3 = e4[0], n2 = e4[1], o3 = "doka--markup-tool-" + getUniqueId3(), a2 = createElement3("li"), c2 = createElement3("input");
    c2.id = o3, c2.checked = t2.query("GET_MARKUP_UTIL") === r3, c2.setAttribute("type", "radio"), c2.setAttribute("name", i2), c2.value = r3;
    var l2 = createElement3("label");
    return l2.setAttribute("for", o3), l2.className = "doka--button-tool", l2.innerHTML = n2.icon + "<span>" + n2.label + "</span>", l2.title = n2.label, a2.appendChild(c2), a2.appendChild(l2), t2.ref.utilsList.appendChild(a2), c2;
  }), t2.ref.utils.appendChild(t2.ref.utilsList), t2.ref.utilsList.addEventListener("change", function(e4) {
    t2.dispatch("SET_MARKUP_UTIL", { value: e4.target.value });
  }), t2.query("GET_MARKUP_ALLOW_ADD_MARKUP") && (t2.ref.menu = t2.appendChildView(t2.createChildView(createGroup("toolbar", ["opacity"], { opacity: { type: "spring", mass: 15, delay: 50 } }), { opacity: 0, element: t2.ref.utils })));
  var o2 = t2.ref.tools = t2.appendChildView(t2.createChildView(markupTools, { opacity: 0, onUpdate: function(e4, r3) {
    t2.dispatch("MARKUP_UPDATE", { style: e4, value: r3 });
  } }));
  t2.ref.menuItemsRequiredWidth = null, "draw" === t2.query("GET_MARKUP_UTIL") && (o2.opacity = 1, o2.translateY = 0, o2.element.dataset.active = "true");
}, read: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  if (r2.hidden) t2.ref.menuItemsRequiredWidth = null;
  else {
    var n = t2.rect;
    if (0 !== n.element.width && 0 !== n.element.height) {
      if (t2.ref.menu && null === t2.ref.menuItemsRequiredWidth) {
        var i2 = t2.ref.menu.rect.element.width;
        t2.ref.menuItemsRequiredWidth = 0 === i2 ? null : i2;
      }
      var o2 = t2.ref.menu && t2.ref.menu.rect, a2 = t2.ref.tools.rect.element.height, c2 = o2 ? o2.element.height : a2, l2 = !o2 || 0 === o2.element.top, u = l2 ? n.element.top + c2 : n.element.top, s2 = l2 ? n.element.height - c2 : n.element.height - c2 - n.element.top;
      r2.stagePosition = { x: n.element.left + 20, y: u, width: n.element.width - 40, height: s2 - a2 };
    }
  }
}, shouldUpdateChildViews: function(e3) {
  var t2 = e3.props, r2 = e3.actions;
  return !t2.hidden || t2.hidden && r2 && r2.length;
}, write: createRoute2({ SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = e3.props;
  r2.id === n.viewId ? (n.hidden = false, t2.ref.isHiding = false, t2.ref.menu && (t2.ref.menu.opacity = 1)) : (t2.ref.isHiding = true, t2.ref.menu && (t2.ref.menu.opacity = 0), t2.ref.tools.opacity = 0, t2.ref.tools.translateY = 5, t2.dispatch("SET_MARKUP_UTIL", { value: "select" }));
}, MARKUP_SELECT: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  t2.ref.tools.opacity = r2.id ? 1 : 0, t2.ref.tools.translateY = r2.id ? 0 : 5, t2.ref.tools.element.dataset.active = r2.id ? "true" : "false";
}, DID_SET_MARKUP_UTIL: function(e3) {
  var t2 = e3.root, r2 = e3.action, n = t2.ref, i2 = n.inputs, o2 = n.tools;
  i2.forEach(function(e4) {
    e4.checked = e4.value === r2.value;
  }), "draw" === r2.value && (o2.opacity = 1, o2.translateY = 0, o2.element.dataset.active = "true");
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.ref.isHiding && t2.ref.menu && 0 === t2.ref.menu.opacity && (t2.ref.isHiding = false, r2.hidden = true), r2.hidden || (t2.ref.menu.element.dataset.layout = t2.ref.menuItemsRequiredWidth > t2.rect.element.width ? "compact" : "spacious");
}) });
var positions = ["x", "y", "left", "top", "right", "bottom"];
var hasNoPosition = function(e3) {
  return positions.every(function(t2) {
    return void 0 === e3[t2];
  });
};
var getRandomRange = function() {
  return -0.5 + Math.random();
};
var isEmoji = function(e3) {
  return null !== e3.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
};
var stickerList = createView2({ ignoreRect: true, tag: "ul", name: "sticker-list", create: function(e3) {
  var t2 = e3.root;
  t2.element.setAttribute("role", "list");
  var r2 = function(e4, r3) {
    var n2 = e4.markup;
    "string" == typeof e4 || Array.isArray(e4) ? n2 = e4 : e4.markup || (n2 = e4.sticker), Array.isArray(e4.sticker) && (n2 = [n2[0], _objectSpread({}, e4.sticker[1], n2[1])]);
    var i2, o2, a2 = "string" == typeof n2, c2 = a2 && isEmoji(n2), l2 = a2 && !c2, u = 0, s2 = 0, d = t2.query("GET_CROP_RECTANGLE_ASPECT_RATIO");
    if (l2) i2 = "image", u = 0.5 * -(o2 = { src: n2, width: 0.5, height: 0.5 * d, fit: "contain" }).width, s2 = 0.5 * -o2.height;
    else {
      if (c2 ? (i2 = "text", o2 = { text: n2 }) : (i2 = n2[0], o2 = _objectSpread({}, n2[1])), "text" === i2) {
        o2.fontColor = o2.fontColor || "#000000", o2.fontSize = o2.fontSize || 0.125, o2.allowInput = void 0 !== o2.allowInput && o2.allowInput, o2.allowEdit = void 0 !== o2.allowEdit && o2.allowEdit;
        var p = c2 ? 0.75 * o2.fontSize : 0.35 * o2.fontSize * o2.text.length;
        u = -0.5 * p, s2 = 0.5 * (c2 ? p * d * 0.5 : 0.5 * o2.fontSize);
      }
      "string" == typeof o2.width || "string" == typeof o2.height || "rect" !== i2 && "ellipse" !== i2 && "line" !== i2 && "image" !== i2 || (o2.height = o2.height * d, u = 0.5 * -o2.width, s2 = 0.5 * -o2.height);
    }
    r3 && (o2.x = r3.x + u, o2.y = r3.y + s2), hasNoPosition(o2) && (o2.x = 0.5 + 0.5 * getRandomRange() + u, o2.y = 0.5 + 0.5 * getRandomRange() + s2), t2.dispatch("MARKUP_ADD", [i2, o2]);
  };
  t2.element.addEventListener("pointerdown", function(e4) {
    var n2 = e4.target.dataset.index || "";
    if (n2.length) {
      var i2 = t2.query("GET_STICKERS")[n2];
      if (i2) {
        var o2 = { x: e4.pageX, y: e4.pageY }, a2 = Date.now();
        document.documentElement.addEventListener("pointerup", function e5(n3) {
          document.documentElement.removeEventListener("pointerup", e5);
          var c2 = { x: n3.pageX, y: n3.pageY }, l2 = vectorDistanceSquared3(o2, c2), u = Date.now() - a2;
          if (l2 < 10 && u < 300) r2(i2);
          else {
            var s2 = t2.query("GET_ROOT"), d = t2.query("GET_STAGE"), p = t2.query("GET_CROP_RECT"), f2 = void 0 !== n3.offsetX ? n3.offsetX : n3.pageX - s2.x - d.x - window.pageXOffset, h = void 0 !== n3.offsetY ? n3.offsetY : n3.pageY - s2.y - d.y - window.pageYOffset, g = d.x + p.x, m = d.y + p.y, v = (f2 - g) / p.width, y = (h - m) / p.height;
            v < 0 || v > 1 || y < 0 || y > 1 || r2(i2, { x: v, y });
          }
        });
      }
    }
  });
  var n = function() {
    var e4 = t2.query("GET_STICKERS");
    t2.element.innerHTML = "", e4.forEach(function(e5, r3) {
      var n2, i2;
      "string" == typeof e5 || Array.isArray(e5) ? (n2 = "", i2 = e5) : (n2 = e5.alt || "", i2 = e5.sticker);
      var o2, a2 = createElement3("button"), c2 = "string" == typeof i2, l2 = c2 && isEmoji(i2);
      if (c2 && !l2) (o2 = new Image()).src = i2;
      else {
        var u, s2;
        o2 = createElement3("svg", { viewBox: "0 0 100 100", xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink" }), l2 ? (u = "text", s2 = { text: i2 }) : (u = i2[0], s2 = _objectSpread({}, i2[1])), "text" === u && (s2.fontColor = s2.fontColor || "#000000", s2.fontSize = s2.fontSize || 0.3125);
        var d = createMarkupByType3(u, s2);
        updateMarkupByType3(d, u, s2, { width: 200, height: 200 }), d.removeAttribute("id");
        var p = "text" === u ? 6 : 0;
        "ellipse" === u ? (d.setAttribute("cx", "50"), d.setAttribute("cy", "50")) : (d.setAttribute("x", 50 - 0.5 * d.getAttribute("width")), d.setAttribute("y", 50 - 0.5 * d.getAttribute("height"))), "text" === u && (d.setAttribute("x", "50"), d.setAttribute("y", 50 + p), d.setAttribute("text-anchor", "middle"), d.setAttribute("dominant-baseline", "middle")), o2.appendChild(d);
      }
      n2 && (a2.innerHTML = "<span>".concat(n2, "</span>")), a2.appendChild(o2), a2.dataset.index = r3, a2.setAttribute("type", "button"), a2.className = "doka--button doka--button-tool";
      var f2 = createElement3("li");
      f2.appendChild(a2), t2.element.appendChild(f2);
    });
  };
  t2.ref.updateStickers = n, n();
}, write: createRoute2({ DID_SET_STICKERS: function(e3) {
  var t2 = e3.root;
  e3.action, e3.props;
  t2.ref.updateStickers();
} }) });
var stickerRoot = createSelectionView("sticker", stickerList);
var hasStagePositionChanged = function(e3, t2) {
  return !e3 || !t2 || !rectEqualsRect(e3, t2);
};
var VIEW_MAP = { crop: cropRoot, resize: resizeRoot, filter: filterRoot, color: colorRoot, markup: markupRoot, sticker: stickerRoot };
var viewStack = createView2({ name: "view-stack", ignoreRect: true, mixins: { apis: ["offsetTop"] }, create: function(e3) {
  var t2 = e3.root;
  t2.ref.activeView = null, t2.ref.activeStagePosition = null, t2.ref.shouldFocus = false;
}, write: createRoute2({ SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.action, i2 = 0 === t2.childViews.length, o2 = t2.childViews.find(function(e4) {
    return e4.viewId === n.id;
  });
  o2 || (o2 = t2.appendChildView(t2.createChildView(VIEW_MAP[n.id], _objectSpread({}, r2)))), t2.ref.activeView = o2, t2.childViews.map(function(e4) {
    return e4.element;
  }).forEach(function(e4) {
    e4.dataset.viewActive = "false", e4.removeAttribute("tabindex"), isIE() && (e4.style.transform = "");
  });
  var a2 = t2.ref.activeView.element;
  a2.dataset.viewActive = "true", a2.setAttribute("tabindex", -1), isIE() && setTimeout(function() {
    a2.style.transform = "translateZ(0)";
  }, 32), t2.ref.shouldFocus = !i2;
}, DID_PRESENT_IMAGE: function(e3) {
  var t2 = e3.root;
  t2.dispatch("CHANGE_VIEW", { id: t2.query("GET_UTIL") || t2.query("GET_UTILS")[0] });
}, DID_SET_UTILS: function(e3) {
  var t2 = e3.root;
  t2.dispatch("CHANGE_VIEW", { id: t2.query("GET_UTIL") || t2.query("GET_UTILS")[0] });
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = t2.ref, i2 = n.activeView, o2 = n.previousStagePosition;
  if (i2 && i2.stagePosition && (t2.childViews.forEach(function(e4) {
    e4.offsetTop = r2.offsetTop, e4.element.viewHidden !== e4.hidden && (e4.element.viewHidden = e4.hidden, e4.element.dataset.viewHidden = e4.hidden);
  }), hasStagePositionChanged(i2.stagePosition, o2))) {
    var a2 = i2.stagePosition, c2 = a2.x, l2 = a2.y, u = a2.width, s2 = a2.height;
    if (0 === u && 0 === s2) return;
    t2.dispatch("DID_RESIZE_STAGE", { offset: { x: c2, y: l2 }, size: { width: u, height: s2 }, animate: true }), t2.ref.previousStagePosition = i2.stagePosition;
  }
}), didWriteView: function(e3) {
  var t2 = e3.root;
  t2.ref.shouldFocus && (t2.ref.activeView.element.focus({ preventScroll: true }), t2.ref.shouldFocus = false);
} });
var editContent = createView2({ name: "content", ignoreRect: true, mixins: { styles: ["opacity"], animations: { opacity: { type: "tween", duration: 250 } } }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.opacity = 1, t2.ref.viewStack = t2.appendChildView(t2.createChildView(viewStack, { id: r2.id })), t2.ref.image = null;
}, write: createRoute2({ DID_LOAD_IMAGE: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.ref.image = t2.appendChildView(t2.createChildView(image, { id: r2.id }));
} }, function(e3) {
  var t2 = e3.root, r2 = t2.ref, n = r2.image, i2 = r2.viewStack;
  if (n) {
    var o2 = t2.rect.element.top;
    i2.offsetTop = o2, n.offsetTop = o2;
  }
}) });
var updateResizeButton = function(e3, t2) {
  e3.element.dataset.scaleDirection = null === t2 || t2 > 1 ? "up" : "down";
};
var editUtils = createView2({ name: "utils", create: function(e3) {
  var t2 = e3.root, r2 = { crop: { title: t2.query("GET_LABEL_BUTTON_UTIL_CROP"), icon: createIcon('<g fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width="2"><path d="M23 17H9a2 2 0 0 1-2-2v-5m0-3V1"/><path d="M1 7h14a2 2 0 0 1 2 2v7m0 4v3"/></g>') }, filter: { title: t2.query("GET_LABEL_BUTTON_UTIL_FILTER"), icon: createIcon('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.347 9.907a6.5 6.5 0 1 0-1.872 3.306M3.26 11.574a6.5 6.5 0 1 0 2.815-1.417"/><path d="M10.15 17.897A6.503 6.503 0 0 0 16.5 23a6.5 6.5 0 1 0-6.183-8.51"/></g>') }, color: { title: t2.query("GET_LABEL_BUTTON_UTIL_COLOR"), icon: createIcon('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 1v5.5m0 3.503V23M12 1v10.5m0 3.5v8M20 1v15.5m0 3.5v3M2 7h4M10 12h4M18 17h4"/></g>') }, markup: { title: t2.query("GET_LABEL_BUTTON_UTIL_MARKUP"), icon: createIcon('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.086 2.914a2.828 2.828 0 1 1 4 4l-14.5 14.5-5.5 1.5 1.5-5.5 14.5-14.5z"/></g>') }, sticker: { title: t2.query("GET_LABEL_BUTTON_UTIL_STICKER"), icon: createIcon('<g fill="none" fill-rule="evenodd" stroke-linecap="round" stroke="currentColor" stroke-width="2"><path d="M19.046 14.938a11.87 11.87 0 01-1.796 2.312C16.083 18.417 14.667 19.333 13 20H6.5A2.5 2.5 0 014 17.5v-11A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5V12" stroke-linejoin="round"/><path d="M12 20v-5.5a2.5 2.5 0 012.5-2.5h5.473"/></g>') }, resize: { title: t2.query("GET_LABEL_BUTTON_UTIL_RESIZE"), icon: createIcon('<g fill="none" fill-rule="evenodd" stroke-width="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="12" width="10" height="10" rx="2"/><path d="M4 11.5V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5"/><path d="M14 10l3.365-3.365M14 6h4v4" class="doka--icon-resize-arrow-ne"/><path d="M14 10l3.365-3.365M14 6v4h4" class="doka--icon-resize-arrow-sw"/></g>') } };
  t2.ref.utils = Object.keys(r2).map(function(e4) {
    return _objectSpread({ id: e4 }, r2[e4]);
  }), t2.ref.utilMenuRequiredWidth = null;
}, read: function(e3) {
  var t2 = e3.root;
  if (null === t2.ref.utilMenuRequiredWidth) {
    var r2 = t2.childViews.reduce(function(e4, t3) {
      return e4 + t3.rect.outer.width;
    }, 0);
    t2.ref.utilMenuRequiredWidth = 0 === r2 ? null : r2;
  }
}, write: createRoute2({ DID_SET_UTILS: function(e3) {
  var t2 = e3.root, r2 = _toConsumableArray(t2.query("GET_UTILS"));
  t2.childViews.forEach(function(e4) {
    return t2.removeChildView(e4);
  }), t2.element.dataset.utilCount = r2.length, 1 === r2.length && (r2.length = 0), r2.forEach(function(e4) {
    var r3 = t2.ref.utils.find(function(t3) {
      return t3.id === e4;
    }), n = t2.appendChildView(t2.createChildView(button, { name: "tab", view: button, label: r3.title, opacity: 1, icon: r3.icon, id: r3.id, action: function() {
      return t2.dispatch("CHANGE_VIEW", { id: r3.id });
    } }));
    t2.ref["util_button_".concat(r3.id)] = n;
  });
}, SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  t2.childViews.forEach(function(e4) {
    e4.element.dataset.active = e4.id === r2.id;
  });
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp, i2 = t2.query("GET_CROP", r2.id, n);
  if (i2) {
    var o2 = i2.cropStatus;
    t2.ref.util_button_resize && updateResizeButton(t2.ref.util_button_resize, o2.image.width ? o2.image.width / o2.crop.width : null), t2.element.dataset.layout = t2.ref.utilMenuRequiredWidth > t2.rect.element.width ? "compact" : "spacious";
  }
}) });
var HAS_WEBGL = isBrowser10() && (function() {
  try {
    var e3 = { antialias: false, alpha: false }, t2 = document.createElement("canvas");
    return !!window.WebGLRenderingContext && (t2.getContext("webgl", e3) || t2.getContext("experimental-webgl", e3));
  } catch (e4) {
    return false;
  }
})();
var hasWebGL = function() {
  return HAS_WEBGL;
};
var editContainer = createView2({ name: "container", create: function(e3) {
  var t2 = e3.root, r2 = [];
  t2.query("GET_ALLOW_BUTTON_RESET") && r2.push({ view: button, opacity: 0, label: t2.query("GET_LABEL_BUTTON_RESET"), didCreateView: function(e4) {
    return t2.ref.btnReset = e4;
  }, name: "app action-reset icon-only", icon: createIcon('<g fill="currentColor" fill-rule="nonzero"><path d="M6.036 13.418L4.49 11.872A.938.938 0 1 0 3.163 13.2l2.21 2.209a.938.938 0 0 0 1.326 0l2.209-2.21a.938.938 0 0 0-1.327-1.326l-1.545 1.546zM12 10.216a1 1 0 0 1 2 0V13a1 1 0 0 1-2 0v-2.784z"/><path d="M15.707 14.293a1 1 0 0 1-1.414 1.414l-2-2a1 1 0 0 1 1.414-1.414l2 2z"/><path d="M8.084 19.312a1 1 0 0 1 1.23-1.577 6 6 0 1 0-2.185-3.488 1 1 0 0 1-1.956.412 8 8 0 1 1 2.912 4.653z"/></g>', 26), action: function() {
    var e4 = t2.query("GET_BEFORE_RESET"), r3 = !e4 || e4();
    Promise.resolve(r3).then(function(e5) {
      e5 && t2.dispatch("EDIT_RESET");
    });
  } }), t2.query("GET_ALLOW_BUTTON_CANCEL") && r2.unshift({ view: button, label: t2.query("GET_LABEL_BUTTON_CANCEL"), name: "app action-cancel icon-fallback", opacity: 1, icon: createIcon('<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></g>'), didCreateView: function(e4) {
    t2.ref.btnCancel = e4;
  }, action: function() {
    t2.dispatch("EDIT_CANCEL");
  } }), r2.push({ view: editUtils }), t2.query("GET_ALLOW_BUTTON_CONFIRM") && r2.push({ view: button, label: t2.query("GET_LABEL_BUTTON_CONFIRM"), name: "app action-confirm icon-fallback", opacity: 1, icon: createIcon('<polyline fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="20 6 9 17 4 12"></polyline>'), didCreateView: function(e4) {
    t2.ref.btnConfirm = e4;
  }, action: function() {
    t2.dispatch("EDIT_CONFIRM");
  } }), t2.ref.menu = t2.appendChildView(t2.createChildView(createGroup("menu"), { controls: r2 })), t2.ref.menu.opacity = 0, t2.ref.status = t2.appendChildView(t2.createChildView(editStatus)), t2.ref.hasWebGL = hasWebGL(), t2.ref.hasWebGL ? t2.dispatch("AWAIT_IMAGE") : t2.dispatch("MISSING_WEBGL"), t2.ref.handleFocusOut = function(e4) {
    if (e4.relatedTarget && contains(t2.element, e4.relatedTarget)) {
      var r3 = t2.ref.status;
      "busy" === r3.element.dataset.viewStatus && r3.element.focus();
    }
  }, t2.ref.handleFocusIn = function(e4) {
    var r3 = t2.ref, n = r3.menu, i2 = r3.content, o2 = e4.target;
    if (!contains(n.element, o2) && i2 && contains(i2.element, o2)) {
      if (!Array.from(t2.element.querySelectorAll("[data-view-active=false]")).reduce(function(e5, t3) {
        return contains(t3, o2) && (e5 = true), e5;
      }, false)) return;
      n.element.querySelector("button,input,[tabindex]").focus();
    }
  }, t2.element.addEventListener("focusin", t2.ref.handleFocusIn), t2.element.addEventListener("focusout", t2.ref.handleFocusOut), t2.ref.previousState = null;
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.element.removeEventListener("focusin", t2.ref.handleFocusIn), t2.element.removeEventListener("focusout", t2.ref.handleFocusOut);
}, write: createRoute2({ UNLOAD_IMAGE: function(e3) {
  var t2 = e3.root;
  t2.ref.content && (t2.ref.content.opacity = 0, t2.ref.menu.opacity = 0);
}, DID_UNLOAD_IMAGE: function(e3) {
  var t2 = e3.root;
  t2.removeChildView(t2.ref.content), t2.ref.content = null;
}, DID_LOAD_IMAGE: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.ref.hasWebGL && (t2.ref.content = t2.appendChildView(t2.createChildView(editContent, { opacity: null, id: r2.id })), t2.ref.menu.opacity = 1);
}, SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  t2.element.dataset.limitOverflow = "resize" === r2.id;
} }, function(e3) {
  var t2 = e3.root, r2 = e3.props, n = e3.timestamp, i2 = t2.query("GET_CROP", r2.id, n);
  if (i2) {
    var o2 = i2.cropStatus, a2 = o2.props, c2 = { crop: { center: { x: roundFloat(a2.center.x, 5), y: roundFloat(a2.center.y, 5) }, rotation: roundFloat(a2.rotation, 5), zoom: roundFloat(a2.zoom, 5), aspectRatio: roundFloat(a2.aspectRatio, 5), flip: { horizontal: a2.flip.horizontal, vertical: a2.flip.vertical }, scaleToFit: a2.scaleToFit, width: o2.currentWidth, height: o2.currentHeight }, preview: { scale: i2.scale / Math.max(i2.cropRect.width / i2.previewSize.width, i2.cropRect.height / i2.previewSize.height) } };
    hasStateChanged(t2.ref.previousState, c2) && (t2.dispatch("DID_UPDATE", { state: _objectSpread({}, c2) }), t2.ref.previousState = c2);
    var l2 = t2.ref, u = l2.btnReset, s2 = l2.btnCancel, d = l2.content, p = i2.canReset;
    if (u && (u.opacity = p ? 1 : 0), s2 && u) {
      var f2 = t2.query("GET_ROOT_SIZE");
      s2.opacity = p && f2.width <= 600 ? 0 : 1;
    }
    d && 0 === d.opacity && t2.dispatch("DID_UNLOAD_IMAGE");
  }
}) });
var hasStateChanged = function(e3, t2) {
  if (!e3) return true;
  var r2 = e3.crop, n = t2.crop;
  return r2.width !== n.width || r2.height !== n.height || r2.center.x !== n.center.x || r2.center.y !== n.center.y || r2.rotation !== n.rotation || r2.scaleToFit !== n.scaleToFit || r2.zoom !== n.zoom || r2.aspectRatio !== n.aspectRatio || r2.flip.horizontal !== n.flip.horizontal || r2.flip.vertical !== n.flip.vertical;
};
var createPointerEvents = function(e3) {
  var t2 = { destroy: function() {
  } };
  if ("onpointerdown" in window || e3.pointersPolyfilled) return t2;
  e3.pointersPolyfilled = true;
  var r2 = 0, n = [], i2 = function(e4, t3, r3) {
    var n2 = new UIEvent(t3.type, { view: window, bubbles: true });
    Object.keys(t3).forEach(function(e5) {
      Object.defineProperty(n2, e5, { value: t3[e5], writable: false });
    }), e4.dispatchEvent(n2);
  }, o2 = function(e4, t3, o3) {
    return Array.from(t3.changedTouches).map(function(a3) {
      var c3 = n[a3.identifier], l3 = { type: e4, pageX: a3.pageX, pageY: a3.pageY, pointerId: a3.identifier, isPrimary: c3 ? c3.isPrimary : 0 === r2, preventDefault: function() {
        return t3.preventDefault();
      } };
      return i2(a3.target, l3), l3;
    });
  }, a2 = function(e4) {
    o2("pointerdown", e4).forEach(function(e5) {
      n[e5.pointerId] = e5, r2++;
    });
  }, c2 = function(e4) {
    o2("pointermove", e4);
  }, l2 = function(e4) {
    o2("pointerup", e4).forEach(function(e5) {
      delete n[e5.pointerId], r2--;
    });
  }, u = function(e4, t3, r3) {
    var n2 = { type: e4, pageX: t3.pageX, pageY: t3.pageY, pointerId: 0, isPrimary: true, preventDefault: function() {
      return t3.preventDefault();
    } };
    return i2(t3.target, n2), n2;
  }, s2 = function(e4) {
    u("pointerdown", e4);
  }, d = function(e4) {
    u("pointermove", e4);
  }, p = function(e4) {
    u("pointerup", e4);
  };
  return "ontouchstart" in window ? (e3.addEventListener("touchstart", a2), e3.addEventListener("touchmove", c2), e3.addEventListener("touchend", l2)) : "onmousedown" in window && (e3.addEventListener("mousedown", s2), e3.addEventListener("mousemove", d), e3.addEventListener("mouseup", p)), t2.destroy = function() {
    n.length = 0, e3.pointersPolyfilled = false, e3.removeEventListener("touchstart", a2), e3.removeEventListener("touchmove", c2), e3.removeEventListener("touchend", l2), e3.removeEventListener("mousedown", s2), e3.removeEventListener("mousemove", d), e3.removeEventListener("mouseup", p);
  }, t2;
};
var prevent2 = function(e3) {
  "gesturestart" !== e3.type ? climb(e3.target, function(e4) {
    return e4.isScrollContainer;
  }) || e3.preventDefault() : e3.preventDefault();
};
var editor = createView2({ name: "editor", ignoreRect: true, mixins: { styles: ["opacity"], animations: { opacity: { type: "tween", duration: 350 } }, apis: ["markedForRemoval"] }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  r2.markedForRemoval = false, isIOS2() && (t2.element.addEventListener("touchmove", prevent2, { passive: false }), t2.element.addEventListener("gesturestart", prevent2)), t2.ref.pointerPolyfill = createPointerEvents("root" === t2.query("GET_POINTER_EVENTS_POLYFILL_SCOPE") ? t2.element : document.documentElement), t2.appendChildView(t2.createChildView(editContainer, _objectSpread({}, r2)));
}, destroy: function(e3) {
  var t2 = e3.root;
  t2.ref.pointerPolyfill.destroy(), t2.element.removeEventListener("touchmove", prevent2, true), t2.element.removeEventListener("gesturestart", prevent2);
} });
var createTouchDetector = function() {
  function e3() {
    t2.fire("touch-detected"), window.removeEventListener("touchstart", e3, false);
  }
  var t2 = _objectSpread({}, on2(), { destroy: function() {
    window.removeEventListener("touchstart", e3, false);
  } });
  return window.addEventListener("touchstart", e3, false), t2;
};
var createFileCatcher = function(e3) {
  var t2, r2 = { browseEnabled: false }, n = function() {
    t2.files.length && i2.fire("drop", Array.from(t2.files));
  }, i2 = _objectSpread({}, on2(), { enableBrowse: function() {
    r2.browseEnabled || ((t2 = document.createElement("input")).style.display = "none", t2.setAttribute("type", "file"), t2.addEventListener("change", n), e3.appendChild(t2), e3.addEventListener("click", o2), r2.browseEnabled = true);
  }, disableBrowse: function() {
    r2.browseEnabled && (t2.removeEventListener("change", n), t2.parentNode.removeChild(t2), e3.removeEventListener("click", o2), r2.browseEnabled = false);
  }, destroy: function() {
    e3.removeEventListener("dragover", a2), e3.removeEventListener("drop", c2), e3.removeEventListener("click", o2), t2 && t2.removeEventListener("change", n);
  } }), o2 = function() {
    return t2.click();
  }, a2 = function(e4) {
    return e4.preventDefault();
  }, c2 = function(e4) {
    e4.preventDefault();
    var t3 = Array.from(e4.dataTransfer.items || e4.dataTransfer.files).map(function(e5) {
      return e5.getAsFile && "file" === e5.kind ? e5.getAsFile() : e5;
    });
    i2.fire("drop", t3);
  };
  return e3.addEventListener("dragover", a2), e3.addEventListener("drop", c2), i2;
};
var createFocusTrap = function(e3) {
  var t2 = function(t3) {
    if (9 === t3.keyCode) {
      var r2 = Array.from(e3.querySelectorAll("button,input,[tabindex]")).filter(function(e4) {
        return "hidden" !== e4.style.visibility && -1 !== e4.tabIndex;
      }), n = r2[0], i2 = r2[r2.length - 1];
      t3.shiftKey ? document.activeElement === n && (i2.focus(), t3.preventDefault()) : document.activeElement === i2 && (n.focus(), t3.preventDefault());
    }
  };
  return e3.addEventListener("keydown", t2), { destroy: function() {
    e3.removeEventListener("keydown", t2);
  } };
};
var isFullscreen = function(e3) {
  return e3.ref.isFullscreen;
};
var shouldBeFullscreen = function(e3) {
  return /fullscreen/.test(e3.query("GET_STYLE_LAYOUT_MODE"));
};
var isFloating = function(e3) {
  return /fullscreen|preview/.test(e3.query("GET_STYLE_LAYOUT_MODE"));
};
var isModal = function(e3) {
  return /modal/.test(e3.query("GET_STYLE_LAYOUT_MODE"));
};
var mayBeAutoClosed = function(e3) {
  return e3.query("GET_ALLOW_AUTO_CLOSE");
};
var canBeAutoClosed = isFloating;
var canBeClosed = isFloating;
var updateStyleViewport = function(e3) {
  var t2 = e3.ref, r2 = t2.environment, n = t2.isSingleUtil, i2 = t2.canBeControlled;
  e3.element.dataset.styleViewport = getViewportBySize(e3.rect.element.width, e3.rect.element.height) + " " + r2.join(" ") + (n ? " single-util" : " multi-util") + (i2 ? " flow-controls" : " no-flow-controls");
};
var preventNavSwipe = function(e3) {
  var t2 = e3.touches ? e3.touches[0] : e3;
  t2.pageX > 10 && t2.pageX < window.innerWidth - 10 || e3.preventDefault();
};
var setupFullscreenMode = function(e3) {
  var t2 = e3.element, r2 = e3.ref, n = r2.handleFullscreenUpdate, i2 = r2.handleEscapeKey;
  t2.setAttribute("tabindex", -1), n(), e3.ref.focusTrap = createFocusTrap(t2), t2.addEventListener("keydown", i2), isIOS2() && t2.addEventListener("touchstart", preventNavSwipe), window.addEventListener("resize", n), window.innerWidth - document.documentElement.clientWidth > 0 && document.body.classList.add("doka--parent"), document.body.appendChild(t2);
  var o2 = document.querySelector("meta[name=viewport]");
  e3.ref.defaultViewportContent = o2 ? o2.getAttribute("content") : null, o2 || ((o2 = document.createElement("meta")).setAttribute("name", "viewport"), document.head.appendChild(o2)), o2.setAttribute("content", "width=device-width, height=device-height, initial-scale=1, maximum-scale=1, user-scalable=0"), e3.opacity = 1, contains(e3.element, document.activeElement) || t2.focus(), e3.dispatch("INVALIDATE_VIEWPORT"), e3.ref.isFullscreen = true;
};
var cleanFullscreenMode = function(e3) {
  var t2 = e3.element, r2 = e3.ref, n = r2.handleFullscreenUpdate, i2 = r2.focusTrap, o2 = r2.handleEscapeKey;
  t2.removeAttribute("tabindex"), i2.destroy(), t2.removeEventListener("keydown", o2), isIOS2() && t2.removeEventListener("touchstart", preventNavSwipe), window.removeEventListener("resize", n), document.body.classList.remove("doka--parent");
  var a2 = document.querySelector("meta[name=viewport]");
  e3.ref.defaultViewportContent ? (a2.setAttribute("content", e3.ref.defaultViewportContent), e3.ref.defaultViewportContent = null) : a2.parentNode.removeChild(a2), e3.ref.isFullscreen = false;
};
var root2 = createView2({ name: "root", ignoreRect: true, mixins: { styles: ["opacity"], animations: { opacity: { type: "tween", duration: 350 } } }, create: function(e3) {
  var t2 = e3.root, r2 = e3.props;
  t2.element.id = t2.query("GET_ID") || "doka-".concat(r2.id);
  var n = t2.query("GET_CLASS_NAME");
  n && t2.element.classList.add(n), t2.ref.environment = [], t2.ref.shouldBeDestroyed = false, t2.ref.isClosing = false, t2.ref.isClosed = false, t2.ref.isFullscreen = false, t2.query("GET_ALLOW_DROP_FILES") && (t2.ref.catcher = createFileCatcher(t2.element), t2.ref.catcher.on("drop", function(e4) {
    e4.forEach(function(e5) {
      t2.dispatch("REQUEST_LOAD_IMAGE", { source: e5 });
    });
  })), t2.ref.touchDetector = createTouchDetector(), t2.ref.touchDetector.onOnce("touch-detected", function() {
    t2.ref.environment.push("touch");
  }), t2.ref.editor = t2.appendChildView(t2.createChildView(editor, { id: r2.id })), t2.query("GET_STYLES").filter(function(e4) {
    return !isEmpty2(e4.value);
  }).map(function(e4) {
    var r3 = e4.name, n2 = e4.value;
    t2.element.dataset[r3] = n2;
  }), t2.ref.updateViewport = function() {
    t2.dispatch("INVALIDATE_VIEWPORT");
  }, window.addEventListener("resize", t2.ref.updateViewport), window.addEventListener("scroll", t2.ref.updateViewport), t2.ref.isSingleUtil = 1 === t2.query("GET_UTILS").length, t2.ref.canBeControlled = t2.query("GET_ALLOW_BUTTON_CONFIRM") || t2.query("GET_ALLOW_BUTTON_CANCEL"), updateStyleViewport(t2);
  var i2 = document.createElement("div");
  i2.style.cssText = "position:fixed;height:100vh;top:0;", t2.ref.measure = i2, document.body.appendChild(i2), t2.ref.handleEscapeKey = function(e4) {
    27 === e4.keyCode && t2.dispatch("EDIT_CANCEL");
  }, t2.ref.initialScreenMeasureHeight = null, t2.ref.handleFullscreenUpdate = function() {
    t2.element.dataset.styleFullscreen = window.innerHeight === t2.ref.initialScreenMeasureHeight;
  }, t2.ref.clientRect = { left: 0, top: 0 }, isModal(t2) && (t2.ref.handleModalTap = function(e4) {
    e4.target === t2.element && t2.dispatch("EDIT_CANCEL");
  }, t2.element.addEventListener("pointerdown", t2.ref.handleModalTap));
}, read: function(e3) {
  var t2 = e3.root, r2 = t2.ref.measure;
  r2 && (t2.ref.initialScreenMeasureHeight = r2.offsetHeight, r2.parentNode.removeChild(r2), t2.ref.measure = null), t2.ref.clientRect = t2.element.getBoundingClientRect(), t2.ref.clientRect.leftScroll = t2.ref.clientRect.left + (window.scrollX || window.pageXOffset), t2.ref.clientRect.topScroll = t2.ref.clientRect.top + (window.scrollY || window.pageYOffset);
}, write: createRoute2({ ENTER_FULLSCREEN: function(e3) {
  var t2 = e3.root;
  setupFullscreenMode(t2);
}, EXIT_FULLSCREEN: function(e3) {
  var t2 = e3.root;
  cleanFullscreenMode(t2);
}, SHOW_VIEW: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  t2.element.dataset.view = r2.id;
}, DID_SET_STYLE_LAYOUT_MODE: function(e3) {
  var t2 = e3.root, r2 = e3.action;
  t2.element.dataset.styleLayoutMode = r2.value || "none", /fullscreen/.test(r2.value) && !/fullscreen/.test(r2.prevValue) && t2.dispatch("ENTER_FULLSCREEN");
}, AWAITING_IMAGE: function(e3) {
  var t2 = e3.root;
  t2.ref.catcher && t2.query("GET_ALLOW_BROWSE_FILES") && t2.ref.catcher.enableBrowse();
}, DID_REQUEST_LOAD_IMAGE: function(e3) {
  var t2 = e3.root;
  if (t2.ref.catcher && t2.query("GET_ALLOW_BROWSE_FILES") && t2.ref.catcher.disableBrowse(), 0 === t2.opacity && (t2.opacity = 1), t2.ref.isClosing = false, t2.ref.isClosed = false, !shouldBeFullscreen(t2) || isFullscreen(t2)) {
    var r2 = t2.query("GET_STYLE_LAYOUT_MODE");
    null !== r2 && "modal" !== r2 || t2.element.parentNode || t2.dispatch("SET_STYLE_LAYOUT_MODE", { value: ("fullscreen " + (r2 || "")).trim() });
  } else t2.dispatch("ENTER_FULLSCREEN");
}, DID_CANCEL: function(e3) {
  var t2 = e3.root;
  canBeAutoClosed(t2) && mayBeAutoClosed(t2) && t2.dispatch("EDIT_CLOSE");
}, DID_CONFIRM: function(e3) {
  var t2 = e3.root;
  canBeAutoClosed(t2) && mayBeAutoClosed(t2) && t2.dispatch("EDIT_CLOSE");
}, EDIT_CLOSE: function(e3) {
  var t2 = e3.root;
  canBeClosed(t2) && (t2.opacity = t2.opacity || 1, t2.opacity = 0, t2.ref.isClosed = false, t2.ref.isClosing = true, t2.query("GET_ALLOW_AUTO_DESTROY") && (t2.ref.shouldBeDestroyed = true), isFullscreen(t2) && t2.dispatch("EXIT_FULLSCREEN"));
}, DID_SET_UTILS: function(e3) {
  var t2 = e3.root;
  t2.ref.isSingleUtil = 1 === t2.query("GET_UTILS").length;
} }, function(e3) {
  var t2 = e3.root;
  updateStyleViewport(t2);
  var r2 = t2.query("GET_ROOT"), n = t2.rect.element;
  r2.width === n.width && r2.height === n.height && r2.y === t2.ref.clientRect.top && r2.topScroll === t2.ref.clientRect.topScroll || t2.dispatch("UPDATE_ROOT_RECT", { rect: { x: t2.ref.clientRect.left, y: t2.ref.clientRect.top, left: t2.ref.editor.rect.element.left, top: t2.ref.editor.rect.element.top, leftScroll: t2.ref.clientRect.leftScroll, topScroll: t2.ref.clientRect.topScroll, width: t2.rect.element.width, height: t2.rect.element.height } });
}), didWriteView: function(e3) {
  var t2 = e3.root, r2 = t2.ref, n = r2.isClosed, i2 = r2.isClosing, o2 = r2.shouldBeDestroyed;
  !n && i2 && 0 === t2.opacity && (t2.dispatch("DID_CLOSE"), t2.ref.isClosed = true, t2.ref.isClosing = false, shouldBeFullscreen(t2) && t2.element.parentNode && document.body.removeChild(t2.element), o2 && t2.dispatch("EDIT_DESTROY"));
}, destroy: function(e3) {
  var t2 = e3.root;
  isFullscreen(t2) && cleanFullscreenMode(t2), isModal(t2) && t2.element.removeEventListener("pointerdown", t2.ref.handleModalTap), shouldBeFullscreen(t2) && t2.element.parentNode && document.body.removeChild(t2.element), window.removeEventListener("resize", t2.ref.updateViewport), t2.ref.touchDetector.destroy(), t2.ref.catcher && t2.ref.catcher.destroy();
} });
var getViewportBySize = function(e3, t2) {
  var r2 = "";
  return 0 === e3 && 0 === t2 ? "detached" : (r2 += t2 > e3 ? "portrait" : "landscape", (r2 += e3 <= 600 ? " x-cramped" : e3 <= 1e3 ? " x-comfortable" : " x-spacious").trim());
};
var createApp2 = function() {
  var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t2 = getOptions2(), r2 = createStore2(createInitialState2(t2), [queries2, createOptionQueries2(t2)], [actions2, createOptionActions2(t2)]);
  r2.dispatch("SET_OPTIONS", { options: e3 });
  var n = function() {
    document.hidden || r2.dispatch("KICK");
  };
  document.addEventListener("visibilitychange", n);
  var i2 = getUniqueId3();
  r2.dispatch("SET_UID", { id: i2 });
  var o2 = null, a2 = root2(r2, { id: i2 }), c2 = false, l2 = { _read: function() {
    c2 || a2._read();
  }, _write: function(e4) {
    var t3 = r2.processActionQueue().filter(function(e5) {
      return !/^SET_/.test(e5.type);
    });
    c2 && !t3.length || (d(t3), (c2 = a2._write(e4, t3)) && r2.processDispatchQueue(), t3.find(function(e5) {
      return "EDIT_DESTROY" === e5.type;
    }) && p());
  } }, u = function(e4) {
    return function(t3) {
      var r3 = { type: e4 };
      return t3 ? (t3.hasOwnProperty("error") && (r3.error = isObject2(t3.error) ? _objectSpread({}, t3.error) : t3.error || null), t3.hasOwnProperty("output") && (r3.output = t3.output), t3.hasOwnProperty("image") && (r3.image = t3.image), t3.hasOwnProperty("source") && (r3.source = t3.source), t3.hasOwnProperty("state") && (r3.state = t3.state), r3) : r3;
    };
  }, s2 = { DID_CONFIRM: u("confirm"), DID_CANCEL: u("cancel"), DID_REQUEST_LOAD_IMAGE: u("loadstart"), DID_LOAD_IMAGE: u("load"), DID_LOAD_IMAGE_ERROR: u("loaderror"), DID_SHOW_IMAGE: u("ready"), DID_UPDATE: u("update"), DID_CLOSE: u("close"), DID_DESTROY: u("destroy"), DID_INIT: u("init") }, d = function(e4) {
    e4.length && e4.forEach(function(e5) {
      if (s2[e5.type]) {
        var t3 = s2[e5.type];
        (Array.isArray(t3) ? t3 : [t3]).forEach(function(t4) {
          setTimeout(function() {
            !(function(e6) {
              var t5 = _objectSpread({ doka: f2 }, e6);
              delete t5.type, a2 && a2.element.dispatchEvent(new CustomEvent("Doka:".concat(e6.type), { detail: t5, bubbles: true, cancelable: true, composed: true }));
              var n2 = [];
              e6.hasOwnProperty("error") && n2.push(e6.error);
              var i3 = ["type", "error"];
              Object.keys(e6).filter(function(e7) {
                return !i3.includes(e7);
              }).forEach(function(t6) {
                return n2.push(e6[t6]);
              }), f2.fire.apply(f2, [e6.type].concat(n2));
              var o3 = r2.query("GET_ON".concat(e6.type.toUpperCase()));
              o3 && o3.apply(void 0, n2);
            })(t4(e5.data));
          }, 0);
        });
      }
    });
  }, p = function() {
    f2.fire("destroy", a2.element), document.removeEventListener("visibilitychange", n), a2._destroy(), r2.dispatch("DID_DESTROY");
  }, f2 = _objectSpread({}, on2(), l2, createOptionAPI2(r2, t2), { setOptions: function(e4) {
    return r2.dispatch("SET_OPTIONS", { options: e4 });
  }, setData: function(e4) {
    r2.dispatch("SET_DATA", e4);
  }, getData: function(e4) {
    return new Promise(function(t3, n2) {
      r2.dispatch("GET_DATA", _objectSpread({}, e4, { success: t3, failure: n2 }));
    });
  }, open: function(e4) {
    var t3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return new Promise(function(n2, i3) {
      e4 && r2.dispatch("REQUEST_LOAD_IMAGE", { source: e4, options: t3, success: n2, failure: i3, resolveOnConfirm: !!t3 && t3.resolveOnConfirm });
    });
  }, edit: function(e4, t3) {
    return f2.open(e4, _objectSpread({}, t3, { resolveOnConfirm: true }));
  }, save: function(e4) {
    return new Promise(function(t3, n2) {
      r2.dispatch("GET_DATA", _objectSpread({}, e4, { success: t3, failure: n2 }));
    });
  }, clear: function() {
    return r2.dispatch("REQUEST_REMOVE_IMAGE");
  }, close: function() {
    return r2.dispatch("EDIT_CLOSE");
  }, interact: function(e4, t3) {
    "scale" === e4 && r2.dispatch("CROP_IMAGE_RESIZE_SET", { value: t3 });
  }, interactEnd: function(e4) {
    "scale" === e4 && r2.dispatch("CROP_IMAGE_RESIZE_RELEASE");
  }, destroy: p, insertBefore: function(e4) {
    insertBefore2(a2.element, e4);
  }, insertAfter: function(e4) {
    insertAfter2(a2.element, e4);
  }, appendTo: function(e4) {
    e4.appendChild(a2.element);
  }, replaceElement: function(e4) {
    insertBefore2(a2.element, e4), e4.parentNode.removeChild(e4), o2 = e4;
  }, restoreElement: function() {
    o2 && (insertAfter2(o2, a2.element), a2.element.parentNode.removeChild(a2.element), o2 = null);
  }, isAttachedTo: function(e4) {
    return !!a2 && (a2.element === e4 || o2 === e4);
  }, element: { get: function() {
    return a2 ? a2.element : null;
  } } });
  return r2.dispatch("DID_INIT"), createObject2(f2);
};
var createAppObject2 = function() {
  var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t2 = getOptions2(), r2 = {};
  return forin2(t2, function(e4, t3) {
    isString2(t3) || (r2[e4] = t3[0]);
  }), createApp2(_objectSpread({}, r2, e3));
};
var toCamels2 = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "-";
  return e3.replace(new RegExp("".concat(t2, "."), "g"), function(e4) {
    return e4.charAt(1).toUpperCase();
  });
};
var lowerCaseFirstLetter2 = function(e3) {
  return e3.charAt(0).toLowerCase() + e3.slice(1);
};
var attributeNameToPropertyName2 = function(e3) {
  return toCamels2(e3.replace(/^data-/, ""));
};
var mapObject2 = function e(t2, r2) {
  forin2(r2, function(r3, n) {
    forin2(t2, function(e3, i2) {
      var o2 = new RegExp(r3);
      if (o2.test(e3) && (delete t2[e3], false !== n)) if (isString2(n)) t2[n] = i2;
      else {
        var a2 = n.group;
        isObject2(n) && !t2[a2] && (t2[a2] = {}), t2[a2][lowerCaseFirstLetter2(e3.replace(o2, ""))] = i2;
      }
    }), n.mapping && e(t2[n.group], n.mapping);
  });
};
var getAttributesAsObject2 = function(e3) {
  var t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, r2 = [];
  forin2(e3.attributes, function(t3) {
    return r2.push(e3.attributes[t3]);
  });
  var n = r2.filter(function(e4) {
    return e4.name;
  }).reduce(function(t3, r3) {
    var n2 = attr2(e3, r3.name);
    return t3[attributeNameToPropertyName2(r3.name)] = n2 === r3.name || n2, t3;
  }, {});
  return mapObject2(n, t2), n;
};
var createAppAtElement2 = function(e3) {
  var t2 = _objectSpread({}, arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}), r2 = getAttributesAsObject2(e3, { "^class$": "className" });
  Object.keys(r2).forEach(function(e4) {
    isObject2(r2[e4]) ? (isObject2(t2[e4]) || (t2[e4] = {}), Object.assign(t2[e4], r2[e4])) : t2[e4] = r2[e4];
  }), "CANVAS" !== e3.nodeName && "IMG" !== e3.nodeName || (t2.src = e3.dataset.dokaSrc ? e3.dataset.dokaSrc : e3);
  var n = createAppObject2(t2);
  return n.replaceElement(e3), n;
};
var createApp$12 = function() {
  for (var e3 = arguments.length, t2 = new Array(e3), r2 = 0; r2 < e3; r2++) t2[r2] = arguments[r2];
  return isNode2(t2[0]) ? createAppAtElement2.apply(void 0, t2) : createAppObject2.apply(void 0, _toConsumableArray(t2.filter(function(e4) {
    return e4;
  })));
};
var copyObjectPropertiesToObject2 = function(e3, t2, r2) {
  Object.getOwnPropertyNames(e3).filter(function(e4) {
    return !r2.includes(e4);
  }).forEach(function(r3) {
    return Object.defineProperty(t2, r3, Object.getOwnPropertyDescriptor(e3, r3));
  });
};
var PRIVATE_METHODS2 = ["fire", "_read", "_write"];
var createAppAPI2 = function(e3) {
  var t2 = {};
  return copyObjectPropertiesToObject2(e3, t2, PRIVATE_METHODS2), t2;
};
var isOperaMini2 = function() {
  return "[object OperaMini]" === Object.prototype.toString.call(window.operamini);
};
var hasPromises2 = function() {
  return "Promise" in window;
};
var hasBlobSlice2 = function() {
  return "slice" in Blob.prototype;
};
var hasCreateObjectURL2 = function() {
  return "URL" in window && "createObjectURL" in window.URL;
};
var hasVisibility2 = function() {
  return "visibilityState" in document;
};
var hasTiming2 = function() {
  return "performance" in window;
};
var supported2 = (function() {
  var e3 = isBrowser10() && !isOperaMini2() && hasVisibility2() && hasPromises2() && hasBlobSlice2() && hasCreateObjectURL2() && hasTiming2();
  return function() {
    return e3;
  };
})();
var state2 = { apps: [] };
var name2 = "doka";
var fn2 = function() {
};
var OptionTypes2 = {};
var create$12 = fn2;
var destroy2 = fn2;
var parse2 = fn2;
var find2 = fn2;
var getOptions$12 = fn2;
var setOptions$12 = fn2;
if (supported2()) {
  createPainter2(function() {
    state2.apps.forEach(function(e3) {
      return e3._read();
    });
  }, function(e3) {
    state2.apps.forEach(function(t2) {
      return t2._write(e3);
    });
  });
  dispatch = function e3() {
    document.dispatchEvent(new CustomEvent("doka:loaded", { detail: { supported: supported2, create: create$12, destroy: destroy2, parse: parse2, find: find2, setOptions: setOptions$12 } })), document.removeEventListener("DOMContentLoaded", e3);
  };
  "loading" !== document.readyState ? setTimeout(function() {
    return dispatch();
  }, 0) : document.addEventListener("DOMContentLoaded", dispatch);
  updateOptionTypes = function() {
    return forin2(getOptions2(), function(e3, t2) {
      OptionTypes2[e3] = t2[1];
    });
  };
  OptionTypes2 = {}, updateOptionTypes(), create$12 = function() {
    var e3 = createApp$12.apply(void 0, arguments);
    return e3.on("destroy", destroy2), state2.apps.push(e3), createAppAPI2(e3);
  }, destroy2 = function(e3) {
    var t2 = state2.apps.findIndex(function(t3) {
      return t3.isAttachedTo(e3);
    });
    return t2 >= 0 && (state2.apps.splice(t2, 1)[0].restoreElement(), true);
  }, parse2 = function(e3) {
    return Array.from(e3.querySelectorAll(".".concat(name2))).filter(function(e4) {
      return !state2.apps.find(function(t2) {
        return t2.isAttachedTo(e4);
      });
    }).map(function(e4) {
      return create$12(e4);
    });
  }, find2 = function(e3) {
    var t2 = state2.apps.find(function(t3) {
      return t3.isAttachedTo(e3);
    });
    return t2 ? createAppAPI2(t2) : null;
  }, getOptions$12 = function() {
    var e3 = {};
    return forin2(getOptions2(), function(t2, r2) {
      e3[t2] = r2[0];
    }), e3;
  }, setOptions$12 = function(e3) {
    return isObject2(e3) && (state2.apps.forEach(function(t2) {
      t2.setOptions(e3);
    }), setOptions2(e3)), getOptions$12();
  };
}
var dispatch;
var updateOptionTypes;

// node_modules/browser-image-compression/dist/browser-image-compression.mjs
function _mergeNamespaces$1(e3, t2) {
  return t2.forEach((function(t3) {
    t3 && "string" != typeof t3 && !Array.isArray(t3) && Object.keys(t3).forEach((function(r2) {
      if ("default" !== r2 && !(r2 in e3)) {
        var i2 = Object.getOwnPropertyDescriptor(t3, r2);
        Object.defineProperty(e3, r2, i2.get ? i2 : { enumerable: true, get: function() {
          return t3[r2];
        } });
      }
    }));
  })), Object.freeze(e3);
}
function copyExifWithoutOrientation(e3, t2) {
  return new Promise((function(r2, i2) {
    let o2;
    return getApp1Segment(e3).then((function(e4) {
      try {
        return o2 = e4, r2(new Blob([t2.slice(0, 2), o2, t2.slice(2)], { type: "image/jpeg" }));
      } catch (e5) {
        return i2(e5);
      }
    }), i2);
  }));
}
var getApp1Segment = (e3) => new Promise(((t2, r2) => {
  const i2 = new FileReader();
  i2.addEventListener("load", (({ target: { result: e4 } }) => {
    const i3 = new DataView(e4);
    let o2 = 0;
    if (65496 !== i3.getUint16(o2)) return r2("not a valid JPEG");
    for (o2 += 2; ; ) {
      const a2 = i3.getUint16(o2);
      if (65498 === a2) break;
      const s2 = i3.getUint16(o2 + 2);
      if (65505 === a2 && 1165519206 === i3.getUint32(o2 + 4)) {
        const a3 = o2 + 10;
        let f2;
        switch (i3.getUint16(a3)) {
          case 18761:
            f2 = true;
            break;
          case 19789:
            f2 = false;
            break;
          default:
            return r2("TIFF header contains invalid endian");
        }
        if (42 !== i3.getUint16(a3 + 2, f2)) return r2("TIFF header contains invalid version");
        const l2 = i3.getUint32(a3 + 4, f2), c2 = a3 + l2 + 2 + 12 * i3.getUint16(a3 + l2, f2);
        for (let e5 = a3 + l2 + 2; e5 < c2; e5 += 12) {
          if (274 == i3.getUint16(e5, f2)) {
            if (3 !== i3.getUint16(e5 + 2, f2)) return r2("Orientation data type is invalid");
            if (1 !== i3.getUint32(e5 + 4, f2)) return r2("Orientation data count is invalid");
            i3.setUint16(e5 + 8, 1, f2);
            break;
          }
        }
        return t2(e4.slice(o2, o2 + 2 + s2));
      }
      o2 += 2 + s2;
    }
    return t2(new Blob());
  })), i2.readAsArrayBuffer(e3);
}));
var e2 = {};
var t = { get exports() {
  return e2;
}, set exports(t2) {
  e2 = t2;
} };
!(function(e3) {
  var r2, i2, UZIP2 = {};
  t.exports = UZIP2, UZIP2.parse = function(e4, t2) {
    for (var r3 = UZIP2.bin.readUshort, i3 = UZIP2.bin.readUint, o2 = 0, a2 = {}, s2 = new Uint8Array(e4), f2 = s2.length - 4; 101010256 != i3(s2, f2); ) f2--;
    o2 = f2;
    o2 += 4;
    var l2 = r3(s2, o2 += 4);
    r3(s2, o2 += 2);
    var c2 = i3(s2, o2 += 2), u = i3(s2, o2 += 4);
    o2 += 4, o2 = u;
    for (var h = 0; h < l2; h++) {
      i3(s2, o2), o2 += 4, o2 += 4, o2 += 4, i3(s2, o2 += 4);
      c2 = i3(s2, o2 += 4);
      var d = i3(s2, o2 += 4), A = r3(s2, o2 += 4), g = r3(s2, o2 + 2), p = r3(s2, o2 + 4);
      o2 += 6;
      var m = i3(s2, o2 += 8);
      o2 += 4, o2 += A + g + p, UZIP2._readLocal(s2, m, a2, c2, d, t2);
    }
    return a2;
  }, UZIP2._readLocal = function(e4, t2, r3, i3, o2, a2) {
    var s2 = UZIP2.bin.readUshort, f2 = UZIP2.bin.readUint;
    f2(e4, t2), s2(e4, t2 += 4), s2(e4, t2 += 2);
    var l2 = s2(e4, t2 += 2);
    f2(e4, t2 += 2), f2(e4, t2 += 4), t2 += 4;
    var c2 = s2(e4, t2 += 8), u = s2(e4, t2 += 2);
    t2 += 2;
    var h = UZIP2.bin.readUTF8(e4, t2, c2);
    if (t2 += c2, t2 += u, a2) r3[h] = { size: o2, csize: i3 };
    else {
      var d = new Uint8Array(e4.buffer, t2);
      if (0 == l2) r3[h] = new Uint8Array(d.buffer.slice(t2, t2 + i3));
      else {
        if (8 != l2) throw "unknown compression method: " + l2;
        var A = new Uint8Array(o2);
        UZIP2.inflateRaw(d, A), r3[h] = A;
      }
    }
  }, UZIP2.inflateRaw = function(e4, t2) {
    return UZIP2.F.inflate(e4, t2);
  }, UZIP2.inflate = function(e4, t2) {
    return e4[0], e4[1], UZIP2.inflateRaw(new Uint8Array(e4.buffer, e4.byteOffset + 2, e4.length - 6), t2);
  }, UZIP2.deflate = function(e4, t2) {
    null == t2 && (t2 = { level: 6 });
    var r3 = 0, i3 = new Uint8Array(50 + Math.floor(1.1 * e4.length));
    i3[r3] = 120, i3[r3 + 1] = 156, r3 += 2, r3 = UZIP2.F.deflateRaw(e4, i3, r3, t2.level);
    var o2 = UZIP2.adler(e4, 0, e4.length);
    return i3[r3 + 0] = o2 >>> 24 & 255, i3[r3 + 1] = o2 >>> 16 & 255, i3[r3 + 2] = o2 >>> 8 & 255, i3[r3 + 3] = o2 >>> 0 & 255, new Uint8Array(i3.buffer, 0, r3 + 4);
  }, UZIP2.deflateRaw = function(e4, t2) {
    null == t2 && (t2 = { level: 6 });
    var r3 = new Uint8Array(50 + Math.floor(1.1 * e4.length)), i3 = UZIP2.F.deflateRaw(e4, r3, i3, t2.level);
    return new Uint8Array(r3.buffer, 0, i3);
  }, UZIP2.encode = function(e4, t2) {
    null == t2 && (t2 = false);
    var r3 = 0, i3 = UZIP2.bin.writeUint, o2 = UZIP2.bin.writeUshort, a2 = {};
    for (var s2 in e4) {
      var f2 = !UZIP2._noNeed(s2) && !t2, l2 = e4[s2], c2 = UZIP2.crc.crc(l2, 0, l2.length);
      a2[s2] = { cpr: f2, usize: l2.length, crc: c2, file: f2 ? UZIP2.deflateRaw(l2) : l2 };
    }
    for (var s2 in a2) r3 += a2[s2].file.length + 30 + 46 + 2 * UZIP2.bin.sizeUTF8(s2);
    r3 += 22;
    var u = new Uint8Array(r3), h = 0, d = [];
    for (var s2 in a2) {
      var A = a2[s2];
      d.push(h), h = UZIP2._writeHeader(u, h, s2, A, 0);
    }
    var g = 0, p = h;
    for (var s2 in a2) {
      A = a2[s2];
      d.push(h), h = UZIP2._writeHeader(u, h, s2, A, 1, d[g++]);
    }
    var m = h - p;
    return i3(u, h, 101010256), h += 4, o2(u, h += 4, g), o2(u, h += 2, g), i3(u, h += 2, m), i3(u, h += 4, p), h += 4, h += 2, u.buffer;
  }, UZIP2._noNeed = function(e4) {
    var t2 = e4.split(".").pop().toLowerCase();
    return -1 != "png,jpg,jpeg,zip".indexOf(t2);
  }, UZIP2._writeHeader = function(e4, t2, r3, i3, o2, a2) {
    var s2 = UZIP2.bin.writeUint, f2 = UZIP2.bin.writeUshort, l2 = i3.file;
    return s2(e4, t2, 0 == o2 ? 67324752 : 33639248), t2 += 4, 1 == o2 && (t2 += 2), f2(e4, t2, 20), f2(e4, t2 += 2, 0), f2(e4, t2 += 2, i3.cpr ? 8 : 0), s2(e4, t2 += 2, 0), s2(e4, t2 += 4, i3.crc), s2(e4, t2 += 4, l2.length), s2(e4, t2 += 4, i3.usize), f2(e4, t2 += 4, UZIP2.bin.sizeUTF8(r3)), f2(e4, t2 += 2, 0), t2 += 2, 1 == o2 && (t2 += 2, t2 += 2, s2(e4, t2 += 6, a2), t2 += 4), t2 += UZIP2.bin.writeUTF8(e4, t2, r3), 0 == o2 && (e4.set(l2, t2), t2 += l2.length), t2;
  }, UZIP2.crc = { table: (function() {
    for (var e4 = new Uint32Array(256), t2 = 0; t2 < 256; t2++) {
      for (var r3 = t2, i3 = 0; i3 < 8; i3++) 1 & r3 ? r3 = 3988292384 ^ r3 >>> 1 : r3 >>>= 1;
      e4[t2] = r3;
    }
    return e4;
  })(), update: function(e4, t2, r3, i3) {
    for (var o2 = 0; o2 < i3; o2++) e4 = UZIP2.crc.table[255 & (e4 ^ t2[r3 + o2])] ^ e4 >>> 8;
    return e4;
  }, crc: function(e4, t2, r3) {
    return 4294967295 ^ UZIP2.crc.update(4294967295, e4, t2, r3);
  } }, UZIP2.adler = function(e4, t2, r3) {
    for (var i3 = 1, o2 = 0, a2 = t2, s2 = t2 + r3; a2 < s2; ) {
      for (var f2 = Math.min(a2 + 5552, s2); a2 < f2; ) o2 += i3 += e4[a2++];
      i3 %= 65521, o2 %= 65521;
    }
    return o2 << 16 | i3;
  }, UZIP2.bin = { readUshort: function(e4, t2) {
    return e4[t2] | e4[t2 + 1] << 8;
  }, writeUshort: function(e4, t2, r3) {
    e4[t2] = 255 & r3, e4[t2 + 1] = r3 >> 8 & 255;
  }, readUint: function(e4, t2) {
    return 16777216 * e4[t2 + 3] + (e4[t2 + 2] << 16 | e4[t2 + 1] << 8 | e4[t2]);
  }, writeUint: function(e4, t2, r3) {
    e4[t2] = 255 & r3, e4[t2 + 1] = r3 >> 8 & 255, e4[t2 + 2] = r3 >> 16 & 255, e4[t2 + 3] = r3 >> 24 & 255;
  }, readASCII: function(e4, t2, r3) {
    for (var i3 = "", o2 = 0; o2 < r3; o2++) i3 += String.fromCharCode(e4[t2 + o2]);
    return i3;
  }, writeASCII: function(e4, t2, r3) {
    for (var i3 = 0; i3 < r3.length; i3++) e4[t2 + i3] = r3.charCodeAt(i3);
  }, pad: function(e4) {
    return e4.length < 2 ? "0" + e4 : e4;
  }, readUTF8: function(e4, t2, r3) {
    for (var i3, o2 = "", a2 = 0; a2 < r3; a2++) o2 += "%" + UZIP2.bin.pad(e4[t2 + a2].toString(16));
    try {
      i3 = decodeURIComponent(o2);
    } catch (i4) {
      return UZIP2.bin.readASCII(e4, t2, r3);
    }
    return i3;
  }, writeUTF8: function(e4, t2, r3) {
    for (var i3 = r3.length, o2 = 0, a2 = 0; a2 < i3; a2++) {
      var s2 = r3.charCodeAt(a2);
      if (0 == (4294967168 & s2)) e4[t2 + o2] = s2, o2++;
      else if (0 == (4294965248 & s2)) e4[t2 + o2] = 192 | s2 >> 6, e4[t2 + o2 + 1] = 128 | s2 >> 0 & 63, o2 += 2;
      else if (0 == (4294901760 & s2)) e4[t2 + o2] = 224 | s2 >> 12, e4[t2 + o2 + 1] = 128 | s2 >> 6 & 63, e4[t2 + o2 + 2] = 128 | s2 >> 0 & 63, o2 += 3;
      else {
        if (0 != (4292870144 & s2)) throw "e";
        e4[t2 + o2] = 240 | s2 >> 18, e4[t2 + o2 + 1] = 128 | s2 >> 12 & 63, e4[t2 + o2 + 2] = 128 | s2 >> 6 & 63, e4[t2 + o2 + 3] = 128 | s2 >> 0 & 63, o2 += 4;
      }
    }
    return o2;
  }, sizeUTF8: function(e4) {
    for (var t2 = e4.length, r3 = 0, i3 = 0; i3 < t2; i3++) {
      var o2 = e4.charCodeAt(i3);
      if (0 == (4294967168 & o2)) r3++;
      else if (0 == (4294965248 & o2)) r3 += 2;
      else if (0 == (4294901760 & o2)) r3 += 3;
      else {
        if (0 != (4292870144 & o2)) throw "e";
        r3 += 4;
      }
    }
    return r3;
  } }, UZIP2.F = {}, UZIP2.F.deflateRaw = function(e4, t2, r3, i3) {
    var o2 = [[0, 0, 0, 0, 0], [4, 4, 8, 4, 0], [4, 5, 16, 8, 0], [4, 6, 16, 16, 0], [4, 10, 16, 32, 0], [8, 16, 32, 32, 0], [8, 16, 128, 128, 0], [8, 32, 128, 256, 0], [32, 128, 258, 1024, 1], [32, 258, 258, 4096, 1]][i3], a2 = UZIP2.F.U, s2 = UZIP2.F._goodIndex;
    UZIP2.F._hash;
    var f2 = UZIP2.F._putsE, l2 = 0, c2 = r3 << 3, u = 0, h = e4.length;
    if (0 == i3) {
      for (; l2 < h; ) {
        f2(t2, c2, l2 + (_ = Math.min(65535, h - l2)) == h ? 1 : 0), c2 = UZIP2.F._copyExact(e4, l2, _, t2, c2 + 8), l2 += _;
      }
      return c2 >>> 3;
    }
    var d = a2.lits, A = a2.strt, g = a2.prev, p = 0, m = 0, w = 0, v = 0, b = 0, y = 0;
    for (h > 2 && (A[y = UZIP2.F._hash(e4, 0)] = 0), l2 = 0; l2 < h; l2++) {
      if (b = y, l2 + 1 < h - 2) {
        y = UZIP2.F._hash(e4, l2 + 1);
        var E = l2 + 1 & 32767;
        g[E] = A[y], A[y] = E;
      }
      if (u <= l2) {
        (p > 14e3 || m > 26697) && h - l2 > 100 && (u < l2 && (d[p] = l2 - u, p += 2, u = l2), c2 = UZIP2.F._writeBlock(l2 == h - 1 || u == h ? 1 : 0, d, p, v, e4, w, l2 - w, t2, c2), p = m = v = 0, w = l2);
        var F = 0;
        l2 < h - 2 && (F = UZIP2.F._bestMatch(e4, l2, g, b, Math.min(o2[2], h - l2), o2[3]));
        var _ = F >>> 16, B = 65535 & F;
        if (0 != F) {
          B = 65535 & F;
          var U = s2(_ = F >>> 16, a2.of0);
          a2.lhst[257 + U]++;
          var C = s2(B, a2.df0);
          a2.dhst[C]++, v += a2.exb[U] + a2.dxb[C], d[p] = _ << 23 | l2 - u, d[p + 1] = B << 16 | U << 8 | C, p += 2, u = l2 + _;
        } else a2.lhst[e4[l2]]++;
        m++;
      }
    }
    for (w == l2 && 0 != e4.length || (u < l2 && (d[p] = l2 - u, p += 2, u = l2), c2 = UZIP2.F._writeBlock(1, d, p, v, e4, w, l2 - w, t2, c2), p = 0, m = 0, p = m = v = 0, w = l2); 0 != (7 & c2); ) c2++;
    return c2 >>> 3;
  }, UZIP2.F._bestMatch = function(e4, t2, r3, i3, o2, a2) {
    var s2 = 32767 & t2, f2 = r3[s2], l2 = s2 - f2 + 32768 & 32767;
    if (f2 == s2 || i3 != UZIP2.F._hash(e4, t2 - l2)) return 0;
    for (var c2 = 0, u = 0, h = Math.min(32767, t2); l2 <= h && 0 != --a2 && f2 != s2; ) {
      if (0 == c2 || e4[t2 + c2] == e4[t2 + c2 - l2]) {
        var d = UZIP2.F._howLong(e4, t2, l2);
        if (d > c2) {
          if (u = l2, (c2 = d) >= o2) break;
          l2 + 2 < d && (d = l2 + 2);
          for (var A = 0, g = 0; g < d - 2; g++) {
            var p = t2 - l2 + g + 32768 & 32767, m = p - r3[p] + 32768 & 32767;
            m > A && (A = m, f2 = p);
          }
        }
      }
      l2 += (s2 = f2) - (f2 = r3[s2]) + 32768 & 32767;
    }
    return c2 << 16 | u;
  }, UZIP2.F._howLong = function(e4, t2, r3) {
    if (e4[t2] != e4[t2 - r3] || e4[t2 + 1] != e4[t2 + 1 - r3] || e4[t2 + 2] != e4[t2 + 2 - r3]) return 0;
    var i3 = t2, o2 = Math.min(e4.length, t2 + 258);
    for (t2 += 3; t2 < o2 && e4[t2] == e4[t2 - r3]; ) t2++;
    return t2 - i3;
  }, UZIP2.F._hash = function(e4, t2) {
    return (e4[t2] << 8 | e4[t2 + 1]) + (e4[t2 + 2] << 4) & 65535;
  }, UZIP2.saved = 0, UZIP2.F._writeBlock = function(e4, t2, r3, i3, o2, a2, s2, f2, l2) {
    var c2, u, h, d, A, g, p, m, w, v = UZIP2.F.U, b = UZIP2.F._putsF, y = UZIP2.F._putsE;
    v.lhst[256]++, u = (c2 = UZIP2.F.getTrees())[0], h = c2[1], d = c2[2], A = c2[3], g = c2[4], p = c2[5], m = c2[6], w = c2[7];
    var E = 32 + (0 == (l2 + 3 & 7) ? 0 : 8 - (l2 + 3 & 7)) + (s2 << 3), F = i3 + UZIP2.F.contSize(v.fltree, v.lhst) + UZIP2.F.contSize(v.fdtree, v.dhst), _ = i3 + UZIP2.F.contSize(v.ltree, v.lhst) + UZIP2.F.contSize(v.dtree, v.dhst);
    _ += 14 + 3 * p + UZIP2.F.contSize(v.itree, v.ihst) + (2 * v.ihst[16] + 3 * v.ihst[17] + 7 * v.ihst[18]);
    for (var B = 0; B < 286; B++) v.lhst[B] = 0;
    for (B = 0; B < 30; B++) v.dhst[B] = 0;
    for (B = 0; B < 19; B++) v.ihst[B] = 0;
    var U = E < F && E < _ ? 0 : F < _ ? 1 : 2;
    if (b(f2, l2, e4), b(f2, l2 + 1, U), l2 += 3, 0 == U) {
      for (; 0 != (7 & l2); ) l2++;
      l2 = UZIP2.F._copyExact(o2, a2, s2, f2, l2);
    } else {
      var C, I;
      if (1 == U && (C = v.fltree, I = v.fdtree), 2 == U) {
        UZIP2.F.makeCodes(v.ltree, u), UZIP2.F.revCodes(v.ltree, u), UZIP2.F.makeCodes(v.dtree, h), UZIP2.F.revCodes(v.dtree, h), UZIP2.F.makeCodes(v.itree, d), UZIP2.F.revCodes(v.itree, d), C = v.ltree, I = v.dtree, y(f2, l2, A - 257), y(f2, l2 += 5, g - 1), y(f2, l2 += 5, p - 4), l2 += 4;
        for (var Q = 0; Q < p; Q++) y(f2, l2 + 3 * Q, v.itree[1 + (v.ordr[Q] << 1)]);
        l2 += 3 * p, l2 = UZIP2.F._codeTiny(m, v.itree, f2, l2), l2 = UZIP2.F._codeTiny(w, v.itree, f2, l2);
      }
      for (var M = a2, x = 0; x < r3; x += 2) {
        for (var S = t2[x], R = S >>> 23, T = M + (8388607 & S); M < T; ) l2 = UZIP2.F._writeLit(o2[M++], C, f2, l2);
        if (0 != R) {
          var O = t2[x + 1], P = O >> 16, H = O >> 8 & 255, L = 255 & O;
          y(f2, l2 = UZIP2.F._writeLit(257 + H, C, f2, l2), R - v.of0[H]), l2 += v.exb[H], b(f2, l2 = UZIP2.F._writeLit(L, I, f2, l2), P - v.df0[L]), l2 += v.dxb[L], M += R;
        }
      }
      l2 = UZIP2.F._writeLit(256, C, f2, l2);
    }
    return l2;
  }, UZIP2.F._copyExact = function(e4, t2, r3, i3, o2) {
    var a2 = o2 >>> 3;
    return i3[a2] = r3, i3[a2 + 1] = r3 >>> 8, i3[a2 + 2] = 255 - i3[a2], i3[a2 + 3] = 255 - i3[a2 + 1], a2 += 4, i3.set(new Uint8Array(e4.buffer, t2, r3), a2), o2 + (r3 + 4 << 3);
  }, UZIP2.F.getTrees = function() {
    for (var e4 = UZIP2.F.U, t2 = UZIP2.F._hufTree(e4.lhst, e4.ltree, 15), r3 = UZIP2.F._hufTree(e4.dhst, e4.dtree, 15), i3 = [], o2 = UZIP2.F._lenCodes(e4.ltree, i3), a2 = [], s2 = UZIP2.F._lenCodes(e4.dtree, a2), f2 = 0; f2 < i3.length; f2 += 2) e4.ihst[i3[f2]]++;
    for (f2 = 0; f2 < a2.length; f2 += 2) e4.ihst[a2[f2]]++;
    for (var l2 = UZIP2.F._hufTree(e4.ihst, e4.itree, 7), c2 = 19; c2 > 4 && 0 == e4.itree[1 + (e4.ordr[c2 - 1] << 1)]; ) c2--;
    return [t2, r3, l2, o2, s2, c2, i3, a2];
  }, UZIP2.F.getSecond = function(e4) {
    for (var t2 = [], r3 = 0; r3 < e4.length; r3 += 2) t2.push(e4[r3 + 1]);
    return t2;
  }, UZIP2.F.nonZero = function(e4) {
    for (var t2 = "", r3 = 0; r3 < e4.length; r3 += 2) 0 != e4[r3 + 1] && (t2 += (r3 >> 1) + ",");
    return t2;
  }, UZIP2.F.contSize = function(e4, t2) {
    for (var r3 = 0, i3 = 0; i3 < t2.length; i3++) r3 += t2[i3] * e4[1 + (i3 << 1)];
    return r3;
  }, UZIP2.F._codeTiny = function(e4, t2, r3, i3) {
    for (var o2 = 0; o2 < e4.length; o2 += 2) {
      var a2 = e4[o2], s2 = e4[o2 + 1];
      i3 = UZIP2.F._writeLit(a2, t2, r3, i3);
      var f2 = 16 == a2 ? 2 : 17 == a2 ? 3 : 7;
      a2 > 15 && (UZIP2.F._putsE(r3, i3, s2, f2), i3 += f2);
    }
    return i3;
  }, UZIP2.F._lenCodes = function(e4, t2) {
    for (var r3 = e4.length; 2 != r3 && 0 == e4[r3 - 1]; ) r3 -= 2;
    for (var i3 = 0; i3 < r3; i3 += 2) {
      var o2 = e4[i3 + 1], a2 = i3 + 3 < r3 ? e4[i3 + 3] : -1, s2 = i3 + 5 < r3 ? e4[i3 + 5] : -1, f2 = 0 == i3 ? -1 : e4[i3 - 1];
      if (0 == o2 && a2 == o2 && s2 == o2) {
        for (var l2 = i3 + 5; l2 + 2 < r3 && e4[l2 + 2] == o2; ) l2 += 2;
        (c2 = Math.min(l2 + 1 - i3 >>> 1, 138)) < 11 ? t2.push(17, c2 - 3) : t2.push(18, c2 - 11), i3 += 2 * c2 - 2;
      } else if (o2 == f2 && a2 == o2 && s2 == o2) {
        for (l2 = i3 + 5; l2 + 2 < r3 && e4[l2 + 2] == o2; ) l2 += 2;
        var c2 = Math.min(l2 + 1 - i3 >>> 1, 6);
        t2.push(16, c2 - 3), i3 += 2 * c2 - 2;
      } else t2.push(o2, 0);
    }
    return r3 >>> 1;
  }, UZIP2.F._hufTree = function(e4, t2, r3) {
    var i3 = [], o2 = e4.length, a2 = t2.length, s2 = 0;
    for (s2 = 0; s2 < a2; s2 += 2) t2[s2] = 0, t2[s2 + 1] = 0;
    for (s2 = 0; s2 < o2; s2++) 0 != e4[s2] && i3.push({ lit: s2, f: e4[s2] });
    var f2 = i3.length, l2 = i3.slice(0);
    if (0 == f2) return 0;
    if (1 == f2) {
      var c2 = i3[0].lit;
      l2 = 0 == c2 ? 1 : 0;
      return t2[1 + (c2 << 1)] = 1, t2[1 + (l2 << 1)] = 1, 1;
    }
    i3.sort((function(e5, t3) {
      return e5.f - t3.f;
    }));
    var u = i3[0], h = i3[1], d = 0, A = 1, g = 2;
    for (i3[0] = { lit: -1, f: u.f + h.f, l: u, r: h, d: 0 }; A != f2 - 1; ) u = d != A && (g == f2 || i3[d].f < i3[g].f) ? i3[d++] : i3[g++], h = d != A && (g == f2 || i3[d].f < i3[g].f) ? i3[d++] : i3[g++], i3[A++] = { lit: -1, f: u.f + h.f, l: u, r: h };
    var p = UZIP2.F.setDepth(i3[A - 1], 0);
    for (p > r3 && (UZIP2.F.restrictDepth(l2, r3, p), p = r3), s2 = 0; s2 < f2; s2++) t2[1 + (l2[s2].lit << 1)] = l2[s2].d;
    return p;
  }, UZIP2.F.setDepth = function(e4, t2) {
    return -1 != e4.lit ? (e4.d = t2, t2) : Math.max(UZIP2.F.setDepth(e4.l, t2 + 1), UZIP2.F.setDepth(e4.r, t2 + 1));
  }, UZIP2.F.restrictDepth = function(e4, t2, r3) {
    var i3 = 0, o2 = 1 << r3 - t2, a2 = 0;
    for (e4.sort((function(e5, t3) {
      return t3.d == e5.d ? e5.f - t3.f : t3.d - e5.d;
    })), i3 = 0; i3 < e4.length && e4[i3].d > t2; i3++) {
      var s2 = e4[i3].d;
      e4[i3].d = t2, a2 += o2 - (1 << r3 - s2);
    }
    for (a2 >>>= r3 - t2; a2 > 0; ) {
      (s2 = e4[i3].d) < t2 ? (e4[i3].d++, a2 -= 1 << t2 - s2 - 1) : i3++;
    }
    for (; i3 >= 0; i3--) e4[i3].d == t2 && a2 < 0 && (e4[i3].d--, a2++);
    0 != a2 && console.log("debt left");
  }, UZIP2.F._goodIndex = function(e4, t2) {
    var r3 = 0;
    return t2[16 | r3] <= e4 && (r3 |= 16), t2[8 | r3] <= e4 && (r3 |= 8), t2[4 | r3] <= e4 && (r3 |= 4), t2[2 | r3] <= e4 && (r3 |= 2), t2[1 | r3] <= e4 && (r3 |= 1), r3;
  }, UZIP2.F._writeLit = function(e4, t2, r3, i3) {
    return UZIP2.F._putsF(r3, i3, t2[e4 << 1]), i3 + t2[1 + (e4 << 1)];
  }, UZIP2.F.inflate = function(e4, t2) {
    var r3 = Uint8Array;
    if (3 == e4[0] && 0 == e4[1]) return t2 || new r3(0);
    var i3 = UZIP2.F, o2 = i3._bitsF, a2 = i3._bitsE, s2 = i3._decodeTiny, f2 = i3.makeCodes, l2 = i3.codes2map, c2 = i3._get17, u = i3.U, h = null == t2;
    h && (t2 = new r3(e4.length >>> 2 << 3));
    for (var d, A, g = 0, p = 0, m = 0, w = 0, v = 0, b = 0, y = 0, E = 0, F = 0; 0 == g; ) if (g = o2(e4, F, 1), p = o2(e4, F + 1, 2), F += 3, 0 != p) {
      if (h && (t2 = UZIP2.F._check(t2, E + (1 << 17))), 1 == p && (d = u.flmap, A = u.fdmap, b = 511, y = 31), 2 == p) {
        m = a2(e4, F, 5) + 257, w = a2(e4, F + 5, 5) + 1, v = a2(e4, F + 10, 4) + 4, F += 14;
        for (var _ = 0; _ < 38; _ += 2) u.itree[_] = 0, u.itree[_ + 1] = 0;
        var B = 1;
        for (_ = 0; _ < v; _++) {
          var U = a2(e4, F + 3 * _, 3);
          u.itree[1 + (u.ordr[_] << 1)] = U, U > B && (B = U);
        }
        F += 3 * v, f2(u.itree, B), l2(u.itree, B, u.imap), d = u.lmap, A = u.dmap, F = s2(u.imap, (1 << B) - 1, m + w, e4, F, u.ttree);
        var C = i3._copyOut(u.ttree, 0, m, u.ltree);
        b = (1 << C) - 1;
        var I = i3._copyOut(u.ttree, m, w, u.dtree);
        y = (1 << I) - 1, f2(u.ltree, C), l2(u.ltree, C, d), f2(u.dtree, I), l2(u.dtree, I, A);
      }
      for (; ; ) {
        var Q = d[c2(e4, F) & b];
        F += 15 & Q;
        var M = Q >>> 4;
        if (M >>> 8 == 0) t2[E++] = M;
        else {
          if (256 == M) break;
          var x = E + M - 254;
          if (M > 264) {
            var S = u.ldef[M - 257];
            x = E + (S >>> 3) + a2(e4, F, 7 & S), F += 7 & S;
          }
          var R = A[c2(e4, F) & y];
          F += 15 & R;
          var T = R >>> 4, O = u.ddef[T], P = (O >>> 4) + o2(e4, F, 15 & O);
          for (F += 15 & O, h && (t2 = UZIP2.F._check(t2, E + (1 << 17))); E < x; ) t2[E] = t2[E++ - P], t2[E] = t2[E++ - P], t2[E] = t2[E++ - P], t2[E] = t2[E++ - P];
          E = x;
        }
      }
    } else {
      0 != (7 & F) && (F += 8 - (7 & F));
      var H = 4 + (F >>> 3), L = e4[H - 4] | e4[H - 3] << 8;
      h && (t2 = UZIP2.F._check(t2, E + L)), t2.set(new r3(e4.buffer, e4.byteOffset + H, L), E), F = H + L << 3, E += L;
    }
    return t2.length == E ? t2 : t2.slice(0, E);
  }, UZIP2.F._check = function(e4, t2) {
    var r3 = e4.length;
    if (t2 <= r3) return e4;
    var i3 = new Uint8Array(Math.max(r3 << 1, t2));
    return i3.set(e4, 0), i3;
  }, UZIP2.F._decodeTiny = function(e4, t2, r3, i3, o2, a2) {
    for (var s2 = UZIP2.F._bitsE, f2 = UZIP2.F._get17, l2 = 0; l2 < r3; ) {
      var c2 = e4[f2(i3, o2) & t2];
      o2 += 15 & c2;
      var u = c2 >>> 4;
      if (u <= 15) a2[l2] = u, l2++;
      else {
        var h = 0, d = 0;
        16 == u ? (d = 3 + s2(i3, o2, 2), o2 += 2, h = a2[l2 - 1]) : 17 == u ? (d = 3 + s2(i3, o2, 3), o2 += 3) : 18 == u && (d = 11 + s2(i3, o2, 7), o2 += 7);
        for (var A = l2 + d; l2 < A; ) a2[l2] = h, l2++;
      }
    }
    return o2;
  }, UZIP2.F._copyOut = function(e4, t2, r3, i3) {
    for (var o2 = 0, a2 = 0, s2 = i3.length >>> 1; a2 < r3; ) {
      var f2 = e4[a2 + t2];
      i3[a2 << 1] = 0, i3[1 + (a2 << 1)] = f2, f2 > o2 && (o2 = f2), a2++;
    }
    for (; a2 < s2; ) i3[a2 << 1] = 0, i3[1 + (a2 << 1)] = 0, a2++;
    return o2;
  }, UZIP2.F.makeCodes = function(e4, t2) {
    for (var r3, i3, o2, a2, s2 = UZIP2.F.U, f2 = e4.length, l2 = s2.bl_count, c2 = 0; c2 <= t2; c2++) l2[c2] = 0;
    for (c2 = 1; c2 < f2; c2 += 2) l2[e4[c2]]++;
    var u = s2.next_code;
    for (r3 = 0, l2[0] = 0, i3 = 1; i3 <= t2; i3++) r3 = r3 + l2[i3 - 1] << 1, u[i3] = r3;
    for (o2 = 0; o2 < f2; o2 += 2) 0 != (a2 = e4[o2 + 1]) && (e4[o2] = u[a2], u[a2]++);
  }, UZIP2.F.codes2map = function(e4, t2, r3) {
    for (var i3 = e4.length, o2 = UZIP2.F.U.rev15, a2 = 0; a2 < i3; a2 += 2) if (0 != e4[a2 + 1]) for (var s2 = a2 >> 1, f2 = e4[a2 + 1], l2 = s2 << 4 | f2, c2 = t2 - f2, u = e4[a2] << c2, h = u + (1 << c2); u != h; ) {
      r3[o2[u] >>> 15 - t2] = l2, u++;
    }
  }, UZIP2.F.revCodes = function(e4, t2) {
    for (var r3 = UZIP2.F.U.rev15, i3 = 15 - t2, o2 = 0; o2 < e4.length; o2 += 2) {
      var a2 = e4[o2] << t2 - e4[o2 + 1];
      e4[o2] = r3[a2] >>> i3;
    }
  }, UZIP2.F._putsE = function(e4, t2, r3) {
    r3 <<= 7 & t2;
    var i3 = t2 >>> 3;
    e4[i3] |= r3, e4[i3 + 1] |= r3 >>> 8;
  }, UZIP2.F._putsF = function(e4, t2, r3) {
    r3 <<= 7 & t2;
    var i3 = t2 >>> 3;
    e4[i3] |= r3, e4[i3 + 1] |= r3 >>> 8, e4[i3 + 2] |= r3 >>> 16;
  }, UZIP2.F._bitsE = function(e4, t2, r3) {
    return (e4[t2 >>> 3] | e4[1 + (t2 >>> 3)] << 8) >>> (7 & t2) & (1 << r3) - 1;
  }, UZIP2.F._bitsF = function(e4, t2, r3) {
    return (e4[t2 >>> 3] | e4[1 + (t2 >>> 3)] << 8 | e4[2 + (t2 >>> 3)] << 16) >>> (7 & t2) & (1 << r3) - 1;
  }, UZIP2.F._get17 = function(e4, t2) {
    return (e4[t2 >>> 3] | e4[1 + (t2 >>> 3)] << 8 | e4[2 + (t2 >>> 3)] << 16) >>> (7 & t2);
  }, UZIP2.F._get25 = function(e4, t2) {
    return (e4[t2 >>> 3] | e4[1 + (t2 >>> 3)] << 8 | e4[2 + (t2 >>> 3)] << 16 | e4[3 + (t2 >>> 3)] << 24) >>> (7 & t2);
  }, UZIP2.F.U = (r2 = Uint16Array, i2 = Uint32Array, { next_code: new r2(16), bl_count: new r2(16), ordr: [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], of0: [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999], exb: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0], ldef: new r2(32), df0: [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 65535, 65535], dxb: [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0], ddef: new i2(32), flmap: new r2(512), fltree: [], fdmap: new r2(32), fdtree: [], lmap: new r2(32768), ltree: [], ttree: [], dmap: new r2(32768), dtree: [], imap: new r2(512), itree: [], rev15: new r2(32768), lhst: new i2(286), dhst: new i2(30), ihst: new i2(19), lits: new i2(15e3), strt: new r2(65536), prev: new r2(32768) }), (function() {
    for (var e4 = UZIP2.F.U, t2 = 0; t2 < 32768; t2++) {
      var r3 = t2;
      r3 = (4278255360 & (r3 = (4042322160 & (r3 = (3435973836 & (r3 = (2863311530 & r3) >>> 1 | (1431655765 & r3) << 1)) >>> 2 | (858993459 & r3) << 2)) >>> 4 | (252645135 & r3) << 4)) >>> 8 | (16711935 & r3) << 8, e4.rev15[t2] = (r3 >>> 16 | r3 << 16) >>> 17;
    }
    function pushV(e5, t3, r4) {
      for (; 0 != t3--; ) e5.push(0, r4);
    }
    for (t2 = 0; t2 < 32; t2++) e4.ldef[t2] = e4.of0[t2] << 3 | e4.exb[t2], e4.ddef[t2] = e4.df0[t2] << 4 | e4.dxb[t2];
    pushV(e4.fltree, 144, 8), pushV(e4.fltree, 112, 9), pushV(e4.fltree, 24, 7), pushV(e4.fltree, 8, 8), UZIP2.F.makeCodes(e4.fltree, 9), UZIP2.F.codes2map(e4.fltree, 9, e4.flmap), UZIP2.F.revCodes(e4.fltree, 9), pushV(e4.fdtree, 32, 5), UZIP2.F.makeCodes(e4.fdtree, 5), UZIP2.F.codes2map(e4.fdtree, 5, e4.fdmap), UZIP2.F.revCodes(e4.fdtree, 5), pushV(e4.itree, 19, 0), pushV(e4.ltree, 286, 0), pushV(e4.dtree, 30, 0), pushV(e4.ttree, 320, 0);
  })();
})();
var UZIP = _mergeNamespaces$1({ __proto__: null, default: e2 }, [e2]);
var UPNG = (function() {
  var e3 = { nextZero(e4, t3) {
    for (; 0 != e4[t3]; ) t3++;
    return t3;
  }, readUshort: (e4, t3) => e4[t3] << 8 | e4[t3 + 1], writeUshort(e4, t3, r2) {
    e4[t3] = r2 >> 8 & 255, e4[t3 + 1] = 255 & r2;
  }, readUint: (e4, t3) => 16777216 * e4[t3] + (e4[t3 + 1] << 16 | e4[t3 + 2] << 8 | e4[t3 + 3]), writeUint(e4, t3, r2) {
    e4[t3] = r2 >> 24 & 255, e4[t3 + 1] = r2 >> 16 & 255, e4[t3 + 2] = r2 >> 8 & 255, e4[t3 + 3] = 255 & r2;
  }, readASCII(e4, t3, r2) {
    let i2 = "";
    for (let o2 = 0; o2 < r2; o2++) i2 += String.fromCharCode(e4[t3 + o2]);
    return i2;
  }, writeASCII(e4, t3, r2) {
    for (let i2 = 0; i2 < r2.length; i2++) e4[t3 + i2] = r2.charCodeAt(i2);
  }, readBytes(e4, t3, r2) {
    const i2 = [];
    for (let o2 = 0; o2 < r2; o2++) i2.push(e4[t3 + o2]);
    return i2;
  }, pad: (e4) => e4.length < 2 ? `0${e4}` : e4, readUTF8(t3, r2, i2) {
    let o2, a2 = "";
    for (let o3 = 0; o3 < i2; o3++) a2 += `%${e3.pad(t3[r2 + o3].toString(16))}`;
    try {
      o2 = decodeURIComponent(a2);
    } catch (o3) {
      return e3.readASCII(t3, r2, i2);
    }
    return o2;
  } };
  function decodeImage(t3, r2, i2, o2) {
    const a2 = r2 * i2, s2 = _getBPP(o2), f2 = Math.ceil(r2 * s2 / 8), l2 = new Uint8Array(4 * a2), c2 = new Uint32Array(l2.buffer), { ctype: u } = o2, { depth: h } = o2, d = e3.readUshort;
    if (6 == u) {
      const e4 = a2 << 2;
      if (8 == h) for (var A = 0; A < e4; A += 4) l2[A] = t3[A], l2[A + 1] = t3[A + 1], l2[A + 2] = t3[A + 2], l2[A + 3] = t3[A + 3];
      if (16 == h) for (A = 0; A < e4; A++) l2[A] = t3[A << 1];
    } else if (2 == u) {
      const e4 = o2.tabs.tRNS;
      if (null == e4) {
        if (8 == h) for (A = 0; A < a2; A++) {
          var g = 3 * A;
          c2[A] = 255 << 24 | t3[g + 2] << 16 | t3[g + 1] << 8 | t3[g];
        }
        if (16 == h) for (A = 0; A < a2; A++) {
          g = 6 * A;
          c2[A] = 255 << 24 | t3[g + 4] << 16 | t3[g + 2] << 8 | t3[g];
        }
      } else {
        var p = e4[0];
        const r3 = e4[1], i3 = e4[2];
        if (8 == h) for (A = 0; A < a2; A++) {
          var m = A << 2;
          g = 3 * A;
          c2[A] = 255 << 24 | t3[g + 2] << 16 | t3[g + 1] << 8 | t3[g], t3[g] == p && t3[g + 1] == r3 && t3[g + 2] == i3 && (l2[m + 3] = 0);
        }
        if (16 == h) for (A = 0; A < a2; A++) {
          m = A << 2, g = 6 * A;
          c2[A] = 255 << 24 | t3[g + 4] << 16 | t3[g + 2] << 8 | t3[g], d(t3, g) == p && d(t3, g + 2) == r3 && d(t3, g + 4) == i3 && (l2[m + 3] = 0);
        }
      }
    } else if (3 == u) {
      const e4 = o2.tabs.PLTE, s3 = o2.tabs.tRNS, c3 = s3 ? s3.length : 0;
      if (1 == h) for (var w = 0; w < i2; w++) {
        var v = w * f2, b = w * r2;
        for (A = 0; A < r2; A++) {
          m = b + A << 2;
          var y = 3 * (E = t3[v + (A >> 3)] >> 7 - ((7 & A) << 0) & 1);
          l2[m] = e4[y], l2[m + 1] = e4[y + 1], l2[m + 2] = e4[y + 2], l2[m + 3] = E < c3 ? s3[E] : 255;
        }
      }
      if (2 == h) for (w = 0; w < i2; w++) for (v = w * f2, b = w * r2, A = 0; A < r2; A++) {
        m = b + A << 2, y = 3 * (E = t3[v + (A >> 2)] >> 6 - ((3 & A) << 1) & 3);
        l2[m] = e4[y], l2[m + 1] = e4[y + 1], l2[m + 2] = e4[y + 2], l2[m + 3] = E < c3 ? s3[E] : 255;
      }
      if (4 == h) for (w = 0; w < i2; w++) for (v = w * f2, b = w * r2, A = 0; A < r2; A++) {
        m = b + A << 2, y = 3 * (E = t3[v + (A >> 1)] >> 4 - ((1 & A) << 2) & 15);
        l2[m] = e4[y], l2[m + 1] = e4[y + 1], l2[m + 2] = e4[y + 2], l2[m + 3] = E < c3 ? s3[E] : 255;
      }
      if (8 == h) for (A = 0; A < a2; A++) {
        var E;
        m = A << 2, y = 3 * (E = t3[A]);
        l2[m] = e4[y], l2[m + 1] = e4[y + 1], l2[m + 2] = e4[y + 2], l2[m + 3] = E < c3 ? s3[E] : 255;
      }
    } else if (4 == u) {
      if (8 == h) for (A = 0; A < a2; A++) {
        m = A << 2;
        var F = t3[_ = A << 1];
        l2[m] = F, l2[m + 1] = F, l2[m + 2] = F, l2[m + 3] = t3[_ + 1];
      }
      if (16 == h) for (A = 0; A < a2; A++) {
        var _;
        m = A << 2, F = t3[_ = A << 2];
        l2[m] = F, l2[m + 1] = F, l2[m + 2] = F, l2[m + 3] = t3[_ + 2];
      }
    } else if (0 == u) for (p = o2.tabs.tRNS ? o2.tabs.tRNS : -1, w = 0; w < i2; w++) {
      const e4 = w * f2, i3 = w * r2;
      if (1 == h) for (var B = 0; B < r2; B++) {
        var U = (F = 255 * (t3[e4 + (B >>> 3)] >>> 7 - (7 & B) & 1)) == 255 * p ? 0 : 255;
        c2[i3 + B] = U << 24 | F << 16 | F << 8 | F;
      }
      else if (2 == h) for (B = 0; B < r2; B++) {
        U = (F = 85 * (t3[e4 + (B >>> 2)] >>> 6 - ((3 & B) << 1) & 3)) == 85 * p ? 0 : 255;
        c2[i3 + B] = U << 24 | F << 16 | F << 8 | F;
      }
      else if (4 == h) for (B = 0; B < r2; B++) {
        U = (F = 17 * (t3[e4 + (B >>> 1)] >>> 4 - ((1 & B) << 2) & 15)) == 17 * p ? 0 : 255;
        c2[i3 + B] = U << 24 | F << 16 | F << 8 | F;
      }
      else if (8 == h) for (B = 0; B < r2; B++) {
        U = (F = t3[e4 + B]) == p ? 0 : 255;
        c2[i3 + B] = U << 24 | F << 16 | F << 8 | F;
      }
      else if (16 == h) for (B = 0; B < r2; B++) {
        F = t3[e4 + (B << 1)], U = d(t3, e4 + (B << 1)) == p ? 0 : 255;
        c2[i3 + B] = U << 24 | F << 16 | F << 8 | F;
      }
    }
    return l2;
  }
  function _decompress(e4, r2, i2, o2) {
    const a2 = _getBPP(e4), s2 = Math.ceil(i2 * a2 / 8), f2 = new Uint8Array((s2 + 1 + e4.interlace) * o2);
    return r2 = e4.tabs.CgBI ? t2(r2, f2) : _inflate(r2, f2), 0 == e4.interlace ? r2 = _filterZero(r2, e4, 0, i2, o2) : 1 == e4.interlace && (r2 = (function _readInterlace(e5, t3) {
      const r3 = t3.width, i3 = t3.height, o3 = _getBPP(t3), a3 = o3 >> 3, s3 = Math.ceil(r3 * o3 / 8), f3 = new Uint8Array(i3 * s3);
      let l2 = 0;
      const c2 = [0, 0, 4, 0, 2, 0, 1], u = [0, 4, 0, 2, 0, 1, 0], h = [8, 8, 8, 4, 4, 2, 2], d = [8, 8, 4, 4, 2, 2, 1];
      let A = 0;
      for (; A < 7; ) {
        const p = h[A], m = d[A];
        let w = 0, v = 0, b = c2[A];
        for (; b < i3; ) b += p, v++;
        let y = u[A];
        for (; y < r3; ) y += m, w++;
        const E = Math.ceil(w * o3 / 8);
        _filterZero(e5, t3, l2, w, v);
        let F = 0, _ = c2[A];
        for (; _ < i3; ) {
          let t4 = u[A], i4 = l2 + F * E << 3;
          for (; t4 < r3; ) {
            var g;
            if (1 == o3) g = (g = e5[i4 >> 3]) >> 7 - (7 & i4) & 1, f3[_ * s3 + (t4 >> 3)] |= g << 7 - ((7 & t4) << 0);
            if (2 == o3) g = (g = e5[i4 >> 3]) >> 6 - (7 & i4) & 3, f3[_ * s3 + (t4 >> 2)] |= g << 6 - ((3 & t4) << 1);
            if (4 == o3) g = (g = e5[i4 >> 3]) >> 4 - (7 & i4) & 15, f3[_ * s3 + (t4 >> 1)] |= g << 4 - ((1 & t4) << 2);
            if (o3 >= 8) {
              const r4 = _ * s3 + t4 * a3;
              for (let t5 = 0; t5 < a3; t5++) f3[r4 + t5] = e5[(i4 >> 3) + t5];
            }
            i4 += o3, t4 += m;
          }
          F++, _ += p;
        }
        w * v != 0 && (l2 += v * (1 + E)), A += 1;
      }
      return f3;
    })(r2, e4)), r2;
  }
  function _inflate(e4, r2) {
    return t2(new Uint8Array(e4.buffer, 2, e4.length - 6), r2);
  }
  var t2 = (function() {
    const e4 = { H: {} };
    return e4.H.N = function(t3, r2) {
      const i2 = Uint8Array;
      let o2, a2, s2 = 0, f2 = 0, l2 = 0, c2 = 0, u = 0, h = 0, d = 0, A = 0, g = 0;
      if (3 == t3[0] && 0 == t3[1]) return r2 || new i2(0);
      const p = e4.H, m = p.b, w = p.e, v = p.R, b = p.n, y = p.A, E = p.Z, F = p.m, _ = null == r2;
      for (_ && (r2 = new i2(t3.length >>> 2 << 5)); 0 == s2; ) if (s2 = m(t3, g, 1), f2 = m(t3, g + 1, 2), g += 3, 0 != f2) {
        if (_ && (r2 = e4.H.W(r2, A + (1 << 17))), 1 == f2 && (o2 = F.J, a2 = F.h, h = 511, d = 31), 2 == f2) {
          l2 = w(t3, g, 5) + 257, c2 = w(t3, g + 5, 5) + 1, u = w(t3, g + 10, 4) + 4, g += 14;
          let e5 = 1;
          for (var B = 0; B < 38; B += 2) F.Q[B] = 0, F.Q[B + 1] = 0;
          for (B = 0; B < u; B++) {
            const r4 = w(t3, g + 3 * B, 3);
            F.Q[1 + (F.X[B] << 1)] = r4, r4 > e5 && (e5 = r4);
          }
          g += 3 * u, b(F.Q, e5), y(F.Q, e5, F.u), o2 = F.w, a2 = F.d, g = v(F.u, (1 << e5) - 1, l2 + c2, t3, g, F.v);
          const r3 = p.V(F.v, 0, l2, F.C);
          h = (1 << r3) - 1;
          const i3 = p.V(F.v, l2, c2, F.D);
          d = (1 << i3) - 1, b(F.C, r3), y(F.C, r3, o2), b(F.D, i3), y(F.D, i3, a2);
        }
        for (; ; ) {
          const e5 = o2[E(t3, g) & h];
          g += 15 & e5;
          const i3 = e5 >>> 4;
          if (i3 >>> 8 == 0) r2[A++] = i3;
          else {
            if (256 == i3) break;
            {
              let e6 = A + i3 - 254;
              if (i3 > 264) {
                const r3 = F.q[i3 - 257];
                e6 = A + (r3 >>> 3) + w(t3, g, 7 & r3), g += 7 & r3;
              }
              const o3 = a2[E(t3, g) & d];
              g += 15 & o3;
              const s3 = o3 >>> 4, f3 = F.c[s3], l3 = (f3 >>> 4) + m(t3, g, 15 & f3);
              for (g += 15 & f3; A < e6; ) r2[A] = r2[A++ - l3], r2[A] = r2[A++ - l3], r2[A] = r2[A++ - l3], r2[A] = r2[A++ - l3];
              A = e6;
            }
          }
        }
      } else {
        0 != (7 & g) && (g += 8 - (7 & g));
        const o3 = 4 + (g >>> 3), a3 = t3[o3 - 4] | t3[o3 - 3] << 8;
        _ && (r2 = e4.H.W(r2, A + a3)), r2.set(new i2(t3.buffer, t3.byteOffset + o3, a3), A), g = o3 + a3 << 3, A += a3;
      }
      return r2.length == A ? r2 : r2.slice(0, A);
    }, e4.H.W = function(e5, t3) {
      const r2 = e5.length;
      if (t3 <= r2) return e5;
      const i2 = new Uint8Array(r2 << 1);
      return i2.set(e5, 0), i2;
    }, e4.H.R = function(t3, r2, i2, o2, a2, s2) {
      const f2 = e4.H.e, l2 = e4.H.Z;
      let c2 = 0;
      for (; c2 < i2; ) {
        const e5 = t3[l2(o2, a2) & r2];
        a2 += 15 & e5;
        const i3 = e5 >>> 4;
        if (i3 <= 15) s2[c2] = i3, c2++;
        else {
          let e6 = 0, t4 = 0;
          16 == i3 ? (t4 = 3 + f2(o2, a2, 2), a2 += 2, e6 = s2[c2 - 1]) : 17 == i3 ? (t4 = 3 + f2(o2, a2, 3), a2 += 3) : 18 == i3 && (t4 = 11 + f2(o2, a2, 7), a2 += 7);
          const r3 = c2 + t4;
          for (; c2 < r3; ) s2[c2] = e6, c2++;
        }
      }
      return a2;
    }, e4.H.V = function(e5, t3, r2, i2) {
      let o2 = 0, a2 = 0;
      const s2 = i2.length >>> 1;
      for (; a2 < r2; ) {
        const r3 = e5[a2 + t3];
        i2[a2 << 1] = 0, i2[1 + (a2 << 1)] = r3, r3 > o2 && (o2 = r3), a2++;
      }
      for (; a2 < s2; ) i2[a2 << 1] = 0, i2[1 + (a2 << 1)] = 0, a2++;
      return o2;
    }, e4.H.n = function(t3, r2) {
      const i2 = e4.H.m, o2 = t3.length;
      let a2, s2, f2;
      let l2;
      const c2 = i2.j;
      for (var u = 0; u <= r2; u++) c2[u] = 0;
      for (u = 1; u < o2; u += 2) c2[t3[u]]++;
      const h = i2.K;
      for (a2 = 0, c2[0] = 0, s2 = 1; s2 <= r2; s2++) a2 = a2 + c2[s2 - 1] << 1, h[s2] = a2;
      for (f2 = 0; f2 < o2; f2 += 2) l2 = t3[f2 + 1], 0 != l2 && (t3[f2] = h[l2], h[l2]++);
    }, e4.H.A = function(t3, r2, i2) {
      const o2 = t3.length, a2 = e4.H.m.r;
      for (let e5 = 0; e5 < o2; e5 += 2) if (0 != t3[e5 + 1]) {
        const o3 = e5 >> 1, s2 = t3[e5 + 1], f2 = o3 << 4 | s2, l2 = r2 - s2;
        let c2 = t3[e5] << l2;
        const u = c2 + (1 << l2);
        for (; c2 != u; ) {
          i2[a2[c2] >>> 15 - r2] = f2, c2++;
        }
      }
    }, e4.H.l = function(t3, r2) {
      const i2 = e4.H.m.r, o2 = 15 - r2;
      for (let e5 = 0; e5 < t3.length; e5 += 2) {
        const a2 = t3[e5] << r2 - t3[e5 + 1];
        t3[e5] = i2[a2] >>> o2;
      }
    }, e4.H.M = function(e5, t3, r2) {
      r2 <<= 7 & t3;
      const i2 = t3 >>> 3;
      e5[i2] |= r2, e5[i2 + 1] |= r2 >>> 8;
    }, e4.H.I = function(e5, t3, r2) {
      r2 <<= 7 & t3;
      const i2 = t3 >>> 3;
      e5[i2] |= r2, e5[i2 + 1] |= r2 >>> 8, e5[i2 + 2] |= r2 >>> 16;
    }, e4.H.e = function(e5, t3, r2) {
      return (e5[t3 >>> 3] | e5[1 + (t3 >>> 3)] << 8) >>> (7 & t3) & (1 << r2) - 1;
    }, e4.H.b = function(e5, t3, r2) {
      return (e5[t3 >>> 3] | e5[1 + (t3 >>> 3)] << 8 | e5[2 + (t3 >>> 3)] << 16) >>> (7 & t3) & (1 << r2) - 1;
    }, e4.H.Z = function(e5, t3) {
      return (e5[t3 >>> 3] | e5[1 + (t3 >>> 3)] << 8 | e5[2 + (t3 >>> 3)] << 16) >>> (7 & t3);
    }, e4.H.i = function(e5, t3) {
      return (e5[t3 >>> 3] | e5[1 + (t3 >>> 3)] << 8 | e5[2 + (t3 >>> 3)] << 16 | e5[3 + (t3 >>> 3)] << 24) >>> (7 & t3);
    }, e4.H.m = (function() {
      const e5 = Uint16Array, t3 = Uint32Array;
      return { K: new e5(16), j: new e5(16), X: [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], S: [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999], T: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0], q: new e5(32), p: [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 65535, 65535], z: [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0], c: new t3(32), J: new e5(512), _: [], h: new e5(32), $: [], w: new e5(32768), C: [], v: [], d: new e5(32768), D: [], u: new e5(512), Q: [], r: new e5(32768), s: new t3(286), Y: new t3(30), a: new t3(19), t: new t3(15e3), k: new e5(65536), g: new e5(32768) };
    })(), (function() {
      const t3 = e4.H.m;
      for (var r2 = 0; r2 < 32768; r2++) {
        let e5 = r2;
        e5 = (2863311530 & e5) >>> 1 | (1431655765 & e5) << 1, e5 = (3435973836 & e5) >>> 2 | (858993459 & e5) << 2, e5 = (4042322160 & e5) >>> 4 | (252645135 & e5) << 4, e5 = (4278255360 & e5) >>> 8 | (16711935 & e5) << 8, t3.r[r2] = (e5 >>> 16 | e5 << 16) >>> 17;
      }
      function n(e5, t4, r3) {
        for (; 0 != t4--; ) e5.push(0, r3);
      }
      for (r2 = 0; r2 < 32; r2++) t3.q[r2] = t3.S[r2] << 3 | t3.T[r2], t3.c[r2] = t3.p[r2] << 4 | t3.z[r2];
      n(t3._, 144, 8), n(t3._, 112, 9), n(t3._, 24, 7), n(t3._, 8, 8), e4.H.n(t3._, 9), e4.H.A(t3._, 9, t3.J), e4.H.l(t3._, 9), n(t3.$, 32, 5), e4.H.n(t3.$, 5), e4.H.A(t3.$, 5, t3.h), e4.H.l(t3.$, 5), n(t3.Q, 19, 0), n(t3.C, 286, 0), n(t3.D, 30, 0), n(t3.v, 320, 0);
    })(), e4.H.N;
  })();
  function _getBPP(e4) {
    return [1, null, 3, 1, 2, null, 4][e4.ctype] * e4.depth;
  }
  function _filterZero(e4, t3, r2, i2, o2) {
    let a2 = _getBPP(t3);
    const s2 = Math.ceil(i2 * a2 / 8);
    let f2, l2;
    a2 = Math.ceil(a2 / 8);
    let c2 = e4[r2], u = 0;
    if (c2 > 1 && (e4[r2] = [0, 0, 1][c2 - 2]), 3 == c2) for (u = a2; u < s2; u++) e4[u + 1] = e4[u + 1] + (e4[u + 1 - a2] >>> 1) & 255;
    for (let t4 = 0; t4 < o2; t4++) if (f2 = r2 + t4 * s2, l2 = f2 + t4 + 1, c2 = e4[l2 - 1], u = 0, 0 == c2) for (; u < s2; u++) e4[f2 + u] = e4[l2 + u];
    else if (1 == c2) {
      for (; u < a2; u++) e4[f2 + u] = e4[l2 + u];
      for (; u < s2; u++) e4[f2 + u] = e4[l2 + u] + e4[f2 + u - a2];
    } else if (2 == c2) for (; u < s2; u++) e4[f2 + u] = e4[l2 + u] + e4[f2 + u - s2];
    else if (3 == c2) {
      for (; u < a2; u++) e4[f2 + u] = e4[l2 + u] + (e4[f2 + u - s2] >>> 1);
      for (; u < s2; u++) e4[f2 + u] = e4[l2 + u] + (e4[f2 + u - s2] + e4[f2 + u - a2] >>> 1);
    } else {
      for (; u < a2; u++) e4[f2 + u] = e4[l2 + u] + _paeth(0, e4[f2 + u - s2], 0);
      for (; u < s2; u++) e4[f2 + u] = e4[l2 + u] + _paeth(e4[f2 + u - a2], e4[f2 + u - s2], e4[f2 + u - a2 - s2]);
    }
    return e4;
  }
  function _paeth(e4, t3, r2) {
    const i2 = e4 + t3 - r2, o2 = i2 - e4, a2 = i2 - t3, s2 = i2 - r2;
    return o2 * o2 <= a2 * a2 && o2 * o2 <= s2 * s2 ? e4 : a2 * a2 <= s2 * s2 ? t3 : r2;
  }
  function _IHDR(t3, r2, i2) {
    i2.width = e3.readUint(t3, r2), r2 += 4, i2.height = e3.readUint(t3, r2), r2 += 4, i2.depth = t3[r2], r2++, i2.ctype = t3[r2], r2++, i2.compress = t3[r2], r2++, i2.filter = t3[r2], r2++, i2.interlace = t3[r2], r2++;
  }
  function _copyTile(e4, t3, r2, i2, o2, a2, s2, f2, l2) {
    const c2 = Math.min(t3, o2), u = Math.min(r2, a2);
    let h = 0, d = 0;
    for (let r3 = 0; r3 < u; r3++) for (let a3 = 0; a3 < c2; a3++) if (s2 >= 0 && f2 >= 0 ? (h = r3 * t3 + a3 << 2, d = (f2 + r3) * o2 + s2 + a3 << 2) : (h = (-f2 + r3) * t3 - s2 + a3 << 2, d = r3 * o2 + a3 << 2), 0 == l2) i2[d] = e4[h], i2[d + 1] = e4[h + 1], i2[d + 2] = e4[h + 2], i2[d + 3] = e4[h + 3];
    else if (1 == l2) {
      var A = e4[h + 3] * (1 / 255), g = e4[h] * A, p = e4[h + 1] * A, m = e4[h + 2] * A, w = i2[d + 3] * (1 / 255), v = i2[d] * w, b = i2[d + 1] * w, y = i2[d + 2] * w;
      const t4 = 1 - A, r4 = A + w * t4, o3 = 0 == r4 ? 0 : 1 / r4;
      i2[d + 3] = 255 * r4, i2[d + 0] = (g + v * t4) * o3, i2[d + 1] = (p + b * t4) * o3, i2[d + 2] = (m + y * t4) * o3;
    } else if (2 == l2) {
      A = e4[h + 3], g = e4[h], p = e4[h + 1], m = e4[h + 2], w = i2[d + 3], v = i2[d], b = i2[d + 1], y = i2[d + 2];
      A == w && g == v && p == b && m == y ? (i2[d] = 0, i2[d + 1] = 0, i2[d + 2] = 0, i2[d + 3] = 0) : (i2[d] = g, i2[d + 1] = p, i2[d + 2] = m, i2[d + 3] = A);
    } else if (3 == l2) {
      A = e4[h + 3], g = e4[h], p = e4[h + 1], m = e4[h + 2], w = i2[d + 3], v = i2[d], b = i2[d + 1], y = i2[d + 2];
      if (A == w && g == v && p == b && m == y) continue;
      if (A < 220 && w > 20) return false;
    }
    return true;
  }
  return { decode: function decode(r2) {
    const i2 = new Uint8Array(r2);
    let o2 = 8;
    const a2 = e3, s2 = a2.readUshort, f2 = a2.readUint, l2 = { tabs: {}, frames: [] }, c2 = new Uint8Array(i2.length);
    let u, h = 0, d = 0;
    const A = [137, 80, 78, 71, 13, 10, 26, 10];
    for (var g = 0; g < 8; g++) if (i2[g] != A[g]) throw "The input is not a PNG file!";
    for (; o2 < i2.length; ) {
      const e4 = a2.readUint(i2, o2);
      o2 += 4;
      const r3 = a2.readASCII(i2, o2, 4);
      if (o2 += 4, "IHDR" == r3) _IHDR(i2, o2, l2);
      else if ("iCCP" == r3) {
        for (var p = o2; 0 != i2[p]; ) p++;
        a2.readASCII(i2, o2, p - o2), i2[p + 1];
        const s3 = i2.slice(p + 2, o2 + e4);
        let f3 = null;
        try {
          f3 = _inflate(s3);
        } catch (e5) {
          f3 = t2(s3);
        }
        l2.tabs[r3] = f3;
      } else if ("CgBI" == r3) l2.tabs[r3] = i2.slice(o2, o2 + 4);
      else if ("IDAT" == r3) {
        for (g = 0; g < e4; g++) c2[h + g] = i2[o2 + g];
        h += e4;
      } else if ("acTL" == r3) l2.tabs[r3] = { num_frames: f2(i2, o2), num_plays: f2(i2, o2 + 4) }, u = new Uint8Array(i2.length);
      else if ("fcTL" == r3) {
        if (0 != d) (E = l2.frames[l2.frames.length - 1]).data = _decompress(l2, u.slice(0, d), E.rect.width, E.rect.height), d = 0;
        const e5 = { x: f2(i2, o2 + 12), y: f2(i2, o2 + 16), width: f2(i2, o2 + 4), height: f2(i2, o2 + 8) };
        let t3 = s2(i2, o2 + 22);
        t3 = s2(i2, o2 + 20) / (0 == t3 ? 100 : t3);
        const r4 = { rect: e5, delay: Math.round(1e3 * t3), dispose: i2[o2 + 24], blend: i2[o2 + 25] };
        l2.frames.push(r4);
      } else if ("fdAT" == r3) {
        for (g = 0; g < e4 - 4; g++) u[d + g] = i2[o2 + g + 4];
        d += e4 - 4;
      } else if ("pHYs" == r3) l2.tabs[r3] = [a2.readUint(i2, o2), a2.readUint(i2, o2 + 4), i2[o2 + 8]];
      else if ("cHRM" == r3) {
        l2.tabs[r3] = [];
        for (g = 0; g < 8; g++) l2.tabs[r3].push(a2.readUint(i2, o2 + 4 * g));
      } else if ("tEXt" == r3 || "zTXt" == r3) {
        null == l2.tabs[r3] && (l2.tabs[r3] = {});
        var m = a2.nextZero(i2, o2), w = a2.readASCII(i2, o2, m - o2), v = o2 + e4 - m - 1;
        if ("tEXt" == r3) y = a2.readASCII(i2, m + 1, v);
        else {
          var b = _inflate(i2.slice(m + 2, m + 2 + v));
          y = a2.readUTF8(b, 0, b.length);
        }
        l2.tabs[r3][w] = y;
      } else if ("iTXt" == r3) {
        null == l2.tabs[r3] && (l2.tabs[r3] = {});
        m = 0, p = o2;
        m = a2.nextZero(i2, p);
        w = a2.readASCII(i2, p, m - p);
        const t3 = i2[p = m + 1];
        var y;
        i2[p + 1], p += 2, m = a2.nextZero(i2, p), a2.readASCII(i2, p, m - p), p = m + 1, m = a2.nextZero(i2, p), a2.readUTF8(i2, p, m - p);
        v = e4 - ((p = m + 1) - o2);
        if (0 == t3) y = a2.readUTF8(i2, p, v);
        else {
          b = _inflate(i2.slice(p, p + v));
          y = a2.readUTF8(b, 0, b.length);
        }
        l2.tabs[r3][w] = y;
      } else if ("PLTE" == r3) l2.tabs[r3] = a2.readBytes(i2, o2, e4);
      else if ("hIST" == r3) {
        const e5 = l2.tabs.PLTE.length / 3;
        l2.tabs[r3] = [];
        for (g = 0; g < e5; g++) l2.tabs[r3].push(s2(i2, o2 + 2 * g));
      } else if ("tRNS" == r3) 3 == l2.ctype ? l2.tabs[r3] = a2.readBytes(i2, o2, e4) : 0 == l2.ctype ? l2.tabs[r3] = s2(i2, o2) : 2 == l2.ctype && (l2.tabs[r3] = [s2(i2, o2), s2(i2, o2 + 2), s2(i2, o2 + 4)]);
      else if ("gAMA" == r3) l2.tabs[r3] = a2.readUint(i2, o2) / 1e5;
      else if ("sRGB" == r3) l2.tabs[r3] = i2[o2];
      else if ("bKGD" == r3) 0 == l2.ctype || 4 == l2.ctype ? l2.tabs[r3] = [s2(i2, o2)] : 2 == l2.ctype || 6 == l2.ctype ? l2.tabs[r3] = [s2(i2, o2), s2(i2, o2 + 2), s2(i2, o2 + 4)] : 3 == l2.ctype && (l2.tabs[r3] = i2[o2]);
      else if ("IEND" == r3) break;
      o2 += e4, a2.readUint(i2, o2), o2 += 4;
    }
    var E;
    return 0 != d && ((E = l2.frames[l2.frames.length - 1]).data = _decompress(l2, u.slice(0, d), E.rect.width, E.rect.height)), l2.data = _decompress(l2, c2, l2.width, l2.height), delete l2.compress, delete l2.interlace, delete l2.filter, l2;
  }, toRGBA8: function toRGBA8(e4) {
    const t3 = e4.width, r2 = e4.height;
    if (null == e4.tabs.acTL) return [decodeImage(e4.data, t3, r2, e4).buffer];
    const i2 = [];
    null == e4.frames[0].data && (e4.frames[0].data = e4.data);
    const o2 = t3 * r2 * 4, a2 = new Uint8Array(o2), s2 = new Uint8Array(o2), f2 = new Uint8Array(o2);
    for (let c2 = 0; c2 < e4.frames.length; c2++) {
      const u = e4.frames[c2], h = u.rect.x, d = u.rect.y, A = u.rect.width, g = u.rect.height, p = decodeImage(u.data, A, g, e4);
      if (0 != c2) for (var l2 = 0; l2 < o2; l2++) f2[l2] = a2[l2];
      if (0 == u.blend ? _copyTile(p, A, g, a2, t3, r2, h, d, 0) : 1 == u.blend && _copyTile(p, A, g, a2, t3, r2, h, d, 1), i2.push(a2.buffer.slice(0)), 0 == u.dispose) ;
      else if (1 == u.dispose) _copyTile(s2, A, g, a2, t3, r2, h, d, 0);
      else if (2 == u.dispose) for (l2 = 0; l2 < o2; l2++) a2[l2] = f2[l2];
    }
    return i2;
  }, _paeth, _copyTile, _bin: e3 };
})();
!(function() {
  const { _copyTile: e3 } = UPNG, { _bin: t2 } = UPNG, r2 = UPNG._paeth;
  var i2 = { table: (function() {
    const e4 = new Uint32Array(256);
    for (let t3 = 0; t3 < 256; t3++) {
      let r3 = t3;
      for (let e5 = 0; e5 < 8; e5++) 1 & r3 ? r3 = 3988292384 ^ r3 >>> 1 : r3 >>>= 1;
      e4[t3] = r3;
    }
    return e4;
  })(), update(e4, t3, r3, o3) {
    for (let a2 = 0; a2 < o3; a2++) e4 = i2.table[255 & (e4 ^ t3[r3 + a2])] ^ e4 >>> 8;
    return e4;
  }, crc: (e4, t3, r3) => 4294967295 ^ i2.update(4294967295, e4, t3, r3) };
  function addErr(e4, t3, r3, i3) {
    t3[r3] += e4[0] * i3 >> 4, t3[r3 + 1] += e4[1] * i3 >> 4, t3[r3 + 2] += e4[2] * i3 >> 4, t3[r3 + 3] += e4[3] * i3 >> 4;
  }
  function N(e4) {
    return Math.max(0, Math.min(255, e4));
  }
  function D(e4, t3) {
    const r3 = e4[0] - t3[0], i3 = e4[1] - t3[1], o3 = e4[2] - t3[2], a2 = e4[3] - t3[3];
    return r3 * r3 + i3 * i3 + o3 * o3 + a2 * a2;
  }
  function dither(e4, t3, r3, i3, o3, a2, s2) {
    null == s2 && (s2 = 1);
    const f2 = i3.length, l2 = [];
    for (var c2 = 0; c2 < f2; c2++) {
      const e5 = i3[c2];
      l2.push([e5 >>> 0 & 255, e5 >>> 8 & 255, e5 >>> 16 & 255, e5 >>> 24 & 255]);
    }
    for (c2 = 0; c2 < f2; c2++) {
      let e5 = 4294967295;
      for (var u = 0, h = 0; h < f2; h++) {
        var d = D(l2[c2], l2[h]);
        h != c2 && d < e5 && (e5 = d, u = h);
      }
    }
    const A = new Uint32Array(o3.buffer), g = new Int16Array(t3 * r3 * 4), p = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (c2 = 0; c2 < p.length; c2++) p[c2] = 255 * ((p[c2] + 0.5) / 16 - 0.5);
    for (let o4 = 0; o4 < r3; o4++) for (let w = 0; w < t3; w++) {
      var m;
      c2 = 4 * (o4 * t3 + w);
      if (2 != s2) m = [N(e4[c2] + g[c2]), N(e4[c2 + 1] + g[c2 + 1]), N(e4[c2 + 2] + g[c2 + 2]), N(e4[c2 + 3] + g[c2 + 3])];
      else {
        d = p[4 * (3 & o4) + (3 & w)];
        m = [N(e4[c2] + d), N(e4[c2 + 1] + d), N(e4[c2 + 2] + d), N(e4[c2 + 3] + d)];
      }
      u = 0;
      let v = 16777215;
      for (h = 0; h < f2; h++) {
        const e5 = D(m, l2[h]);
        e5 < v && (v = e5, u = h);
      }
      const b = l2[u], y = [m[0] - b[0], m[1] - b[1], m[2] - b[2], m[3] - b[3]];
      1 == s2 && (w != t3 - 1 && addErr(y, g, c2 + 4, 7), o4 != r3 - 1 && (0 != w && addErr(y, g, c2 + 4 * t3 - 4, 3), addErr(y, g, c2 + 4 * t3, 5), w != t3 - 1 && addErr(y, g, c2 + 4 * t3 + 4, 1))), a2[c2 >> 2] = u, A[c2 >> 2] = i3[u];
    }
  }
  function _main(e4, r3, o3, a2, s2) {
    null == s2 && (s2 = {});
    const { crc: f2 } = i2, l2 = t2.writeUint, c2 = t2.writeUshort, u = t2.writeASCII;
    let h = 8;
    const d = e4.frames.length > 1;
    let A, g = false, p = 33 + (d ? 20 : 0);
    if (null != s2.sRGB && (p += 13), null != s2.pHYs && (p += 21), null != s2.iCCP && (A = pako.deflate(s2.iCCP), p += 21 + A.length + 4), 3 == e4.ctype) {
      for (var m = e4.plte.length, w = 0; w < m; w++) e4.plte[w] >>> 24 != 255 && (g = true);
      p += 8 + 3 * m + 4 + (g ? 8 + 1 * m + 4 : 0);
    }
    for (var v = 0; v < e4.frames.length; v++) {
      d && (p += 38), p += (F = e4.frames[v]).cimg.length + 12, 0 != v && (p += 4);
    }
    p += 12;
    const b = new Uint8Array(p), y = [137, 80, 78, 71, 13, 10, 26, 10];
    for (w = 0; w < 8; w++) b[w] = y[w];
    if (l2(b, h, 13), h += 4, u(b, h, "IHDR"), h += 4, l2(b, h, r3), h += 4, l2(b, h, o3), h += 4, b[h] = e4.depth, h++, b[h] = e4.ctype, h++, b[h] = 0, h++, b[h] = 0, h++, b[h] = 0, h++, l2(b, h, f2(b, h - 17, 17)), h += 4, null != s2.sRGB && (l2(b, h, 1), h += 4, u(b, h, "sRGB"), h += 4, b[h] = s2.sRGB, h++, l2(b, h, f2(b, h - 5, 5)), h += 4), null != s2.iCCP) {
      const e5 = 13 + A.length;
      l2(b, h, e5), h += 4, u(b, h, "iCCP"), h += 4, u(b, h, "ICC profile"), h += 11, h += 2, b.set(A, h), h += A.length, l2(b, h, f2(b, h - (e5 + 4), e5 + 4)), h += 4;
    }
    if (null != s2.pHYs && (l2(b, h, 9), h += 4, u(b, h, "pHYs"), h += 4, l2(b, h, s2.pHYs[0]), h += 4, l2(b, h, s2.pHYs[1]), h += 4, b[h] = s2.pHYs[2], h++, l2(b, h, f2(b, h - 13, 13)), h += 4), d && (l2(b, h, 8), h += 4, u(b, h, "acTL"), h += 4, l2(b, h, e4.frames.length), h += 4, l2(b, h, null != s2.loop ? s2.loop : 0), h += 4, l2(b, h, f2(b, h - 12, 12)), h += 4), 3 == e4.ctype) {
      l2(b, h, 3 * (m = e4.plte.length)), h += 4, u(b, h, "PLTE"), h += 4;
      for (w = 0; w < m; w++) {
        const t3 = 3 * w, r4 = e4.plte[w], i3 = 255 & r4, o4 = r4 >>> 8 & 255, a3 = r4 >>> 16 & 255;
        b[h + t3 + 0] = i3, b[h + t3 + 1] = o4, b[h + t3 + 2] = a3;
      }
      if (h += 3 * m, l2(b, h, f2(b, h - 3 * m - 4, 3 * m + 4)), h += 4, g) {
        l2(b, h, m), h += 4, u(b, h, "tRNS"), h += 4;
        for (w = 0; w < m; w++) b[h + w] = e4.plte[w] >>> 24 & 255;
        h += m, l2(b, h, f2(b, h - m - 4, m + 4)), h += 4;
      }
    }
    let E = 0;
    for (v = 0; v < e4.frames.length; v++) {
      var F = e4.frames[v];
      d && (l2(b, h, 26), h += 4, u(b, h, "fcTL"), h += 4, l2(b, h, E++), h += 4, l2(b, h, F.rect.width), h += 4, l2(b, h, F.rect.height), h += 4, l2(b, h, F.rect.x), h += 4, l2(b, h, F.rect.y), h += 4, c2(b, h, a2[v]), h += 2, c2(b, h, 1e3), h += 2, b[h] = F.dispose, h++, b[h] = F.blend, h++, l2(b, h, f2(b, h - 30, 30)), h += 4);
      const t3 = F.cimg;
      l2(b, h, (m = t3.length) + (0 == v ? 0 : 4)), h += 4;
      const r4 = h;
      u(b, h, 0 == v ? "IDAT" : "fdAT"), h += 4, 0 != v && (l2(b, h, E++), h += 4), b.set(t3, h), h += m, l2(b, h, f2(b, r4, h - r4)), h += 4;
    }
    return l2(b, h, 0), h += 4, u(b, h, "IEND"), h += 4, l2(b, h, f2(b, h - 4, 4)), h += 4, b.buffer;
  }
  function compressPNG(e4, t3, r3) {
    for (let i3 = 0; i3 < e4.frames.length; i3++) {
      const o3 = e4.frames[i3];
      o3.rect.width;
      const a2 = o3.rect.height, s2 = new Uint8Array(a2 * o3.bpl + a2);
      o3.cimg = _filterZero(o3.img, a2, o3.bpp, o3.bpl, s2, t3, r3);
    }
  }
  function compress2(t3, r3, i3, o3, a2) {
    const s2 = a2[0], f2 = a2[1], l2 = a2[2], c2 = a2[3], u = a2[4], h = a2[5];
    let d = 6, A = 8, g = 255;
    for (var p = 0; p < t3.length; p++) {
      const e4 = new Uint8Array(t3[p]);
      for (var m = e4.length, w = 0; w < m; w += 4) g &= e4[w + 3];
    }
    const v = 255 != g, b = (function framize(t4, r4, i4, o4, a3, s3) {
      const f3 = [];
      for (var l3 = 0; l3 < t4.length; l3++) {
        const h3 = new Uint8Array(t4[l3]), A3 = new Uint32Array(h3.buffer);
        var c3;
        let g2 = 0, p2 = 0, m2 = r4, w2 = i4, v2 = o4 ? 1 : 0;
        if (0 != l3) {
          const b2 = s3 || o4 || 1 == l3 || 0 != f3[l3 - 2].dispose ? 1 : 2;
          let y2 = 0, E2 = 1e9;
          for (let e4 = 0; e4 < b2; e4++) {
            var u2 = new Uint8Array(t4[l3 - 1 - e4]);
            const o5 = new Uint32Array(t4[l3 - 1 - e4]);
            let s4 = r4, f4 = i4, c4 = -1, h4 = -1;
            for (let e5 = 0; e5 < i4; e5++) for (let t5 = 0; t5 < r4; t5++) {
              A3[d2 = e5 * r4 + t5] != o5[d2] && (t5 < s4 && (s4 = t5), t5 > c4 && (c4 = t5), e5 < f4 && (f4 = e5), e5 > h4 && (h4 = e5));
            }
            -1 == c4 && (s4 = f4 = c4 = h4 = 0), a3 && (1 == (1 & s4) && s4--, 1 == (1 & f4) && f4--);
            const v3 = (c4 - s4 + 1) * (h4 - f4 + 1);
            v3 < E2 && (E2 = v3, y2 = e4, g2 = s4, p2 = f4, m2 = c4 - s4 + 1, w2 = h4 - f4 + 1);
          }
          u2 = new Uint8Array(t4[l3 - 1 - y2]);
          1 == y2 && (f3[l3 - 1].dispose = 2), c3 = new Uint8Array(m2 * w2 * 4), e3(u2, r4, i4, c3, m2, w2, -g2, -p2, 0), v2 = e3(h3, r4, i4, c3, m2, w2, -g2, -p2, 3) ? 1 : 0, 1 == v2 ? _prepareDiff(h3, r4, i4, c3, { x: g2, y: p2, width: m2, height: w2 }) : e3(h3, r4, i4, c3, m2, w2, -g2, -p2, 0);
        } else c3 = h3.slice(0);
        f3.push({ rect: { x: g2, y: p2, width: m2, height: w2 }, img: c3, blend: v2, dispose: 0 });
      }
      if (o4) for (l3 = 0; l3 < f3.length; l3++) {
        if (1 == (A2 = f3[l3]).blend) continue;
        const e4 = A2.rect, o5 = f3[l3 - 1].rect, s4 = Math.min(e4.x, o5.x), c4 = Math.min(e4.y, o5.y), u3 = { x: s4, y: c4, width: Math.max(e4.x + e4.width, o5.x + o5.width) - s4, height: Math.max(e4.y + e4.height, o5.y + o5.height) - c4 };
        f3[l3 - 1].dispose = 1, l3 - 1 != 0 && _updateFrame(t4, r4, i4, f3, l3 - 1, u3, a3), _updateFrame(t4, r4, i4, f3, l3, u3, a3);
      }
      let h2 = 0;
      if (1 != t4.length) for (var d2 = 0; d2 < f3.length; d2++) {
        var A2;
        h2 += (A2 = f3[d2]).rect.width * A2.rect.height;
      }
      return f3;
    })(t3, r3, i3, s2, f2, l2), y = {}, E = [], F = [];
    if (0 != o3) {
      const e4 = [];
      for (w = 0; w < b.length; w++) e4.push(b[w].img.buffer);
      const t4 = (function concatRGBA(e5) {
        let t5 = 0;
        for (var r5 = 0; r5 < e5.length; r5++) t5 += e5[r5].byteLength;
        const i5 = new Uint8Array(t5);
        let o4 = 0;
        for (r5 = 0; r5 < e5.length; r5++) {
          const t6 = new Uint8Array(e5[r5]), a3 = t6.length;
          for (let e6 = 0; e6 < a3; e6 += 4) {
            let r6 = t6[e6], a4 = t6[e6 + 1], s3 = t6[e6 + 2];
            const f3 = t6[e6 + 3];
            0 == f3 && (r6 = a4 = s3 = 0), i5[o4 + e6] = r6, i5[o4 + e6 + 1] = a4, i5[o4 + e6 + 2] = s3, i5[o4 + e6 + 3] = f3;
          }
          o4 += a3;
        }
        return i5.buffer;
      })(e4), r4 = quantize(t4, o3);
      for (w = 0; w < r4.plte.length; w++) E.push(r4.plte[w].est.rgba);
      let i4 = 0;
      for (w = 0; w < b.length; w++) {
        const e5 = (B = b[w]).img.length;
        var _ = new Uint8Array(r4.inds.buffer, i4 >> 2, e5 >> 2);
        F.push(_);
        const t5 = new Uint8Array(r4.abuf, i4, e5);
        h && dither(B.img, B.rect.width, B.rect.height, E, t5, _), B.img.set(t5), i4 += e5;
      }
    } else for (p = 0; p < b.length; p++) {
      var B = b[p];
      const e4 = new Uint32Array(B.img.buffer);
      var U = B.rect.width;
      m = e4.length, _ = new Uint8Array(m);
      F.push(_);
      for (w = 0; w < m; w++) {
        const t4 = e4[w];
        if (0 != w && t4 == e4[w - 1]) _[w] = _[w - 1];
        else if (w > U && t4 == e4[w - U]) _[w] = _[w - U];
        else {
          let e5 = y[t4];
          if (null == e5 && (y[t4] = e5 = E.length, E.push(t4), E.length >= 300)) break;
          _[w] = e5;
        }
      }
    }
    const C = E.length;
    C <= 256 && 0 == u && (A = C <= 2 ? 1 : C <= 4 ? 2 : C <= 16 ? 4 : 8, A = Math.max(A, c2));
    for (p = 0; p < b.length; p++) {
      (B = b[p]).rect.x, B.rect.y;
      U = B.rect.width;
      const e4 = B.rect.height;
      let t4 = B.img;
      new Uint32Array(t4.buffer);
      let r4 = 4 * U, i4 = 4;
      if (C <= 256 && 0 == u) {
        r4 = Math.ceil(A * U / 8);
        var I = new Uint8Array(r4 * e4);
        const o4 = F[p];
        for (let t5 = 0; t5 < e4; t5++) {
          w = t5 * r4;
          const e5 = t5 * U;
          if (8 == A) for (var Q = 0; Q < U; Q++) I[w + Q] = o4[e5 + Q];
          else if (4 == A) for (Q = 0; Q < U; Q++) I[w + (Q >> 1)] |= o4[e5 + Q] << 4 - 4 * (1 & Q);
          else if (2 == A) for (Q = 0; Q < U; Q++) I[w + (Q >> 2)] |= o4[e5 + Q] << 6 - 2 * (3 & Q);
          else if (1 == A) for (Q = 0; Q < U; Q++) I[w + (Q >> 3)] |= o4[e5 + Q] << 7 - 1 * (7 & Q);
        }
        t4 = I, d = 3, i4 = 1;
      } else if (0 == v && 1 == b.length) {
        I = new Uint8Array(U * e4 * 3);
        const o4 = U * e4;
        for (w = 0; w < o4; w++) {
          const e5 = 3 * w, r5 = 4 * w;
          I[e5] = t4[r5], I[e5 + 1] = t4[r5 + 1], I[e5 + 2] = t4[r5 + 2];
        }
        t4 = I, d = 2, i4 = 3, r4 = 3 * U;
      }
      B.img = t4, B.bpl = r4, B.bpp = i4;
    }
    return { ctype: d, depth: A, plte: E, frames: b };
  }
  function _updateFrame(t3, r3, i3, o3, a2, s2, f2) {
    const l2 = Uint8Array, c2 = Uint32Array, u = new l2(t3[a2 - 1]), h = new c2(t3[a2 - 1]), d = a2 + 1 < t3.length ? new l2(t3[a2 + 1]) : null, A = new l2(t3[a2]), g = new c2(A.buffer);
    let p = r3, m = i3, w = -1, v = -1;
    for (let e4 = 0; e4 < s2.height; e4++) for (let t4 = 0; t4 < s2.width; t4++) {
      const i4 = s2.x + t4, f3 = s2.y + e4, l3 = f3 * r3 + i4, c3 = g[l3];
      0 == c3 || 0 == o3[a2 - 1].dispose && h[l3] == c3 && (null == d || 0 != d[4 * l3 + 3]) || (i4 < p && (p = i4), i4 > w && (w = i4), f3 < m && (m = f3), f3 > v && (v = f3));
    }
    -1 == w && (p = m = w = v = 0), f2 && (1 == (1 & p) && p--, 1 == (1 & m) && m--), s2 = { x: p, y: m, width: w - p + 1, height: v - m + 1 };
    const b = o3[a2];
    b.rect = s2, b.blend = 1, b.img = new Uint8Array(s2.width * s2.height * 4), 0 == o3[a2 - 1].dispose ? (e3(u, r3, i3, b.img, s2.width, s2.height, -s2.x, -s2.y, 0), _prepareDiff(A, r3, i3, b.img, s2)) : e3(A, r3, i3, b.img, s2.width, s2.height, -s2.x, -s2.y, 0);
  }
  function _prepareDiff(t3, r3, i3, o3, a2) {
    e3(t3, r3, i3, o3, a2.width, a2.height, -a2.x, -a2.y, 2);
  }
  function _filterZero(e4, t3, r3, i3, o3, a2, s2) {
    const f2 = [];
    let l2, c2 = [0, 1, 2, 3, 4];
    -1 != a2 ? c2 = [a2] : (t3 * i3 > 5e5 || 1 == r3) && (c2 = [0]), s2 && (l2 = { level: 0 });
    const u = UZIP;
    for (var h = 0; h < c2.length; h++) {
      for (let a3 = 0; a3 < t3; a3++) _filterLine(o3, e4, a3, i3, r3, c2[h]);
      f2.push(u.deflate(o3, l2));
    }
    let d, A = 1e9;
    for (h = 0; h < f2.length; h++) f2[h].length < A && (d = h, A = f2[h].length);
    return f2[d];
  }
  function _filterLine(e4, t3, i3, o3, a2, s2) {
    const f2 = i3 * o3;
    let l2 = f2 + i3;
    if (e4[l2] = s2, l2++, 0 == s2) if (o3 < 500) for (var c2 = 0; c2 < o3; c2++) e4[l2 + c2] = t3[f2 + c2];
    else e4.set(new Uint8Array(t3.buffer, f2, o3), l2);
    else if (1 == s2) {
      for (c2 = 0; c2 < a2; c2++) e4[l2 + c2] = t3[f2 + c2];
      for (c2 = a2; c2 < o3; c2++) e4[l2 + c2] = t3[f2 + c2] - t3[f2 + c2 - a2] + 256 & 255;
    } else if (0 == i3) {
      for (c2 = 0; c2 < a2; c2++) e4[l2 + c2] = t3[f2 + c2];
      if (2 == s2) for (c2 = a2; c2 < o3; c2++) e4[l2 + c2] = t3[f2 + c2];
      if (3 == s2) for (c2 = a2; c2 < o3; c2++) e4[l2 + c2] = t3[f2 + c2] - (t3[f2 + c2 - a2] >> 1) + 256 & 255;
      if (4 == s2) for (c2 = a2; c2 < o3; c2++) e4[l2 + c2] = t3[f2 + c2] - r2(t3[f2 + c2 - a2], 0, 0) + 256 & 255;
    } else {
      if (2 == s2) for (c2 = 0; c2 < o3; c2++) e4[l2 + c2] = t3[f2 + c2] + 256 - t3[f2 + c2 - o3] & 255;
      if (3 == s2) {
        for (c2 = 0; c2 < a2; c2++) e4[l2 + c2] = t3[f2 + c2] + 256 - (t3[f2 + c2 - o3] >> 1) & 255;
        for (c2 = a2; c2 < o3; c2++) e4[l2 + c2] = t3[f2 + c2] + 256 - (t3[f2 + c2 - o3] + t3[f2 + c2 - a2] >> 1) & 255;
      }
      if (4 == s2) {
        for (c2 = 0; c2 < a2; c2++) e4[l2 + c2] = t3[f2 + c2] + 256 - r2(0, t3[f2 + c2 - o3], 0) & 255;
        for (c2 = a2; c2 < o3; c2++) e4[l2 + c2] = t3[f2 + c2] + 256 - r2(t3[f2 + c2 - a2], t3[f2 + c2 - o3], t3[f2 + c2 - a2 - o3]) & 255;
      }
    }
  }
  function quantize(e4, t3) {
    const r3 = new Uint8Array(e4), i3 = r3.slice(0), o3 = new Uint32Array(i3.buffer), a2 = getKDtree(i3, t3), s2 = a2[0], f2 = a2[1], l2 = r3.length, c2 = new Uint8Array(l2 >> 2);
    let u;
    if (r3.length < 2e7) for (var h = 0; h < l2; h += 4) {
      u = getNearest(s2, d = r3[h] * (1 / 255), A = r3[h + 1] * (1 / 255), g = r3[h + 2] * (1 / 255), p = r3[h + 3] * (1 / 255)), c2[h >> 2] = u.ind, o3[h >> 2] = u.est.rgba;
    }
    else for (h = 0; h < l2; h += 4) {
      var d = r3[h] * (1 / 255), A = r3[h + 1] * (1 / 255), g = r3[h + 2] * (1 / 255), p = r3[h + 3] * (1 / 255);
      for (u = s2; u.left; ) u = planeDst(u.est, d, A, g, p) <= 0 ? u.left : u.right;
      c2[h >> 2] = u.ind, o3[h >> 2] = u.est.rgba;
    }
    return { abuf: i3.buffer, inds: c2, plte: f2 };
  }
  function getKDtree(e4, t3, r3) {
    null == r3 && (r3 = 1e-4);
    const i3 = new Uint32Array(e4.buffer), o3 = { i0: 0, i1: e4.length, bst: null, est: null, tdst: 0, left: null, right: null };
    o3.bst = stats(e4, o3.i0, o3.i1), o3.est = estats(o3.bst);
    const a2 = [o3];
    for (; a2.length < t3; ) {
      let t4 = 0, o4 = 0;
      for (var s2 = 0; s2 < a2.length; s2++) a2[s2].est.L > t4 && (t4 = a2[s2].est.L, o4 = s2);
      if (t4 < r3) break;
      const f2 = a2[o4], l2 = splitPixels(e4, i3, f2.i0, f2.i1, f2.est.e, f2.est.eMq255);
      if (f2.i0 >= l2 || f2.i1 <= l2) {
        f2.est.L = 0;
        continue;
      }
      const c2 = { i0: f2.i0, i1: l2, bst: null, est: null, tdst: 0, left: null, right: null };
      c2.bst = stats(e4, c2.i0, c2.i1), c2.est = estats(c2.bst);
      const u = { i0: l2, i1: f2.i1, bst: null, est: null, tdst: 0, left: null, right: null };
      u.bst = { R: [], m: [], N: f2.bst.N - c2.bst.N };
      for (s2 = 0; s2 < 16; s2++) u.bst.R[s2] = f2.bst.R[s2] - c2.bst.R[s2];
      for (s2 = 0; s2 < 4; s2++) u.bst.m[s2] = f2.bst.m[s2] - c2.bst.m[s2];
      u.est = estats(u.bst), f2.left = c2, f2.right = u, a2[o4] = c2, a2.push(u);
    }
    a2.sort(((e5, t4) => t4.bst.N - e5.bst.N));
    for (s2 = 0; s2 < a2.length; s2++) a2[s2].ind = s2;
    return [o3, a2];
  }
  function getNearest(e4, t3, r3, i3, o3) {
    if (null == e4.left) return e4.tdst = (function dist(e5, t4, r4, i4, o4) {
      const a3 = t4 - e5[0], s3 = r4 - e5[1], f3 = i4 - e5[2], l3 = o4 - e5[3];
      return a3 * a3 + s3 * s3 + f3 * f3 + l3 * l3;
    })(e4.est.q, t3, r3, i3, o3), e4;
    const a2 = planeDst(e4.est, t3, r3, i3, o3);
    let s2 = e4.left, f2 = e4.right;
    a2 > 0 && (s2 = e4.right, f2 = e4.left);
    const l2 = getNearest(s2, t3, r3, i3, o3);
    if (l2.tdst <= a2 * a2) return l2;
    const c2 = getNearest(f2, t3, r3, i3, o3);
    return c2.tdst < l2.tdst ? c2 : l2;
  }
  function planeDst(e4, t3, r3, i3, o3) {
    const { e: a2 } = e4;
    return a2[0] * t3 + a2[1] * r3 + a2[2] * i3 + a2[3] * o3 - e4.eMq;
  }
  function splitPixels(e4, t3, r3, i3, o3, a2) {
    for (i3 -= 4; r3 < i3; ) {
      for (; vecDot(e4, r3, o3) <= a2; ) r3 += 4;
      for (; vecDot(e4, i3, o3) > a2; ) i3 -= 4;
      if (r3 >= i3) break;
      const s2 = t3[r3 >> 2];
      t3[r3 >> 2] = t3[i3 >> 2], t3[i3 >> 2] = s2, r3 += 4, i3 -= 4;
    }
    for (; vecDot(e4, r3, o3) > a2; ) r3 -= 4;
    return r3 + 4;
  }
  function vecDot(e4, t3, r3) {
    return e4[t3] * r3[0] + e4[t3 + 1] * r3[1] + e4[t3 + 2] * r3[2] + e4[t3 + 3] * r3[3];
  }
  function stats(e4, t3, r3) {
    const i3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], o3 = [0, 0, 0, 0], a2 = r3 - t3 >> 2;
    for (let a3 = t3; a3 < r3; a3 += 4) {
      const t4 = e4[a3] * (1 / 255), r4 = e4[a3 + 1] * (1 / 255), s2 = e4[a3 + 2] * (1 / 255), f2 = e4[a3 + 3] * (1 / 255);
      o3[0] += t4, o3[1] += r4, o3[2] += s2, o3[3] += f2, i3[0] += t4 * t4, i3[1] += t4 * r4, i3[2] += t4 * s2, i3[3] += t4 * f2, i3[5] += r4 * r4, i3[6] += r4 * s2, i3[7] += r4 * f2, i3[10] += s2 * s2, i3[11] += s2 * f2, i3[15] += f2 * f2;
    }
    return i3[4] = i3[1], i3[8] = i3[2], i3[9] = i3[6], i3[12] = i3[3], i3[13] = i3[7], i3[14] = i3[11], { R: i3, m: o3, N: a2 };
  }
  function estats(e4) {
    const { R: t3 } = e4, { m: r3 } = e4, { N: i3 } = e4, a2 = r3[0], s2 = r3[1], f2 = r3[2], l2 = r3[3], c2 = 0 == i3 ? 0 : 1 / i3, u = [t3[0] - a2 * a2 * c2, t3[1] - a2 * s2 * c2, t3[2] - a2 * f2 * c2, t3[3] - a2 * l2 * c2, t3[4] - s2 * a2 * c2, t3[5] - s2 * s2 * c2, t3[6] - s2 * f2 * c2, t3[7] - s2 * l2 * c2, t3[8] - f2 * a2 * c2, t3[9] - f2 * s2 * c2, t3[10] - f2 * f2 * c2, t3[11] - f2 * l2 * c2, t3[12] - l2 * a2 * c2, t3[13] - l2 * s2 * c2, t3[14] - l2 * f2 * c2, t3[15] - l2 * l2 * c2], h = u, d = o2;
    let A = [Math.random(), Math.random(), Math.random(), Math.random()], g = 0, p = 0;
    if (0 != i3) for (let e5 = 0; e5 < 16 && (A = d.multVec(h, A), p = Math.sqrt(d.dot(A, A)), A = d.sml(1 / p, A), !(0 != e5 && Math.abs(p - g) < 1e-9)); e5++) g = p;
    const m = [a2 * c2, s2 * c2, f2 * c2, l2 * c2];
    return { Cov: u, q: m, e: A, L: g, eMq255: d.dot(d.sml(255, m), A), eMq: d.dot(A, m), rgba: (Math.round(255 * m[3]) << 24 | Math.round(255 * m[2]) << 16 | Math.round(255 * m[1]) << 8 | Math.round(255 * m[0]) << 0) >>> 0 };
  }
  var o2 = { multVec: (e4, t3) => [e4[0] * t3[0] + e4[1] * t3[1] + e4[2] * t3[2] + e4[3] * t3[3], e4[4] * t3[0] + e4[5] * t3[1] + e4[6] * t3[2] + e4[7] * t3[3], e4[8] * t3[0] + e4[9] * t3[1] + e4[10] * t3[2] + e4[11] * t3[3], e4[12] * t3[0] + e4[13] * t3[1] + e4[14] * t3[2] + e4[15] * t3[3]], dot: (e4, t3) => e4[0] * t3[0] + e4[1] * t3[1] + e4[2] * t3[2] + e4[3] * t3[3], sml: (e4, t3) => [e4 * t3[0], e4 * t3[1], e4 * t3[2], e4 * t3[3]] };
  UPNG.encode = function encode(e4, t3, r3, i3, o3, a2, s2) {
    null == i3 && (i3 = 0), null == s2 && (s2 = false);
    const f2 = compress2(e4, t3, r3, i3, [false, false, false, 0, s2, false]);
    return compressPNG(f2, -1), _main(f2, t3, r3, o3, a2);
  }, UPNG.encodeLL = function encodeLL(e4, t3, r3, i3, o3, a2, s2, f2) {
    const l2 = { ctype: 0 + (1 == i3 ? 0 : 2) + (0 == o3 ? 0 : 4), depth: a2, frames: [] }, c2 = (i3 + o3) * a2, u = c2 * t3;
    for (let i4 = 0; i4 < e4.length; i4++) l2.frames.push({ rect: { x: 0, y: 0, width: t3, height: r3 }, img: new Uint8Array(e4[i4]), blend: 0, dispose: 1, bpp: Math.ceil(c2 / 8), bpl: Math.ceil(u / 8) });
    return compressPNG(l2, 0, true), _main(l2, t3, r3, s2, f2);
  }, UPNG.encode.compress = compress2, UPNG.encode.dither = dither, UPNG.quantize = quantize, UPNG.quantize.getKDtree = getKDtree, UPNG.quantize.getNearest = getNearest;
})();
var r = { toArrayBuffer(e3, t2) {
  const i2 = e3.width, o2 = e3.height, a2 = i2 << 2, s2 = e3.getContext("2d").getImageData(0, 0, i2, o2), f2 = new Uint32Array(s2.data.buffer), l2 = (32 * i2 + 31) / 32 << 2, c2 = l2 * o2, u = 122 + c2, h = new ArrayBuffer(u), d = new DataView(h), A = 1 << 20;
  let g, p, m, w, v = A, b = 0, y = 0, E = 0;
  function set16(e4) {
    d.setUint16(y, e4, true), y += 2;
  }
  function set32(e4) {
    d.setUint32(y, e4, true), y += 4;
  }
  function seek(e4) {
    y += e4;
  }
  set16(19778), set32(u), seek(4), set32(122), set32(108), set32(i2), set32(-o2 >>> 0), set16(1), set16(32), set32(3), set32(c2), set32(2835), set32(2835), seek(8), set32(16711680), set32(65280), set32(255), set32(4278190080), set32(1466527264), (function convert() {
    for (; b < o2 && v > 0; ) {
      for (w = 122 + b * l2, g = 0; g < a2; ) v--, p = f2[E++], m = p >>> 24, d.setUint32(w + g, p << 8 | m), g += 4;
      b++;
    }
    E < f2.length ? (v = A, setTimeout(convert, r._dly)) : t2(h);
  })();
}, toBlob(e3, t2) {
  this.toArrayBuffer(e3, ((e4) => {
    t2(new Blob([e4], { type: "image/bmp" }));
  }));
}, _dly: 9 };
var i = { CHROME: "CHROME", FIREFOX: "FIREFOX", DESKTOP_SAFARI: "DESKTOP_SAFARI", IE: "IE", IOS: "IOS", ETC: "ETC" };
var o = { [i.CHROME]: 16384, [i.FIREFOX]: 11180, [i.DESKTOP_SAFARI]: 16384, [i.IE]: 8192, [i.IOS]: 4096, [i.ETC]: 8192 };
var a = "undefined" != typeof window;
var s = "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope;
var f = a && window.cordova && window.cordova.require && window.cordova.require("cordova/modulemapper");
var CustomFile = (a || s) && (f && f.getOriginalSymbol(window, "File") || "undefined" != typeof File && File);
var CustomFileReader = (a || s) && (f && f.getOriginalSymbol(window, "FileReader") || "undefined" != typeof FileReader && FileReader);
function getFilefromDataUrl(e3, t2, r2 = Date.now()) {
  return new Promise(((i2) => {
    const o2 = e3.split(","), a2 = o2[0].match(/:(.*?);/)[1], s2 = globalThis.atob(o2[1]);
    let f2 = s2.length;
    const l2 = new Uint8Array(f2);
    for (; f2--; ) l2[f2] = s2.charCodeAt(f2);
    const c2 = new Blob([l2], { type: a2 });
    c2.name = t2, c2.lastModified = r2, i2(c2);
  }));
}
function getDataUrlFromFile(e3) {
  return new Promise(((t2, r2) => {
    const i2 = new CustomFileReader();
    i2.onload = () => t2(i2.result), i2.onerror = (e4) => r2(e4), i2.readAsDataURL(e3);
  }));
}
function loadImage5(e3) {
  return new Promise(((t2, r2) => {
    const i2 = new Image();
    i2.onload = () => t2(i2), i2.onerror = (e4) => r2(e4), i2.src = e3;
  }));
}
function getBrowserName() {
  if (void 0 !== getBrowserName.cachedResult) return getBrowserName.cachedResult;
  let e3 = i.ETC;
  const { userAgent: t2 } = navigator;
  return /Chrom(e|ium)/i.test(t2) ? e3 = i.CHROME : /iP(ad|od|hone)/i.test(t2) && /WebKit/i.test(t2) ? e3 = i.IOS : /Safari/i.test(t2) ? e3 = i.DESKTOP_SAFARI : /Firefox/i.test(t2) ? e3 = i.FIREFOX : (/MSIE/i.test(t2) || true == !!document.documentMode) && (e3 = i.IE), getBrowserName.cachedResult = e3, getBrowserName.cachedResult;
}
function approximateBelowMaximumCanvasSizeOfBrowser(e3, t2) {
  const r2 = getBrowserName(), i2 = o[r2];
  let a2 = e3, s2 = t2, f2 = a2 * s2;
  const l2 = a2 > s2 ? s2 / a2 : a2 / s2;
  for (; f2 > i2 * i2; ) {
    const e4 = (i2 + a2) / 2, t3 = (i2 + s2) / 2;
    e4 < t3 ? (s2 = t3, a2 = t3 * l2) : (s2 = e4 * l2, a2 = e4), f2 = a2 * s2;
  }
  return { width: a2, height: s2 };
}
function getNewCanvasAndCtx(e3, t2) {
  let r2, i2;
  try {
    if (r2 = new OffscreenCanvas(e3, t2), i2 = r2.getContext("2d"), null === i2) throw new Error("getContext of OffscreenCanvas returns null");
  } catch (e4) {
    r2 = document.createElement("canvas"), i2 = r2.getContext("2d");
  }
  return r2.width = e3, r2.height = t2, [r2, i2];
}
function drawImageInCanvas(e3, t2) {
  const { width: r2, height: i2 } = approximateBelowMaximumCanvasSizeOfBrowser(e3.width, e3.height), [o2, a2] = getNewCanvasAndCtx(r2, i2);
  return t2 && /jpe?g/.test(t2) && (a2.fillStyle = "white", a2.fillRect(0, 0, o2.width, o2.height)), a2.drawImage(e3, 0, 0, o2.width, o2.height), o2;
}
function isIOS3() {
  return void 0 !== isIOS3.cachedResult || (isIOS3.cachedResult = ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "undefined" != typeof document && "ontouchend" in document), isIOS3.cachedResult;
}
function drawFileInCanvas(e3, t2 = {}) {
  return new Promise((function(r2, o2) {
    let a2, s2;
    var $Try_2_Post = function() {
      try {
        return s2 = drawImageInCanvas(a2, t2.fileType || e3.type), r2([a2, s2]);
      } catch (e4) {
        return o2(e4);
      }
    }, $Try_2_Catch = function(t3) {
      try {
        0;
        var $Try_3_Catch = function(e4) {
          try {
            throw e4;
          } catch (e5) {
            return o2(e5);
          }
        };
        try {
          let t4;
          return getDataUrlFromFile(e3).then((function(e4) {
            try {
              return t4 = e4, loadImage5(t4).then((function(e5) {
                try {
                  return a2 = e5, (function() {
                    try {
                      return $Try_2_Post();
                    } catch (e6) {
                      return o2(e6);
                    }
                  })();
                } catch (e6) {
                  return $Try_3_Catch(e6);
                }
              }), $Try_3_Catch);
            } catch (e5) {
              return $Try_3_Catch(e5);
            }
          }), $Try_3_Catch);
        } catch (e4) {
          $Try_3_Catch(e4);
        }
      } catch (e4) {
        return o2(e4);
      }
    };
    try {
      if (isIOS3() || [i.DESKTOP_SAFARI, i.MOBILE_SAFARI].includes(getBrowserName())) throw new Error("Skip createImageBitmap on IOS and Safari");
      return createImageBitmap(e3).then((function(e4) {
        try {
          return a2 = e4, $Try_2_Post();
        } catch (e5) {
          return $Try_2_Catch();
        }
      }), $Try_2_Catch);
    } catch (e4) {
      $Try_2_Catch();
    }
  }));
}
function canvasToFile(e3, t2, i2, o2, a2 = 1) {
  return new Promise((function(s2, f2) {
    let l2;
    if ("image/png" === t2) {
      let c2, u, h;
      return c2 = e3.getContext("2d"), { data: u } = c2.getImageData(0, 0, e3.width, e3.height), h = UPNG.encode([u.buffer], e3.width, e3.height, 4096 * a2), l2 = new Blob([h], { type: t2 }), l2.name = i2, l2.lastModified = o2, $If_4.call(this);
    }
    {
      let $If_52 = function() {
        return $If_4.call(this);
      };
      if ("image/bmp" === t2) return new Promise(((t3) => r.toBlob(e3, t3))).then(function(e4) {
        try {
          return l2 = e4, l2.name = i2, l2.lastModified = o2, $If_52.call(this);
        } catch (e5) {
          return f2(e5);
        }
      }.bind(this), f2);
      {
        let $If_62 = function() {
          return $If_52.call(this);
        };
        if ("function" == typeof OffscreenCanvas && e3 instanceof OffscreenCanvas) return e3.convertToBlob({ type: t2, quality: a2 }).then(function(e4) {
          try {
            return l2 = e4, l2.name = i2, l2.lastModified = o2, $If_62.call(this);
          } catch (e5) {
            return f2(e5);
          }
        }.bind(this), f2);
        {
          let d;
          return d = e3.toDataURL(t2, a2), getFilefromDataUrl(d, i2, o2).then(function(e4) {
            try {
              return l2 = e4, $If_62.call(this);
            } catch (e5) {
              return f2(e5);
            }
          }.bind(this), f2);
        }
      }
    }
    function $If_4() {
      return s2(l2);
    }
  }));
}
function cleanupCanvasMemory(e3) {
  e3.width = 0, e3.height = 0;
}
function isAutoOrientationInBrowser() {
  return new Promise((function(e3, t2) {
    let i2, o2, a2, s2;
    return void 0 !== isAutoOrientationInBrowser.cachedResult ? e3(isAutoOrientationInBrowser.cachedResult) : (getFilefromDataUrl("data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/xABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==", "test.jpg", Date.now()).then((function(r3) {
      try {
        return i2 = r3, drawFileInCanvas(i2).then((function(r4) {
          try {
            return o2 = r4[1], canvasToFile(o2, i2.type, i2.name, i2.lastModified).then((function(r5) {
              try {
                return a2 = r5, cleanupCanvasMemory(o2), drawFileInCanvas(a2).then((function(r6) {
                  try {
                    return s2 = r6[0], isAutoOrientationInBrowser.cachedResult = 1 === s2.width && 2 === s2.height, e3(isAutoOrientationInBrowser.cachedResult);
                  } catch (e4) {
                    return t2(e4);
                  }
                }), t2);
              } catch (e4) {
                return t2(e4);
              }
            }), t2);
          } catch (e4) {
            return t2(e4);
          }
        }), t2);
      } catch (e4) {
        return t2(e4);
      }
    }), t2));
  }));
}
function getExifOrientation(e3) {
  return new Promise(((t2, r2) => {
    const i2 = new CustomFileReader();
    i2.onload = (e4) => {
      const r3 = new DataView(e4.target.result);
      if (65496 != r3.getUint16(0, false)) return t2(-2);
      const i3 = r3.byteLength;
      let o2 = 2;
      for (; o2 < i3; ) {
        if (r3.getUint16(o2 + 2, false) <= 8) return t2(-1);
        const e5 = r3.getUint16(o2, false);
        if (o2 += 2, 65505 == e5) {
          if (1165519206 != r3.getUint32(o2 += 2, false)) return t2(-1);
          const e6 = 18761 == r3.getUint16(o2 += 6, false);
          o2 += r3.getUint32(o2 + 4, e6);
          const i4 = r3.getUint16(o2, e6);
          o2 += 2;
          for (let a2 = 0; a2 < i4; a2++) if (274 == r3.getUint16(o2 + 12 * a2, e6)) return t2(r3.getUint16(o2 + 12 * a2 + 8, e6));
        } else {
          if (65280 != (65280 & e5)) break;
          o2 += r3.getUint16(o2, false);
        }
      }
      return t2(-1);
    }, i2.onerror = (e4) => r2(e4), i2.readAsArrayBuffer(e3);
  }));
}
function handleMaxWidthOrHeight(e3, t2) {
  const { width: r2 } = e3, { height: i2 } = e3, { maxWidthOrHeight: o2 } = t2;
  let a2, s2 = e3;
  return isFinite(o2) && (r2 > o2 || i2 > o2) && ([s2, a2] = getNewCanvasAndCtx(r2, i2), r2 > i2 ? (s2.width = o2, s2.height = i2 / r2 * o2) : (s2.width = r2 / i2 * o2, s2.height = o2), a2.drawImage(e3, 0, 0, s2.width, s2.height), cleanupCanvasMemory(e3)), s2;
}
function followExifOrientation(e3, t2) {
  const { width: r2 } = e3, { height: i2 } = e3, [o2, a2] = getNewCanvasAndCtx(r2, i2);
  switch (t2 > 4 && t2 < 9 ? (o2.width = i2, o2.height = r2) : (o2.width = r2, o2.height = i2), t2) {
    case 2:
      a2.transform(-1, 0, 0, 1, r2, 0);
      break;
    case 3:
      a2.transform(-1, 0, 0, -1, r2, i2);
      break;
    case 4:
      a2.transform(1, 0, 0, -1, 0, i2);
      break;
    case 5:
      a2.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      a2.transform(0, 1, -1, 0, i2, 0);
      break;
    case 7:
      a2.transform(0, -1, -1, 0, i2, r2);
      break;
    case 8:
      a2.transform(0, -1, 1, 0, 0, r2);
  }
  return a2.drawImage(e3, 0, 0, r2, i2), cleanupCanvasMemory(e3), o2;
}
function compress(e3, t2, r2 = 0) {
  return new Promise((function(i2, o2) {
    let a2, s2, f2, l2, c2, u, h, d, A, g, p, m, w, v, b, y, E, F, _, B;
    function incProgress(e4 = 5) {
      if (t2.signal && t2.signal.aborted) throw t2.signal.reason;
      a2 += e4, t2.onProgress(Math.min(a2, 100));
    }
    function setProgress(e4) {
      if (t2.signal && t2.signal.aborted) throw t2.signal.reason;
      a2 = Math.min(Math.max(e4, a2), 100), t2.onProgress(a2);
    }
    return a2 = r2, s2 = t2.maxIteration || 10, f2 = 1024 * t2.maxSizeMB * 1024, incProgress(), drawFileInCanvas(e3, t2).then(function(r3) {
      try {
        return [, l2] = r3, incProgress(), c2 = handleMaxWidthOrHeight(l2, t2), incProgress(), new Promise((function(r4, i3) {
          var o3;
          if (!(o3 = t2.exifOrientation)) return getExifOrientation(e3).then(function(e4) {
            try {
              return o3 = e4, $If_2.call(this);
            } catch (e5) {
              return i3(e5);
            }
          }.bind(this), i3);
          function $If_2() {
            return r4(o3);
          }
          return $If_2.call(this);
        })).then(function(r4) {
          try {
            return u = r4, incProgress(), isAutoOrientationInBrowser().then(function(r5) {
              try {
                return h = r5 ? c2 : followExifOrientation(c2, u), incProgress(), d = t2.initialQuality || 1, A = t2.fileType || e3.type, canvasToFile(h, A, e3.name, e3.lastModified, d).then(function(r6) {
                  try {
                    {
                      let $Loop_32 = function() {
                        if (s2-- && (b > f2 || b > w)) {
                          let t3, r7;
                          return t3 = B ? 0.95 * _.width : _.width, r7 = B ? 0.95 * _.height : _.height, [E, F] = getNewCanvasAndCtx(t3, r7), F.drawImage(_, 0, 0, t3, r7), d *= "image/png" === A ? 0.85 : 0.95, canvasToFile(E, A, e3.name, e3.lastModified, d).then((function(e4) {
                            try {
                              return y = e4, cleanupCanvasMemory(_), _ = E, b = y.size, setProgress(Math.min(99, Math.floor((v - b) / (v - f2) * 100))), $Loop_32;
                            } catch (e5) {
                              return o2(e5);
                            }
                          }), o2);
                        }
                        return [1];
                      }, $Loop_3_exit2 = function() {
                        return cleanupCanvasMemory(_), cleanupCanvasMemory(E), cleanupCanvasMemory(c2), cleanupCanvasMemory(h), cleanupCanvasMemory(l2), setProgress(100), i2(y);
                      };
                      var $Loop_3 = $Loop_32, $Loop_3_exit = $Loop_3_exit2;
                      if (g = r6, incProgress(), p = g.size > f2, m = g.size > e3.size, !p && !m) return setProgress(100), i2(g);
                      var a3;
                      return w = e3.size, v = g.size, b = v, _ = h, B = !t2.alwaysKeepResolution && p, (a3 = function(e4) {
                        for (; e4; ) {
                          if (e4.then) return void e4.then(a3, o2);
                          try {
                            if (e4.pop) {
                              if (e4.length) return e4.pop() ? $Loop_3_exit2.call(this) : e4;
                              e4 = $Loop_32;
                            } else e4 = e4.call(this);
                          } catch (e5) {
                            return o2(e5);
                          }
                        }
                      }.bind(this))($Loop_32);
                    }
                  } catch (u2) {
                    return o2(u2);
                  }
                }.bind(this), o2);
              } catch (e4) {
                return o2(e4);
              }
            }.bind(this), o2);
          } catch (e4) {
            return o2(e4);
          }
        }.bind(this), o2);
      } catch (e4) {
        return o2(e4);
      }
    }.bind(this), o2);
  }));
}
var l = "\nlet scriptImported = false\nself.addEventListener('message', async (e) => {\n  const { file, id, imageCompressionLibUrl, options } = e.data\n  options.onProgress = (progress) => self.postMessage({ progress, id })\n  try {\n    if (!scriptImported) {\n      // console.log('[worker] importScripts', imageCompressionLibUrl)\n      self.importScripts(imageCompressionLibUrl)\n      scriptImported = true\n    }\n    // console.log('[worker] self', self)\n    const compressedFile = await imageCompression(file, options)\n    self.postMessage({ file: compressedFile, id })\n  } catch (e) {\n    // console.error('[worker] error', e)\n    self.postMessage({ error: e.message + '\\n' + e.stack, id })\n  }\n})\n";
var c;
function compressOnWebWorker(e3, t2) {
  return new Promise(((r2, i2) => {
    c || (c = (function createWorkerScriptURL(e4) {
      const t3 = [];
      return t3.push(e4), URL.createObjectURL(new Blob(t3));
    })(l));
    const o2 = new Worker(c);
    o2.addEventListener("message", (function handler(e4) {
      if (t2.signal && t2.signal.aborted) o2.terminate();
      else if (void 0 === e4.data.progress) {
        if (e4.data.error) return i2(new Error(e4.data.error)), void o2.terminate();
        r2(e4.data.file), o2.terminate();
      } else t2.onProgress(e4.data.progress);
    })), o2.addEventListener("error", i2), t2.signal && t2.signal.addEventListener("abort", (() => {
      i2(t2.signal.reason), o2.terminate();
    })), o2.postMessage({ file: e3, imageCompressionLibUrl: t2.libURL, options: { ...t2, onProgress: void 0, signal: void 0 } });
  }));
}
function imageCompression(e3, t2) {
  return new Promise((function(r2, i2) {
    let o2, a2, s2, f2, l2, c2;
    if (o2 = { ...t2 }, s2 = 0, { onProgress: f2 } = o2, o2.maxSizeMB = o2.maxSizeMB || Number.POSITIVE_INFINITY, l2 = "boolean" != typeof o2.useWebWorker || o2.useWebWorker, delete o2.useWebWorker, o2.onProgress = (e4) => {
      s2 = e4, "function" == typeof f2 && f2(s2);
    }, !(e3 instanceof Blob || e3 instanceof CustomFile)) return i2(new Error("The file given is not an instance of Blob or File"));
    if (!/^image/.test(e3.type)) return i2(new Error("The file given is not an image"));
    if (c2 = "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope, !l2 || "function" != typeof Worker || c2) return compress(e3, o2).then(function(e4) {
      try {
        return a2 = e4, $If_4.call(this);
      } catch (e5) {
        return i2(e5);
      }
    }.bind(this), i2);
    var u = function() {
      try {
        return $If_4.call(this);
      } catch (e4) {
        return i2(e4);
      }
    }.bind(this), $Try_1_Catch = function(t3) {
      try {
        return compress(e3, o2).then((function(e4) {
          try {
            return a2 = e4, u();
          } catch (e5) {
            return i2(e5);
          }
        }), i2);
      } catch (e4) {
        return i2(e4);
      }
    };
    try {
      return o2.libURL = o2.libURL || "https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js", compressOnWebWorker(e3, o2).then((function(e4) {
        try {
          return a2 = e4, u();
        } catch (e5) {
          return $Try_1_Catch();
        }
      }), $Try_1_Catch);
    } catch (e4) {
      $Try_1_Catch();
    }
    function $If_4() {
      try {
        a2.name = e3.name, a2.lastModified = e3.lastModified;
      } catch (e4) {
      }
      try {
        o2.preserveExif && "image/jpeg" === e3.type && (!o2.fileType || o2.fileType && o2.fileType === e3.type) && (a2 = copyExifWithoutOrientation(e3, a2));
      } catch (e4) {
      }
      return r2(a2);
    }
  }));
}
imageCompression.getDataUrlFromFile = getDataUrlFromFile, imageCompression.getFilefromDataUrl = getFilefromDataUrl, imageCompression.loadImage = loadImage5, imageCompression.drawImageInCanvas = drawImageInCanvas, imageCompression.drawFileInCanvas = drawFileInCanvas, imageCompression.canvasToFile = canvasToFile, imageCompression.getExifOrientation = getExifOrientation, imageCompression.handleMaxWidthOrHeight = handleMaxWidthOrHeight, imageCompression.followExifOrientation = followExifOrientation, imageCompression.cleanupCanvasMemory = cleanupCanvasMemory, imageCompression.isAutoOrientationInBrowser = isAutoOrientationInBrowser, imageCompression.approximateBelowMaximumCanvasSizeOfBrowser = approximateBelowMaximumCanvasSizeOfBrowser, imageCompression.copyExifWithoutOrientation = copyExifWithoutOrientation, imageCompression.getBrowserName = getBrowserName, imageCompression.version = "2.0.2";
registerPlugin(
  filepond_plugin_file_validate_size_esm_default,
  filepond_plugin_file_validate_type_esm_default,
  filepond_plugin_image_exif_orientation_esm_default,
  filepond_plugin_image_preview_esm_default,
  filepond_plugin_image_crop_esm_default,
  filepond_plugin_image_resize_esm_default,
  filepond_plugin_image_transform_esm_default,
  filepond_plugin_image_edit_esm_default
);
var DEFAULT_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/tiff",
  "image/heic",
  "image/avif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-msvideo",
  "video/quicktime"
];
var DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp"
};
var isImageType = (type) => ["png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "bmp", "tiff", "heic", "image"].some(
  (t2) => type?.toLowerCase().includes(t2)
);
var getFileExtension = (filename) => {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop() || "").toUpperCase() : "";
};
var MediaTile = ({
  file: file2,
  onRemove,
  readOnly
}) => {
  const ext = getFileExtension(file2.name);
  const displayName = file2.meta?.originalName || file2.name;
  const isReference = file2.type === "image/reference";
  return /* @__PURE__ */ jsxs("div", { className: "tecof-media-tile", title: displayName, children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-media-tile-preview", children: [
      isReference ? /* @__PURE__ */ jsx("div", { className: "tecof-media-tile-ref", children: /* @__PURE__ */ jsx(Code, { size: 18 }) }) : isImageType(file2.type) ? /* @__PURE__ */ jsx(
        TecofPicture,
        {
          data: file2,
          alt: displayName,
          size: "thumbnail",
          className: "tecof-media-tile-img"
        }
      ) : /* @__PURE__ */ jsxs("div", { className: "tecof-media-tile-file", children: [
        /* @__PURE__ */ jsx(FileIcon, { size: 20 }),
        ext && /* @__PURE__ */ jsx("span", { className: "tecof-media-tile-ext", children: ext })
      ] }),
      !readOnly && onRemove && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "tecof-media-tile-remove",
          onClick: onRemove,
          title: "Kald\u0131r",
          children: /* @__PURE__ */ jsx(X, { size: 13 })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("span", { className: "tecof-media-tile-caption", children: displayName })
  ] });
};
var FILEPOND_LABELS = {
  labelIdle: 'Dosyan\u0131z\u0131 s\xFCr\xFCkleyip b\u0131rak\u0131n veya <span class="filepond--label-action">dosya se\xE7in</span>',
  labelInvalidField: "Ge\xE7ersiz dosya alan\u0131",
  labelFileWaitingForSize: "Boyut al\u0131n\u0131yor",
  labelFileSizeNotAvailable: "Boyut mevcut de\u011Fil",
  labelFileLoading: "Y\xFCkleniyor",
  labelFileLoadError: "Y\xFCkleme hatas\u0131",
  labelFileProcessing: "Y\xFCkleniyor...",
  labelFileProcessingComplete: "Y\xFCkleme tamamland\u0131",
  labelFileProcessingAborted: "Y\xFCkleme iptal edildi",
  labelFileProcessingError: "Y\xFCkleme hatas\u0131",
  labelFileProcessingRevertError: "Geri alma hatas\u0131",
  labelFileRemoveError: "Silme hatas\u0131",
  labelTapToCancel: "\u0130ptal etmek i\xE7in t\u0131klay\u0131n",
  labelTapToRetry: "Yeniden denemek i\xE7in t\u0131klay\u0131n",
  labelTapToUndo: "Geri almak i\xE7in t\u0131klay\u0131n",
  labelButtonRemoveItem: "Kald\u0131r",
  labelButtonAbortItemLoad: "\u0130ptal",
  labelButtonRetryItemLoad: "Yeniden Dene",
  labelButtonAbortItemProcessing: "\u0130ptal",
  labelButtonUndoItemProcessing: "Geri Al",
  labelButtonRetryItemProcessing: "Yeniden Dene",
  labelButtonProcessItem: "Y\xFCkle",
  labelMaxFileSizeExceeded: "Dosya \xE7ok b\xFCy\xFCk",
  labelMaxFileSize: "Maksimum dosya boyutu: {filesize}",
  labelMaxTotalFileSizeExceeded: "Toplam dosya boyutu a\u015F\u0131ld\u0131",
  labelMaxTotalFileSize: "Toplam dosya boyutu en fazla {filesize}",
  labelFileTypeNotAllowed: "Bu dosya t\xFCr\xFCne izin verilmiyor",
  fileValidateTypeLabelExpectedTypes: "Desteklenen t\xFCrler: {allButLastType} ya da {lastType}"
};
var DOKA_LABELS = {
  // Ana Butonlar
  labelButtonReset: "S\u0131f\u0131rla",
  labelButtonCancel: "\u0130ptal",
  labelButtonConfirm: "Tamam",
  // Araç Butonları
  labelButtonUtilCrop: "K\u0131rp",
  labelButtonUtilResize: "Yeniden Boyutland\u0131r",
  labelButtonUtilFilter: "Filtrele",
  labelButtonUtilColor: "Renkler",
  labelButtonUtilMarkup: "\u0130\u015Faretle",
  labelButtonUtilSticker: "\xC7\u0131kartma",
  // Durum Mesajları
  labelStatusMissingWebGL: "WebGL gerekli fakat taray\u0131c\u0131n\u0131zda devre d\u0131\u015F\u0131 b\u0131rak\u0131lm\u0131\u015F",
  labelStatusAwaitingImage: "G\xF6rsel bekleniyor\u2026",
  labelStatusLoadImageError: "G\xF6rsel y\xFCklenirken bir hata olu\u015Ftu\u2026",
  labelStatusLoadingImage: "G\xF6rsel y\xFCkleniyor\u2026",
  labelStatusProcessingImage: "G\xF6rsel i\u015Fleniyor\u2026",
  // Renk Ayarları
  labelColorBrightness: "Parlakl\u0131k",
  labelColorContrast: "Kontrast",
  labelColorExposure: "Pozlama",
  labelColorSaturation: "Doygunluk",
  // Kırpma (Crop) Aracı
  labelCropInstructionZoom: "Fare tekerle\u011Fi veya dokunmatik y\xFCzey ile yak\u0131nla\u015Ft\u0131r\u0131p uzakla\u015Ft\u0131r\u0131n.",
  labelButtonCropZoom: "Yak\u0131nla\u015Ft\u0131r",
  labelButtonCropRotateLeft: "Sola D\xF6nd\xFCr",
  labelButtonCropRotateRight: "Sa\u011Fa D\xF6nd\xFCr",
  labelButtonCropRotateCenter: "D\xF6nd\xFCrmeyi Ortala",
  labelButtonCropFlipHorizontal: "Yatay \xC7evir",
  labelButtonCropFlipVertical: "Dikey \xC7evir",
  labelButtonCropAspectRatio: "En Boy Oran\u0131",
  labelButtonCropToggleLimit: "K\u0131rpma S\u0131n\u0131r\u0131",
  labelButtonCropToggleLimitEnable: "G\xF6r\xFCnt\xFC ile S\u0131n\u0131rl\u0131",
  labelButtonCropToggleLimitDisable: "G\xF6r\xFCnt\xFC D\u0131\u015F\u0131n\u0131 Se\xE7",
  // İşaretleme (Markup) Aracı
  labelMarkupTypeRectangle: "Kare",
  labelMarkupTypeEllipse: "Daire",
  labelMarkupTypeText: "Metin",
  labelMarkupTypeLine: "Ok",
  labelMarkupSelectFontSize: "Boyut",
  labelMarkupSelectFontFamily: "Yaz\u0131 Tipi",
  labelMarkupSelectLineDecoration: "S\xFCsleme",
  labelMarkupSelectLineStyle: "Stil",
  labelMarkupSelectShapeStyle: "Stil",
  labelMarkupRemoveShape: "Kald\u0131r",
  labelMarkupToolSelect: "Se\xE7",
  labelMarkupToolDraw: "\xC7iz",
  labelMarkupToolLine: "Ok",
  labelMarkupToolText: "Metin",
  labelMarkupToolRect: "Kare",
  labelMarkupToolEllipse: "Daire",
  // Yeniden Boyutlandırma (Resize) Aracı
  labelResizeWidth: "Geni\u015Flik",
  labelResizeHeight: "Y\xFCkseklik",
  labelResizeApplyChanges: "Uygula"
};
var UploadFieldImpl = ({
  value: rawValue = [],
  onChange,
  allowMultiple = true,
  maxFiles = 100,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = "100MB",
  maxTotalFileSize = "200MB",
  folder = "/",
  readOnly,
  imagePreviewHeight = 256,
  allowReorder = true,
  imageCompressionEnabled = true,
  imageCompressionOptions = DEFAULT_COMPRESSION_OPTIONS
}) => {
  let value = [];
  if (Array.isArray(rawValue)) {
    value = rawValue;
  } else if (typeof rawValue === "string" && rawValue) {
    value = [{ _id: "legacy", name: rawValue, size: 0, type: "image/jpeg" }];
  } else if (rawValue && typeof rawValue === "object") {
    value = [rawValue];
  }
  const { apiUrl, secretKey } = useTecof();
  const [filesForPond, setFilesForPond] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refCode, setRefCode] = useState("{{ data. }}");
  const sourceToIdRef = useRef(/* @__PURE__ */ new Map());
  const compressFile = useCallback(async (file2) => {
    if (!imageCompressionEnabled) return file2;
    if (!file2.type?.startsWith("image/")) return file2;
    if (file2.type === "image/svg+xml" || file2.type === "image/gif") return file2;
    try {
      const compressed = await imageCompression(file2, imageCompressionOptions);
      return compressed;
    } catch (err) {
      console.warn("Image compression failed, uploading original:", err);
      return file2;
    }
  }, [imageCompressionEnabled, imageCompressionOptions]);
  const handlePondProcess = useCallback((error2, file2) => {
    if (error2) return;
    try {
      const fileMeta = typeof file2.serverId === "string" ? JSON.parse(file2.serverId) : file2.serverId;
      if (!fileMeta?._id) return;
      if (file2.source) {
        sourceToIdRef.current.set(file2.source, fileMeta._id);
      }
      const updated = allowMultiple ? [...value, fileMeta] : [fileMeta];
      onChange(updated);
      setTimeout(() => setFilesForPond([]), 600);
      if (!allowMultiple) setDrawerOpen(false);
    } catch (e3) {
      console.error("FilePond upload parse error:", e3);
    }
  }, [value, onChange, allowMultiple]);
  const handleRemove = useCallback((idx) => {
    const removedFile = value[idx];
    if (removedFile?._id) {
      sourceToIdRef.current.forEach((id, source) => {
        if (id === removedFile._id) sourceToIdRef.current.delete(source);
      });
    }
    const updated = [...value];
    updated.splice(idx, 1);
    onChange(updated);
  }, [value, onChange]);
  const handleAddRef = useCallback(() => {
    if (!refCode.trim()) return;
    const refFile = {
      _id: `ref_${Date.now()}`,
      name: refCode.trim(),
      size: 0,
      type: "image/reference",
      meta: { originalName: refCode.trim(), isReference: true }
    };
    const updated = allowMultiple ? [...value, refFile] : [refFile];
    onChange(updated);
    setRefCode("{{ data. }}");
    if (!allowMultiple) setDrawerOpen(false);
  }, [refCode, allowMultiple, value, onChange]);
  const toggleGalleryFile = useCallback((file2) => {
    if (allowMultiple) {
      const exists = value.some((f2) => f2._id === file2._id);
      if (exists) {
        onChange(value.filter((f2) => f2._id !== file2._id));
      } else {
        onChange([...value, file2]);
      }
    } else {
      onChange([file2]);
      setDrawerOpen(false);
    }
  }, [value, onChange, allowMultiple]);
  const serverConfig = {
    process: (fieldName, file2, metadata, load, error2, progress, abort) => {
      const controller = new AbortController();
      (async () => {
        try {
          const finalFile = await compressFile(file2);
          const formData = new FormData();
          formData.append("files", finalFile, finalFile.name || file2.name);
          const url = folder ? `${apiUrl}/api/store/upload?folder=${encodeURIComponent(folder)}` : `${apiUrl}/api/store/upload`;
          const res2 = await fetch(url, {
            method: "POST",
            headers: {
              "x-secret-key": secretKey,
              Accept: "application/json"
            },
            body: formData,
            signal: controller.signal
          });
          const json = await res2.json();
          if (!json.success) throw new Error(json.message || "Upload failed");
          const fileData = json.data?.[0];
          if (!fileData?._id) throw new Error("Sunucu yan\u0131t\u0131nda dosya bilgisi bulunamad\u0131");
          load(JSON.stringify({
            _id: fileData._id,
            name: fileData.name,
            size: fileData.size,
            type: fileData.type || "application/octet-stream",
            meta: fileData.meta || {}
          }));
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Upload error:", err);
            error2("Y\xFCkleme hatas\u0131");
          }
        }
      })();
      return {
        abort: () => {
          controller.abort();
          abort();
        }
      };
    },
    load: (source, load, error2, _progress, abort) => {
      const request = new XMLHttpRequest();
      request.open("GET", source);
      request.responseType = "blob";
      request.onload = () => load(request.response);
      request.onerror = () => error2("Dosya y\xFCklenemedi");
      request.send();
      return {
        abort: () => {
          request.abort();
          abort();
        }
      };
    }
  };
  const canAddMore = allowMultiple ? value.length < maxFiles : value.length === 0;
  const uploadTab = {
    id: "upload",
    label: "Y\xFCkle",
    icon: /* @__PURE__ */ jsx(Upload, { size: 14 }),
    render: () => /* @__PURE__ */ jsx("div", { className: "tecof-media-upload-panel", children: /* @__PURE__ */ jsx(
      FilePond,
      {
        files: filesForPond,
        onupdatefiles: setFilesForPond,
        onprocessfile: handlePondProcess,
        allowMultiple,
        maxFiles: maxFiles - value.length,
        maxFileSize,
        maxTotalFileSize,
        acceptedFileTypes: acceptedTypes,
        allowReorder,
        imagePreviewHeight,
        imageResizeMode: "contain",
        imageEditEditor: create$12(DOKA_LABELS),
        server: serverConfig,
        name: "files",
        credits: false,
        ...FILEPOND_LABELS
      }
    ) })
  };
  const referenceTab = {
    id: "reference",
    label: "Referans",
    icon: /* @__PURE__ */ jsx(Code, { size: 14 }),
    render: () => /* @__PURE__ */ jsxs("div", { className: "tecof-media-ref-panel", children: [
      /* @__PURE__ */ jsx("p", { className: "tecof-media-ref-desc", children: "CMS koleksiyonundan dinamik bir g\xF6rsel de\u011Fi\u015Fkeni ba\u011Flay\u0131n." }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-upload-ref-row", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: refCode,
            onChange: (e3) => setRefCode(e3.target.value),
            placeholder: "{{ data. }}",
            className: "tecof-upload-ref-input",
            onKeyDown: (e3) => {
              if (e3.key === "Enter") {
                e3.preventDefault();
                handleAddRef();
              }
            }
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: handleAddRef, className: "tecof-upload-ref-add", children: "Ekle" })
      ] })
    ] })
  };
  return /* @__PURE__ */ jsxs("div", { className: "tecof-upload-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-media-grid", children: [
      value.map((file2, idx) => /* @__PURE__ */ jsx(
        MediaTile,
        {
          file: file2,
          readOnly,
          onRemove: readOnly ? void 0 : () => handleRemove(idx)
        },
        file2._id || idx
      )),
      !readOnly && canAddMore && /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: `tecof-media-add-tile${value.length === 0 ? " is-empty" : ""}`,
          onClick: () => setDrawerOpen(true),
          children: [
            /* @__PURE__ */ jsx(ImagePlus, { size: value.length === 0 ? 22 : 18 }),
            /* @__PURE__ */ jsx("span", { children: value.length === 0 ? "Medya ekle" : "Ekle" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      MediaDrawer,
      {
        open: drawerOpen,
        onOpenChange: setDrawerOpen,
        onSelect: toggleGalleryFile,
        selectedIds: value.map((v) => v._id ?? ""),
        allowMultiple,
        filterImages: acceptedTypes.length > 0 && acceptedTypes.every((t2) => t2.startsWith("image/")),
        title: "Medya",
        extraTabs: readOnly ? [] : [uploadTab, referenceTab]
      }
    )
  ] });
};
var UploadField_impl_default = UploadFieldImpl;
/*!
 * Doka Image Editor 6.16.1
 * (c) 2018-2020 PQINA Inc. - All Rights Reserved
 * License: https://pqina.nl/doka/license/
 */
/*! Bundled license information:

filepond/dist/filepond.esm.js:
  (*!
   * FilePond 4.32.12
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)

react-filepond/dist/react-filepond.esm.js:
  (*!
   * react-filepond v7.1.3
   * A handy FilePond adapter component for React
   * 
   * Copyright (c) 2024 PQINA
   * https://pqina.nl/filepond
   * 
   * Licensed under the MIT license.
   *)

filepond-plugin-file-validate-size/dist/filepond-plugin-file-validate-size.esm.js:
  (*!
   * FilePondPluginFileValidateSize 2.2.8
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)

filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js:
  (*!
   * FilePondPluginFileValidateType 1.2.9
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)

filepond-plugin-image-exif-orientation/dist/filepond-plugin-image-exif-orientation.esm.js:
  (*!
   * FilePondPluginImageExifOrientation 1.0.11
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)

filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js:
  (*!
   * FilePondPluginImagePreview 4.6.12
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)

filepond-plugin-image-crop/dist/filepond-plugin-image-crop.esm.js:
  (*!
   * FilePondPluginImageCrop 2.0.6
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)

filepond-plugin-image-resize/dist/filepond-plugin-image-resize.esm.js:
  (*!
   * FilePondPluginImageResize 2.0.10
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)

filepond-plugin-image-transform/dist/filepond-plugin-image-transform.esm.js:
  (*!
   * FilePondPluginImageTransform 3.8.7
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)

filepond-plugin-image-edit/dist/filepond-plugin-image-edit.esm.js:
  (*!
   * FilePondPluginImageEdit 1.6.3
   * Licensed under MIT, https://opensource.org/licenses/MIT/
   * Please visit https://pqina.nl/filepond/ for details.
   *)
*/

export { UploadField_impl_default as default };
//# sourceMappingURL=UploadField.impl-PPKSM2UJ.mjs.map
//# sourceMappingURL=UploadField.impl-PPKSM2UJ.mjs.map