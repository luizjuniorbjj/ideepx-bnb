require('dotenv').config();

console.log('DATABASE_URL do process.env:');
console.log(process.env.DATABASE_URL);
console.log('');
console.log('Tipo:', typeof process.env.DATABASE_URL);
console.log('Comprimento:', process.env.DATABASE_URL?.length);
console.log('');
console.log('Caracteres:');
for (let i = 0; i < (process.env.DATABASE_URL?.length || 0); i++) {
  console.log(`  [${i}]: "${process.env.DATABASE_URL[i]}" (charCode: ${process.env.DATABASE_URL.charCodeAt(i)})`);
}
