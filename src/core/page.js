import Block from './block.js';

export default class Page {
    constructor(pageData, id, pageHeader, pageFooter) {
        this.id = id;
        this.route = pageData.route;
        this.title = pageData.title;
        this.description = pageData.description;
        // this.blocks = pageData.sections.map((section, index) => new Block(section, index));
        this.pageBlocks = this.buildPageBlocks(
            pageData.sections,
            pageHeader?.sections,
            pageFooter?.sections
        );
    }

    getPageProfile() {}

    buildPageBlocks(body, header, footer) {
        const headerSection = header?.[0];
        const footerSection = footer?.[0];
        const bodySections = body || [];

        return {
            header: headerSection ? new Block(headerSection, 'header') : null,
            body: bodySections.map((section, index) => new Block(section, index)),
            footer: footerSection ? new Block(footerSection, 'footer') : null,
            leftPanel: null,
            rightPanel: null
        };
    }

    getPageBlocks() {
        return [this.pageBlocks.header, ...this.pageBlocks.body, this.pageBlocks.footer].filter(
            (block) => block
        );
    }
}
