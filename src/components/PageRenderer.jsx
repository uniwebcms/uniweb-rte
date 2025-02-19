import React, { useEffect } from 'react';
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

    const pageTitle = page?.title || 'Website';

    useEffect(() => {
        document.title = pageTitle;

        return () => {
            document.title = 'Website';
        };
    }, [pageTitle]);

    if (!page) {
        return null;
    }

    const blocks = page.getPageBlocks();

    return blocks.map((block, index) => (
        <React.Fragment key={index}>
            <BlockRenderer block={block} />
        </React.Fragment>
    ));
}

export { ChildBlocks };
