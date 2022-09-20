import { defineConfig, request } from "alita";

export default defineConfig({
  appType: "h5",
  npmClient: "pnpm",
  alias: {
    treeselect4m: require.resolve("../../src/index"),
  },
});
