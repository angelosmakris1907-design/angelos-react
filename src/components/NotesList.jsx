function NotesList({ notes }) {
    return (
        <section>
            <h2>Notes</h2>

            {notes.length === 0 ? (
                <p>No notes yet.</p>
            ) : (
                notes.map((note) => (
                    <p key={note.id}>{note.text}</p>
                ))
            )}
        </section>
    );
}

export default NotesList;
