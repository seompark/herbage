import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiLoader } from 'react-icons/fi'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from 'styled-jsx/css'
import BaseModal from './BaseModal'
import CopyToClipboard from 'react-copy-to-clipboard'
import { getNewNumber } from '../../api/posts'
import format from 'date-fns/format'
import timeText from '../../utils/timeText'

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

function AcceptModal({ post, modalHandler, onSubmit }) {
  const [fbLink, setFbLink] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [isNewNumberFetching, setNewNumberFetching] = useState(false)
  const [newNumber, setNewNumber] = useState(0)
  const [isCopySuccess, setCopySuccess] = useState(false)

  const reset = () => {
    setFbLink('')
    setCopySuccess(false)
  }
  const id = post ? post.id : -1
  const handleSubmit = async e => {
    e.preventDefault()

    if (fbLink.length === 0) {
      toast.error('내용을 입력해주세요.')
      return
    }

    setLoading(true)
    await onSubmit(
      {
        id,
        fbLink
      },
      reset
    )
    setLoading(false)
  }

  const numberTask = async () => {
    setNewNumberFetching(true)
    setNewNumber(await getNewNumber())
    setNewNumberFetching(false)
  }

  useEffect(() => {
    if (post) numberTask()
  }, [post])

  return (
    <BaseModal modalName="accept" content={post} modalHandler={modalHandler}>
      <form onSubmit={handleSubmit}>
        <p>
          <strong>
            * 특별한 이유가 없다면 반드시 시간 순서대로 제보를 처리하세요.
          </strong>
        </p>
        <p>
          1. 아래 버튼을 클릭하고 페이스북 페이지에 게시글로 붙여넣기하여
          업로드하세요.
        </p>
        {post && (
          <>
            <CopyToClipboard
              text={
                `#${newNumber}번째코드\n` +
                format(post.createdAt, 'YYYY년 MM월 DD일') +
                ` ${timeText(post.createdAt)}\n\n` +
                (post.title ? `<${post.title}>\n\n` : '') +
                post.content +
                `\n\n#${(post.tag || '').replace(/\s/g, '')}`
              }
              onCopy={() => setCopySuccess(true)}
            >
              <button type="button" disabled={isNewNumberFetching}>
                클립보드에 복사
              </button>
            </CopyToClipboard>
            {isCopySuccess && (
              <span className="clipboard-text">클립보드에 복사되었습니다.</span>
            )}
          </>
        )}

        <p>2. 게시글의 URL을 아래에 붙여넣기 하세요.</p>
        <label htmlFor="link-input">페이스북 링크</label>
        <input
          id="link-input"
          value={fbLink}
          onChange={e => setFbLink(e.target.value)}
          style={{ width: '80%', minWidth: 250 }}
          type="text"
          placeholder="페이스북 링크를 입력하세요"
          required
        />

        <button type="submit" disabled={isLoading}>
          {!isLoading ? (
            '승인'
          ) : (
            <FiLoader className={classNames('spin', spinAnimation.className)} />
          )}
        </button>

        <style jsx>{`
          * {
            font-family: 'Spoqa Han Sans', sans-serif;
          }

          .error {
            text-align: center;
            font-size: 14px;
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

          .clipboard-text {
            font-size: 14px;
            padding-left: 1rem;
          }
        `}</style>
      </form>
    </BaseModal>
  )
}

AcceptModal.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    number: PropTypes.number,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    tag: PropTypes.string,
    fbLink: PropTypes.string,
    createdAt: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    reason: PropTypes.string,
    history: PropTypes.array.isRequired
  }),
  modalHandler: PropTypes.func,
  onSubmit: PropTypes.func
}

export default AcceptModal
