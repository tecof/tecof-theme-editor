export { UnderConstruction } from './chunk-XMQYB77V.mjs';
import { FieldLoading, FieldErrorBoundary, FieldLabel, LanguageProvider, useLanguages, useActiveLanguage, LanguageTabBar } from './chunk-JUFEDW3Y.mjs';
export { FieldErrorBoundary, LanguageField, createLanguageField } from './chunk-JUFEDW3Y.mjs';
import { lucide_react_exports, Database, X, RotateCcw, useTecof, PanelLeft, PanelRight, FileText, Globe, ExternalLink, Pencil, Link, Drawer, Search, ChevronRight, Plus, RefreshCw, ChevronDown, Link2, RefreshCcw, Check, Pipette, Monitor, Tablet, Smartphone, Eye, Undo2, Redo2, Save, Grid3x3, Layers, EyeOff, LayoutTemplate, Info, ChevronUp, ArrowUp, ArrowDown, Copy, Trash2, CopyPlus, Scissors, ClipboardPaste, Paintbrush, GripVertical, LayoutGrid, PanelsTopLeft, Braces, ChevronLeft } from './chunk-OUKYABPK.mjs';
export { TecofApiClient, TecofPicture, TecofProvider, useTecof } from './chunk-OUKYABPK.mjs';
import './chunk-J5LGTIGS.mjs';
import React, { createContext, lazy, forwardRef, Suspense, useState, useMemo, useRef, useEffect, useCallback, useContext, useLayoutEffect, Component } from 'react';
import { createPortal } from 'react-dom';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

// node_modules/zustand/esm/vanilla.mjs
var createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
var createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);
var identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = React.useSyncExternalStore(
    api.subscribe,
    React.useCallback(() => selector(api.getState()), [api, selector]),
    React.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  React.useDebugValue(slice);
  return slice;
}
var createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
var create = ((createState) => createState ? createImpl(createState) : createImpl);

// node_modules/immer/dist/immer.mjs
var NOTHING = /* @__PURE__ */ Symbol.for("immer-nothing");
var DRAFTABLE = /* @__PURE__ */ Symbol.for("immer-draftable");
var DRAFT_STATE = /* @__PURE__ */ Symbol.for("immer-state");
var errors = process.env.NODE_ENV !== "production" ? [
  // All error codes, starting by 0:
  function(plugin) {
    return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
  },
  function(thing) {
    return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
  },
  "This object has been frozen and should not be mutated",
  function(data) {
    return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
  },
  "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
  "Immer forbids circular references",
  "The first or second argument to `produce` must be a function",
  "The third argument to `produce` must be a function or undefined",
  "First argument to `createDraft` must be a plain object, an array, or an immerable object",
  "First argument to `finishDraft` must be a draft returned by `createDraft`",
  function(thing) {
    return `'current' expects a draft, got: ${thing}`;
  },
  "Object.defineProperty() cannot be used on an Immer draft",
  "Object.setPrototypeOf() cannot be used on an Immer draft",
  "Immer only supports deleting array indices",
  "Immer only supports setting array indices and the 'length' property",
  function(thing) {
    return `'original' expects a draft, got: ${thing}`;
  }
  // Note: if more errors are added, the errorOffset in Patches.ts should be increased
  // See Patches.ts for additional errors
] : [];
function die(error, ...args) {
  if (process.env.NODE_ENV !== "production") {
    const e = errors[error];
    const msg = isFunction(e) ? e.apply(null, args) : e;
    throw new Error(`[Immer] ${msg}`);
  }
  throw new Error(
    `[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var O = Object;
var getPrototypeOf = O.getPrototypeOf;
var CONSTRUCTOR = "constructor";
var PROTOTYPE = "prototype";
var CONFIGURABLE = "configurable";
var ENUMERABLE = "enumerable";
var WRITABLE = "writable";
var VALUE = "value";
var isDraft = (value) => !!value && !!value[DRAFT_STATE];
function isDraftable(value) {
  if (!value)
    return false;
  return isPlainObject(value) || isArray(value) || !!value[DRAFTABLE] || !!value[CONSTRUCTOR]?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = O[PROTOTYPE][CONSTRUCTOR].toString();
var cachedCtorStrings = /* @__PURE__ */ new WeakMap();
function isPlainObject(value) {
  if (!value || !isObjectish(value))
    return false;
  const proto = getPrototypeOf(value);
  if (proto === null || proto === O[PROTOTYPE])
    return true;
  const Ctor = O.hasOwnProperty.call(proto, CONSTRUCTOR) && proto[CONSTRUCTOR];
  if (Ctor === Object)
    return true;
  if (!isFunction(Ctor))
    return false;
  let ctorString = cachedCtorStrings.get(Ctor);
  if (ctorString === void 0) {
    ctorString = Function.toString.call(Ctor);
    cachedCtorStrings.set(Ctor, ctorString);
  }
  return ctorString === objectCtorString;
}
function each(obj, iter, strict = true) {
  if (getArchtype(obj) === 0) {
    const keys = strict ? Reflect.ownKeys(obj) : O.keys(obj);
    keys.forEach((key) => {
      iter(key, obj[key], obj);
    });
  } else {
    obj.forEach((entry, index) => iter(index, entry, obj));
  }
}
function getArchtype(thing) {
  const state = thing[DRAFT_STATE];
  return state ? state.type_ : isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
}
var has = (thing, prop, type = getArchtype(thing)) => type === 2 ? thing.has(prop) : O[PROTOTYPE].hasOwnProperty.call(thing, prop);
var get = (thing, prop, type = getArchtype(thing)) => (
  // @ts-ignore
  type === 2 ? thing.get(prop) : thing[prop]
);
var set = (thing, propOrOldValue, value, type = getArchtype(thing)) => {
  if (type === 2)
    thing.set(propOrOldValue, value);
  else if (type === 3) {
    thing.add(value);
  } else
    thing[propOrOldValue] = value;
};
function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
var isArray = Array.isArray;
var isMap = (target) => target instanceof Map;
var isSet = (target) => target instanceof Set;
var isObjectish = (target) => typeof target === "object";
var isFunction = (target) => typeof target === "function";
var isBoolean = (target) => typeof target === "boolean";
function isArrayIndex(value) {
  const n = +value;
  return Number.isInteger(n) && String(n) === value;
}
var getProxyDraft = (value) => {
  if (!isObjectish(value))
    return null;
  return value?.[DRAFT_STATE];
};
var latest = (state) => state.copy_ || state.base_;
var getValue = (value) => {
  const proxyDraft = getProxyDraft(value);
  return proxyDraft ? proxyDraft.copy_ ?? proxyDraft.base_ : value;
};
var getFinalValue = (state) => state.modified_ ? state.copy_ : state.base_;
function shallowCopy(base, strict) {
  if (isMap(base)) {
    return new Map(base);
  }
  if (isSet(base)) {
    return new Set(base);
  }
  if (isArray(base))
    return Array[PROTOTYPE].slice.call(base);
  const isPlain = isPlainObject(base);
  if (strict === true || strict === "class_only" && !isPlain) {
    const descriptors = O.getOwnPropertyDescriptors(base);
    delete descriptors[DRAFT_STATE];
    let keys = Reflect.ownKeys(descriptors);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const desc = descriptors[key];
      if (desc[WRITABLE] === false) {
        desc[WRITABLE] = true;
        desc[CONFIGURABLE] = true;
      }
      if (desc.get || desc.set)
        descriptors[key] = {
          [CONFIGURABLE]: true,
          [WRITABLE]: true,
          // could live with !!desc.set as well here...
          [ENUMERABLE]: desc[ENUMERABLE],
          [VALUE]: base[key]
        };
    }
    return O.create(getPrototypeOf(base), descriptors);
  } else {
    const proto = getPrototypeOf(base);
    if (proto !== null && isPlain) {
      return { ...base };
    }
    const obj = O.create(proto);
    return O.assign(obj, base);
  }
}
function freeze(obj, deep = false) {
  if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
    return obj;
  if (getArchtype(obj) > 1) {
    O.defineProperties(obj, {
      set: dontMutateMethodOverride,
      add: dontMutateMethodOverride,
      clear: dontMutateMethodOverride,
      delete: dontMutateMethodOverride
    });
  }
  O.freeze(obj);
  if (deep)
    each(
      obj,
      (_key, value) => {
        freeze(value, true);
      },
      false
    );
  return obj;
}
function dontMutateFrozenCollections() {
  die(2);
}
var dontMutateMethodOverride = {
  [VALUE]: dontMutateFrozenCollections
};
function isFrozen(obj) {
  if (obj === null || !isObjectish(obj))
    return true;
  return O.isFrozen(obj);
}
var PluginMapSet = "MapSet";
var PluginPatches = "Patches";
var PluginArrayMethods = "ArrayMethods";
var plugins = {};
function getPlugin(pluginKey) {
  const plugin = plugins[pluginKey];
  if (!plugin) {
    die(0, pluginKey);
  }
  return plugin;
}
var isPluginLoaded = (pluginKey) => !!plugins[pluginKey];
function loadPlugin(pluginKey, implementation) {
  if (!plugins[pluginKey])
    plugins[pluginKey] = implementation;
}
var currentScope;
var getCurrentScope = () => currentScope;
var createScope = (parent_, immer_) => ({
  drafts_: [],
  parent_,
  immer_,
  // Whenever the modified draft contains a draft from another scope, we
  // need to prevent auto-freezing so the unowned draft can be finalized.
  canAutoFreeze_: true,
  unfinalizedDrafts_: 0,
  handledSet_: /* @__PURE__ */ new Set(),
  processedForPatches_: /* @__PURE__ */ new Set(),
  mapSetPlugin_: isPluginLoaded(PluginMapSet) ? getPlugin(PluginMapSet) : void 0,
  arrayMethodsPlugin_: isPluginLoaded(PluginArrayMethods) ? getPlugin(PluginArrayMethods) : void 0
});
function usePatchesInScope(scope, patchListener) {
  if (patchListener) {
    scope.patchPlugin_ = getPlugin(PluginPatches);
    scope.patches_ = [];
    scope.inversePatches_ = [];
    scope.patchListener_ = patchListener;
  }
}
function revokeScope(scope) {
  leaveScope(scope);
  scope.drafts_.forEach(revokeDraft);
  scope.drafts_ = null;
}
function leaveScope(scope) {
  if (scope === currentScope) {
    currentScope = scope.parent_;
  }
}
var enterScope = (immer22) => currentScope = createScope(currentScope, immer22);
function revokeDraft(draft) {
  const state = draft[DRAFT_STATE];
  if (state.type_ === 0 || state.type_ === 1)
    state.revoke_();
  else
    state.revoked_ = true;
}
function processResult(result, scope) {
  scope.unfinalizedDrafts_ = scope.drafts_.length;
  const baseDraft = scope.drafts_[0];
  const isReplaced = result !== void 0 && result !== baseDraft;
  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified_) {
      revokeScope(scope);
      die(4);
    }
    if (isDraftable(result)) {
      result = finalize(scope, result);
    }
    const { patchPlugin_ } = scope;
    if (patchPlugin_) {
      patchPlugin_.generateReplacementPatches_(
        baseDraft[DRAFT_STATE].base_,
        result,
        scope
      );
    }
  } else {
    result = finalize(scope, baseDraft);
  }
  maybeFreeze(scope, result, true);
  revokeScope(scope);
  if (scope.patches_) {
    scope.patchListener_(scope.patches_, scope.inversePatches_);
  }
  return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value) {
  if (isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  if (!state) {
    const finalValue = handleValue(value, rootScope.handledSet_, rootScope);
    return finalValue;
  }
  if (!isSameScope(state, rootScope)) {
    return value;
  }
  if (!state.modified_) {
    return state.base_;
  }
  if (!state.finalized_) {
    const { callbacks_ } = state;
    if (callbacks_) {
      while (callbacks_.length > 0) {
        const callback = callbacks_.pop();
        callback(rootScope);
      }
    }
    generatePatchesAndFinalize(state, rootScope);
  }
  return state.copy_;
}
function maybeFreeze(scope, value, deep = false) {
  if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
    freeze(value, deep);
  }
}
function markStateFinalized(state) {
  state.finalized_ = true;
  state.scope_.unfinalizedDrafts_--;
}
var isSameScope = (state, rootScope) => state.scope_ === rootScope;
var EMPTY_LOCATIONS_RESULT = [];
function updateDraftInParent(parent, draftValue, finalizedValue, originalKey) {
  const parentCopy = latest(parent);
  const parentType = parent.type_;
  if (originalKey !== void 0) {
    const currentValue = get(parentCopy, originalKey, parentType);
    if (currentValue === draftValue) {
      set(parentCopy, originalKey, finalizedValue, parentType);
      return;
    }
  }
  if (!parent.draftLocations_) {
    const draftLocations = parent.draftLocations_ = /* @__PURE__ */ new Map();
    each(parentCopy, (key, value) => {
      if (isDraft(value)) {
        const keys = draftLocations.get(value) || [];
        keys.push(key);
        draftLocations.set(value, keys);
      }
    });
  }
  const locations = parent.draftLocations_.get(draftValue) ?? EMPTY_LOCATIONS_RESULT;
  for (const location of locations) {
    set(parentCopy, location, finalizedValue, parentType);
  }
}
function registerChildFinalizationCallback(parent, child, key) {
  parent.callbacks_.push(function childCleanup(rootScope) {
    const state = child;
    if (!state || !isSameScope(state, rootScope)) {
      return;
    }
    rootScope.mapSetPlugin_?.fixSetContents(state);
    const finalizedValue = getFinalValue(state);
    updateDraftInParent(parent, state.draft_ ?? state, finalizedValue, key);
    generatePatchesAndFinalize(state, rootScope);
  });
}
function generatePatchesAndFinalize(state, rootScope) {
  const shouldFinalize = state.modified_ && !state.finalized_ && (state.type_ === 3 || state.type_ === 1 && state.allIndicesReassigned_ || (state.assigned_?.size ?? 0) > 0);
  if (shouldFinalize) {
    const { patchPlugin_ } = rootScope;
    if (patchPlugin_) {
      const basePath = patchPlugin_.getPath(state);
      if (basePath) {
        patchPlugin_.generatePatches_(state, basePath, rootScope);
      }
    }
    markStateFinalized(state);
  }
}
function handleCrossReference(target, key, value) {
  const { scope_ } = target;
  if (isDraft(value)) {
    const state = value[DRAFT_STATE];
    if (isSameScope(state, scope_)) {
      state.callbacks_.push(function crossReferenceCleanup() {
        prepareCopy(target);
        const finalizedValue = getFinalValue(state);
        updateDraftInParent(target, value, finalizedValue, key);
      });
    }
  } else if (isDraftable(value)) {
    target.callbacks_.push(function nestedDraftCleanup() {
      const targetCopy = latest(target);
      if (target.type_ === 3) {
        if (targetCopy.has(value)) {
          handleValue(value, scope_.handledSet_, scope_);
        }
      } else {
        if (get(targetCopy, key, target.type_) === value) {
          if (scope_.drafts_.length > 1 && (target.assigned_.get(key) ?? false) === true && target.copy_) {
            handleValue(
              get(target.copy_, key, target.type_),
              scope_.handledSet_,
              scope_
            );
          }
        }
      }
    });
  }
}
function handleValue(target, handledSet, rootScope) {
  if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
    return target;
  }
  if (isDraft(target) || handledSet.has(target) || !isDraftable(target) || isFrozen(target)) {
    return target;
  }
  handledSet.add(target);
  each(target, (key, value) => {
    if (isDraft(value)) {
      const state = value[DRAFT_STATE];
      if (isSameScope(state, rootScope)) {
        const updatedValue = getFinalValue(state);
        set(target, key, updatedValue, target.type_);
        markStateFinalized(state);
      }
    } else if (isDraftable(value)) {
      handleValue(value, handledSet, rootScope);
    }
  });
  return target;
}
function createProxyProxy(base, parent) {
  const baseIsArray = isArray(base);
  const state = {
    type_: baseIsArray ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: parent ? parent.scope_ : getCurrentScope(),
    // True for both shallow and deep changes.
    modified_: false,
    // Used during finalization.
    finalized_: false,
    // Track which properties have been assigned (true) or deleted (false).
    // actually instantiated in `prepareCopy()`
    assigned_: void 0,
    // The parent draft state.
    parent_: parent,
    // The base state.
    base_: base,
    // The base proxy.
    draft_: null,
    // set below
    // The base copy with any updated values.
    copy_: null,
    // Called by the `produce` function.
    revoke_: null,
    isManual_: false,
    // `callbacks` actually gets assigned in `createProxy`
    callbacks_: void 0
  };
  let target = state;
  let traps = objectTraps;
  if (baseIsArray) {
    target = [state];
    traps = arrayTraps;
  }
  const { revoke, proxy } = Proxy.revocable(target, traps);
  state.draft_ = proxy;
  state.revoke_ = revoke;
  return [proxy, state];
}
var objectTraps = {
  get(state, prop) {
    if (prop === DRAFT_STATE)
      return state;
    let arrayPlugin = state.scope_.arrayMethodsPlugin_;
    const isArrayWithStringProp = state.type_ === 1 && typeof prop === "string";
    if (isArrayWithStringProp) {
      if (arrayPlugin?.isArrayOperationMethod(prop)) {
        return arrayPlugin.createMethodInterceptor(state, prop);
      }
    }
    const source = latest(state);
    if (!has(source, prop, state.type_)) {
      return readPropFromProto(state, source, prop);
    }
    const value = source[prop];
    if (state.finalized_ || !isDraftable(value)) {
      return value;
    }
    if (isArrayWithStringProp && state.operationMethod && arrayPlugin?.isMutatingArrayMethod(
      state.operationMethod
    ) && isArrayIndex(prop)) {
      return value;
    }
    if (value === peek(state.base_, prop)) {
      prepareCopy(state);
      const childKey = state.type_ === 1 ? +prop : prop;
      const childDraft = createProxy(state.scope_, value, state, childKey);
      return state.copy_[childKey] = childDraft;
    }
    return value;
  },
  has(state, prop) {
    return prop in latest(state);
  },
  ownKeys(state) {
    return Reflect.ownKeys(latest(state));
  },
  set(state, prop, value) {
    const desc = getDescriptorFromProto(latest(state), prop);
    if (desc?.set) {
      desc.set.call(state.draft_, value);
      return true;
    }
    if (!state.modified_) {
      const current2 = peek(latest(state), prop);
      const currentState = current2?.[DRAFT_STATE];
      if (currentState && currentState.base_ === value) {
        state.copy_[prop] = value;
        state.assigned_.set(prop, false);
        return true;
      }
      if (is(value, current2) && (value !== void 0 || has(state.base_, prop, state.type_)))
        return true;
      prepareCopy(state);
      markChanged(state);
    }
    if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
    (value !== void 0 || prop in state.copy_) || // special case: NaN
    Number.isNaN(value) && Number.isNaN(state.copy_[prop]))
      return true;
    state.copy_[prop] = value;
    state.assigned_.set(prop, true);
    handleCrossReference(state, prop, value);
    return true;
  },
  deleteProperty(state, prop) {
    prepareCopy(state);
    if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
      state.assigned_.set(prop, false);
      markChanged(state);
    } else {
      state.assigned_.delete(prop);
    }
    if (state.copy_) {
      delete state.copy_[prop];
    }
    return true;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(state, prop) {
    const owner = latest(state);
    const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
    if (!desc)
      return desc;
    return {
      [WRITABLE]: true,
      [CONFIGURABLE]: state.type_ !== 1 || prop !== "length",
      [ENUMERABLE]: desc[ENUMERABLE],
      [VALUE]: owner[prop]
    };
  },
  defineProperty() {
    die(11);
  },
  getPrototypeOf(state) {
    return getPrototypeOf(state.base_);
  },
  setPrototypeOf() {
    die(12);
  }
};
var arrayTraps = {};
for (let key in objectTraps) {
  let fn = objectTraps[key];
  arrayTraps[key] = function() {
    const args = arguments;
    args[0] = args[0][0];
    return fn.apply(this, args);
  };
}
arrayTraps.deleteProperty = function(state, prop) {
  if (process.env.NODE_ENV !== "production" && isNaN(parseInt(prop)))
    die(13);
  return arrayTraps.set.call(this, state, prop, void 0);
};
arrayTraps.set = function(state, prop, value) {
  if (process.env.NODE_ENV !== "production" && prop !== "length" && isNaN(parseInt(prop)))
    die(14);
  return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
function peek(draft, prop) {
  const state = draft[DRAFT_STATE];
  const source = state ? latest(state) : draft;
  return source[prop];
}
function readPropFromProto(state, source, prop) {
  const desc = getDescriptorFromProto(source, prop);
  return desc ? VALUE in desc ? desc[VALUE] : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    desc.get?.call(state.draft_)
  ) : void 0;
}
function getDescriptorFromProto(source, prop) {
  if (!(prop in source))
    return void 0;
  let proto = getPrototypeOf(source);
  while (proto) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc)
      return desc;
    proto = getPrototypeOf(proto);
  }
  return void 0;
}
function markChanged(state) {
  if (!state.modified_) {
    state.modified_ = true;
    if (state.parent_) {
      markChanged(state.parent_);
    }
  }
}
function prepareCopy(state) {
  if (!state.copy_) {
    state.assigned_ = /* @__PURE__ */ new Map();
    state.copy_ = shallowCopy(
      state.base_,
      state.scope_.immer_.useStrictShallowCopy_
    );
  }
}
var Immer2 = class {
  constructor(config) {
    this.autoFreeze_ = true;
    this.useStrictShallowCopy_ = false;
    this.useStrictIteration_ = false;
    this.produce = (base, recipe, patchListener) => {
      if (isFunction(base) && !isFunction(recipe)) {
        const defaultBase = recipe;
        recipe = base;
        const self = this;
        return function curriedProduce(base2 = defaultBase, ...args) {
          return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
        };
      }
      if (!isFunction(recipe))
        die(6);
      if (patchListener !== void 0 && !isFunction(patchListener))
        die(7);
      let result;
      if (isDraftable(base)) {
        const scope = enterScope(this);
        const proxy = createProxy(scope, base, void 0);
        let hasError = true;
        try {
          result = recipe(proxy);
          hasError = false;
        } finally {
          if (hasError)
            revokeScope(scope);
          else
            leaveScope(scope);
        }
        usePatchesInScope(scope, patchListener);
        return processResult(result, scope);
      } else if (!base || !isObjectish(base)) {
        result = recipe(base);
        if (result === void 0)
          result = base;
        if (result === NOTHING)
          result = void 0;
        if (this.autoFreeze_)
          freeze(result, true);
        if (patchListener) {
          const p = [];
          const ip = [];
          getPlugin(PluginPatches).generateReplacementPatches_(base, result, {
            patches_: p,
            inversePatches_: ip
          });
          patchListener(p, ip);
        }
        return result;
      } else
        die(1, base);
    };
    this.produceWithPatches = (base, recipe) => {
      if (isFunction(base)) {
        return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
      }
      let patches, inversePatches;
      const result = this.produce(base, recipe, (p, ip) => {
        patches = p;
        inversePatches = ip;
      });
      return [result, patches, inversePatches];
    };
    if (isBoolean(config?.autoFreeze))
      this.setAutoFreeze(config.autoFreeze);
    if (isBoolean(config?.useStrictShallowCopy))
      this.setUseStrictShallowCopy(config.useStrictShallowCopy);
    if (isBoolean(config?.useStrictIteration))
      this.setUseStrictIteration(config.useStrictIteration);
  }
  createDraft(base) {
    if (!isDraftable(base))
      die(8);
    if (isDraft(base))
      base = current(base);
    const scope = enterScope(this);
    const proxy = createProxy(scope, base, void 0);
    proxy[DRAFT_STATE].isManual_ = true;
    leaveScope(scope);
    return proxy;
  }
  finishDraft(draft, patchListener) {
    const state = draft && draft[DRAFT_STATE];
    if (!state || !state.isManual_)
      die(9);
    const { scope_: scope } = state;
    usePatchesInScope(scope, patchListener);
    return processResult(void 0, scope);
  }
  /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is enabled.
   */
  setAutoFreeze(value) {
    this.autoFreeze_ = value;
  }
  /**
   * Pass true to enable strict shallow copy.
   *
   * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
   */
  setUseStrictShallowCopy(value) {
    this.useStrictShallowCopy_ = value;
  }
  /**
   * Pass false to use faster iteration that skips non-enumerable properties
   * but still handles symbols for compatibility.
   *
   * By default, strict iteration is enabled (includes all own properties).
   */
  setUseStrictIteration(value) {
    this.useStrictIteration_ = value;
  }
  shouldUseStrictIteration() {
    return this.useStrictIteration_;
  }
  applyPatches(base, patches) {
    let i;
    for (i = patches.length - 1; i >= 0; i--) {
      const patch = patches[i];
      if (patch.path.length === 0 && patch.op === "replace") {
        base = patch.value;
        break;
      }
    }
    if (i > -1) {
      patches = patches.slice(i + 1);
    }
    const applyPatchesImpl = getPlugin(PluginPatches).applyPatches_;
    if (isDraft(base)) {
      return applyPatchesImpl(base, patches);
    }
    return this.produce(
      base,
      (draft) => applyPatchesImpl(draft, patches)
    );
  }
};
function createProxy(rootScope, value, parent, key) {
  const [draft, state] = isMap(value) ? getPlugin(PluginMapSet).proxyMap_(value, parent) : isSet(value) ? getPlugin(PluginMapSet).proxySet_(value, parent) : createProxyProxy(value, parent);
  const scope = parent?.scope_ ?? getCurrentScope();
  scope.drafts_.push(draft);
  state.callbacks_ = parent?.callbacks_ ?? [];
  state.key_ = key;
  if (parent && key !== void 0) {
    registerChildFinalizationCallback(parent, state, key);
  } else {
    state.callbacks_.push(function rootDraftCleanup(rootScope2) {
      rootScope2.mapSetPlugin_?.fixSetContents(state);
      const { patchPlugin_ } = rootScope2;
      if (state.modified_ && patchPlugin_) {
        patchPlugin_.generatePatches_(state, [], rootScope2);
      }
    });
  }
  return draft;
}
function current(value) {
  if (!isDraft(value))
    die(10, value);
  return currentImpl(value);
}
function currentImpl(value) {
  if (!isDraftable(value) || isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  let copy;
  let strict = true;
  if (state) {
    if (!state.modified_)
      return state.base_;
    state.finalized_ = true;
    copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
    strict = state.scope_.immer_.shouldUseStrictIteration();
  } else {
    copy = shallowCopy(value, true);
  }
  each(
    copy,
    (key, childValue) => {
      set(copy, key, currentImpl(childValue));
    },
    strict
  );
  if (state) {
    state.finalized_ = false;
  }
  return copy;
}
function enablePatches() {
  const errorOffset = 16;
  if (process.env.NODE_ENV !== "production") {
    errors.push(
      'Sets cannot have "replace" patches.',
      function(op) {
        return "Unsupported patch operation: " + op;
      },
      function(path) {
        return "Cannot apply patch, path doesn't resolve: " + path;
      },
      "Patching reserved attributes like __proto__, prototype and constructor is not allowed"
    );
  }
  function getPath(state, path = []) {
    if (state.key_ !== void 0) {
      const parentCopy = state.parent_.copy_ ?? state.parent_.base_;
      const proxyDraft = getProxyDraft(get(parentCopy, state.key_));
      const valueAtKey = get(parentCopy, state.key_);
      if (valueAtKey === void 0) {
        return null;
      }
      if (valueAtKey !== state.draft_ && valueAtKey !== state.base_ && valueAtKey !== state.copy_) {
        return null;
      }
      if (proxyDraft != null && proxyDraft.base_ !== state.base_) {
        return null;
      }
      const isSet2 = state.parent_.type_ === 3;
      let key;
      if (isSet2) {
        const setParent = state.parent_;
        key = Array.from(setParent.drafts_.keys()).indexOf(state.key_);
      } else {
        key = state.key_;
      }
      if (!(isSet2 && parentCopy.size > key || has(parentCopy, key))) {
        return null;
      }
      path.push(key);
    }
    if (state.parent_) {
      return getPath(state.parent_, path);
    }
    path.reverse();
    try {
      resolvePath(state.copy_, path);
    } catch (e) {
      return null;
    }
    return path;
  }
  function resolvePath(base, path) {
    let current2 = base;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      current2 = get(current2, key);
      if (!isObjectish(current2) || current2 === null) {
        throw new Error(`Cannot resolve path at '${path.join("/")}'`);
      }
    }
    return current2;
  }
  const REPLACE = "replace";
  const ADD = "add";
  const REMOVE = "remove";
  function generatePatches_(state, basePath, scope) {
    if (state.scope_.processedForPatches_.has(state)) {
      return;
    }
    state.scope_.processedForPatches_.add(state);
    const { patches_, inversePatches_ } = scope;
    switch (state.type_) {
      case 0:
      case 2:
        return generatePatchesFromAssigned(
          state,
          basePath,
          patches_,
          inversePatches_
        );
      case 1:
        return generateArrayPatches(
          state,
          basePath,
          patches_,
          inversePatches_
        );
      case 3:
        return generateSetPatches(
          state,
          basePath,
          patches_,
          inversePatches_
        );
    }
  }
  function generateArrayPatches(state, basePath, patches, inversePatches) {
    let { base_, assigned_ } = state;
    let copy_ = state.copy_;
    if (copy_.length < base_.length) {
      [base_, copy_] = [copy_, base_];
      [patches, inversePatches] = [inversePatches, patches];
    }
    const allReassigned = state.allIndicesReassigned_ === true;
    for (let i = 0; i < base_.length; i++) {
      const copiedItem = copy_[i];
      const baseItem = base_[i];
      const isAssigned = allReassigned || assigned_?.get(i.toString());
      if (isAssigned && copiedItem !== baseItem) {
        const childState = copiedItem?.[DRAFT_STATE];
        if (childState && childState.modified_) {
          continue;
        }
        const path = basePath.concat([i]);
        patches.push({
          op: REPLACE,
          path,
          // Need to maybe clone it, as it can in fact be the original value
          // due to the base/copy inversion at the start of this function
          value: clonePatchValueIfNeeded(copiedItem)
        });
        inversePatches.push({
          op: REPLACE,
          path,
          value: clonePatchValueIfNeeded(baseItem)
        });
      }
    }
    for (let i = base_.length; i < copy_.length; i++) {
      const path = basePath.concat([i]);
      patches.push({
        op: ADD,
        path,
        // Need to maybe clone it, as it can in fact be the original value
        // due to the base/copy inversion at the start of this function
        value: clonePatchValueIfNeeded(copy_[i])
      });
    }
    for (let i = copy_.length - 1; base_.length <= i; --i) {
      const path = basePath.concat([i]);
      inversePatches.push({
        op: REMOVE,
        path
      });
    }
  }
  function generatePatchesFromAssigned(state, basePath, patches, inversePatches) {
    const { base_, copy_, type_ } = state;
    each(state.assigned_, (key, assignedValue) => {
      const origValue = get(base_, key, type_);
      const value = get(copy_, key, type_);
      const op = !assignedValue ? REMOVE : has(base_, key) ? REPLACE : ADD;
      if (origValue === value && op === REPLACE)
        return;
      const path = basePath.concat(key);
      patches.push(
        op === REMOVE ? { op, path } : { op, path, value: clonePatchValueIfNeeded(value) }
      );
      inversePatches.push(
        op === ADD ? { op: REMOVE, path } : op === REMOVE ? { op: ADD, path, value: clonePatchValueIfNeeded(origValue) } : { op: REPLACE, path, value: clonePatchValueIfNeeded(origValue) }
      );
    });
  }
  function generateSetPatches(state, basePath, patches, inversePatches) {
    let { base_, copy_ } = state;
    let i = 0;
    base_.forEach((value) => {
      if (!copy_.has(value)) {
        const path = basePath.concat([i]);
        patches.push({
          op: REMOVE,
          path,
          value
        });
        inversePatches.unshift({
          op: ADD,
          path,
          value
        });
      }
      i++;
    });
    i = 0;
    copy_.forEach((value) => {
      if (!base_.has(value)) {
        const path = basePath.concat([i]);
        patches.push({
          op: ADD,
          path,
          value
        });
        inversePatches.unshift({
          op: REMOVE,
          path,
          value
        });
      }
      i++;
    });
  }
  function generateReplacementPatches_(baseValue, replacement, scope) {
    const { patches_, inversePatches_ } = scope;
    patches_.push({
      op: REPLACE,
      path: [],
      value: replacement === NOTHING ? void 0 : replacement
    });
    inversePatches_.push({
      op: REPLACE,
      path: [],
      value: baseValue
    });
  }
  function applyPatches_(draft, patches) {
    patches.forEach((patch) => {
      const { path, op } = patch;
      let base = draft;
      for (let i = 0; i < path.length - 1; i++) {
        const parentType = getArchtype(base);
        let p = path[i];
        if (typeof p !== "string" && typeof p !== "number") {
          p = "" + p;
        }
        if ((parentType === 0 || parentType === 1) && (p === "__proto__" || p === CONSTRUCTOR))
          die(errorOffset + 3);
        if (isFunction(base) && p === PROTOTYPE)
          die(errorOffset + 3);
        base = get(base, p);
        if (!isObjectish(base))
          die(errorOffset + 2, path.join("/"));
      }
      const type = getArchtype(base);
      const value = deepClonePatchValue(patch.value);
      const key = path[path.length - 1];
      switch (op) {
        case REPLACE:
          switch (type) {
            case 2:
              return base.set(key, value);
            case 3:
              die(errorOffset);
            default:
              return base[key] = value;
          }
        case ADD:
          switch (type) {
            case 1:
              return key === "-" ? base.push(value) : base.splice(key, 0, value);
            case 2:
              return base.set(key, value);
            case 3:
              return base.add(value);
            default:
              return base[key] = value;
          }
        case REMOVE:
          switch (type) {
            case 1:
              return base.splice(key, 1);
            case 2:
              return base.delete(key);
            case 3:
              return base.delete(patch.value);
            default:
              return delete base[key];
          }
        default:
          die(errorOffset + 1, op);
      }
    });
    return draft;
  }
  function deepClonePatchValue(obj) {
    if (!isDraftable(obj))
      return obj;
    if (isArray(obj))
      return obj.map(deepClonePatchValue);
    if (isMap(obj))
      return new Map(
        Array.from(obj.entries()).map(([k, v]) => [k, deepClonePatchValue(v)])
      );
    if (isSet(obj))
      return new Set(Array.from(obj).map(deepClonePatchValue));
    const cloned = Object.create(getPrototypeOf(obj));
    for (const key in obj)
      cloned[key] = deepClonePatchValue(obj[key]);
    if (has(obj, DRAFTABLE))
      cloned[DRAFTABLE] = obj[DRAFTABLE];
    return cloned;
  }
  function clonePatchValueIfNeeded(obj) {
    if (isDraft(obj)) {
      return deepClonePatchValue(obj);
    } else
      return obj;
  }
  loadPlugin(PluginPatches, {
    applyPatches_,
    generatePatches_,
    generateReplacementPatches_,
    getPath
  });
}
function enableMapSet() {
  class DraftMap extends Map {
    constructor(target, parent) {
      super();
      this[DRAFT_STATE] = {
        type_: 2,
        parent_: parent,
        scope_: parent ? parent.scope_ : getCurrentScope(),
        modified_: false,
        finalized_: false,
        copy_: void 0,
        assigned_: void 0,
        base_: target,
        draft_: this,
        isManual_: false,
        revoked_: false,
        callbacks_: []
      };
    }
    get size() {
      return latest(this[DRAFT_STATE]).size;
    }
    has(key) {
      return latest(this[DRAFT_STATE]).has(key);
    }
    set(key, value) {
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      if (!latest(state).has(key) || latest(state).get(key) !== value) {
        prepareMapCopy(state);
        markChanged(state);
        state.assigned_.set(key, true);
        state.copy_.set(key, value);
        state.assigned_.set(key, true);
        handleCrossReference(state, key, value);
      }
      return this;
    }
    delete(key) {
      if (!this.has(key)) {
        return false;
      }
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      prepareMapCopy(state);
      markChanged(state);
      if (state.base_.has(key)) {
        state.assigned_.set(key, false);
      } else {
        state.assigned_.delete(key);
      }
      state.copy_.delete(key);
      return true;
    }
    clear() {
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      if (latest(state).size) {
        prepareMapCopy(state);
        markChanged(state);
        state.assigned_ = /* @__PURE__ */ new Map();
        each(state.base_, (key) => {
          state.assigned_.set(key, false);
        });
        state.copy_.clear();
      }
    }
    forEach(cb, thisArg) {
      const state = this[DRAFT_STATE];
      latest(state).forEach((_value, key, _map) => {
        cb.call(thisArg, this.get(key), key, this);
      });
    }
    get(key) {
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      const value = latest(state).get(key);
      if (state.finalized_ || !isDraftable(value)) {
        return value;
      }
      if (value !== state.base_.get(key)) {
        return value;
      }
      const draft = createProxy(state.scope_, value, state, key);
      prepareMapCopy(state);
      state.copy_.set(key, draft);
      return draft;
    }
    keys() {
      return latest(this[DRAFT_STATE]).keys();
    }
    values() {
      const iterator = this.keys();
      return {
        [Symbol.iterator]: () => this.values(),
        next: () => {
          const r = iterator.next();
          if (r.done)
            return r;
          const value = this.get(r.value);
          return {
            done: false,
            value
          };
        }
      };
    }
    entries() {
      const iterator = this.keys();
      return {
        [Symbol.iterator]: () => this.entries(),
        next: () => {
          const r = iterator.next();
          if (r.done)
            return r;
          const value = this.get(r.value);
          return {
            done: false,
            value: [r.value, value]
          };
        }
      };
    }
    [(Symbol.iterator)]() {
      return this.entries();
    }
  }
  function proxyMap_(target, parent) {
    const map = new DraftMap(target, parent);
    return [map, map[DRAFT_STATE]];
  }
  function prepareMapCopy(state) {
    if (!state.copy_) {
      state.assigned_ = /* @__PURE__ */ new Map();
      state.copy_ = new Map(state.base_);
    }
  }
  class DraftSet extends Set {
    constructor(target, parent) {
      super();
      this[DRAFT_STATE] = {
        type_: 3,
        parent_: parent,
        scope_: parent ? parent.scope_ : getCurrentScope(),
        modified_: false,
        finalized_: false,
        copy_: void 0,
        base_: target,
        draft_: this,
        drafts_: /* @__PURE__ */ new Map(),
        revoked_: false,
        isManual_: false,
        assigned_: void 0,
        callbacks_: []
      };
    }
    get size() {
      return latest(this[DRAFT_STATE]).size;
    }
    has(value) {
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      if (!state.copy_) {
        return state.base_.has(value);
      }
      if (state.copy_.has(value))
        return true;
      if (state.drafts_.has(value) && state.copy_.has(state.drafts_.get(value)))
        return true;
      return false;
    }
    add(value) {
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      if (!this.has(value)) {
        prepareSetCopy(state);
        markChanged(state);
        state.copy_.add(value);
        handleCrossReference(state, value, value);
      }
      return this;
    }
    delete(value) {
      if (!this.has(value)) {
        return false;
      }
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      prepareSetCopy(state);
      markChanged(state);
      return state.copy_.delete(value) || (state.drafts_.has(value) ? state.copy_.delete(state.drafts_.get(value)) : (
        /* istanbul ignore next */
        false
      ));
    }
    clear() {
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      if (latest(state).size) {
        prepareSetCopy(state);
        markChanged(state);
        state.copy_.clear();
      }
    }
    values() {
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      prepareSetCopy(state);
      return state.copy_.values();
    }
    entries() {
      const state = this[DRAFT_STATE];
      assertUnrevoked(state);
      prepareSetCopy(state);
      return state.copy_.entries();
    }
    keys() {
      return this.values();
    }
    [(Symbol.iterator)]() {
      return this.values();
    }
    forEach(cb, thisArg) {
      const iterator = this.values();
      let result = iterator.next();
      while (!result.done) {
        cb.call(thisArg, result.value, result.value, this);
        result = iterator.next();
      }
    }
  }
  function proxySet_(target, parent) {
    const set2 = new DraftSet(target, parent);
    return [set2, set2[DRAFT_STATE]];
  }
  function prepareSetCopy(state) {
    if (!state.copy_) {
      state.copy_ = /* @__PURE__ */ new Set();
      state.base_.forEach((value) => {
        if (isDraftable(value)) {
          const draft = createProxy(state.scope_, value, state, value);
          state.drafts_.set(value, draft);
          state.copy_.add(draft);
        } else {
          state.copy_.add(value);
        }
      });
    }
  }
  function assertUnrevoked(state) {
    if (state.revoked_)
      die(3, JSON.stringify(latest(state)));
  }
  function fixSetContents(target) {
    if (target.type_ === 3 && target.copy_) {
      const copy = new Set(target.copy_);
      target.copy_.clear();
      copy.forEach((value) => {
        target.copy_.add(getValue(value));
      });
    }
  }
  loadPlugin(PluginMapSet, { proxyMap_, proxySet_, fixSetContents });
}
var immer = new Immer2();
var produce = immer.produce;
var produceWithPatches = /* @__PURE__ */ immer.produceWithPatches.bind(immer);
var applyPatches = /* @__PURE__ */ immer.applyPatches.bind(immer);

// node_modules/zustand/esm/middleware/immer.mjs
var immerImpl = (initializer) => (set2, get2, store) => {
  store.setState = (updater, replace, ...args) => {
    const nextState = typeof updater === "function" ? produce(updater) : updater;
    return set2(nextState, replace, ...args);
  };
  return initializer(store.setState, get2, store);
};
var immer2 = immerImpl;

// src/engine/document.ts
var createEmptyDocument = () => ({
  root: { props: {} },
  content: [],
  zones: {}
});
var cloneValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneValue(child)])
    );
  }
  return value;
};
var cloneDocument = (doc) => ({
  root: {
    props: cloneValue(doc.root?.props || {})
  },
  content: (doc.content || []).map((node) => ({
    type: node.type,
    props: cloneValue(node.props || {})
  })),
  zones: Object.fromEntries(
    Object.entries(doc.zones || {}).map(([zoneKey, nodes]) => [
      zoneKey,
      nodes.map((node) => ({
        type: node.type,
        props: cloneValue(node.props || {})
      }))
    ])
  )
});
var parseDocument = (rawData) => {
  if (!rawData) return createEmptyDocument();
  return {
    root: rawData.root || { props: {} },
    content: [...rawData.content || []],
    zones: Object.fromEntries(
      Object.entries(rawData.zones || {}).map(([zoneKey, nodes]) => [zoneKey, [...nodes]])
    )
  };
};
var serializeDocument = (doc) => {
  const cloned = cloneDocument(doc);
  return {
    root: cloned.root,
    content: cloned.content,
    zones: cloned.zones
  };
};

// src/engine/zones.ts
var parseZoneKey = (zoneKey) => {
  const parts = zoneKey.split(":");
  return {
    parentId: parts[0],
    slotName: parts[1] || "default"
  };
};
var indexCache = /* @__PURE__ */ new WeakMap();
var buildIndex = (doc) => {
  const index = /* @__PURE__ */ new Map();
  for (let i = 0; i < doc.content.length; i++) {
    const node = doc.content[i];
    index.set(node.props.id, { node, path: { index: i } });
  }
  for (const [zoneKey, items] of Object.entries(doc.zones)) {
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      index.set(node.props.id, { node, path: { zoneKey, index: i } });
    }
  }
  return index;
};
var findNodeById = (doc, id) => {
  let index = indexCache.get(doc);
  if (!index) {
    index = buildIndex(doc);
    indexCache.set(doc, index);
  }
  return index.get(id) ?? null;
};
var getDescendantZoneKeys = (zones, nodeId, acc = []) => {
  const prefix = `${nodeId}:`;
  for (const zoneKey of Object.keys(zones)) {
    if (zoneKey.startsWith(prefix)) {
      acc.push(zoneKey);
      for (const child of zones[zoneKey]) {
        getDescendantZoneKeys(zones, child.props.id, acc);
      }
    }
  }
  return acc;
};
var getParentId = (doc, id) => {
  const res = findNodeById(doc, id);
  if (!res || !res.path.zoneKey) return null;
  return parseZoneKey(res.path.zoneKey).parentId;
};
var getBreadcrumbs = (doc, id) => {
  const crumbs = [];
  let currentId = id;
  while (currentId) {
    const res = findNodeById(doc, currentId);
    if (!res) break;
    crumbs.unshift({ id: currentId, type: res.node.type });
    currentId = res.path.zoneKey ? parseZoneKey(res.path.zoneKey).parentId : null;
  }
  return crumbs;
};

// node_modules/nanoid/non-secure/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid = (size = 21) => {
  let id = "";
  let i = size | 0;
  while (i-- > 0) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};

// src/engine/ids.ts
var generateId = () => nanoid(8);
var remapNodeIds = (node, sourceZones, idMap = /* @__PURE__ */ new Map()) => {
  const oldId = node.props.id;
  const newId = generateId();
  idMap.set(oldId, newId);
  const remappedNode = {
    ...node,
    props: {
      ...node.props,
      id: newId
    }
  };
  const newZones = {};
  const prefix = `${oldId}:`;
  for (const [zoneKey, zoneItems] of Object.entries(sourceZones)) {
    if (zoneKey.startsWith(prefix)) {
      const slotName = zoneKey.split(":")[1];
      const newZoneKey = `${newId}:${slotName}`;
      const newZoneItems = [];
      for (const item of zoneItems) {
        const { remappedNode: childNode, newZones: childZones } = remapNodeIds(item, sourceZones, idMap);
        newZoneItems.push(childNode);
        Object.assign(newZones, childZones);
      }
      newZones[newZoneKey] = newZoneItems;
    }
  }
  return { remappedNode, newZones };
};

// src/engine/operations.ts
function extractDefaultSlots(draft, node) {
  const parentId = node.props.id;
  if (!parentId) return;
  for (const [key, value] of Object.entries(node.props)) {
    if (Array.isArray(value) && value.length > 0 && value.every(
      (item) => item && typeof item === "object" && "type" in item && "props" in item
    )) {
      const zoneKey = `${parentId}:${key}`;
      const remappedItems = [];
      for (const item of value) {
        const clonedItem = JSON.parse(JSON.stringify(item));
        clonedItem.props.id = generateId();
        extractDefaultSlots(draft, clonedItem);
        remappedItems.push(clonedItem);
      }
      draft.zones[zoneKey] = remappedItems;
      node.props[key] = [];
    }
  }
}
var insertNode = (draft, node, targetZoneKey, index) => {
  if (!node.props.id) {
    node.props.id = generateId();
  }
  extractDefaultSlots(draft, node);
  let list = targetZoneKey ? draft.zones[targetZoneKey] : draft.content;
  if (!list) {
    list = [];
    if (targetZoneKey) {
      draft.zones[targetZoneKey] = list;
    }
  }
  const insertIndex = typeof index === "number" ? index : list.length;
  list.splice(insertIndex, 0, node);
};
var removeNode = (draft, id) => {
  const result = findNodeById(draft, id);
  if (!result) return;
  const { path } = result;
  const list = path.zoneKey ? draft.zones[path.zoneKey] : draft.content;
  if (list) {
    list.splice(path.index, 1);
  }
  const descendantZoneKeys = getDescendantZoneKeys(draft.zones, id);
  for (const zoneKey of descendantZoneKeys) {
    delete draft.zones[zoneKey];
  }
};
var moveNode = (draft, id, targetZoneKey, targetIndex) => {
  const result = findNodeById(draft, id);
  if (!result) return;
  const { node, path: sourcePath } = result;
  const sourceList = sourcePath.zoneKey ? draft.zones[sourcePath.zoneKey] : draft.content;
  let targetList = targetZoneKey ? draft.zones[targetZoneKey] : draft.content;
  if (targetZoneKey) {
    const targetParentId = parseZoneKey(targetZoneKey).parentId;
    const descendantZoneKeys = getDescendantZoneKeys(draft.zones, id);
    if (targetParentId === id || descendantZoneKeys.includes(targetZoneKey)) {
      return;
    }
  }
  if (!targetList && targetZoneKey) {
    targetList = [];
    draft.zones[targetZoneKey] = targetList;
  }
  if (!sourceList || !targetList) return;
  sourceList.splice(sourcePath.index, 1);
  let finalIndex = targetIndex ?? targetList.length;
  if (sourcePath.zoneKey === targetZoneKey && sourcePath.index < finalIndex) {
    finalIndex -= 1;
  }
  targetList.splice(finalIndex, 0, node);
};
var duplicateNode = (draft, id) => {
  const result = findNodeById(draft, id);
  if (!result) return;
  const { node, path } = result;
  const { remappedNode, newZones } = remapNodeIds(node, draft.zones);
  const targetList = path.zoneKey ? draft.zones[path.zoneKey] : draft.content;
  if (targetList) {
    targetList.splice(path.index + 1, 0, remappedNode);
  }
  Object.assign(draft.zones, newZones);
};
var updateProps = (draft, id, patch) => {
  const result = findNodeById(draft, id);
  if (!result) return;
  Object.assign(result.node.props, patch);
};
var setRootProps = (draft, patch) => {
  Object.assign(draft.root.props, patch);
};
var serializeNodeWithZones = (doc, id) => {
  const result = findNodeById(doc, id);
  if (!result) return null;
  const descendantZoneKeys = getDescendantZoneKeys(doc.zones, id);
  const zones = {};
  for (const zoneKey of descendantZoneKeys) {
    zones[zoneKey] = doc.zones[zoneKey];
  }
  return JSON.parse(JSON.stringify({ node: result.node, zones }));
};
var pastePayload = (draft, payload, targetZoneKey, index) => {
  const { remappedNode, newZones } = remapNodeIds(payload.node, payload.zones);
  insertNode(draft, remappedNode, targetZoneKey, index);
  Object.assign(draft.zones, newZones);
  return remappedNode;
};
var removeNodes = (draft, ids) => {
  const located = ids.map((id) => {
    const res = findNodeById(draft, id);
    return res ? { id, zoneKey: res.path.zoneKey, index: res.path.index } : null;
  }).filter((entry) => entry != null);
  located.sort((a, b) => {
    const keyA = a.zoneKey ?? "";
    const keyB = b.zoneKey ?? "";
    if (keyA !== keyB) return keyA < keyB ? 1 : -1;
    return b.index - a.index;
  });
  for (const entry of located) {
    removeNode(draft, entry.id);
  }
};
var duplicateNodes = (draft, ids) => {
  const newIds = [];
  for (const id of ids) {
    const result = findNodeById(draft, id);
    if (!result) continue;
    const { node, path } = result;
    const { remappedNode, newZones } = remapNodeIds(node, draft.zones);
    const targetList = path.zoneKey ? draft.zones[path.zoneKey] : draft.content;
    if (targetList) {
      targetList.splice(path.index + 1, 0, remappedNode);
    }
    Object.assign(draft.zones, newZones);
    newIds.push(remappedNode.props.id);
  }
  return newIds;
};

// src/engine/store.ts
enablePatches();
enableMapSet();
var HISTORY_LIMIT = 50;
var COALESCE_MS = 500;
var CLIPBOARD_STORAGE_KEY = "tecof:clipboard:v1";
var writeClipboardStorage = (payload) => {
  try {
    if (typeof localStorage === "undefined") return;
    if (payload == null) {
      localStorage.removeItem(CLIPBOARD_STORAGE_KEY);
    } else {
      localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {
  }
};
var readClipboardStorage = () => {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.node && typeof parsed.node === "object") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};
var commit = (state, mutate, coalesceKey) => {
  const [next, patches, inversePatches] = produceWithPatches(state.document, mutate);
  if (patches.length === 0) {
    state.document = next;
    return;
  }
  state.document = next;
  const now = Date.now();
  const last = state._lastCommit;
  const isContinuation = coalesceKey != null && last != null && last.id === coalesceKey && now - last.time < COALESCE_MS && state.history.past.length > 0;
  if (isContinuation) {
    const top = state.history.past[state.history.past.length - 1];
    top.patches.push(...patches);
    top.inversePatches.unshift(...inversePatches);
  } else {
    state.history.past.push({ patches, inversePatches });
    if (state.history.past.length > HISTORY_LIMIT) {
      state.history.past.shift();
    }
  }
  state.history.future = [];
  state._lastCommit = coalesceKey != null ? { id: coalesceKey, time: now } : null;
};
var nodeAllows = (state, id, key) => {
  const resolver = state.permissionResolver;
  if (!resolver) return true;
  const res = findNodeById(state.document, id);
  if (!res) return true;
  return resolver(res.node)[key] !== false;
};
var pruneSelection = (state, removed) => {
  const gone = new Set(removed);
  state.selection.selectedIds = state.selection.selectedIds.filter((id) => !gone.has(id));
  if (state.selection.selectedId && gone.has(state.selection.selectedId)) {
    const ids = state.selection.selectedIds;
    state.selection.selectedId = ids.length > 0 ? ids[ids.length - 1] : null;
  }
};
var validateSelection = (state) => {
  state.selection.selectedIds = state.selection.selectedIds.filter(
    (id) => findNodeById(state.document, id)
  );
  const primary = state.selection.selectedId;
  if (primary && !findNodeById(state.document, primary)) {
    const ids = state.selection.selectedIds;
    state.selection.selectedId = ids.length > 0 ? ids[ids.length - 1] : null;
  }
  state.selection.hoveredId = null;
};
var useEditorStore = create()(
  immer2((set2) => ({
    // Initial State
    document: createEmptyDocument(),
    history: {
      past: [],
      future: []
    },
    selection: {
      selectedId: null,
      selectedIds: [],
      hoveredId: null
    },
    viewport: "desktop",
    drag: null,
    clipboard: null,
    _lastCommit: null,
    permissionResolver: null,
    // Actions
    setDocument: (doc) => set2((state) => {
      state.document = cloneDocument(parseDocument(doc));
      state.history = { past: [], future: [] };
      state.selection = { selectedId: null, selectedIds: [], hoveredId: null };
      state._lastCommit = null;
    }),
    selectNode: (id) => set2((state) => {
      state.selection.selectedId = id;
      state.selection.selectedIds = id ? [id] : [];
    }),
    toggleSelect: (id) => set2((state) => {
      const ids = state.selection.selectedIds;
      const existing = ids.indexOf(id);
      if (existing >= 0) {
        ids.splice(existing, 1);
        state.selection.selectedId = ids.length > 0 ? ids[ids.length - 1] : null;
      } else {
        ids.push(id);
        state.selection.selectedId = id;
      }
    }),
    setSelection: (ids) => set2((state) => {
      state.selection.selectedIds = [...ids];
      state.selection.selectedId = ids.length > 0 ? ids[ids.length - 1] : null;
    }),
    hoverNode: (id) => set2((state) => {
      state.selection.hoveredId = id;
    }),
    setViewport: (viewport) => set2((state) => {
      state.viewport = viewport;
    }),
    beginDrag: (payload) => set2((state) => {
      state.drag = payload;
    }),
    endDrag: () => set2((state) => {
      state.drag = null;
    }),
    insertNode: (node, targetZoneKey, index) => set2((state) => {
      commit(state, (doc) => insertNode(doc, node, targetZoneKey, index));
    }),
    removeNode: (id) => set2((state) => {
      if (!nodeAllows(state, id, "delete")) return;
      commit(state, (doc) => removeNode(doc, id));
      pruneSelection(state, [id]);
    }),
    removeNodes: (ids) => set2((state) => {
      const requested = ids ?? state.selection.selectedIds;
      const targets = requested.filter((id) => nodeAllows(state, id, "delete"));
      if (targets.length === 0) return;
      commit(state, (doc) => removeNodes(doc, targets));
      pruneSelection(state, targets);
    }),
    moveNode: (id, targetZoneKey, index) => set2((state) => {
      if (!nodeAllows(state, id, "drag")) return;
      commit(state, (doc) => moveNode(doc, id, targetZoneKey, index));
    }),
    duplicateNode: (id) => set2((state) => {
      if (!nodeAllows(state, id, "duplicate")) return;
      commit(state, (doc) => duplicateNode(doc, id));
    }),
    duplicateNodes: (ids) => set2((state) => {
      const requested = ids ?? state.selection.selectedIds;
      const targets = requested.filter((id) => nodeAllows(state, id, "duplicate"));
      if (targets.length === 0) return;
      let newIds = [];
      commit(state, (doc) => {
        newIds = duplicateNodes(doc, targets);
      });
      if (newIds.length > 0) {
        state.selection.selectedIds = newIds;
        state.selection.selectedId = newIds[newIds.length - 1];
      }
    }),
    updateProps: (id, patch) => set2((state) => {
      commit(state, (doc) => updateProps(doc, id, patch), id);
    }),
    setRootProps: (patch) => set2((state) => {
      commit(state, (doc) => setRootProps(doc, patch), "__root__");
    }),
    copyNode: (id) => set2((state) => {
      const targetId = id ?? state.selection.selectedId;
      if (!targetId) return;
      const payload = serializeNodeWithZones(state.document, targetId);
      if (!payload) return;
      state.clipboard = payload;
      writeClipboardStorage(payload);
    }),
    cutNode: (id) => set2((state) => {
      const targetId = id ?? state.selection.selectedId;
      if (!targetId) return;
      const payload = serializeNodeWithZones(state.document, targetId);
      if (!payload) return;
      state.clipboard = payload;
      writeClipboardStorage(payload);
      if (!nodeAllows(state, targetId, "delete")) return;
      commit(state, (doc) => removeNode(doc, targetId));
      pruneSelection(state, [targetId]);
    }),
    pasteClipboard: (targetZoneKey, index) => set2((state) => {
      const payload = state.clipboard ?? readClipboardStorage();
      if (!payload) return;
      let zoneKey = targetZoneKey;
      let insertIndex = index;
      if (zoneKey === void 0 && insertIndex === void 0) {
        const primary = state.selection.selectedId;
        const res = primary ? findNodeById(state.document, primary) : null;
        if (res) {
          zoneKey = res.path.zoneKey;
          insertIndex = res.path.index + 1;
        }
      }
      let newId = null;
      commit(state, (doc) => {
        const pasted = pastePayload(doc, payload, zoneKey, insertIndex);
        newId = pasted.props.id;
      });
      if (newId) {
        state.selection.selectedId = newId;
        state.selection.selectedIds = [newId];
      }
    }),
    insertPayload: (payload, targetZoneKey, index) => set2((state) => {
      if (!payload?.node) return;
      let newId = null;
      commit(state, (doc) => {
        const inserted = pastePayload(doc, payload, targetZoneKey, index);
        newId = inserted.props.id;
      });
      if (newId) {
        state.selection.selectedId = newId;
        state.selection.selectedIds = [newId];
      }
    }),
    undo: () => set2((state) => {
      if (state.history.past.length === 0) return;
      const step = state.history.past.pop();
      state.document = applyPatches(state.document, step.inversePatches);
      state.history.future.push(step);
      state._lastCommit = null;
      validateSelection(state);
    }),
    redo: () => set2((state) => {
      if (state.history.future.length === 0) return;
      const step = state.history.future.pop();
      state.document = applyPatches(state.document, step.patches);
      state.history.past.push(step);
      state._lastCommit = null;
      validateSelection(state);
    }),
    setPermissionResolver: (resolver) => set2((state) => {
      state.permissionResolver = resolver;
    })
  }))
);

// src/studio/uiStore.ts
var useUiStore = create((set2) => ({
  mode: "edit",
  leftPanelOpen: false,
  rightPanelOpen: true,
  commandPaletteOpen: false,
  styleClipboard: null,
  setMode: (mode) => set2({ mode }),
  toggleMode: () => set2((s) => ({ mode: s.mode === "edit" ? "preview" : "edit" })),
  toggleLeftPanel: () => set2((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set2((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelOpen: (open) => set2({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set2({ rightPanelOpen: open }),
  setCommandPaletteOpen: (open) => set2({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set2((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setStyleClipboard: (styles) => set2({ styleClipboard: styles })
}));
var StudioContext = createContext(null);
var useStudio = () => {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return ctx;
};

// src/engine/permissions.ts
var DEFAULT_PERMISSIONS = {
  drag: true,
  delete: true,
  duplicate: true,
  edit: true
};
var getNodePermissions = (config, node) => {
  const global = config?.permissions ?? {};
  const comp = config?.components?.[node.type] ?? {};
  let merged = {
    ...DEFAULT_PERMISSIONS,
    ...global,
    ...comp.permissions ?? {}
  };
  if (typeof comp.resolvePermissions === "function") {
    try {
      const dynamic = comp.resolvePermissions(node.props, { changed: {}, lastProps: null }) ?? {};
      merged = { ...merged, ...dynamic };
    } catch {
    }
  }
  return merged;
};

// src/studio/canvas/dndUtils.ts
var TECOF_NODE_ID = "application/tecof-node-id";
var TECOF_BLOCK_TYPE = "application/tecof-block-type";
function createNode(config, type) {
  const compConfig = config?.components?.[type] || {};
  const defaultProps = compConfig.defaultProps || {};
  return {
    type,
    props: {
      id: generateId(),
      ...JSON.parse(JSON.stringify(defaultProps))
    }
  };
}
function readDragData(e) {
  return {
    nodeId: e.dataTransfer.getData(TECOF_NODE_ID),
    type: e.dataTransfer.getData(TECOF_BLOCK_TYPE)
  };
}
function writeDragData(e, payload) {
  if (payload.nodeId) {
    e.dataTransfer.setData(TECOF_NODE_ID, payload.nodeId);
  }
  if (payload.type) {
    e.dataTransfer.setData(TECOF_BLOCK_TYPE, payload.type);
  }
}
function getDragScrollContainer(e) {
  const ownerDoc = e.currentTarget.ownerDocument;
  return ownerDoc.scrollingElement || ownerDoc.documentElement || ownerDoc.body;
}
var EDGE = 64;
var MAX_SPEED = 18;
function createAutoScroller(getContainer) {
  let raf = 0;
  let velocity = 0;
  const getEdgeBounds = (el) => {
    const doc = el.ownerDocument;
    const win = doc.defaultView;
    const isDocumentScroller = el === doc.documentElement || el === doc.body || el === doc.scrollingElement;
    if (isDocumentScroller && win) {
      return { top: 0, bottom: win.innerHeight };
    }
    return el.getBoundingClientRect();
  };
  const loop = () => {
    const el = getContainer();
    if (el && velocity !== 0) {
      el.scrollTop += velocity;
    }
    raf = requestAnimationFrame(loop);
  };
  const update = (clientY) => {
    const el = getContainer();
    if (!el) return;
    const rect = getEdgeBounds(el);
    if (clientY < rect.top + EDGE) {
      const ratio = (rect.top + EDGE - clientY) / EDGE;
      velocity = -Math.ceil(Math.min(1, ratio) * MAX_SPEED);
    } else if (clientY > rect.bottom - EDGE) {
      const ratio = (clientY - (rect.bottom - EDGE)) / EDGE;
      velocity = Math.ceil(Math.min(1, ratio) * MAX_SPEED);
    } else {
      velocity = 0;
    }
    if (!raf) loop();
  };
  const stop = () => {
    velocity = 0;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  return { update, stop };
}
function createEventAutoScroller() {
  let container = null;
  const scroller = createAutoScroller(() => container);
  return {
    update(e) {
      container = getDragScrollContainer(e);
      scroller.update(e.clientY);
    },
    stop() {
      scroller.stop();
      container = null;
    }
  };
}

// src/studio/style/types.ts
var STYLES_PROP = "_tecofStyles";

// src/studio/style/styleClipboard.ts
var cloneStyles = (styles) => JSON.parse(JSON.stringify(styles));
var isEmptyStyles = (styles) => !styles || Object.values(styles).every(
  (layer) => !layer || Object.keys(layer).length === 0
);
function copyNodeStyles(id) {
  const ed = useEditorStore.getState();
  const targetId = ed.selection.selectedId;
  if (!targetId) return false;
  const res = findNodeById(ed.document, targetId);
  const styles = res?.node.props[STYLES_PROP];
  if (isEmptyStyles(styles)) return false;
  useUiStore.getState().setStyleClipboard(cloneStyles(styles));
  return true;
}
function pasteNodeStyles(ids) {
  const buffer = useUiStore.getState().styleClipboard;
  if (!buffer) return;
  const ed = useEditorStore.getState();
  const targets = (ed.selection.selectedIds).filter(Boolean);
  for (const id of targets) {
    ed.updateProps(id, { [STYLES_PROP]: cloneStyles(buffer) });
  }
}
var isMac = typeof navigator !== "undefined" && /Mac|iP(hone|ad)/.test(navigator.platform);
var MOD = isMac ? "\u2318" : "Ctrl";
var CommandPalette = ({ onSave }) => {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const { config } = useStudio();
  const selectedId = useEditorStore((s) => s.selection.selectedId);
  const canUndo = useEditorStore((s) => s.history.past.length > 0);
  const canRedo = useEditorStore((s) => s.history.future.length > 0);
  const hasStyleBuffer = useUiStore((s) => !!s.styleClipboard);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);
  const insertComponent = (type) => {
    const store = useEditorStore.getState();
    const sel = store.selection.selectedId;
    const res = sel ? findNodeById(store.document, sel) : null;
    const node = createNode(config, type);
    store.insertNode(node, res?.path.zoneKey, res ? res.path.index + 1 : void 0);
    store.selectNode(node.props.id);
  };
  const commands = useMemo(() => {
    const s = useEditorStore.getState;
    const ui = useUiStore.getState;
    const hasSel = !!selectedId;
    const selNode = selectedId ? findNodeById(s().document, selectedId)?.node ?? null : null;
    const perms = selNode ? getNodePermissions(config, selNode) : DEFAULT_PERMISSIONS;
    const actions = [
      { id: "undo", label: "Geri Al", group: "Eylemler", icon: /* @__PURE__ */ jsx(Undo2, { size: 15 }), hint: `${MOD}Z`, disabled: !canUndo, run: () => s().undo() },
      { id: "redo", label: "\u0130leri Al", group: "Eylemler", icon: /* @__PURE__ */ jsx(Redo2, { size: 15 }), hint: `${MOD}\u21E7Z`, disabled: !canRedo, run: () => s().redo() },
      { id: "duplicate", label: "\xC7o\u011Falt", group: "Eylemler", icon: /* @__PURE__ */ jsx(CopyPlus, { size: 15 }), hint: `${MOD}D`, keywords: "duplicate kopya", disabled: !hasSel || perms.duplicate === false, run: () => s().duplicateNodes() },
      { id: "copy", label: "Kopyala", group: "Eylemler", icon: /* @__PURE__ */ jsx(Copy, { size: 15 }), hint: `${MOD}C`, disabled: !hasSel, run: () => s().copyNode() },
      { id: "cut", label: "Kes", group: "Eylemler", icon: /* @__PURE__ */ jsx(Scissors, { size: 15 }), hint: `${MOD}X`, disabled: !hasSel || perms.delete === false, run: () => s().cutNode() },
      { id: "paste", label: "Yap\u0131\u015Ft\u0131r", group: "Eylemler", icon: /* @__PURE__ */ jsx(ClipboardPaste, { size: 15 }), hint: `${MOD}V`, run: () => s().pasteClipboard() },
      { id: "delete", label: "Sil", group: "Eylemler", icon: /* @__PURE__ */ jsx(Trash2, { size: 15 }), hint: "\u232B", keywords: "delete kald\u0131r", disabled: !hasSel || perms.delete === false, run: () => s().removeNodes() },
      { id: "copy-styles", label: "Stili Kopyala", group: "Stil", icon: /* @__PURE__ */ jsx(Paintbrush, { size: 15 }), keywords: "style stil kopyala copy", disabled: !hasSel, run: () => copyNodeStyles() },
      { id: "paste-styles", label: "Stili Yap\u0131\u015Ft\u0131r", group: "Stil", icon: /* @__PURE__ */ jsx(Paintbrush, { size: 15 }), keywords: "style stil yap\u0131\u015Ft\u0131r paste", disabled: !hasSel || !hasStyleBuffer, run: () => pasteNodeStyles() },
      { id: "mode", label: ui().mode === "preview" ? "D\xFCzenleme moduna ge\xE7" : "\xD6nizleme moduna ge\xE7", group: "G\xF6r\xFCn\xFCm", icon: ui().mode === "preview" ? /* @__PURE__ */ jsx(Pencil, { size: 15 }) : /* @__PURE__ */ jsx(Eye, { size: 15 }), keywords: "preview \xF6nizleme edit d\xFCzenle", run: () => ui().toggleMode() },
      { id: "left", label: ui().leftPanelOpen ? "Sol paneli gizle" : "Sol paneli g\xF6ster", group: "G\xF6r\xFCn\xFCm", icon: /* @__PURE__ */ jsx(PanelLeft, { size: 15 }), keywords: "panel katman", run: () => ui().toggleLeftPanel() },
      { id: "right", label: ui().rightPanelOpen ? "Sa\u011F paneli gizle" : "Sa\u011F paneli g\xF6ster", group: "G\xF6r\xFCn\xFCm", icon: /* @__PURE__ */ jsx(PanelRight, { size: 15 }), keywords: "panel inspector ayar", run: () => ui().toggleRightPanel() }
    ];
    if (onSave) {
      actions.push({ id: "save", label: "Kaydet", group: "Eylemler", icon: /* @__PURE__ */ jsx(Save, { size: 15 }), hint: `${MOD}S`, keywords: "save taslak", run: onSave });
    }
    const inserts = Object.entries(config.components || {}).map(([type, comp]) => ({
      id: `insert:${type}`,
      label: comp?.label || type,
      group: "Bile\u015Fen Ekle",
      icon: /* @__PURE__ */ jsx(Plus, { size: 15 }),
      keywords: `ekle insert ${type}`,
      run: () => insertComponent(type)
    }));
    return [...actions, ...inserts];
  }, [config, selectedId, canUndo, canRedo, onSave, hasStyleBuffer]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => `${c.label} ${c.group} ${c.keywords || ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);
  if (!open) return null;
  const runAt = (idx) => {
    const cmd = filtered[idx];
    if (!cmd || cmd.disabled) return;
    setOpen(false);
    cmd.run();
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "tecof-cmdk-overlay", onMouseDown: () => setOpen(false), children: /* @__PURE__ */ jsxs("div", { className: "tecof-cmdk-panel", role: "dialog", "aria-label": "Komut paleti", onMouseDown: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-cmdk-input-row", children: [
        /* @__PURE__ */ jsx(Search, { size: 16, className: "tecof-cmdk-search-icon" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            type: "text",
            className: "tecof-cmdk-input",
            placeholder: "Komut ara veya bile\u015Fen ekle\u2026",
            value: query,
            onChange: (e) => {
              setQuery(e.target.value);
              setActive(0);
            },
            onKeyDown
          }
        ),
        /* @__PURE__ */ jsx("kbd", { className: "tecof-cmdk-esc", children: "esc" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "tecof-cmdk-list", ref: listRef, children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "tecof-cmdk-empty", children: "Sonu\xE7 yok" }) : filtered.map((cmd, idx) => {
        const showGroup = idx === 0 || filtered[idx - 1].group !== cmd.group;
        return /* @__PURE__ */ jsxs("div", { children: [
          showGroup && /* @__PURE__ */ jsx("div", { className: "tecof-cmdk-group", children: cmd.group }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: `tecof-cmdk-item${idx === active ? " is-active" : ""}${cmd.disabled ? " is-disabled" : ""}`,
              "data-active": idx === active,
              disabled: cmd.disabled,
              onMouseEnter: () => setActive(idx),
              onClick: () => runAt(idx),
              children: [
                /* @__PURE__ */ jsx("span", { className: "tecof-cmdk-item-icon", children: cmd.icon }),
                /* @__PURE__ */ jsx("span", { className: "tecof-cmdk-item-label", children: cmd.label }),
                cmd.hint && /* @__PURE__ */ jsx("kbd", { className: "tecof-cmdk-item-hint", children: cmd.hint })
              ]
            }
          )
        ] }, cmd.id);
      }) })
    ] }) }),
    document.body
  );
};

// src/utils/index.ts
function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
function hslToHex(h, s, l) {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function lighten(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.min(100, l + amount));
}
function darken(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}
function generateCSSVariables(theme) {
  const lines = [":root {"];
  for (const [key, value] of Object.entries(theme.colors)) {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    lines.push(`  --theme-color-${cssKey}: ${value};`);
  }
  lines.push(`  --theme-font-family: ${theme.typography.fontFamily};`);
  lines.push(`  --theme-heading-font-family: ${theme.typography.headingFontFamily};`);
  lines.push(`  --theme-font-size-base: ${theme.typography.baseFontSize}px;`);
  lines.push(`  --theme-line-height: ${theme.typography.lineHeight};`);
  lines.push(`  --theme-font-weight-normal: ${theme.typography.fontWeightNormal};`);
  lines.push(`  --theme-font-weight-medium: ${theme.typography.fontWeightMedium};`);
  lines.push(`  --theme-font-weight-bold: ${theme.typography.fontWeightBold};`);
  for (const [level, scale] of Object.entries(theme.typography.headingScale)) {
    lines.push(`  --theme-heading-${level}: ${scale}rem;`);
  }
  lines.push(`  --theme-container-max-width: ${theme.spacing.containerMaxWidth}px;`);
  lines.push(`  --theme-section-padding-y: ${theme.spacing.sectionPaddingY}px;`);
  lines.push(`  --theme-section-padding-x: ${theme.spacing.sectionPaddingX}px;`);
  lines.push(`  --theme-component-gap: ${theme.spacing.componentGap}px;`);
  lines.push(`  --theme-border-radius: ${theme.spacing.borderRadius}px;`);
  lines.push(`  --theme-border-radius-lg: ${theme.spacing.borderRadiusLg}px;`);
  lines.push(`  --theme-border-radius-sm: ${theme.spacing.borderRadiusSm}px;`);
  if (theme.customTokens) {
    for (const [key, value] of Object.entries(theme.customTokens)) {
      lines.push(`  --theme-${key}: ${value};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}
function getDefaultTheme() {
  return {
    colors: {
      primary: "#18181b",
      secondary: "#f4f4f5",
      accent: "#3b82f6",
      background: "#ffffff",
      foreground: "#09090b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      border: "#e4e4e7",
      card: "#ffffff",
      cardForeground: "#09090b",
      destructive: "#ef4444"
    },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      headingFontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      baseFontSize: 16,
      lineHeight: 1.6,
      headingScale: {
        h1: 3,
        h2: 2.25,
        h3: 1.875,
        h4: 1.5,
        h5: 1.25,
        h6: 1
      },
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700
    },
    spacing: {
      containerMaxWidth: 1280,
      sectionPaddingY: 80,
      sectionPaddingX: 24,
      componentGap: 24,
      borderRadius: 8,
      borderRadiusLg: 12,
      borderRadiusSm: 4
    }
  };
}
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;
  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  if (aArr !== bArr) return false;
  if (aArr && bArr) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const aObj = a;
  const bObj = b;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
    if (!deepEqual(aObj[key], bObj[key])) return false;
  }
  return true;
}
function mergeTheme(base, overrides) {
  const result = {
    colors: { ...base.colors, ...overrides.colors ?? {} },
    typography: { ...base.typography, ...overrides.typography ?? {} },
    spacing: { ...base.spacing, ...overrides.spacing ?? {} },
    customTokens: { ...base.customTokens ?? {}, ...overrides.customTokens ?? {} }
  };
  if (overrides.typography?.headingScale) {
    result.typography.headingScale = {
      ...base.typography.headingScale,
      ...overrides.typography.headingScale
    };
  }
  return result;
}

// src/studio/theme/theme.ts
var THEME_PROP = "_tecofTheme";
var THEME_STYLE_ID = "tecof-theme-vars";
var resolveTheme = (rootProps) => mergeTheme(getDefaultTheme(), rootProps?.[THEME_PROP] ?? {});

// src/studio/theme/ThemeVars.tsx
var ThemeVars = () => {
  const rootProps = useEditorStore((s) => s.document.root?.props);
  useEffect(() => {
    const css = generateCSSVariables(resolveTheme(rootProps));
    const ensure = (doc) => {
      if (!doc?.head) return;
      let el = doc.getElementById(THEME_STYLE_ID);
      if (!el) {
        el = doc.createElement("style");
        el.id = THEME_STYLE_ID;
        doc.head.appendChild(el);
      }
      if (el.textContent !== css) el.textContent = css;
    };
    ensure(document);
    const iframe = document.querySelector(".tecof-canvas-viewport iframe");
    ensure(iframe?.contentDocument);
  }, [rootProps]);
  return null;
};

// src/engine/migrate.ts
var migrateNode = (node, migration) => {
  const renamed = migration.renameComponents?.[node.type];
  const type = renamed ?? node.type;
  const transform = migration.transformProps?.[type];
  if (!renamed && !transform) return node;
  let props = node.props;
  if (transform) {
    try {
      props = { ...transform(node.props), id: node.props.id };
    } catch {
      props = node.props;
    }
  }
  return { type, props };
};
var migrateDocument = (doc, migration) => {
  if (!migration) return doc;
  const target = migration.version;
  const current2 = Number(doc.root?.props?._schemaVersion ?? 0);
  if (target != null && current2 >= target) return doc;
  const content = doc.content ?? [];
  const zones = doc.zones ?? {};
  let next = {
    root: doc.root ?? { props: {} },
    content: migration.renameComponents || migration.transformProps ? content.map((n) => migrateNode(n, migration)) : content,
    zones: migration.renameComponents || migration.transformProps ? Object.fromEntries(
      Object.entries(zones).map(([key, items]) => [
        key,
        items.map((n) => migrateNode(n, migration))
      ])
    ) : zones
  };
  if (typeof migration.migrate === "function") {
    try {
      next = migration.migrate(next) ?? next;
    } catch {
    }
  }
  if (target != null) {
    next = {
      ...next,
      root: {
        ...next.root,
        props: { ...next.root?.props ?? {}, _schemaVersion: target }
      }
    };
  }
  return next;
};

// src/studio/bridge.ts
var configuredOrigin;
var configureBridge = (origin) => {
  configuredOrigin = origin;
};
var isAllowedOrigin = (origin) => {
  if (configuredOrigin === void 0 || configuredOrigin === "*") return true;
  return origin === configuredOrigin;
};
var isEmbedded = () => typeof window !== "undefined" && window.parent !== window;
var postToHost = (type, payload, origin) => {
  if (!isEmbedded()) return;
  const targetOrigin = configuredOrigin ?? "*";
  window.parent.postMessage({ type, ...payload ?? {} }, targetOrigin);
};
var Frame = ({
  children,
  title = "Canvas Frame",
  className,
  style: _style,
  ...props
}) => {
  const [contentRef, setContentRef] = useState(null);
  const mountNode = contentRef?.contentWindow?.document?.body;
  useEffect(() => {
    if (!contentRef) return;
    const doc = contentRef.contentDocument;
    if (!doc) return;
    const canvasStyle = doc.createElement("style");
    canvasStyle.setAttribute("data-tecof-canvas", "true");
    canvasStyle.textContent = `
        html, body {
          margin: 0;
          padding: 0;
          background-color: transparent;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .tecof-node-wrapper {
          position: relative;
          transition: outline 0.15s ease-in-out;
        }
        /* Custom scrollbars for iframe */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--tecof-scrollbar-thumb);
          border-radius: var(--tecof-radius-xs);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--tecof-scrollbar-thumb-hover);
        }
      `;
    doc.head.appendChild(canvasStyle);
    const mirroredLinks = /* @__PURE__ */ new Map();
    let lastInlineContent = null;
    let inlineStyleNode = null;
    const copyStyles = () => {
      const seenHrefs = /* @__PURE__ */ new Set();
      const inlineParts = [];
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const href = styleSheet.href;
            seenHrefs.add(href);
            if (!mirroredLinks.has(href)) {
              const link = doc.createElement("link");
              link.rel = "stylesheet";
              link.href = href;
              link.setAttribute("data-tecof-mirrored", "link");
              doc.head.appendChild(link);
              mirroredLinks.set(href, link);
            }
          } else {
            const cssRules = Array.from(styleSheet.cssRules).map((rule) => rule.cssText).join("\n");
            inlineParts.push(cssRules);
          }
        } catch (e) {
        }
      });
      mirroredLinks.forEach((link, href) => {
        if (!seenHrefs.has(href)) {
          link.remove();
          mirroredLinks.delete(href);
        }
      });
      const inlineContent = inlineParts.join("\n");
      if (inlineContent !== lastInlineContent) {
        lastInlineContent = inlineContent;
        if (!inlineStyleNode) {
          inlineStyleNode = doc.createElement("style");
          inlineStyleNode.setAttribute("data-tecof-mirrored", "inline");
          doc.head.insertBefore(inlineStyleNode, canvasStyle);
        }
        inlineStyleNode.textContent = inlineContent;
      }
    };
    copyStyles();
    let rafId = null;
    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        copyStyles();
      });
    };
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.head, { childList: true, subtree: true });
    const body = doc.body;
    let handleBodyClick = null;
    let handleIframeKeyDown = null;
    if (body) {
      body.className = "tecof-canvas-body";
      handleBodyClick = (e) => {
        const target = e.target;
        if (!target.closest(".tecof-node-wrapper")) {
          useEditorStore.getState().selectNode(null);
          if (isEmbedded()) {
            postToHost("puck:itemDeselected");
          }
        }
      };
      handleIframeKeyDown = (e) => {
        const event = new KeyboardEvent("keydown", {
          key: e.key,
          code: e.code,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          bubbles: true
        });
        window.dispatchEvent(event);
      };
      body.addEventListener("click", handleBodyClick);
      doc.addEventListener("keydown", handleIframeKeyDown);
    }
    return () => {
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (body && handleBodyClick) {
        body.removeEventListener("click", handleBodyClick);
      }
      if (handleIframeKeyDown) {
        doc.removeEventListener("keydown", handleIframeKeyDown);
      }
    };
  }, [contentRef]);
  return /* @__PURE__ */ jsx(
    "iframe",
    {
      title,
      ref: setContentRef,
      className: ["tecof-canvas-frame", className].filter(Boolean).join(" "),
      ...props,
      children: mountNode && createPortal(children, mountNode)
    }
  );
};

// src/engine/rules.ts
var getComponentConfig = (config, type) => config?.components?.[type] ?? {};
var resolveSlotValue = (value, slotName) => {
  if (value == null) return void 0;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value[slotName];
  }
  return value;
};
var acceptsChildType = (accepts, draggedType) => {
  if (accepts == null || accepts === true) return true;
  if (accepts === false) return false;
  if (Array.isArray(accepts)) return accepts.includes(draggedType);
  return true;
};
var canDropInto = (config, draggedType, targetZoneKey, doc) => {
  if (!targetZoneKey) {
    const childConfig2 = getComponentConfig(config, draggedType);
    if (Array.isArray(childConfig2.allowedParents) && childConfig2.allowedParents.length > 0) {
      return false;
    }
    return true;
  }
  const { parentId, slotName } = parseZoneKey(targetZoneKey);
  const parentType = resolveNodeType(doc, parentId);
  const childConfig = getComponentConfig(config, draggedType);
  if (Array.isArray(childConfig.allowedParents) && childConfig.allowedParents.length > 0) {
    if (!parentType || !childConfig.allowedParents.includes(parentType)) {
      return false;
    }
  }
  if (parentType) {
    const parentConfig = getComponentConfig(config, parentType);
    const accepts = resolveSlotValue(parentConfig.acceptsChildren, slotName);
    if (!acceptsChildType(accepts, draggedType)) {
      return false;
    }
  }
  return true;
};
var canAcceptMoreItems = (config, targetZoneKey, doc) => {
  if (!targetZoneKey) return true;
  const { parentId, slotName } = parseZoneKey(targetZoneKey);
  const parentType = resolveNodeType(doc, parentId);
  if (!parentType) return true;
  const parentConfig = getComponentConfig(config, parentType);
  const max = resolveSlotValue(parentConfig.maxItems, slotName);
  if (typeof max !== "number") return true;
  const current2 = doc.zones[targetZoneKey]?.length ?? 0;
  return current2 < max;
};
var isValidDrop = (config, draggedType, targetZoneKey, doc) => canDropInto(config, draggedType, targetZoneKey, doc) && canAcceptMoreItems(config, targetZoneKey, doc);
var resolveNodeType = (doc, id) => {
  for (const node of doc.content) {
    if (node.props.id === id) return node.type;
  }
  for (const items of Object.values(doc.zones)) {
    for (const node of items) {
      if (node.props.id === id) return node.type;
    }
  }
  return null;
};

// src/studio/canvas/useDropTarget.ts
var getDropAxis = (wrapperEl) => {
  const item = wrapperEl.closest(".tecof-node");
  const container = item?.parentElement;
  const win = container?.ownerDocument?.defaultView;
  if (!container || !win) return "y";
  const cs = win.getComputedStyle(container);
  const display = cs.display;
  if (display === "flex" || display === "inline-flex") {
    return cs.flexDirection.startsWith("row") ? "x" : "y";
  }
  if (display === "grid" || display === "inline-grid") {
    const cols = cs.gridTemplateColumns.split(" ").filter((t) => t && t !== "none").length;
    return cols > 1 ? "x" : "y";
  }
  return display.startsWith("inline") ? "x" : "y";
};
var resolveDraggedType = (nodeId, type) => {
  if (type) return type;
  if (nodeId) {
    const doc = useEditorStore.getState().document;
    const res = findNodeById(doc, nodeId);
    return res?.node.type ?? null;
  }
  return null;
};
var useDropTarget = (options) => {
  const { zoneKey, positional = false, index = 0, getIndex, locked = false, selfId } = options;
  const { config } = useStudio();
  const insertNode2 = useEditorStore((state) => state.insertNode);
  const moveNode2 = useEditorStore((state) => state.moveNode);
  const endDrag = useEditorStore((state) => state.endDrag);
  const autoScrollerRef = useRef(createEventAutoScroller());
  const [position, setPosition] = useState(null);
  const [axis, setAxis] = useState("y");
  const [isDragOver, setIsDragOver] = useState(false);
  const checkValid = (e) => {
    const { nodeId, type } = readDragData(e);
    if (nodeId && selfId && nodeId === selfId) return false;
    const draggedType = resolveDraggedType(nodeId, type);
    if (!draggedType) return true;
    const doc = useEditorStore.getState().document;
    return isValidDrop(config, draggedType, zoneKey, doc);
  };
  const onDragOver = useCallback(
    (e) => {
      if (locked) return;
      e.preventDefault();
      if (positional) e.stopPropagation();
      if (!checkValid(e)) {
        e.dataTransfer.dropEffect = "none";
        autoScrollerRef.current.stop();
        setPosition(null);
        setIsDragOver(false);
        return;
      }
      autoScrollerRef.current.update(e);
      if (positional) {
        const el = e.currentTarget;
        const dropAxis = getDropAxis(el);
        const rect = el.getBoundingClientRect();
        const before = dropAxis === "x" ? e.clientX - rect.left < rect.width / 2 : e.clientY - rect.top < rect.height / 2;
        setAxis(dropAxis);
        setPosition(before ? "before" : "after");
      } else {
        setIsDragOver(true);
      }
    },
    // checkValid/checkValid deps are captured fresh on each render via closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked, positional, zoneKey, config]
  );
  const onDragLeave = useCallback((e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    autoScrollerRef.current.stop();
    setPosition(null);
    setIsDragOver(false);
  }, []);
  const onDrop = useCallback(
    (e) => {
      if (locked) return;
      e.preventDefault();
      if (positional) e.stopPropagation();
      autoScrollerRef.current.stop();
      const valid = checkValid(e);
      const droppedPosition = position;
      setPosition(null);
      setIsDragOver(false);
      if (!valid) {
        endDrag();
        return;
      }
      const { nodeId, type } = readDragData(e);
      const targetIndex = positional ? droppedPosition === "before" ? index : index + 1 : getIndex ? getIndex() : 0;
      if (nodeId && nodeId !== selfId) {
        moveNode2(nodeId, zoneKey, targetIndex);
      } else if (type) {
        insertNode2(createNode(config, type), zoneKey, targetIndex);
      }
      endDrag();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked, positional, index, getIndex, zoneKey, config, selfId, position, moveNode2, insertNode2, endDrag]
  );
  return { position, axis, isDragOver, onDragOver, onDragLeave, onDrop };
};
var ParentNodeContext = createContext(null);
var DropZone = ({ zone, className, style, orientation = "vertical" }) => {
  const parentId = useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const { readOnly } = useStudio();
  const isDragActive = useEditorStore((state) => state.drag != null);
  const items = useEditorStore((state) => state.document.zones[zoneKey]) || [];
  const { isDragOver, onDragOver, onDragLeave, onDrop } = useDropTarget({
    zoneKey,
    locked: readOnly,
    getIndex: () => items.length
  });
  const dropzoneClassName = [
    "tecof-dropzone",
    orientation === "horizontal" ? "is-horizontal" : "",
    items.length === 0 ? "is-empty" : "",
    isDragOver ? "is-dragover" : "",
    isDragActive ? "is-drag-active" : "",
    className
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: dropzoneClassName,
      onDragOver,
      onDragLeave,
      onDrop,
      style,
      "data-tecof-zone": zoneKey,
      "data-tecof-orientation": orientation,
      children: items.length === 0 ? /* @__PURE__ */ jsx("span", { className: "tecof-dropzone-hint", children: isDragOver ? "Buraya B\u0131rak\u0131n" : "Bile\u015Fen S\xFCr\xFCkleyin" }) : items.map((item, index) => /* @__PURE__ */ jsx(NodeRenderer, { node: item, index, zoneKey }, item.props.id))
    }
  );
};
var renderDropZone = ({ zone, className, style, orientation }) => {
  return /* @__PURE__ */ jsx(DropZone, { zone, className, style, orientation });
};

// src/studio/canvas/dragGhost.ts
function setDragGhost(e, label) {
  const ownerDoc = e.currentTarget?.ownerDocument || (typeof document !== "undefined" ? document : null);
  if (!ownerDoc) return;
  const ghost = ownerDoc.createElement("div");
  ghost.className = "tecof-drag-ghost";
  ghost.textContent = label;
  ownerDoc.body.appendChild(ghost);
  try {
    e.dataTransfer.setDragImage(ghost, 14, 14);
  } catch {
  }
  const win = ownerDoc.defaultView || window;
  win.requestAnimationFrame(() => {
    win.requestAnimationFrame(() => ghost.remove());
  });
}
var VALID_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "div"];
var resolveMatch = (target, wrapper, node, text, defaultLang) => {
  const marked = target.closest("[data-tecof-prop]");
  if (marked && (!wrapper || wrapper.contains(marked))) {
    const propName = marked.getAttribute("data-tecof-prop");
    if (propName) {
      const lang = marked.getAttribute("data-tecof-lang");
      const isMultilingual = Array.isArray(node.props[propName]);
      return {
        propName,
        isMultilingual,
        langCode: lang || defaultLang
      };
    }
  }
  for (const [key, value] of Object.entries(node.props)) {
    if (typeof value === "string" && value.trim() === text) {
      return { propName: key, isMultilingual: false, langCode: defaultLang };
    }
    if (Array.isArray(value)) {
      const matchedItem = value.find(
        (item) => item && typeof item === "object" && typeof item.value === "string" && item.value.trim() === text
      );
      if (matchedItem) {
        return {
          propName: key,
          isMultilingual: true,
          langCode: matchedItem.code
        };
      }
    }
  }
  return null;
};
var useInlineEdit = (node, locked) => {
  const onDoubleClick = useCallback(
    (e) => {
      if (locked) return;
      const target = e.target;
      const tag = target.tagName.toLowerCase();
      if (!VALID_TAGS.includes(tag)) return;
      const text = target.textContent?.trim() || "";
      if (!text) return;
      const ownerDoc = target.ownerDocument;
      const ownerWin = ownerDoc.defaultView;
      const defaultLang = ownerDoc.documentElement.lang || "tr";
      const wrapper = target.closest("[data-tecof-id]");
      const match = resolveMatch(target, wrapper, node, text, defaultLang);
      if (!match) return;
      e.stopPropagation();
      const { propName, isMultilingual, langCode } = match;
      const originalText = target.textContent || "";
      target.contentEditable = "true";
      target.setAttribute("data-tecof-inline-editing", "true");
      target.focus();
      const range = ownerDoc.createRange();
      range.selectNodeContents(target);
      const sel = ownerWin?.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      const commitInlineEdit = () => {
        target.contentEditable = "false";
        target.removeAttribute("data-tecof-inline-editing");
        target.removeEventListener("blur", handleBlur);
        target.removeEventListener("keydown", handleKeyDown);
        const newText = target.textContent?.trim() || "";
        if (isMultilingual) {
          const currentArray = Array.isArray(node.props[propName]) ? node.props[propName] : [];
          const updatedArray = currentArray.map((item) => {
            if (item && item.code === langCode) {
              return { ...item, value: newText };
            }
            return item;
          });
          if (!updatedArray.some((item) => item && item.code === langCode)) {
            updatedArray.push({ code: langCode, value: newText });
          }
          useEditorStore.getState().updateProps(node.props.id, {
            [propName]: updatedArray
          });
        } else {
          useEditorStore.getState().updateProps(node.props.id, {
            [propName]: newText
          });
        }
      };
      const cancelInlineEdit = () => {
        target.textContent = originalText;
        target.contentEditable = "false";
        target.removeAttribute("data-tecof-inline-editing");
        target.removeEventListener("blur", handleBlur);
        target.removeEventListener("keydown", handleKeyDown);
      };
      const handleBlur = () => {
        commitInlineEdit();
      };
      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancelInlineEdit();
          return;
        }
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          target.blur();
        }
      };
      target.addEventListener("blur", handleBlur);
      target.addEventListener("keydown", handleKeyDown);
    },
    [node, locked]
  );
  return { onDoubleClick };
};
var NodeErrorBoundary = class extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error(
      `[TecofEditor] Component "${this.props.type || "unknown"}" render crashed:`,
      error,
      errorInfo
    );
  }
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxs("div", { className: "tecof-node-error", children: [
        /* @__PURE__ */ jsx("div", { className: "tecof-node-error-icon", children: "\u26A0\uFE0F" }),
        /* @__PURE__ */ jsxs("div", { className: "tecof-node-error-content", children: [
          /* @__PURE__ */ jsxs("p", { className: "tecof-node-error-title", children: [
            "Bile\u015Fen render hatas\u0131: ",
            this.props.label || this.props.type || "Bilinmeyen bile\u015Fen"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "tecof-node-error-detail", children: this.state.error?.message || "Beklenmeyen bir hata olu\u015Ftu" })
        ] })
      ] });
    }
    return this.props.children;
  }
};

// src/studio/style/tokens.ts
var isArbitrary = (value) => value.length > 1 && value.startsWith("[") && value.endsWith("]");
var arbitraryRaw = (value) => isArbitrary(value) ? value.slice(1, -1) : value;
var toArbitrary = (raw) => `[${raw}]`;
var SPACE = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24"];
var spaceOptions = () => SPACE.map((v) => ({ label: v, value: v }));
var THEME_COLORS = [
  { label: "Tema \xB7 Ana renk", key: "primary" },
  { label: "Tema \xB7 \u0130kincil", key: "secondary" },
  { label: "Tema \xB7 Vurgu", key: "accent" },
  { label: "Tema \xB7 Arka plan", key: "background" },
  { label: "Tema \xB7 Metin", key: "foreground" },
  { label: "Tema \xB7 Soluk", key: "muted" },
  { label: "Tema \xB7 Soluk metin", key: "muted-foreground" },
  { label: "Tema \xB7 Kenarl\u0131k", key: "border" },
  { label: "Tema \xB7 Kart", key: "card" },
  { label: "Tema \xB7 Kart metin", key: "card-foreground" },
  { label: "Tema \xB7 Uyar\u0131", key: "destructive" }
];
var THEME_COLOR_OPTIONS = THEME_COLORS.map(({ label, key }) => ({
  label,
  value: `[var(--theme-color-${key})]`,
  swatch: `var(--theme-color-${key})`
}));
var COLOR_OPTIONS = [
  { label: "Yok", value: "" },
  { label: "\u015Eeffaf", value: "transparent", swatch: "transparent" },
  { label: "Beyaz", value: "white", swatch: "#ffffff" },
  { label: "Siyah", value: "black", swatch: "#000000" },
  // Live theme colors (host --theme-color-* variables)
  ...THEME_COLOR_OPTIONS,
  // Brand palette (Tailwind v4 @theme: --color-primary-*)
  ...["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map((s) => ({
    label: `Primary ${s}`,
    value: `primary-${s}`,
    swatch: `var(--tecof-primary-${s})`
  })),
  // A few neutrals (Tailwind defaults)
  { label: "Zinc 100", value: "zinc-100", swatch: "#f4f4f5" },
  { label: "Zinc 300", value: "zinc-300", swatch: "#d4d4d8" },
  { label: "Zinc 500", value: "zinc-500", swatch: "#71717a" },
  { label: "Zinc 700", value: "zinc-700", swatch: "#3f3f46" },
  { label: "Zinc 900", value: "zinc-900", swatch: "#18181b" }
];
var opts = (values, withNone = true) => [
  ...withNone ? [{ label: "\u2014", value: "" }] : [],
  ...values.map((v) => ({ label: v, value: v }))
];
var withArbitrary = (prefix, preset) => (value) => {
  if (!value) return null;
  if (isArbitrary(value)) return `${prefix}-${value}`;
  return preset(value);
};
var STYLE_CONTROLS = [
  // Layout
  {
    id: "display",
    label: "Display",
    group: "layout",
    type: "select",
    options: opts(["block", "inline-block", "flex", "inline-flex", "grid", "hidden"]),
    toClass: (v) => v || null
  },
  {
    id: "flexDir",
    label: "Y\xF6n",
    group: "layout",
    type: "segment",
    options: opts(["row", "col"]),
    toClass: (v) => v ? `flex-${v}` : null
  },
  {
    id: "justify",
    label: "Yatay hiza",
    group: "layout",
    type: "select",
    options: opts(["start", "center", "end", "between", "around", "evenly"]),
    toClass: (v) => v ? `justify-${v}` : null
  },
  {
    id: "items",
    label: "Dikey hiza",
    group: "layout",
    type: "select",
    options: opts(["start", "center", "end", "stretch", "baseline"]),
    toClass: (v) => v ? `items-${v}` : null
  },
  {
    id: "gap",
    label: "Bo\u015Fluk (gap)",
    group: "layout",
    type: "space",
    options: spaceOptions(),
    arbitraryPrefix: "gap",
    toClass: withArbitrary("gap", (v) => `gap-${v}`)
  },
  {
    id: "alignSelf",
    label: "Bireysel Hiza (self)",
    group: "layout",
    type: "select",
    options: opts(["auto", "start", "center", "end", "stretch"]),
    toClass: (v) => v ? `self-${v}` : null
  },
  // Spacing — padding
  { id: "p", label: "Padding", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "p", toClass: withArbitrary("p", (v) => `p-${v}`) },
  { id: "px", label: "Padding X", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "px", toClass: withArbitrary("px", (v) => `px-${v}`) },
  { id: "py", label: "Padding Y", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "py", toClass: withArbitrary("py", (v) => `py-${v}`) },
  // Spacing — margin
  { id: "m", label: "Margin", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "m", toClass: withArbitrary("m", (v) => `m-${v}`) },
  { id: "mx", label: "Margin X", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "mx", toClass: withArbitrary("mx", (v) => `mx-${v}`) },
  { id: "my", label: "Margin Y", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "my", toClass: withArbitrary("my", (v) => `my-${v}`) },
  {
    id: "marginAlign",
    label: "\xD6zel Hiza (margin)",
    group: "spacing",
    type: "select",
    options: [
      { label: "\u2014", value: "" },
      { label: "Sola Yasla (ml-auto)", value: "l-auto" },
      { label: "Sa\u011Fa Yasla (mr-auto)", value: "r-auto" },
      { label: "Yatay Merkez (mx-auto)", value: "x-auto" },
      { label: "Merkez (m-auto)", value: "auto" }
    ],
    toClass: (v) => v ? v === "auto" ? "m-auto" : v === "l-auto" ? "ml-auto" : v === "r-auto" ? "mr-auto" : "mx-auto" : null
  },
  // Sizing
  {
    id: "w",
    label: "Geni\u015Flik",
    group: "sizing",
    type: "select",
    options: opts(["auto", "full", "screen", "1/2", "1/3", "2/3", "1/4", "3/4", "fit"]),
    arbitraryPrefix: "w",
    toClass: withArbitrary("w", (v) => `w-${v}`)
  },
  {
    id: "h",
    label: "Y\xFCkseklik",
    group: "sizing",
    type: "select",
    options: opts(["auto", "full", "screen", "fit"]),
    arbitraryPrefix: "h",
    toClass: withArbitrary("h", (v) => `h-${v}`)
  },
  {
    id: "maxW",
    label: "Maks. geni\u015Flik",
    group: "sizing",
    type: "select",
    options: opts(["none", "sm", "md", "lg", "xl", "2xl", "4xl", "6xl", "full"]),
    arbitraryPrefix: "max-w",
    toClass: withArbitrary("max-w", (v) => `max-w-${v}`)
  },
  // Background
  {
    id: "bg",
    label: "Arka plan",
    group: "background",
    type: "color",
    options: COLOR_OPTIONS,
    arbitraryPrefix: "bg",
    toClass: withArbitrary("bg", (v) => `bg-${v}`)
  },
  // Typography
  {
    id: "text",
    label: "Metin rengi",
    group: "typography",
    type: "color",
    options: COLOR_OPTIONS,
    arbitraryPrefix: "text",
    toClass: withArbitrary("text", (v) => `text-${v}`)
  },
  {
    id: "fontSize",
    label: "Yaz\u0131 boyutu",
    group: "typography",
    type: "select",
    options: opts(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"]),
    toClass: (v) => v ? `text-${v}` : null
  },
  {
    id: "fontWeight",
    label: "Kal\u0131nl\u0131k",
    group: "typography",
    type: "select",
    options: opts(["normal", "medium", "semibold", "bold", "extrabold"]),
    toClass: (v) => v ? `font-${v}` : null
  },
  {
    id: "align",
    label: "Metin hizas\u0131",
    group: "typography",
    type: "segment",
    options: opts(["left", "center", "right", "justify"]),
    toClass: (v) => v ? `text-${v}` : null
  },
  {
    id: "leading",
    label: "Sat\u0131r y\xFCks.",
    group: "typography",
    type: "select",
    options: opts(["none", "tight", "snug", "normal", "relaxed", "loose"]),
    toClass: (v) => v ? `leading-${v}` : null
  },
  // Border
  {
    id: "radius",
    label: "K\xF6\u015Fe yar\u0131\xE7ap\u0131",
    group: "border",
    type: "select",
    options: opts(["none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"]),
    toClass: (v) => v ? v === "md" ? "rounded" : `rounded-${v}` : null
  },
  {
    id: "border",
    label: "Kenarl\u0131k",
    group: "border",
    type: "select",
    options: opts(["0", "2", "4", "8"]),
    toClass: (v) => v ? v === "1" ? "border" : `border-${v}` : null
  },
  {
    id: "borderColor",
    label: "Kenarl\u0131k rengi",
    group: "border",
    type: "color",
    options: COLOR_OPTIONS,
    arbitraryPrefix: "border",
    toClass: withArbitrary("border", (v) => `border-${v}`)
  },
  // Effects
  {
    id: "shadow",
    label: "G\xF6lge",
    group: "effects",
    type: "select",
    options: opts(["none", "sm", "md", "lg", "xl", "2xl"]),
    toClass: (v) => v ? v === "md" ? "shadow" : `shadow-${v}` : null
  },
  {
    id: "opacity",
    label: "Saydaml\u0131k",
    group: "effects",
    type: "select",
    options: opts(["0", "25", "50", "75", "90", "100"]),
    toClass: (v) => v ? `opacity-${v}` : null
  }
];
var CONTROL_BY_ID = Object.fromEntries(
  STYLE_CONTROLS.map((c) => [c.id, c])
);
var GROUP_LABELS = {
  layout: "Yerle\u015Fim",
  spacing: "Bo\u015Fluk",
  sizing: "Boyut",
  typography: "Tipografi",
  background: "Arka Plan",
  border: "Kenarl\u0131k",
  effects: "Efektler"
};
var BP_PREFIX = { base: "", sm: "sm:", md: "md:", lg: "lg:", xl: "xl:" };
var STATE_PREFIX = { hover: "hover:", focus: "focus:", active: "active:" };
function getSafelist() {
  const bpPrefixes = ["", ...Object.values(BP_PREFIX).filter(Boolean)];
  const statePrefixes = ["", ...Object.values(STATE_PREFIX)];
  const prefixes = /* @__PURE__ */ new Set();
  for (const bp of bpPrefixes) {
    for (const state of statePrefixes) prefixes.add(bp + state);
  }
  const set2 = /* @__PURE__ */ new Set();
  for (const control of STYLE_CONTROLS) {
    for (const opt of control.options) {
      const cls = control.toClass(opt.value);
      if (!cls) continue;
      for (const prefix of prefixes) set2.add(prefix + cls);
    }
  }
  return Array.from(set2);
}

// src/studio/style/compileStyles.ts
function emit(props, prefix) {
  if (!props) return [];
  const out = [];
  for (const [id, value] of Object.entries(props)) {
    if (!value) continue;
    const control = CONTROL_BY_ID[id];
    if (!control) continue;
    const cls = control.toClass(value);
    if (cls) out.push(prefix + cls);
  }
  return out;
}
function compileStyles(styles) {
  if (!styles) return "";
  const classes = [
    ...emit(styles.base, BP_PREFIX.base),
    ...emit(styles.sm, BP_PREFIX.sm),
    ...emit(styles.md, BP_PREFIX.md),
    ...emit(styles.lg, BP_PREFIX.lg),
    ...emit(styles.xl, BP_PREFIX.xl)
  ];
  if (styles.states) {
    for (const [key, props] of Object.entries(styles.states)) {
      const [a, b] = key.split(":");
      const bp = b ? a : "base";
      const state = b ? b : a;
      const prefix = (BP_PREFIX[bp] || "") + (STATE_PREFIX[state] || "");
      classes.push(...emit(props, prefix));
    }
  }
  return classes.join(" ");
}
function mergeClassName(authorClassName, styleClassName) {
  return [authorClassName, styleClassName].filter(Boolean).join(" ").trim();
}
function collectStyleClasses(styles) {
  const compiled = compileStyles(styles);
  return compiled ? compiled.split(" ") : [];
}
function collectDocumentClasses(doc) {
  if (!doc) return [];
  const set2 = /* @__PURE__ */ new Set();
  const visit = (props) => {
    const styles = props?.[STYLES_PROP];
    if (styles) for (const cls of collectStyleClasses(styles)) set2.add(cls);
  };
  visit(doc.root?.props);
  for (const node of doc.content ?? []) visit(node.props);
  for (const items of Object.values(doc.zones ?? {})) {
    for (const node of items) visit(node.props);
  }
  return Array.from(set2);
}
function useInlineDragRef({
  node,
  index,
  zoneKey,
  locked,
  wrapperClassName,
  label,
  beginDrag,
  endDrag,
  handleMouseEnter,
  handleMouseLeave,
  handleClick,
  onDoubleClick,
  onDragOver,
  onDragLeave,
  onDrop
}) {
  const nodeRef = useRef(null);
  const callbacks = useRef({
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    onDoubleClick,
    onDragOver,
    onDragLeave,
    onDrop,
    beginDrag,
    endDrag
  });
  useEffect(() => {
    callbacks.current = {
      handleMouseEnter,
      handleMouseLeave,
      handleClick,
      onDoubleClick,
      onDragOver,
      onDragLeave,
      onDrop,
      beginDrag,
      endDrag
    };
  });
  const setRef = useCallback((el) => {
    if (nodeRef.current) {
      const old = nodeRef.current;
      old.removeAttribute("data-tecof-id");
      old.removeAttribute("data-tecof-type");
      old.removeAttribute("data-tecof-index");
      old.removeAttribute("data-tecof-zone");
      old.removeAttribute("draggable");
      const classesToRemove = wrapperClassName.split(" ").filter(Boolean);
      if (classesToRemove.length > 0) {
        old.classList.remove(...classesToRemove);
      }
    }
    if (el) {
      el.setAttribute("data-tecof-id", node.props.id);
      el.setAttribute("data-tecof-type", node.type);
      el.setAttribute("data-tecof-index", String(index));
      el.setAttribute("data-tecof-zone", zoneKey || "root");
      if (!locked) {
        el.setAttribute("draggable", "true");
      }
      const classesToAdd = wrapperClassName.split(" ").filter(Boolean);
      if (classesToAdd.length > 0) {
        el.classList.add(...classesToAdd);
      }
    }
    nodeRef.current = el;
  }, [node.props.id, node.type, index, zoneKey, locked, wrapperClassName]);
  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const onMouseEnter = (e) => callbacks.current.handleMouseEnter(e);
    const onMouseLeave = (e) => callbacks.current.handleMouseLeave(e);
    const onClick = (e) => callbacks.current.handleClick(e);
    const onDblClick = (e) => callbacks.current.onDoubleClick(e);
    const onNativeDragOver = (e) => callbacks.current.onDragOver(e);
    const onNativeDragLeave = (e) => callbacks.current.onDragLeave(e);
    const onNativeDrop = (e) => callbacks.current.onDrop(e);
    const onDragStart = (e) => {
      if (locked) return;
      writeDragData(e, { nodeId: node.props.id });
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
      }
      setDragGhost(e, label);
      callbacks.current.beginDrag({ id: node.props.id });
    };
    const onDragEnd = () => {
      if (locked) return;
      callbacks.current.endDrag();
    };
    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("click", onClick);
    el.addEventListener("dblclick", onDblClick);
    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("dragend", onDragEnd);
    el.addEventListener("dragover", onNativeDragOver);
    el.addEventListener("dragleave", onNativeDragLeave);
    el.addEventListener("drop", onNativeDrop);
    return () => {
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("click", onClick);
      el.removeEventListener("dblclick", onDblClick);
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("dragend", onDragEnd);
      el.removeEventListener("dragover", onNativeDragOver);
      el.removeEventListener("dragleave", onNativeDragLeave);
      el.removeEventListener("drop", onNativeDrop);
    };
  }, [locked, node.props.id, label, setRef]);
  return setRef;
}

// src/studio/usePermissions.ts
var usePermissions = (id) => {
  const { config } = useStudio();
  const node = useEditorStore(
    (state) => id ? findNodeById(state.document, id)?.node ?? null : null
  );
  if (!node) return DEFAULT_PERMISSIONS;
  return getNodePermissions(config, node);
};
var NodeRenderer = ({ node, index, zoneKey }) => {
  const { config, metadata, readOnly: studioReadOnly } = useStudio();
  const mode = useUiStore((s) => s.mode);
  const locked = studioReadOnly || mode === "preview";
  const componentConfig = config.components[node.type];
  const perms = usePermissions(node.props.id);
  const dragLocked = locked || perms.drag === false;
  const selectNode = useEditorStore((state) => state.selectNode);
  const toggleSelect = useEditorStore((state) => state.toggleSelect);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const isHovered = useEditorStore((state) => state.selection.hoveredId === node.props.id);
  const isDragging = useEditorStore((state) => state.drag?.id === node.props.id);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);
  const handleMouseEnter = useCallback(
    (e) => {
      if (locked) return;
      e.stopPropagation();
      hoverNode(node.props.id);
    },
    [hoverNode, node.props.id, locked]
  );
  const handleMouseLeave = useCallback(
    (e) => {
      if (locked) return;
      e.stopPropagation();
      if (isHovered) {
        hoverNode(null);
      }
    },
    [hoverNode, node.props.id, isHovered, locked]
  );
  const handleClick = useCallback(
    (e) => {
      if (locked) return;
      e.stopPropagation();
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        toggleSelect(node.props.id);
        return;
      }
      selectNode(node.props.id);
      if (isEmbedded()) {
        postToHost("puck:itemSelected", {
          item: {
            type: node.type,
            id: node.props.id
          }
        });
      }
    },
    [selectNode, toggleSelect, node.props.id, node.type, locked]
  );
  const { onDoubleClick } = useInlineEdit(node, locked);
  const { position, axis, onDragOver, onDragLeave, onDrop } = useDropTarget({
    zoneKey,
    positional: true,
    index,
    locked,
    selfId: node.props.id
  });
  if (!componentConfig) {
    return /* @__PURE__ */ jsxs("div", { className: "tecof-node-missing", children: [
      "Bile\u015Fen bulunamad\u0131: ",
      node.type
    ] });
  }
  const label = componentConfig.label || node.type;
  const wrapperClassName = [
    "tecof-node-wrapper",
    locked ? "is-readonly" : "",
    isDragging ? "is-dragging" : ""
  ].filter(Boolean).join(" ");
  const styleClassName = compileStyles(node.props[STYLES_PROP]);
  const dragRef = useInlineDragRef({
    node,
    index,
    zoneKey,
    locked,
    wrapperClassName,
    label,
    beginDrag,
    endDrag,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    onDoubleClick,
    onDragOver,
    onDragLeave,
    onDrop
  });
  const componentProps = {
    ...node.props,
    className: mergeClassName(node.props.className, styleClassName),
    puck: {
      dragRef: componentConfig.inline ? dragRef : void 0,
      renderDropZone,
      isEditing: !locked,
      metadata: {
        ...metadata || {},
        ...componentConfig.metadata || {}
      }
    },
    editMode: !locked
  };
  if (componentConfig.fields) {
    Object.entries(componentConfig.fields).forEach(([fieldName, fieldDef]) => {
      if (fieldDef && fieldDef.type === "slot") {
        componentProps[fieldName] = renderDropZone({ zone: fieldName, orientation: fieldDef.orientation });
      }
    });
  }
  const errorResetKey = `${node.props.id}:${JSON.stringify(node.props)}`;
  return /* @__PURE__ */ jsx(ParentNodeContext.Provider, { value: node.props.id, children: componentConfig.inline ? /* @__PURE__ */ jsxs(Fragment, { children: [
    position && /* @__PURE__ */ jsx("div", { className: `tecof-drop-indicator is-${axis} is-${position}` }),
    /* @__PURE__ */ jsx(NodeErrorBoundary, { label, type: node.type, resetKey: errorResetKey, children: componentConfig.render(componentProps) })
  ] }) : /* @__PURE__ */ jsxs("div", { className: "tecof-node", children: [
    position && /* @__PURE__ */ jsx("div", { className: `tecof-drop-indicator is-${axis} is-${position}` }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: wrapperClassName,
        "data-tecof-id": node.props.id,
        "data-tecof-type": node.type,
        "data-tecof-index": index,
        "data-tecof-zone": zoneKey || "root",
        draggable: !dragLocked,
        onDragStart: (e) => {
          writeDragData(e, { nodeId: node.props.id });
          e.dataTransfer.effectAllowed = "move";
          setDragGhost(e, label);
          beginDrag({ id: node.props.id });
        },
        onDragEnd: () => {
          endDrag();
        },
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onClick: handleClick,
        onDoubleClick,
        onDragOver,
        onDragLeave,
        onDrop,
        children: /* @__PURE__ */ jsx(NodeErrorBoundary, { label, type: node.type, resetKey: errorResetKey, children: componentConfig.render(componentProps) })
      }
    )
  ] }) });
};
var AddSectionButton = ({ index, onClick, disabled }) => {
  if (disabled) return null;
  return /* @__PURE__ */ jsxs("div", { className: "tecof-add-section-divider", children: [
    /* @__PURE__ */ jsx("div", { className: "tecof-add-section-line" }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "tecof-add-section-btn",
        onClick: () => onClick(index),
        title: "Buraya B\xF6l\xFCm Ekle",
        children: [
          /* @__PURE__ */ jsx(Plus, { size: 12, className: "tecof-add-section-icon" }),
          /* @__PURE__ */ jsx("span", { children: "B\xF6l\xFCm Ekle" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "tecof-add-section-line" })
  ] });
};
var PREVIEW_REFERENCE_WIDTH = 1280;
var PreviewErrorBoundary = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Preview render failed:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsx("div", { className: "tecof-modal-preview-fallback", children: "\xD6nizleme Y\xFCklenemedi" });
    }
    return this.props.children;
  }
};
var PreviewComponent = ({ renderFn, props }) => {
  return /* @__PURE__ */ jsx(PreviewErrorBoundary, { children: renderFn(props) });
};
var AutoScalePreview = ({ mode, children }) => {
  const boxRef = useRef(null);
  const stageRef = useRef(null);
  const [scale, setScale] = useState(mode === "section" ? 0.2 : 1);
  useEffect(() => {
    const box = boxRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return;
    const update = () => {
      const boxWidth = box.clientWidth;
      const boxHeight = box.clientHeight;
      if (boxWidth <= 0 || boxHeight <= 0) return;
      if (mode === "section") {
        setScale(boxWidth / PREVIEW_REFERENCE_WIDTH);
        return;
      }
      const naturalWidth = stage.scrollWidth || 1;
      const naturalHeight = stage.scrollHeight || 1;
      const pad = 28;
      const next = Math.min(
        1,
        (boxWidth - pad) / naturalWidth,
        (boxHeight - pad) / naturalHeight
      );
      setScale(next > 0 ? next : 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [mode]);
  return /* @__PURE__ */ jsx("div", { ref: boxRef, className: `tecof-modal-preview-box mode-${mode}`, children: /* @__PURE__ */ jsx(
    "div",
    {
      ref: stageRef,
      className: "tecof-modal-preview-stage",
      style: mode === "section" ? { width: PREVIEW_REFERENCE_WIDTH, transform: `scale(${scale})` } : { transform: `translate(-50%, -50%) scale(${scale})` },
      children
    }
  ) });
};
var AddSectionModal = ({ isOpen, onClose, onSelect, onSelectTemplate, config }) => {
  const { apiClient } = useStudio();
  const templates = config?.templates || [];
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedComponents, setSavedComponents] = useState([]);
  useEffect(() => {
    if (isOpen && apiClient) {
      apiClient.getSharedComponents().then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setSavedComponents(res.data);
        }
      }).catch((err) => {
        console.error("Failed to load saved/shared components:", err);
      });
    }
  }, [isOpen, apiClient]);
  const categories = config?.categories || {};
  const components = config?.components || {};
  const categoryList = useMemo(() => {
    const list = [{ key: "all", title: "T\xFCm\xFC" }];
    if (templates.length > 0) {
      list.push({ key: "templates", title: "\u015Eablonlar" });
    }
    if (savedComponents.length > 0) {
      list.push({ key: "saved", title: "Kaydedilenler (Ortak)" });
    }
    Object.entries(categories).forEach(([key, val]) => {
      list.push({ key, title: val.title || key });
    });
    if (list.length === 1 && savedComponents.length === 0 && templates.length === 0) {
      list.push({ key: "Genel", title: "Genel" });
    }
    return list;
  }, [categories, savedComponents, templates.length]);
  const groupedComponents = useMemo(() => {
    const map = { all: [] };
    categoryList.forEach((cat) => {
      map[cat.key] = [];
    });
    Object.entries(components).forEach(([name, compConfig]) => {
      let catKey = "Genel";
      if (Object.keys(categories).length > 0) {
        Object.entries(categories).forEach(([key, val]) => {
          if (val.components?.includes(name)) {
            catKey = key;
          }
        });
      } else {
        catKey = compConfig.category || "Genel";
      }
      if (!map[catKey]) {
        map[catKey] = [];
      }
      map[catKey].push(name);
      map.all.push(name);
    });
    return map;
  }, [components, categories, categoryList]);
  const displayItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (activeCategory === "templates") {
      return templates.filter((t) => t.label.toLowerCase().includes(query)).map((t) => ({
        isSaved: false,
        isTemplate: true,
        id: t.id,
        name: t.label,
        type: "template",
        props: {},
        template: t
      }));
    }
    if (activeCategory === "saved") {
      return savedComponents.filter((item) => item.name.toLowerCase().includes(query)).map((item) => ({
        isSaved: true,
        id: item._id,
        name: item.name,
        type: item.type,
        props: item.props
      }));
    }
    const list = groupedComponents[activeCategory] || [];
    return list.filter((type) => {
      const label = components[type]?.label || type;
      return label.toLowerCase().includes(query);
    }).map((type) => ({
      isSaved: false,
      id: type,
      name: components[type]?.label || type,
      type,
      props: components[type]?.defaultProps || {}
    }));
  }, [groupedComponents, activeCategory, searchQuery, components, savedComponents, templates]);
  if (!isOpen) return null;
  const getCategoryCount = (key) => {
    if (key === "saved") return savedComponents.length;
    if (key === "templates") return templates.length;
    return groupedComponents[key]?.length || 0;
  };
  const activeCategoryTitle = categoryList.find((cat) => cat.key === activeCategory)?.title || "T\xFCm\xFC";
  const categoryTitleForType = (type) => {
    for (const [key, val] of Object.entries(categories)) {
      if (val?.components?.includes(type)) return String(val.title || key);
    }
    return String(components[type]?.category || "");
  };
  const isElementType = (type) => /element/i.test(categoryTitleForType(type));
  return /* @__PURE__ */ jsx("div", { className: "tecof-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "tecof-add-section-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-modal-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-modal-title-wrap", children: [
        /* @__PURE__ */ jsx("span", { className: "tecof-modal-title-icon", "aria-hidden": "true", children: /* @__PURE__ */ jsx(LayoutGrid, { size: 18, strokeWidth: 2 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "tecof-modal-title", children: "B\xF6l\xFCm Ekle" }),
          /* @__PURE__ */ jsxs("span", { className: "tecof-modal-subtitle", children: [
            activeCategoryTitle,
            " \xB7 ",
            displayItems.length,
            " bile\u015Fen"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "tecof-modal-close", onClick: onClose, title: "Kapat", children: /* @__PURE__ */ jsx(X, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-modal-body", children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-modal-sidebar", children: [
        /* @__PURE__ */ jsx("div", { className: "tecof-modal-sidebar-title", children: "Kategoriler" }),
        /* @__PURE__ */ jsx("ul", { className: "tecof-modal-cat-list", children: categoryList.map((cat) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `tecof-modal-cat-btn ${activeCategory === cat.key ? "is-active" : ""}`,
            onClick: () => setActiveCategory(cat.key),
            children: [
              /* @__PURE__ */ jsx("span", { children: cat.title }),
              /* @__PURE__ */ jsx("span", { className: "tecof-modal-cat-count", children: getCategoryCount(cat.key) })
            ]
          }
        ) }, cat.key)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-modal-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "tecof-modal-content-head", children: [
          /* @__PURE__ */ jsxs("div", { className: "tecof-modal-search-bar", children: [
            /* @__PURE__ */ jsx(Search, { size: 16, className: "tecof-icon-muted" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Bile\u015Fen ara...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "tecof-modal-search-input"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("span", { className: "tecof-modal-result-count", children: displayItems.length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "tecof-modal-grid", children: [
          displayItems.map((item) => {
            if (item.isTemplate && item.template) {
              const t = item.template;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "tecof-modal-grid-card",
                  role: "button",
                  tabIndex: 0,
                  onClick: () => onSelectTemplate?.(t),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectTemplate?.(t);
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "tecof-modal-preview-wrapper", children: [
                      /* @__PURE__ */ jsx("span", { className: "tecof-modal-card-chip", children: "\u015Eablon" }),
                      t.thumbnail ? /* @__PURE__ */ jsx("img", { src: t.thumbnail, alt: t.label, className: "tecof-modal-template-thumb" }) : /* @__PURE__ */ jsx("div", { className: "tecof-modal-template-icon", children: /* @__PURE__ */ jsx(LayoutTemplate, { size: 28, strokeWidth: 1.6 }) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "tecof-modal-card-footer", children: [
                      /* @__PURE__ */ jsxs("div", { className: "tecof-modal-card-text", children: [
                        /* @__PURE__ */ jsx("span", { className: "tecof-modal-card-label", children: t.label }),
                        /* @__PURE__ */ jsx("span", { className: "tecof-modal-card-type", children: "\u015Eablon" })
                      ] }),
                      /* @__PURE__ */ jsx(ChevronRight, { size: 15, className: "tecof-modal-card-arrow", "aria-hidden": "true" })
                    ] })
                  ]
                },
                item.id
              );
            }
            const compConfig = components[item.type] || {};
            const renderProps = {
              ...item.props,
              puck: {
                renderDropZone: () => /* @__PURE__ */ jsx("div", { className: "tecof-modal-dummy-slot", children: "\u0130\xE7erik Alan\u0131" }),
                isEditing: false,
                metadata: {}
              },
              editMode: false
            };
            if (compConfig.fields) {
              Object.entries(compConfig.fields).forEach(([fieldName, fieldDef]) => {
                if (fieldDef && fieldDef.type === "slot") {
                  renderProps[fieldName] = () => /* @__PURE__ */ jsx("div", { className: "tecof-modal-dummy-slot", children: "\u0130\xE7erik Alan\u0131" });
                }
              });
            }
            const handleCardClick = () => {
              if (item.isSaved) {
                onSelect("SharedComponentRef", {
                  type: item.type,
                  sharedComponentId: item.id
                });
              } else {
                onSelect(item.type);
              }
            };
            const previewMode = !item.isSaved && isElementType(item.type) ? "element" : "section";
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "tecof-modal-grid-card",
                role: "button",
                tabIndex: 0,
                onClick: handleCardClick,
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick();
                  }
                },
                children: [
                  /* @__PURE__ */ jsxs("div", { className: `tecof-modal-preview-wrapper is-${previewMode}`, children: [
                    /* @__PURE__ */ jsx("span", { className: "tecof-modal-card-chip", children: item.isSaved ? "Ortak" : item.type }),
                    compConfig.render ? /* @__PURE__ */ jsx(AutoScalePreview, { mode: previewMode, children: /* @__PURE__ */ jsx(PreviewComponent, { renderFn: compConfig.render, props: renderProps }) }) : /* @__PURE__ */ jsx("div", { className: "tecof-modal-preview-fallback", children: "\xD6nizleme Yok" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "tecof-modal-card-footer", children: [
                    /* @__PURE__ */ jsxs("div", { className: "tecof-modal-card-text", children: [
                      /* @__PURE__ */ jsx("span", { className: "tecof-modal-card-label", children: item.isSaved ? item.name : item.name }),
                      /* @__PURE__ */ jsx("span", { className: "tecof-modal-card-type", children: item.isSaved ? compConfig.label || item.type : item.type })
                    ] }),
                    /* @__PURE__ */ jsx(ChevronRight, { size: 15, className: "tecof-modal-card-arrow", "aria-hidden": "true" })
                  ] })
                ]
              },
              item.id
            );
          }),
          displayItems.length === 0 && /* @__PURE__ */ jsx("div", { className: "tecof-modal-empty", children: "Uyumlu bile\u015Fen bulunamad\u0131." })
        ] })
      ] })
    ] })
  ] }) });
};
var Canvas = () => {
  const content = useEditorStore((state) => state.document.content);
  const viewport = useEditorStore((state) => state.viewport);
  const { config, readOnly } = useStudio();
  const rootProps = useEditorStore((state) => state.document.root?.props) || {};
  const insertNode2 = useEditorStore((state) => state.insertNode);
  const insertPayload = useEditorStore((state) => state.insertPayload);
  const selectNode = useEditorStore((state) => state.selectNode);
  const [modalOpen, setModalOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState(0);
  const {
    isDragOver: isRootDragOver,
    onDragOver: handleRootDragOver,
    onDragLeave: handleRootDragLeave,
    onDrop: handleRootDrop
  } = useDropTarget({
    // Root content has no zone key.
    zoneKey: void 0,
    locked: readOnly,
    getIndex: () => content.length
  });
  const handleSelectComponent = (type) => {
    const newNode = createNode(config, type);
    insertNode2(newNode, void 0, insertIndex);
    setModalOpen(false);
  };
  const handleSelectTemplate = (template) => {
    const payload = JSON.parse(JSON.stringify({
      node: template.payload.node,
      zones: template.payload.zones || {}
    }));
    insertPayload(payload, void 0, insertIndex);
    setModalOpen(false);
  };
  const clearSelection = () => {
    selectNode(null);
    postToHost("puck:itemDeselected");
  };
  const handleCanvasShellClick = (e) => {
    if (e.target.closest(".tecof-canvas-viewport")) return;
    clearSelection();
  };
  const handleRootClick = (e) => {
    if (e.target.closest(".tecof-node-wrapper")) return;
    clearSelection();
  };
  const rootClassName = [
    "tecof-canvas-root",
    content.length === 0 ? "is-empty" : "",
    isRootDragOver ? "is-dragover" : ""
  ].filter(Boolean).join(" ");
  const viewportClassName = [
    "tecof-canvas-viewport",
    viewport !== "desktop" ? `is-${viewport}` : ""
  ].filter(Boolean).join(" ");
  const renderedContent = /* @__PURE__ */ jsx(
    "div",
    {
      className: rootClassName,
      onDragOver: handleRootDragOver,
      onDragLeave: handleRootDragLeave,
      onDrop: handleRootDrop,
      onClick: handleRootClick,
      "data-tecof-zone": "root",
      children: content.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "tecof-canvas-empty", children: [
        /* @__PURE__ */ jsx("span", { className: "tecof-canvas-empty-icon", "aria-hidden": "true", children: /* @__PURE__ */ jsx(LayoutTemplate, { size: 22, strokeWidth: 1.8 }) }),
        /* @__PURE__ */ jsx("span", { className: "tecof-canvas-empty-kicker", children: "Root" }),
        /* @__PURE__ */ jsx("p", { className: "tecof-canvas-empty-title", children: isRootDragOver ? "B\u0131rakmaya haz\u0131r" : "Canvas bo\u015F" }),
        /* @__PURE__ */ jsx("p", { className: "tecof-canvas-empty-sub", children: isRootDragOver ? "Bile\u015Fen ana ak\u0131\u015Fa eklenecek" : "\u0130lk b\xF6l\xFCm\xFC ekleyin" }),
        !readOnly && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "tecof-canvas-empty-add-btn",
            onClick: () => {
              setInsertIndex(0);
              setModalOpen(true);
            },
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 16, strokeWidth: 2.4 }),
              "B\xF6l\xFCm Ekle"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        !readOnly && /* @__PURE__ */ jsx(
          AddSectionButton,
          {
            index: 0,
            onClick: (idx) => {
              setInsertIndex(idx);
              setModalOpen(true);
            }
          }
        ),
        content.map((item, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsx(NodeRenderer, { node: item, index }),
          !readOnly && /* @__PURE__ */ jsx(
            AddSectionButton,
            {
              index: index + 1,
              onClick: (idx) => {
                setInsertIndex(idx);
                setModalOpen(true);
              }
            }
          )
        ] }, item.props.id)),
        !readOnly && /* @__PURE__ */ jsx("div", { className: "tecof-canvas-root-tail", "aria-hidden": "true" })
      ] })
    }
  );
  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render ? rootConfig.render({
    ...rootProps,
    children: renderedContent,
    editMode: true
  }) : renderedContent;
  return /* @__PURE__ */ jsxs("div", { className: "tecof-canvas-container", onMouseDown: handleCanvasShellClick, children: [
    /* @__PURE__ */ jsx("div", { className: viewportClassName, children: /* @__PURE__ */ jsx(Frame, { className: "tecof-canvas-frame", children: contentWithLayout }) }),
    /* @__PURE__ */ jsx(
      AddSectionModal,
      {
        isOpen: modalOpen,
        onClose: () => setModalOpen(false),
        onSelect: handleSelectComponent,
        onSelectTemplate: handleSelectTemplate,
        config
      }
    )
  ] });
};
var getOutlineStyle = (coords) => ({
  "--tecof-outline-top": `${coords.top}px`,
  "--tecof-outline-left": `${coords.left}px`,
  "--tecof-outline-width": `${coords.width}px`,
  "--tecof-outline-height": `${coords.height}px`
});
var useOverlayCoords = (id, iframeEl, containerEl, documentState) => {
  const [coords, setCoords] = useState(null);
  useEffect(() => {
    if (!id || !iframeEl || !containerEl) {
      setCoords(null);
      return;
    }
    let resizeObserver = null;
    let targetResizeObserver = null;
    const updateCoords = () => {
      const doc = iframeEl.contentDocument;
      if (!doc) return;
      const element = doc.querySelector(`[data-tecof-id="${id}"]`);
      if (!element) {
        setCoords(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      const iframeRect = iframeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      let box;
      const win = iframeEl.contentWindow;
      if (win) {
        const cs = win.getComputedStyle(element);
        const num = (v) => parseFloat(v) || 0;
        box = {
          mt: num(cs.marginTop),
          mr: num(cs.marginRight),
          mb: num(cs.marginBottom),
          ml: num(cs.marginLeft),
          pt: num(cs.paddingTop),
          pr: num(cs.paddingRight),
          pb: num(cs.paddingBottom),
          pl: num(cs.paddingLeft)
        };
      }
      setCoords({
        top: rect.top + iframeRect.top - containerRect.top,
        left: rect.left + iframeRect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
        box
      });
      if (!targetResizeObserver) {
        targetResizeObserver = new ResizeObserver(() => {
          updateCoords();
        });
        targetResizeObserver.observe(element);
      }
    };
    updateCoords();
    const iframeWin = iframeEl.contentWindow;
    resizeObserver = new ResizeObserver(() => {
      updateCoords();
    });
    resizeObserver.observe(iframeEl);
    iframeWin?.addEventListener("scroll", updateCoords);
    window.addEventListener("resize", updateCoords);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (targetResizeObserver) targetResizeObserver.disconnect();
      iframeWin?.removeEventListener("scroll", updateCoords);
      window.removeEventListener("resize", updateCoords);
    };
  }, [id, iframeEl, containerEl, documentState]);
  return coords;
};
var SecondaryOutline = ({
  id,
  iframeEl,
  containerEl,
  documentState
}) => {
  const coords = useOverlayCoords(id, iframeEl, containerEl, documentState);
  if (!coords) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "tecof-outline is-selected is-multi",
      style: getOutlineStyle(coords)
    }
  );
};
var SpacingBands = ({ coords }) => {
  const b = coords.box;
  if (!b) return null;
  const { top, left, width, height } = coords;
  const innerH = Math.max(0, height - b.pt - b.pb);
  const bands = [];
  const push = (cls, style) => bands.push({ cls, style });
  if (b.mt > 0) push("tecof-space-margin", { top: top - b.mt, left, width, height: b.mt });
  if (b.mb > 0) push("tecof-space-margin", { top: top + height, left, width, height: b.mb });
  if (b.ml > 0) push("tecof-space-margin", { top, left: left - b.ml, width: b.ml, height });
  if (b.mr > 0) push("tecof-space-margin", { top, left: left + width, width: b.mr, height });
  if (b.pt > 0) push("tecof-space-padding", { top, left, width, height: b.pt });
  if (b.pb > 0) push("tecof-space-padding", { top: top + height - b.pb, left, width, height: b.pb });
  if (b.pl > 0) push("tecof-space-padding", { top: top + b.pt, left, width: b.pl, height: innerH });
  if (b.pr > 0) push("tecof-space-padding", { top: top + b.pt, left: left + width - b.pr, width: b.pr, height: innerH });
  return /* @__PURE__ */ jsx(Fragment, { children: bands.map((band, i) => /* @__PURE__ */ jsx("div", { className: band.cls, style: band.style }, i)) });
};
var SelectionOverlay = () => {
  const { config } = useStudio();
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const selectedIds = useEditorStore((state) => state.selection.selectedIds);
  const hoveredId = useEditorStore((state) => state.selection.hoveredId);
  const mode = useUiStore((state) => state.mode);
  const selectNode = useEditorStore((state) => state.selectNode);
  const removeNode2 = useEditorStore((state) => state.removeNode);
  const removeNodes2 = useEditorStore((state) => state.removeNodes);
  const duplicateNode2 = useEditorStore((state) => state.duplicateNode);
  const duplicateNodes2 = useEditorStore((state) => state.duplicateNodes);
  const moveNode2 = useEditorStore((state) => state.moveNode);
  const isMulti = selectedIds.length > 1;
  const handleDelete = () => {
    if (isMulti) removeNodes2(selectedIds);
    else if (selectedId) removeNode2(selectedId);
  };
  const handleDuplicate = () => {
    if (isMulti) duplicateNodes2(selectedIds);
    else if (selectedId) duplicateNode2(selectedId);
  };
  const [iframeEl, setIframeEl] = useState(null);
  const containerRef = useRef(null);
  useEffect(() => {
    const iframe = document.querySelector(".tecof-canvas-viewport iframe");
    setIframeEl(iframe);
  }, [documentState]);
  const selectedCoords = useOverlayCoords(selectedId, iframeEl, containerRef.current, documentState);
  const hoveredCoords = useOverlayCoords(
    hoveredId !== selectedId ? hoveredId : null,
    iframeEl,
    containerRef.current,
    documentState
  );
  const nodeDetails = selectedId ? findNodeById(documentState, selectedId) : null;
  const parentId = selectedId ? getParentId(documentState, selectedId) : null;
  const canMoveUp = nodeDetails ? nodeDetails.path.index > 0 : false;
  const canMoveDown = nodeDetails ? (() => {
    const { zoneKey, index } = nodeDetails.path;
    const items = zoneKey ? documentState.zones[zoneKey] || [] : documentState.content;
    return index < items.length - 1;
  })() : false;
  const handleMove = (direction) => {
    if (!selectedId || !nodeDetails) return;
    const { zoneKey, index } = nodeDetails.path;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    moveNode2(selectedId, zoneKey, newIndex);
  };
  const breadcrumbs = selectedId ? getBreadcrumbs(documentState, selectedId) : [];
  const perms = usePermissions(selectedId);
  if (mode === "preview") return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: "tecof-overlay",
      children: [
        hoveredCoords && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(SpacingBands, { coords: hoveredCoords }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "tecof-outline is-hover",
              style: getOutlineStyle(hoveredCoords)
            }
          )
        ] }),
        selectedIds.filter((id) => id !== selectedId).map((id) => /* @__PURE__ */ jsx(
          SecondaryOutline,
          {
            id,
            iframeEl,
            containerEl: containerRef.current,
            documentState
          },
          id
        )),
        selectedCoords && /* @__PURE__ */ jsxs(
          "div",
          {
            className: "tecof-outline is-selected",
            style: getOutlineStyle(selectedCoords),
            children: [
              /* @__PURE__ */ jsxs("div", { className: `tecof-toolbar${selectedCoords.top < 44 ? " is-flipped" : ""}`, children: [
                nodeDetails && (() => {
                  const componentConfig = config?.components?.[nodeDetails.node.type];
                  return /* @__PURE__ */ jsxs("div", { className: "tecof-toolbar-btn tecof-info-popover-trigger", title: "Bile\u015Fen Bilgisi", children: [
                    /* @__PURE__ */ jsx(Info, { size: 14 }),
                    /* @__PURE__ */ jsxs("div", { className: "tecof-info-popover", children: [
                      /* @__PURE__ */ jsx("div", { className: "tecof-info-popover-title", children: componentConfig?.label || nodeDetails.node.type }),
                      /* @__PURE__ */ jsx("div", { className: "tecof-info-popover-type", children: nodeDetails.node.type }),
                      componentConfig?.fields && Object.keys(componentConfig.fields).length > 0 && /* @__PURE__ */ jsxs("div", { className: "tecof-info-popover-fields", children: [
                        /* @__PURE__ */ jsx("div", { className: "tecof-info-popover-section-title", children: "\xD6zellikler:" }),
                        Object.entries(componentConfig.fields).map(([fieldName, fieldConf]) => /* @__PURE__ */ jsxs("div", { className: "tecof-info-popover-field", children: [
                          /* @__PURE__ */ jsx("span", { className: "tecof-info-popover-field-name", children: fieldName }),
                          /* @__PURE__ */ jsxs("span", { className: "tecof-info-popover-field-label", children: [
                            "(",
                            fieldConf.label || fieldConf.type,
                            ")"
                          ] })
                        ] }, fieldName))
                      ] })
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ jsx("div", { className: "tecof-toolbar-sep" }),
                parentId && /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => selectNode(parentId),
                    title: "\xDCst \xD6\u011Feyi Se\xE7",
                    className: "tecof-toolbar-btn",
                    "aria-label": "\xDCst \xF6\u011Feyi se\xE7",
                    children: /* @__PURE__ */ jsx(ChevronUp, { size: 14 })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleMove("up"),
                    disabled: !canMoveUp || perms.drag === false,
                    title: "Yukar\u0131 Ta\u015F\u0131",
                    className: "tecof-toolbar-btn",
                    "aria-label": "Yukar\u0131 ta\u015F\u0131",
                    children: /* @__PURE__ */ jsx(ArrowUp, { size: 14 })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleMove("down"),
                    disabled: !canMoveDown || perms.drag === false,
                    title: "A\u015Fa\u011F\u0131 Ta\u015F\u0131",
                    className: "tecof-toolbar-btn",
                    "aria-label": "A\u015Fa\u011F\u0131 ta\u015F\u0131",
                    children: /* @__PURE__ */ jsx(ArrowDown, { size: 14 })
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "tecof-toolbar-sep" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleDuplicate,
                    disabled: perms.duplicate === false,
                    title: isMulti ? "T\xFCm\xFCn\xFC \xC7o\u011Falt" : "Kopyala",
                    className: "tecof-toolbar-btn",
                    "aria-label": isMulti ? "Se\xE7ili \xF6\u011Feleri \xE7o\u011Falt" : "Kopyala",
                    children: /* @__PURE__ */ jsx(Copy, { size: 14 })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleDelete,
                    disabled: perms.delete === false,
                    title: isMulti ? "T\xFCm\xFCn\xFC Sil" : "Sil",
                    className: "tecof-toolbar-btn",
                    "aria-label": isMulti ? "Se\xE7ili \xF6\u011Feleri sil" : "Sil",
                    children: /* @__PURE__ */ jsx(Trash2, { size: 14 })
                  }
                )
              ] }),
              breadcrumbs.length > 1 && /* @__PURE__ */ jsx("div", { className: "tecof-breadcrumbs", children: breadcrumbs.map((crumb, idx) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
                idx > 0 && /* @__PURE__ */ jsx("span", { className: "tecof-breadcrumb-sep", children: ">" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    onClick: () => selectNode(crumb.id),
                    className: `tecof-breadcrumb${crumb.id === selectedId ? " is-active" : ""}`,
                    onMouseEnter: () => useEditorStore.getState().hoverNode(crumb.id),
                    onMouseLeave: () => useEditorStore.getState().hoverNode(null),
                    children: crumb.type
                  }
                )
              ] }, crumb.id)) })
            ]
          }
        )
      ]
    }
  );
};
var OPPOSITE = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
var parsePlacement = (placement) => {
  const [side, align] = placement.split("-");
  return { side, align: align ?? "center" };
};
function useFloating({
  anchor,
  open,
  placement = "bottom-start",
  offset = 6,
  padding = 8
}) {
  const floatingRef = useRef(null);
  const [pos, setPos] = useState({
    top: -9999,
    left: -9999,
    side: parsePlacement(placement).side
  });
  const update = useCallback(() => {
    const floating = floatingRef.current;
    if (!anchor || !floating) return;
    const a = anchor.getBoundingClientRect();
    const fw = floating.offsetWidth;
    const fh = floating.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { side: preferred, align } = parsePlacement(placement);
    const space = {
      top: a.top - padding,
      bottom: vh - a.bottom - padding,
      left: a.left - padding,
      right: vw - a.right - padding
    };
    const needed = (s) => (s === "top" || s === "bottom" ? fh : fw) + offset;
    let side = preferred;
    if (space[preferred] < needed(preferred) && space[OPPOSITE[preferred]] > space[preferred]) {
      side = OPPOSITE[preferred];
    }
    let top = 0;
    let left = 0;
    if (side === "bottom") top = a.bottom + offset;
    else if (side === "top") top = a.top - fh - offset;
    else if (side === "right") left = a.right + offset;
    else left = a.left - fw - offset;
    if (side === "top" || side === "bottom") {
      if (align === "start") left = a.left;
      else if (align === "end") left = a.right - fw;
      else left = a.left + (a.width - fw) / 2;
    } else {
      if (align === "start") top = a.top;
      else if (align === "end") top = a.bottom - fh;
      else top = a.top + (a.height - fh) / 2;
    }
    const clamp2 = (value, size, viewport) => Math.max(padding, Math.min(value, viewport - size - padding));
    setPos({
      top: clamp2(top, fh, vh),
      left: clamp2(left, fw, vw),
      side
    });
  }, [anchor, placement, offset, padding]);
  useLayoutEffect(() => {
    if (open) update();
  }, [open, update]);
  useEffect(() => {
    if (!open || !anchor) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    if (floatingRef.current) observer.observe(floatingRef.current);
    observer.observe(anchor);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [open, anchor, update]);
  return {
    floatingRef,
    style: { position: "fixed", top: pos.top, left: pos.left },
    side: pos.side,
    update
  };
}
var tokenFor = (shortcode) => `{{ data.${shortcode} }}`;
var BindingPopover = ({
  anchor,
  onInsert,
  onClose
}) => {
  const { apiClient } = useTecof();
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor,
    open: true,
    placement: "bottom-end"
  });
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getCmsCollections();
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) setCollections(res.data);
        else setError(res.message || "Koleksiyonlar y\xFCklenemedi");
      } catch (e) {
        if (!cancelled) setError(e?.message || "Ba\u011Flant\u0131 hatas\u0131");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiClient]);
  useEffect(() => {
    const onDown = (e) => {
      if (!floatingRef.current?.contains(e.target) && !anchor.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose, floatingRef]);
  const active = collections.find((c) => c.slug === activeSlug) || null;
  const filteredCollections = collections.filter(
    (c) => !query.trim() || `${c.name} ${c.slug}`.toLowerCase().includes(query.toLowerCase())
  );
  const fields = active?.fields || [];
  const filteredFields = fields.filter(
    (f) => !query.trim() || `${f.name} ${f.shortcode}`.toLowerCase().includes(query.toLowerCase())
  );
  return createPortal(
    /* @__PURE__ */ jsxs("div", { ref: floatingRef, className: "tecof-bind-popover", style: floatingStyle, role: "dialog", "aria-label": "CMS verisine ba\u011Fla", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-bind-header", children: active ? /* @__PURE__ */ jsxs("button", { type: "button", className: "tecof-bind-back", onClick: () => {
        setActiveSlug(null);
        setQuery("");
      }, children: [
        /* @__PURE__ */ jsx(ChevronLeft, { size: 14 }),
        " ",
        active.name
      ] }) : /* @__PURE__ */ jsx("span", { className: "tecof-bind-title", children: "CMS verisine ba\u011Fla" }) }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-bind-search", children: [
        /* @__PURE__ */ jsx(Search, { size: 13 }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: active ? "Alan ara\u2026" : "Koleksiyon ara\u2026",
            className: "tecof-bind-search-input",
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "tecof-bind-list", children: loading ? /* @__PURE__ */ jsx("div", { className: "tecof-bind-empty", children: "Y\xFCkleniyor\u2026" }) : error ? /* @__PURE__ */ jsx("div", { className: "tecof-bind-empty", children: error }) : !active ? filteredCollections.length === 0 ? /* @__PURE__ */ jsx("div", { className: "tecof-bind-empty", children: "Koleksiyon yok" }) : filteredCollections.map((col) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "tecof-bind-item",
          onClick: () => {
            setActiveSlug(col.slug);
            setQuery("");
          },
          children: [
            /* @__PURE__ */ jsx(Database, { size: 13 }),
            /* @__PURE__ */ jsx("span", { className: "tecof-bind-item-label", children: col.name }),
            /* @__PURE__ */ jsxs("span", { className: "tecof-bind-item-meta", children: [
              col.fields?.length ?? 0,
              " alan"
            ] })
          ]
        },
        col._id
      )) : filteredFields.length === 0 ? /* @__PURE__ */ jsx("div", { className: "tecof-bind-empty", children: "Alan yok" }) : filteredFields.map((f) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "tecof-bind-item",
          onClick: () => {
            onInsert(tokenFor(f.shortcode));
            onClose();
          },
          children: [
            /* @__PURE__ */ jsx(Braces, { size: 13 }),
            /* @__PURE__ */ jsx("span", { className: "tecof-bind-item-label", children: f.name }),
            /* @__PURE__ */ jsx("span", { className: "tecof-bind-item-meta", children: f.type })
          ]
        },
        f.shortcode
      )) })
    ] }),
    document.body
  );
};
var CmsBindingButton = ({ onInsert, title = "CMS verisine ba\u011Fla" }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        ref: btnRef,
        type: "button",
        className: `tecof-bind-btn${open ? " is-active" : ""}`,
        onClick: () => setOpen((o) => !o),
        title,
        "aria-label": title,
        children: /* @__PURE__ */ jsx(Braces, { size: 14 })
      }
    ),
    open && btnRef.current && /* @__PURE__ */ jsx(BindingPopover, { anchor: btnRef.current, onInsert, onClose: close })
  ] });
};
var defaultSummary = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  const v = value;
  return String(v.title ?? v.name ?? v.label ?? v.id ?? v._id ?? JSON.stringify(value));
};
var rowColumns = (field, row) => {
  if (field.mapRow) return field.mapRow(row);
  if (row && typeof row === "object") return row;
  return { value: row };
};
var PickerModal = ({ field, value, onSelect, onClose }) => {
  const showSearch = field.showSearch !== false;
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const inputRef = useRef(null);
  const reqIdRef = useRef(0);
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    Promise.resolve(field.fetchList({ query: debounced || void 0 })).then((list) => {
      if (reqId !== reqIdRef.current) return;
      setRows(Array.isArray(list) ? list : []);
      setLoading(false);
    }).catch((e) => {
      if (reqId !== reqIdRef.current) return;
      setError(e?.message || "Veri y\xFCklenemedi");
      setRows([]);
      setLoading(false);
    });
  }, [field, debounced, reloadKey]);
  const isSelected = useCallback(
    (row) => {
      const mapped = field.mapProp ? field.mapProp(row) : row;
      return deepEqual(mapped, value);
    },
    [field, value]
  );
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "tecof-cmdk-overlay", onMouseDown: onClose, children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "tecof-cmdk-panel",
        role: "dialog",
        "aria-label": field.label || "Veri se\xE7",
        onMouseDown: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "tecof-cmdk-input-row", children: [
            /* @__PURE__ */ jsx(Search, { size: 16, className: "tecof-cmdk-search-icon" }),
            showSearch ? /* @__PURE__ */ jsx(
              "input",
              {
                ref: inputRef,
                type: "text",
                className: "tecof-cmdk-input",
                placeholder: "Ara\u2026",
                value: query,
                onChange: (e) => setQuery(e.target.value)
              }
            ) : /* @__PURE__ */ jsx("span", { className: "tecof-cmdk-input", children: field.label || "Veri se\xE7" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "tecof-external-reload",
                onClick: () => setReloadKey((k) => k + 1),
                title: "Yenile",
                disabled: loading,
                children: /* @__PURE__ */ jsx(RefreshCcw, { size: 14, className: loading ? "tecof-upload-spin" : "" })
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "button", className: "tecof-external-reload", onClick: onClose, title: "Kapat", children: /* @__PURE__ */ jsx(X, { size: 14 }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "tecof-cmdk-list", children: loading ? /* @__PURE__ */ jsx("div", { className: "tecof-cmdk-empty", children: "Y\xFCkleniyor\u2026" }) : error ? /* @__PURE__ */ jsxs("div", { className: "tecof-external-error", children: [
            /* @__PURE__ */ jsx("p", { children: error }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setReloadKey((k) => k + 1), children: "Tekrar dene" })
          ] }) : rows.length === 0 ? /* @__PURE__ */ jsx("div", { className: "tecof-cmdk-empty", children: "Sonu\xE7 yok" }) : rows.map((row, idx) => {
            const cols = rowColumns(field, row);
            const entries = Object.entries(cols);
            const [firstKey, firstVal] = entries[0] ?? ["", ""];
            const primary = field.getItemSummary ? field.getItemSummary(field.mapProp ? field.mapProp(row) : row) : String(firstVal ?? firstKey);
            const rest = entries.slice(1);
            const selected = isSelected(row);
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                className: `tecof-cmdk-item${selected ? " is-active" : ""}`,
                onClick: () => onSelect(row),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "tecof-cmdk-item-icon", children: selected ? /* @__PURE__ */ jsx(Check, { size: 15 }) : /* @__PURE__ */ jsx(ChevronRight, { size: 15 }) }),
                  /* @__PURE__ */ jsxs("span", { className: "tecof-external-row-text", children: [
                    /* @__PURE__ */ jsx("span", { className: "tecof-cmdk-item-label", children: primary }),
                    rest.length > 0 && /* @__PURE__ */ jsx("span", { className: "tecof-external-row-sub", children: rest.map(([k, v]) => `${k}: ${String(v)}`).join(" \xB7 ") })
                  ] })
                ]
              },
              idx
            );
          }) })
        ]
      }
    ) }),
    document.body
  );
};
var ExternalField = ({ field, name, value, onChange, readOnly }) => {
  const [open, setOpen] = useState(false);
  const summary = useMemo(() => {
    if (value == null) return "";
    return field.getItemSummary ? field.getItemSummary(value) : defaultSummary(value);
  }, [field, value]);
  const handleSelect = (row) => {
    onChange(field.mapProp ? field.mapProp(row) : row);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs(FieldErrorBoundary, { fieldName: field.label || name, children: [
    /* @__PURE__ */ jsx(FieldLabel, { label: field.label || name, readOnly, children: /* @__PURE__ */ jsxs("div", { className: "tecof-external", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "tecof-external-trigger",
          disabled: readOnly,
          onClick: () => setOpen(true),
          children: [
            /* @__PURE__ */ jsx(Database, { size: 14, className: "tecof-icon-muted" }),
            /* @__PURE__ */ jsx("span", { className: `tecof-external-summary${summary ? "" : " is-empty"}`, children: summary || field.placeholder || "Veri se\xE7" })
          ]
        }
      ),
      value != null && !readOnly && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "tecof-external-clear",
          onClick: () => onChange(void 0),
          title: "Temizle",
          "aria-label": "Se\xE7imi temizle",
          children: /* @__PURE__ */ jsx(X, { size: 13 })
        }
      )
    ] }) }),
    open && /* @__PURE__ */ jsx(
      PickerModal,
      {
        field,
        value,
        onSelect: handleSelect,
        onClose: () => setOpen(false)
      }
    )
  ] });
};
var createExternalField = (options) => ({
  type: "external",
  ...options
});
var FieldRenderer = ({
  name,
  definition,
  value,
  onChange,
  readOnly = false
}) => {
  const [expandedIndices, setExpandedIndices] = useState({});
  const label = definition.label || name;
  const type = definition.type;
  if (definition.render) {
    return /* @__PURE__ */ jsx("div", { className: "tecof-field-custom", children: definition.render({
      field: definition,
      name,
      id: `field-${name}`,
      value,
      onChange,
      readOnly
    }) });
  }
  switch (type) {
    case "text":
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxs("div", { className: "tecof-field-bindable", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            id: `field-${name}`,
            type: "text",
            value: value || "",
            disabled: readOnly,
            onChange: (e) => onChange(e.target.value),
            className: "tecof-input-text"
          }
        ),
        !readOnly && definition.bindable !== false && /* @__PURE__ */ jsx(CmsBindingButton, { onInsert: (t) => onChange(value ? `${value} ${t}` : t) })
      ] }) });
    case "textarea":
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxs("div", { className: "tecof-field-bindable is-textarea", children: [
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: `field-${name}`,
            rows: 4,
            value: value || "",
            disabled: readOnly,
            onChange: (e) => onChange(e.target.value),
            className: "tecof-input-textarea"
          }
        ),
        !readOnly && definition.bindable !== false && /* @__PURE__ */ jsx(CmsBindingButton, { onInsert: (t) => onChange(value ? `${value} ${t}` : t) })
      ] }) });
    case "select":
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxs("div", { className: "tecof-field-select-wrap", children: [
        /* @__PURE__ */ jsx(
          "select",
          {
            id: `field-${name}`,
            value: value || "",
            disabled: readOnly,
            onChange: (e) => onChange(e.target.value),
            className: "tecof-input-select",
            children: (definition.options || []).map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label || opt.value }, opt.value))
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "tecof-field-select-caret", children: /* @__PURE__ */ jsx(ChevronDown, { size: 12 }) })
      ] }) });
    case "number":
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsx(
        "input",
        {
          id: `field-${name}`,
          type: "number",
          value: value !== void 0 ? value : "",
          disabled: readOnly,
          onChange: (e) => {
            const val = e.target.value;
            onChange(val === "" ? void 0 : Number(val));
          },
          className: "tecof-input-number"
        }
      ) });
    case "boolean":
    case "toggle": {
      const checked = value === true || value === "true";
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxs(
        "button",
        {
          id: `field-${name}`,
          type: "button",
          role: "switch",
          "aria-checked": checked,
          disabled: readOnly,
          className: `tecof-field-switch${checked ? " is-on" : ""}${readOnly ? " is-readonly" : ""}`,
          onClick: () => onChange(!checked),
          children: [
            /* @__PURE__ */ jsx("span", { className: "tecof-field-switch-track", children: /* @__PURE__ */ jsx("span", { className: "tecof-field-switch-thumb" }) }),
            /* @__PURE__ */ jsx("span", { className: "tecof-field-switch-text", children: checked ? definition.onLabel || "A\xE7\u0131k" : definition.offLabel || "Kapal\u0131" })
          ]
        }
      ) });
    }
    case "range": {
      const min = typeof definition.min === "number" ? definition.min : 0;
      const max = typeof definition.max === "number" ? definition.max : 100;
      const step = typeof definition.step === "number" ? definition.step : 1;
      const current2 = typeof value === "number" ? value : typeof definition.defaultValue === "number" ? definition.defaultValue : min;
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxs("div", { className: "tecof-field-range", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            id: `field-${name}`,
            type: "range",
            min,
            max,
            step,
            value: current2,
            disabled: readOnly,
            onChange: (e) => onChange(Number(e.target.value)),
            className: "tecof-input-range"
          }
        ),
        /* @__PURE__ */ jsxs("output", { className: "tecof-field-range-value", children: [
          current2,
          definition.unit || ""
        ] })
      ] }) });
    }
    case "radio":
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsx("div", { className: "tecof-field-radio-group", children: (definition.options || []).map((opt) => /* @__PURE__ */ jsxs(
        "label",
        {
          className: `tecof-field-radio${readOnly ? " is-readonly" : ""}`,
          children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "radio",
                name,
                value: opt.value,
                checked: value === opt.value,
                disabled: readOnly,
                onChange: () => onChange(opt.value)
              }
            ),
            /* @__PURE__ */ jsx("span", { children: opt.label || opt.value })
          ]
        },
        opt.value
      )) }) });
    case "array": {
      const items = Array.isArray(value) ? value : [];
      const arrayFields = definition.arrayFields || {};
      const getItemLabel = (item, idx) => {
        if (!item) return `\xD6\u011Fe ${idx + 1}`;
        for (const val of Object.values(item)) {
          if (typeof val === "string" && val.trim().length > 0) {
            return val;
          }
          if (Array.isArray(val)) {
            const trVal = val.find((v) => typeof v === "object" && v !== null && "value" in v);
            if (trVal && typeof trVal.value === "string" && trVal.value.trim().length > 0) {
              return trVal.value;
            }
          }
        }
        return `\xD6\u011Fe ${idx + 1}`;
      };
      const toggleExpand = (idx) => {
        setExpandedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
      };
      const handleAdd = () => {
        const newItem = {};
        Object.entries(arrayFields).forEach(([subName, subDef]) => {
          newItem[subName] = subDef.defaultValue !== void 0 ? subDef.defaultValue : null;
        });
        onChange([...items, newItem]);
        setExpandedIndices((prev) => ({ ...prev, [items.length]: true }));
      };
      const handleRemove = (idx) => {
        const copy = [...items];
        copy.splice(idx, 1);
        onChange(copy);
        const newExpanded = { ...expandedIndices };
        delete newExpanded[idx];
        setExpandedIndices(newExpanded);
      };
      const handleMove = (idx, direction) => {
        if (direction === "up" && idx === 0) return;
        if (direction === "down" && idx === items.length - 1) return;
        const copy = [...items];
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        const temp = copy[idx];
        copy[idx] = copy[targetIdx];
        copy[targetIdx] = temp;
        onChange(copy);
        const newExpanded = { ...expandedIndices };
        const tempExpanded = newExpanded[idx];
        newExpanded[idx] = newExpanded[targetIdx];
        newExpanded[targetIdx] = tempExpanded;
        setExpandedIndices(newExpanded);
      };
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxs("div", { className: "tecof-array", children: [
        items.map((item, idx) => {
          const isExpanded = !!expandedIndices[idx];
          const itemLabel = getItemLabel(item, idx);
          return /* @__PURE__ */ jsxs("div", { className: "tecof-array-item", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                onClick: () => toggleExpand(idx),
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExpand(idx);
                  }
                },
                className: "tecof-array-item-header",
                role: "button",
                tabIndex: 0,
                "aria-expanded": isExpanded,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "tecof-array-item-title-wrap", children: [
                    isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { size: 14 }) : /* @__PURE__ */ jsx(ChevronRight, { size: 14 }),
                    /* @__PURE__ */ jsx("span", { className: "tecof-array-item-title", children: itemLabel })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "tecof-array-item-actions", onClick: (e) => e.stopPropagation(), children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleMove(idx, "up"),
                        disabled: idx === 0,
                        className: "tecof-array-btn",
                        title: "Yukar\u0131 ta\u015F\u0131",
                        children: /* @__PURE__ */ jsx(ArrowUp, { size: 12 })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleMove(idx, "down"),
                        disabled: idx === items.length - 1,
                        className: "tecof-array-btn",
                        title: "A\u015Fa\u011F\u0131 ta\u015F\u0131",
                        children: /* @__PURE__ */ jsx(ArrowDown, { size: 12 })
                      }
                    ),
                    !readOnly && /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleRemove(idx),
                        className: "tecof-array-btn danger",
                        title: "Sil",
                        children: /* @__PURE__ */ jsx(Trash2, { size: 12 })
                      }
                    )
                  ] })
                ]
              }
            ),
            isExpanded && /* @__PURE__ */ jsx("div", { className: "tecof-array-item-body", children: Object.entries(arrayFields).map(([subFieldName, subFieldDef]) => /* @__PURE__ */ jsx(
              FieldRenderer,
              {
                name: subFieldName,
                definition: subFieldDef,
                value: item[subFieldName],
                onChange: (newSubVal) => {
                  const updatedItems = [...items];
                  updatedItems[idx] = {
                    ...updatedItems[idx],
                    [subFieldName]: newSubVal
                  };
                  onChange(updatedItems);
                },
                readOnly: readOnly || subFieldDef?.readOnly === true
              },
              subFieldName
            )) })
          ] }, idx);
        }),
        !readOnly && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: handleAdd,
            className: "tecof-add-array-item-btn",
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 14 }),
              "\xD6\u011Fe Ekle"
            ]
          }
        )
      ] }) });
    }
    case "object": {
      const objectFields = definition.objectFields || {};
      const objVal = value && typeof value === "object" && !Array.isArray(value) ? value : {};
      return /* @__PURE__ */ jsx(FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsx("div", { className: "tecof-field-object", children: Object.entries(objectFields).map(([subFieldName, subFieldDef]) => /* @__PURE__ */ jsx(
        FieldRenderer,
        {
          name: subFieldName,
          definition: subFieldDef,
          value: objVal[subFieldName],
          onChange: (newSubVal) => onChange({ ...objVal, [subFieldName]: newSubVal }),
          readOnly: readOnly || subFieldDef?.readOnly === true
        },
        subFieldName
      )) }) });
    }
    case "external":
      return /* @__PURE__ */ jsx(
        ExternalField,
        {
          field: definition,
          name,
          value,
          onChange,
          readOnly
        }
      );
    default:
      return /* @__PURE__ */ jsxs("div", { className: "tecof-field-unsupported", children: [
        'Desteklenmeyen alan t\xFCr\xFC: "',
        type,
        '" (',
        name,
        ")"
      ] });
  }
};

// src/studio/fields-host/resolve.ts
var computeChanged = (prev, next) => {
  const changed = {};
  const keys = /* @__PURE__ */ new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})]);
  for (const key of keys) {
    changed[key] = !deepEqual(prev?.[key], next?.[key]);
  }
  return changed;
};
var diffProps = (current2, resolved) => {
  const diff = {};
  for (const key of Object.keys(resolved)) {
    if (!deepEqual(current2?.[key], resolved[key])) {
      diff[key] = resolved[key];
    }
  }
  return diff;
};

// src/studio/fields-host/useResolvedFields.ts
var EMPTY_READONLY = {};
var useResolvedFields = (node, componentConfig) => {
  const updateProps2 = useEditorStore((s) => s.updateProps);
  const staticFields = componentConfig?.fields ?? {};
  const hasResolveFields = typeof componentConfig?.resolveFields === "function";
  const hasResolveData = typeof componentConfig?.resolveData === "function";
  const dynamic = hasResolveFields || hasResolveData;
  const nodeId = node?.props.id ?? null;
  const propsKey = node ? JSON.stringify(node.props) : "";
  const [state, setState] = useState({
    id: null,
    fields: staticFields,
    readOnly: EMPTY_READONLY
  });
  const lastPropsRef = useRef(null);
  const reqIdRef = useRef(0);
  useEffect(() => {
    if (!node || !dynamic) {
      lastPropsRef.current = node?.props ?? null;
      return;
    }
    const reqId = ++reqIdRef.current;
    let cancelled = false;
    const prev = lastPropsRef.current;
    const ctx = { changed: computeChanged(prev, node.props), lastProps: prev };
    const commit2 = (fields, readOnly) => {
      if (cancelled || reqId !== reqIdRef.current) return;
      setState({ id: node.props.id, fields, readOnly });
    };
    const runData = (fields) => {
      if (!hasResolveData) {
        commit2(fields, EMPTY_READONLY);
        return;
      }
      Promise.resolve(componentConfig.resolveData(node.props, ctx)).then((res) => {
        if (cancelled || reqId !== reqIdRef.current) return;
        if (res?.props) {
          const d = diffProps(node.props, res.props);
          if (Object.keys(d).length > 0) updateProps2(node.props.id, d);
        }
        commit2(fields, res?.readOnly ?? EMPTY_READONLY);
      }).catch(() => commit2(fields, EMPTY_READONLY));
    };
    if (hasResolveFields) {
      Promise.resolve(
        componentConfig.resolveFields(node.props, { ...ctx, fields: staticFields })
      ).then((f) => runData(f ?? staticFields)).catch(() => runData(staticFields));
    } else {
      runData(staticFields);
    }
    lastPropsRef.current = node.props;
    return () => {
      cancelled = true;
    };
  }, [nodeId, propsKey, dynamic, hasResolveFields, hasResolveData]);
  if (!dynamic) {
    return { fields: staticFields, readOnly: EMPTY_READONLY };
  }
  return state.id === nodeId ? { fields: state.fields, readOnly: state.readOnly } : { fields: staticFields, readOnly: EMPTY_READONLY };
};
var hasProps = (props) => !!props && Object.values(props).some(Boolean);
var BREAKPOINTS = [
  { key: "base", label: "Genel" },
  { key: "sm", label: "sm" },
  { key: "md", label: "md" },
  { key: "lg", label: "lg" },
  { key: "xl", label: "xl" }
];
var STATES = [
  { key: "base", label: "Normal" },
  { key: "hover", label: "Hover" },
  { key: "focus", label: "Focus" },
  { key: "active", label: "Active" }
];
var GROUP_ORDER = ["layout", "spacing", "sizing", "typography", "background", "border", "effects"];
var StyleEditor = ({ value, onChange }) => {
  const styles = value || {};
  const [bp, setBp] = useState("base");
  const [state, setState] = useState("base");
  const styleBuffer = useUiStore((s) => s.styleClipboard);
  const setStyleClipboard = useUiStore((s) => s.setStyleClipboard);
  const stateKey = bp === "base" ? state : `${bp}:${state}`;
  const layer = state === "base" ? styles[bp] || {} : styles.states?.[stateKey] || {};
  const inheritedLayer = state !== "base" ? { ...styles.base || {}, ...bp !== "base" ? styles[bp] || {} : {} } : bp !== "base" ? styles.base || {} : {};
  const setLayerValue = (controlId, raw) => {
    const nextLayer = { ...layer };
    if (raw) nextLayer[controlId] = raw;
    else delete nextLayer[controlId];
    if (state === "base") {
      onChange({ ...styles, [bp]: nextLayer });
    } else {
      onChange({ ...styles, states: { ...styles.states, [stateKey]: nextLayer } });
    }
  };
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    controls: STYLE_CONTROLS.filter((c) => c.group === group)
  })).filter((g) => g.controls.length > 0);
  return /* @__PURE__ */ jsxs("div", { className: "tecof-style-editor", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-style-editor-head", children: [
      /* @__PURE__ */ jsx("span", { className: "tecof-style-editor-title", children: "Stil" }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-style-editor-actions", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "tecof-style-head-btn",
            title: "Stili kopyala",
            "aria-label": "Stili kopyala",
            disabled: isEmptyStyles(styles),
            onClick: () => setStyleClipboard(cloneStyles(styles)),
            children: /* @__PURE__ */ jsx(Copy, { size: 13 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "tecof-style-head-btn",
            title: "Stili yap\u0131\u015Ft\u0131r",
            "aria-label": "Stili yap\u0131\u015Ft\u0131r",
            disabled: !styleBuffer,
            onClick: () => styleBuffer && onChange(cloneStyles(styleBuffer)),
            children: /* @__PURE__ */ jsx(ClipboardPaste, { size: 13 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-style-scopes", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-style-seg", role: "group", "aria-label": "Breakpoint", children: BREAKPOINTS.map((b) => {
        const overridden = hasProps(styles[b.key]);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `tecof-style-seg-btn${bp === b.key ? " is-active" : ""}`,
            onClick: () => setBp(b.key),
            children: [
              b.label,
              overridden && /* @__PURE__ */ jsx("span", { className: "tecof-style-seg-dot", "aria-hidden": "true" })
            ]
          },
          b.key
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "tecof-style-seg", role: "group", "aria-label": "Durum", children: STATES.map((s) => {
        const overridden = s.key === "base" ? BREAKPOINTS.some((b) => hasProps(styles[b.key])) : hasProps(styles.states?.[bp === "base" ? s.key : `${bp}:${s.key}`]);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `tecof-style-seg-btn${state === s.key ? " is-active" : ""}`,
            onClick: () => setState(s.key),
            children: [
              s.label,
              overridden && /* @__PURE__ */ jsx("span", { className: "tecof-style-seg-dot", "aria-hidden": "true" })
            ]
          },
          s.key
        );
      }) })
    ] }),
    grouped.map(({ group, controls }) => /* @__PURE__ */ jsxs("div", { className: "tecof-style-group", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-style-group-title", children: GROUP_LABELS[group] }),
      controls.map((control) => /* @__PURE__ */ jsx(
        ControlRow,
        {
          control,
          value: layer[control.id] || "",
          inherited: inheritedLayer[control.id],
          onChange: (v) => setLayerValue(control.id, v)
        },
        control.id
      ))
    ] }, group))
  ] });
};
var ControlRow = ({
  control,
  value,
  inherited,
  onChange
}) => {
  const supportsArbitrary = !!control.arbitraryPrefix;
  const matchesOption = control.options.some((o) => o.value === value);
  const valueIsArbitrary = supportsArbitrary && isArbitrary(value) && !matchesOption;
  const [customOpen, setCustomOpen] = useState(valueIsArbitrary);
  const inheritedOption = inherited ? control.options.find((o) => o.value === inherited) : void 0;
  const inheritedLabel = inherited ? inheritedOption?.label ?? arbitraryRaw(inherited) : "";
  const custom = customOpen || valueIsArbitrary;
  const presetValue = valueIsArbitrary ? "" : value;
  const commitCustom = (raw) => {
    const trimmed = raw.trim();
    onChange(trimmed ? toArbitrary(trimmed) : "");
  };
  return /* @__PURE__ */ jsxs("div", { className: `tecof-style-row${value ? " is-active" : ""}`, children: [
    /* @__PURE__ */ jsxs("span", { className: "tecof-style-label", children: [
      control.label,
      value && /* @__PURE__ */ jsx("span", { className: "tecof-style-row-active-dot", title: "\xD6zel de\u011Fer tan\u0131ml\u0131" }),
      !value && inheritedLabel && /* @__PURE__ */ jsx("span", { className: "tecof-style-inherited", title: `Devral\u0131nan de\u011Fer: ${inheritedLabel}`, children: inheritedLabel })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-style-control", children: [
      control.type === "color" ? /* @__PURE__ */ jsx("div", { className: "tecof-style-swatches", children: control.options.map((opt) => {
        const isNone = opt.value === "";
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            title: opt.label,
            className: `tecof-style-swatch${presetValue === opt.value ? " is-active" : ""}${isNone ? " is-none" : ""}`,
            style: !isNone ? { "--swatch": opt.swatch || opt.value } : void 0,
            onClick: () => onChange(opt.value)
          },
          opt.value || "none"
        );
      }) }) : control.type === "segment" ? /* @__PURE__ */ jsx("div", { className: "tecof-style-seg", children: control.options.map((opt) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `tecof-style-seg-btn${presetValue === opt.value ? " is-active" : ""}`,
          onClick: () => onChange(opt.value),
          children: opt.label
        },
        opt.value || "none"
      )) }) : /* @__PURE__ */ jsx(
        "select",
        {
          className: "tecof-input-select tecof-style-select",
          value: presetValue,
          onChange: (e) => onChange(e.target.value),
          children: control.options.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value || "none"))
        }
      ),
      supportsArbitrary && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `tecof-style-custom-toggle${custom ? " is-active" : ""}`,
          title: "\xD6zel de\u011Fer",
          "aria-pressed": custom,
          onClick: () => {
            if (custom) {
              if (valueIsArbitrary) onChange("");
              setCustomOpen(false);
            } else {
              setCustomOpen(true);
            }
          },
          children: custom ? "\xD7" : "+"
        }
      )
    ] }),
    supportsArbitrary && custom && /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        className: "tecof-input tecof-style-custom-input",
        placeholder: control.arbitraryPrefix + "-[\u2026]",
        defaultValue: valueIsArbitrary ? arbitraryRaw(value) : "",
        onBlur: (e) => commitCustom(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") e.target.blur();
        }
      }
    )
  ] });
};
var clamp = (n, min, max) => Math.min(max, Math.max(min, n));
var isValidHex = (hex) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
var normalizeHex = (hex) => {
  if (!hex) return "";
  let v = hex.startsWith("#") ? hex : `#${hex}`;
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v;
};
var toHex = (val) => {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.startsWith("#")) return trimmed;
  const rgbaMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== void 0 ? parseFloat(rgbaMatch[4]) : 1;
    const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
    if (a < 1) return hex + Math.round(a * 255).toString(16).padStart(2, "0");
    return hex;
  }
  return trimmed;
};
var hexToRgb = (hex) => {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(normalizeHex(hex));
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return { r: int >> 16 & 255, g: int >> 8 & 255, b: int & 255 };
};
var hexAlpha = (hex) => {
  const m = /^#[0-9a-f]{6}([0-9a-f]{2})$/i.exec(normalizeHex(hex));
  return m ? parseInt(m[1], 16) / 255 : 1;
};
var rgbToHex = ({ r, g, b }) => "#" + [r, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0")).join("");
var rgbToHsv = ({ r, g, b }) => {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = (gn - bn) / d % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
};
var hsvToRgb = ({ h, s, v }) => {
  const c = v * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
};
var cssColor = (rgb, alpha) => alpha < 1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : rgbToHex(rgb);
var RECENT_KEY = "tecof-recent-colors";
var RECENT_MAX = 8;
var readRecent = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw).slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
};
var pushRecent = (hex) => {
  if (!hex || !isValidHex(normalizeHex(hex))) return;
  try {
    const base = rgbToHex(hexToRgb(hex));
    const next = [base, ...readRecent().filter((c) => c.toLowerCase() !== base.toLowerCase())].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
  }
};
var DEFAULT_SWATCHES = [
  "#18181b",
  "#71717a",
  "#ffffff",
  "#74b500",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b"
];
var EYEDROPPER_SUPPORTED = typeof window !== "undefined" && "EyeDropper" in window;
var trackPointer = (startX, startY, el, cb) => {
  const rect = el.getBoundingClientRect();
  const apply = (clientX, clientY) => cb(
    rect.width ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0,
    rect.height ? clamp((clientY - rect.top) / rect.height, 0, 1) : 0
  );
  apply(startX, startY);
  const onMove = (ev) => apply(ev.clientX, ev.clientY);
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
};
var ColorPopover = ({
  anchor,
  hsv: initialHsv,
  alpha: initialAlpha,
  showOpacity,
  swatches,
  onChange,
  onPickHex,
  onClose
}) => {
  const recent = useRef(readRecent()).current;
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor,
    open: true,
    placement: "bottom-start"
  });
  const [hsv, setHsv] = useState(initialHsv);
  const [alpha, setAlpha] = useState(initialAlpha);
  const update = useCallback(
    (nextHsv, nextAlpha) => {
      setHsv(nextHsv);
      setAlpha(nextAlpha);
      onChange(nextHsv, nextAlpha);
    },
    [onChange]
  );
  const rgb = hsvToRgb(hsv);
  const hueColor = rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }));
  useEffect(() => {
    const onDown = (e) => {
      if (!floatingRef.current?.contains(e.target) && !anchor.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose, floatingRef]);
  const pickHex = useCallback(
    (hex) => {
      const parsed = hexToRgb(hex);
      if (parsed) {
        setHsv(rgbToHsv(parsed));
        setAlpha(showOpacity ? hexAlpha(hex) : 1);
      }
      onPickHex(hex);
    },
    [onPickHex, showOpacity]
  );
  const pickEyeDropper = useCallback(async () => {
    try {
      const ed = new window.EyeDropper();
      const res = await ed.open();
      if (res?.sRGBHex) pickHex(res.sRGBHex);
    } catch {
    }
  }, [pickHex]);
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: floatingRef,
        className: "tecof-color-popover",
        style: floatingStyle,
        role: "dialog",
        "aria-label": "Renk se\xE7ici",
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "tecof-color-sv",
              style: { background: hueColor },
              onPointerDown: (e) => {
                e.preventDefault();
                trackPointer(
                  e.clientX,
                  e.clientY,
                  e.currentTarget,
                  (nx, ny) => update({ h: hsv.h, s: nx, v: 1 - ny }, alpha)
                );
              },
              children: [
                /* @__PURE__ */ jsx("div", { className: "tecof-color-sv-white" }),
                /* @__PURE__ */ jsx("div", { className: "tecof-color-sv-black" }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "tecof-color-sv-thumb",
                    style: {
                      left: `${hsv.s * 100}%`,
                      top: `${(1 - hsv.v) * 100}%`,
                      background: rgbToHex(rgb)
                    }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "tecof-color-sliders", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "tecof-color-track tecof-color-hue",
                onPointerDown: (e) => {
                  e.preventDefault();
                  trackPointer(
                    e.clientX,
                    e.clientY,
                    e.currentTarget,
                    (nx) => update({ h: nx * 360, s: hsv.s, v: hsv.v }, alpha)
                  );
                },
                children: /* @__PURE__ */ jsx("div", { className: "tecof-color-track-thumb", style: { left: `${hsv.h / 360 * 100}%` } })
              }
            ),
            showOpacity && /* @__PURE__ */ jsxs(
              "div",
              {
                className: "tecof-color-track tecof-color-alpha",
                onPointerDown: (e) => {
                  e.preventDefault();
                  trackPointer(
                    e.clientX,
                    e.clientY,
                    e.currentTarget,
                    (nx) => update(hsv, nx)
                  );
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "tecof-color-alpha-fill",
                      style: { background: `linear-gradient(to right, transparent, ${rgbToHex(rgb)})` }
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "tecof-color-track-thumb", style: { left: `${alpha * 100}%` } })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "tecof-color-swatch-row", children: [
            EYEDROPPER_SUPPORTED && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "tecof-color-eyedropper",
                onClick: pickEyeDropper,
                title: "Ekrandan renk se\xE7",
                children: /* @__PURE__ */ jsx(Pipette, { size: 14 })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "tecof-color-swatches", children: swatches.map((sw) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "tecof-color-swatch-dot",
                style: { background: sw },
                title: sw,
                onClick: () => pickHex(sw)
              },
              sw
            )) })
          ] }),
          recent.length > 0 && /* @__PURE__ */ jsxs("div", { className: "tecof-color-recent", children: [
            /* @__PURE__ */ jsx("span", { className: "tecof-color-recent-label", children: "Son kullan\u0131lan" }),
            /* @__PURE__ */ jsx("div", { className: "tecof-color-swatches", children: recent.map((sw) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "tecof-color-swatch-dot",
                style: { background: sw },
                title: sw,
                onClick: () => pickHex(sw)
              },
              sw
            )) })
          ] })
        ]
      }
    ),
    document.body
  );
};
var ColorField = ({
  value,
  onChange,
  readOnly,
  showOpacity = false,
  defaultColor = "",
  placeholder = "#000000",
  showReset = true,
  swatches = DEFAULT_SWATCHES
}) => {
  const [hexInput, setHexInput] = useState(() => toHex(value || ""));
  const [open, setOpen] = useState(false);
  const swatchRef = useRef(null);
  const lastEmitted = useRef("");
  useEffect(() => {
    const hex = toHex(value || "");
    if (hex.toLowerCase() === lastEmitted.current.toLowerCase()) return;
    setHexInput(hex);
  }, [value]);
  const currentHex = normalizeHex(hexInput);
  const isValid = !hexInput || isValidHex(currentHex);
  const rgb = isValid && currentHex ? hexToRgb(currentHex) : null;
  const hsv = rgb ? rgbToHsv(rgb) : { h: 0, s: 0, v: 0 };
  const alpha = hexAlpha(currentHex);
  const emit2 = useCallback(
    (nextRgb, nextAlpha) => {
      let out = rgbToHex(nextRgb);
      if (showOpacity && nextAlpha < 1) {
        out += Math.round(nextAlpha * 255).toString(16).padStart(2, "0");
      }
      lastEmitted.current = out;
      setHexInput(out);
      onChange(out);
    },
    [onChange, showOpacity]
  );
  const handlePopoverChange = useCallback(
    (nextHsv, nextAlpha) => emit2(hsvToRgb(nextHsv), nextAlpha),
    [emit2]
  );
  const handlePickHex = useCallback(
    (hex) => {
      const parsed = hexToRgb(hex);
      if (parsed) emit2(parsed, showOpacity ? hexAlpha(hex) : 1);
    },
    [emit2, showOpacity]
  );
  const handleHexChange = useCallback(
    (e) => {
      let val = e.target.value;
      if (val && !val.startsWith("#")) val = `#${val}`;
      setHexInput(val);
      const norm = normalizeHex(val);
      if (isValidHex(norm)) {
        const parsed = hexToRgb(norm);
        if (parsed) {
          lastEmitted.current = norm;
          onChange(norm.length === 9 ? norm : rgbToHex(parsed));
        }
      }
    },
    [onChange]
  );
  const handleHexBlur = useCallback(() => {
    if (hexInput && !isValidHex(normalizeHex(hexInput))) {
      setHexInput(value || "");
    } else if (hexInput) {
      pushRecent(hexInput);
    }
  }, [hexInput, value]);
  const handleReset = useCallback(() => {
    lastEmitted.current = defaultColor;
    setHexInput(defaultColor);
    onChange(defaultColor);
  }, [defaultColor, onChange]);
  const closePopover = useCallback(() => {
    setOpen(false);
    if (hexInput) pushRecent(hexInput);
  }, [hexInput]);
  return /* @__PURE__ */ jsxs("div", { className: "tecof-color-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-color-preview-row", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          ref: swatchRef,
          type: "button",
          className: `tecof-color-swatch${open ? " focused" : ""}`,
          disabled: readOnly,
          onClick: () => !readOnly && setOpen((o) => !o),
          title: "Renk se\xE7ici",
          children: /* @__PURE__ */ jsx(
            "span",
            {
              className: "tecof-color-swatch-fill",
              style: { background: rgb ? cssColor(rgb, alpha) : "transparent" }
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: hexInput,
          onChange: handleHexChange,
          onBlur: handleHexBlur,
          disabled: readOnly,
          placeholder,
          maxLength: 9,
          className: `tecof-color-hex-input${!isValid ? " invalid" : ""}`
        }
      ),
      !readOnly && showReset && hexInput && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "tecof-color-action-btn",
          onClick: handleReset,
          title: "S\u0131f\u0131rla",
          children: /* @__PURE__ */ jsx(RotateCcw, { size: 14 })
        }
      )
    ] }),
    open && !readOnly && swatchRef.current && /* @__PURE__ */ jsx(
      ColorPopover,
      {
        anchor: swatchRef.current,
        hsv,
        alpha,
        showOpacity,
        swatches,
        onChange: handlePopoverChange,
        onPickHex: handlePickHex,
        onClose: closePopover
      }
    )
  ] });
};
ColorField.displayName = "ColorField";
var createColorField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "color",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsx(
      ColorField,
      {
        field,
        name,
        id,
        value: value || "",
        onChange,
        readOnly,
        ...fieldOptions
      }
    ) }) })
  };
};
var COLOR_FIELDS = [
  { key: "primary", label: "Ana renk" },
  { key: "secondary", label: "\u0130kincil" },
  { key: "accent", label: "Vurgu" },
  { key: "background", label: "Arka plan" },
  { key: "foreground", label: "Metin" },
  { key: "muted", label: "Soluk" },
  { key: "mutedForeground", label: "Soluk metin" },
  { key: "border", label: "Kenarl\u0131k" },
  { key: "card", label: "Kart" },
  { key: "cardForeground", label: "Kart metin" },
  { key: "destructive", label: "Uyar\u0131" }
];
var SPACING_FIELDS = [
  { key: "containerMaxWidth", label: "Kapsay\u0131c\u0131 maks. (px)" },
  { key: "sectionPaddingY", label: "B\xF6l\xFCm dikey bo\u015Fluk (px)" },
  { key: "sectionPaddingX", label: "B\xF6l\xFCm yatay bo\u015Fluk (px)" },
  { key: "componentGap", label: "Bile\u015Fen aral\u0131\u011F\u0131 (px)" },
  { key: "borderRadius", label: "K\xF6\u015Fe yar\u0131\xE7ap\u0131 (px)" },
  { key: "borderRadiusLg", label: "K\xF6\u015Fe \u2014 b\xFCy\xFCk (px)" },
  { key: "borderRadiusSm", label: "K\xF6\u015Fe \u2014 k\xFC\xE7\xFCk (px)" }
];
var NumberRow = ({ label, value, onChange }) => /* @__PURE__ */ jsxs("label", { className: "tecof-theme-row", children: [
  /* @__PURE__ */ jsx("span", { className: "tecof-theme-row-label", children: label }),
  /* @__PURE__ */ jsx(
    "input",
    {
      type: "number",
      className: "tecof-theme-num",
      value: Number.isFinite(value) ? value : 0,
      onChange: (e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))
    }
  )
] });
var TextRow = ({ label, value, onChange }) => /* @__PURE__ */ jsxs("label", { className: "tecof-theme-row tecof-theme-row-stack", children: [
  /* @__PURE__ */ jsx("span", { className: "tecof-theme-row-label", children: label }),
  /* @__PURE__ */ jsx(
    "input",
    {
      type: "text",
      className: "tecof-theme-text",
      value,
      onChange: (e) => onChange(e.target.value)
    }
  )
] });
var ThemeEditor = () => {
  const rootProps = useEditorStore((s) => s.document.root?.props);
  const setRootProps2 = useEditorStore((s) => s.setRootProps);
  const theme = resolveTheme(rootProps);
  const patch = (next) => setRootProps2({ [THEME_PROP]: next });
  const setColor = (key, value) => patch({ ...theme, colors: { ...theme.colors, [key]: value } });
  const setSpacing = (key, value) => patch({ ...theme, spacing: { ...theme.spacing, [key]: value } });
  const setTypography = (key, value) => patch({ ...theme, typography: { ...theme.typography, [key]: value } });
  const resetTheme = () => setRootProps2({ [THEME_PROP]: void 0 });
  return /* @__PURE__ */ jsxs("div", { className: "tecof-theme-editor", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-theme-section", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-theme-section-title", children: "Renkler" }),
      COLOR_FIELDS.map(({ key, label }) => /* @__PURE__ */ jsxs("div", { className: "tecof-theme-row", children: [
        /* @__PURE__ */ jsx("span", { className: "tecof-theme-row-label", children: label }),
        /* @__PURE__ */ jsx("div", { className: "tecof-theme-color", children: /* @__PURE__ */ jsx(
          ColorField,
          {
            field: {},
            name: `theme-${key}`,
            id: `theme-${key}`,
            value: theme.colors[key],
            onChange: (v) => setColor(key, v),
            showReset: false
          }
        ) })
      ] }, key))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-theme-section", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-theme-section-title", children: "Tipografi" }),
      /* @__PURE__ */ jsx(TextRow, { label: "Yaz\u0131 tipi", value: theme.typography.fontFamily, onChange: (v) => setTypography("fontFamily", v) }),
      /* @__PURE__ */ jsx(TextRow, { label: "Ba\u015Fl\u0131k yaz\u0131 tipi", value: theme.typography.headingFontFamily, onChange: (v) => setTypography("headingFontFamily", v) }),
      /* @__PURE__ */ jsx(NumberRow, { label: "Temel boyut (px)", value: theme.typography.baseFontSize, onChange: (v) => setTypography("baseFontSize", v) }),
      /* @__PURE__ */ jsx(NumberRow, { label: "Sat\u0131r y\xFCksekli\u011Fi", value: theme.typography.lineHeight, onChange: (v) => setTypography("lineHeight", v) }),
      /* @__PURE__ */ jsx(NumberRow, { label: "Kal\u0131nl\u0131k \u2014 normal", value: theme.typography.fontWeightNormal, onChange: (v) => setTypography("fontWeightNormal", v) }),
      /* @__PURE__ */ jsx(NumberRow, { label: "Kal\u0131nl\u0131k \u2014 orta", value: theme.typography.fontWeightMedium, onChange: (v) => setTypography("fontWeightMedium", v) }),
      /* @__PURE__ */ jsx(NumberRow, { label: "Kal\u0131nl\u0131k \u2014 kal\u0131n", value: theme.typography.fontWeightBold, onChange: (v) => setTypography("fontWeightBold", v) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-theme-section", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-theme-section-title", children: "Bo\u015Fluk & K\xF6\u015Fe" }),
      SPACING_FIELDS.map(({ key, label }) => /* @__PURE__ */ jsx(NumberRow, { label, value: theme.spacing[key], onChange: (v) => setSpacing(key, v) }, key))
    ] }),
    /* @__PURE__ */ jsx("button", { type: "button", className: "tecof-theme-reset", onClick: resetTheme, children: "Temay\u0131 varsay\u0131lana s\u0131f\u0131rla" })
  ] });
};
var Inspector = () => {
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const updateProps2 = useEditorStore((state) => state.updateProps);
  const setRootProps2 = useEditorStore((state) => state.setRootProps);
  const selectNode = useEditorStore((state) => state.selectNode);
  const { config, readOnly } = useStudio();
  const perms = usePermissions(selectedId);
  const fieldsReadOnly = readOnly || perms.edit === false;
  const [tab, setTab] = useState("content");
  const [rootTab, setRootTab] = useState("page");
  const activeNodeInfo = useMemo(() => {
    if (!selectedId) return null;
    const details = findNodeById(documentState, selectedId);
    if (!details) return null;
    const componentConfig = config.components[details.node.type];
    return {
      node: details.node,
      label: componentConfig?.label || details.node.type,
      componentConfig
    };
  }, [selectedId, documentState, config]);
  const resolved = useResolvedFields(
    activeNodeInfo?.node ?? null,
    activeNodeInfo?.componentConfig
  );
  const editableFields = useMemo(
    () => Object.entries(resolved.fields).filter(
      ([, fieldDef]) => fieldDef?.type !== "slot"
    ),
    [resolved.fields]
  );
  if (selectedId) {
    if (!activeNodeInfo) {
      return /* @__PURE__ */ jsx("div", { className: "tecof-inspector", children: /* @__PURE__ */ jsx("div", { className: "tecof-inspector-empty", children: "Bile\u015Fen y\xFCkleniyor veya bulunamad\u0131." }) });
    }
    const { node, label } = activeNodeInfo;
    return /* @__PURE__ */ jsxs("div", { className: "tecof-inspector", children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-inspector-header", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "tecof-inspector-title", children: label }),
          /* @__PURE__ */ jsx("span", { className: "tecof-inspector-id", children: selectedId })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => selectNode(null), className: "tecof-inspector-deselect", children: "Se\xE7imi Kald\u0131r" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-inspector-tabs", role: "tablist", "aria-label": "Inspector g\xF6r\xFCn\xFCm\xFC", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": tab === "content",
            className: `tecof-inspector-tab${tab === "content" ? " is-active" : ""}`,
            onClick: () => setTab("content"),
            children: "\u0130\xE7erik"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": tab === "style",
            className: `tecof-inspector-tab${tab === "style" ? " is-active" : ""}`,
            onClick: () => setTab("style"),
            children: "Stil"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "tecof-inspector-fields", children: tab === "style" ? /* @__PURE__ */ jsx(
        StyleEditor,
        {
          value: node.props[STYLES_PROP],
          onChange: (next) => updateProps2(selectedId, { [STYLES_PROP]: next })
        }
      ) : editableFields.length === 0 ? /* @__PURE__ */ jsx("div", { className: "tecof-inspector-empty-fields", children: "Bu bile\u015Fenin d\xFCzenlenebilir alan\u0131 bulunmuyor." }) : editableFields.map(([fieldName, fieldDef]) => /* @__PURE__ */ jsx(
        FieldRenderer,
        {
          name: fieldName,
          definition: fieldDef,
          value: node.props[fieldName],
          onChange: (newVal) => updateProps2(selectedId, { [fieldName]: newVal }),
          readOnly: fieldsReadOnly || resolved.readOnly[fieldName] === true || fieldDef?.readOnly === true
        },
        fieldName
      )) })
    ] });
  }
  const rootFields = config.root?.fields || {};
  const rootFieldEntries = Object.entries(rootFields);
  return /* @__PURE__ */ jsxs("div", { className: "tecof-inspector", children: [
    /* @__PURE__ */ jsx("div", { className: "tecof-inspector-header", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "tecof-inspector-title", children: "Sayfa Ayarlar\u0131" }),
      /* @__PURE__ */ jsx("span", { className: "tecof-inspector-id", children: "Genel sayfa konfig\xFCrasyonu" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-inspector-tabs", role: "tablist", "aria-label": "Sayfa g\xF6r\xFCn\xFCm\xFC", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": rootTab === "page",
          className: `tecof-inspector-tab${rootTab === "page" ? " is-active" : ""}`,
          onClick: () => setRootTab("page"),
          children: "Sayfa"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": rootTab === "theme",
          className: `tecof-inspector-tab${rootTab === "theme" ? " is-active" : ""}`,
          onClick: () => setRootTab("theme"),
          children: "Tema"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "tecof-inspector-fields", children: rootTab === "theme" ? /* @__PURE__ */ jsx(ThemeEditor, {}) : rootFieldEntries.length > 0 ? rootFieldEntries.map(([fieldName, fieldDef]) => /* @__PURE__ */ jsx(
      FieldRenderer,
      {
        name: fieldName,
        definition: fieldDef,
        value: documentState.root.props[fieldName],
        onChange: (newVal) => setRootProps2({ [fieldName]: newVal }),
        readOnly
      },
      fieldName
    )) : /* @__PURE__ */ jsxs("div", { className: "tecof-inspector-empty", children: [
      /* @__PURE__ */ jsxs(
        "svg",
        {
          width: "24",
          height: "24",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: "tecof-inspector-empty-icon",
          children: [
            /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
            /* @__PURE__ */ jsx("path", { d: "M9 3v18" })
          ]
        }
      ),
      "Bile\u015Fen se\xE7ilmedi. D\xFCzenlemek istedi\u011Finiz bir bile\u015Fene t\u0131klay\u0131n."
    ] }) })
  ] });
};
var LanguageSwitcher = () => {
  const lang = useActiveLanguage();
  if (!lang || lang.languages.length <= 1) return null;
  return /* @__PURE__ */ jsxs("div", { className: "tecof-lang-switcher", title: "D\xFCzenlenen dil", children: [
    /* @__PURE__ */ jsx(Globe, { size: 14, className: "tecof-lang-switcher-icon" }),
    /* @__PURE__ */ jsx(
      "select",
      {
        className: "tecof-lang-switcher-select",
        value: lang.activeLanguage,
        onChange: (e) => lang.setActiveLanguage(e.target.value),
        "aria-label": "D\xFCzenlenen dil",
        children: lang.languages.map((code) => /* @__PURE__ */ jsxs("option", { value: code, children: [
          code.toUpperCase(),
          code === lang.defaultLanguage ? " \u2022 Varsay\u0131lan" : ""
        ] }, code))
      }
    ),
    /* @__PURE__ */ jsx(ChevronDown, { size: 12, className: "tecof-lang-switcher-caret" })
  ] });
};
var TopBar = ({ onSave, saving, saveStatus, dirty, autoSave }) => {
  const viewport = useEditorStore((state) => state.viewport);
  const setViewport = useEditorStore((state) => state.setViewport);
  const pastCount = useEditorStore((state) => state.history.past.length);
  const futureCount = useEditorStore((state) => state.history.future.length);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const leftPanelOpen = useUiStore((state) => state.leftPanelOpen);
  const rightPanelOpen = useUiStore((state) => state.rightPanelOpen);
  const toggleLeftPanel = useUiStore((state) => state.toggleLeftPanel);
  const toggleRightPanel = useUiStore((state) => state.toggleRightPanel);
  return /* @__PURE__ */ jsxs("div", { className: "tecof-topbar", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-topbar-group", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: toggleLeftPanel,
          className: `tecof-icon-btn${leftPanelOpen ? " is-active" : ""}`,
          title: "Sol paneli a\xE7/kapat",
          "aria-pressed": leftPanelOpen,
          children: /* @__PURE__ */ jsx(PanelLeft, { size: 16 })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "tecof-topbar-title", children: [
        /* @__PURE__ */ jsx("span", { children: "Sayfa D\xFCzenleyici" }),
        saveStatus === "success" && /* @__PURE__ */ jsxs("span", { className: "tecof-topbar-saved", children: [
          /* @__PURE__ */ jsx(Check, { size: 12 }),
          " Kaydedildi"
        ] }),
        dirty && !saving && saveStatus !== "success" && /* @__PURE__ */ jsxs(
          "span",
          {
            className: "tecof-topbar-dirty",
            title: autoSave ? "De\u011Fi\u015Fiklikler otomatik kaydedilecek" : "Kaydedilmemi\u015F de\u011Fi\u015Fiklikler var",
            children: [
              /* @__PURE__ */ jsx("span", { className: "tecof-topbar-dirty-dot" }),
              autoSave ? "Kaydedilecek\u2026" : "Kaydedilmedi"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-topbar-group", children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-topbar-viewports", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setViewport("desktop"),
            className: `tecof-vp-btn${viewport === "desktop" ? " is-active" : ""}`,
            title: "Masa\xFCst\xFC",
            children: /* @__PURE__ */ jsx(Monitor, { size: 16 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setViewport("tablet"),
            className: `tecof-vp-btn${viewport === "tablet" ? " is-active" : ""}`,
            title: "Tablet",
            children: /* @__PURE__ */ jsx(Tablet, { size: 16 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setViewport("mobile"),
            className: `tecof-vp-btn${viewport === "mobile" ? " is-active" : ""}`,
            title: "Mobil",
            children: /* @__PURE__ */ jsx(Smartphone, { size: 16 })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "tecof-topbar-divider" }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-mode-toggle", role: "group", "aria-label": "D\xFCzenleme modu", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setMode("edit"),
            className: `tecof-mode-btn${mode === "edit" ? " is-active" : ""}`,
            title: "D\xFCzenleme: bile\u015Fenleri se\xE7 ve d\xFCzenle",
            children: [
              /* @__PURE__ */ jsx(Pencil, { size: 14 }),
              " D\xFCzenle"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setMode("preview"),
            className: `tecof-mode-btn${mode === "preview" ? " is-active" : ""}`,
            title: "\xD6nizleme: link ve butonlar \xE7al\u0131\u015F\u0131r",
            children: [
              /* @__PURE__ */ jsx(Eye, { size: 14 }),
              " \xD6nizle"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-topbar-group", children: [
      /* @__PURE__ */ jsx(LanguageSwitcher, {}),
      /* @__PURE__ */ jsxs("div", { className: "tecof-topbar-undoredo", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: undo, disabled: pastCount === 0, className: "tecof-icon-btn", title: "Geri Al", children: /* @__PURE__ */ jsx(Undo2, { size: 16 }) }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: redo, disabled: futureCount === 0, className: "tecof-icon-btn", title: "Yinele", children: /* @__PURE__ */ jsx(Redo2, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "tecof-topbar-divider" }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: onSave, disabled: saving, className: "tecof-btn-primary", children: [
        /* @__PURE__ */ jsx(Save, { size: 14 }),
        saving ? "Kaydediliyor..." : "Taslak Kaydet"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: toggleRightPanel,
          className: `tecof-icon-btn${rightPanelOpen ? " is-active" : ""}`,
          title: "Sa\u011F paneli a\xE7/kapat",
          "aria-pressed": rightPanelOpen,
          children: /* @__PURE__ */ jsx(PanelRight, { size: 16 })
        }
      )
    ] })
  ] });
};
var getLayerRowStyle = (depth) => ({ "--tecof-layer-indent": `${depth * 12 + 8}px` });
var getLayerZoneStyle = (depth) => ({ "--tecof-layer-zone-indent": `${(depth + 1) * 12 + 14}px` });
var TreeNode = ({ node, depth }) => {
  const { config } = useStudio();
  const documentState = useEditorStore((state) => state.document);
  const isSelected = useEditorStore(
    (state) => state.selection.selectedIds.includes(node.props.id)
  );
  const selectNode = useEditorStore((state) => state.selectNode);
  const toggleSelect = useEditorStore((state) => state.toggleSelect);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const removeNode2 = useEditorStore((state) => state.removeNode);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);
  const [expanded, setExpanded] = useState(true);
  const [dragOverPos, setDragOverPos] = useState(null);
  const componentConfig = config.components[node.type];
  const label = componentConfig?.label || node.type;
  const perms = usePermissions(node.props.id);
  const childZoneKeys = Object.keys(documentState.zones).filter(
    (key) => key.startsWith(`${node.props.id}:`)
  );
  const hasChildren = childZoneKeys.some(
    (key) => (documentState.zones[key] || []).length > 0
  );
  const isDropAllowed = (e) => {
    const { nodeId: draggedId, type } = readDragData(e);
    if (draggedId && draggedId === node.props.id) return false;
    const doc = useEditorStore.getState().document;
    const targetZoneKey = findNodeById(doc, node.props.id)?.path.zoneKey;
    let draggedType = type || null;
    if (!draggedType && draggedId) {
      draggedType = findNodeById(doc, draggedId)?.node.type ?? null;
    }
    if (!draggedType) return true;
    return isValidDrop(config, draggedType, targetZoneKey, doc);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDropAllowed(e)) {
      e.dataTransfer.dropEffect = "none";
      setDragOverPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    setDragOverPos(relativeY < rect.height / 2 ? "top" : "bottom");
  };
  const handleDragLeave = () => {
    setDragOverPos(null);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const position = dragOverPos;
    setDragOverPos(null);
    const { nodeId: draggedId } = readDragData(e);
    if (!draggedId || draggedId === node.props.id) return;
    if (!isDropAllowed(e)) return;
    const doc = useEditorStore.getState().document;
    const res = findNodeById(doc, node.props.id);
    if (!res) return;
    const { path } = res;
    const targetZoneKey = path.zoneKey;
    const targetIndex = position === "top" ? path.index : path.index + 1;
    useEditorStore.getState().moveNode(draggedId, targetZoneKey, targetIndex);
  };
  const handleRowClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      toggleSelect(node.props.id);
    } else {
      selectNode(node.props.id);
    }
  };
  const handleRowKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectNode(node.props.id);
      return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && isSelected && perms.delete !== false) {
      e.preventDefault();
      removeNode2(node.props.id);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "tecof-layer-node", children: [
    dragOverPos === "top" && /* @__PURE__ */ jsx("div", { className: "tecof-drop-line sm" }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        draggable: perms.drag !== false,
        onDragStart: (e) => {
          writeDragData(e, { nodeId: node.props.id });
          e.dataTransfer.effectAllowed = "move";
          setDragGhost(e, label);
          beginDrag({ id: node.props.id });
        },
        onDragEnd: endDrag,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        onMouseEnter: () => hoverNode(node.props.id),
        onMouseLeave: () => hoverNode(null),
        onClick: handleRowClick,
        onKeyDown: handleRowKeyDown,
        className: `tecof-layer-row${isSelected ? " is-selected" : ""}`,
        role: "treeitem",
        tabIndex: 0,
        "aria-selected": isSelected,
        "aria-expanded": hasChildren ? expanded : void 0,
        style: getLayerRowStyle(depth),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "tecof-layer-row-main", children: [
            hasChildren ? /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                },
                className: "tecof-layer-caret",
                "aria-label": expanded ? `${label} katman\u0131n\u0131 daralt` : `${label} katman\u0131n\u0131 geni\u015Flet`,
                "aria-expanded": expanded,
                children: expanded ? /* @__PURE__ */ jsx(ChevronDown, { size: 14 }) : /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
              }
            ) : /* @__PURE__ */ jsx("div", { className: "tecof-layer-caret-spacer" }),
            /* @__PURE__ */ jsx(PanelsTopLeft, { size: 14, className: "tecof-layer-icon" }),
            /* @__PURE__ */ jsx("span", { className: "tecof-layer-label", children: label })
          ] }),
          perms.delete !== false && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.stopPropagation();
                removeNode2(node.props.id);
              },
              className: "tecof-layer-delete",
              title: "Sil",
              "aria-label": `${label} katman\u0131n\u0131 sil`,
              children: /* @__PURE__ */ jsx(Trash2, { size: 12 })
            }
          )
        ]
      }
    ),
    dragOverPos === "bottom" && /* @__PURE__ */ jsx("div", { className: "tecof-drop-line sm" }),
    expanded && childZoneKeys.map((zoneKey) => {
      const zoneItems = documentState.zones[zoneKey] || [];
      const zoneName = zoneKey.split(":").pop() || "";
      if (zoneItems.length === 0) return null;
      return /* @__PURE__ */ jsxs("div", { className: "tecof-layer-node", children: [
        /* @__PURE__ */ jsx("div", { className: "tecof-layer-zone-label", style: getLayerZoneStyle(depth), children: zoneName }),
        zoneItems.map((childNode) => /* @__PURE__ */ jsx(TreeNode, { node: childNode, depth: depth + 1 }, childNode.props.id))
      ] }, zoneKey);
    })
  ] });
};
var LayersTree = () => {
  const documentState = useEditorStore((state) => state.document);
  return /* @__PURE__ */ jsx("div", { className: "tecof-layers", role: "tree", "aria-label": "Sayfa katmanlar\u0131", children: documentState.content.length === 0 ? /* @__PURE__ */ jsx("div", { className: "tecof-layers-empty", children: "S\xFCr\xFCklenmi\u015F katman yok" }) : documentState.content.map((node) => /* @__PURE__ */ jsx(TreeNode, { node, depth: 0 }, node.props.id)) });
};
var BlockThumb = ({
  type,
  label,
  domain,
  apiClient,
  showPreview = false,
  onAdd,
  onDragStart,
  onDragEnd
}) => {
  const buttonRef = useRef(null);
  const [state, setState] = useState("idle");
  const [src, setSrc] = useState(null);
  const [hovered, setHovered] = useState(false);
  const canPreview = Boolean(apiClient && domain);
  const loadPreview = useRef(() => {
  });
  useEffect(() => {
    if (!canPreview) return;
    const el = buttonRef.current;
    if (!el) return;
    let cancelled = false;
    let observer = null;
    const load = () => {
      if (cancelled) return;
      if (state !== "idle") return;
      setState("loading");
      apiClient.getComponentPreview(domain, type).then((url) => {
        if (cancelled) return;
        if (url) {
          setSrc(url);
          setState("loaded");
        } else {
          setState("failed");
        }
      }).catch(() => {
        if (!cancelled) setState("failed");
      });
    };
    loadPreview.current = load;
    if (showPreview) {
      if (typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              observer?.disconnect();
              observer = null;
              load();
            }
          },
          { rootMargin: "200px" }
        );
        observer.observe(el);
      } else {
        load();
      }
    }
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [canPreview, apiClient, domain, type, showPreview, state]);
  useEffect(() => {
    if (hovered && state === "idle") {
      loadPreview.current();
    }
  }, [hovered, state]);
  const showImage = showPreview && state === "loaded" && src;
  const showSkeleton = showPreview && canPreview && (state === "idle" || state === "loading");
  const showHoverPopover = !showPreview && state === "loaded" && src && hovered;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref: buttonRef,
      type: "button",
      onClick: () => onAdd(type),
      draggable: true,
      onDragStart: (e) => onDragStart(e, type, label),
      onDragEnd,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      className: `tecof-block-btn${showImage ? " tecof-block-btn--thumb" : ""}`,
      title: `${label} ekle`,
      children: [
        showImage ? /* @__PURE__ */ jsx("span", { className: "tecof-block-thumb", children: /* @__PURE__ */ jsx(
          "img",
          {
            src,
            alt: label,
            className: "tecof-block-thumb-img",
            draggable: false,
            loading: "lazy"
          }
        ) }) : showSkeleton ? /* @__PURE__ */ jsx("span", { className: "tecof-block-thumb tecof-block-thumb--loading", children: /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-block-thumb-skeleton" }) }) : null,
        /* @__PURE__ */ jsx("span", { className: "tecof-block-btn-label", children: label }),
        /* @__PURE__ */ jsx(Plus, { size: 14, className: "tecof-block-btn-icon" }),
        showHoverPopover && /* @__PURE__ */ jsxs("span", { className: "tecof-block-popover", children: [
          /* @__PURE__ */ jsxs("span", { className: "tecof-block-popover-title", children: [
            label,
            " \xD6nizleme"
          ] }),
          /* @__PURE__ */ jsx(
            "img",
            {
              src,
              alt: label,
              className: "tecof-block-popover-img",
              draggable: false
            }
          )
        ] })
      ]
    }
  );
};
var resolveDomain = (config, metadata, baseUrl) => {
  const explicit = config?.domain || config?.metadata?.domain || metadata?.domain;
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();
  if (baseUrl) {
    try {
      return new URL(baseUrl).hostname;
    } catch {
    }
  }
  return void 0;
};
var LeftPanel = () => {
  const { config, metadata, apiClient } = useStudio();
  const insertNode2 = useEditorStore((state) => state.insertNode);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);
  const [activeTab, setActiveTab] = useState("blocks");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreviews, setShowPreviews] = useState(false);
  const domain = useMemo(
    () => resolveDomain(config, metadata, apiClient?.cdnUrl),
    [config, metadata, apiClient]
  );
  const categories = config.categories || {};
  const components = config.components || {};
  const groupedComponents = {};
  if (Object.keys(categories).length > 0) {
    Object.entries(categories).forEach(([key, value]) => {
      groupedComponents[value.title || key] = value.components;
    });
  } else {
    Object.entries(components).forEach(([name, compConfig]) => {
      const cat = compConfig.category || "Genel";
      if (!groupedComponents[cat]) {
        groupedComponents[cat] = [];
      }
      groupedComponents[cat].push(name);
    });
  }
  const handleAddBlock = (type) => {
    insertNode2(createNode(config, type));
  };
  const handleBlockDragStart = (e, type, label) => {
    writeDragData(e, { type });
    e.dataTransfer.effectAllowed = "copy";
    setDragGhost(e, label);
    beginDrag({ type });
  };
  return /* @__PURE__ */ jsxs("div", { className: "tecof-left-panel", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-panel-tabs", role: "tablist", "aria-label": "Sol panel g\xF6r\xFCn\xFCm\xFC", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("blocks"),
          className: `tecof-tab${activeTab === "blocks" ? " is-active" : ""}`,
          role: "tab",
          "aria-selected": activeTab === "blocks",
          children: [
            /* @__PURE__ */ jsx(Grid3x3, { size: 14 }),
            "Blok Ekle"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("layers"),
          className: `tecof-tab${activeTab === "layers" ? " is-active" : ""}`,
          role: "tab",
          "aria-selected": activeTab === "layers",
          children: [
            /* @__PURE__ */ jsx(Layers, { size: 14 }),
            "Katmanlar"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "tecof-panel-body", children: activeTab === "blocks" ? /* @__PURE__ */ jsxs("div", { className: "tecof-blocks", children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-search", children: [
        /* @__PURE__ */ jsx(Search, { size: 14, className: "tecof-icon-muted" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Bile\u015Fen ara...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "tecof-search-input"
          }
        ),
        domain && apiClient && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowPreviews(!showPreviews),
            className: `tecof-search-preview-toggle${showPreviews ? " is-active" : ""}`,
            title: showPreviews ? "Resim \xD6nizlemelerini Kapat" : "Resim \xD6nizlemelerini A\xE7",
            children: showPreviews ? /* @__PURE__ */ jsx(Eye, { size: 13 }) : /* @__PURE__ */ jsx(EyeOff, { size: 13 })
          }
        )
      ] }),
      Object.entries(groupedComponents).map(([catTitle, blockTypes]) => {
        const filteredTypes = blockTypes.filter((type) => {
          const label = components[type]?.label || type;
          return label.toLowerCase().includes(searchQuery.toLowerCase());
        });
        if (filteredTypes.length === 0) return null;
        return /* @__PURE__ */ jsxs("div", { className: "tecof-block-cat", children: [
          /* @__PURE__ */ jsx("div", { className: "tecof-block-cat-title", children: catTitle }),
          /* @__PURE__ */ jsx("div", { className: "tecof-block-grid", children: filteredTypes.map((type) => {
            const compConfig = components[type] || {};
            const label = compConfig.label || type;
            return /* @__PURE__ */ jsx(
              BlockThumb,
              {
                type,
                label,
                domain,
                apiClient,
                showPreview: showPreviews,
                onAdd: handleAddBlock,
                onDragStart: handleBlockDragStart,
                onDragEnd: endDrag
              },
              type
            );
          }) })
        ] }, catTitle);
      })
    ] }) : /* @__PURE__ */ jsx(LayersTree, {}) })
  ] });
};
function useKeyboardShortcuts() {
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const removeNodes2 = useEditorStore((state) => state.removeNodes);
  const duplicateNodes2 = useEditorStore((state) => state.duplicateNodes);
  const selectedIds = useEditorStore((state) => state.selection.selectedIds);
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) {
        return;
      }
      const isMac2 = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac2 ? e.metaKey : e.ctrlKey;
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          removeNodes2();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === "d") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          duplicateNodes2();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, removeNodes2, duplicateNodes2, selectedIds]);
}
var TecofStudio = ({
  pageId,
  config,
  accessToken,
  onSave,
  onChange,
  hostOrigin,
  autoSave = false,
  autoSaveDelay = 2e3,
  warnOnUnsavedChanges = true,
  className
}) => {
  const { apiClient } = useTecof();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [dirty, setDirty] = useState(false);
  const setDocument = useEditorStore((state) => state.setDocument);
  const setPermissionResolver = useEditorStore((state) => state.setPermissionResolver);
  const documentState = useEditorStore((state) => state.document);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const setViewport = useEditorStore((state) => state.setViewport);
  const leftPanelOpen = useUiStore((state) => state.leftPanelOpen);
  const rightPanelOpen = useUiStore((state) => state.rightPanelOpen);
  const toggleLeftPanel = useUiStore((state) => state.toggleLeftPanel);
  const toggleRightPanel = useUiStore((state) => state.toggleRightPanel);
  const mode = useUiStore((state) => state.mode);
  const documentStateRef = useRef(documentState);
  documentStateRef.current = documentState;
  const savedDocRef = useRef(documentState);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  savingRef.current = saving;
  const autoSaveTimerRef = useRef(null);
  const isEmbedded2 = isEmbedded();
  useKeyboardShortcuts();
  useEffect(() => {
    configureBridge(hostOrigin);
  }, [hostOrigin]);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getPage(pageId, controller.signal);
        if (cancelled) return;
        const rawData = res.success && res.data?.draftData ? res.data.draftData : null;
        const parsedDoc = migrateDocument(parseDocument(rawData), config.migrations);
        setDocument(parsedDoc);
        savedDocRef.current = useEditorStore.getState().document;
        dirtyRef.current = false;
        setDirty(false);
      } catch (err) {
        if (cancelled || err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        console.error("Failed to load page:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [pageId, apiClient, setDocument]);
  const isFirstRender = useRef(true);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const changeTimerRef = useRef(null);
  useEffect(() => {
    if (loading) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    changeTimerRef.current = setTimeout(() => {
      changeTimerRef.current = null;
      const serialized = serializeDocument(documentStateRef.current);
      onChangeRef.current?.(serialized);
      if (isEmbedded2) {
        postToHost("puck:changed");
      }
    }, 300);
  }, [documentState, loading, isEmbedded2]);
  useEffect(() => {
    return () => {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    };
  }, []);
  const handleSaveDraft = useCallback(async () => {
    const currentDoc = documentStateRef.current;
    const serialized = serializeDocument(currentDoc);
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await apiClient.savePage(pageId, serialized, void 0, accessToken);
      if (res.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3e3);
        savedDocRef.current = currentDoc;
        dirtyRef.current = documentStateRef.current !== currentDoc;
        setDirty(dirtyRef.current);
        onSave?.(serialized);
        if (isEmbedded2) {
          postToHost("puck:saved", { data: serialized });
        }
      } else {
        setSaveStatus("error");
        if (isEmbedded2) {
          postToHost("puck:saveError", { message: res.message });
        }
      }
    } catch (err) {
      setSaveStatus("error");
      if (isEmbedded2) {
        postToHost("puck:saveError", { message: err.message });
      }
    } finally {
      setSaving(false);
    }
  }, [pageId, apiClient, accessToken, onSave, isEmbedded2]);
  useEffect(() => {
    if (loading) return;
    const isDirty = documentState !== savedDocRef.current;
    dirtyRef.current = isDirty;
    setDirty(isDirty);
    if (!isDirty || !autoSave) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      if (documentStateRef.current !== savedDocRef.current && !savingRef.current) {
        handleSaveDraft();
      }
    }, autoSaveDelay);
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [documentState, loading, autoSave, autoSaveDelay, handleSaveDraft]);
  useEffect(() => {
    if (!warnOnUnsavedChanges) return;
    const handler = (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [warnOnUnsavedChanges]);
  useEffect(() => {
    if (!isEmbedded2) return;
    const onMessage = (e) => {
      if (!isAllowedOrigin(e.origin)) return;
      switch (e.data?.type) {
        case "puck:save":
        case "puck:publish":
          handleSaveDraft();
          break;
        case "puck:undo":
          undo();
          break;
        case "puck:redo":
          redo();
          break;
        case "puck:viewport":
          if (e.data.width) {
            const width = e.data.width;
            if (width === "375px" || width === 375) {
              setViewport("mobile");
            } else if (width === "768px" || width === 768) {
              setViewport("tablet");
            } else {
              setViewport("desktop");
            }
          }
          break;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isEmbedded2, handleSaveDraft, undo, redo, setViewport]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = () => {
        const activeEl = document.activeElement;
        if (activeEl) {
          const tag = activeEl.tagName.toLowerCase();
          if (tag === "input" || tag === "textarea" || activeEl.hasAttribute("contenteditable")) {
            return true;
          }
        }
        const iframe = document.querySelector(".tecof-canvas-viewport iframe");
        const iframeDoc = iframe?.contentDocument;
        const iframeActiveEl = iframeDoc?.activeElement;
        if (iframeActiveEl) {
          const tag = iframeActiveEl.tagName.toLowerCase();
          if (tag === "input" || tag === "textarea" || iframeActiveEl.hasAttribute("contenteditable")) {
            return true;
          }
        }
        return false;
      };
      const selectedId = useEditorStore.getState().selection.selectedId;
      const selectedIds = useEditorStore.getState().selection.selectedIds;
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useUiStore.getState().toggleCommandPalette();
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveDraft();
        return;
      }
      if (e.key === "Escape") {
        if (useUiStore.getState().commandPaletteOpen) {
          useUiStore.getState().setCommandPaletteOpen(false);
          return;
        }
        useEditorStore.getState().selectNode(null);
        if (isEmbedded2) {
          postToHost("puck:itemDeselected");
        }
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (isInput()) return;
      if (!isCmdOrCtrl && selectedId && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        const doc = useEditorStore.getState().document;
        const res = findNodeById(doc, selectedId);
        if (res) {
          const { zoneKey, index } = res.path;
          const list = zoneKey ? doc.zones[zoneKey] : doc.content;
          const dir = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1;
          const sibling = list?.[index + dir];
          if (sibling) {
            e.preventDefault();
            useEditorStore.getState().selectNode(sibling.props.id);
          }
        }
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === "c" && selectedId) {
        e.preventDefault();
        useEditorStore.getState().copyNode();
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === "x" && selectedId) {
        e.preventDefault();
        useEditorStore.getState().cutNode();
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === "v") {
        e.preventDefault();
        useEditorStore.getState().pasteClipboard();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        useEditorStore.getState().removeNodes(selectedIds);
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === "d" && selectedIds.length > 0) {
        e.preventDefault();
        useEditorStore.getState().duplicateNodes(selectedIds);
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, isEmbedded2, handleSaveDraft]);
  useEffect(() => {
    setPermissionResolver((node) => getNodePermissions(config, node));
    return () => setPermissionResolver(null);
  }, [config, setPermissionResolver]);
  const studioContextValue = useMemo(() => ({
    config,
    readOnly: mode === "preview",
    apiClient
  }), [config, mode, apiClient]);
  if (loading) {
    return /* @__PURE__ */ jsx(StudioSkeleton, { className });
  }
  return /* @__PURE__ */ jsx(StudioContext.Provider, { value: studioContextValue, children: /* @__PURE__ */ jsx(LanguageProvider, { children: /* @__PURE__ */ jsxs("div", { className: `tecof-studio-root ${className || ""}`.trim(), children: [
    /* @__PURE__ */ jsx(TopBar, { onSave: handleSaveDraft, saving, saveStatus, dirty, autoSave }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-studio-workspace-container", children: [
      leftPanelOpen ? /* @__PURE__ */ jsx(LeftPanel, {}) : /* @__PURE__ */ jsx(PanelRail, { side: "left", onExpand: toggleLeftPanel }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-studio-workspace", children: [
        /* @__PURE__ */ jsx(Canvas, {}),
        /* @__PURE__ */ jsx(SelectionOverlay, {})
      ] }),
      rightPanelOpen ? /* @__PURE__ */ jsx(Inspector, {}) : /* @__PURE__ */ jsx(PanelRail, { side: "right", onExpand: toggleRightPanel })
    ] }),
    saving && /* @__PURE__ */ jsx("div", { className: `tecof-studio-save-indicator${saveStatus === "error" ? " is-error" : ""}`, children: saveStatus === "error" ? "Kaydedilemedi" : "Kaydediliyor..." }),
    /* @__PURE__ */ jsx(CommandPalette, { onSave: handleSaveDraft }),
    /* @__PURE__ */ jsx(ThemeVars, {})
  ] }) }) });
};
var PanelRail = ({ side, onExpand }) => /* @__PURE__ */ jsx("div", { className: `tecof-panel-rail tecof-panel-rail-${side}`, children: /* @__PURE__ */ jsx(
  "button",
  {
    type: "button",
    className: "tecof-icon-btn",
    onClick: onExpand,
    title: side === "left" ? "Sol paneli a\xE7" : "Sa\u011F paneli a\xE7",
    "aria-label": side === "left" ? "Sol paneli a\xE7" : "Sa\u011F paneli a\xE7",
    children: side === "left" ? /* @__PURE__ */ jsx(PanelLeft, { size: 16 }) : /* @__PURE__ */ jsx(PanelRight, { size: 16 })
  }
) });
var StudioSkeleton = ({ className }) => /* @__PURE__ */ jsxs("div", { className: `tecof-studio-skeleton ${className || ""}`.trim(), "aria-busy": "true", "aria-label": "St\xFCdyo y\xFCkleniyor", children: [
  /* @__PURE__ */ jsxs("div", { className: "tecof-studio-skeleton-topbar", children: [
    /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-title" }),
    /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-vp" }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-studio-skeleton-toolgroup", children: [
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-dot" }),
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-dot" }),
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-cta" })
    ] })
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "tecof-studio-skeleton-body", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-studio-skeleton-side", children: [
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-search" }),
      Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-blockrow" }, i))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-studio-skeleton-canvas", children: [
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-block" }),
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-block" }),
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-block" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-studio-skeleton-side right", children: [
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-60" }),
      Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-text sm w-40" }),
        /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-field" })
      ] }, i))
    ] })
  ] })
] });

// src/components/TecofEditor.tsx
var TecofEditor = TecofStudio;
var RenderContext = createContext(null);
var ParentNodeContext2 = createContext(null);
var RenderDropZone = ({ zone, className, style, orientation = "vertical" }) => {
  const parentId = useContext(ParentNodeContext2);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const context = useContext(RenderContext);
  if (!context) return null;
  const items = context.zones[zoneKey] || [];
  const orientationStyle = orientation === "horizontal" ? { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" } : void 0;
  return /* @__PURE__ */ jsx("div", { className, style: { ...orientationStyle, ...style }, children: items.map((item, index) => /* @__PURE__ */ jsx(RenderNode, { node: item, index }, item.props.id || index)) });
};
var RenderNode = ({ node, index }) => {
  const context = useContext(RenderContext);
  if (!context) return null;
  const componentConfig = context.config.components[node.type];
  if (!componentConfig) return null;
  const styleClassName = compileStyles(node.props[STYLES_PROP]);
  const componentProps = {
    ...node.props,
    className: mergeClassName(node.props.className, styleClassName),
    puck: {
      renderDropZone: RenderDropZone,
      isEditing: false,
      metadata: {
        cmsData: context.cmsData || null,
        ...componentConfig.metadata || {}
      }
    },
    editMode: false
  };
  if (componentConfig.fields) {
    Object.entries(componentConfig.fields).forEach(([fieldName, fieldDef]) => {
      if (fieldDef && fieldDef.type === "slot") {
        componentProps[fieldName] = /* @__PURE__ */ jsx(RenderDropZone, { zone: fieldName, orientation: fieldDef.orientation });
      }
    });
  }
  return /* @__PURE__ */ jsx(ParentNodeContext2.Provider, { value: node.props.id || null, children: componentConfig.render(componentProps) });
};
var TecofRender = ({ data, config, className, cmsData }) => {
  if (!data) return null;
  const doc = migrateDocument(
    {
      root: data.root ?? { props: {} },
      // PuckContentItem/TecofNode share a shape; nodes always carry an id at runtime.
      content: data.content ?? [],
      zones: data.zones ?? {}
    },
    config.migrations
  );
  const contextValue = {
    zones: doc.zones || {},
    config,
    cmsData: cmsData || null
  };
  const renderedContent = doc.content.map((item, index) => /* @__PURE__ */ jsx(RenderNode, { node: item, index }, item.props.id || index));
  const rootProps = doc.root?.props || {};
  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render ? rootConfig.render({
    ...rootProps,
    children: renderedContent,
    editMode: false
  }) : renderedContent;
  return /* @__PURE__ */ jsx(RenderContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx("div", { className, children: contentWithLayout }) });
};
var EditorFieldImpl = lazy(() => import('./EditorField.impl-MSWXZU6Z.mjs'));
var EditorField = (props) => /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(FieldLoading, {}), children: /* @__PURE__ */ jsx(EditorFieldImpl, { ...props }) });
var createEditorField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "editor",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsx(
      EditorField,
      {
        field,
        name,
        id,
        value: value || [],
        onChange,
        readOnly,
        ...fieldOptions
      }
    ) }) })
  };
};
var UploadFieldImpl = lazy(() => import('./UploadField.impl-DN2FTNIF.mjs'));
var UploadField = (props) => /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(FieldLoading, {}), children: /* @__PURE__ */ jsx(UploadFieldImpl, { ...props }) });
UploadField.displayName = "UploadField";
var createUploadField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "upload",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsx(
      UploadField,
      {
        field,
        name,
        id,
        value: value || [],
        onChange,
        readOnly,
        ...fieldOptions
      }
    ) }) })
  };
};
var CodeEditorFieldImpl = lazy(() => import('./CodeEditorField.impl-ZSUUHAVZ.mjs'));
var CodeEditorField = forwardRef((props, ref) => /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(FieldLoading, {}), children: /* @__PURE__ */ jsx(CodeEditorFieldImpl, { ref, ...props }) }));
CodeEditorField.displayName = "CodeEditorField";
var createCodeEditorField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "code",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsx(
      CodeEditorField,
      {
        field,
        name,
        id,
        value: value || "",
        onChange,
        readOnly,
        ...fieldOptions
      }
    ) }) })
  };
};
var LinkField = ({
  value,
  onChange,
  readOnly,
  showTarget = true,
  placeholder = "https://..."
}) => {
  const { apiClient } = useTecof();
  const {
    merchantInfo,
    loading: langLoading,
    error: langError,
    activeTab: localActiveTab,
    setActiveTab: localSetActiveTab
  } = useLanguages();
  const globalLang = useActiveLanguage();
  const activeTab = globalLang ? globalLang.activeLanguage : localActiveTab;
  const setActiveTab = globalLang ? globalLang.setActiveLanguage : localSetActiveTab;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [manualLabel, setManualLabel] = useState("");
  const [manualTarget, setManualTarget] = useState("_self");
  const values = useMemo(() => {
    if (!merchantInfo) return value || [];
    const current2 = value || [];
    return merchantInfo.languages.map((code) => {
      const existing = current2.find((v) => v.code === code);
      return existing || { code, value: { url: "" } };
    });
  }, [value, merchantInfo]);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const activeValueItem = values.find((v) => v.code === activeTab);
  const activeValue = activeValueItem?.value || { url: "" };
  const updateActiveValue = useCallback((newLinkVal) => {
    const updated = [...valuesRef.current];
    const idx = updated.findIndex((v) => v.code === activeTab);
    if (idx >= 0) {
      if (newLinkVal) {
        updated[idx] = { ...updated[idx], value: newLinkVal };
      } else {
        updated[idx] = { ...updated[idx], value: { url: "" } };
      }
    } else if (newLinkVal) {
      updated.push({ code: activeTab, value: newLinkVal });
    }
    onChangeRef.current(updated);
  }, [activeTab]);
  useEffect(() => {
    if (!drawerOpen) return;
    setLoading(true);
    apiClient.getPages().then((res) => {
      if (res.success && res.data) {
        setPages(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [drawerOpen, apiClient]);
  const filteredPages = search.trim() ? pages.filter(
    (p) => p.slug?.toLowerCase().includes(search.toLowerCase()) || p.title?.toLowerCase().includes(search.toLowerCase())
  ) : pages;
  const handleSelectPage = useCallback((page) => {
    updateActiveValue({
      url: `/${page.slug}`,
      label: page.title || page.slug,
      target: "_self",
      type: "page"
    });
    setDrawerOpen(false);
  }, [updateActiveValue]);
  const handleConfirmManual = useCallback(() => {
    if (!manualUrl.trim()) return;
    updateActiveValue({
      url: manualUrl.trim(),
      label: manualLabel.trim() || manualUrl.trim(),
      target: manualTarget,
      type: "custom"
    });
    setShowManual(false);
    setManualUrl("");
    setManualLabel("");
  }, [manualUrl, manualLabel, manualTarget, updateActiveValue]);
  const handleClear = useCallback(() => {
    updateActiveValue(null);
  }, [updateActiveValue]);
  const handleEditManual = useCallback(() => {
    if (activeValue && activeValue.url) {
      setManualUrl(activeValue.url || "");
      setManualLabel(activeValue.label || "");
      setManualTarget(activeValue.target || "_self");
    } else {
      setManualUrl("");
      setManualLabel("");
      setManualTarget("_self");
    }
    setShowManual(true);
  }, [activeValue]);
  const hasValue = activeValue && activeValue.url && activeValue.url !== "";
  return /* @__PURE__ */ jsxs("div", { className: "tecof-link-container", children: [
    !globalLang && merchantInfo && merchantInfo.languages.length > 1 && /* @__PURE__ */ jsx(
      LanguageTabBar,
      {
        languages: merchantInfo.languages,
        defaultLanguage: merchantInfo.defaultLanguage,
        activeTab,
        onTabChange: setActiveTab
      }
    ),
    langLoading && /* @__PURE__ */ jsx(FieldLoading, {}),
    hasValue && /* @__PURE__ */ jsxs("div", { className: "tecof-link-value-box", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-link-value-icon", children: activeValue.type === "page" ? /* @__PURE__ */ jsx(FileText, { size: 16 }) : /* @__PURE__ */ jsx(Globe, { size: 16 }) }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-link-value-info", children: [
        /* @__PURE__ */ jsx("p", { className: "tecof-link-value-label", children: activeValue.label || activeValue.url }),
        /* @__PURE__ */ jsx("p", { className: "tecof-link-value-url", children: activeValue.url })
      ] }),
      /* @__PURE__ */ jsx("span", { className: `tecof-link-value-badge ${activeValue.type === "page" ? "tecof-link-badge-page" : "tecof-link-badge-custom"}`, children: activeValue.type === "page" ? "Sayfa" : "Link" }),
      activeValue.target === "_blank" && /* @__PURE__ */ jsx(ExternalLink, { size: 14, className: "tecof-icon-muted" }),
      !readOnly && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "tecof-link-action-btn-small", onClick: handleEditManual, title: "D\xFCzenle", children: /* @__PURE__ */ jsx(Pencil, { size: 14 }) }),
        /* @__PURE__ */ jsx("button", { type: "button", className: "tecof-link-action-btn-small", onClick: handleClear, title: "Kald\u0131r", children: /* @__PURE__ */ jsx(X, { size: 14 }) })
      ] })
    ] }),
    !readOnly && !hasValue && !showManual && /* @__PURE__ */ jsxs("div", { className: "tecof-link-main-actions", children: [
      /* @__PURE__ */ jsxs("button", { type: "button", className: "tecof-link-btn-secondary", onClick: () => setDrawerOpen(true), children: [
        /* @__PURE__ */ jsx(FileText, { size: 16 }),
        " Sayfa Se\xE7"
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", className: "tecof-link-btn-secondary", onClick: () => setShowManual(true), children: [
        /* @__PURE__ */ jsx(Link, { size: 16 }),
        " Manuel Link"
      ] })
    ] }),
    !readOnly && showManual && /* @__PURE__ */ jsxs("div", { className: "tecof-link-input-group", children: [
      /* @__PURE__ */ jsx("p", { className: "tecof-link-input-label", children: "Manuel Link" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder,
          value: manualUrl,
          onChange: (e) => setManualUrl(e.target.value),
          className: "tecof-link-input"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Etiket (opsiyonel)",
          value: manualLabel,
          onChange: (e) => setManualLabel(e.target.value),
          className: "tecof-link-input"
        }
      ),
      showTarget && /* @__PURE__ */ jsx("div", { className: "tecof-link-input-row", children: /* @__PURE__ */ jsxs(
        "select",
        {
          value: manualTarget,
          onChange: (e) => setManualTarget(e.target.value),
          className: "tecof-link-select-small tecof-flex-1",
          children: [
            /* @__PURE__ */ jsx("option", { value: "_self", children: "Ayn\u0131 Sekmede A\xE7" }),
            /* @__PURE__ */ jsx("option", { value: "_blank", children: "Yeni Sekmede A\xE7" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-link-manual-actions", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "tecof-link-btn-confirm", onClick: handleConfirmManual, children: "Uygula" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "tecof-link-btn-secondary tecof-flex-none tecof-pad-8-16",
            onClick: () => setShowManual(false),
            children: "\u0130ptal"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(Drawer.Root, { open: drawerOpen, onOpenChange: setDrawerOpen, children: /* @__PURE__ */ jsxs(Drawer.Portal, { children: [
      /* @__PURE__ */ jsx(Drawer.Overlay, { className: "tecof-link-drawer-overlay" }),
      /* @__PURE__ */ jsxs(Drawer.Content, { className: "tecof-link-drawer-content", children: [
        /* @__PURE__ */ jsx(Drawer.Title, { className: "tecof-sr-only", children: "Ba\u011Flant\u0131 Sayfas\u0131 Se\xE7ici" }),
        /* @__PURE__ */ jsx(Drawer.Description, { className: "tecof-sr-only", children: "Sayfa listesinden se\xE7im yap\u0131n veya arama yap\u0131n" }),
        /* @__PURE__ */ jsxs("div", { className: "tecof-link-drawer-header", children: [
          /* @__PURE__ */ jsx("h2", { className: "tecof-link-drawer-title", children: "Sayfa Se\xE7" }),
          /* @__PURE__ */ jsx("button", { className: "tecof-link-drawer-close-btn", onClick: () => setDrawerOpen(false), children: /* @__PURE__ */ jsx(X, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "tecof-link-search-box", children: [
          /* @__PURE__ */ jsx(Search, { size: 16, className: "tecof-icon-muted" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Sayfa ara...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "tecof-link-search-input"
            }
          )
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "tecof-field-loading", "aria-busy": "true", children: [0, 1, 2].map((item) => /* @__PURE__ */ jsxs("div", { className: "tecof-field-loading-row", children: [
          /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-circle tecof-field-loading-thumb" }),
          /* @__PURE__ */ jsxs("div", { className: "tecof-field-loading-lines", children: [
            /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-60" }),
            /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-text sm w-80" })
          ] })
        ] }, item)) }) : filteredPages.length === 0 ? /* @__PURE__ */ jsx("div", { className: "tecof-text-center tecof-p-40 tecof-text-muted", children: search ? "Sonu\xE7 bulunamad\u0131" : "Hen\xFCz sayfa yok" }) : /* @__PURE__ */ jsx("div", { className: "tecof-link-page-list", children: filteredPages.map((page) => {
          const selected = activeValue?.url === `/${page.slug}`;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `tecof-link-page-item ${selected ? "selected" : ""}`,
              onClick: () => handleSelectPage(page),
              children: [
                /* @__PURE__ */ jsx("div", { className: `tecof-link-status-dot ${page.status || "draft"}`, title: page.status }),
                /* @__PURE__ */ jsxs("div", { className: "tecof-flex-1 tecof-min-w-0", children: [
                  /* @__PURE__ */ jsxs("p", { className: "tecof-link-page-slug", children: [
                    "/",
                    page.slug
                  ] }),
                  page.title && /* @__PURE__ */ jsx("p", { className: "tecof-link-page-title", children: page.title })
                ] }),
                /* @__PURE__ */ jsx(ChevronRight, { size: 16, className: "tecof-icon-faint" })
              ]
            },
            page._id
          );
        }) })
      ] })
    ] }) })
  ] });
};
LinkField.displayName = "LinkField";
var createLinkField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "link",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsx(
      LinkField,
      {
        field,
        name,
        id,
        value: value || [],
        onChange,
        readOnly,
        ...fieldOptions
      }
    ) }) })
  };
};
var RepeaterRow = ({
  row,
  rowIndex,
  subFields,
  isExpanded,
  onToggle,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onChange,
  canRemove,
  canMoveUp,
  canMoveDown,
  readOnly
}) => {
  const previewLabel = useMemo(() => {
    const keys = Object.keys(subFields);
    if (keys.length === 0) return `Sat\u0131r ${rowIndex + 1}`;
    const firstKey = keys[0];
    const val = row[firstKey];
    if (!val) return `Sat\u0131r ${rowIndex + 1}`;
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && "value" in val[0]) {
      const text = val[0]?.value;
      if (typeof text === "string" && text.trim()) {
        return text.length > 40 ? text.substring(0, 40) + "\u2026" : text;
      }
    }
    if (typeof val === "string" && val.trim()) {
      return val.length > 40 ? val.substring(0, 40) + "\u2026" : val;
    }
    return `Sat\u0131r ${rowIndex + 1}`;
  }, [row, subFields, rowIndex]);
  return /* @__PURE__ */ jsxs("div", { className: `tecof-repeater-row ${isExpanded ? "expanded" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-repeater-row-header", onClick: onToggle, children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-repeater-row-left", children: [
        /* @__PURE__ */ jsx(GripVertical, { size: 14, className: "tecof-repeater-grip" }),
        /* @__PURE__ */ jsx("span", { className: "tecof-repeater-row-index", children: rowIndex + 1 }),
        /* @__PURE__ */ jsx("span", { className: "tecof-repeater-row-preview", children: previewLabel })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-repeater-row-actions", children: [
        !readOnly && /* @__PURE__ */ jsxs(Fragment, { children: [
          canMoveUp && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "tecof-repeater-action-btn",
              onClick: (e) => {
                e.stopPropagation();
                onMoveUp();
              },
              title: "Yukar\u0131 Ta\u015F\u0131",
              children: "\u25B2"
            }
          ),
          canMoveDown && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "tecof-repeater-action-btn",
              onClick: (e) => {
                e.stopPropagation();
                onMoveDown();
              },
              title: "A\u015Fa\u011F\u0131 Ta\u015F\u0131",
              children: "\u25BC"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "tecof-repeater-action-btn",
              onClick: (e) => {
                e.stopPropagation();
                onDuplicate();
              },
              title: "Kopyala",
              children: /* @__PURE__ */ jsx(Copy, { size: 13 })
            }
          ),
          canRemove && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "tecof-repeater-action-btn tecof-repeater-action-btn-danger",
              onClick: (e) => {
                e.stopPropagation();
                onRemove();
              },
              title: "Sil",
              children: /* @__PURE__ */ jsx(Trash2, { size: 13 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          ChevronDown,
          {
            size: 16,
            className: `tecof-repeater-chevron ${isExpanded ? "rotated" : ""}`
          }
        )
      ] })
    ] }),
    isExpanded && /* @__PURE__ */ jsx("div", { className: "tecof-repeater-row-content", children: Object.entries(subFields).map(([key, fieldDef]) => {
      const fieldValue = row[key];
      const renderFn = fieldDef?.render;
      if (typeof renderFn !== "function") return null;
      return /* @__PURE__ */ jsx("div", { className: "tecof-repeater-subfield", children: renderFn({
        field: fieldDef,
        name: `${key}_${rowIndex}`,
        id: `repeater-${rowIndex}-${key}`,
        value: fieldValue,
        onChange: (val) => onChange(key, val),
        readOnly
      }) }, key);
    }) })
  ] });
};
var RepeaterField = ({
  value: rawValue,
  onChange,
  readOnly,
  subFields = {},
  minItems = 0,
  maxItems,
  defaultRow
}) => {
  const items = useMemo(() => Array.isArray(rawValue) ? rawValue : [], [rawValue]);
  const [expandedRows, setExpandedRows] = useState(() => new Set(items.length > 0 ? [0] : []));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const canAdd = maxItems == null || items.length < maxItems;
  const canRemove = items.length > minItems;
  const buildDefaultRow = useCallback(() => {
    if (defaultRow) return { ...defaultRow };
    const row = {};
    for (const [key, fieldDef] of Object.entries(subFields)) {
      const ft = fieldDef?._fieldType;
      if (ft === "language" || ft === "editor") {
        row[key] = [];
      } else if (ft === "upload") {
        row[key] = [];
      } else if (ft === "link") {
        row[key] = [];
      } else if (ft === "color") {
        row[key] = "#000000";
      } else {
        row[key] = "";
      }
    }
    return row;
  }, [subFields, defaultRow]);
  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    const newRow = buildDefaultRow();
    const newItems = [...items, newRow];
    onChangeRef.current(newItems);
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.add(newItems.length - 1);
      return next;
    });
  }, [canAdd, buildDefaultRow, items]);
  const handleRemove = useCallback((index) => {
    if (!canRemove) return;
    const newItems = items.filter((_, i) => i !== index);
    onChangeRef.current(newItems);
    setExpandedRows((prev) => {
      const next = /* @__PURE__ */ new Set();
      prev.forEach((idx) => {
        if (idx < index) next.add(idx);
        else if (idx > index) next.add(idx - 1);
      });
      return next;
    });
  }, [canRemove, items]);
  const handleDuplicate = useCallback((index) => {
    if (!canAdd) return;
    const newItems = [...items];
    const cloned = JSON.parse(JSON.stringify(items[index]));
    newItems.splice(index + 1, 0, cloned);
    onChangeRef.current(newItems);
    setExpandedRows((prev) => {
      const next = /* @__PURE__ */ new Set();
      prev.forEach((idx) => {
        if (idx <= index) next.add(idx);
        else next.add(idx + 1);
      });
      next.add(index + 1);
      return next;
    });
  }, [canAdd, items]);
  const handleMove = useCallback((index, direction) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    onChangeRef.current(newItems);
    setExpandedRows((prev) => {
      const next = /* @__PURE__ */ new Set();
      prev.forEach((idx) => {
        if (idx === index) next.add(target);
        else if (idx === target) next.add(index);
        else next.add(idx);
      });
      return next;
    });
  }, [items]);
  const handleSubFieldChange = useCallback((rowIndex, key, val) => {
    const newItems = items.map((row, i) => {
      if (i !== rowIndex) return row;
      return { ...row, [key]: val };
    });
    onChangeRef.current(newItems);
  }, [items]);
  const toggleRow = useCallback((index) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "tecof-repeater-container", children: [
    /* @__PURE__ */ jsx("div", { className: "tecof-repeater-header", children: /* @__PURE__ */ jsxs("span", { className: "tecof-repeater-count", children: [
      items.length,
      " sat\u0131r",
      maxItems != null && ` / ${maxItems}`
    ] }) }),
    items.length === 0 && !readOnly && /* @__PURE__ */ jsxs("div", { className: "tecof-repeater-empty", children: [
      /* @__PURE__ */ jsx("p", { className: "tecof-repeater-empty-text", children: "Hen\xFCz sat\u0131r eklenmemi\u015F" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "tecof-repeater-add-btn",
          onClick: handleAdd,
          children: [
            /* @__PURE__ */ jsx(Plus, { size: 14 }),
            " \u0130lk Sat\u0131r\u0131 Ekle"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "tecof-repeater-rows", children: items.map((row, idx) => /* @__PURE__ */ jsx(
      RepeaterRow,
      {
        row,
        rowIndex: idx,
        subFields,
        isExpanded: expandedRows.has(idx),
        onToggle: () => toggleRow(idx),
        onRemove: () => handleRemove(idx),
        onDuplicate: () => handleDuplicate(idx),
        onMoveUp: () => handleMove(idx, "up"),
        onMoveDown: () => handleMove(idx, "down"),
        onChange: (key, val) => handleSubFieldChange(idx, key, val),
        canRemove,
        canMoveUp: idx > 0,
        canMoveDown: idx < items.length - 1,
        readOnly
      },
      idx
    )) }),
    items.length > 0 && !readOnly && canAdd && /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "tecof-repeater-add-btn-bottom",
        onClick: handleAdd,
        children: [
          /* @__PURE__ */ jsx(Plus, { size: 14 }),
          " Sat\u0131r Ekle"
        ]
      }
    )
  ] });
};
RepeaterField.displayName = "RepeaterField";
var createRepeaterField = (options) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "repeater",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsx(
      RepeaterField,
      {
        field,
        name,
        id,
        value: value || [],
        onChange,
        readOnly,
        ...fieldOptions
      }
    ) }) })
  };
};
var CmsCollectionField = ({
  value,
  onChange,
  readOnly,
  defaultLimit = 10,
  showLimit = true,
  showSort = true,
  slots
}) => {
  const { apiClient } = useTecof();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getCmsCollections();
      if (res.success && Array.isArray(res.data)) {
        setCollections(res.data);
      } else {
        setError(res.message || "Koleksiyonlar y\xFCklenemedi");
      }
    } catch (err) {
      setError(err.message || "Ba\u011Flant\u0131 hatas\u0131");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);
  const selectedCollection = useMemo(() => {
    if (!value?.collectionSlug) return null;
    return collections.find((c) => c.slug === value.collectionSlug) || null;
  }, [value?.collectionSlug, collections]);
  const collectionFields = useMemo(() => {
    return selectedCollection?.fields || [];
  }, [selectedCollection]);
  const handleSelect = useCallback((col) => {
    onChangeRef.current({
      collectionSlug: col.slug,
      collectionName: col.name,
      limit: value?.limit || defaultLimit,
      sort: value?.sort || "custom",
      fieldMap: value?.fieldMap || {}
    });
    setDropdownOpen(false);
    setSearchQuery("");
  }, [value, defaultLimit]);
  const handleClear = useCallback(() => {
    onChangeRef.current(null);
  }, []);
  const handleLimitChange = useCallback((e) => {
    const num = parseInt(e.target.value, 10);
    if (!value) return;
    onChangeRef.current({
      ...value,
      limit: isNaN(num) ? defaultLimit : Math.max(1, Math.min(100, num))
    });
  }, [value, defaultLimit]);
  const handleSortChange = useCallback((sort) => {
    if (!value) return;
    onChangeRef.current({ ...value, sort });
  }, [value]);
  const handleFieldMapChange = useCallback((slotKey, fieldShortcode) => {
    if (!value) return;
    onChangeRef.current({
      ...value,
      fieldMap: {
        ...value.fieldMap,
        [slotKey]: fieldShortcode
      }
    });
  }, [value]);
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-loading tecof-field-loading-compact", "aria-busy": "true", children: [
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-circle" }),
      /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-60" })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-error", children: [
      /* @__PURE__ */ jsx("span", { children: error }),
      /* @__PURE__ */ jsxs("button", { type: "button", className: "tecof-cms-col-retry", onClick: fetchCollections, children: [
        /* @__PURE__ */ jsx(RefreshCw, { size: 12 }),
        " Tekrar Dene"
      ] })
    ] });
  }
  const hasSlots = slots && Object.keys(slots).length > 0;
  return /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-selector", ref: dropdownRef, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: `tecof-cms-col-trigger ${dropdownOpen ? "open" : ""}`,
          onClick: () => !readOnly && setDropdownOpen(!dropdownOpen),
          disabled: readOnly,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-trigger-left", children: [
              /* @__PURE__ */ jsx(Database, { size: 14 }),
              /* @__PURE__ */ jsx("span", { children: value?.collectionName || value?.collectionSlug || "Koleksiyon Se\xE7in" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-trigger-right", children: [
              value && !readOnly && /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "tecof-cms-col-clear",
                  onClick: (e) => {
                    e.stopPropagation();
                    handleClear();
                  },
                  title: "Temizle",
                  children: /* @__PURE__ */ jsx(X, { size: 12 })
                }
              ),
              /* @__PURE__ */ jsx(
                ChevronDown,
                {
                  size: 14,
                  className: `tecof-cms-col-chevron ${dropdownOpen ? "rotated" : ""}`
                }
              )
            ] })
          ]
        }
      ),
      dropdownOpen && /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-dropdown", children: [
        /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-search", children: [
          /* @__PURE__ */ jsx(Search, { size: 13 }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Koleksiyon ara\u2026",
              className: "tecof-cms-col-search-input",
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "tecof-cms-col-options", children: filteredCollections.length === 0 ? /* @__PURE__ */ jsx("div", { className: "tecof-cms-col-empty", children: "Koleksiyon bulunamad\u0131" }) : filteredCollections.map((col) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `tecof-cms-col-option ${value?.collectionSlug === col.slug ? "selected" : ""}`,
            onClick: () => handleSelect(col),
            children: [
              /* @__PURE__ */ jsx(Database, { size: 13 }),
              /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-option-info", children: [
                /* @__PURE__ */ jsx("span", { className: "tecof-cms-col-option-name", children: col.name }),
                /* @__PURE__ */ jsx("span", { className: "tecof-cms-col-option-slug", children: col.slug })
              ] })
            ]
          },
          col._id
        )) })
      ] })
    ] }),
    value?.collectionSlug && /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-settings", children: [
      showLimit && /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-setting", children: [
        /* @__PURE__ */ jsx("label", { className: "tecof-cms-col-setting-label", children: "Limit" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: 1,
            max: 100,
            value: value.limit || defaultLimit,
            onChange: handleLimitChange,
            className: "tecof-cms-col-setting-input",
            disabled: readOnly
          }
        )
      ] }),
      showSort && /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-setting", children: [
        /* @__PURE__ */ jsx("label", { className: "tecof-cms-col-setting-label", children: "S\u0131ralama" }),
        /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-sort-btns", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `tecof-cms-col-sort-btn ${(value.sort || "custom") === "custom" ? "active" : ""}`,
              onClick: () => handleSortChange("custom"),
              disabled: readOnly,
              children: "\xD6zel S\u0131ralama"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `tecof-cms-col-sort-btn ${value.sort === "newest" ? "active" : ""}`,
              onClick: () => handleSortChange("newest"),
              disabled: readOnly,
              children: "Yeni\u2192Eski"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `tecof-cms-col-sort-btn ${value.sort === "oldest" ? "active" : ""}`,
              onClick: () => handleSortChange("oldest"),
              disabled: readOnly,
              children: "Eski\u2192Yeni"
            }
          )
        ] })
      ] })
    ] }),
    value?.collectionSlug && hasSlots && /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-mapping", children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-mapping-header", children: [
        /* @__PURE__ */ jsx(Link2, { size: 12 }),
        /* @__PURE__ */ jsx("span", { children: "Alan E\u015Fle\u015Ftirme" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "tecof-cms-col-mapping-rows", children: Object.entries(slots).map(([slotKey, slotDef]) => {
        const currentMapping = value.fieldMap?.[slotKey] || "";
        const availableFields = slotDef.fieldTypes ? collectionFields.filter((f) => slotDef.fieldTypes.includes(f.type)) : collectionFields;
        return /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-mapping-row", children: [
          /* @__PURE__ */ jsx("label", { className: "tecof-cms-col-mapping-label", children: slotDef.label }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "tecof-cms-col-mapping-select",
              value: currentMapping,
              onChange: (e) => handleFieldMapChange(slotKey, e.target.value),
              disabled: readOnly,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "\u2014 Se\xE7in \u2014" }),
                availableFields.map((f) => /* @__PURE__ */ jsxs("option", { value: f.shortcode, children: [
                  f.name,
                  " (",
                  f.shortcode,
                  ")"
                ] }, f.shortcode))
              ]
            }
          )
        ] }, slotKey);
      }) })
    ] }),
    selectedCollection && /* @__PURE__ */ jsxs("div", { className: "tecof-cms-col-badge", children: [
      /* @__PURE__ */ jsx(Database, { size: 11 }),
      /* @__PURE__ */ jsx("span", { children: selectedCollection.name }),
      selectedCollection.fields && /* @__PURE__ */ jsxs("span", { className: "tecof-cms-col-badge-count", children: [
        selectedCollection.fields.length,
        " alan"
      ] })
    ] })
  ] });
};
CmsCollectionField.displayName = "CmsCollectionField";
var createCmsCollectionField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "cmsCollection",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsx(
      CmsCollectionField,
      {
        field,
        name,
        id,
        value: value || null,
        onChange,
        readOnly,
        ...fieldOptions
      }
    ) }) })
  };
};
var ALL_ICON_NAMES = Object.keys(lucide_react_exports).filter((key) => {
  return /^[A-Z]/.test(key) && typeof lucide_react_exports[key] === "function" && key !== "createLucideIcon";
});
var IconField = ({ value, onChange, readOnly }) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor: triggerRef.current,
    open: isOpen,
    placement: "bottom-start"
  });
  const filteredIcons = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return ALL_ICON_NAMES.slice(0, 120);
    return ALL_ICON_NAMES.filter((name) => name.toLowerCase().includes(query)).slice(0, 120);
  }, [search]);
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      if (!floatingRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, floatingRef]);
  const SelectedIcon = value && lucide_react_exports[value] ? lucide_react_exports[value] : null;
  return /* @__PURE__ */ jsxs("div", { className: "tecof-icon-field-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-icon-trigger-wrap", ref: triggerRef, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `tecof-icon-trigger-btn ${isOpen ? "open" : ""}`,
          disabled: readOnly,
          onClick: () => setIsOpen(!isOpen),
          children: /* @__PURE__ */ jsxs("div", { className: "tecof-icon-trigger-left", children: [
            SelectedIcon ? /* @__PURE__ */ jsx(SelectedIcon, { className: "tecof-icon-trigger-preview-icon", size: 16 }) : /* @__PURE__ */ jsx("div", { className: "tecof-icon-trigger-placeholder" }),
            /* @__PURE__ */ jsx("span", { className: "tecof-icon-trigger-label", children: value || "\u0130kon Se\xE7in" })
          ] })
        }
      ),
      value && !readOnly && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "tecof-icon-clear-btn",
          title: "Temizle",
          onClick: () => onChange(""),
          children: "\xD7"
        }
      )
    ] }),
    isOpen && createPortal(
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: floatingRef,
          className: "tecof-icon-dropdown",
          style: {
            ...floatingStyle,
            width: triggerRef.current?.offsetWidth,
            right: "auto",
            marginTop: 0,
            zIndex: 10001
          },
          children: [
            /* @__PURE__ */ jsx("div", { className: "tecof-icon-search-wrapper", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "tecof-icon-search-input",
                placeholder: "\u0130kon ara...",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                autoFocus: true
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "tecof-icon-grid", children: [
              filteredIcons.map((name) => {
                const IconComp = lucide_react_exports[name];
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    className: `tecof-icon-item-btn ${value === name ? "selected" : ""}`,
                    title: name,
                    onClick: () => {
                      onChange(name);
                      setIsOpen(false);
                    },
                    children: [
                      /* @__PURE__ */ jsx(IconComp, { size: 16 }),
                      /* @__PURE__ */ jsx("span", { className: "tecof-icon-name", children: name })
                    ]
                  },
                  name
                );
              }),
              filteredIcons.length === 0 && /* @__PURE__ */ jsx("div", { className: "tecof-icon-empty", children: "\u0130kon bulunamad\u0131." })
            ] })
          ]
        }
      ),
      document.body
    )
  ] });
};
var createIconField = (options = {}) => {
  const { label, labelIcon, visible } = options;
  return {
    type: "custom",
    _fieldType: "icon",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsx(
      IconField,
      {
        field,
        name,
        id,
        value: value || "",
        onChange,
        readOnly
      }
    ) }) })
  };
};

export { CmsCollectionField, CodeEditorField, ColorField, EditorField, ExternalField, IconField, LinkField, RepeaterField, STYLES_PROP, STYLE_CONTROLS, TecofEditor, TecofRender, TecofStudio, UploadField, collectDocumentClasses, collectStyleClasses, compileStyles, createCmsCollectionField, createCodeEditorField, createColorField, createEditorField, createExternalField, createIconField, createLinkField, createRepeaterField, createUploadField, darken, generateCSSVariables, getDefaultTheme, getSafelist, hexToHsl, hslToHex, lighten, mergeTheme };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map