import React, { createContext, useContext, useState, useMemo } from 'react';
import { RPMData, FilterState, ActiveTab, StoreItem, ProductItem } from '../types';
import rawDefaultData from '../data/defaultData.json';

export const DATA_MGMT_PASSWORD = '0215026476';

interface DashboardContextType {
  data: RPMData;
  filters: FilterState;
  activeTab: ActiveTab;
  selectedStore: StoreItem | null;
  selectedBrand: string | null;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDataMgmtUnlocked: boolean;
  isDataMgmtModalOpen: boolean;
  setIsDataMgmtModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  unlockDataMgmt: (password: string) => boolean;
  lockDataMgmt: () => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedStore: (store: StoreItem | null) => void;
  setSelectedBrand: (brand: string | null) => void;
  resetFilters: () => void;
  updateData: (newData: RPMData) => void;
  
  // Computed & Filtered
  filteredStores: StoreItem[];
  filteredProducts: ProductItem[];
  amOptions: string[];
  acOptions: string[];
  brandOptions: string[];
}

const initialFilters: FilterState = {
  brand: 'ALL',
  am: 'ALL',
  ac: 'ALL',
  storeQuery: '',
  performanceTier: 'ALL',
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<RPMData>(rawDefaultData as unknown as RPMData);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Data Management Security Lock State
  const [isDataMgmtUnlocked, setIsDataMgmtUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('alfamidi_datamgmt_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [isDataMgmtModalOpen, setIsDataMgmtModalOpen] = useState<boolean>(false);

  const unlockDataMgmt = (password: string): boolean => {
    if (password.trim() === DATA_MGMT_PASSWORD) {
      setIsDataMgmtUnlocked(true);
      try {
        sessionStorage.setItem('alfamidi_datamgmt_unlocked', 'true');
      } catch {
        // Ignore session storage error if disabled
      }
      return true;
    }
    return false;
  };

  const lockDataMgmt = () => {
    setIsDataMgmtUnlocked(false);
    try {
      sessionStorage.removeItem('alfamidi_datamgmt_unlocked');
    } catch {
      // Ignore
    }
    if (activeTab === 'datamgmt') {
      setActiveTab('overview');
    }
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const updateData = (newData: RPMData) => {
    setData(newData);
    resetFilters();
  };

  // Filter options
  const amOptions = useMemo(() => {
    const set = new Set<string>();
    data.stores.forEach((s) => {
      if (s.am) set.add(s.am);
    });
    return Array.from(set).sort();
  }, [data]);

  const acOptions = useMemo(() => {
    const set = new Set<string>();
    data.stores.forEach((s) => {
      if (s.ac) set.add(s.ac);
    });
    return Array.from(set).sort();
  }, [data]);

  const brandOptions = useMemo(() => {
    return Object.keys(data.resume_brands);
  }, [data]);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return data.stores.filter((s) => {
      // AM filter
      if (filters.am !== 'ALL' && s.am !== filters.am) return false;
      // AC filter
      if (filters.ac !== 'ALL' && s.ac !== filters.ac) return false;
      // Store query
      if (filters.storeQuery) {
        const q = filters.storeQuery.toLowerCase();
        const matchKode = s.kode.toLowerCase().includes(q);
        const matchNama = s.nama.toLowerCase().includes(q);
        if (!matchKode && !matchNama) return false;
      }
      // Performance tier
      if (filters.performanceTier === 'ABOVE_TF') {
        if ((s.avg || 0) < data.meta.time_factor) return false;
      } else if (filters.performanceTier === 'BELOW_TF') {
        if ((s.avg || 0) >= data.meta.time_factor) return false;
      } else if (filters.performanceTier === 'HIGH') {
        if ((s.avg || 0) < 1.0) return false;
      } else if (filters.performanceTier === 'MED') {
        if ((s.avg || 0) < 0.8 || (s.avg || 0) >= 1.0) return false;
      } else if (filters.performanceTier === 'LOW') {
        if ((s.avg || 0) >= 0.8) return false;
      }

      return true;
    });
  }, [data, filters]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return data.products.filter((p) => {
      if (filters.brand !== 'ALL' && p.program.toUpperCase() !== filters.brand.toUpperCase()) {
        return false;
      }
      if (filters.storeQuery) {
        const q = filters.storeQuery.toLowerCase();
        const matchDescp = p.descp.toLowerCase().includes(q);
        const matchPlu = String(p.plu).includes(q);
        if (!matchDescp && !matchPlu) return false;
      }
      return true;
    });
  }, [data, filters]);

  return (
    <DashboardContext.Provider
      value={{
        data,
        filters,
        activeTab,
        selectedStore,
        selectedBrand,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isDataMgmtUnlocked,
        isDataMgmtModalOpen,
        setIsDataMgmtModalOpen,
        unlockDataMgmt,
        lockDataMgmt,
        setFilters,
        setActiveTab,
        setSelectedStore,
        setSelectedBrand,
        resetFilters,
        updateData,
        filteredStores,
        filteredProducts,
        amOptions,
        acOptions,
        brandOptions,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
