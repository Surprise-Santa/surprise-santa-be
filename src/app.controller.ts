import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor() {}

  @ApiTags('Home page')
  @Get()
  getHello(): string {
    return 'Welcome to the SecretSanta API';
  }
}
