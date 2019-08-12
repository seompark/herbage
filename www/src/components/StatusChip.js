import PropTypes from 'prop-types'
import { ACCEPTED, REJECTED, PENDING, DELETED } from '../utils/post-status'

function StatusChip({ status }) {
  const statusFactory = (text, bgColor, color) => ({
    text,
    bgColor,
    color
  })
  const statusData = (() => {
    switch (status) {
      case ACCEPTED:
        return statusFactory('승인', '#4CAF50', '#fff')
      case REJECTED:
        return statusFactory('거부', '#F44336', '#fff')
      case PENDING:
        return statusFactory('대기', '#FFAB40', '#fff')
      case DELETED:
        return statusFactory('삭제', '#F44336', '#fff')
    }
  })()

  return (
    <div className="status">
      {statusData.text}
      <style jsx>{`
        .status {
          font-family: 'Spoqa Han Sans', sans-serif;
          font-size: 18px;
          display: inline-block;
          color: ${statusData.color};
          background-color: ${statusData.bgColor};
          margin-right: 0.5rem;
          padding: 0.25rem 1rem;
          border-radius: 20px;
        }
      `}</style>
    </div>
  )
}

StatusChip.propTypes = {
  status: PropTypes.string.isRequired
}

export default StatusChip
