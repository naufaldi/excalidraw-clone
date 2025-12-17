# RxDB Database Configuration

## Purpose

### User Story
**As a** frontend developer **I need to** configure RxDB database with IndexedDB storage **so that** the whiteboard application can persist board data locally and work offline-first, enabling seamless drawing operations and data persistence across sessions.

### Acceptance Criteria

#### Database Setup
- [ ] RxDB library installed in apps/frontend with IndexedDB adapter
- [ ] Database initialization module created (database.ts)
- [ ] Environment-specific configuration (dev/prod) working
- [ ] Database connection established on app startup
- [ ] Connection health check passes

#### Schema Definition
- [ ] Boards collection schema defined with TypeScript interfaces
- [ ] Elements collection schema defined with proper types
- [ ] Elements embedded in boards collection for atomic operations
- [ ] Schema validation working for all CRUD operations
- [ ] TypeScript types exported from packages/shared

#### Multi-Instance Support
- [ ] Multi-instance mode enabled for multi-tab synchronization
- [ ] Instance leader election configured
- [ ] Cross-tab communication working
- [ ] Database changes propagate across tabs

#### Testing & Validation
- [ ] Database connection test passes in development
- [ ] Schema validation tests passing
- [ ] CRUD operations tested and working
- [ ] Performance benchmarks meet requirements (<100ms for queries)
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)

#### Documentation
- [ ] Database schema documented in docs/
- [ ] Setup instructions added to README
- [ ] API documentation for database operations
- [ ] Migration guide for future schema changes

---

## Progress

**Status**: Planning Complete  
**Started**: 2025-12-17  
**Target Completion**: [To be set during implementation]  
**Current Phase**: Plan of Work

### Phase Breakdown
- **Phase 1**: Setup & Installation (Dependencies: Task 2)
- **Phase 2**: Schema Design (Dependencies: None)
- **Phase 3**: Implementation (Dependencies: Phase 1-2)
- **Phase 4**: Testing & Validation (Dependencies: Phase 3)
- **Phase 5**: Documentation (Dependencies: Phase 4)

---

## Decision Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2025-12-17 | Use IndexedDB adapter | Browser-native, no external dependencies, good performance | Required for offline-first V1 |
| 2025-12-17 | **DECIDED**: Hybrid Schema Approach | Start with embedded (V1-V3), migrate to referenced (V4) | Balances simplicity now with scalability later |
| 2025-12-17 | Enable multi-instance mode | Required for multi-tab support | Enables collaboration within same device |

---

## Schema Design Analysis

### Alternative 1: Embedded Elements (Current Plan)
**Structure**: Elements stored directly within board document

```typescript
Board {
  id: string;
  name: string;
  elements: Element[];  // Embedded array
  createdAt: Date;
  updatedAt: Date;
}
```

**Pros:**
✅ **Atomic operations** - Create/update/delete board affects all elements at once
✅ **Simple queries** - Single query to load entire board
✅ **Better performance** - No JOINs, no cross-collection lookups
✅ **Offline-friendly** - Complete board state in single document
✅ **Easier to implement** - Straightforward CRUD operations
✅ **No N+1 queries** - All data fetched in one request

**Cons:**
❌ **Large document size** - Thousands of elements bloat board document
❌ **Update overhead** - Changing one element requires updating entire board
❌ **Concurrency issues** - Two users updating different elements create conflicts
❌ **V4 complexity** - Real-time sync requires broadcasting entire board on each change
❌ **Memory usage** - Loading entire board even for small operations
❌ **Migration difficulty** - Must rewrite entire board for schema changes

**Best for**: V1 (offline-first, single user, small boards)

---

### Alternative 2: Referenced Elements (Normalized)
**Structure**: Separate collections for boards and elements with references

```typescript
Board {
  id: string;
  name: string;
  elementIds: string[];  // References to elements
  createdAt: Date;
  updatedAt: Date;
}

Element {
  id: string;
  boardId: string;  // Foreign key reference
  type: string;
  x: number;
  y: number;
  // ... other properties
  version: number;  // For optimistic locking
  updatedAt: Date;
}
```

**Pros:**
✅ **Scalable** - Can handle 10,000+ elements efficiently
✅ **Granular updates** - Modify single element without touching board
✅ **Better concurrency** - Multiple users can edit different elements
✅ **Efficient V4 sync** - Sync only changed elements
✅ **Memory efficient** - Load only needed elements
✅ **Flexible queries** - Query elements independently (e.g., "all rectangles")
✅ **Better indexing** - Index on type, boardId, etc.

**Cons:**
❌ **Complex queries** - Need JOINs or multiple queries
❌ **N+1 problem** - Loading board + all elements requires multiple queries
❌ **Offline complexity** - Must sync multiple collections
❌ **More code** - More complex CRUD logic
❌ **Transaction overhead** - Updating board + element requires transactions
❌ **Initial complexity** - Harder to implement correctly

**Best for**: V4 (real-time collaboration, large boards, many users)

---

### Alternative 3: Hybrid Approach (Recommended)
**Structure**: Elements embedded in V1-V3, referenced in V4 with migration strategy

```typescript
// V1-V3 Schema (IndexedDB)
Board {
  id: string;
  name: string;
  elements: Element[];  // Embedded for offline simplicity
  createdAt: Date;
  updatedAt: Date;
  version: number;  // For migration tracking
}

// V4 Schema (PostgreSQL)
Board {
  id: string;
  userId: string;
  name: string;
  dataVersion: string;  // 'embedded' | 'referenced'
  createdAt: Date;
  updatedAt: Date;
}

Element {
  id: string;
  boardId: string;
  // Same properties as embedded
  version: number;
  updatedAt: Date;
}
```

**Pros:**
✅ **V1 simplicity** - Easy to implement, offline-first works perfectly
✅ **V4 scalability** - Can migrate to referenced for real-time collaboration
✅ **Gradual evolution** - Don't over-engineer early
✅ **Clear migration path** - Version field tracks schema evolution
✅ **Best of both worlds** - Simple initially, scalable when needed

**Cons:**
❌ **Migration complexity** - Must migrate from embedded to referenced in V2
❌ **Technical debt** - Dual schema maintenance during transition
❌ **Data consistency** - Migration must be perfect or data loss
❌ **V2 complexity** - Replication harder with embedded schema

**Best for**: This project (evolving from offline to real-time)

---

## Schema Decision: Alternative 3 (Hybrid Approach)

### Why Hybrid Approach?

**1. Alignment with Project Evolution**
- V1 is offline-first single board → embedded is perfect
- V2 adds cloud sync → can maintain embedded during migration
- V3 multi-board → still works with embedded
- V4 real-time → migrate to referenced for collaboration

**2. Complexity Management**
- Don't solve V4 problems in V1
- Implement simplest thing that works for current requirements
- Evolve schema as needs evolve

**3. Performance Match**
- V1: <50 elements typical → embedded performance is fine
- V4: 1000+ elements → referenced becomes necessary
- Hybrid allows us to start simple, scale when needed

**4. Migration Strategy**
- Version field in board tracks schema evolution
- V2 migration can convert embedded → referenced
- Can maintain both schemas during transition period

### Final Schema Design

#### V1 Schema (IndexedDB - Current Implementation)
```typescript
// Board document (single source of truth)
interface Board {
  id: string;                    // Unique identifier
  name: string;                  // Board name
  elements: Element[];          // EMBEDDED elements array
  preferences?: {
    theme: 'light' | 'dark';
    gridEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  version: '1.0';               // Schema version for migration
}

// Element structure
interface Element {
  id: string;                    // Unique within board
  type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pen';
  x: number;                     // Position X
  y: number;                     // Position Y
  width?: number;                // Width (for shapes)
  height?: number;               // Height (for shapes)
  points?: Point[];              // For pen tool (freehand)
  text?: string;                 // For text tool
  fontSize?: number;             // For text
  angle?: number;                // Rotation
  strokeColor: string;           // Stroke color (#000000)
  fillColor: string;             // Fill color (#ffffff)
  strokeWidth: number;           // Line width (1-20)
  opacity: number;               // 0.0 - 1.0
  zIndex: number;                // Layer ordering
  createdAt: Date;
  updatedAt: Date;
}

interface Point {
  x: number;
  y: number;
}
```

#### V2 Schema (PostgreSQL - Cloud Sync)
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Boards table (V1 migration target)
CREATE TABLE boards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  data JSONB NOT NULL,           -- Contains V1 embedded schema
  schema_version VARCHAR DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_synced TIMESTAMP
);

-- Migration tracking
CREATE TABLE schema_migrations (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id),
  from_version VARCHAR,
  to_version VARCHAR,
  migrated_at TIMESTAMP DEFAULT NOW()
);
```

#### V3 Schema (PostgreSQL - Multi-Board)
```sql
-- Same as V2 with additions
ALTER TABLE boards ADD COLUMN template_type VARCHAR;
ALTER TABLE boards ADD COLUMN thumbnail_url VARCHAR;
ALTER TABLE boards ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Board templates (system-wide, not user-specific)
CREATE TABLE board_templates (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,        -- 'flowchart' | 'mindmap' | 'uml' | 'wireframe' | 'blank'
  thumbnail_url VARCHAR,
  template_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### V4 Schema (PostgreSQL + Redis - Real-Time)
```sql
-- Boards table (referenced elements)
CREATE TABLE boards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  schema_version VARCHAR DEFAULT '2.0',  -- '2.0' = referenced elements
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Elements table (normalized)
CREATE TABLE elements (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  width FLOAT,
  height FLOAT,
  points JSONB,                  -- For pen tool
  text TEXT,
  font_size INTEGER,
  angle FLOAT DEFAULT 0,
  stroke_color VARCHAR NOT NULL,
  fill_color VARCHAR NOT NULL,
  stroke_width INTEGER NOT NULL,
  opacity FLOAT NOT NULL,
  z_index INTEGER NOT NULL,
  version INTEGER DEFAULT 1,     -- For optimistic locking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Board collaborators (for sharing)
CREATE TABLE board_collaborators (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_elements_board_id ON elements(board_id);
CREATE INDEX idx_elements_type ON elements(type);
CREATE INDEX idx_elements_z_index ON elements(board_id, z_index);
```

**Redis (Ephemeral Session Data)**
```redis
# Session storage for real-time presence
session:{sessionId} = {
  boardId: string,
  userId: string,
  userName: string,
  cursorPosition: {x: number, y: number},
  currentTool: string,
  color: string,
  lastActive: timestamp
}

# Board presence tracking
board:{boardId}:users = Set<userId>
```

### Migration Path

**V1 → V2 (Embedded → PostgreSQL)**
1. Detect V1 boards in IndexedDB
2. Serialize embedded board data to JSONB
3. Upload to PostgreSQL `boards` table
4. Keep local IndexedDB as cache

**V2 → V4 (Embedded → Referenced)**
1. For each board with `schema_version = '1.0'`:
   - Read JSONB `data` field
   - Extract `elements` array
   - Insert each element into `elements` table
   - Update board `schema_version = '2.0'`
   - Clear `data` field (or keep for backup)

**Migration Validation**
- All elements must be present after migration
- Element counts must match
- Board metadata must be preserved
- User permissions must be maintained

---

## Surprises & Discoveries

### Technical Findings
- [ ] RxDB requires explicit schema validation configuration
- [ ] Multi-instance mode needs proper cleanup to avoid memory leaks
- [ ] IndexedDB has size limitations (typically 50% of available disk space)
- [ ] Browser compatibility varies for advanced RxDB features

### Architecture Decisions
- [ ] Shared schema types in packages/shared for consistency
- [ ] Database service layer pattern for testability
- [ ] Reactive queries for real-time UI updates

---

## Outcomes & Retrospective

### Success Metrics
- Database initialization < 500ms
- Query performance < 100ms for typical operations
- Zero data loss in offline scenarios
- Multi-tab synchronization working seamlessly

### Lessons Learned
- [ ] Schema migrations require careful planning
- [ ] Reactive queries can impact performance if overused
- [ ] Multi-instance coordination adds complexity but is necessary

### Future Considerations
- V2 migration strategy from embedded to referenced elements
- Performance optimization for large boards (1000+ elements)
- Backup/export strategy for user data

---

## Context

### Project Phase
**V1: Offline-First Single Board** - This task is part of the foundational infrastructure for the offline-first whiteboard application.

### Technical Context
- **Monorepo**: apps/excalidraw, packages/shared
- **Frontend Stack**: React 18 + TypeScript + Vite + TailwindCSS
- **Database**: RxDB + IndexedDB
- **Phase**: Core Infrastructure (Tasks 1-4)

### Implementation Plan Reference
**Task**: Task 4: RxDB Database Configuration
**Version**: V1
**Epic**: Core Infrastructure

### Dependencies
- **Prerequisites**: Task 2 (Project Setup) ✅ COMPLETED
- **Blocked By**: None
- **Blocks**: Task 5 (Canvas Component), Task 9 (Element State Management)

### Business Context
This database configuration is critical for:
1. **Offline Functionality**: Users must be able to work without internet
2. **Data Persistence**: Board data must survive page refreshes and browser restarts
3. **Performance**: Smooth drawing requires fast data operations
4. **Multi-Tab**: Users may have multiple tabs open simultaneously

---

## Plan of Work

### Implementation Strategy
**Approach**: Incremental implementation with validation at each step

**Pattern**: Setup → Schema → Service → Integration → Testing

**Architecture**:
```
apps/excalidraw/
  lib/
    database/
      database.ts       # Database initialization
      queries.ts        # Reactive queries
      mutations.ts      # CRUD operations
      shared/
        schema.ts       # Schema definitions
packages/shared/
  src/
    database/
      types.ts            # Shared type definitions
      schema.ts           # Shared schema definitions
```

### Risk Mitigation
1. **Browser Compatibility**: Test on all major browsers early
2. **Performance**: Benchmark queries with realistic data
3. **Schema Evolution**: Design flexible schema for future migrations
4. **Memory Leaks**: Implement proper cleanup in multi-instance mode

---

## Steps

### Step 1: Install RxDB and Dependencies
**Action**: Install RxDB with IndexedDB adapter in apps/excalidraw
**Validation**:
- [ ] Package installed successfully
- [ ] TypeScript types available
- [ ] No build errors

**Artifacts**:
- Updated package.json
- Updated pnpm-lock.yaml

### Step 2: Create Database Schema
**Action**: Define TypeScript interfaces and RxDB schemas for boards and elements
**Validation**:
- [ ] Schema types match requirements
- [ ] Schema validation configured
- [ ] Types exported from packages/shared

**Artifacts**:
- packages/shared/src/database/types.ts
- packages/shared/src/database/schema.ts
- apps/excalidraw/lib/database/shared/schema.ts

### Step 3: Implement Database Initialization
**Action**: Create database connection and initialization logic
**Validation**:
- [ ] Database connects successfully
- [ ] Collections created with proper schema
- [ ] Multi-instance mode enabled

**Artifacts**:
- apps/excalidraw/lib/database/database.ts
- Database configuration tests

### Step 4: Implement CRUD Operations
**Action**: Create service layer for board and element operations
**Validation**:
- [ ] All CRUD operations tested
- [ ] Reactive queries working
- [ ] Type safety verified

**Artifacts**:
- apps/excalidraw/lib/database/queries.ts
- apps/excalidraw/lib/database/mutations.ts
- Unit tests for database operations

### Step 5: Integration Testing
**Action**: Test database with React components
**Validation**:
- [ ] Components can read/write data
- [ ] Multi-tab synchronization works
- [ ] Performance benchmarks pass

**Artifacts**:
- Integration tests
- Performance benchmarks
- Browser compatibility report

### Step 6: Documentation
**Action**: Document database setup and usage
**Validation**:
- [ ] README updated
- [ ] API documentation complete
- [ ] Migration guide created

**Artifacts**:
- Updated README.md
- docs/database-schema.md
- docs/database-api.md

---

## Validation

### Testing Strategy

#### Unit Tests
- Database initialization
- Schema validation
- CRUD operations
- Error handling

#### Integration Tests
- React component integration
- Multi-tab synchronization
- Reactive queries

#### Performance Tests
- Query performance benchmarks
- Memory usage monitoring
- Large dataset handling

#### Browser Compatibility
- Chrome (latest - 1)
- Firefox (latest - 1)
- Safari (latest - 1)
- Edge (latest - 1)

### Success Criteria Checklist
- [ ] All acceptance criteria met
- [ ] Tests passing (100% pass rate)
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Code review approved
- [ ] No critical bugs

---

## Artifacts

### Deliverables
1. **Database Module** (`apps/excalidraw/lib/database/`)
   - database.ts - Initialization
   - queries.ts - Reactive queries
   - mutations.ts - CRUD operations
   - shared/schema.ts - Schema definitions

2. **Shared Types** (`packages/shared/src/database/`)
   - types.ts - TypeScript interfaces
   - schema.ts - Schema definitions

3. **Documentation**
   - README.md updates
   - docs/database-schema.md
   - docs/database-api.md

4. **Tests**
   - Unit tests for all database operations
   - Integration tests with React
   - Performance benchmarks

5. **Configuration**
   - Updated package.json dependencies
   - TypeScript configuration for RxDB
   - Environment configuration

### File Structure
```
/Users/mac/WebApps/projects/excalidraw-clone/
├── apps/excalidraw/
│   └── lib/
│       └── database/
│           ├── database.ts
│           ├── queries.ts
│           ├── mutations.ts
│           └── shared/
│               ├── schema.ts
│               ├── types.ts
│               └── index.ts
└── packages/shared/
    └── src/
        └── database/
            ├── types.ts
            └── schema.ts
```

### Related Documents
- Implementation Plan: `/docs/todo/plan.md`
- Architecture Rules: `/AGENTS.md`
- Project Setup: Task 2 (completed)

---

## Notes

### Important Considerations
1. **Offline-First**: This database is the single source of truth for V1
2. **No Backend Dependency**: Must work completely offline
3. **Type Safety**: Full TypeScript coverage required
4. **Performance**: Optimized for real-time drawing operations
5. **Scalability**: Design for 1000+ elements per board

### Future-Proofing
- Schema designed for V2 cloud sync migration
- Flexible element structure for new drawing tools
- Version field for schema migrations

### Dependencies Matrix
```
Task 2 (Project Setup) ────┐
                            ├─→ Task 4 (RxDB) ──→ Task 5 (Canvas)
Task 1 (Monorepo) ─────────┘                    └─→ Task 9 (State)
```
