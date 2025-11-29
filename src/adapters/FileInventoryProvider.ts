import { InventoryProvider, Logger } from '../application/ports';
import { InventoryRecord } from '../domain/types';
import * as fs from 'fs/promises';

export class FileInventoryProvider implements InventoryProvider {
  constructor(
    private readonly filePath: string,
    private readonly logger: Logger
  ) {}

  async getInventory(): Promise<InventoryRecord[]> {
    this.logger.debug(`Reading inventory file: ${this.filePath}`);
    const content = await fs.readFile(this.filePath, 'utf-8');
    try {
      const data = JSON.parse(content);
      // Validate is array
      if (!Array.isArray(data)) {
        throw new Error('Invalid inventory format: expected array');
      }
      this.logger.debug(`Parsed ${data.length} inventory records`);
      return data as InventoryRecord[];
    } catch (e) {
      this.logger.error(`Failed to parse inventory file: ${e}`);
      throw new Error(`Failed to parse inventory file: ${e}`);
    }
  }
}
