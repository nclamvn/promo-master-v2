import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // API Prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Promo Master V3 API')
    .setDescription(`
      Trade Promotion Management System API
      
      ## Overview
      - 257 endpoints across 37 modules
      - JWT Authentication
      - Role-based access control
      
      ## Modules
      - **Core**: Auth, Budgets, Promotions, Claims, Customers, Products
      - **V3 Features**: Contracts, AI Suggestions, Live Monitoring
      - **Finance**: Settlements, Payments, Reconciliation
      - **Planning**: Planning, Targets, Execution, Operations
    `)
    .setVersion('3.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication & Authorization')
    .addTag('Users', 'User Management')
    .addTag('Budgets', 'Budget Management')
    .addTag('Promotions', 'Promotion Management')
    .addTag('Claims', 'Claims Processing')
    .addTag('Contracts', 'Volume Contracts (V3)')
    .addTag('Customers', 'Customer Management')
    .addTag('Products', 'Product Catalog')
    .addTag('Analytics', 'Reports & Analytics')
    .addTag('AI', 'AI Suggestions (V3)')
    .addTag('Monitoring', 'Live Monitoring (V3)')
    .addTag('Finance', 'Settlements, Payments, Reconciliation')
    .addTag('Planning', 'Planning & Targets')
    .addTag('Operations', 'Execution & Operations')
    .addTag('Settings', 'System Settings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Start server
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   PROMO MASTER V3 API                         ║
╠═══════════════════════════════════════════════════════════════╣
║  🚀 Server:    http://localhost:${port}                         ║
║  📚 Swagger:   http://localhost:${port}/api/docs                ║
║  🔧 Health:    http://localhost:${port}/api/health              ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
