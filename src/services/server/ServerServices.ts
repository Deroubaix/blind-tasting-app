import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { prisma } from '../../lib/prisma';
import ServiceContainer from '../../utils/ServiceContainer';
import AuthService from './AuthService';
import ExportService from './ExportService';
import FlightService from './FlightService';
import PhotoService from './PhotoService';
import ProgressService from './ProgressService';
import TastingService from './TastingService';
import UserService from './UserService';

/** Every server service, wired once. Routes and server pages take what they need with `getClass`. */
const ServerServices = new ServiceContainer()
	.withFactory(PrismaClient, () => prisma)
	.withFactory(Resend, () => new Resend(process.env.RESEND_API_KEY))
	.withClass(PhotoService)
	.withClassConstructorCallback(AuthService, (c) => [c.getClass(PrismaClient), () => c.getClass(Resend)])
	.withClassConstructorCallback(UserService, (c) => [c.getClass(PrismaClient), c.getClass(PhotoService)])
	.withClassConstructorCallback(FlightService, (c) => [c.getClass(PrismaClient)])
	.withClassConstructorCallback(TastingService, (c) => [
		c.getClass(PrismaClient),
		c.getClass(FlightService),
		c.getClass(PhotoService),
	])
	.withClassConstructorCallback(ProgressService, (c) => [c.getClass(PrismaClient)])
	.withClassConstructorCallback(ExportService, (c) => [c.getClass(PrismaClient)]);

export default ServerServices;
