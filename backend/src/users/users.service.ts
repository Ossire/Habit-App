import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // add to users.service.ts
  async getProfile(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Only update fields that were actually sent
    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.school) user.school = dto.school;

    await this.usersRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async changePassword(
    id: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Verify current password is correct before allowing change
    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!passwordMatch) {
      throw new BadRequestException('Current password is incorrect.');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully' };
  }
}
