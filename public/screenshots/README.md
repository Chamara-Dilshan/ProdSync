# Extension Screenshots & Media

This directory contains screenshots and media files for the extension demo section.

## 📸 Screenshot Requirements

### Recommended Sizes:

- **Main screenshots**: 1280x800px (16:10 aspect ratio)
- **Thumbnails**: Auto-generated from main screenshots
- **Format**: PNG (for UI screenshots) or JPG (for photos)

### What to Capture:

1. **extension-button.png**
   - Show the "✨ Generate Reply with ProdSync" button on an Etsy message page
   - Highlight the button with an arrow or circle
   - Make sure the Etsy interface is clearly visible

2. **extension-popup.png**
   - Screenshot of the extension popup after clicking the button
   - Show the form with tone selector, product selector, and generate button
   - Include the buyer message preview at the top

3. **extension-preview.png**
   - Show the generated reply in the preview section
   - Include the "Copy" and "Insert into Etsy" buttons
   - Demonstrate the AI-generated professional response

4. **extension-inserted.png**
   - Show the reply inserted into the Etsy message textarea
   - Highlight that the user can still edit before sending
   - Include the Etsy "Send" button

## 🎥 Video Demo (Optional)

If you prefer a video demo instead of screenshots:

### YouTube Video:

1. Upload your demo video to YouTube
2. Get the video ID from the URL (e.g., `https://www.youtube.com/watch?v=ABC123` → ID is `ABC123`)
3. Update the extension page:
   ```tsx
   <DemoSection mode="video" videoUrl="https://www.youtube.com/embed/ABC123" />
   ```

### Direct Video Upload:

1. Record a screen recording (MP4, WebM)
2. Place video in `/public/videos/extension-demo.mp4`
3. Update the extension page:
   ```tsx
   <DemoSection mode="video" videoUrl="/videos/extension-demo.mp4" />
   ```

## 🎬 GIF Demo (Optional)

For a quick animated demo:

1. Create a screen recording
2. Convert to GIF using tools like:
   - [Gifski](https://gif.ski/) (Mac)
   - [ScreenToGif](https://www.screentogif.com/) (Windows)
   - [LICEcap](https://www.cockos.com/licecap/) (Cross-platform)
3. Optimize the GIF to reduce file size (<5MB recommended)
4. Place in `/public/extension-demo.gif`
5. Update the extension page:
   ```tsx
   <DemoSection mode="gif" gifUrl="/extension-demo.gif" />
   ```

## 🔧 Updating the Extension Page

Once you have your screenshots/videos:

1. **Add files to this directory** (`/public/screenshots/`)

2. **Update the extension page** (`/app/(dashboard)/dashboard/extension/page.tsx`):

   ```tsx
   <DemoSection
     mode="screenshots"
     screenshots={[
       {
         url: "/screenshots/extension-button.png",
         alt: "Generate Reply button on Etsy",
         caption: "Click the '✨ Generate Reply' button",
       },
       {
         url: "/screenshots/extension-popup.png",
         alt: "Extension popup interface",
         caption: "Select tone and products",
       },
       // ... more screenshots
     ]}
   />
   ```

3. **Uncomment Image components** in `/components/extension/DemoSection.tsx`:
   - Find the `{/* Uncomment when real screenshots are added: */}` comments
   - Remove the comment blocks to display real images

## 📏 Tips for Great Screenshots

1. **Use a clean Etsy message page** - No personal information visible
2. **Highlight key UI elements** - Use arrows, circles, or subtle borders
3. **Show realistic examples** - Use actual product names from your catalog
4. **Consistent browser size** - All screenshots should be the same resolution
5. **Remove distractions** - Close unnecessary browser tabs, hide bookmarks bar

## 🎨 Image Editing Tools

- [Figma](https://figma.com) - Add annotations, arrows, highlights
- [Canva](https://canva.com) - Quick edits, text overlays
- [Snagit](https://www.techsmith.com/screen-capture.html) - Professional screenshots (paid)
- [ShareX](https://getsharex.com/) - Free, powerful screenshot tool (Windows)

## 🚀 Quick Start

1. Install the extension and test it on Etsy
2. Take 4 screenshots following the guide above
3. Save them in this directory with the correct filenames
4. Update the extension page with the screenshot data
5. Uncomment the Image components in DemoSection.tsx
6. Test the carousel navigation

---

**Current Status**: Using placeholder screenshots
**Next Step**: Capture real screenshots from working extension
