import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import RamenDiningOutlinedIcon from '@mui/icons-material/RamenDiningOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { ROUTES } from '@/constants/routes.ts';

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon: SvgIconComponent;
  disabled?: boolean;
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: ROUTES.DASHBOARD, icon: DashboardOutlinedIcon },
  { id: 'foods', label: 'Foods', path: ROUTES.FOODS, icon: RestaurantMenuOutlinedIcon },
  { id: 'recipe-builder', label: 'Recipe Builder', path: ROUTES.RECIPE_BUILDER, icon: RamenDiningOutlinedIcon },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { id: 'analytics', label: 'Analytics', path: ROUTES.ANALYTICS, icon: AnalyticsOutlinedIcon },
  { id: 'weight', label: 'Weight Tracker', icon: ScaleOutlinedIcon, disabled: true, badge: 'Soon' },
  { id: 'settings', label: 'Settings', path: ROUTES.SETTINGS, icon: SettingsOutlinedIcon },
];

export const SIDEBAR_WIDTH = 264;
export const NAVBAR_HEIGHT = 68;
