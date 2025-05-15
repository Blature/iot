import { Injectable } from '@nestjs/common';

export interface Reading {
  value: number;
  timestamp: string;
}

@Injectable()
export class TemperatureService {
  private readings: Record<string, Reading> = {};

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
