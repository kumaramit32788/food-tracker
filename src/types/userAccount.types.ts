export type UserRole = 'user' | 'admin';

export interface UserAccountMeta {
  role: UserRole;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === 'admin';
}
