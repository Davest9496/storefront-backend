import 'jasmine';
import DatabaseTestUtils from './db-test.utils';

beforeAll(async () => {
  await DatabaseTestUtils.init();
  await DatabaseTestUtils.setupTestDb();
});

afterAll(async () => {
  await DatabaseTestUtils.teardownTestDb();
  await DatabaseTestUtils.cleanup();
});
