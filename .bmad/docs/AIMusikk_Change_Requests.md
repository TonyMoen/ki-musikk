# AIMusikk - Change Requests & Implementation Guide

## 📋 Project Context
**Existing Project**: AIMusikk (Norwegian AI music generation platform)  
**Current Status**: Working prototype with basic song generation  
**Purpose of Changes**: UI/UX improvements, genre management, and AI-assisted prompt creation  
**Priority**: High - Core user experience improvements  

---

## 🎯 Change Request Summary

| ID | Change | Priority | Effort | Dependencies |
|----|--------|----------|--------|--------------|
| CR-001 | Update color scheme to Suno orange | High | 2h | None |
| CR-002 | Simplify genre grid to 2x2 layout | High | 4h | None |
| CR-003 | Add genre edit mode | Medium | 6h | CR-002 |
| CR-004 | Implement AI prompt assistant | High | 16h | None |
| CR-005 | Add genre library modal | Medium | 12h | CR-003, CR-004 |
| CR-006 | Add undo snackbar for deletions | Medium | 4h | CR-003 |
| CR-007 | Redesign lyrics section with tabs | Medium | 8h | None |
| CR-008 | Remove all emojis, use text only | Low | 2h | None |

**Total Estimated Effort**: ~54 hours (7-8 workdays)

---

## 🎨 CR-001: Update Color Scheme to Suno Orange

### Current State
- Primary color: Spotify green (#1DB954)
- Deep blue backgrounds

### Requested Changes
Replace all instances of:
```css
/* BEFORE */
--primary: #1DB954;
--primary-hover: #1ed760;
--bg: #050A1E; (deep blue)
--surface: #0B1121;

/* AFTER */
--primary: #FF6B35; (Suno orange)
--primary-hover: #FF8C61;
--bg: #0A0A0A; (dark gray/black)
--surface: #141414;
--surface-hover: #1E1E1E;
--elevated: #1A1A1A;
```

### Files to Update
- `styles/globals.css` or theme configuration
- Any hardcoded color values in components

### Testing
- [ ] Verify all active states use new orange
- [ ] Check contrast ratios (WCAG AA compliant)
- [ ] Test dark backgrounds on different screens

**Acceptance Criteria:**
- All primary actions (buttons, active states) use orange (#FF6B35)
- Background is dark gray/black, not blue
- No remaining green color references

---

## 📐 CR-002: Simplify Genre Grid to 2x2 Layout

### Current State
- 8 genres in 2x4 or horizontal scroll layout
- All genres always visible

### Requested Changes

**Update Genre Grid Component:**
```typescript
// BEFORE: 8 genres displayed
const defaultGenres = [
  'Country', 'Norsk pop', 'Folkeballade', 'Festlåt', 
  'Rap/Hip-Hop', 'Rockballade', 'Dans/Elektronisk', '+ Egendefinert'
]

// AFTER: 4 genres + custom button
const defaultGenres = [
  'Country', 'Norsk pop', 'Rap/Hip-Hop', 'Dans/Elektronisk'
]
```

**Layout:**
```css
.genre-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* Custom button spans full width */
.custom-genre-btn {
  grid-column: 1 / -1;
  border: 2px dashed var(--border-focus);
}
```

**Visual Changes:**
- Remove emoji icons from genre chips
- Increase padding: `20px 16px` (was smaller)
- Min-height: 70px per chip
- Font-size: 15px, weight: 700

### Files to Update
- `components/GenreSelector.tsx` (or similar)
- Genre grid styles

**Acceptance Criteria:**
- Only 4 genres visible by default in 2x2 grid
- "+ Legg til sjanger" button spans full width below
- No emojis on genre chips
- Responsive: maintains 2 columns on mobile

---

## ✏️ CR-003: Add Genre Edit Mode

### Current State
- Genres are static, cannot be removed from main view
- No management functionality

### Requested Changes

**Add "Rediger" button** in genre section header:
```tsx
<div className="section-header">
  <div className="section-label">Velg sjanger</div>
  <button 
    className={`edit-btn ${editMode ? 'active' : ''}`}
    onClick={toggleEditMode}
  >
    {editMode ? 'Ferdig' : 'Rediger'}
  </button>
</div>
```

**Edit Mode Behavior:**
1. When clicked, toggle `editMode` state
2. In edit mode:
   - Show red X button on each genre chip (top-right corner)
   - Disable genre selection (can't click to select)
   - Button text changes to "Ferdig"
   - Button gets active styling (orange background)
3. X button removes genre from grid
4. Removed genre triggers archive + snackbar (see CR-006)

**New Styles:**
```css
.edit-btn {
  background: transparent;
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 500px;
  font-size: 13px;
  font-weight: 600;
}

.edit-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.genre-chip .remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(255, 0, 0, 0.8);
  border-radius: 50%;
  display: none; /* Show only in edit mode */
}

.genre-chip.edit-mode .remove-btn {
  display: flex;
}
```

**State Management:**
```typescript
const [editMode, setEditMode] = useState(false);

const toggleEditMode = () => {
  setEditMode(!editMode);
};

const removeGenre = (genreId: string) => {
  if (!editMode) return;
  
  // Archive genre (see CR-005)
  archiveGenre(genreId);
  
  // Show snackbar (see CR-006)
  showSnackbar(`${genreName} arkivert`);
};
```

### Files to Update
- `components/GenreSelector.tsx`
- Genre state management
- Add edit mode styles

**Acceptance Criteria:**
- [ ] "Rediger" button toggles edit mode
- [ ] X buttons appear only in edit mode
- [ ] Cannot select genres while in edit mode
- [ ] Removing genre archives it (not permanent delete)
- [ ] Button text and styling update correctly

---

## 🤖 CR-004: Implement AI Prompt Assistant

### Current State
- "Egendefinert" opens simple text input
- No guidance on creating effective Suno prompts

### Requested Changes

**Replace custom genre dropdown with full modal assistant:**

**Component Structure:**
```tsx
<Modal 
  isOpen={assistantOpen} 
  onClose={closeAssistant}
  size="lg"
>
  <AssistantHeader />
  <ChatContainer messages={messages} />
  <InputContainer 
    onSend={sendMessage}
    placeholder={getPlaceholder(step)}
  />
  <Actions 
    onCancel={closeAssistant}
    onSave={saveGenre}
    saveDisabled={!isComplete}
  />
</Modal>
```

**Conversation Flow (5 steps):**

```typescript
const conversationFlow = [
  {
    step: 0,
    question: "Hva er hovedstilen eller sjangeren?",
    quickAnswers: ['70s rock', '80s synth-pop', 'Modern trap', 'Country ballad'],
    saveAs: 'mainGenre'
  },
  {
    step: 1,
    question: "Hvilke instrumenter skal dominere lyden?",
    quickAnswers: ['electric guitar', 'synthesizers', 'acoustic guitar', '808 bass', 'piano'],
    saveAs: 'instruments'
  },
  {
    step: 2,
    question: "Hvilken stemning eller energinivå?",
    quickAnswers: ['upbeat energetic', 'melancholic slow', 'aggressive intense', 'chill relaxed', 'dramatic emotional'],
    saveAs: 'mood'
  },
  {
    step: 3,
    question: "Noen spesifikke produksjonsdetaljer?",
    quickAnswers: ['heavy reverb', 'distorted', 'clean production', 'vintage analog', 'Hopp over'],
    saveAs: 'production',
    optional: true
  },
  {
    step: 4,
    question: "Vil du legge til noe mer spesifikt?",
    quickAnswers: ['male vocals', 'female vocals', 'fast tempo 140 bpm', 'slow tempo 70 bpm', 'Nei, ferdig'],
    saveAs: 'extras',
    optional: true
  }
];
```

**Prompt Generation:**
```typescript
const generateSunoPrompt = (responses: ConversationResponses) => {
  const parts = [
    responses.mainGenre,
    responses.instruments,
    responses.mood,
    responses.production !== 'Hopp over' ? responses.production : null,
    responses.extras !== 'Nei, ferdig' ? responses.extras : null
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Example output:
// "70s rock, electric guitar, upbeat energetic, heavy reverb, male vocals"
```

**After prompt generation (step 5):**
- Show generated prompt in bold
- Ask for genre name: "Gi denne sjangeren et enkelt navn (f.eks. '70s Rock'):"
- Enable "Lagre sjanger" button

**Data Structure:**
```typescript
interface CustomGenre {
  id: string;
  name: string; // User-provided name
  sunoPrompt: string; // Generated prompt
  createdAt: Date;
}
```

**Visual Design:**
```css
.ai-assistant-modal {
  /* Full-screen overlay */
  background: rgba(0, 0, 0, 0.9);
}

.assistant-content {
  background: var(--surface);
  border-radius: 16px;
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
}

.assistant-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  border-radius: 12px;
}

.message-ai {
  background: var(--elevated);
  padding: 14px 16px;
  border-radius: 12px;
}

.message-user {
  background: var(--primary);
  color: white;
  padding: 14px 16px;
  border-radius: 12px;
  margin-left: 40px;
}

.quick-answer-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 500px;
  font-size: 13px;
}
```

### Files to Create/Update
- `components/AIAssistant/Modal.tsx` (new)
- `components/AIAssistant/ChatMessage.tsx` (new)
- `components/AIAssistant/QuickAnswers.tsx` (new)
- `hooks/useAIAssistant.ts` (new)
- Update `GenreSelector.tsx` to open modal

**Acceptance Criteria:**
- [ ] Modal opens when clicking "+ Legg til sjanger"
- [ ] 5-step conversation flow works
- [ ] Quick answer buttons fill input and progress
- [ ] Can type free-form answers
- [ ] Generated Suno prompt is comma-separated
- [ ] User names genre at the end
- [ ] Saved genre appears in grid with name + hidden prompt
- [ ] Genre chip has `data-prompt` attribute for later use

---

## 📚 CR-005: Add Genre Library Modal

### Current State
- Deleted genres disappear permanently
- No way to view/manage genres

### Requested Changes

**Add library button in header:**
```tsx
<header>
  <Logo />
  <div className="header-actions">
    <button className="library-btn" onClick={openLibrary}>
      📚
    </button>
    <Credits />
  </div>
</header>
```

**Library Modal Structure:**
```tsx
<Modal isOpen={libraryOpen} onClose={closeLibrary} size="xl">
  <LibraryHeader title="Sjanger-bibliotek" />
  
  <SearchBar 
    placeholder="Søk etter sjanger..." 
    onChange={filterGenres}
  />
  
  <Tabs>
    <Tab label="Aktive" badge={activeCount}>
      <GenreList 
        genres={activeGenres}
        actions={['Arkiver']}
        onAction={archiveGenre}
      />
    </Tab>
    
    <Tab label="Arkiverte" badge={archivedCount}>
      <GenreList 
        genres={archivedGenres}
        actions={['Gjenopprett', 'Slett permanent']}
        onAction={handleArchivedAction}
      />
    </Tab>
    
    <Tab label="Standard" badge="8">
      <GenreList 
        genres={standardTemplates}
        actions={['Legg til']}
        onAction={addStandardGenre}
      />
    </Tab>
  </Tabs>
</Modal>
```

**Genre Card in Library:**
```tsx
<div className="genre-library-item">
  <div className="genre-item-header">
    <h4 className="genre-item-name">{name}</h4>
    <div className="genre-item-actions">
      {actions.map(action => (
        <button 
          key={action}
          className={`genre-action-btn ${action.includes('Slett') ? 'danger' : ''}`}
          onClick={() => onAction(action, genreId)}
        >
          {action}
        </button>
      ))}
    </div>
  </div>
  
  <div className="genre-item-prompt">
    {sunoPrompt}
  </div>
  
  <div className="genre-item-meta">
    <span>{status}</span>
    {archivedAt && <span>Arkivert {formatDate(archivedAt)}</span>}
  </div>
</div>
```

**Standard Genre Templates (hardcoded):**
```typescript
const standardGenres: Genre[] = [
  {
    name: 'Classic Rock',
    prompt: 'classic rock, electric guitar, drums, bass, powerful vocals, 70s style'
  },
  {
    name: 'Chill Lofi',
    prompt: 'lofi hip hop, chill beats, mellow piano, vinyl crackle, relaxed atmosphere'
  },
  {
    name: 'Epic Orchestral',
    prompt: 'cinematic orchestral, strings, brass, epic drums, dramatic, movie soundtrack'
  },
  {
    name: 'Indie Folk',
    prompt: 'indie folk, acoustic guitar, soft vocals, organic sound, intimate atmosphere'
  },
  {
    name: 'Synthwave',
    prompt: '80s synthwave, retro synthesizers, electronic drums, neon atmosphere, nostalgic'
  },
  {
    name: 'Jazz Smooth',
    prompt: 'smooth jazz, saxophone, piano, upright bass, sophisticated, lounge atmosphere'
  },
  {
    name: 'EDM Banger',
    prompt: 'edm, heavy bass drops, synth leads, high energy, festival anthem, 128 bpm'
  },
  {
    name: 'Acoustic Ballad',
    prompt: 'acoustic ballad, fingerstyle guitar, emotional vocals, intimate, slow tempo'
  }
];
```

**State Management:**
```typescript
interface GenreLibraryState {
  activeGenres: Genre[]; // Shown in main grid
  archivedGenres: Genre[]; // Removed but recoverable
  searchQuery: string;
}

const archiveGenre = (genreId: string) => {
  const genre = activeGenres.find(g => g.id === genreId);
  if (!genre) return;
  
  setArchivedGenres([...archivedGenres, {
    ...genre,
    archivedAt: new Date()
  }]);
  
  setActiveGenres(activeGenres.filter(g => g.id !== genreId));
};

const restoreGenre = (genreId: string) => {
  const genre = archivedGenres.find(g => g.id === genreId);
  if (!genre) return;
  
  setActiveGenres([...activeGenres, genre]);
  setArchivedGenres(archivedGenres.filter(g => g.id !== genreId));
};

const permanentDelete = (genreId: string) => {
  if (!confirm('Er du sikker på at du vil slette permanent?')) return;
  setArchivedGenres(archivedGenres.filter(g => g.id !== genreId));
};
```

**Search Functionality:**
```typescript
const filterGenres = (query: string) => {
  const lowerQuery = query.toLowerCase();
  
  return genres.filter(genre => 
    genre.name.toLowerCase().includes(lowerQuery) ||
    genre.sunoPrompt.toLowerCase().includes(lowerQuery)
  );
};
```

### Files to Create/Update
- `components/GenreLibrary/Modal.tsx` (new)
- `components/GenreLibrary/GenreCard.tsx` (new)
- `components/GenreLibrary/Tabs.tsx` (new)
- `hooks/useGenreLibrary.ts` (new)
- Add library button to header
- Update genre state to support archiving

**Acceptance Criteria:**
- [ ] Library button opens modal with 3 tabs
- [ ] Aktive tab shows genres currently in main grid
- [ ] Arkiverte tab shows removed genres with restore option
- [ ] Standard tab shows 8 pre-made templates
- [ ] Search filters across all visible genres
- [ ] "Gjenopprett" moves genre back to main grid
- [ ] "Slett permanent" requires confirmation
- [ ] "Legg til" from Standard adds to main grid
- [ ] Badge counts update dynamically

---

## 🔔 CR-006: Add Undo Snackbar for Deletions

### Current State
- Removing genres is immediate with no undo
- Easy to accidentally delete

### Requested Changes

**Add Snackbar Component:**
```tsx
<div className={`snackbar ${visible ? 'show' : ''}`}>
  <div className="snackbar-text">{message}</div>
  <button className="snackbar-action" onClick={onUndo}>
    Angre
  </button>
</div>
```

**Behavior:**
- Appears at bottom-center of screen
- Slides up from `bottom: -80px` to `bottom: 24px`
- Shows for 5 seconds then auto-dismisses
- Only one snackbar visible at a time
- Clicking "Angre" immediately restores genre

**Styles:**
```css
.snackbar {
  position: fixed;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--elevated);
  border: 1px solid var(--border);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 150;
  transition: bottom 0.3s ease;
  max-width: 400px;
}

.snackbar.show {
  bottom: 24px;
}

.snackbar-action {
  background: var(--primary);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
```

**Hook Implementation:**
```typescript
const useSnackbar = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [undoCallback, setUndoCallback] = useState<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const show = (msg: string, onUndo: () => void) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage(msg);
    setUndoCallback(() => onUndo);
    setVisible(true);

    // Auto-dismiss after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setUndoCallback(null);
    }, 5000);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
    setUndoCallback(null);
  };

  const handleUndo = () => {
    if (undoCallback) {
      undoCallback();
    }
    hide();
  };

  return { visible, message, show, hide, handleUndo };
};
```

**Integration with Genre Removal:**
```typescript
const removeGenre = (genreId: string) => {
  const genre = activeGenres.find(g => g.id === genreId);
  if (!genre) return;

  // Save reference for undo
  const removedGenre = genre;

  // Archive genre
  archiveGenre(genreId);

  // Show snackbar with undo callback
  showSnackbar(
    `${genre.name} arkivert`,
    () => restoreGenre(genreId)
  );
};
```

### Files to Create/Update
- `components/Snackbar.tsx` (new)
- `hooks/useSnackbar.ts` (new)
- Update `GenreSelector.tsx` to show snackbar on remove

**Acceptance Criteria:**
- [ ] Snackbar appears when genre is removed
- [ ] Shows genre name in message
- [ ] "Angre" button restores genre immediately
- [ ] Auto-dismisses after 5 seconds
- [ ] Smooth slide-up animation
- [ ] Only one snackbar at a time
- [ ] Snackbar above other content (z-index: 150)

---

## 📝 CR-007: Redesign Lyrics Section with Tabs

### Current State
- Single textarea for lyrics
- No distinction between AI generation and custom lyrics
- Small, cramped interface

### Requested Changes

**Replace with tabbed interface:**

```tsx
<div className="lyrics-section">
  <div className="section-label">Sangtekst</div>
  
  <div className="lyrics-tabs">
    <button 
      className={`lyrics-tab ${mode === 'ai' ? 'active' : ''}`}
      onClick={() => setMode('ai')}
    >
      AI Genererer
    </button>
    <button 
      className={`lyrics-tab ${mode === 'own' ? 'active' : ''}`}
      onClick={() => setMode('own')}
    >
      Egen tekst
    </button>
  </div>

  {mode === 'ai' ? (
    <AIGenerateTab />
  ) : (
    <OwnLyricsTab />
  )}
</div>
```

**AI Generate Tab:**
```tsx
<div className="ai-generate-section">
  <div className="prompt-label">
    Beskriv hva sangen skal handle om
  </div>
  
  <textarea
    className="prompt-input"
    placeholder="F.eks: En bursdagssang til Per som alltid kommer for sent og snakker om båten sin..."
    rows={4}
  />

  <div className="prompt-label">Eller velg en mal:</div>
  
  <div className="prompt-templates">
    <button onClick={() => fillTemplate('birthday')}>
      Bursdagssang
    </button>
    <button onClick={() => fillTemplate('love')}>
      Kjærlighetssang
    </button>
    <button onClick={() => fillTemplate('party')}>
      Festlåt
    </button>
    <button onClick={() => fillTemplate('motivation')}>
      Motivasjonssang
    </button>
  </div>

  <div className="ai-info">
    💡 AI lager både melodi og tekst basert på din beskrivelse. 
    Jo mer detaljer, jo bedre resultat!
  </div>
</div>
```

**Template Prompts:**
```typescript
const templates = {
  birthday: 'En morsom bursdagssang til en venn som...',
  love: 'En romantisk kjærlighetssang om...',
  party: 'En energisk festlåt som handler om...',
  motivation: 'En inspirerende sang som motiverer til...'
};
```

**Own Lyrics Tab:**
```tsx
<div className="own-lyrics-section">
  <textarea
    className="lyrics-textarea"
    placeholder="Skriv din egen sangtekst her...

Vers 1:
I morges våkna jeg
Og tenkte på deg

Refreng:
Du er min..."
    rows={12}
    maxLength={1000}
  />
  
  <div className="lyrics-counter">
    <span className={charCount > 900 ? 'warning' : ''}>
      {charCount}
    </span> / 1000 tegn
  </div>
</div>
```

**Tab Styles:**
```css
.lyrics-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: var(--elevated);
  padding: 4px;
  border-radius: 8px;
}

.lyrics-tab {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lyrics-tab.active {
  background: var(--surface);
  color: var(--text-primary);
}
```

### Files to Update
- `components/LyricsSection.tsx` 
- Split into `AIGenerateTab.tsx` and `OwnLyricsTab.tsx`
- Add tab styles

**Acceptance Criteria:**
- [ ] Two tabs: "AI Genererer" and "Egen tekst"
- [ ] AI tab has description field + 4 template buttons
- [ ] Own lyrics tab has large textarea (280px min-height)
- [ ] Character counter shows 0/1000
- [ ] Counter turns orange at 900 characters
- [ ] Template buttons fill prompt field
- [ ] Info box explains AI capability
- [ ] Active tab has highlighted background

---

## 🚫 CR-008: Remove All Emojis

### Current State
- Emojis used in:
  - Logo (🎵)
  - Genre chips (🎸 🎤 etc.)
  - Song covers (🎸 🎤 etc.)
  - Generate button (🎵 Lag sang)
  - AI assist button (✨ AI-hjelp)

### Requested Changes

**Replace all emojis with text/styled elements:**

1. **Logo**: Replace 🎵 with "AI" text in orange box
```tsx
<div className="logo-icon">AI</div>
```

2. **Genre chips**: Remove emojis, just show text
```tsx
// BEFORE
<div className="genre-icon">🎸</div>
<div className="genre-name">Country</div>

// AFTER  
<div className="genre-name">Country</div>
```

3. **Song covers**: Replace emojis with first letter of title
```tsx
// BEFORE
<div className="song-cover">🎸</div>

// AFTER
<div className="song-cover">J</div> // For "Juleavgre-Hørlighet"
```

4. **Buttons**: Remove emoji prefixes
```tsx
// BEFORE
<button>🎵 Lag sang</button>
<button>✨ AI-hjelp</button>

// AFTER
<button>Lag sang</button>
<button>AI-hjelp</button>
```

5. **Library button**: Keep 📚 (only exception, or replace with "LIB" text)

**Update Styles:**
```css
.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 8px; /* Square corners, not circle */
  font-size: 16px;
  font-weight: 800;
  color: white;
}

.song-cover {
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 800;
}

.genre-chip {
  /* Remove icon spacing */
  padding: 20px 16px;
  justify-content: center; /* Center text */
}
```

### Files to Update
- `components/Header.tsx` - Logo
- `components/GenreSelector.tsx` - Genre chips  
- `components/SongCard.tsx` - Song covers
- `components/LyricsSection.tsx` - AI assist button
- `components/GenerateButton.tsx` - Generate button

**Acceptance Criteria:**
- [ ] No emojis in UI (except library button if kept)
- [ ] Logo shows "AI" text
- [ ] Genre chips show only text labels
- [ ] Song covers show first letter of title
- [ ] All buttons are text-only
- [ ] Visual hierarchy maintained through typography

---

## 🔧 Implementation Guide

### Phase 1: Visual Updates (Day 1-2)
1. CR-001: Update color scheme ✅
2. CR-008: Remove emojis ✅
3. CR-002: Simplify genre grid ✅

**Why this order?**  
Foundation changes that affect everything else.

### Phase 2: Genre Management (Day 3-4)
4. CR-003: Add edit mode ✅
5. CR-006: Add snackbar ✅

**Why this order?**  
Edit mode needs snackbar for good UX.

### Phase 3: Advanced Features (Day 5-7)
6. CR-004: AI prompt assistant ✅
7. CR-005: Genre library ✅

**Why this order?**  
AI assistant creates genres that library manages.

### Phase 4: Lyrics Improvements (Day 8)
8. CR-007: Redesign lyrics section ✅

**Why last?**  
Independent feature, no dependencies.

---

## 🧪 Testing Checklist

### Visual Regression Testing
- [ ] Compare screenshots before/after for each page
- [ ] Test on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Verify color contrast ratios
- [ ] Check dark mode consistency

### Functionality Testing
- [ ] Can create custom genre via AI assistant
- [ ] Can edit/remove genres in edit mode
- [ ] Can undo genre removal within 5 seconds
- [ ] Can restore archived genres from library
- [ ] Search in library filters correctly
- [ ] Standard templates can be added
- [ ] Tabs switch correctly in lyrics section
- [ ] Character counter updates in real-time
- [ ] Template buttons fill lyrics field

### Edge Cases
- [ ] What happens with 0 active genres?
- [ ] What if user has 20+ custom genres?
- [ ] What if genre name is very long?
- [ ] What if Suno prompt exceeds max length?
- [ ] What if user spams undo button?
- [ ] What if library has no archived genres?

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 📦 Deliverables

### Code
- [ ] All 8 change requests implemented
- [ ] Unit tests for new components
- [ ] Integration tests for flows
- [ ] Updated component documentation

### Documentation
- [ ] Updated README with new features
- [ ] API documentation (if backend changes)
- [ ] Component Storybook entries
- [ ] User guide updates

### Design
- [ ] Updated Figma files (if applicable)
- [ ] Design system tokens updated
- [ ] Screenshot gallery of new UI

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Genre limit**: No hard limit on number of genres (should we add one?)
2. **Prompt validation**: No validation on Suno prompt length/format
3. **Offline mode**: Archived genres lost on page refresh (needs persistence)
4. **Undo timing**: 5 seconds might be too short for some users

### Future Improvements
1. **LocalStorage**: Persist archived genres
2. **Drag & drop**: Reorder genres in main grid
3. **Genre sharing**: Export/import genre libraries
4. **Prompt preview**: Test Suno prompt before saving
5. **Batch operations**: Archive multiple genres at once

---

## 💬 Questions for Clarification

1. **Genre persistence**: Should archived genres persist across sessions? (LocalStorage, database, or session-only?)
2. **Genre limit**: Maximum number of active genres allowed?
3. **AI assistant**: Should we save conversation history for reference?
4. **Library button**: Keep 📚 emoji or replace with text "LIB"?
5. **Undo duration**: Is 5 seconds appropriate or should it be configurable?
6. **Standard templates**: Are these 8 final or should they be configurable?
7. **Search**: Should search be fuzzy or exact match?
8. **Mobile nav**: Any specific mobile navigation considerations?

---

## 📞 Support

**Questions during implementation?**
- Slack channel: #aimusikk-dev
- Design questions: @designer
- Product questions: @product-owner
- Technical blockers: @tech-lead

**Review process:**
- Create PR per change request (CR-001, CR-002, etc.)
- Tag reviewer in PR description
- Update this document with "✅ Completed" when merged

---

**Document Version**: 1.0  
**Created**: 2026-01-15  
**Status**: Ready for Implementation  
**Estimated Completion**: 8 working days