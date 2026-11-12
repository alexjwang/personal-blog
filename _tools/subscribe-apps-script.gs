/**
 * Blog email sign-ups → a Google Sheet Alex owns, plus an email to him for each new one.
 *
 * Lives in the "Blog Mailing List" Google Sheet (Extensions → Apps Script), deployed as a web app
 * (Execute as: Me, Who has access: Anyone). Its /exec URL goes in the blog's _config.yml as subscribe_url,
 * and the form in _includes/subscribe.html posts to it. This file is the source of truth; after editing it,
 * paste it into the Apps Script editor and use Deploy → Manage deployments → Edit → New version,
 * which keeps the same URL.
 *
 * Sheet columns: email | signed up | from page | status
 * status is "subscribed" for new rows; set it to "unsubscribed" rather than deleting a row, so a person
 * who signs up again later is noticed.
 *
 * Safety, since the URL is public:
 * - The only email this script ever sends goes to the script's owner (Alex). Nothing submitted changes the recipient.
 * - Submitted values are checked against strict patterns before touching the Sheet, so nothing that starts with
 *   "=", "+", "-" or "@" (which Sheets would run as a formula, e.g. IMPORTDATA sending the list somewhere) gets in.
 * - At most MAX_PER_DAY new sign-ups are accepted per day; past that, submissions are dropped and Alex gets one
 *   heads-up email, so a flood can't fill the Sheet or his inbox.
 * - Keep the Sheet unshared: anyone with edit access to it can also edit this script.
 */
const MAX_PER_DAY = 25;
const EMAIL_RE = /^[a-z0-9][a-z0-9._%+-]{0,63}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const PAGE_RE = /^\/[a-z0-9\/._-]{0,150}$/i;

function doPost(e) {
  const p = (e && e.parameter) || {};
  // hidden field real people never fill in; bots that fill every field get a quiet "ok" and nothing is saved
  if (p.website) return reply_('ok');
  const email = String(p.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return reply_('invalid');
  const rawPage = String(p.page || '').trim();
  const page = PAGE_RE.test(rawPage) ? rawPage : '';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheet_();
    const emails = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat()
      .map(function (v) { return String(v).trim().toLowerCase(); });
    const row = emails.indexOf(email);
    if (row !== -1 && sheet.getRange(row + 2, 4).getValue() === 'subscribed') return reply_('ok');
    if (!underDailyCap_()) return reply_('ok');
    if (row === -1) {
      sheet.appendRow([email, new Date(), page, 'subscribed']);
      notify_('New subscriber: ' + email, email + ' signed up' + (page ? ' from ' + page : '') + '.');
    } else {
      sheet.getRange(row + 2, 2, 1, 3).setValues([[new Date(), page, 'subscribed']]);
      notify_('Re-subscribed: ' + email, email + ' signed up again' + (page ? ' from ' + page : '') + '.');
    }
  } finally {
    lock.releaseLock();
  }
  return reply_('ok');
}

// Counts today's accepted sign-ups; true while under the cap. Crossing it sends Alex a single heads-up.
function underDailyCap_() {
  const props = PropertiesService.getScriptProperties();
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  const count = props.getProperty('day') === today ? Number(props.getProperty('count') || 0) : 0;
  props.setProperties({ day: today, count: String(count + 1) });
  if (count < MAX_PER_DAY) return true;
  if (count === MAX_PER_DAY) {
    notify_('Blog sign-ups paused for today',
      'More than ' + MAX_PER_DAY + ' sign-ups came in today, which looks like spam. Further ones are being dropped until tomorrow. ' +
      'If it keeps happening, delete the deployment in Apps Script (Deploy → Manage deployments → archive) to turn the form off.');
  }
  return false;
}

// Visiting the URL directly (or a browser without JavaScript posting the form) shows a plain page.
function doGet() {
  return HtmlService.createHtmlOutput('<p style="font-family:sans-serif">Thanks! You\'re on the list.</p>');
}

// The subscribers live on the spreadsheet's first tab, whatever it's called.
function sheet_() {
  const sheet = SpreadsheetApp.getActive().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(['email', 'signed up', 'from page', 'status']);
  if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(1);
  return sheet;
}

// The only email the script sends, and always to the owner's own address.
function notify_(subject, body) {
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: subject,
    body: body + '\n\nThe list: ' + SpreadsheetApp.getActive().getUrl(),
  });
}

function reply_(text) {
  return ContentService.createTextOutput(text);
}

// Run once from the editor (select it, then Run) to approve permissions and send yourself a test notification.
function setup() {
  sheet_();
  notify_('Blog sign-ups are connected', 'New subscribers will show up in the sheet and in emails like this one.');
}
