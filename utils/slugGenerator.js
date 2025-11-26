import Resume from "../models/Resume.js";

/**
 * Generate a slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - Generated slug
 */
export const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except -
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Check if a slug is unique
 * @param {string} slug - Slug to check
 * @param {string} excludeResumeId - Resume ID to exclude from check (for updates)
 * @returns {Promise<boolean>} - True if unique, false otherwise
 */
export const isSlugUnique = async (slug, excludeResumeId = null) => {
    const query = { slug };
    if (excludeResumeId) {
        query._id = { $ne: excludeResumeId };
    }

    const existingResume = await Resume.findOne(query);
    return !existingResume;
};

/**
 * Generate a unique slug from text
 * @param {string} text - Text to convert to slug
 * @param {string} excludeResumeId - Resume ID to exclude from check
 * @returns {Promise<string>} - Unique slug
 */
export const generateUniqueSlug = async (text, excludeResumeId = null) => {
    let slug = generateSlug(text);
    let counter = 1;
    let originalSlug = slug;

    while (!(await isSlugUnique(slug, excludeResumeId))) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }

    return slug;
};

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidSlug = (slug) => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
};
