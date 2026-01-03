import "../styles/modal.css";

const Modal = ({ children, onClose, type = "center" }) => {
  return (
    <div className={`modal-backdrop backdrop-${type}`} onClick={onClose}>
      <div
        className={`modal modal-${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
