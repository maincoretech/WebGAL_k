Custom modified WebGAL for our game use

## Recommanded environment setup

[VSCode](https://code.visualstudio.com/) (with [plugin](https://marketplace.visualstudio.com/items?itemName=c6h5-no2.webgal-script-basics)) + [Chrome](https://www.google.com/chrome/)/[Edge](https://www.microsoft.com/edge) + [Bun](https://bun.sh/) + [Node.js](https://nodejs.org/) ~~(很遗憾我们仍未优化掉 nodejs)~~

## Commands

```sh
bun i        // setup project
bun dev      // open dev server
bun build    // build project, the webgal output is ./packages/webgal/dist
```

## More infomation

see also [WebGAL's documents](https://docs.openwebgal.com/)

instead of electron we use tauri2 to pack program, you can easily config environment with [tauri2's documents](https://v2.tauri.app/start/prerequisites/) for develop