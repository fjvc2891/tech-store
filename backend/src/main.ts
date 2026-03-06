import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProductSeeder } from './modules/products/infrastructure/product.seeder';
import { CustomerSeeder } from './modules/customers/infrastructure/customer.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors();

  // Base path /api
  app.setGlobalPrefix('api');

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Wompi Checkout API')
    .setDescription('Fullstack test for payment processing')
    .setVersion('1.0')
    .addTag('products')
    .addTag('customers')
    .addTag('transactions')
    .addTag('deliveries')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Run Seeders
  const productSeeders = app.get(ProductSeeder);
  await productSeeders.seed();

  const customerSeeders = app.get(CustomerSeeder);
  await customerSeeders.seed();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}/api/docs`);
}
bootstrap();
