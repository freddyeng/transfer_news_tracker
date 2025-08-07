// Query Store - manages query parameters and state
export function getQueryKey() {
  const params = document.querySelectorAll('.kv-row');
  const queryObj = {};

  params.forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length === 2 && inputs[0].value && inputs[1].value) {
      queryObj[inputs[0].value] = inputs[1].value;
    }
  });

  // For now, just use the first keyword found
  if (!queryObj.keyword) {
    throw new Error('Please provide at least one keyword');
  }

  return {
    queryKey: JSON.stringify(queryObj),
    value: queryObj.keyword
  };
}