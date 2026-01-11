<script lang="ts">
  import { onMount } from 'svelte';
  import { Download, ChevronDown, ChevronUp, AlertTriangle, Sparkles, ExternalLink, Loader2, Check } from 'lucide-svelte';
  import Modal from '$lib/components/ui/modal.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { cn } from '$lib/utils';
  import { 
    updateState, 
    checkForUpdates, 
    downloadAndInstall, 
    dismissUpdate,
    fetchVersionHistory,
    type ReleaseInfo 
  } from '$lib/stores/updater';

  let historyExpanded = $state(false);
  let versionHistory = $state<ReleaseInfo[]>([]);
  let loadingHistory = $state(false);

  // Check for updates on mount
  onMount(() => {
    checkForUpdates();
  });

  async function toggleHistory() {
    historyExpanded = !historyExpanded;
    if (historyExpanded && versionHistory.length === 0) {
      loadingHistory = true;
      versionHistory = await fetchVersionHistory();
      loadingHistory = false;
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function parseFeatures(notes: string): string[] {
    return notes
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))
      .map(line => line.replace(/^[-*•]\s*/, ''));
  }

  function openGitHubRelease() {
    window.open(`https://github.com/enowdev/enowX-Forger/releases/tag/v${$updateState.newVersion}`, '_blank');
  }

  let features = $derived(parseFeatures($updateState.releaseNotes));
  let isOpen = $derived($updateState.available && !$updateState.downloading);
</script>

<Modal 
  open={isOpen} 
  onClose={() => !$updateState.forced && dismissUpdate()} 
  title=""
  class="w-[480px]"
>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-start gap-4">
      <div class={cn(
        "p-3 rounded-xl",
        $updateState.forced ? "bg-amber-500/20" : "bg-blue-500/20"
      )}>
        {#if $updateState.forced}
          <AlertTriangle class="w-6 h-6 text-amber-400" />
        {:else}
          <Sparkles class="w-6 h-6 text-blue-400" />
        {/if}
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-zinc-100">
          {$updateState.forced ? 'Critical Update Required' : 'Update Available'}
        </h3>
        <p class="text-sm text-zinc-400 mt-0.5">
          v{$updateState.currentVersion} → v{$updateState.newVersion}
        </p>
        {#if $updateState.releaseDate}
          <p class="text-xs text-zinc-500 mt-1">
            Released {formatDate($updateState.releaseDate)}
          </p>
        {/if}
      </div>
    </div>

    <!-- Forced update warning -->
    {#if $updateState.forced}
      <div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
        <p class="text-sm text-amber-300">
          This update is required to continue using the app. Please update to proceed.
        </p>
      </div>
    {/if}

    <!-- Features list -->
    {#if features.length > 0}
      <div>
        <p class="text-xs font-medium text-zinc-400 mb-2">What's new:</p>
        <div class="bg-zinc-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
          <ul class="space-y-1.5">
            {#each features as feature}
              <li class="flex items-start gap-2 text-sm text-zinc-300">
                <Check class="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {:else if $updateState.releaseNotes}
      <div>
        <p class="text-xs font-medium text-zinc-400 mb-2">Release notes:</p>
        <div class="bg-zinc-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
          <p class="text-sm text-zinc-300 whitespace-pre-wrap">{$updateState.releaseNotes}</p>
        </div>
      </div>
    {/if}

    <!-- Version History Dropdown -->
    <div class="border border-zinc-700 rounded-lg overflow-hidden">
      <button
        class="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
        onclick={toggleHistory}
      >
        <span class="text-sm text-zinc-300">Version History</span>
        {#if historyExpanded}
          <ChevronUp class="w-4 h-4 text-zinc-400" />
        {:else}
          <ChevronDown class="w-4 h-4 text-zinc-400" />
        {/if}
      </button>
      
      {#if historyExpanded}
        <div class="border-t border-zinc-700 max-h-48 overflow-y-auto">
          {#if loadingHistory}
            <div class="flex items-center justify-center py-4">
              <Loader2 class="w-5 h-5 text-zinc-400 animate-spin" />
            </div>
          {:else if versionHistory.length === 0}
            <p class="text-sm text-zinc-500 text-center py-4">No version history available</p>
          {:else}
            {#each versionHistory as release, i}
              <div class={cn(
                "p-3",
                i !== versionHistory.length - 1 && "border-b border-zinc-700/50"
              )}>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-zinc-200">v{release.version}</span>
                  <span class="text-xs text-zinc-500">{formatDate(release.date)}</span>
                </div>
                {#if release.notes}
                  <p class="text-xs text-zinc-400 line-clamp-2">{release.notes}</p>
                {/if}
                {#if release.forced}
                  <span class="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                    Critical
                  </span>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <!-- Download Progress -->
    {#if $updateState.downloading}
      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-zinc-400">Downloading update...</span>
          <span class="text-zinc-300">{$updateState.progress}%</span>
        </div>
        <div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-blue-500 transition-all duration-200"
            style="width: {$updateState.progress}%"
          ></div>
        </div>
      </div>
    {/if}

    <!-- Error -->
    {#if $updateState.error}
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-400">{$updateState.error}</p>
      </div>
    {/if}

    <!-- Actions -->
    <div class="flex gap-2 pt-2">
      {#if !$updateState.forced}
        <Button variant="outline" onclick={dismissUpdate} class="flex-1">
          Later
        </Button>
      {/if}
      <Button 
        variant="default" 
        onclick={downloadAndInstall} 
        disabled={$updateState.downloading}
        class={cn("flex-1", $updateState.forced && "w-full")}
      >
        {#if $updateState.downloading}
          <Loader2 class="w-4 h-4 mr-1.5 animate-spin" />
          Updating...
        {:else}
          <Download class="w-4 h-4 mr-1.5" />
          Update Now
        {/if}
      </Button>
    </div>

    <!-- macOS fallback link -->
    <button
      class="w-full text-center text-xs text-zinc-500 hover:text-zinc-400 transition-colors flex items-center justify-center gap-1"
      onclick={openGitHubRelease}
    >
      <ExternalLink class="w-3 h-3" />
      Download manually from GitHub
    </button>
  </div>
</Modal>
