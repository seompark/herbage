import { Typegoose, InstanceType, prop, instanceMethod, staticMethod, ModelType, arrayProp } from 'typegoose'
import { Base64 } from 'js-base64'
import { Schema } from 'mongoose';

export enum PostStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
}

export class PostHistory {
  @prop({ required: true })
  content: string

  @prop({ default: Date.now })
  date: Date
}

class Post extends Typegoose {
  // for type analysis
  _id: Schema.Types.ObjectId
  createdAt: Date

  @prop()
  number?: number

  @prop({ trim: true })
  title?: string

  @prop({ required: true, trim: true })
  content: string

  @prop({ enum: PostStatus, default: PostStatus.Pending })
  status: PostStatus

  @arrayProp({ items: PostHistory, default: [] })
  history: PostHistory[]

  @prop()
  fbLink?: string

  @prop()
  get cursorId() {
    return Base64.encode(this._id.toString())
  }

  @prop()
  get id() {
    return this._id
  }

  @instanceMethod
  async edit(this: InstanceType<Post>, newContent: string) {
    this.history.push({ content: this.content, date: new Date() })
    this.content = newContent

    return this.save()
  }

  @instanceMethod
  async setDeclined(this: InstanceType<Post>) {
    this.status = PostStatus.Declined
    return this.save()
  }

  @instanceMethod
  async setAccepted(this: InstanceType<Post>, fbLink: string) {
    this.status = PostStatus.Accepted
    this.fbLink = fbLink
    this.number = ((await PostModel.find().sort({ number: -1 }).limit(1).exec())[0].number || 0) + 1
    return this.save()
  }

  @instanceMethod
  getPublicFields(this: InstanceType<Post>) {
    return {
      id: this.id,
      number: this.number,
      title: this.title,
      content: this.content,
      fbLink: this.fbLink,
      date: this.createdAt.getTime()
    }
  }

  @staticMethod
  static async getList(
    this: ModelType<Post> & typeof Post,
    count: number = 10,
    cursor: string = '',
    options: { admin: boolean } = { admin: false }
  ) {
    // 관리자는 오래된 글부터, 일반 사용자는 최신 글부터
    const query = {
      // 다음 글의 _id: 관리자는 더 크고(커서보다 최신 글),
      _id: {
        [options.admin ? '$gt' : '$lt']: cursor,
      },
      // 일반 사용자는 더 작음(커서보다 오래된 글).
      // 관리자가 아니면 Accepted 글만 가져옴
      status: !options.admin && PostStatus.Accepted
    }

    if (!cursor) {
      delete query._id
    }

    const posts = await this.find(query).sort({ _id: options.admin ? 1 : -1 }).limit(count).exec()
    return posts
  }
}

const PostModel = new Post().getModelForClass(Post, {
  schemaOptions: { timestamps: true }
})

export default PostModel
