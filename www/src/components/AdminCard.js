import { useState } from 'react'
import PropTypes from 'prop-types'
import Card from './Card'
import StatusChip from './StatusChip'
// import { REJECTED, ACCEPTED } from '../utils/post-status'

function AdminCard({ post, modalHandler, deleteHandler }) {
  const [deleteChecked, setDeleteChecked] = useState(false)

  const openAcceptingModal = () => modalHandler('accept', post)
  const openRejectingModal = () => modalHandler('reject', post)
  const openModifyingModal = () => modalHandler('modify', post)
  const handleDelete = async () => {
    if (!deleteChecked) {
      await setDeleteChecked(true)
      setTimeout(() => {
        setDeleteChecked(false)
      }, 3000)
      return
    }
    deleteHandler(post)
  }

  return (
    <div className="card">
      <Card
        post={{
          id: post.id,
          number: post.number,
          title: post.title,
          content: post.content,
          fbLink: post.fbLink,
          createdAt: post.createdAt,
          hash: post.hash,
          tag: post.tag
        }}
      />
      <div className="card--admin">
        <div className="hash">{post.hash}</div>
        {post.status && <StatusChip status={post.status} />}
        <button onClick={openAcceptingModal}>승인</button>
        <button onClick={openRejectingModal}>거부</button>
        <button onClick={openModifyingModal}>수정</button>
        <button onClick={() => handleDelete()}>
          {deleteChecked ? '한번 더 클릭하세요' : '삭제'}
        </button>
      </div>
      <style jsx>{`
        button {
          font-family: 'Spoqa Han Sans', sans-serif;
        }
        .card {
          border-radius: 7.5px;
        }
        .card--admin {
          padding-left: 2rem;
          padding-right: 2rem;
          padding-bottom: 2rem;
        }
        .hash {
          margin-bottom: 10px;
          word-break: break-word;
        }
      `}</style>
    </div>
  )
}

AdminCard.propTypes = {
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
    history: PropTypes.array.isRequired,
    hash: PropTypes.string,
    tag: PropTypes.string
  }),
  modalHandler: PropTypes.func,
  deleteHandler: PropTypes.func
}

export default AdminCard
