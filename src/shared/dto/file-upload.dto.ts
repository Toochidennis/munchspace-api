import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class Base64FileDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @Matches(/^image\/(png|jpg|jpeg|webp)$/)
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  base64Data: string;
}
