/**
 * API client for the Motor Fault Diagnostic Tool backend.
 */

import { DiagnosticInput, DiagnosticResult, Stats } from './types';

const BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function runDiagnosis(input: DiagnosticInput): Promise<DiagnosticResult> {
  const response = await fetch(`${BASE_URL}/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<DiagnosticResult>(response);
}

export async function getHistory(faultType?: string): Promise<DiagnosticResult[]> {
  const params = new URLSearchParams();
  if (faultType) params.append('fault_type', faultType);
  const response = await fetch(`${BASE_URL}/history?${params}`);
  return handleResponse<DiagnosticResult[]>(response);
}

export async function getStats(): Promise<Stats> {
  const response = await fetch(`${BASE_URL}/stats`);
  return handleResponse<Stats>(response);
}

export async function deleteRecord(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/history/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete record');
}

export function getReportUrl(id: number): string {
  return `${BASE_URL}/report/${id}`;
}
