export const DEFAULT_AVATAR_ID = "sunbeam-fox";

export const AVATARS = [
  { id: "sunbeam-fox", label: "Sunbeam Fox", src: "/avatars/sunbeam-fox.svg" },
  { id: "melon-cat", label: "Melon Cat", src: "/avatars/melon-cat.svg" },
  { id: "bubble-bunny", label: "Bubble Bunny", src: "/avatars/bubble-bunny.svg" },
  { id: "orbit-panda", label: "Orbit Panda", src: "/avatars/orbit-panda.svg" },
  { id: "berry-bot", label: "Berry Bot", src: "/avatars/berry-bot.svg" },
  { id: "mint-ghost", label: "Mint Ghost", src: "/avatars/mint-ghost.svg" },
  { id: "peach-pup", label: "Peach Pup", src: "/avatars/peach-pup.svg" },
  { id: "cobalt-owl", label: "Cobalt Owl", src: "/avatars/cobalt-owl.svg" },
  { id: "lime-frog", label: "Lime Frog", src: "/avatars/lime-frog.svg" },
  { id: "coral-koi", label: "Coral Koi", src: "/avatars/coral-koi.svg" },
  { id: "star-mouse", label: "Star Mouse", src: "/avatars/star-mouse.svg" },
  { id: "plum-dragon", label: "Plum Dragon", src: "/avatars/plum-dragon.svg" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export function getAvatar(avatarId?: string | null) {
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? AVATARS[0];
}

export function getDefaultAvatarId(seed?: string | null): AvatarId {
  if (!seed) return DEFAULT_AVATAR_ID;

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return AVATARS[hash % AVATARS.length].id;
}
