import { DeliveryProvider } from '../application/ports';
import { InventoryRecord } from '../domain/types';
import * as fs from 'fs/promises';

export class FileDeliveryProvider implements DeliveryProvider {
  constructor(private readonly filePath: string) {}

  async getDelivery(): Promise<InventoryRecord[]> {
    const content = await fs.readFile(this.filePath, 'utf-8');
    const lines = content.split('\n');
    const records: InventoryRecord[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Split by first '=' only
      const parts = line.split('=');
      const key = parts[0].trim();
      let valueStr = parts.slice(1).join('=').trim();

      // Handle quotes
      if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
        valueStr = valueStr.slice(1, -1);
      }

      // Handle empty or invalid
      if (valueStr === '') {
        // Spec: "The delivery.txt file may contain invalid values (empty or quoted)"
        // If empty, we can't parse a quantity. 
        // We should probably treat it as NaN to indicate issue, or skip?
        // If we skip, we assume 0 expected.
        // If we use NaN, we can propagate "UNKNOWN".
        records.push({ item: key, quantity: NaN });
        continue;
      }

      const quantity = parseInt(valueStr, 10);
      if (isNaN(quantity)) {
         records.push({ item: key, quantity: NaN });
      } else {
        records.push({ item: key, quantity });
      }
    }
    return records;
  }
}
