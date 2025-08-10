touch setup.sh
#!/bin/bash
set -e
rm -rf node_modules package-lock.json
echo "{}" > .watchmanconfig
watchman shutdown-server || true
brew uninstall watchman || true
rm -rf /usr/local/var/run/watchman/
rm -rf ~/.watchman/
brew install watchman
watchman watch "$(pwd)"
npm install
echo y | npx expo install --check
npx expo start --clear
chmod +x setup.sh