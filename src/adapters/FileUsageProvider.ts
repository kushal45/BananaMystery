import { UsageProvider } from '../application/ports';
import { InventoryRecord } from '../domain/types';
import * as fs from 'fs/promises';

export class FileUsageProvider implements UsageProvider {
  constructor(private readonly filePath: string) {}

  async getUsage(): Promise<InventoryRecord[]> {
    const content = await fs.readFile(this.filePath, 'utf-8');
    const lines = content.split('\n');
    const records: InventoryRecord[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [item, quantityStr] = line.split(',');
      const quantity = parseInt(quantityStr, 10);
      
      if (!isNaN(quantity)) {
        records.push({ item: item.trim(), quantity });
      }
    }
    return records;
  }
}
