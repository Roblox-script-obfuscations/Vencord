import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    videoUrl: {
        type: OptionType.STRING,
        displayName: "MP4 URL",
        description: "Enter the direct URL of an MP4 video.",
        default: "",
        placeholder: "https://cdn.wallper.app/wallper-user-generated/fd9341f4-b3ed-4ee6-a0dd-3a2a0372fa68.mp4",
        onChange: () => {
            if (settings.store.enabled) {
                updateBackground();
            }
        },
    },

    enabled: {
        type: OptionType.BOOLEAN,
        displayName: "Enable MP4 Background",
        description: "Enable or disable the MP4 background.",
        default: false,
        onChange: enabled => {
            if (enabled) {
                updateBackground();
            } else {
                removeBackground();
            }
        },
    },
});

const VIDEO_ID = "vc-mp4-background";

function removeBackground() {
    const video = document.getElementById(VIDEO_ID);

    if (video) {
        video.remove();
    }

    removeBackgroundStyles();
}

function updateBackground() {
    removeBackground();

    const url = settings.store.videoUrl.trim();

    if (!url) {
        console.warn("[MP4 Background] No video URL specified.");
        return;
    }

    try {
        const parsed = new URL(url);

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            console.warn("[MP4 Background] Only HTTP/HTTPS URLs are supported.");
            return;
        }
    } catch {
        console.warn("[MP4 Background] Invalid video URL.");
        return;
    }

    const video = document.createElement("video");

    video.id = VIDEO_ID;

    video.src = url;

    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    video.setAttribute("aria-hidden", "true");

    Object.assign(video.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
        pointerEvents: "none",
        zIndex: "0",
        opacity: "1",
    });

    document.body.prepend(video);

    addBackgroundStyles();

    video.play().catch(error => {
        console.warn("[MP4 Background] Autoplay failed:", error);
    });
}

function addBackgroundStyles() {
    if (document.getElementById("vc-mp4-background-style")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "vc-mp4-background-style";

    style.textContent = `
        /*
         * Make Discord's main background transparent so
         * the video behind it can be seen.
         */

        #app-mount {
            background: transparent !important;
        }

        #app-mount > div {
            background: transparent !important;
        }

        #app-mount .app_a3002a {
            background: transparent !important;
        }

        #app-mount [class*="bg_"] {
            background: transparent !important;
        }

        #app-mount [class*="layers_"] {
            background: transparent !important;
        }

        #app-mount [class*="layer_"] {
            background: transparent !important;
        }

        /*
         * Keep the video behind Discord UI.
         */

        #${VIDEO_ID} {
            z-index: 0 !important;
        }

        #app-mount {
            position: relative;
            z-index: 1;
        }
    `;

    document.head.appendChild(style);
}

function removeBackgroundStyles() {
    document.getElementById("vc-mp4-background-style")?.remove();
}

export default definePlugin({
    name: "MP4Background",

    description:
        "Use a custom MP4 video as your Discord background.",

    authors: [
        {
            name: "Your Name",
            id: 0n,
        },
    ],

    settings,

    start() {
        if (settings.store.enabled) {
            updateBackground();
        }
    },

    stop() {
        removeBackground();
    },
});
