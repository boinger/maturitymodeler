/**
 * Custom ES module loader for Jest tests
 * Resolves module linking issues
 */

export async function resolve(specifier, context, defaultResolve) {
  // Handle relative imports with .js extension
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    if (!specifier.endsWith('.js') && !specifier.endsWith('.mjs')) {
      // Add .js extension if missing
      specifier = specifier + '.js';
    }
  }
  
  return defaultResolve(specifier, context);
}

export async function load(url, context, defaultLoad) {
  // Load the module normally
  const result = await defaultLoad(url, context);
  return result;
}