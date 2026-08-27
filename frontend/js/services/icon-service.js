// services/icon-service.js - Centralized Theme-Aware File Icon Service
import { getCurrentTheme } from '../features/theme-engine.js';

export const THEME_CONTRAST_MODES = {
    'dark-plus': 'dark',
    'dracula': 'dark',
    'one-dark-pro': 'dark',
    'monokai': 'dark',
    'nord': 'dark',
    'solarized-dark': 'dark',
    'night-owl': 'dark',
    'light-plus': 'light',
    'solarized-light': 'light',
    'github-light': 'light',
    'project-hail-mary': 'dark',
    'interstellar': 'dark',
    'f1': 'dark'
};

// Registered theme-specific overrides (for future custom theme icon packs)
const themeOverrides = {};

export const LOCKED_ICONS = {
    home: {
        src: '/assets/icons/home.png',
        alt: 'Python',
        isThemeAware: false
    },
    about: {
        src: '/assets/icons/about.png',
        alt: 'HTML',
        isThemeAware: false
    },
    projects: {
        src: '/assets/icons/projects.png',
        alt: 'PostgreSQL',
        isThemeAware: false
    },
    resume: {
        src: '/assets/icons/resume.png',
        alt: 'PDF',
        isThemeAware: false
    },
    contacts: {
        dark: '/assets/icons/contacts_dark.png',
        light: '/assets/icons/contacts_light.png',
        alt: 'JWT',
        isThemeAware: true
    },
    markdown: {
        dark: '/assets/icons/markdown_dark.png',
        light: '/assets/icons/markdown_light.png',
        alt: 'Markdown',
        isThemeAware: true
    }
};

/**
 * Resolves the contrast mode ('light' | 'dark') for a given theme ID.
 */
export function getContrastMode(themeId) {
    const activeTheme = themeId || getCurrentTheme();
    return THEME_CONTRAST_MODES[activeTheme] || 'dark';
}

/**
 * Register an icon override for a specific theme.
 */
export function registerThemeIconOverride(themeId, keyOrExt, iconDef) {
    if (!themeOverrides[themeId]) {
        themeOverrides[themeId] = {};
    }
    themeOverrides[themeId][keyOrExt] = iconDef;
}

/**
 * Single source of truth for resolving a file icon based on file descriptor and active theme.
 * Priority:
 * 1. Custom uploaded icon (icon_url / has_icon)
 * 2. Theme-specific override (if registered)
 * 3. Locked PNG icon mapping (theme-aware or universal)
 * 4. Fallback (markdown)
 */
export function resolveIcon(fileOrNode, themeId) {
    const activeTheme = themeId || getCurrentTheme();
    const mode = getContrastMode(activeTheme);

    if (!fileOrNode) {
        const iconDef = LOCKED_ICONS.markdown;
        return {
            src: iconDef[mode],
            alt: iconDef.alt,
            key: 'markdown',
            isThemeAware: true,
            isCustom: false
        };
    }

    // 1. Custom uploaded icon priority from Admin API
    if (fileOrNode.icon_url) {
        return {
            src: fileOrNode.icon_url,
            alt: fileOrNode.title || fileOrNode.label || 'Custom Icon',
            key: 'custom',
            isThemeAware: false,
            isCustom: true
        };
    }
    if (fileOrNode.has_icon && fileOrNode.id) {
        const timestamp = fileOrNode._loadedAt || Date.now();
        return {
            src: `/api/sidebar/${fileOrNode.id}/icon?t=${timestamp}`,
            alt: fileOrNode.title || fileOrNode.label || 'Custom Icon',
            key: 'custom',
            isThemeAware: false,
            isCustom: true
        };
    }

    // 2. Extract file metadata
    const slug = (fileOrNode.slug || '').toLowerCase();
    const title = (fileOrNode.title || fileOrNode.label || fileOrNode.name || '').toLowerCase();
    const extension = (fileOrNode.extension || '').toLowerCase();

    // 3. Theme-specific override check
    if (themeOverrides[activeTheme]) {
        const override = themeOverrides[activeTheme][slug] || themeOverrides[activeTheme][extension];
        if (override) {
            const src = typeof override === 'string' ? override : (override[mode] || override.src);
            return {
                src,
                alt: override.alt || 'Icon',
                key: slug || extension || 'override',
                isThemeAware: typeof override === 'object' && !!override[mode],
                isCustom: false
            };
        }
    }

    // 4. File extension & slug mapping to locked PNG assets
    let iconKey = 'markdown';

    if (slug === 'home' || extension === '.py' || title.endsWith('.py') || title === 'home') {
        iconKey = 'home';
    } else if (slug === 'about' || extension === '.html' || extension === '.htm' || title.endsWith('.html') || title.endsWith('.htm') || title === 'about') {
        iconKey = 'about';
    } else if (slug === 'projects' || extension === '.sql' || title.endsWith('.sql') || title === 'projects') {
        iconKey = 'projects';
    } else if (slug === 'resume' || extension === '.pdf' || title.endsWith('.pdf') || title === 'resume') {
        iconKey = 'resume';
    } else if (slug.includes('contact') || extension === '.jwt' || title.endsWith('.jwt')) {
        iconKey = 'contacts';
    } else if (slug === 'readme' || extension === '.md' || extension === '.markdown' || title.endsWith('.md') || title === 'readme') {
        iconKey = 'markdown';
    } else if (slug === 'skills' || extension === '.json' || title.endsWith('.json') || title === 'skills') {
        iconKey = 'markdown';
    } else {
        iconKey = 'markdown';
    }

    const iconDef = LOCKED_ICONS[iconKey] || LOCKED_ICONS.markdown;
    const src = iconDef.isThemeAware ? iconDef[mode] : iconDef.src;

    return {
        src,
        alt: iconDef.alt,
        key: iconKey,
        isThemeAware: iconDef.isThemeAware,
        isCustom: false
    };
}

/**
 * Creates a standardized DOM icon element.
 */
export function createFileIconElement(fileOrNode, options = {}) {
    const iconInfo = resolveIcon(fileOrNode);
    const span = document.createElement('span');
    span.className = `icon ${options.className || 'tree-item-icon'}`.trim();

    if (iconInfo.isThemeAware) {
        span.setAttribute('data-theme-aware', 'true');
        span.setAttribute('data-file-key', iconInfo.key);
    }
    if (fileOrNode && fileOrNode.slug) {
        span.setAttribute('data-file-slug', fileOrNode.slug);
    }
    if (fileOrNode && fileOrNode.extension) {
        span.setAttribute('data-file-ext', fileOrNode.extension);
    }

    const img = document.createElement('img');
    img.src = iconInfo.src;
    img.alt = iconInfo.alt;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('draggable', 'false');
    span.appendChild(img);

    return span;
}

/**
 * Updates all currently rendered theme-aware icon elements in the DOM without rebuilding DOM or losing state.
 */
export function updateRenderedIcons(themeId) {
    const mode = getContrastMode(themeId);
    const themeAwareElements = document.querySelectorAll('[data-theme-aware="true"]');
    themeAwareElements.forEach(el => {
        const key = el.getAttribute('data-file-key');
        const iconDef = LOCKED_ICONS[key];
        if (iconDef && iconDef.isThemeAware) {
            const targetSrc = iconDef[mode];
            const img = el.querySelector('img');
            if (img) {
                // Check if src needs updating (avoiding redundant assignments)
                const currentSrc = img.getAttribute('src');
                if (currentSrc !== targetSrc) {
                    img.src = targetSrc;
                }
            }
        }
    });
}

// Auto-subscribe to themeChanged event for immediate live updates across the whole UI
document.addEventListener('themeChanged', (e) => {
    const newTheme = (e.detail && e.detail.theme) ? e.detail.theme : getCurrentTheme();
    updateRenderedIcons(newTheme);
});

export const iconService = {
    resolveIcon,
    createFileIconElement,
    updateRenderedIcons,
    getContrastMode,
    registerThemeIconOverride,
    THEME_CONTRAST_MODES,
    LOCKED_ICONS
};

export default iconService;
