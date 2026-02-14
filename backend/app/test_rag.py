from pathlib import Path
from rag import RAGDocumentUploader


def main():
    """Execute the sample RAG chain"""

    # Choices of different providers.
    choices = {
        "embedding": "huggingface",
        "vector_store": "chroma",
    }

    # Initialize the RAG document uploader
    uploader = RAGDocumentUploader(
        vector_store_type=choices["vector_store"],
        chunk_size=500,
        chunk_overlap=50,
    )

    # Example 1: Upload a single document
    print("\n=== Document Upload & Indexing ===\n")
    file_path = "data/sample_docs.txt"
    if Path(file_path).exists():
        uploader.upload_and_index(file_path)
    else:
        print(f"⚠ Sample file not found at {file_path}")
        # Create a simple sample if it doesn't exist
        Path("data").mkdir(exist_ok=True)
        with open(file_path, "w") as f:
            f.write(
                "Device XYZ-001 failed last week due to power surge in the East wing. "
                "The device was located at Building A, Floor 3. It has been replaced. "
                "Device ABC-002 is performing well in the West wing."
            )
        uploader.upload_and_index(file_path)

    # Example 2: Batch upload multiple documents
    # uploader.upload_batch(["data/file1.txt", "data/file2.pdf", "data/file3.csv"])

    # Get document summary
    summary = uploader.get_document_summary()
    print("\nDocument Summary:")
    for key, value in summary.items():
        print(f"  {key}: {value}")

    # 3. Query
    user_query = "What is the location of the device that failed last week?"

    chain = uploader.get_rag_chain()

    # 7. Execute the chain
    print("\n=== Query ===")
    print(f"Q: {user_query}\n")
    answer = chain.invoke(user_query)
    print("--- Hybrid RAG Answer ---\n", answer.content)


if __name__ == "__main__":
    main()
