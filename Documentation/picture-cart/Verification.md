# Verification - Picture Cart

## 2026-10-03

- Simulator regression for build 1: not run yet.
- Upload and submit: not done.

## 2026-10-03 later

- Device: iPhone 17 Pro Max simulator, UDID `4CBEED5E-21F1-41AF-A87E-AE0B5B5CC857`, iOS 26.4.1. Every tap used an accessibility label.
- Full regression on the Release binary that was uploaded: 87 checks passed. Empty shop and bag, invalid custom text, Oatmeal added and rejected as a duplicate, all twelve pictures, remove and add Apples, shop skip and found, bag pages, unmark and mark, clear finished, clear canceled and confirmed, text sizes Regular, Large, and Extra large (Grapes stayed on screen), home, terminate, relaunch kept the list and Large text, last-item skip stayed put.
- Screenshots after that pass, 1320×2868: `screenshots/build1/01-pick.png`, `02-shop.png`, `03-bag.png`. Uploaded as the 6.9-inch set.
- IPA `build/PictureCart.ipa`. `CFBundleVersion` 1, `CFBundleShortVersionString` 1.0.0, iPhone only, encryption false. Build id `c0d4ca95-f89d-4bd4-bea0-763656be3619` processed VALID.
- App Store id `6818742140`. Version `77c92533-045b-45be-8111-6b84f5863f63` is `WAITING_FOR_REVIEW`. Submission `cb36c247-952c-45cc-8067-b64e7726f2fd`.
