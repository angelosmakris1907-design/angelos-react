function TaskList({ tasks }) {
  return (
    <section>
      <h2>Your Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>{task.text}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskList;