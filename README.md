# Uniweb RTE (Runtime Environment)

**Uniweb RTE** is an **open-source runtime environment** for websites powered by remote runtime modules. It provides a **lightweight, self-hosted alternative** for testing, developing, and deploying runtime module-based sites without requiring access to a [Uniweb](https://uniwebcms.com) app.

## 🚀 Why Uniweb RTE?

### **A Developer-First Approach**

Uniweb RTE is a flexible and streamlined way to power a website whose components are provided by a remote runtime module.

### **What Uniweb RTE Is**

-   **An open-source engine** that lets you self-host Uniweb-compatible sites with your own data.
-   **A local environment** for testing Uniweb runtime modules.
-   **A flexible tool that can evolve with community contributions** for use-cases that don't require a CMS backend.

### **What Uniweb CMS Is**

[Uniweb](https://uniwebcms.com) is a no-code content management system (CMS), with its main instance at [uniweb.app](https://uniweb.app) and enterprise instances available for organizations. It helps everyone create dynamic websites with ease. Each website is linked to a component library packaged as a runtime module. By using Uniweb, you'll enjoy benefits like:

-   👥 **Teamwork:** Work with content creators by providing components they can select and customize.
-   🌐 **Infrastructure:** Use standard features like hosting, multilingualism, search, and dynamic data.
-   🔁 **Reusability:** Share components across multiple websites to save time and effort.
-   🔧 **Maintainability:** Easily update your component library and watch the changes propagate to all connected websites.

### **What Uniweb RTE Is _Not_**

-   **A replacement for Uniweb CMS** – Uniweb CMS remains the most advanced, full-featured way to build and manage Uniweb-powered sites.
-   **A feature-complete alternative** – While Uniweb RTE enables local testing and deployment, it does not provide the full-scale infrastructure, integrations, and management features of Uniweb CMS.
-   **A content management solution** – Unlike Uniweb CMS, Uniweb RTE does not include built-in tools for content editing, workflow management, or administrative controls.

## 🔧 Getting Started

Uniweb RTE is designed to be simple to set up and use as an npm package within a Git project. Each site runs independently, making it easy to manage and deploy. Follow these steps to start developing with it:

### 1️⃣ Create a New Git Project

Start by creating a new Git repository or using an existing one:

```bash
git init my-site
cd my-site
```

### 2️⃣ Install Uniweb RTE

Install Uniweb RTE as a local dependency:

```bash
npm install @uniwebcms/uniweb-re --save-dev
```

### 3️⃣ Initialize the Site

Run the following command to set up the necessary project structure:

```bash
npx uniweb-re init
```

This will generate the required folder structure and configuration files for your site.

### 4️⃣ Link a Runtime Module

Once your site is initialized, link a runtime module by specifying its URL:

```bash
npx uniweb-re use <module-url>
```

The module URL can be a public location or a **local instance running on another port**. If using a local module, ensure that it is being served separately, typically through a local development web server.

### 5️⃣ Start Local Development

Run the following command to start the development server:

```bash
npx uniweb-re start
```

Now, your local site is running and using the selected runtime module. Uniweb RTE includes a lightweight web server that serves the project as a **single-page application (SPA)**, using **React Router** and other client-side technologies to handle navigation and rendering.

## 🔄 Using Local Modules

When working with a local runtime module, remember:

-   **The module project and the Uniweb RTE project are separate repositories.**
-   The module must be **served locally** on a different port.
-   Our starter repo for module development includes a built-in web server and scripts to simplify local hosting.
-   The same hosting setup is used whether the module is consumed by a Uniweb RTE project or accessed via a public tunnel.

Example workflow for using a local module:

```bash
# In the runtime module project (e.g., my-module)
npx uniweb-module start --port 5001

# In the Uniweb RTE project (e.g., my-site)
npx uniweb-re use http://localhost:5001
npx uniweb-re start
```

## 🛠 How It Works

Uniweb RTE provides a **simplified version of the Uniweb Core library**, initially geared towards working with static data. The first versions read data for each page section from a JS or JSON file. While multilingual support and dynamic data fetching may be introduced over time, Uniweb RTE currently focuses on providing a **self-contained, developer-friendly package** for structured content.

### **Key Features**

✅ **Local-first development** – No need to set up tunnels or external dependencies.  
✅ **Realistic testing environment** – See how your runtime module behaves in a real runtime.  
✅ **Composable architecture** – Works with any Uniweb-compatible runtime module.  
✅ **Open-source & extensible** – The community can shape its evolution.

## 🤝 Why This Matters for You

If you’re a **developer building Uniweb modules**, Uniweb RTE is your **go-to environment for rapid iteration and debugging**. Initially, you can work fully locally within Uniweb RTE. Then, as a second step, you can test with Uniweb CMS using a **streamlined localhost tunnel setup** to ensure full functionality, including dynamic data, site indexing, and integrations. This allows you to refine your module incrementally—unless you’re already confident and prefer to deploy directly.

If you’re a **team or client commissioning a runtime module**, Uniweb RTE provides **peace of mind**—knowing that your module can run independently, making long-term flexibility and adaptability easier.

If you’re a **self-hosting enthusiast**, while Uniweb RTE isn’t designed as a full CMS replacement, its **modular architecture** allows the community to explore new use cases and hosting models.

## 🎯 Uniweb RTE vs. Uniweb CMS

| Feature            | Uniweb RTE       | Uniweb CMS                  |
| ------------------ | ---------------- | --------------------------- |
| Runtime Modules    | ✅ Supports      | ✅ Supports                 |
| Full CMS Features  | 🚫 Limited       | ✅ Complete                 |
| Content Management | 🚫 Manual        | ✅ Integrated UI            |
| Hosting Model      | 🏠 Self-hosted   | ☁️ Uniweb Cloud             |
| Collaboration      | 🚫 Limited       | ✅ Supports content writers |
| Developer Focus    | 🛠 Module Testing | 🏗 Site Building             |

## 💡 The Bigger Picture

Uniweb RTE isn’t just a dev tool—it’s a **gateway to the Uniweb ecosystem**. By making module development easier, we’re ensuring **Uniweb’s runtime module architecture is open, flexible, and future-proof**. We believe in giving developers the best tools possible while ensuring Uniweb CMS remains the **best-in-class premium platform** for content creators and businesses.

## 📥 Get Involved

Uniweb RTE is an **open-source project**—we welcome contributions, feedback, and ideas!

-   Report issues: [GitHub Issues](#)
-   Discuss features: [Community Forum](#)
-   Contribute: [Pull Requests Welcome](#)

## 🏁 Ready to Get Started?

Jump in and try Uniweb RTE today:

```bash
git init my-site
cd my-site
npm install @uniwebcms/uniweb-re --save-dev
npx uniweb-re init
npx uniweb-re use <module-url>
npx uniweb-re start
```

Start developing and see how **Uniweb’s powerful runtime module system** can work for you!

---

**Uniweb RTE: Build Smarter. Test Faster. Stay Flexible.**
