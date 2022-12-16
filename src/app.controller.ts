import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './models/user/user.service';

@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  index() {
    return this.appService.getAuthorInfo();
  }
}
