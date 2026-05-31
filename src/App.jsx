import "./App.css";
import Header from "./components/Header";
import NextTask from "./components/NextTask";
import TaskInput from "./components/TaskInput";

function App() {
  return (
    <main className="app">
      <Header />
      <NextTask />
      <TaskInput />
    </main>
  );
}

export default App;