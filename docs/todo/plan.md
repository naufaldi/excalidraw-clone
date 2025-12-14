# Real-Time Collaborative Whiteboard - Offline-First Roadmap

## Project Vision
Build a collaborative whiteboard that works **offline-first** using RxDB, then syncs with PostgreSQL backend for real-time collaboration.

**Why RxDB?**
- Built-in replication to PostgreSQL
- Reactive queries and real-time updates
- Conflict resolution out of the box
- Multi-tab synchronization
- Designed for offline-first applications

---

## Tech Stack Evolution

### V1: Offline-First (2 weeks)
```
Frontend Stack:
├── React 18 + TypeScript + Vite
├── RxDB - Reactive local database
├── RxJS - Reactive programming
├── Zustand - State management
└── TailwindCSS - UI styling

Why This Stack:
- RxDB: Local DB with PostgreSQL sync built-in
- RxJS: Reactive data flows (perfect for RxDB)
- Zustand: Lightweight state management
- Vite: Fast development and builds
```

### V2: Online Collaboration (2 weeks)
```
Full Stack:
├── Everything from V1
├── PostgreSQL - Primary database
├── Golang - API server
├── WebSocket - Real-time sync
├── Supabase or Custom API - Data replication
└── Caddy - Reverse proxy + HTTPS
```

---

## Development Roadmap

### 🎯 V1: Offline-First Whiteboard (2 weeks)

**Week 1: Foundation**
- [ ] Setup React + TypeScript + Vite
- [ ] Configure RxDB with IndexedDB
- [ ] Implement RxDB schema (boards, elements)
- [ ] Create reactive drawing canvas
- [ ] Add 5 basic tools (pen, rectangle, circle, text, line)

**Week 2: Core Features**
- [ ] Add undo/redo (50+ operations)
- [ ] Implement auto-save (debounced)
- [ ] Add color picker & style controls
- [ ] Create board management (create, list, delete)
- [ ] Add export (PNG, SVG)
- [ ] Implement offline detection UI

**RxDB Schema V1:**
```typescript
const whiteboardSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    elements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          rotation: { type: 'number' },
          data: { type: 'object' }
        }
      }
    },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  }
};
```

**Key Features:**
- ✅ Full offline capability (no internet required)
- ✅ Instant saves to local RxDB
- ✅ Reactive UI (auto-updates when data changes)
- ✅ Multi-tab support (RxDB handles sync)
- ✅ Large storage (IndexedDB = 5GB+)

---

### 🎯 V1.5: Enhanced Offline (1 week)
- [ ] Add 8 tools (arrow, square, eraser, selection)
- [ ] Flowchart templates (start/end, process, decision)
- [ ] Advanced editing (group, align, layers)
- [ ] Keyboard shortcuts
- [ ] Performance optimization
- [ ] Template gallery UI

---

### 🎯 V2: Online Collaboration (2 weeks)

**Week 1: Backend Setup**
- [ ] Setup PostgreSQL database
- [ ] Create Golang API server
- [ ] Design PostgreSQL schema
- [ ] Implement authentication (JWT)
- [ ] Setup RxDB replication to PostgreSQL

**Week 2: Real-time Features**
- [ ] Add WebSocket server (Golang)
- [ ] Implement RxDB replication conflicts
- [ ] Add user presence (cursors, colors)
- [ ] Real-time collaboration
- [ ] Cross-device sync
- [ ] Deploy with Caddy

**RxDB Replication V2:**
```typescript
// Configure replication with PostgreSQL
await database.addCollections({
  boards: {
    schema: whiteboardSchema,
    replicationHandler: new RxReplicationProtocol()
  }
});

// Setup replication
await database.syncWithCouchDB({
  remoteUrl: 'https://api.whiteboard.com/boards',
  auth: { username: 'user', password: 'pass' }
});
```

---

## Why RxDB is Perfect for This Project

### Advantages Over Dexie.js:

1. **Built-in PostgreSQL Sync**
   - RxDB has replication plugins for PostgreSQL
   - No need to build sync logic yourself
   - Automatic conflict resolution

2. **Reactive Architecture**
   - Queries are observable (auto-update UI)
   - Change streams (real-time updates)
   - Multi-tab synchronization

3. **Professional Features**
   - Change streams
   - Checkpointing
   - Batch processing
   - Performance optimization

4. **Production Ready**
   - Used in production apps
   - Well-documented
   - Active community

### RxDB Replication Flow:
```
┌─────────────┐
│   Local     │
│   RxDB      │
│ (IndexedDB) │
└──────┬──────┘
       │ Changes
       │ Replication
       ▼
┌─────────────┐
│  PostgreSQL │
│   Backend   │
└─────────────┘
```

---

## Data Migration Strategy

### Phase 1: V1 (Offline Only)
- All data stored in RxDB (IndexedDB)
- Users can create, edit, export boards
- Full functionality without internet

### Phase 2: V2 (Sync Enabled)
- Enable RxDB replication to PostgreSQL
- Existing V1 data automatically syncs
- Users can opt-in to cloud sync
- Keep offline mode as fallback

### Phase 3: V2 (Hybrid)
- Both local and cloud storage
- Auto-sync when online
- Work offline, sync when connected
- Conflict resolution built into RxDB

---

## File Structure

```
whiteboard/
├── apps/
│   ├── frontend/              # React + RxDB app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── database/      # RxDB setup
│   │   │   ├── services/      # API services
│   │   │   └── types/
│   │   └── package.json
│   └── backend/               # Golang API (V2)
├── packages/
│   └── shared/                # Shared types
└── infra/                     # Caddy, Docker
```

---

## RxDB Implementation Details

### Database Setup:
```typescript
import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageIndexedDB } from 'rxdb/plugins/storage-indexeddb';
import { replicateCouchDB } from 'rxdb/plugins/replication-couchdb';

const database = await createRxDatabase({
  name: 'whiteboard',
  storage: getRxStorageIndexedDB(),
  password: 'myPassword', // Optional encryption
  multiInstance: true,     // Multi-tab support
  eventReduce: true        // Performance
});

// Add collections
await database.addCollections({
  boards: { schema: boardSchema },
  elements: { schema: elementSchema }
});
```

### Reactive Queries:
```typescript
// Auto-updating query
const boards$ = database.boards
  .find()
  .$.pipe(
    // Auto-update when data changes
    // Multi-tab sync
  );

// Subscribe to changes
boards$.subscribe(boards => {
  // UI automatically updates
});
```

---

## Pros & Cons

### ✅ PROS

**Technical:**
- RxDB handles sync complexity
- Built-in conflict resolution
- Reactive queries (no manual state updates)
- Multi-tab support
- Production-tested

**Development:**
- Faster development (less custom sync code)
- Better code organization
- Easier testing
- Comprehensive documentation

**User Experience:**
- Works offline by default
- Instant responses
- Auto-sync when online
- No data loss

### ❌ CONS

**Bundle Size:**
- RxDB is larger than simple IndexedDB wrapper
- Adds ~200KB to bundle size

**Complexity:**
- More concepts to learn
- RxJS learning curve
- Replication setup complexity

**Migration:**
- Need to migrate from V1 local to V2 cloud
- But RxDB makes this easier!

---

## Success Metrics

### V1 Success:
- ✅ App works 100% offline
- ✅ Save/load < 100ms
- ✅ Undo/redo 50+ operations
- ✅ Support 1000+ elements smoothly
- ✅ Multi-tab works flawlessly

### V2 Success:
- ✅ Sync completes < 5 seconds
- ✅ Conflict resolution works
- ✅ Real-time collaboration < 100ms latency
- ✅ 10+ concurrent users per board
- ✅ Cross-device sync works

---

## Next Steps

1. **Setup V1** (This Week)
   ```bash
   # Create React app with RxDB
   npm create vite@latest whiteboard -- --template react-ts
   cd whiteboard
   npm install rxdb rxjs zustand
   ```

2. **Configure RxDB**
   - Setup IndexedDB storage
   - Define schema
   - Create database

3. **Build Drawing Canvas**
   - HTML5 Canvas with React
   - RxDB integration
   - Reactive updates

4. **Ship V1**
   - Deploy to Netlify/Vercel
   - Users can draw offline
   - Gather feedback

5. **Plan V2**
   - Add PostgreSQL backend
   - Enable RxDB replication
   - Build real-time features

---

## Why This Plan is Better

1. **Faster to Market** - V1 in 2 weeks (not 6!)
2. **Lower Risk** - Validate before building backend
3. **Better UX** - Works offline from day 1
4. **Tech Advantage** - Learn RxDB (valuable skill!)
5. **Cost Effective** - No server costs until V2

---

## Conclusion

**RxDB is the PERFECT choice** for this offline-first whiteboard:
- Built for this exact use case
- Handles PostgreSQL sync automatically
- Reactive architecture fits whiteboard perfectly
- Production-ready and well-supported

**GO WITH THIS PLAN!** 🚀
