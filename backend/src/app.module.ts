import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { WompiModule } from './shared/wompi/wompi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'checkout_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    ProductsModule,
    CustomersModule,
    TransactionsModule,
    DeliveriesModule,
    WompiModule,
  ],
})
export class AppModule { }
