export default {
  '*.{vue,ts,tsx}': [
    'pnpm ai:guard --staged',
    'eslint --fix --no-warn-ignored',
    'prettier --write'
  ],
  '*.{css,scss}': [
    'stylelint --fix',
    'prettier --write'
  ],
  '*.vue': [
    'stylelint --fix'
  ],
  '*.{html,md,json}': [
    'prettier --write'
  ],
};
