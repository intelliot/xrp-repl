"use strict";

module.exports = function(api) {
  // Cache the returned value forever and don't call this function again.
  api.cache(true);

  const config = {
    // https://babeljs.io/docs/en/options#sourcemaps
    "sourceMaps": true,
    
    "presets": [
      // required to transform `import` to something node understands
      "@babel/preset-env",

      // includes @babel/plugin-transform-typescript
      // https://babeljs.io/docs/en/babel-plugin-transform-typescript
      // 
      "@babel/typescript"
    ],
    "plugins": [
      "@babel/proposal-class-properties",
      "@babel/proposal-object-rest-spread",
      "@babel/transform-runtime",
      "source-map-support"
    ]
  };

  return config;
};
