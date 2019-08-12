import { useState } from 'react'
import { toast } from 'react-toastify'
import { FiLoader } from 'react-icons/fi'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from 'styled-jsx/css'
import Basemodal from './Basemodal'

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

function DeleteModal({ content, modalHandler, onSubmit }) {
  const [hash, setHash] = useState('')
  const [isLoading, setLoading] = useState(false)

  const reset = () => setHash('')
  const handleSubmit = async e => {
    e.preventDefault()

    if (hash.length === 0) {
      toast.error('내용을 입력해주세요.')
      return
    }

    setLoading(true)
    await onSubmit(hash, reset)
    setLoading(false)
  }

  return (
    <Basemodal modalName="delete" content={content} modalHandler={modalHandler}>
      <form onSubmit={handleSubmit}>
        <div className="info">제보 삭제 이후 복구는 불가합니다.</div>
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
        <button type="submit">
          {!isLoading ? (
            '삭제'
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

          .info {
            margin-bottom: 10px;
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
    </Basemodal>
  )
}

DeleteModal.propTypes = {
  content: PropTypes.object,
  modalHandler: PropTypes.func,
  onSubmit: PropTypes.func
}

export default DeleteModal
