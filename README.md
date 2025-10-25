# Uniweb RTE (Runtime Engine)

Uniweb RTE is a flexible and streamlined way to power a website whose components are provided by a remote runtime module.

## Core Concepts

### Sites and Foundations

-   A **site** is your content – pages, assets, and configuration
-   A **Foundation** is a collection of React components designed to work together
-   A **module** is how Foundations are packaged and delivered to sites

Each site links to one Foundation (local or remote) that provides all the components it needs.

### Content-Driven Rendering

Content is written in markdown with YAML frontmatter that specifies which component to use:

```markdown
---
component: HeroSection
layout: centered
background: dark
---

# Welcome to Our Platform

Discover innovative solutions for your business.
```

At runtime, the Framework connects site content with the appropriate component from its primary Foundation.

## 🚀 Why Uniweb RTE?

### **A Developer-First Approach**

Uniweb RTE is a lightweight JavaScript engine that runs in every Uniweb-based site and provides all the needed core functionality so that Foundation creators can focus on writing components that receive preprocessed content and render it.

### **What Uniweb Is**

Uniweb is a platform of web technologies for content management developed by [Proximify](https://www.proximify.com). The [Uniweb App](https://www.uniweb.app) is a no-code content management system (CMS), with its main instance at [uniweb.app](https://www.uniweb.app) and enterprise instances available for organizations. It helps content teams create dynamic websites using Foundations created by developers.

### **What Uniweb Framework Is**

A web development framework built on separation of concerns. **Content** lives in sites – markdown files and assets. **Foundations** provide the React components that render that content.

This architecture means content teams and developers work independently – content editors compose pages using intuitive components, developers build those components.

## Next Steps

Depending on your role, you might want to explore one of our specialized guides:

-   [Uniweb Frontend Architecture](docs/uniweb-frontend-architecture.md) - Learn the core concepts needed to contribute to the RTE project

-   [RTE: Technical Reference](docs/rte-technical-reference.md) - Technical guidance for Uniweb Engine maintainers and contributors

-   [Understanding the Uniweb Framework](docs/uniweb-framework.md) - An introduction to the Uniweb Framework

## 📥 Get Involved

Uniweb RTE is an **open-source project** – we welcome contributions, feedback, and ideas!

## Learn More

-   🏠 **[Framework Website](https://framework.uniweb.app)** – Guides, blog, and comprehensive resources
-   📘 **[Documentation](https://docs.framework.uniweb.app)** – Complete API reference and tutorials
-   🚀 **[Uniweb App](https://uniweb.app)** – Visual content editor and hosting platform
-   💡 **[Examples](https://github.com/uniwebcms/examples)** – Sample Foundations and components
-   🛠️ **[Community Interfaces](https://github.com/uniwebcms/interfaces)** – Standard component specifications

## License

This project is licensed under GPL-3.0-or-later.

---

**Uniweb RTE: Build Smarter. Test Faster. Stay Flexible.**
