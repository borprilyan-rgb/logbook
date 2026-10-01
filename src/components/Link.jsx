import React from "react";
import { navigate } from "../utils/navigation.js";
export default function Link({ href, children, ...props }) {
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target ||
          props.download ||
          !href.startsWith("/") ||
          href.startsWith("//") ||
          href.includes("#")
        )
          return;
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
