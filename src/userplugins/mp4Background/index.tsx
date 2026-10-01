import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const VIDEO_ID = "vc-mp4-background";
const STYLE_ID = "vc-mp4-background-style";

const settings = definePluginSettings({
    videoUrl: {
        type: OptionType.STRING,
        displayName: "MP4 URL",
        description: "Direct URL to an MP4 video.",
        default:
            "https://cdn.wallper.app/wallper-user-generated/fd9341f4-b3ed-4ee6-a0dd-3a2a0372fa68.mp4",
        placeholder: "https://example.com/background.mp4",
        onChange() {
            if (settings.store.enabled) {
                updateBackground();
            }
        },
    },

    enabled: {
        type: OptionType.BOOLEAN,
        displayName: "Enable MP4 Background",
        description: "Show the MP4 video behind Discord.",
        default: false,
        onChange(enabled) {
            if (enabled) {
                updateBackground();
            } else {
                removeBackground();
            }
        },
    },
});

function removeBackground() {
    document.getElementById(VIDEO_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
}

function addBackgroundStyle() {
    document.getElementById(STYLE_ID)?.remove();

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
        /*
         * MP4 background
         */

        #${VIDEO_ID} {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;

            object-fit: cover !important;

            pointer-events: none !important;
            user-select: none !important;

            z-index: 0 !important;
        }

        /*
         * Discord background variables
         */

        #app-mount {
            --background-primary: transparent !important;
            --background-secondary: transparent !important;
            --background-secondary-alt: transparent !important;
            --background-tertiary: transparent !important;
            --background-floating: rgba(0, 0, 0, 0.15) !important;
            --home-background: transparent !important;
            --modal-background: rgba(0, 0, 0, 0.15) !important;

            background: transparent !important;
        }

        /*
         * Main Discord containers
         */

        #app-mount > div {
            background: transparent !important;
        }

        #app-mount > div > div {
            background: transparent !important;
        }

        /*
         * Discord layers
         */

        #app-mount [class*="layers_"],
        #app-mount [class*="layer_"] {
            background: transparent !important;
        }

        /*
         * Keep Discord above the video
         */

        #app-mount {
            position: relative !important;
            z-index: 1 !important;
        }
    `;

    document.head.appendChild(style);
}

function updateBackground() {
    removeBackground();

    const url = settings.store.videoUrl.trim();

    if (!url) {
        console.warn("[MP4Background] No MP4 URL.");
        return;
    }

    let parsed: URL;

    try {
        parsed = new URL(url);
    } catch {
        console.warn("[MP4Background] Invalid URL.");
        return;
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        console.warn("[MP4Background] Only HTTP/HTTPS URLs are supported.");
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

    document.body.prepend(video);

    addBackgroundStyle();

    video.play().catch(error => {
        console.warn("[MP4Background] Video playback failed:", error);
    });
}

export default definePlugin({
    name: "MP4Background",

    description: "Use a custom MP4 video as your Discord background.",

    authors: [
        {
            name: "Leo",
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
