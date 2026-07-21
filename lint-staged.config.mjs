export default {
  '*.{vue,ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{css,scss}': ['stylelint --fix', 'prettier --write'],
  '*.{html,md,json,yaml,yml}': ['prettier --write'],
}
