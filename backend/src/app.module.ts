import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MqttModule } from './mqtt/mqtt.module';
import { TemperatureModule } from './temperature/temperature.module';
import { TemperatureService } from './temperature/temperature.service';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [MqttModule, TemperatureModule, WebsocketModule],
  controllers: [AppController],
  providers: [MqttModule, TemperatureService, WebsocketGateway]
})
export class AppModule { }
