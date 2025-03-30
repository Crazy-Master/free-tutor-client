import Header from "./components/Header";
import Card from "./components/Card";
import Button from "./components/Button";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex justify-center pt-10">
        <Card className="max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Пример карточки</h2>
          <p className="mb-4">Это карточка с кнопкой</p>
          <Button onClick={() => alert("Нажата кнопка!")}>Нажми</Button>
        </Card>
      </div>
    </div>
  );
}


export default App;