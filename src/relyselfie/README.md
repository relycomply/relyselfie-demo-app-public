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
- `REACT_APP_NUM_IMAGES_TO_CAPTURE` — Number of images to capture per session (default: 3)
- `REACT_APP_NUM_IMAGES_TO_UPLOAD` — Number of best-scored images to upload (default: 2)
- `REACT_APP_UPLOAD_URL` — Proxy endpoint for image uploads

**Usage:**
```javascript
await uploadImages(imagesWithScores, customerId);
```

---

## Configuration

All environment variables are set in a `.env` file at the root of the app. Copy `.env.example` to `.env` to get started.

### General

```env
REACT_APP_UPLOAD_URL=http://localhost:5999/api/upload-images/
REACT_APP_NUM_IMAGES_TO_CAPTURE=3
REACT_APP_NUM_IMAGES_TO_UPLOAD=2
```

### Image Cropping

```env
# Crop captured image to face bounding box
# -1 = no crop, 0 = tight crop, >0 = padding in pixels (recommended: 50)
REACT_APP_CROP_PADDING=-1
```

### Analysis Performance

```env
# Milliseconds between face analysis runs (150ms ≈ 6-7fps)
# Lower = more frequent analysis (higher CPU), Higher = better performance
REACT_APP_ANALYSIS_INTERVAL=150
```

### Camera Settings

```env
# Lower resolution = better performance, higher = better quality
REACT_APP_CAMERA_WIDTH=640
REACT_APP_CAMERA_HEIGHT=480
REACT_APP_CAMERA_FRAME_RATE=30
```

### Quality Thresholds

These control when directives are shown to the user and when capture is triggered.

```env
REACT_APP_BRIGHTNESS_MIN=31      # Minimum brightness (0-100)
REACT_APP_BRIGHTNESS_MAX=78      # Maximum brightness (0-100)
REACT_APP_BLUR_MIN=4             # Minimum sharpness (0-100)
REACT_APP_COVERAGE_MIN=20        # Minimum face coverage of frame (%)
REACT_APP_EYES_OPEN_MIN=50       # Minimum eyes-open score (%)
REACT_APP_FACE_CENTERING_MIN_X=0.35  # Left centering bound (0-1)
REACT_APP_FACE_CENTERING_MAX_X=0.65  # Right centering bound (0-1)
```

### Score Weights

Weights used to compute the overall image quality score. Must sum to 1.0.

```env
REACT_APP_WEIGHT_BRIGHTNESS=0.10
REACT_APP_WEIGHT_BLUR=0.10
REACT_APP_WEIGHT_FACE=0.20
REACT_APP_WEIGHT_COVERAGE=0.20
REACT_APP_WEIGHT_EYES_OPEN=0.20
REACT_APP_WEIGHT_CENTERING=0.20
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