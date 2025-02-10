import Input from './input.js';

export default class Block {
    constructor(blockData, id) {
        this.id = id;
        this.component = blockData.component;
        this.Component = null;

        this.main = {
            header: {
                title: blockData.title || '',
                pretitle: blockData.pretitle || '',
                subtitle: blockData.subtitle || ''
            },
            banner: blockData.banner || null,
            body: {
                links: blockData.links || [],
                paragraphs: blockData.paragraphs || [],
                imgs: blockData.images || [],
                icons: blockData.icons || [],
                videos: blockData.videos || [],
                lists: blockData.lists || [],
                buttons: blockData.buttons || [],
                properties: blockData.properties || {}
            }
        };

        this.themeName = blockData.themeName || 'light';
        this.standardOptions = blockData.standardOptions || {};

        this.childBlocks = blockData.childBlocks
            ? blockData.childBlocks.map((block, i) => new Block(block, `${id}_${i}`))
            : [];

        this.input = blockData.input ? new Input(blockData.input) : null;

        this.startState = null;
        this.state = null;
        this.resetStateHook = null;
        this.initState();
    }

    getComponent() {
        return window.uniweb.getRemoteComponent(this.component);
    }

    getBlockContent() {
        return {
            ...this.main.header,
            ...this.main.body,
            images: this.main.body.imgs,
            banner: this.main.banner
        };
    }

    getBlockProperties() {
        return this.main.body.properties;
    }

    getChildBlockRenderer() {
        return uniweb.childBlockRenderer;
    }

    getNextBlockInfo() {
        const website = uniweb.activeWebsite;
        const page = website.activePage;

        const currIndex = page.blocks.findIndex((b) => b.id === this.id);
        const nextIndex = currIndex + 1;

        return {
            theme: page.blocks[nextIndex].themeName,
            category: page.blocks[nextIndex].component,
            state: {}
        };
    }

    getBlockLinks() {
        return this.links;
    }

    getBlockLinks(options = {}) {
        const website = uniweb.activeWebsite;

        if (options.nested) {
            const lists = this.main.body?.lists || [];
            const links = lists[0];

            return Block.parseNestedLinks(links, website);
        } else {
            let links = this.main.body?.links || [];

            links = links.map((link) => {
                return { route: website.makeHref(link.href), label: link.label };
            });

            return links;
        }
    }

    initState() {
        this.startState = this.Component?.blockState ? { ...this.Component.blockState } : null;
        this.state = this.startState;

        if (this.resetStateHook) this.resetStateHook();
    }

    useBlockState(useState, initState) {
        // The block state is set to the given init state only if it's null
        if (initState !== undefined && this.startState === null) {
            this.startState = initState;
            this.state = initState;
        } else {
            // Remember the true initial state
            initState = this.startState;
        }

        const [state, setState] = useState(initState);

        // Save the hook so it can be called by initState()
        this.resetStateHook = () => setState(initState);

        return [state, (newState) => setState((this.state = newState))];
    }

    static parseNestedLinks = (list, website) => {
        const parsed = [];

        if (list?.length) {
            list.forEach((listItem) => {
                const { links, lists, paragraphs } = listItem;

                const link = links[0];
                const nestedList = lists[0];
                const text = paragraphs[0];

                let label = '',
                    href = '',
                    subLinks = [],
                    hasData = true;

                // if itself is a link
                if (link) {
                    label = link.label;
                    href = link.href;

                    // if has child links
                    if (nestedList) {
                        subLinks = Block.parseNestedLinks(nestedList, website);
                    }
                } else {
                    label = text;
                    hasData = false;

                    // if has child links
                    if (nestedList) {
                        subLinks = Block.parseNestedLinks(nestedList, website);
                    }
                }

                parsed.push({
                    label,
                    route: website.makeHref(href),
                    child_items: subLinks,
                    hasData
                });
            });
        }
        return parsed;
    };
}
