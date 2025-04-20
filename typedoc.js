module.exports = {
  out: 'api',
  exclude: [ '**/node_modules/**', '**/*.test.ts', '**/*.json' ],
  name: 'digital-event-handler',
  excludePrivate: true,
  entryPointStrategy: 'resolve',
  readme: './README.md',
  tsconfig: './tsconfig.json'
};