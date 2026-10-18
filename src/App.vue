<script setup lang="ts">
import { provide } from 'vue'

import { createGmailSession, gmailSessionKey } from '@/models/email-token/gmailSession'
import AppShell from '@/views/layouts/AppShell.vue'

// One Gmail session for the whole app, so the toolbar tile and the modal always agree.
provide(gmailSessionKey, createGmailSession())
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
