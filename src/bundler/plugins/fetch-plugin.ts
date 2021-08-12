import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localForage from "localforage";

const fileCache = localForage.createInstance({
  name: "filecache",
});

const getCachedPath = (path: string) =>
  fileCache.getItem<esbuild.OnLoadResult>(path);

const convertCSSToJSS = (css: string) => `
  const style = document.createElement('style')
  style.innerText = '${css}'
  document.head.appendChild(style)
`;

const setESBuildConfigObj = (
  contents: string,
  responseURL: string
): esbuild.OnLoadResult => ({
  loader: "jsx",
  contents,
  resolveDir: new URL("./", responseURL).pathname,
});

const escapeCSS = (css: string) =>
  css.replace(/\n/g, "").replace(/"/g, '\\"').replace(/'/g, "\\'");

export const fetchPlugin = (userInput: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: "jsx",
          contents: userInput,
        };
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const cachedResult = await getCachedPath(args.path);

        if (cachedResult) {
          return cachedResult;
        }
      });

      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        const escaped = escapeCSS(data);
        const contents = convertCSSToJSS(escaped);

        const result = setESBuildConfigObj(contents, request.responseURL);

        await fileCache.setItem(args.path, result);

        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        const result = setESBuildConfigObj(data, request.responseURL);

        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
