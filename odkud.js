const ODKUD_RE = /^\/clanky\/([a-z0-9-]{1,120})$/;
function slugZReferreru(referrer, origin) {
  try {
    const u = new URL(referrer);
    if (u.origin !== origin) return '';
    const m = ODKUD_RE.exec(u.pathname);
    return m ? m[1] : '';
  } catch { return ''; }
}
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  const s = slugZReferreru(document.referrer, location.origin);
  if (s) document.querySelectorAll('input[name="odkud"]').forEach((i) => { i.value = s; });
});
