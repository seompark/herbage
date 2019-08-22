import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiLoader } from 'react-icons/fi'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from 'styled-jsx/css'
import BaseModal from './BaseModal'
import Card from '../Card'
import StatusChip from '../StatusChip'

const spinAnimation = css.resolve`
  .spin {
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`

function ManageModal({ content, modalHandler, onSubmit }) {
  const [hash, setHash] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [post, setPost] = useState(null)

  const reset = () => {
    setHash('')
    setPost(null)
  }
  const handleSubmit = async e => {
    e.preventDefault()

    if (hash.length === 0) {
      toast.error('해시값을 입력해주세요.')
      return
    }

    setLoading(true)
    const p = await onSubmit(hash, post, reset)
    if (p) setPost(p)

    setLoading(false)
  }

  useEffect(() => {
    if (!content) reset()
  }, [content])

  return (
    <BaseModal modalName="delete" content={content} modalHandler={modalHandler}>
      <form onSubmit={handleSubmit}>
        {!post && (
          <>
            <div className="info">
              제출한 제보의 상태 또는 반려 사유를 확인하거나 제보를 삭제할 수
              있습니다.
            </div>
            <label htmlFor="link-input">해시값</label>
            <input
              id="link-input"
              value={hash}
              onChange={e => setHash(e.target.value)}
              style={{ width: '80%', minWidth: 250 }}
              type="text"
              placeholder="제보 시 표시된 해시값을 입력하세요"
              required
            />
          </>
        )}
        {post && (
          <>
            <div className="info info--warn">
              {post.reason
                ? '거부처리 된 경우 삭제 요청이 불가능합니다.'
                : '제보 삭제 요청 후 관리자가 요청을 확인하면 제보가 삭제됩니다.'}
            </div>
            <Card post={post} isManage />
            <StatusChip status={post.status} />
            {post.status === 'REJECTED' && (
              <span>{`거부 사유: ${post.reason}`}</span>
            )}
          </>
        )}
        {!(post && post.reason) && (
          <button type="submit">
            {!isLoading ? (
              post ? (
                '삭제'
              ) : (
                '확인'
              )
            ) : (
              <FiLoader
                className={classNames('spin', spinAnimation.className)}
              />
            )}
          </button>
        )}
        <style jsx>{`
          * {
            font-family: 'Spoqa Han Sans', sans-serif;
          }

          .error {
            text-align: center;
            font-size: 14px;
          }

          .info {
            margin-bottom: 1rem;
          }

          .info--warn {
            color: #f44336;
          }

          input {
            display: inline-block !important;
          }

          label {
            display: none;
          }

          select {
            display: inline-block;
            text-align: center;
          }
        `}</style>
      </form>
    </BaseModal>
  )
}

ManageModal.propTypes = {
  content: PropTypes.object,
  modalHandler: PropTypes.func,
  onSubmit: PropTypes.func
}

export default ManageModal
