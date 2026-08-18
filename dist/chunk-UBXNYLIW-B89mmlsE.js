import { n as e } from "./chunk-Y2CYZVJY-CmNPyWGC.js";
import { f as t, x as n } from "./chunk-I66GZJ75-DaJZKFkN.js";
import { p as r } from "./chunk-NSK5VX7P-pGKppjHe.js";
//#region node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/chunks/mermaid.core/chunk-UBXNYLIW.mjs
var i = /* @__PURE__ */ e(({ flowchart: e }) => {
	let t = e?.subGraphTitleMargin?.top ?? 0, n = e?.subGraphTitleMargin?.bottom ?? 0;
	return {
		subGraphTitleTopMargin: t,
		subGraphTitleBottomMargin: n,
		subGraphTitleTotalMargin: t + n
	};
}, "getSubGraphTitleMargins");
async function a(i, a) {
	let o = i.getElementsByTagName("img");
	if (!o || o.length === 0) return;
	let s = a.replace(/<img[^>]*>/g, "").trim() === "";
	await Promise.all([...o].map((i) => new Promise((a) => {
		function o() {
			if (i.style.display = "flex", i.style.flexDirection = "column", s) {
				let e = n().fontSize ? n().fontSize : window.getComputedStyle(document.body).fontSize, [a = t.fontSize] = r(e), o = a * 5 + "px";
				i.style.minWidth = o, i.style.maxWidth = o;
			} else i.style.width = "100%";
			a(i);
		}
		e(o, "setupImage"), setTimeout(() => {
			i.complete && o();
		}), i.addEventListener("error", o), i.addEventListener("load", o);
	})));
}
e(a, "configureLabelImages");
//#endregion
export { i as n, a as t };
