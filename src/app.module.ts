import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { RoleModule } from './role/role.module';
import { ProductModule } from './product/product.module';
import { DeliveryController } from './delivery/delivery.controller';
import { DeliveryService } from './delivery/delivery.service';
import { DeliveryModule } from './delivery/delivery.module';
import { ShopService } from './shop/shop.service';
import { ShopModule } from './shop/shop.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrderService } from './order/order.service';
import { OrderModule } from './order/order.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, RoleModule, ProductModule, DeliveryModule, ShopModule, InventoryModule, OrderModule, TransactionModule],
  controllers: [AppController, DeliveryController],
  providers: [AppService, PrismaService, UserService, AuthService, JwtService, DeliveryService, ShopService, OrderService],
})
export class AppModule {}
