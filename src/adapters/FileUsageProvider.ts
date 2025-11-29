import { UsageProvider, Logger } from '../application/ports';
import { InventoryRecord } from '../domain/types';
import * as fs from 'fs/promises';

export class FileUsageProvider implements UsageProvider {
  constructor(
    private readonly filePath: string,
    private readonly logger: Logger
  ) {}

  async getUsage(): Promise<InventoryRecord[]> {
    this.logger.debug(`Reading usage file: ${this.filePath}`);
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
      } else {
        this.logger.warn(`Skipping invalid usage line: ${line}`);
      }
    }
    this.logger.debug(`Parsed ${records.length} usage records`);
    return records;
  }
}
