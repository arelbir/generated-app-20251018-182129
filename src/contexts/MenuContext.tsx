import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface MenuItem {
  id: string;
  name: string;
  path: string;
  displayName: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  children: MenuItem[];
}

interface MenuContextType {
  menuItems: MenuItem[];
  isLoading: boolean;
  refreshMenu: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export { MenuContext };

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchMenu = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setMenuItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/rbac/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMenuItems(data.data || []);
      } else {
        console.error('Failed to fetch menu:', data.error);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Menu fetch error:', error);
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  const refreshMenu = async () => {
    await fetchMenu();
  };

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const value: MenuContextType = {
    menuItems,
    isLoading,
    refreshMenu,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
