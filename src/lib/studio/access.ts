export interface StudioAccessProfile {
  role?: string | null;
  institution_id?: string | null;
}

/**
 * Determines whether a user is authorized to access the KNEC Project Studio.
 * - Admins and Supervisors always have access.
 * - Students only have access if they are enrolled in a taught class (`institution_id !== null`)
 *   via the trainer's Class Access Code or explicit Admin toggle in the User Directory.
 * - External Marketplace buyers (`institution_id === null`) are limited to the Marketplace and Digital Library.
 */
export function hasStudioAccess(profile: StudioAccessProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "supervisor") return true;
  return Boolean(profile.institution_id);
}
