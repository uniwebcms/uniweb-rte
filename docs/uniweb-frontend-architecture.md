# Uniweb Frontend Architecture

## Understanding the Engine Behind the Platform

This document is for developers who need to understand the infrastructure that powers the frontend of Uniweb sites. If you're here, you're probably maintaining the core libraries, extending them, or trying to understand how Foundation creators' work actually runs in production. This is about the engine under the hood, not the layers that depend on it.

## The Three-Layer Reality

When someone builds a website using Uniweb, they're actually interacting with three distinct systems that combine into one. Foundation creators write content-rendering components. Content teams write text, upload assets, and order sections. But underneath, there's an intricate dance between browser APIs, module loading, and configuration management that makes it all work.

The Uniweb platform consists of the Engine (what this document covers), the Framework (tools for Foundation creators), the backend (including cloud services), and the App (where content teams build sites). Most people never need to know the Engine exists. That's by design. But since you're reading this, you need to understand how these pieces actually fit together.

## Quick Glossary

Framework for developers. App for content teams. Engine connecting them.

A **Foundation** is a collection of components designed to work together and render the contents of a website. Critically, a Foundation is also a **capability boundary**—it defines what content teams can accomplish when building sites. If a Foundation doesn't provide a carousel component, sites using it can't have carousels. If a component doesn't expose dynamic data integration, content teams can't use dynamic data in that section.

A **component** in the context of a Foundation is a purposeful block for section-level communication. It is not a UI component like a button or card. UI components are internal concepts, often used as the building blocks of Foundation components.

A **section** is a region of a page with a specific communication job: Hero, Features, FAQ, Testimonials, etc.

**Foundation developers** build section-level component systems that content teams use to create unlimited professional websites—without ongoing developer involvement.

A **Primary Foundation** is the main and required Foundation of a site, and it serves as the literal foundation of what's possible for that site. All section-level components come from the Primary Foundation, ensuring design coherence. Content teams work entirely within the capabilities the Primary Foundation provides. Secondary Foundations may be added to a site to extend these capabilities with specialized child components, such as a specific animation for the Hero section of a particular site.

**Module Federation** allows a website to load Foundations at runtime. Each module is versioned and packages one Foundation. Sites control their update strategy (automatic, patch-only, minor-only, or pinned) through backend configuration evaluated at runtime, balancing automatic improvements with stability needs. Federated modules can be shared across sites. Updates propagate without republishing sites.

```
Developer                    Runtime                     Content Team
Builds Foundation     →      Engine loads it      ←      Uses App to build
(Framework)                  (Module Federation)          (Visual CMS)
```

## The Two Scripts That Run Everything

Every Uniweb site starts with two JavaScript files. Not twenty. Not a complex build process. Two files that provide all the infrastructure everything else needs.

The first script is pure vanilla JavaScript. It creates a single global object called `window.uniweb` and populates it with handlers for everything that needs to persist across the page lifecycle. Storage, events, configuration, module loading, form handling, consent management—all the messy browser-level stuff that React shouldn't have to think about.

The second script is the React SPA core. React itself, React Router, and the minimal infrastructure needed to mount and render Foundation sections. No site-specific components, no business logic, just the platform for components to run on.

Why two scripts instead of one? Because they have fundamentally different responsibilities and lifecycles. The vanilla script needs to exist before React loads, survive when React unmounts components, and provide stable APIs regardless of React version. The React script needs to be optimizable, tree-shakeable, and upgradeable without breaking the vanilla layer.

## The Global Object That Breaks the Rules

Modern JavaScript development teaches us that global variables are bad. Uniweb deliberately creates one anyway: `window.uniweb`. This isn't carelessness—it's a deliberate architectural decision that solves real problems.

The `window.uniweb` object is an _engine_ that exists outside React's lifecycle entirely. When a component unmounts, the engine remains. When you navigate to a new page, the engine is still there. When a Foundation section loads dynamically, it has immediate access to everything it needs via the engine.

Inside this global object, you'll find handlers for specific concerns. The storage handler manages localStorage with scoping and automatic cleanup. The eventBus enables pub/sub communication across the entire application. The loader handles the complex dance of fetching Foundation modules. Each handler is a vanilla JavaScript class instance that manages its own state and exposes methods both for direct calls and React integration.

## Module Federation: The Architecture's Secret Weapon

Here's where Uniweb becomes genuinely interesting. Foundation components aren't bundled with the site. They're not installed as NPM packages. They're not compiled together. Instead, they live as independent webpack federated modules that load dynamically at runtime. Importantly, they are primarily concerned with rendering whole page sections instead of being compositional building blocks.

When a Foundation creator builds their components and deploys them, they're publishing a federated module to a CDN. This module contains all the section components, their styles, and a manifest describing what's available. But crucially, it doesn't contain React, the router, or any of the core infrastructure. Those are marked as shared dependencies that will be provided by the host site at runtime.

The loader fetches Foundation modules when the SPA site is loaded, and webpack's module federation system links them with the shared dependencies. Exposed components can be light. Code chunks and lazy loading of internal components are handled within each Foundation.

The power of module federation is twofold. It lets a Foundation plug into the visual editor used by content teams, and it lets Foundation creators update rendering logic without republishing sites. Every site using a Foundation gets its update immediately as a new Foundation version is published. No rebuilding. No redeploying. No coordination. The next site load pulls the new version from the CDN, and suddenly the site has the updated rendering logic.

This approach allows Uniweb to work with different component systems. Foundation creators can maintain one codebase that powers multiple sites. Agencies can update a Foundation and watch multiple client sites improve instantly. It's not just convenient—it fundamentally changes the economics of web development.

### Version Control Strategy

While Foundations can update instantly, sites control their update strategy through backend configuration:

-   **Automatic updates**: Accept all new versions immediately (default)
-   **Patch only**: Auto-update for patch versions (1.2.x)
-   **Minor only**: Auto-update for minor and patch versions (1.x.x)
-   **Pinned**: Lock to a specific version

This evaluation happens at runtime when the backend generates the SPA page, providing:

-   Zero-downtime rollback capabilities
-   A/B testing of new Foundation versions
-   Gradual rollout strategies
-   Protection for mission-critical sites

The version strategy lives in site configuration, not in code, maintaining the principle that configuration drives behavior.

## The Bridge Between Worlds

One of Uniweb Engine's more elegant patterns is how it bridges the imperative world of vanilla JavaScript with the declarative world of React. The problem is classic: you have stateful handlers in vanilla JavaScript that React components need to observe. You could expose the handlers directly and let components manage subscriptions, but that leads to boilerplate and mistakes.

Instead, Uniweb handlers provide methods that accept React's hooks as parameters. This sounds strange at first—passing `useState` and `useEffect` as function arguments—but it creates a remarkably clean interface. For example:

```javascript
// In vanilla handler
class DataHandler {
    /**
     * Helper function for React useState/useEffect combo. It fetches
     * data via the async initialize() method.
     *
     * @param {function} useState - The React useState function.
     * @param {function} useEffect - The React useEffect function.
     * @returns {bool} True if the data is ready and false otherwise.
     */
    useReadyStateEffect(useState, useEffect) {
        const [, setState] = useState();

        // Provide an empty array as the second parameter of useEffect, so
        // the effect runs only once, after the initial component render.
        // It won't have any dependencies and won't be triggered by any changes.
        useEffect(() => {
            this.initialize(setState);
        }, []);

        return this.isReady();
    }
}
```

When a handler implements a bridge method, it takes control of the React integration. It can set up subscriptions, manage cleanup, trigger re-renders appropriately, and return synchronized state. From the React component's perspective, it's just calling a hook. From the handler's perspective, it's managing states with a imperative approach. Both sides get what they need without complexity leaking across the boundary.

The Common Components library uses these bridge methods internally. When a Foundation creator uses the Form component, they don't know it's bridging to `window.uniweb.form`. They just know that forms work, handle errors gracefully, and submit data correctly whether configured for direct or presigned-URL POST uploads.

## How Data Flows Through the System

Understanding Uniweb means understanding how data moves through its layers. It starts with configuration. When a page loads, the backend sends configuration data that becomes `window.uniweb.config`. This isn't just settings—it's behavioral programming. The configuration determines which Foundation to load, how forms submit, what consent is required, which analytics to track, how to handle errors, and dozens of other decisions.

This configuration flows into each handler during initialization. The formSubmission handler reads whether to use presigned URLs or direct submission. The consent handler learns what permissions need user approval. The loader discovers which Foundation modules to fetch. Every handler configures itself from this single source of truth.

When a user interacts with the site, events flow through the eventBus. A form submission publishes a 'formSubmitted' event. The analytics handler subscribes to track conversions. UI components listen to show success messages. The architecture is intentionally decoupled—publishers don't know who's listening, and subscribers don't care who's publishing. This loose coupling enables features to be added without modifying existing code.

## The Security Architecture That Users Never See

Security in Uniweb happens at multiple levels, most invisible to developers using the platform. At the configuration level, the backend controls all security policies. It decides what tokens to use, what domains to trust, what content to allow. The frontend enforces these policies but doesn't define them.

At the handler level, security is centralized. Token management happens in one place. CSRF protection is consistent across all requests. Input sanitization follows the same rules everywhere. This centralization makes security auditable and updatable without touching component code.

The network level adds another layer. All backend communication flows through handlers that enforce HTTPS, respect CORS policies, and validate responses. Foundation sections can't make arbitrary requests—they go through the established channels or they don't go at all.

Perhaps most importantly, the architecture makes secure defaults easy and insecure patterns hard. Forms automatically get CSRF tokens. File uploads automatically use presigned URLs. Consent automatically manages expiry. Developers get security without having to think about it.

## Performance: The Constraint That Shapes Everything

The Uniweb Engine operates under strict performance constraints. The vanilla engine must stay under 75KB gzipped. The React SPA core aims for 150KB. Together, they need to load, parse, and initialize in under 100ms on average hardware. These aren't arbitrary limits—they're what makes Uniweb viable for production sites that care about Core Web Vitals.

These constraints shape every architectural decision. Handlers lazy-load their implementations. Event publishing uses direct function calls, not complex routing. Storage operations leverage browser-native performance. Module federation enables code splitting at the section level.

The real performance win comes from caching. The two core scripts cache aggressively at CDN edges. Foundation modules cache separately, shared across all sites using them. Configuration caches with appropriate TTLs. The result is that repeat visits often load no JavaScript at all—everything comes from memory.

## Extending the Engine Without Breaking the World

The Engine is core infrastructure. When you change it, you potentially affect every site using Uniweb. This responsibility shapes how we approach extensions and modifications.

Adding new handlers is relatively safe. The pattern is established: create a class that accepts config, eventBus, and storage in its constructor. Implement your core functionality. Add a bridge method for React integration. Register it as a property on `window.uniweb`. The existing handlers provide templates for everything from simple utilities to complex workflows.

Modifying existing handlers requires more care. The API is effectively public once sites use it. Methods can be deprecated but not removed. Behaviors can be enhanced but not changed. When breaking changes are absolutely necessary, they need version flags in configuration to maintain compatibility.

The **Common Components library** provides another extension point. New components can wrap handler functionality for Foundation creators. These components abstract the complexity, providing clean React interfaces to vanilla JavaScript capabilities. A Foundation creator using a new component doesn't need to know about the handler underneath—they just need to know what props to pass.

## Development and Debugging Reality

Developing the Engine requires a different mindset than typical web development. You're not building features—you're building the platform that features run on. The development environment reflects this. You run both the vanilla and React builds in watch mode. You have a test Foundation that exercises core functionality. You can simulate different configurations, network conditions, and error states.

Debugging production issues means understanding the full stack. When a form fails to submit, is it the component, the handler, the configuration, or the network? The Engine provides diagnostic tools, but using them requires understanding how the layers interact. Debug mode enables comprehensive logging. Event monitoring shows the flow of messages. Handler inspection reveals internal state. But interpreting this information requires knowing what should happen, not just what is happening.

Testing the Engine means testing at multiple levels. Unit tests verify handler logic. Integration tests confirm handlers work together. Component tests ensure React bridges function correctly. End-to-end tests validate the full flow from user interaction to backend response. Each level catches different problems, and skipping any level leaves gaps that production will find.

## The Philosophy Embedded in Code

Uniweb Engine embodies specific philosophical positions about web development. It believes that global state isn't bad if it's intentional and limited. It assumes that configuration is better than code for behavioral changes. It insists that vanilla JavaScript and React serve different purposes and should be kept separate. It argues that runtime module loading enables business models that build-time bundling doesn't.

These aren't universal truths—they're positions taken for specific reasons in a specific context. Uniweb exists to enable Foundation creators to build once and deploy everywhere. It exists to let agencies maintain Foundations instead of individual sites. It exists to let content teams build without developers. Every architectural decision serves these goals.

The Engine doesn't try to be everything. It's infrastructure for a specific platform with specific needs. Understanding this focus helps explain why certain features exist and others don't.

## The Bigger System

The Uniweb Engine only makes sense as part of the complete platform. Foundation creators build on top of it without knowing it exists. Content teams create sites without writing code. The Engine enables these experiences by handling the complexity they shouldn't have to think about.

When a Foundation creator writes a collection of section components, they're actually writing a federated module that will be dynamically loaded, linked with shared dependencies, and rendered in an environment they don't control. But they don't need to know this. They import from Common Components, write React, and deploy. The Engine makes it work.

When a content team builds a site, they're working within the capability boundary defined by their chosen Foundation. They compose sections, configure components through the options the Foundation exposes, and arrange content—all without understanding module loading, configuration management, or complex state machines. They just see sections to edit, lists to order, and a publish button that makes it all go live. The Engine handles the machinery.

This invisible complexity is the Engine's success metric. The less people need to think about it, the better it's doing its job. The best infrastructure disappears into the background, enabling work without announcing itself.

Understanding Foundations as capability boundaries is crucial to understanding why the Engine is architected this way. The Engine must reliably deliver preprocessed content to Foundation components, manage dynamic module loading, and provide stable infrastructure—because Foundation creators are defining not just what sites look like, but what content teams can accomplish.

For more on how Foundations work as capability boundaries and design considerations for Foundation creators, see the **Building Foundations: A Guide**.

## Contributing to the Engine

If you're considering contributing to the Engine, you need to understand both its technical architecture and its role in the larger system. Performance improvements help every site. New handlers enable new capabilities for Foundation creators. Security enhancements protect all users. Documentation helps future maintainers.

But contributions also need to respect the constraints. The size budget is real. The API compatibility is non-negotiable. The separation between layers must be maintained. The philosophy should be understood even if not fully agreed with.

Before diving into code, understand the system. Run the development environment. Build a test Foundation. Create a site using it. Break things and fix them. Understand not just how the Engine works, but why it works that way.

## Conclusion

The Uniweb Engine is infrastructure that enables a platform that enables a new model of web development. It's two scripts that load on every page, a global object that breaks conventional rules, handlers that manage complexity, and bridges that connect different worlds.

For most people using Uniweb, the Engine is invisible. For those of us maintaining it, it's the critical foundation that makes everything else possible. It's not glamorous work—infrastructure rarely is. But it's work that multiplies the efforts of every Foundation creator and enables every content team.

The Engine will evolve. New browser APIs will need handlers. New use cases will need support. Performance will need optimization. Security will need hardening. But the fundamental architecture—the separation of vanilla JavaScript and React, the dynamic module loading, the configuration-driven behavior—this foundation has proven itself in production and will continue to serve as Uniweb grows.

Understanding the Engine means understanding these layers, these flows, these constraints, and these possibilities. It means seeing not just the code but the system, not just the implementation but the intention, not just what is but what could be.
