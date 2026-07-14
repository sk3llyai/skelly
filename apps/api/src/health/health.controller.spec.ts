import { Test } from '@nestjs/testing';
import { HEALTH_OK, healthStatusSchema } from '@skelly/domain-contracts';
import { beforeEach, describe, expect, it } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('returns an ok status for the api service', () => {
    const result = controller.check();
    expect(result.status).toBe(HEALTH_OK);
    expect(result.service).toBe('api');
  });

  it('returns a response that conforms to the shared health contract', () => {
    const result = controller.check();
    expect(() => healthStatusSchema.parse(result)).not.toThrow();
  });
});
