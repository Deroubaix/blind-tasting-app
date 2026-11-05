import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import ServerConfig from '../../config/ServerConfig';
import ServiceContainer from '../../utils/ServiceContainer';
import AuthService from './AuthService';
import ExportService from './ExportService';
import FlightService from './FlightService';
import LocalPhotoStorageService from './LocalPhotoStorageService';
import PhotoService from './PhotoService';
import PhotoStorageService from './PhotoStorageService';
import ProgressService from './ProgressService';
import R2PhotoStorageService from './R2PhotoStorageService';
import RateLimitService from './RateLimitService';
import SessionService from './SessionService';
import TastingService from './TastingService';
import UserService from './UserService';

// Hot reloads re-run this module; reusing the client stops each one leaking a connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Every server service, wired once. Routes and server pages take what they need with `getClass`. */
const ServerServices = new ServiceContainer()
	.withFactory(PrismaClient, () => {
		const prisma = globalForPrisma.prisma ?? new PrismaClient();
		if (!ServerConfig.isProduction()) {
			globalForPrisma.prisma = prisma;
		}
		return prisma;
	})
	.withFactory(Resend, () => new Resend(ServerConfig.getResendApiKey()))
	.withFactory(PhotoStorageService, () =>
		ServerConfig.getStorageDriver() === 'r2'
			? new R2PhotoStorageService(ServerConfig.getR2Config())
			: new LocalPhotoStorageService(ServerConfig.getUploadDir()),
	)
	.withClassConstructorCallback(SessionService, (c) => [c.getClass(PrismaClient)])
	.withClassConstructorCallback(RateLimitService, (c) => [c.getClass(PrismaClient)])
	.withClassConstructorCallback(PhotoService, (c) => [() => c.getClass(PhotoStorageService)])
	.withClassConstructorCallback(AuthService, (c) => [
		c.getClass(PrismaClient),
		c.getClass(RateLimitService),
		() => c.getClass(Resend),
	])
	.withClassConstructorCallback(UserService, (c) => [
		c.getClass(PrismaClient),
		c.getClass(RateLimitService),
		c.getClass(PhotoService),
	])
	.withClassConstructorCallback(FlightService, (c) => [c.getClass(PrismaClient), c.getClass(RateLimitService)])
	.withClassConstructorCallback(TastingService, (c) => [
		c.getClass(PrismaClient),
		c.getClass(FlightService),
		c.getClass(PhotoService),
	])
	.withClassConstructorCallback(ProgressService, (c) => [c.getClass(PrismaClient)])
	.withClassConstructorCallback(ExportService, (c) => [
		c.getClass(PrismaClient),
		c.getClass(RateLimitService),
		c.getClass(PhotoService),
	]);

export default ServerServices;
