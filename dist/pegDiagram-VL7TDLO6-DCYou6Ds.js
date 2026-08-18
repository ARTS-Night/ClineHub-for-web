import { t as e, u as t } from "./mermaid-parser.core-CDTnkd3X.js";
import { n } from "./chunk-Y2CYZVJY-CmNPyWGC.js";
import { m as r } from "./src-BfmkUsMs.js";
import "./chunk-I66GZJ75-DaJZKFkN.js";
import { n as i, r as a, t as o } from "./chunk-6Q2QTUOP-Da15laPp.js";
import { t as s } from "./chunk-JWPE2WC7-os5Vwac_.js";
import "./mermaid.core-CoIgm_7k.js";
//#region node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/chunks/mermaid.core/pegDiagram-VL7TDLO6.mjs
var c = t().RailroadPeg.parser.LangiumParser, l = /* @__PURE__ */ n((e) => {
	let t = e.alternatives.map(u);
	return t.length === 1 ? t[0] : {
		type: "choice",
		alternatives: t
	};
}, "transformOrderedChoice"), u = /* @__PURE__ */ n((e) => {
	let t = e.elements.map(d);
	return t.length === 1 ? t[0] : {
		type: "sequence",
		elements: t
	};
}, "transformSequence"), d = /* @__PURE__ */ n((e) => {
	let t = p(e.suffix);
	return e.operator ? {
		type: "special",
		text: e.operator === "&" ? `&${f(t)}` : `!${f(t)}`
	} : t;
}, "transformPrefix"), f = /* @__PURE__ */ n((e) => {
	switch (e.type) {
		case "terminal": return `"${e.value}"`;
		case "nonterminal": return e.name;
		case "special": return e.text;
		default: return "(...)";
	}
}, "nodeToLabel"), p = /* @__PURE__ */ n((e) => {
	let t = m(e.primary);
	if (!e.operator) return t;
	switch (e.operator) {
		case "?": return {
			type: "optional",
			element: t
		};
		case "*": return {
			type: "repetition",
			element: t,
			min: 0,
			max: Infinity
		};
		case "+": return {
			type: "repetition",
			element: t,
			min: 1,
			max: Infinity
		};
		default: throw Error(`Unsupported PEG suffix operator: ${e.operator}`);
	}
}, "transformSuffix"), m = /* @__PURE__ */ n((e) => {
	switch (e.$type) {
		case "PegLiteral": return {
			type: "terminal",
			value: e.value
		};
		case "PegIdentifier": return {
			type: "nonterminal",
			name: e.name
		};
		case "PegGroup": return l(e.element);
		case "PegAny": return {
			type: "special",
			text: e.dot
		};
		default: throw Error(`Unsupported PEG primary node: ${e.$type}`);
	}
}, "transformPrimary"), h = /* @__PURE__ */ n((e) => ({
	name: e.name,
	definition: l(e.definition)
}), "transformRule"), g = /* @__PURE__ */ n((e) => {
	s(e, o), e.title && o.setTitle(e.title), e.rules.map((e) => o.addRule(h(e)));
}, "populateDb"), _ = {
	parser: {
		parse: /* @__PURE__ */ n((t) => {
			o.clear(), r.debug("[PEG Parser] Starting Langium parse");
			let n = c.parse(t);
			if (n.lexerErrors.length > 0 || n.parserErrors.length > 0) throw new e(n);
			let i = n.value;
			r.debug("[PEG Parser] Parsed rules:", i.rules.length), g(i), r.debug("[PEG Parser] Parse complete");
		}, "parse"),
		parser: { yy: o }
	},
	db: o,
	renderer: a,
	styles: i
};
//#endregion
export { _ as diagram };
