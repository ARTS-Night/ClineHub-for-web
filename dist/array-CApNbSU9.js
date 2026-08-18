Array.prototype.slice;
function e(e) {
	return typeof e == "object" && "length" in e ? e : Array.from(e);
}
//#endregion
export { e as t };
