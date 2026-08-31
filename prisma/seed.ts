// sulcan-labs/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedStreamInfo() {
  const filePath = path.join(process.cwd(), 'stream-info.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const streams = JSON.parse(raw);

  for (const stream of streams) {
    await prisma.streamInfo.upsert({
      where: { acronym: stream.acronym },
      update: {
        full_name: stream.full_name,
        description: stream.description,
        category: stream.category
      },
      create: {
        acronym: stream.acronym,
        full_name: stream.full_name,
        description: stream.description,
        category: stream.category
      }
    });
  }

  console.log('StreamInfo table updated.');
}

async function seedMonthlyData() {
  const dataDir = path.join(process.cwd(), 'monthly-data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort();

  const streams = {
    msw: await prisma.streamInfo.findUnique({ where: { acronym: 'MSW' } }),
    c5: await prisma.streamInfo.findUnique({ where: { acronym: 'C5+' } }),
    ftsk: await prisma.streamInfo.findUnique({ where: { acronym: 'FTSK' } }),
    peace: await prisma.streamInfo.findUnique({ where: { acronym: 'PEACE' } }),
    kaps: await prisma.streamInfo.findUnique({ where: { acronym: 'KAPS' } }),
    wcs: await prisma.streamInfo.findUnique({ where: { acronym: 'WCS' } }),
    c4: await prisma.streamInfo.findUnique({ where: { acronym: 'C4' } })
  };

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const rows = JSON.parse(raw);

    for (const row of rows) {
      const month = row.month.trim();

      await prisma.monthlyData.upsert({
        where: {
          year_month: {
            year: row.year,
            month
          }
        },

        update: {
          days_in_month: row.days_in_month,

          msw_stream_id: streams.msw?.id ?? null,
          c5_stream_id: streams.c5?.id ?? null,
          ftsk_stream_id: streams.ftsk?.id ?? null,
          peace_stream_id: streams.peace?.id ?? null,
          kaps_stream_id: streams.kaps?.id ?? null,
          wcs_stream_id: streams.wcs?.id ?? null,
          c4_stream_id: streams.c4?.id ?? null,

          // WTI & FX
          wti_cma_usd_bbl: row.wti_cma_usd_bbl,
          fx_cad_usd: row.fx_cad_usd,

          // MSW
          msw_diff_usd_bbl: row.msw_diff_usd_bbl,
          msw_wadf_cad_m3: row.msw_wadf_cad_m3,
          msw_par_base_price_usd_bbl: row.msw_par_base_price_usd_bbl,
          msw_par_base_price_cad_m3: row.msw_par_base_price_cad_m3,
          msw_stream_price_cad_m3: row.msw_stream_price_cad_m3,
          msw_to_wti_pct: row.msw_to_wti_pct,

          // C5+
          c5_vs_msw_diff_usd_bbl: row.c5_vs_msw_diff_usd_bbl,

          // FTSK
          ftsk_c5_diff_usd_bbl: row.ftsk_c5_diff_usd_bbl,
          ftsk_c5_par_base_price_usd_bbl: row.ftsk_c5_par_base_price_usd_bbl,
          ftsk_c5_par_base_price_cad_m3: row.ftsk_c5_par_base_price_cad_m3,
          ftsk_c5_stream_price_cad_m3: row.ftsk_c5_stream_price_cad_m3,
          ftsk_c5_to_wti_pct: row.ftsk_c5_to_wti_pct,

          // PEACE
          peace_c5_diff_usd_bbl: row.peace_c5_diff_usd_bbl,
          peace_c5_par_base_price_usd_bbl: row.peace_c5_par_base_price_usd_bbl,
          peace_c5_par_base_price_cad_m3: row.peace_c5_par_base_price_cad_m3,
          peace_c5_stream_price_cad_m3: row.peace_c5_stream_price_cad_m3,
          peace_c5_to_wti_pct: row.peace_c5_to_wti_pct,

          // KAPS
          kaps_c5_diff_usd_bbl: row.kaps_c5_diff_usd_bbl,

          // CRW
          crw_c5_enb_wadf_cad_m3: row.crw_c5_enb_wadf_cad_m3,

          // C5+ Density
          c5_density_slope_cad_m3_per_kg_m3: row.c5_density_slope_cad_m3_per_kg_m3,
          c5_allow_price_cad_m3: row.c5_allow_price_cad_m3,

          // WCS
          wcs_diff_usd_bbl: row.wcs_diff_usd_bbl,
          wcs_price_cad_m3: row.wcs_price_cad_m3,
          wcs_price_usd_bbl: row.wcs_price_usd_bbl,
          msw_vs_wcs_diff_usd_bbl: row.msw_vs_wcs_diff_usd_bbl,
          wcs_vs_wti_usd_bbl: row.wcs_vs_wti_usd_bbl,

          // Heavy oil
          hvy_all_price_cad_m3: row.hvy_all_price_cad_m3 ?? null,
          wcs_vs_c5_diluent_cost_usd_bbl: row.wcs_vs_c5_diluent_cost_usd_bbl ?? null,

          // ENB
          enb_ref_temp: row.enb_ref_temp ?? null,

          // C4
          c4_to_wti_usd_bbl: row.c4_to_wti_usd_bbl,
          c4_price_usd_bbl: row.c4_price_usd_bbl,
          c4_price_cad_m3: row.c4_price_cad_m3,
          c4_landed_marten_hills_pct_wti: row.c4_landed_marten_hills_pct_wti,

          // MSY
          msy_diff_index_usd_bbl: row.msy_diff_index_usd_bbl ?? null,
          msy_to_msw_diff_usd_bbl: row.msy_to_msw_diff_usd_bbl ?? null,

          // MSE
          mse_diff_index_usd_bbl: row.mse_diff_index_usd_bbl,
          mse_vs_msw_diff_usd_bbl: row.mse_vs_msw_diff_usd_bbl,

          // CAL
          cal_diff_usd_bbl: row.cal_diff_usd_bbl,
          cal_wadf_cad_m3: row.cal_wadf_cad_m3,
          cal_par_base_price_usd_bbl: row.cal_par_base_price_usd_bbl,
          cal_par_base_price_cad_m3: row.cal_par_base_price_cad_m3,
          cal_stream_price_cad_m3: row.cal_stream_price_cad_m3,
          cal_to_wti_pct: row.cal_to_wti_pct,

          // LSB
          lsb_diff_usd_bbl: row.lsb_diff_usd_bbl,
          lsb_wadf_cad_m3: row.lsb_wadf_cad_m3,
          lsb_par_base_price_usd_bbl: row.lsb_par_base_price_usd_bbl,
          lsb_par_base_price_cad_m3: row.lsb_par_base_price_cad_m3,
          lsb_stream_price_cad_m3: row.lsb_stream_price_cad_m3,
          lsb_to_wti_pct: row.lsb_to_wti_pct,

          // BRN
          brn_diff_usd_bbl: row.brn_diff_usd_bbl,
          brn_wadf_cad_m3: row.brn_wadf_cad_m3,
          brn_par_base_price_usd_bbl: row.brn_par_base_price_usd_bbl,
          brn_par_base_price_cad_m3: row.brn_par_base_price_cad_m3,
          brn_stream_price_cad_m3: row.brn_stream_price_cad_m3,
          brn_to_wti_pct: row.brn_to_wti_pct,

          // BRS
          brs_diff_usd_bbl: row.brs_diff_usd_bbl,
          brs_wadf_cad_m3: row.brs_wadf_cad_m3,
          brs_par_base_price_usd_bbl: row.brs_par_base_price_usd_bbl,
          brs_par_base_price_cad_m3: row.brs_par_base_price_cad_m3,
          brs_stream_price_cad_m3: row.brs_stream_price_cad_m3,
          brs_to_wti_pct: row.brs_to_wti_pct,

          // CHV
          chv_diff_usd_bbl: row.chv_diff_usd_bbl,
          chv_price_usd_bbl: row.chv_price_usd_bbl,
          chv_price_cad_m3: row.chv_price_cad_m3,

          // CWH
          cwh_diff_usd_bbl: row.cwh_diff_usd_bbl,
          cwh_price_usd_bbl: row.cwh_price_usd_bbl,
          cwh_price_cad_m3: row.cwh_price_cad_m3,

          // LLB
          llb_diff_usd_bbl: row.llb_diff_usd_bbl,
          llb_price_usd_bbl: row.llb_price_usd_bbl,
          llb_price_cad_m3: row.llb_price_cad_m3,

          // WCB
          wcb_diff_usd_bbl: row.wcb_diff_usd_bbl,
          wcb_price_usd_bbl: row.wcb_price_usd_bbl,
          wcb_price_cad_m3: row.wcb_price_cad_m3
        },

        create: {
          year: row.year,
          month,
          days_in_month: row.days_in_month,

          msw_stream_id: streams.msw?.id ?? null,
          c5_stream_id: streams.c5?.id ?? null,
          ftsk_stream_id: streams.ftsk?.id ?? null,
          peace_stream_id: streams.peace?.id ?? null,
          kaps_stream_id: streams.kaps?.id ?? null,
          wcs_stream_id: streams.wcs?.id ?? null,
          c4_stream_id: streams.c4?.id ?? null,

          // identical to update block
          wti_cma_usd_bbl: row.wti_cma_usd_bbl,
          fx_cad_usd: row.fx_cad_usd,
          msw_diff_usd_bbl: row.msw_diff_usd_bbl,
          msw_wadf_cad_m3: row.msw_wadf_cad_m3,
          msw_par_base_price_usd_bbl: row.msw_par_base_price_usd_bbl,
          msw_par_base_price_cad_m3: row.msw_par_base_price_cad_m3,
          msw_stream_price_cad_m3: row.msw_stream_price_cad_m3,
          msw_to_wti_pct: row.msw_to_wti_pct,

          c5_vs_msw_diff_usd_bbl: row.c5_vs_msw_diff_usd_bbl,

          ftsk_c5_diff_usd_bbl: row.ftsk_c5_diff_usd_bbl,
          ftsk_c5_par_base_price_usd_bbl: row.ftsk_c5_par_base_price_usd_bbl,
          ftsk_c5_par_base_price_cad_m3: row.ftsk_c5_par_base_price_cad_m3,
          ftsk_c5_stream_price_cad_m3: row.ftsk_c5_stream_price_cad_m3,
          ftsk_c5_to_wti_pct: row.ftsk_c5_to_wti_pct,

          peace_c5_diff_usd_bbl: row.peace_c5_diff_usd_bbl,
          peace_c5_par_base_price_usd_bbl: row.peace_c5_par_base_price_usd_bbl,
          peace_c5_par_base_price_cad_m3: row.peace_c5_par_base_price_cad_m3,
          peace_c5_stream_price_cad_m3: row.peace_c5_stream_price_cad_m3,
          peace_c5_to_wti_pct: row.peace_c5_to_wti_pct,

          kaps_c5_diff_usd_bbl: row.kaps_c5_diff_usd_bbl,

          crw_c5_enb_wadf_cad_m3: row.crw_c5_enb_wadf_cad_m3,

          c5_density_slope_cad_m3_per_kg_m3: row.c5_density_slope_cad_m3_per_kg_m3,
          c5_allow_price_cad_m3: row.c5_allow_price_cad_m3,

          wcs_diff_usd_bbl: row.wcs_diff_usd_bbl,
          wcs_price_cad_m3: row.wcs_price_cad_m3,
          wcs_price_usd_bbl: row.wcs_price_usd_bbl,
          msw_vs_wcs_diff_usd_bbl: row.msw_vs_wcs_diff_usd_bbl,
          wcs_vs_wti_usd_bbl: row.wcs_vs_wti_usd_bbl,

          hvy_all_price_cad_m3: row.hvy_all_price_cad_m3 ?? null,
          wcs_vs_c5_diluent_cost_usd_bbl: row.wcs_vs_c5_diluent_cost_usd_bbl ?? null,

          enb_ref_temp: row.enb_ref_temp ?? null,

          c4_to_wti_usd_bbl: row.c4_to_wti_usd_bbl,
          c4_price_usd_bbl: row.c4_price_usd_bbl,
          c4_price_cad_m3: row.c4_price_cad_m3,
          c4_landed_marten_hills_pct_wti: row.c4_landed_marten_hills_pct_wti,

          msy_diff_index_usd_bbl: row.msy_diff_index_usd_bbl ?? null,
          msy_to_msw_diff_usd_bbl: row.msy_to_msw_diff_usd_bbl ?? null,

          mse_diff_index_usd_bbl: row.mse_diff_index_usd_bbl,
          mse_vs_msw_diff_usd_bbl: row.mse_vs_msw_diff_usd_bbl,

          cal_diff_usd_bbl: row.cal_diff_usd_bbl,
          cal_wadf_cad_m3: row.cal_wadf_cad_m3,
          cal_par_base_price_usd_bbl: row.cal_par_base_price_usd_bbl,
          cal_par_base_price_cad_m3: row.cal_par_base_price_cad_m3,
          cal_stream_price_cad_m3: row.cal_stream_price_cad_m3,
          cal_to_wti_pct: row.cal_to_wti_pct,

          lsb_diff_usd_bbl: row.lsb_diff_usd_bbl,
          lsb_wadf_cad_m3: row.lsb_wadf_cad_m3,
          lsb_par_base_price_usd_bbl: row.lsb_par_base_price_usd_bbl,
          lsb_par_base_price_cad_m3: row.lsb_par_base_price_cad_m3,
          lsb_stream_price_cad_m3: row.lsb_stream_price_cad_m3,
          lsb_to_wti_pct: row.lsb_to_wti_pct,

          brn_diff_usd_bbl: row.brn_diff_usd_bbl,
          brn_wadf_cad_m3: row.brn_wadf_cad_m3,
          brn_par_base_price_usd_bbl: row.brn_par_base_price_usd_bbl,
          brn_par_base_price_cad_m3: row.brn_par_base_price_cad_m3,
          brn_stream_price_cad_m3: row.brn_stream_price_cad_m3,
          brn_to_wti_pct: row.brn_to_wti_pct,

          brs_diff_usd_bbl: row.brs_diff_usd_bbl,
          brs_wadf_cad_m3: row.brs_wadf_cad_m3,
          brs_par_base_price_usd_bbl: row.brs_par_base_price_usd_bbl,
          brs_par_base_price_cad_m3: row.brs_par_base_price_cad_m3,
          brs_stream_price_cad_m3: row.brs_stream_price_cad_m3,
          brs_to_wti_pct: row.brs_to_wti_pct,

          chv_diff_usd_bbl: row.chv_diff_usd_bbl,
          chv_price_usd_bbl: row.chv_price_usd_bbl,
          chv_price_cad_m3: row.chv_price_cad_m3,

          cwh_diff_usd_bbl: row.cwh_diff_usd_bbl,
          cwh_price_usd_bbl: row.cwh_price_usd_bbl,
          cwh_price_cad_m3: row.cwh_price_cad_m3,

          llb_diff_usd_bbl: row.llb_diff_usd_bbl,
          llb_price_usd_bbl: row.llb_price_usd_bbl,
          llb_price_cad_m3: row.llb_price_cad_m3,

          wcb_diff_usd_bbl: row.wcb_diff_usd_bbl,
          wcb_price_usd_bbl: row.wcb_price_usd_bbl,
          wcb_price_cad_m3: row.wcb_price_cad_m3
        }
      });
    }

    console.log(`Loaded: ${file}`);
  }

  console.log('MonthlyData table populated.');
}

async function main() {
  await seedStreamInfo();
  await seedMonthlyData();

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
