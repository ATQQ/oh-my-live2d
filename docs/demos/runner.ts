const name = new URLSearchParams(location.search).get('demo');
if (name) {
  // eslint-disable-next-line antfu/no-top-level-await
  const mod = await import(/* @vite-ignore */ `/demos/${name}.ts`);
  mod.default.run();
}
