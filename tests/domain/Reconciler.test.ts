import { Reconciler } from '../../src/domain/Reconciler';
import { AuditStatus, InventoryRecord } from '../../src/domain/types';

describe('Reconciler', () => {
  let reconciler: Reconciler;

  beforeEach(() => {
    reconciler = new Reconciler();
  });

  it('should identify OK status when expected matches actual', () => {
    const delivery: InventoryRecord[] = [{ item: 'banana', quantity: 10 }];
    const usage: InventoryRecord[] = [{ item: 'banana', quantity: 2 }];
    const inventory: InventoryRecord[] = [{ item: 'banana', quantity: 8 }];

    const result = reconciler.reconcile(delivery, usage, inventory);

    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toEqual({
      item: 'banana',
      expected: 8,
      actual: 8,
      difference: 0,
      status: AuditStatus.OK
    });
  });

  it('should identify DISCREPANCY when expected does not match actual', () => {
    const delivery: InventoryRecord[] = [{ item: 'banana', quantity: 10 }];
    const usage: InventoryRecord[] = [{ item: 'banana', quantity: 2 }];
    const inventory: InventoryRecord[] = [{ item: 'banana', quantity: 5 }]; // Missing 3

    const result = reconciler.reconcile(delivery, usage, inventory);

    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toEqual({
      item: 'banana',
      expected: 8,
      actual: 5,
      difference: -3,
      status: AuditStatus.DISCREPANCY
    });
  });

  it('should handle multiple usage entries correctly', () => {
    const delivery: InventoryRecord[] = [{ item: 'banana', quantity: 10 }];
    const usage: InventoryRecord[] = [
      { item: 'banana', quantity: 2 },
      { item: 'banana', quantity: 3 }
    ];
    const inventory: InventoryRecord[] = [{ item: 'banana', quantity: 5 }];

    const result = reconciler.reconcile(delivery, usage, inventory);

    expect(result.records[0]).toEqual({
      item: 'banana',
      expected: 5, // 10 - 2 - 3
      actual: 5,
      difference: 0,
      status: AuditStatus.OK
    });
  });

  it('should return UNKNOWN if item is missing from inventory file (Actual is NaN)', () => {
    const delivery: InventoryRecord[] = [{ item: 'banana', quantity: 10 }];
    const usage: InventoryRecord[] = [];
    const inventory: InventoryRecord[] = []; // Empty inventory

    const result = reconciler.reconcile(delivery, usage, inventory);

    expect(result.records[0]).toEqual({
      item: 'banana',
      expected: 10,
      actual: NaN,
      difference: NaN,
      status: AuditStatus.UNKNOWN
    });
  });

  it('should return UNKNOWN if delivery quantity was invalid (Expected is NaN)', () => {
    const delivery: InventoryRecord[] = [{ item: 'lettuce', quantity: NaN }];
    const usage: InventoryRecord[] = [];
    const inventory: InventoryRecord[] = [{ item: 'lettuce', quantity: 0 }];

    const result = reconciler.reconcile(delivery, usage, inventory);

    expect(result.records[0]).toEqual({
      item: 'lettuce',
      expected: NaN,
      actual: 0,
      difference: NaN,
      status: AuditStatus.UNKNOWN
    });
  });

  it('should handle items present in inventory but not in delivery/usage', () => {
    const delivery: InventoryRecord[] = [];
    const usage: InventoryRecord[] = [];
    const inventory: InventoryRecord[] = [{ item: 'surprise', quantity: 5 }];

    const result = reconciler.reconcile(delivery, usage, inventory);

    expect(result.records[0]).toEqual({
      item: 'surprise',
      expected: 0,
      actual: 5,
      difference: 5,
      status: AuditStatus.DISCREPANCY
    });
  });

  it('should generate correct summary', () => {
    const delivery: InventoryRecord[] = [
      { item: 'a', quantity: 10 },
      { item: 'b', quantity: 10 }
    ];
    const usage: InventoryRecord[] = [];
    const inventory: InventoryRecord[] = [
      { item: 'a', quantity: 10 }, // OK
      { item: 'b', quantity: 5 }   // Discrepancy
    ];

    const result = reconciler.reconcile(delivery, usage, inventory);

    expect(result.summary).toBe('1 discrepancy found');
  });
});
