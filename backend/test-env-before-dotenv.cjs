console.log('='.repeat(80));
console.log('ANTES DE CHAMAR dotenv.config():');
console.log('='.repeat(80));
console.log('');
console.log('DATABASE_URL já existe em process.env?', 'DATABASE_URL' in process.env);
console.log('Valor:', process.env.DATABASE_URL || '(undefined)');
console.log('');

const dotenv = require('dotenv');
const result = dotenv.config();

console.log('='.repeat(80));
console.log('DEPOIS DE CHAMAR dotenv.config():');
console.log('='.repeat(80));
console.log('');
console.log('Resultado dotenv:', result.error ? result.error.message : 'OK');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('');
