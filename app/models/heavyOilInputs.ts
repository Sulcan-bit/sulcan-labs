// app/models/heavyOilInputs.ts

export interface HeavyOilInputs {
  id?: number;

  // Section 1 – Month (FK)
  monthId: number;

  // Section 2 – Producer Raw Crude Properties
  producer_name: string;
  producer_volume_m3: number;
  producer_density_kg_m3: number;
  producer_TAN: number;

  // Section 3 – Condensate Source 1
  cond1_density_kg_m3: number;
  cond1_sulphur_pct: number;
  cond1_load_fee_cad_m3: number;
  cond1_transport_tt1_cad_m3: number;
  cond1_transport_tt2_cad_m3: number;
  cond1_transport_comp_cad_m3: number | null;

  // Section 4 – Condensate Source 2
  cond2_density_kg_m3: number;
  cond2_sulphur_pct: number;
  cond2_load_fee_cad_m3: number | null;
  cond2_transport_tt1_cad_m3: number | null;
  cond2_transport_tt2_cad_m3: number | null;
  cond2_transport_comp_cad_m3: number | null;

  // Section 5 – Butane (C4)
  butane_injection_rate_pct: number;

  // Section 6 – Historical / Paper Blend Density
  actual_blend_density_kg_m3?: number | null;
  paper_blend_density_kg_m3?: number | null;

  // Section 7 – Truck Terminal Fees
  tt1_fee_cad_m3: number;
  tt2_fee_cad_m3: number;
  tt_competitor_fee_cad_m3: number | null;

  // Section 8 – Pipeline Operator Fees
  pipeline_power_surcharge_cad_m3: number;
  pipeline_loss_allowance_pct: number;
  pipeline_toll_tt1_cad_m3: number;
  pipeline_toll_tt2_cad_m3: number;
  pipeline_toll_existcompetitor_cad_m3: number;

  // Section 9 – Profit Sharing
  tt1_diluent_sharing_pct: number;
  tt2_diluent_sharing_pct: number;
  comp_pipeline_diluent_sharing_pct: number;

  // Section 10 – Competing Pipeline Fees
  comp_tt1_toll_cad_m3: number;
  comp_pipeline_fee_cad_m3: number;
  comp_tt_fee_cad_m3: number;
  comp_pipeline_loss_allowance_pct: number;

  // Section 11 – Trucking Rates
  raw_crude_trucking_rate_cad_m3: number;
  raw_crude_truck_volume_m3: number;
  cond_trucking_rate_cad_m3: number;
  cond_truck_volume_m3: number;
  c4_trucking_rate_cad_m3: number;
  c4_truck_volume_m3: number;

  // Section 11b – Trucking Hours
  raw_crude_hours_tt1: number;
  raw_crude_hours_tt2: number;
  raw_crude_hours_comp: number;

  cond1_hours_tt1: number;
  cond1_hours_tt2: number;
  cond1_hours_comp: number;

  cond2_hours_tt1: number;
  cond2_hours_tt2: number;
  cond2_hours_comp: number;

  c4_hours_tt1: number;
  c4_hours_tt2: number;
  c4_hours_comp: number;

  // Section 12 – Premium Crude Values
  premium_crude_value_usd_bbl: number;
  hardisty_premium_crude_value_usd_bbl: number;

  // Section 13 – Blend Density Target
  target_blend_density: number;
  cond1_est_volume_m3: number | null;
}

