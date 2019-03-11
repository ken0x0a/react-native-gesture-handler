module.exports = api => {
  api.cache(false);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['@babel/plugin-transform-runtime']
    // env: {
    //   development: {
    //     plugins: ['transform-react-jsx-source']
    //   }
    // }
  };
};
