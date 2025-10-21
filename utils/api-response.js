export const ok = (res, message, data = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.json(payload);
};

export const created = (res, message, data = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(201).json(payload);
};

