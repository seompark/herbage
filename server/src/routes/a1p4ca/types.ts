import { IsString } from 'class-validator'

export class RequestToken {
  @IsString()
  public password: string
}
