export default {
  "*.{vue,ts,tsx}": [
    "pnpm ai:guard --staged",
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss}": [
    "stylelint --fix",
    "prettier --write"
  ],
  "*.vue": [
    "stylelint --fix"
  ],
  "*.{html,md,json}": [
    "prettier --write"
  ],
};
