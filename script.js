/* XZAI static profile renderer. Add a JSON file in /profiles; no template edits needed. */
const SOCIALS = {
  facebook: { label: 'Facebook', icon: 'f' }, instagram: { label: 'Instagram', icon: '◎' },
  linkedin: { label: 'LinkedIn', icon: 'in' }, viber: { label: 'Viber', icon: '◔' },
  tiktok: { label: 'TikTok', icon: '♪' }, twitter: { label: 'X', icon: '𝕏' },
  youtube: { label: 'YouTube', icon: '▶' }, website: { label: 'Website', icon: '◌' }
};

const $ = (selector) => document.querySelector(selector);
const escapeVCard = (value = '') => String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const clean = (value) => typeof value === 'string' ? value.trim() : '';

function getProfileSlug() {
  const queryProfile = new URLSearchParams(location.search).get('profile');
  if (queryProfile) return queryProfile.replace(/[^a-z0-9_-]/gi, '');
  // This also lets hosts configured with a SPA fallback use /john.
  const tail = location.pathname.split('/').filter(Boolean).pop();
  return tail && !tail.includes('.') ? tail.replace(/[^a-z0-9_-]/gi, '') : 'john';
}

function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'XZ'; }
function externalLink(anchor, url) { anchor.href = url; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }

function addAction(label, icon, href) {
  const node = $('#action-template').content.firstElementChild.cloneNode(true);
  node.href = href; node.querySelector('.action-icon').textContent = icon; node.querySelector('.action-label').textContent = label;
  $('#primary-actions').append(node);
}

function addDetail(icon, value) {
  const row = document.createElement('div'); row.className = 'detail-row';
  row.innerHTML = `<span class="detail-icon" aria-hidden="true">${icon}</span><span></span>`;
  row.lastElementChild.textContent = value; $('#details').append(row); $('#details').hidden = false;
}

function renderAvatar(profile) {
  const avatar = $('#avatar'); avatar.textContent = initials(profile.name);
  if (!clean(profile.profileImage)) return;
  const image = new Image(); image.alt = `${profile.name || 'Profile'} photo`;
  image.onload = () => { avatar.replaceChildren(image); };
  image.src = profile.profileImage; // Keeps initials visible if the file cannot load.
}

function render(profile) {
  document.title = `${profile.name || 'Profile'} | XZAI`;
  $('#name').textContent = clean(profile.name) || 'Your Name';
  renderAvatar(profile);
  const role = [clean(profile.jobTitle), clean(profile.company)].filter(Boolean).join(' · ');
  if (role) { $('#role').textContent = role; $('#role').hidden = false; }
  if (clean(profile.bio)) { $('#bio').textContent = profile.bio; $('#bio').hidden = false; }
  if (clean(profile.phone)) addAction('Call', '⌕', `tel:${profile.phone}`);
  if (clean(profile.email)) addAction('Email', '✉', `mailto:${profile.email}`);
  [['⌖', profile.location || profile.address], ['◷', profile.businessHours], ['◉', profile.birthday]].forEach(([icon, value]) => { if (clean(value)) addDetail(icon, value); });
  Object.entries(SOCIALS).forEach(([key, config]) => {
    const url = clean(profile.socials?.[key]); if (!url) return;
    const node = $('#social-template').content.firstElementChild.cloneNode(true);
    node.querySelector('.social-icon').textContent = config.icon; node.querySelector('.social-label').textContent = config.label;
    // Viber can use its app scheme; all other URLs deliberately open a new tab.
    if (key === 'viber') node.href = url; else externalLink(node, url);
    $('#social-links').append(node); $('#social-section').hidden = false;
  });
  (Array.isArray(profile.customLinks) ? profile.customLinks : []).forEach(link => {
    if (!clean(link?.title) || !clean(link?.url)) return;
    const node = $('#custom-template').content.firstElementChild.cloneNode(true);
    node.querySelector('.custom-title').textContent = link.title; externalLink(node, link.url);
    $('#custom-links').append(node); $('#custom-section').hidden = false;
  });
  $('#save-contact').addEventListener('click', () => downloadVCard(profile));
  $('#loading').hidden = true; $('#profile').hidden = false;
}

function downloadVCard(profile) {
  const website = clean(profile.socials?.website);
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVCard(profile.name)}`];
  if (clean(profile.company)) lines.push(`ORG:${escapeVCard(profile.company)}`);
  if (clean(profile.jobTitle)) lines.push(`TITLE:${escapeVCard(profile.jobTitle)}`);
  if (clean(profile.phone)) lines.push(`TEL;TYPE=CELL:${escapeVCard(profile.phone)}`);
  if (clean(profile.email)) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(profile.email)}`);
  if (website) lines.push(`URL:${escapeVCard(website)}`);
  lines.push('END:VCARD');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
  const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(blob); anchor.download = `${(profile.name || 'contact').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.vcf`;
  document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(anchor.href);
}

async function start() {
  const slug = getProfileSlug();
  try {
    const response = await fetch(`profiles/${slug}.json`);
    if (!response.ok) throw new Error('Profile not found');
    render(await response.json());
  } catch (error) {
    $('#loading').textContent = `We couldn’t load this profile. Check profiles/${slug}.json.`;
    console.error(error);
  }
}
start();
