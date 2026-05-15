const name = new URLSearchParams(location.search).get('demo');
if (name) {
  import(/* @vite-ignore */ `/demos/${name}.ts`).then(mod => {
    mod.default.run();
  });
}
