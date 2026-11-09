import { expect } from "vitest";

/**
 * The rows of the named tables, for a per-migration test that compares a snapshot taken before the
 * upgrade with the database after it. A later migration adds its own tables, and those rows are not
 * this test's subject: picking the named tables keeps the check on the migration under test.
 */
export function pickTables(rows: Record<string, unknown[]>, tables: readonly string[]): Record<string, unknown[]> {
  return Object.fromEntries(
    tables.map((table) => {
      const value = rows[table];
      if (!value) throw new Error(`The snapshot names a table that the database does not have: ${table}`);
      return [table, value];
    }),
  );
}

/**
 * Compares only the tables that the expected snapshot names, so a later migration that adds its own
 * tables does not fail a test of an earlier one. Every named table must still match row for row.
 */
export function expectSameTables(actual: Record<string, unknown[]>, expected: Record<string, unknown[]>): void {
  expect(pickTables(actual, Object.keys(expected))).toEqual(expected);
}
