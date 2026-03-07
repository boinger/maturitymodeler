<?php
/**
 * REST endpoint for maturity model config management.
 *
 * Routes via $_GET['action']:
 *   GET  list      - Config library with metadata
 *   GET  get&name= - Specific config JSON
 *   GET  active    - Active config or null
 *   POST login     - Password → session
 *   POST logout    - Destroy session
 *   POST save      - Save {name, config}
 *   POST delete    - Delete by name
 *   POST setactive - Set site default
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/validate.php';

// ── Constants ──────────────────────────────────────────────────────
define('CONFIGS_DIR', __DIR__ . '/../configs');
define('REGISTRY_FILE', CONFIGS_DIR . '/_registry.json');
define('MAX_CONFIG_SIZE', 1048576); // 1 MB
define('NAME_PATTERN', '/^[a-zA-Z0-9_-]{1,50}$/');

// ── Response helper ────────────────────────────────────────────────

function jsonResponse($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function success($data = null): void {
    jsonResponse(['success' => true, 'data' => $data]);
}

function fail(string $error, int $status = 400): void {
    jsonResponse(['success' => false, 'error' => $error], $status);
}

// ── Registry helpers ───────────────────────────────────────────────

function readRegistry(): array {
    if (!file_exists(REGISTRY_FILE)) {
        return ['active' => null, 'configs' => []];
    }
    $data = json_decode(file_get_contents(REGISTRY_FILE), true);
    return is_array($data) ? $data : ['active' => null, 'configs' => []];
}

function writeRegistry(array $registry): bool {
    $fp = fopen(REGISTRY_FILE, 'c');
    if (!$fp) {
        return false;
    }
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($registry, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

function slugify(string $name): string {
    // Convert to lowercase, replace spaces/special chars with hyphens
    $slug = strtolower(trim($name));
    $slug = preg_replace('/[^a-z0-9_-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    return substr($slug, 0, 50);
}

// ── Route handling ─────────────────────────────────────────────────

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {

    // ── Public GET endpoints ───────────────────────────────────────

    case 'list':
        if ($method !== 'GET') fail('Method not allowed', 405);
        $registry = readRegistry();
        $list = [];
        foreach ($registry['configs'] as $slug => $meta) {
            $list[] = [
                'slug'      => $slug,
                'name'      => $meta['name'] ?? $slug,
                'created'   => $meta['created'] ?? null,
                'updated'   => $meta['updated'] ?? null,
                'active'    => $slug === $registry['active'],
            ];
        }
        success($list);
        break;

    case 'get':
        if ($method !== 'GET') fail('Method not allowed', 405);
        $name = $_GET['name'] ?? '';
        if (!preg_match(NAME_PATTERN, $name)) {
            fail('Invalid config name');
        }
        $file = CONFIGS_DIR . '/' . $name . '.json';
        if (!file_exists($file)) {
            fail('Config not found', 404);
        }
        $config = json_decode(file_get_contents($file), true);
        success($config);
        break;

    case 'active':
        if ($method !== 'GET') fail('Method not allowed', 405);
        $registry = readRegistry();
        if (!$registry['active']) {
            success(null);
            break;
        }
        $file = CONFIGS_DIR . '/' . $registry['active'] . '.json';
        if (!file_exists($file)) {
            success(null);
            break;
        }
        $config = json_decode(file_get_contents($file), true);
        success([
            'slug'   => $registry['active'],
            'name'   => $registry['configs'][$registry['active']]['name'] ?? $registry['active'],
            'config' => $config,
        ]);
        break;

    // ── Auth endpoints ─────────────────────────────────────────────

    case 'login':
        if ($method !== 'POST') fail('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $password = $input['password'] ?? '';
        if (!is_string($password) || $password === '') {
            fail('Password required');
        }
        if (login($password)) {
            success(['message' => 'Logged in']);
        } else {
            fail('Invalid password', 401);
        }
        break;

    case 'logout':
        if ($method !== 'POST') fail('Method not allowed', 405);
        logout();
        success(['message' => 'Logged out']);
        break;

    // ── Protected endpoints ────────────────────────────────────────

    case 'save':
        if ($method !== 'POST') fail('Method not allowed', 405);
        requireAuth();

        $raw = file_get_contents('php://input');
        if (strlen($raw) > MAX_CONFIG_SIZE) {
            fail('Config exceeds maximum size of 1MB');
        }

        $input = json_decode($raw, true);
        if (!$input || !isset($input['name']) || !isset($input['config'])) {
            fail('Request must include "name" and "config"');
        }

        $displayName = trim($input['name']);
        if ($displayName === '') {
            fail('Config name cannot be empty');
        }

        $slug = $input['slug'] ?? slugify($displayName);
        if (!preg_match(NAME_PATTERN, $slug)) {
            fail('Invalid config slug. Use only letters, numbers, hyphens, underscores (max 50 chars).');
        }

        // Validate config
        $config = $input['config'];
        if (!is_array($config)) {
            fail('Config must be a JSON object');
        }

        $validation = validateConfigData($config);
        if (!$validation['valid']) {
            fail('Validation failed: ' . $validation['error']);
        }

        // Sanitize strings
        $config = sanitizeConfigStrings($config);

        // Write config file
        $configFile = CONFIGS_DIR . '/' . $slug . '.json';
        $written = file_put_contents(
            $configFile,
            json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            LOCK_EX
        );
        if ($written === false) {
            fail('Failed to write config file', 500);
        }

        // Update registry
        $registry = readRegistry();
        $now = date('c');
        $isNew = !isset($registry['configs'][$slug]);
        $registry['configs'][$slug] = [
            'name'    => $displayName,
            'created' => $isNew ? $now : ($registry['configs'][$slug]['created'] ?? $now),
            'updated' => $now,
        ];

        if (!writeRegistry($registry)) {
            fail('Failed to update registry', 500);
        }

        success([
            'slug'    => $slug,
            'name'    => $displayName,
            'created' => $registry['configs'][$slug]['created'],
            'updated' => $now,
        ]);
        break;

    case 'delete':
        if ($method !== 'POST') fail('Method not allowed', 405);
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $slug = $input['slug'] ?? '';
        if (!preg_match(NAME_PATTERN, $slug)) {
            fail('Invalid config name');
        }

        $registry = readRegistry();
        if (!isset($registry['configs'][$slug])) {
            fail('Config not found', 404);
        }

        // Remove file
        $configFile = CONFIGS_DIR . '/' . $slug . '.json';
        if (file_exists($configFile)) {
            unlink($configFile);
        }

        // Clear active if this was the active config
        if ($registry['active'] === $slug) {
            $registry['active'] = null;
        }

        unset($registry['configs'][$slug]);
        if (!writeRegistry($registry)) {
            fail('Failed to update registry', 500);
        }

        success(['deleted' => $slug]);
        break;

    case 'setactive':
        if ($method !== 'POST') fail('Method not allowed', 405);
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $slug = $input['slug'] ?? null; // null = clear active

        $registry = readRegistry();

        if ($slug === null || $slug === '') {
            // Clear active
            $registry['active'] = null;
        } else {
            if (!preg_match(NAME_PATTERN, $slug)) {
                fail('Invalid config name');
            }
            if (!isset($registry['configs'][$slug])) {
                fail('Config not found', 404);
            }
            $registry['active'] = $slug;
        }

        if (!writeRegistry($registry)) {
            fail('Failed to update registry', 500);
        }

        success(['active' => $registry['active']]);
        break;

    default:
        fail('Unknown action: ' . htmlspecialchars($action, ENT_QUOTES, 'UTF-8'), 400);
}
