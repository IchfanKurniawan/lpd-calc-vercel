/**
 * ENGINE: csvTemplate.js
 * Generates the downloadable CSV template with sample data and column comments.
 * Pure JavaScript — no React dependency.
 */

export const CSV_TEMPLATE = `# ============================================================
# Greenship NB 1.3 — LPD Calculator CSV Import Template
# Standard: SNI 03-6197-2020 (Room-by-Room Method)
# Tool: Carbon Intelligence — Green Building Council Indonesia
# ============================================================
#
# INSTRUCTIONS:
# 1. Do NOT delete the SECTION header rows.
# 2. Replace sample rows with your actual data.
# 3. Add more rows as needed below the samples.
# 4. Columns starting with # are ignored (comments).
# 5. lamp_code must match a code in LIGHTING_DATABASE (L1, L2, …).
# 6. Valid typology values: Rumah_Tinggal | Perkantoran |
#    Lembaga_Pendidikan | Restaurant | Hotel | Rumah_Sakit |
#    Bandara | Pertokoan | Industri | Rumah_Ibadah
# 7. room_type must match the ID for the chosen typology.
#    (see the app dropdown for valid IDs)
# ============================================================

SECTION,LIGHTING_DATABASE
# code (auto-assigned),name,manufacturer,type,watts
# code column is ignored on import — codes are re-assigned L1, L2, …
L1,LED Panel 10W,Philips,LED,10
L2,LED Downlight 8W,Osram,LED,8
L3,LED Tube 18W,Panasonic,LED,18

SECTION,ROOMS
# room_name,typology,room_type,area_m2,lamp_code_1,lamp_points_1,lamp_code_2,lamp_points_2,lamp_code_3,lamp_points_3
Ruang Kerja A,Perkantoran,ruang_kerja_pk,120,L1,20,L2,5,,
Lobby Utama,Perkantoran,resepsionis_pk,80,L1,10,,,, 
Ruang Rapat 1,Perkantoran,rapat_pk,45,L2,12,,,,
`;

export default CSV_TEMPLATE;
