import type { TagDto } from '@/types/medialib';

// Matches the VueFinder RemoteDriver base URL
export const API_BASE = '/api/files';

export const apiFetchTags = async (): Promise<TagDto[]> => {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error(`GET ${API_BASE}/tags failed: ${res.status}`);
  return res.json() as Promise<TagDto[]>;
};

export const apiFetchFilesForTag = async (tagId: string): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/tags/files?tagId=${encodeURIComponent(tagId)}`);
  if (!res.ok) throw new Error(`GET ${API_BASE}/tags/files?tagId=${tagId} failed: ${res.status}`);
  return res.json() as Promise<string[]>;
};

export const apiAssignTag = async (tagId: string, filePaths: string[]): Promise<void> => {
  const res = await fetch(`${API_BASE}/tags/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, filePaths }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/assign failed: ${res.status}`);
};

export const apiRemoveTag = async (tagId: string, filePaths: string[]): Promise<void> => {
  const res = await fetch(`${API_BASE}/tags/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, filePaths }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/remove failed: ${res.status}`);
};

export const apiCreateTag = async (label: string): Promise<TagDto> => {
  const res = await fetch(`${API_BASE}/tags/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/create failed: ${res.status}`);
  return res.json() as Promise<TagDto>;
};

export const apiDeleteTag = async (tagId: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/tags/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/delete failed: ${res.status}`);
};

export const apiRenameTag = async (tagId: string, newLabel: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/tags/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, newLabel }),
  });
  if (!res.ok) throw new Error(`POST ${API_BASE}/tags/rename failed: ${res.status}`);
};

export const apiCanManageTags = async (): Promise<boolean> => {
  const res = await fetch(`${API_BASE}/tags/can-manage`);
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.canManage;
};
