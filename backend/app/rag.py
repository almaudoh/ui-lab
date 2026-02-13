import os
from typing import List, Optional, Dict, Any, Union
from pathlib import Path
from dotenv import load_dotenv

from langchain_classic.retrievers import EnsembleRetriever
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_community.document_loaders import TextLoader, PyPDFLoader, CSVLoader
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import Chroma, FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone


load_dotenv()  # Loads OPENAI_API_KEY from .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
PROMPT_TEMPLATE = """
You are a helpful AI assistant. Below is the user question and the relevant context.

Context:
{context}

Question: {question}

Provide an answer based on the context. If you are not sure, say you don't know.
"""


# 1. Document loaders and splitters.
def split_document_file(file_path: str) -> List[Document]:
    loader = TextLoader(file_path, encoding="utf-8")
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    return text_splitter.split_documents(docs)


# 2. Vector store builders.
def build_faiss_vector_store(docs: List[Document], embeddings):
    embeddings = embeddings or OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    return FAISS.from_documents(docs, embeddings)


def build_chroma_vector_store(docs: List[Document], embeddings):
    embeddings = embeddings or OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    return Chroma.from_documents(docs, embeddings)


def build_pinecone_vector_store(docs: List[Document], embeddings):
    embeddings = embeddings or OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX_NAME)
    return PineconeVectorStore(embedding=embeddings, index=index)


# 3. Document formatting utility
def format_docs(docs: List[Document]) -> str:
    """Format documents for the prompt."""
    return "\n\n".join([doc.page_content for doc in docs])


# 4. Document upload and indexing system
class RAGDocumentUploader:
    """Manages document uploads and indexing in the RAG system."""

    def __init__(
        self,
        embeddings: Optional[Any] = None,
        vector_store_type: str = "chroma",
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ):
        """
        Initialize the document uploader.

        Args:
            embeddings: Embedding model to use. If None, defaults to HuggingFace.
            vector_store_type: Type of vector store ("chroma", "faiss", "pinecone").
            chunk_size: Size of text chunks for splitting.
            chunk_overlap: Overlap between chunks.
        """
        self.embeddings = embeddings or HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )
        self.vector_store_type = vector_store_type
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap
        )
        self.vector_store = None
        self.all_documents: List[Document] = []
        self.bm25_retriever = None

    def load_document(self, file_path: str) -> List[Document]:
        """
        Load a document from file and split it into chunks.

        Supports: .txt, .pdf, .csv

        Args:
            file_path: Path to the document file.

        Returns:
            List of Document objects.
        """
        file_path = Path(file_path)
        print(f"Loading document: {file_path}")
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        file_ext = file_path.suffix.lower()

        try:
            if file_ext == ".txt":
                loader = TextLoader(str(file_path), encoding="utf-8")
                docs = loader.load()
            elif file_ext == ".pdf":
                loader = PyPDFLoader(str(file_path))
                docs = loader.load()
            elif file_ext == ".csv":
                loader = CSVLoader(str(file_path))
                docs = loader.load()
            else:
                raise ValueError(
                    f"Unsupported file format: {file_ext}. Supported: .txt, .pdf, .csv"
                )

            # Split documents into chunks
            split_docs = self.text_splitter.split_documents(docs)
            print(f"✓ Loaded {file_path.name}: {len(split_docs)} chunks created")
            return split_docs

        except Exception as e:
            print(f"✗ Error loading {file_path}: {str(e)}")
            raise

    def add_documents(self, documents: List[Document]) -> None:
        """
        Add documents to the indexing system.

        Args:
            documents: List of Document objects to add.
        """
        self.all_documents.extend(documents)
        print(
            f"✓ Added {len(documents)} documents. Total indexed: {len(self.all_documents)}"
        )

    def build_vector_store(self) -> None:
        """Build or rebuild the vector store with all indexed documents."""
        if not self.all_documents:
            print("⚠ No documents to index. Please add documents first.")
            return

        try:
            if self.vector_store_type == "pinecone":
                self.vector_store = build_pinecone_vector_store(
                    self.all_documents, self.embeddings
                )
            elif self.vector_store_type == "faiss":
                self.vector_store = build_faiss_vector_store(
                    self.all_documents, self.embeddings
                )
            else:  # chroma (default)
                self.vector_store = build_chroma_vector_store(
                    self.all_documents, self.embeddings
                )
            print(f"✓ Vector store built with {len(self.all_documents)} documents")
        except Exception as e:
            print(f"✗ Error building vector store: {str(e)}")
            raise

    def build_bm25_retriever(self) -> None:
        """Build the BM25 retriever for keyword-based search."""
        if not self.all_documents:
            print("⚠ No documents for BM25 retriever. Please add documents first.")
            return

        self.bm25_retriever = BM25Retriever(docs=self.all_documents)
        print(f"✓ BM25 retriever built with {len(self.all_documents)} documents")

    def upload_and_index(self, file_path: str) -> List[Document]:
        """
        Upload a document and immediately index it.

        Args:
            file_path: Path to the document file.

        Returns:
            List of indexed Document chunks.
        """
        documents = self.load_document(file_path)
        self.add_documents(documents)
        self.build_vector_store()
        self.build_bm25_retriever()
        return documents

    def upload_batch(self, file_paths: List[str], base_path: Union[str, Path] = None) -> int:
        """
        Upload and index multiple documents at once.

        Args:
            file_paths: List of file paths to upload.
            base_path: Optional base directory for file paths.
        Returns:
            Total number of document chunks indexed.
        """
        total_chunks = 0
        for file_path in file_paths:
            try:
                documents = self.load_document(os.path.join(base_path, file_path))
                self.add_documents(documents)
                total_chunks += len(documents)
            except Exception as e:
                print(f"⚠ Skipped {file_path}: {str(e)}")
                continue

        self.build_vector_store()
        self.build_bm25_retriever()
        print(f"✓ Batch upload complete: {total_chunks} total chunks indexed")
        return total_chunks

    def get_retriever(
        self, retriever_type: str = "hybrid", weights: tuple = (0.5, 0.5)
    ):
        """
        Get a retriever (hybrid, vector-only, or bm25-only).

        Args:
            retriever_type: Type of retriever ("hybrid", "vector", "bm25").
            weights: Weights for hybrid retriever (bm25_weight, vector_weight).

        Returns:
            A retriever object.
        """
        if not self.vector_store or not self.bm25_retriever:
            print("⚠ Retrievers not built. Building now...")
            self.build_vector_store()
            self.build_bm25_retriever()

        if retriever_type == "hybrid":
            vector_retriever = self.vector_store.as_retriever(search_kwargs={"k": 2})
            return EnsembleRetriever(
                retrievers=[self.bm25_retriever, vector_retriever],
                weights=list(weights),
            )
        elif retriever_type == "vector":
            return self.vector_store.as_retriever(search_kwargs={"k": 5})
        elif retriever_type == "bm25":
            return self.bm25_retriever
        else:
            raise ValueError(f"Unknown retriever type: {retriever_type}")

    def get_document_summary(self) -> Dict[str, Any]:
        """Get a summary of the indexed documents."""
        return {
            "total_documents": len(self.all_documents),
            "vector_store_type": self.vector_store_type,
            "embeddings_model": str(self.embeddings),
            "bm25_available": self.bm25_retriever is not None,
            "vector_store_built": self.vector_store is not None,
        }

    def get_rag_chain(self, retriever_type="hybrid", weights=(0.5, 0.5)):
        # Check that the RAG has been built.
        if not self.vector_store or not self.bm25_retriever:
            self.build_vector_store()
            self.build_bm25_retriever()

        """Build a simple RAG chain using the retriever and an LLM."""
        retriever = self.get_retriever(retriever_type=retriever_type, weights=weights)
        llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, temperature=0)
        prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template=PROMPT_TEMPLATE,
        )
        return (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt_template
            | llm
        )

uploader = RAGDocumentUploader()

doc_dir = Path(__file__).parent.parent / "documents"
print(f"Uploading documents from: {doc_dir}")
file_paths = os.listdir(doc_dir)
print(f"Found files: {file_paths}")
uploader.upload_batch(file_paths=file_paths, base_path=doc_dir)
