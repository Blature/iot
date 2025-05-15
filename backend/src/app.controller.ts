import { Body, Controller, Get, Post } from '@nestjs/common';
import { MqttService } from './mqtt/mqtt.service';

@Controller()
export class AppController {
  constructor(private readonly mqttService: MqttService) { }

  @Get('health')
  getHealth() {
    return {
      mqttConnected: this.mqttService.isConnected(),
    };
  }

  @Post('simulate')
  simulate(@Body() body: { deviceId?: string; value?: number }) {
    console.log(body)
    this.mqttService.publishMock(body.deviceId, body.value);
    return { status: 'ok' };
  }
}
