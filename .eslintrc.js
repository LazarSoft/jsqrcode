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
    'no-undef': 'off',
    'no-unused-vars': 'off',

    'indent': ['error', 'tab'],
  },
};
