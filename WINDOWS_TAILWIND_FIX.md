# 🔧 Windows Setup - Tailwind CSS Fix

## Issue
You're getting errors because the npm packages weren't installed properly on your Windows machine after pulling the changes.

## Quick Fix (Run these commands in PowerShell or CMD)

### Step 1: Navigate to frontend folder
```cmd
cd C:\Users\Uttam\Desktop\Projects\Concreexpo\frontend
```

### Step 2: Clean install
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Step 3: Start development server
```cmd
npm run dev
```

---

## If Quick Fix Doesn't Work

Try this complete reset:

```cmd
cd C:\Users\Uttam\Desktop\Projects\Concreexpo\frontend

# Remove everything
rmdir /s /q node_modules
rmdir /s /q .next
del package-lock.json

# Fresh install
npm install

# Start server
npm run dev
```

---

## Verify Installation

After `npm install`, check these packages are installed:

```cmd
npm list tailwindcss
npm list tailwindcss-animate
npm list autoprefixer
```

**Expected output**:
- `tailwindcss@3.4.18`
- `tailwindcss-animate@1.0.7`
- `autoprefixer@10.4.21`

---

## If Still Getting Errors

### Error: "Can't resolve 'tailwindcss-animate'"

**Solution**: Install it manually
```cmd
npm install -D tailwindcss-animate
```

### Error: "tailwindcss PostCSS plugin"

**Solution**: Make sure PostCSS config is correct
Check that `frontend/postcss.config.mjs` has:
```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

---

## Complete Reset (Last Resort)

If nothing works, do a complete clean install:

```cmd
# In frontend folder
rmdir /s /q node_modules
rmdir /s /q .next
del package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Verify
npm list tailwindcss tailwindcss-animate autoprefixer

# Start
npm run dev
```

---

## Check Your Setup

After installation, verify these files exist:

✅ `node_modules/tailwindcss/` (should exist)
✅ `node_modules/tailwindcss-animate/` (should exist)
✅ `node_modules/autoprefixer/` (should exist)
✅ `postcss.config.mjs` (should have tailwindcss + autoprefixer)
✅ `tailwind.config.ts` (should have complete config)

---

## Quick Commands for Windows

**PowerShell**:
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

**Command Prompt**:
```cmd
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

---

**This will fix the "tailwindcss-animate not found" error!**
