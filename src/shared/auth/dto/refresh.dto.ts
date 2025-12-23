import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
