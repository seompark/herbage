import { useState } from 'react'
import { toast } from 'react-toastify'
import { FiLoader } from 'react-icons/fi'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from 'styled-jsx/css'
import BaseModal from './BaseModal'
import TextArea from '../TextArea'

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

function ModifyModal({ post, modalHandler, onSubmit }) {
  const [content, setContent] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [isModifying, setModifying] = useState(false)

  const reset = () => {
    setContent('')
    setModifying(false)
  }

  const id = post ? post.id : -1
  const handleSubmit = async e => {
    e.preventDefault()

    if (content.length === 0) {
      toast.error('내용을 입력해주세요.')
      return
    }

    setLoading(true)
    await onSubmit({ id, content }, reset)
    setLoading(false)
  }
  const handleClose = name => {
    reset()
    modalHandler(name)
  }
  return (
    <BaseModal modalName="modify" content={post} modalHandler={handleClose}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="content-textarea">내용</label>
        <TextArea
          id="content-textarea"
          value={isModifying ? content : post ? post.content : ''}
          onUpdate={c => {
            setContent(c)
            if (!isModifying) setModifying(true)
          }}
          placeholder="내용을 입력하세요"
          required
        />
        <button type="submit">
          {!isLoading ? (
            '수정'
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

ModifyModal.propTypes = {
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

export default ModifyModal
