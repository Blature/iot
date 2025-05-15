import { Module } from '@nestjs/common';
import { TemperatureModule } from 'src/temperature/temperature.module';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { MqttService } from './mqtt.service';

@Module({
  imports: [TemperatureModule, WebsocketModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule { }
