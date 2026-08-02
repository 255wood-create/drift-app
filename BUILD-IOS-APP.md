# Building go janey. as an iOS App — Step by Step

Run these in Terminal, in order. `cd ~/drift-boulder` first if you're not already there.

## 1. Install Capacitor (one time)
```
npm install @capacitor/core @capacitor/cli @capacitor/ios
npm install -D @capacitor/assets
```

## 2. Build the web app
```
npm run build
```

## 3. Add the iOS project
```
npm run cap:add:ios
```
This creates an `ios/` folder — the actual Xcode project. Commit it to git like any other project file.

## 4. Generate the full icon set
```
npm run cap:icons
```
This reads `resources/icon.png` (the fixed 1024×1024 master icon, no rounded corners baked in — Apple/iOS rounds it automatically) and drops every required size into the Xcode project for you.

## 5. Sync the web build into the app
```
npm run cap:sync
```
Run this again any time you change `src/App.jsx` and want the app to pick it up.

## 6. Open in Xcode
```
npm run cap:open:ios
```

## 7. Run it on your phone or the simulator
- In Xcode's toolbar, pick a simulator (e.g. "iPhone 16") or your plugged-in iPhone as the run target.
- Click the ▶️ Play button. First launch takes a minute.
- To run on your actual iPhone: plug it in, trust the computer if prompted, select your Apple ID under **Signing & Capabilities** (Xcode auto-provisions for free), then hit Play. You may need to go to Settings → General → VPN & Device Management on the phone to trust your developer certificate the first time.

## 8. Submitting to the App Store (once it's ready)
1. In Xcode, under **Signing & Capabilities**, make sure your paid Apple Developer team is selected and the bundle ID is `com.gojaney.app`.
2. Set a version number (e.g. 1.0) and build number.
3. Menu bar: **Product → Archive**. When it finishes, the Organizer window opens.
4. Click **Distribute App → App Store Connect → Upload**.
5. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com), create a new app (name "go janey.", bundle ID `com.gojaney.app` — register it under Certificates, Identifiers & Profiles first if Xcode hasn't already done it for you).
6. Fill in the listing: screenshots, description, privacy details, support URL.
7. Attach the build you just uploaded and submit for review.

## Notes
- `resources/icon.png` is the source of truth for the app icon now. If you want to change the icon later, replace that file and re-run `npm run cap:icons`.
- The `public/gjicon-*.png` and `apple-icon-180.png` files (used by the PWA/website) were also regenerated from the same fixed master — no more blurry/broken sizes there either.
- Anything under `ios/` is a real Xcode project — normal git workflow applies (`git add`, `git commit`, push to both `origin` and `boulder` remotes per the usual routine).
