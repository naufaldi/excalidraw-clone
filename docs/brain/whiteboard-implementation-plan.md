# Real-Time Collaborative Whiteboard API
## Detailed Implementation Plan - Monorepo with Golang Backend + React Vite Frontend

### Project Overview

Build a production-ready real-time collaborative whiteboard using a **monorepo architecture** with **moonrepo workspace management**. The backend uses **Golang** for high-performance real-time communication, and the frontend uses **React with Vite** for fast development and excellent user experience.

This implementation follows a **5-milestone progressive approach**, starting with a feature-rich single-user whiteboard and incrementally adding real-time collaboration, authentication, and advanced features.

### Core Value Proposition

- **Real-time Collaboration**: Sub-100ms latency for all drawing operations
- **Scalable Architecture**: Support 1000+ concurrent users across multiple whiteboards
- **Persistent State**: All changes are saved and can be restored
- **Conflict Resolution**: Handle concurrent edits gracefully
- **Multi-format Export**: Export to PNG, SVG, PDF, JSON
- **Version History**: Track and restore previous versions of whiteboards

---

## 🎯 Implementation Strategy: 5 Milestones

This project follows a **step-by-step milestone approach** to ensure steady progress and continuous learning:

### 📋 Milestone Overview

| Milestone | Duration | Goal | Tech Stack |
|-----------|----------|------|------------|
| **M1** | 1 week | Single-User Whiteboard | Frontend + localStorage |
| **M2** | 1.5 weeks | Multi-User Real-Time | Golang + WebSocket |
| **M3** | 1 week | User Authentication | JWT + User Management |
| **M4** | 1 week | Database Persistence | PostgreSQL + Auto-save |
| **M5** | 1.5 weeks | Advanced Features | Export + History + Comments |

**Total Timeline: 6 weeks**

---

## 1. Technology Stack

### Monorepo Management
- **moonrepo** - Fast, modern monorepo tool for managing multiple projects
- **Workspace-based** architecture with shared dependencies and types

### Backend Framework
- **Golang** with **Gin Framework** - Fast, lightweight HTTP web framework
- **Gorilla WebSocket** - Robust WebSocket implementation
- **GORM** - Object-Relational Mapping for database operations
- **PostgreSQL** for persistent storage with JSONB support
- **JWT-Go** for authentication
- **Viper** for configuration management

### Real-time Infrastructure
- **Native WebSocket** (Gorilla WebSocket)
- **Redis Pub/Sub** for horizontal scaling (added in Milestone 4+)

### Database Schema
- **PostgreSQL** for relational data with JSONB for flexible element storage
- **Migration tool** for schema management

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool and development server
- **HTML5 Canvas** for drawing
- **WebSocket API** for real-time communication (Milestone 2+)

### Shared Packages
- **packages/shared** - Common TypeScript types, utilities, and constants

### Deployment
- **Docker** for containerization
- **Caddy** for reverse proxy and automatic HTTPS
- **CloudFlare** for CDN and DDoS protection
- **Kubernetes** for orchestration (added when scaling beyond single VPS)

---

## 2. System Architecture

### Monorepo Structure

```
whiteboard/
├── moon.yml                         # moonrepo configuration
├── apps/
│   ├── backend/                     # Golang API server
│   │   ├── cmd/
│   │   ├── internal/
│   │   ├── migrations/
│   │   ├── go.mod
│   │   └── Dockerfile
│   └── frontend/                    # React + Vite frontend
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── vite.config.ts
│       └── Dockerfile
├── packages/
│   └── shared/                      # Shared TypeScript types
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
└── infra/                           # Infrastructure configs
    ├── Caddyfile                    # Caddy reverse proxy
    └── docker-compose.yml           # Local development
```

### Overall Architecture (Milestone 1-2)

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
│        (React + TypeScript + HTML5 Canvas)                 │
└────────────┬──────────────────────────────────┬─────────────┘
             │                                  │
             │ HTTP / WebSocket                │
             ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Reverse Proxy                              │
│                     (Caddy)                                 │
└────────────┬──────────────────────────────────┬─────────────┘
             │                                  │
             │                                  │
┌────────────▼──────────────────┬─────────────────────────────┐
│    WebSocket Server           │      REST API Server        │
│  (Golang + Gorilla/WS)        │      (Golang + Gin)         │
│     [Milestone 2+]            │                             │
└────────────┬──────────────────┴─────────────────────────────┘
             │
             │ Database Operations
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────┐                                        │
│  │ PostgreSQL   │                                        │
│  │ (Primary DB) │                                        │
│  └──────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Scaled Architecture (Milestone 4+)

```
┌─────────────────────────────────────────────────────────────┐
│                  CloudFlare CDN                             │
│             (DDoS Protection + SSL)                         │
└────────────┬──────────────────────────────────┬─────────────┘
             │                                  │
             │                                  │
┌────────────▼──────────────────┬─────────────────────────────┐
│         Load Balancer         │       Caddy Servers         │
│      (Multiple Instances)     │     (Auto-scaling)          │
└────────────┬──────────────────┴─────────────────────────────┘
             │
             │ Redis Pub/Sub (for multi-instance sync)
             ▼
┌─────────────────────────────────────────────────────────────┐
│             Application Layer (Multiple Instances)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Backend #1│ │Backend #2│ │Backend #3│ │Backend #4│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Database Operations
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ PostgreSQL   │  │    Redis     │  │   File Store │       │
│  │ (Primary +   │  │   (Pub/Sub)  │  │     (S3)     │       │
│  │  Replicas)   │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Backend Structure (apps/backend/)

```
apps/backend/
├── cmd/
│   └── main.go                     # Application entry point
├── internal/
│   ├── handlers/                   # HTTP handlers
│   │   ├── auth.go                 # Authentication endpoints (M3+)
│   │   ├── board.go                # Board management
│   │   ├── websocket.go            # WebSocket handlers (M2+)
│   │   └── comments.go             # Comments API (M5)
│   ├── middleware/                 # HTTP middleware
│   │   ├── auth.go                 # JWT authentication (M3+)
│   │   ├── cors.go                 # CORS handling
│   │   └── rate_limit.go           # Rate limiting (M3+)
│   ├── models/                     # Data models
│   │   ├── user.go                 # User model (M3+)
│   │   ├── board.go                # Board model
│   │   ├── element.go              # Element model
│   │   └── comment.go              # Comment model (M5)
│   ├── services/                   # Business logic
│   │   ├── auth_service.go         # Authentication logic (M3+)
│   │   ├── board_service.go        # Board operations
│   │   └── websocket_service.go    # WebSocket management (M2+)
│   ├── hub/                        # WebSocket hub (M2+)
│   │   └── hub.go                  # Connection management
│   ├── repository/                 # Data access layer
│   │   ├── user_repo.go            # User database operations (M3+)
│   │   ├── board_repo.go           # Board database operations
│   │   └── element_repo.go         # Element database operations
│   └── websocket/                  # WebSocket utilities (M2+)
│       └── connection.go           # Connection handling
├── migrations/                     # Database migrations
├── pkg/                            # Internal packages
│   ├── config/                     # Configuration
│   └── utils/                      # Utilities
├── go.mod
├── go.sum
└── Dockerfile
```

### Frontend Structure (apps/frontend/)

```
apps/frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/                 # React components
│   │   ├── Canvas/
│   │   │   ├── Canvas.tsx          # Main drawing canvas
│   │   │   ├── Toolbar.tsx         # Drawing tools
│   │   │   ├── ColorPicker.tsx     # Color selection
│   │   │   └── Templates/          # Flowchart templates
│   │   ├── Board/
│   │   │   └── BoardView.tsx       # Main board component
│   │   └── UI/
│   │       ├── Button.tsx
│   │       └── Modal.tsx
│   ├── hooks/                      # Custom React hooks
│   │   ├── useDrawing.ts           # Drawing state management
│   │   ├── useBoard.ts             # Board operations (M2+)
│   │   ├── useWebSocket.ts         # WebSocket hook (M2+)
│   │   └── useAutoSave.ts          # Auto-save functionality (M4+)
│   ├── services/                   # API services
│   │   ├── api.ts                  # REST API client
│   │   └── websocket.ts            # WebSocket client (M2+)
│   ├── types/                      # TypeScript types
│   │   └── whiteboard.ts           # Shared types (re-exported)
│   ├── utils/                      # Utility functions
│   │   ├── canvas.ts               # Canvas utilities
│   │   ├── geometry.ts             # Geometry calculations
│   │   └── templates.ts            # Template generators
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

### Shared Package (packages/shared/)

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── element.ts              # Element type definitions
│   │   ├── board.ts                # Board type definitions
│   │   ├── user.ts                 # User type definitions (M3+)
│   │   └── index.ts                # Re-exports
│   ├── constants/
│   │   ├── tools.ts                # Tool definitions
│   │   ├── colors.ts               # Color palettes
│   │   └── templates.ts            # Flowchart template configs
│   └── utils/
│       ├── geometry.ts             # Shared geometry utilities
│       └── validation.ts           # Type validation
├── package.json
├── tsconfig.json
└── tsup.config.ts                   # Build configuration
```

---

## 3. Core Features

### 3.1 Basic Drawing Tools (Milestone 1)
- **Freehand Drawing**: Pen tool with smooth curves and pressure sensitivity
- **Shapes**: Rectangle, circle, square, line, arrow
- **Text Tool**: Add, edit, and format text with various fonts and sizes
- **Selection Tools**: Select, multi-select, lasso select
- **Transformations**: Move, resize, rotate, duplicate, delete
- **Style Controls**: Color picker (stroke & fill), stroke width, opacity, line style
- **Grid & Snap**: Optional grid with snap-to-grid functionality

### 3.2 Flowchart Templates (Milestone 1)
- **Start/End**: Rounded rectangle with "Start" or "End" text
- **Process**: Rectangle for process steps
- **Decision**: Diamond shape for yes/no decisions
- **Data**: Parallelogram for data input/output
- **Document**: Rectangle with wave bottom for documents
- **Connector**: Arrow lines with connection points
- **Template Gallery**: Pre-built flowchart templates (Flowchart, Mind Map, UML, etc.)
- **Quick Insert**: Drag-and-drop template insertion

### 3.3 Advanced Drawing Features (Milestone 1)
- **Layers**: Z-index management for element ordering
- **Grouping**: Group/ungroup multiple elements
- **Locking**: Lock elements to prevent accidental edits
- **Copy/Paste**: Duplicate elements across boards
- **Alignment Tools**: Align elements (left, right, center, distribute)
- **Undo/Redo**: Complete operation history (50+ steps)

### 3.4 Real-time Collaboration (Milestone 2+)
- **Live Cursors**: Show all users' cursor positions with colors
- **User Presence**: See who's currently editing
- **Live Updates**: Instant synchronization of all changes (<100ms)
- **User Avatars**: Visual indicators for each collaborator
- **Pointer Types**: Show what tool each user is using
- **Conflict Resolution**: Handle simultaneous edits gracefully

### 3.5 Collaboration Features (Milestone 3+)
- **Comments**: Add comments to specific elements or positions
- **Mentions**: @mention other users in comments
- **Presence Indicators**: Show users in read-only or editing mode
- **Locking**: Lock elements to prevent accidental edits
- **User Permissions**: Owner, editor, viewer roles
- **Version Control**: History timeline with snapshots

### 3.6 Export & Import (Milestone 5)
- **Export Formats**: PNG, SVG, PDF, JSON
- **Import**: Support multiple formats
- **Custom Dimensions**: Configurable export sizes
- **Batch Export**: Export multiple boards

---

## 4. Milestone-Based Implementation

## 🏁 Milestone 1: Single-User Whiteboard with Flowchart Templates (1.5 weeks)
**Goal**: Feature-rich single-user whiteboard with comprehensive drawing tools and flowchart templates

### Deliverables
- [ ] Complete drawing toolkit (pen, shapes, text, selection tools)
- [ ] Flowchart template library (start/end, process, decision, data, document, connectors)
- [ ] Advanced editing features (transform, group, align, layers)
- [ ] PostgreSQL persistence with REST API
- [ ] Clean, responsive UI with intuitive UX
- [ ] Undo/redo functionality (50+ operations)
- [ ] Monorepo setup with moonrepo workspace

### Technical Implementation

**Monorepo Setup**:
```bash
# Initialize moonrepo workspace
moon init whiteboard

# Create apps
moon run app:create backend --template golang
moon run app:create frontend --template react-ts

# Create shared package
moon run pkg:create shared --template typescript
```

**Frontend Structure (apps/frontend/)**:
```
src/
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx              # Main drawing canvas with HTML5 Canvas
│   │   ├── Toolbar.tsx             # Drawing tools toolbar
│   │   ├── ColorPicker.tsx         # Advanced color picker
│   │   ├── TemplateGallery.tsx     # Flowchart templates panel
│   │   └── PropertyPanel.tsx       # Element properties editor
│   ├── Board/
│   │   └── BoardView.tsx           # Main board component
│   └── UI/
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── IconButton.tsx
├── hooks/
│   ├── useDrawing.ts               # Drawing state management
│   ├── useCanvas.ts                # Canvas interactions
│   ├── useSelection.ts             # Selection handling
│   └── useTemplates.ts             # Template insertion
├── services/
│   └── api.ts                      # Backend API client
├── types/
│   └── whiteboard.ts               # TypeScript types (re-exported from shared)
├── utils/
│   ├── canvas.ts                   # Canvas rendering utilities
│   ├── geometry.ts                 # Geometry calculations
│   ├── templates.ts                # Template generators
│   └── constants.ts                # Drawing constants
└── App.tsx
```

**Backend Structure (apps/backend/)**:
```
cmd/
├── main.go                         # Application entry point
internal/
├── handlers/
│   └── board.go                    # Board CRUD operations
├── models/
│   ├── board.go                    # Board model
│   └── element.go                  # Element model
├── services/
│   └── board_service.go            # Board business logic
└── repository/
    └── board_repo.go               # Database operations
```

**Core Data Models** (packages/shared/src/types/):
```typescript
// Element Types
type ElementType = 
  | 'pen' 
  | 'rectangle' 
  | 'circle' 
  | 'square'
  | 'line' 
  | 'arrow'
  | 'text'
  | 'template'; // For flowchart templates

// Flowchart Template Types
type TemplateType =
  | 'start-end'
  | 'process'
  | 'decision'
  | 'data'
  | 'document'
  | 'connector';

// Base Element Interface
interface Element {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  locked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Freehand Drawing
interface PenElement extends Element {
  type: 'pen';
  points: Point[];
  smoothing: number;
}

// Shape Elements
interface ShapeElement extends Element {
  type: 'rectangle' | 'circle' | 'square' | 'line';
  cornerRadius?: number; // For rounded rectangles
}

// Arrow Element
interface ArrowElement extends Element {
  type: 'arrow';
  points: Point[];
  arrowHead: 'none' | 'arrow' | 'dot' | 'diamond';
  arrowSize: number;
}

// Text Element
interface TextElement extends Element {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  padding: number;
}

// Template Element
interface TemplateElement extends Element {
  type: 'template';
  templateType: TemplateType;
  templateData: {
    label?: string;
    style?: string;
  };
}

// Union type for all elements
type DrawingElement = PenElement | ShapeElement | ArrowElement | TextElement | TemplateElement;

// Board State
interface Board {
  id: string;
  name: string;
  elements: DrawingElement[];
  selectedElementIds: string[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  grid: {
    enabled: boolean;
    size: number;
    snap: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Drawing Tools
type Tool = 
  | 'select'
  | 'pen'
  | 'rectangle'
  | 'circle'
  | 'square'
  | 'line'
  | 'arrow'
  | 'text'
  | 'template';

// Template Configuration
interface TemplateConfig {
  type: TemplateType;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultFillColor: string;
  defaultStrokeColor: string;
  customizableLabels?: boolean;
}
```

**Flowchart Templates** (packages/shared/src/constants/templates.ts):
```typescript
export const FLOWCHART_TEMPLATES: TemplateConfig[] = [
  {
    type: 'start-end',
    label: 'Start/End',
    defaultWidth: 120,
    defaultHeight: 60,
    defaultFillColor: '#4CAF50',
    defaultStrokeColor: '#2E7D32',
    customizableLabels: true,
  },
  {
    type: 'process',
    label: 'Process',
    defaultWidth: 120,
    defaultHeight: 60,
    defaultFillColor: '#2196F3',
    defaultStrokeColor: '#1565C0',
    customizableLabels: true,
  },
  {
    type: 'decision',
    label: 'Decision',
    defaultWidth: 100,
    defaultHeight: 100,
    defaultFillColor: '#FF9800',
    defaultStrokeColor: '#E65100',
    customizableLabels: true,
  },
  {
    type: 'data',
    label: 'Data',
    defaultWidth: 120,
    defaultHeight: 80,
    defaultFillColor: '#9C27B0',
    defaultStrokeColor: '#6A1B9A',
    customizableLabels: true,
  },
  {
    type: 'document',
    label: 'Document',
    defaultWidth: 100,
    defaultHeight: 120,
    defaultFillColor: '#F44336',
    defaultStrokeColor: '#C62828',
    customizableLabels: true,
  },
];

// Pre-built Template Sets
export const TEMPLATE_SETS = {
  flowchart: {
    name: 'Flowchart',
    description: 'Basic flowchart with common symbols',
    templates: ['start-end', 'process', 'decision', 'data', 'document'],
  },
  mindmap: {
    name: 'Mind Map',
    description: 'Mind mapping templates',
    templates: ['process', 'process', 'process'],
  },
  uml: {
    name: 'UML Diagram',
    description: 'UML class and sequence diagrams',
    templates: ['process', 'process', 'decision'],
  },
};
```

**Key Features**:

1. **Canvas Component**
   - HTML5 Canvas with optimized rendering
   - Mouse, touch, and stylus support
   - Viewport pan and zoom
   - High-DPI display support

2. **Drawing Tools**
   - **Pen**: Freehand with smoothing algorithms
   - **Shapes**: Rectangle, circle, square with configurable corner radius
   - **Line & Arrow**: Straight lines and arrows with custom arrowheads
   - **Text**: Rich text editing with font controls
   - **Selection**: Click, lasso, and multi-select

3. **Flowchart Templates**
   - Template gallery with preview
   - Drag-and-drop insertion
   - Customizable labels
   - Auto-connectors for linking templates

4. **Advanced Editing**
   - Transform handles for resize/rotate
   - Group/ungroup elements
   - Alignment tools (align left, right, center, distribute)
   - Layer management (bring to front/back)
   - Copy/paste and duplicate

5. **State Management**
   - React Context for global state
   - Command pattern for undo/redo
   - Immutable state updates
   - History stack with 50+ operations

6. **Persistence**
   - PostgreSQL database with GORM
   - RESTful API (GET/POST/PUT/DELETE boards)
   - Auto-save every 5 seconds
   - Manual save button

**Database Schema** (PostgreSQL):
```sql
-- Boards table
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Elements are stored as JSONB within board.data for simplicity
-- In production, you might want a separate elements table
```

**API Endpoints**:
```
GET    /api/boards              # List all boards
POST   /api/boards              # Create new board
GET    /api/boards/:id          # Get board by ID
PUT    /api/boards/:id          # Update board
DELETE /api/boards/:id          # Delete board
```

### Success Criteria
- ✅ Complete drawing toolkit with 8+ tools
- ✅ Flowchart template library with 5+ templates
- ✅ Smooth 60fps drawing performance
- ✅ Undo/redo 50+ operations
- ✅ Auto-save to PostgreSQL works flawlessly
- ✅ Clean, intuitive UI with professional look
- ✅ Monorepo builds and runs with moon
- ✅ Mobile-responsive design

---

## 🚀 Milestone 2: Multi-User Real-Time (1.5 weeks)
**Goal**: Multiple users can draw on the same board simultaneously via WebSocket

### Deliverables
- [ ] Golang WebSocket server (port 8080)
- [ ] Multiple users can connect to same board
- [ ] Real-time drawing synchronization (<100ms latency)
- [ ] User presence indicators (cursors, user list)
- [ ] Automatic reconnection on disconnect

### Technical Implementation

**Golang Backend Core Components**:

**1. WebSocket Hub** (`internal/hub/hub.go`):
```go
package hub

type Hub struct {
    boards map[string][]*Connection
    register chan *Connection
    unregister chan *Connection
    broadcast chan *Message
}

type Connection struct {
    ws *websocket.Conn
    send chan []byte
    boardID string
    userID string
    userName string
    userColor string
}

type Message struct {
    BoardID string `json:"board_id"`
    Type string `json:"type"`
    UserID string `json:"user_id"`
    Payload json.RawMessage `json:"payload"`
}

func (h *Hub) Run() {
    for {
        select {
        case conn := <-h.register:
            h.addConnection(conn)
        case conn := <-h.unregister:
            h.removeConnection(conn)
        case message := <-h.broadcast:
            h.broadcastToBoard(message)
        }
    }
}
```

**2. WebSocket Handler** (`internal/handlers/websocket.go`):
```go
func HandleWebSocket(c *gin.Context) {
    boardID := c.Param("boardID")
    userID := c.Query("userID")
    userName := c.Query("userName")

    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Println("WebSocket upgrade error:", err)
        return
    }

    connection := &hub.Connection{
        ws: conn,
        send: make(chan []byte, 256),
        boardID: boardID,
        userID: userID,
        userName: userName,
        userColor: generateRandomColor(),
    }

    hub.Register(connection)

    go connection.writePump()
    go connection.readPump()
}
```

**3. Data Models** (`internal/models/board.go`):
```go
package models

type Element struct {
    ID string `json:"id"`
    Type string `json:"type"`
    X float64 `json:"x"`
    Y float64 `json:"y"`
    Width float64 `json:"width"`
    Height float64 `json:"height"`
    Points []Point `json:"points,omitempty"`
    StrokeColor string `json:"strokeColor"`
    FillColor string `json:"fillColor"`
    StrokeWidth float64 `json:"strokeWidth"`
    ZIndex int `json:"zIndex"`
    Version int `json:"version"`
}

type Point struct {
    X float64 `json:"x"`
    Y float64 `json:"y"`
}
```

**Frontend WebSocket Service** (`services/websocket.ts`):
```typescript
class WebSocketService {
    private ws: WebSocket | null = null;
    
    connect(boardID: string, userID: string, userName: string) {
        const wsUrl = `ws://localhost:8080/ws/${boardID}?userID=${userID}&userName=${userName}`;
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
    }
    
    send(message: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
}
```

### WebSocket Events

**Connection**:
```typescript
// Client → Server
'join-board': { boardId: string, userId: string, userName: string }

// Server → Client
'board-state': { elements: Element[], sessions: Session[] }
'session-joined': { user: User }
'session-left': { userId: string }
```

**Drawing Operations**:
```typescript
// Client → Server
'create-element': { element: Element }
'update-element': { elementId: string, updates: Partial<Element> }
'delete-element': { elementId: string }

// Server → All Clients
'element-created': { element: Element, userId: string }
'element-updated': { elementId: string, updates: Partial<Element>, userId: string }
'element-deleted': { elementId: string, userId: string }
```

**Cursor & Presence**:
```typescript
// Client → Server
'cursor-move': { position: Point, tool: string }

// Server → All Clients
'cursor-updated': { userId: string, position: Point, tool: string }
```

### Success Criteria
- ✅ 3+ users can draw simultaneously
- ✅ All drawings appear in real-time (<100ms latency)
- ✅ Users can see each other's cursors with colors
- ✅ No drawing conflicts or lost updates

---

## 🔐 Milestone 3: User Authentication (1 week)
**Goal**: Secure user registration, login, and protected access

### Deliverables
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] JWT authentication middleware
- [ ] Protected WebSocket connections
- [ ] Login/register pages
- [ ] Dashboard with user's boards

### Technical Implementation

**User Model** (`internal/models/user.go`):
```go
package models

import "time"

type User struct {
    ID string `json:"id" gorm:"primaryKey"`
    Email string `json:"email" gorm:"uniqueIndex"`
    Password string `json:"-"` // Never expose password
    Name string `json:"name"`
    AvatarURL string `json:"avatar_url"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

**Auth Endpoints** (`internal/handlers/auth.go`):
```go
type RegisterRequest struct {
    Email string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=8"`
    Name string `json:"name" binding:"required"`
}

type LoginRequest struct {
    Email string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
    Token string `json:"token"`
    User User `json:"user"`
}

func (h *Handler) Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to hash password"})
        return
    }

    // Create user
    user := models.User{
        ID: uuid.New().String(),
        Email: req.Email,
        Password: string(hashedPassword),
        Name: req.Name,
        CreatedAt: time.Now(),
    }

    if err := h.db.Create(&user).Error; err != nil {
        c.JSON(400, gin.H{"error": "Email already exists"})
        return
    }

    // Generate JWT
    token, err := generateToken(user.ID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to generate token"})
        return
    }

    c.JSON(201, AuthResponse{
        Token: token,
        User: user,
    })
}
```

**JWT Middleware** (`internal/middleware/auth.go`):
```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "No token provided"})
            c.Abort()
            return
        }

        token = strings.TrimPrefix(token, "Bearer ")

        claims, err := verifyToken(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Set("userID", claims.UserID)
        c.Next()
    }
}
```

**Protected WebSocket** (`internal/handlers/websocket.go`):
```go
func HandleWebSocket(c *gin.Context) {
    boardID := c.Param("boardID")

    // Get user from JWT
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(401, gin.H{"error": "Unauthorized"})
        return
    }

    // Check if user has access to board
    if !hasBoardAccess(userID.(string), boardID) {
        c.JSON(403, gin.H{"error": "Forbidden"})
        return
    }

    // Proceed with WebSocket upgrade...
}
```

### Success Criteria
- ✅ Users can register with email/password
- ✅ Users can login and receive JWT
- ✅ Protected API endpoints work
- ✅ WebSocket requires authentication
- ✅ Users can only access their boards

---

## 💾 Milestone 4: Advanced Database Features & Scaling (1 week)
**Goal**: Enhance database with user management, proper schema, and prepare for horizontal scaling

### Deliverables
- [ ] User management system (users, authentication)
- [ ] Enhanced database schema with foreign keys and relationships
- [ ] Board collaboration features (share, permissions)
- [ ] Auto-save optimization (debouncing, conflict resolution)
- [ ] Redis integration for horizontal scaling
- [ ] Board listing and management UI
- [ ] Data migration from simple to complex schema

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Boards table
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_modified TIMESTAMP DEFAULT NOW()
);

-- Board collaborators
CREATE TABLE board_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(board_id, user_id)
);

-- Elements table
CREATE TABLE elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    width DOUBLE PRECISION NOT NULL,
    height DOUBLE PRECISION NOT NULL,
    points JSONB,
    stroke_color VARCHAR(50) NOT NULL,
    fill_color VARCHAR(50) NOT NULL,
    stroke_width DOUBLE PRECISION NOT NULL,
    z_index INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Change events (for history)
CREATE TABLE change_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    element_id UUID REFERENCES elements(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    element_snapshot JSONB NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_elements_board_id ON elements(board_id);
CREATE INDEX idx_change_events_board_id ON change_events(board_id);
CREATE INDEX idx_change_events_version ON change_events(board_id, version);
```

**Board Service** (`internal/services/board_service.go`):
```go
type BoardService struct {
    db *gorm.DB
}

func (s *BoardService) CreateBoard(name string, ownerID string) (*models.Board, error) {
    board := &models.Board{
        ID: uuid.New().String(),
        Name: name,
        OwnerID: ownerID,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
        LastModified: time.Now(),
    }

    if err := s.db.Create(board).Error; err != nil {
        return nil, err
    }

    return board, nil
}

func (s *BoardService) GetBoard(boardID string) (*models.Board, error) {
    var board models.Board
    err := s.db.Preload("Elements").First(&board, "id = ?", boardID).Error
    return &board, err
}

func (s *BoardService) SaveElement(element *models.Element) error {
    element.UpdatedAt = time.Now()
    return s.db.Save(element).Error
}
```

**Auto-save Frontend Hook** (`hooks/useAutoSave.ts`):
```typescript
export const useAutoSave = (boardID: string, elements: Element[]) => {
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            try {
                await boardService.saveBoardState(boardID, elements);
            } catch (error) {
                console.error('Failed to save board:', error);
            } finally {
                setIsSaving(false);
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [boardID, elements]);

    return { isSaving };
};
```

### Success Criteria
- ✅ Boards persist across server restarts
- ✅ Auto-save works (2-second delay after changes)
- ✅ Can list all user's boards
- ✅ Can delete boards
- ✅ No data loss on disconnect

---

## ✨ Milestone 5: Advanced Features (1.5 weeks)
**Goal**: Export, version history, comments, and production deployment

### Deliverables
- [ ] Export to PNG, SVG, PDF
- [ ] Version history UI with timeline
- [ ] Comments system with real-time sync
- [ ] Performance optimization (100+ elements)
- [ ] Production deployment

### Export Service (`internal/services/export_service.go`)

```go
type ExportService struct{}

type ExportFormat string

const (
    PNG ExportFormat = "png"
    SVG ExportFormat = "svg"
    PDF ExportFormat = "pdf"
    JSON ExportFormat = "json"
)

type ExportRequest struct {
    BoardID string `json:"board_id"`
    Format ExportFormat `json:"format"`
    Width int `json:"width"`
    Height int `json:"height"`
    Scale float64 `json:"scale"`
}

func (s *ExportService) ExportBoard(req ExportRequest) ([]byte, error) {
    elements, err := s.getBoardElements(req.BoardID)
    if err != nil {
        return nil, err
    }

    switch req.Format {
    case PNG:
        return s.exportToPNG(elements, req.Width, req.Height, req.Scale)
    case SVG:
        return s.exportToSVG(elements, req.Width, req.Height)
    case PDF:
        return s.exportToPDF(elements, req.Width, req.Height)
    case JSON:
        return s.exportToJSON(elements)
    default:
        return nil, errors.New("unsupported format")
    }
}
```

### Version History API (`internal/handlers/history.go`)

```go
type HistoryResponse struct {
    Events []models.ChangeEvent `json:"events"`
    Versions []int `json:"versions"`
}

func (h *Handler) GetBoardHistory(c *gin.Context) {
    boardID := c.Param("id")

    var events []models.ChangeEvent
    err := h.db.Where("board_id = ?", boardID).
        Order("version DESC").
        Limit(100).
        Find(&events).Error

    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to fetch history"})
        return
    }

    c.JSON(200, HistoryResponse{Events: events})
}
```

### Comments System

**Comments Model** (`internal/models/comment.go`):
```go
type Comment struct {
    ID string `json:"id" gorm:"primaryKey"`
    BoardID string `json:"board_id"`
    UserID string `json:"user_id"`
    ElementID *string `json:"element_id"`
    Content string `json:"content"`
    X float64 `json:"x"`
    Y float64 `json:"y"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### Performance Optimization

**Frontend Canvas Virtualization**:
```typescript
const VirtualizedCanvas: React.FC = () => {
    const [viewport, setViewport] = useState({ x: 0, y: 0, width: 800, height: 600 });

    const visibleElements = useMemo(() => {
        return elements.filter(el => isElementVisible(el, viewport));
    }, [elements, viewport]);

    return (
        <Canvas>
            {visibleElements.map(el => <ElementRenderer key={el.id} element={el} />)}
        </Canvas>
    );
};
```

### Success Criteria
- ✅ Can export boards in multiple formats (PNG, SVG, PDF)
- ✅ Version history shows all changes with timeline
- ✅ Comments sync in real-time
- ✅ Smooth performance with 100+ elements
- ✅ Deployed to production

---

## 5. Data Models

### User Model
```go
type User struct {
    ID string `json:"id" gorm:"primaryKey"`
    Email string `json:"email" gorm:"uniqueIndex"`
    Password string `json:"-"` // Never expose
    Name string `json:"name"`
    AvatarURL string `json:"avatar_url"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### Board Model
```go
type Board struct {
    ID string `json:"id" gorm:"primaryKey"`
    Name string `json:"name"`
    OwnerID string `json:"owner_id"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    LastModified time.Time `json:"last_modified"`
    Elements []Element `json:"elements,omitempty"`
}
```

### Element Model
```go
type Element struct {
    ID string `json:"id" gorm:"primaryKey"`
    BoardID string `json:"board_id"`
    Type string `json:"type"` // 'rectangle', 'circle', 'line', 'arrow', 'text', 'freehand'
    X float64 `json:"x"`
    Y float64 `json:"y"`
    Width float64 `json:"width"`
    Height float64 `json:"height"`
    Points *JSONB `json:"points,omitempty"` // For freehand
    StrokeColor string `json:"stroke_color"`
    FillColor string `json:"fill_color"`
    StrokeWidth float64 `json:"stroke_width"`
    ZIndex int `json:"z_index"`
    Version int `json:"version"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### Session Model
```go
type Session struct {
    ID string `json:"id"`
    BoardID string `json:"board_id"`
    UserID string `json:"user_id"`
    UserName string `json:"user_name"`
    UserColor string `json:"user_color"`
    CursorPosition Point `json:"cursor_position"`
    CurrentTool string `json:"current_tool"`
    IsActive bool `json:"is_active"`
    JoinedAt time.Time `json:"joined_at"`
    LastActiveAt time.Time `json:"last_active_at"`
}
```

### Change Event Model
```go
type ChangeEvent struct {
    ID string `json:"id" gorm:"primaryKey"`
    BoardID string `json:"board_id"`
    UserID string `json:"user_id"`
    ElementID string `json:"element_id"`
    EventType string `json:"event_type"` // 'create', 'update', 'delete'
    ElementSnapshot JSONB `json:"element_snapshot"`
    Version int `json:"version"`
    CreatedAt time.Time `json:"created_at"`
}
```

---

## 6. API Design

### 6.1 REST Endpoints

#### Authentication
```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # Login user
POST   /api/auth/logout             # Logout user
GET    /api/auth/me                 # Get current user
```

#### Board Management
```
GET    /api/boards                  # List user's boards
POST   /api/boards                  # Create new board
GET    /api/boards/:id              # Get board details
PUT    /api/boards/:id              # Update board
DELETE /api/boards/:id              # Delete board

GET    /api/boards/:id/elements     # Get all elements
POST   /api/boards/:id/elements     # Create element
PUT    /api/boards/:id/elements/:elementId # Update element
DELETE /api/boards/:id/elements/:elementId # Delete element

GET    /api/boards/:id/history      # Get change history
POST   /api/boards/:id/snapshot     # Create snapshot
GET    /api/boards/:id/export       # Export board
```

#### User & Collaboration
```
GET    /api/boards/:id/collaborators # List collaborators
POST   /api/boards/:id/collaborators # Add collaborator
PUT    /api/boards/:id/collaborators/:userId # Update permissions
DELETE /api/boards/:id/collaborators/:userId # Remove collaborator

GET    /api/boards/:id/sessions     # Active sessions
POST   /api/boards/:id/lock/:elementId   # Lock element
DELETE /api/boards/:id/lock/:elementId   # Unlock element

GET    /api/boards/:id/comments     # Get comments
POST   /api/boards/:id/comments     # Add comment
PUT    /api/comments/:id            # Update comment
DELETE /api/comments/:id            # Delete comment
```

### 6.2 WebSocket Events

#### Connection
```json
// Client → Server
{
  "type": "join-board",
  "board_id": "board-123",
  "user_id": "user-456",
  "user_name": "John Doe"
}

// Server → Client
{
  "type": "board-state",
  "elements": [...],
  "sessions": [...]
}
```

#### Drawing Operations
```json
// Client → Server
{
  "type": "create-element",
  "element": { ... }
}

{
  "type": "update-element",
  "element_id": "element-123",
  "updates": { ... }
}

// Server → All Clients
{
  "type": "element-created",
  "element": { ... },
  "user_id": "user-456"
}
```

#### Cursor & Presence
```json
// Client → Server
{
  "type": "cursor-move",
  "position": { "x": 100, "y": 200 },
  "tool": "pen"
}

// Server → All Clients
{
  "type": "cursor-updated",
  "user_id": "user-456",
  "position": { "x": 100, "y": 200 },
  "tool": "pen"
}
```

---

## 7. Real-time Synchronization Strategy

### 7.1 Operational Transformation (OT)

**Golang Implementation**:
```go
type Operation struct {
    ID string `json:"id"`
    Type string `json:"type"` // 'insert', 'update', 'delete'
    Position *int `json:"position,omitempty"`
    Element *models.Element `json:"element,omitempty"`
    Timestamp int64 `json:"timestamp"`
    ClientID string `json:"client_id"`
}

func Transform(op1, op2 *Operation) (*Operation, error) {
    // Implementation depends on operation type
    // Handle conflicts intelligently
    return op1, nil
}
```

### 7.2 Conflict Resolution

**Priority Order**:
1. **Lock-based**: Locked elements have priority
2. **Last-writer-wins**: For non-conflicting operations
3. **Vector Clocks**: For network partition handling

**Resolution Strategies**:
- **Cursor conflicts**: Show multiple cursors
- **Element overlap**: Allow z-index management
- **Simultaneous edits**: Queue and merge changes
- **Network partitions**: Use version numbers for ordering

---

## 8. Scalability Considerations

### 8.1 Horizontal Scaling

**WebSocket Clustering**:
- Use Redis adapter for multi-instance support
- Each instance handles subset of active connections
- Redis pub/sub for cross-instance communication

**Database Sharding**:
- Shard boards by ID hash
- Use read replicas for query distribution
- Implement connection pooling with pgxpool

### 8.2 Performance Optimization

**Caching Strategy**:
- Redis for active board state
- In-memory cache for frequently accessed boards
- CDN for static assets

**Database Optimization**:
- Index on boardId, elementId, timestamps
- Periodic cleanup of old change events
- Archive inactive boards

**WebSocket Optimization**:
- Binary encoding for frequent updates
- Throttling for rapid cursor movements
- Batching for bulk operations

### 8.3 Load Distribution

**Auto-scaling Triggers**:
- CPU utilization > 70%
- Memory usage > 80%
- Active connections > threshold
- Response time > 200ms

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

**JWT Token Implementation**:
```go
type Claims struct {
    UserID string `json:"user_id"`
    Email string `json:"email"`
    jwt.StandardClaims
}

func GenerateToken(userID, email string) (string, error) {
    claims := Claims{
        UserID: userID,
        Email: email,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
        },
    }
    return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(os.Getenv("JWT_SECRET")))
}
```

**Authorization Levels**:
- **Owner**: Full access
- **Editor**: Can edit elements
- **Viewer**: Read-only access
- **Guest**: Limited access with watermark

### 9.2 Data Protection

**Input Validation**:
- Use `validator` package for all inputs
- Rate limiting on all endpoints
- SQL injection prevention (GORM parameterized queries)

**Board Access Control**:
- Verify user permissions on every operation
- Validate board ownership
- Audit all access attempts

### 9.3 DDoS Protection

**Rate Limiting**:
- Use `golang.org/x/time/rate` for rate limiting
- Connection limits per IP
- WebSocket message rate limiting

---

## 10. Monitoring & Observability

### 10.1 Metrics to Track

**Performance Metrics**:
- WebSocket connection count
- Message latency (p50, p95, p99)
- Database query time
- Cache hit rate
- Error rate by endpoint

**Business Metrics**:
- Active boards
- Concurrent users
- Feature usage
- Export frequency

### 10.2 Logging Strategy

**Structured Logging**:
```go
logger.Info("Element updated",
    zap.String("board_id", boardID),
    zap.String("user_id", userID),
    zap.String("element_id", elementID),
    zap.String("operation", "update"),
    zap.Time("timestamp", time.Now()),
)
```

**Log Aggregation**:
- Use Zap logger
- Centralized logging with Loki or ELK stack
- Searchable logs for debugging
- Alerting on error spikes

### 10.3 Health Checks

**Endpoint**: `GET /health`
```go
type HealthResponse struct {
    Status string `json:"status"`
    Timestamp int64 `json:"timestamp"`
    Services struct {
        Database string `json:"database"`
        Redis string `json:"redis"`
        WebSocket string `json:"websocket"`
    } `json:"services"`
}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Element manipulation functions
- Conflict resolution algorithms
- Data validation
- Utility functions

**Example Test** (`internal/services/board_service_test.go`):
```go
func TestBoardService_CreateBoard(t *testing.T) {
    db := setupTestDB()
    service := NewBoardService(db)
    
    board, err := service.CreateBoard("Test Board", "user-123")
    assert.NoError(t, err)
    assert.NotNil(t, board)
    assert.Equal(t, "Test Board", board.Name)
}
```

### 11.2 Integration Tests
- API endpoint testing
- Database operations
- WebSocket event handling
- Authentication flows

**WebSocket Test**:
```go
func TestWebSocketConnection(t *testing.T) {
    // Setup WebSocket client
    // Connect to server
    // Send drawing operation
    // Verify synchronization
}
```

### 11.3 Load Tests
- Concurrent user simulation with k6 or wrk
- Stress testing with 1000+ connections
- Database performance under load
- Memory leak detection

### 11.4 End-to-End Tests
- Complete user workflows
- Multi-user collaboration scenarios
- Cross-browser compatibility

---

## 12. Deployment Architecture

### 12.1 Production Environment

```
┌─────────────┐
│   Cloudflare│ ← DDoS Protection, CDN
└──────┬──────┘
       │
┌──────▼──────┐
│   Nginx     │ ← Load Balancer, SSL Termination
└──────┬──────┘
       │
┌──────▼──────┐
│ Kubernetes  │ ← Orchestration
│  Cluster    │
│             │
│  ┌────────┐ │
│  │API Pods│ │ ← Auto-scaling
│  └────────┘ │
│  ┌────────┐ │
│  │WS Pods │ │
│  └────────┘ │
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │ ← Primary + Read Replicas
│   Cluster   │
└──────┬──────┘
       │
┌──────▼──────┐
│    Redis    │ ← Cache & Pub/Sub
│   Cluster   │
└─────────────┘
```

### 12.2 Initial VPS Deployment (Milestone 1-3)

**Single VPS with Docker Compose**:

```
┌─────────────────────────────────────┐
│              VPS                    │
│                                     │
│  ┌────────────────────────────────┐ │
│  │         Caddy                  │ │
│  │  (Reverse Proxy + Auto HTTPS)  │ │
│  └──────┬─────────────────────────┘ │
│         │                           │
│    ┌────┴────┐                     │
│    ▼         ▼                     │
│  ┌──────┐ ┌────────┐              │
│  │ Go   │ │Frontend│              │
│  │:8080 │ │ :3000  │              │
│  └──────┘ └────────┘              │
│         │                           │
│    ┌────┴────────────────────────┐ │
│    ▼                             ▼ │
│  ┌──────────────────┐   ┌─────────┐│
│  │   PostgreSQL     │   │  Redis  ││
│  │    :5432         │   │  :6379  ││
│  │   (Milestone 1)  │   │(M4+)    ││
│  └──────────────────┘   └─────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Caddyfile** (infra/Caddyfile):
```
your-domain.com {
    encode gzip
    
    # Frontend (static files)
    reverse_proxy /* localhost:3000
    
    # API endpoints
    reverse_proxy /api/* localhost:8080
    
    # WebSocket endpoints (Milestone 2+)
    reverse_proxy /ws/* localhost:8080
    
    # Auto HTTPS - just works!
}

# Development (localhost)
localhost {
    reverse_proxy /* localhost:3000
}
```

### 12.3 Scaled Deployment (Milestone 4+)

```
┌─────────────┐
│  Cloudflare │ ← DDoS Protection, CDN, WAF
└──────┬──────┘
       │
┌──────▼──────┐
│  Load       │ ← Multiple Caddy instances
│ Balancer    │   (Auto-scaling)
└──────┬──────┘
       │
┌──────▼──────┐
│ Kubernetes  │ ← Orchestration (when needed)
│  Cluster    │
│             │
│  ┌────────┐ │
│  │API Pods│ │ ← Auto-scaling
│  └────────┘ │
│  ┌────────┐ │
│  │WS Pods │ │
│  └────────┘ │
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │ ← Primary + Read Replicas
│   Cluster   │
└──────┬──────┘
       │
┌──────▼──────┐
│    Redis    │ ← Cache & Pub/Sub
│   Cluster   │
└─────────────┘
```

### 12.4 Deployment Methods

**Local Development** (moon + docker-compose):
```bash
# Start all services locally
moon run frontend:dev
moon run backend:dev

# Or with docker-compose
docker-compose up -d
```

**VPS Deployment** (Ansible/Capistrano):
```bash
# Build and deploy
moon run frontend:build
moon run backend:build

# Deploy to VPS
ansible-playbook -i inventory deploy.yml
```

**Production Deployment** (GitHub Actions):
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup moon
        uses: moonrepo/setup-moon@v1
      - name: Build
        run: moon run frontend:build backend:build
      - name: Deploy to VPS
        run: ansible-playbook deploy.yml
```

### 12.5 Deployment Checklist

**Pre-deployment**:
- [ ] Code review completed
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated

**Deployment Steps**:
- [ ] Deploy to staging environment
- [ ] Run integration tests
- [ ] Execute smoke tests
- [ ] Deploy to production (blue-green)
- [ ] Verify health checks
- [ ] Monitor error rates

**Post-deployment**:
- [ ] Monitor metrics for 24 hours
- [ ] Collect user feedback
- [ ] Review error logs
- [ ] Document any issues
- [ ] Plan next iteration

---

## 13. Success Metrics

### 13.1 Technical Metrics
- **Latency**: <100ms for drawing operations
- **Uptime**: 99.9% availability
- **Scalability**: Support 1000+ concurrent users
- **Error Rate**: <0.1% of all operations
- **Recovery Time**: <5 seconds for auto-scaling

### 13.2 User Experience Metrics
- **Engagement**: Average session duration >15 minutes
- **Collaboration**: Average 3+ users per active board
- **Export Usage**: 20% of boards exported
- **User Satisfaction**: NPS score >40

---

## 14. Future Enhancements

### 14.1 Advanced Features
- **AI Integration**: Auto-layout suggestions, diagram recognition
- **Mobile Apps**: Native iOS and Android apps
- **Plugin System**: Extensible architecture for third-party plugins
- **Voice Chat**: Integrated voice communication
- **Template Library**: Pre-built diagram templates

### 14.2 Enterprise Features
- **SSO Integration**: SAML, LDAP authentication
- **Compliance**: GDPR, SOC2 compliance
- **Advanced Analytics**: Usage dashboards, insights
- **Custom Branding**: White-label solutions
- **Priority Support**: Dedicated support team

---

## 15. Resource Requirements

### 15.1 Team Structure
- **Backend Engineer** (1): Golang API and WebSocket implementation
- **Frontend Engineer** (1): React client-side integration
- **DevOps Engineer** (0.5): Infrastructure and deployment
- **QA Engineer** (0.5): Testing and quality assurance

### 15.2 Infrastructure Costs (Estimated)
- **Application Servers**: $400-800/month (auto-scaling Golang)
- **Database**: $300-500/month
- **Redis**: $100-200/month
- **File Storage**: $50-100/month
- **CDN**: $100-200/month
- **Monitoring**: $100-200/month
- **Total**: ~$1,050-2,000/month for production

### 15.3 Timeline Summary
- **Total Duration**: 6 weeks (milestone-based)
- **Milestone 1**: Core whiteboard (1 week)
- **Milestone 2**: Real-time features (1.5 weeks)
- **Milestone 3**: Authentication (1 week)
- **Milestone 4**: Database persistence (1 week)
- **Milestone 5**: Advanced features (1.5 weeks)
- **Buffer**: 1 week for unexpected challenges
- **Estimated Total**: 7 weeks with buffer

---

## 16. Risk Assessment

### 16.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| WebSocket scaling issues | High | Medium | Extensive load testing, fallback to polling |
| Database performance | High | Medium | Proper indexing, connection pooling, caching |
| Conflict resolution bugs | Medium | High | Comprehensive testing, user notifications |
| Memory leaks | Medium | Medium | Regular profiling, automated testing |
| Golang learning curve | Medium | Low | Incremental milestones, documentation |

### 16.2 Mitigation Strategies
- **Incremental Development**: Build and test in small iterations
- **Feature Flags**: Deploy features gradually
- **Rollback Plan**: Quick rollback for critical issues
- **Backup Strategy**: Daily automated backups
- **Disaster Recovery**: Multi-region deployment

---

## 17. Conclusion

This implementation plan provides a **comprehensive roadmap** for building a production-ready real-time collaborative whiteboard using a **monorepo architecture** with **moonrepo workspace management**. The project combines **Golang** for high-performance backend services with **React + Vite** for a fast, modern frontend experience.

The project follows a **5-milestone progressive approach**, starting with a feature-rich single-user whiteboard and incrementally adding real-time collaboration, user management, and enterprise-grade features.

**Key Success Factors**:
1. **Monorepo architecture** - Unified codebase with shared types and efficient builds
2. **Milestone-based progression** - Start with comprehensive single-user features, add collaboration incrementally
3. **Modern tech stack** - Golang + React Vite + PostgreSQL for optimal performance
4. **Scalable deployment** - Start with simple VPS + Caddy, scale to Kubernetes when needed
5. **Real-time excellence** - Sub-100ms latency target for all collaborative features
6. **User-focused design** - Flowchart templates and intuitive drawing tools from day one

**Expected Outcomes**:
- Deep understanding of monorepo management with moonrepo
- Proficiency in Golang backend development with real-time WebSocket systems
- Experience with React + Vite frontend development and Canvas APIs
- Knowledge of collaborative editing algorithms and conflict resolution
- Portfolio-worthy production application with professional deployment
- Transferable skills to other real-time, collaborative applications

**Next Steps**:
1. Review and approve this updated plan
2. Initialize moonrepo workspace with backend and frontend apps
3. Set up development environment (moon, Golang, React, PostgreSQL)
4. Begin **Milestone 1: Single-User Whiteboard with Flowchart Templates**
5. Establish regular check-ins after each milestone
6. Iterate based on learnings and adjust timeline as needed

**Why This Architecture?**
- **Monorepo with moonrepo**: Efficient builds, shared types, simplified dependency management
- **Golang backend**: Superior concurrency with goroutines, excellent WebSocket support, low memory footprint
- **React + Vite frontend**: Fast development, hot reload, optimized builds, modern React patterns
- **PostgreSQL**: Reliable, scalable, excellent JSONB support for flexible data storage
- **Caddy**: Automatic HTTPS, simple configuration, excellent for VPS deployment
- **Progressive complexity**: Start simple (VPS), scale when needed (Kubernetes, Redis, load balancers)

---

*This document should be reviewed and updated as the project evolves and requirements change.*
