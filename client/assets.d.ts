// Vite resolves *.svg imports to a URL string (inlined as a data: URI for
// small files, emitted as a hashed asset otherwise). tsconfig's
// moduleResolution ("NodeNext") doesn't pull in vite/client's ambient types,
// so this is declared by hand instead of adding that dependency.
declare module "*.svg" {
  const url: string
  export default url
}
