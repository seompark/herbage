import PropTypes from 'prop-types'

function StatusChip({ status }) {
  return <div>{status}</div>
}

StatusChip.propTypes = {
  status: PropTypes.string.required
}

export default StatusChip
