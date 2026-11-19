/**
 * zolly offices: which repositories on this machine carry a zolly office, and what is in each
 * office's queue. The app reads these; every mutation still goes through the zolly CLI.
 *
 * An office is a repository, not a machine: `root` is the repository path, and the same repository
 * cloned twice is two offices with two roots.
 */

import { isIdentifier } from "./ipc-bounded-values";
import { isDynamicRecord, isNumber, isOneOf, isString } from "./runtime-values";

/**
 * Additive, optional Team API behaviour: a host that does not advertise this string has no zolly
 * routes. The string is permanent - evolving it means a second capability, never an edit.
 */
export const ZOLLY_OFFICE_CAPABILITY = "zolly-office-v1";

/** The queue contract's vocabulary, unchanged. `blocked` is a gate, not a failure. */
export const ZOLLY_QUEUE_STATUSES = ["queued", "dispatched", "blocked", "done", "failed", "escalated"] as const;

export type ZollyQueueStatus = (typeof ZOLLY_QUEUE_STATUSES)[number];

export const ZOLLY_GATES = ["auto", "human"] as const;

export type ZollyGate = (typeof ZOLLY_GATES)[number];

/** Counts per status, so a screen can render a board without reading every entry. */
export type ZollyQueueCounts = Record<ZollyQueueStatus, number>;

export interface ZollyOffice {
  /** Stable within one host: derived from `root`, so a rename of the folder is a new office. */
  id: string;
  /** Absolute path of the repository that owns the office. */
  root: string;
  frequency: string | null;
  baseBranch: string | null;
  remote: string | null;
  queue: ZollyQueueCounts;
}

export interface ZollyOffices {
  offices: ZollyOffice[];
}

export interface ZollyQueueEntry {
  id: string;
  title: string;
  status: ZollyQueueStatus;
  gate: ZollyGate;
}

export interface ZollyQueue {
  officeId: string;
  entries: ZollyQueueEntry[];
}

export interface ZollyOfficeInput {
  officeId: string;
}

const OFFICE_LIST_LIMIT = 500;
const QUEUE_LIMIT = 5_000;
const PATH_LIMIT = 4_096;
const TEXT_LIMIT = 255;
const LABEL_LIMIT = 128;

function isCount(value: unknown): value is number {
  return isNumber(value) && Number.isSafeInteger(value) && value >= 0;
}

function isNullableBoundedText(value: unknown, maximum: number): value is string | null {
  return value === null || (isString(value) && value.length <= maximum);
}

function isQueueCounts(value: unknown): value is ZollyQueueCounts {
  return (
    isDynamicRecord(value) &&
    Object.keys(value).length === ZOLLY_QUEUE_STATUSES.length &&
    ZOLLY_QUEUE_STATUSES.every((status) => isCount(value[status]))
  );
}

export function isZollyOffice(value: unknown): value is ZollyOffice {
  return (
    isDynamicRecord(value) &&
    Object.keys(value).every((key) => ["id", "root", "frequency", "baseBranch", "remote", "queue"].includes(key)) &&
    isIdentifier(value.id) &&
    isString(value.root) &&
    value.root.length <= PATH_LIMIT &&
    isNullableBoundedText(value.frequency, LABEL_LIMIT) &&
    isNullableBoundedText(value.baseBranch, LABEL_LIMIT) &&
    isNullableBoundedText(value.remote, LABEL_LIMIT) &&
    isQueueCounts(value.queue)
  );
}

export function isZollyOffices(value: unknown): value is ZollyOffices {
  return (
    isDynamicRecord(value) &&
    Object.keys(value).length === 1 &&
    Array.isArray(value.offices) &&
    value.offices.length <= OFFICE_LIST_LIMIT &&
    value.offices.every(isZollyOffice) &&
    new Set(value.offices.map((office) => office.id)).size === value.offices.length
  );
}

export function isZollyQueueEntry(value: unknown): value is ZollyQueueEntry {
  return (
    isDynamicRecord(value) &&
    Object.keys(value).length === 4 &&
    isIdentifier(value.id) &&
    isString(value.title) &&
    value.title.length <= TEXT_LIMIT &&
    isOneOf(ZOLLY_QUEUE_STATUSES, value.status) &&
    isOneOf(ZOLLY_GATES, value.gate)
  );
}

export function isZollyQueue(value: unknown): value is ZollyQueue {
  return (
    isDynamicRecord(value) &&
    Object.keys(value).length === 2 &&
    isIdentifier(value.officeId) &&
    Array.isArray(value.entries) &&
    value.entries.length <= QUEUE_LIMIT &&
    value.entries.every(isZollyQueueEntry)
  );
}

export function parseZollyOfficeInput(value: unknown): ZollyOfficeInput {
  if (!isDynamicRecord(value) || Object.keys(value).length !== 1 || !isIdentifier(value.officeId))
    throw new Error("Invalid zolly office request.");
  return { officeId: value.officeId };
}
