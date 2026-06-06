#!/bin/bash
# ============================================
#  Pakistan News Hub — GitHub Secrets Setup
#  Run this to set FB secrets via gh CLI
# ============================================

set -e

if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI (gh) is not installed."
  echo "Install from: https://cli.github.com/"
  echo ""
  echo "Then authenticate: gh auth login"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "Please run 'gh auth login' first."
  exit 1
fi

REPO="global-news-platform/global-news-platform"

echo "Setting up Facebook secrets for $REPO..."
echo ""

# Read values
read -p "Facebook Page ID [1062857873584159]: " FB_PAGE_ID
FB_PAGE_ID=${FB_PAGE_ID:-1062857873584159}

read -sp "Facebook Page Access Token: " FB_TOKEN
echo ""

if [ -z "$FB_TOKEN" ]; then
  echo "Error: Token cannot be empty"
  exit 1
fi

echo ""
echo "Setting FB_PAGE_ID..."
echo "$FB_PAGE_ID" | gh secret set FB_PAGE_ID --repo "$REPO"

echo "Setting FB_PAGE_ACCESS_TOKEN..."
echo "$FB_TOKEN" | gh secret set FB_PAGE_ACCESS_TOKEN --repo "$REPO"

echo ""
echo "✓ Secrets set successfully!"
echo ""
echo "Verify:"
echo "  gh secret list --repo $REPO"
