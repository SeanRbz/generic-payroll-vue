<script setup lang="ts">
import { computed, shallowRef, useId } from 'vue'

import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { RelayProvider } from '@/models/email-token/types'

const { provider } = defineProps<{
  provider: RelayProvider
  senderEmail: string
  senderMailboxTag: string
}>()

const senderId = useId()
const secretId = useId()
const secretVisible = shallowRef(false)

/** When the provider signs in on the frontend, the manual sender/credential fields are inactive. */
const fromSignIn = computed(() => provider.usesSignIn === true)

const labelClass =
  'font-label-strong text-[11px] leading-4 font-semibold tracking-wider text-on-surface-variant uppercase'
const inputClass =
  'h-10 w-full rounded-sm bg-surface-container-low font-label-code text-label-code text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none disabled:cursor-not-allowed'
</script>

<template>
  <div>
    <fieldset
      :disabled="fromSignIn"
      class="m-0 grid min-w-0 grid-cols-1 gap-space-md border-0 p-0 md:grid-cols-2"
      :class="fromSignIn && 'opacity-60'"
    >
      <legend class="sr-only">Sender and credential</legend>

      <div class="flex flex-col gap-space-xs">
        <div class="flex flex-col gap-0.5">
          <label :for="senderId" :class="labelClass">Sender Email Address</label>
          <span
            class="font-label-code text-[10px] leading-3 font-semibold tracking-wider text-primary uppercase"
          >
            {{ senderMailboxTag }}
          </span>
        </div>
        <div class="relative">
          <MaterialIcon
            name="alternate_email"
            class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline"
          />
          <input
            :id="senderId"
            type="email"
            autocomplete="off"
            :value="senderEmail"
            placeholder="name@agency.gov.ph"
            :class="[inputClass, 'pr-3 pl-10']"
          />
        </div>
      </div>

      <div class="flex flex-col gap-space-xs">
        <div class="flex flex-col gap-0.5">
          <label :for="secretId" :class="labelClass">{{ provider.credentialLabel }}</label>
          <span
            class="flex items-center gap-1 font-label-code text-[10px] leading-3 font-semibold tracking-wider text-secondary uppercase"
          >
            <span class="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
            {{ provider.credentialHint }}
          </span>
        </div>
        <div class="relative">
          <MaterialIcon
            name="lock"
            class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline"
          />
          <input
            :id="secretId"
            :type="secretVisible ? 'text' : 'password'"
            autocomplete="new-password"
            :placeholder="fromSignIn ? 'Managed by Google sign-in' : 'Paste app password'"
            :class="[inputClass, 'pr-10 pl-10']"
          />
          <button
            type="button"
            :aria-label="secretVisible ? 'Hide credential' : 'Show credential'"
            :aria-pressed="secretVisible"
            class="absolute top-1/2 right-3 -translate-y-1/2 text-outline hover:text-on-surface disabled:cursor-not-allowed disabled:hover:text-outline"
            @click="secretVisible = !secretVisible"
          >
            <MaterialIcon
              :name="secretVisible ? 'visibility_off' : 'visibility'"
              class="text-[18px]"
            />
          </button>
        </div>
      </div>
    </fieldset>
  </div>
</template>
