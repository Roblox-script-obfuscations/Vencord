import definePlugin, { OptionType, definePluginSettings } from "@utils/types";

const VIDEO_ID = "vc-mp4-background";
const STYLE_ID = "vc-mp4-background-style";

const settings = definePluginSettings({
    enabled: {
        type: OptionType.BOOLEAN,
        description: "Enable MP4 video background",
        default: true,
    },

    videoUrl: {
        type: OptionType.STRING,
        description: "MP4 video URL",
        default:
            "https://cdn.wallper.app/wallper-user-generated/fd9341f4-b3ed-4ee6-a0dd-3a2a0372fa68.mp4",
    },
});

function removeVideo() {
    document.getElementById(VIDEO_ID)?.remove();
}

function removeStyle() {
    document.getElementById(STYLE_ID)?.remove();
}

function addStyle() {
    removeStyle();

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
        html,
        body {
            background: transparent !important;
        }

        #app-mount {
            background: transparent !important;
            position: relative !important;
            z-index: 1 !important;
        }

        #app-mount > div {
            background: transparent !important;
        }

        #app-mount > div > div {
            background: transparent !important;
        }

        [class*="layers_"] {
            background: transparent !important;
        }

        [class*="layer_"] {
            background: transparent !important;
        }

        #${VIDEO_ID} {
            position: fixed !important;
            inset: 0 !important;

            width: 100vw !important;
            height: 100vh !important;

            object-fit: cover !important;

            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;

            pointer-events: none !important;

            z-index: 0 !important;
        }

        #app-mount {
            --background-primary: transparent !important;
            --background-secondary: transparent !important;
            --background-secondary-alt: transparent !important;
            --background-tertiary: transparent !important;
            --background-floating: rgba(0, 0, 0, 0.15) !important;
            --home-background: transparent !important;
            --modal-background: rgba(0, 0, 0, 0.15) !important;
        }
    `;

    document.head.appendChild(style);
}

function createVideo() {
    removeVideo();

    if (!settings.store.enabled) return;

    const video = document.createElement("video");

    video.id = VIDEO_ID;

    video.src = settings.store.videoUrl;

    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    video.setAttribute("aria-hidden", "true");

    video.addEventListener("loadeddata", () => {
        console.log("[MP4Background] Video loaded");
    });

    video.addEventListener("canplay", () => {
        console.log("[MP4Background] Video can play");

        video.play().catch(error => {
            console.error("[MP4Background] play() failed:", error);
        });
    });

    video.addEventListener("error", () => {
        console.error(
            "[MP4Background] Video error:",
            video.error
        );
    });

    document.body.prepend(video);

    video.play().catch(() => {
        setTimeout(() => {
            video.play().catch(error => {
                console.error(
                    "[MP4Background] Retry play() failed:",
                    error
                );
            });
        }, 1000);
    });
}

function apply() {
    removeVideo();
    removeStyle();

    if (!settings.store.enabled) return;

    addStyle();
    createVideo();
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
        console.log("[MP4Background] Starting...");

        apply();

        // DiscordがDOMを再構築した場合に動画を復活
        const observer = new MutationObserver(() => {
            if (
                settings.store.enabled &&
                !document.getElementById(VIDEO_ID)
            ) {
                createVideo();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });

        (this as any).observer = observer;
    },

    stop() {
        console.log("[MP4Background] Stopping...");

        (this as any).observer?.disconnect();

        removeVideo();
        removeStyle();
    },
});
