import { Type, Transform, Expose } from 'class-transformer'
import {
  IsInt,
  IsBase64,
  IsOptional,
  IsString,
  ValidateNested,
  MinLength,
  Length
} from 'class-validator'

export class RequestQuery {
  @Expose()
  @Transform((value): number => parseInt(value, 10))
  @IsInt()
  public count: number

  @Expose()
  @IsString()
  public status: string

  @Expose()
  @IsOptional()
  @IsBase64()
  public cursor?: string
}

export class RequestVerifySchema {
  @Expose()
  @IsBase64()
  public id: string

  @Expose()
  @IsString()
  public answer: string
}

export class NewPost {
  @Expose()
  @IsString()
  @IsOptional()
  public title?: string

  @Expose()
  @IsString()
  @Length(1, 3000)
  public content: string

  @Expose()
  @IsString()
  @MinLength(1)
  public tag: string

  @Expose()
  @Type((): typeof RequestVerifySchema => RequestVerifySchema)
  @ValidateNested()
  public verifier: RequestVerifySchema
}

export class EditPost {
  @Expose()
  @IsString()
  @IsOptional()
  public content?: string

  @Expose()
  @IsString()
  @IsOptional()
  public status?: string

  @Expose()
  @IsString()
  @IsOptional()
  public fbLink?: string

  @Expose()
  @IsString()
  @IsOptional()
  public reason: string
}
