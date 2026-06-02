/**
 * SNI 03-6197-2020 — Lighting Power Density Database
 * Source: SNI 03-6197-2020, method: room-by-room (ruang demi ruang)
 * Used as lookup table for baseline LPD values per room type.
 *
 * Structure:
 *   typologyKey → { label: {id, en}, rooms: [{id, label:{id,en}, lpd}] }
 *
 * lpd unit: W/m²
 */

const SNI_DATABASE = Object.freeze({
  Rumah_Tinggal: {
    label: { id: 'Rumah Tinggal', en: 'Residential' },
    rooms: Object.freeze([
      { id: 'teras',           label: { id: 'Teras',           en: 'Porch / Terrace'    }, lpd: 1.08 },
      { id: 'ruang_tamu',      label: { id: 'Ruang tamu',      en: 'Living Room'         }, lpd: 4.41 },
      { id: 'ruang_keluarga',  label: { id: 'Ruang keluarga',  en: 'Family Room'         }, lpd: 4.41 },
      { id: 'ruang_makan',     label: { id: 'Ruang makan',     en: 'Dining Room'         }, lpd: 4.41 },
      { id: 'ruang_kerja_rt',  label: { id: 'Ruang kerja',     en: 'Study Room'          }, lpd: 7.53 },
      { id: 'kamar_tidur_rt',  label: { id: 'Kamar tidur',     en: 'Bedroom'             }, lpd: 6.35 },
      { id: 'kamar_mandi_rt',  label: { id: 'Kamar mandi',     en: 'Bathroom'            }, lpd: 6.78 },
      { id: 'laundry',         label: { id: 'Laundry',         en: 'Laundry Room'        }, lpd: 5.70 },
      { id: 'tangga_rt',       label: { id: 'Tangga',          en: 'Staircase'           }, lpd: 5.27 },
      { id: 'gudang_rt',       label: { id: 'Gudang',          en: 'Storage Room'        }, lpd: 3.88 },
      { id: 'dapur_rt',        label: { id: 'Dapur',           en: 'Kitchen'             }, lpd: 7.53 },
      { id: 'garasi',          label: { id: 'Garasi',          en: 'Garage'              }, lpd: 1.40 },
    ]),
  },

  Perkantoran: {
    label: { id: 'Perkantoran', en: 'Office' },
    rooms: Object.freeze([
      { id: 'resepsionis_pk',   label: { id: 'Ruang resepsionis',     en: 'Reception'           }, lpd: 7.97  },
      { id: 'direktur',         label: { id: 'Ruang direktur',        en: "Director's Office"   }, lpd: 7.53  },
      { id: 'ruang_kerja_pk',   label: { id: 'Ruang kerja',           en: 'Work Area'           }, lpd: 7.53  },
      { id: 'komputer_pk',      label: { id: 'Ruang komputer',        en: 'Computer Room'       }, lpd: 7.53  },
      { id: 'rapat_pk',         label: { id: 'Ruang rapat',           en: 'Meeting Room'        }, lpd: 7.53  },
      { id: 'gambar_pk',        label: { id: 'Ruang gambar',          en: 'Drawing Room'        }, lpd: 15.00 },
      { id: 'gudang_arsip',     label: { id: 'Gudang arsip',          en: 'Archive Storage'     }, lpd: 3.88  },
      { id: 'arsip_aktif',      label: { id: 'Ruang arsip aktif',     en: 'Active Archive Room' }, lpd: 5.49  },
      { id: 'tangga_darurat',   label: { id: 'Ruang tangga darurat',  en: 'Emergency Staircase' }, lpd: 5.27  },
      { id: 'parkir_pk',        label: { id: 'Ruang parkir',          en: 'Parking Area'        }, lpd: 1.40  },
    ]),
  },

  Lembaga_Pendidikan: {
    label: { id: 'Lembaga Pendidikan', en: 'Educational Institution' },
    rooms: Object.freeze([
      { id: 'kelas',        label: { id: 'Ruang kelas',                   en: 'Classroom'               }, lpd: 11.95 },
      { id: 'perpustakaan', label: { id: 'Ruang baca perpustakaan',       en: 'Library Reading Room'    }, lpd: 10.33 },
      { id: 'lab_pd',       label: { id: 'Laboratorium',                  en: 'Laboratory'              }, lpd: 12.16 },
      { id: 'komputer_pd',  label: { id: 'Ruang praktek komputer',        en: 'Computer Lab'            }, lpd: 10.12 },
      { id: 'lab_bahasa',   label: { id: 'Ruang laboratorium bahasa',     en: 'Language Lab'            }, lpd: 11.84 },
      { id: 'guru',         label: { id: 'Ruang guru',                    en: "Teachers' Room"          }, lpd: 7.53  },
      { id: 'olahraga',     label: { id: 'Ruang olahraga',               en: 'Sports Hall'             }, lpd: 10.66 },
      { id: 'gambar_pd',    label: { id: 'Ruang gambar',                 en: 'Drawing Studio'          }, lpd: 13.67 },
      { id: 'auditorium',   label: { id: 'Ruang Auditorium (exhibition)', en: 'Auditorium (Exhibition)' }, lpd: 6.57  },
      { id: 'lobby_pd',     label: { id: 'Lobby',                        en: 'Lobby'                   }, lpd: 9.04  },
      { id: 'tangga_pd',    label: { id: 'Tangga',                       en: 'Staircase'               }, lpd: 5.27  },
      { id: 'kantin_pd',    label: { id: 'Kantin',                       en: 'Canteen'                 }, lpd: 4.31  },
    ]),
  },

  Restaurant: {
    label: { id: 'Restaurant', en: 'Restaurant' },
    rooms: Object.freeze([
      { id: 'cepat_saji',  label: { id: 'Restaurant cepat saji', en: 'Fast Food Restaurant' }, lpd: 4.63 },
      { id: 'fine_dining', label: { id: 'Fine Dining',            en: 'Fine Dining'          }, lpd: 9.26 },
      { id: 'cafetaria',   label: { id: 'Cafetaria',              en: 'Cafeteria'            }, lpd: 4.31 },
      { id: 'coffee_shop', label: { id: 'Coffee shop',            en: 'Coffee Shop'          }, lpd: 4.63 },
      { id: 'lounge_rst',  label: { id: 'Lounge',                 en: 'Lounge'               }, lpd: 9.26 },
      { id: 'kasir_rst',   label: { id: 'Kasir',                  en: 'Cashier Area'         }, lpd: 4.63 },
      { id: 'pembersih',   label: { id: 'Ruang pembersih',        en: 'Cleaning Room'        }, lpd: 4.63 },
      { id: 'dapur_rst',   label: { id: 'Dapur',                  en: 'Kitchen'              }, lpd: 7.53 },
      { id: 'toilet_rst',  label: { id: 'Toilet',                 en: 'Toilet'               }, lpd: 6.78 },
    ]),
  },

  Hotel: {
    label: { id: 'Hotel', en: 'Hotel' },
    rooms: Object.freeze([
      { id: 'resepsionis_ht', label: { id: 'Ruang resepsionis',  en: 'Reception'          }, lpd: 9.04 },
      { id: 'lobi_ht',        label: { id: 'Lobi',               en: 'Lobby'              }, lpd: 5.49 },
      { id: 'serbaguna',      label: { id: 'Ruang serbaguna',    en: 'Multipurpose Hall'  }, lpd: 6.35 },
      { id: 'rapat_ht',       label: { id: 'Ruang rapat',        en: 'Meeting Room'       }, lpd: 7.53 },
      { id: 'makan_ht',       label: { id: 'Ruang makan hotel',  en: 'Hotel Dining Room'  }, lpd: 7.53 },
      { id: 'kafetaria_ht',   label: { id: 'Kafetaria',          en: 'Cafeteria'          }, lpd: 4.31 },
      { id: 'kamar_ht',       label: { id: 'Kamar tidur',        en: 'Bedroom'            }, lpd: 6.35 },
      { id: 'koridor_ht',     label: { id: 'Koridor',            en: 'Corridor'           }, lpd: 4.41 },
      { id: 'dapur_ht',       label: { id: 'Dapur hotel',        en: 'Hotel Kitchen'      }, lpd: 7.53 },
    ]),
  },

  Rumah_Sakit: {
    label: { id: 'Rumah Sakit / Balai Pengobatan', en: 'Hospital / Clinic' },
    rooms: Object.freeze([
      { id: 'tunggu_rs',       label: { id: 'Ruang tunggu',                     en: 'Waiting Room'             }, lpd: 7.64  },
      { id: 'kasir_rs',        label: { id: 'Kasir',                            en: 'Cashier'                  }, lpd: 7.64  },
      { id: 'apotik',          label: { id: 'Apotik',                           en: 'Pharmacy'                 }, lpd: 17.76 },
      { id: 'radiologi',       label: { id: 'Ruang Radiologi',                  en: 'Radiology Room'           }, lpd: 10.12 },
      { id: 'rawat_inap',      label: { id: 'Ruang rawat inap',                 en: 'Inpatient Ward'           }, lpd: 7.32  },
      { id: 'operasi',         label: { id: 'Ruang operasi',                    en: 'Operating Room'           }, lpd: 24.33 },
      { id: 'bersalin',        label: { id: 'Ruang bersalin',                   en: 'Delivery Room'            }, lpd: 15.07 },
      { id: 'lab_rs',          label: { id: 'Laboratorium',                     en: 'Laboratory'               }, lpd: 12.16 },
      { id: 'rehabilitasi',    label: { id: 'Ruang rekreasi dan rehabilitasi',  en: 'Recreation & Rehab'       }, lpd: 13.45 },
      { id: 'koridor_rs',      label: { id: 'Ruang koridor',                    en: 'Corridor'                 }, lpd: 7.64  },
      { id: 'kantor_rs',       label: { id: 'Ruang kantor staff',               en: 'Staff Office'             }, lpd: 7.64  },
      { id: 'kamar_mandi_rs',  label: { id: 'Kamar mandi & toilet pasien',      en: 'Patient Bathroom & WC'    }, lpd: 6.78  },
    ]),
  },

  Bandara: {
    label: { id: 'Bandara', en: 'Airport' },
    rooms: Object.freeze([
      { id: 'atm',       label: { id: 'ATM',                          en: 'ATM'                  }, lpd: 6.57 },
      { id: 'bagasi',    label: { id: 'Conveyer bagasi',              en: 'Baggage Conveyor Area' }, lpd: 4.20 },
      { id: 'imigrasi',  label: { id: 'Ruang Pemeriksaan Imigrasi',   en: 'Immigration Check'    }, lpd: 5.49 },
      { id: 'eskalator', label: { id: 'Tangga berjalan (escalators)', en: 'Escalators'           }, lpd: 5.27 },
      { id: 'gate',      label: { id: 'Ruang Tunggu (gate areas)',    en: 'Gate Waiting Area'    }, lpd: 2.69 },
      { id: 'tiket',     label: { id: 'Tickets Counters',             en: 'Ticket Counters'      }, lpd: 5.49 },
      { id: 'toilet_bd', label: { id: 'Toilet',                      en: 'Toilet'               }, lpd: 6.78 },
    ]),
  },

  Pertokoan: {
    label: { id: 'Pertokoan / Ruang Pamer', en: 'Retail / Showroom' },
    rooms: Object.freeze([
      { id: 'pamer_besar',    label: { id: 'Ruang pamer objek besar (mis. mobil)', en: 'Large Object Showroom'  }, lpd: 10.76 },
      { id: 'jual_kecil',     label: { id: 'Area penjualan kecil',                en: 'Small Retail Area'      }, lpd: 8.83  },
      { id: 'jual_besar',     label: { id: 'Area penjualan besar',               en: 'Large Retail Area'      }, lpd: 8.83  },
      { id: 'kasir_pt',       label: { id: 'Area kasir',                          en: 'Cashier Area'           }, lpd: 8.83  },
      { id: 'toko_kue',       label: { id: 'Toko kue dan makanan',               en: 'Bakery & Food Store'    }, lpd: 10.76 },
      { id: 'toko_bunga',     label: { id: 'Toko bunga',                         en: 'Flower Shop'            }, lpd: 10.76 },
      { id: 'toko_buku',      label: { id: 'Toko buku dan alat tulis/gambar',    en: 'Book & Stationery'      }, lpd: 10.76 },
      { id: 'toko_perhiasan', label: { id: 'Toko perhiasan arloji',              en: 'Jewelry & Watch Store'  }, lpd: 10.76 },
      { id: 'toko_kulit',     label: { id: 'Toko barang kulit dan sepatu',       en: 'Leather & Shoe Store'   }, lpd: 10.76 },
      { id: 'toko_pakaian',   label: { id: 'Toko pakaian',                       en: 'Clothing Store'         }, lpd: 10.76 },
      { id: 'swalayan',       label: { id: 'Pasar swalayan',                     en: 'Supermarket'            }, lpd: 10.76 },
      { id: 'toko_mainan',    label: { id: 'Toko mainan',                        en: 'Toy Store'              }, lpd: 10.76 },
      { id: 'toko_listrik',   label: { id: 'Toko alat listrik (TV, radio, dll)', en: 'Electronics Store'      }, lpd: 10.76 },
      { id: 'toko_olahraga',  label: { id: 'Toko alat musik dan olahraga',      en: 'Music & Sports Store'   }, lpd: 10.76 },
    ]),
  },

  Industri: {
    label: { id: 'Industri', en: 'Industrial' },
    rooms: Object.freeze([
      { id: 'peralatan',     label: { id: 'Ruang peralatan',                         en: 'Equipment Room'         }, lpd: 8.18  },
      { id: 'manufaktur',    label: { id: 'Area manufaktur rinci',                   en: 'Detailed Manufacturing' }, lpd: 8.61  },
      { id: 'extra_high_bay',label: { id: 'Extra high bay area (tinggi ≥ 15.24 m)',  en: 'Extra High Bay ≥15.24m' }, lpd: 15.28 },
      { id: 'high_bay',      label: { id: 'High bay area (tinggi 7.62–15.24 m)',     en: 'High Bay 7.62–15.24m'   }, lpd: 13.35 },
      { id: 'low_bay',       label: { id: 'Low bay area (tinggi < 7.62 m)',          en: 'Low Bay <7.62m'         }, lpd: 9.26  },
    ]),
  },

  Rumah_Ibadah: {
    label: { id: 'Rumah Ibadah', en: 'Place of Worship' },
    rooms: Object.freeze([
      { id: 'ibadah',    label: { id: 'Rumah Ibadah',        en: 'Worship Hall'    }, lpd: 7.53 },
      { id: 'gudang_ri', label: { id: 'Gudang',              en: 'Storage Room'    }, lpd: 3.55 },
      { id: 'kantor_ri', label: { id: 'Kantor / Ruang kerja',en: 'Office / Workroom'}, lpd: 7.53 },
    ]),
  },
});

export const TYPOLOGY_KEYS = Object.keys(SNI_DATABASE);

export default SNI_DATABASE;
