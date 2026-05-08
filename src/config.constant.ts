import { ConfigService } from '@nestjs/config';

export const APP_NAME = {
  provide: 'APP_NAME',
  useFactory: (configService: ConfigService) => configService.get('APP_NAME'),
  inject: [ConfigService],
};
