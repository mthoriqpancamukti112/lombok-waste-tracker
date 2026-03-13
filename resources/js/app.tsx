import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { router } from "@inertiajs/react";

const appName = "TRACEA";

createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} key={window.location.pathname} />);

        const handlePopState = (event: PopStateEvent) => {
            event.stopImmediatePropagation();
            const currentUrl = window.location.href;

            router.visit(currentUrl, {
                method: "get",
                replace: true,
                preserveScroll: true,
                preserveState: false,
            });
        };

        window.addEventListener("popstate", handlePopState);
    },
    progress: {
        color: "#a7e94a",
    },
});
