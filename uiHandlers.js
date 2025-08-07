// UI Handlers - manages UI event listeners and interactions
export function initializeUIHandlers() {
  // Add parameter row handler
  document.getElementById('add-row').onclick = () => {
    const params = document.getElementById('params');
    const newRow = document.createElement('div');
    newRow.className = 'kv-row';
    newRow.innerHTML = `
      <input placeholder="Parameter" />
      <input placeholder="Value" />
      <button type="button" class="remove-row">×</button>
    `;
    params.appendChild(newRow);

    // Add remove handler to new row
    newRow.querySelector('.remove-row').onclick = () => {
      params.removeChild(newRow);
    };
  };

  // Add remove handlers to existing rows
  document.querySelectorAll('.remove-row').forEach(btn => {
    btn.onclick = () => {
      const row = btn.parentElement;
      row.parentElement.removeChild(row);
    };
  });
}