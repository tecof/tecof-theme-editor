'use strict';

var chunkX52JFTUZ_js = require('./chunk-X52JFTUZ.js');
var chunkA2KHM342_js = require('./chunk-A2KHM342.js');
var chunkFMV4YLE6_js = require('./chunk-FMV4YLE6.js');
var React = require('react');
var lucideReact = require('lucide-react');
var reactDom = require('react-dom');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

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
  const slice = React__default.default.useSyncExternalStore(
    api.subscribe,
    React__default.default.useCallback(() => selector(api.getState()), [api, selector]),
    React__default.default.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  React__default.default.useDebugValue(slice);
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
          const r2 = iterator.next();
          if (r2.done)
            return r2;
          const value = this.get(r2.value);
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
          const r2 = iterator.next();
          if (r2.done)
            return r2;
          const value = this.get(r2.value);
          return {
            done: false,
            value: [r2.value, value]
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
  result.node.props.id = id;
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
var serializeNodeSubtree = (doc, id) => {
  const result = findNodeById(doc, id);
  if (!result) return null;
  const mergeZones = (node) => {
    const merged = { type: node.type, props: { ...node.props } };
    const prefix = `${node.props.id}:`;
    for (const [zoneKey, children] of Object.entries(doc.zones)) {
      if (zoneKey.startsWith(prefix)) {
        const slotName = zoneKey.slice(prefix.length);
        merged.props[slotName] = children.map(mergeZones);
      }
    }
    return merged;
  };
  return JSON.parse(JSON.stringify(mergeZones(result.node)));
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
  contextMenu: null,
  nodeClipboard: null,
  addSectionTarget: null,
  setMode: (mode) => set2({ mode }),
  toggleMode: () => set2((s) => ({ mode: s.mode === "edit" ? "preview" : "edit" })),
  toggleLeftPanel: () => set2((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set2((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelOpen: (open) => set2({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set2({ rightPanelOpen: open }),
  setCommandPaletteOpen: (open) => set2({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set2((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setStyleClipboard: (styles) => set2({ styleClipboard: styles }),
  setContextMenu: (menu) => set2({ contextMenu: menu }),
  setNodeClipboard: (node) => set2({ nodeClipboard: node }),
  openAddSection: (target) => set2({ addSectionTarget: target }),
  closeAddSection: () => set2({ addSectionTarget: null })
}));
var StudioContext = React.createContext(null);
var useStudio = () => {
  const ctx = React.useContext(StudioContext);
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
function createNode(config, type, overrideProps) {
  const compConfig = config?.components?.[type];
  const defaultProps = compConfig?.defaultProps || {};
  return {
    type,
    props: {
      ...JSON.parse(JSON.stringify(defaultProps)),
      ...overrideProps ? JSON.parse(JSON.stringify(overrideProps)) : {},
      id: generateId()
    }
  };
}
function readDragData(e) {
  if (!e.dataTransfer) return { nodeId: "", type: "" };
  return {
    nodeId: e.dataTransfer.getData(TECOF_NODE_ID),
    type: e.dataTransfer.getData(TECOF_BLOCK_TYPE)
  };
}
function writeDragData(e, payload) {
  if (!e.dataTransfer) return;
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
  const targetId = id ?? ed.selection.selectedId;
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
  const targets = (ids && ids.length ? ids : ed.selection.selectedIds).filter(Boolean);
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
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);
  React.useEffect(() => {
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
  const commands = React.useMemo(() => {
    const s = useEditorStore.getState;
    const ui = useUiStore.getState;
    const hasSel = !!selectedId;
    const selNode = selectedId ? findNodeById(s().document, selectedId)?.node ?? null : null;
    const perms = selNode ? getNodePermissions(config, selNode) : DEFAULT_PERMISSIONS;
    const actions = [
      { id: "undo", label: "Geri Al", group: "Eylemler", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Undo2, { size: 15 }), hint: `${MOD}Z`, disabled: !canUndo, run: () => s().undo() },
      { id: "redo", label: "\u0130leri Al", group: "Eylemler", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Redo2, { size: 15 }), hint: `${MOD}\u21E7Z`, disabled: !canRedo, run: () => s().redo() },
      { id: "duplicate", label: "\xC7o\u011Falt", group: "Eylemler", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CopyPlus, { size: 15 }), hint: `${MOD}D`, keywords: "duplicate kopya", disabled: !hasSel || perms.duplicate === false, run: () => s().duplicateNodes() },
      { id: "copy", label: "Kopyala", group: "Eylemler", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { size: 15 }), hint: `${MOD}C`, disabled: !hasSel, run: () => s().copyNode() },
      { id: "cut", label: "Kes", group: "Eylemler", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Scissors, { size: 15 }), hint: `${MOD}X`, disabled: !hasSel || perms.delete === false, run: () => s().cutNode() },
      { id: "paste", label: "Yap\u0131\u015Ft\u0131r", group: "Eylemler", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ClipboardPaste, { size: 15 }), hint: `${MOD}V`, run: () => s().pasteClipboard() },
      { id: "delete", label: "Sil", group: "Eylemler", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 15 }), hint: "\u232B", keywords: "delete kald\u0131r", disabled: !hasSel || perms.delete === false, run: () => s().removeNodes() },
      { id: "copy-styles", label: "Stili Kopyala", group: "Stil", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Paintbrush, { size: 15 }), keywords: "style stil kopyala copy", disabled: !hasSel, run: () => copyNodeStyles() },
      { id: "paste-styles", label: "Stili Yap\u0131\u015Ft\u0131r", group: "Stil", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Paintbrush, { size: 15 }), keywords: "style stil yap\u0131\u015Ft\u0131r paste", disabled: !hasSel || !hasStyleBuffer, run: () => pasteNodeStyles() },
      { id: "mode", label: ui().mode === "preview" ? "D\xFCzenleme moduna ge\xE7" : "\xD6nizleme moduna ge\xE7", group: "G\xF6r\xFCn\xFCm", icon: ui().mode === "preview" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pencil, { size: 15 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { size: 15 }), keywords: "preview \xF6nizleme edit d\xFCzenle", run: () => ui().toggleMode() },
      { id: "left", label: ui().leftPanelOpen ? "Sol paneli gizle" : "Sol paneli g\xF6ster", group: "G\xF6r\xFCn\xFCm", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelLeft, { size: 15 }), keywords: "panel katman", run: () => ui().toggleLeftPanel() },
      { id: "right", label: ui().rightPanelOpen ? "Sa\u011F paneli gizle" : "Sa\u011F paneli g\xF6ster", group: "G\xF6r\xFCn\xFCm", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelRight, { size: 15 }), keywords: "panel inspector ayar", run: () => ui().toggleRightPanel() }
    ];
    if (onSave) {
      actions.push({ id: "save", label: "Kaydet", group: "Eylemler", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Save, { size: 15 }), hint: `${MOD}S`, keywords: "save taslak", run: onSave });
    }
    const inserts = Object.entries(config.components || {}).map(([type, comp]) => ({
      id: `insert:${type}`,
      label: comp?.label || type,
      group: "Bile\u015Fen Ekle",
      icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 15 }),
      keywords: `ekle insert ${type}`,
      run: () => insertComponent(type)
    }));
    return [...actions, ...inserts];
  }, [config, selectedId, canUndo, canRedo, onSave, hasStyleBuffer]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => `${c.label} ${c.group} ${c.keywords || ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);
  React.useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);
  React.useEffect(() => {
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
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cmdk-overlay", onMouseDown: () => setOpen(false), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cmdk-panel", role: "dialog", "aria-label": "Komut paleti", onMouseDown: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cmdk-input-row", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 16, className: "tecof-cmdk-search-icon" }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx("kbd", { className: "tecof-cmdk-esc", children: "esc" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cmdk-list", ref: listRef, children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cmdk-empty", children: "Sonu\xE7 yok" }) : filtered.map((cmd, idx) => {
        const showGroup = idx === 0 || filtered[idx - 1].group !== cmd.group;
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          showGroup && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cmdk-group", children: cmd.group }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              type: "button",
              className: `tecof-cmdk-item${idx === active ? " is-active" : ""}${cmd.disabled ? " is-disabled" : ""}`,
              "data-active": idx === active,
              disabled: cmd.disabled,
              onMouseEnter: () => setActive(idx),
              onClick: () => runAt(idx),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-cmdk-item-icon", children: cmd.icon }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-cmdk-item-label", children: cmd.label }),
                cmd.hint && /* @__PURE__ */ jsxRuntime.jsx("kbd", { className: "tecof-cmdk-item-hint", children: cmd.hint })
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
  const r2 = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r2, g, b);
  const min = Math.min(r2, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r2:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r2) / d + 2) / 6;
        break;
      case b:
        h = ((r2 - g) / d + 4) / 6;
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
var resolveTheme = (rootProps, configTheme) => mergeTheme(
  mergeTheme(getDefaultTheme(), configTheme ?? {}),
  rootProps?.[THEME_PROP] ?? {}
);

// src/studio/theme/ThemeVars.tsx
var ThemeVars = () => {
  const rootProps = useEditorStore((s) => s.document.root?.props);
  const { config } = useStudio();
  React.useEffect(() => {
    const css = generateCSSVariables(resolveTheme(rootProps, config.theme));
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
  }, [rootProps, config.theme]);
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
  const [contentRef, setContentRef] = React.useState(null);
  const mountNode = contentRef?.contentWindow?.document?.body;
  const scrollPosRef = React.useRef({ x: 0, y: 0 });
  React.useEffect(() => {
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
          /* Keep canvas scrolling inside the canvas: when the page hits its
             scroll end, don't chain the wheel into the editor chrome. */
          overscroll-behavior-y: contain;
        }
        .tecof-node-wrapper {
          position: relative;
          transition: outline 0.15s ease-in-out;
        }
        /* Overlay portals stay truly interactive in edit mode: restore the
           normal cursor over them instead of the wrapper's grab cursor. */
        [data-tecof-portal] { cursor: auto; }
        [data-tecof-portal] * { cursor: auto; }
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
        } catch {
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
    let handleScroll = null;
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
        const target = e.target;
        if (target) {
          const tag = target.tagName?.toLowerCase();
          if (tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable) {
            return;
          }
        }
        if (!e.metaKey && !e.ctrlKey && !e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") && useEditorStore.getState().selection.selectedId) {
          e.preventDefault();
        }
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
      const onScroll = () => {
        scrollPosRef.current = {
          x: doc.documentElement.scrollLeft || body.scrollLeft,
          y: doc.documentElement.scrollTop || body.scrollTop
        };
      };
      handleScroll = onScroll;
      body.addEventListener("click", handleBodyClick);
      doc.addEventListener("keydown", handleIframeKeyDown);
      doc.addEventListener("scroll", onScroll, { capture: true, passive: true });
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
      if (handleScroll) {
        doc.removeEventListener("scroll", handleScroll, true);
      }
    };
  }, [contentRef]);
  React.useEffect(() => {
    if (!contentRef) return;
    const doc = contentRef.contentDocument;
    const body = doc?.body;
    if (doc && body) {
      const { x, y } = scrollPosRef.current;
      const currentX = doc.documentElement.scrollLeft || body.scrollLeft;
      const currentY = doc.documentElement.scrollTop || body.scrollTop;
      if (currentX !== x || currentY !== y) {
        doc.documentElement.scrollLeft = x;
        doc.documentElement.scrollTop = y;
        body.scrollLeft = x;
        body.scrollTop = y;
      }
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    "iframe",
    {
      title,
      ref: setContentRef,
      className: ["tecof-canvas-frame", className].filter(Boolean).join(" "),
      ...props,
      children: mountNode && reactDom.createPortal(children, mountNode)
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
var getDropAxis = (wrapperEl) => {
  const parent = wrapperEl.parentElement;
  const item = parent?.classList.contains("tecof-node") ? parent : wrapperEl;
  const container = item?.parentElement;
  const win = container?.ownerDocument?.defaultView;
  if (!container || !win) return "y";
  const cs = win.getComputedStyle(container);
  const display2 = cs.display;
  if (display2 === "flex" || display2 === "inline-flex") {
    return cs.flexDirection.startsWith("row") ? "x" : "y";
  }
  if (display2 === "grid" || display2 === "inline-grid") {
    const cols = cs.gridTemplateColumns.split(" ").filter((t) => t && t !== "none").length;
    return cols > 1 ? "x" : "y";
  }
  return display2.startsWith("inline") ? "x" : "y";
};
var getDragInfo = (e) => {
  const stored = useEditorStore.getState().drag;
  const fromEvent = readDragData(e);
  return {
    nodeId: fromEvent.nodeId || stored?.id || "",
    type: fromEvent.type || stored?.type || ""
  };
};
var isZoneInsideNode = (doc, zoneKey, nodeId) => {
  let current2 = zoneKey ? zoneKey.split(":")[0] : null;
  while (current2) {
    if (current2 === nodeId) return true;
    current2 = getParentId(doc, current2);
  }
  return false;
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
  const autoScrollerRef = React.useRef(createEventAutoScroller());
  const [position, setPosition] = React.useState(null);
  const [axis, setAxis] = React.useState("y");
  const [isDragOver, setIsDragOver] = React.useState(false);
  React.useEffect(() => {
    const scroller = autoScrollerRef.current;
    return () => scroller.stop();
  }, []);
  const checkValid = React.useCallback(
    (e) => {
      const { nodeId, type } = getDragInfo(e);
      if (nodeId && selfId && nodeId === selfId) return false;
      const doc = useEditorStore.getState().document;
      if (nodeId && isZoneInsideNode(doc, zoneKey, nodeId)) return false;
      const draggedType = resolveDraggedType(nodeId, type);
      if (!draggedType) return true;
      return isValidDrop(config, draggedType, zoneKey, doc);
    },
    [config, zoneKey, selfId]
  );
  const onDragOver = React.useCallback(
    (e) => {
      if (locked) return;
      e.preventDefault();
      if (!checkValid(e)) {
        e.dataTransfer.dropEffect = "none";
        autoScrollerRef.current.stop();
        setPosition(null);
        setIsDragOver(false);
        return;
      }
      e.stopPropagation();
      e.dataTransfer.dropEffect = getDragInfo(e).nodeId ? "move" : "copy";
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
    [locked, positional, checkValid]
  );
  const onDragLeave = React.useCallback((e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    autoScrollerRef.current.stop();
    setPosition(null);
    setIsDragOver(false);
  }, []);
  const onDrop = React.useCallback(
    (e) => {
      if (locked) return;
      e.preventDefault();
      autoScrollerRef.current.stop();
      const valid = checkValid(e);
      const droppedPosition = position;
      setPosition(null);
      setIsDragOver(false);
      if (!valid) {
        endDrag();
        return;
      }
      e.stopPropagation();
      const { nodeId, type } = getDragInfo(e);
      const targetIndex = positional ? droppedPosition === "before" ? index : index + 1 : getIndex ? getIndex() : 0;
      if (nodeId && nodeId !== selfId) {
        moveNode2(nodeId, zoneKey, targetIndex);
      } else if (type) {
        insertNode2(createNode(config, type), zoneKey, targetIndex);
      }
      endDrag();
    },
    [locked, positional, index, getIndex, zoneKey, config, selfId, position, checkValid, moveNode2, insertNode2, endDrag]
  );
  return { position, axis, isDragOver, onDragOver, onDragLeave, onDrop };
};
var ParentNodeContext = React.createContext(null);
var DropZone = ({ zone, className, style, orientation = "vertical" }) => {
  const parentId = React.useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const { config, readOnly } = useStudio();
  const openAddSection = useUiStore((state) => state.openAddSection);
  const dragPayload = useEditorStore((state) => state.drag);
  const isDragActive = dragPayload != null;
  const items = useEditorStore((state) => state.document.zones[zoneKey]) || [];
  const isDropDenied = React.useMemo(() => {
    if (!dragPayload) return false;
    const doc = useEditorStore.getState().document;
    const payload = dragPayload;
    const draggedType = payload.type ?? (payload.id ? findNodeById(doc, payload.id)?.node.type ?? null : null);
    if (!draggedType) return false;
    return !isValidDrop(config, draggedType, zoneKey, doc);
  }, [dragPayload, config, zoneKey]);
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
    isDropDenied ? "is-drop-denied" : "",
    className
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: dropzoneClassName,
      onDragOver,
      onDragLeave,
      onDrop,
      style,
      "data-tecof-zone": zoneKey,
      "data-tecof-orientation": orientation,
      children: items.length === 0 ? readOnly ? null : (
        // Boş slot tıklanınca "Bölüm Ekle" modalı bu zone'u hedefleyerek
        // açılır ve yalnızca buraya bırakılabilecek tipleri listeler.
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            className: "tecof-dropzone-hint",
            onClick: (e) => {
              e.stopPropagation();
              openAddSection({ zoneKey, index: 0 });
            },
            title: "Bu alana bile\u015Fen ekle",
            children: isDragOver ? "Buraya B\u0131rak\u0131n" : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 12, "aria-hidden": "true" }),
              "Bile\u015Fen Ekle"
            ] })
          }
        )
      ) : items.map((item, index) => /* @__PURE__ */ jsxRuntime.jsx(NodeRenderer, { node: item, index, zoneKey }, item.props.id))
    }
  );
};
var renderDropZone = ({ zone, className, style, orientation }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(DropZone, { zone, className, style, orientation });
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

// src/studio/canvas/overlayPortal.ts
var OVERLAY_PORTAL_ATTR = "data-tecof-portal";
function registerOverlayPortal(el) {
  if (!el) return () => {
  };
  el.setAttribute(OVERLAY_PORTAL_ATTR, "true");
  el.draggable = false;
  return () => {
    el.removeAttribute(OVERLAY_PORTAL_ATTR);
  };
}
function isInsideOverlayPortal(target) {
  if (!target || typeof target.closest !== "function") return false;
  return target.closest(`[${OVERLAY_PORTAL_ATTR}]`) !== null;
}

// src/studio/canvas/useInlineEdit.ts
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
      if (matchedItem && typeof matchedItem.code === "string") {
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
  const activeLanguage = chunkA2KHM342_js.useActiveLanguage()?.activeLanguage ?? null;
  const onDoubleClick = React.useCallback(
    (e) => {
      if (locked) return;
      if (isInsideOverlayPortal(e.target)) return;
      const target = e.target;
      const wrapper = target.closest("[data-tecof-id]");
      const marked = target.closest("[data-tecof-prop]");
      const editTarget = marked && (!wrapper || wrapper.contains(marked)) ? marked : target;
      if (editTarget.getAttribute("data-tecof-inline-editing") === "true") return;
      const tag = editTarget.tagName.toLowerCase();
      if (!VALID_TAGS.includes(tag)) return;
      const text = editTarget.textContent?.trim() || "";
      if (!text) return;
      const ownerDoc = editTarget.ownerDocument;
      const ownerWin = ownerDoc.defaultView;
      const defaultLang = activeLanguage || ownerDoc.documentElement.lang || "tr";
      const match = resolveMatch(editTarget, wrapper, node, text, defaultLang);
      if (!match) return;
      e.stopPropagation();
      const { propName, isMultilingual, langCode } = match;
      const originalText = editTarget.textContent || "";
      editTarget.contentEditable = "true";
      editTarget.setAttribute("data-tecof-inline-editing", "true");
      editTarget.focus();
      const range = ownerDoc.createRange();
      range.selectNodeContents(editTarget);
      const sel = ownerWin?.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      const teardown = () => {
        editTarget.contentEditable = "false";
        editTarget.removeAttribute("data-tecof-inline-editing");
        editTarget.removeEventListener("blur", handleBlur);
        editTarget.removeEventListener("keydown", handleKeyDown);
        ownerDoc.removeEventListener("mousedown", handleOutsideMouseDown, true);
        document.removeEventListener("mousedown", handleOutsideMouseDown, true);
        ownerWin?.removeEventListener("blur", handleWindowBlur);
        ownerWin?.getSelection()?.removeAllRanges();
      };
      const commitInlineEdit = () => {
        teardown();
        const newText = editTarget.textContent?.trim() || "";
        const store = useEditorStore.getState();
        const currentProps = findNodeById(store.document, node.props.id)?.node.props ?? node.props;
        if (isMultilingual) {
          const currentArray = Array.isArray(currentProps[propName]) ? currentProps[propName] : [];
          const updatedArray = currentArray.map((item) => {
            if (item && item.code === langCode) {
              return { ...item, value: newText };
            }
            return item;
          });
          if (!updatedArray.some((item) => item && item.code === langCode)) {
            updatedArray.push({ code: langCode, value: newText });
          }
          store.updateProps(node.props.id, { [propName]: updatedArray });
        } else {
          store.updateProps(node.props.id, { [propName]: newText });
        }
      };
      const cancelInlineEdit = () => {
        teardown();
        editTarget.textContent = originalText;
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
          editTarget.blur();
        }
      };
      const handleOutsideMouseDown = (ev) => {
        const clicked = ev.target;
        if (clicked && editTarget.contains(clicked)) return;
        commitInlineEdit();
      };
      const handleWindowBlur = () => {
        commitInlineEdit();
      };
      editTarget.addEventListener("blur", handleBlur);
      editTarget.addEventListener("keydown", handleKeyDown);
      ownerDoc.addEventListener("mousedown", handleOutsideMouseDown, true);
      document.addEventListener("mousedown", handleOutsideMouseDown, true);
      ownerWin?.addEventListener("blur", handleWindowBlur);
    },
    [node, locked, activeLanguage]
  );
  return { onDoubleClick };
};
var NodeErrorBoundary = class extends React.Component {
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
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-node-error", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-node-error-icon", children: "\u26A0\uFE0F" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-node-error-content", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "tecof-node-error-title", children: [
            "Bile\u015Fen render hatas\u0131: ",
            this.props.label || this.props.type || "Bilinmeyen bile\u015Fen"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-node-error-detail", children: this.state.error?.message || "Beklenmeyen bir hata olu\u015Ftu" })
        ] })
      ] });
    }
    return this.props.children;
  }
};

// src/studio/style/palette.ts
var TAILWIND_SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950"
];
var hue = (name, label, hex) => ({
  name,
  label,
  shades: Object.fromEntries(TAILWIND_SHADES.map((s, i) => [s, hex[i]]))
});
var TAILWIND_PALETTE = [
  hue("red", "Red", ["#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#450a0a"]),
  hue("orange", "Orange", ["#fff7ed", "#ffedd5", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12", "#431407"]),
  hue("amber", "Amber", ["#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f", "#451a03"]),
  hue("yellow", "Yellow", ["#fefce8", "#fef9c3", "#fef08a", "#fde047", "#facc15", "#eab308", "#ca8a04", "#a16207", "#854d0e", "#713f12", "#422006"]),
  hue("lime", "Lime", ["#f7fee7", "#ecfccb", "#d9f99d", "#bef264", "#a3e635", "#84cc16", "#65a30d", "#4d7c0f", "#3f6212", "#365314", "#1a2e05"]),
  hue("green", "Green", ["#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d", "#052e16"]),
  hue("emerald", "Emerald", ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857", "#065f46", "#064e3b", "#022c22"]),
  hue("teal", "Teal", ["#f0fdfa", "#ccfbf1", "#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a", "#042f2e"]),
  hue("cyan", "Cyan", ["#ecfeff", "#cffafe", "#a5f3fc", "#67e8f9", "#22d3ee", "#06b6d4", "#0891b2", "#0e7490", "#155e75", "#164e63", "#083344"]),
  hue("sky", "Sky", ["#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e", "#082f49"]),
  hue("blue", "Blue", ["#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554"]),
  hue("indigo", "Indigo", ["#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81", "#1e1b4b"]),
  hue("violet", "Violet", ["#f5f3ff", "#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#2e1065"]),
  hue("purple", "Purple", ["#faf5ff", "#f3e8ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87", "#3b0764"]),
  hue("fuchsia", "Fuchsia", ["#fdf4ff", "#fae8ff", "#f5d0fe", "#f0abfc", "#e879f9", "#d946ef", "#c026d3", "#a21caf", "#86198f", "#701a75", "#4a044e"]),
  hue("pink", "Pink", ["#fdf2f8", "#fce7f3", "#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#be185d", "#9d174d", "#831843", "#500724"]),
  hue("rose", "Rose", ["#fff1f2", "#ffe4e6", "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c", "#9f1239", "#881337", "#4c0519"]),
  hue("slate", "Slate", ["#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b", "#0f172a", "#020617"]),
  hue("gray", "Gray", ["#f9fafb", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", "#111827", "#030712"]),
  hue("zinc", "Zinc", ["#fafafa", "#f4f4f5", "#e4e4e7", "#d4d4d8", "#a1a1aa", "#71717a", "#52525b", "#3f3f46", "#27272a", "#18181b", "#09090b"]),
  hue("neutral", "Neutral", ["#fafafa", "#f5f5f5", "#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373", "#525252", "#404040", "#262626", "#171717", "#0a0a0a"]),
  hue("stone", "Stone", ["#fafaf9", "#f5f5f4", "#e7e5e4", "#d6d3d1", "#a8a29e", "#78716c", "#57534e", "#44403c", "#292524", "#1c1917", "#0c0a09"])
];
var PALETTE_BY_NAME = Object.fromEntries(
  TAILWIND_PALETTE.map((h) => [h.name, h])
);
var tailwindSwatch = (hueName, shade) => {
  const hex = PALETTE_BY_NAME[hueName]?.shades[shade] ?? "#000000";
  return `var(--color-${hueName}-${shade}, ${hex})`;
};
var parsePaletteToken = (value) => {
  const idx = value.lastIndexOf("-");
  if (idx <= 0) return null;
  const hueName = value.slice(0, idx);
  const shade = value.slice(idx + 1);
  const found = PALETTE_BY_NAME[hueName];
  if (!found || !(shade in found.shades)) return null;
  return { hue: found, shade };
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
var BASE_COLOR_OPTIONS = [
  { label: "Yok", value: "" },
  { label: "\u015Eeffaf", value: "transparent", swatch: "transparent" },
  { label: "Beyaz", value: "white", swatch: "#ffffff" },
  { label: "Siyah", value: "black", swatch: "#000000" }
];
var BRAND_COLOR_OPTIONS = TAILWIND_SHADES.map((s) => ({
  label: `Primary ${s}`,
  value: `primary-${s}`,
  swatch: `var(--tecof-primary-${s})`
}));
var TAILWIND_COLOR_OPTIONS = TAILWIND_PALETTE.flatMap(
  (hue2) => TAILWIND_SHADES.map((shade) => ({
    label: `${hue2.label} ${shade}`,
    value: `${hue2.name}-${shade}`,
    swatch: tailwindSwatch(hue2.name, shade)
  }))
);
var COLOR_OPTIONS = [
  ...BASE_COLOR_OPTIONS,
  // Live theme colors (host --theme-color-* variables)
  ...THEME_COLOR_OPTIONS,
  ...BRAND_COLOR_OPTIONS,
  ...TAILWIND_COLOR_OPTIONS
];
var COLOR_SECTIONS = {
  base: BASE_COLOR_OPTIONS,
  theme: THEME_COLOR_OPTIONS,
  brand: BRAND_COLOR_OPTIONS
};
var GRADIENT_COLOR_OPTIONS = [
  ...BASE_COLOR_OPTIONS,
  ...THEME_COLOR_OPTIONS,
  ...BRAND_COLOR_OPTIONS
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
    id: "flexWrap",
    label: "Sat\u0131r kayd\u0131r",
    group: "layout",
    type: "segment",
    options: opts(["wrap", "nowrap"]),
    toClass: (v) => v ? `flex-${v}` : null
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
  {
    id: "position",
    label: "Konumlama",
    group: "layout",
    type: "select",
    options: opts(["static", "relative", "absolute", "sticky", "fixed"]),
    toClass: (v) => v || null
  },
  {
    id: "zIndex",
    label: "Katman (z-index)",
    group: "layout",
    type: "select",
    options: opts(["auto", "0", "10", "20", "30", "40", "50"]),
    toClass: (v) => v ? `z-${v}` : null
  },
  {
    id: "overflow",
    label: "Ta\u015Fma",
    group: "layout",
    type: "select",
    options: opts(["visible", "hidden", "auto", "scroll"]),
    toClass: (v) => v ? `overflow-${v}` : null
  },
  // Spacing — padding (shorthands + per-side; sides render in the SpacingBox)
  { id: "p", label: "Padding", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "p", toClass: withArbitrary("p", (v) => `p-${v}`) },
  { id: "px", label: "Padding X", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "px", toClass: withArbitrary("px", (v) => `px-${v}`) },
  { id: "py", label: "Padding Y", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "py", toClass: withArbitrary("py", (v) => `py-${v}`) },
  { id: "pt", label: "Padding \xDCst", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "pt", toClass: withArbitrary("pt", (v) => `pt-${v}`) },
  { id: "pb", label: "Padding Alt", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "pb", toClass: withArbitrary("pb", (v) => `pb-${v}`) },
  { id: "pl", label: "Padding Sol", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "pl", toClass: withArbitrary("pl", (v) => `pl-${v}`) },
  { id: "pr", label: "Padding Sa\u011F", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "pr", toClass: withArbitrary("pr", (v) => `pr-${v}`) },
  // Spacing — margin
  { id: "m", label: "Margin", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "m", toClass: withArbitrary("m", (v) => `m-${v}`) },
  { id: "mx", label: "Margin X", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "mx", toClass: withArbitrary("mx", (v) => `mx-${v}`) },
  { id: "my", label: "Margin Y", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "my", toClass: withArbitrary("my", (v) => `my-${v}`) },
  { id: "mt", label: "Margin \xDCst", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "mt", toClass: withArbitrary("mt", (v) => `mt-${v}`) },
  { id: "mb", label: "Margin Alt", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "mb", toClass: withArbitrary("mb", (v) => `mb-${v}`) },
  { id: "ml", label: "Margin Sol", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "ml", toClass: withArbitrary("ml", (v) => `ml-${v}`) },
  { id: "mr", label: "Margin Sa\u011F", group: "spacing", type: "space", options: spaceOptions(), arbitraryPrefix: "mr", toClass: withArbitrary("mr", (v) => `mr-${v}`) },
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
  // Gradient: direction + two color stops. `bg-gradient-to-*` (v4 alias of
  // bg-linear-to-*) keeps v3 hosts working too.
  {
    id: "bgGradient",
    label: "Gradient y\xF6n\xFC",
    group: "background",
    type: "select",
    options: [
      { label: "\u2014", value: "" },
      { label: "Sa\u011Fa", value: "to-r" },
      { label: "Sola", value: "to-l" },
      { label: "A\u015Fa\u011F\u0131", value: "to-b" },
      { label: "Yukar\u0131", value: "to-t" },
      { label: "Sa\u011F alta", value: "to-br" },
      { label: "Sa\u011F \xFCste", value: "to-tr" }
    ],
    toClass: (v) => v ? `bg-gradient-${v}` : null
  },
  {
    id: "gradientFrom",
    label: "Gradient ba\u015Flang\u0131\xE7",
    group: "background",
    type: "color",
    options: GRADIENT_COLOR_OPTIONS,
    colorSections: ["base", "theme", "brand", "custom"],
    arbitraryPrefix: "from",
    toClass: withArbitrary("from", (v) => `from-${v}`)
  },
  {
    id: "gradientTo",
    label: "Gradient biti\u015F",
    group: "background",
    type: "color",
    options: GRADIENT_COLOR_OPTIONS,
    colorSections: ["base", "theme", "brand", "custom"],
    arbitraryPrefix: "to",
    toClass: withArbitrary("to", (v) => `to-${v}`)
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
  {
    id: "tracking",
    label: "Harf aral\u0131\u011F\u0131",
    group: "typography",
    type: "select",
    options: opts(["tighter", "tight", "normal", "wide", "wider", "widest"]),
    toClass: (v) => v ? `tracking-${v}` : null
  },
  {
    id: "textTransform",
    label: "Harf d\xF6n\xFC\u015F\xFCm\xFC",
    group: "typography",
    type: "select",
    options: [
      { label: "\u2014", value: "" },
      { label: "B\xDCY\xDCK HARF", value: "uppercase" },
      { label: "k\xFC\xE7\xFCk harf", value: "lowercase" },
      { label: "Ba\u015F Harfler", value: "capitalize" },
      { label: "Normal", value: "normal-case" }
    ],
    toClass: (v) => v || null
  },
  {
    id: "decoration",
    label: "S\xFCsleme",
    group: "typography",
    type: "select",
    options: [
      { label: "\u2014", value: "" },
      { label: "Alt\u0131 \xE7izili", value: "underline" },
      { label: "\xDCst\xFC \xE7izili", value: "line-through" },
      { label: "\xC7izgisiz", value: "no-underline" }
    ],
    toClass: (v) => v || null
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
    options: opts(["0", "1", "2", "4", "8"]),
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
  },
  {
    id: "blur",
    label: "Bulan\u0131kl\u0131k",
    group: "effects",
    type: "select",
    options: opts(["none", "sm", "md", "lg", "xl"]),
    toClass: (v) => v ? v === "md" ? "blur" : `blur-${v}` : null
  },
  // Hover/focus pairs: set these on the Hover state and add a transition so the
  // change animates instead of snapping.
  {
    id: "scale",
    label: "\xD6l\xE7ek (scale)",
    group: "effects",
    type: "select",
    options: opts(["90", "95", "100", "105", "110", "125"]),
    toClass: (v) => v ? `scale-${v}` : null
  },
  {
    id: "rotate",
    label: "D\xF6nd\xFCrme",
    group: "effects",
    type: "select",
    options: opts(["0", "1", "2", "3", "6", "12", "45", "90", "180"]),
    toClass: (v) => v ? `rotate-${v}` : null
  },
  // Multi-class value: `transition-all` + `duration-*` (emitters split on
  // spaces — see StyleControl.toClass).
  {
    id: "transition",
    label: "Ge\xE7i\u015F s\xFCresi",
    group: "effects",
    type: "select",
    options: [
      { label: "\u2014", value: "" },
      { label: "75ms", value: "75" },
      { label: "150ms", value: "150" },
      { label: "300ms", value: "300" },
      { label: "500ms", value: "500" },
      { label: "700ms", value: "700" }
    ],
    toClass: (v) => v ? `transition-all duration-${v}` : null
  },
  // Entrance animations — custom (non-Tailwind) classes; CSS lives in
  // `animationCss.ts` (published pages) and mirrored at the end of `styles.css`
  // (editor canvas). No arbitraryPrefix: custom values are meaningless here.
  {
    id: "anim",
    label: "Giri\u015F Animasyonu",
    group: "effects",
    type: "select",
    options: [
      { label: "Yok", value: "" },
      { label: "Belirme", value: "fade" },
      { label: "Yukar\u0131 S\xFCz\xFClme", value: "fade-up" },
      { label: "A\u015Fa\u011F\u0131 S\xFCz\xFClme", value: "fade-down" },
      { label: "B\xFCy\xFCme", value: "zoom-in" }
    ],
    toClass: (v) => v ? `tecof-anim-${v}` : null
  },
  {
    id: "animDelay",
    label: "Animasyon Gecikmesi",
    group: "effects",
    type: "select",
    options: [
      { label: "Yok", value: "" },
      { label: "100ms", value: "100" },
      { label: "200ms", value: "200" },
      { label: "300ms", value: "300" },
      { label: "500ms", value: "500" }
    ],
    toClass: (v) => v ? `tecof-anim-delay-${v}` : null
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
var importantClass = (cls) => cls.startsWith("tecof-") ? cls : `${cls}!`;
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
      for (const single of cls.split(" ")) {
        for (const prefix of prefixes) set2.add(prefix + importantClass(single));
      }
    }
  }
  return Array.from(set2);
}

// node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}

// node_modules/tailwind-merge/dist/bundle-mjs.mjs
var concatArrays = (array1, array2) => {
  const combinedArray = new Array(array1.length + array2.length);
  for (let i = 0; i < array1.length; i++) {
    combinedArray[i] = array1[i];
  }
  for (let i = 0; i < array2.length; i++) {
    combinedArray[array1.length + i] = array2[i];
  }
  return combinedArray;
};
var createClassValidatorObject = (classGroupId, validator) => ({
  classGroupId,
  validator
});
var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
  nextPart,
  validators,
  classGroupId
});
var CLASS_PART_SEPARATOR = "-";
var EMPTY_CONFLICTS = [];
var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
var createClassGroupUtils = (config) => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = (className) => {
    if (className.startsWith("[") && className.endsWith("]")) {
      return getGroupIdForArbitraryProperty(className);
    }
    const classParts = className.split(CLASS_PART_SEPARATOR);
    const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
    return getGroupRecursive(classParts, startIndex, classMap);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    if (hasPostfixModifier) {
      const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
      const baseConflicts = conflictingClassGroups[classGroupId];
      if (modifierConflicts) {
        if (baseConflicts) {
          return concatArrays(baseConflicts, modifierConflicts);
        }
        return modifierConflicts;
      }
      return baseConflicts || EMPTY_CONFLICTS;
    }
    return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
var getGroupRecursive = (classParts, startIndex, classPartObject) => {
  const classPathsLength = classParts.length - startIndex;
  if (classPathsLength === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[startIndex];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  if (nextClassPartObject) {
    const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
    if (result) return result;
  }
  const validators = classPartObject.validators;
  if (validators === null) {
    return void 0;
  }
  const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
  const validatorsLength = validators.length;
  for (let i = 0; i < validatorsLength; i++) {
    const validatorObj = validators[i];
    if (validatorObj.validator(classRest)) {
      return validatorObj.classGroupId;
    }
  }
  return void 0;
};
var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const content = className.slice(1, -1);
  const colonIndex = content.indexOf(":");
  const property = content.slice(0, colonIndex);
  return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
var createClassMap = (config) => {
  const {
    theme,
    classGroups
  } = config;
  return processClassGroups(classGroups, theme);
};
var processClassGroups = (classGroups, theme) => {
  const classMap = createClassPartObject();
  for (const classGroupId in classGroups) {
    const group = classGroups[classGroupId];
    processClassesRecursively(group, classMap, classGroupId, theme);
  }
  return classMap;
};
var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  const len = classGroup.length;
  for (let i = 0; i < len; i++) {
    const classDefinition = classGroup[i];
    processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
  }
};
var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (typeof classDefinition === "string") {
    processStringDefinition(classDefinition, classPartObject, classGroupId);
    return;
  }
  if (typeof classDefinition === "function") {
    processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
    return;
  }
  processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
  const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
  classPartObjectToEdit.classGroupId = classGroupId;
};
var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (isThemeGetter(classDefinition)) {
    processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
    return;
  }
  if (classPartObject.validators === null) {
    classPartObject.validators = [];
  }
  classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  const entries = Object.entries(classDefinition);
  const len = entries.length;
  for (let i = 0; i < len; i++) {
    const [key, value] = entries[i];
    processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
  }
};
var getPart = (classPartObject, path) => {
  let current2 = classPartObject;
  const parts = path.split(CLASS_PART_SEPARATOR);
  const len = parts.length;
  for (let i = 0; i < len; i++) {
    const part = parts[i];
    let next = current2.nextPart.get(part);
    if (!next) {
      next = createClassPartObject();
      current2.nextPart.set(part, next);
    }
    current2 = next;
  }
  return current2;
};
var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
var createLruCache = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache = /* @__PURE__ */ Object.create(null);
  let previousCache = /* @__PURE__ */ Object.create(null);
  const update = (key, value) => {
    cache[key] = value;
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = /* @__PURE__ */ Object.create(null);
    }
  };
  return {
    get(key) {
      let value = cache[key];
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache[key]) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (key in cache) {
        cache[key] = value;
      } else {
        update(key, value);
      }
    }
  };
};
var IMPORTANT_MODIFIER = "!";
var MODIFIER_SEPARATOR = ":";
var EMPTY_MODIFIERS = [];
var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
  modifiers,
  hasImportantModifier,
  baseClassName,
  maybePostfixModifierPosition,
  isExternal
});
var createParseClassName = (config) => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  let parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    const len = className.length;
    for (let index = 0; index < len; index++) {
      const currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + 1;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") bracketDepth++;
      else if (currentCharacter === "]") bracketDepth--;
      else if (currentCharacter === "(") parenDepth++;
      else if (currentCharacter === ")") parenDepth--;
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
    let baseClassName = baseClassNameWithImportantModifier;
    let hasImportantModifier = false;
    if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
      baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
      hasImportantModifier = true;
    } else if (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
    ) {
      baseClassName = baseClassNameWithImportantModifier.slice(1);
      hasImportantModifier = true;
    }
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
var createSortModifiers = (config) => {
  const modifierWeights = /* @__PURE__ */ new Map();
  config.orderSensitiveModifiers.forEach((mod, index) => {
    modifierWeights.set(mod, 1e6 + index);
  });
  return (modifiers) => {
    const result = [];
    let currentSegment = [];
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      const isArbitrary2 = modifier[0] === "[";
      const isOrderSensitive = modifierWeights.has(modifier);
      if (isArbitrary2 || isOrderSensitive) {
        if (currentSegment.length > 0) {
          currentSegment.sort();
          result.push(...currentSegment);
          currentSegment = [];
        }
        result.push(modifier);
      } else {
        currentSegment.push(modifier);
      }
    }
    if (currentSegment.length > 0) {
      currentSegment.sort();
      result.push(...currentSegment);
    }
    return result;
  };
};
var createConfigUtils = (config) => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  postfixLookupClassGroupIds: createPostfixLookupClassGroupIds(config),
  ...createClassGroupUtils(config)
});
var createPostfixLookupClassGroupIds = (config) => {
  const lookup = /* @__PURE__ */ Object.create(null);
  const classGroupIds = config.postfixLookupClassGroups;
  if (classGroupIds) {
    for (let i = 0; i < classGroupIds.length; i++) {
      lookup[classGroupIds[i]] = true;
    }
  }
  return lookup;
};
var SPLIT_CLASSES_REGEX = /\s+/;
var mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers,
    postfixLookupClassGroupIds
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? " " + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId;
    if (hasPostfixModifier) {
      const baseClassNameWithoutPostfix = baseClassName.substring(0, maybePostfixModifierPosition);
      classGroupId = getClassGroupId(baseClassNameWithoutPostfix);
      const classGroupIdWithPostfix = classGroupId && postfixLookupClassGroupIds[classGroupId] ? getClassGroupId(baseClassName) : void 0;
      if (classGroupIdWithPostfix && classGroupIdWithPostfix !== classGroupId) {
        classGroupId = classGroupIdWithPostfix;
        hasPostfixModifier = false;
      }
    } else {
      classGroupId = getClassGroupId(baseClassName);
    }
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.indexOf(classId) > -1) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
var twJoin = (...classLists) => {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < classLists.length) {
    if (argument = classLists[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
var toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall;
  const initTailwindMerge = (classList) => {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  };
  const tailwindMerge = (classList) => {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  };
  functionToCall = initTailwindMerge;
  return (...args) => functionToCall(twJoin(...args));
};
var fallbackThemeArr = [];
var fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || fallbackThemeArr;
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
var fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
var isFraction = (value) => fractionRegex.test(value);
var isNumber = (value) => !!value && !Number.isNaN(Number(value));
var isInteger = (value) => !!value && Number.isInteger(Number(value));
var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
var isTshirtSize = (value) => tshirtUnitRegex.test(value);
var isAny = () => true;
var isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
var isNever = () => false;
var isShadow = (value) => shadowRegex.test(value);
var isImage = (value) => imageRegex.test(value);
var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
var isNamedContainerQuery = (value) => value.startsWith("@container") && (value[10] === "/" && value[11] !== void 0 || value[11] === "s" && value[16] !== void 0 && value.startsWith("-size/", 10) || value[11] === "n" && value[18] !== void 0 && value.startsWith("-normal/", 10));
var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
var isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
var isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
var isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
var getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
var isLabelPosition = (label) => label === "position" || label === "percentage";
var isLabelImage = (label) => label === "image" || label === "url";
var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
var isLabelLength = (label) => label === "length";
var isLabelNumber = (label) => label === "number";
var isLabelFamilyName = (label) => label === "family-name";
var isLabelWeight = (label) => label === "number" || label === "weight";
var isLabelShadow = (label) => label === "shadow";
var getDefaultConfig = () => {
  const themeColor = fromTheme("color");
  const themeFont = fromTheme("font");
  const themeText = fromTheme("text");
  const themeFontWeight = fromTheme("font-weight");
  const themeTracking = fromTheme("tracking");
  const themeLeading = fromTheme("leading");
  const themeBreakpoint = fromTheme("breakpoint");
  const themeContainer = fromTheme("container");
  const themeSpacing = fromTheme("spacing");
  const themeRadius = fromTheme("radius");
  const themeShadow = fromTheme("shadow");
  const themeInsetShadow = fromTheme("inset-shadow");
  const themeTextShadow = fromTheme("text-shadow");
  const themeDropShadow = fromTheme("drop-shadow");
  const themeBlur = fromTheme("blur");
  const themePerspective = fromTheme("perspective");
  const themeAspect = fromTheme("aspect");
  const themeEase = fromTheme("ease");
  const themeAnimate = fromTheme("animate");
  const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const scalePosition = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const scaleOverscroll = () => ["auto", "contain", "none"];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
  const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
  const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }];
  const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    themeRadius,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
  const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    themeBlur,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Container Type
       * @see https://tailwindcss.com/docs/responsive-design#container-queries
       */
      "container-type": [{
        "@container": ["", "normal", "size", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Container Name
       * @see https://tailwindcss.com/docs/responsive-design#named-containers
       */
      "container-named": [isNamedContainerQuery],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": scaleInset()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": scaleInset()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: scaleInset()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: scaleInset()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": scaleInset()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...scaleAlignPrimaryAxis(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: scaleMargin()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...scaleSizingInline()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...scaleSizingInline()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...scaleSizingInline()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...scaleSizingBlock()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, "screen", ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          themeContainer,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...scaleSizing()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          themeContainer,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [themeBreakpoint]
          },
          ...scaleSizing()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          themeLeading,
          ...scaleUnambiguousSpacing()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...scaleLineStyle(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Tab Size
       * @see https://tailwindcss.com/docs/tab-size
       */
      "tab-size": [{
        tab: [isInteger, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": scaleBorderWidth()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": scaleBorderWidth()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": scaleBorderWidth()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": scaleBorderWidth()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": scaleBorderWidth()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: scaleColor()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": scaleColor()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": scaleColor()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": scaleColor()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": scaleColor()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": scaleColor()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...scaleLineStyle(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": scaleMaskImagePosition()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": scaleMaskImagePosition()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": scaleColor()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": scaleColor()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": scaleMaskImagePosition()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": scaleMaskImagePosition()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": scaleColor()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": scaleColor()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": scaleMaskImagePosition()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": scaleMaskImagePosition()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": scaleColor()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": scaleColor()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": scaleMaskImagePosition()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": scaleMaskImagePosition()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": scaleColor()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": scaleColor()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": scaleMaskImagePosition()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": scaleMaskImagePosition()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": scaleColor()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": scaleColor()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": scaleMaskImagePosition()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": scaleMaskImagePosition()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": scaleColor()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": scaleColor()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": scaleMaskImagePosition()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": scaleMaskImagePosition()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": scaleColor()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": scaleColor()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": scaleMaskImagePosition()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": scaleMaskImagePosition()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": scaleColor()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": scaleColor()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": scalePosition()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": scaleMaskImagePosition()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": scaleMaskImagePosition()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": scaleColor()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeDropShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      /**
       * Zoom
       * @see https://tailwindcss.com/docs/zoom
       */
      zoom: [{
        zoom: [isInteger, isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scrollbar Thumb Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-thumb-color": [{
        "scrollbar-thumb": scaleColor()
      }],
      /**
       * Scrollbar Track Color
       * @see https://tailwindcss.com/docs/scrollbar-color
       */
      "scrollbar-track-color": [{
        "scrollbar-track": scaleColor()
      }],
      /**
       * Scrollbar Gutter
       * @see https://tailwindcss.com/docs/scrollbar-gutter
       */
      "scrollbar-gutter": [{
        "scrollbar-gutter": ["auto", "stable", "both"]
      }],
      /**
       * Scrollbar Width
       * @see https://tailwindcss.com/docs/scrollbar-width
       */
      "scrollbar-w": [{
        scrollbar: ["auto", "thin", "none"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      "container-named": ["container-type"],
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    postfixLookupClassGroups: ["container-type"],
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
};
var twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);

// src/studio/style/compileStyles.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
var BREAKPOINTS = ["base", "sm", "md", "lg", "xl"];
function emit(props, prefix) {
  if (!props) return [];
  const out = [];
  for (const [id, value] of Object.entries(props)) {
    if (!value) continue;
    const control = CONTROL_BY_ID[id];
    if (!control) continue;
    const cls = control.toClass(value);
    if (!cls) continue;
    for (const single of cls.split(" ")) {
      out.push(prefix + importantClass(single));
    }
  }
  return out;
}
var compileCache = /* @__PURE__ */ new WeakMap();
function compileStyles(styles) {
  if (!styles) return "";
  const cached = compileCache.get(styles);
  if (cached !== void 0) return cached;
  const classes = [];
  for (const bp of BREAKPOINTS) {
    classes.push(...emit(styles[bp], BP_PREFIX[bp]));
  }
  if (styles.states) {
    for (const [key, props] of Object.entries(styles.states)) {
      const [a, b] = key.split(":");
      const bp = b ? a : "base";
      const state = b ?? a;
      const bpPrefix = BP_PREFIX[bp];
      const statePrefix = STATE_PREFIX[state];
      if (bpPrefix === void 0 || statePrefix === void 0) continue;
      classes.push(...emit(props, bpPrefix + statePrefix));
    }
  }
  const result = classes.join(" ");
  compileCache.set(styles, result);
  return result;
}
function mergeClassName(authorClassName, styleClassName) {
  return cn(authorClassName, styleClassName);
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
var BOUND_EVENTS = [
  "mouseenter",
  "mouseleave",
  "click",
  "dblclick",
  "contextmenu",
  "dragstart",
  "dragend",
  "dragover",
  "dragleave",
  "drop"
];
function useInlineDragRef(options) {
  const { node, index, zoneKey, locked, wrapperClassName, label } = options;
  const nodeRef = React.useRef(null);
  const callbacksRef = React.useRef(options);
  callbacksRef.current = options;
  const metaRef = React.useRef({ nodeId: node.props.id, label, locked });
  metaRef.current = { nodeId: node.props.id, label, locked };
  const boundRef = React.useRef(null);
  if (!boundRef.current) {
    boundRef.current = {
      mouseenter: (e) => callbacksRef.current.handleMouseEnter(e),
      mouseleave: (e) => callbacksRef.current.handleMouseLeave(e),
      click: (e) => callbacksRef.current.handleClick(e),
      dblclick: (e) => callbacksRef.current.onDoubleClick(e),
      contextmenu: (e) => callbacksRef.current.onContextMenu?.(e),
      dragover: (e) => callbacksRef.current.onDragOver(e),
      dragleave: (e) => callbacksRef.current.onDragLeave(e),
      drop: (e) => callbacksRef.current.onDrop(e),
      dragstart: (e) => {
        const de = e;
        const meta = metaRef.current;
        if (meta.locked) return;
        if (isInsideOverlayPortal(de.target)) {
          de.preventDefault();
          return;
        }
        writeDragData(de, { nodeId: meta.nodeId });
        if (de.dataTransfer) {
          de.dataTransfer.effectAllowed = "move";
        }
        setDragGhost(de, meta.label);
        callbacksRef.current.beginDrag({ id: meta.nodeId });
      },
      dragend: () => {
        if (!metaRef.current.locked) callbacksRef.current.endDrag();
      }
    };
  }
  const setRef = React.useCallback((el) => {
    const bound = boundRef.current;
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
      for (const eventName of BOUND_EVENTS) {
        old.removeEventListener(eventName, bound[eventName]);
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
      for (const eventName of BOUND_EVENTS) {
        el.addEventListener(eventName, bound[eventName]);
      }
    }
    nodeRef.current = el;
  }, [node.props.id, node.type, index, zoneKey, locked, wrapperClassName]);
  return { setRef, nodeRef };
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
var getInlineIndicatorStyle = (el, axis, position) => {
  const r2 = el.getBoundingClientRect();
  return axis === "x" ? {
    position: "fixed",
    top: r2.top,
    height: r2.height,
    width: 3,
    left: position === "before" ? r2.left - 5 : r2.right + 2
  } : {
    position: "fixed",
    left: r2.left,
    width: r2.width,
    height: 3,
    top: position === "before" ? r2.top - 5 : r2.bottom + 2
  };
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
  const handleMouseEnter = React.useCallback(
    (e) => {
      if (locked) return;
      e.stopPropagation();
      hoverNode(node.props.id);
    },
    [hoverNode, node.props.id, locked]
  );
  const handleMouseLeave = React.useCallback(
    (e) => {
      if (locked) return;
      e.stopPropagation();
      if (isHovered) {
        hoverNode(null);
      }
    },
    [hoverNode, node.props.id, isHovered, locked]
  );
  const handleClick = React.useCallback(
    (e) => {
      if (locked) return;
      if (isInsideOverlayPortal(e.target)) return;
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
  const setContextMenu = useUiStore((s) => s.setContextMenu);
  const handleContextMenu = React.useCallback(
    (e) => {
      if (locked) return;
      if (isInsideOverlayPortal(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      selectNode(node.props.id);
      const iframe = document.querySelector(
        ".tecof-canvas-viewport iframe"
      );
      const iframeRect = iframe?.getBoundingClientRect();
      setContextMenu({
        nodeId: node.props.id,
        x: e.clientX + (iframeRect?.left ?? 0),
        y: e.clientY + (iframeRect?.top ?? 0)
      });
    },
    [locked, selectNode, node.props.id, setContextMenu]
  );
  const { onDoubleClick } = useInlineEdit(node, locked);
  const { position, axis, onDragOver, onDragLeave, onDrop } = useDropTarget({
    zoneKey,
    positional: true,
    index,
    locked,
    selfId: node.props.id
  });
  const label = componentConfig?.label || node.type;
  const wrapperClassName = [
    "tecof-node-wrapper",
    locked ? "is-readonly" : "",
    isDragging ? "is-dragging" : ""
  ].filter(Boolean).join(" ");
  const styleClassName = compileStyles(node.props[STYLES_PROP]);
  const { setRef: dragRef, nodeRef: inlineNodeRef } = useInlineDragRef({
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
    onContextMenu: handleContextMenu,
    onDragOver,
    onDragLeave,
    onDrop
  });
  if (!componentConfig) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-node-missing", children: [
      "Bile\u015Fen bulunamad\u0131: ",
      node.type
    ] });
  }
  const componentProps = {
    ...node.props,
    className: mergeClassName(node.props.className, styleClassName),
    puck: {
      dragRef: componentConfig.inline ? dragRef : void 0,
      renderDropZone,
      registerOverlayPortal,
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
  const errorResetKey = node.props;
  return /* @__PURE__ */ jsxRuntime.jsx(ParentNodeContext.Provider, { value: node.props.id, children: componentConfig.inline ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    position && inlineNodeRef.current && /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "tecof-drop-indicator",
        style: getInlineIndicatorStyle(inlineNodeRef.current, axis, position)
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(NodeErrorBoundary, { label, type: node.type, resetKey: errorResetKey, children: componentConfig.render(componentProps) })
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-node", children: [
    position && /* @__PURE__ */ jsxRuntime.jsx("div", { className: `tecof-drop-indicator is-${axis} is-${position}` }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: wrapperClassName,
        "data-tecof-id": node.props.id,
        "data-tecof-type": node.type,
        "data-tecof-index": index,
        "data-tecof-zone": zoneKey || "root",
        "data-tecof-shared": node.props.sharedComponentId ? "true" : void 0,
        draggable: !dragLocked,
        onDragStart: (e) => {
          if (isInsideOverlayPortal(e.target)) {
            e.preventDefault();
            return;
          }
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
        onContextMenu: handleContextMenu,
        onDragOver,
        onDragLeave,
        onDrop,
        children: /* @__PURE__ */ jsxRuntime.jsx(NodeErrorBoundary, { label, type: node.type, resetKey: errorResetKey, children: componentConfig.render(componentProps) })
      }
    )
  ] }) });
};
var AddSectionButton = ({ index, onClick, disabled, fixed }) => {
  if (disabled) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `tecof-add-section-divider${fixed ? " is-fixed" : ""}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-add-section-line" }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        className: "tecof-add-section-btn",
        onClick: () => onClick(index),
        title: "Buraya B\xF6l\xFCm Ekle",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 12, className: "tecof-add-section-icon" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "B\xF6l\xFCm Ekle" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-add-section-line" })
  ] });
};
var PREVIEW_REFERENCE_WIDTH = 1280;
var MAX_PREVIEW_DEPTH = 4;
var DummySlot = () => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-modal-dummy-slot", children: "\u0130\xE7erik Alan\u0131" });
var PreviewErrorBoundary = class extends React__default.default.Component {
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
      return this.props.fallback ?? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-modal-preview-fallback", children: "\xD6nizleme Y\xFCklenemedi" });
    }
    return this.props.children;
  }
};
var RenderFn = ({
  renderFn,
  props
}) => /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: renderFn(props) });
var isChildNodeArray = (value, config) => Array.isArray(value) && value.length > 0 && value.every(
  (child) => !!child && typeof child === "object" && typeof child.type === "string" && child.type in (config.components ?? {})
);
var ChildPreview = ({
  config,
  type,
  props,
  depth
}) => {
  const compConfig = config.components?.[type];
  if (!compConfig?.render) return /* @__PURE__ */ jsxRuntime.jsx(DummySlot, {});
  return /* @__PURE__ */ jsxRuntime.jsx(PreviewErrorBoundary, { fallback: /* @__PURE__ */ jsxRuntime.jsx(DummySlot, {}), children: /* @__PURE__ */ jsxRuntime.jsx(
    RenderFn,
    {
      renderFn: compConfig.render,
      props: buildPreviewProps(config, compConfig, props ?? {}, depth)
    }
  ) });
};
var buildPreviewProps = (config, compConfig, props, depth = 0) => {
  const renderProps = {
    ...props,
    puck: {
      renderDropZone: () => /* @__PURE__ */ jsxRuntime.jsx(DummySlot, {}),
      isEditing: false,
      metadata: {}
    },
    editMode: false
  };
  for (const [fieldName, fieldDef] of Object.entries(compConfig?.fields ?? {})) {
    if (fieldDef?.type !== "slot") continue;
    const value = renderProps[fieldName];
    if (depth < MAX_PREVIEW_DEPTH && isChildNodeArray(value, config)) {
      const children = value;
      renderProps[fieldName] = (slotProps) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: slotProps?.className, children: children.map((child, index) => /* @__PURE__ */ jsxRuntime.jsx(
        ChildPreview,
        {
          config,
          type: child.type,
          props: child.props,
          depth: depth + 1
        },
        child.props?.id ?? index
      )) });
    } else {
      renderProps[fieldName] = () => /* @__PURE__ */ jsxRuntime.jsx(DummySlot, {});
    }
  }
  return renderProps;
};
var AutoScalePreview = ({ mode, children }) => {
  const boxRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const [scale, setScale] = React.useState(mode === "section" ? 0.2 : 1);
  React.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntime.jsx("div", { ref: boxRef, className: `tecof-modal-preview-box mode-${mode}`, children: /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: stageRef,
      className: "tecof-modal-preview-stage",
      style: mode === "section" ? { width: PREVIEW_REFERENCE_WIDTH, transform: `scale(${scale})` } : { transform: `translate(-50%, -50%) scale(${scale})` },
      children
    }
  ) });
};
var LiveBlockPreview = ({
  config,
  type,
  props,
  mode
}) => {
  const compConfig = config.components?.[type];
  if (!compConfig?.render) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-modal-preview-fallback", children: "\xD6nizleme Yok" });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(AutoScalePreview, { mode, children: /* @__PURE__ */ jsxRuntime.jsx(PreviewErrorBoundary, { children: /* @__PURE__ */ jsxRuntime.jsx(
    RenderFn,
    {
      renderFn: compConfig.render,
      props: buildPreviewProps(config, compConfig, props ?? compConfig.defaultProps ?? {})
    }
  ) }) });
};
var NO_TEMPLATES = [];
var NO_CATEGORIES = {};
var NO_COMPONENTS = {};
var GridCard = ({ name, typeText, preview, onActivate }) => /* @__PURE__ */ jsxRuntime.jsxs(
  "div",
  {
    className: "tecof-modal-grid-card",
    role: "button",
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
    children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-preview-frame", children: [
        preview,
        /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-modal-card-add", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 13, strokeWidth: 2.4 }),
          "Ekle"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-card-footer", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-modal-card-label", children: name }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-modal-card-type", children: typeText })
      ] })
    ]
  }
);
var AddSectionModal = ({ isOpen, onClose, onSelect, onSelectTemplate, config, filterType }) => {
  const { apiClient } = useStudio();
  const allTemplates = config?.templates ?? NO_TEMPLATES;
  const categories = config?.categories ?? NO_CATEGORIES;
  const components = config?.components ?? NO_COMPONENTS;
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [savedComponents, setSavedComponents] = React.useState([]);
  React.useEffect(() => {
    if (!isOpen || !apiClient) return;
    let cancelled = false;
    apiClient.getSharedComponents().then((res) => {
      if (!cancelled && res?.success && Array.isArray(res.data)) {
        setSavedComponents(res.data);
      }
    }).catch((err) => {
      console.error("Failed to load saved/shared components:", err);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, apiClient]);
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);
  const templates = React.useMemo(
    () => filterType ? allTemplates.filter((t) => filterType(t.payload.node.type)) : allTemplates,
    [allTemplates, filterType]
  );
  const visibleSaved = React.useMemo(
    () => filterType ? savedComponents.filter((item) => filterType(item.type)) : savedComponents,
    [savedComponents, filterType]
  );
  const categoryKeyByType = React.useMemo(() => {
    const map = {};
    const hasCategories = Object.keys(categories).length > 0;
    for (const [name, compConfig] of Object.entries(components)) {
      map[name] = hasCategories ? "Genel" : compConfig.category || "Genel";
    }
    if (hasCategories) {
      for (const [key, val] of Object.entries(categories)) {
        for (const name of val.components || []) {
          if (name in map) map[name] = key;
        }
      }
    }
    return map;
  }, [components, categories]);
  const componentCategories = React.useMemo(() => {
    const list = [];
    if (Object.keys(categories).length > 0) {
      for (const [key, val] of Object.entries(categories)) {
        list.push({ key, title: String(val.title || key) });
      }
      if (Object.values(categoryKeyByType).includes("Genel") && !categories["Genel"]) {
        list.push({ key: "Genel", title: "Genel" });
      }
    } else {
      const seen = /* @__PURE__ */ new Set();
      for (const key of Object.values(categoryKeyByType)) {
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ key, title: key });
        }
      }
    }
    return list;
  }, [categories, categoryKeyByType]);
  const typesByCategory = React.useMemo(() => {
    var _a;
    const map = {};
    for (const name of Object.keys(components)) {
      if (filterType && !filterType(name)) continue;
      (map[_a = categoryKeyByType[name]] ?? (map[_a] = [])).push(name);
    }
    return map;
  }, [components, categoryKeyByType, filterType]);
  const isElementCategory = (title) => /element/i.test(title);
  const displayGroups = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const showAll = activeCategory === "all";
    const groups = [];
    if ((showAll || activeCategory === "templates") && templates.length > 0) {
      const items = templates.filter((t) => t.label.toLowerCase().includes(query)).map((t) => ({
        id: `template:${t.id}`,
        name: t.label,
        typeText: "\u015Eablon",
        onActivate: () => onSelectTemplate?.(t),
        preview: t.thumbnail ? /* @__PURE__ */ jsxRuntime.jsx("img", { src: t.thumbnail, alt: t.label, className: "tecof-modal-template-thumb" }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-modal-template-icon", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.LayoutTemplate, { size: 28, strokeWidth: 1.6 }) })
      }));
      if (items.length > 0) {
        groups.push({ key: "templates", title: "\u015Eablonlar", isElement: false, items });
      }
    }
    if ((showAll || activeCategory === "saved") && visibleSaved.length > 0) {
      const items = visibleSaved.filter((item) => item.name.toLowerCase().includes(query)).map((item) => ({
        id: `saved:${item._id}`,
        name: item.name,
        typeText: components[item.type]?.label || item.type,
        // REFERANS olarak ekle: props snapshot'ı + sharedComponentId taşınır.
        // Kayıt anında backend (deresolveSharedComponents) master'a yazar ve
        // düğümü SharedComponentRef'e indirger; diğer sayfalar okuma anında
        // (resolveSharedComponents) master'dan çözer → birinde düzenle,
        // hepsinde güncellenir. Taze node id'si createNode'da EN SON atanır.
        onActivate: () => onSelect(item.type, { ...item.props, sharedComponentId: item._id }),
        preview: /* @__PURE__ */ jsxRuntime.jsx(LiveBlockPreview, { config, type: item.type, props: item.props, mode: "section" })
      }));
      if (items.length > 0) {
        groups.push({ key: "saved", title: "Kaydedilenler (Ortak)", isElement: false, items });
      }
    }
    for (const cat of componentCategories) {
      if (!showAll && activeCategory !== cat.key) continue;
      const isElement = isElementCategory(cat.title);
      const items = (typesByCategory[cat.key] || []).filter((type) => (components[type]?.label || type).toLowerCase().includes(query)).map((type) => ({
        id: `component:${type}`,
        name: components[type]?.label || type,
        typeText: type,
        onActivate: () => onSelect(type),
        preview: /* @__PURE__ */ jsxRuntime.jsx(LiveBlockPreview, { config, type, mode: isElement ? "element" : "section" })
      }));
      if (items.length > 0) {
        groups.push({ key: cat.key, title: cat.title, isElement, items });
      }
    }
    return groups;
  }, [
    activeCategory,
    searchQuery,
    templates,
    visibleSaved,
    componentCategories,
    typesByCategory,
    components,
    config,
    onSelect,
    onSelectTemplate
  ]);
  const totalVisible = React.useMemo(
    () => displayGroups.reduce((sum, group) => sum + group.items.length, 0),
    [displayGroups]
  );
  const sidebarEntries = React.useMemo(() => {
    const allCount = Object.values(typesByCategory).reduce((sum, arr) => sum + arr.length, 0);
    const entries = [{ key: "all", title: "T\xFCm\xFC", count: allCount }];
    if (templates.length > 0) entries.push({ key: "templates", title: "\u015Eablonlar", count: templates.length });
    if (visibleSaved.length > 0) {
      entries.push({ key: "saved", title: "Kaydedilenler (Ortak)", count: visibleSaved.length });
    }
    for (const cat of componentCategories) {
      entries.push({ key: cat.key, title: cat.title, count: typesByCategory[cat.key]?.length || 0 });
    }
    return entries;
  }, [templates.length, visibleSaved.length, componentCategories, typesByCategory]);
  if (!isOpen) return null;
  const activeCategoryTitle = sidebarEntries.find((entry) => entry.key === activeCategory)?.title || "T\xFCm\xFC";
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "tecof-add-section-modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "B\xF6l\xFCm Ekle",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-header", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-title-wrap", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-modal-title-icon", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.LayoutGrid, { size: 18, strokeWidth: 2 }) }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "tecof-modal-title", children: "B\xF6l\xFCm Ekle" }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-modal-subtitle", children: [
                activeCategoryTitle,
                " \xB7 ",
                totalVisible,
                " bile\u015Fen"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: "tecof-modal-close", onClick: onClose, title: "Kapat", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-body", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-sidebar", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-modal-sidebar-title", children: "Kategoriler" }),
            /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "tecof-modal-cat-list", children: sidebarEntries.map((entry) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs(
              "button",
              {
                type: "button",
                className: `tecof-modal-cat-btn ${activeCategory === entry.key ? "is-active" : ""}`,
                onClick: () => setActiveCategory(entry.key),
                children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-modal-cat-btn-title", children: [
                    entry.key === "saved" && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Bookmark, { size: 12, "aria-hidden": "true" }),
                    entry.key === "templates" && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.LayoutTemplate, { size: 12, "aria-hidden": "true" }),
                    entry.title
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-modal-cat-count", children: entry.count })
                ]
              }
            ) }, entry.key)) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-content", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-content-head", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-search-bar", children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 16, className: "tecof-icon-muted" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "input",
                  {
                    type: "text",
                    placeholder: "Bile\u015Fen ara...",
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                    className: "tecof-modal-search-input",
                    autoFocus: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-modal-result-count", children: totalVisible })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-groups", children: [
              displayGroups.map((group) => /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "tecof-modal-group", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-modal-group-head", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-modal-group-title", children: group.title }),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-modal-group-count", children: group.items.length })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: `tecof-modal-grid ${group.isElement ? "is-elements" : "is-sections"}`, children: group.items.map(({ id, ...item }) => /* @__PURE__ */ jsxRuntime.jsx(GridCard, { ...item }, id)) })
              ] }, group.key)),
              totalVisible === 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-modal-empty", children: "Uyumlu bile\u015Fen bulunamad\u0131." })
            ] })
          ] })
        ] })
      ]
    }
  ) });
};

// src/studio/style/cssGenerator.ts
var REM = (n) => `${n * 0.25}rem`;
var FONT_SIZES = {
  xs: ["0.75rem", "1rem"],
  sm: ["0.875rem", "1.25rem"],
  base: ["1rem", "1.5rem"],
  lg: ["1.125rem", "1.75rem"],
  xl: ["1.25rem", "1.75rem"],
  "2xl": ["1.5rem", "2rem"],
  "3xl": ["1.875rem", "2.25rem"],
  "4xl": ["2.25rem", "2.5rem"],
  "5xl": ["3rem", "1"]
};
var FONT_WEIGHTS = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800"
};
var LEADING = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2"
};
var RADII = {
  none: "0",
  sm: "0.125rem",
  md: "0.25rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px"
};
var SHADOWS = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)"
};
var MAX_WIDTHS = {
  none: "none",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "42rem",
  "4xl": "56rem",
  "6xl": "72rem",
  full: "100%"
};
var FRACTIONS = {
  "1/2": "50%",
  "1/3": "33.333333%",
  "2/3": "66.666667%",
  "1/4": "25%",
  "3/4": "75%"
};
var JUSTIFY = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly"
};
var ITEMS = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline"
};
var colorValue = (token) => {
  if (token === "transparent") return "transparent";
  if (token === "white") return "#ffffff";
  if (token === "black") return "#000000";
  const brand = /^primary-(\d{2,3})$/.exec(token);
  if (brand) {
    return `var(--color-primary-${brand[1]}, var(--tecof-primary-${brand[1]}))`;
  }
  const palette = parsePaletteToken(token);
  if (palette) return tailwindSwatch(palette.hue.name, palette.shade);
  return null;
};
var spaceValue = (token) => {
  if (isArbitrary(token)) return arbitraryRaw(token);
  const n = Number(token);
  return Number.isFinite(n) ? REM(n) : null;
};
var declarationsFor = (controlId, value) => {
  const raw = isArbitrary(value) ? arbitraryRaw(value) : null;
  switch (controlId) {
    case "display":
      return [["display", value === "hidden" ? "none" : value]];
    case "flexDir":
      return [["flex-direction", value === "col" ? "column" : "row"]];
    case "justify":
      return JUSTIFY[value] ? [["justify-content", JUSTIFY[value]]] : null;
    case "items":
      return ITEMS[value] ? [["align-items", ITEMS[value]]] : null;
    case "alignSelf":
      return [["align-self", value === "start" ? "flex-start" : value === "end" ? "flex-end" : value]];
    case "gap": {
      const v = spaceValue(value);
      return v ? [["gap", v]] : null;
    }
    case "p": {
      const v = spaceValue(value);
      return v ? [["padding", v]] : null;
    }
    case "px": {
      const v = spaceValue(value);
      return v ? [["padding-left", v], ["padding-right", v]] : null;
    }
    case "py": {
      const v = spaceValue(value);
      return v ? [["padding-top", v], ["padding-bottom", v]] : null;
    }
    case "m": {
      const v = spaceValue(value);
      return v ? [["margin", v]] : null;
    }
    case "mx": {
      const v = spaceValue(value);
      return v ? [["margin-left", v], ["margin-right", v]] : null;
    }
    case "my": {
      const v = spaceValue(value);
      return v ? [["margin-top", v], ["margin-bottom", v]] : null;
    }
    case "marginAlign":
      switch (value) {
        case "auto":
          return [["margin", "auto"]];
        case "l-auto":
          return [["margin-left", "auto"]];
        case "r-auto":
          return [["margin-right", "auto"]];
        case "x-auto":
          return [["margin-left", "auto"], ["margin-right", "auto"]];
        default:
          return null;
      }
    case "w": {
      if (raw) return [["width", raw]];
      if (value === "auto") return [["width", "auto"]];
      if (value === "full") return [["width", "100%"]];
      if (value === "screen") return [["width", "100vw"]];
      if (value === "fit") return [["width", "fit-content"]];
      return FRACTIONS[value] ? [["width", FRACTIONS[value]]] : null;
    }
    case "h": {
      if (raw) return [["height", raw]];
      if (value === "auto") return [["height", "auto"]];
      if (value === "full") return [["height", "100%"]];
      if (value === "screen") return [["height", "100vh"]];
      if (value === "fit") return [["height", "fit-content"]];
      return null;
    }
    case "maxW": {
      if (raw) return [["max-width", raw]];
      return MAX_WIDTHS[value] ? [["max-width", MAX_WIDTHS[value]]] : null;
    }
    case "bg": {
      const v = raw ?? colorValue(value);
      return v ? [["background-color", v]] : null;
    }
    case "text": {
      const v = raw ?? colorValue(value);
      return v ? [["color", v]] : null;
    }
    case "borderColor": {
      const v = raw ?? colorValue(value);
      return v ? [["border-color", v]] : null;
    }
    case "fontSize": {
      const v = FONT_SIZES[value];
      return v ? [["font-size", v[0]], ["line-height", v[1]]] : null;
    }
    case "fontWeight":
      return FONT_WEIGHTS[value] ? [["font-weight", FONT_WEIGHTS[value]]] : null;
    case "align":
      return [["text-align", value]];
    case "leading":
      return LEADING[value] ? [["line-height", LEADING[value]]] : null;
    case "radius":
      return RADII[value] ? [["border-radius", RADII[value]]] : null;
    case "border":
      return [["border-width", `${value}px`], ["border-style", "solid"]];
    case "shadow":
      return SHADOWS[value] ? [["box-shadow", SHADOWS[value]]] : null;
    case "opacity": {
      const n = Number(value);
      return Number.isFinite(n) ? [["opacity", String(n / 100)]] : null;
    }
    default:
      return null;
  }
};
var PRESET_BY_CLASS = {};
for (const control of STYLE_CONTROLS) {
  for (const opt of control.options) {
    if (!opt.value) continue;
    const cls = control.toClass(opt.value);
    if (cls) PRESET_BY_CLASS[cls] = { controlId: control.id, value: opt.value };
  }
}
var ARBITRARY_PREFIXES = STYLE_CONTROLS.filter((c) => c.arbitraryPrefix).map((c) => ({ prefix: `${c.arbitraryPrefix}-[`, controlId: c.id })).sort((a, b) => b.prefix.length - a.prefix.length);
var resolveUtility = (utility) => {
  const preset = PRESET_BY_CLASS[utility];
  if (preset) return preset;
  for (const { prefix, controlId } of ARBITRARY_PREFIXES) {
    if (utility.startsWith(prefix) && utility.endsWith("]")) {
      return { controlId, value: utility.slice(prefix.length - 1) };
    }
  }
  return null;
};
var MEDIA = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)"
};
var PSEUDO = {
  hover: ":hover",
  focus: ":focus",
  active: ":active"
};
var escapeSelector = (cls) => cls.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
var parseClass = (cls) => {
  const parts = cls.split(":");
  let media = null;
  let pseudo = null;
  let index = 0;
  while (index < parts.length - 1) {
    const part = parts[index];
    if (MEDIA[part] && media === null) {
      media = MEDIA[part];
      index += 1;
      continue;
    }
    if (PSEUDO[part] && pseudo === null) {
      pseudo = PSEUDO[part];
      index += 1;
      continue;
    }
    return null;
  }
  let utility = parts.slice(index).join(":");
  if (utility.endsWith("!")) utility = utility.slice(0, -1);
  return utility ? { media, pseudo, utility } : null;
};
function generateStyleCss(classes) {
  const plain = [];
  const byMedia = /* @__PURE__ */ new Map();
  const seen = /* @__PURE__ */ new Set();
  for (const cls of classes) {
    if (!cls || seen.has(cls)) continue;
    seen.add(cls);
    const parsed = parseClass(cls);
    if (!parsed) continue;
    const info = resolveUtility(parsed.utility);
    if (!info) continue;
    const decls = declarationsFor(info.controlId, info.value);
    if (!decls || decls.length === 0) continue;
    const selector = `.${escapeSelector(cls)}${parsed.pseudo ?? ""}`;
    const body = decls.map(([prop, value]) => `${prop}: ${value} !important;`).join(" ");
    const rule = `${selector} { ${body} }`;
    if (parsed.media) {
      const bucket = byMedia.get(parsed.media) ?? [];
      bucket.push(rule);
      byMedia.set(parsed.media, bucket);
    } else {
      plain.push(rule);
    }
  }
  const chunks = [...plain];
  for (const [media, rules] of byMedia) {
    chunks.push(`@media ${media} { ${rules.join(" ")} }`);
  }
  return chunks.join("\n");
}
var CanvasStyleInjector = () => {
  const documentState = useEditorStore((state) => state.document);
  const css = React.useMemo(
    () => generateStyleCss(collectDocumentClasses(documentState)),
    [documentState]
  );
  if (!css) return null;
  return /* @__PURE__ */ jsxRuntime.jsx("style", { "data-tecof-canvas-styles": true, children: css });
};
var Canvas = () => {
  const content = useEditorStore((state) => state.document.content);
  const viewport = useEditorStore((state) => state.viewport);
  const { config, readOnly } = useStudio();
  const rootProps = useEditorStore((state) => state.document.root?.props) || {};
  const insertNode2 = useEditorStore((state) => state.insertNode);
  const insertPayload = useEditorStore((state) => state.insertPayload);
  const selectNode = useEditorStore((state) => state.selectNode);
  const addSectionTarget = useUiStore((s) => s.addSectionTarget);
  const openAddSection = useUiStore((s) => s.openAddSection);
  const closeAddSection = useUiStore((s) => s.closeAddSection);
  const modalFilterType = addSectionTarget?.zoneKey ? (type) => isValidDrop(config, type, addSectionTarget.zoneKey, useEditorStore.getState().document) : void 0;
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
  const handleSelectComponent = (type, customProps) => {
    const newNode = createNode(config, type, customProps);
    insertNode2(newNode, addSectionTarget?.zoneKey, addSectionTarget?.index);
    closeAddSection();
  };
  const handleSelectTemplate = (template) => {
    const payload = JSON.parse(JSON.stringify({
      node: template.payload.node,
      zones: template.payload.zones || {}
    }));
    insertPayload(payload, addSectionTarget?.zoneKey, addSectionTarget?.index);
    closeAddSection();
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
  const renderedContent = /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: rootClassName,
      onDragOver: handleRootDragOver,
      onDragLeave: handleRootDragLeave,
      onDrop: handleRootDrop,
      onClick: handleRootClick,
      "data-tecof-zone": "root",
      children: content.length === 0 ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-canvas-empty", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-canvas-empty-icon", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.LayoutTemplate, { size: 22, strokeWidth: 1.8 }) }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-canvas-empty-kicker", children: "Root" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-canvas-empty-title", children: isRootDragOver ? "B\u0131rakmaya haz\u0131r" : "Canvas bo\u015F" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-canvas-empty-sub", children: isRootDragOver ? "Bile\u015Fen ana ak\u0131\u015Fa eklenecek" : "\u0130lk b\xF6l\xFCm\xFC ekleyin" }),
        !readOnly && /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            className: "tecof-canvas-empty-add-btn",
            onClick: () => openAddSection({ index: 0 }),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 16, strokeWidth: 2.4 }),
              "B\xF6l\xFCm Ekle"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        !readOnly && /* @__PURE__ */ jsxRuntime.jsx(
          AddSectionButton,
          {
            index: 0,
            onClick: (idx) => openAddSection({ index: idx })
          }
        ),
        content.map((item, index) => /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(NodeRenderer, { node: item, index }),
          !readOnly && /* @__PURE__ */ jsxRuntime.jsx(
            AddSectionButton,
            {
              index: index + 1,
              fixed: index === content.length - 1,
              onClick: (idx) => openAddSection({ index: idx })
            }
          )
        ] }, item.props.id)),
        !readOnly && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-canvas-root-tail", "aria-hidden": "true" })
      ] })
    }
  );
  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render ? rootConfig.render({
    ...rootProps,
    children: renderedContent,
    editMode: true
  }) : renderedContent;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-canvas-container", onMouseDown: handleCanvasShellClick, children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: viewportClassName, children: /* @__PURE__ */ jsxRuntime.jsxs(Frame, { className: "tecof-canvas-frame", children: [
      /* @__PURE__ */ jsxRuntime.jsx(CanvasStyleInjector, {}),
      contentWithLayout
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      AddSectionModal,
      {
        isOpen: addSectionTarget != null,
        onClose: closeAddSection,
        onSelect: handleSelectComponent,
        onSelectTemplate: handleSelectTemplate,
        config,
        filterType: modalFilterType
      }
    )
  ] });
};
var EDGES = [
  { kind: "padding", side: "top", axis: "y", controlId: "py", boxKey: "pt", dir: 1 },
  { kind: "padding", side: "bottom", axis: "y", controlId: "py", boxKey: "pb", dir: -1 },
  { kind: "padding", side: "left", axis: "x", controlId: "px", boxKey: "pl", dir: 1 },
  { kind: "padding", side: "right", axis: "x", controlId: "px", boxKey: "pr", dir: -1 },
  { kind: "margin", side: "top", axis: "y", controlId: "my", boxKey: "mt", dir: -1 },
  { kind: "margin", side: "bottom", axis: "y", controlId: "my", boxKey: "mb", dir: 1 },
  { kind: "margin", side: "left", axis: "x", controlId: "mx", boxKey: "ml", dir: -1 },
  { kind: "margin", side: "right", axis: "x", controlId: "mx", boxKey: "mr", dir: 1 }
];
var EDGE_TITLES = {
  py: "\u0130\xE7 bo\u015Fluk (dikey)",
  px: "\u0130\xE7 bo\u015Fluk (yatay)",
  my: "D\u0131\u015F bo\u015Fluk (dikey)",
  mx: "D\u0131\u015F bo\u015Fluk (yatay)"
};
var presetCache = /* @__PURE__ */ new Map();
var presetsFor = (controlId) => {
  const cached = presetCache.get(controlId);
  if (cached) return cached;
  const presets = (CONTROL_BY_ID[controlId]?.options ?? []).map((o) => o.value).filter((v) => v !== "" && !Number.isNaN(Number(v))).map((v) => ({ token: v, px: Number(v) * 4 }));
  presetCache.set(controlId, presets);
  return presets;
};
var pxToSpacingToken = (controlId, px) => {
  const presets = presetsFor(controlId);
  const hit = presets.find((p) => Math.abs(p.px - px) <= 1);
  if (hit) return hit.token;
  if (CONTROL_BY_ID[controlId]?.arbitraryPrefix) return toArbitrary(`${px}px`);
  let best = presets[0];
  for (const p of presets) {
    if (Math.abs(p.px - px) < Math.abs(best.px - px)) best = p;
  }
  return best ? best.token : String(px);
};
var previewBands = (d) => {
  const v = d.valuePx;
  if (d.edge.axis === "y") {
    return d.edge.kind === "padding" ? [{ top: 0, left: 0, right: 0, height: v }, { bottom: 0, left: 0, right: 0, height: v }] : [{ top: -v, left: 0, right: 0, height: v }, { bottom: -v, left: 0, right: 0, height: v }];
  }
  return d.edge.kind === "padding" ? [{ top: 0, bottom: 0, left: 0, width: v }, { top: 0, bottom: 0, right: 0, width: v }] : [{ top: 0, bottom: 0, left: -v, width: v }, { top: 0, bottom: 0, right: -v, width: v }];
};
var labelStyle = (d) => {
  const v = d.valuePx;
  const inside = d.edge.kind === "padding";
  switch (d.edge.side) {
    case "top":
      return inside ? { top: v + 6, left: "50%", transform: "translateX(-50%)" } : { top: -v - 6, left: "50%", transform: "translate(-50%, -100%)" };
    case "bottom":
      return inside ? { bottom: v + 6, left: "50%", transform: "translateX(-50%)" } : { bottom: -v - 6, left: "50%", transform: "translate(-50%, 100%)" };
    case "left":
      return inside ? { left: v + 6, top: "50%", transform: "translateY(-50%)" } : { left: -v - 6, top: "50%", transform: "translate(-100%, -50%)" };
    case "right":
      return inside ? { right: v + 6, top: "50%", transform: "translateY(-50%)" } : { right: -v - 6, top: "50%", transform: "translate(100%, -50%)" };
  }
};
var SpacingDragHandles = ({ nodeId, coords, onDragAxisChange }) => {
  const [drag, setDrag] = React.useState(null);
  const dragRef = React.useRef(null);
  const captureRef = React.useRef(null);
  const endDrag = React.useCallback(
    (commit2) => {
      const d = dragRef.current;
      const cap = captureRef.current;
      dragRef.current = null;
      captureRef.current = null;
      setDrag(null);
      onDragAxisChange(null);
      if (cap) {
        try {
          cap.el.releasePointerCapture(cap.pointerId);
        } catch {
        }
      }
      if (!d || !commit2 || !d.moved) return;
      const store = useEditorStore.getState();
      const details = findNodeById(store.document, nodeId);
      if (!details) return;
      const current2 = details.node.props?.[STYLES_PROP] ?? {};
      const token = pxToSpacingToken(d.edge.controlId, d.valuePx);
      const next = {
        ...current2,
        base: { ...current2.base, [d.edge.controlId]: token }
      };
      store.updateProps(nodeId, { [STYLES_PROP]: next });
    },
    [nodeId, onDragAxisChange]
  );
  const handlePointerDown = (edge) => (e) => {
    if (e.button !== 0 || dragRef.current) return;
    const box = coords.box;
    if (!box) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    captureRef.current = { el, pointerId: e.pointerId };
    const startPx = Math.max(0, Math.round(box[edge.boxKey]));
    const next = {
      edge,
      startPx,
      startClientX: e.clientX,
      startClientY: e.clientY,
      valuePx: startPx,
      moved: false
    };
    dragRef.current = next;
    setDrag(next);
    onDragAxisChange(edge.axis);
  };
  const handlePointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const delta = d.edge.axis === "y" ? e.clientY - d.startClientY : e.clientX - d.startClientX;
    const valuePx = Math.max(0, Math.round(d.startPx + d.edge.dir * delta));
    const moved = d.moved || delta !== 0;
    if (valuePx === d.valuePx && moved === d.moved) return;
    const next = { ...d, valuePx, moved };
    dragRef.current = next;
    setDrag(next);
  };
  const handlePointerUp = () => endDrag(true);
  const handlePointerCancel = () => endDrag(false);
  const dragging = drag !== null;
  React.useEffect(() => {
    if (!dragging) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        endDrag(false);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [dragging, endDrag]);
  React.useEffect(() => () => onDragAxisChange(null), [onDragAxisChange]);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    EDGES.map((edge) => {
      const isActive = drag?.edge === edge;
      if (drag && !isActive) return null;
      return /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: `tecof-spacing-handle is-${edge.kind} is-${edge.side} ${edge.axis === "y" ? "is-h" : "is-v"}${isActive ? " is-active" : ""}`,
          title: `${EDGE_TITLES[edge.controlId]} \u2014 s\xFCr\xFCkleyerek ayarlay\u0131n (Esc: iptal)`,
          onPointerDown: handlePointerDown(edge),
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          onPointerCancel: handlePointerCancel,
          children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacing-handle-bar" })
        },
        `${edge.kind}-${edge.side}`
      );
    }),
    drag && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      previewBands(drag).map((style, i) => /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: `tecof-spacing-drag-band ${drag.edge.kind === "padding" ? "tecof-space-padding" : "tecof-space-margin"}`,
          style
        },
        i
      )),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `tecof-spacing-drag-label is-${drag.edge.kind}`, style: labelStyle(drag), children: [
        drag.valuePx,
        "px"
      ] })
    ] })
  ] });
};
var getOutlineStyle = (coords) => ({
  "--tecof-outline-top": `${coords.top}px`,
  "--tecof-outline-left": `${coords.left}px`,
  "--tecof-outline-width": `${coords.width}px`,
  "--tecof-outline-height": `${coords.height}px`
});
var useOverlayCoords = (ids, iframeEl, containerEl, documentState) => {
  const [coordsMap, setCoordsMap] = React.useState({});
  const measureRef = React.useRef(() => {
  });
  const idsKey = ids.join("\0");
  React.useEffect(() => {
    const effectIds = idsKey ? idsKey.split("\0") : [];
    if (effectIds.length === 0 || !iframeEl || !containerEl) {
      setCoordsMap({});
      return;
    }
    const doc = iframeEl.contentDocument;
    const win = iframeEl.contentWindow;
    if (!doc) return;
    let raf = 0;
    const observedById = /* @__PURE__ */ new Map();
    const targetObserver = new ResizeObserver(() => schedule());
    const measure = () => {
      const iframeRect = iframeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const next = {};
      const seen = /* @__PURE__ */ new Set();
      for (const id of effectIds) {
        const wrapper = doc.querySelector(`[data-tecof-id="${id}"]`);
        if (!wrapper) continue;
        let element = wrapper;
        if (wrapper.classList.contains("tecof-node-wrapper") && wrapper.childElementCount === 1) {
          const inner = wrapper.firstElementChild;
          const innerRect = inner.getBoundingClientRect();
          if (innerRect.width > 0 && innerRect.height > 0) element = inner;
        }
        const rect = element.getBoundingClientRect();
        let box;
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
        next[id] = {
          top: rect.top + iframeRect.top - containerRect.top,
          left: rect.left + iframeRect.left - containerRect.left,
          width: rect.width,
          height: rect.height,
          box
        };
        seen.add(id);
        const previous = observedById.get(id);
        if (previous !== element) {
          if (previous) targetObserver.unobserve(previous);
          targetObserver.observe(element);
          observedById.set(id, element);
        }
      }
      for (const [id, el] of observedById) {
        if (!seen.has(id)) {
          targetObserver.unobserve(el);
          observedById.delete(id);
        }
      }
      setCoordsMap(next);
    };
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };
    measureRef.current = schedule;
    measure();
    const iframeResizeObserver = new ResizeObserver(schedule);
    iframeResizeObserver.observe(iframeEl);
    doc.addEventListener("scroll", schedule, { capture: true, passive: true });
    doc.addEventListener("load", schedule, true);
    window.addEventListener("resize", schedule);
    const mutationObserver = new MutationObserver(schedule);
    if (doc.body) {
      mutationObserver.observe(doc.body, { childList: true, subtree: true });
    }
    doc.fonts?.ready.then(schedule).catch(() => {
    });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      targetObserver.disconnect();
      iframeResizeObserver.disconnect();
      mutationObserver.disconnect();
      doc.removeEventListener("scroll", schedule, true);
      doc.removeEventListener("load", schedule, true);
      window.removeEventListener("resize", schedule);
      measureRef.current = () => {
      };
    };
  }, [idsKey, iframeEl, containerEl]);
  React.useEffect(() => {
    measureRef.current();
  }, [documentState]);
  return coordsMap;
};
var SPACE_LABEL_MIN = 16;
var SpacingBands = ({ coords }) => {
  const b = coords.box;
  if (!b) return null;
  const { top, left, width, height } = coords;
  const innerH = Math.max(0, height - b.pt - b.pb);
  const bands = [];
  const push = (cls, style, thickness) => bands.push({
    cls,
    style,
    label: thickness >= SPACE_LABEL_MIN ? String(Math.round(thickness)) : void 0
  });
  if (b.mt > 0) push("tecof-space-margin", { top: top - b.mt, left, width, height: b.mt }, b.mt);
  if (b.mb > 0) push("tecof-space-margin", { top: top + height, left, width, height: b.mb }, b.mb);
  if (b.ml > 0) push("tecof-space-margin", { top, left: left - b.ml, width: b.ml, height }, b.ml);
  if (b.mr > 0) push("tecof-space-margin", { top, left: left + width, width: b.mr, height }, b.mr);
  if (b.pt > 0) push("tecof-space-padding", { top, left, width, height: b.pt }, b.pt);
  if (b.pb > 0) push("tecof-space-padding", { top: top + height - b.pb, left, width, height: b.pb }, b.pb);
  if (b.pl > 0) push("tecof-space-padding", { top: top + b.pt, left, width: b.pl, height: innerH }, b.pl);
  if (b.pr > 0) push("tecof-space-padding", { top: top + b.pt, left: left + width - b.pr, width: b.pr, height: innerH }, b.pr);
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: bands.map((band, i) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: band.cls, style: band.style, children: band.label && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-space-label", children: band.label }) }, i)) });
};
var SPACING_HANDLES_MIN_WIDTH = 90;
var SPACING_HANDLES_MIN_HEIGHT = 48;
var InfoPopover = ({ node, componentConfig }) => {
  const [open, setOpen] = React.useState(false);
  const fields = Object.entries(componentConfig?.fields ?? {});
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "span",
    {
      className: `tecof-info-popover-trigger${open ? " is-open" : ""}`,
      onMouseLeave: () => setOpen(false),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            className: "tecof-toolbar-btn",
            title: "Bile\u015Fen Bilgisi",
            "aria-label": "Bile\u015Fen bilgisi",
            "aria-expanded": open,
            "aria-haspopup": "true",
            onClick: () => setOpen((o) => !o),
            onBlur: () => setOpen(false),
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Info, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-info-popover", role: "tooltip", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-info-popover-title", children: componentConfig?.label || node.type }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-info-popover-type", children: node.type }),
          fields.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-info-popover-fields", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-info-popover-section-title", children: "\xD6zellikler:" }),
            fields.map(([fieldName, fieldConf]) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-info-popover-field", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-info-popover-field-name", children: fieldName }),
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-info-popover-field-label", children: [
                "(",
                fieldConf.label || fieldConf.type,
                ")"
              ] })
            ] }, fieldName))
          ] })
        ] })
      ]
    }
  );
};
var OverlayToolbar = ({
  flipped,
  node,
  componentConfig,
  parentId,
  canMoveUp,
  canMoveDown,
  isMulti,
  perms,
  onSelectParent,
  onMove,
  onDuplicate,
  onDelete
}) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `tecof-toolbar${flipped ? " is-flipped" : ""}`, children: [
  /* @__PURE__ */ jsxRuntime.jsx(InfoPopover, { node, componentConfig }),
  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-toolbar-sep" }),
  parentId && /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      onClick: () => onSelectParent(parentId),
      title: "\xDCst \xD6\u011Feyi Se\xE7",
      className: "tecof-toolbar-btn",
      "aria-label": "\xDCst \xF6\u011Feyi se\xE7",
      children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, { size: 14 })
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      onClick: () => onMove("up"),
      disabled: !canMoveUp || perms.drag === false,
      title: "Yukar\u0131 Ta\u015F\u0131",
      className: "tecof-toolbar-btn",
      "aria-label": "Yukar\u0131 ta\u015F\u0131",
      children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowUp, { size: 14 })
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      onClick: () => onMove("down"),
      disabled: !canMoveDown || perms.drag === false,
      title: "A\u015Fa\u011F\u0131 Ta\u015F\u0131",
      className: "tecof-toolbar-btn",
      "aria-label": "A\u015Fa\u011F\u0131 ta\u015F\u0131",
      children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowDown, { size: 14 })
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-toolbar-sep" }),
  /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      onClick: onDuplicate,
      disabled: perms.duplicate === false,
      title: isMulti ? "T\xFCm\xFCn\xFC \xC7o\u011Falt" : "Kopyala",
      className: "tecof-toolbar-btn",
      "aria-label": isMulti ? "Se\xE7ili \xF6\u011Feleri \xE7o\u011Falt" : "Kopyala",
      children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { size: 14 })
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      onClick: onDelete,
      disabled: perms.delete === false,
      title: isMulti ? "T\xFCm\xFCn\xFC Sil" : "Sil",
      className: "tecof-toolbar-btn",
      "aria-label": isMulti ? "Se\xE7ili \xF6\u011Feleri sil" : "Sil",
      children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 14 })
    }
  )
] });
var OverlayStatusBar = ({
  documentState,
  selectedId,
  coords
}) => {
  const selectNode = useEditorStore((state) => state.selectNode);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const crumbs = getBreadcrumbs(documentState, selectedId);
  if (crumbs.length === 0) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-overlay-statusbar", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-breadcrumbs", children: crumbs.map((crumb, idx) => /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
      idx > 0 && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-breadcrumb-sep", children: ">" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "span",
        {
          onClick: () => selectNode(crumb.id),
          className: `tecof-breadcrumb${crumb.id === selectedId ? " is-active" : ""}`,
          onMouseEnter: () => hoverNode(crumb.id),
          onMouseLeave: () => hoverNode(null),
          children: crumb.type
        }
      )
    ] }, crumb.id)) }),
    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-statusbar-size", title: "Geni\u015Flik \xD7 Y\xFCkseklik (px)", children: [
      Math.round(coords.width),
      " \xD7 ",
      Math.round(coords.height)
    ] })
  ] });
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
  const [iframeEl, setIframeEl] = React.useState(null);
  const containerRef = React.useRef(null);
  React.useEffect(() => {
    if (iframeEl && iframeEl.isConnected) return;
    const iframe = document.querySelector(".tecof-canvas-viewport iframe");
    if (iframe !== iframeEl) setIframeEl(iframe);
  }, [documentState, iframeEl]);
  const [isScrolling, setIsScrolling] = React.useState(false);
  React.useEffect(() => {
    const doc = iframeEl?.contentDocument;
    if (!doc) return;
    let timer = null;
    const onScroll = () => {
      setIsScrolling(true);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setIsScrolling(false), 120);
    };
    doc.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      doc.removeEventListener("scroll", onScroll, true);
      if (timer) window.clearTimeout(timer);
    };
  }, [iframeEl]);
  const selectionIdList = React.useMemo(() => {
    const ids = selectedId ? [selectedId] : [];
    for (const id of selectedIds) {
      if (id !== selectedId) ids.push(id);
    }
    return ids;
  }, [selectedId, selectedIds]);
  const hoverIdList = React.useMemo(
    () => hoveredId && hoveredId !== selectedId ? [hoveredId] : [],
    [hoveredId, selectedId]
  );
  const selectionCoords = useOverlayCoords(selectionIdList, iframeEl, containerRef.current, documentState);
  const hoverCoords = useOverlayCoords(hoverIdList, iframeEl, containerRef.current, documentState);
  const selectedCoords = selectedId ? selectionCoords[selectedId] ?? null : null;
  const hoveredCoords = hoveredId ? hoverCoords[hoveredId] ?? null : null;
  const nodeDetails = selectedId ? findNodeById(documentState, selectedId) : null;
  const parentId = selectedId ? getParentId(documentState, selectedId) : null;
  const componentConfig = nodeDetails ? config?.components?.[nodeDetails.node.type] : void 0;
  const isSharedNode = (id) => {
    if (!id) return false;
    const d = findNodeById(documentState, id);
    return !!d?.node?.props?.sharedComponentId;
  };
  const selectedIsShared = !!nodeDetails?.node?.props?.sharedComponentId;
  const canMoveUp = nodeDetails ? nodeDetails.path.index > 0 : false;
  const canMoveDown = nodeDetails ? (() => {
    const { zoneKey, index } = nodeDetails.path;
    const items = zoneKey ? documentState.zones[zoneKey] || [] : documentState.content;
    return index < items.length - 1;
  })() : false;
  const handleMove = (direction) => {
    if (!selectedId || !nodeDetails) return;
    const { zoneKey, index } = nodeDetails.path;
    const newIndex = direction === "up" ? index - 1 : index + 2;
    moveNode2(selectedId, zoneKey, newIndex);
  };
  const perms = usePermissions(selectedId);
  const [spacingDragAxis, setSpacingDragAxis] = React.useState(null);
  if (mode === "preview") return null;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      ref: containerRef,
      className: `tecof-overlay${isScrolling ? " is-scrolling" : ""}${spacingDragAxis ? ` is-spacing-dragging is-axis-${spacingDragAxis}` : ""}`,
      children: [
        hoveredCoords && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(SpacingBands, { coords: hoveredCoords }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: `tecof-outline is-hover${isSharedNode(hoveredId) ? " is-shared" : ""}`,
              style: getOutlineStyle(hoveredCoords)
            }
          )
        ] }),
        selectionIdList.filter((id) => id !== selectedId && selectionCoords[id]).map((id) => /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: `tecof-outline is-selected is-multi${isSharedNode(id) ? " is-shared" : ""}`,
            style: getOutlineStyle(selectionCoords[id])
          },
          id
        )),
        selectedId && selectedCoords && nodeDetails && /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: `tecof-outline is-selected${selectedIsShared ? " is-shared" : ""}`,
            style: getOutlineStyle(selectedCoords),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                OverlayToolbar,
                {
                  flipped: selectedCoords.top < 44,
                  node: nodeDetails.node,
                  componentConfig,
                  parentId,
                  canMoveUp,
                  canMoveDown,
                  isMulti,
                  perms,
                  onSelectParent: selectNode,
                  onMove: handleMove,
                  onDuplicate: handleDuplicate,
                  onDelete: handleDelete
                }
              ),
              !isMulti && perms.edit !== false && selectedCoords.box && selectedCoords.width >= SPACING_HANDLES_MIN_WIDTH && selectedCoords.height >= SPACING_HANDLES_MIN_HEIGHT && /* @__PURE__ */ jsxRuntime.jsx(
                SpacingDragHandles,
                {
                  nodeId: selectedId,
                  coords: selectedCoords,
                  onDragAxisChange: setSpacingDragAxis
                }
              )
            ]
          }
        ),
        selectedId && selectedCoords && nodeDetails && /* @__PURE__ */ jsxRuntime.jsx(
          OverlayStatusBar,
          {
            documentState,
            selectedId,
            coords: selectedCoords
          }
        )
      ]
    }
  );
};
var EDGE_MARGIN = 8;
var MenuItem = ({ icon, label, onSelect, disabled, danger }) => /* @__PURE__ */ jsxRuntime.jsxs(
  "button",
  {
    type: "button",
    role: "menuitem",
    className: `tecof-ctx-item${danger ? " is-danger" : ""}`,
    disabled,
    onClick: onSelect,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-ctx-item-icon", "aria-hidden": "true", children: icon }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-ctx-item-label", children: label })
    ]
  }
);
var Menu = ({ menu, onClose }) => {
  const { config, apiClient } = useStudio();
  const documentState = useEditorStore((s) => s.document);
  const selectNode = useEditorStore((s) => s.selectNode);
  const removeNode2 = useEditorStore((s) => s.removeNode);
  const duplicateNode2 = useEditorStore((s) => s.duplicateNode);
  const insertNode2 = useEditorStore((s) => s.insertNode);
  const updateProps2 = useEditorStore((s) => s.updateProps);
  const styleClipboard = useUiStore((s) => s.styleClipboard);
  const nodeClipboard = useUiStore((s) => s.nodeClipboard);
  const setNodeClipboard = useUiStore((s) => s.setNodeClipboard);
  const perms = usePermissions(menu.nodeId);
  const nodeDetails = findNodeById(documentState, menu.nodeId);
  const parentId = getParentId(documentState, menu.nodeId);
  const menuRef = React.useRef(null);
  const [position, setPosition] = React.useState({ x: menu.x, y: menu.y });
  const [savePanelOpen, setSavePanelOpen] = React.useState(false);
  const [saveName, setSaveName] = React.useState("");
  const [saveState, setSaveState] = React.useState("idle");
  const savePanelOpenRef = React.useRef(savePanelOpen);
  savePanelOpenRef.current = savePanelOpen;
  React.useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(
      EDGE_MARGIN,
      Math.min(menu.x, window.innerWidth - rect.width - EDGE_MARGIN)
    );
    const y = Math.max(
      EDGE_MARGIN,
      Math.min(menu.y, window.innerHeight - rect.height - EDGE_MARGIN)
    );
    setPosition({ x, y });
  }, [menu.x, menu.y, savePanelOpen]);
  React.useEffect(() => {
    const first = menuRef.current?.querySelector(
      ".tecof-ctx-item:not(:disabled)"
    );
    first?.focus();
  }, []);
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      if (savePanelOpenRef.current) {
        setSavePanelOpen(false);
        setSaveState("idle");
      } else {
        onClose();
      }
    };
    const onPointerDown = (e) => {
      const target = e.target;
      if (target && menuRef.current?.contains(target)) return;
      onClose();
    };
    const onScroll = () => onClose();
    const onResize = () => onClose();
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    const iframeDoc = document.querySelector(
      ".tecof-canvas-viewport iframe"
    )?.contentDocument;
    iframeDoc?.addEventListener("pointerdown", onPointerDown, true);
    iframeDoc?.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      iframeDoc?.removeEventListener("pointerdown", onPointerDown, true);
      iframeDoc?.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);
  React.useEffect(() => {
    if (!nodeDetails) onClose();
  }, [nodeDetails, onClose]);
  const handleMenuKeyDown = React.useCallback((e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(
      menuRef.current?.querySelectorAll(
        ".tecof-ctx-item:not(:disabled)"
      ) ?? []
    );
    if (items.length === 0) return;
    e.preventDefault();
    const current2 = items.indexOf(document.activeElement);
    const delta = e.key === "ArrowDown" ? 1 : -1;
    const next = (current2 + delta + items.length) % items.length;
    items[next]?.focus();
  }, []);
  if (!nodeDetails) return null;
  const node = nodeDetails.node;
  const componentLabel = config.components[node.type]?.label || node.type;
  const hasOwnStyles = !isEmptyStyles(node.props[STYLES_PROP]);
  const handleSelectParent = () => {
    if (parentId) selectNode(parentId);
    onClose();
  };
  const handleDuplicate = () => {
    duplicateNode2(menu.nodeId);
    onClose();
  };
  const handleCopy = () => {
    const snapshot = serializeNodeSubtree(documentState, menu.nodeId);
    if (snapshot) setNodeClipboard(snapshot);
    onClose();
  };
  const handlePaste = () => {
    if (!nodeClipboard) return;
    const clone = JSON.parse(JSON.stringify(nodeClipboard));
    const newId = generateId();
    clone.props.id = newId;
    insertNode2(clone, nodeDetails.path.zoneKey, nodeDetails.path.index + 1);
    selectNode(newId);
    onClose();
  };
  const handleCopyStyles = () => {
    copyNodeStyles(menu.nodeId);
    onClose();
  };
  const handlePasteStyles = () => {
    pasteNodeStyles([menu.nodeId]);
    onClose();
  };
  const handleDelete = () => {
    removeNode2(menu.nodeId);
    onClose();
  };
  const handleSaveShared = async (e) => {
    e.preventDefault();
    const name = saveName.trim();
    if (!name || !apiClient || saveState === "saving") return;
    setSaveState("saving");
    try {
      const snapshot = serializeNodeSubtree(documentState, menu.nodeId);
      if (!snapshot) throw new Error("Node not found");
      const props = { ...snapshot.props };
      delete props.id;
      const res = await apiClient.createSharedComponent(name, node.type, props);
      if (res?.success) {
        const masterId = res?.data?._id;
        if (masterId) {
          updateProps2(menu.nodeId, { sharedComponentId: String(masterId) });
        }
        setSaveState("success");
        window.setTimeout(onClose, 1200);
      } else {
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      ref: menuRef,
      className: "tecof-ctx-menu",
      style: { left: position.x, top: position.y },
      role: "menu",
      "aria-label": `${componentLabel} ba\u011Flam men\xFCs\xFC`,
      onKeyDown: handleMenuKeyDown,
      onContextMenu: (e) => e.preventDefault(),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-ctx-header", children: componentLabel }),
        savePanelOpen ? /* @__PURE__ */ jsxRuntime.jsxs("form", { className: "tecof-ctx-save", onSubmit: handleSaveShared, children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "tecof-ctx-save-label", htmlFor: "tecof-ctx-save-name", children: "Ortak bile\u015Fen ad\u0131" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              id: "tecof-ctx-save-name",
              className: "tecof-ctx-save-input",
              type: "text",
              value: saveName,
              placeholder: "\xD6rn. Kampanya Band\u0131",
              autoFocus: true,
              disabled: saveState === "saving" || saveState === "success",
              onChange: (e) => {
                setSaveName(e.target.value);
                if (saveState === "error") setSaveState("idle");
              }
            }
          ),
          saveState === "error" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-ctx-feedback is-error", role: "alert", children: "Kaydedilemedi, tekrar deneyin." }),
          saveState === "success" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-ctx-feedback is-success", role: "status", children: "Ortak bile\u015Fen kaydedildi." }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-ctx-save-actions", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: "tecof-ctx-btn",
                disabled: saveState === "saving" || saveState === "success",
                onClick: () => {
                  setSavePanelOpen(false);
                  setSaveState("idle");
                },
                children: "Vazge\xE7"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "submit",
                className: "tecof-ctx-btn is-primary",
                disabled: !saveName.trim() || saveState === "saving" || saveState === "success",
                children: saveState === "saving" ? "Kaydediliyor\u2026" : "Kaydet"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          parentId && /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, { size: 14 }),
              label: "\xDCst \xD6\u011Feyi Se\xE7",
              onSelect: handleSelectParent
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CopyPlus, { size: 14 }),
              label: "\xC7o\u011Falt",
              disabled: perms.duplicate === false,
              onSelect: handleDuplicate
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { size: 14 }),
              label: "Kopyala",
              disabled: perms.duplicate === false,
              onSelect: handleCopy
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ClipboardPaste, { size: 14 }),
              label: "Yap\u0131\u015Ft\u0131r",
              disabled: !nodeClipboard,
              onSelect: handlePaste
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Paintbrush, { size: 14 }),
              label: "Stili Kopyala",
              disabled: !hasOwnStyles,
              onSelect: handleCopyStyles
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Paintbrush, { size: 14 }),
              label: "Stili Yap\u0131\u015Ft\u0131r",
              disabled: !styleClipboard || perms.edit === false,
              onSelect: handlePasteStyles
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-ctx-sep", role: "separator" }),
          node.props.sharedComponentId ? (
            // Ortak bağını kopar: sharedComponentId düşer → node bağımsız kopya
            // olur, master ve diğer sayfalar etkilenmez.
            /* @__PURE__ */ jsxRuntime.jsx(
              MenuItem,
              {
                icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Bookmark, { size: 14 }),
                label: "Ortak Ba\u011F\u0131n\u0131 Kopar (Kopyaya \xC7evir)",
                onSelect: () => {
                  updateProps2(menu.nodeId, { sharedComponentId: void 0 });
                  onClose();
                }
              }
            )
          ) : /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Bookmark, { size: 14 }),
              label: "Ortak Bile\u015Fen Olarak Kaydet",
              disabled: !apiClient,
              onSelect: () => setSavePanelOpen(true)
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-ctx-sep", role: "separator" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            MenuItem,
            {
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 14 }),
              label: "Sil",
              danger: true,
              disabled: perms.delete === false,
              onSelect: handleDelete
            }
          )
        ] })
      ]
    }
  );
};
var NodeContextMenu = () => {
  const contextMenu = useUiStore((s) => s.contextMenu);
  const setContextMenu = useUiStore((s) => s.setContextMenu);
  const close = React.useCallback(() => setContextMenu(null), [setContextMenu]);
  if (!contextMenu) return null;
  return /* @__PURE__ */ jsxRuntime.jsx(
    Menu,
    {
      menu: contextMenu,
      onClose: close
    },
    `${contextMenu.nodeId}:${contextMenu.x}:${contextMenu.y}`
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
  const floatingRef = React.useRef(null);
  const [pos, setPos] = React.useState({
    top: -9999,
    left: -9999,
    side: parsePlacement(placement).side
  });
  const update = React.useCallback(() => {
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
  React.useLayoutEffect(() => {
    if (open) update();
  }, [open, update]);
  React.useEffect(() => {
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
  const { apiClient } = chunkFMV4YLE6_js.useTecof();
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor,
    open: true,
    placement: "bottom-end"
  });
  const [collections, setCollections] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [activeSlug, setActiveSlug] = React.useState(null);
  const [query, setQuery] = React.useState("");
  React.useEffect(() => {
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
  React.useEffect(() => {
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
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: floatingRef, className: "tecof-bind-popover", style: floatingStyle, role: "dialog", "aria-label": "CMS verisine ba\u011Fla", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-header", children: active ? /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", className: "tecof-bind-back", onClick: () => {
        setActiveSlug(null);
        setQuery("");
      }, children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronLeft, { size: 14 }),
        " ",
        active.name
      ] }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-bind-title", children: "CMS verisine ba\u011Fla" }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-bind-search", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 13 }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-list", children: loading ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-empty", children: "Y\xFCkleniyor\u2026" }) : error ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-empty", children: error }) : !active ? filteredCollections.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-empty", children: "Koleksiyon yok" }) : filteredCollections.map((col) => /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-bind-item",
          onClick: () => {
            setActiveSlug(col.slug);
            setQuery("");
          },
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Database, { size: 13 }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-bind-item-label", children: col.name }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-bind-item-meta", children: [
              col.fields?.length ?? 0,
              " alan"
            ] })
          ]
        },
        col._id
      )) : filteredFields.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-empty", children: "Alan yok" }) : filteredFields.map((f) => /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-bind-item",
          onClick: () => {
            onInsert(tokenFor(f.shortcode));
            onClose();
          },
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Braces, { size: 13 }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-bind-item-label", children: f.name }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-bind-item-meta", children: f.type })
          ]
        },
        f.shortcode
      )) })
    ] }),
    document.body
  );
};
var CmsBindingButton = ({ onInsert, title = "CMS verisine ba\u011Fla" }) => {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef(null);
  const close = React.useCallback(() => setOpen(false), []);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        ref: btnRef,
        type: "button",
        className: `tecof-bind-btn${open ? " is-active" : ""}`,
        onClick: () => setOpen((o) => !o),
        title,
        "aria-label": title,
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Braces, { size: 14 })
      }
    ),
    open && btnRef.current && /* @__PURE__ */ jsxRuntime.jsx(BindingPopover, { anchor: btnRef.current, onInsert, onClose: close })
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
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const inputRef = React.useRef(null);
  const reqIdRef = React.useRef(0);
  React.useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);
  React.useEffect(() => {
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
  const isSelected = React.useCallback(
    (row) => {
      const mapped = field.mapProp ? field.mapProp(row) : row;
      return deepEqual(mapped, value);
    },
    [field, value]
  );
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cmdk-overlay", onMouseDown: onClose, children: /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "tecof-cmdk-panel",
        role: "dialog",
        "aria-label": field.label || "Veri se\xE7",
        onMouseDown: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cmdk-input-row", children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 16, className: "tecof-cmdk-search-icon" }),
            showSearch ? /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                ref: inputRef,
                type: "text",
                className: "tecof-cmdk-input",
                placeholder: "Ara\u2026",
                value: query,
                onChange: (e) => setQuery(e.target.value)
              }
            ) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-cmdk-input", children: field.label || "Veri se\xE7" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: "tecof-external-reload",
                onClick: () => setReloadKey((k) => k + 1),
                title: "Yenile",
                disabled: loading,
                children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCcw, { size: 14, className: loading ? "tecof-upload-spin" : "" })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: "tecof-external-reload", onClick: onClose, title: "Kapat", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 14 }) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cmdk-list", children: loading ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cmdk-empty", children: "Y\xFCkleniyor\u2026" }) : error ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-external-error", children: [
            /* @__PURE__ */ jsxRuntime.jsx("p", { children: error }),
            /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: () => setReloadKey((k) => k + 1), children: "Tekrar dene" })
          ] }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cmdk-empty", children: "Sonu\xE7 yok" }) : rows.map((row, idx) => {
            const cols = rowColumns(field, row);
            const entries = Object.entries(cols);
            const [firstKey, firstVal] = entries[0] ?? ["", ""];
            const primary = field.getItemSummary ? field.getItemSummary(field.mapProp ? field.mapProp(row) : row) : String(firstVal ?? firstKey);
            const rest = entries.slice(1);
            const selected = isSelected(row);
            return /* @__PURE__ */ jsxRuntime.jsxs(
              "button",
              {
                type: "button",
                className: `tecof-cmdk-item${selected ? " is-active" : ""}`,
                onClick: () => onSelect(row),
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-cmdk-item-icon", children: selected ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { size: 15 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { size: 15 }) }),
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-external-row-text", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-cmdk-item-label", children: primary }),
                    rest.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-external-row-sub", children: rest.map(([k, v]) => `${k}: ${String(v)}`).join(" \xB7 ") })
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
  const [open, setOpen] = React.useState(false);
  const summary = React.useMemo(() => {
    if (value == null) return "";
    return field.getItemSummary ? field.getItemSummary(value) : defaultSummary(value);
  }, [field, value]);
  const handleSelect = (row) => {
    onChange(field.mapProp ? field.mapProp(row) : row);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: field.label || name, children: [
    /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: field.label || name, readOnly, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-external", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-external-trigger",
          disabled: readOnly,
          onClick: () => setOpen(true),
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Database, { size: 14, className: "tecof-icon-muted" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: `tecof-external-summary${summary ? "" : " is-empty"}`, children: summary || field.placeholder || "Veri se\xE7" })
          ]
        }
      ),
      value != null && !readOnly && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: "tecof-external-clear",
          onClick: () => onChange(void 0),
          title: "Temizle",
          "aria-label": "Se\xE7imi temizle",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 13 })
        }
      )
    ] }) }),
    open && /* @__PURE__ */ jsxRuntime.jsx(
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
var stringValue = (value, definition) => {
  if (typeof value === "string") return value;
  if (typeof definition.defaultValue === "string") return definition.defaultValue;
  return "";
};
var FieldRenderer = ({
  name,
  definition,
  value,
  onChange,
  readOnly = false
}) => {
  const [expandedIndices, setExpandedIndices] = React.useState({});
  const label = definition.label || name;
  const type = definition.type;
  if (definition.render) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-field-custom", children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: definition.render({
      field: definition,
      name,
      id: `field-${name}`,
      value,
      onChange,
      readOnly
    }) }) });
  }
  switch (type) {
    case "text": {
      const current2 = stringValue(value, definition);
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-bindable", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            id: `field-${name}`,
            type: "text",
            value: current2,
            disabled: readOnly,
            onChange: (e) => onChange(e.target.value),
            className: "tecof-input-text"
          }
        ),
        !readOnly && definition.bindable !== false && /* @__PURE__ */ jsxRuntime.jsx(CmsBindingButton, { onInsert: (t) => onChange(current2 ? `${current2} ${t}` : t) })
      ] }) });
    }
    case "textarea": {
      const current2 = stringValue(value, definition);
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-bindable is-textarea", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "textarea",
          {
            id: `field-${name}`,
            rows: 4,
            value: current2,
            disabled: readOnly,
            onChange: (e) => onChange(e.target.value),
            className: "tecof-input-textarea"
          }
        ),
        !readOnly && definition.bindable !== false && /* @__PURE__ */ jsxRuntime.jsx(CmsBindingButton, { onInsert: (t) => onChange(current2 ? `${current2} ${t}` : t) })
      ] }) });
    }
    case "select": {
      const options = Array.isArray(definition.options) ? definition.options : [];
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-select-wrap", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "select",
          {
            id: `field-${name}`,
            value: stringValue(value, definition),
            disabled: readOnly,
            onChange: (e) => onChange(e.target.value),
            className: "tecof-input-select",
            children: options.map((opt) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: opt.value, children: opt.label || opt.value }, opt.value))
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-field-select-caret", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { size: 12 }) })
      ] }) });
    }
    case "number": {
      const current2 = typeof value === "number" ? value : typeof definition.defaultValue === "number" ? definition.defaultValue : void 0;
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          id: `field-${name}`,
          type: "number",
          value: current2 !== void 0 ? current2 : "",
          min: definition.min,
          max: definition.max,
          step: definition.step,
          disabled: readOnly,
          onChange: (e) => {
            const val = e.target.value;
            if (val === "") {
              onChange(void 0);
              return;
            }
            const num = Number(val);
            if (!Number.isNaN(num)) onChange(num);
          },
          className: "tecof-input-number"
        }
      ) });
    }
    case "boolean":
    case "toggle": {
      const checked = value === true || value === "true";
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsxs(
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
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-field-switch-track", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-field-switch-thumb" }) }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-field-switch-text", children: checked ? definition.onLabel || "A\xE7\u0131k" : definition.offLabel || "Kapal\u0131" })
          ]
        }
      ) });
    }
    case "range": {
      const min = typeof definition.min === "number" ? definition.min : 0;
      const max = typeof definition.max === "number" ? definition.max : 100;
      const step = typeof definition.step === "number" ? definition.step : 1;
      const current2 = typeof value === "number" ? value : typeof definition.defaultValue === "number" ? definition.defaultValue : min;
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-range", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs("output", { className: "tecof-field-range-value", children: [
          current2,
          definition.unit || ""
        ] })
      ] }) });
    }
    case "radio": {
      const options = Array.isArray(definition.options) ? definition.options : [];
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-field-radio-group", children: options.map((opt) => /* @__PURE__ */ jsxRuntime.jsxs(
        "label",
        {
          className: `tecof-field-radio${readOnly ? " is-readonly" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(
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
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: opt.label || opt.value })
          ]
        },
        opt.value
      )) }) });
    }
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
            const trVal = val.find(
              (v) => typeof v === "object" && v !== null && "value" in v
            );
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
        if (readOnly) return;
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
        setExpandedIndices((prev) => {
          const next = {};
          for (const [key, expanded] of Object.entries(prev)) {
            const i = Number(key);
            if (i < idx) next[i] = expanded;
            else if (i > idx) next[i - 1] = expanded;
          }
          return next;
        });
      };
      const handleMove = (idx, direction) => {
        if (readOnly) return;
        if (direction === "up" && idx === 0) return;
        if (direction === "down" && idx === items.length - 1) return;
        const copy = [...items];
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        const temp = copy[idx];
        copy[idx] = copy[targetIdx];
        copy[targetIdx] = temp;
        onChange(copy);
        setExpandedIndices((prev) => {
          const next = { ...prev };
          const tempExpanded = next[idx];
          next[idx] = next[targetIdx];
          next[targetIdx] = tempExpanded;
          return next;
        });
      };
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-array", children: [
        items.map((item, idx) => {
          const isExpanded = !!expandedIndices[idx];
          const itemLabel = getItemLabel(item, idx);
          return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-array-item", children: [
            /* @__PURE__ */ jsxRuntime.jsxs(
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
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-array-item-title-wrap", children: [
                    isExpanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { size: 14 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { size: 14 }),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-array-item-title", children: itemLabel })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-array-item-actions", onClick: (e) => e.stopPropagation(), children: !readOnly && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleMove(idx, "up"),
                        disabled: idx === 0,
                        className: "tecof-array-btn",
                        title: "Yukar\u0131 ta\u015F\u0131",
                        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowUp, { size: 12 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleMove(idx, "down"),
                        disabled: idx === items.length - 1,
                        className: "tecof-array-btn",
                        title: "A\u015Fa\u011F\u0131 ta\u015F\u0131",
                        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowDown, { size: 12 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleRemove(idx),
                        className: "tecof-array-btn danger",
                        title: "Sil",
                        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 12 })
                      }
                    )
                  ] }) })
                ]
              }
            ),
            isExpanded && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-array-item-body", children: Object.entries(arrayFields).map(([subFieldName, subFieldDef]) => /* @__PURE__ */ jsxRuntime.jsx(
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
                readOnly: readOnly || subFieldDef.readOnly === true
              },
              subFieldName
            )) })
          ] }, idx);
        }),
        !readOnly && /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: handleAdd,
            className: "tecof-add-array-item-btn",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 14 }),
              "\xD6\u011Fe Ekle"
            ]
          }
        )
      ] }) });
    }
    case "object": {
      const objectFields = definition.objectFields || {};
      const objVal = value && typeof value === "object" && !Array.isArray(value) ? value : {};
      return /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-field-object", children: Object.entries(objectFields).map(([subFieldName, subFieldDef]) => /* @__PURE__ */ jsxRuntime.jsx(
        FieldRenderer,
        {
          name: subFieldName,
          definition: subFieldDef,
          value: objVal[subFieldName],
          onChange: (newSubVal) => onChange({ ...objVal, [subFieldName]: newSubVal }),
          readOnly: readOnly || subFieldDef.readOnly === true
        },
        subFieldName
      )) }) });
    }
    case "external":
      return /* @__PURE__ */ jsxRuntime.jsx(
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
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-unsupported", children: [
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
  const [state, setState] = React.useState({
    id: null,
    fields: staticFields,
    readOnly: EMPTY_READONLY
  });
  const lastPropsRef = React.useRef(null);
  const reqIdRef = React.useRef(0);
  React.useEffect(() => {
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
var HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
var toInputHex = (raw) => {
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
  if (/^#[0-9a-f]{8}$/i.test(raw)) return raw.slice(0, 7);
  if (/^#[0-9a-f]{3,4}$/i.test(raw)) {
    const [r2, g, b] = raw.slice(1, 4).split("");
    return `#${r2}${r2}${g}${g}${b}${b}`;
  }
  return "#000000";
};
var findOption = (value) => [...COLOR_SECTIONS.base, ...COLOR_SECTIONS.theme, ...COLOR_SECTIONS.brand].find(
  (o) => o.value === value
);
var describeValue = (value) => {
  if (!value) return { label: "Yok", swatch: null };
  const option = findOption(value);
  if (option) return { label: option.label, swatch: option.swatch ?? option.value };
  const palette = parsePaletteToken(value);
  if (palette) {
    return {
      label: `${palette.hue.label} ${palette.shade}`,
      swatch: tailwindSwatch(palette.hue.name, palette.shade)
    };
  }
  if (isArbitrary(value)) {
    const raw = arbitraryRaw(value);
    return { label: raw, swatch: raw };
  }
  return { label: value, swatch: value };
};
var Swatch = ({
  option,
  active,
  onSelect
}) => {
  const isNone = option.value === "";
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      title: option.label,
      className: `tecof-style-swatch${active ? " is-active" : ""}${isNone ? " is-none" : ""}`,
      style: !isNone ? { "--swatch": option.swatch || option.value } : void 0,
      onClick: () => onSelect(option.value)
    }
  );
};
var ALL_SECTIONS = ["base", "theme", "brand", "palette", "custom"];
var ColorPicker = ({ value, onChange, sections = ALL_SECTIONS }) => {
  const [open, setOpen] = React.useState(false);
  const { label, swatch } = describeValue(value);
  const show = (key) => sections.includes(key);
  const paletteMatch = parsePaletteToken(value);
  const [browsedHue, setBrowsedHue] = React.useState("red");
  const activeHueName = paletteMatch?.hue.name ?? browsedHue;
  const activeHue = TAILWIND_PALETTE.find((h) => h.name === activeHueName) ?? TAILWIND_PALETTE[0];
  const isCustom = isArbitrary(value) && !findOption(value);
  const customRaw = isCustom ? arbitraryRaw(value) : "";
  const [hexDraft, setHexDraft] = React.useState(customRaw);
  const commitHex = (raw) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;
    const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    if (!HEX_RE.test(hex)) {
      setHexDraft(customRaw);
      return;
    }
    setHexDraft(hex);
    onChange(toArbitrary(hex));
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-picker", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        className: `tecof-color-trigger${open ? " is-open" : ""}`,
        "aria-expanded": open,
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "span",
            {
              className: `tecof-style-swatch tecof-color-trigger-swatch${!swatch ? " is-none" : ""}`,
              style: swatch ? { "--swatch": swatch } : void 0
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-color-trigger-label", children: label }),
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { size: 13, className: `tecof-color-trigger-chevron${open ? " is-open" : ""}` })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-panel", children: [
      show("base") && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-section", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-style-swatches", children: COLOR_SECTIONS.base.map((opt) => /* @__PURE__ */ jsxRuntime.jsx(Swatch, { option: opt, active: value === opt.value, onSelect: onChange }, opt.value || "none")) }) }),
      show("theme") && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-section-title", children: "Tema renkleri" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-style-swatches", children: COLOR_SECTIONS.theme.map((opt) => /* @__PURE__ */ jsxRuntime.jsx(Swatch, { option: opt, active: value === opt.value, onSelect: onChange }, opt.value)) })
      ] }),
      show("brand") && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-section-title", children: "Marka (Primary)" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-style-swatches", children: COLOR_SECTIONS.brand.map((opt) => /* @__PURE__ */ jsxRuntime.jsx(Swatch, { option: opt, active: value === opt.value, onSelect: onChange }, opt.value)) })
      ] }),
      show("palette") && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-section-title", children: "Tailwind paleti" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-hues", children: TAILWIND_PALETTE.map((h) => /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            title: h.label,
            className: `tecof-color-hue${activeHueName === h.name ? " is-active" : ""}`,
            style: { "--swatch": tailwindSwatch(h.name, "500") },
            onClick: () => setBrowsedHue(h.name)
          },
          h.name
        )) }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-style-swatches", children: TAILWIND_SHADES.map((shade) => {
          const token = `${activeHue.name}-${shade}`;
          return /* @__PURE__ */ jsxRuntime.jsx(
            Swatch,
            {
              option: { label: `${activeHue.label} ${shade}`, value: token, swatch: tailwindSwatch(activeHue.name, shade) },
              active: value === token,
              onSelect: onChange
            },
            token
          );
        }) })
      ] }),
      show("custom") && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-section-title", children: "\xD6zel renk" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-custom", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              type: "color",
              className: "tecof-color-input",
              "aria-label": "\xD6zel renk se\xE7",
              value: toInputHex(customRaw || (hexDraft && HEX_RE.test(hexDraft) ? hexDraft : "#000000")),
              onChange: (e) => {
                setHexDraft(e.target.value);
                onChange(toArbitrary(e.target.value));
              }
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              type: "text",
              className: "tecof-input tecof-color-hex-input",
              placeholder: "#rrggbb",
              value: hexDraft,
              onChange: (e) => setHexDraft(e.target.value),
              onBlur: (e) => commitHex(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") e.target.blur();
              }
            }
          )
        ] })
      ] })
    ] })
  ] });
};
var FALLBACKS = {
  p: ["p"],
  px: ["px", "p"],
  py: ["py", "p"],
  pt: ["pt", "py", "p"],
  pb: ["pb", "py", "p"],
  pl: ["pl", "px", "p"],
  pr: ["pr", "px", "p"],
  m: ["m"],
  mx: ["mx", "m"],
  my: ["my", "m"],
  mt: ["mt", "my", "m"],
  mb: ["mb", "my", "m"],
  ml: ["ml", "mx", "m"],
  mr: ["mr", "mx", "m"]
};
var SPACING_BOX_IDS = new Set(Object.keys(FALLBACKS));
var display = (v) => v ? arbitraryRaw(v) : "";
var parseSpaceToken = (raw) => {
  const t = raw.trim();
  if (!t) return "";
  if (/^\d+(\.\d+)?$/.test(t)) return t;
  if (isArbitrary(t)) return t;
  return toArbitrary(t);
};
var SpaceCell = ({ id, layer, inherited, onSet }) => {
  const explicit = layer[id] || "";
  let hint = "";
  if (!explicit) {
    for (const key of FALLBACKS[id]) {
      if (layer[key]) {
        hint = display(layer[key]);
        break;
      }
    }
    if (!hint) {
      for (const key of FALLBACKS[id]) {
        if (inherited[key]) {
          hint = display(inherited[key]);
          break;
        }
      }
    }
  }
  const label = CONTROL_BY_ID[id]?.label ?? id;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      type: "text",
      className: `tecof-spacebox-cell${explicit ? " is-set" : ""}`,
      defaultValue: display(explicit),
      placeholder: hint || "\u2013",
      title: `${label} \u2014 \xF6l\xE7ek (0\u201324) veya \xF6zel de\u011Fer (\xF6r. 10px)`,
      spellCheck: false,
      onBlur: (e) => {
        const next = parseSpaceToken(e.target.value);
        if (next !== explicit) onSet(id, next);
      },
      onKeyDown: (e) => {
        const input = e.target;
        if (e.key === "Enter") input.blur();
        if (e.key === "Escape") {
          input.value = display(explicit);
          input.blur();
        }
      }
    },
    explicit
  );
};
var SpacingBox = ({ layer, inherited, onSet }) => {
  const cell = (id) => /* @__PURE__ */ jsxRuntime.jsx(SpaceCell, { id, layer, inherited, onSet });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-spacebox-wrap", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-spacebox", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacebox-tag", children: "margin" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-spacebox-row", children: cell("mt") }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-spacebox-mid", children: [
        cell("ml"),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-spacebox-inner", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacebox-tag", children: "padding" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-spacebox-row", children: cell("pt") }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-spacebox-mid", children: [
            cell("pl"),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-spacebox-core", "aria-hidden": "true" }),
            cell("pr")
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-spacebox-row", children: cell("pb") })
        ] }),
        cell("mr")
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-spacebox-row", children: cell("mb") })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-spacebox-shorthands", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacebox-sh-label", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacebox-sh-head", children: "T\xFCm\xFC" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacebox-sh-head", children: "X" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacebox-sh-head", children: "Y" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacebox-sh-label", children: "Padding" }),
      cell("p"),
      cell("px"),
      cell("py"),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-spacebox-sh-label", children: "Margin" }),
      cell("m"),
      cell("mx"),
      cell("my")
    ] })
  ] });
};
var hasProps = (props) => !!props && Object.values(props).some(Boolean);
var VIEWPORT_TO_BP = {
  desktop: "base",
  tablet: "md",
  mobile: "sm"
};
var BP_TO_VIEWPORT = {
  base: "desktop",
  sm: "mobile",
  md: "tablet",
  lg: "desktop",
  xl: "desktop"
};
var STATE_VARIANTS = ["hover", "focus", "active"];
var bpHasOverrides = (styles, bp) => hasProps(styles[bp]) || STATE_VARIANTS.some(
  (s) => hasProps(styles.states?.[bp === "base" ? s : `${bp}:${s}`])
);
var OverrideBadge = ({ title, inline }) => /* @__PURE__ */ jsxRuntime.jsx(
  "span",
  {
    className: `tecof-style-seg-dot${inline ? " tecof-style-seg-dot--inline" : ""}`,
    title,
    "aria-hidden": "true"
  }
);
var BREAKPOINTS2 = [
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
var TABS = [
  { key: "layout", label: "D\xFCzen", Icon: lucideReact.LayoutGrid, groups: ["layout", "spacing", "sizing"] },
  { key: "text", label: "Metin", Icon: lucideReact.Type, groups: ["typography"] },
  { key: "appearance", label: "G\xF6r\xFCn\xFCm", Icon: lucideReact.Paintbrush, groups: ["background", "border", "effects"] }
];
var panelUi = {
  tab: "layout",
  open: {
    layout: true,
    spacing: true,
    sizing: false,
    typography: true,
    background: true,
    border: true,
    effects: false
  }
};
var valueLabel = (control, value) => control.options.find((o) => o.value === value)?.label ?? arbitraryRaw(value);
var StyleEditor = ({ value, onChange }) => {
  const styles = value || {};
  const [bp, setBp] = React.useState(
    () => VIEWPORT_TO_BP[useEditorStore.getState().viewport]
  );
  const [state, setState] = React.useState("base");
  const setViewport = useEditorStore((s) => s.setViewport);
  const syncingViewportRef = React.useRef(false);
  const bpRef = React.useRef(bp);
  bpRef.current = bp;
  React.useEffect(
    () => useEditorStore.subscribe((cur, prev) => {
      if (cur.viewport === prev.viewport) return;
      if (syncingViewportRef.current) return;
      if (BP_TO_VIEWPORT[bpRef.current] === cur.viewport) return;
      setBp(VIEWPORT_TO_BP[cur.viewport]);
    }),
    []
  );
  const selectBp = (next) => {
    setBp(next);
    const target = BP_TO_VIEWPORT[next];
    if (useEditorStore.getState().viewport !== target) {
      syncingViewportRef.current = true;
      setViewport(target);
      syncingViewportRef.current = false;
    }
  };
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
  const clearLayer = () => {
    if (state === "base") {
      onChange({ ...styles, [bp]: {} });
    } else {
      onChange({ ...styles, states: { ...styles.states, [stateKey]: {} } });
    }
  };
  const [tab, setTabState] = React.useState(panelUi.tab);
  const [openGroups, setOpenGroups] = React.useState(panelUi.open);
  const setTab = (next) => {
    panelUi.tab = next;
    setTabState(next);
  };
  const toggleGroup = (group) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [group]: !prev[group] };
      panelUi.open = next;
      return next;
    });
  };
  const jumpToControl = (control) => {
    const target = TABS.find((t) => t.groups.includes(control.group));
    if (!target) return;
    setTab(target.key);
    setOpenGroups((prev) => {
      const next = { ...prev, [control.group]: true };
      panelUi.open = next;
      return next;
    });
  };
  const activeControls = STYLE_CONTROLS.filter((c) => layer[c.id]);
  const groupSetCount = (group) => activeControls.filter((c) => c.group === group).length;
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-style-editor", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-style-editor-head", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-style-editor-title", children: "Stil" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-style-editor-actions", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            className: "tecof-style-head-btn",
            title: "Stili kopyala",
            "aria-label": "Stili kopyala",
            disabled: isEmptyStyles(styles),
            onClick: () => setStyleClipboard(cloneStyles(styles)),
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { size: 13 })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            className: "tecof-style-head-btn",
            title: "Stili yap\u0131\u015Ft\u0131r",
            "aria-label": "Stili yap\u0131\u015Ft\u0131r",
            disabled: !styleBuffer,
            onClick: () => styleBuffer && onChange(cloneStyles(styleBuffer)),
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ClipboardPaste, { size: 13 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-style-scopes", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-style-seg", role: "group", "aria-label": "Breakpoint", children: BREAKPOINTS2.map((b) => {
        const overridden = bpHasOverrides(styles, b.key);
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            className: `tecof-style-seg-btn${bp === b.key ? " is-active" : ""}`,
            onClick: () => selectBp(b.key),
            children: [
              b.label,
              overridden && /* @__PURE__ */ jsxRuntime.jsx(OverrideBadge, { title: "Bu k\u0131r\u0131l\u0131mda \xF6zelle\u015Ftirildi" })
            ]
          },
          b.key
        );
      }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-style-seg", role: "group", "aria-label": "Durum", children: STATES.map((s) => {
        const overridden = s.key === "base" ? BREAKPOINTS2.some((b) => hasProps(styles[b.key])) : hasProps(styles.states?.[bp === "base" ? s.key : `${bp}:${s.key}`]);
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            className: `tecof-style-seg-btn${state === s.key ? " is-active" : ""}`,
            onClick: () => setState(s.key),
            children: [
              s.label,
              overridden && /* @__PURE__ */ jsxRuntime.jsx(OverrideBadge, { title: "Bu durumda \xF6zelle\u015Ftirildi" })
            ]
          },
          s.key
        );
      }) })
    ] }),
    activeControls.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-style-chips", children: [
      activeControls.map((control) => /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-style-chip", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            className: "tecof-style-chip-label",
            title: `${control.label}: ${valueLabel(control, layer[control.id])} \u2014 kontrole git`,
            onClick: () => jumpToControl(control),
            children: [
              control.label,
              ": ",
              valueLabel(control, layer[control.id])
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            className: "tecof-style-chip-x",
            title: "Bu stili kald\u0131r",
            "aria-label": `${control.label} stilini kald\u0131r`,
            onClick: () => setLayerValue(control.id, ""),
            children: "\xD7"
          }
        )
      ] }, control.id)),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-style-chip-clear",
          title: "Bu katmandaki (k\u0131r\u0131l\u0131m + durum) t\xFCm stilleri temizle",
          onClick: clearLayer,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eraser, { size: 12 }),
            "Temizle"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-style-tabs", role: "tablist", "aria-label": "Stil kategorileri", children: TABS.map(({ key, label, Icon, groups }) => {
      const hasOverride = groups.some((g) => groupSetCount(g) > 0);
      return /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": tab === key,
          className: `tecof-style-tab${tab === key ? " is-active" : ""}`,
          onClick: () => setTab(key),
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: 13 }),
            label,
            hasOverride && /* @__PURE__ */ jsxRuntime.jsx(OverrideBadge, { title: "Bu sekmede \xF6zelle\u015Ftirme var" })
          ]
        },
        key
      );
    }) }),
    activeTab.groups.map((group) => {
      const controls = STYLE_CONTROLS.filter(
        (c) => c.group === group && !(group === "spacing" && SPACING_BOX_IDS.has(c.id))
      );
      const count = groupSetCount(group);
      const isOpen = openGroups[group];
      return /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "tecof-style-acc", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            className: "tecof-style-acc-head",
            "aria-expanded": isOpen,
            onClick: () => toggleGroup(group),
            children: [
              isOpen ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { size: 13 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { size: 13 }),
              GROUP_LABELS[group],
              count > 0 && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-style-acc-count", title: "Bu katmanda ayarl\u0131 stil say\u0131s\u0131", children: count })
            ]
          }
        ),
        isOpen && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-style-acc-body", children: [
          group === "spacing" && /* @__PURE__ */ jsxRuntime.jsx(
            SpacingBox,
            {
              layer,
              inherited: inheritedLayer,
              onSet: setLayerValue
            },
            `${bp}:${state}`
          ),
          controls.map((control) => /* @__PURE__ */ jsxRuntime.jsx(
            ControlRow,
            {
              control,
              value: layer[control.id] || "",
              inherited: inheritedLayer[control.id],
              onChange: (v) => setLayerValue(control.id, v)
            },
            `${bp}:${state}:${control.id}`
          ))
        ] })
      ] }, group);
    })
  ] });
};
var ControlRow = ({
  control,
  value,
  inherited,
  onChange
}) => {
  const isColor = control.type === "color";
  const supportsArbitrary = !!control.arbitraryPrefix && !isColor;
  const matchesOption = control.options.some((o) => o.value === value);
  const valueIsArbitrary = supportsArbitrary && isArbitrary(value) && !matchesOption;
  const [customOpen, setCustomOpen] = React.useState(valueIsArbitrary);
  const inheritedOption = inherited ? control.options.find((o) => o.value === inherited) : void 0;
  const inheritedLabel = inherited ? inheritedOption?.label ?? arbitraryRaw(inherited) : "";
  const custom = customOpen || valueIsArbitrary;
  const presetValue = valueIsArbitrary ? "" : value;
  const commitCustom = (raw) => {
    const trimmed = raw.trim();
    onChange(trimmed ? toArbitrary(trimmed) : "");
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `tecof-style-row${value ? " is-active" : ""}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-style-label", children: [
      control.label,
      value && /* @__PURE__ */ jsxRuntime.jsx(OverrideBadge, { inline: true, title: "Bu katmanda \xF6zelle\u015Ftirildi" }),
      !value && inheritedLabel && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-style-inherited", title: `Devral\u0131nan de\u011Fer: ${inheritedLabel}`, children: inheritedLabel })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-style-control", children: [
      control.type === "color" ? /* @__PURE__ */ jsxRuntime.jsx(ColorPicker, { value, onChange, sections: control.colorSections }) : control.type === "segment" ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-style-seg", children: control.options.map((opt) => /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: `tecof-style-seg-btn${presetValue === opt.value ? " is-active" : ""}`,
          onClick: () => onChange(opt.value),
          children: opt.label
        },
        opt.value || "none"
      )) }) : /* @__PURE__ */ jsxRuntime.jsx(
        "select",
        {
          className: "tecof-input-select tecof-style-select",
          value: presetValue,
          onChange: (e) => onChange(e.target.value),
          children: control.options.map((opt) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: opt.value, children: opt.label }, opt.value || "none"))
        }
      ),
      supportsArbitrary && /* @__PURE__ */ jsxRuntime.jsx(
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
    supportsArbitrary && custom && /* @__PURE__ */ jsxRuntime.jsx(
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
    const r2 = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== void 0 ? parseFloat(rgbaMatch[4]) : 1;
    const hex = `#${[r2, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
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
var rgbToHex = ({ r: r2, g, b }) => "#" + [r2, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0")).join("");
var rgbToHsv = ({ r: r2, g, b }) => {
  const rn = r2 / 255, gn = g / 255, bn = b / 255;
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
  let r2 = 0, g = 0, b = 0;
  if (h < 60) {
    r2 = c;
    g = x;
  } else if (h < 120) {
    r2 = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r2 = x;
    b = c;
  } else {
    r2 = c;
    b = x;
  }
  return { r: Math.round((r2 + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
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
  const recent = React.useRef(readRecent()).current;
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor,
    open: true,
    placement: "bottom-start"
  });
  const [hsv, setHsv] = React.useState(initialHsv);
  const [alpha, setAlpha] = React.useState(initialAlpha);
  const update = React.useCallback(
    (nextHsv, nextAlpha) => {
      setHsv(nextHsv);
      setAlpha(nextAlpha);
      onChange(nextHsv, nextAlpha);
    },
    [onChange]
  );
  const rgb = hsvToRgb(hsv);
  const hueColor = rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }));
  React.useEffect(() => {
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
  const pickHex = React.useCallback(
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
  const pickEyeDropper = React.useCallback(async () => {
    try {
      const ed = new window.EyeDropper();
      const res = await ed.open();
      if (res?.sRGBHex) pickHex(res.sRGBHex);
    } catch {
    }
  }, [pickHex]);
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        ref: floatingRef,
        className: "tecof-color-popover",
        style: floatingStyle,
        role: "dialog",
        "aria-label": "Renk se\xE7ici",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
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
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-sv-white" }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-sv-black" }),
                /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-sliders", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
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
                children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-track-thumb", style: { left: `${hsv.h / 360 * 100}%` } })
              }
            ),
            showOpacity && /* @__PURE__ */ jsxRuntime.jsxs(
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
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "div",
                    {
                      className: "tecof-color-alpha-fill",
                      style: { background: `linear-gradient(to right, transparent, ${rgbToHex(rgb)})` }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-track-thumb", style: { left: `${alpha * 100}%` } })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-swatch-row", children: [
            EYEDROPPER_SUPPORTED && /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: "tecof-color-eyedropper",
                onClick: pickEyeDropper,
                title: "Ekrandan renk se\xE7",
                children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pipette, { size: 14 })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-swatches", children: swatches.map((sw) => /* @__PURE__ */ jsxRuntime.jsx(
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
          recent.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-recent", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-color-recent-label", children: "Son kullan\u0131lan" }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-color-swatches", children: recent.map((sw) => /* @__PURE__ */ jsxRuntime.jsx(
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
  const [hexInput, setHexInput] = React.useState(() => toHex(value || ""));
  const [open, setOpen] = React.useState(false);
  const swatchRef = React.useRef(null);
  const lastEmitted = React.useRef("");
  React.useEffect(() => {
    const hex = toHex(value || "");
    if (hex.toLowerCase() === lastEmitted.current.toLowerCase()) return;
    setHexInput(hex);
  }, [value]);
  const currentHex = normalizeHex(hexInput);
  const isValid = !hexInput || isValidHex(currentHex);
  const rgb = isValid && currentHex ? hexToRgb(currentHex) : null;
  const hsv = rgb ? rgbToHsv(rgb) : { h: 0, s: 0, v: 0 };
  const alpha = hexAlpha(currentHex);
  const emit2 = React.useCallback(
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
  const handlePopoverChange = React.useCallback(
    (nextHsv, nextAlpha) => emit2(hsvToRgb(nextHsv), nextAlpha),
    [emit2]
  );
  const handlePickHex = React.useCallback(
    (hex) => {
      const parsed = hexToRgb(hex);
      if (parsed) emit2(parsed, showOpacity ? hexAlpha(hex) : 1);
    },
    [emit2, showOpacity]
  );
  const handleHexChange = React.useCallback(
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
  const handleHexBlur = React.useCallback(() => {
    if (hexInput && !isValidHex(normalizeHex(hexInput))) {
      setHexInput(value || "");
    } else if (hexInput) {
      pushRecent(hexInput);
    }
  }, [hexInput, value]);
  const handleReset = React.useCallback(() => {
    lastEmitted.current = defaultColor;
    setHexInput(defaultColor);
    onChange(defaultColor);
  }, [defaultColor, onChange]);
  const closePopover = React.useCallback(() => {
    setOpen(false);
    if (hexInput) pushRecent(hexInput);
  }, [hexInput]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-container", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-color-preview-row", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          ref: swatchRef,
          type: "button",
          className: `tecof-color-swatch${open ? " focused" : ""}`,
          disabled: readOnly,
          onClick: () => !readOnly && setOpen((o) => !o),
          title: "Renk se\xE7ici",
          children: /* @__PURE__ */ jsxRuntime.jsx(
            "span",
            {
              className: "tecof-color-swatch-fill",
              style: { background: rgb ? cssColor(rgb, alpha) : "transparent" }
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
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
      !readOnly && showReset && hexInput && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: "tecof-color-action-btn",
          onClick: handleReset,
          title: "S\u0131f\u0131rla",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RotateCcw, { size: 14 })
        }
      )
    ] }),
    open && !readOnly && swatchRef.current && /* @__PURE__ */ jsxRuntime.jsx(
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
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
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
var NumberRow = ({ label, value, onChange }) => /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "tecof-theme-row", children: [
  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-theme-row-label", children: label }),
  /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      type: "number",
      className: "tecof-theme-num",
      value: Number.isFinite(value) ? value : 0,
      onChange: (e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))
    }
  )
] });
var TextRow = ({ label, value, onChange }) => /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "tecof-theme-row tecof-theme-row-stack", children: [
  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-theme-row-label", children: label }),
  /* @__PURE__ */ jsxRuntime.jsx(
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
  const { config } = useStudio();
  const theme = resolveTheme(rootProps, config.theme);
  const patch = (next) => setRootProps2({ [THEME_PROP]: next });
  const setColor = (key, value) => patch({ ...theme, colors: { ...theme.colors, [key]: value } });
  const setSpacing = (key, value) => patch({ ...theme, spacing: { ...theme.spacing, [key]: value } });
  const setTypography = (key, value) => patch({ ...theme, typography: { ...theme.typography, [key]: value } });
  const resetTheme = () => setRootProps2({ [THEME_PROP]: void 0 });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-theme-editor", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-theme-section", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-theme-section-title", children: "Renkler" }),
      COLOR_FIELDS.map(({ key, label }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-theme-row", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-theme-row-label", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-theme-color", children: /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-theme-section", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-theme-section-title", children: "Tipografi" }),
      /* @__PURE__ */ jsxRuntime.jsx(TextRow, { label: "Yaz\u0131 tipi", value: theme.typography.fontFamily, onChange: (v) => setTypography("fontFamily", v) }),
      /* @__PURE__ */ jsxRuntime.jsx(TextRow, { label: "Ba\u015Fl\u0131k yaz\u0131 tipi", value: theme.typography.headingFontFamily, onChange: (v) => setTypography("headingFontFamily", v) }),
      /* @__PURE__ */ jsxRuntime.jsx(NumberRow, { label: "Temel boyut (px)", value: theme.typography.baseFontSize, onChange: (v) => setTypography("baseFontSize", v) }),
      /* @__PURE__ */ jsxRuntime.jsx(NumberRow, { label: "Sat\u0131r y\xFCksekli\u011Fi", value: theme.typography.lineHeight, onChange: (v) => setTypography("lineHeight", v) }),
      /* @__PURE__ */ jsxRuntime.jsx(NumberRow, { label: "Kal\u0131nl\u0131k \u2014 normal", value: theme.typography.fontWeightNormal, onChange: (v) => setTypography("fontWeightNormal", v) }),
      /* @__PURE__ */ jsxRuntime.jsx(NumberRow, { label: "Kal\u0131nl\u0131k \u2014 orta", value: theme.typography.fontWeightMedium, onChange: (v) => setTypography("fontWeightMedium", v) }),
      /* @__PURE__ */ jsxRuntime.jsx(NumberRow, { label: "Kal\u0131nl\u0131k \u2014 kal\u0131n", value: theme.typography.fontWeightBold, onChange: (v) => setTypography("fontWeightBold", v) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-theme-section", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-theme-section-title", children: "Bo\u015Fluk & K\xF6\u015Fe" }),
      SPACING_FIELDS.map(({ key, label }) => /* @__PURE__ */ jsxRuntime.jsx(NumberRow, { label, value: theme.spacing[key], onChange: (v) => setSpacing(key, v) }, key))
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: "tecof-theme-reset", onClick: resetTheme, children: "Temay\u0131 varsay\u0131lana s\u0131f\u0131rla" })
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
  const [tab, setTab] = React.useState("content");
  const [rootTab, setRootTab] = React.useState("page");
  const activeNodeInfo = React.useMemo(() => {
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
  const editableFields = React.useMemo(
    () => Object.entries(resolved.fields).filter(
      ([, fieldDef]) => fieldDef?.type !== "slot"
    ),
    [resolved.fields]
  );
  if (selectedId) {
    if (!activeNodeInfo) {
      return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-inspector", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-inspector-empty", children: "Bile\u015Fen y\xFCkleniyor veya bulunamad\u0131." }) });
    }
    const { node, label } = activeNodeInfo;
    const parentId = getParentId(documentState, selectedId);
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector-header", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "tecof-inspector-title", children: label }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-inspector-id", children: selectedId })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector-header-actions", children: [
          parentId && /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              onClick: () => selectNode(parentId),
              className: "tecof-inspector-deselect",
              title: "\xDCst \xF6\u011Feyi se\xE7",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, { size: 12, "aria-hidden": "true" }),
                "\xDCst \xD6\u011Fe"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => selectNode(null), className: "tecof-inspector-deselect", children: "Se\xE7imi Kald\u0131r" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector-tabs", role: "tablist", "aria-label": "Inspector g\xF6r\xFCn\xFCm\xFC", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx(
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
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector-fields", children: [
        fieldsReadOnly && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector-readonly-note", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Lock, { size: 12, "aria-hidden": "true" }),
          "Salt okunur \u2014 bu bile\u015Fen d\xFCzenlemeye kilitli."
        ] }),
        tab === "style" ? /* @__PURE__ */ jsxRuntime.jsx(
          StyleEditor,
          {
            value: node.props[STYLES_PROP],
            onChange: (next) => updateProps2(selectedId, { [STYLES_PROP]: next })
          }
        ) : editableFields.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-inspector-empty-fields", children: "Bu bile\u015Fenin d\xFCzenlenebilir alan\u0131 bulunmuyor." }) : editableFields.map(([fieldName, fieldDef]) => /* @__PURE__ */ jsxRuntime.jsx(
          FieldRenderer,
          {
            name: fieldName,
            definition: fieldDef,
            value: node.props[fieldName],
            onChange: (newVal) => updateProps2(selectedId, { [fieldName]: newVal }),
            readOnly: fieldsReadOnly || resolved.readOnly[fieldName] === true || fieldDef?.readOnly === true
          },
          fieldName
        ))
      ] })
    ] });
  }
  const rootFields = config.root?.fields || {};
  const rootFieldEntries = Object.entries(rootFields);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-inspector-header", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "tecof-inspector-title", children: "Sayfa Ayarlar\u0131" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-inspector-id", children: "Genel sayfa konfig\xFCrasyonu" })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector-tabs", role: "tablist", "aria-label": "Sayfa g\xF6r\xFCn\xFCm\xFC", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
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
      /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-inspector-fields", children: rootTab === "theme" ? /* @__PURE__ */ jsxRuntime.jsx(ThemeEditor, {}) : rootFieldEntries.length > 0 ? rootFieldEntries.map(([fieldName, fieldDef]) => /* @__PURE__ */ jsxRuntime.jsx(
      FieldRenderer,
      {
        name: fieldName,
        definition: fieldDef,
        value: documentState.root.props[fieldName],
        onChange: (newVal) => setRootProps2({ [fieldName]: newVal }),
        readOnly
      },
      fieldName
    )) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-inspector-empty", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
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
            /* @__PURE__ */ jsxRuntime.jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
            /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 3v18" })
          ]
        }
      ),
      "Bile\u015Fen se\xE7ilmedi. D\xFCzenlemek istedi\u011Finiz bir bile\u015Fene t\u0131klay\u0131n."
    ] }) })
  ] });
};

// src/studio/language/translationCoverage.ts
var isPlainObject2 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var isLocalizedArray = (v) => Array.isArray(v) && v.length > 0 && v.every(
  (el) => isPlainObject2(el) && typeof el.code === "string" && "value" in el
);
var isSlotArray = (v) => Array.isArray(v) && v.length > 0 && v.every(
  (el) => isPlainObject2(el) && typeof el.type === "string" && isPlainObject2(el.props)
);
var isEmptyLocalizedValue = (value) => {
  if (value === null || value === void 0) return true;
  if (typeof value === "string") {
    return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim() === "";
  }
  return false;
};
var missingLanguagesFor = (entries, languages) => {
  const filled = /* @__PURE__ */ new Set();
  for (const entry of entries) {
    if (!isEmptyLocalizedValue(entry.value)) filled.add(entry.code);
  }
  if (languages.every((code) => !filled.has(code))) return null;
  const missing = languages.filter((code) => !filled.has(code));
  return missing.length > 0 ? missing : null;
};
var walkValue = (value, nodeId, path, languages, acc) => {
  if (isLocalizedArray(value)) {
    const missing = missingLanguagesFor(value, languages);
    if (missing) {
      acc.gaps.push({ nodeId, propName: path, missing });
      acc.total += missing.length;
      for (const code of missing) {
        acc.missingByLang[code] = (acc.missingByLang[code] ?? 0) + 1;
      }
    }
    return;
  }
  if (isSlotArray(value)) return;
  if (Array.isArray(value)) {
    value.forEach((el, i) => walkValue(el, nodeId, `${path}[${i}]`, languages, acc));
    return;
  }
  if (isPlainObject2(value)) {
    for (const [key, nested] of Object.entries(value)) {
      walkValue(nested, nodeId, path ? `${path}.${key}` : key, languages, acc);
    }
  }
};
var walkNode = (node, languages, acc) => {
  const { id, ...rest } = node.props;
  const nodeId = typeof id === "string" ? id : "(bilinmeyen)";
  for (const [key, value] of Object.entries(rest)) {
    walkValue(value, nodeId, key, languages, acc);
  }
};
var collectTranslationGaps = (doc, languages) => {
  const acc = { total: 0, missingByLang: {}, gaps: [] };
  if (!doc || languages.length <= 1) return acc;
  for (const [key, value] of Object.entries(doc.root?.props ?? {})) {
    walkValue(value, "root", key, languages, acc);
  }
  for (const node of doc.content ?? []) {
    walkNode(node, languages, acc);
  }
  for (const zoneNodes of Object.values(doc.zones ?? {})) {
    for (const node of zoneNodes) {
      walkNode(node, languages, acc);
    }
  }
  return acc;
};
var trLanguageNames = (() => {
  try {
    return new Intl.DisplayNames(["tr"], { type: "language" });
  } catch {
    return null;
  }
})();
var langNameTr = (code) => {
  try {
    return trLanguageNames?.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};
var LanguageSwitcher = () => {
  const lang = chunkA2KHM342_js.useActiveLanguage();
  const document2 = useEditorStore((state) => state.document);
  const languages = lang?.languages;
  const coverage = React.useMemo(() => {
    if (!languages || languages.length <= 1) return null;
    return collectTranslationGaps(document2, languages);
  }, [document2, languages]);
  if (!lang || lang.languages.length <= 1) return null;
  const missingByLang = coverage?.missingByLang ?? {};
  const totalMissing = coverage?.total ?? 0;
  const badgeTitle = lang.languages.filter((code) => (missingByLang[code] ?? 0) > 0).map((code) => `${missingByLang[code]} alan\u0131n ${langNameTr(code)} \xE7evirisi eksik`).join(", ");
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-lang-switcher", title: "D\xFCzenlenen dil", children: [
    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Globe, { size: 14, className: "tecof-lang-switcher-icon" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "select",
      {
        className: "tecof-lang-switcher-select",
        value: lang.activeLanguage,
        onChange: (e) => lang.setActiveLanguage(e.target.value),
        "aria-label": "D\xFCzenlenen dil",
        children: lang.languages.map((code) => {
          const missing = missingByLang[code] ?? 0;
          return /* @__PURE__ */ jsxRuntime.jsxs("option", { value: code, children: [
            code.toUpperCase(),
            code === lang.defaultLanguage ? " \u2022 Varsay\u0131lan" : "",
            missing > 0 ? ` \xB7 ${missing} eksik` : ""
          ] }, code);
        })
      }
    ),
    totalMissing > 0 && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-lang-switcher-badge", title: badgeTitle, children: totalMissing }),
    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { size: 12, className: "tecof-lang-switcher-caret" })
  ] });
};
var TopBar = ({ onSave, saving, saveStatus, dirty, autoSave, embedded }) => {
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-topbar", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-topbar-group", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: toggleLeftPanel,
          className: `tecof-icon-btn${leftPanelOpen ? " is-active" : ""}`,
          title: "Sol paneli a\xE7/kapat",
          "aria-pressed": leftPanelOpen,
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelLeft, { size: 16 })
        }
      ),
      !embedded && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-topbar-title", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Sayfa D\xFCzenleyici" }),
        saveStatus === "success" && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-topbar-saved", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { size: 12 }),
          " Kaydedildi"
        ] }),
        dirty && !saving && saveStatus !== "success" && /* @__PURE__ */ jsxRuntime.jsxs(
          "span",
          {
            className: "tecof-topbar-dirty",
            title: autoSave ? "De\u011Fi\u015Fiklikler otomatik kaydedilecek" : "Kaydedilmemi\u015F de\u011Fi\u015Fiklikler var",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-topbar-dirty-dot" }),
              autoSave ? "Kaydedilecek\u2026" : "Kaydedilmedi"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-topbar-group", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-topbar-viewports", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => setViewport("desktop"),
            className: `tecof-vp-btn${viewport === "desktop" ? " is-active" : ""}`,
            title: "Masa\xFCst\xFC",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Monitor, { size: 16 })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => setViewport("tablet"),
            className: `tecof-vp-btn${viewport === "tablet" ? " is-active" : ""}`,
            title: "Tablet",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Tablet, { size: 16 })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => setViewport("mobile"),
            className: `tecof-vp-btn${viewport === "mobile" ? " is-active" : ""}`,
            title: "Mobil",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Smartphone, { size: 16 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-topbar-divider" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-mode-toggle", role: "group", "aria-label": "D\xFCzenleme modu", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setMode("edit"),
            className: `tecof-mode-btn${mode === "edit" ? " is-active" : ""}`,
            title: "D\xFCzenleme: bile\u015Fenleri se\xE7 ve d\xFCzenle",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pencil, { size: 14 }),
              " D\xFCzenle"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setMode("preview"),
            className: `tecof-mode-btn${mode === "preview" ? " is-active" : ""}`,
            title: "\xD6nizleme: link ve butonlar \xE7al\u0131\u015F\u0131r",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { size: 14 }),
              " \xD6nizle"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-topbar-group", children: [
      /* @__PURE__ */ jsxRuntime.jsx(LanguageSwitcher, {}),
      !embedded && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-topbar-undoredo", children: [
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: undo, disabled: pastCount === 0, className: "tecof-icon-btn", title: "Geri Al", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Undo2, { size: 16 }) }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: redo, disabled: futureCount === 0, className: "tecof-icon-btn", title: "Yinele", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Redo2, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-topbar-divider" }),
        /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", onClick: onSave, disabled: saving, className: "tecof-btn-primary", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Save, { size: 14 }),
          saving ? "Kaydediliyor..." : "Taslak Kaydet"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: toggleRightPanel,
          className: `tecof-icon-btn${rightPanelOpen ? " is-active" : ""}`,
          title: "Sa\u011F paneli a\xE7/kapat",
          "aria-pressed": rightPanelOpen,
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelRight, { size: 16 })
        }
      )
    ] })
  ] });
};
var getLayerRowStyle = (depth) => ({ "--tecof-layer-indent": `${depth * 12 + 8}px` });
var getLayerZoneStyle = (depth) => ({ "--tecof-layer-zone-indent": `${(depth + 1) * 12 + 14}px` });
var isInsideSubtree = (doc, ancestorId, id) => {
  let current2 = getParentId(doc, id);
  while (current2) {
    if (current2 === ancestorId) return true;
    current2 = getParentId(doc, current2);
  }
  return false;
};
var focusSiblingRow = (current2, delta) => {
  const root = current2.closest(".tecof-layers");
  if (!root) return;
  const rows = Array.from(root.querySelectorAll(".tecof-layer-row"));
  rows[rows.indexOf(current2) + delta]?.focus();
};
var TreeNode = ({ node, depth }) => {
  const { config } = useStudio();
  const documentState = useEditorStore((state) => state.document);
  const isSelected = useEditorStore(
    (state) => state.selection.selectedIds.includes(node.props.id)
  );
  const isPrimary = useEditorStore((state) => state.selection.selectedId === node.props.id);
  const selectNode = useEditorStore((state) => state.selectNode);
  const toggleSelect = useEditorStore((state) => state.toggleSelect);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const removeNode2 = useEditorStore((state) => state.removeNode);
  const removeNodes2 = useEditorStore((state) => state.removeNodes);
  const duplicateNode2 = useEditorStore((state) => state.duplicateNode);
  const updateProps2 = useEditorStore((state) => state.updateProps);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);
  const [expanded, setExpanded] = React.useState(true);
  const [dragOverPos, setDragOverPos] = React.useState(null);
  const [renaming, setRenaming] = React.useState(false);
  const renameCancelledRef = React.useRef(false);
  const rowRef = React.useRef(null);
  const componentConfig = config.components[node.type];
  const label = componentConfig?.label || node.type;
  const customName = typeof node.props._layerName === "string" ? node.props._layerName : "";
  const displayLabel = customName || label;
  const perms = usePermissions(node.props.id);
  React.useEffect(() => {
    if (isPrimary) rowRef.current?.scrollIntoView({ block: "nearest" });
  }, [isPrimary]);
  const childZoneKeys = Object.keys(documentState.zones).filter(
    (key) => key.startsWith(`${node.props.id}:`)
  );
  const hasChildren = childZoneKeys.some(
    (key) => (documentState.zones[key] || []).length > 0
  );
  const insideZoneKey = childZoneKeys[0];
  const getDragInfo2 = (e) => {
    const stored = useEditorStore.getState().drag;
    const fromEvent = readDragData(e);
    return {
      draggedId: fromEvent.nodeId || stored?.id || null,
      draggedType: fromEvent.type || stored?.type || null
    };
  };
  const isDropAllowed = (e, pos) => {
    const { draggedId, draggedType: typeFromPayload } = getDragInfo2(e);
    if (draggedId && draggedId === node.props.id) return false;
    const doc = useEditorStore.getState().document;
    if (draggedId && isInsideSubtree(doc, draggedId, node.props.id)) return false;
    const targetZoneKey = pos === "inside" ? insideZoneKey : findNodeById(doc, node.props.id)?.path.zoneKey;
    let draggedType = typeFromPayload;
    if (!draggedType && draggedId) {
      draggedType = findNodeById(doc, draggedId)?.node.type ?? null;
    }
    if (!draggedType) return true;
    return isValidDrop(config, draggedType, targetZoneKey, doc);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    let pos;
    if (insideZoneKey && relativeY > rect.height / 3 && relativeY < rect.height * 2 / 3) {
      pos = "inside";
    } else {
      pos = relativeY < rect.height / 2 ? "top" : "bottom";
    }
    if (!isDropAllowed(e, pos)) {
      e.dataTransfer.dropEffect = "none";
      setDragOverPos(null);
      return;
    }
    setDragOverPos(pos);
  };
  const handleDragLeave = () => {
    setDragOverPos(null);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const position = dragOverPos;
    setDragOverPos(null);
    if (!position) return;
    const { draggedId } = getDragInfo2(e);
    if (!draggedId || draggedId === node.props.id) return;
    if (!isDropAllowed(e, position)) return;
    const doc = useEditorStore.getState().document;
    if (position === "inside" && insideZoneKey) {
      const items = doc.zones[insideZoneKey] || [];
      useEditorStore.getState().moveNode(draggedId, insideZoneKey, items.length);
      setExpanded(true);
      return;
    }
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
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      focusSiblingRow(e.currentTarget, e.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (e.key === "ArrowRight" && hasChildren && !expanded) {
      e.preventDefault();
      setExpanded(true);
      return;
    }
    if (e.key === "ArrowLeft" && hasChildren && expanded) {
      e.preventDefault();
      setExpanded(false);
      return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && isSelected) {
      const ids = useEditorStore.getState().selection.selectedIds;
      if (ids.length > 1) {
        e.preventDefault();
        removeNodes2(ids);
      } else if (perms.delete !== false) {
        e.preventDefault();
        removeNode2(node.props.id);
      }
    }
  };
  const commitRename = (raw) => {
    setRenaming(false);
    if (renameCancelledRef.current) {
      renameCancelledRef.current = false;
      return;
    }
    const next = raw.trim();
    updateProps2(node.props.id, { _layerName: next && next !== label ? next : "" });
  };
  const RowIcon = hasChildren ? lucideReact.Layout : lucideReact.Box;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-layer-node", children: [
    dragOverPos === "top" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-drop-line sm" }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        ref: rowRef,
        draggable: perms.drag !== false && !renaming,
        onDragStart: (e) => {
          writeDragData(e, { nodeId: node.props.id });
          e.dataTransfer.effectAllowed = "move";
          setDragGhost(e, displayLabel);
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
        className: `tecof-layer-row${isSelected ? " is-selected" : ""}${dragOverPos === "inside" ? " is-drop-inside" : ""}`,
        role: "treeitem",
        tabIndex: 0,
        "aria-selected": isSelected,
        "aria-expanded": hasChildren ? expanded : void 0,
        style: getLayerRowStyle(depth),
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-layer-row-main", children: [
            hasChildren ? /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                },
                className: "tecof-layer-caret",
                "aria-label": expanded ? `${displayLabel} katman\u0131n\u0131 daralt` : `${displayLabel} katman\u0131n\u0131 geni\u015Flet`,
                "aria-expanded": expanded,
                children: expanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { size: 14 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { size: 14 })
              }
            ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-layer-caret-spacer" }),
            /* @__PURE__ */ jsxRuntime.jsx(RowIcon, { size: 14, className: "tecof-layer-icon" }),
            renaming ? /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                className: "tecof-layer-rename-input",
                defaultValue: displayLabel,
                autoFocus: true,
                onFocus: (e) => e.currentTarget.select(),
                onClick: (e) => e.stopPropagation(),
                onKeyDown: (e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") {
                    renameCancelledRef.current = true;
                    e.currentTarget.blur();
                  }
                },
                onBlur: (e) => commitRename(e.currentTarget.value)
              }
            ) : /* @__PURE__ */ jsxRuntime.jsx(
              "span",
              {
                className: "tecof-layer-label",
                title: customName ? `${label} \u2014 \xE7ift t\u0131klayarak yeniden adland\u0131r\u0131n` : "\xC7ift t\u0131klayarak yeniden adland\u0131r\u0131n",
                onDoubleClick: (e) => {
                  if (perms.edit === false) return;
                  e.stopPropagation();
                  setRenaming(true);
                },
                children: displayLabel
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-layer-row-actions", children: [
            perms.duplicate !== false && /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  duplicateNode2(node.props.id);
                },
                className: "tecof-layer-action",
                title: "\xC7o\u011Falt",
                "aria-label": `${displayLabel} katman\u0131n\u0131 \xE7o\u011Falt`,
                children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { size: 12 })
              }
            ),
            perms.delete !== false && /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  removeNode2(node.props.id);
                },
                className: "tecof-layer-delete",
                title: "Sil",
                "aria-label": `${displayLabel} katman\u0131n\u0131 sil`,
                children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 12 })
              }
            )
          ] })
        ]
      }
    ),
    dragOverPos === "bottom" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-drop-line sm" }),
    expanded && childZoneKeys.map((zoneKey) => {
      const zoneItems = documentState.zones[zoneKey] || [];
      const zoneName = zoneKey.split(":").pop() || "";
      if (zoneItems.length === 0) return null;
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-layer-node", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-layer-zone-label", style: getLayerZoneStyle(depth), children: zoneName }),
        zoneItems.map((childNode) => /* @__PURE__ */ jsxRuntime.jsx(TreeNode, { node: childNode, depth: depth + 1 }, childNode.props.id))
      ] }, zoneKey);
    })
  ] });
};
var LayersTree = () => {
  const documentState = useEditorStore((state) => state.document);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-layers", role: "tree", "aria-label": "Sayfa katmanlar\u0131", children: documentState.content.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-layers-empty", children: "Sayfada hen\xFCz bile\u015Fen yok. Canvas'a b\xF6l\xFCm ekleyerek ba\u015Flay\u0131n." }) : documentState.content.map((node) => /* @__PURE__ */ jsxRuntime.jsx(TreeNode, { node, depth: 0 }, node.props.id)) });
};
var BlockThumb = ({
  type,
  label,
  config,
  previewMode,
  showPreview = false,
  onAdd,
  onDragStart,
  onDragEnd
}) => {
  const [hovered, setHovered] = React.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      type: "button",
      onClick: () => onAdd(type),
      draggable: true,
      onDragStart: (e) => {
        setHovered(false);
        onDragStart(e, type, label);
      },
      onDragEnd,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      className: `tecof-block-btn${showPreview ? " tecof-block-btn--thumb" : ""}`,
      title: `${label} ekle`,
      children: [
        showPreview && /* @__PURE__ */ jsxRuntime.jsx("span", { className: `tecof-block-thumb is-${previewMode}`, children: /* @__PURE__ */ jsxRuntime.jsx(LiveBlockPreview, { config, type, mode: previewMode }) }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-block-btn-label", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 14, className: "tecof-block-btn-icon" }),
        !showPreview && hovered && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-block-popover", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-block-popover-title", children: label }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: `tecof-block-popover-preview is-${previewMode}`, children: /* @__PURE__ */ jsxRuntime.jsx(LiveBlockPreview, { config, type, mode: previewMode }) })
        ] })
      ]
    }
  );
};
var LeftPanel = () => {
  const { config } = useStudio();
  const insertNode2 = useEditorStore((state) => state.insertNode);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);
  const [activeTab, setActiveTab] = React.useState("blocks");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showPreviews, setShowPreviews] = React.useState(false);
  const categories = config.categories || {};
  const components = config.components || {};
  const groupedComponents = {};
  if (Object.keys(categories).length > 0) {
    Object.entries(categories).forEach(([key, value]) => {
      groupedComponents[value.title || key] = value.components || [];
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-left-panel", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-panel-tabs", role: "tablist", "aria-label": "Sol panel g\xF6r\xFCn\xFCm\xFC", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("blocks"),
          className: `tecof-tab${activeTab === "blocks" ? " is-active" : ""}`,
          role: "tab",
          "aria-selected": activeTab === "blocks",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Grid, { size: 14 }),
            "Blok Ekle"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("layers"),
          className: `tecof-tab${activeTab === "layers" ? " is-active" : ""}`,
          role: "tab",
          "aria-selected": activeTab === "layers",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Layers, { size: 14 }),
            "Katmanlar"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-panel-body", children: activeTab === "blocks" ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-blocks", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-search", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 14, className: "tecof-icon-muted" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "text",
            placeholder: "Bile\u015Fen ara...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "tecof-search-input"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowPreviews(!showPreviews),
            className: `tecof-search-preview-toggle${showPreviews ? " is-active" : ""}`,
            title: showPreviews ? "\xD6nizlemeleri Kapat" : "\xD6nizlemeleri A\xE7",
            children: showPreviews ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { size: 13 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { size: 13 })
          }
        )
      ] }),
      Object.entries(groupedComponents).map(([catTitle, blockTypes]) => {
        const filteredTypes = blockTypes.filter((type) => {
          const label = components[type]?.label || type;
          return label.toLowerCase().includes(searchQuery.toLowerCase());
        });
        if (filteredTypes.length === 0) return null;
        const previewMode = /element/i.test(catTitle) ? "element" : "section";
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-block-cat", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-block-cat-title", children: catTitle }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-block-grid", children: filteredTypes.map((type) => {
            const compConfig = components[type] || {};
            const label = compConfig.label || type;
            return /* @__PURE__ */ jsxRuntime.jsx(
              BlockThumb,
              {
                type,
                label,
                config,
                previewMode,
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
    ] }) : /* @__PURE__ */ jsxRuntime.jsx(LayersTree, {}) })
  ] });
};
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
  const { apiClient } = chunkFMV4YLE6_js.useTecof();
  React.useEffect(() => {
    apiClient.setAccessToken(accessToken);
  }, [apiClient, accessToken]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState("idle");
  const [dirty, setDirty] = React.useState(false);
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
  const documentStateRef = React.useRef(documentState);
  documentStateRef.current = documentState;
  const savedDocRef = React.useRef(documentState);
  const dirtyRef = React.useRef(false);
  const savingRef = React.useRef(false);
  savingRef.current = saving;
  const autoSaveTimerRef = React.useRef(null);
  const isEmbedded2 = isEmbedded();
  const revisionPreviewId = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return new URLSearchParams(window.location.search).get("revision");
    } catch {
      return null;
    }
  }, []);
  const [revisionMeta, setRevisionMeta] = React.useState(null);
  const setMode = useUiStore((state) => state.setMode);
  React.useEffect(() => {
    if (revisionPreviewId) setMode("preview");
  }, [revisionPreviewId, setMode]);
  React.useEffect(() => {
    configureBridge(hostOrigin);
  }, [hostOrigin]);
  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15e3);
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getPage(pageId, controller.signal, revisionPreviewId);
        if (cancelled) return;
        setRevisionMeta(revisionPreviewId ? res.data?.revisionPreview || {} : null);
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
  }, [pageId, apiClient, setDocument, revisionPreviewId]);
  const highlightComponent = React.useCallback((componentType) => {
    if (!componentType) return;
    const doc = useEditorStore.getState().document;
    const allNodes = [
      ...doc.content || [],
      ...Object.values(doc.zones || {}).flat()
    ];
    const node = allNodes.find((n) => n?.type === componentType);
    if (!node?.props?.id) return;
    const id = node.props.id;
    useEditorStore.getState().selectNode(id);
    requestAnimationFrame(() => {
      const el = window.document.querySelector(`[data-tecof-id="${id}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("tecof-ai-flash");
      window.setTimeout(() => el.classList.remove("tecof-ai-flash"), 1800);
    });
  }, []);
  const reloadDocument = React.useCallback(async (highlightType) => {
    try {
      const res = await apiClient.getPage(pageId);
      const rawData = res.success && res.data?.draftData ? res.data.draftData : null;
      if (!rawData) return;
      const parsedDoc = migrateDocument(parseDocument(rawData), config.migrations);
      setDocument(parsedDoc);
      savedDocRef.current = useEditorStore.getState().document;
      dirtyRef.current = false;
      setDirty(false);
      if (highlightType) {
        window.setTimeout(() => highlightComponent(highlightType), 150);
      }
    } catch (err) {
      console.error("Failed to reload document:", err);
    }
  }, [apiClient, pageId, config.migrations, setDocument, highlightComponent]);
  const isFirstRender = React.useRef(true);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const changeTimerRef = React.useRef(null);
  React.useEffect(() => {
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
  React.useEffect(() => {
    return () => {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    };
  }, []);
  const handleSaveDraft = React.useCallback(async () => {
    if (revisionPreviewId) {
      console.warn("[TecofStudio] Revizyon \xF6nizlemesinde kaydetme devre d\u0131\u015F\u0131d\u0131r.");
      if (isEmbedded2) {
        postToHost("puck:saveError", { message: "Revizyon \xF6nizlemesi salt okunurdur \u2014 kaydetmek i\xE7in normal edit\xF6r\xFC kullan\u0131n." });
      }
      return;
    }
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
  }, [pageId, apiClient, accessToken, onSave, isEmbedded2, revisionPreviewId]);
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (!warnOnUnsavedChanges) return;
    const handler = (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [warnOnUnsavedChanges]);
  React.useEffect(() => {
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
        case "puck:refetch":
          reloadDocument(e.data.highlightType);
          break;
        case "puck:highlight":
          highlightComponent(e.data.componentType || e.data.type);
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
  }, [isEmbedded2, handleSaveDraft, undo, redo, setViewport, reloadDocument, highlightComponent]);
  React.useEffect(() => {
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
  React.useEffect(() => {
    setPermissionResolver((node) => getNodePermissions(config, node));
    return () => setPermissionResolver(null);
  }, [config, setPermissionResolver]);
  const studioContextValue = React.useMemo(() => ({
    config,
    readOnly: mode === "preview",
    apiClient
  }), [config, mode, apiClient]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsx(StudioSkeleton, { className });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(StudioContext.Provider, { value: studioContextValue, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.LanguageProvider, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `tecof-studio-root ${className || ""}`.trim(), children: [
    /* @__PURE__ */ jsxRuntime.jsx(TopBar, { onSave: handleSaveDraft, saving, saveStatus, dirty, autoSave, embedded: isEmbedded2 }),
    revisionPreviewId && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-revision-preview-banner", role: "status", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-revision-preview-badge", children: "SALT OKUNUR" }),
      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
        "Revizyon \xF6nizlemesi",
        revisionMeta?.revisionNumber ? ` \u2014 #${revisionMeta.revisionNumber}` : "",
        revisionMeta?.kind === "publish" ? " (yay\u0131n)" : revisionMeta?.kind === "draft-save" ? " (taslak)" : "",
        revisionMeta?.createDate ? ` \xB7 ${new Date(revisionMeta.createDate).toLocaleString("tr-TR")}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-revision-preview-hint", children: `Bu s\xFCr\xFCme d\xF6nmek i\xE7in paneldeki Sayfa Ge\xE7mi\u015Fi'nden "Geri Y\xFCkle"yi kullan\u0131n.` })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-studio-workspace-container", children: [
      leftPanelOpen ? /* @__PURE__ */ jsxRuntime.jsx(LeftPanel, {}) : /* @__PURE__ */ jsxRuntime.jsx(PanelRail, { side: "left", onExpand: toggleLeftPanel }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-studio-workspace", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Canvas, {}),
        /* @__PURE__ */ jsxRuntime.jsx(SelectionOverlay, {}),
        /* @__PURE__ */ jsxRuntime.jsx(NodeContextMenu, {})
      ] }),
      rightPanelOpen ? /* @__PURE__ */ jsxRuntime.jsx(Inspector, {}) : /* @__PURE__ */ jsxRuntime.jsx(PanelRail, { side: "right", onExpand: toggleRightPanel })
    ] }),
    saving && /* @__PURE__ */ jsxRuntime.jsx("div", { className: `tecof-studio-save-indicator${saveStatus === "error" ? " is-error" : ""}`, children: saveStatus === "error" ? "Kaydedilemedi" : "Kaydediliyor..." }),
    /* @__PURE__ */ jsxRuntime.jsx(CommandPalette, { onSave: handleSaveDraft }),
    /* @__PURE__ */ jsxRuntime.jsx(ThemeVars, {})
  ] }) }) });
};
var PanelRail = ({ side, onExpand }) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: `tecof-panel-rail tecof-panel-rail-${side}`, children: /* @__PURE__ */ jsxRuntime.jsx(
  "button",
  {
    type: "button",
    className: "tecof-icon-btn",
    onClick: onExpand,
    title: side === "left" ? "Sol paneli a\xE7" : "Sa\u011F paneli a\xE7",
    "aria-label": side === "left" ? "Sol paneli a\xE7" : "Sa\u011F paneli a\xE7",
    children: side === "left" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelLeft, { size: 16 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelRight, { size: 16 })
  }
) });
var StudioSkeleton = ({ className }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `tecof-studio-skeleton ${className || ""}`.trim(), "aria-busy": "true", "aria-label": "St\xFCdyo y\xFCkleniyor", children: [
  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-studio-skeleton-topbar", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-title" }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-vp" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-studio-skeleton-toolgroup", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-dot" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-dot" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-cta" })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-studio-skeleton-body", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-studio-skeleton-side", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-search" }),
      Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-blockrow" }, i))
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-studio-skeleton-canvas", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-block" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-block" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-block" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-studio-skeleton-side right", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-60" }),
      Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-text sm w-40" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-studio-skeleton-field" })
      ] }, i))
    ] })
  ] })
] });

// src/components/TecofEditor.tsx
var TecofEditor = TecofStudio;

// src/studio/style/animationCss.ts
var ANIMATION_CSS = `@media (prefers-reduced-motion: reduce) {
  .tecof-anim-fade,
  .tecof-anim-fade-up,
  .tecof-anim-fade-down,
  .tecof-anim-zoom-in {
    animation: none;
  }
}

@keyframes tecof-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes tecof-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tecof-fade-down {
  from { opacity: 0; transform: translateY(-24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tecof-zoom-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.tecof-anim-fade { animation: tecof-fade 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tecof-anim-fade-up { animation: tecof-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tecof-anim-fade-down { animation: tecof-fade-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tecof-anim-zoom-in { animation: tecof-zoom-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }

.tecof-anim-delay-100 { animation-delay: 100ms; }
.tecof-anim-delay-200 { animation-delay: 200ms; }
.tecof-anim-delay-300 { animation-delay: 300ms; }
.tecof-anim-delay-500 { animation-delay: 500ms; }
`;
var RenderContext = React.createContext(null);
var ParentNodeContext2 = React.createContext(null);
var RenderDropZone = ({ zone, className, style, orientation = "vertical" }) => {
  const parentId = React.useContext(ParentNodeContext2);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const context = React.useContext(RenderContext);
  if (!context) return null;
  const items = context.zones[zoneKey] || [];
  const orientationStyle = orientation === "horizontal" ? { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" } : void 0;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className, style: { ...orientationStyle, ...style }, children: items.map((item, index) => /* @__PURE__ */ jsxRuntime.jsx(RenderNode, { node: item, index }, item.props.id || index)) });
};
var RenderNode = ({ node, index }) => {
  const context = React.useContext(RenderContext);
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
        componentProps[fieldName] = /* @__PURE__ */ jsxRuntime.jsx(RenderDropZone, { zone: fieldName, orientation: fieldDef.orientation });
      }
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(ParentNodeContext2.Provider, { value: node.props.id || null, children: componentConfig.render(componentProps) });
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
  const renderedContent = doc.content.map((item, index) => /* @__PURE__ */ jsxRuntime.jsx(RenderNode, { node: item, index }, item.props.id || index));
  const rootProps = doc.root?.props || {};
  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render ? rootConfig.render({
    ...rootProps,
    children: renderedContent,
    editMode: false
  }) : renderedContent;
  const styleCss = generateStyleCss(collectDocumentClasses(doc));
  const themeCss = generateCSSVariables(resolveTheme(rootProps, config.theme));
  return /* @__PURE__ */ jsxRuntime.jsxs(RenderContext.Provider, { value: contextValue, children: [
    /* @__PURE__ */ jsxRuntime.jsx("style", { "data-tecof-theme": true, children: themeCss }),
    /* @__PURE__ */ jsxRuntime.jsx("style", { "data-tecof-animations": true, children: ANIMATION_CSS }),
    styleCss && /* @__PURE__ */ jsxRuntime.jsx("style", { "data-tecof-styles": true, children: styleCss }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: contentWithLayout })
  ] });
};
var EditorFieldImpl = React.lazy(() => import('./EditorField.impl-MFEVK4DO.js'));
var EditorField = (props) => /* @__PURE__ */ jsxRuntime.jsx(React.Suspense, { fallback: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLoading, {}), children: /* @__PURE__ */ jsxRuntime.jsx(EditorFieldImpl, { ...props }) });
var createEditorField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "editor",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
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
var UploadFieldImpl = React.lazy(() => import('./UploadField.impl-DMGFGNVC.js'));
var UploadField = (props) => /* @__PURE__ */ jsxRuntime.jsx(React.Suspense, { fallback: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLoading, {}), children: /* @__PURE__ */ jsxRuntime.jsx(UploadFieldImpl, { ...props }) });
UploadField.displayName = "UploadField";
var createUploadField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "upload",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
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
var CodeEditorFieldImpl = React.lazy(() => import('./CodeEditorField.impl-4Y5UBX4Q.js'));
var CodeEditorField = React.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntime.jsx(React.Suspense, { fallback: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLoading, {}), children: /* @__PURE__ */ jsxRuntime.jsx(CodeEditorFieldImpl, { ref, ...props }) }));
CodeEditorField.displayName = "CodeEditorField";
var createCodeEditorField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "code",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
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
  const { apiClient } = chunkFMV4YLE6_js.useTecof();
  const {
    merchantInfo,
    loading: langLoading,
    error: langError,
    activeTab: localActiveTab,
    setActiveTab: localSetActiveTab
  } = chunkA2KHM342_js.useLanguages();
  const globalLang = chunkA2KHM342_js.useActiveLanguage();
  const activeTab = globalLang ? globalLang.activeLanguage : localActiveTab;
  const setActiveTab = globalLang ? globalLang.setActiveLanguage : localSetActiveTab;
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [pages, setPages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [showManual, setShowManual] = React.useState(false);
  const [manualUrl, setManualUrl] = React.useState("");
  const [manualLabel, setManualLabel] = React.useState("");
  const [manualTarget, setManualTarget] = React.useState("_self");
  const values = React.useMemo(() => {
    if (!merchantInfo) return value || [];
    const current2 = value || [];
    return merchantInfo.languages.map((code) => {
      const existing = current2.find((v) => v.code === code);
      return existing || { code, value: { url: "" } };
    });
  }, [value, merchantInfo]);
  const valuesRef = React.useRef(values);
  valuesRef.current = values;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const activeValueItem = values.find((v) => v.code === activeTab);
  const activeValue = activeValueItem?.value || { url: "" };
  const updateActiveValue = React.useCallback((newLinkVal) => {
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
  React.useEffect(() => {
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
  const handleSelectPage = React.useCallback((page) => {
    updateActiveValue({
      url: `/${page.slug}`,
      label: page.title || page.slug,
      target: "_self",
      type: "page"
    });
    setDrawerOpen(false);
  }, [updateActiveValue]);
  const handleConfirmManual = React.useCallback(() => {
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
  const handleClear = React.useCallback(() => {
    updateActiveValue(null);
  }, [updateActiveValue]);
  const handleEditManual = React.useCallback(() => {
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-link-container", children: [
    !globalLang && merchantInfo && merchantInfo.languages.length > 1 && /* @__PURE__ */ jsxRuntime.jsx(
      chunkA2KHM342_js.LanguageTabBar,
      {
        languages: merchantInfo.languages,
        defaultLanguage: merchantInfo.defaultLanguage,
        activeTab,
        onTabChange: setActiveTab
      }
    ),
    langLoading && /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLoading, {}),
    hasValue && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-link-value-box", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-link-value-icon", children: activeValue.type === "page" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { size: 16 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Globe, { size: 16 }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-link-value-info", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-link-value-label", children: activeValue.label || activeValue.url }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-link-value-url", children: activeValue.url })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: `tecof-link-value-badge ${activeValue.type === "page" ? "tecof-link-badge-page" : "tecof-link-badge-custom"}`, children: activeValue.type === "page" ? "Sayfa" : "Link" }),
      activeValue.target === "_blank" && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ExternalLink, { size: 14, className: "tecof-icon-muted" }),
      !readOnly && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: "tecof-link-action-btn-small", onClick: handleEditManual, title: "D\xFCzenle", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pencil, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: "tecof-link-action-btn-small", onClick: handleClear, title: "Kald\u0131r", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 14 }) })
      ] })
    ] }),
    !readOnly && !hasValue && !showManual && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-link-main-actions", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", className: "tecof-link-btn-secondary", onClick: () => setDrawerOpen(true), children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { size: 16 }),
        " Sayfa Se\xE7"
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", className: "tecof-link-btn-secondary", onClick: () => setShowManual(true), children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Link, { size: 16 }),
        " Manuel Link"
      ] })
    ] }),
    !readOnly && showManual && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-link-input-group", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-link-input-label", children: "Manuel Link" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "text",
          placeholder,
          value: manualUrl,
          onChange: (e) => setManualUrl(e.target.value),
          className: "tecof-link-input"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "text",
          placeholder: "Etiket (opsiyonel)",
          value: manualLabel,
          onChange: (e) => setManualLabel(e.target.value),
          className: "tecof-link-input"
        }
      ),
      showTarget && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-link-input-row", children: /* @__PURE__ */ jsxRuntime.jsxs(
        "select",
        {
          value: manualTarget,
          onChange: (e) => setManualTarget(e.target.value),
          className: "tecof-link-select-small tecof-flex-1",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "_self", children: "Ayn\u0131 Sekmede A\xE7" }),
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "_blank", children: "Yeni Sekmede A\xE7" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-link-manual-actions", children: [
        /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: "tecof-link-btn-confirm", onClick: handleConfirmManual, children: "Uygula" }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsx(chunkFMV4YLE6_js.Drawer.Root, { open: drawerOpen, onOpenChange: setDrawerOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(chunkFMV4YLE6_js.Drawer.Portal, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(chunkFMV4YLE6_js.Drawer.Overlay, { className: "tecof-link-drawer-overlay" }),
      /* @__PURE__ */ jsxRuntime.jsxs(chunkFMV4YLE6_js.Drawer.Content, { className: "tecof-link-drawer-content", children: [
        /* @__PURE__ */ jsxRuntime.jsx(chunkFMV4YLE6_js.Drawer.Title, { className: "tecof-sr-only", children: "Ba\u011Flant\u0131 Sayfas\u0131 Se\xE7ici" }),
        /* @__PURE__ */ jsxRuntime.jsx(chunkFMV4YLE6_js.Drawer.Description, { className: "tecof-sr-only", children: "Sayfa listesinden se\xE7im yap\u0131n veya arama yap\u0131n" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-link-drawer-header", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "tecof-link-drawer-title", children: "Sayfa Se\xE7" }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { className: "tecof-link-drawer-close-btn", onClick: () => setDrawerOpen(false), children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-link-search-box", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 16, className: "tecof-icon-muted" }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        loading ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-field-loading", "aria-busy": "true", children: [0, 1, 2].map((item) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-loading-row", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-circle tecof-field-loading-thumb" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-loading-lines", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-60" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-text sm w-80" })
          ] })
        ] }, item)) }) : filteredPages.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-text-center tecof-p-40 tecof-text-muted", children: search ? "Sonu\xE7 bulunamad\u0131" : "Hen\xFCz sayfa yok" }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-link-page-list", children: filteredPages.map((page) => {
          const selected = activeValue?.url === `/${page.slug}`;
          return /* @__PURE__ */ jsxRuntime.jsxs(
            "div",
            {
              className: `tecof-link-page-item ${selected ? "selected" : ""}`,
              onClick: () => handleSelectPage(page),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: `tecof-link-status-dot ${page.status || "draft"}`, title: page.status }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-flex-1 tecof-min-w-0", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "tecof-link-page-slug", children: [
                    "/",
                    page.slug
                  ] }),
                  page.title && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-link-page-title", children: page.title })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { size: 16, className: "tecof-icon-faint" })
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
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
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
  const previewLabel = React.useMemo(() => {
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `tecof-repeater-row ${isExpanded ? "expanded" : ""}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-repeater-row-header", onClick: onToggle, children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-repeater-row-left", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.GripVertical, { size: 14, className: "tecof-repeater-grip" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-repeater-row-index", children: rowIndex + 1 }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-repeater-row-preview", children: previewLabel })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-repeater-row-actions", children: [
        !readOnly && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          canMoveUp && /* @__PURE__ */ jsxRuntime.jsx(
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
          canMoveDown && /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              className: "tecof-repeater-action-btn",
              onClick: (e) => {
                e.stopPropagation();
                onDuplicate();
              },
              title: "Kopyala",
              children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { size: 13 })
            }
          ),
          canRemove && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              className: "tecof-repeater-action-btn tecof-repeater-action-btn-danger",
              onClick: (e) => {
                e.stopPropagation();
                onRemove();
              },
              title: "Sil",
              children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { size: 13 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          lucideReact.ChevronDown,
          {
            size: 16,
            className: `tecof-repeater-chevron ${isExpanded ? "rotated" : ""}`
          }
        )
      ] })
    ] }),
    isExpanded && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-repeater-row-content", children: Object.entries(subFields).map(([key, fieldDef]) => {
      const fieldValue = row[key];
      const renderFn = fieldDef?.render;
      if (typeof renderFn !== "function") return null;
      return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-repeater-subfield", children: renderFn({
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
  const items = React.useMemo(() => Array.isArray(rawValue) ? rawValue : [], [rawValue]);
  const [expandedRows, setExpandedRows] = React.useState(() => new Set(items.length > 0 ? [0] : []));
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const canAdd = maxItems == null || items.length < maxItems;
  const canRemove = items.length > minItems;
  const buildDefaultRow = React.useCallback(() => {
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
  const handleAdd = React.useCallback(() => {
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
  const handleRemove = React.useCallback((index) => {
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
  const handleDuplicate = React.useCallback((index) => {
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
  const handleMove = React.useCallback((index, direction) => {
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
  const handleSubFieldChange = React.useCallback((rowIndex, key, val) => {
    const newItems = items.map((row, i) => {
      if (i !== rowIndex) return row;
      return { ...row, [key]: val };
    });
    onChangeRef.current(newItems);
  }, [items]);
  const toggleRow = React.useCallback((index) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-repeater-container", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-repeater-header", children: /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-repeater-count", children: [
      items.length,
      " sat\u0131r",
      maxItems != null && ` / ${maxItems}`
    ] }) }),
    items.length === 0 && !readOnly && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-repeater-empty", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-repeater-empty-text", children: "Hen\xFCz sat\u0131r eklenmemi\u015F" }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-repeater-add-btn",
          onClick: handleAdd,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 14 }),
            " \u0130lk Sat\u0131r\u0131 Ekle"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-repeater-rows", children: items.map((row, idx) => /* @__PURE__ */ jsxRuntime.jsx(
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
    items.length > 0 && !readOnly && canAdd && /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        className: "tecof-repeater-add-btn-bottom",
        onClick: handleAdd,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { size: 14 }),
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
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
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
  const { apiClient } = chunkFMV4YLE6_js.useTecof();
  const [collections, setCollections] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef(null);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const fetchCollections = React.useCallback(async () => {
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
  React.useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);
  const selectedCollection = React.useMemo(() => {
    if (!value?.collectionSlug) return null;
    return collections.find((c) => c.slug === value.collectionSlug) || null;
  }, [value?.collectionSlug, collections]);
  const collectionFields = React.useMemo(() => {
    return selectedCollection?.fields || [];
  }, [selectedCollection]);
  const handleSelect = React.useCallback((col) => {
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
  const handleClear = React.useCallback(() => {
    onChangeRef.current(null);
  }, []);
  const handleLimitChange = React.useCallback((e) => {
    const num = parseInt(e.target.value, 10);
    if (!value) return;
    onChangeRef.current({
      ...value,
      limit: isNaN(num) ? defaultLimit : Math.max(1, Math.min(100, num))
    });
  }, [value, defaultLimit]);
  const handleSortChange = React.useCallback((sort) => {
    if (!value) return;
    onChangeRef.current({ ...value, sort });
  }, [value]);
  const handleFieldMapChange = React.useCallback((slotKey, fieldShortcode) => {
    if (!value) return;
    onChangeRef.current({
      ...value,
      fieldMap: {
        ...value.fieldMap,
        [slotKey]: fieldShortcode
      }
    });
  }, [value]);
  const handleAddFilter = React.useCallback(() => {
    if (!value) return;
    const firstField = collectionFields[0]?.shortcode || "";
    onChangeRef.current({
      ...value,
      filters: [...value.filters || [], { field: firstField, op: "contains", value: "" }]
    });
  }, [value, collectionFields]);
  const handleFilterChange = React.useCallback((index, patch) => {
    if (!value) return;
    const next = [...value.filters || []];
    next[index] = { ...next[index], ...patch };
    onChangeRef.current({ ...value, filters: next });
  }, [value]);
  const handleRemoveFilter = React.useCallback((index) => {
    if (!value) return;
    onChangeRef.current({ ...value, filters: (value.filters || []).filter((_, i) => i !== index) });
  }, [value]);
  const filteredCollections = React.useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-loading tecof-field-loading-compact", "aria-busy": "true", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-circle" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-60" })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-error", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: error }),
      /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", className: "tecof-cms-col-retry", onClick: fetchCollections, children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCw, { size: 12 }),
        " Tekrar Dene"
      ] })
    ] });
  }
  const hasSlots = slots && Object.keys(slots).length > 0;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-container", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-selector", ref: dropdownRef, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: `tecof-cms-col-trigger ${dropdownOpen ? "open" : ""}`,
          onClick: () => !readOnly && setDropdownOpen(!dropdownOpen),
          disabled: readOnly,
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-trigger-left", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Database, { size: 14 }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: value?.collectionName || value?.collectionSlug || "Koleksiyon Se\xE7in" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-trigger-right", children: [
              value && !readOnly && /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  type: "button",
                  className: "tecof-cms-col-clear",
                  onClick: (e) => {
                    e.stopPropagation();
                    handleClear();
                  },
                  title: "Temizle",
                  children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 12 })
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                lucideReact.ChevronDown,
                {
                  size: 14,
                  className: `tecof-cms-col-chevron ${dropdownOpen ? "rotated" : ""}`
                }
              )
            ] })
          ]
        }
      ),
      dropdownOpen && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-dropdown", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-search", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 13 }),
          /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cms-col-options", children: filteredCollections.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cms-col-empty", children: "Koleksiyon bulunamad\u0131" }) : filteredCollections.map((col) => /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            className: `tecof-cms-col-option ${value?.collectionSlug === col.slug ? "selected" : ""}`,
            onClick: () => handleSelect(col),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Database, { size: 13 }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-option-info", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-cms-col-option-name", children: col.name }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-cms-col-option-slug", children: col.slug })
              ] })
            ]
          },
          col._id
        )) })
      ] })
    ] }),
    value?.collectionSlug && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-settings", children: [
      showLimit && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-setting", children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: "tecof-cms-col-setting-label", children: "Limit" }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
      showSort && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-setting", children: [
        /* @__PURE__ */ jsxRuntime.jsx("label", { className: "tecof-cms-col-setting-label", children: "S\u0131ralama" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-sort-btns", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              className: `tecof-cms-col-sort-btn ${(value.sort || "custom") === "custom" ? "active" : ""}`,
              onClick: () => handleSortChange("custom"),
              disabled: readOnly,
              children: "\xD6zel S\u0131ralama"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              className: `tecof-cms-col-sort-btn ${value.sort === "newest" ? "active" : ""}`,
              onClick: () => handleSortChange("newest"),
              disabled: readOnly,
              children: "Yeni\u2192Eski"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
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
    value?.collectionSlug && collectionFields.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-mapping", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-mapping-header", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 12 }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Filtreler" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cms-col-mapping-rows", children: (value.filters || []).map((f, i) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-filter-row", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "select",
          {
            className: "tecof-cms-col-mapping-select",
            value: f.field,
            onChange: (e) => handleFilterChange(i, { field: e.target.value }),
            disabled: readOnly,
            children: collectionFields.map((cf) => /* @__PURE__ */ jsxRuntime.jsxs("option", { value: cf.shortcode, children: [
              cf.name,
              " (",
              cf.shortcode,
              ")"
            ] }, cf.shortcode))
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "select",
          {
            className: "tecof-cms-col-mapping-select tecof-cms-col-filter-op",
            value: f.op,
            onChange: (e) => handleFilterChange(i, { op: e.target.value }),
            disabled: readOnly,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "contains", children: "i\xE7erir" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "eq", children: "e\u015Fittir" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "ne", children: "e\u015Fit de\u011Fil" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "gt", children: "b\xFCy\xFCkt\xFCr" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "gte", children: "b\xFCy\xFCk e\u015Fit" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "lt", children: "k\xFC\xE7\xFCkt\xFCr" }),
              /* @__PURE__ */ jsxRuntime.jsx("option", { value: "lte", children: "k\xFC\xE7\xFCk e\u015Fit" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "text",
            className: "tecof-cms-col-setting-input tecof-cms-col-filter-value",
            value: f.value,
            placeholder: "De\u011Fer",
            onChange: (e) => handleFilterChange(i, { value: e.target.value }),
            disabled: readOnly
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            className: "tecof-cms-col-clear",
            onClick: () => handleRemoveFilter(i),
            title: "Filtreyi kald\u0131r",
            disabled: readOnly,
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 12 })
          }
        )
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: "tecof-cms-col-retry",
          onClick: handleAddFilter,
          disabled: readOnly,
          children: "+ Filtre Ekle"
        }
      )
    ] }),
    value?.collectionSlug && hasSlots && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-mapping", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-mapping-header", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Link2, { size: 12 }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Alan E\u015Fle\u015Ftirme" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-cms-col-mapping-rows", children: Object.entries(slots).map(([slotKey, slotDef]) => {
        const currentMapping = value.fieldMap?.[slotKey] || "";
        const availableFields = slotDef.fieldTypes ? collectionFields.filter((f) => slotDef.fieldTypes.includes(f.type)) : collectionFields;
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-mapping-row", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "tecof-cms-col-mapping-label", children: slotDef.label }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "select",
            {
              className: "tecof-cms-col-mapping-select",
              value: currentMapping,
              onChange: (e) => handleFieldMapChange(slotKey, e.target.value),
              disabled: readOnly,
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", children: "\u2014 Se\xE7in \u2014" }),
                availableFields.map((f) => /* @__PURE__ */ jsxRuntime.jsxs("option", { value: f.shortcode, children: [
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
    selectedCollection && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-cms-col-badge", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Database, { size: 11 }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: selectedCollection.name }),
      selectedCollection.fields && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-cms-col-badge-count", children: [
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
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
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
var ALL_ICONS = Object.entries(lucideReact.icons).map(([name, Icon]) => ({ name, lower: name.toLowerCase(), Icon })).sort((a, b) => a.name.localeCompare(b.name));
var MAX_VISIBLE_ICONS = 120;
var kebabToPascal = (name) => name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
var canonicalIconName = (name) => {
  if (!name) return null;
  if (name in lucideReact.icons) return name;
  const pascal = kebabToPascal(name);
  return pascal in lucideReact.icons ? pascal : null;
};
var IconPreview = ({ name, size = 16, className }) => {
  const canonical = canonicalIconName(name);
  if (!canonical) return /* @__PURE__ */ jsxRuntime.jsx("div", { style: { width: size, height: size }, className });
  const Icon = lucideReact.icons[canonical];
  return /* @__PURE__ */ jsxRuntime.jsx(Icon, { size, className });
};
var IconField = ({ value, onChange, readOnly }) => {
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor: triggerRef.current,
    open: isOpen,
    placement: "bottom-start"
  });
  const close = React.useCallback(() => {
    setIsOpen(false);
    setSearch("");
  }, []);
  const filteredIcons = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = query ? ALL_ICONS.filter((item) => item.lower.includes(query)) : ALL_ICONS;
    return list.slice(0, MAX_VISIBLE_ICONS);
  }, [search]);
  React.useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      if (!floatingRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        close();
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, floatingRef, close]);
  const selectIcon = (name) => {
    onChange(name);
    close();
  };
  const selectedName = canonicalIconName(value);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-icon-field-container", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-icon-trigger-wrap", ref: triggerRef, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: `tecof-icon-trigger-btn ${isOpen ? "open" : ""}`,
          disabled: readOnly,
          onClick: () => isOpen ? close() : setIsOpen(true),
          children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-icon-trigger-left", children: [
            selectedName ? /* @__PURE__ */ jsxRuntime.jsx(IconPreview, { name: selectedName, className: "tecof-icon-trigger-preview-icon", size: 16 }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-icon-trigger-placeholder" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-icon-trigger-label", children: value || "\u0130kon Se\xE7in" })
          ] })
        }
      ),
      value && !readOnly && /* @__PURE__ */ jsxRuntime.jsx(
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
    isOpen && reactDom.createPortal(
      /* @__PURE__ */ jsxRuntime.jsxs(
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
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-icon-search-wrapper", children: /* @__PURE__ */ jsxRuntime.jsx(
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
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-icon-grid", children: [
              filteredIcons.map(({ name, Icon }) => /* @__PURE__ */ jsxRuntime.jsxs(
                "button",
                {
                  type: "button",
                  className: `tecof-icon-item-btn ${selectedName === name ? "selected" : ""}`,
                  title: name,
                  onClick: () => selectIcon(name),
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: 16 }),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-icon-name", children: name })
                  ]
                },
                name
              )),
              filteredIcons.length === 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-icon-empty", children: "\u0130kon bulunamad\u0131." })
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
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(chunkA2KHM342_js.FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
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

Object.defineProperty(exports, "UnderConstruction", {
  enumerable: true,
  get: function () { return chunkX52JFTUZ_js.UnderConstruction; }
});
Object.defineProperty(exports, "FieldErrorBoundary", {
  enumerable: true,
  get: function () { return chunkA2KHM342_js.FieldErrorBoundary; }
});
Object.defineProperty(exports, "LanguageField", {
  enumerable: true,
  get: function () { return chunkA2KHM342_js.LanguageField; }
});
Object.defineProperty(exports, "createLanguageField", {
  enumerable: true,
  get: function () { return chunkA2KHM342_js.createLanguageField; }
});
Object.defineProperty(exports, "TecofApiClient", {
  enumerable: true,
  get: function () { return chunkFMV4YLE6_js.TecofApiClient; }
});
Object.defineProperty(exports, "TecofPicture", {
  enumerable: true,
  get: function () { return chunkFMV4YLE6_js.TecofPicture; }
});
Object.defineProperty(exports, "TecofProvider", {
  enumerable: true,
  get: function () { return chunkFMV4YLE6_js.TecofProvider; }
});
Object.defineProperty(exports, "useTecof", {
  enumerable: true,
  get: function () { return chunkFMV4YLE6_js.useTecof; }
});
exports.CmsCollectionField = CmsCollectionField;
exports.CodeEditorField = CodeEditorField;
exports.ColorField = ColorField;
exports.EditorField = EditorField;
exports.ExternalField = ExternalField;
exports.IconField = IconField;
exports.LinkField = LinkField;
exports.RepeaterField = RepeaterField;
exports.STYLES_PROP = STYLES_PROP;
exports.STYLE_CONTROLS = STYLE_CONTROLS;
exports.TAILWIND_PALETTE = TAILWIND_PALETTE;
exports.TAILWIND_SHADES = TAILWIND_SHADES;
exports.TecofEditor = TecofEditor;
exports.TecofRender = TecofRender;
exports.TecofStudio = TecofStudio;
exports.UploadField = UploadField;
exports.cn = cn;
exports.collectDocumentClasses = collectDocumentClasses;
exports.collectStyleClasses = collectStyleClasses;
exports.compileStyles = compileStyles;
exports.createCmsCollectionField = createCmsCollectionField;
exports.createCodeEditorField = createCodeEditorField;
exports.createColorField = createColorField;
exports.createEditorField = createEditorField;
exports.createExternalField = createExternalField;
exports.createIconField = createIconField;
exports.createLinkField = createLinkField;
exports.createRepeaterField = createRepeaterField;
exports.createUploadField = createUploadField;
exports.darken = darken;
exports.generateCSSVariables = generateCSSVariables;
exports.getDefaultTheme = getDefaultTheme;
exports.getSafelist = getSafelist;
exports.hexToHsl = hexToHsl;
exports.hslToHex = hslToHex;
exports.lighten = lighten;
exports.mergeTheme = mergeTheme;
exports.useEditorStore = useEditorStore;
exports.useUiStore = useUiStore;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map