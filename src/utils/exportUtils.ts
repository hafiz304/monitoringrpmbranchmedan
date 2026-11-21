import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { RPMData } from '../types';
import { formatRupiah, formatNumber, formatPercent } from './formatters';

export function exportDashboardPDF(data: RPMData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const brands = (data.meta.brands && data.meta.brands.length > 0)
    ? data.meta.brands
    : Object.keys(data.resume_brands);

  // Header Banner
  doc.setFillColor(215, 25, 32); // Alfamidi Red #D71920
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('ALFAMIDI – RPM PERFORMANCE REPORT', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${data.meta.period} | Time Factor: ${(data.meta.time_factor * 100).toFixed(2)}% (Hari ke-${data.meta.hari_ke})`, 14, 20);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 20, { align: 'right' });

  let startY = 33;

  // Executive Summary KPIs
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. EXECUTIVE SUMMARY & KEY PERFORMANCE INDICATORS', 14, startY);

  const totalActualSales = Object.values(data.resume_brands).reduce((a, b) => a + (b.actual_net_sales || 0), 0);
  const totalTargetSales = Object.values(data.resume_brands).reduce((a, b) => a + (b.target_net_sales || 0), 0);
  const totalActualQty = Object.values(data.resume_brands).reduce((a, b) => a + (b.actual_qty || 0), 0);
  const totalTargetQty = Object.values(data.resume_brands).reduce((a, b) => a + (b.target_qty || 0), 0);
  const totalActualStruk = Object.values(data.resume_brands).reduce((a, b) => a + (b.actual_struk || 0), 0);
  const totalTargetStruk = Object.values(data.resume_brands).reduce((a, b) => a + (b.target_struk || 0), 0);
  const overallSalesAchv = totalTargetSales > 0 ? totalActualSales / totalTargetSales : 0;

  const kpiData = [
    ['Total Net Sales Aktual', formatRupiah(totalActualSales), 'Target Net Sales', formatRupiah(totalTargetSales)],
    ['Total Qty Aktual', formatNumber(totalActualQty) + ' pcs', 'Target Qty', formatNumber(totalTargetQty) + ' pcs'],
    ['Total Struk Aktual', formatNumber(totalActualStruk), 'Target Struk', formatNumber(totalTargetStruk)],
    ['Overall Sales Achievement', formatPercent(overallSalesAchv), 'Time Factor Benchmark', formatPercent(data.meta.time_factor)],
    ['Total Toko Termonitor', `${data.meta.total_stores} Toko`, 'Branch Wilayah', data.meta.branch],
  ];

  autoTable(doc, {
    startY: startY + 4,
    head: [['Metrik Aktual', 'Nilai Aktual', 'Metrik Target / Parameter', 'Nilai Target']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [215, 25, 32], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { fontStyle: 'bold' },
    },
  });

  // Brand Performance Table
  startY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`2. BRAND PERFORMANCE (${brands.length} BRAND RPM)`, 14, startY);

  const brandRows = Object.values(data.resume_brands).map((b) => [
    b.brand,
    formatRupiah(b.target_net_sales),
    formatRupiah(b.actual_net_sales),
    formatPercent(b.acv_net_sales),
    formatNumber(b.target_qty),
    formatNumber(b.actual_qty),
    formatPercent(b.acv_qty),
    b.point ? (b.point * 100).toFixed(2) + ' pts' : 'N/A',
    (b.point || 0) >= data.meta.time_factor ? 'DIATAS TF' : 'DIBAWAH TF',
  ]);

  autoTable(doc, {
    startY: startY + 4,
    head: [['Brand', 'Target Sales', 'Actual Sales', 'Achv Sales', 'Target Qty', 'Actual Qty', 'Achv Qty', 'Point', 'Status TF']],
    body: brandRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    didParseCell: (dataCell) => {
      if (dataCell.section === 'body' && dataCell.column.index === 8) {
        if (dataCell.cell.raw === 'DIATAS TF') {
          dataCell.cell.styles.textColor = [16, 185, 129];
          dataCell.cell.styles.fontStyle = 'bold';
        } else {
          dataCell.cell.styles.textColor = [225, 29, 72];
          dataCell.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // AM Ranking Table
  startY = (doc as any).lastAutoTable.finalY + 8;
  if (startY > 230) {
    doc.addPage();
    startY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. AREA MANAGER (AM) PERFORMANCE RANKING', 14, startY);

  const amRows = data.resume_am_ranking.map((am) => [
    `Rank ${am.rank}`,
    am.am,
    ...brands.map((b) => formatPercent(am.brand_values?.[b] !== undefined ? am.brand_values[b] : (am as any)[b.toLowerCase().replace(/[^a-z0-9]/g, '')])),
  ]);

  autoTable(doc, {
    startY: startY + 4,
    head: [['Rank', 'AM', ...brands]],
    body: amRows,
    theme: 'grid',
    headStyles: { fillColor: [215, 25, 32], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2, halign: 'center' },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
      1: { fontStyle: 'bold', halign: 'left' },
    },
  });

  // Top 5 and Bottom 5 Stores
  const sortedStores = [...data.stores].sort((a, b) => (b.avg || 0) - (a.avg || 0));
  const top5 = sortedStores.slice(0, 5);
  const bottom5 = sortedStores.slice(-5).reverse();

  startY = (doc as any).lastAutoTable.finalY + 8;
  if (startY > 220) {
    doc.addPage();
    startY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. TOP 5 & BOTTOM 5 TOKO PERFORMANCE', 14, startY);

  const storeRows = [
    ...top5.map((s, i) => [`#${i + 1} TOP`, s.kode, s.nama, s.am, s.ac, formatPercent(s.avg), `${s.above_tf_count} / ${brands.length} Brand`]),
    ...bottom5.map((s, i) => [`#${i + 1} BTM`, s.kode, s.nama, s.am, s.ac, formatPercent(s.avg), `${s.above_tf_count} / ${brands.length} Brand`]),
  ];

  autoTable(doc, {
    startY: startY + 4,
    head: [['Status', 'Kode', 'Nama Toko', 'AM', 'AC', 'Average Achv', 'Brand Diatas TF']],
    body: storeRows,
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2 },
  });

  // Footer on all pages
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Halaman ${i} dari ${pageCount} – Alfamidi Business Intelligence Portal`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save(`Alfamidi_RPM_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportCleanedExcel(data: RPMData) {
  const wb = XLSX.utils.book_new();

  const brands = (data.meta.brands && data.meta.brands.length > 0)
    ? data.meta.brands
    : Object.keys(data.resume_brands);

  // 1. Resume sheet
  const resumeData = Object.values(data.resume_brands).map((b) => ({
    Brand: b.brand,
    'Target Struk': b.target_struk,
    'Actual Struk': b.actual_struk,
    'Achv Struk': b.acv_struk,
    'Target Qty': b.target_qty,
    'Actual Qty': b.actual_qty,
    'Achv Qty': b.acv_qty,
    'Target Net Sales': b.target_net_sales,
    'Actual Net Sales': b.actual_net_sales,
    'Achv Net Sales': b.acv_net_sales,
    Point: b.point,
    'Status Time Factor': b.point && b.point >= data.meta.time_factor ? 'DIATAS TF' : 'DIBAWAH TF',
    'Stock Toko': b.stock_toko,
    'Stock DC': b.stock_dc,
    DSI: b.dsi,
  }));
  const wsResume = XLSX.utils.json_to_sheet(resumeData);
  XLSX.utils.book_append_sheet(wb, wsResume, 'RESUME_CLEAN');

  // 2. Stores sheet (Dynamic brand columns)
  const storeData = data.stores.map((s) => {
    const rowObj: Record<string, any> = {
      Kode: s.kode,
      Nama: s.nama,
      AC: s.ac,
      AM: s.am,
    };
    brands.forEach((b) => {
      rowObj[`${b} Achv`] = s.brand_values?.[b] !== undefined ? s.brand_values[b] : (s as any)[b.toLowerCase().replace(/[^a-z0-9]/g, '')];
    });
    rowObj['Average Achv'] = s.avg;
    rowObj['Brand Diatas TF'] = s.above_tf_count;
    rowObj['Brand Dibawah TF'] = s.below_tf_count;
    return rowObj;
  });
  const wsStores = XLSX.utils.json_to_sheet(storeData);
  XLSX.utils.book_append_sheet(wb, wsStores, 'STORES');

  // 3. Products
  const prodData = data.products.map((p) => ({
    PLU: p.plu,
    Deskripsi: p.descp,
    Brand: p.program,
    'Qty Sales': p.qty_sales,
    'Net Sales': p.net_sales,
    'Margin Rp': p.margin_rp,
    'Margin %': (p.margin_pct * 100).toFixed(2) + '%',
    'Good Stock': p.good_stok,
    'Bad Stock': p.bad_stok,
    'PKM Qty': p.pkm_qty,
    'MPKM Qty': p.mpkm_qty,
  }));
  const wsProd = XLSX.utils.json_to_sheet(prodData);
  XLSX.utils.book_append_sheet(wb, wsProd, 'PRODUCTS');

  XLSX.writeFile(wb, `Alfamidi_RPM_Clean_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
