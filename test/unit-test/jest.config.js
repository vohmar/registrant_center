module.exports = {
  rootDir: '../../',
  setupFilesAfterEnv: ['./test/unit-test/jest.unit-test.init.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testPathIgnorePatterns: ['/config/', '/node_modules/'],
  setupFiles: ['dotenv/config']
};