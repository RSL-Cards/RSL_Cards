import * as repository from '../repositories/main.repository.js';

export async function getNarrativesFeed(body: any, params: any, query: any) {
  // Market movers feed — latest published narratives (consumer)
  return repository.getNarrativesFeed(body, params, query);
}

export async function getNarrativesInventory(body: any, params: any, query: any) {
  // AI narratives relevant to dealer's current inventory
  return repository.getNarrativesInventory(body, params, query);
}

export async function getNarrativesId(body: any, params: any, query: any) {
  // Full narrative detail
  return repository.getNarrativesId(body, params, query);
}

export async function getNarrativesPlayerPlayername(body: any, params: any, query: any) {
  // All narratives for a specific player
  return repository.getNarrativesPlayerPlayername(body, params, query);
}

export async function getNarrativesCardCardid(body: any, params: any, query: any) {
  // Why is this card moving? Narratives for a specific card
  return repository.getNarrativesCardCardid(body, params, query);
}

export async function getNarrativesDailyInsight(body: any, params: any, query: any) {
  // Single top daily AI insight for dealer home screen
  return repository.getNarrativesDailyInsight(body, params, query);
}

export async function getNarrativesWeeklyRecap(body: any, params: any, query: any) {
  // AI weekly recap of collection performance
  return repository.getNarrativesWeeklyRecap(body, params, query);
}

export async function postNarrativesAdminGenerate(body: any, params: any, query: any) {
  // Manually trigger narrative generation for a player
  return repository.postNarrativesAdminGenerate(body, params, query);
}

export async function patchNarrativesAdminIdApprove(body: any, params: any, query: any) {
  // Approve narrative for publishing
  return repository.patchNarrativesAdminIdApprove(body, params, query);
}

export async function patchNarrativesAdminIdReject(body: any, params: any, query: any) {
  // Reject narrative with reason
  return repository.patchNarrativesAdminIdReject(body, params, query);
}

export async function patchNarrativesAdminId(body: any, params: any, query: any) {
  // Edit narrative body/headline before publishing
  return repository.patchNarrativesAdminId(body, params, query);
}

