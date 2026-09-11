<?php
/**
 * ============================================================================
 * FILE STORE + RATE LIMITER (no database needed)
 * ============================================================================
 * Secrets (bcrypt hashes) live in api/data/*.json with 0600 permissions.
 * Writes are atomic (write temp + rename) so files can never corrupt.
 */

require_once __DIR__ . '/config.php';

/** Read a JSON store file. Returns $default when missing/corrupt. */
function store_read($name, $default = array()) {
  if (!ensure_data_dir()) return $default;
  $f = DATA_DIR . '/' . $name . '.json';
  if (!is_file($f)) return $default;
  $raw = @file_get_contents($f);
  if (!is_string($raw) || $raw === '') return $default;
  $d = json_decode($raw, true);
  return is_array($d) ? $d : $default;
}

/** Atomically write a JSON store file. */
function store_write($name, $data) {
  if (!ensure_data_dir()) return false;
  $f = DATA_DIR . '/' . $name . '.json';
  try {
    $tmp = $f . '.' . bin2hex(random_bytes(8)) . '.tmp';
  } catch (Exception $e) {
    return false;
  }
  $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  if (!is_string($json)) return false;
  if (@file_put_contents($tmp, $json, LOCK_EX) === false) return false;
  @chmod($tmp, 0600);
  if (!@rename($tmp, $f)) { @unlink($tmp); return false; }
  @chmod($f, 0600);
  return true;
}

/**
 * Sliding-window rate limiter (file backed).
 * @param string $bucket  Unique key, e.g. 'login:1.2.3.4'
 * @param int    $max     Max attempts per window
 * @param int    $window  Window in seconds
 * @param bool   $record  Record this attempt (false = check only)
 * @return array [allowed(bool), retryAfter(int seconds)]
 */
function rate_limit($bucket, $max, $window, $record = true) {
  $all = store_read('ratelimit', array());
  $now = time();
  $list = (isset($all[$bucket]) && is_array($all[$bucket])) ? $all[$bucket] : array();
  $fresh = array();
  foreach ($list as $t) {
    if (is_int($t) && ($now - $t) < $window) { $fresh[] = $t; }
  }
  sort($fresh);
  if (count($fresh) >= $max) {
    $retry = $window - ($now - $fresh[0]);
    return array(false, $retry > 0 ? (int)$retry : $window);
  }
  if ($record) {
    $fresh[] = $now;
    $all[$bucket] = $fresh;
    // Opportunistic prune: keep the file small
    if (count($all) > 200) {
      $pruned = array();
      foreach ($all as $k => $v) {
        if (!is_array($v)) continue;
        $kept = array();
        foreach ($v as $t) {
          if (is_int($t) && ($now - $t) < 86400) { $kept[] = $t; }
        }
        if (!empty($kept)) { $pruned[$k] = $kept; }
      }
      $all = $pruned;
      $all[$bucket] = $fresh;
    }
    store_write('ratelimit', $all);
  }
  return array(true, 0);
}
