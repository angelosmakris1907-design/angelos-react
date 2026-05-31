import { useState } from "react";

function TaskInput({ onAddTask }) {
    const [text, setText] = useState("");

    function handleSubmit() {
        const cleanText = text.trim();

        if (cleanText === "") {
            return;
        }

        onAddTask(cleanText);
        setText("");
    }

    return (
        <section>
        <h2>Add Task</h2>

        <input
            type="text"
            placeholder="Enter a task..."
            value={text}
            onChange={(event) => setText(event.target.value)}
        />

        <button onClick={handleSubmit}>Add</button>
    </section>
  );
}

export default TaskInput;