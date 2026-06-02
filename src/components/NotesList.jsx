function NotesList({ notes, onDeleteNote, onEditNote }) {
    return (
        <section>
            <h2>Notes</h2>

            {notes.length === 0 ? (
                <p>No notes yet.</p>
            ) : (
                notes.map((note) => (
                    <p key={note.id}>
                        {note.text}
                        <button onClick={() => onDeleteNote(note.id)}>
                            Delete
                        </button>
                        <button
                            onClick={() => {
                                const newText = prompt("Edit note:", note.text);

                                if (newText && newText.trim() !== "") {
                                    onEditNote(note.id, newText.trim());
                                }
                            }}
                        >
                            Edit
                        </button>
                    </p>
                ))
            )}
        </section>
    );
}

export default NotesList;
