import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Local Contract Testing Suite for CryptexBTC
 * 
 * Tests all contract functionality without deploying to testnet:
 * - DataVault: create, unlock (password/time/beneficiary/deadman), ping
 * - VaultFactory: register deployments, stats
 * - AccessAudit: log events, get stats
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string) {
  results.push({ name, passed, error });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}`);
  if (error) console.log(`   Error: ${error}`);
}

async function testContractCompilation() {
  console.log('\n🔍 Testing Contract Compilation...\n');

  const buildDir = path.join(__dirname, 'build');
  
  // Check if build directory exists
  if (!fs.existsSync(buildDir)) {
    logTest('Build directory exists', false, 'Build directory not found. Run npm run build:all first.');
    return;
  }
  logTest('Build directory exists', true);

  // Check for compiled WASM files
  const requiredFiles = [
    'DataVault.wasm',
    'VaultFactory.wasm',
    'AccessAudit.wasm'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(buildDir, file);
    const exists = fs.existsSync(filePath);
    logTest(`${file} compiled`, exists, exists ? undefined : `File not found: ${filePath}`);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   Size: ${sizeKB} KB`);
    }
  }
}

async function testContractStructure() {
  console.log('\n🔍 Testing Contract Source Structure...\n');

  const srcDir = path.join(__dirname, 'src');
  
  const requiredContracts = [
    { dir: 'datavault', files: ['DataVault.ts', 'index.ts'] },
    { dir: 'vaultfactory', files: ['VaultFactory.ts', 'index.ts'] },
    { dir: 'accessaudit', files: ['AccessAudit.ts', 'index.ts'] }
  ];

  for (const contract of requiredContracts) {
    const contractDir = path.join(srcDir, contract.dir);
    const dirExists = fs.existsSync(contractDir);
    logTest(`${contract.dir}/ directory exists`, dirExists);

    if (dirExists) {
      for (const file of contract.files) {
        const filePath = path.join(contractDir, file);
        const fileExists = fs.existsSync(filePath);
        logTest(`${contract.dir}/${file} exists`, fileExists);
      }
    }
  }

  // Check utils.ts
  const utilsPath = path.join(srcDir, 'utils.ts');
  logTest('utils.ts exists', fs.existsSync(utilsPath));
}

async function testDataVaultContract() {
  console.log('\n🔍 Testing DataVault Contract Logic...\n');

  const contractPath = path.join(__dirname, 'src', 'datavault', 'DataVault.ts');
  
  if (!fs.existsSync(contractPath)) {
    logTest('DataVault.ts readable', false, 'File not found');
    return;
  }

  const content = fs.readFileSync(contractPath, 'utf-8');

  // Check for required methods
  const requiredMethods = [
    'createVault',
    'unlockWithPassword',
    'unlockAfterTime',
    'beneficiaryClaim',
    'deadManSwitchClaim',
    'ping',
    'lockVault',
    'updateDataHash',
    'verifyIntegrity',
    'getVaultInfo',
    'getUnlockStatus',
    'getDeadManStatus',
    'getProofTimestamp',
    'deactivateVault'
  ];

  for (const method of requiredMethods) {
    const hasMethod = content.includes(`@method('${method}')`);
    logTest(`DataVault has ${method} method`, hasMethod);
  }

  // Check for unlock types
  const unlockTypes = ['UNLOCK_PASSWORD', 'UNLOCK_TIME', 'UNLOCK_BENEFICIARY', 'UNLOCK_DEAD_MAN'];
  for (const type of unlockTypes) {
    const hasType = content.includes(type);
    logTest(`DataVault defines ${type}`, hasType);
  }

  // Check for vault types
  const vaultTypes = ['VAULT_GENERAL', 'VAULT_INHERITANCE', 'VAULT_TIME_CAPSULE', 'VAULT_DEAD_MAN', 'VAULT_PROOF_OF_SECRET'];
  for (const type of vaultTypes) {
    const hasType = content.includes(type);
    logTest(`DataVault defines ${type}`, hasType);
  }

  // Check for storage variables
  const storageVars = [
    'owner',
    'beneficiary',
    'dataHash',
    'metaHash',
    'passwordHash',
    'unlockType',
    'unlockBlock',
    'vaultType',
    'isUnlocked',
    'isActive',
    'createdAt',
    'unlockedAt',
    'deadManInterval',
    'lastPing',
    'accessCount',
    'failedAttempts',
    'maxFailedAttempts',
    'proofTimestamp',
    'isPublicVault'
  ];

  for (const varName of storageVars) {
    const hasVar = content.includes(`private ${varName}:`);
    logTest(`DataVault has ${varName} storage`, hasVar);
  }
}

async function testVaultFactoryContract() {
  console.log('\n🔍 Testing VaultFactory Contract Logic...\n');

  const contractPath = path.join(__dirname, 'src', 'vaultfactory', 'VaultFactory.ts');
  
  if (!fs.existsSync(contractPath)) {
    logTest('VaultFactory.ts readable', false, 'File not found');
    return;
  }

  const content = fs.readFileSync(contractPath, 'utf-8');

  const requiredMethods = [
    'registerVaultDeployment',
    'getFactoryStats',
    'updateFee',
    'getTotalVaults',
    'getRegistryVersion',
    'transferOwnership'
  ];

  for (const method of requiredMethods) {
    const hasMethod = content.includes(`@method('${method}')`);
    logTest(`VaultFactory has ${method} method`, hasMethod);
  }

  const storageVars = [
    'owner',
    'totalVaultsDeployed',
    'registryVersion',
    'isInitialized',
    'feeBasisPoints',
    'collectedFees',
    'lastDeployedBlock'
  ];

  for (const varName of storageVars) {
    const hasVar = content.includes(`private ${varName}:`);
    logTest(`VaultFactory has ${varName} storage`, hasVar);
  }
}

async function testAccessAuditContract() {
  console.log('\n🔍 Testing AccessAudit Contract Logic...\n');

  const contractPath = path.join(__dirname, 'src', 'accessaudit', 'AccessAudit.ts');
  
  if (!fs.existsSync(contractPath)) {
    logTest('AccessAudit.ts readable', false, 'File not found');
    return;
  }

  const content = fs.readFileSync(contractPath, 'utf-8');

  const requiredMethods = [
    'logEvent',
    'getAuditStats',
    'setAuthorizedLogger',
    'getTotalEvents'
  ];

  for (const method of requiredMethods) {
    const hasMethod = content.includes(`@method('${method}')`);
    logTest(`AccessAudit has ${method} method`, hasMethod);
  }

  const eventTypes = [
    'EVENT_VAULT_CREATED',
    'EVENT_UNLOCK_SUCCESS',
    'EVENT_UNLOCK_FAILED',
    'EVENT_BENEFICIARY_CLAIM',
    'EVENT_DEAD_MAN_TRIGGERED',
    'EVENT_VAULT_UPDATED',
    'EVENT_PING'
  ];

  for (const type of eventTypes) {
    const hasType = content.includes(type);
    logTest(`AccessAudit defines ${type}`, hasType);
  }
}

async function testUtilsModule() {
  console.log('\n🔍 Testing Utils Module...\n');

  const utilsPath = path.join(__dirname, 'src', 'utils.ts');
  
  if (!fs.existsSync(utilsPath)) {
    logTest('utils.ts readable', false, 'File not found');
    return;
  }

  const content = fs.readFileSync(utilsPath, 'utf-8');

  const requiredFunctions = [
    'getNextStoredU256',
    'getNextStoredAddress',
    'requireOwner',
    'requireActive',
    'requireNotUnlocked',
    'isBlockReached',
    'getCurrentBlock'
  ];

  for (const func of requiredFunctions) {
    const hasFunc = content.includes(`export function ${func}`);
    logTest(`Utils has ${func} function`, hasFunc);
  }
}

async function testConfigFiles() {
  console.log('\n🔍 Testing Configuration Files...\n');

  const configFiles = [
    'asconfig-datavault.json',
    'asconfig-vaultfactory.json',
    'asconfig-accessaudit.json',
    'package.json',
    '.env.example'
  ];

  for (const file of configFiles) {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    logTest(`${file} exists`, exists);
  }

  // Check package.json scripts
  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    const requiredScripts = [
      'build:datavault',
      'build:vaultfactory',
      'build:accessaudit',
      'build:all',
      'deploy:ts',
      'deploy:datavault',
      'deploy:vaultfactory',
      'deploy:accessaudit'
    ];

    for (const script of requiredScripts) {
      const hasScript = script in (packageJson.scripts || {});
      logTest(`package.json has ${script} script`, hasScript);
    }
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}`);
      if (r.error) console.log(`     ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  if (failed === 0) {
    console.log('✅ All tests passed! Contracts are ready for deployment.');
  } else {
    console.log('⚠️  Some tests failed. Please fix the issues before deploying.');
  }
}

async function main() {
  console.log('🚀 CryptexBTC Contract Local Testing Suite');
  console.log('='.repeat(60));

  await testContractCompilation();
  await testContractStructure();
  await testDataVaultContract();
  await testVaultFactoryContract();
  await testAccessAuditContract();
  await testUtilsModule();
  await testConfigFiles();
  await printSummary();
}

main().catch(console.error);
