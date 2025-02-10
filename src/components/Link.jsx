import React from 'react';
import { Link } from 'react-router-dom';

export default (props) => {
    let { children, target = '_self', title = '', style = undefined, className = '', to = '', ariaLabel = '', rel = 'noopener noreferrer' } = props;

    let anchorProps = {
        className,
        style,
        rel
    };

    if (!ariaLabel) {
        if (title) {
            ariaLabel = title;
        } else if (to) {
            ariaLabel = `Navigate to ${to}`;
        }
    }

    anchorProps['aria-label'] = ariaLabel;

    if (title) anchorProps.title = title;

    let href = to;

    // external link
    if (href.includes('//') || href.includes('mailto:')) {
        anchorProps = {
            ...anchorProps,
            target,
            href
        };

        return <a {...anchorProps}>{children}</a>;
    } else {
        anchorProps = {
            ...anchorProps,
            target,
            to: href
        };

        return <Link {...anchorProps}>{children}</Link>;
    }
};
