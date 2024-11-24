<script lang="ts">
  import { page } from '$app/stores';
  // import ColorThief from 'colorthief';
  import { onMount } from 'svelte';
  import type { AlbumResponse, CoverArtResponse } from '../../types';

  const albumId = $page.params.id;
  let album: AlbumResponse | null = null;
  let coverArt: string | null = null;
  let loading = true;
  let error: string | null = null;
  // let dominantColor: string = 'rgb(107, 114, 128)';
  let imgElement: HTMLImageElement;

  // async function extractColor() {
  //   try {
  //     const colorThief = new ColorThief();
  //     const color = await colorThief.getColor(imgElement);
  //     dominantColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  //   } catch (err) {
  //     console.error('Error extracting color:', err);
  //   }
  // }

  async function getCoverArt() {
    try {
      const response = await fetch(`/api/art/${albumId}`);
      if (!response.ok) return null;
      const data: CoverArtResponse = await response.json();
      const frontCover = data.images.find(img => img.front);
      return frontCover?.thumbnails.large || null;
    } catch {
      return null;
    }
  }

  onMount(async () => {
    try {
      const [albumResponse, artUrl] = await Promise.all([
        fetch(`/api/album/${albumId}`),
        getCoverArt()
      ]);
      
      if (!albumResponse.ok) throw new Error('Failed to fetch album');
      album = await albumResponse.json();
      console.log(album)
      coverArt = artUrl;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch album';
      console.error('Error fetching album:', err);
    }
    loading = false;
  });
</script>

<div class="min-h-screen relative overflow-hidden">
  {#if coverArt}
    <div 
      class="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
      style="background-image: url({coverArt})"
    ></div>
  {/if}
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <div class="flex justify-center items-center min-h-[80vh]">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    {:else if error}
      <div class="text-red-500 text-center p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl">
        {error}
      </div>
    {:else if album}
      <div class="mb-6">
        <a href="/" class="text-white/80 hover:text-white transition-colors inline-flex items-center gap-3 text-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to search
        </a>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 p-6 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl">
        <div class="lg:w-1/2 space-y-8">
          <div class="aspect-square rounded-2xl overflow-hidden shadow-2xl">
            {#if coverArt}
              <img
                bind:this={imgElement}
                src={coverArt}
                alt={album.title}
                class="w-full h-full object-cover"
                />
                <!-- on:load={extractColor} -->
            {:else}
              <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg class="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
            {/if}
          </div>
          
          <div class="text-white space-y-4">
            <h1 class="text-6xl font-bold">{album.title}</h1>
            <p class="text-3xl text-white/80">
              {album['artist-credit']?.[0]?.artist?.name || 'Unknown Artist'}
            </p>
          </div>
        </div>

        <div class="lg:w-1/2">
          <div class="space-y-2 bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            {#each album.media?.[0]?.tracks || [] as track, i}
              <div class="flex items-center p-4 rounded-xl hover:bg-white/10 transition-colors">
                <span class="w-8 text-white/60 font-medium text-lg">{(i + 1).toString().padStart(2, '0')}</span>
                <span class="flex-1 font-medium text-white text-lg">{track.title}</span>
                <span class="text-white/60 text-lg">
                  {Math.floor(track.length / 60000)}:{String(Math.floor((track.length % 60000) / 1000)).padStart(2, '0')}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else}
      <p class="text-center text-white text-xl">Album not found</p>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    background: #000;
  }
</style>