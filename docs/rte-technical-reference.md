# RTE: Technical Reference

## Understanding the Layers

### Platform Architecture

The Uniweb platform consists of three interconnected systems:

1. **Uniweb Engine** (this document) - The runtime infrastructure that powers all sites
2. **Uniweb Framework** - Tools and conventions for Foundation creators to build section components
3. **Uniweb App** - The visual CMS where content teams build sites using Foundations

### What Foundation Creators See

Foundation creators work with section-level components. They import utilities from `@uniweb/common-components`, build React components, and package them as federated modules. They don't need to know about the underlying architecture.

### What Actually Runs

Every Uniweb site loads two core scripts that provide the runtime infrastructure:

1. **Vanilla JavaScript Engine** (`uniweb-core.js`) - Creates the `window.uniweb` global object
2. **React SPA Engine** (`uniweb-spa.js`) - React, React Router, and core UI infrastructure

These scripts are the foundation everything else builds on.

## The Vanilla JavaScript Engine

The first script creates a single global object: `window.uniweb`. This isn't just a namespace - it's a collection of sophisticated handlers that manage all browser-level concerns:

### Engine Handlers

-   **`uniweb.config`** - Configuration received from backend at page load
-   **`uniweb.storage`** - Scoped localStorage with TTL and automatic cleanup
-   **`uniweb.eventBus`** - Pub/sub system for decoupled communication
-   **`uniweb.loader`** - Module Federation loader for Foundation sections
-   **`uniweb.data`** - Data fetching and caching layer
-   **`uniweb.router`** - Routing coordination with React Router
-   **`uniweb.form`** - Complex form submission flows (presigned URL, direct POST, etc.)
-   **`uniweb.consent`** - GDPR-compliant consent management
-   **`uniweb.security`** - Manages reCAPTCHA integration
-   **`uniweb.analytics`** - Unified analytics tracking

Each handler is a vanilla JavaScript class instance that:

-   Persists throughout the page lifecycle
-   Manages its own state
-   Communicates via the event bus
-   Configures itself from backend data

### Why Vanilla JavaScript?

The vanilla layer exists because certain concerns transcend React's component lifecycle:

-   **Persistence**: Storage and configuration must survive component unmounting
-   **Performance**: Event handling and data caching shouldn't trigger React re-renders
-   **Bridge**: Foundation sections need a stable API regardless of React version
-   **Module Loading**: Webpack Module Federation operates outside React

## The React SPA Engine

The second script provides the React application infrastructure:

-   React and React DOM
-   React Router for navigation
-   Engine hooks and utilities
-   The mounting point for Foundation sections

Critically, this layer doesn't contain any site-specific components. It's pure infrastructure.

## Module Federation: The Secret Sauce

Here's where it gets interesting. Foundation sections aren't bundled with the site - they're loaded dynamically at runtime through Webpack Module Federation.

### How It Works

1. **Foundation creator builds components** packaged as a federated module
2. **Module publishes to CDN** with a manifest describing exports
3. **Site configuration specifies Foundation** to use
4. **Loader dynamically links with Foundation** and mounts its components
5. **Sections render their contents** using components provided by the Foundation

### The Magic

When a Foundation creator updates their module:

-   No sites need rebuilding
-   Updates propagate instantly
-   All sites using that Foundation improve automatically (if desired)

This is the key innovation that enables the "build once, use everywhere" model.

## Common Components Library

The `@uniweb/common-components` NPM package provides React components that Foundation creators use. These components wrap the vanilla JavaScript handlers:

```jsx
// What Foundation creators write
import { Form, Image, Video } from '@uniweb/common-components';

// What actually happens
// Form component internally calls window.uniweb.formSubmission
// Image component uses window.uniweb.loader for optimization
// Video component tracks via window.uniweb.analytics
```

Foundation creators never directly touch `window.uniweb`. The Common Components library provides the abstraction.

## Data Flow Architecture

### Configuration Flow

```
Backend → Page Load → window.uniweb.config → All Handlers Configure
```

The backend sends configuration that determines:

-   Which Foundation to load
-   API endpoints
-   Feature flags
-   Security tokens
-   Behavior settings (e.g., form submission method)

### Section Loading Flow

```
Route Change → Router Handler → Loader Handler → Fetch Section → Mount
```

1. React Router detects navigation
2. Router handler determines needed sections
3. Loader fetches Foundation module if not cached
4. Section component mounts with props from data layer

### Event Flow

```
User Action → Handler → Event Bus → Subscribers React
```

Example: Form submission

1. User submits form
2. FormSubmission handler processes
3. Publishes 'formSubmitted' event
4. Analytics handler tracks
5. UI components update

## The Bridge Pattern

One of Uniweb Engine's elegant solutions is bridging vanilla JavaScript with React:

```javascript
// In vanilla handler
class DataHandler {
    useDataEffect(useState, useEffect, key) {
        const [, setState] = useState(this.get(key));

        useEffect(() => {
            const unsub = this.eventBus.subscribe(`data:${key}`, setState);
            return unsub;
        }, []);

        return this.get(key);
    }
}
```

This pattern:

-   Accepts React hooks as parameters
-   Manages subscriptions internally
-   Triggers re-renders appropriately
-   Returns synchronized state

Common Components use this pattern internally, so Foundation creators just see normal React components.

## Security Architecture

### Layered Security

1. **Configuration Level**: Backend controls all security policies
2. **Handler Level**: Centralized token management, CSRF protection
3. **Component Level**: Input sanitization, XSS prevention
4. **Network Level**: HTTPS, CSP headers, CORS policies

### Key Principles

-   Never trust client input
-   All backend communication through handlers
-   Tokens refresh automatically
-   Consent required before third-party scripts

## Performance Strategy

### Initial Load

-   Vanilla engine: ~50KB gzipped
-   React SPA core: ~100KB gzipped
-   Total core: ~150KB

Foundation sections load on demand.

### Runtime Performance

-   Event bus: <0.1ms publish overhead
-   Storage: Browser-native performance
-   Module loading: CDN-cached, edge-optimized
-   Data layer: Aggressive caching with invalidation

### Optimization Techniques

-   Sections lazy-load by default
-   Images use intersection observer
-   Code splitting automatic
-   Preloading based on user intent

## Development Environment

### For Engine Development

```bash
# Clone core repository
git clone github.com/uniwebcms/core

# Install dependencies
npm install

# Run development build
npm run dev

# Watches both vanilla and React layers
# Provides test Foundation for development
# Hot reload enabled
```

### Testing Strategy

Each layer tested independently:

-   **Vanilla handlers**: Unit tests with mocked dependencies
-   **React SPA**: Component and integration tests
-   **Common Components**: React Testing Library
-   **Full stack**: E2E tests with real Foundation

### Debugging Tools

```javascript
// Enable debug mode
window.uniweb.debug = true;

// Monitor all events
window.uniweb.eventBus.subscribe('*', console.log);

// Check handler health
window.uniweb.diagnostics();

// Inspect loaded modules
window.uniweb.loader.getLoadedModules();
```

## How Everything Fits Together

Let's trace a complete user journey:

1. **User visits site**

    - Vanilla engine loads, creates `window.uniweb`
    - React SPA core loads, mounts root
    - Backend configuration received

2. **Page renders**

    - Router determines needed sections
    - Loader fetches Foundation module (if not cached)
    - Sections mount with data from backend

3. **User interacts with form**

    - Form (Common Component) renders
    - On submit, calls `uniweb.formSubmission`
    - Handler checks config for method (presigned URL or direct)
    - Executes appropriate flow

4. **Developer updates Foundation**
    - Builds new version
    - Deploys to CDN
    - Next page load gets new version
    - No site rebuilding needed

## Extending the Engine

### Adding a Handler

Create handlers for new browser-level concerns:

```javascript
class NewHandler {
    constructor(config, eventBus, storage) {
        this.config = config;
        this.eventBus = eventBus;
        this.storage = storage;
    }

    // Engine functionality
    async performAction(params) {
        // Implementation
    }

    // React bridge
    useNewHandlerEffect(useState, useEffect) {
        // Bridge implementation
    }
}

// Register in uniweb.js
window.uniweb.newHandler = new NewHandler(
    config.newHandler,
    window.uniweb.eventBus,
    window.uniweb.storage
);
```

### Adding to Common Components

Wrap handler functionality for Foundation creators:

```jsx
// In @uniweb/common-components
export function NewComponent({ children, ...props }) {
    const data = window.uniweb.newHandler.useNewHandlerEffect(useState, useEffect);

    return <div>{/* Component implementation */}</div>;
}
```

## Architecture Decisions

### Why Two Scripts?

-   **Separation of Concerns**: Vanilla for browser, React for UI
-   **Independent Updates**: Can update React without touching handlers
-   **Performance**: Vanilla layer has zero React overhead
-   **Compatibility**: Handlers work regardless of React version

### Why Module Federation?

-   **Runtime Loading**: No rebuild needed for updates
-   **Shared Dependencies**: React loaded once, used by all
-   **Independent Deployment**: Foundations update without coordination
-   **Cache Efficiency**: CDN caching at module level

### Why Global Object?

-   **Persistence**: Survives React component lifecycle
-   **Simplicity**: One namespace, clear access
-   **Performance**: No context provider overhead
-   **Debugging**: Easy to inspect in console

## Maintenance Guidelines

### Backward Compatibility

The Engine is infrastructure - breaking changes affect every site. Follow these principles:

-   Never remove handler methods
-   Deprecate gradually with warnings
-   Version the API if breaking changes necessary
-   Test against multiple Foundation versions

### Performance Budget

-   Vanilla engine must stay under 75KB gzipped
-   React SPA core must stay under 150KB gzipped
-   Handler operations must complete in <10ms
-   Event publishing must stay under 1ms

### Security Reviews

-   All handlers touching backend reviewed quarterly
-   Penetration testing annually
-   Dependency updates monthly
-   CSP and CORS policies reviewed per feature

## The Bigger Picture

Uniweb Engine is infrastructure that enables a new development model:

-   **Foundation creators** build once, deploy everywhere
-   **Agencies** maintain Foundations, not individual sites
-   **Content teams** build sites without developers
-   **Sites** improve automatically when Foundations update

This only works because the Engine provides:

-   Stable runtime infrastructure
-   Dynamic module loading
-   Centralized configuration
-   Abstracted complexity

## Contributing

Engine contributions require understanding the full architecture. Areas for contribution:

-   **Performance optimizations** in handlers
-   **New handlers** for emerging browser APIs
-   **Security enhancements**
-   **Developer experience** improvements
-   **Documentation and examples**

Before contributing:

1. Read this document completely
2. Set up development environment
3. Run existing tests
4. Discuss major changes in issues first

## Conclusion

Uniweb Engine is the invisible foundation that powers visible results. It's sophisticated infrastructure that presents simple APIs. It's vanilla JavaScript and React working together. It's the engine that loads Foundations, manages data, handles security, and makes everything just work.

For Foundation creators, it's invisible. For content teams, it's irrelevant. But for those of us maintaining and extending it, it's the critical infrastructure that makes the entire Uniweb platform possible.

---

_This document is for Uniweb Engine maintainers and contributors. For Foundation development, see the [Uniweb Framework documentation]() and [Building Foundations: A Guide](). For content teams, see the [Uniweb App guide]()._
