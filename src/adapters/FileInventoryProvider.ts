import { InventoryProvider } from '../application/ports';
import { InventoryRecord } from '../domain/types';
import * as fs from 'fs/promises';

export class FileInventoryProvider implements InventoryProvider {
  constructor(private readonly filePath: string) {}

  async getInventory(): Promise<InventoryRecord[]> {
    const content = await fs.readFile(this.filePath, 'utf-8');
    try {
      const data = JSON.parse(content);
      // Validate is array
      if (!Array.isArray(data)) {
        throw new Error('Invalid inventory format: expected array');
      }
      return data as InventoryRecord[];
    } catch (e) {
      throw new Error(`Failed to parse inventory file: ${e}`);
    }
  }
}
