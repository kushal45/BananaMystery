import { DeliveryProvider, Logger } from '../application/ports';
import { InventoryRecord } from '../domain/types';
import * as fs from 'fs/promises';

export class FileDeliveryProvider implements DeliveryProvider {
  constructor(
    private readonly filePath: string,
    private readonly logger: Logger
  ) {}

  async getDelivery(): Promise<InventoryRecord[]> {
    this.logger.debug(`Reading delivery file: ${this.filePath}`);
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
        this.logger.warn(`Invalid empty value for item '${key}' in delivery file`);
        records.push({ item: key, quantity: NaN });
        continue;
      }

      const quantity = parseInt(valueStr, 10);
      if (isNaN(quantity)) {
         this.logger.warn(`Invalid non-numeric value '${valueStr}' for item '${key}' in delivery file`);
         records.push({ item: key, quantity: NaN });
      } else {
        records.push({ item: key, quantity });
      }
    }
    this.logger.debug(`Parsed ${records.length} delivery records`);
    return records;
  }
}
