import { Schema } from 'mongoose'
import { instanceMethod, InstanceType, prop, Typegoose } from 'typegoose'

class Verifier extends Typegoose {
  public _id: Schema.Types.ObjectId

  @prop({ required: true })
  public question: string

  @prop({ required: true })
  public answer: string

  @prop()
  public get id(): string {
    return Base64.encode(this._id.toString())
  }

  @instanceMethod
  public isCorrect(this: InstanceType<Verifier>, target: string): boolean {
    return this.answer === target
  }
}

export default new Verifier().getModelForClass(Verifier)
