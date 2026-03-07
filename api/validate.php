<?php
/**
 * Server-side config validation.
 * Mirrors js/config/configSchema.js validateConfig().
 */

/**
 * Validate a config object (decoded JSON associative array).
 * Returns ['valid' => true] or ['valid' => false, 'error' => '...'].
 */
function validateConfigData(array $config): array {
    // categories: required, non-empty array of strings
    if (empty($config['categories']) || !is_array($config['categories'])) {
        return err('categories must be a non-empty array of strings');
    }
    foreach ($config['categories'] as $i => $cat) {
        if (!is_string($cat)) {
            return err("categories[$i] must be a string");
        }
    }

    // applications: required, non-empty array of strings
    if (empty($config['applications']) || !is_array($config['applications'])) {
        return err('applications must be a non-empty array of strings');
    }
    foreach ($config['applications'] as $i => $app) {
        if (!is_string($app)) {
            return err("applications[$i] must be a string");
        }
    }

    // maturityData: required, dimensions must match
    if (empty($config['maturityData']) || !is_array($config['maturityData'])) {
        return err('maturityData must be a non-empty array');
    }
    $appCount = count($config['applications']);
    $catCount = count($config['categories']);

    if (count($config['maturityData']) !== $appCount) {
        return err(
            'maturityData length (' . count($config['maturityData']) .
            ') must match applications length (' . $appCount . ')'
        );
    }

    foreach ($config['maturityData'] as $i => $appData) {
        if (!is_array($appData)) {
            return err("maturityData[$i] must be an array");
        }
        if (count($appData) !== $catCount) {
            return err(
                "maturityData[$i] length (" . count($appData) .
                ") must match categories length ($catCount)"
            );
        }
        foreach ($appData as $j => $point) {
            if (!is_array($point)) {
                return err("maturityData[$i][$j] must be an object");
            }
            if (!isset($point['value']) || !is_numeric($point['value'])) {
                return err("maturityData[$i][$j].value must be a number");
            }
            if (!isset($point['app']) || !is_string($point['app'])) {
                return err("maturityData[$i][$j].app must be a string");
            }
            if (!isset($point['axis']) || !is_string($point['axis'])) {
                return err("maturityData[$i][$j].axis must be a string");
            }
        }
    }

    // scale validation (optional but validated if present)
    if (isset($config['scale'])) {
        $scale = $config['scale'];
        if (!isset($scale['min']) || !is_numeric($scale['min']) ||
            !isset($scale['max']) || !is_numeric($scale['max'])) {
            return err('scale.min and scale.max must be numbers');
        }
        if ($scale['min'] >= $scale['max']) {
            return err('scale.min must be less than scale.max');
        }
        if (isset($scale['levels'])) {
            if (!is_array($scale['levels']) || count($scale['levels']) < 2) {
                return err('scale.levels must be an array with at least 2 entries');
            }
            for ($i = 0; $i < count($scale['levels']); $i++) {
                $level = $scale['levels'][$i];
                if (!isset($level['score']) || !is_numeric($level['score'])) {
                    return err("scale.levels[$i].score must be a number");
                }
                if (!isset($level['label']) || !is_string($level['label'])) {
                    return err("scale.levels[$i].label must be a string");
                }
                if ($i > 0 && $level['score'] <= $scale['levels'][$i - 1]['score']) {
                    return err('scale.levels must be ordered by ascending score');
                }
            }
        }
    }

    // theme.colorPalette validation (optional)
    if (isset($config['theme']['colorPalette'])) {
        if (!is_array($config['theme']['colorPalette']) ||
            count($config['theme']['colorPalette']) === 0) {
            return err('theme.colorPalette must be a non-empty array');
        }
    }

    return ['valid' => true];
}

/**
 * Sanitize string values recursively using htmlspecialchars.
 */
function sanitizeConfigStrings($data) {
    if (is_string($data)) {
        return htmlspecialchars($data, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
    if (is_array($data)) {
        $result = [];
        foreach ($data as $key => $value) {
            $sanitizedKey = is_string($key)
                ? htmlspecialchars($key, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
                : $key;
            $result[$sanitizedKey] = sanitizeConfigStrings($value);
        }
        return $result;
    }
    return $data;
}

function err(string $message): array {
    return ['valid' => false, 'error' => $message];
}
