#!/bin/bash

# Git History Cleanup Script for ProdSync
# This removes the exposed API key from git history

echo "🧹 Git History Cleanup Script"
echo "=============================="
echo ""
echo "⚠️  WARNING: This script will rewrite git history!"
echo "    Only run this if you understand the implications."
echo ""
echo "Prerequisites:"
echo "  - You are the sole contributor, OR"
echo "  - You have coordinated with all collaborators"
echo "  - You have backed up your repository"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Step 1: Install git-filter-repo (if not already installed)"
echo "-----------------------------------------------------------"

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "git-filter-repo not found. Installing..."

    # Try to install via pip
    if command -v pip3 &> /dev/null; then
        pip3 install git-filter-repo
    elif command -v pip &> /dev/null; then
        pip install git-filter-repo
    else
        echo "❌ Error: pip not found. Please install git-filter-repo manually:"
        echo "   https://github.com/newren/git-filter-repo"
        exit 1
    fi
else
    echo "✅ git-filter-repo already installed"
fi

echo ""
echo "Step 2: Create backup"
echo "---------------------"
backup_dir="../ProdSync-backup-$(date +%Y%m%d-%H%M%S)"
echo "Creating backup at: $backup_dir"
cp -r . "$backup_dir"
echo "✅ Backup created"

echo ""
echo "Step 3: Remove sensitive file from history"
echo "-------------------------------------------"
echo "Removing: extension/DEBUG_POPUP.md"

git filter-repo --invert-paths --path extension/DEBUG_POPUP.md --force

if [ $? -eq 0 ]; then
    echo "✅ File removed from git history"
else
    echo "❌ Error: git-filter-repo failed"
    exit 1
fi

echo ""
echo "Step 4: Clean up references"
echo "---------------------------"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Cleanup complete"

echo ""
echo "Step 5: Verify removal"
echo "----------------------"
echo "Searching for API key pattern..."

if git log --all --full-history --source -- "extension/DEBUG_POPUP.md" | grep -q "AIzaSy"; then
    echo "⚠️  Warning: API key pattern still found in history"
else
    echo "✅ API key pattern not found in history"
fi

echo ""
echo "=============================="
echo "🎉 Git history cleaned!"
echo ""
echo "Next steps:"
echo "1. Verify the cleanup: git log --oneline"
echo "2. Force push to GitHub: git push origin --force --all"
echo "3. Notify collaborators to re-clone the repository"
echo ""
echo "⚠️  IMPORTANT: After force pushing:"
echo "   - GitHub might still cache old history for ~24 hours"
echo "   - Contact GitHub Support to purge cache if needed"
echo "   - Revoke the exposed API key in Google Cloud Console"
echo ""
