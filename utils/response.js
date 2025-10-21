export const ok = (res, message, data) => res.json({ message, ...(data !== undefined ? { data } : {}) });

export const created = (res, message, data) => res.status(201).json({ message, ...(data !== undefined ? { data } : {}) });

export const noContent = (res) => res.status(204).send();

