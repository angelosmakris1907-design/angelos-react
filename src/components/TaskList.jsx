function TaskList({ tasks, onToggleTask, onDeleteTask, onEditTask }) {
  return (
    <section>
      <h2>Your Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => onToggleTask(task.id)}
              />

              <span
                style={{
                  textDecoration: task.done ? "line-through" : "none",
                }}
              >
                {task.text}
                {task.dueDate && (
                  <small>
                    {" "}
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </small>
                )}

                {task.duetime && (
                  <small> Time: {task.duetime}</small>
                )}
              </span>

              <button
                onClick={() => {
                  const newText = prompt("Edit task:", task.text);

                  if (newText && newText.trim() !== "") {
                     onEditTask(task.id, newText.trim());
                  }
                }}
              >
                Edit
              </button>

              <button onClick={() => onDeleteTask(task.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskList;