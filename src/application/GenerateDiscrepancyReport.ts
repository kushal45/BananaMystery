import { Reconciler } from '../domain/Reconciler';
import { DeliveryProvider, UsageProvider, InventoryProvider, Logger } from './ports';
import { ReportPresenter } from './ReportPresenter';

export class GenerateDiscrepancyReport {
  constructor(
    private readonly deliveryProvider: DeliveryProvider,
    private readonly usageProvider: UsageProvider,
    private readonly inventoryProvider: InventoryProvider,
    private readonly reconciler: Reconciler,
    private readonly presenter: ReportPresenter,
    private readonly logger: Logger
  ) {}

  async execute(): Promise<void> {
    this.logger.info('Starting reconciliation process...');
    
    const [delivery, usage, inventory] = await Promise.all([
      this.deliveryProvider.getDelivery(),
      this.usageProvider.getUsage(),
      this.inventoryProvider.getInventory()
    ]);

    const result = this.reconciler.reconcile(delivery, usage, inventory);
    this.presenter.present(result);
    
    this.logger.info('Reconciliation complete.');
  }
}
