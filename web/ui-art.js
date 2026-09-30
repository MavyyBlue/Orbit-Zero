export const art = path => `art/${path}.webp`;
export const icon = (name, label = '') => `<svg class="ui-icon" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}><use href="art/arcade/icons.svg#${name.replace('icon_', '')}"/></svg>`;
