#!/bin/sh
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
if ["$VERCEL_GIT_COMMIT_REF" = "main"]; then
    # Only build on "main" branch
    echo "Build can proceed"
    exit 1;
else
    echo "Build cancelled"
    exit 0
fi