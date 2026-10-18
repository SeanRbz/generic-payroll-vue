<script setup lang="ts">
import { onMounted } from 'vue'

import AvatarInitials from '@/views/components/ui/AvatarInitials.vue'
import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { formatTime } from '@/utils/format'
import { useGmailSignInViewModel } from '@/viewmodels/email-token/useGmailSignInViewModel'
import GoogleLogo from './GoogleLogo.vue'

const {
  configured,
  account,
  expiresAt,
  error,
  isSignedIn,
  isSigningIn,
  initials,
  signIn,
  signOut,
  prepare,
} = useGmailSignInViewModel()

// Load Google's script as soon as the panel appears, so the later click can open the popup.
onMounted(() => {
  void prepare()
})
</script>

<template>
  <section
    aria-label="Gmail sign-in"
    class="flex flex-wrap items-center justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-md"
  >
    <div class="flex min-w-0 items-center gap-space-sm">
      <template v-if="isSignedIn && account">
        <AvatarInitials :initials="initials" tone="secondary" />
        <div class="min-w-0">
          <p class="truncate font-body-md text-body-md font-bold text-on-surface">
            {{ account.name }}
          </p>
          <p class="truncate font-label-code text-label-code text-on-surface-variant">
            {{ account.email }}
            <template v-if="expiresAt !== null">
              • session expires {{ formatTime(expiresAt) }}</template
            >
          </p>
        </div>
      </template>
      <template v-else>
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-sm bg-surface-container text-primary"
        >
          <MaterialIcon name="login" class="text-[18px]" />
        </span>
        <div class="min-w-0">
          <p class="font-body-md text-body-md font-bold text-on-surface">
            {{
              configured
                ? 'Sign in to authorize payslip dispatch'
                : 'Google sign-in is not configured'
            }}
          </p>
          <p class="font-label-code text-label-code text-on-surface-variant">
            {{
              configured
                ? 'Sender and credential come from the Gmail sign-in.'
                : 'Set VITE_GOOGLE_CLIENT_ID in env/.env.local to enable it (see the README).'
            }}
          </p>
        </div>
      </template>
    </div>

    <BaseButton v-if="isSignedIn" variant="outline" size="sm" @click="signOut()">
      <MaterialIcon name="logout" class="text-[16px]" />
      Sign out
    </BaseButton>
    <button
      v-else
      type="button"
      :disabled="!configured || isSigningIn"
      class="inline-flex h-10 shrink-0 items-center gap-space-sm rounded-sm border border-outline-variant bg-surface-container-lowest px-space-md font-body-sm text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface-container-lowest"
      @click="signIn()"
    >
      <MaterialIcon v-if="isSigningIn" name="progress_activity" class="animate-spin text-[18px]" />
      <GoogleLogo v-else class="size-[18px]" />
      {{ isSigningIn ? 'Waiting for Google…' : 'Sign in with Google' }}
    </button>

    <p
      v-if="error"
      role="alert"
      class="flex w-full items-start gap-1 font-label-code text-[11px] text-error"
    >
      <MaterialIcon name="error" class="mt-px text-[14px]" />
      {{ error }}
    </p>
  </section>
</template>
