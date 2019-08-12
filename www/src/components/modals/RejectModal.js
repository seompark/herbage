import { useState } from 'react'
import { toast } from 'react-toastify'
import { FiLoader } from 'react-icons/fi'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from 'styled-jsx/css'
import BaseModal from './BaseModal'

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

function RejectModal({ post, modalHandler, onSubmit }) {
  const [reason, setReason] = useState('')
  const [isLoading, setLoading] = useState(false)

  const reset = () => setReason('')
  const id = post ? post.id : -1
  const handleSubmit = async e => {
    e.preventDefault()

    if (reason.length === 0) {
      toast.error('내용을 입력해주세요.')
      return
    }

    setLoading(true)
    await onSubmit(
      {
        id,
        reason
      },
      reset
    )
    setLoading(false)
  }
  return (
    <BaseModal modalName="reject" content={post} modalHandler={modalHandler}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="reason-input">사유</label>
        <input
          id="reason-input"
          value={reason}
          onChange={e => setReason(e.target.value)}
          style={{ width: '80%', minWidth: 250 }}
          type="text"
          placeholder="거부 사유를 입력하세요"
          required
        />
        <button type="submit">
          {!isLoading ? (
            '거부'
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
            text-align-center: center;
          }
        `}</style>
      </form>
    </BaseModal>
  )
}

RejectModal.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    number: PropTypes.number,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    fbLink: PropTypes.string,
    createdAt: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    reason: PropTypes.string,
    history: PropTypes.array.isRequired
  }),
  modalHandler: PropTypes.func,
  onSubmit: PropTypes.func
}

export default RejectModal
