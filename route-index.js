/* ------------ Route index (dropdown options) ------------- */
/* tempC    = typical race-day temperature °C (historical avg) */
/* humidity = typical race-day relative humidity % (historical)*/
const ROUTE_INDEX = {

  /* ── Climbing / Special ─────────────────────────────────── */
  alpe_d_huez: {
    name: "Alpe d'Huez (Climb)",
    file: "routes/Alpe_d_Huez.json",
    tempC: 18, humidity: 55,
  },
  ventoux: {
    name: "Mont Ventoux (Climb)",
    file: "routes/Ventoux.json",
    tempC: 22, humidity: 45,
  },
  taiwan_kotm: {
    name: "Taiwan King of the Mountain",
    file: "routes/Taiwan_King_of_the_Mountain.json",
    tempC: 28, humidity: 75,
  },

  /* ── Xtri ───────────────────────────────────────────────── */
  xtri_norseman: {
    name: "Xtri Norseman",
    file: "routes/Xtri_Norseman.json",
    tempC: 14, humidity: 65,
  },
  xtri_patagonaman: {
    name: "Xtri Patagonaman",
    file: "routes/Xtri_Pantagoniaman.json",
    tempC: 15, humidity: 62,
  },

  /* ── T100 ───────────────────────────────────────────────── */
  t100_french_riviera: {
    name: "T100 French Riviera",
    file: "routes/T100_French_Riviera.json",
    tempC: 24, humidity: 55,
  },
  t100_singapore: {
    name: "T100 Singapore",
    file: "routes/T100_Singapore.json",
    tempC: 31, humidity: 80,
  },

  /* ── STC ────────────────────────────────────────────────── */
  stc703_dishuihu: {
    name: "STC70.3 Dishuihu",
    file: "routes/STC70.3_Dishuihu.json",
    tempC: 25, humidity: 70,
  },
  stc703_qiandaohu: {
    name: "STC70.3 Qiandaohu",
    file: "routes/STC70.3_Qiandaohu.json",
    tempC: 22, humidity: 65,
  },

  /* ── IronCube ───────────────────────────────────────────── */
  ironcube_1lap: {
    name: "IronCube 1 Lap",
    file: "routes/IronCube_1Lap.json",
    tempC: 20, humidity: 60,
  },

  /* ── Challenge 70.3 ─────────────────────────────────────── */
  challenge703_israman: {
    name: "Challenge703 Israman",
    file: "routes/Challenge70.3_Israman.json",
    tempC: 18, humidity: 55,
  },
  challenge703_oman: {
    name: "Challenge703 Oman",
    file: "routes/Challenge70.3_Oman.json",
    tempC: 24, humidity: 65,
  },
  challenge703_rio: {
    name: "Challenge703 Rio de Janeiro",
    file: "routes/Challenge70.3_Rio_de_Janeiro.json",
    tempC: 26, humidity: 75,
  },
  challenge703_sir_bani_yas: {
    name: "Challenge703 Sir Bani Yas",
    file: "routes/Challenge70.3_Sir_Bani_Yas.json",
    tempC: 28, humidity: 60,
  },
  challenge703_wanaka: {
    name: "Challenge703 Wanaka Half",
    file: "routes/Challenge70.3_Wanaka_Half.json",
    tempC: 20, humidity: 50,
  },
  challenge703_xiamen: {
    name: "Challenge703 Xiamen",
    file: "routes/Challenge70.3_Xiamen.json",
    tempC: 16, humidity: 65,
  },

  /* ── Challenge Full ─────────────────────────────────────── */
  challenge_almere: {
    name: "Challenge Almere-Amsterdam",
    file: "routes/Challenge_Almere_Amsterdam.json",
    tempC: 18, humidity: 70,
  },
  challenge_israman: {
    name: "Challenge Israman",
    file: "routes/Challenge_Israman.json",
    tempC: 18, humidity: 55,
  },
  challenge_roth: {
    name: "Challenge Roth",
    file: "routes/Challenge_Roth.json",
    tempC: 24, humidity: 60,
  },

  /* ── IM 70.3 ─────────────────────────────────────────────── */
  im703_alcudia_mallorca: {
    name: "IM70.3 Alcudia Mallorca",
    file: "routes/IM70.3_Alcudia_mallorca.json",
    tempC: 24, humidity: 55,
  },
  im703_aracaju: {
    name: "IM70.3 Aracaju Sergipe",
    file: "routes/IM70.3_Aracaju_Sergipe.json",
    tempC: 30, humidity: 75,
  },
  im703_augusta: {
    name: "IM70.3 Augusta",
    file: "routes/IM70.3_Augusta.json",
    tempC: 28, humidity: 65,
  },
  im703_bahrain: {
    name: "IM70.3 Bahrain",
    file: "routes/IM70.3_Bahrain.json",
    tempC: 26, humidity: 55,
  },
  im703_barranquilla: {
    name: "IM70.3 Barranquilla",
    file: "routes/IM70.3_Barranquilla.json",
    tempC: 30, humidity: 75,
  },
  im703_boise: {
    name: "IM70.3 Boise",
    file: "routes/IM70.3_Boise.json",
    tempC: 28, humidity: 30,
  },
  im703_boulder: {
    name: "IM70.3 Boulder",
    file: "routes/IM70.3_Boulder.json",
    tempC: 26, humidity: 35,
  },
  im703_cascais: {
    name: "IM70.3 Cascais",
    file: "routes/IM70.3_Cascais.json",
    tempC: 22, humidity: 60,
  },
  im703_cebu: {
    name: "IM70.3 Cebu",
    file: "routes/IM70.3_Cebu.json",
    tempC: 31, humidity: 78,
  },
  im703_chattanooga: {
    name: "IM70.3 Chattanooga",
    file: "routes/IM70.3_Chattanooga.json",
    tempC: 28, humidity: 65,
  },
  im703_coeur_d_alene: {
    name: "IM70.3 Coeur d'Alene",
    file: "routes/IM70.3_Coeur_d_alene.json",
    tempC: 22, humidity: 40,
  },
  im703_cozumel: {
    name: "IM70.3 Cozumel",
    file: "routes/IM70.3_Cozumel.json",
    tempC: 30, humidity: 78,
  },
  im703_dallas: {
    name: "IM70.3 Dallas Little Elm",
    file: "routes/IM70.3_Dallas_Little_Elm.json",
    tempC: 22, humidity: 55,
  },
  im703_danang: {
    name: "IM70.3 Da Nang",
    file: "routes/IM70.3_Danang.json",
    tempC: 32, humidity: 75,
  },
  im703_desaru: {
    name: "IM70.3 Desaru Coast",
    file: "routes/IM70.3_DESARU_COAST.json",
    tempC: 31, humidity: 82,
  },
  im703_durban: {
    name: "IM70.3 Durban",
    file: "routes/IM70.3_Durban.json",
    tempC: 22, humidity: 65,
  },
  im703_eagleman: {
    name: "IM70.3 Eagleman",
    file: "routes/IM70.3_Eagleman.json",
    tempC: 28, humidity: 70,
  },
  im703_elsinore: {
    name: "IM70.3 Elsinore",
    file: "routes/IM70.3_Elsinore.json",
    tempC: 18, humidity: 65,
  },
  im703_emilia_romagna: {
    name: "IM70.3 Emilia Romagna",
    file: "routes/IM70.3_Emilia_Romagna.json",
    tempC: 24, humidity: 58,
  },
  im703_florida: {
    name: "IM70.3 Florida",
    file: "routes/IM70.3_Florida.json",
    tempC: 26, humidity: 65,
  },
  im703_geelong: {
    name: "IM70.3 Geelong",
    file: "routes/IM70.3_Geelong.json",
    tempC: 24, humidity: 55,
  },
  im703_goa: {
    name: "IM70.3 Goa",
    file: "routes/IM70.3_Goa.json",
    tempC: 28, humidity: 65,
  },
  im703_goseong: {
    name: "IM70.3 Goseong",
    file: "routes/IM70.3_Goseong.json",
    tempC: 28, humidity: 70,
  },
  im703_gulf_coast: {
    name: "IM70.3 Gulf Coast",
    file: "routes/IM70.3_Gulf_Coast.json",
    tempC: 28, humidity: 72,
  },
  im703_hawaii: {
    name: "IM70.3 Hawaii",
    file: "routes/IM70.3_Hawaii.json",
    tempC: 28, humidity: 62,
  },
  im703_hengqin: {
    name: "IM70.3 Hengqin",
    file: "routes/IM70.3_Hengqin.json",
    tempC: 26, humidity: 72,
  },
  im703_jonkoping: {
    name: "IM70.3 Jonkoping",
    file: "routes/IM70.3_J\u00f6nk\u00f6ping.json",
    tempC: 18, humidity: 62,
  },
  im703_kenting: {
    name: "IM70.3 Kenting",
    file: "routes/IM70.3_Kenting.json",
    tempC: 24, humidity: 68,
  },
  im703_knokke_heist: {
    name: "IM70.3 Knokke-Heist",
    file: "routes/IM70.3_KNOKKE_HEIST.json",
    tempC: 18, humidity: 65,
  },
  im703_kraichgau: {
    name: "IM70.3 Kraichgau",
    file: "routes/IM70.3_KRAICHGAU.json",
    tempC: 18, humidity: 60,
  },
  im703_la_quinta: {
    name: "IM70.3 La Quinta",
    file: "routes/IM70.3_La_Quinta.json",
    tempC: 18, humidity: 38,
  },
  im703_langkawi: {
    name: "IM70.3 Langkawi",
    file: "routes/IM70.3_Langkawi.json",
    tempC: 32, humidity: 80,
  },
  im703_maine: {
    name: "IM70.3 Maine",
    file: "routes/IM70.3_maine.json",
    tempC: 18, humidity: 60,
  },
  im703_marathon_greece: {
    name: "IM70.3 Marathon Greece",
    file: "routes/IM70.3_Marathon_Greece.json",
    tempC: 30, humidity: 50,
  },
  im703_marbella: {
    name: "IM70.3 Marbella",
    file: "routes/IM70.3_Marbella.json",
    tempC: 22, humidity: 55,
  },
  im703_michigan: {
    name: "IM70.3 Michigan",
    file: "routes/IM70.3_Michigan.json",
    tempC: 22, humidity: 60,
  },
  im703_mont_tremblant: {
    name: "IM70.3 Mont-Tremblant",
    file: "routes/IM70.3_Mont_Tremblant.json",
    tempC: 22, humidity: 58,
  },
  im703_monterrey: {
    name: "IM70.3 Monterrey",
    file: "routes/IM70.3_Monterrey.json",
    tempC: 24, humidity: 52,
  },
  im703_musselman: {
    name: "IM70.3 Musselman",
    file: "routes/IM70.3_musselman.json",
    tempC: 24, humidity: 65,
  },
  im703_new_york: {
    name: "IM70.3 New York",
    file: "routes/IM70.3_New_York.json",
    tempC: 24, humidity: 62,
  },
  im703_new_zealand: {
    name: "IM70.3 New Zealand",
    file: "routes/IM70.3_NEW_ZEALAND.json",
    tempC: 20, humidity: 58,
  },
  im703_nice: {
    name: "IM70.3 Nice",
    file: "routes/IM70.3_Nice.json",
    tempC: 24, humidity: 55,
  },
  im703_north_carolina: {
    name: "IM70.3 North Carolina",
    file: "routes/IM70.3_North_Carolina.json",
    tempC: 26, humidity: 65,
  },
  im703_northern_california: {
    name: "IM70.3 Northern California",
    file: "routes/IM70.3_Northern_California.json",
    tempC: 24, humidity: 42,
  },
  im703_oceanside: {
    name: "IM70.3 Oceanside",
    file: "routes/IM70.3_OceanSide.json",
    tempC: 18, humidity: 60,
  },
  im703_ohio: {
    name: "IM70.3 Ohio",
    file: "routes/IM70.3_Ohio.json",
    tempC: 26, humidity: 65,
  },
  im703_panama: {
    name: "IM70.3 Panama",
    file: "routes/IM70.3_Panama.json",
    tempC: 32, humidity: 80,
  },
  im703_pennsylvania: {
    name: "IM70.3 Pennsylvania Happy Valley",
    file: "routes/IM70.3_Pennsylvania_Happy_Valley.json",
    tempC: 22, humidity: 65,
  },
  im703_peru: {
    name: "IM70.3 Peru",
    file: "routes/IM70.3_Peru.json",
    tempC: 18, humidity: 60,
  },
  im703_phu_quoc: {
    name: "IM70.3 Phu Quoc",
    file: "routes/IM70.3_Phu_Quoc.json",
    tempC: 32, humidity: 80,
  },
  im703_porec: {
    name: "IM70.3 Porec",
    file: "routes/IM70.3_Porec.json",
    tempC: 26, humidity: 55,
  },
  im703_port_macquarie: {
    name: "IM70.3 Port Macquarie",
    file: "routes/IM70.3_PORT_MACQUARIE.json",
    tempC: 22, humidity: 55,
  },
  im703_puerto_rico: {
    name: "IM70.3 Puerto Rico",
    file: "routes/IM70.3_Puerto_Rico.json",
    tempC: 29, humidity: 75,
  },
  im703_punta_del_este: {
    name: "IM70.3 Punta del Este",
    file: "routes/IM70.3_Punta_del_Este.json",
    tempC: 26, humidity: 65,
  },
  im703_sables_d_olonne: {
    name: "IM70.3 Les Sables d'Olonne",
    file: "routes/IM70.3_Sables_d_Olonne.json",
    tempC: 20, humidity: 65,
  },
  im703_salem_oregon: {
    name: "IM70.3 Salem Oregon",
    file: "routes/IM70.3_Salem_Oregon.json",
    tempC: 28, humidity: 38,
  },
  im703_santa_cruz: {
    name: "IM70.3 Santa Cruz",
    file: "routes/IM70.3_Santa_Cruz.json",
    tempC: 18, humidity: 70,
  },
  im703_shanghai: {
    name: "IM70.3 Shanghai",
    file: "routes/IM70.3_Shanghai.json",
    tempC: 28, humidity: 75,
  },
  im703_subic_bay: {
    name: "IM70.3 Subic Bay",
    file: "routes/IM70.3_Subic_Bay.json",
    tempC: 31, humidity: 80,
  },
  im703_sunshine_coast: {
    name: "IM70.3 Sunshine Coast",
    file: "routes/IM70.3_SUNSHINE_COAST.json",
    tempC: 22, humidity: 60,
  },
  im703_swansea: {
    name: "IM70.3 Swansea",
    file: "routes/IM70.3_Swansea.json",
    tempC: 16, humidity: 70,
  },
  im703_switzerland: {
    name: "IM70.3 Switzerland",
    file: "routes/IM70.3_Switzerland.json",
    tempC: 20, humidity: 58,
  },
  im703_tallinn: {
    name: "IM70.3 Tallinn",
    file: "routes/IM70.3_Tallinn.json",
    tempC: 18, humidity: 65,
  },
  im703_texas_galveston: {
    name: "IM70.3 Texas Galveston",
    file: "routes/IM70.3_Texas_Galveston.json",
    tempC: 22, humidity: 70,
  },
  im703_valencia: {
    name: "IM70.3 Valencia",
    file: "routes/IM70.3_Valencia.json",
    tempC: 22, humidity: 60,
  },
  im703_venice_jesolo: {
    name: "IM70.3 Venice-Jesolo",
    file: "routes/IM70.3_Venice_Jesolo.json",
    tempC: 24, humidity: 65,
  },
  im703_vichy: {
    name: "IM70.3 Vichy",
    file: "routes/IM70.3_Vichy.json",
    tempC: 26, humidity: 55,
  },
  im703_victoria_canada: {
    name: "IM70.3 Victoria (Canada)",
    file: "routes/IM70.3_Victoria_Canada.json",
    tempC: 18, humidity: 55,
  },
  im703_waco: {
    name: "IM70.3 Waco",
    file: "routes/IM70.3_Waco.json",
    tempC: 24, humidity: 60,
  },
  im703_warsaw: {
    name: "IM70.3 Warsaw",
    file: "routes/IM70.3_Warsaw.json",
    tempC: 20, humidity: 60,
  },
  im703_washington_tricities: {
    name: "IM70.3 Washington Tri-Cities",
    file: "routes/IM70.3_Washington_tricities.json",
    tempC: 30, humidity: 30,
  },
  im703_western_massachusetts: {
    name: "IM70.3 Western Massachusetts",
    file: "routes/IM70.3_western_Massachusetts.json",
    tempC: 24, humidity: 65,
  },
  im703_western_sydney: {
    name: "IM70.3 Western Sydney",
    file: "routes/IM70.3_Western_Sydney.json",
    tempC: 22, humidity: 55,
  },
  im703_zell_am_see: {
    name: "IM70.3 Zell am See-Kaprun",
    file: "routes/IM70.3_Zell_am_see_Kaprun.json",
    tempC: 22, humidity: 55,
  },

  /* ── IM Full Distance ───────────────────────────────────── */
  im_arizona: {
    name: "IM Arizona",
    file: "routes/IM_Arizona.json",
    tempC: 20, humidity: 35,
  },
  im_australia: {
    name: "IM Australia",
    file: "routes/IM_Australia.json",
    tempC: 26, humidity: 60,
  },
  im_austria_klagenfurt: {
    name: "IM Austria (Klagenfurt)",
    file: "routes/IM_Austria_Klagenfurt.json",
    tempC: 24, humidity: 55,
  },
  im_barcelona: {
    name: "IM Barcelona",
    file: "routes/IM_Barcelona.json",
    tempC: 20, humidity: 60,
  },
  im_brazil: {
    name: "IM Brazil",
    file: "routes/IM_Brazil.json",
    tempC: 28, humidity: 70,
  },
  im_cairns: {
    name: "IM Cairns",
    file: "routes/IM_Cairns.json",
    tempC: 22, humidity: 65,
  },
  im_california: {
    name: "IM California",
    file: "routes/IM_California.json",
    tempC: 22, humidity: 50,
  },
  im_cascais: {
    name: "IM Cascais",
    file: "routes/IM_Cascais.json",
    tempC: 20, humidity: 65,
  },
  im_chattanooga: {
    name: "IM Chattanooga",
    file: "routes/IM_Chattanooga.json",
    tempC: 28, humidity: 65,
  },
  im_copenhagen: {
    name: "IM Copenhagen",
    file: "routes/IM_Copenhagen.json",
    tempC: 18, humidity: 65,
  },
  im_cozumel: {
    name: "IM Cozumel",
    file: "routes/IM_Cozumel.json",
    tempC: 28, humidity: 75,
  },
  im_danang: {
    name: "IM Da Nang",
    file: "routes/IM_Danang.json",
    tempC: 32, humidity: 78,
  },
  im_emilia_romagna: {
    name: "IM Emilia Romagna",
    file: "routes/IM_Emilia_Romagna.json",
    tempC: 24, humidity: 60,
  },
  im_florida: {
    name: "IM Florida",
    file: "routes/IM_Florida.json",
    tempC: 24, humidity: 65,
  },
  im_frankfurt: {
    name: "IM Frankfurt",
    file: "routes/IM_frankfurt.json",
    tempC: 24, humidity: 60,
  },
  im_gurye_korea: {
    name: "IM Gurye Korea",
    file: "routes/IM_Gurye_Korea.json",
    tempC: 26, humidity: 70,
  },
  im_hamburg: {
    name: "IM Hamburg",
    file: "routes/IM_Hamburg.json",
    tempC: 20, humidity: 65,
  },
  im_japan_hokkaido: {
    name: "IM Japan South Hokkaido",
    file: "routes/IM_Japan_South_Hokkaido.json",
    tempC: 22, humidity: 70,
  },
  im_kalmar: {
    name: "IM Kalmar",
    file: "routes/IM_Kalmar.json",
    tempC: 18, humidity: 65,
  },
  im_kona: {
    name: "IM World Championship Kona",
    file: "routes/IM_Kona.json",
    tempC: 30, humidity: 65,
  },
  im_lake_placid: {
    name: "IM Lake Placid",
    file: "routes/IM_Lake_placid.json",
    tempC: 24, humidity: 60,
  },
  im_lanzarote: {
    name: "IM Lanzarote",
    file: "routes/IM_lanzarote.json",
    tempC: 22, humidity: 55,
  },
  im_malaysia_langkawi: {
    name: "IM Malaysia (Langkawi)",
    file: "routes/IM_Malaysia_Langkawi.json",
    tempC: 32, humidity: 80,
  },
  im_maryland: {
    name: "IM Maryland",
    file: "routes/IM_Maryland.json",
    tempC: 24, humidity: 65,
  },
  im_new_zealand: {
    name: "IM New Zealand",
    file: "routes/IM_New_Zealand.json",
    tempC: 20, humidity: 60,
  },
  im_nice: {
    name: "IM Nice",
    file: "routes/IM_Nice.json",
    tempC: 24, humidity: 55,
  },
  im_ottawa: {
    name: "IM Ottawa",
    file: "routes/IM_Ottawa.json",
    tempC: 22, humidity: 60,
  },
  im_penghu: {
    name: "IM Penghu",
    file: "routes/IM_Penghu.json",
    tempC: 28, humidity: 70,
  },
  im_philippines: {
    name: "IM Philippines",
    file: "routes/IM_Philippines.json",
    tempC: 31, humidity: 80,
  },
  im_sables_d_olonne: {
    name: "IM Les Sables d'Olonne",
    file: "routes/IM_Sables_d_Olonne.json",
    tempC: 20, humidity: 65,
  },
  im_san_juan: {
    name: "IM San Juan",
    file: "routes/IM_San_juan.json",
    tempC: 28, humidity: 72,
  },
  im_south_africa: {
    name: "IM South Africa",
    file: "routes/IM_south_africa.json",
    tempC: 22, humidity: 65,
  },
  im_switzerland_thun: {
    name: "IM Switzerland (Thun)",
    file: "routes/IM_Switzerland_Thun.json",
    tempC: 20, humidity: 55,
  },
  im_tallinn: {
    name: "IM Tallinn",
    file: "routes/IM_Tallinn.json",
    tempC: 18, humidity: 62,
  },
  im_texas: {
    name: "IM Texas",
    file: "routes/IM_Texas.json",
    tempC: 24, humidity: 65,
  },
  im_valdivia: {
    name: "IM Valdivia",
    file: "routes/IM_Valdivia.json",
    tempC: 16, humidity: 75,
  },
  im_vittoria_gasteiz: {
    name: "IM Vittoria-Gasteiz",
    file: "routes/IM_Vittoria_Gasteiz.json",
    tempC: 22, humidity: 55,
  },
  im_wales: {
    name: "IM Wales",
    file: "routes/IM_Wales.json",
    tempC: 14, humidity: 75,
  },
  im_western_australia: {
    name: "IM Western Australia",
    file: "routes/im_western_australia.json",
    tempC: 24, humidity: 45,
  },
  im_wisconsin: {
    name: "IM Wisconsin",
    file: "routes/im_wisconsin.json",
    tempC: 22, humidity: 65,
  },
};
