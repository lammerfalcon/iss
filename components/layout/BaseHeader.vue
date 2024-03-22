<script setup lang="ts">
const emits = defineEmits(['openModal', 'refreshData'])
const selectionModeEnabled = useState<boolean>('selectionModeEnabled', () => false)

const queryFilter = defineModel<boolean | null>('queryFilter')
const selectedTaskIds = defineModel<number[]>('selectedTaskIds')
async function deleteBulkTasks() {
  await $fetch('/api/tasks/bulk', {
    method: 'DELETE',
    body: {
      ids: selectedTaskIds.value,
    },
  })
  selectedTaskIds.value = []
  selectionModeEnabled.value = false
  emits('refreshData')
}
async function markBulkTasks() {
  await $fetch('/api/tasks/bulk', {
    method: 'POST',
    body: {
      ids: selectedTaskIds.value,
    },
  })
  selectedTaskIds.value = []
  selectionModeEnabled.value = false
  emits('refreshData')
}
const filterConditions: TaskFilter[] = [
  {
    label: 'All',
    value: null,
  },
  {
    label: 'Done',
    value: true,
  },
  {
    label: 'Not done',
    value: false,
  },
]
</script>

<template>
  <UCard class="sticky top-0">
    {{ queryFilter }}
    <div class="flex gap-2">
      <UButton @click="$emit('openModal')">
        Create new task
      </UButton>
      <UButton v-if="selectionModeEnabled" variant="outline" @click="markBulkTasks">
        Mark all as done
      </UButton>
      <UButton v-if="selectionModeEnabled" variant="outline" color="rose" @click="deleteBulkTasks">
        Delete all
      </UButton>
      <UButton :icon="selectionModeEnabled ? 'i-heroicons-x-mark' : ''" color="blue" @click="selectionModeEnabled = !selectionModeEnabled">
        {{ selectionModeEnabled ? '' : 'Enable Selection Mode' }}
      </UButton>
      <USelectMenu v-model="queryFilter" value-attribute="value" :options="filterConditions" />
    </div>
  </UCard>
</template>
