// Central role/permission helpers. Stage 3 permissions are UI-level only;
// a future Supabase backend will enforce the real rules via RLS policies.

import type { Membership, Role } from "../types";

export function getCurrentRole(
  memberships: Membership[],
  userId: string | null,
  businessId: string | null
): Role | null {
  if (!userId || !businessId) return null;
  const m = memberships.find(
    (x) => x.userId === userId && x.businessId === businessId && x.status === "active"
  );
  return m ? m.role : null;
}

export const canInviteMembers = (r: Role | null) => r === "owner" || r === "admin";
export const canManageItems = (r: Role | null) => r === "owner" || r === "admin";
export const canManageSuppliers = (r: Role | null) => r === "owner" || r === "admin";
export const canCancelRecords = (r: Role | null) => r === "owner" || r === "admin";
export const canCreateRecords = (r: Role | null) => r === "owner" || r === "admin" || r === "member";
export const canResetCompanyData = (r: Role | null) => r === "owner";
export const canChangeCompanySettings = (r: Role | null) => r === "owner";

export function roleLabel(role: Role | null): string {
  switch (role) {
    case "owner":
      return "Владелец";
    case "admin":
      return "Админ";
    case "member":
      return "Сотрудник";
    default:
      return "—";
  }
}
