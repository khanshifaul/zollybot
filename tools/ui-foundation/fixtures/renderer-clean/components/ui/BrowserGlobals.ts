// window.zollybot belongs in the application adapter.
export const documentation = "window.zollybot";
export const viewport = () => window.innerWidth;
export const platformAction = (props: { zollybot: () => void }) => props.zollybot();
