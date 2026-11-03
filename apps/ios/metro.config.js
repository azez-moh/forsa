// Metro config for the npm-workspaces monorepo (apps/ios + packages/*).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole repo so @forsa/data and @forsa/tokens (TS sources) hot-reload.
config.watchFolders = [workspaceRoot];

// 2. Resolve packages from the app first, then the hoisted root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Pin a single copy of React. apps/web hoists a newer react to the root, and
//    react-native's renderer must match the exact React version the SDK ships.
const singletons = ['react', 'react-dom'];
const upstreamResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const root = moduleName.split('/')[0];
  if (singletons.includes(root)) {
    try {
      return { type: 'sourceFile', filePath: require.resolve(moduleName, { paths: [projectRoot] }) };
    } catch {
      // fall through to the default resolver
    }
  }
  return (upstreamResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
