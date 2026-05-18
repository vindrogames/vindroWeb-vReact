export const toUrlSlug = (name) => (name ?? '').trim().toLowerCase().replace(/\s+/g, '-');

export const NAME_PATTERN = /^[a-zA-Z0-9\s\-]+$/;
export const NAME_ERROR = "Only letters, numbers, spaces, and hyphens allowed.";
