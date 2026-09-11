<?php
/**
 * ============================================================================
 * LIVE CONTENT SYNC — the site's editable content follows the owner across
 * devices (desktop → phone) and stays fresh for every visitor.
 * ============================================================================
 *   GET  ?action=get   (PUBLIC, rate-limited) → {ok, content, updatedAt} | {ok, empty:true}
 *   POST ?action=save  (ADMIN SESSION required) → {ok:true, updatedAt}
 *
 * Content is public website copy (boards, articles, skills, ...). It NEVER
 * holds secrets — users, passwords, SMTP and OTP data live elsewhere.
 */

require_once __DIR__ . '/session.php';
require_once __DIR__ . '/store.php';

sec_session_start();
$action = isset($_GET['action']) ? (string)$_GET['action'] : '';

// --- Public, read-only, side-effect free → GET allowed ---
if ($action === 'get') {
  list($allowed, $retry) = rate_limit('contentget:' . client_ip(), RL_CONTENT_GET[0], RL_CONTENT_GET[1]);
  if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));
  $saved = store_read('content', null);
  if (!is_array($saved) || !is_array($saved['content'] ?? null)) {
    api_json(array('ok' => true, 'empty' => true));
  }
  api_json(array(
    'ok' => true,
    'content' => $saved['content'],
    'updatedAt' => (int)($saved['updatedAt'] ?? 0),
  ));
}

if ($action !== 'save') api_fail('unknown_action', 404);
api_require_post();
if (!sec_is_authed()) api_fail('auth_required', 401);
list($allowed, $retry) = rate_limit('content:' . client_ip(), RL_CONTENT[0], RL_CONTENT[1]);
if (!$allowed) api_fail('rate_limit', 429, array('retryAfter' => $retry));

$in = api_input();
$content = $in['content'] ?? null;
$updatedAt = (int)($in['updatedAt'] ?? 0);
if ($updatedAt > 4102444800) $updatedAt = (int)floor($updatedAt / 1000); // tolerate ms stamps
if (!is_array($content)) api_fail('invalid_content');
if ($updatedAt <= 0 || $updatedAt > time() + 300) api_fail('invalid_timestamp');
$json = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if (!is_string($json) || strlen($json) > CONTENT_MAX_BYTES) api_fail('too_large');
if (!store_write('content', array('content' => $content, 'updatedAt' => $updatedAt))) {
  api_fail('save_failed', 500);
}
api_json(array('ok' => true, 'updatedAt' => $updatedAt));
