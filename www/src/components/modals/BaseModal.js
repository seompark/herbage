import PropTypes from 'prop-types'
import { IoIosClose } from 'react-icons/io'

function BaseModal({ content, modalName, modalHandler, children }) {
  const close = () => modalHandler(modalName)

  return (
    <div className={`modal__overlay ${content ? 'opened' : 'closed'}`}>
      <div className="modal">
        <span className="icon-close" onClick={close}>
          <IoIosClose />
        </span>
        {children}
      </div>
      <style jsx>{`
        .opened {
          transition: opacity 0.25s;
          opacity: 1;
        }

        .closed {
          transition: opacity 0.25s;
          opacity: 0;
          pointer-events: none;
        }

        .modal {
          position: relative;
          max-width: 700px;
          box-sizing: border-box;
          padding: 24px;
          margin: 5vh auto;
          border-radius: 6px;
          box-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.5);
        }

        .modal__overlay {
          position: fixed;
          z-index: 999;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          background: rgba(#151313, 0.7);
          overflow-y: auto;
        }

        .icon-close {
          cursor: pointer;
          float: right;
          opacity: 0.7;
          font-size: x-large;
        }
      `}</style>
    </div>
  )
}

BaseModal.propTypes = {
  content: PropTypes.object,
  modalName: PropTypes.string,
  children: PropTypes.element,
  modalHandler: PropTypes.func
}

export default BaseModal
