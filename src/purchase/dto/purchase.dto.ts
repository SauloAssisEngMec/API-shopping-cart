import { IsArray, IsInt, IsString } from 'class-validator';
import { PurchaseItemType } from '../types/purchase-item.type';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseDto {
  @IsString()
  @ApiProperty()
  @ApiProperty()
  userId: string;

  @IsArray()
  @ApiProperty()
  @ApiProperty({})
  items: PurchaseItemType[];

  @IsInt()
  @ApiProperty()
  total: number;

  createdAt?: Date;
}
