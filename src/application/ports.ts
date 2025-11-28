import { InventoryRecord } from '../domain/types';

export interface InventoryProvider {
  getInventory(): Promise<InventoryRecord[]>;
}

export interface DeliveryProvider {
  getDelivery(): Promise<InventoryRecord[]>;
}

export interface UsageProvider {
  getUsage(): Promise<InventoryRecord[]>;
}
