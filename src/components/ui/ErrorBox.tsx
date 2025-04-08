interface ErrorBoxProps {
    message: string;
    className?: string;
  }
  
  const ErrorBox = ({ message, className = "" }: ErrorBoxProps) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(message);
      alert("Текст ошибки скопирован в буфер обмена.");
    };
  
    return (
      <div className={`text-sm max-h-[60px] overflow-y-auto text-red-600 relative ${className}`}>
        {message.length < 100 ? (
          <p>{message}</p>
        ) : (
          <>
            <p>{message.slice(0, 100)}...</p>
            <button
              type="button"
              className="underline text-blue-600 text-xs"
              onClick={handleCopy}
            >
              Скопировать ошибку
            </button>
          </>
        )}
      </div>
    );
  };
  
  export default ErrorBox;
  