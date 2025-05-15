import { Controller, Get, Param } from '@nestjs/common';
import { TemperatureService } from './temperature.service';

@Controller('temperature')
export class TemperatureController {
  constructor(private readonly temperatureService: TemperatureService) {}

  @Get()
  getAll() {
    return this.temperatureService.getAllReadings();
  }

  @Get(':deviceId')
  getOne(@Param('deviceId') deviceId: string) {
    return this.temperatureService.getReadingByDeviceId(deviceId);
  }
}
