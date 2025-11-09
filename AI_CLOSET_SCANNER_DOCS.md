# AI Closet Scanner Implementation

## Overview

Implemented a complete 4-view AI-powered closet scanner flow that allows users to scan multiple clothing items from a single photo using Google Gemini AI.

## Features

-   **Batch Item Detection**: Scan 1-5 clothing items from a single photo
-   **Mobile Camera Support**: Full camera and gallery picker integration
-   **AI-Powered Recognition**: Automatic category and color detection using Gemini AI
-   **Manual Corrections**: Dropdown selects to correct AI suggestions
-   **Supabase Integration**: Automatic storage of scanned items in user's wardrobe
-   **Polish Language**: All UI text in Polish as per specification
-   **Mobile-First Design**: Optimized for mobile devices

## User Flow

### View 1: IntroScreen

**File**: `src/components/scanner/IntroScreen.tsx`

**Features**:

-   Welcome message: "DODAJ KILKA UBRAŃ NARAZ"
-   Numbered instructions (1-2) for best scanning results
-   Two action buttons:
    -   "Scan items" (camera icon)
    -   "Choose from gallery" (image icon)

### View 2: CameraCapture

**File**: `src/components/scanner/CameraCapture.tsx`

**Features**:

-   Mobile camera access with `capture="environment"` attribute
-   Gallery file picker as alternative
-   5MB file size validation
-   Image format validation (JPG, PNG)
-   Preview display with ability to retake
-   Loading screen: "Analizuję Twoje ubrania..."

### View 3: ConfirmationScreen

**File**: `src/components/scanner/ConfirmationScreen.tsx`

**Features**:

-   Grid display of detected items
-   Each item shows:
    -   Preview image
    -   Item number
    -   Category dropdown (Polish categories)
    -   Color dropdown (Polish colors)
-   Polish categories: Koszulka, Spodnie, Bluza, Kurtka, Buty, Akcesoria, Bielizna, Inne
-   Polish colors: Czarny, Biały, Szary, Niebieski, Czerwony, etc.
-   Confirm button: "Dodaj wszystko do mojej szafy ({count})"

### View 4: SuccessScreen

**File**: `src/components/scanner/SuccessScreen.tsx`

**Features**:

-   Success icon with green checkmark
-   Message: "GOTOWE! Dodałeś {count} elementów do swojej szafy"
-   Three navigation options:
    -   "Scan more items" - restart scanner
    -   "View my closet" - navigate to `/[lang]/wardrobe`
    -   "Back to menu" - navigate to `/[lang]` home

## Technical Implementation

### AI Analysis

**File**: `src/lib/ai/batchAnalysis.ts`

**Function**: `analyzeBatchGarments()`

-   Sends image to Gemini AI via `/api/gemini-proxy`
-   Receives JSON array of detected items
-   Each item includes:
    -   `id`: Unique identifier
    -   `detectedCategory`: Polish category name
    -   `detectedColor`: Polish color name
    -   `confidence`: Detection confidence (0-1)
-   Filters items with confidence > 0.6
-   Returns empty array if no items detected

### Database Integration

**File**: `src/lib/supabase/wardrobe.ts`

**Functions**:

1. `addGarmentsToWardrobe(garments[])`

    - Accepts array of GarmentData objects
    - Maps Polish categories to DB enum values
    - Inserts into `garments` table
    - Associates with authenticated user
    - Returns success/error status

2. `uploadGarmentImage(file, userId)`
    - Uploads image to Supabase Storage
    - Bucket: `wardrobe-images`
    - Path structure: `garments/{userId}/{timestamp}-{random}.{ext}`
    - Returns public URL and storage path

**Category Mapping**:

```typescript
Koszulka → tops
Spodnie → bottoms
Bluza → tops
Kurtka → outerwear
Buty → shoes
Akcesoria → accessories
Bielizna → underwear
Inne → other
```

### Page Routes

**File**: `src/app/[lang]/wardrobe/scan/page.tsx`

-   Server component handling async params
-   Passes language parameter to client component

**File**: `src/app/[lang]/wardrobe/scan/ScanPageClient.tsx`

-   Client component with state management
-   Manages flow between 4 views
-   Handles file capture and AI analysis
-   Integrates with Supabase for data persistence

## State Management

**Flow States**:

```typescript
type ScanStep = "intro" | "camera" | "analyzing" | "confirmation" | "success";
```

**State Variables**:

-   `step`: Current view in the flow
-   `detectedItems`: Array of items from AI analysis
-   Each item contains:
    -   `id`: Unique identifier
    -   `imageUrl`: Base64 or public URL
    -   `detectedCategory`: AI-detected category
    -   `detectedColor`: AI-detected color
    -   `category`: User-confirmed category
    -   `color`: User-confirmed color

## Error Handling

1. **File Validation**:

    - Maximum 5MB size check
    - Image format validation
    - User-friendly Polish error messages

2. **AI Analysis**:

    - Network error handling
    - Empty detection handling
    - Retry capability (user can go back to intro)

3. **Database Operations**:
    - Supabase connection check
    - User authentication verification
    - Transaction error handling
    - Rollback on failure

## Database Schema

Uses existing `garments` table from `001_initial_schema.sql`:

**Key Columns**:

-   `id` (UUID, primary key)
-   `user_id` (UUID, foreign key to auth.users)
-   `name` (TEXT, required)
-   `category` (TEXT, enum constraint)
-   `color` (TEXT, nullable)
-   `image_url` (TEXT, nullable)
-   `image_storage_path` (TEXT, nullable)
-   `created_at` (TIMESTAMP)
-   `updated_at` (TIMESTAMP)

**Row Level Security (RLS)**:

-   Users can only view/insert/update/delete their own garments
-   Policies enforce `auth.uid() = user_id`

## Mobile Optimization

1. **Camera API**:

    - Uses `accept="image/*"` and `capture="environment"`
    - Automatically opens rear camera on mobile devices
    - Falls back to file picker on desktop

2. **Touch Interactions**:

    - Large tap targets (h-14 buttons)
    - Touch-friendly dropdowns
    - Smooth transitions between views

3. **Performance**:
    - Base64 image conversion for preview
    - Single API call for batch detection
    - Optimistic UI updates

## Testing Checklist

-   [ ] Camera opens on mobile devices
-   [ ] Gallery picker works on all platforms
-   [ ] 5MB file size limit enforced
-   [ ] AI detects multiple items correctly
-   [ ] Dropdowns show Polish translations
-   [ ] Items save to Supabase
-   [ ] Success screen navigates correctly
-   [ ] "Scan more" resets state properly
-   [ ] Error messages display in Polish
-   [ ] RLS policies prevent unauthorized access

## Future Enhancements

1. **Image Cropping**: Automatically crop individual items from group photo
2. **Storage Upload**: Upload cropped images to Supabase Storage
3. **Offline Support**: Queue scans when offline, sync later
4. **Bulk Edit**: Select multiple items for batch category/color changes
5. **Custom Categories**: Allow users to create custom categories
6. **Favorites**: Mark items as favorites during confirmation
7. **Tags**: Auto-generate tags from AI analysis
8. **Season Detection**: AI-detect appropriate seasons for items
