import crypto from 'crypto';
import config from '../config/index.js';

/**
 * Encripta dados sensíveis usando AES-256-CBC
 * @param {string} text - Texto para encriptar
 * @returns {string} Texto encriptado (hex)
 */
export function encrypt(text) {
  const key = Buffer.from(config.encryptionKey, 'hex');
  const iv = Buffer.from(config.encryptionIv, 'hex');

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

/**
 * Decripta dados usando AES-256-CBC
 * @param {string} encryptedText - Texto encriptado (hex)
 * @returns {string} Texto decriptado
 */
export function decrypt(encryptedText) {
  const key = Buffer.from(config.encryptionKey, 'hex');
  const iv = Buffer.from(config.encryptionIv, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Gera hash keccak256 (compatível com Solidity)
 * @param {string} data - Dados para hash
 * @returns {string} Hash 0x...
 */
export function keccak256(data) {
  return '0x' + crypto.createHash('sha3-256').update(data).digest('hex');
}

/**
 * Gera HMAC SHA-256
 * @param {string} data - Dados
 * @param {string} secret - Secret
 * @returns {string} HMAC (hex)
 */
export function hmacSha256(data, secret = config.hmacSecret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verifica HMAC
 * @param {string} data - Dados
 * @param {string} receivedHmac - HMAC recebido
 * @param {string} secret - Secret
 * @returns {boolean}
 */
export function verifyHmac(data, receivedHmac, secret = config.hmacSecret) {
  const calculatedHmac = hmacSha256(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac),
    Buffer.from(receivedHmac)
  );
}

/**
 * Gera chave de criptografia aleatória
 * @returns {{key: string, iv: string}}
 */
export function generateEncryptionKeys() {
  return {
    key: crypto.randomBytes(32).toString('hex'), // 256 bits
    iv: crypto.randomBytes(16).toString('hex')   // 128 bits
  };
}
