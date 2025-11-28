import { FoodType, Quantity, InventoryRecord, AuditRecord, AuditStatus, ReconciliationResult } from './types';

export class Reconciler {
  public reconcile(
    delivery: InventoryRecord[],
    usage: InventoryRecord[],
    inventory: InventoryRecord[]
  ): ReconciliationResult {
    const expectedStock = new Map<FoodType, Quantity>();
    const actualStock = new Map<FoodType, Quantity>();
    const allItems = new Set<FoodType>();

    // Process Delivery
    for (const record of delivery) {
      const current = expectedStock.get(record.item) || 0;
      expectedStock.set(record.item, current + record.quantity);
      allItems.add(record.item);
    }

    // Process Usage
    for (const record of usage) {
      const current = expectedStock.get(record.item) || 0;
      expectedStock.set(record.item, current - record.quantity);
      allItems.add(record.item);
    }

    // Process Inventory
    for (const record of inventory) {
      actualStock.set(record.item, record.quantity);
      allItems.add(record.item);
    }

    const records: AuditRecord[] = [];
    let discrepancyCount = 0;

    for (const item of allItems) {
      let expected = 0;
      if (expectedStock.has(item)) {
        expected = expectedStock.get(item)!;
      }
      // If item is not in inventory map, it means it's missing from inventory file.
      // But if it's 0 in inventory, it's in the map with value 0.
      const actual = actualStock.has(item) ? actualStock.get(item)! : NaN; 
      
      let status: AuditStatus;
      let difference = 0;

      if (isNaN(actual)) {
        status = AuditStatus.UNKNOWN;
        difference = NaN;
      } else if (isNaN(expected)) {
          // If expected is NaN (due to invalid delivery data), then status is UNKNOWN?
          // Or should we treat invalid delivery as 0?
          // Let's assume if expected calculation failed, it's a problem.
          // But my current logic for expected doesn't produce NaN unless I explicitly set it.
          // In FileDeliveryProvider I set NaN for invalid values.
          status = AuditStatus.UNKNOWN;
          difference = NaN;
      } else {
        difference = actual - expected;
        if (difference !== 0) {
          status = AuditStatus.DISCREPANCY;
          discrepancyCount++;
        } else {
          status = AuditStatus.OK;
        }
      }

      records.push({
        item,
        expected,
        actual,
        difference,
        status
      });
    }

    return {
      records,
      summary: `${discrepancyCount} discrepancy found`
    };
  }
}
