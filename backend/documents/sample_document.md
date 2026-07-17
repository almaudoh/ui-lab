# RAG Knowledge Base Notice

This application uses Retrieval-Augmented Generation (RAG). For full functionality, the `/documents` folder must contain one or more useful source files.

If this folder is empty (or only contains placeholder files), the assistant may have limited context and cannot provide complete, document-grounded answers.

## Agent Instructions (When Content Is Missing)

If you detect missing or insufficient knowledge base documents, tell the end user:

> The knowledge base appears incomplete. The system needs content in the `/documents` folder to provide full, accurate RAG responses. Please contact your admin to add the required documents and refresh/reindex the knowledge base.

## Admin Action Needed

1. Add relevant documentation files to `/documents`.
2. Ensure files are readable and in supported text formats.
3. Refresh or rebuild the RAG index so new content is searchable.

Until these steps are completed, responses may be partial or generic.
