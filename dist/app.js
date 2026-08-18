import { t as e } from "./rolldown-runtime-DtPi1Y-2.js";
import { t } from "./purify.es-BES4pJF7.js";
//#region node_modules/.pnpm/scheduler@0.27.0/node_modules/scheduler/cjs/scheduler.production.js
var n = /* @__PURE__ */ e(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, S || (S = !0, E());
			else {
				var t = n(l);
				t !== null && D(x, t.startTime - e);
			}
		}
	}
	var S = !1, C = -1, w = 5, ee = -1;
	function T() {
		return g ? !0 : !(e.unstable_now() - ee < w);
	}
	function te() {
		if (g = !1, S) {
			var t = e.unstable_now();
			ee = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(C), C = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && T());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && D(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
				}
			} finally {
				i ? E() : S = !1;
			}
		}
	}
	var E;
	if (typeof y == "function") E = function() {
		y(te);
	};
	else if (typeof MessageChannel < "u") {
		var ne = new MessageChannel(), re = ne.port2;
		ne.port1.onmessage = te, E = function() {
			re.postMessage(null);
		};
	} else E = function() {
		_(te, 0);
	};
	function D(t, n) {
		C = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, D(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, E()))), r;
	}, e.unstable_shouldYield = T, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), r = /* @__PURE__ */ e(((e, t) => {
	t.exports = n();
})), i = /* @__PURE__ */ e(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.iterator;
	function m(e) {
		return typeof e != "object" || !e ? null : (e = p && e[p] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var h = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, g = Object.assign, _ = {};
	function v(e, t, n) {
		this.props = e, this.context = t, this.refs = _, this.updater = n || h;
	}
	v.prototype.isReactComponent = {}, v.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, v.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function y() {}
	y.prototype = v.prototype;
	function b(e, t, n) {
		this.props = e, this.context = t, this.refs = _, this.updater = n || h;
	}
	var x = b.prototype = new y();
	x.constructor = b, g(x, v.prototype), x.isPureReactComponent = !0;
	var S = Array.isArray;
	function C() {}
	var w = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ee = Object.prototype.hasOwnProperty;
	function T(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function te(e, t) {
		return T(e.type, t, e.props);
	}
	function E(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function ne(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var re = /\/+/g;
	function D(e, t) {
		return typeof e == "object" && e && e.key != null ? ne("" + e.key) : t.toString(36);
	}
	function O(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(C, C) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function ie(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, ie(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + D(e, 0) : a, S(o) ? (i = "", c != null && (i = c.replace(re, "$&/") + "/"), ie(o, r, i, "", function(e) {
			return e;
		})) : o != null && (E(o) && (o = te(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(re, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (S(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + D(a, u), c += ie(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + D(a, u++), c += ie(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ie(O(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ae(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ie(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function k(e) {
		if (e._status === -1) {
			var t = e._result;
			t = t(), t.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t);
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t);
			}), e._status === -1 && (e._status = 0, e._result = t);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var A = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, j = {
		map: ae,
		forEach: function(e, t, n) {
			ae(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ae(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ae(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!E(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = j, e.Component = v, e.Fragment = r, e.Profiler = a, e.PureComponent = b, e.StrictMode = i, e.Suspense = l, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return w.H.useMemoCache(e);
		}
	}, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = g({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ee.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return T(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ee.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return T(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = E, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: k
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = function(e) {
		var t = w.T, n = {};
		w.T = n;
		try {
			var r = e(), i = w.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(C, A);
		} catch (e) {
			A(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), w.T = t;
		}
	}, e.unstable_useCacheRefresh = function() {
		return w.H.useCacheRefresh();
	}, e.use = function(e) {
		return w.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return w.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return w.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return w.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return w.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return w.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return w.H.useEffectEvent(e);
	}, e.useId = function() {
		return w.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return w.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return w.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return w.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return w.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return w.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return w.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return w.H.useRef(e);
	}, e.useState = function(e) {
		return w.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return w.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return w.H.useTransition();
	}, e.version = "19.2.8";
})), a = /* @__PURE__ */ e(((e, t) => {
	t.exports = i();
})), o = /* @__PURE__ */ e(((e) => {
	var t = a();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, o = Symbol.for("react.portal");
	function s(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: o,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var c = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function l(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return s(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = c.T, n = i.p;
		try {
			if (c.T = null, i.p = 2, e) return e();
		} finally {
			c.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = l(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = l(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = l(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = l(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return c.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return c.H.useHostTransitionStatus();
	}, e.version = "19.2.8";
})), s = /* @__PURE__ */ e(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = o();
})), c = /* @__PURE__ */ e(((e) => {
	var t = r(), n = a(), i = s();
	function o(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function c(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function l(e) {
		var t = e, n = e;
		if (e.alternate) for (; t.return;) t = t.return;
		else {
			e = t;
			do
				t = e, t.flags & 4098 && (n = t.return), e = t.return;
			while (e);
		}
		return t.tag === 3 ? n : null;
	}
	function u(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function d(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function f(e) {
		if (l(e) !== e) throw Error(o(188));
	}
	function p(e) {
		var t = e.alternate;
		if (!t) {
			if (t = l(e), t === null) throw Error(o(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var i = n.return;
			if (i === null) break;
			var a = i.alternate;
			if (a === null) {
				if (r = i.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (i.child === a.child) {
				for (a = i.child; a;) {
					if (a === n) return f(i), e;
					if (a === r) return f(i), t;
					a = a.sibling;
				}
				throw Error(o(188));
			}
			if (n.return !== r.return) n = i, r = a;
			else {
				for (var s = !1, c = i.child; c;) {
					if (c === n) {
						s = !0, n = i, r = a;
						break;
					}
					if (c === r) {
						s = !0, r = i, n = a;
						break;
					}
					c = c.sibling;
				}
				if (!s) {
					for (c = a.child; c;) {
						if (c === n) {
							s = !0, n = a, r = i;
							break;
						}
						if (c === r) {
							s = !0, r = a, n = i;
							break;
						}
						c = c.sibling;
					}
					if (!s) throw Error(o(189));
				}
			}
			if (n.alternate !== r) throw Error(o(190));
		}
		if (n.tag !== 3) throw Error(o(188));
		return n.stateNode.current === n ? e : t;
	}
	function m(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = m(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var h = Object.assign, g = Symbol.for("react.element"), _ = Symbol.for("react.transitional.element"), v = Symbol.for("react.portal"), y = Symbol.for("react.fragment"), b = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), S = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), ee = Symbol.for("react.suspense"), T = Symbol.for("react.suspense_list"), te = Symbol.for("react.memo"), E = Symbol.for("react.lazy"), ne = Symbol.for("react.activity"), re = Symbol.for("react.memo_cache_sentinel"), D = Symbol.iterator;
	function O(e) {
		return typeof e != "object" || !e ? null : (e = D && e[D] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ie = Symbol.for("react.client.reference");
	function ae(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ie ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case y: return "Fragment";
			case x: return "Profiler";
			case b: return "StrictMode";
			case ee: return "Suspense";
			case T: return "SuspenseList";
			case ne: return "Activity";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case v: return "Portal";
			case C: return e.displayName || "Context";
			case S: return (e._context.displayName || "Context") + ".Consumer";
			case w:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case te: return t = e.displayName || null, t === null ? ae(e.type) || "Memo" : t;
			case E:
				t = e._payload, e = e._init;
				try {
					return ae(e(t));
				} catch {}
		}
		return null;
	}
	var k = Array.isArray, A = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, j = i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, oe = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, M = [], N = -1;
	function se(e) {
		return { current: e };
	}
	function ce(e) {
		0 > N || (e.current = M[N], M[N] = null, N--);
	}
	function P(e, t) {
		N++, M[N] = e.current, e.current = t;
	}
	var F = se(null), le = se(null), I = se(null), ue = se(null);
	function de(e, t) {
		switch (P(I, t), P(le, e), P(F, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? Vd(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = Vd(t), e = Hd(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		ce(F), P(F, e);
	}
	function fe() {
		ce(F), ce(le), ce(I);
	}
	function pe(e) {
		e.memoizedState !== null && P(ue, e);
		var t = F.current, n = Hd(t, e.type);
		t !== n && (P(le, e), P(F, n));
	}
	function me(e) {
		le.current === e && (ce(F), ce(le)), ue.current === e && (ce(ue), Qf._currentValue = oe);
	}
	var he, ge;
	function _e(e) {
		if (he === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			he = t && t[1] || "", ge = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + he + e + ge;
	}
	var ve = !1;
	function ye(e, t) {
		if (!e || ve) return "";
		ve = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							e.call(n.prototype);
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			ve = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? _e(n) : "";
	}
	function be(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return _e(e.type);
			case 16: return _e("Lazy");
			case 13: return e.child !== t && t !== null ? _e("Suspense Fallback") : _e("Suspense");
			case 19: return _e("SuspenseList");
			case 0:
			case 15: return ye(e.type, !1);
			case 11: return ye(e.type.render, !1);
			case 1: return ye(e.type, !0);
			case 31: return _e("Activity");
			default: return "";
		}
	}
	function xe(e) {
		try {
			var t = "", n = null;
			do
				t += be(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Se = Object.prototype.hasOwnProperty, Ce = t.unstable_scheduleCallback, we = t.unstable_cancelCallback, Te = t.unstable_shouldYield, Ee = t.unstable_requestPaint, De = t.unstable_now, Oe = t.unstable_getCurrentPriorityLevel, ke = t.unstable_ImmediatePriority, Ae = t.unstable_UserBlockingPriority, je = t.unstable_NormalPriority, Me = t.unstable_LowPriority, Ne = t.unstable_IdlePriority, Pe = t.log, Fe = t.unstable_setDisableYieldValue, Ie = null, Le = null;
	function Re(e) {
		if (typeof Pe == "function" && Fe(e), Le && typeof Le.setStrictMode == "function") try {
			Le.setStrictMode(Ie, e);
		} catch {}
	}
	var ze = Math.clz32 ? Math.clz32 : He, Be = Math.log, Ve = Math.LN2;
	function He(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Be(e) / Ve | 0) | 0;
	}
	var Ue = 256, We = 262144, Ge = 4194304;
	function Ke(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & 261888;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function qe(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = Ke(n))) : i = Ke(o) : i = Ke(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = Ke(n))) : i = Ke(o)) : i = Ke(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function Je(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function L(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function Ye() {
		var e = Ge;
		return Ge <<= 1, !(Ge & 62914560) && (Ge = 4194304), e;
	}
	function Xe(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Ze(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function Qe(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - ze(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && $e(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function $e(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - ze(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function et(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - ze(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function tt(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : nt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function nt(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function rt(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function it() {
		var e = j.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : mp(e.type)) : e;
	}
	function at(e, t) {
		var n = j.p;
		try {
			return j.p = e, t();
		} finally {
			j.p = n;
		}
	}
	var ot = Math.random().toString(36).slice(2), R = "__reactFiber$" + ot, st = "__reactProps$" + ot, ct = "__reactContainer$" + ot, lt = "__reactEvents$" + ot, ut = "__reactListeners$" + ot, dt = "__reactHandles$" + ot, ft = "__reactResources$" + ot, pt = "__reactMarker$" + ot;
	function mt(e) {
		delete e[R], delete e[st], delete e[lt], delete e[ut], delete e[dt];
	}
	function ht(e) {
		var t = e[R];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[ct] || n[R]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = df(e); e !== null;) {
					if (n = e[R]) return n;
					e = df(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function gt(e) {
		if (e = e[R] || e[ct]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function _t(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(o(33));
	}
	function vt(e) {
		var t = e[ft];
		return t ||= e[ft] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function z(e) {
		e[pt] = !0;
	}
	var yt = /* @__PURE__ */ new Set(), bt = {};
	function xt(e, t) {
		St(e, t), St(e + "Capture", t);
	}
	function St(e, t) {
		for (bt[e] = t, e = 0; e < t.length; e++) yt.add(t[e]);
	}
	var Ct = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), wt = {}, Tt = {};
	function Et(e) {
		return Se.call(Tt, e) ? !0 : Se.call(wt, e) ? !1 : Ct.test(e) ? Tt[e] = !0 : (wt[e] = !0, !1);
	}
	function Dt(e, t, n) {
		if (Et(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, "" + n);
			}
		}
	}
	function Ot(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, "" + n);
		}
	}
	function kt(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, "" + r);
		}
	}
	function At(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function jt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Mt(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function Nt(e) {
		if (!e._valueTracker) {
			var t = jt(e) ? "checked" : "value";
			e._valueTracker = Mt(e, t, "" + e[t]);
		}
	}
	function Pt(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = jt(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	function Ft(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var It = /[\n"\\]/g;
	function Lt(e) {
		return e.replace(It, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function Rt(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + At(t)) : e.value !== "" + At(t) && (e.value = "" + At(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : zt(e, o, At(n)) : zt(e, o, At(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + At(s) : e.removeAttribute("name");
	}
	function B(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Nt(e);
				return;
			}
			n = n == null ? "" : "" + At(n), t = t == null ? n : "" + At(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Nt(e);
	}
	function zt(e, t, n) {
		t === "number" && Ft(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function Bt(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + At(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Vt(e, t, n) {
		if (t != null && (t = "" + At(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + At(n);
	}
	function Ht(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(o(92));
				if (k(r)) {
					if (1 < r.length) throw Error(o(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = At(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Nt(e);
	}
	function Ut(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Wt = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function Gt(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Wt.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function Kt(e, t, n) {
		if (t != null && typeof t != "object") throw Error(o(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && Gt(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && Gt(e, a, t[a]);
	}
	function qt(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var Jt = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), Yt = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Xt(e) {
		return Yt.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function Zt() {}
	var Qt = null;
	function $t(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var en = null, tn = null;
	function nn(e) {
		var t = gt(e);
		if (t && (e = t.stateNode)) {
			var n = e[st] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (Rt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Lt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[st] || null;
								if (!i) throw Error(o(90));
								Rt(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Pt(r);
					}
					break a;
				case "textarea":
					Vt(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && Bt(e, !!n.multiple, t, !1);
			}
		}
	}
	var rn = !1;
	function an(e, t, n) {
		if (rn) return e(t, n);
		rn = !0;
		try {
			return e(t);
		} finally {
			if (rn = !1, (en !== null || tn !== null) && (bu(), en && (t = en, e = tn, tn = en = null, nn(t), e))) for (t = 0; t < e.length; t++) nn(e[t]);
		}
	}
	function on(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[st] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(o(231, t, typeof n));
		return n;
	}
	var sn = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), cn = !1;
	if (sn) try {
		var ln = {};
		Object.defineProperty(ln, "passive", { get: function() {
			cn = !0;
		} }), window.addEventListener("test", ln, ln), window.removeEventListener("test", ln, ln);
	} catch {
		cn = !1;
	}
	var un = null, dn = null, fn = null;
	function pn() {
		if (fn) return fn;
		var e, t = dn, n = t.length, r, i = "value" in un ? un.value : un.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return fn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function mn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function hn() {
		return !0;
	}
	function gn() {
		return !1;
	}
	function _n(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? hn : gn, this.isPropagationStopped = gn, this;
		}
		return h(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = hn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = hn);
			},
			persist: function() {},
			isPersistent: hn
		}), t;
	}
	var vn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, yn = _n(vn), bn = h({}, vn, {
		view: 0,
		detail: 0
	}), xn = _n(bn), Sn, Cn, wn, Tn = h({}, bn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: In,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== wn && (wn && e.type === "mousemove" ? (Sn = e.screenX - wn.screenX, Cn = e.screenY - wn.screenY) : Cn = Sn = 0, wn = e), Sn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Cn;
		}
	}), En = _n(Tn), Dn = _n(h({}, Tn, { dataTransfer: 0 })), On = _n(h({}, bn, { relatedTarget: 0 })), kn = _n(h({}, vn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), An = _n(h({}, vn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), jn = _n(h({}, vn, { data: 0 })), Mn = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, Nn = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, Pn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Fn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Pn[e]) ? !!t[e] : !1;
	}
	function In() {
		return Fn;
	}
	var Ln = _n(h({}, bn, {
		key: function(e) {
			if (e.key) {
				var t = Mn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = mn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Nn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: In,
		charCode: function(e) {
			return e.type === "keypress" ? mn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? mn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Rn = _n(h({}, Tn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), zn = _n(h({}, bn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: In
	})), Bn = _n(h({}, vn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Vn = _n(h({}, Tn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Hn = _n(h({}, vn, {
		newState: 0,
		oldState: 0
	})), Un = [
		9,
		13,
		27,
		32
	], Wn = sn && "CompositionEvent" in window, Gn = null;
	sn && "documentMode" in document && (Gn = document.documentMode);
	var Kn = sn && "TextEvent" in window && !Gn, qn = sn && (!Wn || Gn && 8 < Gn && 11 >= Gn), Jn = " ", Yn = !1;
	function Xn(e, t) {
		switch (e) {
			case "keyup": return Un.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Zn(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Qn = !1;
	function $n(e, t) {
		switch (e) {
			case "compositionend": return Zn(t);
			case "keypress": return t.which === 32 ? (Yn = !0, Jn) : null;
			case "textInput": return e = t.data, e === Jn && Yn ? null : e;
			default: return null;
		}
	}
	function er(e, t) {
		if (Qn) return e === "compositionend" || !Wn && Xn(e, t) ? (e = pn(), fn = dn = un = null, Qn = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return qn && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var tr = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function nr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!tr[e.type] : t === "textarea";
	}
	function rr(e, t, n, r) {
		en ? tn ? tn.push(r) : tn = [r] : en = r, t = Ed(t, "onChange"), 0 < t.length && (n = new yn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var ir = null, ar = null;
	function or(e) {
		yd(e, 0);
	}
	function sr(e) {
		if (Pt(_t(e))) return e;
	}
	function cr(e, t) {
		if (e === "change") return t;
	}
	var lr = !1;
	if (sn) {
		var ur;
		if (sn) {
			var dr = "oninput" in document;
			if (!dr) {
				var fr = document.createElement("div");
				fr.setAttribute("oninput", "return;"), dr = typeof fr.oninput == "function";
			}
			ur = dr;
		} else ur = !1;
		lr = ur && (!document.documentMode || 9 < document.documentMode);
	}
	function pr() {
		ir && (ir.detachEvent("onpropertychange", mr), ar = ir = null);
	}
	function mr(e) {
		if (e.propertyName === "value" && sr(ar)) {
			var t = [];
			rr(t, ar, e, $t(e)), an(or, t);
		}
	}
	function hr(e, t, n) {
		e === "focusin" ? (pr(), ir = t, ar = n, ir.attachEvent("onpropertychange", mr)) : e === "focusout" && pr();
	}
	function gr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return sr(ar);
	}
	function _r(e, t) {
		if (e === "click") return sr(t);
	}
	function vr(e, t) {
		if (e === "input" || e === "change") return sr(t);
	}
	function yr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var br = typeof Object.is == "function" ? Object.is : yr;
	function xr(e, t) {
		if (br(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Se.call(t, i) || !br(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Sr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Cr(e, t) {
		var n = Sr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Sr(n);
		}
	}
	function wr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? wr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Tr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Ft(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Ft(e.document);
		}
		return t;
	}
	function Er(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Dr = sn && "documentMode" in document && 11 >= document.documentMode, Or = null, kr = null, Ar = null, jr = !1;
	function Mr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		jr || Or == null || Or !== Ft(r) || (r = Or, "selectionStart" in r && Er(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Ar && xr(Ar, r) || (Ar = r, r = Ed(kr, "onSelect"), 0 < r.length && (t = new yn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Or)));
	}
	function Nr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Pr = {
		animationend: Nr("Animation", "AnimationEnd"),
		animationiteration: Nr("Animation", "AnimationIteration"),
		animationstart: Nr("Animation", "AnimationStart"),
		transitionrun: Nr("Transition", "TransitionRun"),
		transitionstart: Nr("Transition", "TransitionStart"),
		transitioncancel: Nr("Transition", "TransitionCancel"),
		transitionend: Nr("Transition", "TransitionEnd")
	}, Fr = {}, Ir = {};
	sn && (Ir = document.createElement("div").style, "AnimationEvent" in window || (delete Pr.animationend.animation, delete Pr.animationiteration.animation, delete Pr.animationstart.animation), "TransitionEvent" in window || delete Pr.transitionend.transition);
	function Lr(e) {
		if (Fr[e]) return Fr[e];
		if (!Pr[e]) return e;
		var t = Pr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Ir) return Fr[e] = t[n];
		return e;
	}
	var Rr = Lr("animationend"), zr = Lr("animationiteration"), Br = Lr("animationstart"), Vr = Lr("transitionrun"), Hr = Lr("transitionstart"), Ur = Lr("transitioncancel"), Wr = Lr("transitionend"), Gr = /* @__PURE__ */ new Map(), Kr = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	Kr.push("scrollEnd");
	function qr(e, t) {
		Gr.set(e, t), xt(t, [e]);
	}
	var Jr = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, Yr = [], Xr = 0, Zr = 0;
	function Qr() {
		for (var e = Xr, t = Zr = Xr = 0; t < e;) {
			var n = Yr[t];
			Yr[t++] = null;
			var r = Yr[t];
			Yr[t++] = null;
			var i = Yr[t];
			Yr[t++] = null;
			var a = Yr[t];
			if (Yr[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && ni(n, i, a);
		}
	}
	function $r(e, t, n, r) {
		Yr[Xr++] = e, Yr[Xr++] = t, Yr[Xr++] = n, Yr[Xr++] = r, Zr |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function ei(e, t, n, r) {
		return $r(e, t, n, r), ri(e);
	}
	function ti(e, t) {
		return $r(e, null, null, t), ri(e);
	}
	function ni(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - ze(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function ri(e) {
		if (50 < du) throw du = 0, fu = null, Error(o(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var ii = {};
	function ai(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function oi(e, t, n, r) {
		return new ai(e, t, n, r);
	}
	function si(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function ci(e, t) {
		var n = e.alternate;
		return n === null ? (n = oi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function li(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function ui(e, t, n, r, i, a) {
		var s = 0;
		if (r = e, typeof e == "function") si(e) && (s = 1);
		else if (typeof e == "string") s = Uf(e, n, F.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case ne: return e = oi(31, n, t, i), e.elementType = ne, e.lanes = a, e;
			case y: return di(n.children, i, a, t);
			case b:
				s = 8, i |= 24;
				break;
			case x: return e = oi(12, n, t, i | 2), e.elementType = x, e.lanes = a, e;
			case ee: return e = oi(13, n, t, i), e.elementType = ee, e.lanes = a, e;
			case T: return e = oi(19, n, t, i), e.elementType = T, e.lanes = a, e;
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case C:
						s = 10;
						break a;
					case S:
						s = 9;
						break a;
					case w:
						s = 11;
						break a;
					case te:
						s = 14;
						break a;
					case E:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(o(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = oi(s, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function di(e, t, n, r) {
		return e = oi(7, e, r, t), e.lanes = n, e;
	}
	function fi(e, t, n) {
		return e = oi(6, e, null, t), e.lanes = n, e;
	}
	function pi(e) {
		var t = oi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function mi(e, t, n) {
		return t = oi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var hi = /* @__PURE__ */ new WeakMap();
	function gi(e, t) {
		if (typeof e == "object" && e) {
			var n = hi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: xe(t)
			}, hi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: xe(t)
		};
	}
	var _i = [], vi = 0, yi = null, bi = 0, xi = [], Si = 0, Ci = null, wi = 1, Ti = "";
	function Ei(e, t) {
		_i[vi++] = bi, _i[vi++] = yi, yi = e, bi = t;
	}
	function Di(e, t, n) {
		xi[Si++] = wi, xi[Si++] = Ti, xi[Si++] = Ci, Ci = e;
		var r = wi;
		e = Ti;
		var i = 32 - ze(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - ze(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, wi = 1 << 32 - ze(t) + i | n << i | r, Ti = a + e;
		} else wi = 1 << a | n << i | r, Ti = e;
	}
	function Oi(e) {
		e.return !== null && (Ei(e, 1), Di(e, 1, 0));
	}
	function ki(e) {
		for (; e === yi;) yi = _i[--vi], _i[vi] = null, bi = _i[--vi], _i[vi] = null;
		for (; e === Ci;) Ci = xi[--Si], xi[Si] = null, Ti = xi[--Si], xi[Si] = null, wi = xi[--Si], xi[Si] = null;
	}
	function Ai(e, t) {
		xi[Si++] = wi, xi[Si++] = Ti, xi[Si++] = Ci, wi = t.id, Ti = t.overflow, Ci = e;
	}
	var ji = null, V = null, H = !1, Mi = null, Ni = !1, Pi = Error(o(519));
	function Fi(e) {
		throw Vi(gi(Error(o(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), Pi;
	}
	function Ii(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[R] = e, t[st] = r, n) {
			case "dialog":
				Q("cancel", t), Q("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Q("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < _d.length; n++) Q(_d[n], t);
				break;
			case "source":
				Q("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Q("error", t), Q("load", t);
				break;
			case "details":
				Q("toggle", t);
				break;
			case "input":
				Q("invalid", t), B(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), Ht(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Md(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = Zt), t = !0) : t = !1, t || Fi(e, !0);
	}
	function Li(e) {
		for (ji = e.return; ji;) switch (ji.tag) {
			case 5:
			case 31:
			case 13:
				Ni = !1;
				return;
			case 27:
			case 3:
				Ni = !0;
				return;
			default: ji = ji.return;
		}
	}
	function Ri(e) {
		if (e !== ji) return !1;
		if (!H) return Li(e), H = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || Ud(e.type, e.memoizedProps)), n = !n), n && V && Fi(e), Li(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(317));
			V = uf(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(317));
			V = uf(e);
		} else t === 27 ? (t = V, Zd(e.type) ? (e = lf, lf = null, V = e) : V = t) : V = ji ? cf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function zi() {
		V = ji = null, H = !1;
	}
	function Bi() {
		var e = Mi;
		return e !== null && (Zl === null ? Zl = e : Zl.push.apply(Zl, e), Mi = null), e;
	}
	function Vi(e) {
		Mi === null ? Mi = [e] : Mi.push(e);
	}
	var Hi = se(null), Ui = null, Wi = null;
	function Gi(e, t, n) {
		P(Hi, t._currentValue), t._currentValue = n;
	}
	function Ki(e) {
		e._currentValue = Hi.current, ce(Hi);
	}
	function qi(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Ji(e, t, n, r) {
		var i = e.child;
		for (i !== null && (i.return = e); i !== null;) {
			var a = i.dependencies;
			if (a !== null) {
				var s = i.child;
				a = a.firstContext;
				a: for (; a !== null;) {
					var c = a;
					a = i;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						a.lanes |= n, c = a.alternate, c !== null && (c.lanes |= n), qi(a.return, n, e), r || (s = null);
						break a;
					}
					a = c.next;
				}
			} else if (i.tag === 18) {
				if (s = i.return, s === null) throw Error(o(341));
				s.lanes |= n, a = s.alternate, a !== null && (a.lanes |= n), qi(s, n, e), s = null;
			} else s = i.child;
			if (s !== null) s.return = i;
			else for (s = i; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (i = s.sibling, i !== null) {
					i.return = s.return, s = i;
					break;
				}
				s = s.return;
			}
			i = s;
		}
	}
	function Yi(e, t, n, r) {
		e = null;
		for (var i = t, a = !1; i !== null;) {
			if (!a) {
				if (i.flags & 524288) a = !0;
				else if (i.flags & 262144) break;
			}
			if (i.tag === 10) {
				var s = i.alternate;
				if (s === null) throw Error(o(387));
				if (s = s.memoizedProps, s !== null) {
					var c = i.type;
					br(i.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === ue.current) {
				if (s = i.alternate, s === null) throw Error(o(387));
				s.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [Qf] : e.push(Qf));
			}
			i = i.return;
		}
		e !== null && Ji(t, e, n, r), t.flags |= 262144;
	}
	function Xi(e) {
		for (e = e.firstContext; e !== null;) {
			if (!br(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Zi(e) {
		Ui = e, Wi = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function Qi(e) {
		return ea(Ui, e);
	}
	function $i(e, t) {
		return Ui === null && Zi(e), ea(e, t);
	}
	function ea(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, Wi === null) {
			if (e === null) throw Error(o(308));
			Wi = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else Wi = Wi.next = t;
		return n;
	}
	var ta = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, na = t.unstable_scheduleCallback, ra = t.unstable_NormalPriority, ia = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function aa() {
		return {
			controller: new ta(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function oa(e) {
		e.refCount--, e.refCount === 0 && na(ra, function() {
			e.controller.abort();
		});
	}
	var sa = null, ca = 0, la = 0, ua = null;
	function da(e, t) {
		if (sa === null) {
			var n = sa = [];
			ca = 0, la = dd(), ua = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return ca++, t.then(fa, fa), t;
	}
	function fa() {
		if (--ca === 0 && sa !== null) {
			ua !== null && (ua.status = "fulfilled");
			var e = sa;
			sa = null, la = 0, ua = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function pa(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var ma = A.S;
	A.S = function(e, t) {
		eu = De(), typeof t == "object" && t && typeof t.then == "function" && da(e, t), ma !== null && ma(e, t);
	};
	var ha = se(null);
	function ga() {
		var e = ha.current;
		return e === null ? q.pooledCache : e;
	}
	function _a(e, t) {
		t === null ? P(ha, ha.current) : P(ha, t.pool);
	}
	function va() {
		var e = ga();
		return e === null ? null : {
			parent: ia._currentValue,
			pool: e
		};
	}
	var ya = Error(o(460)), ba = Error(o(474)), xa = Error(o(542)), Sa = { then: function() {} };
	function Ca(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function wa(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Zt, Zt), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Oa(e), e;
			default:
				if (typeof t.status == "string") t.then(Zt, Zt);
				else {
					if (e = q, e !== null && 100 < e.shellSuspendCounter) throw Error(o(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, Oa(e), e;
				}
				throw Ea = t, ya;
		}
	}
	function Ta(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Ea = e, ya) : e;
		}
	}
	var Ea = null;
	function Da() {
		if (Ea === null) throw Error(o(459));
		var e = Ea;
		return Ea = null, e;
	}
	function Oa(e) {
		if (e === ya || e === xa) throw Error(o(483));
	}
	var ka = null, Aa = 0;
	function ja(e) {
		var t = Aa;
		return Aa += 1, ka === null && (ka = []), wa(ka, e, t);
	}
	function Ma(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function Na(e, t) {
		throw t.$$typeof === g ? Error(o(525)) : (e = Object.prototype.toString.call(t), Error(o(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function Pa(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function i(e, t) {
			return e = ci(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = fi(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === E && Ta(a) === t.type) ? (t = i(t, n.props), Ma(t, n), t.return = e, t) : (t = ui(n.type, n.key, n.props, null, e.mode, r), Ma(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = mi(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = di(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = fi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case _: return n = ui(t.type, t.key, t.props, null, e.mode, n), Ma(n, t), n.return = e, n;
					case v: return t = mi(t, e.mode, n), t.return = e, t;
					case E: return t = Ta(t), f(e, t, n);
				}
				if (k(t) || O(t)) return t = di(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, ja(t), n);
				if (t.$$typeof === C) return f(e, $i(e, t), n);
				Na(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case _: return n.key === i ? l(e, t, n, r) : null;
					case v: return n.key === i ? u(e, t, n, r) : null;
					case E: return n = Ta(n), p(e, t, n, r);
				}
				if (k(n) || O(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, ja(n), r);
				if (n.$$typeof === C) return p(e, t, $i(e, n), r);
				Na(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case _: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case v: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case E: return r = Ta(r), m(e, t, n, r, i);
				}
				if (k(r) || O(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, ja(r), i);
				if (r.$$typeof === C) return m(e, t, n, $i(t, r), i);
				Na(t, r);
			}
			return null;
		}
		function h(i, o, s, c) {
			for (var l = null, u = null, d = o, h = o = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), o = a(_, o, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), H && Ei(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return H && Ei(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), H && Ei(i, h), l;
		}
		function g(i, s, c, l) {
			if (c == null) throw Error(o(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(i, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(i, h), s = a(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(i, h), H && Ei(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (s = a(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return H && Ei(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), s = a(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), H && Ei(i, g), u;
		}
		function b(e, r, a, c) {
			if (typeof a == "object" && a && a.type === y && a.key === null && (a = a.props.children), typeof a == "object" && a) {
				switch (a.$$typeof) {
					case _:
						a: {
							for (var l = a.key; r !== null;) {
								if (r.key === l) {
									if (l = a.type, l === y) {
										if (r.tag === 7) {
											n(e, r.sibling), c = i(r, a.props.children), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === E && Ta(l) === r.type) {
										n(e, r.sibling), c = i(r, a.props), Ma(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							a.type === y ? (c = di(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = ui(a.type, a.key, a.props, null, e.mode, c), Ma(c, a), c.return = e, e = c);
						}
						return s(e);
					case v:
						a: {
							for (l = a.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === a.containerInfo && r.stateNode.implementation === a.implementation) {
										n(e, r.sibling), c = i(r, a.children || []), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							c = mi(a, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case E: return a = Ta(a), b(e, r, a, c);
				}
				if (k(a)) return h(e, r, a, c);
				if (O(a)) {
					if (l = O(a), typeof l != "function") throw Error(o(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return b(e, r, ja(a), c);
				if (a.$$typeof === C) return b(e, r, $i(e, a), c);
				Na(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = fi(a, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				Aa = 0;
				var i = b(e, t, n, r);
				return ka = null, i;
			} catch (t) {
				if (t === ya || t === xa) throw t;
				var a = oi(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var Fa = Pa(!0), Ia = Pa(!1), La = !1;
	function Ra(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function za(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function Ba(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function Va(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, K & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = ri(e), ni(e, null, n), t;
		}
		return $r(e, r, t, n), ri(e);
	}
	function Ha(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, et(e, n);
		}
	}
	function Ua(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
			return;
		}
		e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var Wa = !1;
	function Ga() {
		if (Wa) {
			var e = ua;
			if (e !== null) throw e;
		}
	}
	function Ka(e, t, n, r) {
		Wa = !1;
		var i = e.updateQueue;
		La = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (Y & f) === f : (r & f) === f) {
					f !== 0 && f === la && (Wa = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, g = s;
						f = t;
						var _ = n;
						switch (g.tag) {
							case 1:
								if (m = g.payload, typeof m == "function") {
									d = m.call(_, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = g.payload, f = typeof m == "function" ? m.call(_, d, f) : m, f == null) break a;
								d = h({}, d, f);
								break a;
							case 2: La = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), Gl |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function qa(e, t) {
		if (typeof e != "function") throw Error(o(191, e));
		e.call(t);
	}
	function Ja(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) qa(n[e], t);
	}
	var Ya = se(null), Xa = se(0);
	function Za(e, t) {
		e = Ul, P(Xa, e), P(Ya, t), Ul = e | t.baseLanes;
	}
	function Qa() {
		P(Xa, Ul), P(Ya, Ya.current);
	}
	function $a() {
		Ul = Xa.current, ce(Ya), ce(Xa);
	}
	var eo = se(null), to = null;
	function no(e) {
		var t = e.alternate;
		P(so, so.current & 1), P(eo, e), to === null && (t === null || Ya.current !== null || t.memoizedState !== null) && (to = e);
	}
	function ro(e) {
		P(so, so.current), P(eo, e), to === null && (to = e);
	}
	function io(e) {
		e.tag === 22 ? (P(so, so.current), P(eo, e), to === null && (to = e)) : ao(e);
	}
	function ao() {
		P(so, so.current), P(eo, eo.current);
	}
	function oo(e) {
		ce(eo), to === e && (to = null), ce(so);
	}
	var so = se(0);
	function co(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || af(n) || of(n))) return t;
			} else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var lo = 0, U = null, W = null, uo = null, fo = !1, po = !1, mo = !1, ho = 0, go = 0, _o = null, vo = 0;
	function yo() {
		throw Error(o(321));
	}
	function bo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!br(e[n], t[n])) return !1;
		return !0;
	}
	function xo(e, t, n, r, i, a) {
		return lo = a, U = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, A.H = e === null || e.memoizedState === null ? Rs : zs, mo = !1, a = n(r, i), mo = !1, po && (a = Co(t, n, r, i)), So(e), a;
	}
	function So(e) {
		A.H = Ls;
		var t = W !== null && W.next !== null;
		if (lo = 0, uo = W = U = null, fo = !1, go = 0, _o = null, t) throw Error(o(300));
		e === null || nc || (e = e.dependencies, e !== null && Xi(e) && (nc = !0));
	}
	function Co(e, t, n, r) {
		U = e;
		var i = 0;
		do {
			if (po && (_o = null), go = 0, po = !1, 25 <= i) throw Error(o(301));
			if (i += 1, uo = W = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			A.H = Bs, a = t(n, r);
		} while (po);
		return a;
	}
	function wo() {
		var e = A.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? jo(t) : t, e = e.useState()[0], (W === null ? null : W.memoizedState) !== e && (U.flags |= 1024), t;
	}
	function To() {
		var e = ho !== 0;
		return ho = 0, e;
	}
	function Eo(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function Do(e) {
		if (fo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			fo = !1;
		}
		lo = 0, uo = W = U = null, po = !1, go = ho = 0, _o = null;
	}
	function Oo() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return uo === null ? U.memoizedState = uo = e : uo = uo.next = e, uo;
	}
	function ko() {
		if (W === null) {
			var e = U.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = W.next;
		var t = uo === null ? U.memoizedState : uo.next;
		if (t !== null) uo = t, W = e;
		else {
			if (e === null) throw U.alternate === null ? Error(o(467)) : Error(o(310));
			W = e, e = {
				memoizedState: W.memoizedState,
				baseState: W.baseState,
				baseQueue: W.baseQueue,
				queue: W.queue,
				next: null
			}, uo === null ? U.memoizedState = uo = e : uo = uo.next = e;
		}
		return uo;
	}
	function Ao() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function jo(e) {
		var t = go;
		return go += 1, _o === null && (_o = []), e = wa(_o, e, t), t = U, (uo === null ? t.memoizedState : uo.next) === null && (t = t.alternate, A.H = t === null || t.memoizedState === null ? Rs : zs), e;
	}
	function Mo(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return jo(e);
			if (e.$$typeof === C) return Qi(e);
		}
		throw Error(o(438, String(e)));
	}
	function No(e) {
		var t = null, n = U.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = U.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = Ao(), U.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = re;
		return t.index++, n;
	}
	function Po(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Fo(e) {
		return Io(ko(), W, e);
	}
	function Io(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(o(311));
		r.lastRenderedReducer = n;
		var i = e.baseQueue, a = r.pending;
		if (a !== null) {
			if (i !== null) {
				var s = i.next;
				i.next = a.next, a.next = s;
			}
			t.baseQueue = i = a, r.pending = null;
		}
		if (a = e.baseState, i === null) e.memoizedState = a;
		else {
			t = i.next;
			var c = s = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (lo & f) === f : (Y & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === la && (d = !0);
					else if ((lo & p) === p) {
						u = u.next, p === la && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = a) : l = l.next = f, U.lanes |= p, Gl |= p;
					f = u.action, mo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = a) : l = l.next = p, U.lanes |= f, Gl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = a : l.next = c, !br(a, e.memoizedState) && (nc = !0, d && (n = ua, n !== null))) throw n;
			e.memoizedState = a, e.baseState = s, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function Lo(e) {
		var t = ko(), n = t.queue;
		if (n === null) throw Error(o(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var s = i = i.next;
			do
				a = e(a, s.action), s = s.next;
			while (s !== i);
			br(a, t.memoizedState) || (nc = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function Ro(e, t, n) {
		var r = U, i = ko(), a = H;
		if (a) {
			if (n === void 0) throw Error(o(407));
			n = n();
		} else n = t();
		var s = !br((W || i).memoizedState, n);
		if (s && (i.memoizedState = n, nc = !0), i = i.queue, ls(Vo.bind(null, r, i, e), [e]), i.getSnapshot !== t || s || uo !== null && uo.memoizedState.tag & 1) {
			if (r.flags |= 2048, is(9, { destroy: void 0 }, Bo.bind(null, r, i, n, t), null), q === null) throw Error(o(349));
			a || lo & 127 || zo(r, t, n);
		}
		return n;
	}
	function zo(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = U.updateQueue, t === null ? (t = Ao(), U.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Bo(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Ho(t) && Uo(e);
	}
	function Vo(e, t, n) {
		return n(function() {
			Ho(t) && Uo(e);
		});
	}
	function Ho(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !br(e, n);
		} catch {
			return !0;
		}
	}
	function Uo(e) {
		var t = ti(e, 2);
		t !== null && hu(t, e, 2);
	}
	function Wo(e) {
		var t = Oo();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), mo) {
				Re(!0);
				try {
					n();
				} finally {
					Re(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Po,
			lastRenderedState: e
		}, t;
	}
	function Go(e, t, n, r) {
		return e.baseState = n, Io(e, W, typeof r == "function" ? r : Po);
	}
	function Ko(e, t, n, r, i) {
		if (Ps(e)) throw Error(o(485));
		if (e = t.action, e !== null) {
			var a = {
				payload: i,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					a.listeners.push(e);
				}
			};
			A.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, qo(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function qo(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = A.T, o = {};
			A.T = o;
			try {
				var s = n(i, r), c = A.S;
				c !== null && c(o, s), Jo(e, t, s);
			} catch (n) {
				Xo(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), A.T = a;
			}
		} else try {
			a = n(i, r), Jo(e, t, a);
		} catch (n) {
			Xo(e, t, n);
		}
	}
	function Jo(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Yo(e, t, n);
		}, function(n) {
			return Xo(e, t, n);
		}) : Yo(e, t, n);
	}
	function Yo(e, t, n) {
		t.status = "fulfilled", t.value = n, Zo(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, qo(e, n)));
	}
	function Xo(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Zo(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Zo(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Qo(e, t) {
		return t;
	}
	function $o(e, t) {
		if (H) {
			var n = q.formState;
			if (n !== null) {
				a: {
					var r = U;
					if (H) {
						if (V) {
							b: {
								for (var i = V, a = Ni; i.nodeType !== 8;) {
									if (!a) {
										i = null;
										break b;
									}
									if (i = cf(i.nextSibling), i === null) {
										i = null;
										break b;
									}
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								V = cf(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						Fi(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = Oo(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Qo,
			lastRenderedState: t
		}, n.queue = r, n = js.bind(null, U, r), r.dispatch = n, r = Wo(!1), a = Ns.bind(null, U, !1, r.queue), r = Oo(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Ko.bind(null, U, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function es(e) {
		return ts(ko(), W, e);
	}
	function ts(e, t, n) {
		if (t = Io(e, t, Qo)[0], e = Fo(Po)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = jo(t);
		} catch (e) {
			throw e === ya ? xa : e;
		}
		else r = t;
		t = ko();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (U.flags |= 2048, is(9, { destroy: void 0 }, ns.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function ns(e, t) {
		e.action = t;
	}
	function rs(e) {
		var t = ko(), n = W;
		if (n !== null) return ts(t, n, e);
		ko(), t = t.memoizedState, n = ko();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function is(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = U.updateQueue, t === null && (t = Ao(), U.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function as() {
		return ko().memoizedState;
	}
	function os(e, t, n, r) {
		var i = Oo();
		U.flags |= e, i.memoizedState = is(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function ss(e, t, n, r) {
		var i = ko();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		W !== null && r !== null && bo(r, W.memoizedState.deps) ? i.memoizedState = is(t, a, n, r) : (U.flags |= e, i.memoizedState = is(1 | t, a, n, r));
	}
	function cs(e, t) {
		os(8390656, 8, e, t);
	}
	function ls(e, t) {
		ss(2048, 8, e, t);
	}
	function us(e) {
		U.flags |= 4;
		var t = U.updateQueue;
		if (t === null) t = Ao(), U.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function ds(e) {
		var t = ko().memoizedState;
		return us({
			ref: t,
			nextImpl: e
		}), function() {
			if (K & 2) throw Error(o(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function fs(e, t) {
		return ss(4, 2, e, t);
	}
	function ps(e, t) {
		return ss(4, 4, e, t);
	}
	function ms(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function hs(e, t, n) {
		n = n == null ? null : n.concat([e]), ss(4, 4, ms.bind(null, t, e), n);
	}
	function gs() {}
	function _s(e, t) {
		var n = ko();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && bo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function vs(e, t) {
		var n = ko();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && bo(t, r[1])) return r[0];
		if (r = e(), mo) {
			Re(!0);
			try {
				e();
			} finally {
				Re(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function ys(e, t, n) {
		return n === void 0 || lo & 1073741824 && !(Y & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = mu(), U.lanes |= e, Gl |= e, n);
	}
	function bs(e, t, n, r) {
		return br(n, t) ? n : Ya.current === null ? !(lo & 42) || lo & 1073741824 && !(Y & 261930) ? (nc = !0, e.memoizedState = n) : (e = mu(), U.lanes |= e, Gl |= e, t) : (e = ys(e, n, r), br(e, t) || (nc = !0), e);
	}
	function xs(e, t, n, r, i) {
		var a = j.p;
		j.p = a !== 0 && 8 > a ? a : 8;
		var o = A.T, s = {};
		A.T = s, Ns(e, !1, t, n);
		try {
			var c = i(), l = A.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Ms(e, t, pa(c, r), pu(e)) : Ms(e, t, r, pu(e));
		} catch (n) {
			Ms(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, pu());
		} finally {
			j.p = a, o !== null && s.types !== null && (o.types = s.types), A.T = o;
		}
	}
	function Ss() {}
	function Cs(e, t, n, r) {
		if (e.tag !== 5) throw Error(o(476));
		var i = ws(e).queue;
		xs(e, i, t, oe, n === null ? Ss : function() {
			return Ts(e), n(r);
		});
	}
	function ws(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: oe,
			baseState: oe,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Po,
				lastRenderedState: oe
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Po,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function Ts(e) {
		var t = ws(e);
		t.next === null && (t = e.alternate.memoizedState), Ms(e, t.next.queue, {}, pu());
	}
	function Es() {
		return Qi(Qf);
	}
	function Ds() {
		return ko().memoizedState;
	}
	function Os() {
		return ko().memoizedState;
	}
	function ks(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = pu();
					e = Ba(n);
					var r = Va(t, e, n);
					r !== null && (hu(r, t, n), Ha(r, t, n)), t = { cache: aa() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function As(e, t, n) {
		var r = pu();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Ps(e) ? Fs(t, n) : (n = ei(e, t, n, r), n !== null && (hu(n, e, r), Is(n, t, r)));
	}
	function js(e, t, n) {
		Ms(e, t, n, pu());
	}
	function Ms(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (Ps(e)) Fs(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, br(s, o)) return $r(e, t, i, 0), q === null && Qr(), !1;
			} catch {}
			if (n = ei(e, t, i, r), n !== null) return hu(n, e, r), Is(n, t, r), !0;
		}
		return !1;
	}
	function Ns(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: dd(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Ps(e)) {
			if (t) throw Error(o(479));
		} else t = ei(e, n, r, 2), t !== null && hu(t, e, 2);
	}
	function Ps(e) {
		var t = e.alternate;
		return e === U || t !== null && t === U;
	}
	function Fs(e, t) {
		po = fo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function Is(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, et(e, n);
		}
	}
	var Ls = {
		readContext: Qi,
		use: Mo,
		useCallback: yo,
		useContext: yo,
		useEffect: yo,
		useImperativeHandle: yo,
		useLayoutEffect: yo,
		useInsertionEffect: yo,
		useMemo: yo,
		useReducer: yo,
		useRef: yo,
		useState: yo,
		useDebugValue: yo,
		useDeferredValue: yo,
		useTransition: yo,
		useSyncExternalStore: yo,
		useId: yo,
		useHostTransitionStatus: yo,
		useFormState: yo,
		useActionState: yo,
		useOptimistic: yo,
		useMemoCache: yo,
		useCacheRefresh: yo
	};
	Ls.useEffectEvent = yo;
	var Rs = {
		readContext: Qi,
		use: Mo,
		useCallback: function(e, t) {
			return Oo().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Qi,
		useEffect: cs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), os(4194308, 4, ms.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return os(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			os(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = Oo();
			t = t === void 0 ? null : t;
			var r = e();
			if (mo) {
				Re(!0);
				try {
					e();
				} finally {
					Re(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = Oo();
			if (n !== void 0) {
				var i = n(t);
				if (mo) {
					Re(!0);
					try {
						n(t);
					} finally {
						Re(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = As.bind(null, U, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = Oo();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Wo(e);
			var t = e.queue, n = js.bind(null, U, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: gs,
		useDeferredValue: function(e, t) {
			return ys(Oo(), e, t);
		},
		useTransition: function() {
			var e = Wo(!1);
			return e = xs.bind(null, U, e.queue, !0, !1), Oo().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = U, i = Oo();
			if (H) {
				if (n === void 0) throw Error(o(407));
				n = n();
			} else {
				if (n = t(), q === null) throw Error(o(349));
				Y & 127 || zo(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, cs(Vo.bind(null, r, a, e), [e]), r.flags |= 2048, is(9, { destroy: void 0 }, Bo.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = Oo(), t = q.identifierPrefix;
			if (H) {
				var n = Ti, r = wi;
				n = (r & ~(1 << 32 - ze(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = ho++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = vo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: Es,
		useFormState: $o,
		useActionState: $o,
		useOptimistic: function(e) {
			var t = Oo();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = Ns.bind(null, U, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: No,
		useCacheRefresh: function() {
			return Oo().memoizedState = ks.bind(null, U);
		},
		useEffectEvent: function(e) {
			var t = Oo(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (K & 2) throw Error(o(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, zs = {
		readContext: Qi,
		use: Mo,
		useCallback: _s,
		useContext: Qi,
		useEffect: ls,
		useImperativeHandle: hs,
		useInsertionEffect: fs,
		useLayoutEffect: ps,
		useMemo: vs,
		useReducer: Fo,
		useRef: as,
		useState: function() {
			return Fo(Po);
		},
		useDebugValue: gs,
		useDeferredValue: function(e, t) {
			return bs(ko(), W.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Fo(Po)[0], t = ko().memoizedState;
			return [typeof e == "boolean" ? e : jo(e), t];
		},
		useSyncExternalStore: Ro,
		useId: Ds,
		useHostTransitionStatus: Es,
		useFormState: es,
		useActionState: es,
		useOptimistic: function(e, t) {
			return Go(ko(), W, e, t);
		},
		useMemoCache: No,
		useCacheRefresh: Os
	};
	zs.useEffectEvent = ds;
	var Bs = {
		readContext: Qi,
		use: Mo,
		useCallback: _s,
		useContext: Qi,
		useEffect: ls,
		useImperativeHandle: hs,
		useInsertionEffect: fs,
		useLayoutEffect: ps,
		useMemo: vs,
		useReducer: Lo,
		useRef: as,
		useState: function() {
			return Lo(Po);
		},
		useDebugValue: gs,
		useDeferredValue: function(e, t) {
			var n = ko();
			return W === null ? ys(n, e, t) : bs(n, W.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Lo(Po)[0], t = ko().memoizedState;
			return [typeof e == "boolean" ? e : jo(e), t];
		},
		useSyncExternalStore: Ro,
		useId: Ds,
		useHostTransitionStatus: Es,
		useFormState: rs,
		useActionState: rs,
		useOptimistic: function(e, t) {
			var n = ko();
			return W === null ? (n.baseState = e, [e, n.queue.dispatch]) : Go(n, W, e, t);
		},
		useMemoCache: No,
		useCacheRefresh: Os
	};
	Bs.useEffectEvent = ds;
	function Vs(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : h({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Hs = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = pu(), i = Ba(r);
			i.payload = t, n != null && (i.callback = n), t = Va(e, i, r), t !== null && (hu(t, e, r), Ha(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = pu(), i = Ba(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Va(e, i, r), t !== null && (hu(t, e, r), Ha(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = pu(), r = Ba(n);
			r.tag = 2, t != null && (r.callback = t), t = Va(e, r, n), t !== null && (hu(t, e, n), Ha(t, e, n));
		}
	};
	function Us(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !xr(n, r) || !xr(i, a) : !0;
	}
	function Ws(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Hs.enqueueReplaceState(t, t.state, null);
	}
	function Gs(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = h({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Ks(e) {
		Jr(e);
	}
	function qs(e) {
		console.error(e);
	}
	function Js(e) {
		Jr(e);
	}
	function Ys(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Xs(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Zs(e, t, n) {
		return n = Ba(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Ys(e, t);
		}, n;
	}
	function Qs(e) {
		return e = Ba(e), e.tag = 3, e;
	}
	function $s(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Xs(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Xs(t, n, r), typeof i != "function" && (ru === null ? ru = /* @__PURE__ */ new Set([this]) : ru.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function ec(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Yi(t, n, i, !0), n = eo.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return to === null ? Du() : n.alternate === null && Wl === 0 && (Wl = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === Sa ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), Gu(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === Sa ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), Gu(e, r, i)), !1;
				}
				throw Error(o(435, n.tag));
			}
			return Gu(e, r, i), Du(), !1;
		}
		if (H) return t = eo.current, t === null ? (r !== Pi && (t = Error(o(423), { cause: r }), Vi(gi(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = gi(r, n), i = Zs(e.stateNode, r, i), Ua(e, i), Wl !== 4 && (Wl = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== Pi && (e = Error(o(422), { cause: r }), Vi(gi(e, n)))), !1;
		var a = Error(o(520), { cause: r });
		if (a = gi(a, n), Xl === null ? Xl = [a] : Xl.push(a), Wl !== 4 && (Wl = 2), t === null) return !0;
		r = gi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = Zs(n.stateNode, r, e), Ua(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (ru === null || !ru.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = Qs(i), $s(i, e, n, r), Ua(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var tc = Error(o(461)), nc = !1;
	function rc(e, t, n, r) {
		t.child = e === null ? Ia(t, null, n, r) : Fa(t, e.child, n, r);
	}
	function ic(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Zi(t), r = xo(e, t, n, o, a, i), s = To(), e !== null && !nc ? (Eo(e, t, i), Oc(e, t, i)) : (H && s && Oi(t), t.flags |= 1, rc(e, t, r, i), t.child);
	}
	function ac(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !si(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, oc(e, t, a, r, i)) : (e = ui(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !kc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? xr : n, n(o, r) && e.ref === t.ref) return Oc(e, t, i);
		}
		return t.flags |= 1, e = ci(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function oc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (xr(a, r) && e.ref === t.ref) {
				if (nc = !1, t.pendingProps = r = a, kc(e, i)) e.flags & 131072 && (nc = !0);
				else return t.lanes = e.lanes, Oc(e, t, i);
			}
		}
		return mc(e, t, n, r, i);
	}
	function sc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return lc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && _a(t, a === null ? null : a.cachePool), a === null ? Qa() : Za(t, a), io(t);
			else return r = t.lanes = 536870912, lc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && _a(t, null), Qa(), ao(t)) : (_a(t, a.cachePool), Za(t, a), ao(t), t.memoizedState = null);
		return rc(e, t, i, n), t.child;
	}
	function cc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function lc(e, t, n, r, i) {
		var a = ga();
		return a = a === null ? null : {
			parent: ia._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && _a(t, null), Qa(), io(t), e !== null && Yi(e, t, r, !0), t.childLanes = i, null;
	}
	function uc(e, t) {
		return t = Cc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function dc(e, t, n) {
		return Fa(t, e.child, null, n), e = uc(t, t.pendingProps), e.flags |= 2, oo(t), t.memoizedState = null, e;
	}
	function fc(e, t, n) {
		var r = t.pendingProps, i = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (H) {
				if (r.mode === "hidden") return e = uc(t, r), t.lanes = 536870912, cc(null, e);
				if (ro(t), (e = V) ? (e = rf(e, Ni), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ci === null ? null : {
						id: wi,
						overflow: Ti
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = pi(e), n.return = t, t.child = n, ji = t, V = null)) : e = null, e === null) throw Fi(t);
				return t.lanes = 536870912, null;
			}
			return uc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var s = a.dehydrated;
			if (ro(t), i) {
				if (t.flags & 256) t.flags &= -257, t = dc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(o(558));
			} else if (nc || Yi(e, t, n, !1), i = (n & e.childLanes) !== 0, nc || i) {
				if (r = q, r !== null && (s = tt(r, n), s !== 0 && s !== a.retryLane)) throw a.retryLane = s, ti(e, s), hu(r, e, s), tc;
				Du(), t = dc(e, t, n);
			} else e = a.treeContext, V = cf(s.nextSibling), ji = t, H = !0, Mi = null, Ni = !1, e !== null && Ai(t, e), t = uc(t, r), t.flags |= 4096;
			return t;
		}
		return e = ci(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function pc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(o(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function mc(e, t, n, r, i) {
		return Zi(t), n = xo(e, t, n, r, void 0, i), r = To(), e !== null && !nc ? (Eo(e, t, i), Oc(e, t, i)) : (H && r && Oi(t), t.flags |= 1, rc(e, t, n, i), t.child);
	}
	function hc(e, t, n, r, i, a) {
		return Zi(t), t.updateQueue = null, n = Co(t, r, n, i), So(e), r = To(), e !== null && !nc ? (Eo(e, t, a), Oc(e, t, a)) : (H && r && Oi(t), t.flags |= 1, rc(e, t, n, a), t.child);
	}
	function gc(e, t, n, r, i) {
		if (Zi(t), t.stateNode === null) {
			var a = ii, o = n.contextType;
			typeof o == "object" && o && (a = Qi(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Hs, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Ra(t), o = n.contextType, a.context = typeof o == "object" && o ? Qi(o) : ii, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Vs(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Hs.enqueueReplaceState(a, a.state, null), Ka(t, r, a, i), Ga(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Gs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = ii, typeof u == "object" && u && (o = Qi(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Ws(t, a, r, o), La = !1;
			var f = t.memoizedState;
			a.state = f, Ka(t, r, a, i), Ga(), l = t.memoizedState, s || f !== l || La ? (typeof d == "function" && (Vs(t, n, d, r), l = t.memoizedState), (c = La || Us(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, za(e, t), o = t.memoizedProps, u = Gs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = ii, typeof l == "object" && l && (c = Qi(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Ws(t, a, r, c), La = !1, f = t.memoizedState, a.state = f, Ka(t, r, a, i), Ga();
			var p = t.memoizedState;
			o !== d || f !== p || La || e !== null && e.dependencies !== null && Xi(e.dependencies) ? (typeof s == "function" && (Vs(t, n, s, r), p = t.memoizedState), (u = La || Us(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Xi(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, pc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = Fa(t, e.child, null, i), t.child = Fa(t, null, n, i)) : rc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = Oc(e, t, i), e;
	}
	function _c(e, t, n, r) {
		return zi(), t.flags |= 256, rc(e, t, n, r), t.child;
	}
	var vc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function yc(e) {
		return {
			baseLanes: e,
			cachePool: va()
		};
	}
	function bc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= Jl), e;
	}
	function xc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), s;
		if ((s = a) || (s = e !== null && e.memoizedState === null ? !1 : !!(so.current & 2)), s && (i = !0, t.flags &= -129), s = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (H) {
				if (i ? no(t) : ao(t), (e = V) ? (e = rf(e, Ni), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ci === null ? null : {
						id: wi,
						overflow: Ti
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = pi(e), n.return = t, t.child = n, ji = t, V = null)) : e = null, e === null) throw Fi(t);
				return of(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? (ao(t), i = t.mode, c = Cc({
				mode: "hidden",
				children: c
			}, i), r = di(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = yc(n), r.childLanes = bc(e, s, n), t.memoizedState = vc, cc(null, r)) : (no(t), Sc(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (no(t), t.flags &= -257, t = wc(e, t, n)) : t.memoizedState === null ? (ao(t), c = r.fallback, i = t.mode, r = Cc({
				mode: "visible",
				children: r.children
			}, i), c = di(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, Fa(t, e.child, null, n), r = t.child, r.memoizedState = yc(n), r.childLanes = bc(e, s, n), t.memoizedState = vc, t = cc(null, r)) : (ao(t), t.child = e.child, t.flags |= 128, t = null);
			else if (no(t), of(c)) {
				if (s = c.nextSibling && c.nextSibling.dataset, s) var u = s.dgst;
				s = u, r = Error(o(419)), r.stack = "", r.digest = s, Vi({
					value: r,
					source: null,
					stack: null
				}), t = wc(e, t, n);
			} else if (nc || Yi(e, t, n, !1), s = (n & e.childLanes) !== 0, nc || s) {
				if (s = q, s !== null && (r = tt(s, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, ti(e, r), hu(s, e, r), tc;
				af(c) || Du(), t = wc(e, t, n);
			} else af(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, V = cf(c.nextSibling), ji = t, H = !0, Mi = null, Ni = !1, e !== null && Ai(t, e), t = Sc(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (ao(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ci(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = di(c, i, n, null), c.flags |= 2) : c = ci(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, cc(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = yc(n) : (i = c.cachePool, i === null ? i = va() : (l = ia._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = bc(e, s, n), t.memoizedState = vc, cc(e.child, r)) : (no(t), n = e.child, e = n.sibling, n = ci(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (s = t.deletions, s === null ? (t.deletions = [e], t.flags |= 16) : s.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Sc(e, t) {
		return t = Cc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Cc(e, t) {
		return e = oi(22, e, null, t), e.lanes = 0, e;
	}
	function wc(e, t, n) {
		return Fa(t, e.child, null, n), e = Sc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Tc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), qi(e.return, t, n);
	}
	function Ec(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function Dc(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = so.current, s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, P(so, o), rc(e, t, r, n), r = H ? bi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && Tc(e, n, t);
			else if (e.tag === 19) Tc(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "forwards":
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && co(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Ec(t, !1, i, n, a, r);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && co(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				Ec(t, !0, n, null, a, r);
				break;
			case "together":
				Ec(t, !1, null, null, void 0, r);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function Oc(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Gl |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (Yi(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(o(153));
		if (t.child !== null) {
			for (e = t.child, n = ci(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ci(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function kc(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && Xi(e)));
	}
	function Ac(e, t, n) {
		switch (t.tag) {
			case 3:
				de(t, t.stateNode.containerInfo), Gi(t, ia, e.memoizedState.cache), zi();
				break;
			case 27:
			case 5:
				pe(t);
				break;
			case 4:
				de(t, t.stateNode.containerInfo);
				break;
			case 10:
				Gi(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, ro(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (no(t), e = Oc(e, t, n), e === null ? null : e.sibling) : xc(e, t, n) : (no(t), t.flags |= 128, null);
				no(t);
				break;
			case 19:
				var i = !!(e.flags & 128);
				if (r = (n & t.childLanes) !== 0, r ||= (Yi(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return Dc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), P(so, so.current), r) break;
				return null;
			case 22: return t.lanes = 0, sc(e, t, n, t.pendingProps);
			case 24: Gi(t, ia, e.memoizedState.cache);
		}
		return Oc(e, t, n);
	}
	function jc(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) nc = !0;
			else {
				if (!kc(e, n) && !(t.flags & 128)) return nc = !1, Ac(e, t, n);
				nc = !!(e.flags & 131072);
			}
		} else nc = !1, H && t.flags & 1048576 && Di(t, bi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = Ta(t.elementType), t.type = e, typeof e == "function") si(e) ? (r = Gs(e, r), t.tag = 1, t = gc(null, t, e, r, n)) : (t.tag = 0, t = mc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === w) {
								t.tag = 11, t = ic(null, t, e, r, n);
								break a;
							}
							if (i === te) {
								t.tag = 14, t = ac(null, t, e, r, n);
								break a;
							}
						}
						throw t = ae(e) || e, Error(o(306, t, ""));
					}
				}
				return t;
			case 0: return mc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = Gs(r, t.pendingProps), gc(e, t, r, i, n);
			case 3:
				a: {
					if (de(t, t.stateNode.containerInfo), e === null) throw Error(o(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, za(e, t), Ka(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, Gi(t, ia, r), r !== a.cache && Ji(t, [ia], n, !0), Ga(), r = s.element, a.isDehydrated) {
						if (a = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
							t = _c(e, t, r, n);
							break a;
						}
						if (r !== i) {
							i = gi(Error(o(424)), t), Vi(i), t = _c(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (V = cf(e.firstChild), ji = t, H = !0, Mi = null, Ni = !0, n = Ia(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					} else {
						if (zi(), r === i) {
							t = Oc(e, t, n);
							break a;
						}
						rc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return pc(e, t), e === null ? (n = kf(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : H || (n = t.type, e = t.pendingProps, r = Bd(I.current).createElement(n), r[R] = t, r[st] = e, Pd(r, n, e), z(r), t.stateNode = r) : t.memoizedState = kf(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return pe(t), e === null && H && (r = t.stateNode = ff(t.type, t.pendingProps, I.current), ji = t, Ni = !0, i = V, Zd(t.type) ? (lf = i, V = cf(r.firstChild)) : V = i), rc(e, t, t.pendingProps.children, n), pc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && H && ((i = r = V) && (r = tf(r, t.type, t.pendingProps, Ni), r === null ? i = !1 : (t.stateNode = r, ji = t, V = cf(r.firstChild), Ni = !1, i = !0)), i || Fi(t)), pe(t), i = t.type, a = t.pendingProps, s = e === null ? null : e.memoizedProps, r = a.children, Ud(i, a) ? r = null : s !== null && Ud(i, s) && (t.flags |= 32), t.memoizedState !== null && (i = xo(e, t, wo, null, null, n), Qf._currentValue = i), pc(e, t), rc(e, t, r, n), t.child;
			case 6: return e === null && H && ((e = n = V) && (n = nf(n, t.pendingProps, Ni), n === null ? e = !1 : (t.stateNode = n, ji = t, V = null, e = !0)), e || Fi(t)), null;
			case 13: return xc(e, t, n);
			case 4: return de(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Fa(t, null, r, n) : rc(e, t, r, n), t.child;
			case 11: return ic(e, t, t.type, t.pendingProps, n);
			case 7: return rc(e, t, t.pendingProps, n), t.child;
			case 8: return rc(e, t, t.pendingProps.children, n), t.child;
			case 12: return rc(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, Gi(t, t.type, r.value), rc(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, Zi(t), i = Qi(i), r = r(i), t.flags |= 1, rc(e, t, r, n), t.child;
			case 14: return ac(e, t, t.type, t.pendingProps, n);
			case 15: return oc(e, t, t.type, t.pendingProps, n);
			case 19: return Dc(e, t, n);
			case 31: return fc(e, t, n);
			case 22: return sc(e, t, n, t.pendingProps);
			case 24: return Zi(t), r = Qi(ia), e === null ? (i = ga(), i === null && (i = q, a = aa(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Ra(t), Gi(t, ia, i)) : ((e.lanes & n) !== 0 && (za(e, t), Ka(t, null, null, n), Ga()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Gi(t, ia, r), r !== i.cache && Ji(t, [ia], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Gi(t, ia, r))), rc(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(o(156, t.tag));
	}
	function Mc(e) {
		e.flags |= 4;
	}
	function Nc(e, t, n, r, i) {
		if ((t = !!(e.mode & 32)) && (t = !1), t) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (wu()) e.flags |= 8192;
				else throw Ea = Sa, ba;
			}
		} else e.flags &= -16777217;
	}
	function Pc(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Wf(t)) {
			if (wu()) e.flags |= 8192;
			else throw Ea = Sa, ba;
		}
	}
	function Fc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : Ye(), e.lanes |= t, Yl |= t);
	}
	function Ic(e, t) {
		if (!H) switch (e.tailMode) {
			case "hidden":
				t = e.tail;
				for (var n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
				break;
			case "collapsed":
				n = e.tail;
				for (var r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
		}
	}
	function G(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function Lc(e, t, n) {
		var r = t.pendingProps;
		switch (ki(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return G(t), null;
			case 1: return G(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Ki(ia), fe(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Ri(t) ? Mc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Bi())), G(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Mc(t), a === null ? (G(t), Nc(t, i, null, r, n)) : (G(t), Pc(t, a))) : a ? a === e.memoizedState ? (G(t), t.flags &= -16777217) : (Mc(t), G(t), Pc(t, a)) : (e = e.memoizedProps, e !== r && Mc(t), G(t), Nc(t, i, e, r, n)), null;
			case 27:
				if (me(t), n = I.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Mc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(o(166));
						return G(t), null;
					}
					e = F.current, Ri(t) ? Ii(t, e) : (e = ff(i, r, n), t.stateNode = e, Mc(t));
				}
				return G(t), null;
			case 5:
				if (me(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Mc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(o(166));
						return G(t), null;
					}
					if (a = F.current, Ri(t)) Ii(t, a);
					else {
						var s = Bd(I.current);
						switch (a) {
							case 1:
								a = s.createElementNS("http://www.w3.org/2000/svg", i);
								break;
							case 2:
								a = s.createElementNS("http://www.w3.org/1998/Math/MathML", i);
								break;
							default: switch (i) {
								case "svg":
									a = s.createElementNS("http://www.w3.org/2000/svg", i);
									break;
								case "math":
									a = s.createElementNS("http://www.w3.org/1998/Math/MathML", i);
									break;
								case "script":
									a = s.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild);
									break;
								case "select":
									a = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? a.multiple = !0 : r.size && (a.size = r.size);
									break;
								default: a = typeof r.is == "string" ? s.createElement(i, { is: r.is }) : s.createElement(i);
							}
						}
						a[R] = t, a[st] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) a.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = a;
						a: switch (Pd(a, i, r), i) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && Mc(t);
					}
				}
				return G(t), Nc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && Mc(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(o(166));
					if (e = I.current, Ri(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = ji, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[R] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Md(e.nodeValue, n)), e || Fi(t, !0);
					} else e = Bd(e).createTextNode(r), e[R] = t, t.stateNode = e;
				}
				return G(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Ri(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(o(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(557));
							e[R] = t;
						} else zi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						G(t), e = !1;
					} else n = Bi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (oo(t), t) : (oo(t), null);
					if (t.flags & 128) throw Error(o(558));
				}
				return G(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Ri(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(o(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(o(317));
							i[R] = t;
						} else zi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						G(t), i = !1;
					} else i = Bi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (oo(t), t) : (oo(t), null);
				}
				return oo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Fc(t, t.updateQueue), G(t), null);
			case 4: return fe(), e === null && Sd(t.stateNode.containerInfo), G(t), null;
			case 10: return Ki(t.type), G(t), null;
			case 19:
				if (ce(so), r = t.memoizedState, r === null) return G(t), null;
				if (i = !!(t.flags & 128), a = r.rendering, a === null) {
					if (i) Ic(r, !1);
					else {
						if (Wl !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (a = co(e), a !== null) {
								for (t.flags |= 128, Ic(r, !1), e = a.updateQueue, t.updateQueue = e, Fc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) li(n, e), n = n.sibling;
								return P(so, so.current & 1 | 2), H && Ei(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && De() > tu && (t.flags |= 128, i = !0, Ic(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!i) {
						if (e = co(a), e !== null) {
							if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Fc(t, e), Ic(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !H) return G(t), null;
						} else 2 * De() - r.renderingStartTime > tu && n !== 536870912 && (t.flags |= 128, i = !0, Ic(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (G(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = De(), e.sibling = null, n = so.current, P(so, i ? n & 1 | 2 : n & 1), H && Ei(t, r.treeForkCount), e);
			case 22:
			case 23: return oo(t), $a(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (G(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : G(t), n = t.updateQueue, n !== null && Fc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && ce(ha), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Ki(ia), G(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(o(156, t.tag));
	}
	function Rc(e, t) {
		switch (ki(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Ki(ia), fe(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return me(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (oo(t), t.alternate === null) throw Error(o(340));
					zi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (oo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(o(340));
					zi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return ce(so), null;
			case 4: return fe(), null;
			case 10: return Ki(t.type), null;
			case 22:
			case 23: return oo(t), $a(), e !== null && ce(ha), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Ki(ia), null;
			case 25: return null;
			default: return null;
		}
	}
	function zc(e, t) {
		switch (ki(t), t.tag) {
			case 3:
				Ki(ia), fe();
				break;
			case 26:
			case 27:
			case 5:
				me(t);
				break;
			case 4:
				fe();
				break;
			case 31:
				t.memoizedState !== null && oo(t);
				break;
			case 13:
				oo(t);
				break;
			case 19:
				ce(so);
				break;
			case 10:
				Ki(t.type);
				break;
			case 22:
			case 23:
				oo(t), $a(), e !== null && ce(ha);
				break;
			case 24: Ki(ia);
		}
	}
	function Bc(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Vc(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								Z(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Hc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Ja(t, n);
			} catch (t) {
				Z(e, e.return, t);
			}
		}
	}
	function Uc(e, t, n) {
		n.props = Gs(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Z(e, t, n);
		}
	}
	function Wc(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			Z(e, t, n);
		}
	}
	function Gc(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				Z(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				Z(e, t, n);
			}
			else n.current = null;
		}
	}
	function Kc(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function qc(e, t, n) {
		try {
			var r = e.stateNode;
			Fd(r, e.type, n, t), r[st] = t;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Jc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Zd(e.type) || e.tag === 4;
	}
	function Yc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Jc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Zd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Xc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Zt));
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (Xc(e, t, n), e = e.sibling; e !== null;) Xc(e, t, n), e = e.sibling;
	}
	function Zc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (Zc(e, t, n), e = e.sibling; e !== null;) Zc(e, t, n), e = e.sibling;
	}
	function Qc(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Pd(t, r, n), t[R] = e, t[st] = n;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	var $c = !1, el = !1, tl = !1, nl = typeof WeakSet == "function" ? WeakSet : Set, rl = null;
	function il(e, t) {
		if (e = e.containerInfo, Rd = sp, e = Tr(e), Er(e)) {
			if ("selectionStart" in e) var n = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				n = (n = e.ownerDocument) && n.defaultView || window;
				var r = n.getSelection && n.getSelection();
				if (r && r.rangeCount !== 0) {
					n = r.anchorNode;
					var i = r.anchorOffset, a = r.focusNode;
					r = r.focusOffset;
					try {
						n.nodeType, a.nodeType;
					} catch {
						n = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== n || i !== 0 && f.nodeType !== 3 || (c = s + i), f !== a || r !== 0 && f.nodeType !== 3 || (l = s + r), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === n && ++u === i && (c = s), p === a && ++d === r && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					n = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else n = null;
			}
			n ||= {
				start: 0,
				end: 0
			};
		} else n = null;
		for (zd = {
			focusedElem: e,
			selectionRange: n
		}, sp = !1, rl = t; rl !== null;) if (t = rl, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, rl = e;
		else for (; rl !== null;) {
			switch (t = rl, a = t.alternate, e = t.flags, t.tag) {
				case 0:
					if (e & 4 && (e = t.updateQueue, e = e === null ? null : e.events, e !== null)) for (n = 0; n < e.length; n++) i = e[n], i.ref.impl = i.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (e & 1024 && a !== null) {
						e = void 0, n = t, i = a.memoizedProps, a = a.memoizedState, r = n.stateNode;
						try {
							var h = Gs(n.type, i);
							e = r.getSnapshotBeforeUpdate(h, a), r.__reactInternalSnapshotBeforeUpdate = e;
						} catch (e) {
							Z(n, n.return, e);
						}
					}
					break;
				case 3:
					if (e & 1024) {
						if (e = t.stateNode.containerInfo, n = e.nodeType, n === 9) ef(e);
						else if (n === 1) switch (e.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								ef(e);
								break;
							default: e.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				default: if (e & 1024) throw Error(o(163));
			}
			if (e = t.sibling, e !== null) {
				e.return = t.return, rl = e;
				break;
			}
			rl = t.return;
		}
	}
	function al(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				bl(e, n), r & 4 && Bc(5, n);
				break;
			case 1:
				if (bl(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						Z(n, n.return, e);
					}
					else {
						var i = Gs(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							Z(n, n.return, e);
						}
					}
				}
				r & 64 && Hc(n), r & 512 && Wc(n, n.return);
				break;
			case 3:
				if (bl(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Ja(e, t);
					} catch (e) {
						Z(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Qc(n);
			case 26:
			case 5:
				bl(e, n), t === null && r & 4 && Kc(n), r & 512 && Wc(n, n.return);
				break;
			case 12:
				bl(e, n);
				break;
			case 31:
				bl(e, n), r & 4 && dl(e, n);
				break;
			case 13:
				bl(e, n), r & 4 && fl(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Ju.bind(null, n), sf(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || $c, !r) {
					t = t !== null && t.memoizedState !== null || el, i = $c;
					var a = el;
					$c = r, (el = t) && !a ? Sl(e, n, !!(n.subtreeFlags & 8772)) : bl(e, n), $c = i, el = a;
				}
				break;
			case 30: break;
			default: bl(e, n);
		}
	}
	function ol(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, ol(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && mt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var sl = null, cl = !1;
	function ll(e, t, n) {
		for (n = n.child; n !== null;) ul(e, t, n), n = n.sibling;
	}
	function ul(e, t, n) {
		if (Le && typeof Le.onCommitFiberUnmount == "function") try {
			Le.onCommitFiberUnmount(Ie, n);
		} catch {}
		switch (n.tag) {
			case 26:
				el || Gc(n, t), ll(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				el || Gc(n, t);
				var r = sl, i = cl;
				Zd(n.type) && (sl = n.stateNode, cl = !1), ll(e, t, n), pf(n.stateNode), sl = r, cl = i;
				break;
			case 5: el || Gc(n, t);
			case 6:
				if (r = sl, i = cl, sl = null, ll(e, t, n), sl = r, cl = i, sl !== null) {
					if (cl) try {
						(sl.nodeType === 9 ? sl.body : sl.nodeName === "HTML" ? sl.ownerDocument.body : sl).removeChild(n.stateNode);
					} catch (e) {
						Z(n, t, e);
					}
					else try {
						sl.removeChild(n.stateNode);
					} catch (e) {
						Z(n, t, e);
					}
				}
				break;
			case 18:
				sl !== null && (cl ? (e = sl, Qd(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Np(e)) : Qd(sl, n.stateNode));
				break;
			case 4:
				r = sl, i = cl, sl = n.stateNode.containerInfo, cl = !0, ll(e, t, n), sl = r, cl = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Vc(2, n, t), el || Vc(4, n, t), ll(e, t, n);
				break;
			case 1:
				el || (Gc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Uc(n, t, r)), ll(e, t, n);
				break;
			case 21:
				ll(e, t, n);
				break;
			case 22:
				el = (r = el) || n.memoizedState !== null, ll(e, t, n), el = r;
				break;
			default: ll(e, t, n);
		}
	}
	function dl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Np(e);
			} catch (e) {
				Z(t, t.return, e);
			}
		}
	}
	function fl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Np(e);
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function pl(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new nl()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new nl()), t;
			default: throw Error(o(435, e.tag));
		}
	}
	function ml(e, t) {
		var n = pl(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = Yu.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function hl(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r], a = e, s = t, c = s;
			a: for (; c !== null;) {
				switch (c.tag) {
					case 27:
						if (Zd(c.type)) {
							sl = c.stateNode, cl = !1;
							break a;
						}
						break;
					case 5:
						sl = c.stateNode, cl = !1;
						break a;
					case 3:
					case 4:
						sl = c.stateNode.containerInfo, cl = !0;
						break a;
				}
				c = c.return;
			}
			if (sl === null) throw Error(o(160));
			ul(a, s, i), sl = null, cl = !1, a = i.alternate, a !== null && (a.return = null), i.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) _l(t, e), t = t.sibling;
	}
	var gl = null;
	function _l(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				hl(t, e), vl(e), r & 4 && (Vc(3, e, e.return), Bc(3, e), Vc(5, e, e.return));
				break;
			case 1:
				hl(t, e), vl(e), r & 512 && (el || n === null || Gc(n, n.return)), r & 64 && $c && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = gl;
				if (hl(t, e), vl(e), r & 512 && (el || n === null || Gc(n, n.return)), r & 4) {
					var a = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) {
						if (r === null) {
							if (e.stateNode === null) {
								a: {
									r = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
									b: switch (r) {
										case "title":
											a = i.getElementsByTagName("title")[0], (!a || a[pt] || a[R] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Pd(a, r, n), a[R] = e, z(a), r = a;
											break a;
										case "link":
											var s = Vf("link", "href", i).get(r + (n.href || ""));
											if (s) {
												for (var c = 0; c < s.length; c++) if (a = s[c], a.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && a.getAttribute("rel") === (n.rel == null ? null : n.rel) && a.getAttribute("title") === (n.title == null ? null : n.title) && a.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
													s.splice(c, 1);
													break b;
												}
											}
											a = i.createElement(r), Pd(a, r, n), i.head.appendChild(a);
											break;
										case "meta":
											if (s = Vf("meta", "content", i).get(r + (n.content || ""))) {
												for (c = 0; c < s.length; c++) if (a = s[c], a.getAttribute("content") === (n.content == null ? null : "" + n.content) && a.getAttribute("name") === (n.name == null ? null : n.name) && a.getAttribute("property") === (n.property == null ? null : n.property) && a.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && a.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
													s.splice(c, 1);
													break b;
												}
											}
											a = i.createElement(r), Pd(a, r, n), i.head.appendChild(a);
											break;
										default: throw Error(o(468, r));
									}
									a[R] = e, z(a), r = a;
								}
								e.stateNode = r;
							} else Hf(i, e.type, e.stateNode);
						} else e.stateNode = If(i, r, e.memoizedProps);
					} else a === r ? r === null && e.stateNode !== null && qc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Hf(i, e.type, e.stateNode) : If(i, r, e.memoizedProps));
				}
				break;
			case 27:
				hl(t, e), vl(e), r & 512 && (el || n === null || Gc(n, n.return)), n !== null && r & 4 && qc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (hl(t, e), vl(e), r & 512 && (el || n === null || Gc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						Ut(i, "");
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, qc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && (tl = !0);
				break;
			case 6:
				if (hl(t, e), vl(e), r & 4) {
					if (e.stateNode === null) throw Error(o(162));
					r = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = r;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Bf = null, i = gl, gl = gf(t.containerInfo), hl(t, e), gl = i, vl(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Np(t.containerInfo);
				} catch (t) {
					Z(e, e.return, t);
				}
				tl && (tl = !1, yl(e));
				break;
			case 4:
				r = gl, gl = gf(e.stateNode.containerInfo), hl(t, e), vl(e), gl = r;
				break;
			case 12:
				hl(t, e), vl(e);
				break;
			case 31:
				hl(t, e), vl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ml(e, r)));
				break;
			case 13:
				hl(t, e), vl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && ($l = De()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ml(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = $c, d = el;
				if ($c = u || i, el = d || l, hl(t, e), el = d, $c = u, vl(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || $c || el || xl(e)), n = null, t = e;;) {
					if (t.tag === 5 || t.tag === 26) {
						if (n === null) {
							l = n = t;
							try {
								if (a = l.stateNode, i) s = a.style, typeof s.setProperty == "function" ? s.setProperty("display", "none", "important") : s.display = "none";
								else {
									c = l.stateNode;
									var f = l.memoizedProps.style, p = f != null && f.hasOwnProperty("display") ? f.display : null;
									c.style.display = p == null || typeof p == "boolean" ? "" : ("" + p).trim();
								}
							} catch (e) {
								Z(l, l.return, e);
							}
						}
					} else if (t.tag === 6) {
						if (n === null) {
							l = t;
							try {
								l.stateNode.nodeValue = i ? "" : l.memoizedProps;
							} catch (e) {
								Z(l, l.return, e);
							}
						}
					} else if (t.tag === 18) {
						if (n === null) {
							l = t;
							try {
								var m = l.stateNode;
								i ? $d(m, !0) : $d(l.stateNode, !1);
							} catch (e) {
								Z(l, l.return, e);
							}
						}
					} else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
						t.child.return = t, t = t.child;
						continue;
					}
					if (t === e) break a;
					for (; t.sibling === null;) {
						if (t.return === null || t.return === e) break a;
						n === t && (n = null), t = t.return;
					}
					n === t && (n = null), t.sibling.return = t.return, t = t.sibling;
				}
				r & 4 && (r = e.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, ml(e, n))));
				break;
			case 19:
				hl(t, e), vl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ml(e, r)));
				break;
			case 30: break;
			case 21: break;
			default: hl(t, e), vl(e);
		}
	}
	function vl(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Jc(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				if (n == null) throw Error(o(160));
				switch (n.tag) {
					case 27:
						var i = n.stateNode;
						Zc(e, Yc(e), i);
						break;
					case 5:
						var a = n.stateNode;
						n.flags & 32 && (Ut(a, ""), n.flags &= -33), Zc(e, Yc(e), a);
						break;
					case 3:
					case 4:
						var s = n.stateNode.containerInfo;
						Xc(e, Yc(e), s);
						break;
					default: throw Error(o(161));
				}
			} catch (t) {
				Z(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function yl(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			yl(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
		}
	}
	function bl(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) al(e, t.alternate, t), t = t.sibling;
	}
	function xl(e) {
		for (e = e.child; e !== null;) {
			var t = e;
			switch (t.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Vc(4, t, t.return), xl(t);
					break;
				case 1:
					Gc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && Uc(t, t.return, n), xl(t);
					break;
				case 27: pf(t.stateNode);
				case 26:
				case 5:
					Gc(t, t.return), xl(t);
					break;
				case 22:
					t.memoizedState === null && xl(t);
					break;
				case 30:
					xl(t);
					break;
				default: xl(t);
			}
			e = e.sibling;
		}
	}
	function Sl(e, t, n) {
		for (n &&= !!(t.subtreeFlags & 8772), t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags;
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Sl(i, a, n), Bc(4, a);
					break;
				case 1:
					if (Sl(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Z(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var s = r.stateNode;
						try {
							var c = i.shared.hiddenCallbacks;
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) qa(c[i], s);
						} catch (e) {
							Z(r, r.return, e);
						}
					}
					n && o & 64 && Hc(a), Wc(a, a.return);
					break;
				case 27: Qc(a);
				case 26:
				case 5:
					Sl(i, a, n), n && r === null && o & 4 && Kc(a), Wc(a, a.return);
					break;
				case 12:
					Sl(i, a, n);
					break;
				case 31:
					Sl(i, a, n), n && o & 4 && dl(i, a);
					break;
				case 13:
					Sl(i, a, n), n && o & 4 && fl(i, a);
					break;
				case 22:
					a.memoizedState === null && Sl(i, a, n), Wc(a, a.return);
					break;
				case 30: break;
				default: Sl(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Cl(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && oa(n));
	}
	function wl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && oa(e));
	}
	function Tl(e, t, n, r) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) El(e, t, n, r), t = t.sibling;
	}
	function El(e, t, n, r) {
		var i = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Tl(e, t, n, r), i & 2048 && Bc(9, t);
				break;
			case 1:
				Tl(e, t, n, r);
				break;
			case 3:
				Tl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && oa(e)));
				break;
			case 12:
				if (i & 2048) {
					Tl(e, t, n, r), e = t.stateNode;
					try {
						var a = t.memoizedProps, o = a.id, s = a.onPostCommit;
						typeof s == "function" && s(o, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
					} catch (e) {
						Z(t, t.return, e);
					}
				} else Tl(e, t, n, r);
				break;
			case 31:
				Tl(e, t, n, r);
				break;
			case 13:
				Tl(e, t, n, r);
				break;
			case 23: break;
			case 22:
				a = t.stateNode, o = t.alternate, t.memoizedState === null ? a._visibility & 2 ? Tl(e, t, n, r) : (a._visibility |= 2, Dl(e, t, n, r, !!(t.subtreeFlags & 10256) || !1)) : a._visibility & 2 ? Tl(e, t, n, r) : Ol(e, t), i & 2048 && Cl(o, t);
				break;
			case 24:
				Tl(e, t, n, r), i & 2048 && wl(t.alternate, t);
				break;
			default: Tl(e, t, n, r);
		}
	}
	function Dl(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Dl(a, o, s, c, i), Bc(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Dl(a, o, s, c, i)) : u._visibility & 2 ? Dl(a, o, s, c, i) : Ol(a, o), i && l & 2048 && Cl(o.alternate, o);
					break;
				case 24:
					Dl(a, o, s, c, i), i && l & 2048 && wl(o.alternate, o);
					break;
				default: Dl(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Ol(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Ol(n, r), i & 2048 && Cl(r.alternate, r);
					break;
				case 24:
					Ol(n, r), i & 2048 && wl(r.alternate, r);
					break;
				default: Ol(n, r);
			}
			t = t.sibling;
		}
	}
	var kl = 8192;
	function Al(e, t, n) {
		if (e.subtreeFlags & kl) for (e = e.child; e !== null;) jl(e, t, n), e = e.sibling;
	}
	function jl(e, t, n) {
		switch (e.tag) {
			case 26:
				Al(e, t, n), e.flags & kl && e.memoizedState !== null && Gf(n, gl, e.memoizedState, e.memoizedProps);
				break;
			case 5:
				Al(e, t, n);
				break;
			case 3:
			case 4:
				var r = gl;
				gl = gf(e.stateNode.containerInfo), Al(e, t, n), gl = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = kl, kl = 16777216, Al(e, t, n), kl = r) : Al(e, t, n));
				break;
			default: Al(e, t, n);
		}
	}
	function Ml(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Nl(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				rl = r, Il(r, e);
			}
			Ml(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Pl(e), e = e.sibling;
	}
	function Pl(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Nl(e), e.flags & 2048 && Vc(9, e, e.return);
				break;
			case 3:
				Nl(e);
				break;
			case 12:
				Nl(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Fl(e)) : Nl(e);
				break;
			default: Nl(e);
		}
	}
	function Fl(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				rl = r, Il(r, e);
			}
			Ml(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Vc(8, t, t.return), Fl(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Fl(t));
					break;
				default: Fl(t);
			}
			e = e.sibling;
		}
	}
	function Il(e, t) {
		for (; rl !== null;) {
			var n = rl;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Vc(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: oa(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, rl = r;
			else a: for (n = e; rl !== null;) {
				r = rl;
				var i = r.sibling, a = r.return;
				if (ol(r), r === n) {
					rl = null;
					break a;
				}
				if (i !== null) {
					i.return = a, rl = i;
					break a;
				}
				rl = a;
			}
		}
	}
	var Ll = {
		getCacheForType: function(e) {
			var t = Qi(ia), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Qi(ia).controller.signal;
		}
	}, Rl = typeof WeakMap == "function" ? WeakMap : Map, K = 0, q = null, J = null, Y = 0, X = 0, zl = null, Bl = !1, Vl = !1, Hl = !1, Ul = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = 0, Xl = null, Zl = null, Ql = !1, $l = 0, eu = 0, tu = Infinity, nu = null, ru = null, iu = 0, au = null, ou = null, su = 0, cu = 0, lu = null, uu = null, du = 0, fu = null;
	function pu() {
		return K & 2 && Y !== 0 ? Y & -Y : A.T === null ? it() : dd();
	}
	function mu() {
		if (Jl === 0) {
			if (!(Y & 536870912) || H) {
				var e = We;
				We <<= 1, !(We & 3932160) && (We = 262144), Jl = e;
			} else Jl = 536870912;
		}
		return e = eo.current, e !== null && (e.flags |= 32), Jl;
	}
	function hu(e, t, n) {
		(e === q && (X === 2 || X === 9) || e.cancelPendingCommit !== null) && (Su(e, 0), yu(e, Y, Jl, !1)), Ze(e, n), (!(K & 2) || e !== q) && (e === q && (!(K & 2) && (Kl |= n), Wl === 4 && yu(e, Y, Jl, !1)), rd(e));
	}
	function gu(e, t, n) {
		if (K & 6) throw Error(o(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || Je(e, t), i = r ? Au(e, t) : Ou(e, t, !0), a = r;
		do {
			if (i === 0) {
				Vl && !r && yu(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, a && !vu(n)) {
				i = Ou(e, t, !1), a = !1;
				continue;
			}
			if (i === 2) {
				if (a = t, e.errorRecoveryDisabledLanes & a) var s = 0;
				else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
				if (s !== 0) {
					t = s;
					a: {
						var c = e;
						i = Xl;
						var l = c.current.memoizedState.isDehydrated;
						if (l && (Su(c, s).flags |= 256), s = Ou(c, s, !1), s !== 2) {
							if (Hl && !l) {
								c.errorRecoveryDisabledLanes |= a, Kl |= a, i = 4;
								break a;
							}
							a = Zl, Zl = i, a !== null && (Zl === null ? Zl = a : Zl.push.apply(Zl, a));
						}
						i = s;
					}
					if (a = !1, i !== 2) continue;
				}
			}
			if (i === 1) {
				Su(e, 0), yu(e, t, 0, !0);
				break;
			}
			a: {
				switch (r = e, a = i, a) {
					case 0:
					case 1: throw Error(o(345));
					case 4: if ((t & 4194048) !== t) break;
					case 6:
						yu(r, t, Jl, !Bl);
						break a;
					case 2:
						Zl = null;
						break;
					case 3:
					case 5: break;
					default: throw Error(o(329));
				}
				if ((t & 62914560) === t && (i = $l + 300 - De(), 10 < i)) {
					if (yu(r, t, Jl, !Bl), qe(r, 0, !0) !== 0) break a;
					su = t, r.timeoutHandle = Kd(_u.bind(null, r, n, Zl, nu, Ql, t, Jl, Kl, Yl, Bl, a, "Throttled", -0, 0), i);
					break a;
				}
				_u(r, n, Zl, nu, Ql, t, Jl, Kl, Yl, Bl, a, null, -0, 0);
			}
			break;
		} while (1);
		rd(e);
	}
	function _u(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		if (e.timeoutHandle = -1, d = t.subtreeFlags, d & 8192 || (d & 16785408) == 16785408) {
			d = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: Zt
			}, jl(t, a, d);
			var m = (a & 62914560) === a ? $l - De() : (a & 4194048) === a ? eu - De() : 0;
			if (m = qf(d, m), m !== null) {
				su = a, e.cancelPendingCommit = m(Lu.bind(null, e, t, a, n, r, i, o, s, c, u, d, null, f, p)), yu(e, a, o, !l);
				return;
			}
		}
		Lu(e, t, a, n, r, i, o, s, c);
	}
	function vu(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!br(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function yu(e, t, n, r) {
		t &= ~ql, t &= ~Kl, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - ze(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && $e(e, n, t);
	}
	function bu() {
		return K & 6 ? !0 : (id(0, !1), !1);
	}
	function xu() {
		if (J !== null) {
			if (X === 0) var e = J.return;
			else e = J, Wi = Ui = null, Do(e), ka = null, Aa = 0, e = J;
			for (; e !== null;) zc(e.alternate, e), e = e.return;
			J = null;
		}
	}
	function Su(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, qd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), su = 0, xu(), q = e, J = n = ci(e.current, null), Y = t, X = 0, zl = null, Bl = !1, Vl = Je(e, t), Hl = !1, Yl = Jl = ql = Kl = Gl = Wl = 0, Zl = Xl = null, Ql = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - ze(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Ul = t, Qr(), n;
	}
	function Cu(e, t) {
		U = null, A.H = Ls, t === ya || t === xa ? (t = Da(), X = 3) : t === ba ? (t = Da(), X = 4) : X = t === tc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, zl = t, J === null && (Wl = 1, Ys(e, gi(t, e.current)));
	}
	function wu() {
		var e = eo.current;
		return e === null ? !0 : (Y & 4194048) === Y ? to === null : (Y & 62914560) === Y || Y & 536870912 ? e === to : !1;
	}
	function Tu() {
		var e = A.H;
		return A.H = Ls, e === null ? Ls : e;
	}
	function Eu() {
		var e = A.A;
		return A.A = Ll, e;
	}
	function Du() {
		Wl = 4, Bl || (Y & 4194048) !== Y && eo.current !== null || (Vl = !0), !(Gl & 134217727) && !(Kl & 134217727) || q === null || yu(q, Y, Jl, !1);
	}
	function Ou(e, t, n) {
		var r = K;
		K |= 2;
		var i = Tu(), a = Eu();
		(q !== e || Y !== t) && (nu = null, Su(e, t)), t = !1;
		var o = Wl;
		a: do
			try {
				if (X !== 0 && J !== null) {
					var s = J, c = zl;
					switch (X) {
						case 8:
							xu(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							eo.current === null && (t = !0);
							var l = X;
							if (X = 0, zl = null, Pu(e, s, c, l), n && Vl) {
								o = 0;
								break a;
							}
							break;
						default: l = X, X = 0, zl = null, Pu(e, s, c, l);
					}
				}
				ku(), o = Wl;
				break;
			} catch (t) {
				Cu(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Wi = Ui = null, K = r, A.H = i, A.A = a, J === null && (q = null, Y = 0, Qr()), o;
	}
	function ku() {
		for (; J !== null;) Mu(J);
	}
	function Au(e, t) {
		var n = K;
		K |= 2;
		var r = Tu(), i = Eu();
		q !== e || Y !== t ? (nu = null, tu = De() + 500, Su(e, t)) : Vl = Je(e, t);
		a: do
			try {
				if (X !== 0 && J !== null) {
					t = J;
					var a = zl;
					b: switch (X) {
						case 1:
							X = 0, zl = null, Pu(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (Ca(a)) {
								X = 0, zl = null, Nu(t);
								break;
							}
							t = function() {
								X !== 2 && X !== 9 || q !== e || (X = 7), rd(e);
							}, a.then(t, t);
							break a;
						case 3:
							X = 7;
							break a;
						case 4:
							X = 5;
							break a;
						case 7:
							Ca(a) ? (X = 0, zl = null, Nu(t)) : (X = 0, zl = null, Pu(e, t, a, 7));
							break;
						case 5:
							var s = null;
							switch (J.tag) {
								case 26: s = J.memoizedState;
								case 5:
								case 27:
									var c = J;
									if (s ? Wf(s) : c.stateNode.complete) {
										X = 0, zl = null;
										var l = c.sibling;
										if (l !== null) J = l;
										else {
											var u = c.return;
											u === null ? J = null : (J = u, Fu(u));
										}
										break b;
									}
							}
							X = 0, zl = null, Pu(e, t, a, 5);
							break;
						case 6:
							X = 0, zl = null, Pu(e, t, a, 6);
							break;
						case 8:
							xu(), Wl = 6;
							break a;
						default: throw Error(o(462));
					}
				}
				ju();
				break;
			} catch (t) {
				Cu(e, t);
			}
		while (1);
		return Wi = Ui = null, A.H = r, A.A = i, K = n, J === null ? (q = null, Y = 0, Qr(), Wl) : 0;
	}
	function ju() {
		for (; J !== null && !Te();) Mu(J);
	}
	function Mu(e) {
		var t = jc(e.alternate, e, Ul);
		e.memoizedProps = e.pendingProps, t === null ? Fu(e) : J = t;
	}
	function Nu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = hc(n, t, t.pendingProps, t.type, void 0, Y);
				break;
			case 11:
				t = hc(n, t, t.pendingProps, t.type.render, t.ref, Y);
				break;
			case 5: Do(t);
			default: zc(n, t), t = J = li(t, Ul), t = jc(n, t, Ul);
		}
		e.memoizedProps = e.pendingProps, t === null ? Fu(e) : J = t;
	}
	function Pu(e, t, n, r) {
		Wi = Ui = null, Do(t), ka = null, Aa = 0;
		var i = t.return;
		try {
			if (ec(e, i, t, n, Y)) {
				Wl = 1, Ys(e, gi(n, e.current)), J = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw J = i, t;
			Wl = 1, Ys(e, gi(n, e.current)), J = null;
			return;
		}
		t.flags & 32768 ? (H || r === 1 ? e = !0 : Vl || Y & 536870912 ? e = !1 : (Bl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = eo.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Iu(t, e)) : Fu(t);
	}
	function Fu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Iu(t, Bl);
				return;
			}
			e = t.return;
			var n = Lc(t.alternate, t, Ul);
			if (n !== null) {
				J = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				J = t;
				return;
			}
			J = t = e;
		} while (t !== null);
		Wl === 0 && (Wl = 5);
	}
	function Iu(e, t) {
		do {
			var n = Rc(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, J = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				J = e;
				return;
			}
			J = e = n;
		} while (e !== null);
		Wl = 6, J = null;
	}
	function Lu(e, t, n, r, i, a, s, c, l) {
		e.cancelPendingCommit = null;
		do
			Hu();
		while (iu !== 0);
		if (K & 6) throw Error(o(327));
		if (t !== null) {
			if (t === e.current) throw Error(o(177));
			if (a = t.lanes | t.childLanes, a |= Zr, Qe(e, n, a, s, c, l), e === q && (J = q = null, Y = 0), ou = t, au = e, su = n, cu = a, lu = i, uu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Xu(je, function() {
				return Uu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
				r = A.T, A.T = null, i = j.p, j.p = 2, s = K, K |= 4;
				try {
					il(e, t, n);
				} finally {
					K = s, j.p = i, A.T = r;
				}
			}
			iu = 1, Ru(), zu(), Bu();
		}
	}
	function Ru() {
		if (iu === 1) {
			iu = 0;
			var e = au, t = ou, n = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || n) {
				n = A.T, A.T = null;
				var r = j.p;
				j.p = 2;
				var i = K;
				K |= 4;
				try {
					_l(t, e);
					var a = zd, o = Tr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && wr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Er(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Cr(s, h), v = Cr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					sp = !!Rd, zd = Rd = null;
				} finally {
					K = i, j.p = r, A.T = n;
				}
			}
			e.current = t, iu = 2;
		}
	}
	function zu() {
		if (iu === 2) {
			iu = 0;
			var e = au, t = ou, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = A.T, A.T = null;
				var r = j.p;
				j.p = 2;
				var i = K;
				K |= 4;
				try {
					al(e, t.alternate, t);
				} finally {
					K = i, j.p = r, A.T = n;
				}
			}
			iu = 3;
		}
	}
	function Bu() {
		if (iu === 4 || iu === 3) {
			iu = 0, Ee();
			var e = au, t = ou, n = su, r = uu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? iu = 5 : (iu = 0, ou = au = null, Vu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (ru = null), rt(n), t = t.stateNode, Le && typeof Le.onCommitFiberRoot == "function") try {
				Le.onCommitFiberRoot(Ie, t, void 0, (t.current.flags & 128) == 128);
			} catch {}
			if (r !== null) {
				t = A.T, i = j.p, j.p = 2, A.T = null;
				try {
					for (var a = e.onRecoverableError, o = 0; o < r.length; o++) {
						var s = r[o];
						a(s.value, { componentStack: s.stack });
					}
				} finally {
					A.T = t, j.p = i;
				}
			}
			su & 3 && Hu(), rd(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === fu ? du++ : (du = 0, fu = e) : du = 0, id(0, !1);
		}
	}
	function Vu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, oa(t)));
	}
	function Hu() {
		return Ru(), zu(), Bu(), Uu();
	}
	function Uu() {
		if (iu !== 5) return !1;
		var e = au, t = cu;
		cu = 0;
		var n = rt(su), r = A.T, i = j.p;
		try {
			j.p = 32 > n ? 32 : n, A.T = null, n = lu, lu = null;
			var a = au, s = su;
			if (iu = 0, ou = au = null, su = 0, K & 6) throw Error(o(331));
			var c = K;
			if (K |= 4, Pl(a.current), El(a, a.current, s, n), K = c, id(0, !1), Le && typeof Le.onPostCommitFiberRoot == "function") try {
				Le.onPostCommitFiberRoot(Ie, a);
			} catch {}
			return !0;
		} finally {
			j.p = i, A.T = r, Vu(e, t);
		}
	}
	function Wu(e, t, n) {
		t = gi(n, t), t = Zs(e.stateNode, t, 2), e = Va(e, t, 2), e !== null && (Ze(e, 2), rd(e));
	}
	function Z(e, t, n) {
		if (e.tag === 3) Wu(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Wu(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (ru === null || !ru.has(r))) {
					e = gi(n, e), n = Qs(2), r = Va(t, n, 2), r !== null && ($s(n, r, t, e), Ze(r, 2), rd(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Gu(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Rl();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Hl = !0, i.add(n), e = Ku.bind(null, e, t, n), t.then(e, e));
	}
	function Ku(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, q === e && (Y & n) === n && (Wl === 4 || Wl === 3 && (Y & 62914560) === Y && 300 > De() - $l ? !(K & 2) && Su(e, 0) : ql |= n, Yl === Y && (Yl = 0)), rd(e);
	}
	function qu(e, t) {
		t === 0 && (t = Ye()), e = ti(e, t), e !== null && (Ze(e, t), rd(e));
	}
	function Ju(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), qu(e, n);
	}
	function Yu(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, i = e.memoizedState;
				i !== null && (n = i.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(o(314));
		}
		r !== null && r.delete(t), qu(e, n);
	}
	function Xu(e, t) {
		return Ce(e, t);
	}
	var Zu = null, Qu = null, $u = !1, ed = !1, td = !1, nd = 0;
	function rd(e) {
		e !== Qu && e.next === null && (Qu === null ? Zu = Qu = e : Qu = Qu.next = e), ed = !0, $u || ($u = !0, ud());
	}
	function id(e, t) {
		if (!td && ed) {
			td = !0;
			do
				for (var n = !1, r = Zu; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - ze(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, ld(r, a));
						} else a = Y, a = qe(r, r === q ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || Je(r, a) || (n = !0, ld(r, a));
					}
					r = r.next;
				}
			while (n);
			td = !1;
		}
	}
	function ad() {
		od();
	}
	function od() {
		ed = $u = !1;
		var e = 0;
		nd !== 0 && Gd() && (e = nd);
		for (var t = De(), n = null, r = Zu; r !== null;) {
			var i = r.next, a = sd(r, t);
			a === 0 ? (r.next = null, n === null ? Zu = i : n.next = i, i === null && (Qu = n)) : (n = r, (e !== 0 || a & 3) && (ed = !0)), r = i;
		}
		iu !== 0 && iu !== 5 || id(e, !1), nd !== 0 && (nd = 0);
	}
	function sd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - ze(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = L(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = q, n = Y, n = qe(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (X === 2 || X === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && we(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || Je(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && we(r), rt(n)) {
				case 2:
				case 8:
					n = Ae;
					break;
				case 32:
					n = je;
					break;
				case 268435456:
					n = Ne;
					break;
				default: n = je;
			}
			return r = cd.bind(null, e), n = Ce(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && we(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function cd(e, t) {
		if (iu !== 0 && iu !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Hu() && e.callbackNode !== n) return null;
		var r = Y;
		return r = qe(e, e === q ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (gu(e, r, t), sd(e, De()), e.callbackNode != null && e.callbackNode === n ? cd.bind(null, e) : null);
	}
	function ld(e, t) {
		if (Hu()) return null;
		gu(e, t, !0);
	}
	function ud() {
		Yd(function() {
			K & 6 ? Ce(ke, ad) : od();
		});
	}
	function dd() {
		if (nd === 0) {
			var e = la;
			e === 0 && (e = Ue, Ue <<= 1, !(Ue & 261888) && (Ue = 256)), nd = e;
		}
		return nd;
	}
	function fd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Xt("" + e);
	}
	function pd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function md(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = fd((i[st] || null).action), o = r.submitter;
			o && (t = (t = o[st] || null) ? fd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new yn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (nd !== 0) {
								var e = o ? pd(i, o) : new FormData(i);
								Cs(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? pd(i, o) : new FormData(i), Cs(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var hd = 0; hd < Kr.length; hd++) {
		var gd = Kr[hd];
		qr(gd.toLowerCase(), "on" + (gd[0].toUpperCase() + gd.slice(1)));
	}
	qr(Rr, "onAnimationEnd"), qr(zr, "onAnimationIteration"), qr(Br, "onAnimationStart"), qr("dblclick", "onDoubleClick"), qr("focusin", "onFocus"), qr("focusout", "onBlur"), qr(Vr, "onTransitionRun"), qr(Hr, "onTransitionStart"), qr(Ur, "onTransitionCancel"), qr(Wr, "onTransitionEnd"), St("onMouseEnter", ["mouseout", "mouseover"]), St("onMouseLeave", ["mouseout", "mouseover"]), St("onPointerEnter", ["pointerout", "pointerover"]), St("onPointerLeave", ["pointerout", "pointerover"]), xt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), xt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), xt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), xt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), xt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), xt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var _d = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), vd = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(_d));
	function yd(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Jr(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Jr(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[lt];
		n === void 0 && (n = t[lt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Cd(t, e, 2, !1), n.add(r));
	}
	function bd(e, t, n) {
		var r = 0;
		t && (r |= 4), Cd(n, e, r, t);
	}
	var xd = "_reactListening" + Math.random().toString(36).slice(2);
	function Sd(e) {
		if (!e[xd]) {
			e[xd] = !0, yt.forEach(function(t) {
				t !== "selectionchange" && (vd.has(t) || bd(t, !1, e), bd(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[xd] || (t[xd] = !0, bd("selectionchange", !1, t));
		}
	}
	function Cd(e, t, n, r) {
		switch (mp(t)) {
			case 2:
				var i = cp;
				break;
			case 8:
				i = lp;
				break;
			default: i = up;
		}
		n = i.bind(null, t, n, e), i = void 0, !cn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function wd(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var o = r.tag;
			if (o === 3 || o === 4) {
				var s = r.stateNode.containerInfo;
				if (s === i) break;
				if (o === 4) for (o = r.return; o !== null;) {
					var c = o.tag;
					if ((c === 3 || c === 4) && o.stateNode.containerInfo === i) return;
					o = o.return;
				}
				for (; s !== null;) {
					if (o = ht(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		an(function() {
			var r = a, i = $t(n), o = [];
			a: {
				var s = Gr.get(e);
				if (s !== void 0) {
					var c = yn, u = e;
					switch (e) {
						case "keypress": if (mn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Ln;
							break;
						case "focusin":
							u = "focus", c = On;
							break;
						case "focusout":
							u = "blur", c = On;
							break;
						case "beforeblur":
						case "afterblur":
							c = On;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							c = En;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Dn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = zn;
							break;
						case Rr:
						case zr:
						case Br:
							c = kn;
							break;
						case Wr:
							c = Bn;
							break;
						case "scroll":
						case "scrollend":
							c = xn;
							break;
						case "wheel":
							c = Vn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = An;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Rn;
							break;
						case "toggle":
						case "beforetoggle": c = Hn;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = on(m, p), g != null && d.push(Td(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (s = new c(s, u, null, n, i), o.push({
						event: s,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Qt && (u = n.relatedTarget || n.fromElement) && (ht(u) || u[ct])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (u = n.relatedTarget || n.toElement, c = r, u = u ? ht(u) : null, u !== null && (f = l(u), d = u.tag, u !== f || d !== 5 && d !== 27 && d !== 6) && (u = null)) : (c = null, u = r), c !== u)) {
						if (d = En, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Rn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : _t(c), h = u == null ? s : _t(u), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, ht(i) === r && (d = new d(p, m + "enter", u, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && u) b: {
							for (d = Dd, p = c, m = u, h = 0, g = p; g; g = d(g)) h++;
							g = 0;
							for (var _ = m; _; _ = d(_)) g++;
							for (; 0 < h - g;) p = d(p), h--;
							for (; 0 < g - h;) m = d(m), g--;
							for (; h--;) {
								if (p === m || m !== null && p === m.alternate) {
									d = p;
									break b;
								}
								p = d(p), m = d(m);
							}
							d = null;
						}
						else d = null;
						c !== null && Od(o, s, c, d, !1), u !== null && f !== null && Od(o, f, u, d, !0);
					}
				}
				a: {
					if (s = r ? _t(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = cr;
					else if (nr(s)) {
						if (lr) v = vr;
						else {
							v = gr;
							var y = hr;
						}
					} else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && qt(r.elementType) && (v = cr) : v = _r;
					if (v &&= v(e, r)) {
						rr(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && zt(s, "number", s.value);
				}
				switch (y = r ? _t(r) : window, e) {
					case "focusin":
						(nr(y) || y.contentEditable === "true") && (Or = y, kr = r, Ar = null);
						break;
					case "focusout":
						Ar = kr = Or = null;
						break;
					case "mousedown":
						jr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						jr = !1, Mr(o, n, i);
						break;
					case "selectionchange": if (Dr) break;
					case "keydown":
					case "keyup": Mr(o, n, i);
				}
				var b;
				if (Wn) b: {
					switch (e) {
						case "compositionstart":
							var x = "onCompositionStart";
							break b;
						case "compositionend":
							x = "onCompositionEnd";
							break b;
						case "compositionupdate":
							x = "onCompositionUpdate";
							break b;
					}
					x = void 0;
				}
				else Qn ? Xn(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (qn && n.locale !== "ko" && (Qn || x !== "onCompositionStart" ? x === "onCompositionEnd" && Qn && (b = pn()) : (un = i, dn = "value" in un ? un.value : un.textContent, Qn = !0)), y = Ed(r, x), 0 < y.length && (x = new jn(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = Zn(n), b !== null && (x.data = b)))), (b = Kn ? $n(e, n) : er(e, n)) && (x = Ed(r, "onBeforeInput"), 0 < x.length && (y = new jn("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: y,
					listeners: x
				}), y.data = b)), md(o, e, r, n, i);
			}
			yd(o, t);
		});
	}
	function Td(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Ed(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = on(e, n), i != null && r.unshift(Td(e, i, a)), i = on(e, t), i != null && r.push(Td(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Dd(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Od(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = on(n, a), l != null && o.unshift(Td(n, l, c))) : i || (l = on(n, a), l != null && o.push(Td(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var kd = /\r\n?/g, Ad = /\u0000|\uFFFD/g;
	function jd(e) {
		return (typeof e == "string" ? e : "" + e).replace(kd, "\n").replace(Ad, "");
	}
	function Md(e, t) {
		return t = jd(t), jd(e) === t;
	}
	function $(e, t, n, r, i, a) {
		switch (n) {
			case "children":
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || Ut(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && Ut(e, "" + r);
				break;
			case "className":
				Ot(e, "class", r);
				break;
			case "tabIndex":
				Ot(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Ot(e, n, r);
				break;
			case "style":
				Kt(e, r, a);
				break;
			case "data": if (t !== "object") {
				Ot(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href")) {
					e.removeAttribute(n);
					break;
				}
				if (r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Xt("" + r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof a == "function" && (n === "formAction" ? (t !== "input" && $(e, t, "name", i.name, i, null), $(e, t, "formEncType", i.formEncType, i, null), $(e, t, "formMethod", i.formMethod, i, null), $(e, t, "formTarget", i.formTarget, i, null)) : ($(e, t, "encType", i.encType, i, null), $(e, t, "method", i.method, i, null), $(e, t, "target", i.target, i, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Xt("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = Zt);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(o(61));
					if (n = r.__html, n != null) {
						if (i.children != null) throw Error(o(60));
						e.innerHTML = n;
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = Xt("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "" + r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				Q("beforetoggle", e), Q("toggle", e), Dt(e, "popover", r);
				break;
			case "xlinkActuate":
				kt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				kt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				kt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				kt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				kt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				kt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				kt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				kt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				kt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				Dt(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Jt.get(n) || n, Dt(e, n, r));
		}
	}
	function Nd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				Kt(e, r, a);
				break;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(o(61));
					if (n = r.__html, n != null) {
						if (i.children != null) throw Error(o(60));
						e.innerHTML = n;
					}
				}
				break;
			case "children":
				typeof r == "string" ? Ut(e, r) : (typeof r == "number" || typeof r == "bigint") && Ut(e, "" + r);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = Zt);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!bt.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[st] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Dt(e, n, r);
			}
		}
	}
	function Pd(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				Q("error", e), Q("load", e);
				var r = !1, i = !1, a;
				for (a in n) if (n.hasOwnProperty(a)) {
					var s = n[a];
					if (s != null) switch (a) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							i = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(o(137, t));
						default: $(e, t, a, s, n, null);
					}
				}
				i && $(e, t, "srcSet", n.srcSet, n, null), r && $(e, t, "src", n.src, n, null);
				return;
			case "input":
				Q("invalid", e);
				var c = a = s = i = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							i = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							a = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(o(137, t));
							break;
						default: $(e, t, r, d, n, null);
					}
				}
				B(e, a, c, l, u, s, i, !1);
				return;
			case "select":
				for (i in Q("invalid", e), r = s = a = null, n) if (n.hasOwnProperty(i) && (c = n[i], c != null)) switch (i) {
					case "value":
						a = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: $(e, t, i, c, n, null);
				}
				t = a, n = s, e.multiple = !!r, t == null ? n != null && Bt(e, !!r, n, !0) : Bt(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Q("invalid", e), a = i = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						i = c;
						break;
					case "children":
						a = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(o(91));
						break;
					default: $(e, t, s, c, n, null);
				}
				Ht(e, r, i, a);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: $(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Q("beforetoggle", e), Q("toggle", e), Q("cancel", e), Q("close", e);
				break;
			case "iframe":
			case "object":
				Q("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < _d.length; r++) Q(_d[r], e);
				break;
			case "image":
				Q("error", e), Q("load", e);
				break;
			case "details":
				Q("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Q("error", e), Q("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(o(137, t));
					default: $(e, t, u, r, n, null);
				}
				return;
			default: if (qt(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && Nd(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && $(e, t, c, r, n, null));
	}
	function Fd(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var i = null, a = null, s = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || $(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							a = m;
							break;
						case "name":
							i = m;
							break;
						case "checked":
							u = m;
							break;
						case "defaultChecked":
							d = m;
							break;
						case "value":
							s = m;
							break;
						case "defaultValue":
							c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(o(137, t));
							break;
						default: m !== f && $(e, t, p, m, r, f);
					}
				}
				Rt(e, s, c, l, u, d, a, i);
				return;
			case "select":
				for (a in m = s = c = p = null, n) if (l = n[a], n.hasOwnProperty(a) && l != null) switch (a) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(a) || $(e, t, a, null, r, l);
				}
				for (i in r) if (a = r[i], l = n[i], r.hasOwnProperty(i) && (a != null || l != null)) switch (i) {
					case "value":
						p = a;
						break;
					case "defaultValue":
						c = a;
						break;
					case "multiple": s = a;
					default: a !== l && $(e, t, i, a, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? Bt(e, !!n, n ? [] : "", !1) : Bt(e, !!n, t, !0)) : Bt(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (i = n[c], n.hasOwnProperty(c) && i != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: $(e, t, c, null, r, i);
				}
				for (s in r) if (i = r[s], a = n[s], r.hasOwnProperty(s) && (i != null || a != null)) switch (s) {
					case "value":
						p = i;
						break;
					case "defaultValue":
						m = i;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (i != null) throw Error(o(91));
						break;
					default: i !== a && $(e, t, s, i, r, a);
				}
				Vt(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: $(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: $(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && $(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(o(137, t));
						break;
					default: $(e, t, u, p, r, m);
				}
				return;
			default: if (qt(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && Nd(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || Nd(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && $(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || $(e, t, f, p, r, m);
	}
	function Id(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function Ld() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && Id(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && Id(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var Rd = null, zd = null;
	function Bd(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function Vd(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function Hd(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function Ud(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var Wd = null;
	function Gd() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== Wd && (Wd = e, !0) : (Wd = null, !1);
	}
	var Kd = typeof setTimeout == "function" ? setTimeout : void 0, qd = typeof clearTimeout == "function" ? clearTimeout : void 0, Jd = typeof Promise == "function" ? Promise : void 0, Yd = typeof queueMicrotask == "function" ? queueMicrotask : Jd === void 0 ? Kd : function(e) {
		return Jd.resolve(null).then(e).catch(Xd);
	};
	function Xd(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Zd(e) {
		return e === "head";
	}
	function Qd(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Np(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") pf(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, pf(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[pt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && pf(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Np(t);
	}
	function $d(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function ef(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					ef(n), mt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function tf(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[pt]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = cf(e.nextSibling), e === null) break;
		}
		return null;
	}
	function nf(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = cf(e.nextSibling), e === null)) return null;
		return e;
	}
	function rf(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = cf(e.nextSibling), e === null)) return null;
		return e;
	}
	function af(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function of(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function sf(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function cf(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var lf = null;
	function uf(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return cf(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function df(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function ff(e, t, n) {
		switch (t = Bd(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(o(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(o(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(o(454));
				return e;
			default: throw Error(o(451));
		}
	}
	function pf(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		mt(e);
	}
	var mf = /* @__PURE__ */ new Map(), hf = /* @__PURE__ */ new Set();
	function gf(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
	}
	var _f = j.d;
	j.d = {
		f: vf,
		r: yf,
		D: Sf,
		C: Cf,
		L: wf,
		m: Tf,
		X: Df,
		S: Ef,
		M: Of
	};
	function vf() {
		var e = _f.f(), t = bu();
		return e || t;
	}
	function yf(e) {
		var t = gt(e);
		t !== null && t.tag === 5 && t.type === "form" ? Ts(t) : _f.r(e);
	}
	var bf = typeof document > "u" ? null : document;
	function xf(e, t, n) {
		var r = bf;
		if (r && typeof t == "string" && t) {
			var i = Lt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), hf.has(i) || (hf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Pd(t, "link", e), z(t), r.head.appendChild(t)));
		}
	}
	function Sf(e) {
		_f.D(e), xf("dns-prefetch", e, null);
	}
	function Cf(e, t) {
		_f.C(e, t), xf("preconnect", e, t);
	}
	function wf(e, t, n) {
		_f.L(e, t, n);
		var r = bf;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + Lt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Lt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Lt(n.imageSizes) + "\"]")) : i += "[href=\"" + Lt(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Af(e);
					break;
				case "script": a = Pf(e);
			}
			mf.has(a) || (e = h({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), mf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(jf(a)) || t === "script" && r.querySelector(Ff(a)) || (t = r.createElement("link"), Pd(t, "link", e), z(t), r.head.appendChild(t)));
		}
	}
	function Tf(e, t) {
		_f.m(e, t);
		var n = bf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Lt(r) + "\"][href=\"" + Lt(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Pf(e);
			}
			if (!mf.has(a) && (e = h({
				rel: "modulepreload",
				href: e
			}, t), mf.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(Ff(a))) return;
				}
				r = n.createElement("link"), Pd(r, "link", e), z(r), n.head.appendChild(r);
			}
		}
	}
	function Ef(e, t, n) {
		_f.S(e, t, n);
		var r = bf;
		if (r && e) {
			var i = vt(r).hoistableStyles, a = Af(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(jf(a))) s.loading = 5;
				else {
					e = h({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = mf.get(a)) && Rf(e, n);
					var c = o = r.createElement("link");
					z(c), Pd(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Lf(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function Df(e, t) {
		_f.X(e, t);
		var n = bf;
		if (n && e) {
			var r = vt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), z(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Of(e, t) {
		_f.M(e, t);
		var n = bf;
		if (n && e) {
			var r = vt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), z(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function kf(e, t, n, r) {
		var i = (i = I.current) ? gf(i) : null;
		if (!i) throw Error(o(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Af(n.href), n = vt(i).hoistableStyles, r = n.get(t), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, n.set(t, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = Af(n.href);
					var a = vt(i).hoistableStyles, s = a.get(e);
					if (s || (i = i.ownerDocument || i, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, a.set(e, s), (a = i.querySelector(jf(e))) && !a._p && (s.instance = a, s.state.loading = 5), mf.has(e) || (n = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, mf.set(e, n), a || Nf(i, e, n, s.state))), t && r === null) throw Error(o(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(o(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Pf(n), n = vt(i).hoistableScripts, r = n.get(t), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, n.set(t, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(o(444, e));
		}
	}
	function Af(e) {
		return "href=\"" + Lt(e) + "\"";
	}
	function jf(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Mf(e) {
		return h({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Nf(e, t, n, r) {
		e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]") ? r.loading = 1 : (t = e.createElement("link"), r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		}), Pd(t, "link", n), z(t), e.head.appendChild(t));
	}
	function Pf(e) {
		return "[src=\"" + Lt(e) + "\"]";
	}
	function Ff(e) {
		return "script[async]" + e;
	}
	function If(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Lt(n.href) + "\"]");
				if (r) return t.instance = r, z(r), r;
				var i = h({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), z(r), Pd(r, "style", i), Lf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = Af(n.href);
				var a = e.querySelector(jf(i));
				if (a) return t.state.loading |= 4, t.instance = a, z(a), a;
				r = Mf(n), (i = mf.get(i)) && Rf(r, i), a = (e.ownerDocument || e).createElement("link"), z(a);
				var s = a;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), Pd(a, "link", r), t.state.loading |= 4, Lf(a, n.precedence, e), t.instance = a;
			case "script": return a = Pf(n.src), (i = e.querySelector(Ff(a))) ? (t.instance = i, z(i), i) : (r = n, (i = mf.get(a)) && (r = h({}, n), zf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), z(i), Pd(i, "link", r), e.head.appendChild(i), t.instance = i);
			case "void": return null;
			default: throw Error(o(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Lf(r, n.precedence, e));
		return t.instance;
	}
	function Lf(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Rf(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function zf(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Bf = null;
	function Vf(e, t, n) {
		if (Bf === null) {
			var r = /* @__PURE__ */ new Map(), i = Bf = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Bf, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[pt] || a[R] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Hf(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function Uf(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Wf(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Gf(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Af(r.href), a = t.querySelector(jf(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Jf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, z(a);
					return;
				}
				a = t.ownerDocument || t, r = Mf(r), (i = mf.get(i)) && Rf(r, i), a = a.createElement("link"), z(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Pd(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = Jf.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var Kf = 0;
	function qf(e, t) {
		return e.stylesheets && e.count === 0 && Xf(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && Xf(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && Kf === 0 && (Kf = 62500 * Ld());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Xf(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > Kf ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function Jf() {
		if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
			if (this.stylesheets) Xf(this, this.stylesheets);
			else if (this.unsuspend) {
				var e = this.unsuspend;
				this.unsuspend = null, e();
			}
		}
	}
	var Yf = null;
	function Xf(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, Yf = /* @__PURE__ */ new Map(), t.forEach(Zf, e), Yf = null, Jf.call(e));
	}
	function Zf(e, t) {
		if (!(t.state.loading & 4)) {
			var n = Yf.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), Yf.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = Jf.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var Qf = {
		$$typeof: C,
		Provider: null,
		Consumer: null,
		_currentValue: oe,
		_currentValue2: oe,
		_threadCount: 0
	};
	function $f(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Xe(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Xe(0), this.hiddenUpdates = Xe(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function ep(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new $f(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = oi(3, null, null, t), e.current = a, a.stateNode = e, t = aa(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Ra(a), e;
	}
	function tp(e) {
		return e ? (e = ii, e) : ii;
	}
	function np(e, t, n, r, i, a) {
		i = tp(i), r.context === null ? r.context = i : r.pendingContext = i, r = Ba(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Va(e, r, t), n !== null && (hu(n, e, t), Ha(n, e, t));
	}
	function rp(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ip(e, t) {
		rp(e, t), (e = e.alternate) && rp(e, t);
	}
	function ap(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = ti(e, 67108864);
			t !== null && hu(t, e, 67108864), ip(e, 67108864);
		}
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = pu();
			t = nt(t);
			var n = ti(e, t);
			n !== null && hu(n, e, t), ip(e, t);
		}
	}
	var sp = !0;
	function cp(e, t, n, r) {
		var i = A.T;
		A.T = null;
		var a = j.p;
		try {
			j.p = 2, up(e, t, n, r);
		} finally {
			j.p = a, A.T = i;
		}
	}
	function lp(e, t, n, r) {
		var i = A.T;
		A.T = null;
		var a = j.p;
		try {
			j.p = 8, up(e, t, n, r);
		} finally {
			j.p = a, A.T = i;
		}
	}
	function up(e, t, n, r) {
		if (sp) {
			var i = dp(r);
			if (i === null) wd(e, t, r, fp, n), Cp(e, r);
			else if (Tp(i, e, t, n, r)) r.stopPropagation();
			else if (Cp(e, r), t & 4 && -1 < Sp.indexOf(e)) {
				for (; i !== null;) {
					var a = gt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = Ke(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - ze(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									rd(a), !(K & 6) && (tu = De() + 500, id(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = ti(a, 2), s !== null && hu(s, a, 2), bu(), ip(a, 2);
					}
					if (a = dp(r), a === null && wd(e, t, r, fp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else wd(e, t, r, null, n);
		}
	}
	function dp(e) {
		return e = $t(e), pp(e);
	}
	var fp = null;
	function pp(e) {
		if (fp = null, e = ht(e), e !== null) {
			var t = l(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = u(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = d(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return fp = e, null;
	}
	function mp(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "resize":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (Oe()) {
				case ke: return 2;
				case Ae: return 8;
				case je:
				case Me: return 32;
				case Ne: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var hp = !1, gp = null, _p = null, vp = null, yp = /* @__PURE__ */ new Map(), bp = /* @__PURE__ */ new Map(), xp = [], Sp = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Cp(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				gp = null;
				break;
			case "dragenter":
			case "dragleave":
				_p = null;
				break;
			case "mouseover":
			case "mouseout":
				vp = null;
				break;
			case "pointerover":
			case "pointerout":
				yp.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": bp.delete(t.pointerId);
		}
	}
	function wp(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = gt(t), t !== null && ap(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Tp(e, t, n, r, i) {
		switch (t) {
			case "focusin": return gp = wp(gp, e, t, n, r, i), !0;
			case "dragenter": return _p = wp(_p, e, t, n, r, i), !0;
			case "mouseover": return vp = wp(vp, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return yp.set(a, wp(yp.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, bp.set(a, wp(bp.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Ep(e) {
		var t = ht(e.target);
		if (t !== null) {
			var n = l(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = u(n), t !== null) {
						e.blockedOn = t, at(e.priority, function() {
							op(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, at(e.priority, function() {
							op(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Dp(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = dp(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Qt = r, n.target.dispatchEvent(r), Qt = null;
			} else return t = gt(n), t !== null && ap(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Op(e, t, n) {
		Dp(e) && n.delete(t);
	}
	function kp() {
		hp = !1, gp !== null && Dp(gp) && (gp = null), _p !== null && Dp(_p) && (_p = null), vp !== null && Dp(vp) && (vp = null), yp.forEach(Op), bp.forEach(Op);
	}
	function Ap(e, n) {
		e.blockedOn === n && (e.blockedOn = null, hp || (hp = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, kp)));
	}
	var jp = null;
	function Mp(e) {
		jp !== e && (jp = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			jp === e && (jp = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (pp(r || n) === null) continue;
					break;
				}
				var a = gt(n);
				a !== null && (e.splice(t, 3), t -= 3, Cs(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Np(e) {
		function t(t) {
			return Ap(t, e);
		}
		gp !== null && Ap(gp, e), _p !== null && Ap(_p, e), vp !== null && Ap(vp, e), yp.forEach(t), bp.forEach(t);
		for (var n = 0; n < xp.length; n++) {
			var r = xp[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < xp.length && (n = xp[0], n.blockedOn === null);) Ep(n), n.blockedOn === null && xp.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[st] || null;
			if (typeof a == "function") o || Mp(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[st] || null) s = o.formAction;
					else if (pp(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Mp(n);
			}
		}
	}
	function Pp() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Fp(e) {
		this._internalRoot = e;
	}
	Ip.prototype.render = Fp.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(o(409));
		var n = t.current;
		np(n, pu(), e, t, null, null);
	}, Ip.prototype.unmount = Fp.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			np(e.current, 2, null, e, null, null), bu(), t[ct] = null;
		}
	};
	function Ip(e) {
		this._internalRoot = e;
	}
	Ip.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = it();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < xp.length && t !== 0 && t < xp[n].priority; n++);
			xp.splice(n, 0, e), n === 0 && Ep(e);
		}
	};
	var Lp = n.version;
	if (Lp !== "19.2.8") throw Error(o(527, Lp, "19.2.8"));
	j.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(o(188)) : (e = Object.keys(e).join(","), Error(o(268, e)));
		return e = p(t), e = e === null ? null : m(e), e = e === null ? null : e.stateNode, e;
	};
	var Rp = {
		bundleType: 0,
		version: "19.2.8",
		rendererPackageName: "react-dom",
		currentDispatcherRef: A,
		reconcilerVersion: "19.2.8"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var zp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!zp.isDisabled && zp.supportsFiber) try {
			Ie = zp.inject(Rp), Le = zp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(o(299));
		var n = !1, r = "", i = Ks, a = qs, s = Js;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (s = t.onRecoverableError)), t = ep(e, 1, !1, null, null, n, r, null, i, a, s, Pp), e[ct] = t.current, Sd(e), new Fp(t);
	};
})), l = /* @__PURE__ */ e(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = c();
})), u = a(), d = l(), f = class extends Error {
	status;
	constructor(e, t) {
		super(e), this.status = t;
	}
};
async function p(e, t) {
	let n = await fetch(e, {
		...t,
		headers: {
			"Content-Type": "application/json",
			...t?.headers
		}
	});
	if (n.status === 401 && e.startsWith("/api/") && !e.startsWith("/api/auth/")) return location.reload(), new Promise(() => {});
	let r = await n.json().catch(() => ({}));
	if (!n.ok) throw new f(r.error ?? `Request failed: ${n.status}`, n.status);
	return r;
}
//#endregion
//#region client/lib/i18n.ts
var m = /* @__PURE__ */ new Map();
async function h(e) {
	let t = m.get(e);
	if (t) return t;
	let n = await fetch(`/setting/language/${encodeURIComponent(e)}.json`);
	if (!n.ok) throw Error(`Language file not found: ${e}`);
	let r = await n.json();
	return m.set(e, r), r;
}
async function g(e) {
	try {
		return await h(e);
	} catch {
		if (e === "en") return {};
		try {
			return await h("en");
		} catch {
			return {};
		}
	}
}
async function _() {
	let e = await fetch("/api/languages");
	if (!e.ok) return [{
		code: "en",
		label: "English"
	}];
	let { locales: t } = await e.json();
	return (await Promise.all(t.map(async (e) => {
		try {
			return {
				code: e,
				label: (await h(e))._label ?? e
			};
		} catch {
			return {
				code: e,
				label: e
			};
		}
	}))).sort((e, t) => e.code === "en" ? -1 : t.code === "en" ? 1 : e.label.localeCompare(t.label));
}
function v(e, t, n, r = {}) {
	let i = e[n] ?? t[n] ?? n;
	for (let [e, t] of Object.entries(r)) i = i.replaceAll(`{${e}}`, String(t));
	return i;
}
function y() {
	return localStorage.getItem("cline-language") ?? (navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en");
}
function b(e) {
	return e === "ja" ? "ja-JP" : e === "en" ? "en-US" : e;
}
//#endregion
//#region node_modules/.pnpm/marked@18.0.9/node_modules/marked/lib/marked.esm.js
function x() {
	return {
		async: !1,
		breaks: !1,
		extensions: null,
		gfm: !0,
		hooks: null,
		pedantic: !1,
		renderer: null,
		silent: !1,
		tokenizer: null,
		walkTokens: null
	};
}
var S = x();
function C(e) {
	S = e;
}
var w = { exec: () => null };
function ee(e) {
	let t = [];
	return (n) => {
		let r = Math.max(0, Math.min(3, n - 1)), i = t[r];
		return i || (i = e(r), t[r] = i), i;
	};
}
function T(e, t = "") {
	let n = typeof e == "string" ? e : e.source, r = {
		replace: (e, t) => {
			let i = typeof t == "string" ? t : t.source;
			return i = i.replace(E.caret, "$1"), n = n.replace(e, i), r;
		},
		getRegex: () => new RegExp(n, t)
	};
	return r;
}
var te = ((e = "") => {
	try {
		return !!RegExp("(?<=1)(?<!1)" + e);
	} catch {
		return !1;
	}
})(), E = {
	codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
	outputLinkReplace: /\\([\[\]])/g,
	indentCodeCompensation: /^(\s+)(?:```)/,
	beginningSpace: /^\s+/,
	endingHash: /#$/,
	startingSpaceChar: /^ /,
	endingSpaceChar: / $/,
	nonSpaceChar: /[^ ]/,
	newLineCharGlobal: /\n/g,
	tabCharGlobal: /\t/g,
	multipleSpaceGlobal: /\s+/g,
	blankLine: /^[ \t]*$/,
	doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
	blockquoteStart: /^ {0,3}>/,
	blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
	blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
	listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
	listIsTask: /^\[[ xX]\] +\S/,
	listReplaceTask: /^\[[ xX]\] +/,
	listTaskCheckbox: /\[[ xX]\]/,
	anyLine: /\n.*\n/,
	hrefBrackets: /^<(.*)>$/,
	tableDelimiter: /[:|]/,
	tableAlignChars: /^\||\| *$/g,
	tableRowBlankLine: /\n[ \t]*$/,
	tableAlignRight: /^ *-+: *$/,
	tableAlignCenter: /^ *:-+: *$/,
	tableAlignLeft: /^ *:-+ *$/,
	startATag: /^<a /i,
	endATag: /^<\/a>/i,
	startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
	endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
	startAngleBracket: /^</,
	endAngleBracket: />$/,
	pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
	unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
	escapeTest: /[&<>"']/,
	escapeReplace: /[&<>"']/g,
	escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
	escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
	caret: /(^|[^\[])\^/g,
	percentDecode: /%25/g,
	findPipe: /\|/g,
	splitPipe: / \|/,
	slashPipe: /\\\|/g,
	carriageReturn: /\r\n|\r/g,
	spaceLine: /^ +$/gm,
	notSpaceStart: /^\S*/,
	endingNewline: /\n$/,
	listItemRegex: (e) => RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),
	nextBulletRegex: ee((e) => RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),
	hrRegex: ee((e) => RegExp(`^ {0,${e}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),
	fencesBeginRegex: ee((e) => RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),
	headingBeginRegex: ee((e) => RegExp(`^ {0,${e}}#`)),
	htmlBeginRegex: ee((e) => RegExp(`^ {0,${e}}<(?:[a-z].*>|!--)`, "i")),
	blockquoteBeginRegex: ee((e) => RegExp(`^ {0,${e}}>`))
}, ne = /^(?:[ \t]*(?:\n|$))+/, re = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, D = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, O = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, ie = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, ae = / {0,3}(?:[*+-]|\d{1,9}[.)])/, k = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, A = T(k).replace(/bull/g, ae).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), j = T(k).replace(/bull/g, ae).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), oe = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/, M = /^[^\n]+/, N = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, se = T(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", N).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), ce = T(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, ae).getRegex(), P = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", F = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, le = T("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", F).replace("tag", P).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), I = (e) => T(oe).replace("hr", O).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", e).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", P).getRegex(), ue = I(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/), de = I(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/), fe = {
	blockquote: T(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", de).getRegex(),
	code: re,
	def: se,
	fences: D,
	heading: ie,
	hr: O,
	html: le,
	lheading: A,
	list: ce,
	newline: ne,
	paragraph: ue,
	table: w,
	text: M
}, pe = T("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", O).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", P).getRegex(), me = {
	...fe,
	lheading: j,
	table: pe,
	paragraph: T(oe).replace("hr", O).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", pe).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", P).getRegex()
}, he = {
	...fe,
	html: T("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment", F).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
	def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
	heading: /^(#{1,6})(.*)(?:\n+|$)/,
	fences: w,
	lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
	paragraph: T(oe).replace("hr", O).replace("heading", " *#{1,6} *[^\n]").replace("lheading", A).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, ge = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, _e = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, ve = /^( {2,}|\\)\n(?!\s*$)/, ye = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, be = /[\p{P}\p{S}]/u, xe = /[\s\p{P}\p{S}]/u, Se = /[^\s\p{P}\p{S}]/u, Ce = T(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, xe).getRegex(), we = /[\p{Pi}\p{Ps}"']/u, Te = /(?!~)[\p{P}\p{S}]/u, Ee = /(?!~)[\s\p{P}\p{S}]/u, De = /(?:[^\s\p{P}\p{S}]|~)/u, Oe = T(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", te ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), ke = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/, Ae = T(ke, "u").replace(/punct/g, be).getRegex(), je = T(ke, "u").replace(/punct/g, Te).getRegex(), Me = T(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/, "u").replace(/openQuote/g, we).replace(/punct/g, be).getRegex(), Ne = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Pe = T(Ne, "gu").replace(/notPunctSpace/g, Se).replace(/punctSpace/g, xe).replace(/punct/g, be).getRegex(), Fe = T(Ne, "gu").replace(/notPunctSpace/g, De).replace(/punctSpace/g, Ee).replace(/punct/g, Te).getRegex(), Ie = T("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Se).replace(/punctSpace/g, xe).replace(/punct/g, be).getRegex(), Le = T("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, Se).replace(/punctSpace/g, xe).replace(/punct/g, be).getRegex(), Re = T("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Se).replace(/punctSpace/g, xe).replace(/punct/g, be).getRegex(), ze = T(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, be).getRegex(), Be = T("^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Se).replace(/punctSpace/g, xe).replace(/punct/g, be).getRegex(), Ve = T(/\\(punct)/, "gu").replace(/punct/g, be).getRegex(), He = T(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Ue = T(F).replace("(?:-->|$)", "-->").getRegex(), We = T("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Ue).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Ge = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/, Ke = T(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", Ge).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), qe = T(/^!?\[(label)\]\[(ref)\]/).replace("label", Ge).replace("ref", N).getRegex(), Je = T(/^!?\[(ref)\](?:\[\])?/).replace("ref", N).getRegex(), L = T("reflink|nolink(?!\\()", "g").replace("reflink", qe).replace("nolink", Je).getRegex(), Ye = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, Xe = {
	_backpedal: w,
	anyPunctuation: Ve,
	autolink: He,
	blockSkip: Oe,
	br: ve,
	code: _e,
	del: w,
	delLDelim: w,
	delRDelim: w,
	emStrongLDelim: Ae,
	emStrongRDelimAst: Pe,
	emStrongRDelimUnd: Le,
	escape: ge,
	link: Ke,
	nolink: Je,
	punctuation: Ce,
	reflink: qe,
	reflinkSearch: L,
	tag: We,
	text: ye,
	url: w
}, Ze = {
	...Xe,
	emStrongLDelim: Me,
	emStrongRDelimAst: Ie,
	emStrongRDelimUnd: Re,
	link: T(/^!?\[(label)\]\((.*?)\)/).replace("label", Ge).getRegex(),
	reflink: T(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Ge).getRegex()
}, Qe = {
	...Xe,
	emStrongRDelimAst: Fe,
	emStrongLDelim: je,
	delLDelim: ze,
	delRDelim: Be,
	url: T(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", Ye).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
	_backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
	del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
	text: T(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", Ye).getRegex()
}, $e = {
	...Qe,
	br: T(ve).replace("{2,}", "*").getRegex(),
	text: T(Qe.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, et = {
	normal: fe,
	gfm: me,
	pedantic: he
}, tt = {
	normal: Xe,
	gfm: Qe,
	breaks: $e,
	pedantic: Ze
}, nt = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
}, rt = (e) => nt[e];
function it(e, t) {
	if (t) {
		if (E.escapeTest.test(e)) return e.replace(E.escapeReplace, rt);
	} else if (E.escapeTestNoEncode.test(e)) return e.replace(E.escapeReplaceNoEncode, rt);
	return e;
}
function at(e) {
	try {
		e = encodeURI(e).replace(E.percentDecode, "%");
	} catch {
		return null;
	}
	return e;
}
function ot(e, t) {
	let n = e.replace(E.findPipe, (e, t, n) => {
		let r = !1, i = t;
		for (; --i >= 0 && n[i] === "\\";) r = !r;
		return r ? "|" : " |";
	}).split(E.splitPipe), r = 0;
	if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), t) {
		if (n.length > t) n.splice(t);
		else for (; n.length < t;) n.push("");
	}
	for (; r < n.length; r++) n[r] = n[r].trim().replace(E.slashPipe, "|");
	return n;
}
function R(e, t, n) {
	let r = e.length;
	if (r === 0) return "";
	let i = 0;
	for (; i < r;) {
		let a = e.charAt(r - i - 1);
		if (a === t && !n) i++;
		else if (a !== t && n) i++;
		else break;
	}
	return e.slice(0, r - i);
}
function st(e) {
	let t = e.split("\n"), n = t.length - 1;
	for (; n >= 0 && E.blankLine.test(t[n]);) n--;
	return t.length - n <= 2 ? e : t.slice(0, n + 1).join("\n");
}
function ct(e, t) {
	if (e.indexOf(t[1]) === -1) return -1;
	let n = 0;
	for (let r = 0; r < e.length; r++) if (e[r] === "\\") r++;
	else if (e[r] === t[0]) n++;
	else if (e[r] === t[1] && (n--, n < 0)) return r;
	return n > 0 ? -2 : -1;
}
function lt(e, t = 0) {
	let n = t, r = "";
	for (let t of e) if (t === "	") {
		let e = 4 - n % 4;
		r += " ".repeat(e), n += e;
	} else r += t, n++;
	return r;
}
function ut(e, t, n, r, i) {
	let a = t.href, o = t.title || null, s = e[1].replace(i.other.outputLinkReplace, "$1");
	r.state.inLink = !0;
	let c = {
		type: e[0].charAt(0) === "!" ? "image" : "link",
		raw: n,
		href: a,
		title: o,
		text: s,
		tokens: r.inlineTokens(s)
	};
	return r.state.inLink = !1, c;
}
function dt(e, t, n) {
	let r = e.match(n.other.indentCodeCompensation);
	if (r === null) return t;
	let i = r[1];
	return t.split("\n").map((e) => {
		let t = e.match(n.other.beginningSpace);
		if (t === null) return e;
		let [r] = t;
		return r.length >= i.length ? e.slice(i.length) : e;
	}).join("\n");
}
var ft = class {
	options;
	rules;
	lexer;
	constructor(e) {
		this.options = e || S;
	}
	space(e) {
		let t = this.rules.block.newline.exec(e);
		if (t && t[0].length > 0) return {
			type: "space",
			raw: t[0]
		};
	}
	code(e) {
		let t = this.rules.block.code.exec(e);
		if (t) {
			let e = this.options.pedantic ? t[0] : st(t[0]);
			return {
				type: "code",
				raw: e,
				codeBlockStyle: "indented",
				text: e.replace(this.rules.other.codeRemoveIndent, "")
			};
		}
	}
	fences(e) {
		let t = this.rules.block.fences.exec(e);
		if (t) {
			let e = t[0], n = dt(e, t[3] || "", this.rules);
			return {
				type: "code",
				raw: e,
				lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
				text: n
			};
		}
	}
	heading(e) {
		let t = this.rules.block.heading.exec(e);
		if (t) {
			let e = t[2].trim();
			if (this.rules.other.endingHash.test(e)) {
				let t = R(e, "#");
				(this.options.pedantic || !t || this.rules.other.endingSpaceChar.test(t)) && (e = t.trim());
			}
			return {
				type: "heading",
				raw: R(t[0], "\n"),
				depth: t[1].length,
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	hr(e) {
		let t = this.rules.block.hr.exec(e);
		if (t) return {
			type: "hr",
			raw: R(t[0], "\n")
		};
	}
	blockquote(e) {
		let t = this.rules.block.blockquote.exec(e);
		if (t) {
			let e = R(t[0], "\n").split("\n"), n = "", r = "", i = [];
			for (; e.length > 0;) {
				let t = !1, a = [], o;
				for (o = 0; o < e.length; o++) if (this.rules.other.blockquoteStart.test(e[o])) a.push(e[o]), t = !0;
				else if (!t) a.push(e[o]);
				else break;
				e = e.slice(o);
				let s = a.join("\n"), c = s.replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
				n = n ? `${n}
${s}` : s, r = r ? `${r}
${c}` : c;
				let l = this.lexer.state.top;
				if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = l, e.length === 0) break;
				let u = i.at(-1);
				if (u?.type === "code") break;
				if (u?.type === "blockquote") {
					let t = u, a = e.join("\n"), o = t.raw + "\n" + a.replace(this.rules.other.blockquoteSetextReplace2, ""), s = this.blockquote(o);
					i[i.length - 1] = s, n = `${n}
${a}`, r = r.substring(0, r.length - t.text.length) + s.text;
					break;
				}
				if (u?.type === "list") {
					let t = u, a = t.raw + "\n" + e.join("\n"), o = this.list(a);
					i[i.length - 1] = o, n = n.substring(0, n.length - u.raw.length) + o.raw, r = r.substring(0, r.length - t.raw.length) + o.raw, e = a.substring(i.at(-1).raw.length).split("\n");
					continue;
				}
			}
			return {
				type: "blockquote",
				raw: n,
				tokens: i,
				text: r
			};
		}
	}
	list(e) {
		let t = this.rules.block.list.exec(e);
		if (t) {
			let n = t[1].trim(), r = n.length > 1, i = {
				type: "list",
				raw: "",
				ordered: r,
				start: r ? +n.slice(0, -1) : "",
				loose: !1,
				items: []
			};
			n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
			let a = this.rules.other.listItemRegex(n), o = !1;
			for (; e;) {
				let n = !1, r = "", s = "";
				if (!(t = a.exec(e)) || this.rules.block.hr.test(e)) break;
				r = t[0], e = e.substring(r.length);
				let c = lt(t[2].split("\n", 1)[0], t[1].length), l = e.split("\n", 1)[0], u = !c.trim(), d = 0;
				if (this.options.pedantic ? (d = 2, s = c.trimStart()) : u ? d = t[1].length + 1 : (d = c.search(this.rules.other.nonSpaceChar), d = d > 4 ? 1 : d, s = c.slice(d), d += t[1].length), u && this.rules.other.blankLine.test(l) && (r += l + "\n", e = e.substring(l.length + 1), n = !0), !n) {
					let t = this.rules.other.nextBulletRegex(d), n = this.rules.other.hrRegex(d), i = this.rules.other.fencesBeginRegex(d), a = this.rules.other.headingBeginRegex(d), o = this.rules.other.htmlBeginRegex(d), f = this.rules.other.blockquoteBeginRegex(d);
					for (; e;) {
						let p = e.split("\n", 1)[0], m;
						if (l = p, this.options.pedantic ? (l = l.replace(this.rules.other.listReplaceNesting, "  "), m = l) : m = l.replace(this.rules.other.tabCharGlobal, "    "), i.test(l) || a.test(l) || o.test(l) || f.test(l) || t.test(l) || n.test(l)) break;
						if (m.search(this.rules.other.nonSpaceChar) >= d || !l.trim()) s += "\n" + m.slice(d);
						else {
							if (u || c.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || i.test(c) || a.test(c) || n.test(c)) break;
							s += "\n" + l;
						}
						u = !l.trim(), r += p + "\n", e = e.substring(p.length + 1), c = m.slice(d);
					}
				}
				i.loose || (o ? i.loose = !0 : this.rules.other.doubleBlankLine.test(r) && (o = !0)), i.items.push({
					type: "list_item",
					raw: r,
					task: !!this.options.gfm && this.rules.other.listIsTask.test(s),
					loose: !1,
					text: s,
					tokens: []
				}), i.raw += r;
			}
			let s = i.items.at(-1);
			if (s) s.raw = s.raw.trimEnd(), s.text = s.text.trimEnd();
			else return;
			i.raw = i.raw.trimEnd();
			for (let e of i.items) {
				this.lexer.state.top = !1, e.tokens = this.lexer.blockTokens(e.text, []);
				let t = e.tokens[0];
				if (e.task && (t?.type === "text" || t?.type === "paragraph")) {
					e.text = e.text.replace(this.rules.other.listReplaceTask, ""), t.raw = t.raw.replace(this.rules.other.listReplaceTask, ""), t.text = t.text.replace(this.rules.other.listReplaceTask, "");
					for (let e = this.lexer.inlineQueue.length - 1; e >= 0; e--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)) {
						this.lexer.inlineQueue[e].src = this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask, "");
						break;
					}
					let n = this.rules.other.listTaskCheckbox.exec(e.raw);
					if (n) {
						let t = {
							type: "checkbox",
							raw: n[0] + " ",
							checked: n[0] !== "[ ]"
						};
						e.checked = t.checked, i.loose ? e.tokens[0] && ["paragraph", "text"].includes(e.tokens[0].type) && "tokens" in e.tokens[0] && e.tokens[0].tokens ? (e.tokens[0].raw = t.raw + e.tokens[0].raw, e.tokens[0].text = t.raw + e.tokens[0].text, e.tokens[0].tokens.unshift(t)) : e.tokens.unshift({
							type: "paragraph",
							raw: t.raw,
							text: t.raw,
							tokens: [t]
						}) : e.tokens.unshift(t);
					}
				} else e.task &&= !1;
				if (!i.loose) {
					let t = e.tokens.filter((e) => e.type === "space");
					i.loose = t.length > 0 && t.some((e) => this.rules.other.anyLine.test(e.raw));
				}
			}
			if (i.loose) for (let e of i.items) {
				e.loose = !0;
				for (let t of e.tokens) t.type === "text" && (t.type = "paragraph");
			}
			return i;
		}
	}
	html(e) {
		let t = this.rules.block.html.exec(e);
		if (t) {
			let e = st(t[0]);
			return {
				type: "html",
				block: !0,
				raw: e,
				pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
				text: e
			};
		}
	}
	def(e) {
		let t = this.rules.block.def.exec(e);
		if (t) {
			let e = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), n = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
			return {
				type: "def",
				tag: e,
				raw: R(t[0], "\n"),
				href: n,
				title: r
			};
		}
	}
	table(e) {
		let t = this.rules.block.table.exec(e);
		if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
		let n = ot(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [], a = {
			type: "table",
			raw: R(t[0], "\n"),
			header: [],
			align: [],
			rows: []
		};
		if (n.length === r.length) {
			for (let e of r) this.rules.other.tableAlignRight.test(e) ? a.align.push("right") : this.rules.other.tableAlignCenter.test(e) ? a.align.push("center") : this.rules.other.tableAlignLeft.test(e) ? a.align.push("left") : a.align.push(null);
			for (let e = 0; e < n.length; e++) a.header.push({
				text: n[e],
				tokens: this.lexer.inline(n[e]),
				header: !0,
				align: a.align[e]
			});
			for (let e of i) a.rows.push(ot(e, a.header.length).map((e, t) => ({
				text: e,
				tokens: this.lexer.inline(e),
				header: !1,
				align: a.align[t]
			})));
			return a;
		}
	}
	lheading(e) {
		let t = this.rules.block.lheading.exec(e);
		if (t) {
			let e = t[1].trim();
			return {
				type: "heading",
				raw: R(t[0], "\n"),
				depth: t[2].charAt(0) === "=" ? 1 : 2,
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	paragraph(e) {
		let t = this.rules.block.paragraph.exec(e);
		if (t) {
			let e = t[1].charAt(t[1].length - 1) === "\n" ? t[1].slice(0, -1) : t[1];
			return {
				type: "paragraph",
				raw: t[0],
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	text(e) {
		let t = this.rules.block.text.exec(e);
		if (t) return {
			type: "text",
			raw: t[0],
			text: t[0],
			tokens: this.lexer.inline(t[0])
		};
	}
	escape(e) {
		let t = this.rules.inline.escape.exec(e);
		if (t) return {
			type: "escape",
			raw: t[0],
			text: t[1]
		};
	}
	tag(e) {
		let t = this.rules.inline.tag.exec(e);
		if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
			type: "html",
			raw: t[0],
			inLink: this.lexer.state.inLink,
			inRawBlock: this.lexer.state.inRawBlock,
			block: !1,
			text: t[0]
		};
	}
	link(e) {
		let t = this.rules.inline.link.exec(e);
		if (t) {
			let e = t[2].trim();
			if (!this.options.pedantic && this.rules.other.startAngleBracket.test(e)) {
				if (!this.rules.other.endAngleBracket.test(e)) return;
				let t = R(e.slice(0, -1), "\\");
				if ((e.length - t.length) % 2 == 0) return;
			} else {
				let e = ct(t[2], "()");
				if (e === -2) return;
				if (e > -1) {
					let n = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + e;
					t[2] = t[2].substring(0, e), t[0] = t[0].substring(0, n).trim(), t[3] = "";
				}
			}
			let n = t[2], r = "";
			if (this.options.pedantic) {
				let e = this.rules.other.pedanticHrefTitle.exec(n);
				e && (n = e[1], r = e[3]);
			} else r = t[3] ? t[3].slice(1, -1) : "";
			return n = n.trim(), this.rules.other.startAngleBracket.test(n) && (n = this.options.pedantic && !this.rules.other.endAngleBracket.test(e) ? n.slice(1) : n.slice(1, -1)), ut(t, {
				href: n && n.replace(this.rules.inline.anyPunctuation, "$1"),
				title: r && r.replace(this.rules.inline.anyPunctuation, "$1")
			}, t[0], this.lexer, this.rules);
		}
	}
	reflink(e, t) {
		let n;
		if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
			let e = t[(n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " ").toLowerCase()];
			if (!e) {
				let e = n[0].charAt(0);
				return {
					type: "text",
					raw: e,
					text: e
				};
			}
			return ut(n, e, n[0], this.lexer, this.rules);
		}
	}
	emStrong(e, t, n = "") {
		let r = this.rules.inline.emStrongLDelim.exec(e);
		if (!(!r || !r[1] && !r[2] && !r[3] && !r[4] || r[4] && n.match(this.rules.other.unicodeAlphaNumeric)) && (!(r[1] || r[3]) || !n || this.rules.inline.punctuation.exec(n))) {
			let i = [...r[0]].length - 1, a, o, s = i, c = 0, l = r[0][0], u = n === l, d = l === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
			for (d.lastIndex = 0, t = t.slice(-1 * e.length + i); (r = d.exec(t)) !== null;) {
				if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a) continue;
				if (o = [...a].length, r[3] || r[4]) {
					s += o;
					continue;
				}
				if (r[5] || r[6]) {
					if (i % 3 && !((i + o) % 3)) {
						c += o;
						continue;
					}
					if (u) break;
				}
				if (s -= o, s > 0) continue;
				o = Math.min(o, o + s + c);
				let t = [...r[0]][0].length, n = e.slice(0, i + r.index + t + o);
				if (Math.min(i, o) % 2) {
					let e = n.slice(1, -1);
					return {
						type: "em",
						raw: n,
						text: e,
						tokens: this.lexer.inlineTokens(e)
					};
				}
				let l = n.slice(2, -2);
				return {
					type: "strong",
					raw: n,
					text: l,
					tokens: this.lexer.inlineTokens(l)
				};
			}
		}
	}
	codespan(e) {
		let t = this.rules.inline.code.exec(e);
		if (t) {
			let e = t[2].replace(this.rules.other.newLineCharGlobal, " "), n = this.rules.other.nonSpaceChar.test(e), r = this.rules.other.startingSpaceChar.test(e) && this.rules.other.endingSpaceChar.test(e);
			return n && r && (e = e.substring(1, e.length - 1)), {
				type: "codespan",
				raw: t[0],
				text: e
			};
		}
	}
	br(e) {
		let t = this.rules.inline.br.exec(e);
		if (t) return {
			type: "br",
			raw: t[0]
		};
	}
	del(e, t, n = "") {
		let r = this.rules.inline.delLDelim.exec(e);
		if (r && (!r[1] || !n || this.rules.inline.punctuation.exec(n))) {
			let n = [...r[0]].length - 1, i, a, o = n, s = this.rules.inline.delRDelim;
			for (s.lastIndex = 0, t = t.slice(-1 * e.length + n); (r = s.exec(t)) !== null;) {
				if (i = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !i || (a = [...i].length, a !== n)) continue;
				if (r[3] || r[4]) {
					o += a;
					continue;
				}
				if (o -= a, o > 0) continue;
				a = Math.min(a, a + o);
				let t = [...r[0]][0].length, s = e.slice(0, n + r.index + t + a), c = s.slice(n, -n);
				return {
					type: "del",
					raw: s,
					text: c,
					tokens: this.lexer.inlineTokens(c)
				};
			}
		}
	}
	autolink(e) {
		let t = this.rules.inline.autolink.exec(e);
		if (t) {
			let e, n;
			return t[2] === "@" ? (e = t[1], n = "mailto:" + e) : (e = t[1], n = e), {
				type: "link",
				raw: t[0],
				text: e,
				href: n,
				tokens: [{
					type: "text",
					raw: e,
					text: e
				}]
			};
		}
	}
	url(e) {
		let t;
		if (t = this.rules.inline.url.exec(e)) {
			let e, n;
			if (t[2] === "@") e = t[0], n = "mailto:" + e;
			else {
				let r;
				do
					r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
				while (r !== t[0]);
				e = t[0], n = t[1] === "www." ? "http://" + t[0] : t[0];
			}
			return {
				type: "link",
				raw: t[0],
				text: e,
				href: n,
				tokens: [{
					type: "text",
					raw: e,
					text: e
				}]
			};
		}
	}
	inlineText(e) {
		let t = this.rules.inline.text.exec(e);
		if (t) {
			let e = this.lexer.state.inRawBlock;
			return {
				type: "text",
				raw: t[0],
				text: t[0],
				escaped: e
			};
		}
	}
}, pt = class e {
	tokens;
	options;
	state;
	inlineQueue;
	tokenizer;
	constructor(e) {
		this.tokens = [], this.tokens.links = Object.create(null), this.options = e || S, this.options.tokenizer = this.options.tokenizer || new ft(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
			inLink: !1,
			inRawBlock: !1,
			top: !0
		};
		let t = {
			other: E,
			block: et.normal,
			inline: tt.normal
		};
		this.options.pedantic ? (t.block = et.pedantic, t.inline = tt.pedantic) : this.options.gfm && (t.block = et.gfm, t.inline = this.options.breaks ? tt.breaks : tt.gfm), this.tokenizer.rules = t;
	}
	static get rules() {
		return {
			block: et,
			inline: tt
		};
	}
	static lex(t, n) {
		return new e(n).lex(t);
	}
	static lexInline(t, n) {
		return new e(n).inlineTokens(t);
	}
	lex(e) {
		e = e.replace(E.carriageReturn, "\n"), this.blockTokens(e, this.tokens);
		for (let e = 0; e < this.inlineQueue.length; e++) {
			let t = this.inlineQueue[e];
			this.inlineTokens(t.src, t.tokens);
		}
		return this.inlineQueue = [], this.tokens;
	}
	blockTokens(e, t = [], n = !1) {
		this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(E.tabCharGlobal, "    ").replace(E.spaceLine, ""));
		let r = 1 / 0;
		for (; e;) {
			if (e.length < r) r = e.length;
			else {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
			let i;
			if (this.options.extensions?.block?.some((n) => (i = n.call({ lexer: this }, e, t)) ? (e = e.substring(i.raw.length), t.push(i), !0) : !1)) continue;
			if (i = this.tokenizer.space(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				i.raw.length === 1 && n !== void 0 ? n.raw += "\n" : t.push(i);
				continue;
			}
			if (i = this.tokenizer.code(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "paragraph" || n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.text, this.inlineQueue.at(-1).src = n.text) : t.push(i);
				continue;
			}
			if (i = this.tokenizer.fences(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.heading(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.hr(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.blockquote(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.list(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.html(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.def(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "paragraph" || n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.raw, this.inlineQueue.at(-1).src = n.text) : this.tokens.links[i.tag] || (this.tokens.links[i.tag] = {
					href: i.href,
					title: i.title
				}, t.push(i));
				continue;
			}
			if (i = this.tokenizer.table(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.lheading(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			let a = e;
			if (this.options.extensions?.startBlock) {
				let t = 1 / 0, n = e.slice(1), r;
				this.options.extensions.startBlock.forEach((e) => {
					r = e.call({ lexer: this }, n), typeof r == "number" && r >= 0 && (t = Math.min(t, r));
				}), t < 1 / 0 && t >= 0 && (a = e.substring(0, t + 1));
			}
			if (this.state.top && (i = this.tokenizer.paragraph(a))) {
				let r = t.at(-1);
				n && r?.type === "paragraph" ? (r.raw += (r.raw.endsWith("\n") ? "" : "\n") + i.raw, r.text += "\n" + i.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = r.text) : t.push(i), n = a.length !== e.length, e = e.substring(i.raw.length);
				continue;
			}
			if (i = this.tokenizer.text(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = n.text) : t.push(i);
				continue;
			}
			if (e) {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
		}
		return this.state.top = !0, t;
	}
	inline(e, t = []) {
		return this.inlineQueue.push({
			src: e,
			tokens: t
		}), t;
	}
	inlineTokens(e, t = []) {
		this.tokenizer.lexer = this;
		let n = e;
		if (this.tokens.links) {
			let e = Object.keys(this.tokens.links);
			e.length > 0 && (n = n.replace(this.tokenizer.rules.inline.reflinkSearch, (t) => e.includes(t.slice(t.lastIndexOf("[") + 1, -1)) ? "[" + "a".repeat(t.length - 2) + "]" : t));
		}
		n = n.replace(this.tokenizer.rules.inline.anyPunctuation, "++"), n = n.replace(this.tokenizer.rules.inline.blockSkip, (e, t, n) => {
			let r = n ? n.length : 0;
			return e.slice(0, r) + "[" + "a".repeat(e.length - r - 2) + "]";
		}), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
		let r = !1, i = "", a = 1 / 0;
		for (; e;) {
			if (e.length < a) a = e.length;
			else {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
			r || (i = ""), r = !1;
			let o;
			if (this.options.extensions?.inline?.some((n) => (o = n.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), !0) : !1)) continue;
			if (o = this.tokenizer.escape(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.tag(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.link(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.reflink(e, this.tokens.links)) {
				e = e.substring(o.raw.length);
				let n = t.at(-1);
				o.type === "text" && n?.type === "text" ? (n.raw += o.raw, n.text += o.text) : t.push(o);
				continue;
			}
			if (o = this.tokenizer.emStrong(e, n, i)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.codespan(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.br(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.del(e, n, i)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.autolink(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (!this.state.inLink && (o = this.tokenizer.url(e))) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			let s = e;
			if (this.options.extensions?.startInline) {
				let t = 1 / 0, n = e.slice(1), r;
				this.options.extensions.startInline.forEach((e) => {
					r = e.call({ lexer: this }, n), typeof r == "number" && r >= 0 && (t = Math.min(t, r));
				}), t < 1 / 0 && t >= 0 && (s = e.substring(0, t + 1));
			}
			if (o = this.tokenizer.inlineText(s)) {
				e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (i = o.raw.slice(-1)), r = !0;
				let n = t.at(-1);
				n?.type === "text" ? (n.raw += o.raw, n.text += o.text) : t.push(o);
				continue;
			}
			if (e) {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
		}
		return t;
	}
	infiniteLoopError(e) {
		let t = "Infinite loop on byte: " + e;
		if (this.options.silent) console.error(t);
		else throw Error(t);
	}
}, mt = class {
	options;
	parser;
	constructor(e) {
		this.options = e || S;
	}
	space(e) {
		return "";
	}
	code({ text: e, lang: t, escaped: n }) {
		let r = (t || "").match(E.notSpaceStart)?.[0], i = e.replace(E.endingNewline, "") + "\n";
		return r ? "<pre><code class=\"language-" + it(r) + "\">" + (n ? i : it(i, !0)) + "</code></pre>\n" : "<pre><code>" + (n ? i : it(i, !0)) + "</code></pre>\n";
	}
	blockquote({ tokens: e }) {
		return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
	}
	html({ text: e }) {
		return e;
	}
	def(e) {
		return "";
	}
	heading({ tokens: e, depth: t }) {
		return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
	}
	hr(e) {
		return "<hr>\n";
	}
	list(e) {
		let t = e.ordered, n = e.start, r = "";
		for (let t = 0; t < e.items.length; t++) {
			let n = e.items[t];
			r += this.listitem(n);
		}
		let i = t ? "ol" : "ul", a = t && n !== 1 ? " start=\"" + n + "\"" : "";
		return "<" + i + a + ">\n" + r + "</" + i + ">\n";
	}
	listitem(e) {
		return `<li>${this.parser.parse(e.tokens)}</li>
`;
	}
	checkbox({ checked: e }) {
		return "<input " + (e ? "checked=\"\" " : "") + "disabled=\"\" type=\"checkbox\"> ";
	}
	paragraph({ tokens: e }) {
		return `<p>${this.parser.parseInline(e)}</p>
`;
	}
	table(e) {
		let t = "", n = "";
		for (let t = 0; t < e.header.length; t++) n += this.tablecell(e.header[t]);
		t += this.tablerow({ text: n });
		let r = "";
		for (let t = 0; t < e.rows.length; t++) {
			let i = e.rows[t];
			n = "";
			for (let e = 0; e < i.length; e++) n += this.tablecell(i[e]);
			r += this.tablerow({ text: n });
		}
		return r &&= `<tbody>${r}</tbody>`, "<table>\n<thead>\n" + t + "</thead>\n" + r + "</table>\n";
	}
	tablerow({ text: e }) {
		return `<tr>
${e}</tr>
`;
	}
	tablecell(e) {
		let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
		return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
	}
	strong({ tokens: e }) {
		return `<strong>${this.parser.parseInline(e)}</strong>`;
	}
	em({ tokens: e }) {
		return `<em>${this.parser.parseInline(e)}</em>`;
	}
	codespan({ text: e }) {
		return `<code>${it(e, !0)}</code>`;
	}
	br(e) {
		return "<br>";
	}
	del({ tokens: e }) {
		return `<del>${this.parser.parseInline(e)}</del>`;
	}
	link({ href: e, title: t, tokens: n }) {
		let r = this.parser.parseInline(n), i = at(e);
		if (i === null) return r;
		e = i;
		let a = "<a href=\"" + e + "\"";
		return t && (a += " title=\"" + it(t) + "\""), a += ">" + r + "</a>", a;
	}
	image({ href: e, title: t, text: n, tokens: r }) {
		r && (n = this.parser.parseInline(r, this.parser.textRenderer));
		let i = at(e);
		if (i === null) return it(n);
		e = i;
		let a = `<img src="${e}" alt="${it(n)}"`;
		return t && (a += ` title="${it(t)}"`), a += ">", a;
	}
	text(e) {
		return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : it(e.text);
	}
}, ht = class {
	strong({ text: e }) {
		return e;
	}
	em({ text: e }) {
		return e;
	}
	codespan({ text: e }) {
		return e;
	}
	del({ text: e }) {
		return e;
	}
	html({ text: e }) {
		return e;
	}
	text({ text: e }) {
		return e;
	}
	link({ text: e }) {
		return "" + e;
	}
	image({ text: e }) {
		return "" + e;
	}
	br() {
		return "";
	}
	checkbox({ raw: e }) {
		return e;
	}
}, gt = class e {
	options;
	renderer;
	textRenderer;
	constructor(e) {
		this.options = e || S, this.options.renderer = this.options.renderer || new mt(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new ht();
	}
	static parse(t, n) {
		return new e(n).parse(t);
	}
	static parseInline(t, n) {
		return new e(n).parseInline(t);
	}
	parse(e) {
		this.renderer.parser = this;
		let t = "";
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if (this.options.extensions?.renderers?.[r.type]) {
				let e = r, n = this.options.extensions.renderers[e.type].call({ parser: this }, e);
				if (n !== !1 || ![
					"space",
					"hr",
					"heading",
					"code",
					"table",
					"blockquote",
					"list",
					"checkbox",
					"html",
					"def",
					"paragraph",
					"text"
				].includes(e.type)) {
					t += n || "";
					continue;
				}
			}
			let i = r;
			switch (i.type) {
				case "space":
					t += this.renderer.space(i);
					break;
				case "hr":
					t += this.renderer.hr(i);
					break;
				case "heading":
					t += this.renderer.heading(i);
					break;
				case "code":
					t += this.renderer.code(i);
					break;
				case "table":
					t += this.renderer.table(i);
					break;
				case "blockquote":
					t += this.renderer.blockquote(i);
					break;
				case "list":
					t += this.renderer.list(i);
					break;
				case "checkbox":
					t += this.renderer.checkbox(i);
					break;
				case "html":
					t += this.renderer.html(i);
					break;
				case "def":
					t += this.renderer.def(i);
					break;
				case "paragraph":
					t += this.renderer.paragraph(i);
					break;
				case "text":
					t += this.renderer.text(i);
					break;
				default: {
					let e = "Token with \"" + i.type + "\" type was not found.";
					if (this.options.silent) return console.error(e), "";
					throw Error(e);
				}
			}
		}
		return t;
	}
	parseInline(e, t = this.renderer) {
		this.renderer.parser = this;
		let n = "";
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (this.options.extensions?.renderers?.[i.type]) {
				let e = this.options.extensions.renderers[i.type].call({ parser: this }, i);
				if (e !== !1 || ![
					"escape",
					"html",
					"link",
					"image",
					"checkbox",
					"strong",
					"em",
					"codespan",
					"br",
					"del",
					"text"
				].includes(i.type)) {
					n += e || "";
					continue;
				}
			}
			let a = i;
			switch (a.type) {
				case "escape":
					n += t.text(a);
					break;
				case "html":
					n += t.html(a);
					break;
				case "link":
					n += t.link(a);
					break;
				case "image":
					n += t.image(a);
					break;
				case "checkbox":
					n += t.checkbox(a);
					break;
				case "strong":
					n += t.strong(a);
					break;
				case "em":
					n += t.em(a);
					break;
				case "codespan":
					n += t.codespan(a);
					break;
				case "br":
					n += t.br(a);
					break;
				case "del":
					n += t.del(a);
					break;
				case "text":
					n += t.text(a);
					break;
				default: {
					let e = "Token with \"" + a.type + "\" type was not found.";
					if (this.options.silent) return console.error(e), "";
					throw Error(e);
				}
			}
		}
		return n;
	}
}, _t = class {
	options;
	block;
	constructor(e) {
		this.options = e || S;
	}
	static passThroughHooks = /* @__PURE__ */ new Set([
		"preprocess",
		"postprocess",
		"processAllTokens",
		"emStrongMask"
	]);
	static passThroughHooksRespectAsync = /* @__PURE__ */ new Set([
		"preprocess",
		"postprocess",
		"processAllTokens"
	]);
	preprocess(e) {
		return e;
	}
	postprocess(e) {
		return e;
	}
	processAllTokens(e) {
		return e;
	}
	emStrongMask(e) {
		return e;
	}
	provideLexer(e = this.block) {
		return e ? pt.lex : pt.lexInline;
	}
	provideParser(e = this.block) {
		return e ? gt.parse : gt.parseInline;
	}
}, vt = new class {
	defaults = x();
	options = this.setOptions;
	parse = this.parseMarkdown(!0);
	parseInline = this.parseMarkdown(!1);
	Parser = gt;
	Renderer = mt;
	TextRenderer = ht;
	Lexer = pt;
	Tokenizer = ft;
	Hooks = _t;
	constructor(...e) {
		this.use(...e);
	}
	walkTokens(e, t) {
		let n = [];
		for (let r of e) switch (n = n.concat(t.call(this, r)), r.type) {
			case "table": {
				let e = r;
				for (let r of e.header) n = n.concat(this.walkTokens(r.tokens, t));
				for (let r of e.rows) for (let e of r) n = n.concat(this.walkTokens(e.tokens, t));
				break;
			}
			case "list": {
				let e = r;
				n = n.concat(this.walkTokens(e.items, t));
				break;
			}
			default: {
				let e = r;
				this.defaults.extensions?.childTokens?.[e.type] ? this.defaults.extensions.childTokens[e.type].forEach((r) => {
					let i = e[r].flat(1 / 0);
					n = n.concat(this.walkTokens(i, t));
				}) : e.tokens && (n = n.concat(this.walkTokens(e.tokens, t)));
			}
		}
		return n;
	}
	use(...e) {
		let t = this.defaults.extensions || {
			renderers: {},
			childTokens: {}
		};
		return e.forEach((e) => {
			let n = { ...e };
			if (n.async = this.defaults.async || n.async || !1, e.extensions && (e.extensions.forEach((e) => {
				if (!e.name) throw Error("extension name required");
				if ("renderer" in e) {
					let n = t.renderers[e.name];
					n ? t.renderers[e.name] = function(...t) {
						let r = e.renderer.apply(this, t);
						return r === !1 && (r = n.apply(this, t)), r;
					} : t.renderers[e.name] = e.renderer;
				}
				if ("tokenizer" in e) {
					if (!e.level || e.level !== "block" && e.level !== "inline") throw Error("extension level must be 'block' or 'inline'");
					let n = t[e.level];
					n ? n.unshift(e.tokenizer) : t[e.level] = [e.tokenizer], e.start && (e.level === "block" ? t.startBlock ? t.startBlock.push(e.start) : t.startBlock = [e.start] : e.level === "inline" && (t.startInline ? t.startInline.push(e.start) : t.startInline = [e.start]));
				}
				"childTokens" in e && e.childTokens && (t.childTokens[e.name] = e.childTokens);
			}), n.extensions = t), e.renderer) {
				let t = this.defaults.renderer || new mt(this.defaults);
				for (let n in e.renderer) {
					if (!(n in t)) throw Error(`renderer '${n}' does not exist`);
					if (["options", "parser"].includes(n)) continue;
					let r = n, i = e.renderer[r], a = t[r];
					t[r] = (...e) => {
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n || "";
					};
				}
				n.renderer = t;
			}
			if (e.tokenizer) {
				let t = this.defaults.tokenizer || new ft(this.defaults);
				for (let n in e.tokenizer) {
					if (!(n in t)) throw Error(`tokenizer '${n}' does not exist`);
					if ([
						"options",
						"rules",
						"lexer"
					].includes(n)) continue;
					let r = n, i = e.tokenizer[r], a = t[r];
					t[r] = (...e) => {
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n;
					};
				}
				n.tokenizer = t;
			}
			if (e.hooks) {
				let t = this.defaults.hooks || new _t();
				for (let n in e.hooks) {
					if (!(n in t)) throw Error(`hook '${n}' does not exist`);
					if (["options", "block"].includes(n)) continue;
					let r = n, i = e.hooks[r], a = t[r];
					t[r] = _t.passThroughHooks.has(n) ? (e) => {
						if (this.defaults.async && _t.passThroughHooksRespectAsync.has(n)) return (async () => {
							let n = await i.call(t, e);
							return a.call(t, n);
						})();
						let r = i.call(t, e);
						return a.call(t, r);
					} : (...e) => {
						if (this.defaults.async) return (async () => {
							let n = await i.apply(t, e);
							return n === !1 && (n = await a.apply(t, e)), n;
						})();
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n;
					};
				}
				n.hooks = t;
			}
			if (e.walkTokens) {
				let t = this.defaults.walkTokens, r = e.walkTokens;
				n.walkTokens = function(e) {
					let n = [];
					return n.push(r.call(this, e)), t && (n = n.concat(t.call(this, e))), n;
				};
			}
			this.defaults = {
				...this.defaults,
				...n
			};
		}), this;
	}
	setOptions(e) {
		return this.defaults = {
			...this.defaults,
			...e
		}, this;
	}
	lexer(e, t) {
		return pt.lex(e, t ?? this.defaults);
	}
	parser(e, t) {
		return gt.parse(e, t ?? this.defaults);
	}
	parseMarkdown(e) {
		return (t, n) => {
			let r = { ...n }, i = {
				...this.defaults,
				...r
			}, a = this.onError(!!i.silent, !!i.async);
			if (this.defaults.async === !0 && r.async === !1) return a(/* @__PURE__ */ Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
			if (typeof t > "u" || t === null) return a(/* @__PURE__ */ Error("marked(): input parameter is undefined or null"));
			if (typeof t != "string") return a(/* @__PURE__ */ Error("marked(): input parameter is of type " + Object.prototype.toString.call(t) + ", string expected"));
			if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async) return (async () => {
				let n = i.hooks ? await i.hooks.preprocess(t) : t, r = await (i.hooks ? await i.hooks.provideLexer(e) : e ? pt.lex : pt.lexInline)(n, i), a = i.hooks ? await i.hooks.processAllTokens(r) : r;
				i.walkTokens && await Promise.all(this.walkTokens(a, i.walkTokens));
				let o = await (i.hooks ? await i.hooks.provideParser(e) : e ? gt.parse : gt.parseInline)(a, i);
				return i.hooks ? await i.hooks.postprocess(o) : o;
			})().catch(a);
			try {
				i.hooks && (t = i.hooks.preprocess(t));
				let n = (i.hooks ? i.hooks.provideLexer(e) : e ? pt.lex : pt.lexInline)(t, i);
				i.hooks && (n = i.hooks.processAllTokens(n)), i.walkTokens && this.walkTokens(n, i.walkTokens);
				let r = (i.hooks ? i.hooks.provideParser(e) : e ? gt.parse : gt.parseInline)(n, i);
				return i.hooks && (r = i.hooks.postprocess(r)), r;
			} catch (e) {
				return a(e);
			}
		};
	}
	onError(e, t) {
		return (n) => {
			if (n.message += "\nPlease report this to https://github.com/markedjs/marked.", e) {
				let e = "<p>An error occurred:</p><pre>" + it(n.message + "", !0) + "</pre>";
				return t ? Promise.resolve(e) : e;
			}
			if (t) return Promise.reject(n);
			throw n;
		};
	}
}();
function z(e, t) {
	return vt.parse(e, t);
}
z.options = z.setOptions = function(e) {
	return vt.setOptions(e), z.defaults = vt.defaults, C(z.defaults), z;
}, z.getDefaults = x, z.defaults = S;
function yt(...e) {
	return vt.use(...e), z.defaults = vt.defaults, C(z.defaults), z;
}
//#endregion
//#region client/lib/markdown.ts
z.use = yt, z.walkTokens = function(e, t) {
	return vt.walkTokens(e, t);
}, z.parseInline = vt.parseInline, z.Parser = gt, z.parser = gt.parse, z.Renderer = mt, z.TextRenderer = ht, z.Lexer = pt, z.lexer = pt.lex, z.Tokenizer = ft, z.Hooks = _t, z.parse = z, z.options, z.setOptions, z.walkTokens, z.parseInline, gt.parse, pt.lex, z.setOptions({
	gfm: !0,
	breaks: !0
});
function bt(e) {
	let n = z.parse(e, { async: !1 });
	return t.sanitize(n, { ADD_ATTR: ["target"] });
}
var xt = null, St = 0;
async function Ct() {
	xt ??= import("./mermaid.core-CoIgm_7k.js").then((e) => e.default);
	let e = await xt;
	return e.initialize({
		startOnLoad: !1,
		securityLevel: "strict",
		theme: document.documentElement.dataset.theme === "light" ? "default" : "dark"
	}), e;
}
async function wt(e) {
	let n = e.querySelectorAll("pre > code.language-mermaid");
	if (n.length === 0) return;
	let r = await Ct();
	for (let e of Array.from(n)) {
		let n = e.parentElement, i = e.textContent ?? "";
		if (!(!n || !i.trim())) try {
			let { svg: e } = await r.render(`mermaid-${Date.now()}-${St++}`, i), a = document.createElement("div");
			a.className = "mermaid-diagram", a.innerHTML = t.sanitize(e, { USE_PROFILES: {
				svg: !0,
				svgFilters: !0
			} }), n.replaceWith(a);
		} catch (e) {
			n.classList.add("mermaid-error");
			let t = document.createElement("div");
			t.className = "mermaid-error-note", t.textContent = e instanceof Error ? e.message : String(e), n.before(t);
		}
	}
}
//#endregion
//#region client/lib/messageLog.ts
function Tt(e) {
	return String(e ?? "").replace(/<environment_details\b[^>]*>[\s\S]*?<\/environment_details>/gi, "").replace(/<system_reminder\b[^>]*>[\s\S]*?<\/system_reminder>/gi, "").replace(/<(?:environment_details|system_reminder)\b[^>]*>[\s\S]*$/gi, "").replace(/<\/?(?:user_input|user_message|task|feedback)\b[^>]*>/gi, "").replace(/<\/?(?:user_input|user_message|task|feedback)\b[^>]*$/gi, "").replace(/^\s*(?:\[?waiting for tool results?\]?|ツールの結果を待っています)[.….]*\s*$/gim, "").replace(/\n{3,}/g, "\n\n");
}
var Et = /* @__PURE__ */ new Set([
	"read_files",
	"search_codebase",
	"run_commands",
	"editor",
	"apply_patch",
	"fetch_web_content",
	"ssh_read_files",
	"ssh_search_files",
	"ssh_run_commands",
	"ssh_write_file",
	"ssh_run_sudo_commands"
]);
function Dt(e) {
	let t = e.indexOf("__");
	return t <= 0 ? null : {
		server: e.slice(0, t),
		tool: e.slice(t + 2)
	};
}
function Ot(e) {
	return Et.has(e) || Dt(e) !== null;
}
function kt(e, t) {
	if (!t || typeof t != "object") return "";
	let n = t;
	return e === "read_files" || e === "ssh_read_files" ? (n.files ?? n.paths ?? []).map((e) => typeof e == "string" ? e : e?.path).filter(Boolean).join("\n") : e === "run_commands" || e === "ssh_run_commands" || e === "ssh_run_sudo_commands" ? typeof n.command == "string" ? n.command : (n.commands ?? []).map((e) => typeof e == "string" ? e : e?.command).filter(Boolean).join("\n") : e === "search_codebase" || e === "ssh_search_files" ? String(n.query ?? n.pattern ?? "") : e === "editor" || e === "apply_patch" || e === "ssh_write_file" ? String(n.path ?? n.filePath ?? n.file_path ?? "") : e === "fetch_web_content" ? String(n.url ?? "") : "";
}
function At(e) {
	return e == null ? "" : typeof e == "string" ? e : Array.isArray(e) && e.every((e) => e && typeof e == "object" && ("query" in e || "result" in e || "error" in e)) ? e.map((e) => [e.query ? `▶ ${e.query}` : "", e.error ? `ERROR: ${e.error}` : String(e.result ?? "")].filter(Boolean).join("\n")).join("\n\n") : JSON.stringify(e, null, 2);
}
function jt(e) {
	return e > 400 ? 64 : e > 120 ? 32 : 12;
}
var Mt = class {
	t;
	showToolDetails;
	locale;
	planStyle;
	container;
	toolCards = /* @__PURE__ */ new Map();
	contentNodes = /* @__PURE__ */ new WeakMap();
	assistantStreamNode = null;
	reasoningStreamNode = null;
	assistantStreamRaw = "";
	reasoningStreamRaw = "";
	assistantStreamPending = "";
	reasoningStreamPending = "";
	streamAnimationFrame = null;
	constructor(e, t, n, r, i = !1) {
		this.container = e, this.t = t, this.showToolDetails = n, this.locale = r, this.planStyle = i;
	}
	scrollToBottom() {
		this.container.scrollTop = this.container.scrollHeight;
	}
	clear() {
		this.resetStreamNodes(), this.toolCards.clear(), this.container.replaceChildren();
	}
	addMessage(e, t, n = []) {
		let r = document.createElement("div");
		r.className = e === "assistant" && this.planStyle ? `message ${e} plan` : `message ${e}`;
		let i = e === "tool" ? String(t ?? "") : Tt(t);
		if (n.length) {
			let e = document.createElement("div");
			e.className = "message-images";
			for (let t of n) {
				let n = document.createElement("img");
				n.src = t, n.alt = this.t("attachImages"), n.loading = "lazy", e.append(n);
			}
			r.append(e);
		}
		if (e === "tool") i && r.append(document.createTextNode(i));
		else {
			let e = document.createElement("div");
			e.className = "message-content", i && (e.innerHTML = bt(i), wt(e)), r.append(e), this.contentNodes.set(r, e);
		}
		return r.hidden = e !== "tool" && !i.trim() && n.length === 0, this.container.append(r), this.scrollToBottom(), r;
	}
	showError(e, t = "Error") {
		let n = e instanceof Error ? e.message : String(e);
		this.addMessage("tool", `${t}: ${n}`);
	}
	addReasoningMessage(e, t = !1) {
		let n = document.createElement("details");
		n.className = "message reasoning", n.open = !0;
		let r = document.createElement("summary");
		r.dataset.reasoningLabel = t ? "redactedThinking" : "thinking", r.textContent = this.t(r.dataset.reasoningLabel);
		let i = document.createElement("div");
		return i.className = "reasoning-content", i.textContent = Tt(e || (t ? this.t("redactedThinking") : "")), n.append(r, i), n.hidden = !i.textContent?.trim(), this.container.append(n), this.scrollToBottom(), i;
	}
	toolDetails(e, t, n) {
		let r = document.createElement("details");
		r.className = "tool-details", r.open = n;
		let i = document.createElement("summary");
		i.textContent = e;
		let a = document.createElement("pre");
		return a.textContent = At(t), r.append(i, a), r;
	}
	addToolActivity({ toolCallId: e, toolName: t, input: n }) {
		let r = Ot(t);
		if (!r && !this.showToolDetails) return null;
		let i = document.createElement("section");
		i.className = `message tool-activity running${r ? "" : " internal-tool"}`;
		let a = document.createElement("div");
		a.className = "tool-activity-header";
		let o = document.createElement("strong"), s = Dt(t);
		o.textContent = s ? `⛁ ${this.t("mcpToolActivity", s)}` : `${t.includes("run_commands") ? ">" : t.includes("read_files") ? "▤" : "◆"} ${this.t(t)}`;
		let c = document.createElement("span");
		c.className = "tool-status", c.textContent = this.t("toolRunning"), a.append(o, c), i.append(a);
		let l = kt(t, n);
		if (l) {
			let e = document.createElement("code");
			e.className = "tool-summary", e.textContent = l, i.append(e);
		}
		return this.showToolDetails && i.append(this.toolDetails(this.t("toolInput"), n, !1)), this.container.append(i), e && this.toolCards.set(e, i), this.scrollToBottom(), i;
	}
	finishToolActivity({ toolCallId: e, toolName: t, output: n, error: r, durationMs: i }) {
		let a = e ? this.toolCards.get(e) : null;
		if (a ||= this.addToolActivity({
			toolCallId: e,
			toolName: t,
			input: null
		}) ?? void 0, !a) return;
		a.classList.remove("running"), a.classList.toggle("failed", !!r), a.classList.add(r ? "failed" : "completed");
		let o = a.querySelector(".tool-status");
		o && (o.textContent = `${this.t(r ? "toolFailed" : "toolCompleted")}${i ? ` · ${i}ms` : ""}`), a.append(this.toolDetails(this.t("toolOutput"), n ?? (r ? `ERROR: ${r}` : ""), !!r)), this.scrollToBottom();
	}
	addCompactionEvent(e) {
		let t = document.createElement("section");
		t.className = "message compaction-event";
		let n = document.createElement("strong");
		n.textContent = `↻ ${this.t("compactionEvent")}`;
		let r = document.createElement("span");
		r.textContent = this.t("compactionDetail", {
			time: Ft(e.at, this.locale),
			message: e.message ?? ""
		}), t.append(n, r), this.container.append(t), this.scrollToBottom();
	}
	appendStream(e, t, n = !1) {
		if (typeof t != "string" || t.length === 0) return;
		let r = e === "reasoning", i = r ? this.reasoningStreamNode : this.assistantStreamNode;
		i || (i = r ? this.addReasoningMessage("", n) : this.addMessage("assistant", ""), r ? this.reasoningStreamNode = i : this.assistantStreamNode = i), r ? i.parentElement?.classList.add("streaming") : i.classList.add("streaming"), r ? this.reasoningStreamPending += t : this.assistantStreamPending += t, this.scheduleStreamFrame();
	}
	scheduleStreamFrame() {
		this.streamAnimationFrame === null && (this.streamAnimationFrame = requestAnimationFrame(() => {
			this.streamAnimationFrame = null, this.flushStreamQueues(!1), (this.assistantStreamPending || this.reasoningStreamPending) && this.scheduleStreamFrame();
		}));
	}
	flushStreamQueues(e) {
		if (this.reasoningStreamPending && this.reasoningStreamNode) {
			let t = e ? this.reasoningStreamPending.length : Math.min(this.reasoningStreamPending.length, jt(this.reasoningStreamPending.length));
			this.reasoningStreamRaw += this.reasoningStreamPending.slice(0, t), this.reasoningStreamPending = this.reasoningStreamPending.slice(t), this.reasoningStreamNode.textContent = Tt(this.reasoningStreamRaw), this.reasoningStreamNode.parentElement && (this.reasoningStreamNode.parentElement.hidden = !this.reasoningStreamNode.textContent?.trim());
		}
		if (this.assistantStreamPending && this.assistantStreamNode) {
			let t = e ? this.assistantStreamPending.length : Math.min(this.assistantStreamPending.length, jt(this.assistantStreamPending.length));
			this.assistantStreamRaw += this.assistantStreamPending.slice(0, t), this.assistantStreamPending = this.assistantStreamPending.slice(t);
			let n = Tt(this.assistantStreamRaw), r = this.contentNodes.get(this.assistantStreamNode);
			r && (r.innerHTML = bt(n)), this.assistantStreamNode.hidden = !n.trim();
		}
		this.scrollToBottom();
	}
	finishStreamNodes() {
		this.streamAnimationFrame !== null && cancelAnimationFrame(this.streamAnimationFrame), this.streamAnimationFrame = null, this.flushStreamQueues(!0);
		let e = this.assistantStreamNode && this.contentNodes.get(this.assistantStreamNode);
		e && wt(e), this.assistantStreamNode?.classList.remove("streaming"), this.reasoningStreamNode?.parentElement?.classList.remove("streaming"), this.container.querySelectorAll(".streaming").forEach((e) => e.classList.remove("streaming"));
	}
	resetStreamNodes() {
		this.finishStreamNodes(), this.streamAnimationFrame !== null && cancelAnimationFrame(this.streamAnimationFrame), this.streamAnimationFrame = null, this.assistantStreamNode = null, this.reasoningStreamNode = null, this.assistantStreamRaw = "", this.reasoningStreamRaw = "", this.assistantStreamPending = "", this.reasoningStreamPending = "";
	}
	renderHistoryMessage(e) {
		let t = e?.role ?? "assistant", n = e?.content;
		if (!(t === "tool" && !this.showToolDetails)) {
			if (typeof n == "string") {
				t === "tool" ? this.finishToolActivity({
					toolName: "unknown",
					output: n
				}) : this.addMessage(t === "user" ? "user" : "assistant", n);
				return;
			}
			if (!Array.isArray(n)) {
				this.addMessage(t === "user" ? "user" : "assistant", Nt(n));
				return;
			}
			for (let e of n) {
				if (typeof e == "string") {
					this.addMessage(t === "user" ? "user" : "assistant", e);
					continue;
				}
				if (!e || typeof e != "object") continue;
				let n = e, r = String(n.type ?? "");
				if (r === "image" && typeof n.data == "string" && typeof n.mediaType == "string") {
					this.addMessage(t === "user" ? "user" : "assistant", "", [`data:${n.mediaType};base64,${n.data}`]);
					continue;
				}
				if (r === "reasoning" || r === "thinking" || r === "redacted_thinking" || "thinking" in n || "reasoning" in n) {
					this.addReasoningMessage(Pt(n), !!(n.redacted || r === "redacted_thinking"));
					continue;
				}
				if (r === "tool-call" || r === "tool_use") {
					let e = String(n.toolName ?? n.name ?? "unknown"), t = n.input ?? n.arguments ?? {};
					this.addToolActivity({
						toolCallId: n.toolCallId ?? n.id,
						toolName: e,
						input: t
					});
					continue;
				}
				if (r === "tool-result" || r === "tool_result" || t === "tool") {
					let e = String(n.toolName ?? n.name ?? ""), t = n.output ?? n.content ?? n.result ?? n, r = Array.isArray(t) ? t.find((e) => e?.error)?.error : n.error;
					this.finishToolActivity({
						toolCallId: n.toolCallId ?? n.tool_use_id,
						toolName: e,
						output: t,
						error: r
					});
					continue;
				}
				let i = Pt(n);
				i ? this.addMessage(t === "user" ? "user" : "assistant", i) : this.showToolDetails && this.finishToolActivity({
					toolName: r,
					output: n
				});
			}
		}
	}
};
function Nt(e) {
	return typeof e == "string" ? e : Array.isArray(e) ? e.map((e) => typeof e == "string" ? e : e && typeof e == "object" && "text" in e && typeof e.text == "string" ? e.text : e && typeof e == "object" && "thinking" in e && typeof e.thinking == "string" ? e.thinking : JSON.stringify(e)).join("\n") : JSON.stringify(e, null, 2);
}
function Pt(e) {
	return typeof e.text == "string" ? e.text : typeof e.thinking == "string" ? e.thinking : typeof e.reasoning == "string" ? e.reasoning : "";
}
function Ft(e, t) {
	return e ? new Intl.DateTimeFormat(b(t), {
		dateStyle: "medium",
		timeStyle: "medium"
	}).format(new Date(e)) : "—";
}
//#endregion
//#region client/hooks/useSyncedState.ts
function It(e) {
	let [t, n] = (0, u.useState)(e), r = (0, u.useRef)(e);
	return [
		t,
		(e) => {
			n((t) => {
				let n = typeof e == "function" ? e(t) : e;
				return r.current = n, n;
			});
		},
		r
	];
}
//#endregion
//#region client/assets/clinehub-for-web.svg
var Lt = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='clinehub-logo'%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20600%20600'%20width='100%25'%20height='100%25'%3e%3cdefs%3e%3cstyle%3e%20.bg-card%20{%20fill:%20%230d1117;%20}%20.globe-color%20{%20fill:%20%2390a3b8;%20}%20.cline-color%20{%20fill:%20%23ffffff;%20}%20%3c/style%3e%3c!--%20地球儀の共通パス定義%20--%3e%3cpath%20id='globe-path'%20class='globe-color'%20d='M227.459,0.072l-0.012-0.009h-0.271C226.347,0.057,225.533,0,224.701,0C100.797,0,0,100.797,0,224.695C0,348.593,100.797,449.39,224.695,449.39c123.897,0,224.695-100.797,224.695-224.695C449.39,101.724,350.08,1.564,227.459,0.072z%20M233.478,157.014c30.591-1.152,58.323-8.163,82.733-18.104c9.436,22.969,15.959,48.76,17.034,77.001h-99.768V157.014z%20M215.912,215.912h-99.768c1.078-28.264,7.577-54.055,17.005-77.019c24.416,9.952,52.163,16.968,82.763,18.121V215.912z%20M98.639,215.912H17.771c1.878-44.786,18.063-85.907,44.072-118.966c15.084,11.896,33.633,24.339,55.279,34.837C106.981,156.439,99.745,184.68,98.639,215.912z%20M98.584,233.478c1.2,31.117,8.331,59.232,18.598,84.101c-21.671,10.498-40.238,22.958-55.333,34.856C35.84,319.379,19.65,278.261,17.777,233.478H98.584z%20M116.167,233.478h99.745v58.907c-30.428,1.138-58.038,8.073-82.348,17.937C124.043,287.41,117.385,261.691,116.167,233.478z%20M233.478,233.478h99.745c-1.219,28.201-7.892,53.932-17.417,76.844c-24.308-9.863-51.908-16.793-82.334-17.937v-58.907H233.478z%20M350.805,233.478h80.813c-1.876,44.783-18.069,85.907-44.075,118.969c-15.106-11.916-33.701-24.381-55.384-34.891C342.429,292.682,349.599,264.573,350.805,233.478z%20M350.829,215.912c-1.069-31.137-8.103-59.313-18.292-84.252c21.534-10.472,39.986-22.864,55.007-34.714c26.012,33.059,42.199,74.18,44.075,118.961h-80.79V215.912z%20M376.096,83.606c-13.929,10.938-30.969,22.343-50.73,32.007C303.5,70.76,272.383,37.997,251.604,19.37C300.481,25.746,344.042,49.255,376.096,83.606z%20M308.956,122.909c-22.38,9.04-47.688,15.404-75.478,16.539V27.069C252.175,43.125,285.895,76.27,308.956,122.909z%20M215.912,27.052v112.39c-27.807-1.135-53.124-7.51-75.515-16.565C163.46,76.201,197.206,43.077,215.912,27.052z%20M197.995,19.347c-12.628,11.539-27.286,26.78-38.942,41.501c-11.588,14.638-24.09,33.133-34.729,54.904c-19.89-9.697-37.027-21.153-51.033-32.146C105.394,49.201,149.028,25.68,197.995,19.347z%20M73.285,365.781c14.023-11.007,31.189-22.482,51.116-32.181c22.26,45.265,53.961,78.131,75.023,96.635C149.872,424.163,105.706,400.512,73.285,365.781z%20M140.877,326.304c22.271-8.943,47.434-15.232,75.035-16.354v111.284C197.329,405.292,163.918,372.477,140.877,326.304z%20M233.478,421.235V309.951c27.595,1.127,52.748,7.41,75.021,16.354C285.449,372.449,252.055,405.281,233.478,421.235z%20M250.186,430.201c20.619-18.264,52.389-51.188,74.746-96.623c19.944,9.709,37.133,21.191,51.164,32.203C343.727,400.478,299.641,424.105,250.186,430.201z'/%3e%3c!--%20クリップマスク群%20--%3e%3cclipPath%20id='clip-top'%3e%3crect%20x='0'%20y='-67'%20width='600'%20height='300'%20/%3e%3c/clipPath%3e%3cclipPath%20id='clip-bottom'%3e%3crect%20x='0'%20y='218'%20width='600'%20height='300'%20/%3e%3c/clipPath%3e%3cclipPath%20id='clip-middle'%3e%3crect%20x='-50'%20y='120'%20width='600'%20height='200'%20/%3e%3c/clipPath%3e%3cfilter%20id='shadow'%20x='-20%25'%20y='-20%25'%20width='140%25'%20height='140%25'%3e%3cfeDropShadow%20dx='0'%20dy='10'%20stdDeviation='12'%20flood-color='%23000000'%20flood-opacity='0.5'/%3e%3c/filter%3e%3c/defs%3e%3crect%20width='600'%20height='600'%20rx='120'%20class='bg-card'/%3e%3cg%20transform='translate(75,%2075)'%20filter='url(%23shadow)'%3e%3c!--%20中央のCline%20--%3e%3cg%20clip-path='url(%23clip-middle)'%3e%3cg%20transform='translate(98,%20105)%20scale(0.54)'%3e%3cpath%20class='cline-color'%20d='M463.6,275.08l-29.26-58.75v-33.83c0-56.08-45.01-101.5-100.53-101.5h-50.01c3.62-7.43,5.61-15.79,5.61-24.61,0-31.17-25.08-56.39-56.07-56.39s-56.07,25.22-56.07,56.39c0,8.82,1.99,17.17,5.61,24.61h-50.01c-55.51,0-100.52,45.42-100.52,101.5v33.83l-29.87,58.59c-3.01,5.9-3.01,12.92,0,18.81l29.87,57.93v33.83c0,56.08,45.01,101.5,100.52,101.5h200.95c55.51,0,100.53-45.42,100.53-101.5v-33.83l29.21-58.13c2.9-5.79,2.9-12.61.05-18.46ZM202.75,322.96c0,25.48-20.54,46.14-45.88,46.14s-45.88-20.66-45.88-46.14v-82.02c0-25.48,20.54-46.14,45.88-46.14s45.88,20.66,45.88,46.14v82.02ZM350.58,322.96c0,25.48-20.54,46.14-45.88,46.14s-45.88-20.66-45.88-46.14v-82.02c0-25.48,20.54-46.14,45.88-46.14s45.88,20.66,45.88,46.14v82.02Z'/%3e%3c/g%3e%3c/g%3e%3c!--%20地球儀（上半部）%20--%3e%3cg%20transform='translate(0,%20-45)%20scale(1,%200.72)'%20clip-path='url(%23clip-top)'%3e%3cuse%20href='%23globe-path'%20/%3e%3c/g%3e%3c!--%20地球儀（下半部）%20--%3e%3cg%20transform='translate(0,%20160)%20scale(1,%200.72)'%20clip-path='url(%23clip-bottom)'%3e%3cuse%20href='%23globe-path'%20/%3e%3c/g%3e%3c/g%3e%3c/svg%3e", Rt = /* @__PURE__ */ e(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), B = (/* @__PURE__ */ e(((e, t) => {
	t.exports = Rt();
})))(), zt = {
	settings: "m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z",
	smartToy: "M160-360q-50 0-85-35t-35-85q0-50 35-85t85-35v-80q0-33 23.5-56.5T240-760h120q0-50 35-85t85-35q50 0 85 35t35 85h120q33 0 56.5 23.5T800-680v80q50 0 85 35t35 85q0 50-35 85t-85 35v160q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200v-160Zm200-80q25 0 42.5-17.5T420-500q0-25-17.5-42.5T360-560q-25 0-42.5 17.5T300-500q0 25 17.5 42.5T360-440Zm240 0q25 0 42.5-17.5T660-500q0-25-17.5-42.5T600-560q-25 0-42.5 17.5T540-500q0 25 17.5 42.5T600-440ZM320-280h320v-80H320v80Zm-80 80h480v-480H240v480Zm240-240Z",
	logout: "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"
};
function Bt({ name: e }) {
	return /* @__PURE__ */ (0, B.jsx)("svg", {
		className: "header-btn-icon",
		viewBox: "0 -960 960 960",
		width: "18",
		height: "18",
		"aria-hidden": "true",
		focusable: "false",
		children: /* @__PURE__ */ (0, B.jsx)("path", {
			fill: "currentColor",
			d: zt[e]
		})
	});
}
function Vt(e) {
	let { t, connectionText: n, connectionColor: r, workspaceDisplay: i, profilesData: a, onModelProfileChange: o, onWorkspaceProfileChange: s, modelProfileBusy: c, workspaceProfileBusy: l, sidebarCollapsed: u, onToggleSidebar: d, onOpenGeneralSettings: f, onOpenAiSettings: p, onLogout: m } = e, h = a.models.find((e) => e.id === a.activeModelProfileId), g = a.workspaces.find((e) => e.id === a.activeWorkspaceProfileId);
	return /* @__PURE__ */ (0, B.jsxs)("header", { children: [
		/* @__PURE__ */ (0, B.jsx)("button", {
			id: "sidebar-toggle",
			className: "sidebar-toggle",
			type: "button",
			"aria-expanded": !u,
			title: t(u ? "openSessions" : "closeSessions"),
			onClick: d,
			children: "☰"
		}),
		/* @__PURE__ */ (0, B.jsx)("img", {
			src: Lt,
			alt: "",
			className: "app-logo",
			width: 34,
			height: 34
		}),
		/* @__PURE__ */ (0, B.jsx)("strong", { children: "ClineHub-for-web" }),
		/* @__PURE__ */ (0, B.jsx)("span", {
			id: "connection",
			style: { color: r },
			children: n
		}),
		/* @__PURE__ */ (0, B.jsx)("span", {
			id: "workspace-display",
			title: i,
			children: i
		}),
		/* @__PURE__ */ (0, B.jsxs)("div", {
			className: "header-profile-switchers",
			children: [/* @__PURE__ */ (0, B.jsxs)("label", {
				className: "quick-switch model-switch",
				children: [/* @__PURE__ */ (0, B.jsx)("span", { children: t("modelProfileShort") }), /* @__PURE__ */ (0, B.jsx)("select", {
					"aria-label": "Model profile",
					value: a.activeModelProfileId ?? "",
					title: h?.name ?? "",
					disabled: a.models.length === 0 || c,
					onChange: (e) => o(e.target.value),
					children: a.models.map((e) => /* @__PURE__ */ (0, B.jsx)("option", {
						value: e.id,
						children: e.name
					}, e.id))
				})]
			}), /* @__PURE__ */ (0, B.jsxs)("label", {
				className: "quick-switch workspace-switch",
				children: [/* @__PURE__ */ (0, B.jsx)("span", { children: t("workspaceProfileShort") }), /* @__PURE__ */ (0, B.jsx)("select", {
					"aria-label": "Workspace profile",
					value: a.activeWorkspaceProfileId ?? "",
					title: g?.name ?? "",
					disabled: a.workspaces.length === 0 || l,
					onChange: (e) => s(e.target.value),
					children: a.workspaces.map((e) => /* @__PURE__ */ (0, B.jsx)("option", {
						value: e.id,
						children: e.name
					}, e.id))
				})]
			})]
		}),
		/* @__PURE__ */ (0, B.jsxs)("div", {
			className: "header-actions",
			children: [
				/* @__PURE__ */ (0, B.jsxs)("button", {
					id: "general-settings-button",
					type: "button",
					onClick: f,
					children: [/* @__PURE__ */ (0, B.jsx)(Bt, { name: "settings" }), /* @__PURE__ */ (0, B.jsx)("span", {
						className: "btn-label",
						children: t("generalSettings")
					})]
				}),
				/* @__PURE__ */ (0, B.jsxs)("button", {
					id: "ai-settings-button",
					type: "button",
					onClick: p,
					children: [/* @__PURE__ */ (0, B.jsx)(Bt, { name: "smartToy" }), /* @__PURE__ */ (0, B.jsx)("span", {
						className: "btn-label",
						children: t("aiSettings")
					})]
				}),
				m && /* @__PURE__ */ (0, B.jsxs)("button", {
					type: "button",
					className: "secondary",
					onClick: m,
					children: [/* @__PURE__ */ (0, B.jsx)(Bt, { name: "logout" }), /* @__PURE__ */ (0, B.jsx)("span", {
						className: "btn-label",
						children: t("logout")
					})]
				})
			]
		})
	] });
}
//#endregion
//#region client/lib/format.ts
function Ht(e) {
	return {
		codex: "Codex",
		"openai-codex": "Codex",
		"claude-code": "Claude Code",
		lmstudio: "LM Studio",
		llamacpp: "llama.cpp",
		ollama: "Ollama",
		"openai-compatible": "OpenAI Compatible"
	}[e ?? ""] ?? e ?? "—";
}
function Ut(e) {
	return String(e ?? "").split(/[\\/]/).filter(Boolean).at(-1) ?? "—";
}
function Wt(e, t) {
	return e == null ? "—" : new Intl.NumberFormat(b(t)).format(e);
}
//#endregion
//#region client/components/Sidebar.tsx
function Gt({ t: e, sessions: t, activeSession: n, onSelect: r, onOpenDetails: i, onNewSession: a, onClearSessions: o }) {
	return /* @__PURE__ */ (0, B.jsxs)("aside", { children: [/* @__PURE__ */ (0, B.jsxs)("div", {
		className: "section-title",
		children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("sessions") }), /* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("button", {
			id: "clear-sessions",
			type: "button",
			onClick: o,
			children: e("clear")
		}), /* @__PURE__ */ (0, B.jsx)("button", {
			id: "new-session",
			type: "button",
			title: "New session",
			onClick: a,
			children: "＋"
		})] })]
	}), /* @__PURE__ */ (0, B.jsx)("div", {
		id: "sessions",
		children: t.map((t) => {
			let a = t.metadata?.appProvider ?? t.provider, o = t.metadata?.appModelId ?? t.model, s = (t.metadata?.environmentSnapshot)?.workspace?.name ?? t.metadata?.workspace, c = t.metadata?.title ?? t.prompt ?? t.sessionId;
			return /* @__PURE__ */ (0, B.jsxs)("div", {
				className: `session-row ${t.sessionId === n ? "active" : ""}`,
				children: [/* @__PURE__ */ (0, B.jsxs)("button", {
					type: "button",
					className: "session",
					title: `${Ht(a)} · ${o ?? "—"}${s ? ` · ${s}` : ""}`,
					onClick: () => r(t.sessionId),
					children: [/* @__PURE__ */ (0, B.jsx)("span", {
						className: "session-title",
						children: c
					}), /* @__PURE__ */ (0, B.jsxs)("span", {
						className: "session-agent",
						children: [
							Ht(a),
							" · ",
							Ut(o),
							s ? ` · ${s}` : ""
						]
					})]
				}), /* @__PURE__ */ (0, B.jsx)("button", {
					type: "button",
					className: "session-more",
					title: e("sessionDetails"),
					onClick: () => i(t.sessionId),
					children: "⋯"
				})]
			}, t.sessionId);
		})
	})] });
}
//#endregion
//#region client/hooks/useDismissiblePopover.ts
function Kt(e, t) {
	let n = (0, u.useRef)(null), r = (0, u.useRef)(null);
	return (0, u.useEffect)(() => {
		if (!e) return;
		let i = (e) => {
			let i = e.target instanceof Element ? e.target : null;
			n.current?.contains(i) || r.current?.contains(i) || t();
		}, a = (e) => {
			e.key === "Escape" && (t(), r.current?.focus());
		};
		return document.addEventListener("click", i), document.addEventListener("keydown", a), () => {
			document.removeEventListener("click", i), document.removeEventListener("keydown", a);
		};
	}, [e, t]), {
		panelRef: n,
		toggleRef: r
	};
}
//#endregion
//#region client/components/SessionEnvironment.tsx
function qt({ t: e, session: t }) {
	let [n, r] = (0, u.useState)(!1), { panelRef: i, toggleRef: a } = Kt(n, () => r(!1)), o = t?.metadata?.environmentSnapshot, s = o?.model?.profileName ?? t?.metadata?.appModelId ?? t?.model ?? "—", c = o?.workspace?.name ?? t?.metadata?.workspace ?? t?.cwd ?? "—", l = o?.workspace?.display ?? o?.workspace?.path ?? t?.metadata?.workspace ?? t?.cwd, d = !!t;
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "session-environment-wrap",
		children: [/* @__PURE__ */ (0, B.jsxs)("button", {
			ref: a,
			id: "session-environment-toggle",
			className: "session-environment-toggle",
			type: "button",
			"aria-expanded": n && d,
			"aria-controls": "session-environment",
			disabled: !d,
			onClick: (e) => {
				e.stopPropagation(), r((e) => !e);
			},
			children: [/* @__PURE__ */ (0, B.jsx)("span", {
				"aria-hidden": "true",
				children: "◆"
			}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("sessionInfo") })]
		}), n && d && /* @__PURE__ */ (0, B.jsxs)("section", {
			ref: i,
			id: "session-environment",
			className: "session-environment",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "session-environment-summary",
				children: [
					/* @__PURE__ */ (0, B.jsx)("span", {
						className: "session-environment-icon",
						children: "◆"
					}),
					/* @__PURE__ */ (0, B.jsx)("strong", { children: e("sessionUsedEnvironment", {
						model: s,
						workspace: c
					}) }),
					l && l !== c && /* @__PURE__ */ (0, B.jsx)("code", { children: l })
				]
			}), /* @__PURE__ */ (0, B.jsxs)("details", {
				className: "session-agent-snapshot",
				children: [/* @__PURE__ */ (0, B.jsx)("summary", { children: e(o ? "recordedAgentSettings" : "settingsNotRecorded") }), o?.agent && /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
					/* @__PURE__ */ (0, B.jsx)("div", {
						className: "session-settings-grid",
						children: [
							[e("template"), o.agent.templateName ?? o.agent.templateId],
							[e("modelProfile"), o.model?.profileName],
							[e("workspaceProfile"), o.workspace?.name],
							[e("permissionPreset"), o.agent.permissionPreset ? e(o.agent.permissionPreset) : void 0],
							[e("maxIterations"), o.agent.maxIterations],
							[e("autoCompaction"), o.agent.compactionEnabled ? `${e("allow")} · ${o.agent.compactionStrategy}` : e("disabled")],
							[e("requestTimeout"), o.agent.requestTimeoutMs ? `${o.agent.requestTimeoutMs / 1e3}s` : "Default"],
							[e("enableImages"), o.agent.imagesEnabled ? e("allow") : e("disabled")]
						].map(([e, t]) => /* @__PURE__ */ (0, B.jsxs)(u.Fragment, { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e }), /* @__PURE__ */ (0, B.jsx)("strong", { children: t == null || t === "" ? "—" : String(t) })] }, e))
					}),
					/* @__PURE__ */ (0, B.jsx)("strong", {
						className: "session-permissions-title",
						children: e("effectivePermissions")
					}),
					/* @__PURE__ */ (0, B.jsx)("div", {
						className: "session-permission-badges",
						children: Object.entries(o.agent.effectivePermissions ?? o.agent.permissions ?? {}).map(([t, n]) => /* @__PURE__ */ (0, B.jsxs)("span", {
							className: `session-permission state-${n}`,
							children: [
								e(t),
								" · ",
								e(n)
							]
						}, t))
					}),
					/* @__PURE__ */ (0, B.jsxs)("details", {
						className: "session-system-prompt",
						children: [/* @__PURE__ */ (0, B.jsx)("summary", { children: e("systemPrompt") }), /* @__PURE__ */ (0, B.jsx)("pre", { children: o.agent.systemPrompt ?? "—" })]
					})
				] })]
			})]
		})]
	});
}
//#endregion
//#region client/components/ContextPanel.tsx
function Jt({ t: e, locale: t, context: n, compactions: r, showToolDetails: i, onToggleShowToolDetails: a, session: o }) {
	let [s, c] = (0, u.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 760px)").matches), l = n?.utilizationPercent ?? 0, d = n?.compactionTriggerPercent ?? 90, f = n ? n.inputTokens === null ? `— / ${Wt(n.maxInputTokens, t)}` : `${Wt(n.inputTokens, t)} / ${Wt(n.maxInputTokens, t)} (${n.utilizationPercent}%)` : "—", p = n?.source === "override" ? e("sourceOverride") : n?.source === "provider" ? e("sourceProvider") : e("sourceDefault"), m = n ? n.inputTokens === null ? `${e("contextUnknown", { max: Wt(n.maxInputTokens, t) })} · ${p}` : `${e("contextDetail", {
		window: Wt(n.contextWindow, t),
		max: Wt(n.maxInputTokens, t),
		trigger: n.compactionTriggerPercent,
		tokens: Wt(n.compactionTriggerTokens, t),
		strategy: n.compactionStrategy
	})} · ${p}` : e("contextWaiting"), h = r.at(-1);
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		id: "context-panel",
		className: `context-panel${s ? " is-collapsed" : ""}`,
		children: [
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "context-title-row",
				children: [/* @__PURE__ */ (0, B.jsxs)("button", {
					className: "context-toggle",
					type: "button",
					"aria-expanded": !s,
					onClick: () => c((e) => !e),
					children: [/* @__PURE__ */ (0, B.jsx)("span", {
						"aria-hidden": "true",
						children: s ? "▶" : "▼"
					}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("context") })]
				}), /* @__PURE__ */ (0, B.jsxs)("div", {
					className: "context-title-actions",
					children: [/* @__PURE__ */ (0, B.jsx)(qt, {
						t: e,
						session: o
					}, o?.sessionId ?? "none"), /* @__PURE__ */ (0, B.jsx)("strong", {
						id: "context-summary",
						children: f
					})]
				})]
			}),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "context-meter",
				children: [/* @__PURE__ */ (0, B.jsx)("span", {
					id: "context-fill",
					className: n ? l >= d ? "critical" : l >= 75 ? "warning" : "" : "",
					style: { width: `${n ? Math.min(100, Math.max(0, l)) : 0}%` }
				}), /* @__PURE__ */ (0, B.jsx)("span", {
					id: "context-trigger",
					style: { left: `${n ? d : 90}%` }
				})]
			}),
			!s && /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "context-footer",
				children: [/* @__PURE__ */ (0, B.jsx)("small", {
					id: "context-detail",
					children: m
				}), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("input", {
					id: "show-tool-details",
					type: "checkbox",
					checked: i,
					onChange: (e) => a(e.target.checked)
				}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("showToolDetails") })] })]
			}), /* @__PURE__ */ (0, B.jsxs)("div", {
				id: "compaction-summary",
				className: "compaction-summary",
				"data-state": h ? "recorded" : "none",
				title: h?.message ?? "",
				children: [/* @__PURE__ */ (0, B.jsx)("span", {
					className: "compaction-icon",
					children: "↻"
				}), /* @__PURE__ */ (0, B.jsx)("span", { children: h ? e("lastCompaction", {
					time: Ft(h.at, t),
					count: r.length
				}) : e("noCompactions") })]
			})] })
		]
	});
}
//#endregion
//#region client/components/ApprovalList.tsx
function Yt({ t: e, approvals: t, onResolve: n }) {
	return /* @__PURE__ */ (0, B.jsx)("div", {
		id: "approval",
		children: t.map((t) => {
			let r = Dt(t.toolName);
			return /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "approval",
				children: [
					/* @__PURE__ */ (0, B.jsx)("strong", { children: r ? `⛁ ${e("mcpApprovalRequested", r)}` : e("toolApprovalRequested", { tool: t.toolName }) }),
					/* @__PURE__ */ (0, B.jsx)("pre", { children: JSON.stringify(t.input, null, 2) }),
					/* @__PURE__ */ (0, B.jsx)("button", {
						type: "button",
						onClick: () => n(t.id, !0),
						children: e("approve")
					}),
					/* @__PURE__ */ (0, B.jsx)("button", {
						type: "button",
						onClick: () => n(t.id, !1),
						children: e("reject")
					})
				]
			}, t.id);
		})
	});
}
//#endregion
//#region client/components/QueueStatus.tsx
function Xt({ t: e, entries: t, onUpdate: n, onCancel: r }) {
	return t.length === 0 ? /* @__PURE__ */ (0, B.jsx)("section", {
		id: "queue-status",
		className: "queue-status",
		"aria-live": "polite",
		hidden: !0
	}) : /* @__PURE__ */ (0, B.jsxs)("section", {
		id: "queue-status",
		className: "queue-status",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, B.jsx)("strong", {
			className: "queue-heading",
			children: e("queueCount", { count: t.length })
		}), /* @__PURE__ */ (0, B.jsx)("div", {
			className: "queue-list",
			children: t.map((i, a) => /* @__PURE__ */ (0, B.jsx)(Zt, {
				t: e,
				entry: i,
				index: a,
				total: t.length,
				onUpdate: n,
				onCancel: r
			}, i.id))
		})]
	});
}
function Zt({ t: e, entry: t, index: n, total: r, onUpdate: i, onCancel: a }) {
	let [o, s] = (0, u.useState)(t.prompt), [c, l] = (0, u.useState)(!1), [d, f] = (0, u.useState)(""), [p, m] = (0, u.useState)(!1), h = t.imageCount ?? t.images?.length ?? 0;
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: `queue-item${p ? " invalid" : ""}`,
		children: [
			/* @__PURE__ */ (0, B.jsx)("span", {
				className: "queue-order",
				children: n + 1
			}),
			/* @__PURE__ */ (0, B.jsx)("textarea", {
				className: "queue-message-input",
				rows: 2,
				value: o,
				"aria-label": `${e("queueCount", { count: r })} ${n + 1}`,
				onChange: (e) => s(e.target.value)
			}),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "queue-item-actions",
				children: [
					h > 0 && /* @__PURE__ */ (0, B.jsx)("small", {
						className: "queue-image-count",
						children: e("queuedImages", { count: h })
					}),
					/* @__PURE__ */ (0, B.jsx)("button", {
						type: "button",
						className: "secondary queue-force-send",
						disabled: c,
						onClick: async () => {
							if (!o.trim()) {
								m(!0);
								return;
							}
							m(!1), l(!0);
							try {
								await i(t, o.trim()), f("");
							} catch (e) {
								f(e instanceof Error ? e.message : String(e)), l(!1);
							}
						},
						children: e("forceSend")
					}),
					/* @__PURE__ */ (0, B.jsx)("button", {
						type: "button",
						className: "danger queue-close",
						disabled: c,
						onClick: async () => {
							l(!0);
							try {
								await a(t);
							} catch (e) {
								f(e instanceof Error ? e.message : String(e)), l(!1);
							}
						},
						"aria-label": e("queueCancel"),
						title: e("queueCancel"),
						children: "×"
					})
				]
			}),
			d && /* @__PURE__ */ (0, B.jsx)("small", {
				className: "queue-item-error",
				children: d
			})
		]
	});
}
//#endregion
//#region client/components/QuickPermissions.tsx
var Qt = [
	"read_files",
	"search_codebase",
	"fetch_web_content",
	"skills",
	"run_commands",
	"editor",
	"apply_patch"
], $t = [
	"disabled",
	"ask",
	"allow"
], en = {
	read_files: "▤",
	search_codebase: "⌕",
	fetch_web_content: "◎",
	skills: "✦",
	run_commands: ">_",
	editor: "✎",
	apply_patch: "±"
};
function tn({ t: e, permissions: t, onCycle: n, mcpEnabled: r, onToggleMcp: i }) {
	let [a, o] = (0, u.useState)(!1), { panelRef: s, toggleRef: c } = Kt(a, () => o(!1)), l = $t.map((e) => [e, Object.values(t ?? {}).filter((t) => t === e).length]), d = t ? `${e("quickPermissions")} · ${e("allow")} ${l.find(([e]) => e === "allow")?.[1]} / ${e("ask")} ${l.find(([e]) => e === "ask")?.[1]} / ${e("disabled")} ${l.find(([e]) => e === "disabled")?.[1]} / MCP ${e(r ? "allow" : "disabled")}` : e("quickPermissions"), f = r ? "allow" : "disabled";
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "quick-permissions-wrap",
		children: [/* @__PURE__ */ (0, B.jsx)("button", {
			ref: c,
			id: "quick-permissions-toggle",
			className: "quick-permissions-toggle",
			type: "button",
			"aria-expanded": a,
			"aria-controls": "quick-permissions-panel",
			disabled: !t,
			title: d,
			onClick: (e) => {
				e.stopPropagation(), o((e) => !e);
			},
			children: /* @__PURE__ */ (0, B.jsxs)("span", {
				id: "quick-permissions-indicator",
				className: "quick-permissions-indicator",
				"aria-hidden": "true",
				children: [Qt.map((n) => {
					let r = t?.[n] ?? "ask";
					return /* @__PURE__ */ (0, B.jsx)("span", {
						className: `permission-tool-icon state-${r}`,
						title: `${e(n)}: ${e(r)}`,
						children: en[n]
					}, n);
				}), /* @__PURE__ */ (0, B.jsx)("span", {
					className: `permission-tool-icon state-${f}`,
					title: `MCP: ${e(f)}`,
					children: "⛁"
				})]
			})
		}), a && t && /* @__PURE__ */ (0, B.jsxs)("section", {
			ref: s,
			id: "quick-permissions-panel",
			className: "quick-permissions-panel",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "quick-permissions-heading",
				children: [/* @__PURE__ */ (0, B.jsx)("strong", { children: e("quickPermissions") }), /* @__PURE__ */ (0, B.jsx)("small", { children: e("quickPermissionsHelp") })]
			}), /* @__PURE__ */ (0, B.jsxs)("div", {
				id: "quick-permissions-list",
				className: "quick-permissions-list",
				children: [Qt.map((r) => {
					let i = t[r] ?? "ask";
					return /* @__PURE__ */ (0, B.jsxs)("button", {
						type: "button",
						className: `quick-permission-row state-${i}`,
						title: `${e(r)}: ${e(i)}`,
						onClick: () => n(r),
						children: [
							/* @__PURE__ */ (0, B.jsx)("span", {
								className: "quick-tool-icon",
								children: en[r]
							}),
							/* @__PURE__ */ (0, B.jsx)("span", {
								className: "quick-tool-name",
								children: e(r)
							}),
							/* @__PURE__ */ (0, B.jsx)("span", {
								className: "quick-tool-state",
								children: e(i)
							})
						]
					}, r);
				}), /* @__PURE__ */ (0, B.jsxs)("button", {
					type: "button",
					className: `quick-permission-row state-${f}`,
					title: `MCP: ${e(f)}`,
					onClick: () => void i(),
					children: [
						/* @__PURE__ */ (0, B.jsx)("span", {
							className: "quick-tool-icon",
							children: "⛁"
						}),
						/* @__PURE__ */ (0, B.jsx)("span", {
							className: "quick-tool-name",
							children: "MCP"
						}),
						/* @__PURE__ */ (0, B.jsx)("span", {
							className: "quick-tool-state",
							children: e(f)
						})
					]
				})]
			})]
		})]
	});
}
//#endregion
//#region client/components/TemplateSwitcher.tsx
function nn({ templates: e, activeTemplateId: t, disabled: n, onSelect: r }) {
	let [i, a] = (0, u.useState)(!1), o = () => a(!1), { panelRef: s, toggleRef: c } = Kt(i, o);
	if (e.length === 0) return null;
	let l = e.find((e) => e.id === t)?.name ?? "Mode", d = (i = !1) => e.map((e) => /* @__PURE__ */ (0, B.jsx)("button", {
		type: "button",
		className: t === e.id ? "active" : "",
		disabled: n || t === e.id,
		onClick: () => {
			r(e.id), i && o();
		},
		children: e.name
	}, e.id));
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "template-switcher-wrap",
		children: [
			/* @__PURE__ */ (0, B.jsx)("div", {
				className: "plan-act-toggle template-options",
				role: "group",
				"aria-label": "Template",
				children: d()
			}),
			/* @__PURE__ */ (0, B.jsxs)("button", {
				ref: c,
				className: "secondary mobile-mode-toggle",
				type: "button",
				"aria-expanded": i,
				"aria-controls": "mobile-mode-panel",
				disabled: n,
				onClick: (e) => {
					e.stopPropagation(), a((e) => !e);
				},
				children: ["◐ ", l]
			}),
			i && /* @__PURE__ */ (0, B.jsx)("section", {
				ref: s,
				id: "mobile-mode-panel",
				className: "mobile-mode-panel",
				onClick: (e) => e.stopPropagation(),
				children: d(!0)
			})
		]
	});
}
//#endregion
//#region client/components/Composer.tsx
function rn(e) {
	let { t, prompt: n, onPromptChange: r, onSubmit: i, onAbort: a, running: o, stalled: s, pendingImages: c, onAddImages: l, onRemoveImage: d, imagesEnabled: f, agentSettings: p, effectivePermissions: m, onCyclePermission: h, mcpEnabled: g, onToggleMcp: _, onSelectTemplate: v, templateBusy: y } = e, [b, x] = (0, u.useState)(!1), { panelRef: S, toggleRef: C } = Kt(b, () => x(!1));
	return (0, u.useEffect)(() => {
		c.length === 0 && x(!1);
	}, [c.length]), /* @__PURE__ */ (0, B.jsxs)("form", {
		id: "composer",
		onSubmit: (e) => {
			e.preventDefault(), i();
		},
		children: [
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "composer-toolbar",
				children: [/* @__PURE__ */ (0, B.jsx)(nn, {
					templates: p?.templates ?? [],
					activeTemplateId: p?.activeTemplateId,
					disabled: !p || y,
					onSelect: v
				}), /* @__PURE__ */ (0, B.jsx)(tn, {
					t,
					permissions: m,
					onCycle: h,
					mcpEnabled: g,
					onToggleMcp: _
				})]
			}),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "composer-input-wrap",
				children: [c.length > 0 && /* @__PURE__ */ (0, B.jsxs)("div", {
					className: "image-preview-wrap",
					children: [/* @__PURE__ */ (0, B.jsxs)("button", {
						ref: C,
						type: "button",
						className: "secondary image-preview-toggle",
						"aria-expanded": b,
						"aria-controls": "image-preview-panel",
						title: t("attachImages"),
						onClick: () => x((e) => !e),
						children: ["▧ ", c.length]
					}), b && /* @__PURE__ */ (0, B.jsx)("section", {
						ref: S,
						id: "image-preview-panel",
						className: "image-preview-panel",
						onClick: (e) => e.stopPropagation(),
						children: c.map((e, n) => /* @__PURE__ */ (0, B.jsxs)("div", {
							className: "image-attachment",
							children: [/* @__PURE__ */ (0, B.jsx)("img", {
								src: e.dataUrl,
								alt: e.name
							}), /* @__PURE__ */ (0, B.jsx)("button", {
								type: "button",
								className: "image-remove",
								title: t("queueCancel"),
								onClick: () => d(n),
								children: "×"
							})]
						}, `${e.name}-${n}`))
					})]
				}), /* @__PURE__ */ (0, B.jsx)("textarea", {
					id: "prompt",
					placeholder: t("messagePlaceholder"),
					rows: 3,
					value: n,
					onChange: (e) => r(e.target.value),
					onKeyDown: (e) => {
						e.key !== "Enter" || !e.ctrlKey && !e.metaKey || e.nativeEvent.isComposing || (e.preventDefault(), i());
					}
				})]
			}),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "composer-actions",
				children: [
					f && /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [/* @__PURE__ */ (0, B.jsx)("input", {
						id: "image-input",
						type: "file",
						accept: "image/png,image/jpeg,image/webp,image/gif",
						multiple: !0,
						hidden: !0,
						onChange: (e) => {
							e.target.files?.length && l(e.target.files), e.target.value = "";
						}
					}), /* @__PURE__ */ (0, B.jsx)("button", {
						id: "attach-image",
						className: "secondary attach-image",
						type: "button",
						title: t("attachImages"),
						"aria-label": t("attachImages"),
						onClick: () => document.getElementById("image-input")?.click(),
						children: "▧"
					})] }),
					/* @__PURE__ */ (0, B.jsx)("button", {
						id: "abort",
						type: "button",
						onClick: a,
						children: t("stop")
					}),
					/* @__PURE__ */ (0, B.jsx)("button", {
						type: "submit",
						className: o ? "is-running" : "",
						children: t(s ? "forceSend" : "send")
					})
				]
			})
		]
	});
}
//#endregion
//#region client/components/SetupDialog.tsx
var an = {
	lmstudio: "http://192.168.8.223:1234",
	llamacpp: "http://127.0.0.1:8080",
	ollama: "http://127.0.0.1:11434",
	codex: "https://chatgpt.com/backend-api/codex",
	"claude-code": ""
}, on = {
	lmstudio: "helpLmstudio",
	llamacpp: "helpLlamacpp",
	ollama: "helpOllama",
	codex: "helpCodex",
	"claude-code": "helpClaude"
};
function sn({ t: e, request: t, onClose: n, profilesData: r, onConnected: i }) {
	let a = (0, u.useRef)(null), [o, s] = (0, u.useState)("lmstudio"), [c, l] = (0, u.useState)(""), [d, f] = (0, u.useState)(""), [m, h] = (0, u.useState)([]), [g, _] = (0, u.useState)({}), [v, y] = (0, u.useState)(""), [b, x] = (0, u.useState)(!1), [S, C] = (0, u.useState)(""), [w, ee] = (0, u.useState)(""), [T, te] = (0, u.useState)(!1), [E, ne] = (0, u.useState)(""), [re, D] = (0, u.useState)(!1), [O, ie] = (0, u.useState)(null), [ae, k] = (0, u.useState)(!1), [A, j] = (0, u.useState)(!1);
	(0, u.useEffect)(() => {
		if (!t) return;
		let e = t.info, n = !!(e && "configured" in e && e.configured);
		te(n);
		let i = r.models.find((e) => e.id === r.activeModelProfileId);
		ee(t.newProfile ? "" : i?.id ?? ""), C(t.newProfile ? "" : i?.name ?? (n && e && "provider" in e ? `${e.provider} · ${e.modelId}` : ""));
		let o = n && e && "provider" in e ? e.provider : "lmstudio";
		s(o), l(n && e && "baseUrl" in e ? e.baseUrl : an[o]), y(n && e && "timeoutMs" in e && e.timeoutMs ? String(e.timeoutMs / 1e3) : ""), x(n && e && "imagesEnabled" in e ? e.imagesEnabled === !0 : !1), n && e && "modelId" in e ? (h([e.modelId]), _({ [e.modelId]: {
			id: e.modelId,
			imageSupport: e.imageSupport ?? "unknown"
		} }), f(e.modelId)) : (h([]), _({}), f("")), ie(null), ne(n && o === "codex" ? "Signed in with ChatGPT. Fetch models to refresh the list." : ""), D(!1), a.current?.open || a.current?.showModal();
	}, [t?.token]);
	let oe = e(on[o]), M = o === "codex", N = o === "claude-code", se = M || N, ce = (e) => {
		s(e), l(an[e]), h([]), _({}), f(""), x(!1), ie(null), ne(""), D(!1);
	}, P = (e, t, n) => {
		let r = t[e]?.imageSupport ?? "unknown";
		return r === "unsupported" ? x(!1) : r === "supported" && n && x(!0), r;
	}, F = g[d]?.imageSupport ?? "unknown", le = () => ({
		provider: o,
		baseUrl: c.trim(),
		modelId: d.trim() || void 0,
		timeoutMs: v.trim() ? Number(v.trim()) * 1e3 : void 0,
		imagesEnabled: b,
		profileName: S.trim(),
		profileId: w || void 0
	}), I = async () => {
		let t = M ? window.open("about:blank", "cline-codex-auth") : null;
		k(!0), ne(M ? "Starting ChatGPT sign-in..." : "Connecting to the model server..."), D(!1);
		try {
			if (M) {
				let e = await p("/api/codex/login", {
					method: "POST",
					body: "{}"
				});
				for (e.url ? (ie(e.url), t && (t.location.href = e.url)) : t?.close(); e.status === "starting" || e.status === "waiting";) ne(e.message ?? "Waiting for ChatGPT sign-in..."), await new Promise((e) => setTimeout(e, 1e3)), e = await p("/api/codex/status");
				if (e.status !== "authenticated") throw Error(e.message ?? "ChatGPT sign-in failed");
				ie(null), ne(e.email ? `Signed in as ${e.email}. Loading models...` : "Signed in. Loading models...");
			}
			let n = null;
			N && (n = await p("/api/claude-code/status"));
			let r = await p("/api/models/discover", {
				method: "POST",
				body: JSON.stringify(le())
			}), i = r.models.includes(d) ? d : r.models[0] ?? "";
			h(r.models), _(r.modelInfo ?? {}), f(i), P(i, r.modelInfo ?? {}, !0), l(r.baseUrl), N ? (ne(n?.status === "authenticated" ? e("claudeSignedIn") : e("claudeLoginRequired")), D(n?.status !== "authenticated")) : ne(`${r.models.length} model(s) found.`);
		} catch (e) {
			ne(e instanceof Error ? e.message : String(e)), D(!0);
		} finally {
			k(!1);
		}
	}, ue = async () => {
		j(!0), ne("Validating connection and model..."), D(!1);
		try {
			let e = await p("/api/config", {
				method: "POST",
				body: JSON.stringify(le())
			});
			a.current?.close(), i(e);
		} catch (e) {
			ne(e instanceof Error ? e.message : String(e)), D(!0);
		} finally {
			j(!1);
		}
	};
	return /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: a,
		id: "setup",
		onClose: n,
		children: /* @__PURE__ */ (0, B.jsxs)("form", {
			id: "setup-form",
			onSubmit: (e) => {
				e.preventDefault(), ue();
			},
			children: [
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "setup-heading",
					children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h1", { children: e("connectAi") }), /* @__PURE__ */ (0, B.jsx)("p", { children: e("connectAiDescription") })] }), /* @__PURE__ */ (0, B.jsx)("button", {
						className: "secondary icon-button",
						type: "button",
						"aria-label": "Close",
						onClick: () => a.current?.close(),
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("provider") }), /* @__PURE__ */ (0, B.jsxs)("select", {
					value: o,
					onChange: (e) => ce(e.target.value),
					children: [
						/* @__PURE__ */ (0, B.jsx)("option", {
							value: "lmstudio",
							children: "LM Studio"
						}),
						/* @__PURE__ */ (0, B.jsx)("option", {
							value: "llamacpp",
							children: "llama.cpp"
						}),
						/* @__PURE__ */ (0, B.jsx)("option", {
							value: "ollama",
							children: "Ollama"
						}),
						/* @__PURE__ */ (0, B.jsx)("option", {
							value: "codex",
							children: "ChatGPT Pro / Codex"
						}),
						/* @__PURE__ */ (0, B.jsx)("option", {
							value: "claude-code",
							children: "Claude Code Pro / Max"
						})
					]
				})] }),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("modelProfileName") }), /* @__PURE__ */ (0, B.jsx)("input", {
					type: "text",
					maxLength: 100,
					required: !0,
					placeholder: "My model",
					value: S,
					onChange: (e) => C(e.target.value)
				})] }),
				/* @__PURE__ */ (0, B.jsxs)("label", {
					id: "base-url-row",
					children: [
						/* @__PURE__ */ (0, B.jsx)("span", { children: e("serverUrl") }),
						/* @__PURE__ */ (0, B.jsx)("input", {
							type: "url",
							required: !se,
							disabled: se,
							spellCheck: !1,
							value: c,
							placeholder: se ? e(N ? "urlManagedClaude" : "urlManagedCodex") : an[o],
							onChange: (e) => l(e.target.value)
						}),
						/* @__PURE__ */ (0, B.jsx)("small", { children: e(N ? "urlManagedClaude" : M ? "urlManagedCodex" : "urlRequired") })
					]
				}),
				/* @__PURE__ */ (0, B.jsxs)("section", {
					className: "provider-help",
					"aria-live": "polite",
					children: [/* @__PURE__ */ (0, B.jsx)("strong", { children: e("connectionGuide") }), /* @__PURE__ */ (0, B.jsx)("p", {
						style: { whiteSpace: "pre-line" },
						children: oe
					})]
				}),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "model-row",
					children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("model") }), /* @__PURE__ */ (0, B.jsx)("select", {
						required: !0,
						value: d,
						onChange: (e) => {
							f(e.target.value), P(e.target.value, g, !0);
						},
						children: m.length === 0 ? /* @__PURE__ */ (0, B.jsx)("option", {
							value: "",
							children: e("fetchModelsFirst")
						}) : m.map((e) => /* @__PURE__ */ (0, B.jsx)("option", {
							value: e,
							children: g[e]?.name && g[e].name !== e ? `${g[e].name} (${e})` : e
						}, e))
					})] }), /* @__PURE__ */ (0, B.jsx)("button", {
						className: "secondary",
						type: "button",
						disabled: ae,
						onClick: () => void I(),
						children: ae ? "…" : e(M ? "signInChatgpt" : "fetchModels")
					})]
				}),
				/* @__PURE__ */ (0, B.jsxs)("details", {
					className: "connection-advanced",
					children: [/* @__PURE__ */ (0, B.jsx)("summary", { children: e("advancedSettings") }), /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "advanced-settings-body",
						children: [
							/* @__PURE__ */ (0, B.jsxs)("label", { children: [
								/* @__PURE__ */ (0, B.jsx)("span", { children: e("requestTimeout") }),
								/* @__PURE__ */ (0, B.jsx)("input", {
									type: "number",
									min: "1",
									max: "3600",
									step: "1",
									inputMode: "numeric",
									placeholder: "Default",
									value: v,
									onChange: (e) => y(e.target.value)
								}),
								/* @__PURE__ */ (0, B.jsx)("small", { children: e("requestTimeoutHelp") })
							] }),
							/* @__PURE__ */ (0, B.jsxs)("label", {
								className: "check-row",
								children: [/* @__PURE__ */ (0, B.jsx)("input", {
									type: "checkbox",
									checked: b,
									disabled: F === "unsupported",
									onChange: (e) => x(e.target.checked)
								}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("enableImages") })]
							}),
							/* @__PURE__ */ (0, B.jsx)("small", {
								id: "image-capability-status",
								"data-state": F,
								children: e(F === "supported" ? "imageCapabilitySupported" : F === "unsupported" ? "imageCapabilityUnsupported" : "imageCapabilityUnknown")
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, B.jsx)("p", {
					id: "setup-status",
					role: "status",
					className: re ? "error" : "",
					children: E
				}),
				O && /* @__PURE__ */ (0, B.jsx)("a", {
					id: "auth-link",
					href: O,
					target: "_blank",
					rel: "noopener",
					children: "Open ChatGPT sign-in"
				}),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "setup-actions",
					children: [T && /* @__PURE__ */ (0, B.jsx)("button", {
						className: "secondary",
						type: "button",
						onClick: () => a.current?.close(),
						children: e("cancel")
					}), /* @__PURE__ */ (0, B.jsx)("button", {
						type: "submit",
						disabled: A,
						children: A ? "Connecting..." : e("connect")
					})]
				})
			]
		})
	});
}
//#endregion
//#region client/components/ProfilesDialog.tsx
var cn = {
	editorId: "",
	name: "",
	type: "local",
	localPath: "",
	sshHost: "",
	sshPort: "22",
	sshUsername: "",
	sshRemoteDirectory: "",
	sshOperatingSystem: "linux",
	sshAuthType: "password",
	sshKeyPath: "",
	sshHostFingerprint: "",
	sudoPermission: "ask",
	sshPassword: "",
	sshPassphrase: "",
	sudoPassword: ""
};
function ln(e) {
	return e ? e.type === "local" ? {
		...cn,
		editorId: e.id,
		name: e.name,
		type: "local",
		localPath: e.path
	} : {
		...cn,
		editorId: e.id,
		name: e.name,
		type: "ssh",
		sshHost: e.host,
		sshPort: String(e.port),
		sshUsername: e.username,
		sshRemoteDirectory: e.remoteDirectory,
		sshOperatingSystem: e.operatingSystem ?? "linux",
		sshAuthType: e.authType,
		sshKeyPath: e.keyPath ?? "",
		sshHostFingerprint: e.hostFingerprint ?? "",
		sudoPermission: e.sudoPermission ?? "ask"
	} : cn;
}
function un({ t: e, open: t, onClose: n, profilesData: r, onProfilesChanged: i, onAddModelProfile: a }) {
	let o = (0, u.useRef)(null), [s, c] = (0, u.useState)("model"), [l, d] = (0, u.useState)(cn), [f, m] = (0, u.useState)(""), [h, g] = (0, u.useState)(!1), [_, v] = (0, u.useState)(!1), [y, b] = (0, u.useState)(!1), [x, S] = (0, u.useState)(null), [C, w] = (0, u.useState)(""), [ee, T] = (0, u.useState)(""), [te, E] = (0, u.useState)(!1), [ne, re] = (0, u.useState)(""), [D, O] = (0, u.useState)(""), [ie, ae] = (0, u.useState)(!1);
	(0, u.useEffect)(() => {
		if (!t) {
			o.current?.close();
			return;
		}
		c("model"), d(ln(r.workspaces.find((e) => e.id === r.activeWorkspaceProfileId))), m(""), g(!1), o.current?.open || o.current?.showModal();
	}, [t]);
	let k = (e, t) => d((n) => ({
		...n,
		[e]: t
	})), A = (e) => d(ln(r.workspaces.find((t) => t.id === e))), j = async (e, t) => {
		confirm(`Delete model profile "${t}"?`) && (await p(`/api/profiles/models/${encodeURIComponent(e)}`, { method: "DELETE" }), i(await p("/api/profiles")));
	}, oe = (e) => {
		S(e.id), w(e.name), T(e.timeoutMs ? String(e.timeoutMs / 1e3) : ""), E(e.imagesEnabled), re(e.baseUrl), O(e.modelId), m(""), g(!1);
	}, M = r.models.find((e) => e.id === x), N = !M || M.provider !== "codex" && M.provider !== "claude-code", se = async () => {
		if (!(!x || !M)) {
			ae(!0), m(""), g(!1);
			try {
				let e = {
					name: C,
					timeoutMs: ee.trim() ? Number(ee) * 1e3 : null,
					imagesEnabled: te
				};
				N && ne !== M.baseUrl && (e.baseUrl = ne), D !== M.modelId && (e.modelId = D), i((await p(`/api/profiles/models/${encodeURIComponent(x)}`, {
					method: "PATCH",
					body: JSON.stringify(e)
				})).profiles), S(null);
			} catch (e) {
				m(e instanceof Error ? e.message : String(e)), g(!0);
			} finally {
				ae(!1);
			}
		}
	}, ce = () => {
		let e = l.editorId || void 0;
		return l.type === "local" ? {
			id: e,
			name: l.name,
			type: "local",
			path: l.localPath
		} : {
			id: e,
			name: l.name,
			type: "ssh",
			host: l.sshHost,
			port: Number(l.sshPort),
			username: l.sshUsername,
			remoteDirectory: l.sshRemoteDirectory,
			authType: l.sshAuthType,
			password: l.sshPassword || void 0,
			keyPath: l.sshKeyPath || void 0,
			passphrase: l.sshPassphrase || void 0,
			hostFingerprint: l.sshHostFingerprint || void 0,
			operatingSystem: l.sshOperatingSystem,
			sudoPermission: l.sudoPermission,
			sudoPassword: l.sudoPassword || void 0
		};
	}, P = async () => {
		if (!(l.type === "ssh" && l.sshOperatingSystem === "linux" && l.sudoPermission === "allow" && !confirm(e("sudoWarning")))) {
			v(!0), g(!1), m(l.type === "ssh" ? e("sshTesting") : e("saving"));
			try {
				let t = await p("/api/profiles/workspaces", {
					method: "POST",
					body: JSON.stringify(ce())
				});
				i(t.profiles), d(ln(t.profiles.workspaces.find((e) => e.id === t.profile.id))), m(t.test ? `${e("profileSaved")} ${e("sshSuccess", t.test)}` : e("profileSaved"));
			} catch (e) {
				m(e instanceof Error ? e.message : String(e)), g(!0);
			} finally {
				v(!1);
			}
		}
	}, F = async () => {
		if (!l.editorId) {
			m(e("saveActivate"));
			return;
		}
		b(!0), g(!1), m(e("sshTesting"));
		try {
			let t = await p(`/api/profiles/workspaces/${encodeURIComponent(l.editorId)}/test`, {
				method: "POST",
				body: "{}"
			});
			m(e("sshSuccess", t));
		} catch (e) {
			g(!0), m(e instanceof Error ? e.message : String(e));
		} finally {
			b(!1);
		}
	}, le = async () => {
		if (!(!l.editorId || !confirm("Delete this workspace profile?"))) try {
			await p(`/api/profiles/workspaces/${encodeURIComponent(l.editorId)}`, { method: "DELETE" }), i(await p("/api/profiles")), d(cn);
		} catch (e) {
			m(e instanceof Error ? e.message : String(e)), g(!0);
		}
	}, I = l.type === "ssh", ue = l.sshAuthType === "key", de = I && l.sshOperatingSystem === "linux", fe = l.editorId === r.activeWorkspaceProfileId;
	return /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: o,
		id: "profiles-dialog",
		className: "wide-dialog",
		onClose: n,
		children: /* @__PURE__ */ (0, B.jsxs)("form", {
			className: "settings-form",
			onSubmit: (e) => {
				e.preventDefault(), P();
			},
			children: [
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "setup-heading",
					children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h1", { children: e("profiles") }), /* @__PURE__ */ (0, B.jsx)("p", { children: e("profilesDescription") })] }), /* @__PURE__ */ (0, B.jsx)("button", {
						className: "secondary icon-button",
						type: "button",
						"aria-label": "Close",
						onClick: () => o.current?.close(),
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "profile-tabs",
					role: "tablist",
					"aria-label": "Profile type",
					children: [/* @__PURE__ */ (0, B.jsxs)("button", {
						className: `profile-tab${s === "model" ? " active" : ""}`,
						type: "button",
						role: "tab",
						"aria-selected": s === "model",
						onClick: () => c("model"),
						children: [/* @__PURE__ */ (0, B.jsx)("span", {
							className: "tab-icon",
							children: "◆"
						}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("modelProfiles") })]
					}), /* @__PURE__ */ (0, B.jsxs)("button", {
						className: `profile-tab${s === "workspace" ? " active" : ""}`,
						type: "button",
						role: "tab",
						"aria-selected": s === "workspace",
						onClick: () => c("workspace"),
						children: [/* @__PURE__ */ (0, B.jsx)("span", {
							className: "tab-icon",
							children: "▣"
						}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("workspaceProfiles") })]
					})]
				}),
				s === "model" && /* @__PURE__ */ (0, B.jsx)("section", {
					className: "profile-tab-panel",
					role: "tabpanel",
					children: /* @__PURE__ */ (0, B.jsxs)("fieldset", { children: [
						/* @__PURE__ */ (0, B.jsx)("legend", { children: e("modelProfiles") }),
						/* @__PURE__ */ (0, B.jsx)("div", {
							className: "profile-list",
							children: r.models.map((t) => x === t.id ? /* @__PURE__ */ (0, B.jsxs)("div", {
								className: "profile-list-row model-edit-row",
								children: [
									/* @__PURE__ */ (0, B.jsxs)("div", {
										className: "two-columns",
										children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("name") }), /* @__PURE__ */ (0, B.jsx)("input", {
											type: "text",
											maxLength: 100,
											value: C,
											onChange: (e) => w(e.target.value)
										})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("requestTimeout") }), /* @__PURE__ */ (0, B.jsx)("input", {
											type: "number",
											min: "1",
											max: "3600",
											placeholder: e("requestTimeoutHelp"),
											value: ee,
											onChange: (e) => T(e.target.value)
										})] })]
									}),
									/* @__PURE__ */ (0, B.jsxs)("div", {
										className: "two-columns",
										children: [N ? /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("serverUrl") }), /* @__PURE__ */ (0, B.jsx)("input", {
											type: "url",
											spellCheck: !1,
											value: ne,
											onChange: (e) => re(e.target.value)
										})] }) : /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("serverUrl") }), /* @__PURE__ */ (0, B.jsx)("input", {
											type: "text",
											disabled: !0,
											value: "",
											placeholder: e(t.provider === "claude-code" ? "urlManagedClaude" : "urlManagedCodex")
										})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("model") }), /* @__PURE__ */ (0, B.jsx)("input", {
											type: "text",
											spellCheck: !1,
											value: D,
											onChange: (e) => O(e.target.value)
										})] })]
									}),
									/* @__PURE__ */ (0, B.jsxs)("label", {
										className: "check-row",
										children: [/* @__PURE__ */ (0, B.jsx)("input", {
											type: "checkbox",
											checked: te,
											onChange: (e) => E(e.target.checked)
										}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("enableImages") })]
									}),
									/* @__PURE__ */ (0, B.jsxs)("div", {
										className: "profile-actions",
										children: [/* @__PURE__ */ (0, B.jsx)("button", {
											type: "button",
											className: "secondary",
											disabled: ie,
											onClick: () => S(null),
											children: e("cancel")
										}), /* @__PURE__ */ (0, B.jsx)("button", {
											type: "button",
											disabled: ie,
											onClick: () => void se(),
											children: e(ie ? "savingShort" : "saveSettings")
										})]
									})
								]
							}, t.id) : /* @__PURE__ */ (0, B.jsxs)("div", {
								className: "profile-list-row",
								children: [/* @__PURE__ */ (0, B.jsxs)("span", {
									className: "profile-description",
									children: [/* @__PURE__ */ (0, B.jsx)("strong", { children: t.name }), /* @__PURE__ */ (0, B.jsxs)("small", { children: [
										t.provider,
										" · ",
										t.modelId,
										t.imagesEnabled ? " · 🖼" : "",
										t.timeoutMs ? ` · ⏱${t.timeoutMs / 1e3}s` : ""
									] })]
								}), /* @__PURE__ */ (0, B.jsxs)("div", {
									className: "profile-actions",
									children: [/* @__PURE__ */ (0, B.jsx)("button", {
										type: "button",
										className: "secondary",
										onClick: () => oe(t),
										children: e("edit")
									}), /* @__PURE__ */ (0, B.jsx)("button", {
										type: "button",
										className: "danger",
										disabled: t.id === r.activeModelProfileId,
										onClick: () => void j(t.id, t.name),
										children: e("deleteProfile")
									})]
								})]
							}, t.id))
						}),
						/* @__PURE__ */ (0, B.jsx)("p", {
							className: h ? "error" : "",
							"aria-live": "polite",
							children: f
						}),
						/* @__PURE__ */ (0, B.jsx)("div", {
							className: "profile-actions",
							children: /* @__PURE__ */ (0, B.jsx)("button", {
								className: "secondary",
								type: "button",
								onClick: a,
								children: e("addModelProfile")
							})
						})
					] })
				}),
				s === "workspace" && /* @__PURE__ */ (0, B.jsx)("section", {
					className: "profile-tab-panel",
					role: "tabpanel",
					children: /* @__PURE__ */ (0, B.jsxs)("fieldset", { children: [
						/* @__PURE__ */ (0, B.jsx)("legend", { children: e("workspaceProfiles") }),
						/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("editProfile") }), /* @__PURE__ */ (0, B.jsxs)("select", {
							value: l.editorId,
							onChange: (e) => A(e.target.value),
							children: [/* @__PURE__ */ (0, B.jsx)("option", {
								value: "",
								children: e("newProfile")
							}), r.workspaces.map((e) => /* @__PURE__ */ (0, B.jsx)("option", {
								value: e.id,
								children: e.name
							}, e.id))]
						})] }),
						/* @__PURE__ */ (0, B.jsxs)("div", {
							className: "two-columns",
							children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("profileName") }), /* @__PURE__ */ (0, B.jsx)("input", {
								type: "text",
								maxLength: 100,
								required: !0,
								value: l.name,
								onChange: (e) => k("name", e.target.value)
							})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("workspaceType") }), /* @__PURE__ */ (0, B.jsxs)("select", {
								value: l.type,
								onChange: (e) => k("type", e.target.value),
								children: [/* @__PURE__ */ (0, B.jsx)("option", {
									value: "local",
									children: "Local"
								}), /* @__PURE__ */ (0, B.jsx)("option", {
									value: "ssh",
									children: "SSH"
								})]
							})] })]
						}),
						!I && /* @__PURE__ */ (0, B.jsxs)("label", {
							id: "local-path-row",
							children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("workingDirectory") }), /* @__PURE__ */ (0, B.jsx)("input", {
								type: "text",
								spellCheck: !1,
								value: l.localPath,
								onChange: (e) => k("localPath", e.target.value)
							})]
						}),
						I && /* @__PURE__ */ (0, B.jsxs)("div", {
							id: "ssh-fields",
							className: "ssh-fields",
							children: [
								/* @__PURE__ */ (0, B.jsxs)("div", {
									className: "two-columns ssh-host-row",
									children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("sshHost") }), /* @__PURE__ */ (0, B.jsx)("input", {
										type: "text",
										spellCheck: !1,
										value: l.sshHost,
										onChange: (e) => k("sshHost", e.target.value)
									})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("sshPort") }), /* @__PURE__ */ (0, B.jsx)("input", {
										type: "number",
										min: "1",
										max: "65535",
										value: l.sshPort,
										onChange: (e) => k("sshPort", e.target.value)
									})] })]
								}),
								/* @__PURE__ */ (0, B.jsxs)("div", {
									className: "two-columns",
									children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("sshUser") }), /* @__PURE__ */ (0, B.jsx)("input", {
										type: "text",
										autoComplete: "username",
										value: l.sshUsername,
										onChange: (e) => k("sshUsername", e.target.value)
									})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("sshAuth") }), /* @__PURE__ */ (0, B.jsxs)("select", {
										value: l.sshAuthType,
										onChange: (e) => k("sshAuthType", e.target.value),
										children: [/* @__PURE__ */ (0, B.jsx)("option", {
											value: "password",
											children: e("password")
										}), /* @__PURE__ */ (0, B.jsx)("option", {
											value: "key",
											children: e("privateKey")
										})]
									})] })]
								}),
								/* @__PURE__ */ (0, B.jsxs)("div", {
									className: "two-columns",
									children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("remoteDirectory") }), /* @__PURE__ */ (0, B.jsx)("input", {
										type: "text",
										placeholder: "/home/user/project",
										spellCheck: !1,
										value: l.sshRemoteDirectory,
										onChange: (e) => k("sshRemoteDirectory", e.target.value)
									})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("remoteOs") }), /* @__PURE__ */ (0, B.jsxs)("select", {
										value: l.sshOperatingSystem,
										onChange: (e) => k("sshOperatingSystem", e.target.value),
										children: [
											/* @__PURE__ */ (0, B.jsx)("option", {
												value: "linux",
												children: "Linux"
											}),
											/* @__PURE__ */ (0, B.jsx)("option", {
												value: "macos",
												children: "macOS"
											}),
											/* @__PURE__ */ (0, B.jsx)("option", {
												value: "unix",
												children: "Other Unix"
											})
										]
									})] })]
								}),
								!ue && /* @__PURE__ */ (0, B.jsxs)("label", {
									id: "ssh-password-row",
									children: [
										/* @__PURE__ */ (0, B.jsx)("span", { children: e("password") }),
										/* @__PURE__ */ (0, B.jsx)("input", {
											type: "password",
											autoComplete: "new-password",
											value: l.sshPassword,
											onChange: (e) => k("sshPassword", e.target.value)
										}),
										/* @__PURE__ */ (0, B.jsx)("small", { children: e("secretKeepHelp") })
									]
								}),
								ue && /* @__PURE__ */ (0, B.jsxs)("div", {
									id: "ssh-key-fields",
									children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("privateKeyPath") }), /* @__PURE__ */ (0, B.jsx)("input", {
										type: "text",
										placeholder: "C:\\Users\\me\\.ssh\\id_ed25519",
										spellCheck: !1,
										value: l.sshKeyPath,
										onChange: (e) => k("sshKeyPath", e.target.value)
									})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [
										/* @__PURE__ */ (0, B.jsx)("span", { children: e("passphrase") }),
										/* @__PURE__ */ (0, B.jsx)("input", {
											type: "password",
											autoComplete: "new-password",
											value: l.sshPassphrase,
											onChange: (e) => k("sshPassphrase", e.target.value)
										}),
										/* @__PURE__ */ (0, B.jsx)("small", { children: e("secretKeepHelp") })
									] })]
								}),
								/* @__PURE__ */ (0, B.jsxs)("label", { children: [
									/* @__PURE__ */ (0, B.jsx)("span", { children: e("hostFingerprint") }),
									/* @__PURE__ */ (0, B.jsx)("input", {
										type: "text",
										placeholder: "SHA256:...",
										value: l.sshHostFingerprint,
										onChange: (e) => k("sshHostFingerprint", e.target.value)
									}),
									/* @__PURE__ */ (0, B.jsx)("small", { children: e("fingerprintHelp") })
								] }),
								de && /* @__PURE__ */ (0, B.jsxs)("fieldset", {
									id: "sudo-settings",
									className: l.sudoPermission === "allow" ? "danger-zone" : "",
									children: [
										/* @__PURE__ */ (0, B.jsx)("legend", { children: e("sudoSettings") }),
										/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("sudoPermission") }), /* @__PURE__ */ (0, B.jsxs)("select", {
											value: l.sudoPermission,
											onChange: (e) => k("sudoPermission", e.target.value),
											children: [
												/* @__PURE__ */ (0, B.jsx)("option", {
													value: "disabled",
													children: e("sudoDisabled")
												}),
												/* @__PURE__ */ (0, B.jsx)("option", {
													value: "ask",
													children: e("sudoAsk")
												}),
												/* @__PURE__ */ (0, B.jsx)("option", {
													value: "allow",
													children: e("sudoAllow")
												})
											]
										})] }),
										/* @__PURE__ */ (0, B.jsxs)("label", { children: [
											/* @__PURE__ */ (0, B.jsx)("span", { children: e("sudoPassword") }),
											/* @__PURE__ */ (0, B.jsx)("input", {
												type: "password",
												autoComplete: "new-password",
												value: l.sudoPassword,
												onChange: (e) => k("sudoPassword", e.target.value)
											}),
											/* @__PURE__ */ (0, B.jsx)("small", { children: e("secretKeepHelp") })
										] }),
										/* @__PURE__ */ (0, B.jsx)("p", {
											className: "sudo-warning",
											children: e("sudoWarning")
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, B.jsx)("p", {
							id: "profile-status",
							role: "status",
							className: h ? "error" : "",
							children: f
						}),
						/* @__PURE__ */ (0, B.jsxs)("div", {
							className: "setup-actions split-actions",
							children: [/* @__PURE__ */ (0, B.jsx)("button", {
								type: "button",
								className: "danger",
								disabled: !l.editorId || fe,
								onClick: () => void le(),
								children: e("deleteProfile")
							}), /* @__PURE__ */ (0, B.jsxs)("div", { children: [I && /* @__PURE__ */ (0, B.jsx)("button", {
								type: "button",
								className: "secondary",
								disabled: y,
								onClick: () => void F(),
								children: e("testSsh")
							}), /* @__PURE__ */ (0, B.jsx)("button", {
								type: "submit",
								disabled: _,
								children: e("saveActivate")
							})] })]
						})
					] })
				})
			]
		})
	});
}
//#endregion
//#region client/components/SessionDialog.tsx
function dn(e, t) {
	return t ? Object.entries(t).map(([t, n]) => `${e(t)}: ${e(n)}`).join(" · ") : "—";
}
function fn({ t: e, locale: t, sessionId: n, onClose: r, onRenamed: i, onDeleted: a }) {
	let o = (0, u.useRef)(null), [s, c] = (0, u.useState)(null), [l, d] = (0, u.useState)(""), [f, m] = (0, u.useState)("");
	if ((0, u.useEffect)(() => {
		if (!n) {
			o.current?.close();
			return;
		}
		m(""), p(`/api/sessions/${encodeURIComponent(n)}`).then((e) => {
			c(e), d(e.session.metadata?.title ?? e.session.prompt ?? n), o.current?.showModal();
		}).catch((e) => m(e instanceof Error ? e.message : String(e)));
	}, [n]), !n) return /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: o,
		id: "session-dialog",
		onClose: r
	});
	let h = s?.session, g = h?.metadata?.environmentSnapshot, _ = h?.metadata?.environmentSnapshot?.agent, v = async () => {
		try {
			await p(`/api/sessions/${encodeURIComponent(n)}`, {
				method: "PATCH",
				body: JSON.stringify({ title: l })
			}), o.current?.close(), i();
		} catch (e) {
			m(e instanceof Error ? e.message : String(e));
		}
	}, y = async () => {
		if (confirm("Delete this session? This cannot be undone.")) try {
			await p(`/api/sessions/${encodeURIComponent(n)}`, { method: "DELETE" }), o.current?.close(), a(n);
		} catch (e) {
			m(e instanceof Error ? e.message : String(e));
		}
	};
	return /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: o,
		id: "session-dialog",
		onClose: r,
		children: /* @__PURE__ */ (0, B.jsxs)("form", {
			className: "settings-form",
			onSubmit: (e) => {
				e.preventDefault(), v();
			},
			children: [
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "setup-heading",
					children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h1", { children: e("sessionDetails") }), /* @__PURE__ */ (0, B.jsx)("p", { children: n })] }), /* @__PURE__ */ (0, B.jsx)("button", {
						className: "secondary icon-button",
						type: "button",
						"aria-label": "Close",
						onClick: () => o.current?.close(),
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("title") }), /* @__PURE__ */ (0, B.jsx)("input", {
					type: "text",
					maxLength: 120,
					required: !0,
					value: l,
					onChange: (e) => d(e.target.value)
				})] }),
				h && s && /* @__PURE__ */ (0, B.jsxs)("dl", {
					className: "metadata-list",
					children: [
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("status") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: h.status ?? "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("provider") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: Ht(h.metadata?.appProvider ?? h.provider) }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("model") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: h.metadata?.appModelId ?? h.model ?? "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("modelProfile") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: g?.model?.profileName ?? h.metadata?.modelProfileId ?? "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("workspaceProfile") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: g?.workspace?.name ?? h.metadata?.workspaceProfileId ?? "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("workingDir") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: g?.workspace?.display ?? h.metadata?.workspace ?? h.cwd ?? h.workspaceRoot ?? "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("permissionPreset") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: _?.permissionPreset ? e(String(_.permissionPreset)) : e("settingsNotRecorded") }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("effectivePermissions") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: dn(e, _?.effectivePermissions ?? _?.permissions) }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("maxIterations") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: _?.maxIterations == null ? "—" : String(_.maxIterations) }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("autoCompaction") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: _ ? `${_.compactionEnabled ? e("allow") : e("disabled")} · ${_.compactionStrategy}` : "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("systemPrompt") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: _?.systemPrompt ?? "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("started") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: h.startedAt ? new Date(h.startedAt).toLocaleString() : "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("updated") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: h.updatedAt ? new Date(h.updatedAt).toLocaleString() : "—" }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("currentContext") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: s.context?.inputTokens == null ? "—" : `${Wt(s.context.inputTokens, t)} / ${Wt(s.context.maxInputTokens, t)} (${s.context.utilizationPercent}%)` }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("compactionHistory") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: s.lastCompaction ? `${Ft(s.lastCompaction.at, t)} · ${s.compactions.length}` : e("noCompactions") }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("inputTokens") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: Wt(Number(h.metadata?.aggregateUsage?.inputTokens ?? 0), t) }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("outputTokens") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: Wt(Number(h.metadata?.aggregateUsage?.outputTokens ?? 0), t) }),
						/* @__PURE__ */ (0, B.jsx)("dt", { children: e("messagesFile") }),
						/* @__PURE__ */ (0, B.jsx)("dd", { children: s.messagesPath ?? "—" })
					]
				}),
				f && /* @__PURE__ */ (0, B.jsx)("p", {
					className: "error",
					role: "status",
					children: f
				}),
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "setup-actions split-actions",
					children: [/* @__PURE__ */ (0, B.jsx)("button", {
						type: "button",
						className: "danger",
						onClick: () => void y(),
						children: e("deleteSession")
					}), /* @__PURE__ */ (0, B.jsx)("button", {
						type: "submit",
						children: e("rename")
					})]
				})
			]
		})
	});
}
//#endregion
//#region client/components/AgentSettingsDialog.tsx
var pn = [
	"read_files",
	"search_codebase",
	"fetch_web_content",
	"skills",
	"run_commands",
	"editor",
	"apply_patch"
], mn = {
	readonly: {
		read_files: "allow",
		search_codebase: "allow",
		fetch_web_content: "ask",
		skills: "allow",
		run_commands: "disabled",
		editor: "disabled",
		apply_patch: "disabled"
	},
	balanced: {
		read_files: "allow",
		search_codebase: "allow",
		fetch_web_content: "allow",
		skills: "allow",
		run_commands: "ask",
		editor: "ask",
		apply_patch: "ask"
	},
	full: {
		read_files: "allow",
		search_codebase: "allow",
		fetch_web_content: "allow",
		skills: "allow",
		run_commands: "allow",
		editor: "allow",
		apply_patch: "allow"
	}
}, hn = () => ({
	name: "",
	prompt: "",
	permissionPreset: "balanced",
	permissions: { ...mn.balanced }
});
function gn({ t: e, open: t, onClose: n, onSaved: r }) {
	let i = (0, u.useRef)(null), [a, o] = (0, u.useState)(null), [s, c] = (0, u.useState)("templates"), [l, d] = (0, u.useState)(null), [f, m] = (0, u.useState)(null), [h, g] = (0, u.useState)(null), [_, v] = (0, u.useState)(""), [y, b] = (0, u.useState)(!1), x = (e, t) => o((n) => n && {
		...n,
		[e]: t
	});
	(0, u.useEffect)(() => {
		if (!t) {
			i.current?.close();
			return;
		}
		v(""), p("/api/agent-settings").then((e) => {
			o(e), g(null);
			let t = e.templates.find((t) => t.id === e.activeTemplateId) ?? e.templates[0] ?? null;
			d(t?.id ?? null), m(t), i.current?.showModal();
		}).catch((e) => v(e instanceof Error ? e.message : String(e)));
	}, [t]);
	let S = (e) => {
		d(e.id), m(e), g(null);
	}, C = () => {
		d(null), m(hn()), g(null);
	}, w = (e, t) => m((n) => n && {
		...n,
		[e]: t
	}), ee = (e) => m((t) => t && {
		...t,
		permissionPreset: e,
		permissions: e === "custom" ? t.permissions : { ...mn[e] }
	}), T = (e, t) => m((n) => n && {
		...n,
		permissionPreset: "custom",
		permissions: {
			...n.permissions,
			[e]: t
		}
	}), te = async () => {
		if (!(!f || !f.name.trim() || !f.prompt.trim())) try {
			let t = JSON.stringify({
				name: f.name,
				prompt: f.prompt,
				permissionPreset: f.permissionPreset,
				permissions: f.permissions
			}), n = l ? await p(`/api/agent-settings/templates/${encodeURIComponent(l)}`, {
				method: "PATCH",
				body: t
			}) : await p("/api/agent-settings/templates", {
				method: "POST",
				body: t
			});
			o((e) => e && {
				...e,
				templates: l ? e.templates.map((e) => e.id === n.id ? n : e) : [...e.templates, n]
			}), d(n.id), m(n), v(e("templateSaved"));
		} catch (e) {
			v(e instanceof Error ? e.message : String(e));
		}
	}, E = async (e) => {
		try {
			await p(`/api/agent-settings/templates/${encodeURIComponent(e)}`, { method: "DELETE" }), o((t) => {
				if (!t) return t;
				let n = t.templates.filter((t) => t.id !== e), r = t.activeTemplateId === e ? n[0]?.id ?? t.activeTemplateId : t.activeTemplateId;
				return l === e && n[0] && S(n[0]), {
					...t,
					templates: n,
					activeTemplateId: r
				};
			});
		} catch (e) {
			v(e instanceof Error ? e.message : String(e));
		}
	}, ne = async (t) => {
		try {
			let n = await p(`/api/agent-settings/templates/${encodeURIComponent(t)}/reset`, { method: "POST" });
			o((e) => e && {
				...e,
				templates: e.templates.map((e) => e.id === n.id ? n : e)
			}), l === t && m(n), v(e("templateReset"));
		} catch (e) {
			v(e instanceof Error ? e.message : String(e));
		}
	}, re = async (e) => {
		try {
			let t = await p("/api/agent-settings", {
				method: "PATCH",
				body: JSON.stringify({ activeTemplateId: e })
			});
			o(t), r(t);
		} catch (e) {
			v(e instanceof Error ? e.message : String(e));
		}
	}, D = async () => {
		if (f?.prompt.trim()) try {
			g(await p("/api/agent-settings/preview", {
				method: "POST",
				body: JSON.stringify({ template: f.prompt })
			}));
		} catch (e) {
			v(e instanceof Error ? e.message : String(e));
		}
	}, O = (e, t) => x("mcpServers", (a?.mcpServers ?? []).map((n) => n.id === e ? {
		...n,
		...t
	} : n)), ie = () => x("mcpServers", [...a?.mcpServers ?? [], {
		id: `mcp-${Date.now()}`,
		name: "",
		enabled: !0,
		transport: "stdio",
		command: "npx",
		args: [],
		url: "",
		autoApprove: !1,
		disabledTools: []
	}]), ae = (e, t, n) => {
		let r = n ? e.disabledTools.filter((e) => e !== t) : [...e.disabledTools, t];
		O(e.id, { disabledTools: r });
	}, [k, A] = (0, u.useState)({}), j = (e) => k[e.id] ?? e.args.join(", "), oe = (e) => {
		let t = k[e.id];
		t !== void 0 && O(e.id, { args: t.split(",").map((e) => e.trim()).filter(Boolean) });
	}, [M, N] = (0, u.useState)({}), se = (0, u.useRef)({}), ce = async (t) => {
		let n = new AbortController();
		se.current[t.id] = n, N((n) => ({
			...n,
			[t.id]: {
				busy: !0,
				message: e("mcpTesting"),
				error: !1
			}
		}));
		try {
			let r = await p("/api/agent-settings/mcp/test", {
				method: "POST",
				body: JSON.stringify({
					transport: t.transport,
					command: t.command,
					args: t.args,
					url: t.url
				}),
				signal: n.signal
			}), i = r.ok ? e("mcpTestSuccess", { count: r.toolCount }) : r.error;
			N((e) => ({
				...e,
				[t.id]: {
					busy: !1,
					message: i,
					error: !r.ok,
					tools: r.ok ? r.tools : void 0
				}
			}));
		} catch (r) {
			if (n.signal.aborted) {
				N((n) => ({
					...n,
					[t.id]: {
						busy: !1,
						message: e("mcpStopped"),
						error: !1
					}
				}));
				return;
			}
			N((e) => ({
				...e,
				[t.id]: {
					busy: !1,
					message: r instanceof Error ? r.message : String(r),
					error: !0
				}
			}));
		} finally {
			delete se.current[t.id];
		}
	}, P = (e) => {
		se.current[e]?.abort(), delete se.current[e], N((t) => {
			let { [e]: n, ...r } = t;
			return r;
		}), A((t) => {
			let { [e]: n, ...r } = t;
			return r;
		}), x("mcpServers", (a?.mcpServers ?? []).filter((t) => t.id !== e));
	};
	return /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: i,
		className: "wide-dialog react-agent-dialog",
		onClose: n,
		children: /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "settings-form",
			children: [
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "setup-heading",
					children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h1", { children: e("agentSettings") }), /* @__PURE__ */ (0, B.jsx)("p", { children: e("agentSettingsIntro") })] }), /* @__PURE__ */ (0, B.jsx)("button", {
						className: "secondary icon-button",
						type: "button",
						onClick: () => i.current?.close(),
						"aria-label": "Close",
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, B.jsx)("div", {
					className: "agent-settings-tabs",
					role: "tablist",
					children: [
						["templates", "template"],
						["mcp", "MCP"],
						["automation", "shellIdleTab"]
					].map(([t, n]) => /* @__PURE__ */ (0, B.jsx)("button", {
						className: s === t ? "active" : "",
						type: "button",
						role: "tab",
						"aria-selected": s === t,
						onClick: () => c(t),
						children: n === "MCP" ? "MCP" : e(n)
					}, t))
				}),
				a ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
					s === "templates" && /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
						/* @__PURE__ */ (0, B.jsxs)("label", { children: [
							/* @__PURE__ */ (0, B.jsx)("span", { children: e("workingFolder") }),
							/* @__PURE__ */ (0, B.jsx)("input", {
								value: a.workspacePath,
								spellCheck: !1,
								onChange: (e) => x("workspacePath", e.target.value)
							}),
							/* @__PURE__ */ (0, B.jsx)("small", { children: a.allowedRoot ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
								e("allowedRoot"),
								": ",
								/* @__PURE__ */ (0, B.jsx)("code", { children: a.allowedRoot })
							] }) : e("allowedRootUnrestricted") })
						] }),
						/* @__PURE__ */ (0, B.jsxs)("fieldset", { children: [
							/* @__PURE__ */ (0, B.jsx)("legend", { children: e("templatesList") }),
							/* @__PURE__ */ (0, B.jsx)("p", {
								className: "settings-note",
								children: e("templatesNote")
							}),
							/* @__PURE__ */ (0, B.jsx)("div", {
								className: "profile-list",
								children: a.templates.map((t) => /* @__PURE__ */ (0, B.jsxs)("div", {
									className: "profile-list-row",
									children: [/* @__PURE__ */ (0, B.jsxs)("span", {
										className: "profile-description",
										children: [/* @__PURE__ */ (0, B.jsx)("strong", { children: t.name }), t.id === a.activeTemplateId && /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [" · ", e("templateActive")] })]
									}), /* @__PURE__ */ (0, B.jsxs)("div", {
										className: "profile-actions",
										style: {
											justifyContent: "flex-end",
											flexWrap: "wrap"
										},
										children: [
											/* @__PURE__ */ (0, B.jsx)("button", {
												className: "secondary",
												type: "button",
												onClick: () => S(t),
												children: e("edit")
											}),
											/* @__PURE__ */ (0, B.jsx)("button", {
												className: "secondary",
												type: "button",
												disabled: t.id === a.activeTemplateId,
												onClick: () => void re(t.id),
												children: e("useTemplate")
											}),
											t.builtin ? /* @__PURE__ */ (0, B.jsx)("button", {
												className: "secondary",
												type: "button",
												onClick: () => void ne(t.id),
												children: e("resetTemplate")
											}) : /* @__PURE__ */ (0, B.jsx)("button", {
												className: "danger",
												type: "button",
												onClick: () => void E(t.id),
												children: e("delete")
											})
										]
									})]
								}, t.id))
							}),
							/* @__PURE__ */ (0, B.jsx)("div", {
								className: "setup-actions",
								children: /* @__PURE__ */ (0, B.jsxs)("button", {
									className: "secondary",
									type: "button",
									onClick: C,
									children: ["+ ", e("newTemplate")]
								})
							})
						] }),
						f && /* @__PURE__ */ (0, B.jsxs)("fieldset", { children: [
							/* @__PURE__ */ (0, B.jsx)("legend", { children: e(l ? "editTemplateTitle" : "newTemplate") }),
							/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("name") }), /* @__PURE__ */ (0, B.jsx)("input", {
								value: f.name,
								onChange: (e) => w("name", e.target.value)
							})] }),
							/* @__PURE__ */ (0, B.jsxs)("label", { children: [
								/* @__PURE__ */ (0, B.jsx)("span", { children: e("systemPrompt") }),
								/* @__PURE__ */ (0, B.jsx)("textarea", {
									rows: 10,
									value: f.prompt,
									onChange: (e) => {
										w("prompt", e.target.value), g(null);
									}
								}),
								/* @__PURE__ */ (0, B.jsx)("small", { children: e("templatePromptVariables") })
							] }),
							/* @__PURE__ */ (0, B.jsx)("div", {
								className: "prompt-preview-actions",
								children: /* @__PURE__ */ (0, B.jsx)("button", {
									className: "secondary",
									type: "button",
									onClick: D,
									children: e("previewForEnvironment")
								})
							}),
							h && /* @__PURE__ */ (0, B.jsxs)("section", {
								className: "prompt-preview",
								children: [
									/* @__PURE__ */ (0, B.jsx)("strong", { children: e("resolvedSystemPrompt") }),
									/* @__PURE__ */ (0, B.jsxs)("small", { children: [
										e("model"),
										": ",
										h.model ? `${h.model.provider} / ${h.model.modelId}` : e("notConnected"),
										" · ",
										e("workspaceLabel"),
										": ",
										h.workspace
									] }),
									/* @__PURE__ */ (0, B.jsx)("small", { children: Object.entries(h.variables).map(([e, t]) => `${e}=${t}`).join(" · ") }),
									/* @__PURE__ */ (0, B.jsx)("pre", { children: h.preview })
								]
							}),
							/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("permissionPreset") }), /* @__PURE__ */ (0, B.jsxs)("select", {
								value: f.permissionPreset,
								onChange: (e) => ee(e.target.value),
								children: [
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "readonly",
										children: e("presetReadonly")
									}),
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "balanced",
										children: e("presetBalanced")
									}),
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "full",
										children: e("presetFull")
									}),
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "custom",
										children: e("presetCustom")
									})
								]
							})] }),
							/* @__PURE__ */ (0, B.jsx)("div", {
								className: "tool-permissions",
								children: pn.map((t) => /* @__PURE__ */ (0, B.jsxs)("label", {
									className: "tool-row",
									children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e(t) }), /* @__PURE__ */ (0, B.jsxs)("select", {
										value: f.permissions[t] ?? "ask",
										onChange: (e) => T(t, e.target.value),
										children: [
											/* @__PURE__ */ (0, B.jsx)("option", {
												value: "disabled",
												children: e("disabled")
											}),
											/* @__PURE__ */ (0, B.jsx)("option", {
												value: "ask",
												children: e("ask")
											}),
											/* @__PURE__ */ (0, B.jsx)("option", {
												value: "allow",
												children: e("allow")
											})
										]
									})]
								}, t))
							}),
							/* @__PURE__ */ (0, B.jsx)("div", {
								className: "setup-actions",
								children: /* @__PURE__ */ (0, B.jsx)("button", {
									type: "button",
									disabled: !f.name.trim() || !f.prompt.trim(),
									onClick: () => void te(),
									children: e(l ? "updateTemplate" : "createTemplate")
								})
							})
						] }),
						/* @__PURE__ */ (0, B.jsxs)("fieldset", { children: [
							/* @__PURE__ */ (0, B.jsx)("legend", { children: e("iterationsAndContext") }),
							/* @__PURE__ */ (0, B.jsxs)("div", {
								className: "two-columns",
								children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("maxIterations") }), /* @__PURE__ */ (0, B.jsx)("input", {
									type: "number",
									min: "1",
									max: "500",
									value: a.maxIterations,
									onChange: (e) => x("maxIterations", Number(e.target.value))
								})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("preserveTokens") }), /* @__PURE__ */ (0, B.jsx)("input", {
									type: "number",
									min: "1000",
									max: "500000",
									step: "1000",
									value: a.preserveRecentTokens,
									onChange: (e) => x("preserveRecentTokens", Number(e.target.value))
								})] })]
							}),
							/* @__PURE__ */ (0, B.jsxs)("label", {
								className: "check-row",
								children: [/* @__PURE__ */ (0, B.jsx)("input", {
									type: "checkbox",
									checked: a.compactionEnabled,
									onChange: (e) => x("compactionEnabled", e.target.checked)
								}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("autoCompaction") })]
							}),
							/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("compactionStrategy") }), /* @__PURE__ */ (0, B.jsxs)("select", {
								value: a.compactionStrategy,
								onChange: (e) => x("compactionStrategy", e.target.value),
								children: [/* @__PURE__ */ (0, B.jsx)("option", {
									value: "agentic",
									children: e("agenticSummary")
								}), /* @__PURE__ */ (0, B.jsx)("option", {
									value: "basic",
									children: e("basicCompaction")
								})]
							})] })
						] })
					] }),
					s === "mcp" && /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
						/* @__PURE__ */ (0, B.jsx)("p", {
							className: "settings-note",
							children: e("mcpNote")
						}),
						/* @__PURE__ */ (0, B.jsxs)("label", {
							className: "check-row",
							children: [/* @__PURE__ */ (0, B.jsx)("input", {
								type: "checkbox",
								checked: a.mcpEnabled,
								onChange: (e) => x("mcpEnabled", e.target.checked)
							}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("mcpEnabled") })]
						}),
						/* @__PURE__ */ (0, B.jsx)("div", {
							className: "mcp-list",
							children: a.mcpServers.map((t, n) => {
								let r = M[t.id];
								return /* @__PURE__ */ (0, B.jsxs)("fieldset", {
									className: "mcp-card",
									children: [
										/* @__PURE__ */ (0, B.jsxs)("legend", { children: [
											e("mcpServerLabel"),
											" ",
											n + 1
										] }),
										/* @__PURE__ */ (0, B.jsxs)("div", {
											className: "mcp-card-actions",
											children: [/* @__PURE__ */ (0, B.jsxs)("div", {
												className: "mcp-card-status",
												children: [/* @__PURE__ */ (0, B.jsxs)("label", {
													className: "check-row",
													children: [/* @__PURE__ */ (0, B.jsx)("input", {
														type: "checkbox",
														checked: t.enabled,
														onChange: (e) => O(t.id, { enabled: e.target.checked })
													}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("enabled") })]
												}), /* @__PURE__ */ (0, B.jsx)("span", {
													className: "mcp-status",
													"data-state": r?.busy ? "running" : "idle",
													children: r?.busy ? e("mcpRunning") : e("mcpIdle")
												})]
											}), /* @__PURE__ */ (0, B.jsxs)("div", {
												className: "mcp-card-buttons",
												children: [/* @__PURE__ */ (0, B.jsx)("button", {
													className: "secondary",
													type: "button",
													disabled: r?.busy,
													onClick: () => void ce(t),
													children: r?.busy ? e("mcpTesting") : e("testMcp")
												}), /* @__PURE__ */ (0, B.jsx)("button", {
													className: "secondary",
													type: "button",
													onClick: () => P(t.id),
													children: e("remove")
												})]
											})]
										}),
										r && !r.busy && /* @__PURE__ */ (0, B.jsx)("p", {
											className: r.error ? "error" : "mcp-test-success",
											role: "status",
											children: r.message
										}),
										r?.tools && r.tools.length > 0 && /* @__PURE__ */ (0, B.jsx)("ul", {
											className: "mcp-tool-list",
											children: r.tools.map((e) => /* @__PURE__ */ (0, B.jsx)("li", { children: /* @__PURE__ */ (0, B.jsxs)("label", {
												className: "check-row",
												children: [/* @__PURE__ */ (0, B.jsx)("input", {
													type: "checkbox",
													checked: !t.disabledTools.includes(e.name),
													onChange: (n) => ae(t, e.name, n.target.checked)
												}), /* @__PURE__ */ (0, B.jsxs)("span", { children: [/* @__PURE__ */ (0, B.jsx)("code", { children: e.name }), e.description ? ` — ${e.description}` : ""] })]
											}) }, e.name))
										}),
										/* @__PURE__ */ (0, B.jsxs)("label", {
											className: "check-row",
											children: [/* @__PURE__ */ (0, B.jsx)("input", {
												type: "checkbox",
												checked: t.autoApprove,
												onChange: (e) => O(t.id, { autoApprove: e.target.checked })
											}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("mcpAutoApprove") })]
										}),
										/* @__PURE__ */ (0, B.jsxs)("div", {
											className: "two-columns",
											children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("name") }), /* @__PURE__ */ (0, B.jsx)("input", {
												value: t.name,
												placeholder: "filesystem",
												onChange: (e) => O(t.id, { name: e.target.value })
											})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("transport") }), /* @__PURE__ */ (0, B.jsxs)("select", {
												value: t.transport,
												onChange: (e) => O(t.id, { transport: e.target.value }),
												children: [
													/* @__PURE__ */ (0, B.jsx)("option", {
														value: "stdio",
														children: "stdio"
													}),
													/* @__PURE__ */ (0, B.jsx)("option", {
														value: "sse",
														children: "SSE"
													}),
													/* @__PURE__ */ (0, B.jsx)("option", {
														value: "streamableHttp",
														children: "Streamable HTTP"
													})
												]
											})] })]
										}),
										t.transport === "stdio" ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("command") }), /* @__PURE__ */ (0, B.jsx)("input", {
											value: t.command,
											placeholder: "npx",
											onChange: (e) => O(t.id, { command: e.target.value })
										})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("argsCommaSeparated") }), /* @__PURE__ */ (0, B.jsx)("input", {
											value: j(t),
											placeholder: "-y, @modelcontextprotocol/server-filesystem",
											onChange: (e) => A((n) => ({
												...n,
												[t.id]: e.target.value
											})),
											onBlur: () => oe(t)
										})] })] }) : /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: "URL" }), /* @__PURE__ */ (0, B.jsx)("input", {
											type: "url",
											value: t.url,
											placeholder: "https://example.com/mcp",
											onChange: (e) => O(t.id, { url: e.target.value })
										})] })
									]
								}, t.id);
							})
						}),
						/* @__PURE__ */ (0, B.jsxs)("button", {
							className: "secondary",
							type: "button",
							onClick: ie,
							children: ["+ ", e("addMcpServer")]
						})
					] }),
					s === "automation" && /* @__PURE__ */ (0, B.jsxs)("fieldset", { children: [
						/* @__PURE__ */ (0, B.jsx)("legend", { children: e("shellIdleTitle") }),
						/* @__PURE__ */ (0, B.jsx)("p", {
							className: "settings-note",
							children: e("shellIdleNote")
						}),
						/* @__PURE__ */ (0, B.jsxs)("div", {
							className: "two-columns",
							children: [/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("idleTimeoutSeconds") }), /* @__PURE__ */ (0, B.jsx)("input", {
								type: "number",
								min: "5",
								max: "3600",
								value: a.shellIdleTimeoutSeconds,
								onChange: (e) => x("shellIdleTimeoutSeconds", Number(e.target.value))
							})] }), /* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("defaultResponse") }), /* @__PURE__ */ (0, B.jsxs)("select", {
								value: a.shellIdleAction,
								onChange: (e) => x("shellIdleAction", e.target.value),
								children: [
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "ask",
										children: e("idleAsk")
									}),
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "enter",
										children: e("idleEnterSafe")
									}),
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "wait",
										children: e("idleWaitOnce")
									}),
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "close",
										children: e("idleCancel")
									}),
									/* @__PURE__ */ (0, B.jsx)("option", {
										value: "auto",
										children: e("idleAuto")
									})
								]
							})] })]
						}),
						a.shellIdleAction === "auto" && /* @__PURE__ */ (0, B.jsxs)("div", {
							className: "settings-note",
							children: [/* @__PURE__ */ (0, B.jsxs)("label", {
								className: "check-row",
								children: [/* @__PURE__ */ (0, B.jsx)("input", {
									type: "checkbox",
									checked: a.shellIdleCarryContext,
									onChange: (e) => x("shellIdleCarryContext", e.target.checked)
								}), /* @__PURE__ */ (0, B.jsx)("span", { children: e("shellIdleCarryContext") })]
							}), /* @__PURE__ */ (0, B.jsx)("small", { children: e("shellIdleCarryContextHelp") })]
						})
					] })
				] }) : /* @__PURE__ */ (0, B.jsx)("p", { children: e("loading") }),
				/* @__PURE__ */ (0, B.jsx)("p", {
					className: /required|failed|Invalid/.test(_) ? "error" : "",
					"aria-live": "polite",
					children: _
				}),
				/* @__PURE__ */ (0, B.jsx)("div", {
					className: "setup-actions",
					children: /* @__PURE__ */ (0, B.jsx)("button", {
						type: "button",
						disabled: y,
						onClick: async () => {
							if (a) {
								b(!0), v(e("savingShort"));
								try {
									let t = await p("/api/agent-settings", {
										method: "PATCH",
										body: JSON.stringify(a)
									});
									o(t), v(e("saved")), r(t);
								} catch (e) {
									v(e instanceof Error ? e.message : String(e));
								} finally {
									b(!1);
								}
							}
						},
						children: e(y ? "savingShort" : "saveSettings")
					})
				})
			]
		})
	});
}
//#endregion
//#region client/components/GeneralSettingsDialog.tsx
function _n(e) {
	let { t, open: n, onClose: r, locale: i, onChangeLocale: a, availableLocales: o, theme: s, onToggleTheme: c, hidePlanBanner: l, onChangeHidePlanBanner: d } = e, f = (0, u.useRef)(null);
	return (0, u.useEffect)(() => {
		n ? f.current?.showModal() : f.current?.close();
	}, [n]), /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: f,
		className: "react-agent-dialog",
		onClose: r,
		children: /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "settings-form",
			children: [
				/* @__PURE__ */ (0, B.jsxs)("div", {
					className: "setup-heading",
					children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h1", { children: t("generalSettings") }), /* @__PURE__ */ (0, B.jsx)("p", { children: t("generalSettingsDescription") })] }), /* @__PURE__ */ (0, B.jsx)("button", {
						className: "secondary icon-button",
						type: "button",
						onClick: () => f.current?.close(),
						"aria-label": "Close",
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: t("language") }), /* @__PURE__ */ (0, B.jsx)("select", {
					value: i,
					onChange: (e) => a(e.target.value),
					children: o.map((e) => /* @__PURE__ */ (0, B.jsx)("option", {
						value: e.code,
						children: e.label
					}, e.code))
				})] }),
				/* @__PURE__ */ (0, B.jsxs)("label", {
					className: "check-row",
					children: [/* @__PURE__ */ (0, B.jsx)("input", {
						type: "checkbox",
						checked: s === "light",
						onChange: c
					}), /* @__PURE__ */ (0, B.jsx)("span", { children: t(s === "dark" ? "switchLight" : "switchDark") })]
				}),
				/* @__PURE__ */ (0, B.jsxs)("label", {
					className: "check-row",
					children: [/* @__PURE__ */ (0, B.jsx)("input", {
						type: "checkbox",
						checked: !l,
						onChange: (e) => d(!e.target.checked)
					}), /* @__PURE__ */ (0, B.jsx)("span", { children: t("planBannerSetting") })]
				}),
				/* @__PURE__ */ (0, B.jsx)("small", { children: t("planBannerSettingHelp") })
			]
		})
	});
}
//#endregion
//#region client/components/AiSettingsMenu.tsx
function vn({ t: e, open: t, onClose: n, onOpenConnection: r, onOpenProfiles: i, onOpenAgentSettings: a }) {
	let o = (0, u.useRef)(null);
	(0, u.useEffect)(() => {
		t ? o.current?.showModal() : o.current?.close();
	}, [t]);
	let s = (e) => {
		o.current?.close(), e();
	};
	return /* @__PURE__ */ (0, B.jsx)("dialog", {
		ref: o,
		className: "react-agent-dialog",
		onClose: n,
		children: /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "settings-form",
			children: [/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "setup-heading",
				children: [/* @__PURE__ */ (0, B.jsxs)("div", { children: [/* @__PURE__ */ (0, B.jsx)("h1", { children: e("aiSettings") }), /* @__PURE__ */ (0, B.jsx)("p", { children: e("aiSettingsMenuDescription") })] }), /* @__PURE__ */ (0, B.jsx)("button", {
					className: "secondary icon-button",
					type: "button",
					onClick: () => o.current?.close(),
					"aria-label": "Close",
					children: "×"
				})]
			}), /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "profile-list",
				children: [
					/* @__PURE__ */ (0, B.jsxs)("div", {
						className: "profile-list-row",
						children: [/* @__PURE__ */ (0, B.jsxs)("span", {
							className: "profile-description",
							children: [
								/* @__PURE__ */ (0, B.jsx)("strong", { children: e("aiConnection") }),
								/* @__PURE__ */ (0, B.jsx)("br", {}),
								e("aiConnectionDescription")
							]
						}), /* @__PURE__ */ (0, B.jsx)("button", {
							type: "button",
							onClick: () => s(r),
							children: e("aiConnection")
						})]
					}),
					/* @__PURE__ */ (0, B.jsxs)("div", {
						className: "profile-list-row",
						children: [/* @__PURE__ */ (0, B.jsxs)("span", {
							className: "profile-description",
							children: [
								/* @__PURE__ */ (0, B.jsx)("strong", { children: e("profiles") }),
								/* @__PURE__ */ (0, B.jsx)("br", {}),
								e("profilesMenuDescription")
							]
						}), /* @__PURE__ */ (0, B.jsx)("button", {
							type: "button",
							onClick: () => s(i),
							children: e("profiles")
						})]
					}),
					/* @__PURE__ */ (0, B.jsxs)("div", {
						className: "profile-list-row",
						children: [/* @__PURE__ */ (0, B.jsxs)("span", {
							className: "profile-description",
							children: [
								/* @__PURE__ */ (0, B.jsx)("strong", { children: e("agentSettings") }),
								/* @__PURE__ */ (0, B.jsx)("br", {}),
								e("agentSettingsMenuDescription")
							]
						}), /* @__PURE__ */ (0, B.jsx)("button", {
							type: "button",
							onClick: () => s(a),
							children: e("agentSettings")
						})]
					})
				]
			})]
		})
	});
}
//#endregion
//#region client/App.tsx
var yn = {
	models: [],
	workspaces: []
};
function bn({ onLogout: e } = {}) {
	let [t, n] = (0, u.useState)(y), [r, i] = (0, u.useState)({}), [a, o] = (0, u.useState)({}), [s, c] = (0, u.useState)([]), l = (e) => {
		localStorage.setItem("cline-language", e), n(e);
	};
	(0, u.useEffect)(() => {
		g("en").then(o).catch(() => {});
	}, []), (0, u.useEffect)(() => {
		g(t).then(i).catch(() => {});
	}, [t]), (0, u.useEffect)(() => {
		_().then(c).catch(() => {});
	}, []);
	let d = (0, u.useMemo)(() => (e, t) => v(r, a, e, t), [r, a]), [m, h] = (0, u.useState)(() => localStorage.getItem("cline-theme") ?? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")), [b, x] = (0, u.useState)(() => {
		let e = localStorage.getItem("cline-sidebar-collapsed");
		return e === null ? matchMedia("(max-width: 760px)").matches : e === "true";
	}), [S, C] = (0, u.useState)(() => localStorage.getItem("cline-show-tool-details") === "true"), [w, ee] = (0, u.useState)(() => localStorage.getItem("cline-hide-plan-banner") === "true"), [T, te] = (0, u.useState)(!1), [E, ne] = (0, u.useState)([]), [re, D, O] = It(null), [ie, ae] = (0, u.useState)(null), [k, A] = (0, u.useState)(!1), [j, oe] = (0, u.useState)(!1), M = (0, u.useRef)(0), [N, se] = (0, u.useState)(null), [ce, P] = (0, u.useState)(null), [F, le] = (0, u.useState)(yn), [I, ue] = (0, u.useState)(null), [de, fe] = (0, u.useState)(null), [pe, me] = (0, u.useState)([]), [he, ge] = (0, u.useState)([]), [_e, ve] = (0, u.useState)(""), [ye, be] = (0, u.useState)([]), [xe, Se, Ce] = It([]), [we, Te] = (0, u.useState)([]), [Ee, De] = (0, u.useState)(!1), [Oe, ke] = (0, u.useState)("connecting"), [Ae, je] = (0, u.useState)(!1), [Me, Ne] = (0, u.useState)(!1), [Pe, Fe] = (0, u.useState)(null), [Ie, Le] = (0, u.useState)(!1), [Re, ze] = (0, u.useState)(!1), [Be, Ve] = (0, u.useState)(!1), [He, Ue] = (0, u.useState)(!1), [We, Ge] = (0, u.useState)(null), Ke = (0, u.useRef)(0), qe = (0, u.useRef)(null), Je = (0, u.useRef)(null), L = () => Je.current;
	(0, u.useEffect)(() => {
		let e = () => {
			let e = k && M.current > 0 && Date.now() - M.current >= 1e4;
			oe(e);
		}, t = window.setInterval(e, 1e3);
		return document.addEventListener("visibilitychange", e), () => {
			window.clearInterval(t), document.removeEventListener("visibilitychange", e);
		};
	}, [k]), (0, u.useEffect)(() => {
		document.documentElement.dataset.theme = m, localStorage.setItem("cline-theme", m);
	}, [m]), (0, u.useEffect)(() => {
		document.documentElement.lang = t;
	}, [t]), (0, u.useEffect)(() => {
		document.body.classList.toggle("sidebar-collapsed", b);
	}, [b]), (0, u.useEffect)(() => {
		qe.current && !Je.current && (Je.current = new Mt(qe.current, d, S, t, I?.activeTemplateId === "plan"));
	}, []), (0, u.useEffect)(() => {
		Je.current && (Je.current.t = d, Je.current.showToolDetails = S, Je.current.locale = t, Je.current.planStyle = I?.activeTemplateId === "plan");
	}, [
		d,
		S,
		t,
		I?.activeTemplateId
	]), (0, u.useEffect)(() => {
		I?.activeTemplateId === "plan" && te(!1);
	}, [I?.activeTemplateId]);
	let Ye = (e = null, t = !1) => {
		Ke.current += 1, Ge({
			info: e,
			newProfile: t,
			token: Ke.current
		});
	}, Xe = async () => {
		let e = await p("/api/profiles");
		return le(e), e;
	}, Ze = async () => {
		let e = await p("/api/sessions");
		ne(e);
	}, Qe = async () => {
		let e = await p("/api/agent-settings");
		return ue(e), e;
	}, $e = async () => {
		let e = O.current;
		if (!e) {
			Te([]);
			return;
		}
		let t = await p(`/api/sessions/${encodeURIComponent(e)}/queue`);
		Te(Array.isArray(t) ? t : []);
	}, et = async () => {
		let e = O.current;
		if (e) try {
			let t = await p(`/api/sessions/${encodeURIComponent(e)}`);
			ae(t);
		} catch {}
	}, tt = async () => {
		let e = O.current;
		if (!e || Ce.current.length === 0) return;
		let t = Ce.current;
		Se([]);
		for (let n of t) try {
			await p(`/api/sessions/${encodeURIComponent(e)}/messages`, {
				method: "POST",
				body: JSON.stringify({
					prompt: n.prompt,
					images: n.images ?? []
				})
			});
		} catch (e) {
			L().showError(e, "Queued send failed");
		}
		$e().catch(() => {});
	}, nt = () => {
		L().clear(), me([]), be([]), ve(""), ge([]);
	}, rt = async (e) => {
		D(e), De(!1), Se([]), Te([]), nt();
		try {
			let [t, n] = await Promise.all([p(`/api/sessions/${encodeURIComponent(e)}/messages`), p(`/api/sessions/${encodeURIComponent(e)}`)]);
			ae(n);
			for (let e of t) L().renderHistoryMessage(e);
			me(n.compactions ?? []);
			for (let e of n.compactions ?? []) L().addCompactionEvent(e);
			A(n.session?.status === "running"), M.current = n.session?.status === "running" ? Date.now() : 0, oe(!1), fe(n.context), await $e(), await Ze(), matchMedia("(max-width: 760px)").matches && x(!0);
		} catch (e) {
			if (e instanceof f && e.status === 404) {
				D(null), ae(null), A(!1), fe(null), await Ze(), L().addMessage("tool", "This session is no longer available. Select another session or start a new one.");
				return;
			}
			L().showError(e, "Session load failed");
		}
	}, it = () => {
		if (!N) {
			Ye();
			return;
		}
		D(null), ae(null), De(!1), A(!1), M.current = 0, oe(!1), Se([]), Te([]), nt(), fe(null), L().addMessage("tool", "New session ready. Enter a message and press Send."), Ze().catch((e) => L().showError(e, "Session list failed"));
	}, at = async () => {
		if (confirm("Delete all Cline sessions? This cannot be undone.")) try {
			let e = await p("/api/sessions", { method: "DELETE" });
			D(null), ae(null), De(!1), A(!1), Se([]), Te([]), nt(), await Ze(), L().addMessage("tool", `Deleted ${e.deleted} session(s).${e.failed.length ? ` Failed: ${e.failed.join(", ")}` : ""}`);
		} catch (e) {
			L().showError(e, "Clear sessions failed");
		}
	}, ot = async (e) => {
		let t = /* @__PURE__ */ new Set([
			"image/png",
			"image/jpeg",
			"image/webp",
			"image/gif"
		]), n = [...e];
		if (he.length + n.length > 4) throw Error("Attach no more than 4 images per message");
		let r = [];
		for (let e of n) {
			if (!t.has(e.type)) throw Error(`Unsupported image type: ${e.name}`);
			if (e.size > 5242880) throw Error(`Image is larger than 5 MB: ${e.name}`);
			let n = await new Promise((t, n) => {
				let r = new FileReader();
				r.addEventListener("load", () => t(String(r.result))), r.addEventListener("error", () => n(r.error ?? /* @__PURE__ */ Error(`Could not read ${e.name}`))), r.readAsDataURL(e);
			});
			r.push({
				name: e.name,
				dataUrl: n
			});
		}
		ge((e) => [...e, ...r]);
	}, R = async () => {
		if (!N) {
			Ye();
			return;
		}
		let e = he.map((e) => e.dataUrl), t = [...he], n = _e.trim() || (e.length ? d("imageOnlyPrompt") : "");
		if (!(!n && e.length === 0)) {
			if (ve(""), ge([]), !re && !Ee && L().addMessage("user", n, e), !re && Ee) {
				Se((t) => [...t, {
					id: `startup-${Date.now()}-${Math.random().toString(36).slice(2)}`,
					prompt: n,
					images: e,
					imageCount: e.length,
					createdAt: Date.now()
				}]);
				return;
			}
			k || L().resetStreamNodes(), A(!0), M.current = Date.now(), oe(!1);
			try {
				if (!re) De(!0), await p("/api/sessions", {
					method: "POST",
					body: JSON.stringify({
						prompt: n,
						images: e
					})
				});
				else {
					let t = await p(`/api/sessions/${encodeURIComponent(re)}/messages`, {
						method: "POST",
						body: JSON.stringify({
							prompt: n,
							images: e
						})
					});
					t.sessionId && t.sessionId !== re && (D(t.sessionId), Ze().catch(() => {}), et());
				}
			} catch (e) {
				re || De(!1), A(!1), M.current = 0, oe(!1), he.length === 0 && ge(t), L().showError(e, "Send failed");
			}
		}
	}, st = async () => {
		if (re) try {
			await p(`/api/sessions/${encodeURIComponent(re)}/abort`, { method: "POST" }), L().addMessage("tool", "Stop requested");
		} catch (e) {
			L().showError(e, "Stop failed");
		}
	}, ct = [...xe.map((e) => ({
		...e,
		source: "startup"
	})), ...we.map((e) => ({
		...e,
		source: "server"
	}))], lt = async (e, t) => {
		if (e.source === "startup") {
			Se((n) => n.map((n) => n.id === e.id ? {
				...n,
				prompt: t
			} : n));
			return;
		}
		await p(`/api/sessions/${encodeURIComponent(re ?? "")}/queue/${encodeURIComponent(e.id)}`, {
			method: "PATCH",
			body: JSON.stringify({ prompt: t })
		}), await $e();
	}, ut = async (e) => {
		if (e.source === "startup") {
			Se((t) => t.filter((t) => t.id !== e.id));
			return;
		}
		await p(`/api/sessions/${encodeURIComponent(re ?? "")}/queue/${encodeURIComponent(e.id)}`, { method: "DELETE" }), await $e();
	}, dt = I?.templates.find((e) => e.id === I.activeTemplateId) ?? null, ft = dt?.permissions ?? null, pt = async (e) => {
		if (!I || !dt || !(e in dt.permissions)) return;
		let t = [
			"disabled",
			"ask",
			"allow"
		], n = dt.permissions[e], r = t[(t.indexOf(n) + 1) % t.length], i = I, a = {
			...dt.permissions,
			[e]: r
		};
		ue({
			...i,
			templates: i.templates.map((e) => e.id === dt.id ? {
				...e,
				permissions: a,
				permissionPreset: "custom"
			} : e)
		});
		try {
			let e = await p(`/api/agent-settings/templates/${encodeURIComponent(dt.id)}`, {
				method: "PATCH",
				body: JSON.stringify({ permissions: a })
			});
			ue((t) => t && {
				...t,
				templates: t.templates.map((t) => t.id === e.id ? e : t)
			});
		} catch (e) {
			ue(i), L().showError(e, "Permission update failed");
		}
	}, mt = async () => {
		if (!I) return;
		let e = I, t = !I.mcpEnabled;
		ue({
			...e,
			mcpEnabled: t
		});
		try {
			ue(await p("/api/agent-settings", {
				method: "PATCH",
				body: JSON.stringify({ mcpEnabled: t })
			}));
		} catch (t) {
			ue(e), L().showError(t, "MCP toggle failed");
		}
	}, [ht, gt] = (0, u.useState)(!1), _t = async (e) => {
		if (!I || I.activeTemplateId === e) return;
		let t = I;
		ue({
			...t,
			activeTemplateId: e
		}), gt(!0);
		try {
			ue(await p("/api/agent-settings", {
				method: "PATCH",
				body: JSON.stringify({ activeTemplateId: e })
			}));
		} catch (e) {
			ue(t), L().showError(e, "Template switch failed");
		} finally {
			gt(!1);
		}
	}, vt = async (e, t) => {
		try {
			await p(`/api/approvals/${encodeURIComponent(e)}`, {
				method: "POST",
				body: JSON.stringify({ approved: t })
			}), be((t) => t.filter((t) => t.id !== e));
		} catch (e) {
			L().showError(e, "Approval failed");
		}
	}, z = async (e) => {
		let t = F.activeModelProfileId;
		je(!0);
		try {
			let t = await p(`/api/profiles/models/${encodeURIComponent(e)}/activate`, {
				method: "POST",
				body: "{}"
			});
			le(t.profiles);
			let n = t.connection;
			se("modelId" in n ? n.modelId : null), P(n), fe(await p("/api/context"));
		} catch (e) {
			le((e) => ({
				...e,
				activeModelProfileId: t
			})), L().showError(e, "Model profile switch failed");
		} finally {
			je(!1);
		}
	}, yt = async (e) => {
		let t = F.activeWorkspaceProfileId;
		Ne(!0);
		try {
			let t = await p(`/api/profiles/workspaces/${encodeURIComponent(e)}/activate`, {
				method: "POST",
				body: "{}"
			});
			le(t.profiles);
		} catch (e) {
			le((e) => ({
				...e,
				activeWorkspaceProfileId: t
			})), L().showError(e, "Workspace profile switch failed");
		} finally {
			Ne(!1);
		}
	}, bt = (e) => {
		se(e.modelId), P(e), D(null), ae(null), nt(), L().resetStreamNodes(), fe(null), p("/api/context").then(fe).catch(() => {}), Xe().catch(() => {}), L().addMessage("tool", `AI connected: ${e.provider} / ${e.modelId}`);
	}, xt = (e) => {
		ue(e), Xe().catch(() => {}), p("/api/context").then(fe).catch(() => {});
	};
	(0, u.useEffect)(() => {
		Ze().catch((e) => L().showError(e, "Session list failed")), Xe().catch((e) => L().showError(e, "Profile load failed")), Qe().catch((e) => L().showError(e, "Agent settings failed")), p("/api/config").then((e) => {
			e.configured ? (se(e.modelId), P(e), p("/api/context").then(fe).catch(() => {})) : Ye(e);
		}).catch((e) => L().showError(e, "Configuration failed"));
		let e = new EventSource("/api/events");
		e.onopen = () => ke("open"), e.onerror = () => ke("retry");
		for (let t of [
			"text",
			"reasoning",
			"tool",
			"tool_result",
			"iteration",
			"status",
			"usage",
			"turn_finished",
			"ended",
			"approval",
			"queue",
			"prompt_started",
			"session_replaced",
			"cline_error"
		]) e.addEventListener(t, (e) => {
			let n = JSON.parse(e.data), r = L();
			if (t === "session_replaced") {
				n.sessionId === O.current && n.data?.sessionId && (D(n.data.sessionId), A(!1), Ze().catch(() => {}), et());
				return;
			}
			if (t === "cline_error") {
				(n.sessionId === O.current || n.sessionId === "unknown") && r.resetStreamNodes(), r.addMessage("tool", `Cline error: ${n.data}`);
				return;
			}
			if (!O.current && n.sessionId && (D(n.sessionId), De(!1), Ze().catch((e) => r.showError(e, "Session list failed")), et(), tt().catch((e) => r.showError(e, "Queue flush failed"))), n.sessionId === O.current) {
				if ([
					"prompt_started",
					"text",
					"reasoning",
					"tool",
					"tool_result",
					"iteration",
					"usage",
					"status"
				].includes(t) && (M.current = Date.now(), oe(!1)), t === "queue" && Te(Array.isArray(n.data?.prompts) ? n.data.prompts : []), t === "prompt_started" && (r.finishStreamNodes(), r.resetStreamNodes(), typeof n.data?.prompt == "string" && r.addMessage("user", n.data.prompt, Array.isArray(n.data?.images) ? n.data.images : []), Ze().catch(() => {}), et()), t === "text" && r.appendStream("text", n.data), t === "reasoning" && r.appendStream("reasoning", typeof n.data == "string" ? n.data : n.data?.text, !!n.data?.redacted), t === "iteration" && (r.finishStreamNodes(), r.resetStreamNodes()), t === "tool" && (r.finishStreamNodes(), r.addToolActivity(n.data)), t === "tool_result" && r.finishToolActivity(n.data), t === "approval" && be((e) => [...e, n.data]), t === "usage" && fe(n.data), t === "status" && n.data?.reason === "auto_compaction") {
					let e = {
						at: n.data.at ?? (/* @__PURE__ */ new Date()).toISOString(),
						message: n.data.message ?? ""
					};
					me((t) => [...t, e]), r.addCompactionEvent(e);
				}
				if (t === "status" && typeof n.data == "string" && (A(n.data === "running"), n.data === "idle" && $e().catch(() => {})), t === "turn_finished" || t === "ended") {
					A(!1), M.current = 0, oe(!1), t === "turn_finished" && $e().catch(() => {}), t === "ended" && r.finishStreamNodes(), r.resetStreamNodes();
					let e = O.current;
					e && p(`/api/sessions/${encodeURIComponent(e)}`).then((e) => {
						ae(e), fe(e.context);
					}).catch(() => {});
				}
			}
		});
		return () => e.close();
	}, []);
	let St = Oe === "retry" ? d("sseRetry") : N ? `${d("connected")} · ${N}` : d(Oe === "open" ? "serverConnected" : "connecting"), Ct = Oe === "retry" ? "#f5c979" : N ? "#79d69a" : "#f5c979", wt = F.workspaces.find((e) => e.id === F.activeWorkspaceProfileId), Tt = wt ? `${wt.type === "ssh" ? "SSH" : "workspace"}: ${wt.type === "ssh" ? `${wt.username}@${wt.host}:${wt.remoteDirectory}` : wt.path}` : "workspace: loading...";
	return /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
		/* @__PURE__ */ (0, B.jsx)(Vt, {
			t: d,
			connectionText: St,
			connectionColor: Ct,
			workspaceDisplay: Tt,
			profilesData: F,
			onModelProfileChange: z,
			onWorkspaceProfileChange: yt,
			modelProfileBusy: Ae,
			workspaceProfileBusy: Me,
			sidebarCollapsed: b,
			onToggleSidebar: () => x((e) => {
				let t = !e;
				return localStorage.setItem("cline-sidebar-collapsed", String(t)), t;
			}),
			onOpenGeneralSettings: () => Ve(!0),
			onOpenAiSettings: () => Ue(!0),
			onLogout: e
		}),
		/* @__PURE__ */ (0, B.jsxs)("main", { children: [/* @__PURE__ */ (0, B.jsx)(Gt, {
			t: d,
			sessions: E,
			activeSession: re,
			onSelect: rt,
			onOpenDetails: Fe,
			onNewSession: it,
			onClearSessions: at
		}), /* @__PURE__ */ (0, B.jsxs)("section", {
			className: "conversation",
			children: [
				/* @__PURE__ */ (0, B.jsx)(Jt, {
					t: d,
					locale: t,
					context: de,
					compactions: pe,
					showToolDetails: S,
					onToggleShowToolDetails: (e) => {
						C(e), localStorage.setItem("cline-show-tool-details", String(e)), re && rt(re);
					},
					session: ie?.session ?? null
				}),
				/* @__PURE__ */ (0, B.jsx)("div", {
					id: "messages",
					className: "messages",
					ref: qe
				}),
				/* @__PURE__ */ (0, B.jsx)(Yt, {
					t: d,
					approvals: ye,
					onResolve: vt
				}),
				/* @__PURE__ */ (0, B.jsx)(Xt, {
					t: d,
					entries: ct,
					onUpdate: lt,
					onCancel: ut
				}),
				I?.activeTemplateId === "plan" && !w && !T && /* @__PURE__ */ (0, B.jsxs)("div", {
					className: "mode-banner",
					children: [/* @__PURE__ */ (0, B.jsxs)("span", { children: ["◐ ", d("modeBanner")] }), /* @__PURE__ */ (0, B.jsxs)("div", {
						className: "mode-banner-actions",
						children: [/* @__PURE__ */ (0, B.jsx)("button", {
							type: "button",
							className: "secondary",
							disabled: ht,
							onClick: () => void _t("coding"),
							children: d("switchToCode")
						}), /* @__PURE__ */ (0, B.jsx)("button", {
							type: "button",
							className: "secondary icon-button",
							"aria-label": d("dismiss"),
							title: d("dismiss"),
							onClick: () => te(!0),
							children: "×"
						})]
					})]
				}),
				/* @__PURE__ */ (0, B.jsx)(rn, {
					t: d,
					prompt: _e,
					onPromptChange: ve,
					onSubmit: () => void R(),
					onAbort: () => void st(),
					running: k,
					stalled: j,
					pendingImages: he,
					onAddImages: (e) => void ot(e).catch((e) => L().showError(e, "Image attachment failed")),
					onRemoveImage: (e) => ge((t) => t.filter((t, n) => n !== e)),
					imagesEnabled: !!(ce && "imagesEnabled" in ce && ce.imagesEnabled),
					agentSettings: I,
					effectivePermissions: ft,
					onCyclePermission: pt,
					mcpEnabled: I?.mcpEnabled ?? null,
					onToggleMcp: mt,
					onSelectTemplate: (e) => void _t(e),
					templateBusy: ht
				})
			]
		})] }),
		/* @__PURE__ */ (0, B.jsx)(_n, {
			t: d,
			open: Be,
			onClose: () => Ve(!1),
			locale: t,
			onChangeLocale: l,
			availableLocales: s,
			theme: m,
			onToggleTheme: () => h((e) => e === "dark" ? "light" : "dark"),
			hidePlanBanner: w,
			onChangeHidePlanBanner: (e) => {
				ee(e), localStorage.setItem("cline-hide-plan-banner", String(e));
			}
		}),
		/* @__PURE__ */ (0, B.jsx)(vn, {
			t: d,
			open: He,
			onClose: () => Ue(!1),
			onOpenConnection: async () => Ye(await p("/api/config")),
			onOpenProfiles: async () => {
				await Xe(), Le(!0);
			},
			onOpenAgentSettings: () => ze(!0)
		}),
		/* @__PURE__ */ (0, B.jsx)(sn, {
			t: d,
			request: We,
			onClose: () => {},
			profilesData: F,
			onConnected: bt
		}),
		/* @__PURE__ */ (0, B.jsx)(un, {
			t: d,
			open: Ie,
			onClose: () => Le(!1),
			profilesData: F,
			onProfilesChanged: le,
			onAddModelProfile: async () => {
				Le(!1), Ye(await p("/api/config"), !0);
			}
		}),
		/* @__PURE__ */ (0, B.jsx)(fn, {
			t: d,
			locale: t,
			sessionId: Pe,
			onClose: () => Fe(null),
			onRenamed: () => {
				Fe(null), Ze().catch(() => {});
			},
			onDeleted: (e) => {
				Fe(null), re === e && (D(null), ae(null), nt(), fe(null)), Ze().catch(() => {});
			}
		}),
		/* @__PURE__ */ (0, B.jsx)(gn, {
			t: d,
			open: Re,
			onClose: () => ze(!1),
			onSaved: xt
		})
	] });
}
//#endregion
//#region client/components/LoginScreen.tsx
function xn({ t: e, onSuccess: t }) {
	let [n, r] = (0, u.useState)(""), [i, a] = (0, u.useState)(""), [o, s] = (0, u.useState)(!1), [c, l] = (0, u.useState)(""), d = async (e) => {
		e.preventDefault(), s(!0), l("");
		try {
			await p("/api/auth/login", {
				method: "POST",
				body: JSON.stringify({
					username: n,
					password: i
				})
			}), t();
		} catch (e) {
			l(e instanceof f ? e.message : String(e));
		} finally {
			s(!1);
		}
	};
	return /* @__PURE__ */ (0, B.jsx)("div", {
		className: "login-screen",
		children: /* @__PURE__ */ (0, B.jsxs)("form", {
			className: "login-card",
			onSubmit: (e) => void d(e),
			children: [
				/* @__PURE__ */ (0, B.jsx)("h1", { children: e("loginTitle") }),
				/* @__PURE__ */ (0, B.jsx)("p", {
					className: "settings-note",
					children: e("loginDescription")
				}),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("loginUsername") }), /* @__PURE__ */ (0, B.jsx)("input", {
					value: n,
					autoFocus: !0,
					spellCheck: !1,
					onChange: (e) => r(e.target.value)
				})] }),
				/* @__PURE__ */ (0, B.jsxs)("label", { children: [/* @__PURE__ */ (0, B.jsx)("span", { children: e("loginPassword") }), /* @__PURE__ */ (0, B.jsx)("input", {
					type: "password",
					value: i,
					onChange: (e) => a(e.target.value)
				})] }),
				c && /* @__PURE__ */ (0, B.jsx)("p", {
					className: "error",
					role: "status",
					children: c
				}),
				/* @__PURE__ */ (0, B.jsx)("div", {
					className: "setup-actions",
					children: /* @__PURE__ */ (0, B.jsx)("button", {
						type: "submit",
						disabled: o || !n || !i,
						children: e(o ? "connecting" : "loginSubmit")
					})
				})
			]
		})
	});
}
//#endregion
//#region client/components/AuthGate.tsx
function Sn() {
	let [e, t] = (0, u.useState)(null), [n, r] = (0, u.useState)({}), [i, a] = (0, u.useState)({}), o = (0, u.useMemo)(() => (e, t) => v(n, i, e, t), [n, i]);
	if ((0, u.useEffect)(() => {
		fetch("/api/auth/status").then((e) => e.json()).then(t).catch(() => t({
			required: !1,
			authenticated: !0
		}));
	}, []), (0, u.useEffect)(() => {
		!e?.required || e.authenticated || (g("en").then(a).catch(() => {}), g(y()).then(r).catch(() => {}));
	}, [e]), !e) return null;
	if (e.required && !e.authenticated) return /* @__PURE__ */ (0, B.jsx)(xn, {
		t: o,
		onSuccess: () => t({
			required: !0,
			authenticated: !0
		})
	});
	let s = e.required ? () => {
		fetch("/api/auth/logout", { method: "POST" }).finally(() => t({
			required: !0,
			authenticated: !1
		}));
	} : void 0;
	return /* @__PURE__ */ (0, B.jsx)(bn, { onLogout: s });
}
//#endregion
//#region client/main.tsx
var Cn = document.querySelector("#root");
Cn && (0, d.createRoot)(Cn).render(/* @__PURE__ */ (0, B.jsx)(Sn, {}));
//#endregion
