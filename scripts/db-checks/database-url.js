function requireDatabaseUrl(envName) {
  const value = process.env[envName];

  if (!value) {
    throw new Error(`${envName} is not set`);
  }

  return value;
}

function requireTestDatabaseUrl() {
  return requireDatabaseUrl('TEST_DATABASE_URL');
}

function assertSafeDatabaseName(databaseName, envName) {
  if (!databaseName) {
    throw new Error(`${envName} is required`);
  }

  if (['postgres', 'template0', 'template1'].includes(databaseName)) {
    throw new Error(`Refusing to use protected database "${databaseName}"`);
  }

  return databaseName;
}

function getDatabaseName(connectionString) {
  const { pathname } = new URL(connectionString);
  return assertSafeDatabaseName(
    decodeURIComponent(pathname.replace(/^\//, '')),
    'TEST_DATABASE_URL database name'
  );
}

function requireTestDatabaseName() {
  return assertSafeDatabaseName(process.env.TEST_DATABASE_NAME, 'TEST_DATABASE_NAME');
}

function requireMatchingTestDatabaseName(connectionString) {
  const databaseName = requireTestDatabaseName();
  const urlDatabaseName = getDatabaseName(connectionString);

  if (databaseName !== urlDatabaseName) {
    throw new Error('TEST_DATABASE_NAME must match the database in TEST_DATABASE_URL');
  }

  return databaseName;
}

function requireRecreatableTestDatabaseName(connectionString) {
  const databaseName = requireMatchingTestDatabaseName(connectionString);
  const confirmationName = process.env.CONFIRM_RECREATE_TEST_DATABASE_NAME;

  if (databaseName.endsWith('_test') || confirmationName === databaseName) {
    return databaseName;
  }

  throw new Error(
    'Refusing to recreate database without a _test suffix. ' +
      'Set CONFIRM_RECREATE_TEST_DATABASE_NAME to the exact database name to override.'
  );
}

function getMaintenanceDatabaseUrl(connectionString) {
  const url = new URL(connectionString);
  url.pathname = `/${process.env.DB_CHECK_MAINTENANCE_DATABASE || 'postgres'}`;
  return url.toString();
}

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

module.exports = {
  getDatabaseName,
  getMaintenanceDatabaseUrl,
  quoteIdentifier,
  requireDatabaseUrl,
  requireMatchingTestDatabaseName,
  requireRecreatableTestDatabaseName,
  requireTestDatabaseName,
  requireTestDatabaseUrl,
};
