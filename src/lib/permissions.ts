// Central role/permission helpers. Stage 2 permissions are UI-level only;
// a future Supabase backend will enforce the real rules via RLS policies.

import type { Membership, Role } from "../types";

/** Resolve the current user's role within the active company. */
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

export function canInviteMembers(role: Role | null): boolean {
  return role === "owner" || role === "admin";
}

export function canResetCompanyData(role: Role | null): boolean {
  return role === "owner";
}

export function canManageItems(role: Role | null): boolean {
  return role === "owner" || role === "admin";
}

/** Create sales/expenses/production — everyone with a role can. */
export function canCreateRecords(role: Role | null): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

/** Cancel/soft-delete accounting records. */
export function canCancelRecords(role: Role | null): boolean {
  return role === "owner" || role === "admin";
}

export function canChangeCompanySettings(role: Role | null): boolean {
  return role === "owner";
}

/** Russian label for a role. */
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
