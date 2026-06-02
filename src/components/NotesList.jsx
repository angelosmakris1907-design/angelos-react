function NotesList({ notes, onDeleteNote }) {
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
                    </p>
                ))
            )}
        </section>
    );
}

export default NotesList;
