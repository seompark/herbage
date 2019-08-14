import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import css from 'styled-jsx/css'
import { FiLoader } from 'react-icons/fi'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import { tags } from '../utils/post-tags'
import TextArea from './TextArea'

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

function Form({ onSubmit, verifier }) {
  const [title, setTitle] = useState('')
  const [answer, setAnswer] = useState('')
  const [content, setContent] = useState('')
  const [tag, setTag] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [submitChecked, setSubmitChecked] = useState(false)

  const reset = () => {
    setTitle('')
    setAnswer('')
    setContent('')
    setTag('')
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (verifier.error) {
      toast.error(verifier.error)
      return
    }

    if (content.length === 0) {
      toast.error('내용을 입력해주세요.')
      return
    }

    if (!submitChecked) {
      setSubmitChecked(true)
      setTimeout(() => setSubmitChecked(false), 2000)
      return
    }

    setLoading(true)
    await onSubmit(
      {
        content,
        title,
        verifier,
        answer,
        tag
      },
      reset
    )
    setLoading(false)
  }

  const preventSubmitOnEnter = e => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    setSubmitChecked(false)
  }, [title, answer, content, tag, isLoading])

  return (
    <form onSubmit={handleSubmit}>
      {verifier.error ? (
        <div className="error">{verifier.error}</div>
      ) : (
        <>
          <div className="flex">
            <label htmlFor="title-input">제목 (선택)</label>
            <input
              id="title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyPress={preventSubmitOnEnter}
              style={{ width: '25%', minWidth: 250 }}
              type="text"
              placeholder="제목 (선택)"
            />
            <label htmlFor="cert-input">학생 인증</label>
            <input
              id="cert-input"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyPress={preventSubmitOnEnter}
              style={{ width: '40%', minWidth: 250 }}
              type="text"
              placeholder={verifier.question}
              required
            />
            <label htmlFor="tag-select">태그 선택</label>
            <select
              id="tag-select"
              value={tag}
              onChange={e => setTag(e.target.value)}
              options={tags}
              required
            >
              <option value="" disabled hidden>
                태그 선택
              </option>
              {tags.map((v, i) => (
                <option value={v} key={i}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <label htmlFor="content-textarea">내용</label>
          <TextArea
            id="content-textarea"
            value={content}
            onUpdate={setContent}
            placeholder="타인을 향한 욕설 및 비방은 징계 대상입니다. (최대 3000자)"
            required
          />
          <button type="submit">
            {!isLoading ? (
              submitChecked ? (
                '한번 더 클릭하세요'
              ) : (
                '제보하기'
              )
            ) : (
              <FiLoader
                className={classNames('spin', spinAnimation.className)}
              />
            )}
          </button>
          <a href="/policy" style={{ marginLeft: '1rem' }}>
            게시 규정 >
          </a>
        </>
      )}
      {spinAnimation.styles}
      <style jsx>{`
        * {
          font-family: 'Spoqa Han Sans', sans-serif;
        }

        form {
          margin-bottom: 1rem;
          padding: 2rem;
          border-radius: 7.5px;
        }

        .error {
          text-align: center;
          font-size: 14px;
        }

        .flex {
          display: flex;
          width: 100%;
        }

        input {
          display: inline-block !important;
          flex: 3;
        }

        select {
          flex: 1;
        }

        @media screen and (max-width: 600px) {
          .flex {
            flex-direction: column;
          }

          input {
            width: auto !important;
            margin-right: 0;
          }

          select {
            max-width: 6rem;
          }
        }

        label {
          display: none;
        }

        select {
          display: inline-block;
          text-align: center;
          margin: 0 0 6px 0;
        }
      `}</style>
    </form>
  )
}

Form.propTypes = {
  onSubmit: PropTypes.func,
  verifier: PropTypes.exact({
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    error: PropTypes.string
  })
}

export default Form
