interface PopupConfirmProps {
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  
  const PopupConfirm = ({
    message = "Вы уверены?",
    onConfirm,
    onCancel,
  }: PopupConfirmProps) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm pointer-events-auto">
        <div role="dialog" aria-modal="true" aria-label={message} className="bg-white text-black p-6 rounded shadow-xl min-w-0 w-full max-w-md max-h-full overflow-y-auto break-words text-center space-y-4">
          <p className="text-lg font-medium">{message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="min-h-11 bg-green-500 text-text_light px-4 py-2 rounded hover:bg-green-600"
            >
              Да
            </button>
            <button
              onClick={onCancel}
              className="min-h-11 bg-secondary px-4 py-2 rounded hover:bg-secondary"
            >
              Нет
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default PopupConfirm;
