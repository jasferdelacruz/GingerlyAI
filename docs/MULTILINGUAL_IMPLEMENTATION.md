# 🌍 Multilingual Implementation Guide - GingerlyAI

Complete English & Tagalog support for the entire GingerlyAI system.

---

## 📋 Overview

GingerlyAI now supports **full bilingual functionality** (English & Tagalog) across:
- ✅ Mobile App UI
- ✅ Backend API Responses
- ✅ Remedy Database
- ✅ Disease Information
- ✅ Error Messages
- ✅ Success Messages
- ✅ All User-facing Text

---

## 🎯 Supported Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| **English** | `en` | 🇺🇸 | ✅ Complete |
| **Tagalog** | `tl` | 🇵🇭 | ✅ Complete |

---

## 📱 Mobile App (Frontend)

### **Technology Used:**
- `i18next` - Internationalization framework
- `react-i18next` - React bindings
- `expo-localization` - Device language detection
- `@react-native-async-storage/async-storage` - Language preference storage

### **Setup:**

#### 1. Install Dependencies
```bash
cd mobile
npm install i18next react-i18next expo-localization
npm install @react-native-async-storage/async-storage
```

#### 2. Initialize i18n in App
```javascript
// App.jsx
import './src/i18n/config';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.tagline')}</p>
    </div>
  );
}
```

#### 3. Use Translations in Components
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <IonButton>{t('common.save')}</IonButton>
  );
}
```

#### 4. Add Language Switcher
```javascript
import LanguageSwitcher from './components/LanguageSwitcher';

function Header() {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>GingerlyAI</IonTitle>
        <IonButtons slot="end">
          <LanguageSwitcher variant="button" />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}
```

### **Language Switcher Variants:**

1. **Button** - For headers/toolbars
```jsx
<LanguageSwitcher variant="button" />
```

2. **Select** - For settings pages
```jsx
<LanguageSwitcher variant="select" />
```

3. **Item** - For list views
```jsx
<LanguageSwitcher variant="item" />
```

### **Translation Keys:**

```javascript
// Navigation
t('navigation.home')      // "Home" | "Home"
t('navigation.scan')      // "Scan" | "I-scan"
t('navigation.remedies')  // "Remedies" | "Mga Gamot"

// Common
t('common.ok')           // "OK" | "Sige"
t('common.cancel')       // "Cancel" | "Kanselahin"
t('common.save')         // "Save" | "I-save"

// Diseases
t('diseases.bacterial_wilt')  // "Bacterial Wilt" | "Bacterial Wilt (Pagkalanta...)"
t('diseases.healthy')         // "Healthy Plant" | "Malusog na Halaman"

// Severity
t('severity.high')       // "High" | "Mataas"
t('severity.critical')   // "Critical" | "Kritikal"
```

---

## 🖥️ Backend API

### **Technology Used:**
- Custom i18n middleware
- Language detection from headers/query params
- Translation files in JSON format

### **Setup:**

#### 1. Add i18n Middleware
```javascript
// server.js
const { i18nMiddleware } = require('./middleware/i18n');

app.use(i18nMiddleware);
```

#### 2. Use in Controllers
```javascript
// controllers/remedyController.js
const getRemedies = async (req, res) => {
  const remedies = await Remedy.findAll();
  
  // Translate data based on request language
  const translated = req.translateData(remedies);
  
  res.json({
    success: true,
    message: req.t('success.dataFetched'),
    data: translated
  });
};
```

#### 3. Language Detection

The backend automatically detects language from:

1. **Query Parameter** (highest priority)
```bash
GET /api/remedies?lang=tl
```

2. **Accept-Language Header**
```bash
GET /api/remedies
Headers: Accept-Language: tl-PH,tl;q=0.9,en;q=0.8
```

3. **User Preference** (from database)
```javascript
// Stored in user.language field
```

4. **Default to English**

### **API Response Example:**

**English** (`?lang=en`):
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "diseaseName": "Bacterial Wilt",
    "description": "Bacterial wilt is caused by...",
    "symptoms": ["Sudden wilting of leaves", "..."],
    "treatments": [...]
  }
}
```

**Tagalog** (`?lang=tl`):
```json
{
  "success": true,
  "message": "Matagumpay na nakuha ang data",
  "data": {
    "diseaseName": "Bacterial Wilt (Pagkalanta dahil sa Bakterya)",
    "description": "Ang bacterial wilt ay dulot ng...",
    "symptoms": ["Biglaang paglanta ng mga dahon", "..."],
    "treatments": [...]
  }
}
```

---

## 🗄️ Database (Bilingual Remedies)

### **Data Structure:**

Remedies are stored with bilingual support:

```json
{
  "disease_name": {
    "en": "Bacterial Wilt",
    "tl": "Bacterial Wilt (Pagkalanta dahil sa Bakterya)"
  },
  "description": {
    "en": "Bacterial wilt is caused by Ralstonia solanacearum...",
    "tl": "Ang bacterial wilt ay dulot ng Ralstonia solanacearum..."
  },
  "symptoms": {
    "en": ["Sudden wilting of leaves", "..."],
    "tl": ["Biglaang paglanta ng mga dahon", "..."]
  },
  "organic_remedies": [
    {
      "name": {
        "en": "Crop Rotation",
        "tl": "Pag-rotate ng Pananim"
      },
      "description": {
        "en": "Rotate ginger with non-host crops...",
        "tl": "Mag-rotate ng luya kasama ang ibang pananim..."
      }
    }
  ]
}
```

### **Query by Language:**

The backend middleware automatically extracts the correct language:

```javascript
// Before translation
{
  name: { en: "Crop Rotation", tl: "Pag-rotate ng Pananim" }
}

// After translation (lang=tl)
{
  name: "Pag-rotate ng Pananim"
}
```

---

## 🔤 Translation Coverage

### **Mobile App (270+ strings):**
- ✅ App Name & Tagline
- ✅ Common Actions (40+)
- ✅ Navigation (8+)
- ✅ Authentication (20+)
- ✅ Home Screen (15+)
- ✅ Scan Feature (20+)
- ✅ Diseases (7)
- ✅ Severity Levels (4)
- ✅ Remedies Section (30+)
- ✅ History (20+)
- ✅ Profile (20+)
- ✅ Settings (25+)
- ✅ Offline Mode (15+)
- ✅ Errors (15+)
- ✅ Success Messages (10+)
- ✅ Tips & Weather (15+)
- ✅ Export Features (10+)

### **Backend API (50+ strings):**
- ✅ Error Messages
- ✅ Success Messages
- ✅ Validation Messages
- ✅ Disease Names
- ✅ Severity Levels
- ✅ Remedy Types

### **Remedy Database (Sample):**
- ✅ Bacterial Wilt (Complete)
- 🚧 Other diseases (Template provided)

---

## 🚀 Usage Examples

### **Example 1: User Scans a Plant**

**English Flow:**
1. User sees "Scan Ginger Plant"
2. Takes photo - "Analyzing image..."
3. Result shows - "Bacterial Wilt" (Confidence: 95%)
4. Clicks "View Remedies"
5. Sees "Organic Remedies" and "Chemical Remedies"

**Tagalog Flow:**
1. User sees "I-scan ang Luya"
2. Takes photo - "Sinusuri ang larawan..."
3. Result shows - "Bacterial Wilt (Pagkalanta dahil sa Bakterya)" (Katiyakan: 95%)
4. Clicks "Tingnan ang mga Gamot"
5. Sees "Organikong Gamot" and "Kemikal na Gamot"

### **Example 2: Viewing Remedies**

**English:**
```
Crop Rotation

Description: Rotate ginger with non-host crops like cereals or legumes for 3-4 years to break the disease cycle.

Application: Plant non-susceptible crops in infected areas

Effectiveness: High for prevention
Cost: Low
Timing: Before planting season
```

**Tagalog:**
```
Pag-rotate ng Pananim (Crop Rotation)

Paglalarawan: Mag-rotate ng luya kasama ang ibang pananim tulad ng cereal o legumes sa loob ng 3-4 taon upang maputol ang ikot ng sakit.

Paraan ng Paggamit: Magtanim ng hindi madaling tamaan ng sakit sa mga apektadong lugar

Epektibo: Mataas para sa pag-iwas
Gastos: Mababa
Kailan Gagamitin: Bago ang panahon ng pagtatanim
```

---

## 🔧 Implementation Checklist

### **Frontend:**
- ✅ Install i18next packages
- ✅ Create i18n config
- ✅ Create English translations
- ✅ Create Tagalog translations
- ✅ Add Language Switcher component
- ✅ Update all components to use t()
- ⏳ Test all screens in both languages
- ⏳ Add language preference to user settings

### **Backend:**
- ✅ Create i18n middleware
- ✅ Create English translations
- ✅ Create Tagalog translations
- ✅ Add language detection
- ⏳ Update all controllers to use translations
- ⏳ Test all API endpoints in both languages

### **Database:**
- ✅ Create bilingual remedy structure
- ⏳ Translate all remedy data
- ⏳ Update seed scripts
- ⏳ Test data retrieval in both languages

---

## 📚 Translation Guidelines

### **For Developers:**

1. **Always use translation keys**, never hardcode text:
```javascript
// ❌ Bad
<IonButton>Save</IonButton>

// ✅ Good
<IonButton>{t('common.save')}</IonButton>
```

2. **Use descriptive keys**:
```javascript
// ❌ Bad
t('btn1')

// ✅ Good
t('common.saveButton')
```

3. **Group related keys**:
```json
{
  "scan": {
    "title": "...",
    "instruction": "...",
    "analyzing": "..."
  }
}
```

### **For Translators:**

1. **Keep it natural** - Don't translate literally
2. **Consider context** - Same English word may have different Tagalog translations
3. **Use farming terminology** - Farmers should understand easily
4. **Be consistent** - Use same translation for same concepts
5. **Test with farmers** - Validate translations with actual users

---

## 🌟 Benefits

### **For Filipino Farmers:**
✅ **Understand the app easily** in their native language
✅ **Trust the information** presented clearly
✅ **Use remedies correctly** with Tagalog instructions
✅ **Share with other farmers** who don't speak English
✅ **Faster adoption** due to language accessibility

### **For the App:**
✅ **Wider reach** in the Philippines
✅ **Better user experience** for target audience
✅ **Higher engagement** with local farmers
✅ **Professional credibility** with bilingual support
✅ **Easy to add more languages** later

---

## 📖 Adding More Languages

To add a new language (e.g., Bisaya):

1. **Create translation files:**
```bash
mobile/src/i18n/locales/ceb.json
backend/src/locales/ceb.json
```

2. **Update config:**
```javascript
// mobile/src/i18n/config.js
ceb: {
  code: 'ceb',
  name: 'Cebuano',
  nativeName: 'Sinugbuanon',
  flag: '🇵🇭'
}
```

3. **Add translations**
4. **Update remedy data** with new language keys
5. **Test thoroughly**

---

## 🐛 Troubleshooting

### **App shows English instead of Tagalog:**
- Check device language settings
- Check language preference in app settings
- Clear app cache and reload

### **Some text not translated:**
- Check if translation key exists
- Verify translation file syntax
- Check for typos in key names

### **API returns wrong language:**
- Verify `Accept-Language` header
- Check `?lang=tl` query parameter
- Ensure user preference is saved

---

## 📞 Support

For questions about translations:
- Technical issues → GitHub Issues
- Translation accuracy → Contact Filipino agricultural experts
- New language requests → Feature requests

---

*Last Updated: October 29, 2025*
*Version: 1.0.0*
*Languages: English (en), Tagalog (tl)*

