document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('amount');
  const enabledToggle = document.getElementById('enabled');
  const formatSelect = document.getElementById('format');
  const hidePending = document.getElementById('hidePending');
  const animation = document.getElementById('animation');
  const profileEnabled = document.getElementById('profileEnabled');
  const fakeLevel = document.getElementById('fakeLevel');
  const fakeFriends = document.getElementById('fakeFriends');
  const fakeJoin = document.getElementById('fakeJoin');
  const saveBtn = document.getElementById('save');
  const presets = document.querySelectorAll('.preset');
  const colorBtns = document.querySelectorAll('.color-btn');

  let selectedColor = '#00d68f';

  // Load settings
  chrome.storage.sync.get([
    'fakeRobux', 'enabled', 'format', 'color',
    'hidePending', 'animation', 'profileEnabled',
    'fakeLevel', 'fakeFriends', 'fakeJoin'
  ], (data) => {
    amountInput.value = data.fakeRobux !== undefined ? data.fakeRobux : 999999;
    enabledToggle.checked = data.enabled !== undefined ? data.enabled : true;
    formatSelect.value = data.format || 'full';
    selectedColor = data.color || '#00d68f';
    hidePending.checked = data.hidePending || false;
    animation.checked = data.animation !== undefined ? data.animation : true;
    profileEnabled.checked = data.profileEnabled || false;
    fakeLevel.value = data.fakeLevel || '';
    fakeFriends.value = data.fakeFriends || '';
    fakeJoin.value = data.fakeJoin || '';

    // Set active color
    colorBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === selectedColor);
    });
  });

  // Presets
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      amountInput.value = btn.dataset.value;
    });
  });

  // Color selection
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
    });
  });

  // Toggle immediate
  enabledToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: enabledToggle.checked });
  });

  // Save
  saveBtn.addEventListener('click', () => {
    const value = parseInt(amountInput.value, 10);
    if (isNaN(value) || value < 0) {
      alert('Entre un nombre valide (≥ 0)');
      return;
    }

    chrome.storage.sync.set({
      fakeRobux: value,
      enabled: enabledToggle.checked,
      format: formatSelect.value,
      color: selectedColor,
      hidePending: hidePending.checked,
      animation: animation.checked,
      profileEnabled: profileEnabled.checked,
      fakeLevel: fakeLevel.value ? parseInt(fakeLevel.value, 10) : null,
      fakeFriends: fakeFriends.value ? parseInt(fakeFriends.value, 10) : null,
      fakeJoin: fakeJoin.value || null
    }, () => {
      saveBtn.textContent = '✓ Saved !';
      setTimeout(() => {
        saveBtn.textContent = 'Save LARP Settings';
      }, 1400);
    });
  });
});
