module.exports = {
  env: {
    'browser': true,
    'commonjs': true,
    'node': true,
  },
  extends: 'eslint:recommended',
  rules: {
  	'comma-dangle': 'off',
    'no-console': 'off',
    'no-constant-condition': 'off',
    'no-redeclare': 'off',
    'no-unused-vars': 'off',

    'array-bracket-spacing': 'error',
    'block-spacing': 'error',
    'brace-style': 'error',
    'comma-spacing': 'error',
    'comma-style': 'error',
    'eol-last': 'error',
    'indent': ['error', 2],
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'linebreak-style': 'error',
    'no-array-constructor': 'error',
    'no-trailing-spaces': 'error',
    'no-unneeded-ternary': 'error',
  },
};
