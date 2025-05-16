import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const getInitialCategory = (): string => {
    if (browser) {
        const savedCategory = localStorage.getItem('activeCategory');
        if (savedCategory) {
            return savedCategory;
        }
    }
    return 'All';
};

export const activeCategory = writable<string>(getInitialCategory());

if (browser) {
    activeCategory.subscribe((value) => {
        localStorage.setItem('activeCategory', value);
    });
} 