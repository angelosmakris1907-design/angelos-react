function CategoryList({ categories }) {
    return (
        <section>
            <h2>Categories</h2>

            {categories.length === 0 ? (
                <p>No categories yet.</p>
            ) : (
                <ul>
                    {categories.map((category) => (
                        <li key={category}>{category}</li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default CategoryList;