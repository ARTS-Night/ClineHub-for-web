import { n as e } from "./mermaid-parser.core-CDTnkd3X.js";
import { n as t } from "./chunk-Y2CYZVJY-CmNPyWGC.js";
import { m as n } from "./src-BfmkUsMs.js";
import { c as r } from "./chunk-I66GZJ75-DaJZKFkN.js";
import { a as i } from "./mermaid.core-CoIgm_7k.js";
//#region node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-6WML65LV.mjs
var a = { parse: /* @__PURE__ */ t(async (t) => {
	let r = await e("info", t);
	n.debug(r);
}, "parse") }, o = { version: "11.16.1" }, s = {
	parser: a,
	db: { getVersion: /* @__PURE__ */ t(() => o.version, "getVersion") },
	renderer: { draw: /* @__PURE__ */ t((e, t, a) => {
		n.debug("rendering info diagram\n" + e);
		let o = i(t);
		r(o, 100, 400, !0), o.append("g").append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${a}`);
	}, "draw") }
};
//#endregion
export { s as diagram };
