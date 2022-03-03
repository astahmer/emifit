export const rmTrailingSlash = (path: string) => (path.endsWith("/") ? path.slice(0, path.length - 1) : path);
