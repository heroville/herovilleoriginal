/**
 * Expose jQuery and $ on window before any script that expects them (jQuery UI, Bootstrap).
 * This file must be imported first in main.js so load order is correct.
 */
import $ from 'jquery';
window.jQuery = window.$ = $;
