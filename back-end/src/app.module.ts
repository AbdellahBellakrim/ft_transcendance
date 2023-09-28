import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ChatModule } from './chat/chat.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TwoFactorAuthModule } from './2fa/TwoFactorAuth.module';
import { WebSocketGatewayClass } from './dashboard/WebSocketGatewayClass';

@Module({
  // do not forgot to import prisma module here
  imports: [AuthModule, PrismaModule, ConfigModule.forRoot(), DashboardModule, TwoFactorAuthModule],
  controllers: [],
  providers: [WebSocketGatewayClass],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}