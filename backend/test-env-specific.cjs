const dotenv = require('dotenv');
const path = require('path');

// Forçar leitura apenas do .env do backend
const result = dotenv.config({ path: path.join(__dirname, '.env') });

console.log('='.repeat(80));
console.log('TESTE FORÇANDO CAMINHO ESPECÍFICO');
console.log('='.repeat(80));
console.log('');
console.log('Caminho do .env:', path.join(__dirname, '.env'));
console.log('Resultado do dotenv.config():', result.error ? result.error.message : 'OK');
console.log('');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('');
