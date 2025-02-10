/**
 * Render a generic container with a given HTML string inserted into it.
 * @module SafeHtml
 */

import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import parse, { attributesToProps, domToReact } from 'html-react-parser';

// Lazily load the citation renderer
const LazyCiteRender = React.lazy(() => import('./LazyCiteRender.jsx'));

/**
 * In React, dangerouslySetInnerHTML is provided to directly insert HTML into
 * a React element. As the name implies, it's not generally recommended because
 * it can expose your application to cross-site scripting (XSS) attacks if misused.
 * If you're fully aware of the danger and confident that the HTML to use is safe,
 * and you still need to inject HTML directly into a React component,
 * this wrapper component is a simple way to use dangerouslySetInnerHTML.
 *
 * As an extra precaution, the given HTML is sanitized with DOMPurify to ensure
 * it's safe to inject into the page.
 *
 * @example
 * <SafeHtml value="<strong>Hello world!</strong>" as="span" className="my-class" />
 *
 * @component SafeHtml
 * @prop {string?} value - The HTML code to insert.
 * @prop {string} as - The element type.
 * @returns {function|null} A react component if value is a string and null otherwise.
 */
export default function SafeHtml({
    value,
    as: Component = 'div',
    makeLinksExternal = 'auto',
    relAttribute = 'noopener noreferrer',
    replaceFn = null,
    onReady = null,
    ...rest
}) {
    const ref = useRef(null);

    useEffect(() => {
        if (onReady && ref.current) {
            onReady(ref.current);
        }
    }, [ref.current, onReady]);

    if (value === null || value === undefined) return null;

    if (Array.isArray(value))
        value = value.map((v) => `<p style="color:inherit">${v}</p>`).join('');

    // Sanitize HTML while allowing custom elements (like u-cite)
    const sanitized = DOMPurify.sanitize(value, {
        CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: /^u-/, // allow all tags starting with "uniweb-"
            attributeNameCheck: /^.*/,
            allowCustomizedBuiltInElements: true // customized built-ins are allowed
        }
    });

    const options = {
        replace(domNode) {
            if (domNode.attribs && domNode.name === 'a') {
                const props = attributesToProps(domNode.attribs);

                let href = domNode.attribs.href;
                let target = '_self';
                if (makeLinksExternal === 'auto') {
                    target = href && isExternal(href) ? '_blank' : '_self';
                } else {
                    target = makeLinksExternal ? '_blank' : '_self';
                }
                props.target = target;

                let anchorProps = {
                    rel: relAttribute,
                    ...props,
                    target
                };

                return <a {...anchorProps}>{domToReact(domNode.children, options)}</a>;
            } else if (domNode.name === 'u-cite') {
                const props = attributesToProps(domNode.attribs);

                let children = domNode.children;

                let data = children.map((child) => child.data || '').join('');

                return (
                    <React.Suspense fallback={null}>
                        <LazyCiteRender {...props} data={data ? JSON.parse(data) : ''} />
                    </React.Suspense>
                );
            }

            if (replaceFn) {
                return replaceFn(domNode, attributesToProps, domToReact);
            }
        }
    };

    const parsed = parse(sanitized, options);

    return (
        <Component ref={ref} {...rest}>
            {parsed}
        </Component>
    );
}

function isExternal(href) {
    // Create an anchor element
    var anchor = document.createElement('a');
    anchor.href = href;

    // Compare the hostname of the anchor's URL with the current hostname
    var isExternal = anchor.hostname !== window.location.hostname;

    // Clean up: remove the anchor element from the DOM
    anchor.remove();

    return isExternal;
}
