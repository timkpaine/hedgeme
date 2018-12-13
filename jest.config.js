module.exports = {
  verbose: true,
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css"
  },
  cache: false,
  testPathIgnorePatterns: [
    "build"
  ],
  transformIgnorePatterns: [
    "node_modules"
  ],
  moduleNameMapper:{
      "\\.(css|less)$": "<rootDir>/tests/js/styleMock.js",
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/tests/js/fileMock.js"
  },
  preset: 'ts-jest'
};
