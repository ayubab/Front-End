# Quick Setup Guide - New Features

## 1. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Google Sheet IDs are already configured!
# The existing GOOGLE_SHEET_ID_* variables are used for both:
# 1. API access (server-side operations)
# 2. Excel embed viewer (fetched via API)

# No additional configuration needed for Excel Embed!
```

**Important:** The Excel embed viewer uses the same `GOOGLE_SHEET_ID_*` environment variables that are already configured for the API. No duplicate variables needed!

### Optional: Add users for each location

```env
# Example: Add users for each location
# USER_BANTUL_EMAIL=bantul@ultg.co.id
# USER_BANTUL_PASSWORD=bantul123
# USER_BANTUL_ROLE=input
```

## 2. Test the Features

### Test ULTG Admin
```
Email: admin@ultg.co.id
Password: admin123
```

**Expected behavior:**
- Redirects to location picker
- Can select any location
- Can see "Excel Rekap" button in header
- Can access `/rekap-excel` page
- Back button returns to location picker
- Has Input/Rekap mode toggles

### Test Location-Specific User (Example)

First, add a test user to `.env.local`:
```env
USER_BANTUL_EMAIL=bantul@ultg.co.id
USER_BANTUL_PASSWORD=bantul123
USER_BANTUL_ROLE=input
```

Then login:
```
Email: bantul@ultg.co.id
Password: bantul123
```

**Expected behavior:**
- Automatically redirects to `/lokasi/gi-bantul/alat`
- Cannot access other locations
- Cannot access Excel Rekap
- No back button (or back button disabled)
- Has logout button
- Can only work on their location

## 3. View Denah (Floor Plans)

1. Login as any user
2. Go to your location's page
3. Click "Denah 🗺️" category
4. Navigate through floors using:
   - Floor selector buttons (if multiple floors)
   - Previous/Next buttons
   - Page counter shows current position

## 4. Excel Embed Viewer (ULTG Admin Only)

1. Login as ULTG admin
2. Navigate to any location
3. Click "📄 Excel Rekap" button in header
4. OR go directly to `/rekap-excel`
5. Select location from the grid
6. View embedded Google Sheets
7. Click "Buka di Google Sheets" to open in new tab

## 5. Verify Access Control

### ULTG Admin Can:
- ✅ Access all locations
- ✅ View Excel Rekap
- ✅ Switch between locations
- ✅ Toggle Input/Rekap modes

### Location Users Can:
- ✅ Access only their assigned location
- ❌ Cannot access other locations (will be redirected)
- ❌ Cannot access location picker
- ❌ Cannot access Excel Rekap
- ✅ Can logout

## 6. Google Sheets Permissions

For Excel Embed to work, each Google Sheet must be:

1. Shared with "Anyone with the link"
2. Set to "Viewer" or "Editor" permissions
3. OR shared specifically with the service account email

**The sheet IDs are already configured in your `.env.local` file!**

Steps to verify/update:
1. Open Google Sheet
2. Click "Share" button
3. Change from "Restricted" to "Anyone with the link"
4. Set permission level (Viewer recommended for embed)
5. The Sheet ID in `.env.local` is already correct (e.g., `GOOGLE_SHEET_ID_GI_BANTUL`)

## 7. Adding New Users

### Option 1: Environment Variables (Recommended)

Add to `.env.local`:
```env
USER_NEWLOCATION_EMAIL=user@ultg.co.id
USER_NEWLOCATION_PASSWORD=securepassword
USER_NEWLOCATION_ROLE=input
```

The user configuration in `lib/data.ts` already supports all locations.

### Option 2: Hardcode in lib/data.ts

Edit `lib/data.ts`:
```typescript
export const users: User[] = [
  // ... existing users
  {
    email: 'newuser@ultg.co.id',
    password: 'password123',
    role: 'input',
    office: 'gi-bantul' // must match location ID
  }
];
```

## 8. Troubleshooting

### Denah not showing
- Check image exists in `/public/` folder
- Verify file naming: `denah_gi_[location]_[floor].jpg`
- Check browser console for 404 errors

### Excel Embed shows warning
- Check `NEXT_PUBLIC_SHEET_ID_[LOCATION]` is set
- Verify sheet is publicly accessible or shared
- Test sheet URL directly in browser

### User can't access location
- Verify `office` field matches location ID exactly
- Check case sensitivity (use lowercase with hyphens)
- Example: `gi-bantul` not `GI Bantul`

### Access denied errors
- Clear localStorage: `localStorage.clear()`
- Re-login to refresh permissions
- Check browser console for redirect loops

## 9. Security Notes

⚠️ **Important for Production:**

1. **Passwords**: Currently stored in plain text in `.env`
   - Use environment variables only
   - Never commit `.env.local` to git
   - Consider implementing password hashing

2. **Session Management**: Uses localStorage
   - Consider implementing JWT or secure cookies
   - Add session timeout
   - Implement refresh tokens

3. **Sheet Access**: Public embed URLs
   - Sheets are visible to anyone with SHEET_ID
   - Consider implementing proxy API endpoints
   - Add additional server-side validation

4. **HTTPS**: Always use HTTPS in production
   - Prevents session hijacking
   - Protects credentials in transit

## 10. Next Steps

After setup, you can:

1. **Customize denah images** - Replace files in `/public/`
2. **Add more users** - Configure in `.env.local`
3. **Adjust permissions** - Modify access logic in pages
4. **Enhance UI** - Customize styling and layouts
5. **Add features** - Build on the privilege system

## Files Modified/Created

### New Files:
- `app/lokasi/[locationId]/denah/page.tsx` - Denah viewer
- `app/rekap-excel/page.tsx` - Excel embed viewer
- `app/api/sheet-ids/route.ts` - API to fetch sheet IDs
- `PRIVILEGE_SYSTEM.md` - Full documentation
- `SETUP_GUIDE.md` - This file

### Modified Files:
- `app/login/page.tsx` - Privilege-based routing
- `app/pilih-lokasi/page.tsx` - Access control
- `app/lokasi/[locationId]/alat/page.tsx` - Privilege checks, logout
- `lib/data.ts` - User management for all locations
- `.env.example` - Updated with new variables

## Support

For detailed documentation, see:
- `PRIVILEGE_SYSTEM.md` - Complete feature documentation
- `.env.example` - Environment variable reference
- `README.md` - General application information
