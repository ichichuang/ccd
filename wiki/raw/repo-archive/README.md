# Raw Repository Archive Policy

This directory is reserved for immutable evidence that must survive a future `/docs` deletion.

This package does not blindly copy all of `/docs`. It creates archive pointer manifests and keeps canonical pages tied to original repo paths through `source_paths`. Before `/docs` deletion, historical files listed in the migration map should be copied here or preserved in another immutable evidence store.
