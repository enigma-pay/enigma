import Image from "next/image";
import { getAvatar } from "@/lib/avatars";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const IMAGE_SIZE: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export function UserAvatar({
  avatarId,
  name,
  size = "md",
  className = "",
}: {
  avatarId?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}) {
  const avatar = getAvatar(avatarId);
  const label = name ? `${name} avatar` : avatar.label;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-border bg-background ${SIZE_CLASS[size]} ${className}`}
    >
      <Image
        src={avatar.src}
        alt={label}
        width={IMAGE_SIZE[size]}
        height={IMAGE_SIZE[size]}
        unoptimized
        className="h-full w-full object-cover"
      />
    </span>
  );
}
