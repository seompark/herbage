import { useState } from 'react'
import PropTypes from 'prop-types'
import format from 'date-fns/format'
import { FiArrowLeft } from 'react-icons/fi'
import timeText from '../utils/timeText'

function Card({ post, isManage = false }) {
  const [showMore, setShowMore] = useState(false)
  const isLong =
    post.content.length > 250 || post.content.split('\n').length > 3

  return (
    <div className="card">
      <h3>
        <a href={post.fbLink} target="_blank">
          {post.number || '?'}번째 코드
        </a>
        <span className="check-fb">
          <FiArrowLeft style={{ verticalAlign: 'middle' }} /> 페이스북에서 확인
        </span>
      </h3>
      <span>
        {format(post.createdAt, 'YYYY년 MM월 DD일') +
          ` ${timeText(post.createdAt)}`}
      </span>
      {post.title && <h4>{post.title}</h4>}
      {(isLong && !showMore
        ? post.content
            .split('')
            .slice(0, 250)
            .join('')
            .trim()
            .split('\n')
            .slice(0, 3)
            .join('\n')
            .replace(/^\s+|\s+$/g, '')
            .concat('...')
        : post.content
      )
        .split('\n')
        .map((v, i, array) =>
          array.length - 1 === i && isLong && !showMore ? (
            <p key={i}>
              {v}
              <a
                style={{
                  color: '#4caf50',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontFamily: 'Spoqa Han Sans, sans-serif'
                }}
                onClick={() => setShowMore(true)}
              >
                더보기
              </a>
            </p>
          ) : (
            <p key={i}>{v}</p>
          )
        )}
      {post.tag && <div className="tag">{post.tag}</div>}
      <style jsx>{`
        .card {
          margin-top: 1rem;
          margin-bottom: 1rem;
          padding: ${isManage ? '1rem' : '2rem'};
          border-radius: 7.5px;
          border: ${isManage ? '1px solid' : 'none'};
        }

        .card * {
          font-family: 'Iropke Batang', serif;
        }

        .tag {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 7.5px;
          font-size: 14px;
        }

        h3 {
          display: flex;
          align-items: center;
        }

        .check-fb {
          opacity: 0;
          color: #41adff;
          font-family: 'Spoqa Han Sans', sans-serif !important;
          font-size: 14px;
          font-weight: 500;
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

Card.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    number: PropTypes.number,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    fbLink: PropTypes.string,
    createdAt: PropTypes.number
  }),
  isManage: PropTypes.bool
}

export default Card
