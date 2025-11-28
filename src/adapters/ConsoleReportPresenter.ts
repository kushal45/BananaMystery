import { ReportPresenter } from '../application/ReportPresenter';
import { ReconciliationResult, AuditStatus } from '../domain/types';

export class ConsoleReportPresenter implements ReportPresenter {
  present(result: ReconciliationResult): void {
    console.log('Zoo Food Audit Report');
    console.log('=====================');
    console.log('');

    const sortedRecords = [...result.records].sort((a, b) => a.item.localeCompare(b.item));

    for (const record of sortedRecords) {
      if (record.status === AuditStatus.OK) {
        console.log(`${record.item}: OK`);
      } else if (record.status === AuditStatus.DISCREPANCY) {
        console.log(`${record.item}: DISCREPANCY ${record.difference > 0 ? '+' : ''}${record.difference} (expected: ${record.expected}, actual: ${record.actual})`);
      } else {
        console.log(`${record.item}: UNKNOWN (missing data)`);
      }
    }

    console.log('');
    console.log(`Summary: ${result.summary}`);
  }
}
