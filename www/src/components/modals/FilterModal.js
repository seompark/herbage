import { useState } from 'react'
import PropTypes from 'prop-types'
import AdminModal from './AdminModal'

function FilterModal({ post, modalHandler, onSubmit }) {
  const [pending, setPending] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const [rejected, setRejected] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()

    const filter = [pending, accepted, rejected]

    onSubmit({
      filter
    })
  }
  return (
    <AdminModal modalName="filter" post={post} modalHandler={modalHandler}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="pending-checkbox">대기</label>
        <input
          id="pending-checkbox"
          type="checkbox"
          name="filter"
          checked={pending}
          onChange={e => setPending(e.value)}
        />
        <label htmlFor="accepted-checkbox">승인</label>
        <input
          id="accepted-checkbox"
          type="checkbox"
          name="filter"
          checked={accepted}
          onChange={e => setAccepted(e.value)}
        />
        <label htmlFor="rejected-checkbox">거부</label>
        <input
          id="rejected-checkbox"
          type="checkbox"
          name="filter"
          checked={rejected}
          onChange={e => setRejected(e.value)}
        />
        <br />
        <button type="submit">필터</button>
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
            margin-right: 10px;
          }

          button {
            margin-top: 10px;
          }
        `}</style>
      </form>
    </AdminModal>
  )
}

FilterModal.propTypes = {
  post: PropTypes.object,
  modalHandler: PropTypes.func,
  onSubmit: PropTypes.func
}

export default FilterModal
