import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { TemperatureService } from '../temperature/temperature.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class MqttService implements OnModuleInit {
    private readonly logger = new Logger(MqttService.name);
    private client: MqttClient;

    constructor(
        private readonly temperatureService: TemperatureService,
        private readonly wsGateway: WebsocketGateway,
    ) { }

    onModuleInit() {
        this.logger.log('Initializing MQTT service');
        this.connectToBroker();
    }

    connectToBroker() {
        this.logger.log('Connecting to MQTT broker ...');
        this.client = connect('mqtt://broker.hivemq.com:1883', { //mqtt://127.0.0.1:1883
            connectTimeout: 4000,
            reconnectPeriod: 1000,
            clean: true,
            clientId: 'nestjs_mqtt_client_' + Math.random().toString(16).substr(2, 8),
        });

        this.client.on('connect', () => {
            this.logger.log('Connected to MQTT broker');
            this.client.subscribe('sensors/temperature');
        });

        this.client.on('error', (err) => {
            this.logger.error('MQTT connection error:', err);
        })

        this.client.on('close', () => {
            this.logger.log('Disconnected from MQTT broker');
        });

        this.client.on('message', (topic, payload) => {
            if (topic === 'sensors/temperature') {
                try {
                    const message = JSON.parse(payload.toString());
                    const { deviceId, value, timestamp } = message;


                    if (!deviceId || typeof deviceId !== 'string') {
                        this.logger.warn('MQTT message ignored: missing or invalid deviceId');
                        return;
                    }

                    this.logger.log(`Received MQTT: ${JSON.stringify(message)}`);

                    this.temperatureService.saveReading(deviceId, {
                        value,
                        timestamp,
                    });

                    this.wsGateway.broadcastUpdate({ deviceId, value, timestamp });
                } catch (err) {
                    this.logger.error('Invalid MQTT message', err);
                }
            }
        });

        this.client.on('error', (err) => {
            this.logger.error('MQTT error:', err);
        });
    }

    isConnected(): boolean {
        return this.client?.connected || false;
    }

    publishMock(deviceId?: string, value?: number) {
        const id = deviceId || 'dev123';
        const val = value ?? 20 + Math.random() * 10;

        const payload = JSON.stringify({
            deviceId: id,
            value: parseFloat(val.toFixed(2)),
            timestamp: new Date().toISOString(),
        });

        this.client.publish('sensors/temperature', payload);
    }
}
