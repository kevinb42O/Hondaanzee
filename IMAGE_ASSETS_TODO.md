# SEO Image Assets Needed

## Required Images for Full SEO Optimization

### 1. Open Graph Image (CRITICAL)
**File:** `og-image.jpg`
**Location:** `/public/og-image.jpg`
**Dimensions:** 1200 x 630 pixels
**Format:** JPG (max 1MB)

**Content Ideas:**
- Happy dog on Belgian beach
- Text overlay: "HondAanZee.be - Jouw Gids voor de Belgische Kust"
- Include your logo/branding
- Vibrant, eye-catching colors
- Include a call-to-action: "Ontdek alle hondenstranden →"

**Tool Recommendations:**
- Canva (free templates for OG images)
- Figma
- Photoshop

---

### 2. Favicon Files

#### 2a. SVG Favicon (Modern Browsers)
**File:** `favicon.svg`
**Location:** `/public/favicon.svg`
**Already exists?** Check your public folder

#### 2b. PNG Favicons
**Files needed:**
- `favicon-16x16.png` (16 x 16 pixels)
- `favicon-32x32.png` (32 x 32 pixels)
- `favicon-192x192.png` (192 x 192 pixels) - Android
- `favicon-512x512.png` (512 x 512 pixels) - Android
- `apple-touch-icon.png` (180 x 180 pixels) - iOS

**Location:** All in `/public/`

**Design:** 
- Your paw print icon
- Sky blue (#0284c7) background
- White paw icon
- Simple, recognizable at small sizes

**Quick Tool:** 
- Use https://realfavicongenerator.net/
- Upload one 512x512 PNG, it generates all sizes

---

### 3. City-Specific OG Images (Optional, Advanced)

For better social sharing per city, create:
- `og-blankenberge.jpg`
- `og-knokke.jpg`
- `og-oostende.jpg`
- etc.

**Dimensions:** 1200 x 630 pixels each
**Content:** Beach photo of that specific city + city name overlay

---

## Creating OG Image - Quick Guide

### Design Template (Canva):
1. Create 1200 x 630 px document
2. Background: Beautiful beach photo with dog
3. Dark overlay (40% opacity) for text readability
4. Add text:
   - **Main heading:** "Honden aan de Belgische Kust"
   - **Subheading:** "Ontdek strandregels, losloopzones & hondvriendelijke plekken"
   - **Logo:** HondAanZee logo (paw icon + text)
5. Export as JPG (high quality, under 1MB)

### Stock Photo Sources (Free):
- Unsplash.com (search: "dog beach")
- Pexels.com
- Pixabay.com
- YOUR OWN PHOTOS (best for authenticity!)

---

## After Creating Images:

1. Place all files in `/public/` folder
2. Test Open Graph with: https://www.opengraph.xyz/
3. Test Twitter Card with: https://cards-dev.twitter.com/validator
4. Clear social media cache:
   - Facebook: https://developers.facebook.com/tools/debug/
   - LinkedIn: https://www.linkedin.com/post-inspector/

---

## Current Status:
- ✅ Meta tags configured in index.html
- ⚠️ Missing: OG image file
- ⚠️ Missing: PNG favicon files (only have SVG)
- ✅ Manifest configured

## Impact of Missing Images:
- **No OG image:** Social shares will look bland (no preview image)
- **No favicons:** Browser tabs show default icon (unprofessional)

**Priority:** Create OG image first (biggest visual impact on social media)
