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
 */
function doPost(e) {
  const p = (e && e.parameter) || {};
  // hidden field real people never fill in; bots that fill every field get a quiet "ok" and nothing is saved
  if (p.website) return reply_('ok');
  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return reply_('invalid');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheet_();
    const emails = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat()
      .map(function (v) { return String(v).trim().toLowerCase(); });
    const row = emails.indexOf(email);
    const page = String(p.page || '').slice(0, 200);
    if (row === -1) {
      sheet.appendRow([email, new Date(), page, 'subscribed']);
      notify_('New subscriber: ' + email, email + ' signed up' + (page ? ' from ' + page : '') + '.');
    } else if (sheet.getRange(row + 2, 4).getValue() !== 'subscribed') {
      sheet.getRange(row + 2, 2, 1, 3).setValues([[new Date(), page, 'subscribed']]);
      notify_('Re-subscribed: ' + email, email + ' signed up again' + (page ? ' from ' + page : '') + '.');
    }
  } finally {
    lock.releaseLock();
  }
  return reply_('ok');
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

function notify_(subject, body) {
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), subject,
    body + '\n\nThe list: ' + SpreadsheetApp.getActive().getUrl());
}

function reply_(text) {
  return ContentService.createTextOutput(text);
}

// Run once from the editor (select it, then Run) to approve permissions and send yourself a test notification.
function setup() {
  sheet_();
  notify_('Blog sign-ups are connected', 'New subscribers will show up in the sheet and in emails like this one.');
}
