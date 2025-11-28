import { ReconciliationResult } from '../domain/types';

export interface ReportPresenter {
  present(result: ReconciliationResult): void;
}
