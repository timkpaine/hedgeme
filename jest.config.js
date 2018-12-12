module.exports = {
  transform: {
    "^.+\\.js$": "babel-jest",
    '^.+\\.ts?$': 'ts-jest',
    ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css"
  },
  cache: false,
  transformIgnorePatterns: [
    "node_modules/(?!(@jpmorganchase/perspective|@jpmorganchase/perspective-viewer)/)"
  ],
  testPathIgnorePatterns: ["build"],
  moduleNameMapper:{
       "\\.(css|less|sass|scss)$": "<rootDir>/tests/js/styleMock.js",
       "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/tests/js/fileMock.js"
  },
  moduleDirectories: [
    "node_modules",
    "ts/src"
  ],
  preset: 'ts-jest'
};
