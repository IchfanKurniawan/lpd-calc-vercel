/**
 * English String Constants
 * Usage: STRINGS.en[key] or import STRINGS from './data/i18n.js'; STRINGS.en[key]
 */
const STRINGS = Object.freeze({
  en: {
    app_name: 'LPD Calculator',
    tab_a: 'A · Lighting Database',
    tab_b: 'B · Room Data',
    tab_c: 'C · Results',
    tab_a_short: 'Lighting DB',
    tab_b_short: 'Room Data',
    tab_c_short: 'Results',
    new_calc: 'New Calculation',
    project_placeholder: 'Project Name…',
    import: 'Import JSON',
    export_json: 'Export JSON',
    data_menu: 'Data import and export',
    std_badge: 'SNI 03-6197-2020',

    sec_a: 'Lighting Database',
    sec_a_sub: 'All lamp types used in the building',
    sec_b: 'Room & Lighting System',
    sec_b_sub: 'Room-by-room data: typology, room type, area, and lamp assignments',
    sec_c: 'Calculation Results',
    sec_c_sub: 'Auto-computed from all input data',

    col_code: 'Code',
    col_name: 'Lamp Name',
    col_mfr: 'Manufacturer',
    col_type: 'Type',
    col_watts: 'Power (W)',
    col_no: 'No.',
    col_room: 'Room Name',
    col_typology: 'Typology',
    col_room_type: 'Room Type',
    col_area: 'Area (m²)',
    col_lamps: 'Lighting System',
    col_std_lpd: 'Std LPD (W/m²)',
    col_design_lpd: 'Design LPD (W/m²)',
    col_actions: '',

    add_lamp_db: '+ Add Lamp Type',
    add_room: '+ Add Room',
    add_lamp_room: '+ Lamp',

    res_total_area: 'Total Room Area',
    res_baseline: 'LPD Baseline',
    res_design: 'LPD Design',
    res_reduction: 'LPD Reduction',
    res_reduction_pct: '% LPD Reduction',
    vs_baseline: 'vs baseline',
    results_blocked: 'Calculation results are hidden because {count} room row(s) still have incomplete data. Complete every row in Room Data to calculate and show the results.',
    no_complete_lamps: 'No complete lamp types available. Complete lamp data (Name + Power) in Table A to enable new selections.',
    incomplete: 'incomplete',
    room_status_complete: 'Room data complete',
    room_status_incomplete: 'Incomplete room data. Fill in the room name, typology, room type, area, and select at least one lighting system.',

    select_typology: '— Select Typology —',
    select_room_type: '— Select Room Type —',
    select_lamp: '— Code —',

    confirm_reset_title: 'Start New Calculation?',
    confirm_reset_body: 'All entered data will be cleared. This action cannot be undone.',
    confirm_import_title: 'Import JSON?',
    confirm_import_body: 'Your current data will be replaced by the imported file. Are you sure you want to continue?',
    confirm_delete_lamp_title: 'Lighting system is in use',
    confirm_delete_lamp_body: 'Lamp {code} is used in {count} room row(s). Deleting it will remove it from those rooms and renumber the remaining lamp codes. Continue?',
    confirm_delete_lamp_confirm: 'Delete anyway',
    confirm_yes: 'Yes, Continue',
    confirm_cancel: 'Cancel',

    toast_import_ok: 'Data imported successfully',
    toast_import_err: 'Import failed: ',
    toast_export_ok: 'File downloaded successfully',
    toast_reset_ok: 'New calculation started',

    unit_m2: 'm²',
    unit_wm2: 'W/m²',

    no_lamps_yet: 'No lamp types yet. Click "+ Add Lamp Type" to begin.',
    no_rooms_yet: 'No rooms yet. Click "+ Add Room" to begin.',
    fill_lamp_first: 'Add lamp types in Table A first',

    footer: 'Copyright © 2026 GREEN BUILDING COUNCIL INDONESIA. All Rights Reserved.',
  },
});

export default STRINGS;
