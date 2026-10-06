export type PlaceholderKind = "text" | "date" | "number" | "image";

export interface PlaceholderDef {
  key: string;
  label: string;
  kind: PlaceholderKind;
  // auto placeholders are never asked for manually - they're derived automatically
  auto: boolean;
}

export const CONTRACT_PLACEHOLDERS: PlaceholderDef[] = [
  { key: "username", label: "Username", kind: "text", auto: true },
  { key: "userEmail", label: "User Email", kind: "text", auto: true },
  { key: "department", label: "Department", kind: "text", auto: true },
  { key: "userFullName", label: "Full Name", kind: "text", auto: true },
  { key: "userAddress", label: "Address", kind: "text", auto: true },
  { key: "startDate", label: "Start Date", kind: "date", auto: false },
  { key: "endDate", label: "End Date", kind: "date", auto: false },
  { key: "signatureImage", label: "Signature Image", kind: "image", auto: true },
  { key: "signedAtDate", label: "Signed Date", kind: "text", auto: true },
  { key: "internshipTitle", label: "Internship Title", kind: "text", auto: false },
  { key: "requiredWorkingHours", label: "Required Working Hours", kind: "number", auto: false },
  { key: "weeklyHoursRequired", label: "Weekly Hours Required", kind: "number", auto: false },
  { key: "totalDays", label: "Total Days", kind: "number", auto: false },
  { key: "jobTitle", label: "Job Title", kind: "text", auto: false },
  { key: "mentorName", label: "Mentor Name", kind: "text", auto: false },
];

// Personal details the user maintains on their own profile. Full name falls
// back to the login username until the user sets one.
export const personalPlaceholderValues = (user?: {
  username?: string;
  fullName?: string;
  address?: string;
} | null): Record<string, string | undefined> => ({
  userFullName: user?.fullName || user?.username,
  userAddress: user?.address || undefined,
});

export const getPlaceholderDef = (key: string): PlaceholderDef | undefined =>
  CONTRACT_PLACEHOLDERS.find((p) => p.key === key);

export const IMAGE_PLACEHOLDERS = CONTRACT_PLACEHOLDERS.filter((p) => p.kind === "image");
export const MANUAL_PLACEHOLDERS = CONTRACT_PLACEHOLDERS.filter((p) => !p.auto);

// Walks a Tiptap/ProseMirror JSON document and collects the set of
// placeholder keys ("placeholder" node type) used within it.
export const extractPlaceholderKeys = (doc: unknown): string[] => {
  const keys = new Set<string>();

  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "placeholder" && node.attrs?.key) {
      keys.add(node.attrs.key);
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  };

  walk(doc);
  return Array.from(keys);
};

// Same as extractPlaceholderKeys, but across every page of a multi-page
// contract template (pages: [{ content, layout }]).
export const extractPlaceholderKeysFromPages = (
  pages: { content: unknown }[] | undefined
): string[] => {
  const keys = new Set<string>();
  (pages || []).forEach((page) => {
    extractPlaceholderKeys(page.content).forEach((k) => keys.add(k));
  });
  return Array.from(keys);
};
