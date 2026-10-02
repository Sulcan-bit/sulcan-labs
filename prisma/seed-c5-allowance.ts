// prisma/seed-c5-allowance.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedC5Allowance() {
  const filePath = path.join(process.cwd(), 'monthly-data', '2024-2025-c5-allowance-update.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const rows = JSON.parse(raw);

  for (const row of rows) {
    const month = row.month.trim();

    await prisma.monthlyData.update({
      where: {
        year_month: {
          year: row.year,
          month
        }
      },
      data: {
        c5_allow_price_cad_m3: row.c5_allow_price_cad_m3
      }
    });

    console.log(`Updated C5 Allowance for ${row.month} ${row.year}`);
  }

  console.log('C5 Allowance updates complete.');
}

async function main() {
  await seedC5Allowance();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
