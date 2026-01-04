// ----- GDPR BANNER -----
(function gdprBanner() {
  const GDPR_CONSENT_KEY = 'wedding-gdpr-consent';
  const banner = document.getElementById('gdpr-banner');
  const acceptBtn = document.getElementById('gdpr-accept');
  const declineBtn = document.getElementById('gdpr-decline');
  const privacyLink = document.getElementById('privacy-link');
  const privacyModal = document.getElementById('privacy-modal');
  const privacyClose = document.getElementById('privacy-close');
  const rsvpForm = document.getElementById('rsvp-form');

  // Check if user has already given consent
  function hasConsent() {
    return localStorage.getItem(GDPR_CONSENT_KEY) === 'accepted';
  }

  // Check if user has declined
  function hasDeclined() {
    return localStorage.getItem(GDPR_CONSENT_KEY) === 'declined';
  }

  // Show/hide banner
  function showBanner() {
    banner.classList.remove('hidden');
  }

  function hideBanner() {
    banner.classList.add('hidden');
  }

  // Show/hide privacy modal
  function showPrivacyModal() {
    privacyModal.classList.remove('hidden');
  }

  function hidePrivacyModal() {
    privacyModal.classList.add('hidden');
  }

  // Enable/disable form
  function enableForm() {
    rsvpForm.classList.remove('form-disabled');
    rsvpForm.style.position = 'relative';
  }

  function disableForm() {
    rsvpForm.classList.add('form-disabled');
    rsvpForm.style.position = 'relative';
  }

  // Handle consent acceptance
  function acceptConsent() {
    localStorage.setItem(GDPR_CONSENT_KEY, 'accepted');
    hideBanner();
    enableForm();
    
    // Load reCAPTCHA script if not already loaded
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY_HERE';
      document.head.appendChild(script);
    }
  }

  // Handle consent decline
  function declineConsent() {
    localStorage.setItem(GDPR_CONSENT_KEY, 'declined');
    hideBanner();
    disableForm();
    
    // Show message to user
    alert('Senza il consenso ai cookie non è possibile utilizzare il modulo di conferma. Puoi sempre cambiare idea ricaricando la pagina.');
  }

  // Event listeners
  acceptBtn.addEventListener('click', acceptConsent);
  declineBtn.addEventListener('click', declineConsent);
  privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPrivacyModal();
  });
  privacyClose.addEventListener('click', hidePrivacyModal);
  
  // Close modal when clicking outside
  privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
      hidePrivacyModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !privacyModal.classList.contains('hidden')) {
      hidePrivacyModal();
    }
  });

  // Initialize
  function init() {
    if (hasConsent()) {
      enableForm();
      hideBanner();
    } else if (hasDeclined()) {
      disableForm();
      hideBanner();
    } else {
      disableForm();
      showBanner();
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ----- MAPPA (Leaflet) -----
(function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('map', { scrollWheelZoom: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Marker: Cerimonia (Chiesa)
  const mCerimonia = L.marker([41.05937144099128, 14.74455654219157]).addTo(map)
    .bindPopup('<strong>Cerimonia</strong><br>Chiesa di S. Maria del Rosario, Beltiglio<br><a href="https://www.google.com/maps/search/?api=1&query=41.05937144099128,14.74455654219157" target="_blank" rel="noopener">Apri in Google Maps</a>');
  mCerimonia.bindTooltip('Cerimonia', {permanent: true, direction: 'top', offset: [0, -10]});

  // Marker: Ricevimento (Location)
  const mRicevimento = L.marker([41.07140340553389, 14.757826707715376]).addTo(map)
    .bindPopup('<strong>Ricevimento</strong><br>Palazzo Pecci (San Leucio del Sannio)<br><a href="https://www.google.com/maps/search/?api=1&query=41.07140340553389,14.757826707715376" target="_blank" rel="noopener">Apri in Google Maps</a>');
  mRicevimento.bindTooltip('Ricevimento', {permanent: true, direction: 'top', offset: [0, -10]});

  const group = L.featureGroup([mCerimonia, mRicevimento]);
  map.fitBounds(group.getBounds(), { padding: [30, 30] });
})();

// ----- RSVP FORM -----
(function rsvpForm() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const famiglia = document.getElementById('famiglia');
  const radioPresente = document.getElementById('presente');
  const radioAssente = document.getElementById('assente');
  const numMassimoInvitati = 10;
  const noteElement = document.getElementById('note');

  const numeroPersoneWrap = document.getElementById('numero-persone-container');
  const numeroPersoneInput = document.getElementById('numero-persone');
  const invitatiWrap = document.getElementById('invitati-container');
  const listaInvitati = document.getElementById('lista-invitati');

  // Configuration
  const RECAPTCHA_SITE_KEY = '6LdoAEAsAAAAAHgGXFG645Dsqw2YKx_0563qtJFI'; // Replace with your actual site key
  const API_ENDPOINT = 'YOUR_API_GATEWAY_URL_HERE/submit'; // Replace with your actual API endpoint

  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }

  function onPresenzaChange(){
    if (radioPresente.checked){
      show(numeroPersoneWrap);
      const n = parseInt(numeroPersoneInput.value || '0', 10);
      (n > 0) ? show(invitatiWrap) : hide(invitatiWrap);
    } else {
      hide(numeroPersoneWrap);
      hide(invitatiWrap);
      numeroPersoneInput.value = '';
      listaInvitati.innerHTML = '';
    }
  }

  [radioPresente, radioAssente].forEach(el => el.addEventListener('change', onPresenzaChange));

  function invitatoRow(i){
    const row = document.createElement('div');
    row.className = 'invitato-row';
    row.dataset.index = i;
    row.innerHTML = `
      <div class="label">Invitato ${i}</div>

      <div>
        <label for="ospite-nome-${i}">Nome e Cognome</label>
        <input type="text" id="ospite-nome-${i}" name="ospite-nome-${i}" placeholder="Es. Maria Rossi" required>
      </div>

      <div>
        <label for="ospite-menu-${i}">Menù</label>
        <select id="ospite-menu-${i}" name="ospite-menu-${i}" required>
          <option value="" disabled selected>Seleziona</option>
          <option value="adulto">Adulto</option>
          <option value="bambino">Bambino</option>
          <option value="lattante">Lattante</option>
        </select>
      </div>

      <div style="grid-column:1 / -1;">
        <label for="ospite-allergie-${i}">Allergie / intolleranze</label>
        <input type="text" id="ospite-allergie-${i}" name="ospite-allergie-${i}" placeholder="Es. frutta secca, lattosio…">
      </div>
    `;
    return row;
  }

  function renderInvitati(n){
    listaInvitati.innerHTML = '';
    const count = Math.max(0, Math.min(Number(n) || 0, numMassimoInvitati));
    for (let i = 1; i <= count; i++){
      listaInvitati.appendChild(invitatoRow(i));
    }
    (count > 0) ? show(invitatiWrap) : hide(invitatiWrap);
  }

  numeroPersoneInput.addEventListener('input', (e) => {
    const n = parseInt(e.target.value, 10);
    if (Number.isFinite(n) && n > 0) renderInvitati(n);
    else {
      listaInvitati.innerHTML = '';
      hide(invitatiWrap);
    }
  });

  function buildRsvpPayload(){
    const presenza =
      radioPresente.checked ? 'si' :
      (radioAssente.checked ? 'no' : 'nd');

    const numero = presenza === 'si'
      ? parseInt(numeroPersoneInput.value || '0', 10)
      : 0;

    const invitati = Array.from(document.querySelectorAll('.invitato-row')).map(row => {
      const idx = row.dataset.index;
      return {
        index: Number(idx),
        nome: (document.getElementById(`ospite-nome-${idx}`).value || '').trim(),
        menu: (document.getElementById(`ospite-menu-${idx}`).value || '').trim(),
        allergie: (document.getElementById(`ospite-allergie-${idx}`).value || '').trim()
      };
    });

    return {
      cognomeFamiglia: famiglia.value,
      presenza,               // "si" | "no" | "nd"
      numeroPersone: numero,  // 0..10
      invitati,               // array di {index, nome, menu, allergie}
      note: (noteElement.value || '').trim(),
      email: (document.getElementById('email').value || '').trim()
    };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check GDPR consent first
    if (localStorage.getItem('wedding-gdpr-consent') !== 'accepted') {
      alert('Devi accettare i cookie per poter inviare il modulo.');
      return;
    }

    if (!famiglia.value.trim()){
      alert('Compila il campo Famiglia/Cognome');
      return;
    }

    if (!radioPresente.checked && !radioAssente.checked){
      alert('Indica se parteciperai all’evento.');
      return;
    }

    if (radioPresente.checked){
      const n = parseInt(numeroPersoneInput.value || '0', 10);
      if (!Number.isFinite(n) || n < 1){
        alert('Indica quante persone sarete.');
        return;
      }
      const invitatiValidi = Array
        .from(document.querySelectorAll('.invitato-row'))
        .every(row => {
          const idx = row.dataset.index;
          const nome = document.getElementById(`ospite-nome-${idx}`).value.trim();
          const menu = document.getElementById(`ospite-menu-${idx}`).value.trim();
          return nome !== '' && menu !== '';
        });
      if (!invitatiValidi){
        alert('Compila nome e menù per tutti gli invitati.');
        return;
      }
    }

    const payload = buildRsvpPayload();

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await new Promise((resolve, reject) => {
        grecaptcha.ready(() => {
          grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
            .then(resolve)
            .catch(reject);
        });
      });

      // Add reCAPTCHA token to payload
      payload.recaptchaToken = recaptchaToken;

      // Submit form
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      alert('Grazie! Abbiamo ricevuto la conferma.');
      form.reset();
      listaInvitati.innerHTML = '';
      hide(numeroPersoneWrap);
      hide(invitatiWrap);
    } catch (err){
      console.error('Submission error:', err);
      if (err.message.includes('reCAPTCHA')) {
        alert('Verifica di sicurezza fallita. Riprova.');
      } else if (err.message.includes('Too many requests')) {
        alert('Troppe richieste. Attendi un momento prima di riprovare.');
      } else {
        alert('Si è verificato un errore. Riprova tra poco.');
      }
    }
  });

  // Init
  onPresenzaChange();
})();
