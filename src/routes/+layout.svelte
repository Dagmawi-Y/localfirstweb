<script lang="ts">
	import '../app.css';
	import NavBar from '$lib/components/NavBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	// import EventPopup from '$lib/components/EventPopup.svelte';
	import EventBanner from '$lib/components/EventBanner.svelte';
	import { theme } from '$lib/stores/themeStore';
	import type { LayoutData } from './$types';
	import Chat from '$lib/components/Chat.svelte';
	
	let { data, children } = $props<{data: LayoutData}>();
</script>

<svelte:head>
	<script>
		// immediately invoked function to avoid global scope pollution
		(function () {
			const theme =
				localStorage.getItem('theme') ||
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
			if (theme === 'dark') {
				document.documentElement.classList.add('dark');
			}
		})();
	</script>
</svelte:head>

<div class="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
	<EventBanner eventData={data.eventData} />
	<NavBar />
	<main>
		{@render children()}
	</main>
	<Footer />
	<!-- <EventPopup /> -->
	<Chat />
</div>
