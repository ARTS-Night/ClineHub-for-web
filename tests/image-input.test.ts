import assert from "node:assert/strict"
import { validateUserImages } from "../src/runtime.js"

const png = "data:image/png;base64,iVBORw0KGgo="
assert.deepEqual(validateUserImages(undefined, false), [])
assert.deepEqual(validateUserImages([png], true), [png])
assert.throws(() => validateUserImages([png], false), /disabled/)
assert.throws(() => validateUserImages(["data:text/plain;base64,dGVzdA=="], true), /PNG, JPEG, WebP, or GIF/)
assert.throws(() => validateUserImages(Array(5).fill(png), true), /no more than 4/)

console.log("image input tests passed")
