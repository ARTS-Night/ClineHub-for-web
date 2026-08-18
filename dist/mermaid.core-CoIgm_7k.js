import { t as e } from "./purify.es-BES4pJF7.js";
import { n as t } from "./chunk-Y2CYZVJY-CmNPyWGC.js";
import { h as n, m as r, p as i } from "./src-BfmkUsMs.js";
import { C as a, E as o, I as s, L as c, N as l, P as u, Q as d, S as f, T as p, V as m, W as h, X as g, Z as _, _ as v, b as y, c as b, g as ee, l as x, m as S, n as C, p as te, q as ne, r as re, s as ie, t as ae, u as oe, x as se } from "./chunk-I66GZJ75-DaJZKFkN.js";
import { S as ce, a as w, d as le, f as ue, g as de, h as fe, i as pe, o as me, v as he, x as ge, y as _e } from "./chunk-NSK5VX7P-pGKppjHe.js";
import { r as ve } from "./chunk-4I5QYGJK-_sTbXS-x.js";
import { r as ye } from "./chunk-WRU74C26-2tQNDD2Y.js";
import "./chunk-7BUUIJ7U-nEj9ozwq.js";
import "./chunk-UBXNYLIW-B89mmlsE.js";
import "./chunk-W5SLKNZC-Bs8d-RNY.js";
import { a as be, i as xe, s as Se } from "./chunk-QR6OTTB3-BxzOpq6Z.js";
import { a as Ce, i as we, o as Te, r as Ee } from "./chunk-7Z6QIM7H-D3Vl-BKN.js";
//#region node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/chunks/mermaid.core/chunk-3NCLNEKW.mjs
var De = /* @__PURE__ */ t((e) => {
	let { securityLevel: t } = se(), n = i("body");
	if (t === "sandbox") {
		let t = i(`#i${e}`).node()?.contentDocument ?? document;
		n = i(t.body);
	}
	return n.select(`#${e}`);
}, "selectSvgElement");
//#endregion
//#region node_modules/.pnpm/es-toolkit@1.50.0/node_modules/es-toolkit/dist/compat/_internal/isPrototype.mjs
function Oe(e) {
	let t = e?.constructor;
	return e === (typeof t == "function" ? t.prototype : Object.prototype);
}
//#endregion
//#region node_modules/.pnpm/es-toolkit@1.50.0/node_modules/es-toolkit/dist/compat/predicate/isEmpty.mjs
function ke(e) {
	if (e == null) return !0;
	if (ge(e)) return typeof e.splice != "function" && typeof e != "string" && !ce(e) && !he(e) && !_e(e) ? !1 : e.length === 0;
	if (typeof e == "object" || typeof e == "function") {
		if (e instanceof Map || e instanceof Set) return e.size === 0;
		let t = Object.keys(e);
		return Oe(e) ? t.filter((e) => e !== "constructor").length === 0 : t.length === 0;
	}
	return !0;
}
//#endregion
//#region node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/chunks/mermaid.core/chunk-J7OUQ5F2.mjs
var Ae = {
	common: ie,
	getConfig: y,
	insertCluster: xe,
	insertEdge: Ee,
	insertEdgeLabel: we,
	insertMarkers: Ce,
	insertNode: be,
	interpolateToCurve: le,
	labelHelper: Se,
	log: r,
	positionEdgeLabel: Te
}, je = {}, Me = /* @__PURE__ */ t((e) => {
	for (let t of e) je[t.name] = t;
}, "registerLayoutLoaders");
(/* @__PURE__ */ t(() => {
	Me([
		{
			name: "dagre",
			loader: /* @__PURE__ */ t(async () => await import("./dagre-VZM6K2ZE-CIItV4DB.js"), "loader")
		},
		{
			name: "swimlane",
			loader: /* @__PURE__ */ t(async () => await import("./swimlanes-SLNWSIFB-DaEXzuHN.js"), "loader")
		},
		{
			name: "cose-bilkent",
			loader: /* @__PURE__ */ t(async () => await import("./cose-bilkent-JH36ORCC-BInM1ic9.js"), "loader")
		}
	]);
}, "registerDefaultLayoutLoaders"))();
var Ne = /* @__PURE__ */ t(async (e, t, n) => {
	if (!(e.layoutAlgorithm in je)) throw Error(`Unknown layout algorithm: ${e.layoutAlgorithm}`);
	if (e.diagramId) for (let t of e.nodes) {
		let n = t.domId || t.id;
		t.domId = `${e.diagramId}-${n}`;
	}
	let r = je[e.layoutAlgorithm], i = await r.loader(), { theme: a, themeVariables: o } = e.config, { useGradient: s, gradientStart: c, gradientStop: l } = o, u = t.attr("id");
	if (t.append("defs").append("filter").attr("id", `${u}-drop-shadow`).attr("height", "130%").attr("width", "130%").append("feDropShadow").attr("dx", "4").attr("dy", "4").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", `${a?.includes("dark") ? "#FFFFFF" : "#000000"}`), t.append("defs").append("filter").attr("id", `${u}-drop-shadow-small`).attr("height", "150%").attr("width", "150%").append("feDropShadow").attr("dx", "2").attr("dy", "2").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", `${a?.includes("dark") ? "#FFFFFF" : "#000000"}`), s) {
		let e = t.append("linearGradient").attr("id", t.attr("id") + "-gradient").attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
		e.append("svg:stop").attr("offset", "0%").attr("stop-color", c).attr("stop-opacity", 1), e.append("svg:stop").attr("offset", "100%").attr("stop-color", l).attr("stop-opacity", 1);
	}
	return i.render(e, t, Ae, { algorithm: r.algorithm }, n);
}, "render"), Pe = /* @__PURE__ */ t((e = "", { fallback: t = "dagre" } = {}) => {
	if (e in je) return e;
	if (t in je) return r.warn(`Layout algorithm ${e} is not registered. Using ${t} as fallback.`), t;
	throw Error(`Both layout algorithms ${e} and ${t} are not registered.`);
}, "getRegisteredLayoutAlgorithm");
//#endregion
//#region node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/chunks/mermaid.core/chunk-ZIRB5QZD.mjs
function Fe(e) {
	return e == null;
}
t(Fe, "isNothing");
function Ie(e) {
	return typeof e == "object" && !!e;
}
t(Ie, "isObject");
function Le(e) {
	return Array.isArray(e) ? e : Fe(e) ? [] : [e];
}
t(Le, "toArray");
function Re(e, t) {
	var n, r, i, a;
	if (t) for (a = Object.keys(t), n = 0, r = a.length; n < r; n += 1) i = a[n], e[i] = t[i];
	return e;
}
t(Re, "extend");
function ze(e, t) {
	var n = "", r;
	for (r = 0; r < t; r += 1) n += e;
	return n;
}
t(ze, "repeat");
function Be(e) {
	return e === 0 && 1 / e == -Infinity;
}
t(Be, "isNegativeZero");
var T = {
	isNothing: Fe,
	isObject: Ie,
	toArray: Le,
	repeat: ze,
	isNegativeZero: Be,
	extend: Re
};
function Ve(e, t) {
	var n = "", r = e.reason || "(unknown reason)";
	return e.mark ? (e.mark.name && (n += "in \"" + e.mark.name + "\" "), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += "\n\n" + e.mark.snippet), r + " " + n) : r;
}
t(Ve, "formatError");
function E(e, t) {
	Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Ve(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = (/* @__PURE__ */ Error()).stack || "";
}
t(E, "YAMLException$1"), E.prototype = Object.create(Error.prototype), E.prototype.constructor = E, E.prototype.toString = /* @__PURE__ */ t(function(e) {
	return this.name + ": " + Ve(this, e);
}, "toString");
var D = E;
function He(e, t, n, r, i) {
	var a = "", o = "", s = Math.floor(i / 2) - 1;
	return r - t > s && (a = " ... ", t = r - s + a.length), n - r > s && (o = " ...", n = r + s - o.length), {
		str: a + e.slice(t, n).replace(/\t/g, "→") + o,
		pos: r - t + a.length
	};
}
t(He, "getLine");
function Ue(e, t) {
	return T.repeat(" ", t - e.length) + e;
}
t(Ue, "padStart");
function We(e, t) {
	if (t = Object.create(t || null), !e.buffer) return null;
	t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
	for (var n = /\r?\n|\r|\0/g, r = [0], i = [], a, o = -1; a = n.exec(e.buffer);) i.push(a.index), r.push(a.index + a[0].length), e.position <= a.index && o < 0 && (o = r.length - 2);
	o < 0 && (o = r.length - 1);
	var s = "", c, l, u = Math.min(e.line + t.linesAfter, i.length).toString().length, d = t.maxLength - (t.indent + u + 3);
	for (c = 1; c <= t.linesBefore && !(o - c < 0); c++) l = He(e.buffer, r[o - c], i[o - c], e.position - (r[o] - r[o - c]), d), s = T.repeat(" ", t.indent) + Ue((e.line - c + 1).toString(), u) + " | " + l.str + "\n" + s;
	for (l = He(e.buffer, r[o], i[o], e.position, d), s += T.repeat(" ", t.indent) + Ue((e.line + 1).toString(), u) + " | " + l.str + "\n", s += T.repeat("-", t.indent + u + 3 + l.pos) + "^\n", c = 1; c <= t.linesAfter && !(o + c >= i.length); c++) l = He(e.buffer, r[o + c], i[o + c], e.position - (r[o] - r[o + c]), d), s += T.repeat(" ", t.indent) + Ue((e.line + c + 1).toString(), u) + " | " + l.str + "\n";
	return s.replace(/\n$/, "");
}
t(We, "makeSnippet");
var Ge = We, Ke = [
	"kind",
	"multi",
	"resolve",
	"construct",
	"instanceOf",
	"predicate",
	"represent",
	"representName",
	"defaultStyle",
	"styleAliases"
], qe = [
	"scalar",
	"sequence",
	"mapping"
];
function Je(e) {
	var t = {};
	return e !== null && Object.keys(e).forEach(function(n) {
		e[n].forEach(function(e) {
			t[String(e)] = n;
		});
	}), t;
}
t(Je, "compileStyleAliases");
function Ye(e, t) {
	if (t ||= {}, Object.keys(t).forEach(function(t) {
		if (Ke.indexOf(t) === -1) throw new D("Unknown option \"" + t + "\" is met in definition of \"" + e + "\" YAML type.");
	}), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
		return !0;
	}, this.construct = t.construct || function(e) {
		return e;
	}, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = Je(t.styleAliases || null), qe.indexOf(this.kind) === -1) throw new D("Unknown kind \"" + this.kind + "\" is specified for \"" + e + "\" YAML type.");
}
t(Ye, "Type$1");
var O = Ye;
function Xe(e, t) {
	var n = [];
	return e[t].forEach(function(e) {
		var t = n.length;
		n.forEach(function(n, r) {
			n.tag === e.tag && n.kind === e.kind && n.multi === e.multi && (t = r);
		}), n[t] = e;
	}), n;
}
t(Xe, "compileList");
function Ze() {
	var e = {
		scalar: {},
		sequence: {},
		mapping: {},
		fallback: {},
		multi: {
			scalar: [],
			sequence: [],
			mapping: [],
			fallback: []
		}
	}, n, r;
	function i(t) {
		t.multi ? (e.multi[t.kind].push(t), e.multi.fallback.push(t)) : e[t.kind][t.tag] = e.fallback[t.tag] = t;
	}
	for (t(i, "collectType"), n = 0, r = arguments.length; n < r; n += 1) arguments[n].forEach(i);
	return e;
}
t(Ze, "compileMap");
function Qe(e) {
	return this.extend(e);
}
t(Qe, "Schema$1"), Qe.prototype.extend = /* @__PURE__ */ t(function(e) {
	var t = [], n = [];
	if (e instanceof O) n.push(e);
	else if (Array.isArray(e)) n = n.concat(e);
	else if (e && (Array.isArray(e.implicit) || Array.isArray(e.explicit))) e.implicit && (t = t.concat(e.implicit)), e.explicit && (n = n.concat(e.explicit));
	else throw new D("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
	t.forEach(function(e) {
		if (!(e instanceof O)) throw new D("Specified list of YAML types (or a single Type object) contains a non-Type object.");
		if (e.loadKind && e.loadKind !== "scalar") throw new D("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
		if (e.multi) throw new D("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
	}), n.forEach(function(e) {
		if (!(e instanceof O)) throw new D("Specified list of YAML types (or a single Type object) contains a non-Type object.");
	});
	var r = Object.create(Qe.prototype);
	return r.implicit = (this.implicit || []).concat(t), r.explicit = (this.explicit || []).concat(n), r.compiledImplicit = Xe(r, "implicit"), r.compiledExplicit = Xe(r, "explicit"), r.compiledTypeMap = Ze(r.compiledImplicit, r.compiledExplicit), r;
}, "extend");
var $e = new Qe({ explicit: [
	new O("tag:yaml.org,2002:str", {
		kind: "scalar",
		construct: /* @__PURE__ */ t(function(e) {
			return e === null ? "" : e;
		}, "construct")
	}),
	new O("tag:yaml.org,2002:seq", {
		kind: "sequence",
		construct: /* @__PURE__ */ t(function(e) {
			return e === null ? [] : e;
		}, "construct")
	}),
	new O("tag:yaml.org,2002:map", {
		kind: "mapping",
		construct: /* @__PURE__ */ t(function(e) {
			return e === null ? {} : e;
		}, "construct")
	})
] });
function et(e) {
	if (e === null) return !0;
	var t = e.length;
	return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
t(et, "resolveYamlNull");
function tt() {
	return null;
}
t(tt, "constructYamlNull");
function nt(e) {
	return e === null;
}
t(nt, "isNull");
var rt = new O("tag:yaml.org,2002:null", {
	kind: "scalar",
	resolve: et,
	construct: tt,
	predicate: nt,
	represent: {
		canonical: /* @__PURE__ */ t(function() {
			return "~";
		}, "canonical"),
		lowercase: /* @__PURE__ */ t(function() {
			return "null";
		}, "lowercase"),
		uppercase: /* @__PURE__ */ t(function() {
			return "NULL";
		}, "uppercase"),
		camelcase: /* @__PURE__ */ t(function() {
			return "Null";
		}, "camelcase"),
		empty: /* @__PURE__ */ t(function() {
			return "";
		}, "empty")
	},
	defaultStyle: "lowercase"
});
function it(e) {
	if (e === null) return !1;
	var t = e.length;
	return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
t(it, "resolveYamlBoolean");
function at(e) {
	return e === "true" || e === "True" || e === "TRUE";
}
t(at, "constructYamlBoolean");
function ot(e) {
	return Object.prototype.toString.call(e) === "[object Boolean]";
}
t(ot, "isBoolean");
var st = new O("tag:yaml.org,2002:bool", {
	kind: "scalar",
	resolve: it,
	construct: at,
	predicate: ot,
	represent: {
		lowercase: /* @__PURE__ */ t(function(e) {
			return e ? "true" : "false";
		}, "lowercase"),
		uppercase: /* @__PURE__ */ t(function(e) {
			return e ? "TRUE" : "FALSE";
		}, "uppercase"),
		camelcase: /* @__PURE__ */ t(function(e) {
			return e ? "True" : "False";
		}, "camelcase")
	},
	defaultStyle: "lowercase"
});
function ct(e) {
	return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
t(ct, "isHexCode");
function lt(e) {
	return 48 <= e && e <= 55;
}
t(lt, "isOctCode");
function ut(e) {
	return 48 <= e && e <= 57;
}
t(ut, "isDecCode");
function dt(e) {
	if (e === null) return !1;
	var t = e.length, n = 0, r = !1, i;
	if (!t) return !1;
	if (i = e[n], (i === "-" || i === "+") && (i = e[++n]), i === "0") {
		if (n + 1 === t) return !0;
		if (i = e[++n], i === "b") {
			for (n++; n < t; n++) if (i = e[n], i !== "_") {
				if (i !== "0" && i !== "1") return !1;
				r = !0;
			}
			return r && i !== "_";
		}
		if (i === "x") {
			for (n++; n < t; n++) if (i = e[n], i !== "_") {
				if (!ct(e.charCodeAt(n))) return !1;
				r = !0;
			}
			return r && i !== "_";
		}
		if (i === "o") {
			for (n++; n < t; n++) if (i = e[n], i !== "_") {
				if (!lt(e.charCodeAt(n))) return !1;
				r = !0;
			}
			return r && i !== "_";
		}
	}
	if (i === "_") return !1;
	for (; n < t; n++) if (i = e[n], i !== "_") {
		if (!ut(e.charCodeAt(n))) return !1;
		r = !0;
	}
	return !(!r || i === "_");
}
t(dt, "resolveYamlInteger");
function ft(e) {
	var t = e, n = 1, r;
	if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), r = t[0], (r === "-" || r === "+") && (r === "-" && (n = -1), t = t.slice(1), r = t[0]), t === "0") return 0;
	if (r === "0") {
		if (t[1] === "b") return n * parseInt(t.slice(2), 2);
		if (t[1] === "x") return n * parseInt(t.slice(2), 16);
		if (t[1] === "o") return n * parseInt(t.slice(2), 8);
	}
	return n * parseInt(t, 10);
}
t(ft, "constructYamlInteger");
function pt(e) {
	return Object.prototype.toString.call(e) === "[object Number]" && e % 1 == 0 && !T.isNegativeZero(e);
}
t(pt, "isInteger");
var mt = new O("tag:yaml.org,2002:int", {
	kind: "scalar",
	resolve: dt,
	construct: ft,
	predicate: pt,
	represent: {
		binary: /* @__PURE__ */ t(function(e) {
			return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
		}, "binary"),
		octal: /* @__PURE__ */ t(function(e) {
			return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
		}, "octal"),
		decimal: /* @__PURE__ */ t(function(e) {
			return e.toString(10);
		}, "decimal"),
		hexadecimal: /* @__PURE__ */ t(function(e) {
			return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
		}, "hexadecimal")
	},
	defaultStyle: "decimal",
	styleAliases: {
		binary: [2, "bin"],
		octal: [8, "oct"],
		decimal: [10, "dec"],
		hexadecimal: [16, "hex"]
	}
}), ht = /* @__PURE__ */ RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
function gt(e) {
	return !(e === null || !ht.test(e) || e[e.length - 1] === "_");
}
t(gt, "resolveYamlFloat");
function _t(e) {
	var t = e.replace(/_/g, "").toLowerCase(), n = t[0] === "-" ? -1 : 1;
	return "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Infinity : -Infinity : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
t(_t, "constructYamlFloat");
var vt = /^[-+]?[0-9]+e/;
function yt(e, t) {
	var n;
	if (isNaN(e)) switch (t) {
		case "lowercase": return ".nan";
		case "uppercase": return ".NAN";
		case "camelcase": return ".NaN";
	}
	else if (e === Infinity) switch (t) {
		case "lowercase": return ".inf";
		case "uppercase": return ".INF";
		case "camelcase": return ".Inf";
	}
	else if (e === -Infinity) switch (t) {
		case "lowercase": return "-.inf";
		case "uppercase": return "-.INF";
		case "camelcase": return "-.Inf";
	}
	else if (T.isNegativeZero(e)) return "-0.0";
	return n = e.toString(10), vt.test(n) ? n.replace("e", ".e") : n;
}
t(yt, "representYamlFloat");
function bt(e) {
	return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 != 0 || T.isNegativeZero(e));
}
t(bt, "isFloat");
var xt = new O("tag:yaml.org,2002:float", {
	kind: "scalar",
	resolve: gt,
	construct: _t,
	predicate: bt,
	represent: yt,
	defaultStyle: "lowercase"
}), St = $e.extend({ implicit: [
	rt,
	st,
	mt,
	xt
] }), Ct = St, wt = /* @__PURE__ */ RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"), Tt = /* @__PURE__ */ RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");
function Et(e) {
	return e === null ? !1 : wt.exec(e) !== null || Tt.exec(e) !== null;
}
t(Et, "resolveYamlTimestamp");
function Dt(e) {
	var t, n, r, i, a, o, s, c = 0, l = null, u, d, f;
	if (t = wt.exec(e), t === null && (t = Tt.exec(e)), t === null) throw Error("Date resolve error");
	if (n = +t[1], r = t[2] - 1, i = +t[3], !t[4]) return new Date(Date.UTC(n, r, i));
	if (a = +t[4], o = +t[5], s = +t[6], t[7]) {
		for (c = t[7].slice(0, 3); c.length < 3;) c += "0";
		c = +c;
	}
	return t[9] && (u = +t[10], d = +(t[11] || 0), l = (u * 60 + d) * 6e4, t[9] === "-" && (l = -l)), f = new Date(Date.UTC(n, r, i, a, o, s, c)), l && f.setTime(f.getTime() - l), f;
}
t(Dt, "constructYamlTimestamp");
function Ot(e) {
	return e.toISOString();
}
t(Ot, "representYamlTimestamp");
var kt = new O("tag:yaml.org,2002:timestamp", {
	kind: "scalar",
	resolve: Et,
	construct: Dt,
	instanceOf: Date,
	represent: Ot
});
function At(e) {
	return e === "<<" || e === null;
}
t(At, "resolveYamlMerge");
var jt = new O("tag:yaml.org,2002:merge", {
	kind: "scalar",
	resolve: At
}), Mt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function Nt(e) {
	if (e === null) return !1;
	var t, n, r = 0, i = e.length, a = Mt;
	for (n = 0; n < i; n++) if (t = a.indexOf(e.charAt(n)), !(t > 64)) {
		if (t < 0) return !1;
		r += 6;
	}
	return r % 8 == 0;
}
t(Nt, "resolveYamlBinary");
function Pt(e) {
	var t, n, r = e.replace(/[\r\n=]/g, ""), i = r.length, a = Mt, o = 0, s = [];
	for (t = 0; t < i; t++) t % 4 == 0 && t && (s.push(o >> 16 & 255), s.push(o >> 8 & 255), s.push(o & 255)), o = o << 6 | a.indexOf(r.charAt(t));
	return n = i % 4 * 6, n === 0 ? (s.push(o >> 16 & 255), s.push(o >> 8 & 255), s.push(o & 255)) : n === 18 ? (s.push(o >> 10 & 255), s.push(o >> 2 & 255)) : n === 12 && s.push(o >> 4 & 255), new Uint8Array(s);
}
t(Pt, "constructYamlBinary");
function Ft(e) {
	var t = "", n = 0, r, i, a = e.length, o = Mt;
	for (r = 0; r < a; r++) r % 3 == 0 && r && (t += o[n >> 18 & 63], t += o[n >> 12 & 63], t += o[n >> 6 & 63], t += o[n & 63]), n = (n << 8) + e[r];
	return i = a % 3, i === 0 ? (t += o[n >> 18 & 63], t += o[n >> 12 & 63], t += o[n >> 6 & 63], t += o[n & 63]) : i === 2 ? (t += o[n >> 10 & 63], t += o[n >> 4 & 63], t += o[n << 2 & 63], t += o[64]) : i === 1 && (t += o[n >> 2 & 63], t += o[n << 4 & 63], t += o[64], t += o[64]), t;
}
t(Ft, "representYamlBinary");
function It(e) {
	return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
t(It, "isBinary");
var Lt = new O("tag:yaml.org,2002:binary", {
	kind: "scalar",
	resolve: Nt,
	construct: Pt,
	predicate: It,
	represent: Ft
}), Rt = Object.prototype.hasOwnProperty, zt = Object.prototype.toString;
function Bt(e) {
	if (e === null) return !0;
	var t = [], n, r, i, a, o, s = e;
	for (n = 0, r = s.length; n < r; n += 1) {
		if (i = s[n], o = !1, zt.call(i) !== "[object Object]") return !1;
		for (a in i) if (Rt.call(i, a)) {
			if (!o) o = !0;
			else return !1;
		}
		if (!o) return !1;
		if (t.indexOf(a) === -1) t.push(a);
		else return !1;
	}
	return !0;
}
t(Bt, "resolveYamlOmap");
function Vt(e) {
	return e === null ? [] : e;
}
t(Vt, "constructYamlOmap");
var Ht = new O("tag:yaml.org,2002:omap", {
	kind: "sequence",
	resolve: Bt,
	construct: Vt
}), Ut = Object.prototype.toString;
function Wt(e) {
	if (e === null) return !0;
	var t, n, r, i, a, o = e;
	for (a = Array(o.length), t = 0, n = o.length; t < n; t += 1) {
		if (r = o[t], Ut.call(r) !== "[object Object]" || (i = Object.keys(r), i.length !== 1)) return !1;
		a[t] = [i[0], r[i[0]]];
	}
	return !0;
}
t(Wt, "resolveYamlPairs");
function Gt(e) {
	if (e === null) return [];
	var t, n, r, i, a, o = e;
	for (a = Array(o.length), t = 0, n = o.length; t < n; t += 1) r = o[t], i = Object.keys(r), a[t] = [i[0], r[i[0]]];
	return a;
}
t(Gt, "constructYamlPairs");
var Kt = new O("tag:yaml.org,2002:pairs", {
	kind: "sequence",
	resolve: Wt,
	construct: Gt
}), qt = Object.prototype.hasOwnProperty;
function Jt(e) {
	if (e === null) return !0;
	var t, n = e;
	for (t in n) if (qt.call(n, t) && n[t] !== null) return !1;
	return !0;
}
t(Jt, "resolveYamlSet");
function Yt(e) {
	return e === null ? {} : e;
}
t(Yt, "constructYamlSet");
var Xt = new O("tag:yaml.org,2002:set", {
	kind: "mapping",
	resolve: Jt,
	construct: Yt
}), Zt = Ct.extend({
	implicit: [kt, jt],
	explicit: [
		Lt,
		Ht,
		Kt,
		Xt
	]
}), k = Object.prototype.hasOwnProperty, Qt = 1, $t = 2, en = 3, tn = 4, nn = 1, rn = 2, an = 3, on = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, sn = /[\x85\u2028\u2029]/, cn = /[,\[\]\{\}]/, ln = /^(?:!|!!|![a-z\-]+!)$/i, un = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function dn(e) {
	return Object.prototype.toString.call(e);
}
t(dn, "_class");
function A(e) {
	return e === 10 || e === 13;
}
t(A, "is_EOL");
function j(e) {
	return e === 9 || e === 32;
}
t(j, "is_WHITE_SPACE");
function M(e) {
	return e === 9 || e === 32 || e === 10 || e === 13;
}
t(M, "is_WS_OR_EOL");
function N(e) {
	return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
t(N, "is_FLOW_INDICATOR");
function fn(e) {
	var t;
	return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
t(fn, "fromHexCode");
function pn(e) {
	return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
t(pn, "escapedHexLen");
function mn(e) {
	return 48 <= e && e <= 57 ? e - 48 : -1;
}
t(mn, "fromDecimalCode");
function hn(e) {
	return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? "\n" : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? "\"" : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? "\xA0" : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
t(hn, "simpleEscapeSequence");
function gn(e) {
	return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode((e - 65536 >> 10) + 55296, (e - 65536 & 1023) + 56320);
}
t(gn, "charFromCodepoint");
function _n(e, t, n) {
	t === "__proto__" ? Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !0,
		writable: !0,
		value: n
	}) : e[t] = n;
}
t(_n, "setProperty");
var vn = Array(256), yn = Array(256);
for (P = 0; P < 256; P++) vn[P] = +!!hn(P), yn[P] = hn(P);
var P;
function bn(e, t) {
	this.input = e, this.filename = t.filename || null, this.schema = t.schema || Zt, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
t(bn, "State$1");
function xn(e, t) {
	var n = {
		name: e.filename,
		buffer: e.input.slice(0, -1),
		position: e.position,
		line: e.line,
		column: e.position - e.lineStart
	};
	return n.snippet = Ge(n), new D(t, n);
}
t(xn, "generateError");
function F(e, t) {
	throw xn(e, t);
}
t(F, "throwError");
function Sn(e, t) {
	e.onWarning && e.onWarning.call(null, xn(e, t));
}
t(Sn, "throwWarning");
var Cn = {
	YAML: /* @__PURE__ */ t(function(e, t, n) {
		var r, i, a;
		e.version !== null && F(e, "duplication of %YAML directive"), n.length !== 1 && F(e, "YAML directive accepts exactly one argument"), r = /^([0-9]+)\.([0-9]+)$/.exec(n[0]), r === null && F(e, "ill-formed argument of the YAML directive"), i = parseInt(r[1], 10), a = parseInt(r[2], 10), i !== 1 && F(e, "unacceptable YAML version of the document"), e.version = n[0], e.checkLineBreaks = a < 2, a !== 1 && a !== 2 && Sn(e, "unsupported YAML version of the document");
	}, "handleYamlDirective"),
	TAG: /* @__PURE__ */ t(function(e, t, n) {
		var r, i;
		n.length !== 2 && F(e, "TAG directive accepts exactly two arguments"), r = n[0], i = n[1], ln.test(r) || F(e, "ill-formed tag handle (first argument) of the TAG directive"), k.call(e.tagMap, r) && F(e, "there is a previously declared suffix for \"" + r + "\" tag handle"), un.test(i) || F(e, "ill-formed tag prefix (second argument) of the TAG directive");
		try {
			i = decodeURIComponent(i);
		} catch {
			F(e, "tag prefix is malformed: " + i);
		}
		e.tagMap[r] = i;
	}, "handleTagDirective")
};
function I(e, t, n, r) {
	var i, a, o, s;
	if (t < n) {
		if (s = e.input.slice(t, n), r) for (i = 0, a = s.length; i < a; i += 1) o = s.charCodeAt(i), o === 9 || 32 <= o && o <= 1114111 || F(e, "expected valid JSON character");
		else on.test(s) && F(e, "the stream contains non-printable characters");
		e.result += s;
	}
}
t(I, "captureSegment");
function wn(e, t, n, r) {
	var i, a, o, s;
	for (T.isObject(n) || F(e, "cannot merge mappings; the provided source object is unacceptable"), i = Object.keys(n), o = 0, s = i.length; o < s; o += 1) a = i[o], k.call(t, a) || (_n(t, a, n[a]), r[a] = !0);
}
t(wn, "mergeMappings");
function L(e, t, n, r, i, a, o, s, c) {
	var l, u;
	if (Array.isArray(i)) for (i = Array.prototype.slice.call(i), l = 0, u = i.length; l < u; l += 1) Array.isArray(i[l]) && F(e, "nested arrays are not supported inside keys"), typeof i == "object" && dn(i[l]) === "[object Object]" && (i[l] = "[object Object]");
	if (typeof i == "object" && dn(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), r === "tag:yaml.org,2002:merge") {
		if (Array.isArray(a)) for (l = 0, u = a.length; l < u; l += 1) wn(e, t, a[l], n);
		else wn(e, t, a, n);
	} else !e.json && !k.call(n, i) && k.call(t, i) && (e.line = o || e.line, e.lineStart = s || e.lineStart, e.position = c || e.position, F(e, "duplicated mapping key")), _n(t, i, a), delete n[i];
	return t;
}
t(L, "storeMappingPair");
function Tn(e) {
	var t = e.input.charCodeAt(e.position);
	t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : F(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
t(Tn, "readLineBreak");
function R(e, t, n) {
	for (var r = 0, i = e.input.charCodeAt(e.position); i !== 0;) {
		for (; j(i);) i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
		if (t && i === 35) do
			i = e.input.charCodeAt(++e.position);
		while (i !== 10 && i !== 13 && i !== 0);
		if (A(i)) for (Tn(e), i = e.input.charCodeAt(e.position), r++, e.lineIndent = 0; i === 32;) e.lineIndent++, i = e.input.charCodeAt(++e.position);
		else break;
	}
	return n !== -1 && r !== 0 && e.lineIndent < n && Sn(e, "deficient indentation"), r;
}
t(R, "skipSeparationSpace");
function En(e) {
	var t = e.position, n = e.input.charCodeAt(t);
	return !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || M(n)));
}
t(En, "testDocumentSeparator");
function Dn(e, t) {
	t === 1 ? e.result += " " : t > 1 && (e.result += T.repeat("\n", t - 1));
}
t(Dn, "writeFoldedLines");
function On(e, t, n) {
	var r, i, a, o, s, c, l, u, d = e.kind, f = e.result, p = e.input.charCodeAt(e.position);
	if (M(p) || N(p) || p === 35 || p === 38 || p === 42 || p === 33 || p === 124 || p === 62 || p === 39 || p === 34 || p === 37 || p === 64 || p === 96 || (p === 63 || p === 45) && (i = e.input.charCodeAt(e.position + 1), M(i) || n && N(i))) return !1;
	for (e.kind = "scalar", e.result = "", a = o = e.position, s = !1; p !== 0;) {
		if (p === 58) {
			if (i = e.input.charCodeAt(e.position + 1), M(i) || n && N(i)) break;
		} else if (p === 35) {
			if (r = e.input.charCodeAt(e.position - 1), M(r)) break;
		} else if (e.position === e.lineStart && En(e) || n && N(p)) break;
		else if (A(p)) {
			if (c = e.line, l = e.lineStart, u = e.lineIndent, R(e, !1, -1), e.lineIndent >= t) {
				s = !0, p = e.input.charCodeAt(e.position);
				continue;
			}
			e.position = o, e.line = c, e.lineStart = l, e.lineIndent = u;
			break;
		}
		s &&= (I(e, a, o, !1), Dn(e, e.line - c), a = o = e.position, !1), j(p) || (o = e.position + 1), p = e.input.charCodeAt(++e.position);
	}
	return I(e, a, o, !1), e.result ? !0 : (e.kind = d, e.result = f, !1);
}
t(On, "readPlainScalar");
function kn(e, t) {
	var n = e.input.charCodeAt(e.position), r, i;
	if (n !== 39) return !1;
	for (e.kind = "scalar", e.result = "", e.position++, r = i = e.position; (n = e.input.charCodeAt(e.position)) !== 0;) if (n === 39) {
		if (I(e, r, e.position, !0), n = e.input.charCodeAt(++e.position), n === 39) r = e.position, e.position++, i = e.position;
		else return !0;
	} else A(n) ? (I(e, r, i, !0), Dn(e, R(e, !1, t)), r = i = e.position) : e.position === e.lineStart && En(e) ? F(e, "unexpected end of the document within a single quoted scalar") : (e.position++, i = e.position);
	F(e, "unexpected end of the stream within a single quoted scalar");
}
t(kn, "readSingleQuotedScalar");
function An(e, t) {
	var n, r, i, a, o, s = e.input.charCodeAt(e.position);
	if (s !== 34) return !1;
	for (e.kind = "scalar", e.result = "", e.position++, n = r = e.position; (s = e.input.charCodeAt(e.position)) !== 0;) if (s === 34) return I(e, n, e.position, !0), e.position++, !0;
	else if (s === 92) {
		if (I(e, n, e.position, !0), s = e.input.charCodeAt(++e.position), A(s)) R(e, !1, t);
		else if (s < 256 && vn[s]) e.result += yn[s], e.position++;
		else if ((o = pn(s)) > 0) {
			for (i = o, a = 0; i > 0; i--) s = e.input.charCodeAt(++e.position), (o = fn(s)) >= 0 ? a = (a << 4) + o : F(e, "expected hexadecimal character");
			e.result += gn(a), e.position++;
		} else F(e, "unknown escape sequence");
		n = r = e.position;
	} else A(s) ? (I(e, n, r, !0), Dn(e, R(e, !1, t)), n = r = e.position) : e.position === e.lineStart && En(e) ? F(e, "unexpected end of the document within a double quoted scalar") : (e.position++, r = e.position);
	F(e, "unexpected end of the stream within a double quoted scalar");
}
t(An, "readDoubleQuotedScalar");
function jn(e, t) {
	var n = !0, r, i, a, o = e.tag, s, c = e.anchor, l, u, d, f, p, m = /* @__PURE__ */ Object.create(null), h, g, _, v = e.input.charCodeAt(e.position);
	if (v === 91) u = 93, p = !1, s = [];
	else if (v === 123) u = 125, p = !0, s = {};
	else return !1;
	for (e.anchor !== null && (e.anchorMap[e.anchor] = s), v = e.input.charCodeAt(++e.position); v !== 0;) {
		if (R(e, !0, t), v = e.input.charCodeAt(e.position), v === u) return e.position++, e.tag = o, e.anchor = c, e.kind = p ? "mapping" : "sequence", e.result = s, !0;
		n ? v === 44 && F(e, "expected the node content, but found ','") : F(e, "missed comma between flow collection entries"), g = h = _ = null, d = f = !1, v === 63 && (l = e.input.charCodeAt(e.position + 1), M(l) && (d = f = !0, e.position++, R(e, !0, t))), r = e.line, i = e.lineStart, a = e.position, z(e, t, Qt, !1, !0), g = e.tag, h = e.result, R(e, !0, t), v = e.input.charCodeAt(e.position), (f || e.line === r) && v === 58 && (d = !0, v = e.input.charCodeAt(++e.position), R(e, !0, t), z(e, t, Qt, !1, !0), _ = e.result), p ? L(e, s, m, g, h, _, r, i, a) : d ? s.push(L(e, null, m, g, h, _, r, i, a)) : s.push(h), R(e, !0, t), v = e.input.charCodeAt(e.position), v === 44 ? (n = !0, v = e.input.charCodeAt(++e.position)) : n = !1;
	}
	F(e, "unexpected end of the stream within a flow collection");
}
t(jn, "readFlowCollection");
function Mn(e, t) {
	var n, r, i = nn, a = !1, o = !1, s = t, c = 0, l = !1, u, d = e.input.charCodeAt(e.position);
	if (d === 124) r = !1;
	else if (d === 62) r = !0;
	else return !1;
	for (e.kind = "scalar", e.result = ""; d !== 0;) if (d = e.input.charCodeAt(++e.position), d === 43 || d === 45) nn === i ? i = d === 43 ? an : rn : F(e, "repeat of a chomping mode identifier");
	else if ((u = mn(d)) >= 0) u === 0 ? F(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : o ? F(e, "repeat of an indentation width identifier") : (s = t + u - 1, o = !0);
	else break;
	if (j(d)) {
		do
			d = e.input.charCodeAt(++e.position);
		while (j(d));
		if (d === 35) do
			d = e.input.charCodeAt(++e.position);
		while (!A(d) && d !== 0);
	}
	for (; d !== 0;) {
		for (Tn(e), e.lineIndent = 0, d = e.input.charCodeAt(e.position); (!o || e.lineIndent < s) && d === 32;) e.lineIndent++, d = e.input.charCodeAt(++e.position);
		if (!o && e.lineIndent > s && (s = e.lineIndent), A(d)) {
			c++;
			continue;
		}
		if (e.lineIndent < s) {
			i === an ? e.result += T.repeat("\n", a ? 1 + c : c) : i === nn && a && (e.result += "\n");
			break;
		}
		for (r ? j(d) ? (l = !0, e.result += T.repeat("\n", a ? 1 + c : c)) : l ? (l = !1, e.result += T.repeat("\n", c + 1)) : c === 0 ? a && (e.result += " ") : e.result += T.repeat("\n", c) : e.result += T.repeat("\n", a ? 1 + c : c), a = !0, o = !0, c = 0, n = e.position; !A(d) && d !== 0;) d = e.input.charCodeAt(++e.position);
		I(e, n, e.position, !1);
	}
	return !0;
}
t(Mn, "readBlockScalar");
function Nn(e, t) {
	var n, r = e.tag, i = e.anchor, a = [], o, s = !1, c;
	if (e.firstTabInLine !== -1) return !1;
	for (e.anchor !== null && (e.anchorMap[e.anchor] = a), c = e.input.charCodeAt(e.position); c !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, F(e, "tab characters must not be used in indentation")), !(c !== 45 || (o = e.input.charCodeAt(e.position + 1), !M(o))));) {
		if (s = !0, e.position++, R(e, !0, -1) && e.lineIndent <= t) {
			a.push(null), c = e.input.charCodeAt(e.position);
			continue;
		}
		if (n = e.line, z(e, t, en, !1, !0), a.push(e.result), R(e, !0, -1), c = e.input.charCodeAt(e.position), (e.line === n || e.lineIndent > t) && c !== 0) F(e, "bad indentation of a sequence entry");
		else if (e.lineIndent < t) break;
	}
	return s ? (e.tag = r, e.anchor = i, e.kind = "sequence", e.result = a, !0) : !1;
}
t(Nn, "readBlockSequence");
function Pn(e, t, n) {
	var r, i, a, o, s, c, l = e.tag, u = e.anchor, d = {}, f = /* @__PURE__ */ Object.create(null), p = null, m = null, h = null, g = !1, _ = !1, v;
	if (e.firstTabInLine !== -1) return !1;
	for (e.anchor !== null && (e.anchorMap[e.anchor] = d), v = e.input.charCodeAt(e.position); v !== 0;) {
		if (!g && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, F(e, "tab characters must not be used in indentation")), r = e.input.charCodeAt(e.position + 1), a = e.line, (v === 63 || v === 58) && M(r)) v === 63 ? (g && (L(e, d, f, p, m, null, o, s, c), p = m = h = null), _ = !0, g = !0, i = !0) : g ? (g = !1, i = !0) : F(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, v = r;
		else {
			if (o = e.line, s = e.lineStart, c = e.position, !z(e, n, $t, !1, !0)) break;
			if (e.line === a) {
				for (v = e.input.charCodeAt(e.position); j(v);) v = e.input.charCodeAt(++e.position);
				if (v === 58) v = e.input.charCodeAt(++e.position), M(v) || F(e, "a whitespace character is expected after the key-value separator within a block mapping"), g && (L(e, d, f, p, m, null, o, s, c), p = m = h = null), _ = !0, g = !1, i = !1, p = e.tag, m = e.result;
				else if (_) F(e, "can not read an implicit mapping pair; a colon is missed");
				else return e.tag = l, e.anchor = u, !0;
			} else if (_) F(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
			else return e.tag = l, e.anchor = u, !0;
		}
		if ((e.line === a || e.lineIndent > t) && (g && (o = e.line, s = e.lineStart, c = e.position), z(e, t, tn, !0, i) && (g ? m = e.result : h = e.result), g || (L(e, d, f, p, m, h, o, s, c), p = m = h = null), R(e, !0, -1), v = e.input.charCodeAt(e.position)), (e.line === a || e.lineIndent > t) && v !== 0) F(e, "bad indentation of a mapping entry");
		else if (e.lineIndent < t) break;
	}
	return g && L(e, d, f, p, m, null, o, s, c), _ && (e.tag = l, e.anchor = u, e.kind = "mapping", e.result = d), _;
}
t(Pn, "readBlockMapping");
function Fn(e) {
	var t, n = !1, r = !1, i, a, o = e.input.charCodeAt(e.position);
	if (o !== 33) return !1;
	if (e.tag !== null && F(e, "duplication of a tag property"), o = e.input.charCodeAt(++e.position), o === 60 ? (n = !0, o = e.input.charCodeAt(++e.position)) : o === 33 ? (r = !0, i = "!!", o = e.input.charCodeAt(++e.position)) : i = "!", t = e.position, n) {
		do
			o = e.input.charCodeAt(++e.position);
		while (o !== 0 && o !== 62);
		e.position < e.length ? (a = e.input.slice(t, e.position), o = e.input.charCodeAt(++e.position)) : F(e, "unexpected end of the stream within a verbatim tag");
	} else {
		for (; o !== 0 && !M(o);) o === 33 && (r ? F(e, "tag suffix cannot contain exclamation marks") : (i = e.input.slice(t - 1, e.position + 1), ln.test(i) || F(e, "named tag handle cannot contain such characters"), r = !0, t = e.position + 1)), o = e.input.charCodeAt(++e.position);
		a = e.input.slice(t, e.position), cn.test(a) && F(e, "tag suffix cannot contain flow indicator characters");
	}
	a && !un.test(a) && F(e, "tag name cannot contain such characters: " + a);
	try {
		a = decodeURIComponent(a);
	} catch {
		F(e, "tag name is malformed: " + a);
	}
	return n ? e.tag = a : k.call(e.tagMap, i) ? e.tag = e.tagMap[i] + a : i === "!" ? e.tag = "!" + a : i === "!!" ? e.tag = "tag:yaml.org,2002:" + a : F(e, "undeclared tag handle \"" + i + "\""), !0;
}
t(Fn, "readTagProperty");
function In(e) {
	var t, n = e.input.charCodeAt(e.position);
	if (n !== 38) return !1;
	for (e.anchor !== null && F(e, "duplication of an anchor property"), n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !M(n) && !N(n);) n = e.input.charCodeAt(++e.position);
	return e.position === t && F(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
t(In, "readAnchorProperty");
function Ln(e) {
	var t, n, r = e.input.charCodeAt(e.position);
	if (r !== 42) return !1;
	for (r = e.input.charCodeAt(++e.position), t = e.position; r !== 0 && !M(r) && !N(r);) r = e.input.charCodeAt(++e.position);
	return e.position === t && F(e, "name of an alias node must contain at least one character"), n = e.input.slice(t, e.position), k.call(e.anchorMap, n) || F(e, "unidentified alias \"" + n + "\""), e.result = e.anchorMap[n], R(e, !0, -1), !0;
}
t(Ln, "readAlias");
function z(e, t, n, r, i) {
	var a, o, s, c = 1, l = !1, u = !1, d, f, p, m, h, g;
	if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, a = o = s = tn === n || en === n, r && R(e, !0, -1) && (l = !0, e.lineIndent > t ? c = 1 : e.lineIndent === t ? c = 0 : e.lineIndent < t && (c = -1)), c === 1) for (; Fn(e) || In(e);) R(e, !0, -1) ? (l = !0, s = a, e.lineIndent > t ? c = 1 : e.lineIndent === t ? c = 0 : e.lineIndent < t && (c = -1)) : s = !1;
	if (s &&= l || i, (c === 1 || tn === n) && (h = Qt === n || $t === n ? t : t + 1, g = e.position - e.lineStart, c === 1 ? s && (Nn(e, g) || Pn(e, g, h)) || jn(e, h) ? u = !0 : (o && Mn(e, h) || kn(e, h) || An(e, h) ? u = !0 : Ln(e) ? (u = !0, (e.tag !== null || e.anchor !== null) && F(e, "alias node should not have any properties")) : On(e, h, Qt === n) && (u = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : c === 0 && (u = s && Nn(e, g))), e.tag === null) e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
	else if (e.tag === "?") {
		for (e.result !== null && e.kind !== "scalar" && F(e, "unacceptable node kind for !<?> tag; it should be \"scalar\", not \"" + e.kind + "\""), d = 0, f = e.implicitTypes.length; d < f; d += 1) if (m = e.implicitTypes[d], m.resolve(e.result)) {
			e.result = m.construct(e.result), e.tag = m.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
			break;
		}
	} else if (e.tag !== "!") {
		if (k.call(e.typeMap[e.kind || "fallback"], e.tag)) m = e.typeMap[e.kind || "fallback"][e.tag];
		else for (m = null, p = e.typeMap.multi[e.kind || "fallback"], d = 0, f = p.length; d < f; d += 1) if (e.tag.slice(0, p[d].tag.length) === p[d].tag) {
			m = p[d];
			break;
		}
		m || F(e, "unknown tag !<" + e.tag + ">"), e.result !== null && m.kind !== e.kind && F(e, "unacceptable node kind for !<" + e.tag + "> tag; it should be \"" + m.kind + "\", not \"" + e.kind + "\""), m.resolve(e.result, e.tag) ? (e.result = m.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : F(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
	}
	return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || u;
}
t(z, "composeNode");
function Rn(e) {
	var t = e.position, n, r, i, a = !1, o;
	for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (o = e.input.charCodeAt(e.position)) !== 0 && (R(e, !0, -1), o = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || o !== 37));) {
		for (a = !0, o = e.input.charCodeAt(++e.position), n = e.position; o !== 0 && !M(o);) o = e.input.charCodeAt(++e.position);
		for (r = e.input.slice(n, e.position), i = [], r.length < 1 && F(e, "directive name must not be less than one character in length"); o !== 0;) {
			for (; j(o);) o = e.input.charCodeAt(++e.position);
			if (o === 35) {
				do
					o = e.input.charCodeAt(++e.position);
				while (o !== 0 && !A(o));
				break;
			}
			if (A(o)) break;
			for (n = e.position; o !== 0 && !M(o);) o = e.input.charCodeAt(++e.position);
			i.push(e.input.slice(n, e.position));
		}
		o !== 0 && Tn(e), k.call(Cn, r) ? Cn[r](e, r, i) : Sn(e, "unknown document directive \"" + r + "\"");
	}
	if (R(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, R(e, !0, -1)) : a && F(e, "directives end mark is expected"), z(e, e.lineIndent - 1, tn, !1, !0), R(e, !0, -1), e.checkLineBreaks && sn.test(e.input.slice(t, e.position)) && Sn(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && En(e)) {
		e.input.charCodeAt(e.position) === 46 && (e.position += 3, R(e, !0, -1));
		return;
	}
	if (e.position < e.length - 1) F(e, "end of the stream or a document separator is expected");
	else return;
}
t(Rn, "readDocument");
function zn(e, t) {
	e = String(e), t ||= {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += "\n"), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
	var n = new bn(e, t), r = e.indexOf("\0");
	for (r !== -1 && (n.position = r, F(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32;) n.lineIndent += 1, n.position += 1;
	for (; n.position < n.length - 1;) Rn(n);
	return n.documents;
}
t(zn, "loadDocuments");
function Bn(e, t, n) {
	typeof t == "object" && t && n === void 0 && (n = t, t = null);
	var r = zn(e, n);
	if (typeof t != "function") return r;
	for (var i = 0, a = r.length; i < a; i += 1) t(r[i]);
}
t(Bn, "loadAll$1");
function Vn(e, t) {
	var n = zn(e, t);
	if (n.length !== 0) {
		if (n.length === 1) return n[0];
		throw new D("expected a single document in the stream, but found more");
	}
}
t(Vn, "load$1");
var Hn = {
	loadAll: Bn,
	load: Vn
}, Un = Object.prototype.toString, Wn = Object.prototype.hasOwnProperty, Gn = 65279, Kn = 9, qn = 10, Jn = 13, Yn = 32, Xn = 33, Zn = 34, Qn = 35, $n = 37, er = 38, tr = 39, nr = 42, rr = 44, ir = 45, ar = 58, or = 61, sr = 62, cr = 63, lr = 64, ur = 91, dr = 93, fr = 96, pr = 123, mr = 124, hr = 125, B = {};
B[0] = "\\0", B[7] = "\\a", B[8] = "\\b", B[9] = "\\t", B[10] = "\\n", B[11] = "\\v", B[12] = "\\f", B[13] = "\\r", B[27] = "\\e", B[34] = "\\\"", B[92] = "\\\\", B[133] = "\\N", B[160] = "\\_", B[8232] = "\\L", B[8233] = "\\P";
var gr = [
	"y",
	"Y",
	"yes",
	"Yes",
	"YES",
	"on",
	"On",
	"ON",
	"n",
	"N",
	"no",
	"No",
	"NO",
	"off",
	"Off",
	"OFF"
], _r = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function vr(e, t) {
	var n, r, i, a, o, s, c;
	if (t === null) return {};
	for (n = {}, r = Object.keys(t), i = 0, a = r.length; i < a; i += 1) o = r[i], s = String(t[o]), o.slice(0, 2) === "!!" && (o = "tag:yaml.org,2002:" + o.slice(2)), c = e.compiledTypeMap.fallback[o], c && Wn.call(c.styleAliases, s) && (s = c.styleAliases[s]), n[o] = s;
	return n;
}
t(vr, "compileStyleMap");
function yr(e) {
	var t = e.toString(16).toUpperCase(), n, r;
	if (e <= 255) n = "x", r = 2;
	else if (e <= 65535) n = "u", r = 4;
	else if (e <= 4294967295) n = "U", r = 8;
	else throw new D("code point within a string may not be greater than 0xFFFFFFFF");
	return "\\" + n + T.repeat("0", r - t.length) + t;
}
t(yr, "encodeHex");
var br = 1, xr = 2;
function Sr(e) {
	this.schema = e.schema || Zt, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = T.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = vr(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === "\"" ? xr : br, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
t(Sr, "State");
function Cr(e, t) {
	for (var n = T.repeat(" ", t), r = 0, i = -1, a = "", o, s = e.length; r < s;) i = e.indexOf("\n", r), i === -1 ? (o = e.slice(r), r = s) : (o = e.slice(r, i + 1), r = i + 1), o.length && o !== "\n" && (a += n), a += o;
	return a;
}
t(Cr, "indentString");
function wr(e, t) {
	return "\n" + T.repeat(" ", e.indent * t);
}
t(wr, "generateNextLine");
function Tr(e, t) {
	var n, r, i;
	for (n = 0, r = e.implicitTypes.length; n < r; n += 1) if (i = e.implicitTypes[n], i.resolve(t)) return !0;
	return !1;
}
t(Tr, "testImplicitResolving");
function Er(e) {
	return e === Yn || e === Kn;
}
t(Er, "isWhitespace");
function V(e) {
	return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && e !== 8232 && e !== 8233 || 57344 <= e && e <= 65533 && e !== Gn || 65536 <= e && e <= 1114111;
}
t(V, "isPrintable");
function Dr(e) {
	return V(e) && e !== Gn && e !== Jn && e !== qn;
}
t(Dr, "isNsCharOrWhitespace");
function Or(e, t, n) {
	var r = Dr(e), i = r && !Er(e);
	return (n ? r : r && e !== rr && e !== ur && e !== dr && e !== pr && e !== hr) && e !== Qn && !(t === ar && !i) || Dr(t) && !Er(t) && e === Qn || t === ar && i;
}
t(Or, "isPlainSafe");
function kr(e) {
	return V(e) && e !== Gn && !Er(e) && e !== ir && e !== cr && e !== ar && e !== rr && e !== ur && e !== dr && e !== pr && e !== hr && e !== Qn && e !== er && e !== nr && e !== Xn && e !== mr && e !== or && e !== sr && e !== tr && e !== Zn && e !== $n && e !== lr && e !== fr;
}
t(kr, "isPlainSafeFirst");
function Ar(e) {
	return !Er(e) && e !== ar;
}
t(Ar, "isPlainSafeLast");
function H(e, t) {
	var n = e.charCodeAt(t), r;
	return n >= 55296 && n <= 56319 && t + 1 < e.length && (r = e.charCodeAt(t + 1), r >= 56320 && r <= 57343) ? (n - 55296) * 1024 + r - 56320 + 65536 : n;
}
t(H, "codePointAt");
function jr(e) {
	return /^\n* /.test(e);
}
t(jr, "needIndentIndicator");
var Mr = 1, Nr = 2, Pr = 3, Fr = 4, U = 5;
function Ir(e, t, n, r, i, a, o, s) {
	var c, l = 0, u = null, d = !1, f = !1, p = r !== -1, m = -1, h = kr(H(e, 0)) && Ar(H(e, e.length - 1));
	if (t || o) for (c = 0; c < e.length; l >= 65536 ? c += 2 : c++) {
		if (l = H(e, c), !V(l)) return U;
		h &&= Or(l, u, s), u = l;
	}
	else {
		for (c = 0; c < e.length; l >= 65536 ? c += 2 : c++) {
			if (l = H(e, c), l === qn) d = !0, p && (f ||= c - m - 1 > r && e[m + 1] !== " ", m = c);
			else if (!V(l)) return U;
			h &&= Or(l, u, s), u = l;
		}
		f ||= p && c - m - 1 > r && e[m + 1] !== " ";
	}
	return !d && !f ? h && !o && !i(e) ? Mr : a === xr ? U : Nr : n > 9 && jr(e) ? U : o ? a === xr ? U : Nr : f ? Fr : Pr;
}
t(Ir, "chooseScalarStyle");
function Lr(e, n, r, i, a) {
	e.dump = (function() {
		if (n.length === 0) return e.quotingType === xr ? "\"\"" : "''";
		if (!e.noCompatMode && (gr.indexOf(n) !== -1 || _r.test(n))) return e.quotingType === xr ? "\"" + n + "\"" : "'" + n + "'";
		var o = e.indent * Math.max(1, r), s = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o), c = i || e.flowLevel > -1 && r >= e.flowLevel;
		function l(t) {
			return Tr(e, t);
		}
		switch (t(l, "testAmbiguity"), Ir(n, c, e.indent, s, l, e.quotingType, e.forceQuotes && !i, a)) {
			case Mr: return n;
			case Nr: return "'" + n.replace(/'/g, "''") + "'";
			case Pr: return "|" + Rr(n, e.indent) + zr(Cr(n, o));
			case Fr: return ">" + Rr(n, e.indent) + zr(Cr(Br(n, s), o));
			case U: return "\"" + Hr(n) + "\"";
			default: throw new D("impossible error: invalid scalar style");
		}
	})();
}
t(Lr, "writeScalar");
function Rr(e, t) {
	var n = jr(e) ? String(t) : "", r = e[e.length - 1] === "\n";
	return n + (r && (e[e.length - 2] === "\n" || e === "\n") ? "+" : r ? "" : "-") + "\n";
}
t(Rr, "blockHeader");
function zr(e) {
	return e[e.length - 1] === "\n" ? e.slice(0, -1) : e;
}
t(zr, "dropEndingNewline");
function Br(e, t) {
	for (var n = /(\n+)([^\n]*)/g, r = (function() {
		var r = e.indexOf("\n");
		return r = r === -1 ? e.length : r, n.lastIndex = r, Vr(e.slice(0, r), t);
	})(), i = e[0] === "\n" || e[0] === " ", a, o; o = n.exec(e);) {
		var s = o[1], c = o[2];
		a = c[0] === " ", r += s + (!i && !a && c !== "" ? "\n" : "") + Vr(c, t), i = a;
	}
	return r;
}
t(Br, "foldString");
function Vr(e, t) {
	if (e === "" || e[0] === " ") return e;
	for (var n = / [^ ]/g, r, i = 0, a, o = 0, s = 0, c = ""; r = n.exec(e);) s = r.index, s - i > t && (a = o > i ? o : s, c += "\n" + e.slice(i, a), i = a + 1), o = s;
	return c += "\n", e.length - i > t && o > i ? c += e.slice(i, o) + "\n" + e.slice(o + 1) : c += e.slice(i), c.slice(1);
}
t(Vr, "foldLine");
function Hr(e) {
	for (var t = "", n = 0, r, i = 0; i < e.length; n >= 65536 ? i += 2 : i++) n = H(e, i), r = B[n], !r && V(n) ? (t += e[i], n >= 65536 && (t += e[i + 1])) : t += r || yr(n);
	return t;
}
t(Hr, "escapeString");
function Ur(e, t, n) {
	var r = "", i = e.tag, a, o, s;
	for (a = 0, o = n.length; a < o; a += 1) s = n[a], e.replacer && (s = e.replacer.call(n, String(a), s)), (W(e, t, s, !1, !1) || s === void 0 && W(e, t, null, !1, !1)) && (r !== "" && (r += "," + (e.condenseFlow ? "" : " ")), r += e.dump);
	e.tag = i, e.dump = "[" + r + "]";
}
t(Ur, "writeFlowSequence");
function Wr(e, t, n, r) {
	var i = "", a = e.tag, o, s, c;
	for (o = 0, s = n.length; o < s; o += 1) c = n[o], e.replacer && (c = e.replacer.call(n, String(o), c)), (W(e, t + 1, c, !0, !0, !1, !0) || c === void 0 && W(e, t + 1, null, !0, !0, !1, !0)) && ((!r || i !== "") && (i += wr(e, t)), e.dump && qn === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
	e.tag = a, e.dump = i || "[]";
}
t(Wr, "writeBlockSequence");
function Gr(e, t, n) {
	var r = "", i = e.tag, a = Object.keys(n), o, s, c, l, u;
	for (o = 0, s = a.length; o < s; o += 1) u = "", r !== "" && (u += ", "), e.condenseFlow && (u += "\""), c = a[o], l = n[c], e.replacer && (l = e.replacer.call(n, c, l)), W(e, t, c, !1, !1) && (e.dump.length > 1024 && (u += "? "), u += e.dump + (e.condenseFlow ? "\"" : "") + ":" + (e.condenseFlow ? "" : " "), W(e, t, l, !1, !1) && (u += e.dump, r += u));
	e.tag = i, e.dump = "{" + r + "}";
}
t(Gr, "writeFlowMapping");
function Kr(e, t, n, r) {
	var i = "", a = e.tag, o = Object.keys(n), s, c, l, u, d, f;
	if (e.sortKeys === !0) o.sort();
	else if (typeof e.sortKeys == "function") o.sort(e.sortKeys);
	else if (e.sortKeys) throw new D("sortKeys must be a boolean or a function");
	for (s = 0, c = o.length; s < c; s += 1) f = "", (!r || i !== "") && (f += wr(e, t)), l = o[s], u = n[l], e.replacer && (u = e.replacer.call(n, l, u)), W(e, t + 1, l, !0, !0, !0) && (d = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024, d && (e.dump && qn === e.dump.charCodeAt(0) ? f += "?" : f += "? "), f += e.dump, d && (f += wr(e, t)), W(e, t + 1, u, !0, d) && (e.dump && qn === e.dump.charCodeAt(0) ? f += ":" : f += ": ", f += e.dump, i += f));
	e.tag = a, e.dump = i || "{}";
}
t(Kr, "writeBlockMapping");
function qr(e, t, n) {
	var r, i = n ? e.explicitTypes : e.implicitTypes, a, o, s, c;
	for (a = 0, o = i.length; a < o; a += 1) if (s = i[a], (s.instanceOf || s.predicate) && (!s.instanceOf || typeof t == "object" && t instanceof s.instanceOf) && (!s.predicate || s.predicate(t))) {
		if (e.tag = n ? s.multi && s.representName ? s.representName(t) : s.tag : "?", s.represent) {
			if (c = e.styleMap[s.tag] || s.defaultStyle, Un.call(s.represent) === "[object Function]") r = s.represent(t, c);
			else if (Wn.call(s.represent, c)) r = s.represent[c](t, c);
			else throw new D("!<" + s.tag + "> tag resolver accepts not \"" + c + "\" style");
			e.dump = r;
		}
		return !0;
	}
	return !1;
}
t(qr, "detectType");
function W(e, t, n, r, i, a, o) {
	e.tag = null, e.dump = n, qr(e, n, !1) || qr(e, n, !0);
	var s = Un.call(e.dump), c = r, l;
	r &&= e.flowLevel < 0 || e.flowLevel > t;
	var u = s === "[object Object]" || s === "[object Array]", d, f;
	if (u && (d = e.duplicates.indexOf(n), f = d !== -1), (e.tag !== null && e.tag !== "?" || f || e.indent !== 2 && t > 0) && (i = !1), f && e.usedDuplicates[d]) e.dump = "*ref_" + d;
	else {
		if (u && f && !e.usedDuplicates[d] && (e.usedDuplicates[d] = !0), s === "[object Object]") r && Object.keys(e.dump).length !== 0 ? (Kr(e, t, e.dump, i), f && (e.dump = "&ref_" + d + e.dump)) : (Gr(e, t, e.dump), f && (e.dump = "&ref_" + d + " " + e.dump));
		else if (s === "[object Array]") r && e.dump.length !== 0 ? (e.noArrayIndent && !o && t > 0 ? Wr(e, t - 1, e.dump, i) : Wr(e, t, e.dump, i), f && (e.dump = "&ref_" + d + e.dump)) : (Ur(e, t, e.dump), f && (e.dump = "&ref_" + d + " " + e.dump));
		else if (s === "[object String]") e.tag !== "?" && Lr(e, e.dump, t, a, c);
		else if (s === "[object Undefined]") return !1;
		else {
			if (e.skipInvalid) return !1;
			throw new D("unacceptable kind of an object to dump " + s);
		}
		e.tag !== null && e.tag !== "?" && (l = encodeURI(e.tag[0] === "!" ? e.tag.slice(1) : e.tag).replace(/!/g, "%21"), l = e.tag[0] === "!" ? "!" + l : l.slice(0, 18) === "tag:yaml.org,2002:" ? "!!" + l.slice(18) : "!<" + l + ">", e.dump = l + " " + e.dump);
	}
	return !0;
}
t(W, "writeNode");
function Jr(e, t) {
	var n = [], r = [], i, a;
	for (Yr(e, n, r), i = 0, a = r.length; i < a; i += 1) t.duplicates.push(n[r[i]]);
	t.usedDuplicates = Array(a);
}
t(Jr, "getDuplicateReferences");
function Yr(e, t, n) {
	var r, i, a;
	if (typeof e == "object" && e) {
		if (i = t.indexOf(e), i !== -1) n.indexOf(i) === -1 && n.push(i);
		else if (t.push(e), Array.isArray(e)) for (i = 0, a = e.length; i < a; i += 1) Yr(e[i], t, n);
		else for (r = Object.keys(e), i = 0, a = r.length; i < a; i += 1) Yr(e[r[i]], t, n);
	}
}
t(Yr, "inspectNode");
function Xr(e, t) {
	t ||= {};
	var n = new Sr(t);
	n.noRefs || Jr(e, n);
	var r = e;
	return n.replacer && (r = n.replacer.call({ "": r }, "", r)), W(n, 0, r, !0, !0) ? n.dump + "\n" : "";
}
t(Xr, "dump$1");
var Zr = { dump: Xr };
function Qr(e, t) {
	return function() {
		throw Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
	};
}
t(Qr, "renamed");
var $r = St, ei = Hn.load;
Hn.loadAll, Zr.dump;
//#endregion
//#region node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Enum.js
var ti = "comm", ni = "rule", ri = "decl", ii = "@import", ai = "@namespace", oi = "@keyframes", si = "@layer", ci = Math.abs, li = String.fromCharCode;
function ui(e) {
	return e.trim();
}
function di(e, t, n) {
	return e.replace(t, n);
}
function fi(e, t) {
	return e.charCodeAt(t) | 0;
}
function pi(e, t, n) {
	return e.slice(t, n);
}
function G(e) {
	return e.length;
}
function mi(e) {
	return e.length;
}
function hi(e, t) {
	return t.push(e), e;
}
//#endregion
//#region node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Tokenizer.js
var gi = 1, K = 1, _i = 0, q = 0, J = 0, Y = "";
function vi(e, t, n, r, i, a, o, s) {
	return {
		value: e,
		root: t,
		parent: n,
		type: r,
		props: i,
		children: a,
		line: gi,
		column: K,
		length: o,
		return: "",
		siblings: s
	};
}
function yi() {
	return J;
}
function bi() {
	return J = q > 0 ? fi(Y, --q) : 0, K--, J === 10 && (K = 1, gi--), J;
}
function X() {
	return J = q < _i ? fi(Y, q++) : 0, K++, J === 10 && (K = 1, gi++), J;
}
function Z() {
	return fi(Y, q);
}
function xi() {
	return q;
}
function Si(e, t) {
	return pi(Y, e, t);
}
function Ci(e) {
	switch (e) {
		case 0:
		case 9:
		case 10:
		case 13:
		case 32: return 5;
		case 33:
		case 43:
		case 44:
		case 47:
		case 62:
		case 64:
		case 126:
		case 59:
		case 123:
		case 125: return 4;
		case 58: return 3;
		case 34:
		case 39:
		case 40:
		case 91: return 2;
		case 41:
		case 93: return 1;
	}
	return 0;
}
function wi(e) {
	return gi = K = 1, _i = G(Y = e), q = 0, [];
}
function Ti(e) {
	return Y = "", e;
}
function Ei(e) {
	return ui(Si(q - 1, ki(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function Di(e) {
	for (; (J = Z()) && J < 33;) X();
	return Ci(e) > 2 || Ci(J) > 3 ? "" : " ";
}
function Oi(e, t) {
	for (; --t && X() && !(J < 48 || J > 102 || J > 57 && J < 65 || J > 70 && J < 97););
	return Si(e, xi() + (t < 6 && Z() == 32 && X() == 32));
}
function ki(e) {
	for (; X();) switch (J) {
		case e: return q;
		case 34:
		case 39:
			e !== 34 && e !== 39 && ki(J);
			break;
		case 40:
			e === 41 && ki(e);
			break;
		case 92:
			X();
			break;
	}
	return q;
}
function Ai(e, t) {
	for (; X() && e + J !== 57 && (e + J !== 84 || Z() !== 47););
	return "/*" + Si(t, q - 1) + "*" + li(e === 47 ? e : X());
}
function ji(e) {
	for (; !Ci(Z());) X();
	return Si(e, q);
}
//#endregion
//#region node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Parser.js
function Mi(e) {
	return Ti(Ni("", null, null, null, [""], e = wi(e), 0, [0], e));
}
function Ni(e, t, n, r, i, a, o, s, c) {
	for (var l = 0, u = 0, d = o, f = 0, p = 0, m = 0, h = 1, g = 1, _ = 1, v = 0, y = 0, b = "", ee = i, x = a, S = r, C = b; g;) switch (m = y, y = X()) {
		case 40:
			m != 108 && fi(C, d - 1) == 58 ? (v++, C += "(") : C += Ei(y);
			break;
		case 41:
			v--, C += ")";
			break;
		case 34:
		case 39:
		case 91:
			C += Ei(y);
			break;
		case 9:
		case 10:
		case 13:
		case 32:
			if (v > 0) {
				C += li(y);
				break;
			}
			C += Di(m);
			break;
		case 92:
			C += Oi(xi() - 1, 7);
			continue;
		case 47:
			switch (Z()) {
				case 42:
				case 47:
					hi(Fi(Ai(X(), xi()), t, n, c), c), (Ci(m || 1) == 5 || Ci(Z() || 1) == 5) && G(C) && pi(C, -1, void 0) !== " " && (C += " ");
					break;
				default: C += "/";
			}
			break;
		case 123 * h: s[l++] = G(C) * _;
		case 125 * h:
		case 59:
		case 0:
			if (v > 0 && y) {
				C += li(y);
				break;
			}
			switch (y) {
				case 0:
				case 125: g = 0;
				case 59 + u:
					_ == -1 && (C = di(C, /\f/g, "")), p > 0 && (G(C) - d || h === 0) && hi(p > 32 ? Ii(C + ";", r, n, d - 1, c) : Ii(di(C, " ", "") + ";", r, n, d - 2, c), c);
					break;
				case 59: C += ";";
				default: if (hi(S = Pi(C, t, n, l, u, i, s, b, ee = [], x = [], d, a), a), y === 123) {
					if (u === 0) Ni(C, t, S, S, ee, a, d, s, x);
					else {
						switch (f) {
							case 99: if (fi(C, 3) === 110) break;
							case 108: if (fi(C, 2) === 97) break;
							default: u = 0;
							case 100:
							case 109:
							case 115:
						}
						u ? Ni(e, S, S, r && hi(Pi(e, S, S, 0, 0, i, s, b, i, ee = [], d, x), x), i, x, d, s, r ? ee : x) : Ni(C, S, S, S, [""], x, 0, s, x);
					}
				}
			}
			l = u = p = 0, h = _ = 1, b = C = "", d = o;
			break;
		case 58: d = 1 + G(C), p = m;
		default:
			if (h < 1) {
				if (y == 123) --h;
				else if (y == 125 && h++ == 0 && bi() == 125) continue;
			}
			switch (C += li(y), y * h) {
				case 38:
					_ = u > 0 ? 1 : (C += "\f", -1);
					break;
				case 44:
					if (v > 0) break;
					s[l++] = (G(C) - 1) * _, _ = 1;
					break;
				case 64:
					Z() === 45 && (C += Ei(X())), f = Z(), u = d = G(b = C += ji(xi())), y++;
					break;
				case 45: m === 45 && G(C) == 2 && (h = 0);
			}
	}
	return a;
}
function Pi(e, t, n, r, i, a, o, s, c, l, u, d) {
	for (var f = i - 1, p = i === 0 ? a : [""], m = mi(p), h = 0, g = 0, _ = 0; h < r; ++h) for (var v = 0, y = pi(e, f + 1, f = ci(g = o[h])), b = e; v < m; ++v) (b = ui(g > 0 ? p[v] + " " + y : di(y, /&\f/g, p[v]))) && (c[_++] = b);
	return vi(e, t, n, i === 0 ? ni : s, c, l, u, d);
}
function Fi(e, t, n, r) {
	return vi(e, t, n, ti, li(yi()), pi(e, 2, -2), 0, r);
}
function Ii(e, t, n, r, i) {
	return vi(e, t, n, ri, pi(e, 0, r), pi(e, r + 1, -1), r, i);
}
//#endregion
//#region node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Serializer.js
function Li(e, t) {
	for (var n = "", r = 0; r < e.length; r++) n += t(e[r], r, e, t) || "";
	return n;
}
function Ri(e, t, n, r) {
	switch (e.type) {
		case si: if (e.children.length) break;
		case ii:
		case ai:
		case ri: return e.return = e.return || e.value;
		case ti: return "";
		case oi: return e.return = e.value + "{" + Li(e.children, r) + "}";
		case ni: if (!G(e.value = e.props.join(","))) return "";
	}
	return G(n = Li(e.children, r)) ? e.return = e.value + "{" + n + "}" : "";
}
//#endregion
//#region node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Middleware.js
function zi(e) {
	var t = mi(e);
	return function(n, r, i, a) {
		for (var o = "", s = 0; s < t; s++) o += e[s](n, r, i, a) || "";
		return o;
	};
}
//#endregion
//#region node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/mermaid.core.mjs
var Bi = "c4", Vi = {
	id: Bi,
	detector: /* @__PURE__ */ t((e) => /^\s*C4Context|C4Container|C4Component|C4Dynamic|C4Deployment/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./c4Diagram-5PPSVZJV-CzPlT-WC.js");
		return {
			id: Bi,
			diagram: e
		};
	}, "loader")
}, Hi = "flowchart", Ui = {
	id: Hi,
	detector: /* @__PURE__ */ t((e, t) => t?.flowchart?.defaultRenderer === "dagre-wrapper" || t?.flowchart?.defaultRenderer === "elk" ? !1 : /^\s*graph/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./flowDiagram-UKHOOZJN-CDULArOO.js");
		return {
			id: Hi,
			diagram: e
		};
	}, "loader")
}, Wi = "flowchart-v2", Gi = {
	id: Wi,
	detector: /* @__PURE__ */ t((e, t) => t?.flowchart?.defaultRenderer !== "dagre-d3" && (t?.flowchart?.defaultRenderer === "elk" && (t.layout = "elk"), /^\s*graph/.test(e) && t?.flowchart?.defaultRenderer === "dagre-wrapper" ? !0 : /^\s*flowchart/.test(e)), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./flowDiagram-UKHOOZJN-CDULArOO.js");
		return {
			id: Wi,
			diagram: e
		};
	}, "loader")
}, Ki = "swimlane", qi = {
	id: Ki,
	detector: /* @__PURE__ */ t((e) => /^\s*swimlane-beta\b/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./swimlanesDiagram-ULZ7WXOC-BcCoCW8f.js");
		return {
			id: Ki,
			diagram: e
		};
	}, "loader")
}, Ji = "er", Yi = {
	id: Ji,
	detector: /* @__PURE__ */ t((e) => /^\s*erDiagram/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./erDiagram-JOGREHBK-NEnhmyig.js");
		return {
			id: Ji,
			diagram: e
		};
	}, "loader")
}, Xi = "gitGraph", Zi = {
	id: Xi,
	detector: /* @__PURE__ */ t((e) => /^\s*gitGraph/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./gitGraphDiagram-DS77QQ5N-D-mmF1Eq.js");
		return {
			id: Xi,
			diagram: e
		};
	}, "loader")
}, Qi = "gantt", $i = {
	id: Qi,
	detector: /* @__PURE__ */ t((e) => /^\s*gantt/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./ganttDiagram-PKOTCBZU-BADw841V.js");
		return {
			id: Qi,
			diagram: e
		};
	}, "loader")
}, ea = "info", ta = {
	id: ea,
	detector: /* @__PURE__ */ t((e) => /^\s*info/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./infoDiagram-6WML65LV-C4MhZNuA.js");
		return {
			id: ea,
			diagram: e
		};
	}, "loader")
}, na = "pie", ra = {
	id: na,
	detector: /* @__PURE__ */ t((e) => /^\s*pie/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./pieDiagram-7S7Q4E2Y-BS-1WHG0.js");
		return {
			id: na,
			diagram: e
		};
	}, "loader")
}, ia = "quadrantChart", aa = {
	id: ia,
	detector: /* @__PURE__ */ t((e) => /^\s*quadrantChart/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./quadrantDiagram-CIZ2JOQS-DHgFPeH9.js");
		return {
			id: ia,
			diagram: e
		};
	}, "loader")
}, oa = "xychart", sa = {
	id: oa,
	detector: /* @__PURE__ */ t((e) => /^\s*xychart(-beta)?/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./xychartDiagram-ELKLHX3M-C0r4vCwu.js");
		return {
			id: oa,
			diagram: e
		};
	}, "loader")
}, ca = "requirement", la = {
	id: ca,
	detector: /* @__PURE__ */ t((e) => /^\s*requirement(Diagram)?/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./requirementDiagram-LRYGKXZP-o2I58jf7.js");
		return {
			id: ca,
			diagram: e
		};
	}, "loader")
}, ua = "sequence", da = {
	id: ua,
	detector: /* @__PURE__ */ t((e) => /^\s*sequenceDiagram/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./sequenceDiagram-SI44F4Z6-CPPV3AMG.js");
		return {
			id: ua,
			diagram: e
		};
	}, "loader")
}, fa = "class", pa = {
	id: fa,
	detector: /* @__PURE__ */ t((e, t) => t?.class?.defaultRenderer !== "dagre-wrapper" && /^\s*classDiagram/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./classDiagram-JCYQIIEL-C5xv4HuQ.js");
		return {
			id: fa,
			diagram: e
		};
	}, "loader")
}, ma = "classDiagram", ha = {
	id: ma,
	detector: /* @__PURE__ */ t((e, t) => /^\s*classDiagram/.test(e) && t?.class?.defaultRenderer === "dagre-wrapper" ? !0 : /^\s*classDiagram-v2/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./classDiagram-v2-OCEON4UE-DI-rrNht.js");
		return {
			id: ma,
			diagram: e
		};
	}, "loader")
}, ga = "state", _a = {
	id: ga,
	detector: /* @__PURE__ */ t((e, t) => t?.state?.defaultRenderer !== "dagre-wrapper" && /^\s*stateDiagram/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./stateDiagram-OKZ733FA-B-DOx275.js");
		return {
			id: ga,
			diagram: e
		};
	}, "loader")
}, va = "stateDiagram", ya = {
	id: va,
	detector: /* @__PURE__ */ t((e, t) => !!(/^\s*stateDiagram-v2/.test(e) || /^\s*stateDiagram/.test(e) && t?.state?.defaultRenderer === "dagre-wrapper"), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./stateDiagram-v2-UEYNNEHI-DDoOKfpx.js");
		return {
			id: va,
			diagram: e
		};
	}, "loader")
}, ba = "journey", xa = {
	id: ba,
	detector: /* @__PURE__ */ t((e) => /^\s*journey/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./journeyDiagram-NVQOT4AX-DkW-Ih8G.js");
		return {
			id: ba,
			diagram: e
		};
	}, "loader")
}, Sa = { draw: /* @__PURE__ */ t((e, t, n) => {
	r.debug("rendering svg for syntax error\n");
	let i = De(t), a = i.append("g");
	i.attr("viewBox", "0 0 2412 512"), b(i, 100, 512, !0), a.append("path").attr("class", "error-icon").attr("d", "m411.313,123.313c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32-9.375,9.375-20.688-20.688c-12.484-12.5-32.766-12.5-45.25,0l-16,16c-1.261,1.261-2.304,2.648-3.31,4.051-21.739-8.561-45.324-13.426-70.065-13.426-105.867,0-192,86.133-192,192s86.133,192 192,192 192-86.133 192-192c0-24.741-4.864-48.327-13.426-70.065 1.402-1.007 2.79-2.049 4.051-3.31l16-16c12.5-12.492 12.5-32.758 0-45.25l-20.688-20.688 9.375-9.375 32.001-31.999zm-219.313,100.687c-52.938,0-96,43.063-96,96 0,8.836-7.164,16-16,16s-16-7.164-16-16c0-70.578 57.422-128 128-128 8.836,0 16,7.164 16,16s-7.164,16-16,16z"), a.append("path").attr("class", "error-icon").attr("d", "m459.02,148.98c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l16,16c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16.001-16z"), a.append("path").attr("class", "error-icon").attr("d", "m340.395,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16-16c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l15.999,16z"), a.append("path").attr("class", "error-icon").attr("d", "m400,64c8.844,0 16-7.164 16-16v-32c0-8.836-7.156-16-16-16-8.844,0-16,7.164-16,16v32c0,8.836 7.156,16 16,16z"), a.append("path").attr("class", "error-icon").attr("d", "m496,96.586h-32c-8.844,0-16,7.164-16,16 0,8.836 7.156,16 16,16h32c8.844,0 16-7.164 16-16 0-8.836-7.156-16-16-16z"), a.append("path").attr("class", "error-icon").attr("d", "m436.98,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688l32-32c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32c-6.251,6.25-6.251,16.375-0.001,22.625z"), a.append("text").attr("class", "error-text").attr("x", 1440).attr("y", 250).attr("font-size", "150px").style("text-anchor", "middle").text("Syntax error in text"), a.append("text").attr("class", "error-text").attr("x", 1250).attr("y", 400).attr("font-size", "100px").style("text-anchor", "middle").text(`mermaid version ${n}`);
}, "draw") }, Ca = Sa, wa = {
	db: {},
	renderer: Sa,
	parser: { parse: /* @__PURE__ */ t(() => {}, "parse") }
}, Ta = "flowchart-elk", Ea = {
	id: Ta,
	detector: /* @__PURE__ */ t((e, t = {}) => /^\s*flowchart-elk/.test(e) || /^\s*(flowchart|graph)/.test(e) && t?.flowchart?.defaultRenderer === "elk" ? (t.layout = "elk", !0) : !1, "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./flowDiagram-UKHOOZJN-CDULArOO.js");
		return {
			id: Ta,
			diagram: e
		};
	}, "loader")
}, Da = "timeline", Oa = {
	id: Da,
	detector: /* @__PURE__ */ t((e) => /^\s*timeline/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./timeline-definition-Z64GVDOM-CVtTXXeJ.js");
		return {
			id: Da,
			diagram: e
		};
	}, "loader")
}, ka = "mindmap", Aa = {
	id: ka,
	detector: /* @__PURE__ */ t((e) => /^\s*mindmap/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./mindmap-definition-FAOFIHXS-CxG0yqMl.js");
		return {
			id: ka,
			diagram: e
		};
	}, "loader")
}, ja = "kanban", Ma = {
	id: ja,
	detector: /* @__PURE__ */ t((e) => /^\s*kanban/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./kanban-definition-27J2QSJJ-rWVAM2uy.js");
		return {
			id: ja,
			diagram: e
		};
	}, "loader")
}, Na = "sankey", Pa = {
	id: Na,
	detector: /* @__PURE__ */ t((e) => /^\s*sankey(-beta)?/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./sankeyDiagram-W5VNT64P-CpjUlw54.js");
		return {
			id: Na,
			diagram: e
		};
	}, "loader")
}, Fa = "packet", Ia = {
	id: Fa,
	detector: /* @__PURE__ */ t((e) => /^\s*packet(-beta)?/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./diagram-LBJQPF4R-BJDZnPx1.js");
		return {
			id: Fa,
			diagram: e
		};
	}, "loader")
}, La = "radar", Ra = {
	id: La,
	detector: /* @__PURE__ */ t((e) => /^\s*radar-beta/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./diagram-UB23O5K3-Dv6hBrle.js");
		return {
			id: La,
			diagram: e
		};
	}, "loader")
}, za = "block", Ba = {
	id: za,
	detector: /* @__PURE__ */ t((e) => /^\s*block(-beta)?/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./blockDiagram-VBNYF7ZC-DPj4_B3a.js");
		return {
			id: za,
			diagram: e
		};
	}, "loader")
}, Va = "treeView", Ha = {
	id: Va,
	detector: /* @__PURE__ */ t((e) => /^\s*treeView-beta/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./diagram-7IWD3JNH-BIPxkssE.js");
		return {
			id: Va,
			diagram: e
		};
	}, "loader")
}, Ua = "architecture", Wa = {
	id: Ua,
	detector: /* @__PURE__ */ t((e) => /^\s*architecture/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./architectureDiagram-T3A2C74G-YLrYtkmg.js");
		return {
			id: Ua,
			diagram: e
		};
	}, "loader")
}, Ga = "eventmodeling", Ka = {
	id: Ga,
	detector: /* @__PURE__ */ t((e) => /^\s*eventmodeling/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./diagram-B4RE2ZJO-c84N8ND7.js");
		return {
			id: Ga,
			diagram: e
		};
	}, "loader")
}, qa = "ishikawa", Ja = {
	id: qa,
	detector: /* @__PURE__ */ t((e) => /^\s*ishikawa(-beta)?\b/i.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./ishikawaDiagram-WSZJBQD7-CNewbcDk.js");
		return {
			id: qa,
			diagram: e
		};
	}, "loader")
}, Ya = "venn", Xa = {
	id: Ya,
	detector: /* @__PURE__ */ t((e) => /^\s*venn-beta/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./vennDiagram-T6HMQDX7-CbIxGPvY.js");
		return {
			id: Ya,
			diagram: e
		};
	}, "loader")
}, Za = "treemap", Qa = {
	id: Za,
	detector: /* @__PURE__ */ t((e) => /^\s*treemap/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./diagram-Q27KOJAE-BiUpI-GF.js");
		return {
			id: Za,
			diagram: e
		};
	}, "loader")
}, $a = "wardley", eo = {
	id: $a,
	detector: /* @__PURE__ */ t((e) => /^\s*wardley-beta/i.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./wardleyDiagram-T6FBY63Y-CptUZrTP.js");
		return {
			id: $a,
			diagram: e
		};
	}, "loader")
}, to = "cynefin", no = {
	id: to,
	detector: /* @__PURE__ */ t((e) => /^\s*cynefin-beta(?:[\s:]|$)/.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./cynefinDiagram-MW4NZA55-BQhqfrmd.js");
		return {
			id: to,
			diagram: e
		};
	}, "loader")
}, ro = "railroad", io = {
	id: ro,
	detector: /* @__PURE__ */ t((e) => /^\s*railroad-beta/i.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./railroadDiagram-AXF67PYL-DpThhJVN.js");
		return {
			id: ro,
			diagram: e
		};
	}, "loader")
}, ao = "railroadEbnf", oo = {
	id: ao,
	detector: /* @__PURE__ */ t((e) => /^\s*railroad-ebnf-beta/i.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./ebnfDiagram-BXEA7PRR-DUuHyFGF.js");
		return {
			id: ao,
			diagram: e
		};
	}, "loader")
}, so = "railroadAbnf", co = {
	id: so,
	detector: /* @__PURE__ */ t((e) => /^\s*railroad-abnf-beta/i.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./abnfDiagram-N423BO3Z-Dm_rcHVO.js");
		return {
			id: so,
			diagram: e
		};
	}, "loader")
}, lo = "railroadPeg", uo = {
	id: lo,
	detector: /* @__PURE__ */ t((e) => /^\s*railroad-peg-beta/i.test(e), "detector"),
	loader: /* @__PURE__ */ t(async () => {
		let { diagram: e } = await import("./pegDiagram-VL7TDLO6-DCYou6Ds.js");
		return {
			id: lo,
			diagram: e
		};
	}, "loader")
}, fo = !1, po = /* @__PURE__ */ t(() => {
	fo || (fo = !0, l("error", wa, (e) => e.toLowerCase().trim() === "error"), l("---", {
		db: { clear: /* @__PURE__ */ t(() => {}, "clear") },
		styles: {},
		renderer: { draw: /* @__PURE__ */ t(() => {}, "draw") },
		parser: { parse: /* @__PURE__ */ t(() => {
			throw Error("Diagrams beginning with --- are not valid. If you were trying to use a YAML front-matter, please ensure that you've correctly opened and closed the YAML front-matter with un-indented `---` blocks");
		}, "parse") },
		init: /* @__PURE__ */ t(() => null, "init")
	}, (e) => e.toLowerCase().trimStart().startsWith("---")), u(Ea, Aa, Wa), u(Vi, Ma, ha, pa, Yi, $i, ta, ra, la, da, qi, Gi, Ui, Oa, Zi, ya, _a, xa, aa, Pa, Ia, sa, Ba, Ka, Ha, Ra, Ja, Qa, io, oo, co, uo, Xa, eo, no));
}, "addDiagrams"), mo = /* @__PURE__ */ t(async () => {
	r.debug("Loading registered diagrams");
	let e = (await Promise.allSettled(Object.entries(S).map(async ([e, { detector: t, loader: n }]) => {
		if (n) try {
			f(e);
		} catch {
			try {
				let { diagram: e, id: r } = await n();
				l(r, e, t);
			} catch (t) {
				throw r.error(`Failed to load external diagram with key ${e}. Removing from detectors.`), delete S[e], t;
			}
		}
	}))).filter((e) => e.status === "rejected");
	if (e.length > 0) {
		r.error(`Failed to load ${e.length} external diagrams`);
		for (let t of e) r.error(t);
		throw Error(`Failed to load ${e.length} external diagrams`);
	}
}, "loadRegisteredDiagrams"), ho = "graphics-document document";
function go(e, t) {
	e.attr("role", ho), t !== "" && e.attr("aria-roledescription", t);
}
t(go, "setA11yDiagramInfo");
function _o(e, t, n, r) {
	if (e.insert !== void 0) {
		if (n) {
			let t = `chart-desc-${r}`;
			e.attr("aria-describedby", t), e.insert("desc", ":first-child").attr("id", t).text(n);
		}
		if (t) {
			let n = `chart-title-${r}`;
			e.attr("aria-labelledby", n), e.insert("title", ":first-child").attr("id", n).text(t);
		}
	}
}
t(_o, "addSVGa11yTitleDescription");
var vo = class e {
	constructor(e, t, n, r, i) {
		this.type = e, this.text = t, this.db = n, this.parser = r, this.renderer = i;
	}
	static {
		t(this, "Diagram");
	}
	static async fromText(t, n = {}) {
		let r = y(), i = te(t, r);
		t = me(t) + "\n";
		try {
			f(i);
		} catch {
			let e = a(i);
			if (!e) throw new ae(`Diagram ${i} not found.`);
			let { id: t, diagram: n } = await e();
			l(t, n);
		}
		let { db: o, parser: s, renderer: c, init: u } = f(i);
		return s.parser && (s.parser.yy = o), o.clear?.(), u?.(r), n.title && o.setDiagramTitle?.(n.title), await s.parse(t), new e(i, t, o, s, c);
	}
	async render(e, t) {
		await this.renderer.draw(this.text, e, t, this);
	}
	getParser() {
		return this.parser;
	}
	getType() {
		return this.type;
	}
}, yo = [], bo = /* @__PURE__ */ t(() => {
	yo.forEach((e) => {
		e();
	}), yo = [];
}, "attachFunctions"), xo = /* @__PURE__ */ t((e) => e.replace(/^\s*%%(?!{)[^\n]+\n?/gm, "").trimStart(), "cleanupComments");
function So(e) {
	let t = e.match(v);
	if (!t) return {
		text: e,
		metadata: {}
	};
	let n = t[1], r = ei(n ? t[2].split("\n").map((e) => e.startsWith(n) ? e.slice(n.length) : e).join("\n") : t[2], { schema: $r }) ?? {};
	r = typeof r == "object" && !Array.isArray(r) ? r : {};
	let i = {};
	return r.displayMode && (i.displayMode = r.displayMode.toString()), r.title && (i.title = r.title.toString()), r.config && (i.config = r.config), {
		text: e.slice(t[0].length),
		metadata: i
	};
}
t(So, "extractFrontMatter");
var Co = /* @__PURE__ */ t((e) => e.replace(/\r\n?/g, "\n").replace(/<(\w+)([^>]*)>/g, (e, t, n) => "<" + t + n.replace(/="([^"]*)"/g, "='$1'") + ">"), "cleanupText"), wo = /* @__PURE__ */ t((e) => {
	let { text: t, metadata: n } = So(e), { displayMode: r, title: i, config: a = {} } = n;
	return r && (a.gantt ||= {}, a.gantt.displayMode = r), {
		title: i,
		config: a,
		text: t
	};
}, "processFrontmatter"), To = /* @__PURE__ */ t((e) => {
	let t = de.detectInit(e) ?? {}, n = de.detectDirective(e, "wrap");
	return Array.isArray(n) ? t.wrap = n.some(({ type: e }) => e === "wrap") : n?.type === "wrap" && (t.wrap = !0), {
		text: fe(e),
		directive: t
	};
}, "processDirectives");
function Eo(e) {
	let t = wo(Co(e)), n = To(t.text), r = pe(t.config, n.directive);
	return e = xo(n.text), {
		code: e,
		title: t.title,
		config: r
	};
}
t(Eo, "preprocessDiagram");
function Do(e) {
	let t = new TextEncoder().encode(e), n = Array.from(t, (e) => String.fromCodePoint(e)).join("");
	return btoa(n);
}
t(Do, "toBase64");
var Oo = 5e4, ko = "graph TB;a[Maximum text size in diagram exceeded];style a fill:#faa", Ao = "sandbox", jo = "loose", Mo = "http://www.w3.org/2000/svg", No = "http://www.w3.org/1999/xlink", Po = "http://www.w3.org/1999/xhtml", Fo = "100%", Io = "100%", Lo = "border:0;margin:0;", Ro = "margin:0", zo = "allow-top-navigation-by-user-activation allow-popups", Bo = "The \"iframe\" tag is not supported by your browser.", Vo = ["foreignobject"], Ho = ["dominant-baseline"];
function Uo(e) {
	let t = Eo(e);
	return s(), C(t.config ?? {}), t;
}
t(Uo, "processAndSetConfigs");
async function Wo(e, t) {
	po();
	try {
		let { code: t, config: n } = Uo(e);
		return {
			diagramType: (await ns(t)).type,
			config: n
		};
	} catch (e) {
		if (t?.suppressErrors) return !1;
		throw e;
	}
}
t(Wo, "parse");
var Go = /* @__PURE__ */ t((e, t, n = []) => `.${e} ${t} ${c(`{ ${n.join(" !important; ")} !important; }`)}`, "cssImportantStyles"), Ko = /* @__PURE__ */ t((e, t = /* @__PURE__ */ new Map()) => {
	let n = new CSSStyleSheet();
	if (e.fontFamily !== void 0 && n.insertRule(`:root { --mermaid-font-family: ${e.fontFamily}}`, n.cssRules.length), e.altFontFamily !== void 0 && n.insertRule(`:root { --mermaid-alt-font-family: ${e.altFontFamily}}`, n.cssRules.length), t instanceof Map) {
		let r = p(e) ? ["> *", "span"] : [
			"rect",
			"polygon",
			"ellipse",
			"circle",
			"path"
		];
		t.forEach((e) => {
			ke(e.styles) || r.forEach((t) => {
				n.insertRule(Go(e.id, t, e.styles), n.cssRules.length);
			}), ke(e.textStyles) || n.insertRule(Go(e.id, "tspan", (e?.textStyles || []).map((e) => e.replace("color", "fill"))), n.cssRules.length);
		});
	}
	let r = "";
	if (e.themeCSS !== void 0) {
		if (typeof n.replaceSync == "function") {
			let t = new CSSStyleSheet();
			t.replaceSync(e.themeCSS), r = x(t) + "\n";
		} else r += `${e.themeCSS}
`;
	}
	return r + x(n);
}, "createCssStyles"), qo = /* @__PURE__ */ t((e, n) => Li(Mi(`${e}{${n}}`), zi([/* @__PURE__ */ t(function(t, n, i, a) {
	if (t.type === "rule" && Array.isArray(t.props)) {
		if (t.parent && t.parent.type === "@keyframes") return;
		t.props = t.props.map((n) => n === e && Array.isArray(t.children) && t.children.every((e) => e.type === "decl" && (/* @__PURE__ */ new Set([
			"font-family",
			"font-size",
			"fill"
		])).has(e.props)) || (n.startsWith(`${e} `) || n.startsWith(`${e}>`)) && !n.startsWith(`${e} ||`) ? n : `${e} ${n}`);
	} else t.type.startsWith("@") && ([
		"@media",
		"@supports",
		"@layer",
		"@scope",
		"@container",
		"@starting-style",
		"@keyframes"
	].includes(t.type) || (r.warn(`Removing unsupported at-rule ${t.type} from CSS`), t.type = ti));
}, "addNamespace"), Ri])), "compileCSS"), Jo = /* @__PURE__ */ t((e, t, n, r) => {
	let i = Ko(e, n);
	return qo(r, g(t, i, {
		...e.themeVariables,
		theme: e.theme,
		look: e.look
	}, r));
}, "createUserStyles"), Yo = /* @__PURE__ */ t((e = "", t, n) => {
	let r = e;
	return !n && !t && (r = r.replace(/marker-end="url\([\d+./:=?A-Za-z-]*?#/g, "marker-end=\"url(#")), r = w(r), r = r.replace(/<br>/g, "<br/>"), r;
}, "cleanUpSvgCode"), Xo = /* @__PURE__ */ t((e = "", t) => `<iframe style="width:${Fo};height:${t?.viewBox?.baseVal?.height ? t.viewBox.baseVal.height + "px" : Io};${Lo}" src="data:text/html;charset=UTF-8;base64,${Do(`<body style="${Ro}">${e}</body>`)}" sandbox="${zo}">
  ${Bo}
</iframe>`, "putIntoIFrame"), Zo = /* @__PURE__ */ t((e, t, n, r, i) => {
	let a = e.append("div");
	a.attr("id", n), r && a.attr("style", r);
	let o = a.append("svg").attr("id", t).attr("width", "100%").attr("xmlns", Mo);
	return i && o.attr("xmlns:xlink", i), o.append("g"), e;
}, "appendDivSvgG");
function Qo(e, t) {
	return e.append("iframe").attr("id", t).attr("style", "width: 100%; height: 100%;").attr("sandbox", "");
}
t(Qo, "sandboxedIframe");
var $o = /* @__PURE__ */ t((e, t, n, r) => {
	e.getElementById(t)?.remove(), e.getElementById(n)?.remove(), e.getElementById(r)?.remove();
}, "removeExistingElements"), es = /* @__PURE__ */ t(async function(n, a, o) {
	po();
	let s = Uo(a);
	a = s.code;
	let c = y();
	r.debug(c), a.length > (c?.maxTextSize ?? Oo) && (a = ko);
	let l = `#${n}`, u = "i" + n, d = "#" + u, f = "d" + n, p = "#" + f, m = /* @__PURE__ */ t(() => {
		let e = i(g ? d : p).node();
		e && "remove" in e && e.remove();
	}, "removeTempElements"), h = i(document.body), g = c.securityLevel === Ao, _ = c.securityLevel === jo, v = c.fontFamily;
	if (o !== void 0) {
		if (o && (o.innerHTML = ""), g) {
			let e = Qo(i(o), u);
			h = i(e.nodes()[0].contentDocument.body), h.node().style.margin = "0";
		} else h = i(o);
		Zo(h, n, f, `font-family: ${v}`, No);
	} else {
		if ($o(document, n, f, u), g) {
			let e = Qo(i(document.body), u);
			h = i(e.nodes()[0].contentDocument.body), h.node().style.margin = "0";
		} else h = i("body");
		Zo(h, n, f);
	}
	let b, x;
	try {
		b = await vo.fromText(a, { title: s.title });
	} catch (e) {
		if (c.suppressErrorRendering) throw m(), e;
		b = await vo.fromText("error"), x = e;
	}
	let S = h.select(p).node(), C = b.type, te = S.firstChild, ne = te.firstChild, re = b.renderer.getClasses?.(a, b), ie = Jo(c, C, re, l), ae = document.createElement("style");
	ae.innerHTML = ie, te.insertBefore(ae, ne);
	try {
		await b.renderer.draw(a, n, "11.16.1", b);
	} catch (e) {
		throw c.suppressErrorRendering ? m() : Ca.draw(a, n, "11.16.1"), e;
	}
	let oe = h.select(`${p} svg`), se = b.db.getAccTitle?.(), ce = b.db.getAccDescription?.();
	rs(C, oe, se, ce), h.select(`[id="${n}"]`).selectAll("foreignobject > *").attr("xmlns", Po);
	let w = h.select(p).node().innerHTML;
	if (r.debug("config.arrowMarkerAbsolute", c.arrowMarkerAbsolute), w = Yo(w, g, ee(c.arrowMarkerAbsolute)), g) {
		let e = h.select(p + " svg").node();
		w = Xo(w, e);
	} else _ || (w = e.sanitize(w, {
		ADD_TAGS: Vo,
		ADD_ATTR: Ho,
		HTML_INTEGRATION_POINTS: { foreignobject: !0 }
	}));
	if (bo(), x) throw x;
	return m(), {
		diagramType: C,
		svg: w,
		bindFunctions: b.db.bindFunctions
	};
}, "render");
function ts(e = {}) {
	let t = re({}, e);
	t?.fontFamily && !t.themeVariables?.fontFamily && (t.themeVariables ||= {}, t.themeVariables.fontFamily = t.fontFamily), m(t), t?.theme && t.theme in _ ? t.themeVariables = _[t.theme].getThemeVariables(t.themeVariables) : t && (t.themeVariables = _.default.getThemeVariables(t.themeVariables));
	let r = typeof t == "object" ? ne(t) : o();
	n(r.logLevel), po();
}
t(ts, "initialize");
var ns = /* @__PURE__ */ t((e, t = {}) => {
	let { code: n } = Eo(e);
	return vo.fromText(n, t);
}, "getDiagramFromText");
function rs(e, t, n, r) {
	go(t, e), _o(t, n, r, t.attr("id"));
}
t(rs, "addA11yInfo");
var Q = Object.freeze({
	render: es,
	parse: Wo,
	getDiagramFromText: ns,
	initialize: ts,
	getConfig: y,
	setConfig: h,
	getSiteConfig: o,
	updateSiteConfig: d,
	reset: /* @__PURE__ */ t(() => {
		s();
	}, "reset"),
	globalReset: /* @__PURE__ */ t(() => {
		s(oe);
	}, "globalReset"),
	defaultConfig: oe
});
n(y().logLevel), s(y());
var is = /* @__PURE__ */ t((e, t, n) => {
	r.warn(e), ue(e) ? (n && n(e.str, e.hash), t.push({
		...e,
		message: e.str,
		error: e
	})) : (n && n(e), e instanceof Error && t.push({
		str: e.message,
		message: e.message,
		hash: e.name,
		error: e
	}));
}, "handleError"), as = /* @__PURE__ */ t(async function(e = { querySelector: ".mermaid" }) {
	try {
		await os(e);
	} catch (t) {
		if (ue(t) && r.error(t.str), $.parseError && $.parseError(t), !e.suppressErrors) throw r.error("Use the suppressErrors option to suppress these errors"), t;
	}
}, "run"), os = /* @__PURE__ */ t(async function({ postRenderCallback: e, querySelector: t, nodes: n } = { querySelector: ".mermaid" }) {
	let i = Q.getConfig();
	r.debug(`${e ? "" : "No "}Callback function found`);
	let a;
	if (n) a = n;
	else if (t) a = document.querySelectorAll(t);
	else throw Error("Nodes and querySelector are both undefined");
	r.debug(`Found ${a.length} diagrams`), i?.startOnLoad !== void 0 && (r.debug("Start On Load: " + i?.startOnLoad), Q.updateSiteConfig({ startOnLoad: i?.startOnLoad }));
	let o = new de.InitIDGenerator(i.deterministicIds, i.deterministicIDSeed), s, c = [];
	for (let t of Array.from(a)) {
		if (r.info("Rendering diagram: " + t.id), t.getAttribute("data-processed")) continue;
		t.setAttribute("data-processed", "true");
		let n = `mermaid-${o.next()}`;
		s = t.innerHTML, s = ye(de.entityDecode(s)).trim().replace(/<br\s*\/?>/gi, "<br/>");
		let i = de.detectInit(s);
		i && r.debug("Detected early reinit: ", i);
		try {
			let { svg: r, bindFunctions: i } = await gs(n, s, t);
			t.innerHTML = r, e && await e(n), i && i(t);
		} catch (e) {
			is(e, c, $.parseError);
		}
	}
	if (c.length > 0) throw c[0];
}, "runThrowsErrors"), ss = /* @__PURE__ */ t(function(e) {
	Q.initialize(e);
}, "initialize"), cs = /* @__PURE__ */ t(async function(e, t, n) {
	r.warn("mermaid.init is deprecated. Please use run instead."), e && ss(e);
	let i = {
		postRenderCallback: n,
		querySelector: ".mermaid"
	};
	typeof t == "string" ? i.querySelector = t : t && (i.nodes = t instanceof HTMLElement ? [t] : t), await as(i);
}, "init"), ls = /* @__PURE__ */ t(async (e, { lazyLoad: t = !0 } = {}) => {
	po(), u(...e), t === !1 && await mo();
}, "registerExternalDiagrams"), us = /* @__PURE__ */ t(function() {
	if ($.startOnLoad) {
		let { startOnLoad: e } = Q.getConfig();
		e && $.run().catch((e) => r.error("Mermaid failed to initialize", e));
	}
}, "contentLoaded");
typeof document < "u" && window.addEventListener("load", us, !1);
var ds = /* @__PURE__ */ t(function(e) {
	$.parseError = e;
}, "setParseErrorHandler"), fs = [], ps = !1, ms = /* @__PURE__ */ t(async () => {
	if (!ps) {
		for (ps = !0; fs.length > 0;) {
			let e = fs.shift();
			if (e) try {
				await e();
			} catch (e) {
				r.error("Error executing queue", e);
			}
		}
		ps = !1;
	}
}, "executeQueue"), hs = /* @__PURE__ */ t(async (e, n) => new Promise((i, a) => {
	let o = /* @__PURE__ */ t(() => new Promise((t, o) => {
		Q.parse(e, n).then((e) => {
			t(e), i(e);
		}, (e) => {
			r.error("Error parsing", e), $.parseError?.(e), o(e), a(e);
		});
	}), "performCall");
	fs.push(o), ms().catch(a);
}), "parse"), gs = /* @__PURE__ */ t((e, n, i) => new Promise((a, o) => {
	let s = /* @__PURE__ */ t(() => new Promise((t, s) => {
		Q.render(e, n, i).then((e) => {
			t(e), a(e);
		}, (e) => {
			r.error("Error parsing", e), $.parseError?.(e), s(e), o(e);
		});
	}), "performCall");
	fs.push(s), ms().catch(o);
}), "render"), $ = {
	startOnLoad: !0,
	mermaidAPI: Q,
	parse: hs,
	render: gs,
	init: cs,
	run: as,
	registerExternalDiagrams: ls,
	registerLayoutLoaders: Me,
	initialize: ss,
	parseError: void 0,
	contentLoaded: us,
	setParseErrorHandler: ds,
	detectType: te,
	registerIconPacks: ve,
	getRegisteredDiagramsMetadata: /* @__PURE__ */ t(() => Object.keys(S).map((e) => ({ id: e })), "getRegisteredDiagramsMetadata")
}, _s = $;
//#endregion
export { De as a, _s as default, Ne as i, ei as n, Pe as r, $r as t };
