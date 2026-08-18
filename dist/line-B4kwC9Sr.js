import { n as e, t } from "./path-6HLei9i0.js";
import { t as n } from "./array-CApNbSU9.js";
import { rt as r } from "./chunk-NSK5VX7P-pGKppjHe.js";
//#region node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/point.js
function i(e) {
	return e[0];
}
function a(e) {
	return e[1];
}
//#endregion
//#region node_modules/.pnpm/d3-shape@3.2.0/node_modules/d3-shape/src/line.js
function o(o, s) {
	var c = e(!0), l = null, u = r, d = null, f = t(p);
	o = typeof o == "function" ? o : o === void 0 ? i : e(o), s = typeof s == "function" ? s : s === void 0 ? a : e(s);
	function p(e) {
		var t, r = (e = n(e)).length, i, a = !1, p;
		for (l ?? (d = u(p = f())), t = 0; t <= r; ++t) !(t < r && c(i = e[t], t, e)) === a && ((a = !a) ? d.lineStart() : d.lineEnd()), a && d.point(+o(i, t, e), +s(i, t, e));
		if (p) return d = null, p + "" || null;
	}
	return p.x = function(t) {
		return arguments.length ? (o = typeof t == "function" ? t : e(+t), p) : o;
	}, p.y = function(t) {
		return arguments.length ? (s = typeof t == "function" ? t : e(+t), p) : s;
	}, p.defined = function(t) {
		return arguments.length ? (c = typeof t == "function" ? t : e(!!t), p) : c;
	}, p.curve = function(e) {
		return arguments.length ? (u = e, l != null && (d = u(l)), p) : u;
	}, p.context = function(e) {
		return arguments.length ? (e == null ? l = d = null : d = u(l = e), p) : l;
	}, p;
}
//#endregion
export { o as t };
