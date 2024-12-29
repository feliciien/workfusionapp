module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.module\.css$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': require.resolve('./test/style-mock.js')
  }
};
