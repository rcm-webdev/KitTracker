import { publicKitPath } from "@strawhats/shared";

export function publicKitUrl(binId: string, origin = window.location.origin): string {
  return `${origin}${publicKitPath(binId)}`;
}
