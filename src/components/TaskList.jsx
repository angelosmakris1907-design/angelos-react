function TaskList({ tasks, onToggleTask }) {
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
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskList;