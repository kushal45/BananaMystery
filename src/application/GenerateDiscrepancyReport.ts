import { Reconciler } from '../domain/Reconciler';
import { DeliveryProvider, UsageProvider, InventoryProvider } from './ports';
import { ReportPresenter } from './ReportPresenter';

export class GenerateDiscrepancyReport {
  constructor(
    private readonly deliveryProvider: DeliveryProvider,
    private readonly usageProvider: UsageProvider,
    private readonly inventoryProvider: InventoryProvider,
    private readonly reconciler: Reconciler,
    private readonly presenter: ReportPresenter
  ) {}

  async execute(): Promise<void> {
    const [delivery, usage, inventory] = await Promise.all([
      this.deliveryProvider.getDelivery(),
      this.usageProvider.getUsage(),
      this.inventoryProvider.getInventory()
    ]);

    const result = this.reconciler.reconcile(delivery, usage, inventory);
    this.presenter.present(result);
  }
}
