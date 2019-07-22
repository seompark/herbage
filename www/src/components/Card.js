import { format } from 'date-fns'
import { useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'

function Card ({ post }) {
  const [showMore, setShowMore] = useState(false)
  const isLong = post.content.length > 250 || post.content.split('\n').length > 3

  return (
    <div className='card'>
      <h3>
        <a href={post.fbLink} target='_blank'>{post.number}번째 제보</a>
        <span className='check-fb'><FiArrowLeft style={{ verticalAlign: 'middle' }} /> 페이스북에서 확인</span>
      </h3>
      <span>{ format(post.date, 'YYYY년 MM월 DD일 HH시 mm분') }</span>
      { post.title && <h4>{post.title}</h4> }
      {
        ((isLong && !showMore)
          ? post.content
            .split('').slice(0, 250).join('').trim()
            .split('\n').slice(0, 4).join('\n').replace(/^\s+|\s+$/g, '')
            .concat('...')
          : post.content
        ).split('\n').map((v, i, array) =>
          (array.length - 1) === i && isLong && !showMore
            ? (<p key={i}>
              {v}
              <a
                style={{
                  color: 'green',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onClick={() => setShowMore(true)}>더보기</a>
            </p>)
            : (<p key={i}>{v}</p>)
        )
      }
      <style jsx>{`
        .card {
          margin-bottom: 2.5rem;
        }

        h3 {
          display: flex;
          align-items: center;
        }

        .check-fb {
          opacity: 0;
          color: #41adff;
          font-family: 'Spoqa Han Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          margin-left: 1rem;
          transition: 0.25s opacity;
        }

        h3:hover .check-fb {
          opacity: 1;
        }

        h4 {
          font-size: 18px;
          font-weight: 600;
        }

        p {
          font-size: 18px;
          line-height: 1.825;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  )
}

export default Card
