import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/main.service.js';

export async function getNotifications(req: FastifyRequest, reply: FastifyReply) {
  // Get in-app notifications (unread first, paginated)
  const result = await service.getNotifications(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchNotificationsIdRead(req: FastifyRequest, reply: FastifyReply) {
  // Mark single notification as read
  const result = await service.patchNotificationsIdRead(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchNotificationsReadAll(req: FastifyRequest, reply: FastifyReply) {
  // Mark all notifications as read
  const result = await service.patchNotificationsReadAll(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getNotificationsUnreadCount(req: FastifyRequest, reply: FastifyReply) {
  // Get count of unread notifications (badge)
  const result = await service.getNotificationsUnreadCount(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getShows(req: FastifyRequest, reply: FastifyReply) {
  // List upcoming card shows. Query: lat, lng, radius, dateFrom
  const result = await service.getShows(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getShowsId(req: FastifyRequest, reply: FastifyReply) {
  // Show detail with dealers attending + want list matches
  const result = await service.getShowsId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postShowsIdAttend(req: FastifyRequest, reply: FastifyReply) {
  // Mark attending a card show (consumer or dealer)
  const result = await service.postShowsIdAttend(req.body, req.params, req.query);
  return reply.send(result);
}

export async function deleteShowsIdAttend(req: FastifyRequest, reply: FastifyReply) {
  // Remove attendance from card show
  const result = await service.deleteShowsIdAttend(req.body, req.params, req.query);
  return reply.send(result);
}

export async function getShowsIdDealers(req: FastifyRequest, reply: FastifyReply) {
  // Dealers attending this show with public inventory
  const result = await service.getShowsIdDealers(req.body, req.params, req.query);
  return reply.send(result);
}

export async function postShowsAdmin(req: FastifyRequest, reply: FastifyReply) {
  // Create new card show listing
  const result = await service.postShowsAdmin(req.body, req.params, req.query);
  return reply.send(result);
}

export async function patchShowsAdminId(req: FastifyRequest, reply: FastifyReply) {
  // Update card show details
  const result = await service.patchShowsAdminId(req.body, req.params, req.query);
  return reply.send(result);
}

export async function deleteShowsAdminId(req: FastifyRequest, reply: FastifyReply) {
  // Remove card show
  const result = await service.deleteShowsAdminId(req.body, req.params, req.query);
  return reply.send(result);
}

