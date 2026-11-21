export interface ResumeBrand {
  brand: string;
  target_struk: number | null;
  target_qty: number | null;
  target_net_sales: number | null;
  actual_struk: number | null;
  actual_qty: number | null;
  actual_net_sales: number | null;
  acv_struk: number | null;
  acv_qty: number | null;
  acv_net_sales: number | null;
  point: number | null;
  shortage_qty: number | null;
  status_tf: string | null;
  stock_toko: number | null;
  stock_dc: number | null;
  dsi: number | null;
}

export interface AMRanking {
  rank: number;
  am: string;
  brand_values: Record<string, number | null>;
  brand_kets: Record<string, string | null>;
  bango?: number | null;
  bango_ket?: string | null;
  caplang?: number | null;
  caplang_ket?: string | null;
  downy?: number | null;
  downy_ket?: string | null;
  hs?: number | null;
  hs_ket?: string | null;
  kahf?: number | null;
  kahf_ket?: string | null;
  lifebuoy?: number | null;
  lifebuoy_ket?: string | null;
  vaseline?: number | null;
  vaseline_ket?: string | null;
  [key: string]: any;
}

export interface ACRanking {
  rank: number;
  ac: string;
  brand_values: Record<string, number | null>;
  brand_kets: Record<string, string | null>;
  bango?: number | null;
  bango_ket?: string | null;
  caplang?: number | null;
  caplang_ket?: string | null;
  downy?: number | null;
  downy_ket?: string | null;
  hs?: number | null;
  hs_ket?: string | null;
  kahf?: number | null;
  kahf_ket?: string | null;
  lifebuoy?: number | null;
  lifebuoy_ket?: string | null;
  vaseline?: number | null;
  vaseline_ket?: string | null;
  [key: string]: any;
}

export interface StoreItem {
  no: number;
  kode: string;
  nama: string;
  ac: string;
  am: string;
  acv: number | null;
  avg: number | null;
  above_tf_count: number;
  below_tf_count: number;
  brand_values: Record<string, number | null>;
  brand_kets: Record<string, string | null>;
  bango?: number | null;
  bango_ket?: string | null;
  caplang?: number | null;
  caplang_ket?: string | null;
  downy?: number | null;
  downy_ket?: string | null;
  hs?: number | null;
  hs_ket?: string | null;
  kahf?: number | null;
  kahf_ket?: string | null;
  lifebuoy?: number | null;
  lifebuoy_ket?: string | null;
  vaseline?: number | null;
  vaseline_ket?: string | null;
  [key: string]: any;
}

export interface ACAMRow {
  no: number;
  am: string;
  store_ratio: string | null;
  target_struk: number | null;
  target_qty: number | null;
  target_net_sales: number | null;
  actual_struk: number | null;
  actual_qty: number | null;
  actual_net_sales: number | null;
  acv_struk: number | null;
  acv_qty: number | null;
  acv_net_sales: number | null;
  point: number | null;
  stock_pcs: number | null;
  asq: number | null;
  dsi: number | null;
}

export interface ACBrandRow {
  no: number;
  ac: string;
  store_ratio: string | null;
  target_struk: number | null;
  target_qty: number | null;
  target_net_sales: number | null;
  actual_struk: number | null;
  actual_qty: number | null;
  actual_net_sales: number | null;
  acv_struk: number | null;
  acv_qty: number | null;
  acv_net_sales: number | null;
  point: number | null;
  stock_pcs: number | null;
  asq: number | null;
  dsi: number | null;
}

export interface BrandStoreRow {
  no: number;
  kode: string;
  nama: string;
  ac: string;
  am: string;
  target_struk: number | null;
  target_qty: number | null;
  target_net_sales: number | null;
  actual_struk: number | null;
  actual_qty: number | null;
  actual_net_sales: number | null;
  acv_struk: number | null;
  acv_qty: number | null;
  acv_net_sales: number | null;
  point: number | null;
  stock_pcs: number | null;
  asq: number | null;
  dsi: number | null;
}

export interface StockRow {
  tgl: string;
  branch: string;
  lokasi: string;
  toko: string;
  nama_toko: string;
  plu: number;
  descp: string;
  program: string;
  good_stok: number;
  bad_stok: number;
  good_stok_rp: number;
  bad_stok_rp: number;
  pkm_qty: number;
  mpkm_qty: number;
  minor: number;
  mindis: number;
}

export interface SalesRow {
  periode: string;
  kd_store: string;
  nama_store: string;
  plu: number;
  descp: string;
  program: string;
  qty_sales: number;
  net_sales: number;
  margin_rp: number;
  struk_qty: number;
}

export interface ProductItem {
  plu: number;
  descp: string;
  program: string;
  qty_sales: number;
  net_sales: number;
  margin_rp: number;
  margin_pct: number;
  struk_qty: number;
  good_stok: number;
  bad_stok: number;
  good_stok_rp: number;
  bad_stok_rp: number;
  pkm_qty: number;
  mpkm_qty: number;
  minor: number;
  mindis: number;
  store_count_sales: number;
  store_count_stock: number;
}

export interface RPMData {
  meta: {
    title: string;
    period: string;
    sales_period: string;
    stock_date: string;
    hari_ke: number;
    time_factor: number;
    total_stores: number;
    total_stock_records: number;
    total_sales_records: number;
    total_products: number;
    branch: string;
    brands: string[];
  };
  resume_brands: Record<string, ResumeBrand>;
  resume_am_ranking: AMRanking[];
  resume_ac_ranking: ACRanking[];
  stores: StoreItem[];
  acam_data: Record<string, ACAMRow[]>;
  ac_brand_data?: Record<string, ACBrandRow[]>;
  brand_store_data: Record<string, BrandStoreRow[]>;
  products: ProductItem[];
  stock_rows_sample: StockRow[];
  sales_rows_sample: SalesRow[];
  stock_summary: {
    total_good_stock: number;
    total_bad_stock: number;
    total_good_stock_rp: number;
    total_bad_stock_rp: number;
    total_pkm_qty: number;
    total_mpkm_qty: number;
    total_minor: number;
    total_mindis: number;
    by_brand: Record<string, {
      good_stock: number;
      bad_stock: number;
      good_stock_rp: number;
      bad_stock_rp: number;
      pkm: number;
      mpkm: number;
    }>;
    by_location: {
      DC: number;
      Toko: number;
    };
  };
  sales_summary: {
    total_qty_sales: number;
    total_net_sales: number;
    total_margin_rp: number;
    total_struk_qty: number;
    by_brand: Record<string, {
      qty_sales: number;
      net_sales: number;
      margin_rp: number;
      struk_qty: number;
    }>;
  };
}

export interface FilterState {
  brand: string;
  am: string;
  ac: string;
  storeQuery: string;
  performanceTier: string;
}

export type ActiveTab = 
  | 'overview'
  | 'brand'
  | 'store'
  | 'timefactor'
  | 'acam'
  | 'stock'
  | 'sales'
  | 'product'
  | 'insights'
  | 'datamgmt';
