<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { CoverArtResponse, MusicBrainzSearchResponse, Release } from './types';

  const MUSICBRAINZ_HEADERS = {
    'User-Agent': 'Album/1.0.0 ( music@email.com )',
    'Accept': 'application/json'
  };

  let searchQuery = '';
  let albums: (Release & { coverArt?: string | null; isVisible?: boolean })[] = [];
  let loading = false;
  let error: string | null = null;
  let observers = new Map();

  onMount(() => {
    return () => {
      observers.forEach(observer => observer.disconnect());
      observers.clear();
    };
  });

  function observe(node: HTMLElement, albumId: string) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !albums.find(a => a.id === albumId)?.coverArt) {
            getCoverArt(albumId).then(art => {
              albums = albums.map(a => 
                a.id === albumId ? { ...a, coverArt: art } : a
              );
            });
            observer.unobserve(node);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(node);
    observers.set(albumId, observer);

    return {
      destroy() {
        observer.disconnect();
        observers.delete(albumId);
      }
    };
  }

  async function getCoverArt(mbid: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/art/${mbid}`);
      if (!response.ok) return null;
      const data: CoverArtResponse = await response.json();
      const frontCover = data.images.find(img => img.front);
      return frontCover?.thumbnails.small || null;
    } catch {
      return null;
    }
  }

  async function searchAlbums() {
    loading = true;
    error = null;
    try {
      const response = await fetch(
        `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(searchQuery)}&fmt=json`,
        { headers: MUSICBRAINZ_HEADERS }
      );
      if (!response.ok) throw new Error('Search failed');
      const data: MusicBrainzSearchResponse = await response.json();
      
      albums = data.releases.map(album => ({
        ...album,
        coverArt: null
      }));
    } catch (err) {
      error = err instanceof Error ? err.message : 'Search failed';
      console.error('Error fetching albums:', err);
    }
    loading = false;
  }

  function navigateToAlbum(id: string) {
    goto(`/album/${id}`);
  }
</script>

<div class="max-w-6xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-8">Album Search</h1>

  <div class="flex gap-4 mb-8">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search for albums..."
      class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
      on:keydown={(e) => e.key === 'Enter' && searchAlbums()}
    />
    <button
      on:click={searchAlbums}
      disabled={loading}
      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Searching...' : 'Search'}
    </button>
  </div>

  {#if error}
    <div class="text-red-500 text-center mb-4">{error}</div>
  {/if}

  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if albums.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each albums as album}
        <div 
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
          on:click={() => navigateToAlbum(album.id)}
          on:keydown={(e) => e.key === 'Enter' && navigateToAlbum(album.id)}
          role="button"
          tabindex="0"
          use:observe={album.id}
        >
          <div class="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
            {#if album.coverArt}
              <img
                src={album.coverArt}
                alt={album.title}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
            {/if}
          </div>
          <div class="p-4">
            <h2 class="font-semibold text-lg mb-1 truncate">{album.title}</h2>
            <p class="text-gray-600 text-sm mb-2">
              {album['artist-credit']?.[0]?.artist?.name || 'Unknown Artist'}
            </p>
            {#if album.date}
              <p class="text-gray-500 text-sm">{album.date}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else if searchQuery}
    <p class="text-center text-gray-600 py-12">No albums found</p>
  {:else}
    <p class="text-center text-gray-600 py-12">Search for an album to get started</p>
  {/if}
</div>