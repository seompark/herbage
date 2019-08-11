import {
  Typegoose,
  InstanceType,
  prop,
  instanceMethod,
  staticMethod,
  ModelType,
  arrayProp
} from 'typegoose'
import { Base64 } from 'js-base64'
import { Schema } from 'mongoose'

export enum PostStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED'
}

export interface PostPublicFields {
  id: string
  number?: number
  title?: string
  content: string
  fbLink?: string
  createdAt: number
  status: string
}

export class PostHistory {
  @prop({ required: true, trim: true })
  public content: string

  @prop({ required: true })
  public createdAt: Date
}

class Post extends Typegoose {
  // for type analysis
  public _id: Schema.Types.ObjectId
  public createdAt: Date

  @prop()
  public number?: number

  @prop({ trim: true })
  public title?: string

  @prop({ required: true, trim: true })
  public content: string

  @prop({ enum: PostStatus, default: PostStatus.Pending })
  public status: PostStatus

  @prop({ trim: true })
  public reason: string

  @arrayProp({ items: PostHistory, default: [] })
  public history: PostHistory[]

  @prop()
  public fbLink?: string

  @prop()
  public get cursorId(): string {
    return Base64.encode(this._id.toString())
  }

  @prop()
  public get id(): Schema.Types.ObjectId {
    return this._id
  }

  @instanceMethod
  public async edit(
    this: InstanceType<Post>,
    newContent: string
  ): Promise<InstanceType<Post>> {
    this.history.push({ content: this.content, createdAt: new Date() })
    this.content = newContent

    return this.save()
  }

  @instanceMethod
  public async setRejected(
    this: InstanceType<Post>,
    reason: string
  ): Promise<InstanceType<Post>> {
    this.status = PostStatus.Rejected
    this.reason = reason
    return this.save()
  }

  @instanceMethod
  public async setAccepted(
    this: InstanceType<Post>,
    fbLink: string
  ): Promise<InstanceType<Post>> {
    this.status = PostStatus.Accepted
    this.fbLink = fbLink
    this.number =
      ((await PostModel.find()
        .sort({ number: -1 })
        .limit(1)
        .exec())[0].number || 0) + 1
    return this.save()
  }

  @instanceMethod
  public getPublicFields(this: InstanceType<Post>): PostPublicFields {
    return {
      id: this.id,
      number: this.number,
      title: this.title,
      content: this.content,
      fbLink: this.fbLink,
      createdAt: this.createdAt.getTime(),
      status: this.status
    }
  }

  @staticMethod
  public static async getList(
    this: ModelType<Post> & typeof Post,
    count: number = 10,
    cursor: string = '',
    options: {
      admin: boolean
      condition?: Record<string, unknown>
    } = { admin: false }
  ): Promise<Array<InstanceType<Post>>> {
    // 관리자는 오래된 글부터, 일반 사용자는 최신 글부터
    const condition = {
      // 다음 글의 _id: 관리자는 더 크고(커서보다 최신 글),
      // 일반 사용자는 더 작음(커서보다 오래된 글).
      _id: {
        [options.admin ? '$gt' : '$lt']: Base64.decode(cursor)
      },
      status: PostStatus.Accepted
    }

    if (!cursor) {
      delete condition._id
    }

    // 관리자는 모든 글을 가져옴
    if (options.admin) {
      delete condition.status
    }

    const posts = await this.find({
      ...condition,
      // ...options.condition
    })
      .sort({ _id: options.admin ? 1 : -1 })
      .limit(count)
      .exec()
    return posts
  }
}

const PostModel = new Post().getModelForClass(Post, {
  schemaOptions: {
    timestamps: true,
    collection: 'posts',
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true,
      transform: (doc, ret): unknown => {
        ret.createdAt = doc.createdAt.getTime()
        return ret
      }
    }
  }
})

export default PostModel
