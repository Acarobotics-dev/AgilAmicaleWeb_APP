const CLIENT_URL = process.env.CLIENT_URI_1 || process.env.CLIENT_URI_2;

const wrapHtml = (title, bodyHtml) => {
  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      /* Simple responsive email styles */
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f4f6f8; margin:0; padding:20px; }
      .container { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(16,24,40,0.08); }
      .header { background: linear-gradient(90deg,#0366d6,#0ea5e9); color: #fff; padding: 18px 24px; }
      .header h1 { margin:0; font-size:18px; }
      .body { padding: 20px; color: #0f172a; }
      .cta { display:inline-block; margin-top:18px; padding:10px 16px; background:#0366d6; color:#fff; border-radius:6px; text-decoration:none; }
      .footer { padding:14px 20px; font-size:12px; color:#64748b; }
      @media (max-width:480px){ .header h1{font-size:16px} .body{padding:14px} }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${escapeHtml(title)}</h1>
      </div>
      <div class="body">
        ${bodyHtml}
        <p style="margin-top:18px;">Si vous avez des questions, contactez le support.</p>
        <a class="cta" href="${CLIENT_URL}" target="_blank" rel="noopener">Ouvrir l'application</a>
      </div>
      <div class="footer">
        <div>L'équipe AGIL Amicale</div>
        <div style="margin-top:6px;">&copy; ${new Date().getFullYear()} AGIL Amicale</div>
      </div>
    </div>
  </body>
  </html>`;
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function houseCreatedTemplate(house) {
  const title = `Nouvelle maison: ${house.title || 'Nouvelle location'}`;
  const bodyParts = [];
  bodyParts.push(`<p>Bonjour,</p>`);
  bodyParts.push(`<p>Une nouvelle maison a été ajoutée sur <strong>AGIL Amicale</strong>.</p>`);
  bodyParts.push(`<p><strong>Titre:</strong> ${escapeHtml(house.title || 'N/A')}</p>`);
  if (house.location) bodyParts.push(`<p><strong>Emplacement:</strong> ${escapeHtml(house.location)}</p>`);
  if (house.capacity) bodyParts.push(`<p><strong>Capacité:</strong> ${escapeHtml(house.capacity)}</p>`);
  if (house.price && house.price.length > 0 && house.price[0].price) bodyParts.push(`<p><strong>Prix:</strong> À partir de ${escapeHtml(house.price[0].price)}</p>`);
  if (house.amenities && house.amenities.length > 0) bodyParts.push(`<p><strong>Équipements:</strong> ${escapeHtml(house.amenities.slice(0,3).join(', '))}</p>`);
  const text = [`Nouvelle maison: ${house.title || 'Nouvelle location'}`, '', `Titre: ${house.title || 'N/A'}`, house.location ? `Emplacement: ${house.location}` : null, house.capacity ? `Capacité: ${house.capacity}` : null].filter(Boolean).join('\n');
  return { subject: title, text, html: wrapHtml(title, bodyParts.join('')) };
}

function houseUpdatedTemplate(house) {
  const title = `Mise à jour: ${house.title || 'Maison'}`;
  const text = `La maison "${house.title || ''}" a été mise à jour. Connectez-vous pour voir les détails.`;
  const body = `<p>Bonjour,</p><p>La maison <strong>${escapeHtml(house.title || '')}</strong> a été mise à jour. Connectez-vous à l'application pour voir les nouvelles informations.</p>`;
  return { subject: title, text, html: wrapHtml(title, body) };
}

function eventCreatedTemplate(event) {
  const title = `Nouvel${event.type && event.type.startsWith('E') ? ' ' : ' '} ${event.type || 'événement'}: ${event.title || ''}`.replace(/\s+/g,' ');
  const bodyParts = [];
  bodyParts.push(`<p>Bonjour,</p>`);
  bodyParts.push(`<p>Un nouvel évènement a été ajouté sur <strong>AGIL Amicale</strong>.</p>`);
  bodyParts.push(`<p><strong>Titre:</strong> ${escapeHtml(event.title || 'N/A')}</p>`);
  if (event.startDate) bodyParts.push(`<p><strong>Dates:</strong> ${escapeHtml(new Date(event.startDate).toLocaleDateString())}${event.endDate ? ' - ' + escapeHtml(new Date(event.endDate).toLocaleDateString()) : ''}</p>`);
  if (event.destination) bodyParts.push(`<p><strong>Destination:</strong> ${escapeHtml(event.destination)}</p>`);
  const text = [`Nouvel événement: ${event.title || ''}`, event.startDate ? `Dates: ${new Date(event.startDate).toLocaleDateString()}` : ''].filter(Boolean).join('\n');
  return { subject: title, text, html: wrapHtml(title, bodyParts.join('')) };
}

function eventUpdatedTemplate(event) {
  const title = `Mise à jour: ${event.title || 'Événement'}`;
  const text = `L'événement "${event.title || ''}" a été mis à jour. Connectez-vous pour voir les détails.`;
  const body = `<p>Bonjour,</p><p>L'événement <strong>${escapeHtml(event.title || '')}</strong> a été mis à jour. Connectez-vous à l'application pour voir les nouvelles informations.</p>`;
  return { subject: title, text, html: wrapHtml(title, body) };
}

module.exports = {
  houseCreatedTemplate,
  houseUpdatedTemplate,
  eventCreatedTemplate,
  eventUpdatedTemplate,
};
