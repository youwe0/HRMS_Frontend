import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

type HasPermissionProps = {
  /** Permission key to check against the user's permissions array. */
  permission: string | null | undefined;
  /** Content to render when the permission check passes. */
  children: ReactNode;
  /**
   * Content to render when the permission check fails.
   * Defaults to `null` (nothing rendered).
   */
  fallback?: ReactNode;
};

/**
 * Generic permission gate that works with **any** element — divs, sections,
 * buttons, cards, etc.
 *
 * Usage:
 * ```tsx
 * <HasPermission permission="payroll.view">
 *   <div>This section is only visible to users with payroll.view</div>
 * </HasPermission>
 *
 * <HasPermission permission="settings.edit">
 *   <Button>Save Settings</Button>
 * </HasPermission>
 * ```
 */
export function HasPermission({
  permission,
  children,
  fallback = null,
}: HasPermissionProps) {
  const { hasPermission } = usePermissions();

  return hasPermission(permission) ? children : fallback;
}
