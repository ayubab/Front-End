# User Privilege System & New Features

## Overview
This document describes the new features implemented in the K3 APD Application:

1. **Denah (Floor Plans) Viewer** - View floor plans for each location
2. **Excel Embed Viewer** - ULTG admin can view all Google Sheets
3. **User Privilege System** - Location-based access control

---

## 1. Denah (Floor Plans) Viewer

### Features
- View denah/floor plans for each GI location
- Multiple floor support (Lantai 1, 2, 3, 4...)
- Image navigation with previous/next buttons
- Floor selector for quick navigation

### Available Denah
All denah images are stored in `/public/` with the naming convention:
- `denah_gi_[location]_[floor].jpg`
- Example: `denah_gi_gejayan_1.jpg`, `denah_gi_gejayan_2.jpg`, etc.

### Locations with Denah
- ULTG Yogyakarta: 1 denah
- GI Bantul: 2 floors
- GIS Wirobrajan: 2 floors
- GI Kentungan: 2 floors
- GIS Gejayan: 4 floors
- GI Klaten: 2 floors
- GI Kalasan: 1 floor
- GI Semanu: 2 floors
- GI Godean: 1 floor
- GI Medari: 1 floor
- GI Wates: 1 floor
- GI Purworejo: 4 floors

### Access
Navigate to: `/lokasi/[locationId]/denah`
Or click the "Denah" category from the main menu.

---

## 2. Excel Embed Viewer (Rekap Excel)

### Features
- Embedded Google Sheets viewer
- Location selector to switch between different GI sheets
- Only accessible by ULTG admin
- Direct link to open in Google Sheets
- Real-time view of all inputted data

### Access
- Only for users with `office: 'ultg-yogyakarta'`
- Navigate to: `/rekap-excel`
- Or click "📄 Excel Rekap" button in the header

### Configuration
The Excel Embed viewer uses the existing Google Sheet IDs from your environment variables. No additional configuration needed!

The `/api/sheet-ids` endpoint securely provides the sheet IDs to the client-side viewer.

### Important Notes
- Sheet IDs are fetched from existing `GOOGLE_SHEET_ID_*` environment variables
- Data is served through a secure API endpoint
- Recommended: Set sheets to "Anyone with link can view"
- The service account email should have Editor access for API operations

---

## 3. User Privilege System

### User Roles

#### ULTG Admin
- **Office**: `ultg-yogyakarta`
- **Access**: All locations
- **Features**:
  - Can access any GI location
  - Can view "Rekap Excel" page
  - Can switch between Input and Rekap modes
  - Can select any location from the location picker
  - Back button returns to location picker

#### Location-Specific Users
- **Office**: Specific GI (e.g., `gi-bantul`, `gis-wirobrajan`)
- **Access**: Only their assigned location
- **Features**:
  - Automatically redirected to their location's jobsheet after login
  - Cannot access other locations (will be redirected back)
  - Cannot access location picker page
  - Back button shows alert (stays on their location)
  - Can only view and edit their own location's data

### User Configuration

Add users in `.env.local`:

```env
# ULTG Admin
ADMIN_EMAIL=admin@ultg.co.id
ADMIN_PASSWORD=admin123
ADMIN_ROLE=admin
ADMIN_OFFICE=ultg-yogyakarta

# GI Bantul User
USER_BANTUL_EMAIL=bantul@ultg.co.id
USER_BANTUL_PASSWORD=bantul123
USER_BANTUL_ROLE=input

# GI Klaten User
USER_KLATEN_EMAIL=klaten@ultg.co.id
USER_KLATEN_PASSWORD=klaten123
USER_KLATEN_ROLE=input

# ... add more users as needed
```

### How It Works

#### Login Flow
1. User enters email and password
2. System checks credentials against configured users
3. If user is ULTG admin (`ultg-yogyakarta`):
   - Redirect to `/pilih-lokasi` (location picker)
4. If user is location-specific:
   - Redirect directly to `/lokasi/[their-office]/alat`

#### Access Control
1. **Location Page** (`/lokasi/[locationId]/alat`):
   - Checks if user's office matches the locationId
   - If not ULTG admin and location doesn't match: redirect to user's own location

2. **Location Picker** (`/pilih-lokasi`):
   - Only ULTG admin can access
   - Other users redirected to their location

3. **Rekap Excel** (`/rekap-excel`):
   - Only ULTG admin can access
   - Other users redirected to location picker (then to their location)

### Adding New Users

#### Method 1: Environment Variables (Recommended)
1. Open `.env.local`
2. Add user credentials:
```env
USER_NEWLOCATION_EMAIL=user@ultg.co.id
USER_NEWLOCATION_PASSWORD=password123
USER_NEWLOCATION_ROLE=input
```

3. Update `lib/data.ts` to include the new user (already configured for all GI locations)

#### Method 2: Hardcode in lib/data.ts
```typescript
export const users: User[] = [
  // ... existing users
  {
    email: 'newuser@ultg.co.id',
    password: 'password123',
    role: 'input',
    office: 'gi-bantul'
  }
];
```

---

## Security Considerations

### Authentication
- Currently using localStorage for session management
- Passwords stored in environment variables
- No password hashing (suitable for internal use)

### Recommendations for Production
1. Implement proper session management (JWT, cookies)
2. Hash passwords using bcrypt or similar
3. Add password reset functionality
4. Implement rate limiting on login attempts
5. Add 2FA for admin accounts
6. Use HTTPS only

### Data Access
- Location-specific users can only access their location's API endpoints
- Google Sheets permissions should be configured per location
- Service account should have minimal necessary permissions

---

## Troubleshooting

### User can't access their location
- Check that `office` in user config matches the location ID
- Verify location ID format (e.g., `gi-bantul`, not `GI Bantul`)

### Excel Embed not showing
- Check that `NEXT_PUBLIC_SHEET_ID_[LOCATION]` is set
- Verify sheet sharing permissions (must be viewable)
- Check browser console for iframe errors

### Denah images not displaying
- Verify image files exist in `/public/` folder
- Check file naming convention: `denah_gi_[location]_[floor].jpg`
- Ensure images are properly formatted JPG files

---

## API Endpoints

All existing API endpoints remain unchanged:
- `/api/apd` - APD data operations
- `/api/apd-std` - APD STD operations
- `/api/alat-kerja` - Alat Kerja operations
- `/api/cctv` - CCTV operations
- `/api/hydrant` - Hydrant operations
- `/api/limbah-k3` - Limbah K3 operations

---

## File Structure

```
app/
├── lokasi/
│   └── [locationId]/
│       ├── alat/           # Equipment management
│       └── denah/          # Floor plans viewer (NEW)
├── rekap-excel/            # Excel embed viewer (NEW)
├── pilih-lokasi/           # Location picker (restricted to ULTG)
└── login/                  # Login with privilege system

lib/
└── data.ts                 # User management with privileges (UPDATED)

public/
├── denah_gi_bantul_1.jpg   # Floor plan images
├── denah_gi_gejayan_1.jpg
└── ... (all denah images)
```

---

## Testing

### Test Users (Example Configuration)

```env
# ULTG Admin (can access everything)
admin@ultg.co.id / admin123

# GI Bantul User (can only access GI Bantul)
bantul@ultg.co.id / bantul123

# GIS Gejayan User (can only access GIS Gejayan)
gejayan@ultg.co.id / gejayan123
```

### Test Scenarios

1. **ULTG Admin Login**:
   - Should see location picker
   - Can access any location
   - Can access Excel Rekap
   - Back button works normally

2. **Location User Login**:
   - Automatically goes to their location
   - Cannot access other locations
   - Cannot access Excel Rekap
   - Cannot go to location picker

3. **Denah Viewer**:
   - All users can view their location's denah
   - Multiple floors navigate correctly
   - Images load properly

---

## Future Enhancements

1. **User Management UI**
   - Admin panel to add/remove users
   - Password reset functionality
   - User activity logs

2. **Advanced Permissions**
   - Read-only vs Edit permissions
   - Category-specific permissions
   - Time-based access

3. **Denah Enhancements**
   - Interactive floor plans
   - Equipment location markers
   - Zoom and pan functionality

4. **Excel Embed Improvements**
   - Specific sheet tab selection
   - Custom filters
   - Export functionality

---

## Support

For issues or questions:
1. Check this documentation
2. Review `.env.example` for correct configuration
3. Check browser console for errors
4. Verify user permissions in `lib/data.ts`
