# Understanding the Uniweb Framework

## What Uniweb Framework Actually Is

Uniweb Framework is a practical solution to a specific problem: how do you build multiple CMS-driven websites that share core technology while allowing independent component development? The answer isn't another monolithic framework, but rather a carefully layered architecture that separates concerns through clear boundaries.

At its simplest, Uniweb consists of two JavaScript files loaded by every site:

1. A vanilla JavaScript file that creates `window.uniweb`
2. A React SPA core with React Router

That's the foundation. Everything else builds on top of these two scripts.

## The Architecture Layers

### Layer 1: The Vanilla JavaScript Engine

The first script creates a single global object: `window.uniweb`. This object contains properties that are instances of various handler classes:

-   `uniweb.config` - Configuration data sent from the backend at page load
-   `uniweb.storage` - Enhanced localStorage with scoping and auto-cleanup
-   `uniweb.eventBus` - Pub/sub messaging system
-   `uniweb.form` - Handles the complexity of form submissions
-   `uniweb.security` - Manages reCAPTCHA integration
-   `uniweb.consent` - Handles user consent for GDPR compliance
-   `uniweb.profile` - Fetches and caches user/project/group data

Each of these is a vanilla JavaScript class instance that persists throughout the page lifecycle. They handle all the messy details of browser APIs, backend communication, and state management.

### Layer 2: The React SPA Core

The second script is the React application itself - React, React Router, and core UI functionality. This provides the foundation for building component-based user interfaces. Importantly, this layer doesn't contain site-specific components - just the core infrastructure.

### Layer 3: Common Components (NPM Library)

This is where it gets interesting. Uniweb provides an NPM library of Common Components - React components that wrap the functionality of `window.uniweb`. For example:

-   `<Form>` - A complete form component that uses `uniweb.form` internally
-   `<Image>` - Smart image loading with lazy loading and optimization
-   `<Video>` - Video player with analytics and performance tracking

Component developers import these from the NPM package and use them without ever knowing that `window.uniweb` exists. A developer building a contact form just writes:

```jsx
import { Form } from '@uniweb/common-components';

function ContactSection() {
    return (
        <Form formId="contact" previewFields={['email', 'name']}>
            <input name="email" type="email" />
            <input name="name" />
            <textarea name="message" />
        </Form>
    );
}
```

The Form component handles everything - consent checks, reCAPTCHA, S3 uploads, retries, error handling - all by calling methods on `window.uniweb` internally.

### Layer 4: Federated Modules (Foundations)

This is where Foundation creators work. Foundations are collections of section-level components packaged as Webpack federated modules. But critically, a Foundation is more than just components—it's a **capability boundary** that defines what content teams can accomplish when building sites.

When a content team uses the Uniweb App to create a website, they work entirely within the constraints of their chosen Foundation. If the Foundation doesn't provide a carousel component, they can't add carousels. If a component doesn't support dynamic data, they can't use dynamic data in that section. If a component offers three layout options, they get exactly those three options—no more, no less.

The **Primary Foundation** serves as the literal foundation of a site—it's where all section-level components come from, and it defines the boundaries of what's possible for content teams. Secondary Foundations can extend these capabilities with specialized components, but the Primary Foundation establishes the core capability boundary.

These federated modules:

-   Build independently from the core
-   Share React and core dependencies at runtime
-   Can be updated without touching the core scripts
-   Import Common Components from the NPM library

A Foundation might export components like Hero, Features, Testimonials, ContactForm—all built using Common Components, never directly touching `window.uniweb`. But more importantly, each Foundation makes architectural decisions about what content teams can do: which components support dynamic data, how much layout flexibility exists, what can be composed, and what constraints maintain design coherence.

### Layer 5: The Sites Themselves

Finally, individual sites load:

1. The two core scripts (vanilla JS + React SPA)
2. One or more federated modules (Foundations)
3. Configuration from the backend

The site assembles these pieces into a complete application, with content teams working within the capability boundaries defined by their Foundation choices.

## Why This Architecture Matters

### For Component Developers

Foundation creators work at the component design layer but make architectural decisions with wide impact. They're not just building UI—they're defining what's possible for every site that uses their Foundation.

Most Foundation creators import Common Components, build section-level components with them, and never need to understand:

-   How forms actually submit to the backend
-   How reCAPTCHA tokens are managed
-   How consent is tracked and stored
-   How dynamic data is fetched via AJAX requests

But they do need to think about capability boundaries: which components to provide, how configurable they should be, what constraints maintain design quality.

### For the Core Team

The core team maintains:

-   The vanilla JS engine with all its handlers
-   The React SPA core
-   The Common Components library

When they need to change how forms submit (say, switching from direct POST to presigned URLs), they update the FormHandler. No component code changes. The backend just sends different configuration.

### For Backend Developers

The backend controls frontend behavior through configuration sent at page load:

```javascript
window.uniweb.config = {
    formConfig: {
        method: 'presigned', // or 'direct'
        token: 'csrf-token-here'
    },
    consent: {
        required: ['recaptcha', 'analytics']
    }
};
```

Change the config, change the behavior. No frontend deployment needed.

### For DevOps

Clear separation means:

-   The two core scripts can be cached aggressively
-   Federated modules can deploy independently
-   Configuration changes don't require deployments
-   Each layer has clear performance characteristics

## The Key Insight

What makes Uniweb valuable isn't any single technical innovation. It's recognizing that different concerns belong at different layers:

-   **Browser-level concerns** (storage, events) → Vanilla JS layer
-   **UI framework concerns** (components, routing) → React layer
-   **Common patterns** (forms, images) → Common Components
-   **Capability boundaries** (what's possible for sites) → Foundations
-   **Site-specific features** → Foundation implementations
-   **Business logic and configuration** → Backend

By respecting these boundaries, each team can work at their appropriate level of abstraction without stepping on each other's toes.

## Real Example: Form Submission Flow

Let's trace what happens when a user submits a form:

1. **User fills out a form** built with the Common Components Form component
2. **Form component** (from NPM library) calls `window.uniweb.form.submit()`
3. **FormHandler** (in vanilla JS layer):
    - Considers whether the form has files to submit
    - Submits JSON to backend or request presigned URLs for JSON and files
    - Sends finalize requests if using presigned URLs
4. **Throughout this process**:
    - `uniweb.eventBus` publishes events that other entities can listen to
    - `uniweb.consent` is checked for necessary permissions
    - `uniweb.security` provides reCAPTCHA tokens if needed
5. **Component just shows** loading state and result - all complexity hidden

## The Bridge Pattern

One pattern Uniweb uses is having vanilla JS handlers provide React hook-compatible methods. This creates a clean interface between the imperative vanilla JavaScript world and the declarative React world:

```javascript
// In vanilla JS handler
class ConsentHandler {
    // ... handler logic ...

    useConsentEffect(useState, useEffect, key) {
        const [, setState] = useState(this.has(key));
        useEffect(() => {
            const unsub = this.eventBus.subscribe('consentUpdated', ({ key: k, granted }) => {
                if (k === key) setState(granted);
            });
            return unsub;
        }, []);
        return this.has(key);
    }
}
```

This lets React components sync with vanilla JS state using familiar patterns:

```jsx
function MyComponent() {
    const hasConsent = window.uniweb.consent.useConsentEffect(useState, useEffect, 'analytics');
    // ... use hasConsent normally
}
```

But again, component developers rarely write this - it's hidden inside Common Components.

## What Makes Uniweb Different

Uniweb is focused on enabling website creation through Foundations:

**For building websites**, the engine + Framework + Foundation provide a complete solution. This is where Uniweb delivers its core value—enabling Foundation creators to build once and deploy everywhere, with instant updates across all sites using their Foundation.

**For building advanced applications**, the underlying technology works (we use it to build the Uniweb App itself), but you'd need substantial additional code that isn't currently open source or documented. The lower layers alone aren't sufficient for general application development without significant custom infrastructure.

This focused approach serves websites that need to:

-   Share core technology
-   Allow independent component development
-   Abstract backend complexity
-   Maintain clear team boundaries
-   Support configuration-driven behavior

In summary, the engine/framework can power complex applications, but we're focused on the website-building use case because:

-   That's where we provide the complete stack (including Foundations)
-   That's where the Foundation model creates unique value (build once, update everywhere)
-   The app-building use case requires developers to build their own significant infrastructure

For understanding how to design and build Foundations within this architecture, see the **Building Foundations: A Guide**.

## The Philosophy

Uniweb embodies several philosophical choices:

1. **Global state isn't evil if it's intentional and limited** - One global object is better than state scattered everywhere

2. **Abstraction layers should match team boundaries** - Component developers shouldn't need to understand backend protocols

3. **Configuration is better than code for behavior** - Let the backend control frontend behavior without deployments

4. **Vanilla JS for persistence, React for UI** - Use each technology for what it's good at

5. **Hide complexity, not functionality** - Make simple things simple, but don't prevent complex things

6. **Capability boundaries empower content teams** - Foundations define what's possible, enabling unlimited sites within intentional constraints

## Current State and Future Direction

Uniweb has been battle-tested across multiple production sites. The core architecture - the two scripts, the global object, the Common Components abstraction, the federated modules - has proven stable and maintainable.

Areas for expansion:

-   More Common Components for typical use cases
-   Better debugging and development tools
-   Framework bridges beyond React (Vue, Svelte)
-   Performance monitoring and optimization tools
-   Documentation and examples for common patterns

The framework is being open-sourced to gather community input and contributions. The goal isn't to compete with general-purpose frameworks but to provide a solid foundation for teams building multiple sites with shared infrastructure.

## Technical Considerations

### Performance Impact

The two-script architecture has measurable impacts:

-   Initial load: ~150KB for both core scripts (gzipped)
-   Handler initialization: ~5ms on modern browsers
-   Event publishing overhead: negligible (<0.1ms)
-   Storage operations: leverages browser's native performance

Federated modules add their own weight but their exposed components can be lightweight and rely on internal components with code splitting and lazy loading.

### Browser Support

Uniweb targets modern browsers (ES6+). The vanilla JS layer handles browser API differences, so Common Components don't need to worry about compatibility.

### Security Model

-   All backend communication happens through the vanilla JS layer
-   CSRF tokens managed centrally
-   Content Security Policy compatible
-   XSS prevention through centralized input handling

## Adoption Path

For teams considering Uniweb:

### Evaluate Fit

Uniweb makes sense if you:

-   Want to cleanly separate content from code
-   Create multiple sites with shared infrastructure
-   Need configuration-driven behavior changes
-   Want to separate component development from backend complexity

### Start Small

1. Use the Framework to build a complete Foundation for some website use case, such as documentation, marketing, or learning.
2. Use Common Components to simplify your implementation
3. Create a site using your Foundation and choice of content
4. Gradually add more components and options to your Foundation
5. Share your foundation across new website projects

## Conclusion

Uniweb is an architectural pattern that emerged from real needs. It's not trying to change web development at the coding level. It's providing structure for a specific problem: building and maintaining multiple sites with shared technology, and cleanly separating concerns.

The power comes from respecting boundaries. The vanilla JS layer owns browser interactions. React owns the UI. Common Components provide the abstraction. Foundations define capability boundaries and enable independence. Configuration drives behavior.

This separation isn't arbitrary - it matches how teams actually work. And that alignment between architecture and organization is what makes Uniweb effective in practice.

The framework is now open source because the patterns are worth sharing, the architecture has proven itself, and community input can help it evolve to serve more teams facing similar challenges.
