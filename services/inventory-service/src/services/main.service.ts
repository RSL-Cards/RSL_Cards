import * as repository from '../repositories/main.repository.js';

export async function getInventory(body: any, params: any, query: any) {
  // List inventory. Query: sport, grade, status, sort, page, limit
  return repository.getInventory(body, params, query);
}

export async function getInventorySummary(body: any, params: any, query: any) {
  // Total cards, total cost basis, total market value, unrealized P&L
  return repository.getInventorySummary(body, params, query);
}

export async function getInventoryAgingAlerts(body: any, params: any, query: any) {
  // Cards held 60+ days or losing value
  return repository.getInventoryAgingAlerts(body, params, query);
}

export async function getInventoryId(body: any, params: any, query: any) {
  // Get single inventory item with full detail
  return repository.getInventoryId(body, params, query);
}

export async function postInventory(body: any, params: any, query: any) {
  // Add card to inventory (manual add)
  return repository.postInventory(body, params, query);
}

export async function patchInventoryId(body: any, params: any, query: any) {
  // Update card details (notes, photos, grade, cost)
  return repository.patchInventoryId(body, params, query);
}

export async function deleteInventoryId(body: any, params: any, query: any) {
  // Remove card from inventory
  return repository.deleteInventoryId(body, params, query);
}

export async function postInventoryRevalue(body: any, params: any, query: any) {
  // Trigger manual market value refresh for all cards
  return repository.postInventoryRevalue(body, params, query);
}

export async function postInventoryIdPhotos(body: any, params: any, query: any) {
  // Upload card photo (returns S3 presigned URL)
  return repository.postInventoryIdPhotos(body, params, query);
}

export async function deleteInventoryIdPhotosPhotoindex(body: any, params: any, query: any) {
  // Remove a card photo
  return repository.deleteInventoryIdPhotosPhotoindex(body, params, query);
}

export async function postInventoryBulkImport(body: any, params: any, query: any) {
  // Upload CSV/Excel file for bulk import. Returns jobId
  return repository.postInventoryBulkImport(body, params, query);
}

export async function getInventoryBulkImportJobid(body: any, params: any, query: any) {
  // Poll bulk import job status and progress
  return repository.getInventoryBulkImportJobid(body, params, query);
}

export async function getInventoryExport(body: any, params: any, query: any) {
  // Export inventory as CSV
  return repository.getInventoryExport(body, params, query);
}

export async function getInventoryPublicDealerid(body: any, params: any, query: any) {
  // Get dealer's public inventory for consumer app
  return repository.getInventoryPublicDealerid(body, params, query);
}

