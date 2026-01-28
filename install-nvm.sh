#!/bin/bash

# Script to download and install nvm (Node Version Manager) on Ubuntu Server
# This script should be run as a regular user (not root)

set -e  # Exit on error

echo "================================================"
echo "Installing NVM (Node Version Manager)"
echo "================================================"

# Define nvm version (you can update this to the latest version)
NVM_VERSION="v0.40.1"

echo "Downloading nvm version ${NVM_VERSION}..."

# Download and install nvm
curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh" | bash

echo ""
echo "NVM installation script completed."
echo ""

# Load nvm into the current shell session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo "================================================"
echo "NVM Installation Complete!"
echo "================================================"
echo ""
echo "To start using nvm, either:"
echo "  1. Close and reopen your terminal, OR"
echo "  2. Run the following command:"
echo ""
echo "     source ~/.bashrc"
echo ""
echo "After that, you can verify the installation by running:"
echo "     nvm --version"
echo ""
echo "To install Node.js, use:"
echo "     nvm install node        # Install latest version"
echo "     nvm install --lts       # Install latest LTS version"
echo "     nvm install 18          # Install specific version"
echo ""
echo "================================================"
