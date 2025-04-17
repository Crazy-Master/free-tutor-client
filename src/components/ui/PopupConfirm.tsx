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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm pointer-events-auto">
        <div className="bg-white dark:bg-gray-800 text-black dark:text-text_light p-6 rounded shadow-xl w-full max-w-md text-center space-y-4">
          <p className="text-lg font-medium">{message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="bg-green-500 text-text_light px-4 py-2 rounded hover:bg-green-600"
            >
              Да
            </button>
            <button
              onClick={onCancel}
              className="bg-secondary dark:bg-gray-700 px-4 py-2 rounded hover:bg-secondary dark:hover:bg-gray-600"
            >
              Нет
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default PopupConfirm;
  