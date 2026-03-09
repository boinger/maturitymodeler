<?php
/**
 * Authentication module for Maturity Modeler admin.
 *
 * Provides bcrypt password verification, PHP session management,
 * and file-based rate limiting.
 */

// ── Configuration ──────────────────────────────────────────────────
require_once __DIR__ . '/secrets.php'; // defines ADMIN_PASSWORD_HASH

define('SESSION_LIFETIME', 7200); // 2 hours
define('RATE_LIMIT_WINDOW', 900); // 15 minutes
define('RATE_LIMIT_MAX', 5);      // max attempts per window
define('RATE_LIMIT_DIR', __DIR__ . '/../configs/.ratelimit');

// ── Session helpers ────────────────────────────────────────────────

function startAuthSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'secure'   => true,
            'httponly'  => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }
}

function isAuthenticated(): bool {
    startAuthSession();
    if (empty($_SESSION['authenticated'])) {
        return false;
    }
    if (time() - ($_SESSION['auth_time'] ?? 0) > SESSION_LIFETIME) {
        session_destroy();
        return false;
    }
    return true;
}

function requireAuth(): void {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit;
    }
}

// ── Password verification ──────────────────────────────────────────

function verifyPassword(string $password): bool {
    return password_verify($password, ADMIN_PASSWORD_HASH);
}

function login(string $password): bool {
    startAuthSession();

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!checkRateLimit($ip)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many attempts. Try again later.']);
        exit;
    }

    if (!verifyPassword($password)) {
        recordFailedAttempt($ip);
        return false;
    }

    // Regenerate session ID to prevent fixation
    session_regenerate_id(true);
    $_SESSION['authenticated'] = true;
    $_SESSION['auth_time'] = time();
    clearFailedAttempts($ip);
    return true;
}

function logout(): void {
    startAuthSession();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
}

// ── File-based rate limiting ───────────────────────────────────────

function getRateLimitFile(string $ip): string {
    if (!is_dir(RATE_LIMIT_DIR)) {
        mkdir(RATE_LIMIT_DIR, 0700, true);
    }
    // Sanitize IP for filename
    $safe = preg_replace('/[^a-zA-Z0-9._-]/', '_', $ip);
    return RATE_LIMIT_DIR . '/' . $safe . '.json';
}

function checkRateLimit(string $ip): bool {
    $file = getRateLimitFile($ip);
    if (!file_exists($file)) {
        return true;
    }

    $data = json_decode(file_get_contents($file), true);
    if (!$data || !isset($data['attempts'])) {
        return true;
    }

    // Filter to attempts within the window
    $cutoff = time() - RATE_LIMIT_WINDOW;
    $recent = array_filter($data['attempts'], function ($ts) use ($cutoff) {
        return $ts > $cutoff;
    });

    return count($recent) < RATE_LIMIT_MAX;
}

function recordFailedAttempt(string $ip): void {
    $file = getRateLimitFile($ip);
    $data = ['attempts' => []];

    if (file_exists($file)) {
        $existing = json_decode(file_get_contents($file), true);
        if ($existing && isset($existing['attempts'])) {
            $data = $existing;
        }
    }

    $data['attempts'][] = time();

    // Prune old entries
    $cutoff = time() - RATE_LIMIT_WINDOW;
    $data['attempts'] = array_values(array_filter($data['attempts'], function ($ts) use ($cutoff) {
        return $ts > $cutoff;
    }));

    $fp = fopen($file, 'c');
    if ($fp && flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        fwrite($fp, json_encode($data));
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

function clearFailedAttempts(string $ip): void {
    $file = getRateLimitFile($ip);
    if (file_exists($file)) {
        @unlink($file);
    }
}
