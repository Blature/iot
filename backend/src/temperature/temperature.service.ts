import { Injectable } from '@nestjs/common';

export interface Reading {
  value: number;
  timestamp: string;
}

@Injectable()
export class TemperatureService {
  private readings: Record<string, Reading> = {};

  clearReadings() {
    this.readings = {};
    console.log('Cleared readings');
    console.log(this.readings);
  }

  saveReading(deviceId: string, data: Reading) {
    this.readings[deviceId] = data;
  }

  getAllReadings() {
    return this.readings;
  }

  getReadingByDeviceId(deviceId: string) {
    return this.readings[deviceId];
  }
}
