import "./ReloadPrompt.css";

import { useRegisterSW } from "virtual:pwa-register/react";
import { Show } from "./components/Show";

function ReloadPrompt() {
    // replaced dynamically
    const buildDate = "__DATE__";
    // replaced dyanmicaly
    const reloadSW = "__RELOAD_SW__";

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onNeedRefresh: () => {
            console.log("onNeedRefresh");
        },
        onRegistered(r) {
            console.log("onRegistered");
            // @ts-expect-error just ignore
            if (reloadSW === "true") {
                r &&
                    setInterval(() => {
                        // eslint-disable-next-line no-console
                        console.log("Checking for sw update");
                        r.update();
                    }, 20000 /* 20s for testing purposes */);
            } else {
                // eslint-disable-next-line prefer-template,no-console
                console.log("SW Registered: " + r);
            }
        },
        onRegisterError(error) {
            // eslint-disable-next-line no-console
            console.log("SW registration error", error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <Show when={needRefresh}>
            <div className="ReloadPrompt-container">
                <div className="ReloadPrompt-toast">
                    <div className="ReloadPrompt-message">
                        {offlineReady && false ? (
                            <span>App ready to work offline</span>
                        ) : (
                            <span>New content available, click on reload button to update.</span>
                        )}
                    </div>
                    {needRefresh && (
                        <button className="ReloadPrompt-toast-button" onClick={() => updateServiceWorker(true)}>
                            Reload
                        </button>
                    )}
                    <button className="ReloadPrompt-toast-button" onClick={() => close()}>
                        Close
                    </button>
                </div>
                <div className="ReloadPrompt-date">{buildDate}</div>
            </div>
        </Show>
    );
}

export default ReloadPrompt;
