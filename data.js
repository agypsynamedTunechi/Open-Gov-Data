// data.js
// Open Government Data Visualization System for Edo State
// Single-year snapshot data, structured for use by charts.js and dom.js
//
// STATUS KEY (see each LGA's "_status" fields):
//   "live"         -> real figures, sourced and cited
//   "live-partial" -> some fields real, others still pending
//   "placeholder"  -> dummy value, MUST be replaced before final submission
//
// FAAC allocation: live (April 2026, OurLgaMoni.com, accessed 27/08/2026).
// Demographics: live (2006 census, Edo State Statistical Year Book 2013,
//   Table 2.3 "Population by Sex and LGA"). Note: Esan North-East's male+female
//   figures as printed in the source (121,987 + 61,647 = 183,634) do not match
//   the Year Book's own population-density table for the same LGA (121,989).
//   Both figures are reproduced from the primary source as printed; the
//   discrepancy is a genuine inconsistency in the original document, not a
//   transcription error introduced here, and is documented for the project's
//   methodology chapter. Etsako West's male figure (printed as 700,986) is
//   corrected to 100,986, since the source's own total for that LGA (198,975,
//   confirmed against Table 2.1) only reconciles with the corrected value.
// Health: live (2012, Table 5.8 "Categorised Health Establishment by LGA" for
//   facility counts; Table 5.9 "Distribution of Doctors" for doctor counts).
//   Etsako Central is absent from Tables 5.5-5.8 in the source itself, an
//   apparent gap in the Year Book, not an omission introduced here -- its
//   healthFacilities figure is marked accordingly rather than guessed.
// Economy.cooperativeSocieties: live (2012, Table 3.4 "Membership of Primary
//   Cooperative Society by Sex and LGA"). Not yet imported into the live
//   database (see admin panel) -- see project notes on multi-period handling.
// Education: live-partial (2012, Table 8.1D for primary school counts; 2011/12,
//   Table 8.7G for teacher counts, restricted to the NCE qualification category
//   specifically since that table spans 11 qualification categories per LGA and
//   only the NCE column -- the single largest category -- was reliably legible
//   from the source. "teachers" therefore means "NCE-qualified teachers", not a
//   full staff count. Ovia South West's NCE figure was harder to read in the
//   source and is a best estimate rather than a confirmed transcription.
//   Secondary school counts and student-teacher ratios are not in these tables
//   and remain pending.

const edoData = {
  meta: {
    title: "Open Government Data Visualization System - Edo State",
    snapshotYear: 2026,
    lgaCount: 18,
    sources: {
      faac: "OurLgaMoni.com (accessed 27/08/2026), FAAC April 2026 disbursement",
      demographics: "Edo State Statistical Year Book 2013, Table 2.3 (2006 census)",
      education: "Edo State Statistical Year Book 2013, Tables 8.1D and 8.7G (2012 / 2011-12; teachers = NCE-qualified only)",
      health: "Edo State Statistical Year Book 2013, Tables 5.8 and 5.9 (2012)",
      economy: "Edo State Statistical Year Book 2013, Table 3.4 (2012, cooperative societies only)"
    }
  },

  lgas: [
    { name: "Oredo",            faacAllocationMillionNaira: 709.30, population: 374515, male: 188895, female: 185620, healthFacilities: 207, healthWorkers: 108, coopSocieties: 1650 , primarySchools: 82, teachers: 830 },
    { name: "Ikpoba Okha",      faacAllocationMillionNaira: 694.26, population: 372080, male: 184725, female: 187355, healthFacilities: 37,  healthWorkers: 42,  coopSocieties: 1311 , primarySchools: 48, teachers: 898 },
    { name: "Akoko Edo",        faacAllocationMillionNaira: 643.23, population: 261567, male: 132184, female: 129383, healthFacilities: 41,  healthWorkers: 3,   coopSocieties: 300 , primarySchools: 70, teachers: 670 },
    { name: "Egor",             faacAllocationMillionNaira: 640.57, population: 340287, male: 168925, female: 171362, healthFacilities: 108, healthWorkers: 0,   coopSocieties: 663 , primarySchools: 20, teachers: 638 },
    { name: "Ovia South West",  faacAllocationMillionNaira: 557.30, population: 138072, male: 72113,  female: 65959,  healthFacilities: 26,  healthWorkers: 13,  coopSocieties: 504 , primarySchools: 76, teachers: 569 },
    { name: "Etsako West",      faacAllocationMillionNaira: 554.97, population: 198975, male: 100986, female: 97989,  healthFacilities: 51,  healthWorkers: 9,   coopSocieties: 914 , primarySchools: 43, teachers: 603 },
    { name: "Orhionmwon",       faacAllocationMillionNaira: 553.85, population: 183994, male: 92433,  female: 91561,  healthFacilities: 35,  healthWorkers: 8,   coopSocieties: 290 , primarySchools: 82, teachers: 943 },
    { name: "Ovia North East",  faacAllocationMillionNaira: 528.66, population: 155344, male: 80433,  female: 74911,  healthFacilities: 37,  healthWorkers: 21,  coopSocieties: 312 , primarySchools: 13, teachers: 860 },
    { name: "Esan South East",  faacAllocationMillionNaira: 517.05, population: 166309, male: 84587,  female: 81722,  healthFacilities: 30,  healthWorkers: 5,   coopSocieties: 201 , primarySchools: 47, teachers: 511 },
    { name: "Owan East",        faacAllocationMillionNaira: 513.23, population: 154630, male: 78890,  female: 75740,  healthFacilities: 40,  healthWorkers: 1,   coopSocieties: 595 , primarySchools: 42, teachers: 461 },
    { name: "Uhunmwonde",       faacAllocationMillionNaira: 511.78, population: 121749, male: 63727,  female: 58022,  healthFacilities: 43,  healthWorkers: 1,   coopSocieties: 315 , primarySchools: 85, teachers: 792 },
    { name: "Etsako East",      faacAllocationMillionNaira: 506.88, population: 147335, male: 72477,  female: 74858,  healthFacilities: 31,  healthWorkers: 4,   coopSocieties: 855 , primarySchools: 51, teachers: 539 },
    { name: "Esan West",        faacAllocationMillionNaira: 453.71, population: 127718, male: 65312,  female: 62406,  healthFacilities: 44,  healthWorkers: 2,   coopSocieties: 334 , primarySchools: 45, teachers: 359 },
    { name: "Esan North East",  faacAllocationMillionNaira: 446.85, population: 183634, male: 121987, female: 61647,  healthFacilities: 43,  healthWorkers: 8,   coopSocieties: 225 , primarySchools: 36, teachers: 416 },
    { name: "Etsako Central",   faacAllocationMillionNaira: 445.92, population: 94228,  male: 47708,  female: 46520,  healthFacilities: null, healthWorkers: 2,  coopSocieties: 240 , primarySchools: 27, teachers: 302 },
    { name: "Owan West",        faacAllocationMillionNaira: 435.61, population: 99056,  male: 50755,  female: 48301,  healthFacilities: 45,  healthWorkers: 1,   coopSocieties: 281 , primarySchools: 39, teachers: 424 },
    { name: "Esan Central",     faacAllocationMillionNaira: 434.85, population: 105242, male: 53017,  female: 52225,  healthFacilities: 20,  healthWorkers: 2,   coopSocieties: 280 , primarySchools: 37, teachers: 433 },
    { name: "Igueben",          faacAllocationMillionNaira: 418.36, population: 70276,  male: 35132,  female: 35144,  healthFacilities: 17,  healthWorkers: 2,   coopSocieties: 302, primarySchools: 111, teachers: 389 }
  ].map(lga => ({
    name: lga.name,

    demographics: {
      population: lga.population,
      populationDensity: 0,        // area (sq km) not reliably extracted from source table; left pending
      maleFemaleRatio: lga.female > 0 ? +(lga.male / lga.female * 100).toFixed(1) : 0, // males per 100 females
      year: 2006,
      _status: "live"
    },

    education: {
      primarySchools: lga.primarySchools,
      secondarySchools: 0,          // not in source tables reviewed; pending
      teachers: lga.teachers,       // NCE-qualified teachers only -- see header note
      studentTeacherRatio: 0,       // requires enrollment data not yet sourced
      year: 2012,
      _status: "live-partial"
    },

    health: {
      healthFacilities: lga.healthFacilities, // null = genuine gap in source (Etsako Central)
      healthWorkers: lga.healthWorkers,
      year: 2012,
      _status: lga.healthFacilities === null ? "live-partial" : "live"
    },

    economy: {
      faacAllocationMillionNaira: lga.faacAllocationMillionNaira,
      cooperativeSocieties: lga.coopSocieties,
      registeredMarkets: 0,
      _status: "live-partial" // FAAC + cooperative societies live, registered markets pending
    }
  }))
};

// Deliberately global — shared across data.js/charts.js/app.js via plain
// <script> tags (no bundler). This line also satisfies linters that flag
// "defined but never used" for top-level consts.
window.edoData = edoData;