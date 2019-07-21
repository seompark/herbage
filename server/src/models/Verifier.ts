import { Schema } from 'mongoose';
import { instanceMethod, InstanceType, prop, Typegoose } from 'typegoose';

class Verifier extends Typegoose {
  _id: Schema.Types.ObjectId

  @prop({ required: true })
  question: string

  @prop({ required: true })
  answer: string

  @prop()
  get id() {
    return Base64.encode(this._id.toString())
  }

  @instanceMethod
  isCorrect(this: InstanceType<Verifier>, target: string) {
    return this.answer === target
  }
}

export default new Verifier().getModelForClass(Verifier)
