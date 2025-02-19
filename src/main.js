// React and ReactDOM
import React from 'react';
import { createRoot } from 'react-dom/client';

// Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// Components
import { ChildBlocks } from './components/PageRenderer.jsx';
import Link from './components/Link.jsx';
import SafeHtml from './components/SafeHtml.jsx';
import WebsiteRenderer from './components/WebsiteRenderer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Core
import Uniweb from './core/uniweb.js';

/**
 * Initializes the Uniweb instance with configuration and routing components
 * @param {Object} configData - Configuration data for Uniweb instance
 * @returns {Uniweb} Initialized Uniweb instance
 */
function initUniweb(configData) {
    // Create the core runtime instance.
    const uniwebInstance = new Uniweb(configData);

    // Global assignment needed for external component access
    window.uniweb = uniwebInstance;

    uniwebInstance.childBlockRenderer = ChildBlocks;
    uniwebInstance.routingComponents = {
        Link,
        SafeHtml,
        useNavigate,
        useParams,
        useLocation
    };

    return uniwebInstance;
}

/**
 * Initializes components from a remote module
 * @param {Promise} modulePromise - Promise that resolves to remote components
 * @param {Uniweb} uniwebInstance - Instance of Uniweb to initialize
 * @returns {Promise<boolean>} Success status of initialization
 */
async function initComponents(modulePromise, uniwebInstance) {
    try {
        // Await the remote module promise passed from the site builder.
        const remoteModule = await modulePromise;
        // Handle double `default` wrapping issue when CommonJS is imported into ES6 module.
        const innerModule = remoteModule?.default?.default ? remoteModule.default : remoteModule;
        // Initialize the uniweb instance with the remote components.
        uniwebInstance.setRemoteComponents(innerModule.default);
        // Set the remote configuration data.
        uniwebInstance.setRemoteConfig(innerModule.config || innerModule.site || {});
        return true;
    } catch (error) {
        console.error('Failed to load remote module:', error.message || error);
        return false;
    }
}

/**
 * Initializes the Runtime Environment
 * @param {Promise} modulePromise - Promise that resolves to remote components
 * @param {Object} options - Additional options
 * @param {boolean} options.development - Enable development mode features
 * @param {Object} options.configData - Configuration data for Uniweb instance
 * @returns {Promise<void>}
 */
async function initRTE(modulePromise, { development = false, configData = null } = {}) {
    configData ??=
        JSON.parse(document.getElementById('__SITE_CONTENT__')?.textContent) ??
        window.__SITE_CONTENT__;

    const uniwebInstance = initUniweb(configData);

    try {
        const success = await initComponents(modulePromise, uniwebInstance);
        if (success) {
            render({ development });
        } else {
            console.error('Failed to initialize components');
        }
    } catch (error) {
        console.error('Failed to initialize RTE:', error);
    }

    // Print a success message to the console
    if (!development) {
        console.log(
            `%c<%c>%c Uniweb RTE %c(v${APP_VERSION})`,
            'color: #FA8400; font-weight: bold; font-size: 18px;', // orange
            'color: #00ADFE; font-weight: bold; font-size: 18px;', // blue
            "color: #333; font-size: 18px; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;", // text
            'color: #666; font-size: 9px; font-style: italic;' // version
        );
        // console.log('%c', 'color: #555');
        console.log('%cStart Fast, Go Far', 'color: #555; font-size: 12px; font-style: italic;');
    }
}

/**
 * Renders the application to the DOM
 * @param {Object} options - Render options
 * @param {boolean} options.development - Enable development mode features like StrictMode
 * @returns {void}
 */
function render({ development = false } = {}) {
    const container = document.getElementById('root');
    if (!container) {
        console.error('Root DOM element with id "root" not found');
        return;
    }
    const root = createRoot(container);

    const app = (
        <ErrorBoundary
            fallback={
                <div className="error-container">
                    <h2>Something went wrong</h2>
                    <p>Please try refreshing the page</p>
                </div>
            }
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<WebsiteRenderer />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );

    root.render(development ? <React.StrictMode>{app}</React.StrictMode> : app);
}

export { initRTE };
