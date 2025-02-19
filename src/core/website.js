import Page from './page.js';

export default class Website {
    constructor(websiteData) {
        const { pages, theme } = websiteData;

        this.pages = pages
            .filter((page) => page.route !== '/@header' && page.route !== '/@footer')
            .map(
                (page, index) =>
                    new Page(
                        page,
                        index,
                        pages.find((p) => p.route === '/@header'),
                        pages.find((p) => p.route === '/@footer')
                    )
            );
        this.activePage = this.pages.find((page) => page.route === '/index') || this.pages[0];
        this.pageRoutes = this.pages.map((page) => page.route);
        this.themeData = theme;
        this.activeLang = 'en';
        this.langs = [
            {
                label: 'English',
                value: 'en'
            },
            {
                label: 'français',
                value: 'fr'
            }
        ];
    }

    getRemoteLayout() {
        return uniweb.remoteConfig.Layout || null;
    }

    getRemoteProps() {
        return uniweb.remoteConfig.props || null;
    }

    getRoutingComponents() {
        return uniweb.routingComponents;
    }

    makeHref(href) {
        return href;
    }

    getLanguages() {
        return this.langs;
    }

    getLanguage() {
        return this.activeLang;
    }

    localize(val, defaultVal = '', givenLang = '', fallbackDefaultLangVal = false) {
        const lang = givenLang || this.activeLang;

        const defaultLang = this.langs[0].value || 'en';

        if (typeof val === 'object' && !Array.isArray(val)) {
            return fallbackDefaultLangVal
                ? val?.[lang] || val?.[defaultLang] || defaultVal
                : val?.[lang] || defaultVal;
        }

        if (typeof val === 'string') {
            if (!val.startsWith('{') && !val.startsWith('"')) return val;

            try {
                let obj = JSON.parse(val);

                if (typeof obj === 'object') {
                    return fallbackDefaultLangVal
                        ? obj?.[lang] || obj?.[defaultLang] || defaultVal
                        : obj?.[lang] || defaultVal;
                } else return obj;
            } catch (e) {
                return val;
            }
        }

        return defaultVal;
    }

    getSearchData() {
        return this.pages.map((page) => {
            return {
                id: page.id,
                title: page.title,
                href: page.route,
                route: page.route,
                description: page.description,
                content: page.blocks
                    .map((b) => b.title)
                    .filter(Boolean)
                    .join('\n')
            };
        });
    }
}
