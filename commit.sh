#!/bin/bash

# Function to add "- " before each line of input
format_input() {
  echo "$1" | sed 's/^/- /'
}

# Prompt for the story ID and short summary
read -p "STORY ID (e.g., 3): " story_id
read -p "Short summary (imperative form, e.g., Add login button): " summary
read -p "Commited by: " commitedBy

# Ask for description
echo ""
echo "## Description"
echo "Explain what was done and why."
echo "Include relevant context like problems solved and reason for approach."
echo "Press ENTER to start typing, then CTRL+D when done:"
description_raw=$(</dev/stdin)
description=$(format_input "$description_raw")

# Ask for changes
echo ""
echo "## Changes"
echo "List changes made (use bullet points if possible)."
echo "Press ENTER to start typing, then CTRL+D when done:"
changes_raw=$(</dev/stdin)
changes=$(format_input "$changes_raw")

# Ask for testing info
echo ""
echo "## Testing"
echo "Describe how you tested it (manual, unit, edge cases, etc)."
echo "Press ENTER to start typing, then CTRL+D when done:"
testing_raw=$(</dev/stdin)
testing=$(format_input "$testing_raw")

# Ask for optional notes
echo ""
echo "## Notes (Optional)"
echo "Add any implementation notes, TODOs, or code review tips."
echo "Press ENTER to start typing, then CTRL+D when done (leave blank if none):"
notes_raw=$(</dev/stdin)
notes=$(format_input "$notes_raw")

# Assemble the commit message
commit_msg="[#$story_id] | $summary | $commitedBy

Description
$description

Changes
$changes

Testing
$testing"

# Append Notes only if provided
if [ -n "$notes_raw" ]; then
  commit_msg+="

Notes
$notes"
fi

# Save commit message to a file
echo "$commit_msg" > ./last-commit.md

# Copy to clipboard (macOS)
echo "$commit_msg" | pbcopy

echo ""
read -p "👀 Do you wanna see preview? (y/n): " preview
if [[ "$preview" =~ ^[Yy](es)?$ ]]; then
  code ./last-commit.md
fi

echo ""
read -p "📝 Do you want to commit this? (y/n): " confirm_commit
if [[ "$confirm_commit" =~ ^[Yy](es)?$ ]]; then
  git commit -F ./last-commit.md
  echo "✅ Changes committed!"
else
  echo "❌ Commit skipped."
fi
