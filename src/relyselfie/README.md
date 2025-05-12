# relySelfie.js Usage Guide

The `relySelfie.js` utility provides functions for analyzing images, detecting faces, and uploading images to a server. This guide explains its key functionalities and how to use them.

## Functions

### 1. `loadFaceApiModels`

**Description:**
Loads the required face-api.js models for face detection and analysis.

**Usage:**
```javascript
await loadFaceApiModels();
```

**Models Loaded:**
- Tiny Face Detector
- Face Landmark 68
- Face Recognition
- Age and Gender

---

### 2. `analyzeImage`

**Description:**
Analyzes an image and returns feedback based on brightness, blur, face confidence, and other metrics.

**Parameters:**
- `imageData` (ImageData): Raw image data from a canvas.
- `video` (HTMLVideoElement): Video element for face detection.

**Returns:**
An object containing:
- `status`: "capture" or "analyzing".
- `score`: Overall confidence score.
- `metrics`: Brightness, blur, face confidence, coverage, age, and gender.
- `directives`: List of actionable feedback.
- `timestamp`: Timestamp of the analysis.

**Usage:**
```javascript
const result = await analyzeImage(imageData, video);
console.log(result);
```

---

### 3. `uploadImages`

**Description:**
Uploads images to a GraphQL endpoint.

**Parameters:**
- `imagesWithScores` (Array): Array of image data URLs with scores.
- `customerId` (string): Customer ID to associate with the images.

**Environment Variable Required (in root app):**
- REACT_APP_NUM_IMAGES_TO_CAPTURE=3
- REACT_APP_NUM_IMAGES_TO_UPLOAD=2
- REACT_APP_UPLOAD_URL=http://localhost:5999/api/upload-images/

**Usage:**
```javascript
await uploadImages(images, customerId);
```

---

## Configuration

Ensure the following environment variables are set in the root of the app:

```env
REACT_APP_NUM_IMAGES_TO_CAPTURE=3
REACT_APP_NUM_IMAGES_TO_UPLOAD=2
REACT_APP_UPLOAD_URL=http://localhost:5999/api/upload-images/ # Proxy endpoint for image uploads
```

---

### Proxy for Image Uploads

The `uploadImages` function sends images to a proxy server defined by the `REACT_APP_UPLOAD_URL` environment variable. This proxy server forwards the images to the GraphQL endpoint, ensuring secure and efficient uploads. While also allowing rate-limiting.

---

## Example Workflow

1. Load the face-api.js models:
   ```javascript
   await loadFaceApiModels();
   ```

2. Capture an image from a video feed and analyze it:
   ```javascript
   const result = await analyzeImage(imageData, video);
   console.log(result);
   ```

3. Upload the captured images:
   ```javascript
   await uploadImages(imagesWithScores, customerId);
   ```

---

## Notes

- Ensure the `.env` file is properly configured with the required thresholds and API key.
- The utility relies on face-api.js for face detection and analysis. Make sure the models are available in the `public/models` directory.

For more details, refer to the source code in `src/relyselfie/relySelfie.js`.


## License

This project is licensed under the MIT License.