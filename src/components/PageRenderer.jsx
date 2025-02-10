import React from 'react';
import BlockRenderer from './BlockRenderer.jsx';

const ChildBlocks = (props) => {
    const { block, childBlocks, pure, extra } = props;

    return childBlocks.map((block, index) => (
        <React.Fragment key={index}>
            <BlockRenderer block={block} pure={pure} extra={extra} />
        </React.Fragment>
    ));
};

export default function PageRenderer(props) {
    const page = uniweb.activeWebsite.activePage;

    if (!page) {
        return null;
    }

    const { blocks } = page;

    return blocks.map((block, index) => (
        <React.Fragment key={index}>
            <BlockRenderer block={block} />
        </React.Fragment>
    ));
}

export { ChildBlocks };
