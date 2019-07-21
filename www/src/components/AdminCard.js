import Card from './Card'
import StatusChip from './StatusChip'

function AdminCard ({ status, contents }) {
  return (
    <div>
      { status && <StatusChip status={status} />}
      <Card contents={contents} />
      <button>승인</button>
      <button>거부</button>
      <button>수정</button>
      <button>삭제</button>
      <button>복사</button>
    </div>
  )
}

export default AdminCard
