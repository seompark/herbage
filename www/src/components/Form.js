import { useState, useEffect } from 'react'
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

function Form ({ onSubmit, verifier }) {
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
    await onSubmit({
      content,
      title,
      verifier,
      answer,
      tag
    }, reset)
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
      <label htmlFor='title-input'>제목 (선택)</label>
      <input
        id='title-input'
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyPress={preventSubmitOnEnter}
        style={{ width: '25%', minWidth: 250 }}
        type='text'
        placeholder='제목 (선택)'
      />
      <label htmlFor='cert-input'>학생 인증</label>
      <input
        id='cert-input'
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyPress={preventSubmitOnEnter}
        style={{ width: '40%', minWidth: 250 }}
        type='text'
        placeholder={verifier.question}
        required
      />
      <label htmlFor='tag-select'>태그 선택</label>
      <select
        id='tag-select'
        value={tag}
        onChange={e => setTag(e.target.value)}
        options={tags}
        required
      >
        <option value='' disabled hidden>태그 선택</option>
        { tags.map((v, i) => <option value={v} key={i}>{v}</option>) }
      </select>
      <label htmlFor='content-textarea'>내용</label>
      <TextArea
        id='content-textarea'
        value={content}
        onUpdate={setContent}
        placeholder='타인을 향한 욕설 및 비방은 징계 대상입니다. (최대 3000자)'
        required
      />
      <button type='submit'>
        { !isLoading ? (
          submitChecked ? '한번 더 클릭하세요' : '제보하기'
        ) : <FiLoader className={classNames('spin', spinAnimation.className)} /> }
      </button>
      {spinAnimation.styles}
      <style jsx>{`
        * {
          font-family: 'Spoqa Han Sans', sans-serif;
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
  )
}

export default Form
