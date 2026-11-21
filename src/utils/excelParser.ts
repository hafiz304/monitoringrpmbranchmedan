import * as XLSX from 'xlsx';
import {
  RPMData,
  ResumeBrand,
  AMRanking,
  ACRanking,
  StoreItem,
  ACAMRow,
  ACBrandRow,
  BrandStoreRow,
  StockRow,
  SalesRow,
  ProductItem,
} from '../types';

export interface ParseResult {
  data: RPMData | null;
  sheetStatus: {
    name: string;
    found: boolean;
    rowCount: number;
    colCount: number;
  }[];
  missingSheets: string[];
  warnings: string[];
  success: boolean;
}

export const EXPECTED_SHEETS = [
  'RESUME',
  'STORE ALL ITEM',
  'Stok',
  'Sales',
  'LIST ITEM',
];

export const BASE_EXPECTED_SHEETS = EXPECTED_SHEETS;

function cleanNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === '-' || trimmed === 'N/A' || trimmed === 'NaN') return null;
    const num = Number(trimmed.replace(/,/g, '.'));
    return isNaN(num) ? null : Math.round(num * 1000000) / 1000000;
  }
  const num = Number(val);
  return isNaN(num) ? null : Math.round(num * 1000000) / 1000000;
}

function cleanStr(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function parseExcelDate(val: unknown): string {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'number') {
    const d = new Date((val - 25569) * 86400 * 1000);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split('T')[0];
  }
  return String(val).trim();
}

// Normalizer for fuzzy sheet and string comparison (case-insensitive, remove non-alphanumeric)
function norm(s: unknown): string {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeKey(str: string): string {
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s === 'headshoulder') return 'hs';
  return s;
}

export async function parseExcelWorkbook(file: File): Promise<ParseResult> {
  const warnings: string[] = [];
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

  const sheetNames = wb.SheetNames;

  // 1. Locate RESUME Sheet
  const resumeName = sheetNames.find((s) => norm(s) === 'RESUME');
  if (!resumeName) {
    return {
      data: null,
      sheetStatus: sheetNames.map((s) => ({ name: s, found: true, rowCount: 0, colCount: 0 })),
      missingSheets: ['RESUME'],
      warnings: ['Sheet RESUME tidak ditemukan di dalam file Excel.'],
      success: false,
    };
  }

  const wsResume = wb.Sheets[resumeName];
  const resumeRows = XLSX.utils.sheet_to_json<any[]>(wsResume, { header: 1, defval: null });

  // Period title
  let periodTitle = 'MONITORING RPM PERIODE';
  for (let r = 0; r < 5; r++) {
    const row = resumeRows[r];
    if (row) {
      const cell = row.find((c) => String(c).toUpperCase().includes('MONITORING RPM'));
      if (cell) {
        periodTitle = cleanStr(cell);
        break;
      }
    }
  }

  // Locate Hari Ke, Time Factor, and Brand Header row dynamically
  let tfRowIdx = -1;
  let hariKeCol = 9;
  let tfCol = 10;
  let brandHeaderRowIdx = -1;

  for (let r = 0; r < Math.min(resumeRows.length, 12); r++) {
    const row = resumeRows[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').toUpperCase().trim();
      if (val.includes('HARI KE')) {
        tfRowIdx = r;
        hariKeCol = c;
        brandHeaderRowIdx = r;
      }
      if (val.includes('TIME FACTOR')) {
        tfCol = c;
      }
    }
    if (tfRowIdx >= 0) break;
  }

  const hariKe = tfRowIdx >= 0 ? (cleanNum(resumeRows[tfRowIdx + 1]?.[hariKeCol]) || 4.0) : 4.0;
  const timeFactor = tfRowIdx >= 0 ? (cleanNum(resumeRows[tfRowIdx + 1]?.[tfCol]) || 4 / 7) : 4 / 7;

  // 2. DYNAMIC BRAND DISCOVERY from RESUME brandHeaderRowIdx
  const brandRow = resumeRows[brandHeaderRowIdx] || [];
  const discoveredBrands: string[] = [];
  const resumeBrandCols: Record<string, number> = {};

  const maxBrandCol = hariKeCol > 0 ? hariKeCol : brandRow.length;
  for (let c = 1; c < maxBrandCol; c++) {
    const cellVal = cleanStr(brandRow[c]);
    if (
      cellVal &&
      !cellVal.toUpperCase().includes('HARI') &&
      !cellVal.toUpperCase().includes('TIME') &&
      cellVal !== '-' &&
      cellVal !== 'TARGET'
    ) {
      discoveredBrands.push(cellVal);
      resumeBrandCols[cellVal] = c;
    }
  }

  // Fallback if no brands detected in row
  if (discoveredBrands.length === 0) {
    const fallback = ['BANGO', 'CAP LANG', 'DOWNY', 'HEAD & SHOULDER', 'KAHF', 'LIFEBUOY', 'VASELINE'];
    fallback.forEach((b, idx) => {
      discoveredBrands.push(b);
      resumeBrandCols[b] = idx + 1;
    });
  }

  // Dynamic row detection for RESUME metrics
  let targetStrukRow = 5;
  let targetQtyRow = 6;
  let targetNetSalesRow = 7;
  let actualStrukRow = 9;
  let actualQtyRow = 10;
  let actualNetSalesRow = 11;
  let acvStrukRow = 13;
  let acvQtyRow = 14;
  let acvNetSalesRow = 15;
  let pointRow = 16;
  let shortageQtyRow = 17;
  let statusTfRow = 18;
  let stockTokoRow = 20;
  let stockDcRow = 21;
  let dsiRow = 22;

  let currentSection: 'TARGET' | 'ACTUAL' | 'ACV' | '' = '';
  for (let r = 4; r <= 25 && r < resumeRows.length; r++) {
    const label = String(resumeRows[r]?.[0] || '').toUpperCase().trim();
    if (label === 'TARGET') {
      currentSection = 'TARGET';
    } else if (label === 'ACTUAL') {
      currentSection = 'ACTUAL';
    } else if (label === 'ACV') {
      currentSection = 'ACV';
    } else if (label === 'STRUK') {
      if (currentSection === 'TARGET') targetStrukRow = r;
      else if (currentSection === 'ACTUAL') actualStrukRow = r;
      else if (currentSection === 'ACV') acvStrukRow = r;
    } else if (label === 'QTY') {
      if (currentSection === 'TARGET') targetQtyRow = r;
      else if (currentSection === 'ACTUAL') actualQtyRow = r;
      else if (currentSection === 'ACV') acvQtyRow = r;
    } else if (label.includes('NET')) {
      if (currentSection === 'TARGET') targetNetSalesRow = r;
      else if (currentSection === 'ACTUAL') actualNetSalesRow = r;
      else if (currentSection === 'ACV') acvNetSalesRow = r;
    } else if (label === 'POINT') {
      pointRow = r;
    } else if (label.includes('KEKURANGAN')) {
      shortageQtyRow = r;
    } else if (label.includes('KETERANGAN')) {
      statusTfRow = r;
    } else if (label.includes('STOCK TOKO') || label.includes('STOK TOKO')) {
      stockTokoRow = r;
    } else if (label.includes('STOCK DC') || label.includes('STOK DC')) {
      stockDcRow = r;
    } else if (label === 'DSI') {
      dsiRow = r;
    }
  }

  const resumeBrands: Record<string, ResumeBrand> = {};
  discoveredBrands.forEach((bname) => {
    const c = resumeBrandCols[bname];
    resumeBrands[bname] = {
      brand: bname,
      target_struk: cleanNum(resumeRows[targetStrukRow]?.[c]),
      target_qty: cleanNum(resumeRows[targetQtyRow]?.[c]),
      target_net_sales: cleanNum(resumeRows[targetNetSalesRow]?.[c]),
      actual_struk: cleanNum(resumeRows[actualStrukRow]?.[c]),
      actual_qty: cleanNum(resumeRows[actualQtyRow]?.[c]),
      actual_net_sales: cleanNum(resumeRows[actualNetSalesRow]?.[c]),
      acv_struk: cleanNum(resumeRows[acvStrukRow]?.[c]),
      acv_qty: cleanNum(resumeRows[acvQtyRow]?.[c]),
      acv_net_sales: cleanNum(resumeRows[acvNetSalesRow]?.[c]),
      point: cleanNum(resumeRows[pointRow]?.[c]),
      shortage_qty: cleanNum(resumeRows[shortageQtyRow]?.[c]),
      status_tf: cleanStr(resumeRows[statusTfRow]?.[c]),
      stock_toko: cleanNum(resumeRows[stockTokoRow]?.[c]),
      stock_dc: cleanNum(resumeRows[stockDcRow]?.[c]),
      dsi: cleanNum(resumeRows[dsiRow]?.[c]),
    };
  });

  // 3. AM Ranking from RESUME (Dynamic Row & Column Discovery)
  let amHeaderRow = -1;
  let amColNo = 0;
  let amColName = 1;

  for (let r = 10; r < Math.min(resumeRows.length, 60); r++) {
    const row = resumeRows[r];
    if (!row || !Array.isArray(row)) continue;

    // Look for row with AM header column (must not be title row)
    const amIdx = row.findIndex((c) => {
      const s = String(c || '').trim().toUpperCase();
      return s === 'AM' || s === 'AREA MANAGER' || s === 'NAMA AM';
    });

    if (amIdx >= 0) {
      const noIdx = row.findIndex((c) => /^(NO|RANK|NO\.?)$/i.test(String(c || '').trim()));
      const hasBrands = discoveredBrands.some((b) => row.some((c) => norm(c) === norm(b)));
      if (noIdx >= 0 || hasBrands || row.length > 3) {
        amHeaderRow = r;
        amColName = amIdx;
        amColNo = noIdx >= 0 ? noIdx : (amIdx > 0 ? amIdx - 1 : 0);
        break;
      }
    }
  }

  // Fallback if not detected
  if (amHeaderRow === -1) {
    amHeaderRow = 26;
    amColName = 1;
    amColNo = 0;
  }

  const amHeader = resumeRows[amHeaderRow] || [];
  const amBrandCols: Record<string, number> = {};
  discoveredBrands.forEach((bname) => {
    const idx = amHeader.findIndex((c) => norm(c) === norm(bname));
    amBrandCols[bname] = idx >= 0 ? idx : -1;
  });

  const amRanking: AMRanking[] = [];
  for (let r = amHeaderRow + 1; r < resumeRows.length; r++) {
    const row = resumeRows[r];
    if (!row || row.length === 0) continue;

    let amName = cleanStr(row[amColName]);
    const rawNo = row[amColNo];

    if (
      !amName ||
      amName.toUpperCase() === 'AM' ||
      amName.toUpperCase().includes('TOTAL') ||
      amName.toUpperCase().includes('GRAND') ||
      amName.toUpperCase() === 'AC'
    ) {
      if (amRanking.length >= 3 && (!amName || amName.toUpperCase().includes('TOTAL') || amName.toUpperCase().includes('GRAND') || amName.toUpperCase() === 'AC')) {
        break;
      }
      continue;
    }

    // Guard: If amName is purely numeric (e.g. "1", "2"), search for actual text name in other columns
    if (/^\d+$/.test(amName)) {
      const textColIdx = row.findIndex((c, idx) => {
        if (idx === amColName || idx === amColNo) return false;
        const s = cleanStr(c);
        return s.length >= 2 && /[a-zA-Z]/.test(s) && !/DIATAS|DIBAWAH|TF|TOTAL|GRAND/i.test(s);
      });
      if (textColIdx >= 0) {
        amName = cleanStr(row[textColIdx]);
      }
    }

    // Clean any prefix e.g. "AM BIN" -> "BIN"
    amName = amName.replace(/^AM\s*[-.:]?\s*/i, '').trim();

    const brandValues: Record<string, number | null> = {};
    const brandKets: Record<string, string | null> = {};
    const amObj: AMRanking = {
      rank: Number(rawNo) || (Number(row[0]) || amRanking.length + 1),
      am: amName,
      brand_values: brandValues,
      brand_kets: brandKets,
    };

    discoveredBrands.forEach((bname) => {
      const col = amBrandCols[bname];
      if (col >= 0) {
        const val = cleanNum(row[col]);
        const ket = cleanStr(row[col + 1]);
        brandValues[bname] = val;
        brandKets[bname] = ket;
        amObj[normalizeKey(bname)] = val;
        amObj[`${normalizeKey(bname)}_ket`] = ket;
      } else {
        brandValues[bname] = null;
        brandKets[bname] = null;
      }
    });

    amRanking.push(amObj);
    if (amRanking.length >= 10) break; // Maximum typical AM count
  }

  // 4. AC Ranking from RESUME (Dynamic Row & Column Discovery)
  let acHeaderRow = -1;
  let acColNo = 0;
  let acColName = 1;

  for (let r = amHeaderRow + amRanking.length + 1; r < Math.min(resumeRows.length, 80); r++) {
    const row = resumeRows[r];
    if (!row || !Array.isArray(row)) continue;

    const acIdx = row.findIndex((c) => {
      const s = String(c || '').trim().toUpperCase();
      return s === 'AC' || s === 'AREA COORDINATOR' || s === 'NAMA AC';
    });

    if (acIdx >= 0) {
      const noIdx = row.findIndex((c) => /^(NO|RANK|NO\.?)$/i.test(String(c || '').trim()));
      const hasBrands = discoveredBrands.some((b) => row.some((c) => norm(c) === norm(b)));
      if (noIdx >= 0 || hasBrands || row.length > 3) {
        acHeaderRow = r;
        acColName = acIdx;
        acColNo = noIdx >= 0 ? noIdx : (acIdx > 0 ? acIdx - 1 : 0);
        break;
      }
    }
  }

  // Fallback if not detected
  if (acHeaderRow === -1) {
    acHeaderRow = 34;
    acColName = 1;
    acColNo = 0;
  }

  const acHeader = resumeRows[acHeaderRow] || [];
  const acBrandCols: Record<string, number> = {};
  discoveredBrands.forEach((bname) => {
    const idx = acHeader.findIndex((c) => norm(c) === norm(bname));
    acBrandCols[bname] = idx >= 0 ? idx : -1;
  });

  const acRanking: ACRanking[] = [];
  for (let r = acHeaderRow + 1; r < resumeRows.length; r++) {
    const row = resumeRows[r];
    if (!row || row.length === 0) continue;

    let acName = cleanStr(row[acColName]);
    const rawNo = row[acColNo];

    if (
      !acName ||
      acName.toUpperCase() === 'AC' ||
      acName.toUpperCase().includes('TOTAL') ||
      acName.toUpperCase().includes('GRAND')
    ) {
      if (acRanking.length >= 10 && (!acName || acName.toUpperCase().includes('TOTAL') || acName.toUpperCase().includes('GRAND'))) {
        break;
      }
      continue;
    }

    // Guard: If acName is purely numeric (e.g. "1", "2"), search for actual text name in other columns
    if (/^\d+$/.test(acName)) {
      const textColIdx = row.findIndex((c, idx) => {
        if (idx === acColName || idx === acColNo) return false;
        const s = cleanStr(c);
        return s.length >= 2 && /[a-zA-Z]/.test(s) && !/DIATAS|DIBAWAH|TF|TOTAL|GRAND/i.test(s);
      });
      if (textColIdx >= 0) {
        acName = cleanStr(row[textColIdx]);
      }
    }

    // Clean any prefix e.g. "AC BENNI" -> "BENNI"
    acName = acName.replace(/^AC\s*[-.:]?\s*/i, '').trim();

    const brandValues: Record<string, number | null> = {};
    const brandKets: Record<string, string | null> = {};
    const acObj: ACRanking = {
      rank: Number(rawNo) || (Number(row[0]) || acRanking.length + 1),
      ac: acName,
      brand_values: brandValues,
      brand_kets: brandKets,
    };

    discoveredBrands.forEach((bname) => {
      const col = acBrandCols[bname];
      if (col >= 0) {
        const val = cleanNum(row[col]);
        const ket = cleanStr(row[col + 1]);
        brandValues[bname] = val;
        brandKets[bname] = ket;
        acObj[normalizeKey(bname)] = val;
        acObj[`${normalizeKey(bname)}_ket`] = ket;
      } else {
        brandValues[bname] = null;
        brandKets[bname] = null;
      }
    });

    acRanking.push(acObj);
  }

  // 5. STORE ALL ITEM
  const storeSheetName = sheetNames.find((s) => norm(s) === norm('STORE ALL ITEM'));
  const stores: StoreItem[] = [];
  if (storeSheetName) {
    const wsStore = wb.Sheets[storeSheetName];
    const storeRows = XLSX.utils.sheet_to_json<any[]>(wsStore, { header: 1, defval: null });

    let storeHeaderIdx = 1;
    for (let r = 0; r < Math.min(storeRows.length, 5); r++) {
      const row = storeRows[r];
      if (
        row &&
        row.some((c) => String(c).toUpperCase().trim() === 'KODE') &&
        row.some((c) => String(c).toUpperCase().trim() === 'AC')
      ) {
        storeHeaderIdx = r;
        break;
      }
    }

    const headerRow = storeRows[storeHeaderIdx] || [];
    const colNo = headerRow.findIndex((c) => String(c).toUpperCase().trim() === 'NO');
    const colKode = headerRow.findIndex((c) => String(c).toUpperCase().trim() === 'KODE');
    const colNama = headerRow.findIndex((c) => /NAMA/i.test(String(c).trim()));
    const colAc = headerRow.findIndex((c) => String(c).toUpperCase().trim() === 'AC');
    const colAm = headerRow.findIndex((c) => String(c).toUpperCase().trim() === 'AM');
    const colAcv = headerRow.findIndex((c) => String(c).toUpperCase().trim() === 'ACV');
    const colAvg = headerRow.findIndex((c) => String(c).toUpperCase().trim() === 'AVG');

    // Dynamic brand columns in STORE ALL ITEM
    const storeBrandCols: Record<string, number> = {};
    discoveredBrands.forEach((bname) => {
      const idx = headerRow.findIndex((c) => norm(c) === norm(bname));
      storeBrandCols[bname] = idx >= 0 ? idx : -1;
    });

    const finalColNo = colNo >= 0 ? colNo : 0;
    const finalColKode = colKode >= 0 ? colKode : 1;
    const finalColNama = colNama >= 0 ? colNama : 2;
    const finalColAc = colAc >= 0 ? colAc : 3;
    const finalColAm = colAm >= 0 ? colAm : 4;
    const finalColAcv = colAcv >= 0 ? colAcv : -1;
    const finalColAvg = colAvg >= 0 ? colAvg : -1;

    for (let r = storeHeaderIdx + 1; r < storeRows.length; r++) {
      const row = storeRows[r];
      const kode = cleanStr(row?.[finalColKode]);
      if (
        !kode ||
        kode.toUpperCase() === 'KODE' ||
        kode.toUpperCase().includes('TOTAL') ||
        kode.toUpperCase().includes('GRAND')
      ) {
        continue;
      }

      const brandValues: Record<string, number | null> = {};
      const brandKets: Record<string, string | null> = {};
      const validVals: number[] = [];

      const storeObj: StoreItem = {
        no: Number(row[finalColNo]) || stores.length + 1,
        kode,
        nama: cleanStr(row[finalColNama]),
        ac: cleanStr(row[finalColAc]),
        am: cleanStr(row[finalColAm]),
        acv: finalColAcv >= 0 ? cleanNum(row[finalColAcv]) : null,
        avg: finalColAvg >= 0 ? cleanNum(row[finalColAvg]) : null,
        above_tf_count: 0,
        below_tf_count: 0,
        brand_values: brandValues,
        brand_kets: brandKets,
      };

      discoveredBrands.forEach((bname) => {
        const col = storeBrandCols[bname];
        if (col >= 0) {
          const val = cleanNum(row[col]);
          const ket = cleanStr(row[col + 1]);
          brandValues[bname] = val;
          brandKets[bname] = ket;
          storeObj[normalizeKey(bname)] = val;
          storeObj[`${normalizeKey(bname)}_ket`] = ket;
          if (val !== null) validVals.push(val);
        } else {
          brandValues[bname] = null;
          brandKets[bname] = null;
        }
      });

      const aboveTf = validVals.filter((x) => x >= timeFactor).length;
      const belowTf = validVals.filter((x) => x < timeFactor).length;
      storeObj.above_tf_count = aboveTf;
      storeObj.below_tf_count = belowTf;

      // If avg column not provided, calculate dynamic average across brands
      if (storeObj.avg === null && validVals.length > 0) {
        storeObj.avg = validVals.reduce((a, b) => a + b, 0) / validVals.length;
      }

      stores.push(storeObj);
    }
  }

  // 6. AC-AM Sheets (Dynamic matching for each discovered brand)
  const acamData: Record<string, ACAMRow[]> = {};
  const acBrandData: Record<string, ACBrandRow[]> = {};

  discoveredBrands.forEach((bname) => {
    const targetNorm = norm('AC-AM ' + bname);
    const targetNormAlt = norm('ACAM ' + bname);
    const sName = sheetNames.find((s) => {
      const ns = norm(s);
      return ns === targetNorm || ns === targetNormAlt || (ns.includes('AC') && ns.includes('AM') && ns.includes(norm(bname)));
    });

    if (sName) {
      const ws = wb.Sheets[sName];
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });

      let amHIdx = -1;
      let amColNo = 0;
      let amColName = 1;
      let amColRatio = 2;

      let acHIdx = -1;
      let acColNo = 0;
      let acColName = 1;
      let acColRatio = 2;

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (!row || !Array.isArray(row)) continue;

        // Detect AM Header
        if (amHIdx === -1) {
          const cIdx = row.findIndex((c) => {
            const s = String(c || '').trim().toUpperCase();
            return s === 'AM' || s === 'AREA MANAGER' || s === 'NAMA AM';
          });
          if (cIdx >= 0) {
            amHIdx = r;
            amColName = cIdx;
            const noIdx = row.findIndex((c) => /^(NO|RANK|NO\.?)$/i.test(cleanStr(c)));
            if (noIdx >= 0) amColNo = noIdx;
            const ratioIdx = row.findIndex((c) => /(STORE|JTJ|RATIO)/i.test(cleanStr(c)));
            if (ratioIdx >= 0) amColRatio = ratioIdx;
            continue;
          }
        }

        // Detect AC Header (must be after AM table)
        if (amHIdx >= 0 && acHIdx === -1 && r > amHIdx + 1) {
          const cIdx = row.findIndex((c) => {
            const s = String(c || '').trim().toUpperCase();
            return s === 'AC' || s === 'AREA COORDINATOR' || s === 'NAMA AC';
          });
          if (cIdx >= 0) {
            acHIdx = r;
            acColName = cIdx;
            const noIdx = row.findIndex((c) => /^(NO|RANK|NO\.?)$/i.test(cleanStr(c)));
            if (noIdx >= 0) acColNo = noIdx;
            const ratioIdx = row.findIndex((c) => /(STORE|JTJ|RATIO)/i.test(cleanStr(c)));
            if (ratioIdx >= 0) acColRatio = ratioIdx;
          }
        }
      }

      // AM Rows (Area Manager: 5 AM)
      const amRows: ACAMRow[] = [];
      if (amHIdx >= 0) {
        for (let r = amHIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          let amName = cleanStr(row[amColName]);
          // Stop if: empty, TOTAL/GRAND row, hit AC header row index, or cell value is literally 'AC'
          if (
            !amName ||
            amName.toUpperCase().includes('TOTAL') ||
            amName.toUpperCase().includes('GRAND') ||
            amName.toUpperCase() === 'AC' ||
            (acHIdx >= 0 && r >= acHIdx)
          ) {
            break;
          }

          // Guard: If amName is purely numeric (e.g. "1", "2"), search other columns for actual letters
          if (/^\d+$/.test(amName)) {
            const textColIdx = row.findIndex((c, idx) => {
              if (idx === amColName || idx === amColNo) return false;
              const s = cleanStr(c);
              return s.length >= 2 && /[a-zA-Z]/.test(s) && !/DIATAS|DIBAWAH|TF|TOTAL|GRAND/i.test(s);
            });
            if (textColIdx >= 0) {
              amName = cleanStr(row[textColIdx]);
            }
          }

          // Clean prefix: "AM BIN" -> "BIN"
          amName = amName.replace(/^AM\s*[-.:]?\s*/i, '').trim();

          amRows.push({
            no: Number(row[amColNo]) || amRows.length + 1,
            am: amName,
            store_ratio: cleanStr(row[amColRatio]),
            target_struk: cleanNum(row[3]),
            target_qty: cleanNum(row[4]),
            target_net_sales: cleanNum(row[5]),
            actual_struk: cleanNum(row[6]),
            actual_qty: cleanNum(row[7]),
            actual_net_sales: cleanNum(row[8]),
            acv_struk: cleanNum(row[9]),
            acv_qty: cleanNum(row[10]),
            acv_net_sales: cleanNum(row[11]),
            point: cleanNum(row[15]),
            stock_pcs: cleanNum(row[16]),
            asq: cleanNum(row[17]),
            dsi: cleanNum(row[18]),
          });
        }
      }
      acamData[bname] = amRows;

      // AC Rows (Area Coordinator: 20 AC)
      const acRows: ACBrandRow[] = [];
      if (acHIdx >= 0) {
        for (let r = acHIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          let acName = cleanStr(row[acColName]);
          if (!acName || acName.toUpperCase().includes('TOTAL') || acName.toUpperCase().includes('GRAND') || acName.toUpperCase() === 'AM') {
            break;
          }

          // Guard: If acName is purely numeric (e.g. "1", "2"), search other columns for actual letters
          if (/^\d+$/.test(acName)) {
            const textColIdx = row.findIndex((c, idx) => {
              if (idx === acColName || idx === acColNo) return false;
              const s = cleanStr(c);
              return s.length >= 2 && /[a-zA-Z]/.test(s) && !/DIATAS|DIBAWAH|TF|TOTAL|GRAND/i.test(s);
            });
            if (textColIdx >= 0) {
              acName = cleanStr(row[textColIdx]);
            }
          }

          // Clean prefix: "AC BENNI" -> "BENNI"
          acName = acName.replace(/^AC\s*[-.:]?\s*/i, '').trim();

          acRows.push({
            no: Number(row[acColNo]) || acRows.length + 1,
            ac: acName,
            store_ratio: cleanStr(row[acColRatio]),
            target_struk: cleanNum(row[3]),
            target_qty: cleanNum(row[4]),
            target_net_sales: cleanNum(row[5]),
            actual_struk: cleanNum(row[6]),
            actual_qty: cleanNum(row[7]),
            actual_net_sales: cleanNum(row[8]),
            acv_struk: cleanNum(row[9]),
            acv_qty: cleanNum(row[10]),
            acv_net_sales: cleanNum(row[11]),
            point: cleanNum(row[15]),
            stock_pcs: cleanNum(row[16]),
            asq: cleanNum(row[17]),
            dsi: cleanNum(row[18]),
          });
        }
      }
      acBrandData[bname] = acRows;
    } else {
      acamData[bname] = [];
      acBrandData[bname] = [];
    }
  });

  // 7. Brand Store Sheets (Dynamic matching for each discovered brand)
  const brandStoreData: Record<string, BrandStoreRow[]> = {};
  discoveredBrands.forEach((bname) => {
    const targetNorm = norm(bname);
    const sName = sheetNames.find((s) => norm(s) === targetNorm);

    if (sName) {
      const ws = wb.Sheets[sName];
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });

      let hIdx = -1;
      let colKode = 1;
      let colNama = 3;
      let colAc = 4;
      let colAm = 5;

      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r];
        if (!row || !Array.isArray(row)) continue;
        const kIdx = row.findIndex((c) => /^(KODE|KODE\s*TOKO)$/i.test(cleanStr(c)));
        if (kIdx >= 0) {
          hIdx = r;
          colKode = kIdx;
          const nIdx = row.findIndex((c) => /NAMA/i.test(cleanStr(c)));
          if (nIdx >= 0) colNama = nIdx;
          const acIdx = row.findIndex((c) => /^AC$/i.test(cleanStr(c)));
          if (acIdx >= 0) colAc = acIdx;
          const amIdx = row.findIndex((c) => /^AM$/i.test(cleanStr(c)));
          if (amIdx >= 0) colAm = amIdx;
          break;
        }
      }
      if (hIdx === -1) hIdx = 3;

      const bStores: BrandStoreRow[] = [];
      for (let r = hIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        const kode = cleanStr(row?.[colKode]);
        if (
          !kode ||
          kode.toUpperCase() === 'KODE' ||
          kode.toUpperCase().includes('TOTAL') ||
          kode.toUpperCase().includes('GRAND')
        ) {
          continue;
        }

        bStores.push({
          no: Number(row[0]) || bStores.length + 1,
          kode,
          nama: cleanStr(row[colNama]),
          ac: cleanStr(row[colAc]),
          am: cleanStr(row[colAm]),
          target_struk: cleanNum(row[6]),
          target_qty: cleanNum(row[7]),
          target_net_sales: cleanNum(row[8]),
          actual_struk: cleanNum(row[9]),
          actual_qty: cleanNum(row[10]),
          actual_net_sales: cleanNum(row[11]),
          acv_struk: cleanNum(row[12]),
          acv_qty: cleanNum(row[13]),
          acv_net_sales: cleanNum(row[14]),
          point: cleanNum(row[18]),
          stock_pcs: cleanNum(row[19]),
          asq: cleanNum(row[20]),
          dsi: cleanNum(row[21]),
        });
      }
      brandStoreData[bname] = bStores;
    } else {
      brandStoreData[bname] = [];
    }
  });

  // 8. Stok Sheet
  const stokName = sheetNames.find((s) => norm(s) === 'STOK');
  const stockRows: StockRow[] = [];
  if (stokName) {
    const ws = wb.Sheets[stokName];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });

    let hIdx = 6;
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      if (
        row &&
        row.some((c) => /toko/i.test(String(c).trim())) &&
        row.some((c) => /plu/i.test(String(c).trim())) &&
        row.some((c) => /good\s*stok/i.test(String(c).trim()))
      ) {
        hIdx = r;
        break;
      }
    }

    const hRow = rows[hIdx] || [];
    const findCol = (regex: RegExp, fallback: number) => {
      const idx = hRow.findIndex((c) => regex.test(String(c).trim()));
      return idx >= 0 ? idx : fallback;
    };

    const colTgl = findCol(/^tgl$/i, 0);
    const colBranch = findCol(/^branch$/i, 1);
    const colLokasi = findCol(/^lokasi$/i, 2);
    const colToko = findCol(/^toko$/i, 3);
    const colNamaToko = findCol(/^nama\s*toko$/i, 4);
    const colPlu = findCol(/^plu$/i, 6);
    const colDescp = findCol(/^descp/i, 7);
    const colProgram = findCol(/^program$/i, 8);
    const colGoodStok = findCol(/^good\s*stok$/i, 9);
    const colBadStok = findCol(/^bad\s*stok$/i, 10);
    const colGoodStokRp = findCol(/^good\s*stok\s*rp$/i, 11);
    const colBadStokRp = findCol(/^bad\s*stok\s*rp$/i, 12);
    const colPkm = findCol(/^pkm/i, 13);
    const colMpkm = findCol(/^mpkm/i, 14);
    const colMinor = findCol(/^minor$/i, 15);
    const colMindis = findCol(/^mindis$/i, 16);

    for (let r = hIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      const toko = cleanStr(row?.[colToko]);
      if (!toko || toko.toLowerCase() === 'toko' || toko.toLowerCase().includes('total')) continue;

      stockRows.push({
        tgl: parseExcelDate(row[colTgl]) || '2026-11-06',
        branch: cleanStr(row[colBranch]),
        lokasi: cleanStr(row[colLokasi]),
        toko,
        nama_toko: cleanStr(row[colNamaToko]),
        plu: Number(row[colPlu]) || 0,
        descp: cleanStr(row[colDescp]),
        program: cleanStr(row[colProgram]),
        good_stok: Number(row[colGoodStok]) || 0,
        bad_stok: Number(row[colBadStok]) || 0,
        good_stok_rp: Number(row[colGoodStokRp]) || 0,
        bad_stok_rp: Number(row[colBadStokRp]) || 0,
        pkm_qty: Number(row[colPkm]) || 0,
        mpkm_qty: Number(row[colMpkm]) || 0,
        minor: Number(row[colMinor]) || 0,
        mindis: Number(row[colMindis]) || 0,
      });
    }
  }

  // 9. Sales Sheet
  const salesName = sheetNames.find((s) => norm(s) === 'SALES');
  const salesRows: SalesRow[] = [];
  if (salesName) {
    const ws = wb.Sheets[salesName];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });

    let hIdx = 8;
    for (let r = 0; r < Math.min(rows.length, 12); r++) {
      const row = rows[r];
      if (
        row &&
        row.some((c) => /kd\s*store/i.test(String(c).trim())) &&
        row.some((c) => /plu/i.test(String(c).trim())) &&
        row.some((c) => /qty\s*sales/i.test(String(c).trim()))
      ) {
        hIdx = r;
        break;
      }
    }

    const hRow = rows[hIdx] || [];
    const findCol = (regex: RegExp, fallback: number) => {
      const idx = hRow.findIndex((c) => regex.test(String(c).trim()));
      return idx >= 0 ? idx : fallback;
    };

    const colPeriode = findCol(/^periode/i, 0);
    const colKdStore = findCol(/^kd\s*store$/i, 1);
    const colNamaStore = findCol(/^nama\s*store$/i, 2);
    const colPlu = findCol(/^plu$/i, 4);
    const colDescp = findCol(/^descp/i, 5);
    const colProgram = findCol(/^program$/i, 6);
    const colQtySales = findCol(/^qty\s*sales$/i, 7);
    const colNetSales = findCol(/^net\s*sales$/i, 8);
    const colMarginRp = findCol(/^margin\s*rp$/i, 9);
    const colStrukQty = findCol(/^struk\s*qty$/i, 10);

    for (let r = hIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      const kdStore = cleanStr(row?.[colKdStore]);
      if (!kdStore || kdStore.toLowerCase() === 'kd store' || kdStore.toLowerCase().includes('total')) continue;

      salesRows.push({
        periode: cleanStr(row[colPeriode]) || '02 Nov 26 s/d 05 Nov 26',
        kd_store: kdStore,
        nama_store: cleanStr(row[colNamaStore]),
        plu: Number(row[colPlu]) || 0,
        descp: cleanStr(row[colDescp]),
        program: cleanStr(row[colProgram]),
        qty_sales: Number(row[colQtySales]) || 0,
        net_sales: Number(row[colNetSales]) || 0,
        margin_rp: Number(row[colMarginRp]) || 0,
        struk_qty: Number(row[colStrukQty]) || 0,
      });
    }
  }

  // 10. Aggregated Products
  const prodMap = new Map<number, ProductItem>();
  for (const s of salesRows) {
    if (!prodMap.has(s.plu)) {
      prodMap.set(s.plu, {
        plu: s.plu,
        descp: s.descp,
        program: s.program,
        qty_sales: 0,
        net_sales: 0,
        margin_rp: 0,
        margin_pct: 0,
        struk_qty: 0,
        good_stok: 0,
        bad_stok: 0,
        good_stok_rp: 0,
        bad_stok_rp: 0,
        pkm_qty: 0,
        mpkm_qty: 0,
        minor: 0,
        mindis: 0,
        store_count_sales: 0,
        store_count_stock: 0,
      });
    }
    const p = prodMap.get(s.plu)!;
    p.qty_sales += s.qty_sales;
    p.net_sales += s.net_sales;
    p.margin_rp += s.margin_rp;
    p.struk_qty += s.struk_qty;
    p.store_count_sales += 1;
  }

  for (const st of stockRows) {
    if (!prodMap.has(st.plu)) {
      prodMap.set(st.plu, {
        plu: st.plu,
        descp: st.descp,
        program: st.program,
        qty_sales: 0,
        net_sales: 0,
        margin_rp: 0,
        margin_pct: 0,
        struk_qty: 0,
        good_stok: 0,
        bad_stok: 0,
        good_stok_rp: 0,
        bad_stok_rp: 0,
        pkm_qty: 0,
        mpkm_qty: 0,
        minor: 0,
        mindis: 0,
        store_count_sales: 0,
        store_count_stock: 0,
      });
    }
    const p = prodMap.get(st.plu)!;
    p.good_stok += st.good_stok;
    p.bad_stok += st.bad_stok;
    p.good_stok_rp += st.good_stok_rp;
    p.bad_stok_rp += st.bad_stok_rp;
    p.pkm_qty += st.pkm_qty;
    p.mpkm_qty += st.mpkm_qty;
    p.minor += st.minor;
    p.mindis += st.mindis;
    p.store_count_stock += 1;
  }

  const products = Array.from(prodMap.values()).map((p) => ({
    ...p,
    margin_pct: p.net_sales > 0 ? p.margin_rp / p.net_sales : 0,
  }));

  // Summaries
  const stockSummary = {
    total_good_stock: stockRows.reduce((acc, s) => acc + s.good_stok, 0),
    total_bad_stock: stockRows.reduce((acc, s) => acc + s.bad_stok, 0),
    total_good_stock_rp: stockRows.reduce((acc, s) => acc + s.good_stok_rp, 0),
    total_bad_stock_rp: stockRows.reduce((acc, s) => acc + s.bad_stok_rp, 0),
    total_pkm_qty: stockRows.reduce((acc, s) => acc + s.pkm_qty, 0),
    total_mpkm_qty: stockRows.reduce((acc, s) => acc + s.mpkm_qty, 0),
    total_minor: stockRows.reduce((acc, s) => acc + s.minor, 0),
    total_mindis: stockRows.reduce((acc, s) => acc + s.mindis, 0),
    by_brand: {} as Record<string, any>,
    by_location: {
      DC: stockRows.filter((s) => s.lokasi === 'DC').reduce((acc, s) => acc + s.good_stok, 0),
      Toko: stockRows.filter((s) => s.lokasi === 'Toko').reduce((acc, s) => acc + s.good_stok, 0),
    },
  };

  for (const s of stockRows) {
    if (!stockSummary.by_brand[s.program]) {
      stockSummary.by_brand[s.program] = {
        good_stock: 0,
        bad_stock: 0,
        good_stock_rp: 0,
        bad_stock_rp: 0,
        pkm: 0,
        mpkm: 0,
      };
    }
    stockSummary.by_brand[s.program].good_stock += s.good_stok;
    stockSummary.by_brand[s.program].bad_stock += s.bad_stok;
    stockSummary.by_brand[s.program].good_stock_rp += s.good_stok_rp;
    stockSummary.by_brand[s.program].bad_stock_rp += s.bad_stok_rp;
    stockSummary.by_brand[s.program].pkm += s.pkm_qty;
    stockSummary.by_brand[s.program].mpkm += s.mpkm_qty;
  }

  const salesSummary = {
    total_qty_sales: salesRows.reduce((acc, s) => acc + s.qty_sales, 0),
    total_net_sales: salesRows.reduce((acc, s) => acc + s.net_sales, 0),
    total_margin_rp: salesRows.reduce((acc, s) => acc + s.margin_rp, 0),
    total_struk_qty: salesRows.reduce((acc, s) => acc + s.struk_qty, 0),
    by_brand: {} as Record<string, any>,
  };

  for (const s of salesRows) {
    if (!salesSummary.by_brand[s.program]) {
      salesSummary.by_brand[s.program] = {
        qty_sales: 0,
        net_sales: 0,
        margin_rp: 0,
        struk_qty: 0,
      };
    }
    salesSummary.by_brand[s.program].qty_sales += s.qty_sales;
    salesSummary.by_brand[s.program].net_sales += s.net_sales;
    salesSummary.by_brand[s.program].margin_rp += s.margin_rp;
    salesSummary.by_brand[s.program].struk_qty += s.struk_qty;
  }

  // Construct dynamic expected sheets list based on discovered brands
  const dynamicExpectedSheets = [
    'RESUME',
    'STORE ALL ITEM',
    'Stok',
    'Sales',
    'LIST ITEM',
    ...discoveredBrands.map((b) => `AC-AM ${b}`),
    ...discoveredBrands.map((b) => b),
  ];

  const sheetStatus = dynamicExpectedSheets.map((expected) => {
    const foundName = sheetNames.find((s) => norm(s) === norm(expected));
    if (foundName) {
      const ws = wb.Sheets[foundName];
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
      return {
        name: expected,
        found: true,
        rowCount: range.e.r + 1,
        colCount: range.e.c + 1,
      };
    }
    return {
      name: expected,
      found: false,
      rowCount: 0,
      colCount: 0,
    };
  });

  const missingSheets = sheetStatus.filter((s) => !s.found).map((s) => s.name);

  const data: RPMData = {
    meta: {
      title: 'RPM MONITORING DASHBOARD - ALFAMIDI',
      period: periodTitle,
      sales_period: salesRows[0]?.periode || '02 Nov 26 s/d 05 Nov 26',
      stock_date: stockRows[0]?.tgl || '2026-11-06',
      hari_ke: hariKe,
      time_factor: timeFactor,
      total_stores: stores.length,
      total_stock_records: stockRows.length,
      total_sales_records: salesRows.length,
      total_products: products.length,
      branch: 'Alfamidi Branch Medan',
      brands: discoveredBrands,
    },
    resume_brands: resumeBrands,
    resume_am_ranking: amRanking,
    resume_ac_ranking: acRanking,
    stores,
    acam_data: acamData,
    ac_brand_data: acBrandData,
    brand_store_data: brandStoreData,
    products,
    stock_rows_sample: stockRows.slice(0, 1500),
    sales_rows_sample: salesRows.slice(0, 1500),
    stock_summary: stockSummary,
    sales_summary: salesSummary,
  };

  return {
    data,
    sheetStatus,
    missingSheets,
    warnings,
    success: true,
  };
}
