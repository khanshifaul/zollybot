/**
 * A model, avatar or profile answer from the host can omit the employment fields. Keep the ones the
 * roster already had, or changing a model moves the agent out of its office and hides it.
 */
interface EmploymentFields {
  officeId?: string | null;
  officeName?: string | null;
  role?: string | null;
  scope?: string | null;
}

export function keepEmployment<T extends object>(
  next: T & EmploymentFields,
  previous: EmploymentFields | undefined,
): T & EmploymentFields {
  if (!previous) return next;
  return {
    ...next,
    ...(next.officeId === undefined && previous.officeId !== undefined ? { officeId: previous.officeId } : {}),
    ...(next.officeName === undefined && previous.officeName !== undefined ? { officeName: previous.officeName } : {}),
    ...(next.role === undefined && previous.role !== undefined ? { role: previous.role } : {}),
    ...(next.scope === undefined && previous.scope !== undefined ? { scope: previous.scope } : {}),
  };
}
