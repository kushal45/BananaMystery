export type FoodType = string;
export type Quantity = number;

export interface InventoryRecord {
  item: FoodType;
  quantity: Quantity;
}

export enum AuditStatus {
  OK = 'OK',
  DISCREPANCY = 'DISCREPANCY',
  UNKNOWN = 'UNKNOWN'
}

export interface AuditRecord {
  item: FoodType;
  expected: Quantity;
  actual: Quantity;
  difference: Quantity;
  status: AuditStatus;
}

export interface ReconciliationResult {
  records: AuditRecord[];
  summary: string;
}
