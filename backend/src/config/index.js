import dotenv from 'dotenv';

// FORÇAR override de variáveis de ambiente do sistema
dotenv.config({ override: true });

export default {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  host: process.env.HOST || 'localhost',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Blockchain
  chainId: parseInt(process.env.CHAIN_ID, 10) || 97,
  rpcUrl: process.env.RPC_URL,
  contractV10Address: process.env.CONTRACT_V10_ADDRESS,
  usdtAddress: process.env.USDT_ADDRESS,

  // Private Keys
  updaterPrivateKey: process.env.UPDATER_PRIVATE_KEY,
  distributorPrivateKey: process.env.DISTRIBUTOR_PRIVATE_KEY,
  treasuryPrivateKey: process.env.TREASURY_PRIVATE_KEY,

  // Authentication
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  siweDomain: process.env.SIWE_DOMAIN || 'ideepx.ai',
  siweStatement: process.env.SIWE_STATEMENT || 'Sign in to iDeepX',

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY,
  encryptionIv: process.env.ENCRYPTION_IV,

  // GMI
  gmiApiUrl: process.env.GMI_API_URL,
  gmiWebhookSecret: process.env.GMI_WEBHOOK_SECRET,
  gmiApiKey: process.env.GMI_API_KEY,

  // Security
  hmacSecret: process.env.HMAC_SECRET,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // MLM
  mlmPercentages: process.env.MLM_PERCENTAGES?.split(',').map(Number) || [8, 3, 2, 1, 1, 2, 2, 2, 2, 2],
  mlmUnlockDirects: parseInt(process.env.MLM_UNLOCK_REQUIREMENT_DIRECTS, 10) || 5,
  mlmUnlockVolume: parseFloat(process.env.MLM_UNLOCK_REQUIREMENT_VOLUME) || 5000,
  performanceSplitClient: parseInt(process.env.PERFORMANCE_SPLIT_CLIENT, 10) || 65,
  performanceSplitCompany: parseInt(process.env.PERFORMANCE_SPLIT_COMPANY, 10) || 35,
  mlmPoolPercentage: parseFloat(process.env.MLM_POOL_PERCENTAGE) || 71.43,

  // Jobs
  syncMetricsCron: process.env.SYNC_METRICS_CRON || '0 */6 * * *',
  processPerformanceCron: process.env.PROCESS_PERFORMANCE_CRON || '0 2 * * *',
  cleanupLogsCron: process.env.CLEANUP_LOGS_CRON || '0 0 * * 0',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',

  // Admin
  adminWallets: process.env.ADMIN_WALLETS?.split(',') || [],

  // Helper methods
  isDevelopment() {
    return this.nodeEnv === 'development';
  },
  isProduction() {
    return this.nodeEnv === 'production';
  },
  isTestnet() {
    return this.chainId === 97;
  }
};
