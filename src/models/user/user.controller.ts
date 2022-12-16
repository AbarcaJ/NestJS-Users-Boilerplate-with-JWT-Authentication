import { Controller, Get, Body, Put, Param, Delete, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

// Services
import { UserService } from './user.service';

// Schemas & Interfaces & DTOs
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums';

// Decorators
import { GetUser, Auth } from '../../authentication/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes';
import { PaginationDto } from 'src/common/dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  @Auth()
  profile(@GetUser() user: User) {
    return user;
  }

  @Get()
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Retrieve all users.' })
  @ApiOkResponse({
    description: 'All Users!!',
    type: [User],
  })
  findAll(@Query() pagination: PaginationDto) {
    return this.userService.findAll(pagination);
  }

  @Get(':id')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Retrieve user by id or email.' })
  @ApiOkResponse({
    description: 'User Found!!',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User Not Found!!' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Update user by id.' })
  @ApiOkResponse({
    description: 'User Updated!!',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User Not Found' })
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id.' })
  @ApiOkResponse({ description: 'User Deleted!!' })
  @ApiNotFoundResponse({ description: 'User Not Found' })
  @Auth(Role.ADMIN)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.userService.remove(id);
  }
}
