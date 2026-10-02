// prisma/seed-crw-2025.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedCRW2025() {
  const filePath = path.join(process.cwd(), 'monthly-data', '2025-crw-monthly-data.json');

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
        crw_c5_diff_usd_bbl: row.crw_c5_diff_usd_bbl,
        crw_c5_par_base_price_usd_bbl: row.crw_c5_par_base_price_usd_bbl,
        crw_c5_par_base_price_cad_m3: row.crw_c5_par_base_price_cad_m3,
        crw_c5_stream_price_cad_m3: row.crw_c5_stream_price_cad_m3
      }
    });

    console.log(`Updated CRW for ${row.month} ${row.year}`);
  }

  console.log('2025 CRW monthly data updated.');
}

async function main() {
  await seedCRW2025();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
