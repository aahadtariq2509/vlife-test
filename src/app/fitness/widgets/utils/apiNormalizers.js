/**
 * Response normalizers to handle different API response shapes
 */

export const normalizeAttributes = (resp) => {
  const data = resp?.data ?? resp;
  return data?.attributes ?? data ?? [];
};

export const normalizeChildren = (resp) => {
  const data = resp?.data ?? resp;
  return data?.children ?? data ?? [];
};

export const normalizeMappings = (resp) => {
  const data = resp?.data ?? resp;
  return data?.mappings ?? data ?? [];
};

export const getMappingId = (map) => {
  return (
    map?.id ??
    map?.widget_type_id ??
    map?.widgetTypeId ??
    map?.type_id ??
    map?.code ??
    null
  );
};
