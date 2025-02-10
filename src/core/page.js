import Block from './block.js';

export default class Page {
    constructor(pageData, id) {
        this.id = id;
        this.route = pageData.route;
        this.title = pageData.title;
        this.description = pageData.description;
        this.blocks = pageData.blocks.map((block, index) => new Block(block, index));
    }

    getPageProfile() {}
}
