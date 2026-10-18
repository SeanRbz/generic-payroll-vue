<script setup lang="ts">
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseButton from '@/views/components/ui/BaseButton.vue'
import BaseModal from '@/views/components/ui/BaseModal.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { useEmailTokenViewModel } from '@/viewmodels/email-token/useEmailTokenViewModel'
import ComplianceNote from './ComplianceNote.vue'
import GmailSignInPanel from './GmailSignInPanel.vue'
import RelayProviderSelector from './RelayProviderSelector.vue'
import TestDispatchPanel from './TestDispatchPanel.vue'
import TokenCredentialsFields from './TokenCredentialsFields.vue'
import TokenStatusCard from './TokenStatusCard.vue'

const open = defineModel<boolean>('open', { required: true })

const {
  configured,
  isSignedIn,
  isSigningIn,
  relayProviders,
  selectedProviderId,
  selectedProvider,
  senderEmail,
  senderMailboxTag,
  tokenStatus,
  lastVerified,
  regenerateToken,
  recipient,
  recipientInvalid,
  sending,
  result,
  canSend,
  send,
} = useEmailTokenViewModel()
</script>

<template>
  <BaseModal
    v-model:open="open"
    title="Email Token Configuration"
    description="Configure authorized email relay for automated payslip PDF dispatch"
    size="xl"
  >
    <template #icon>
      <MaterialIcon name="key" class="text-[22px]" />
    </template>
    <template v-if="isSignedIn" #badge>
      <BaseBadge tone="success" size="sm" pill>Verified Active</BaseBadge>
    </template>

    <div class="flex flex-col gap-space-md pb-space-md">
      <RelayProviderSelector v-model="selectedProviderId" :providers="relayProviders" />
      <TokenCredentialsFields
        :provider="selectedProvider"
        :sender-email="senderEmail"
        :sender-mailbox-tag="senderMailboxTag"
      />
      <GmailSignInPanel v-if="selectedProvider.usesSignIn" />
      <TokenStatusCard
        :status="tokenStatus"
        :busy="isSigningIn"
        :disabled="!configured"
        @regenerate="regenerateToken()"
      />
      <TestDispatchPanel
        v-model="recipient"
        :transport="selectedProvider.transport"
        :can-send="canSend"
        :sending="sending"
        :result="result"
        :invalid="recipientInvalid"
        @send="send"
      />
      <ComplianceNote :message="selectedProvider.complianceNote" />
    </div>

    <template #footer>
      <div class="flex flex-wrap items-center justify-between gap-space-sm">
        <span class="font-label-code text-label-code text-outline">
          Last verified: {{ lastVerified }}
        </span>
        <div class="flex items-center gap-space-sm">
          <BaseButton @click="open = false">Cancel</BaseButton>
          <BaseButton
            variant="gradient"
            class="font-semibold"
            :disabled="!isSignedIn"
            @click="open = false"
          >
            <MaterialIcon name="check" class="text-[18px]" />
            Save &amp; Verify Token
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
