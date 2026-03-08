import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { JSONRpcProvider } from 'opnet';
import {
  AddressTypes,
  MLDSASecurityLevel,
  Mnemonic,
  TransactionFactory,
} from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const rpcUrl = process.env.RPC_URL || 'https://testnet.opnet.org';
const networkName = process.env.NETWORK || 'testnet';
const wasmPath = process.env.WASM_PATH || './build/DataVault.wasm';
const feeRate = Number(process.env.FEE_RATE || 5);
const priorityFee = BigInt(process.env.PRIORITY_FEE || '0');
const gasSatFee = BigInt(process.env.GAS_SAT_FEE || '500000');

const networkByName: Record<string, typeof networks.bitcoin> = {
  mainnet: networks.bitcoin,
  bitcoin: networks.bitcoin,
  testnet: networks.opnetTestnet,
  regtest: networks.regtest,
};

function clampFeeRate(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(888, Math.floor(value)));
}

async function main(): Promise<void> {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) throw new Error('MNEMONIC is required in .env');

  const btcNetwork = networkByName[networkName] || networks.opnetTestnet;

  console.log(`\n========================================`);
  console.log(`  CryptexBTC Contract Deployment`);
  console.log(`========================================`);
  console.log(`Network:  ${networkName}`);
  console.log(`RPC:      ${rpcUrl}`);
  console.log(`WASM:     ${wasmPath}`);
  console.log(`Fee Rate: ${feeRate} sat/vB`);
  console.log(`Gas Fee:  ${gasSatFee} sats`);
  console.log(`========================================\n`);

  const wallet = new Mnemonic(
    mnemonic, '', btcNetwork, MLDSASecurityLevel.LEVEL2,
  ).deriveOPWallet(AddressTypes.P2TR, 0);

  console.log(`Deployer address: ${wallet.p2tr}`);

  const provider = new JSONRpcProvider({ url: rpcUrl, network: btcNetwork });

  const resolvedPath = path.resolve(__dirname, wasmPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`WASM file not found: ${resolvedPath}\nRun 'npm run build:all' first.`);
  }

  const bytecode = fs.readFileSync(resolvedPath);
  console.log(`WASM size: ${bytecode.length} bytes`);

  if (bytecode.length === 0) {
    throw new Error('WASM file is empty. Check asconfig.json and rebuild.');
  }

  const challenge = await provider.getChallenge();
  console.log(`Challenge obtained.`);

  const utxos = await provider.utxoManager.getUTXOs({
    address: wallet.p2tr,
    optimize: false,
  });

  if (!utxos.length) {
    throw new Error(`No UTXOs found for ${wallet.p2tr}. Fund the wallet first.`);
  }
  console.log(`UTXOs found: ${utxos.length}`);

  const factory = new TransactionFactory();
  const deployment = await factory.signDeployment({
    signer: wallet.keypair,
    mldsaSigner: wallet.mldsaKeypair,
    bytecode: new Uint8Array(bytecode),
    network: btcNetwork,
    from: wallet.p2tr,
    utxos,
    feeRate: clampFeeRate(feeRate),
    challenge,
    priorityFee,
    gasSatFee,
    calldata: undefined,
    linkMLDSAPublicKeyToAddress: true,
    revealMLDSAPublicKey: true,
  });

  console.log(`\nSending funding transaction...`);
  const fundingRawTx = deployment.transaction[0];
  const fundingResult = await provider.sendRawTransaction(fundingRawTx, false);
  if (!fundingResult.success) {
    throw new Error(`Funding TX failed: ${JSON.stringify(fundingResult)}`);
  }
  console.log(`Funding TX:  ${fundingResult.result}`);

  console.log(`Sending deployment transaction...`);
  const deployRawTx = deployment.transaction[1];
  const deployResult = await provider.sendRawTransaction(deployRawTx, false);
  if (!deployResult.success) {
    throw new Error(`Deploy TX failed: ${JSON.stringify(deployResult)}`);
  }
  console.log(`Deploy TX:   ${deployResult.result}`);
  console.log(`\n✅ Contract Address: ${deployment.contractAddress}`);

  console.log(`\nWaiting for on-chain confirmation...`);
  for (let i = 0; i < 30; i++) {
    try {
      const tx = await provider.getTransaction(deployResult.result);
      if (tx && tx.failed) {
        throw new Error(`Deployment REVERTED: ${tx.revert || 'unknown reason'}`);
      }
      if (tx && !tx.failed) {
        console.log(`\n🎉 Confirmed at block ${tx.blockNumber}`);
        console.log(`\n========================================`);
        console.log(`  CONTRACT ADDRESS: ${deployment.contractAddress}`);
        console.log(`========================================\n`);
        return;
      }
    } catch (e: any) {
      if (e.message?.includes('REVERTED')) throw e;
    }
    process.stdout.write(`. `);
    await new Promise(r => setTimeout(r, 10000));
  }

  console.log(`\n⚠️  Timed out waiting for confirmation.`);
  console.log(`Check manually: ${deployment.contractAddress}`);
}

main().catch(err => {
  console.error(`\n❌ Deployment failed:`, err.message || err);
  process.exit(1);
});
