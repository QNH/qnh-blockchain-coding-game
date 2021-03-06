// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  web3ConnectionString: 'ws://127.0.0.1:8546',
  gas: 10000000,
  gasPrice: 1,
  chainId: 3177,
  routes: {
    part1: 'part1',
    part2: 'part2',
    part3: 'part3',
    part4: 'part4',
    part5: 'part5',
    reset: 'reset'
  }
};
