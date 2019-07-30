import { IsString } from 'class-validator'
import { Expose } from 'class-transformer'

export class RequestToken {
  @Expose()
  @IsString()
  public password: string
}
