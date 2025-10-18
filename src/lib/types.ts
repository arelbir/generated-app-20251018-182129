// This file can be used for frontend-specific types that are not shared with the backend.
// For example, UI state types, form types, etc.
export type NavItem = {
  to: string;
  icon: React.ElementType;
  label: string;
  subItems?: NavSubItem[];
};
export type NavSubItem = {
  to: string;
  label: string;
};