// app/api/heavy-oil/inputs/create/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // ------------------------------------------------------------
    // Normalize empty strings → null
    // ------------------------------------------------------------
    const normalized = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    );

    // ------------------------------------------------------------
    // Extract scenario metadata
    // ------------------------------------------------------------
    const {
      scenarioName,
      terminalOperator,
      terminalLocation,
      shrinkageModel,
      notes,
    } = normalized;

    // ------------------------------------------------------------
    // Extract TT1‑only HeavyOilInputs fields
    // ------------------------------------------------------------
    const {
      monthId,
      heavy_oil_stream,
      condensate_index_choice,

      producer_name,
      producer_volume_m3,
      producer_density_kg_m3,
      producer_TAN,
      target_blend_density,

      // Condensate 1
      cond1_density_kg_m3,
      cond1_sulphur_pct,
      cond1_load_fee_cad_m3,
      cond1_transport_tt1_cad_m3,
      cond1_hours_tt1,
      cond_trucking_rate_cad_m3,
      cond_truck_volume_m3,

      // Condensate 2
      cond2_density_kg_m3,
      cond2_sulphur_pct,
      cond2_load_fee_cad_m3,
      cond2_transport_tt1_cad_m3,
      cond2_hours_tt1,

      // Butane
      butane_injection_rate_pct,
      c4_trucking_rate_cad_m3,
      c4_truck_volume_m3,
      c4_hours_tt1,

      // Raw crude trucking
      raw_crude_trucking_rate_cad_m3,
      raw_crude_truck_volume_m3,
      raw_crude_hours_tt1,

      // Terminal fee (TT1 only)
      tt1_fee_cad_m3,

      // Pipeline fees (TT1 only)
      pipeline_power_surcharge_cad_m3,
      pipeline_loss_allowance_pct,
      pipeline_toll_tt1_cad_m3,

      // Profit sharing (TT1 only)
      tt1_diluent_sharing_pct,

      // Premium crude values
      premium_crude_value_usd_bbl,
      hardisty_premium_crude_value_usd_bbl,
    } = normalized;

    // ------------------------------------------------------------
    // Validate month exists
    // ------------------------------------------------------------
    const month = await prisma.monthlyData.findUnique({
      where: { id: Number(monthId) },
    });

    if (!month) {
      return NextResponse.json(
        { error: "Invalid monthId — MonthlyData not found." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // Create HeavyOilInputs (TT1‑only)
    // ------------------------------------------------------------
    const record = await prisma.heavyOilInputs.create({
      data: {
        userId: user.id,
        monthId: Number(monthId),

        heavy_oil_stream,
        condensate_index_choice,

        producer_name,
        producer_volume_m3: Number(producer_volume_m3),
        producer_density_kg_m3: Number(producer_density_kg_m3),
        producer_TAN: Number(producer_TAN),
        target_blend_density: Number(target_blend_density),

        // Condensate 1
        cond1_density_kg_m3: Number(cond1_density_kg_m3),
        cond1_sulphur_pct: Number(cond1_sulphur_pct),
        cond1_load_fee_cad_m3: Number(cond1_load_fee_cad_m3),
        cond1_transport_tt1_cad_m3: Number(cond1_transport_tt1_cad_m3),
        cond1_hours_tt1: Number(cond1_hours_tt1),
        cond_trucking_rate_cad_m3: Number(cond_trucking_rate_cad_m3),
        cond_truck_volume_m3: Number(cond_truck_volume_m3),

        // Condensate 2
        cond2_density_kg_m3: Number(cond2_density_kg_m3),
        cond2_sulphur_pct: Number(cond2_sulphur_pct),
        cond2_load_fee_cad_m3: Number(cond2_load_fee_cad_m3),
        cond2_transport_tt1_cad_m3: Number(cond2_transport_tt1_cad_m3),
        cond2_hours_tt1: Number(cond2_hours_tt1),

        // Butane
        butane_injection_rate_pct: Number(butane_injection_rate_pct),
        c4_trucking_rate_cad_m3: Number(c4_trucking_rate_cad_m3),
        c4_truck_volume_m3: Number(c4_truck_volume_m3),
        c4_hours_tt1: Number(c4_hours_tt1),

        // Raw crude trucking
        raw_crude_trucking_rate_cad_m3: Number(raw_crude_trucking_rate_cad_m3),
        raw_crude_truck_volume_m3: Number(raw_crude_truck_volume_m3),
        raw_crude_hours_tt1: Number(raw_crude_hours_tt1),

        // Terminal fee
        tt1_fee_cad_m3: Number(tt1_fee_cad_m3),

        // Pipeline fees
        pipeline_power_surcharge_cad_m3: Number(pipeline_power_surcharge_cad_m3),
        pipeline_loss_allowance_pct: Number(pipeline_loss_allowance_pct),
        pipeline_toll_tt1_cad_m3: Number(pipeline_toll_tt1_cad_m3),

        // Profit sharing
        tt1_diluent_sharing_pct: Number(tt1_diluent_sharing_pct),

        // Premium crude values
        premium_crude_value_usd_bbl: Number(premium_crude_value_usd_bbl),
        hardisty_premium_crude_value_usd_bbl: Number(hardisty_premium_crude_value_usd_bbl),
      },
    });

    // ------------------------------------------------------------
    // Create Scenario (with metadata)
    // ------------------------------------------------------------
    const scenario = await prisma.scenario.create({
      data: {
        userId: user.id,

        scenario_name: scenarioName,
        terminal_operator: terminalOperator,
        terminal_location: terminalLocation,
        shrinkage_model: shrinkageModel,
        notes,

        created_at_text: normalized.createdAt,

        model: "heavy-oil",
        monthId: Number(monthId),

        inputsId: record.id,

        // Store full JSON snapshot (metadata + inputs)
        inputsJson: body,
      },
    });

    return NextResponse.json(
      {
        message: "Heavy Oil Inputs saved successfully.",
        record,
        scenarioId: scenario.id,
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("Heavy Oil Inputs API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
