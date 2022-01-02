import { MangoClient } from './client';
import { Commitment, Connection } from '@solana/web3.js';
import configFile from './ids.json';
import { Config, getMarketByBaseSymbolAndKind, GroupConfig } from './config';
import { sleep } from './utils';

async function main() {
  // setup client
  const config = new Config(configFile);
  const groupConfig = config.getGroup(
    'mainnet',
    'mainnet.1'
  ) as GroupConfig;
  const connection = new Connection(
    'https://mango.rpcpool.com/946ef7337da3f5b8d3e4a34e7f88',
    'processed' as Commitment,
  );
  const client = new MangoClient(connection, groupConfig.mangoProgramId);

  // load group & market
  const perpMarketConfig = getMarketByBaseSymbolAndKind(
    groupConfig,
    'SOL',
    'perp',
  );
  const mangoGroup = await client.getMangoGroup(groupConfig.publicKey);
  const perpMarket = await mangoGroup.loadPerpMarket(
    connection,
    perpMarketConfig.marketIndex,
    perpMarketConfig.baseDecimals,
    perpMarketConfig.quoteDecimals,
  );

  while (true) {
    try {
        await sleep(5000);

        const _bids = await perpMarket.loadBids(connection);
        const _asks = await perpMarket.loadAsks(connection);
      
        const bids: any = [], asks: any = [];
      
        // L2 orderbook data
        for (const [price, size] of _bids.getL2(25)) {
          bids.push([price, size]);
        }
      
        for (const [price, size] of _asks.getL2(25)) {
          asks.push([price, size]);
        }

        console.log(bids, asks)
    } catch (e) {
        console.log(e);
    }
  }
}

main();
