function CategoryList({ categories }) {
    return (
        <section>
            <details>
                <summary>Categories</summary>

                {categories.length === 0 ? (
                    <p>No categories yet.</p>
                ) : (
                    <ul>
                        {categories.map((category) => (
                            <li key={category}>{category}</li>
                        ))}
                    </ul>
                )}
            </details>
        </section>
    );
}

export default CategoryList;