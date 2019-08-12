import PropTypes from 'prop-types'

function TextArea({ onUpdate, ...props }) {
  const handleChange = event => {
    onUpdate(event.target.value)
  }

  return (
    <>
      <textarea {...props} onChange={handleChange} />
      <style jsx>{`
        textarea {
          height: 5rem;
          font-size: 16px;
          transition: 0.25s ease-out;
          resize: none;
        }

        textarea::placeholder {
          font-size: 16px;
        }

        textarea:focus {
          height: 15rem;
        }
      `}</style>
    </>
  )
}

TextArea.propTypes = {
  onUpdate: PropTypes.func
}

export default TextArea
