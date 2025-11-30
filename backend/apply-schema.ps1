cd C:\ideepx-bnb\backend
$env:DATABASE_URL = "file:./prisma/dev.db"
npx prisma db push --skip-generate
