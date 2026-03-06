export default {
  "*.{vue,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss,html,md,json}": [
    "prettier --write"
  ]
};

