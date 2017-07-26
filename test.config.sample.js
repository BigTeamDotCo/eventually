exports.config = {
  key: 'test-action-over-time',
  host: 'localhost',
  port: '27017',
  user: 'root',
  dbName: throw Error('Set db name in test config'),
  interval: 2000
};
