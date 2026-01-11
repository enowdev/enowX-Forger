<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, Heart, Download, ArrowLeft, Loader2, FolderDown, X, ExternalLink, Bookmark, Grid3x3, LayoutGrid } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import Button from '$lib/components/ui/button.svelte';
  import Modal from '$lib/components/ui/modal.svelte';
  import DownloadModal from '$lib/components/DownloadModal.svelte';
  import {
    collections, selectedCollection, collectionIcons, searchResults, 
    favorites, favoriteCollections, isLoading, fetchCollections, fetchCollectionIcons, 
    searchIcons, addFavorite, removeFavorite, addFavoriteCollection, removeFavoriteCollection,
    getIconSvgUrl, downloadIcon, downloadCollection
  } from '$lib/stores/discovery';
  import { settings } from '$lib/stores/settings';

  type SearchFilter = 'icons' | 'collections';
  
  let activeView = $state<'collections' | 'icons' | 'search-icons' | 'search-collections' | 'favorites' | 'favorite-collections'>('collections');
  let searchInput = $state('');
  let searchFilter = $state<SearchFilter>('icons');
  let collectionSearchInput = $state('');
  let searchTimeout: ReturnType<typeof setTimeout>;
  
  let downloadModalOpen = $state(false);
  let downloadTarget = $state<{ prefix: string; name: string } | null>(null);
  let detailModalOpen = $state(false);
  let selectedIcon = $state<{ prefix: string; name: string } | null>(null);
  let displayLimit = $state(100);

  onMount(() => {
    if ($collections.length === 0) fetchCollections();
  });

  function handleSearch() {
    clearTimeout(searchTimeout);
    if (!searchInput.trim()) {
      activeView = 'collections';
      return;
    }
    
    searchTimeout = setTimeout(() => {
      if (searchFilter === 'icons') {
        activeView = 'search-icons';
        searchIcons(searchInput);
      } else {
        activeView = 'search-collections';
      }
    }, 150);
  }

  function handleFilterChange(filter: SearchFilter) {
    searchFilter = filter;
    if (searchInput.trim()) {
      handleSearch();
    }
  }

  function clearCollectionSearch() {
    collectionSearchInput = '';
  }

  function openCollection(prefix: string) {
    activeView = 'icons';
    displayLimit = 100;
    collectionSearchInput = '';
    fetchCollectionIcons(prefix);
  }

  function goBack() {
    if (activeView === 'icons') {
      activeView = 'collections';
      selectedCollection.set(null);
      collectionSearchInput = '';
    } else if (activeView === 'search-icons' || activeView === 'search-collections') {
      activeView = 'collections';
      searchInput = '';
      searchResults.set([]);
    } else if (activeView === 'favorite-collections') {
      activeView = 'collections';
    }
  }

  function toggleFavorite(prefix: string, name: string) {
    const isFav = $favorites.some(f => f.prefix === prefix && f.name === name);
    if (isFav) removeFavorite(prefix, name);
    else addFavorite(prefix, name);
  }

  function toggleFavoriteCollection(prefix: string, title: string) {
    const isFav = $favoriteCollections.some(f => f.prefix === prefix);
    if (isFav) removeFavoriteCollection(prefix);
    else addFavoriteCollection(prefix, title);
  }

  function handleDownloadClick(prefix: string, name: string) {
    if ($settings.showDownloadPrompt) {
      downloadTarget = { prefix, name };
      downloadModalOpen = true;
    } else {
      downloadIcon(prefix, name, $settings.defaultIconFormat, $settings.defaultIconSize);
    }
  }

  function handleDownloadCollection() {
    if ($selectedCollection) {
      downloadCollection($selectedCollection, $settings.defaultIconFormat, $settings.defaultIconSize);
    }
  }

  function openIconDetail(prefix: string, name: string) {
    selectedIcon = { prefix, name };
    detailModalOpen = true;
  }

  function goToCollection(prefix: string) {
    detailModalOpen = false;
    openCollection(prefix);
  }

  function loadMore() {
    displayLimit += 100;
  }

  let currentCollection = $derived($collections.find(c => c.prefix === $selectedCollection));
  
  // Filter collection icons based on search
  let filteredCollectionIcons = $derived.by(() => {
    if (!collectionSearchInput.trim()) return $collectionIcons;
    const query = collectionSearchInput.toLowerCase();
    return $collectionIcons.filter(name => name.toLowerCase().includes(query));
  });
  
  // Filter collections based on search
  let filteredCollections = $derived.by(() => {
    if (!searchInput.trim() || activeView !== 'search-collections') return $collections;
    const query = searchInput.toLowerCase();
    return $collections.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.prefix.toLowerCase().includes(query) ||
      c.author?.name.toLowerCase().includes(query)
    );
  });
  
  let displayedIcons = $derived(filteredCollectionIcons.slice(0, displayLimit));
  let hasMore = $derived(filteredCollectionIcons.length > displayLimit);
</script>

<div class="h-full flex flex-col p-4 xl:p-6">
  <!-- Header -->
  <div class="flex items-center gap-3 mb-4">
    {#if activeView === 'icons' || activeView === 'search-icons' || activeView === 'search-collections'}
      <button class="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200" onclick={goBack}>
        <ArrowLeft class="w-5 h-5" />
      </button>
    {/if}
    <div class="flex-1">
      <h2 class="text-base xl:text-lg font-semibold text-zinc-200">
        {#if activeView === 'collections'}Icon Discovery
        {:else if activeView === 'icons' && currentCollection}{currentCollection.title}
        {:else if activeView === 'search-icons'}Search Icons
        {:else if activeView === 'search-collections'}Search Collections
        {:else if activeView === 'favorites'}Favorite Icons
        {:else if activeView === 'favorite-collections'}Favorite Collections
        {/if}
      </h2>
      {#if activeView === 'icons' && currentCollection}
        <p class="text-xs text-zinc-500">
          {#if collectionSearchInput}{filteredCollectionIcons.length} of {/if}{currentCollection.total.toLocaleString()} icons
        </p>
      {:else if activeView === 'search-icons' && $searchResults.length > 0}
        <p class="text-xs text-zinc-500">{$searchResults.length} icons found</p>
      {:else if activeView === 'search-collections'}
        <p class="text-xs text-zinc-500">{filteredCollections.length} collections found</p>
      {:else if activeView === 'favorites'}
        <p class="text-xs text-zinc-500">{$favorites.length} saved</p>
      {:else if activeView === 'favorite-collections'}
        <p class="text-xs text-zinc-500">{$favoriteCollections.length} collections</p>
      {/if}
    </div>
    
    <div class="flex items-center gap-2">
      {#if activeView === 'icons' && currentCollection}
        {@const isCollFav = $favoriteCollections.some(f => f.prefix === currentCollection?.prefix)}
        <button
          class={cn('p-2 rounded-lg transition-colors', isCollFav ? 'bg-yellow-600 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200')}
          onclick={() => currentCollection && toggleFavoriteCollection(currentCollection.prefix, currentCollection.title)}
          title={isCollFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Bookmark class="w-5 h-5" fill={isCollFav ? 'currentColor' : 'none'} />
        </button>
        <Button variant="outline" size="sm" onclick={handleDownloadCollection}>
          <FolderDown class="w-4 h-4 mr-1.5" />
          Download All
        </Button>
      {/if}
      
      <button
        class={cn('p-2 rounded-lg transition-colors', activeView === 'favorite-collections' ? 'bg-yellow-600 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200')}
        onclick={() => activeView = activeView === 'favorite-collections' ? 'collections' : 'favorite-collections'}
        title="Favorite Collections"
      >
        <Bookmark class="w-5 h-5" fill={activeView === 'favorite-collections' ? 'currentColor' : 'none'} />
      </button>
      
      <button
        class={cn('p-2 rounded-lg transition-colors', activeView === 'favorites' ? 'bg-pink-600 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200')}
        onclick={() => activeView = activeView === 'favorites' ? 'collections' : 'favorites'}
        title="Favorite Icons"
      >
        <Heart class="w-5 h-5" fill={activeView === 'favorites' ? 'currentColor' : 'none'} />
      </button>
    </div>
  </div>

  <!-- Search Bar -->
  {#if activeView === 'icons'}
    <!-- Collection Search -->
    <div class="relative mb-4">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="text"
        placeholder="Search in {currentCollection?.title || 'collection'}..."
        bind:value={collectionSearchInput}
        class="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
      />
      {#if collectionSearchInput}
        <button class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300" onclick={clearCollectionSearch}>
          <X class="w-4 h-4" />
        </button>
      {/if}
    </div>
  {:else if activeView !== 'favorites' && activeView !== 'favorite-collections'}
    <!-- Global Search with Filter Toggle -->
    <div class="flex gap-2 mb-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder={searchFilter === 'icons' ? 'Search icons...' : 'Search collections...'}
          bind:value={searchInput}
          oninput={handleSearch}
          class="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
        />
        {#if $isLoading && activeView === 'search-icons'}
          <Loader2 class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
        {/if}
      </div>
      
      <!-- Filter Toggle -->
      <div class="flex rounded-lg border border-zinc-700 overflow-hidden">
        <button
          class={cn('flex items-center gap-1.5 px-3 py-2 text-sm transition-colors', 
            searchFilter === 'icons' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200')}
          onclick={() => handleFilterChange('icons')}
          title="Search Icons"
        >
          <Grid3x3 class="w-4 h-4" />
          <span class="hidden sm:inline">Icons</span>
        </button>
        <button
          class={cn('flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-l border-zinc-700', 
            searchFilter === 'collections' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200')}
          onclick={() => handleFilterChange('collections')}
          title="Search Collections"
        >
          <LayoutGrid class="w-4 h-4" />
          <span class="hidden sm:inline">Collections</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Content -->
  <div class="flex-1 overflow-y-auto">
    {#if $isLoading && activeView !== 'search-icons'}
      <div class="flex items-center justify-center py-12">
        <Loader2 class="w-8 h-8 text-zinc-500 animate-spin" />
      </div>

    {:else if activeView === 'favorite-collections'}
      {#if $favoriteCollections.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Bookmark class="w-12 h-12 mb-3 opacity-50" />
          <p class="text-sm">No favorite collections yet</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {#each $favoriteCollections as fav}
            {@const collection = $collections.find(c => c.prefix === fav.prefix)}
            {#if collection}
              <div
                class="group relative flex flex-col items-start p-3 xl:p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
                onclick={() => openCollection(collection.prefix)}
                role="button" tabindex="0"
              >
                <button
                  class="absolute top-2 right-2 p-1 rounded bg-yellow-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onclick={(e) => { e.stopPropagation(); removeFavoriteCollection(fav.prefix); }}
                >
                  <X class="w-3 h-3" />
                </button>
                <div class="flex gap-1 mb-2">
                  {#if collection.samples}
                    {#each collection.samples.slice(0, 3) as sample}
                      <img src={getIconSvgUrl(collection.prefix, sample, 'white')} alt={sample} class="w-5 h-5 xl:w-6 xl:h-6" loading="lazy" />
                    {/each}
                  {/if}
                </div>
                <h3 class="font-medium text-sm text-zinc-200 truncate w-full">{collection.title}</h3>
                <p class="text-xs text-zinc-500">{collection.total.toLocaleString()} icons</p>
              </div>
            {/if}
          {/each}
        </div>
      {/if}

    {:else if activeView === 'favorites'}
      {#if $favorites.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Heart class="w-12 h-12 mb-3 opacity-50" />
          <p class="text-sm">No favorite icons yet</p>
        </div>
      {:else}
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {#each $favorites as fav}
            <div class="flex flex-col bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 overflow-hidden">
              <div class="aspect-square flex items-center justify-center p-3 cursor-pointer hover:bg-zinc-700/50" onclick={() => openIconDetail(fav.prefix, fav.name)} role="button" tabindex="0">
                <img src={getIconSvgUrl(fav.prefix, fav.name, 'white')} alt={fav.name} class="w-8 h-8" loading="lazy" />
              </div>
              <div class="flex border-t border-zinc-700">
                <button class="flex-1 p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200" onclick={() => handleDownloadClick(fav.prefix, fav.name)}>
                  <Download class="w-3.5 h-3.5 mx-auto" />
                </button>
                <button class="flex-1 p-1.5 hover:bg-zinc-700 text-pink-500" onclick={() => toggleFavorite(fav.prefix, fav.name)}>
                  <Heart class="w-3.5 h-3.5 mx-auto" fill="currentColor" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

    {:else if activeView === 'search-icons'}
      {#if $searchResults.length === 0 && !$isLoading && searchInput.trim()}
        <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Search class="w-12 h-12 mb-3 opacity-50" />
          <p class="text-sm">No icons found for "{searchInput}"</p>
        </div>
      {:else if $searchResults.length === 0 && !searchInput.trim()}
        <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Search class="w-12 h-12 mb-3 opacity-50" />
          <p class="text-sm">Type to search icons</p>
        </div>
      {:else}
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {#each $searchResults as icon}
            {@const isFav = $favorites.some(f => f.prefix === icon.prefix && f.name === icon.name)}
            <div class="flex flex-col bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 overflow-hidden">
              <div class="aspect-square flex items-center justify-center p-3 cursor-pointer hover:bg-zinc-700/50" title="{icon.prefix}:{icon.name}" onclick={() => openIconDetail(icon.prefix, icon.name)} role="button" tabindex="0">
                <img src={getIconSvgUrl(icon.prefix, icon.name, 'white')} alt={icon.name} class="w-8 h-8" loading="lazy" />
              </div>
              <div class="flex border-t border-zinc-700">
                <button class="flex-1 p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200" onclick={() => handleDownloadClick(icon.prefix, icon.name)}>
                  <Download class="w-3.5 h-3.5 mx-auto" />
                </button>
                <button class={cn('flex-1 p-1.5 hover:bg-zinc-700', isFav ? 'text-pink-500' : 'text-zinc-400 hover:text-zinc-200')} onclick={() => toggleFavorite(icon.prefix, icon.name)}>
                  <Heart class="w-3.5 h-3.5 mx-auto" fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

    {:else if activeView === 'search-collections'}
      {#if filteredCollections.length === 0 && searchInput.trim()}
        <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Search class="w-12 h-12 mb-3 opacity-50" />
          <p class="text-sm">No collections found for "{searchInput}"</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {#each filteredCollections as collection}
            {@const isCollFav = $favoriteCollections.some(f => f.prefix === collection.prefix)}
            <button
              class="group relative flex flex-col items-start p-3 xl:p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600 transition-colors text-left"
              onclick={() => openCollection(collection.prefix)}
            >
              {#if isCollFav}
                <div class="absolute top-2 right-2">
                  <Bookmark class="w-4 h-4 text-yellow-500" fill="currentColor" />
                </div>
              {/if}
              <div class="flex gap-1 mb-2">
                {#if collection.samples}
                  {#each collection.samples.slice(0, 3) as sample}
                    <img src={getIconSvgUrl(collection.prefix, sample, 'white')} alt={sample} class="w-5 h-5 xl:w-6 xl:h-6" loading="lazy" />
                  {/each}
                {/if}
              </div>
              <h3 class="font-medium text-sm text-zinc-200 truncate w-full">{collection.title}</h3>
              <p class="text-xs text-zinc-500">{collection.total.toLocaleString()} icons</p>
              {#if collection.author}
                <p class="text-[10px] text-zinc-600 mt-1 truncate w-full">by {collection.author.name}</p>
              {/if}
            </button>
          {/each}
        </div>
      {/if}

    {:else if activeView === 'icons'}
      {#if filteredCollectionIcons.length === 0 && collectionSearchInput}
        <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Search class="w-12 h-12 mb-3 opacity-50" />
          <p class="text-sm">No icons found for "{collectionSearchInput}"</p>
        </div>
      {:else}
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {#each displayedIcons as iconName}
            {@const prefix = $selectedCollection || ''}
            {@const isFav = $favorites.some(f => f.prefix === prefix && f.name === iconName)}
            <div class="flex flex-col bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 overflow-hidden">
              <div class="aspect-square flex items-center justify-center p-3 cursor-pointer hover:bg-zinc-700/50" title={iconName} onclick={() => openIconDetail(prefix, iconName)} role="button" tabindex="0">
                <img src={getIconSvgUrl(prefix, iconName, 'white')} alt={iconName} class="w-8 h-8" loading="lazy" />
              </div>
              <div class="flex border-t border-zinc-700">
                <button class="flex-1 p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200" onclick={() => handleDownloadClick(prefix, iconName)}>
                  <Download class="w-3.5 h-3.5 mx-auto" />
                </button>
                <button class={cn('flex-1 p-1.5 hover:bg-zinc-700', isFav ? 'text-pink-500' : 'text-zinc-400 hover:text-zinc-200')} onclick={() => toggleFavorite(prefix, iconName)}>
                  <Heart class="w-3.5 h-3.5 mx-auto" fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          {/each}
        </div>
        {#if hasMore}
          <div class="flex justify-center mt-4">
            <Button variant="outline" onclick={loadMore}>Load More ({filteredCollectionIcons.length - displayLimit} remaining)</Button>
          </div>
        {/if}
      {/if}

    {:else}
      <!-- Collections Grid (default view) -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {#each $collections as collection}
          {@const isCollFav = $favoriteCollections.some(f => f.prefix === collection.prefix)}
          <button
            class="group relative flex flex-col items-start p-3 xl:p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600 transition-colors text-left"
            onclick={() => openCollection(collection.prefix)}
          >
            {#if isCollFav}
              <div class="absolute top-2 right-2">
                <Bookmark class="w-4 h-4 text-yellow-500" fill="currentColor" />
              </div>
            {/if}
            <div class="flex gap-1 mb-2">
              {#if collection.samples}
                {#each collection.samples.slice(0, 3) as sample}
                  <img src={getIconSvgUrl(collection.prefix, sample, 'white')} alt={sample} class="w-5 h-5 xl:w-6 xl:h-6" loading="lazy" />
                {/each}
              {/if}
            </div>
            <h3 class="font-medium text-sm text-zinc-200 truncate w-full">{collection.title}</h3>
            <p class="text-xs text-zinc-500">{collection.total.toLocaleString()} icons</p>
            {#if collection.author}
              <p class="text-[10px] text-zinc-600 mt-1 truncate w-full">by {collection.author.name}</p>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Download Modal -->
{#if downloadTarget}
  <DownloadModal open={downloadModalOpen} onClose={() => { downloadModalOpen = false; downloadTarget = null; }} prefix={downloadTarget.prefix} name={downloadTarget.name} />
{/if}

<!-- Icon Detail Modal -->
<Modal open={detailModalOpen} onClose={() => { detailModalOpen = false; selectedIcon = null; }} title="Icon Details" class="w-[400px]">
  {#if selectedIcon}
    {@const collection = $collections.find(c => c.prefix === selectedIcon?.prefix)}
    {@const isFav = $favorites.some(f => f.prefix === selectedIcon?.prefix && f.name === selectedIcon?.name)}
    <div class="space-y-4">
      <div class="flex items-center justify-center p-6 bg-zinc-800 rounded-lg">
        <img src={getIconSvgUrl(selectedIcon.prefix, selectedIcon.name, 'white')} alt={selectedIcon.name} class="w-20 h-20" />
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-zinc-500">Name</span>
          <span class="text-sm text-zinc-200 font-mono">{selectedIcon.name}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-zinc-500">Collection</span>
          <button class="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300" onclick={() => selectedIcon && goToCollection(selectedIcon.prefix)}>
            {collection?.title || selectedIcon.prefix}
            <ExternalLink class="w-3 h-3" />
          </button>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-zinc-500">Prefix</span>
          <span class="text-sm text-zinc-400 font-mono">{selectedIcon.prefix}</span>
        </div>
        {#if collection?.author}
          <div class="flex items-center justify-between">
            <span class="text-xs text-zinc-500">Author</span>
            <span class="text-sm text-zinc-400">{collection.author.name}</span>
          </div>
        {/if}
        {#if collection?.license}
          <div class="flex items-center justify-between">
            <span class="text-xs text-zinc-500">License</span>
            <span class="text-sm text-zinc-400">{collection.license.title}</span>
          </div>
        {/if}
      </div>
      <div class="p-3 bg-zinc-800 rounded-lg">
        <span class="text-xs text-zinc-500 block mb-1">Usage</span>
        <code class="text-xs text-zinc-300 font-mono">{selectedIcon.prefix}:{selectedIcon.name}</code>
      </div>
      <div class="flex gap-2 pt-2">
        <Button variant={isFav ? 'default' : 'outline'} onclick={() => selectedIcon && toggleFavorite(selectedIcon.prefix, selectedIcon.name)} class="flex-1 {isFav ? 'bg-pink-600 hover:bg-pink-500' : ''}">
          <Heart class="w-4 h-4 mr-1.5" fill={isFav ? 'currentColor' : 'none'} />
          {isFav ? 'Favorited' : 'Favorite'}
        </Button>
        <Button variant="default" onclick={() => selectedIcon && handleDownloadClick(selectedIcon.prefix, selectedIcon.name)} class="flex-1">
          <Download class="w-4 h-4 mr-1.5" />
          Download
        </Button>
      </div>
    </div>
  {/if}
</Modal>
