import { Body, Controller, Post } from '@nestjs/common';
import { TestEmailDto } from './dto/test-email.dto';
import { MailingService } from './mailing/mailing.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Messaging')
@Controller('messaging')
export class MessagingController {
  constructor(private mailingService: MailingService) {}
  @Post()
  async sendTestEmail(@Body() dto: TestEmailDto) {
    return this.mailingService.sendTestEmail(dto.email);
  }
}
