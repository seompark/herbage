
import { Type, Transform, Expose } from 'class-transformer'
import { IsInt, IsBase64, IsOptional, IsString, ValidateNested, MinLength, Length } from 'class-validator'

export class RequestQuery {
  @Expose()
  @Transform(value => parseInt(value, 10))
  @IsInt()
  count: number

  @Expose()
  @IsOptional()
  @IsBase64()
  cursor?: string
}

export class RequestVerifySchema {
  @Expose()
  @IsBase64()
  id: string

  @Expose()
  @IsString()
  answer: string
}

export class NewPost {
  @Expose()
  @IsString()
  @IsOptional()
  title?: string

  @Expose()
  @IsString()
  @Length(1, 3000)
  content: string

  @Expose()
  @IsString()
  @MinLength(1)
  tag: string

  @Expose()
  @Type(() => RequestVerifySchema)
  @ValidateNested()
  verifier: RequestVerifySchema
}

export class EditPost {
  @Expose()
  @IsString()
  @IsOptional()
  content?: string

  @Expose()
  @IsString()
  @IsOptional()
  status?: string

  @Expose()
  @IsString()
  @IsOptional()
  fbLink?: string
}
