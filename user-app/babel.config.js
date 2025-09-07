module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { browsers: ['last 2 versions'] }
    }],
    ['@babel/preset-react', { runtime: 'classic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
  ],
};
