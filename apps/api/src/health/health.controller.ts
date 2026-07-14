import { Controller, Get } from '@nestjs/common';
import { HEALTH_OK, type HealthStatus } from '@skelly/domain-contracts';

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthStatus {
    return {
      status: HEALTH_OK,
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }
}
