<script setup lang="ts">
import { useId } from 'vue'

import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { RelayProvider, RelayProviderId } from '@/models/email-token/types'

const selected = defineModel<RelayProviderId>({ required: true })

defineProps<{ providers: readonly RelayProvider[] }>()

const groupName = useId()

function cardClass(provider: RelayProvider): string {
  if (provider.disabled) return 'border-transparent bg-surface-container-low opacity-50'
  if (selected.value === provider.id) return 'border-primary-container bg-surface-container'
  return 'border-transparent bg-surface-container-low hover:bg-surface-container'
}

function statusLine(provider: RelayProvider): string {
  if (provider.disabled) return 'Unavailable'
  return selected.value === provider.id ? 'Active Provider' : provider.idleNote
}
</script>

<template>
  <fieldset class="min-w-0">
    <legend
      class="mb-space-sm font-label-strong text-label-strong tracking-wider text-on-surface-variant uppercase"
    >
      Relay Provider Selection
    </legend>
    <div class="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
      <label
        v-for="provider in providers"
        :key="provider.id"
        class="block"
        :class="provider.disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
        :title="provider.disabled ? `${provider.name} is not available` : undefined"
      >
        <input
          v-model="selected"
          type="radio"
          :name="groupName"
          :value="provider.id"
          :disabled="provider.disabled"
          class="peer sr-only"
        />
        <span
          class="flex h-full flex-col gap-0.5 rounded-lg border-2 p-space-md transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-container"
          :class="cardClass(provider)"
        >
          <span class="flex items-center justify-between gap-space-xs">
            <span
              class="flex items-center gap-space-xs font-body-md text-body-md font-bold text-on-surface"
            >
              <MaterialIcon :name="provider.icon" class="text-[18px] text-primary" />
              {{ provider.name }}
            </span>
            <MaterialIcon
              :name="selected === provider.id ? 'check_circle' : 'radio_button_unchecked'"
              class="text-[20px]"
              :class="selected === provider.id ? 'text-primary-container' : 'text-outline-variant'"
            />
          </span>
          <span class="font-label-code text-[10px] text-on-surface-variant">
            {{ provider.protocol }}
          </span>
          <span
            class="font-label-code text-[10px]"
            :class="
              selected === provider.id && !provider.disabled
                ? 'font-semibold text-secondary'
                : 'text-outline'
            "
          >
            {{ statusLine(provider) }}
          </span>
        </span>
      </label>
    </div>
  </fieldset>
</template>
