# RelySelfie Demo App

A React-based demo application that showcases a simple selfie capture flow with face positioning guidance and multi-shot capture. **Optimized for performance with reduced model loading times and efficient real-time analysis across all devices.**

## Features

- 🎨 Customizable theme color
- 📸 Multi-shot capture
- 👤 Face outline guidance
- ⚡ Performance optimized for all devices
- 🏆 Optimal image selection
- 🔧 Configurable analysis quality vs performance trade-offs

## Performance Optimizations

This app includes several optimizations for all devices:

- **Reduced Model Loading**: Only loads essential face detection models (~271KB vs ~15MB)
- **Throttled Analysis**: Optimized analysis frequency (6-7fps) for smooth performance
- **Sampled Image Processing**: Uses pixel sampling for brightness/blur detection
- **Simplified Algorithms**: Optimized blur detection with reduced computational complexity
- **Adaptive Quality**: Automatically adjusts processing quality based on image size

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with camera access

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```
### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in development mode (unsecured).\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

#### `HTTPS=true npm start`

Runs the app in dev secured mode as iOS requires HTTPS to access the camera,

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### Environment Variables

Copy `.env.example` to `.env` and adjust values as needed. See comments in `.env.example` for detailed guidance.

```env
# General
GENERATE_SOURCEMAP=false
REACT_APP_UPLOAD_URL=http://localhost:5999/api/upload-images/
REACT_APP_NUM_IMAGES_TO_CAPTURE=3
REACT_APP_NUM_IMAGES_TO_UPLOAD=2

# Crop captured image to face bounding box (-1 = no crop, 0 = tight crop, >0 = padding in px)
REACT_APP_CROP_PADDING=-1

# Analysis Performance Settings
# Milliseconds between face analysis runs (150ms ≈ 6-7fps)
REACT_APP_ANALYSIS_INTERVAL=150

# Camera Settings
REACT_APP_CAMERA_WIDTH=640
REACT_APP_CAMERA_HEIGHT=480
REACT_APP_CAMERA_FRAME_RATE=30

# Quality Thresholds (0-100 scale)
REACT_APP_BRIGHTNESS_MIN=31
REACT_APP_BRIGHTNESS_MAX=78
REACT_APP_BLUR_MIN=4
REACT_APP_COVERAGE_MIN=20
REACT_APP_EYES_OPEN_MIN=50
REACT_APP_FACE_CENTERING_MIN_X=0.35
REACT_APP_FACE_CENTERING_MAX_X=0.65

# Score Weights (must sum to 1.0)
REACT_APP_WEIGHT_BRIGHTNESS=0.10
REACT_APP_WEIGHT_BLUR=0.10
REACT_APP_WEIGHT_FACE=0.20
REACT_APP_WEIGHT_COVERAGE=0.20
REACT_APP_WEIGHT_EYES_OPEN=0.20
REACT_APP_WEIGHT_CENTERING=0.20
```


### Proxy for GraphQL Uploads

The system uses a proxy server to handle image uploads to the GraphQL endpoint. This proxy is configured in the backend server and is accessible via the `REACT_APP_UPLOAD_URL` environment variable. The proxy simplifies the upload process, allows for rate-limiting and ensures secure communication with the GraphQL API

## Usage

The application follows a simple three-step process:

1. **Welcome Screen**
   - Initial landing page
   - Customizable theme color picker in bottom-right corner
   - "Get Started" button to begin

2. **Instructions Screen**
   - Clear guidelines for optimal photo capture
   - Instructions for:
     - Finding well-lit environment
     - Using front-facing camera
     - Removing glasses/sunglasses
     - Removing head coverings

3. **Camera Screen**
   - Live camera feed with face outline guide
   - Semi-transparent overlay for better positioning
   - Captures 3 photos in succession when "Take Photo" is clicked

4. **Success Screen**
   - Displays all 3 captured photos in a grid
   - Upload images to Platform endpoint
   - Option to start over

## Technical Details

Built with:
- React 18
- React Router v6
- Material UI Icons
- CSS Variables for theming
- WebRTC for camera access
- LocalStorage for theme persistence

### Browser Requirements

The application requires:
- WebRTC (getUserMedia API) support
- CSS Grid support
- CSS Variables support
- LocalStorage support

## Project Structure

```bash
relyselfie-demo-app/
├── .env
├── package.json
├── README.md
├── public/
│   ├── face-api.min.js
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   ├── robots.txt
│   └── models/
│       ├── age_gender_model-shard1
│       ├── age_gender_model-weights_manifest.json
│       ├── face_expression_model-shard1
│       ├── face_expression_model-weights_manifest.json
│       ├── face_landmark_68_model-shard1
│       ├── face_landmark_68_model-weights_manifest.json
│       ├── face_landmark_68_tiny_model-shard1
│       ├── face_landmark_68_tiny_model-weights_manifest.json
│       ├── face_recognition_model-shard1
│       ├── face_recognition_model-shard2
│       ├── face_recognition_model-weights_manifest.json
│       ├── mtcnn_model-shard1
│       ├── mtcnn_model-weights_manifest.json
│       ├── ssd_mobilenetv1_model-shard1
│       ├── ssd_mobilenetv1_model-shard2
│       ├── ssd_mobilenetv1_model-weights_manifest.json
│       ├── tiny_face_detector_model-shard1
│       └── tiny_face_detector_model-weights_manifest.json
├── server/
│   ├── index.js
│   ├── package.json
│   └── README.md
└── src/
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── reportWebVitals.js
    ├── setupTests.js
    ├── components/
    │   ├── CaptureGuidance.js
    │   ├── CaptureScreen.js
    │   ├── ThemeToggle.js
    │   ├── Toast.css
    │   └── Toast.js
    ├── context/
    │   ├── ColorContext.js
    │   └── ThemeContext.js
    └── pages/
        ├── CameraCapture.js
        ├── Instructions.js
        ├── Pages.css
        ├── Success.js
        └── Welcome.js
```

## Documentation

For module usage instructions, refer to the [RelySelfie Usage Guide](./src/relyselfie/README.md).

For server usage instructions, refer to the [RelySelfie Proxy Server Guide](./server/README.md).

## Disclaimer
This is not a liveness or injection attack detector.

## Learn More

To learn more about the technologies used:
- [face-api Models](https://github.com/justadudewhohacks/face-api.js-models/tree/master)
- [React documentation](https://reactjs.org/)
- [React Router documentation](https://reactrouter.com/)
- [WebRTC documentation](https://webrtc.org/)
- [Material UI Icons](https://mui.com/material-ui/material-icons/)