<script setup lang="ts">
import { useQueryFilter } from '~/composables/useQueryFilter'

const emits = defineEmits(['openModal', 'refreshData'])
const selectionModeEnabled = useState<boolean>('selectionModeEnabled', () => false)

const { queryFilter } = useQueryFilter()
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
    label: 'All tasks',
    value: null,
  },
  {
    label: 'Complete',
    value: 1,
  },
  {
    label: 'Uncomplete',
    value: 0,
  },
]
</script>

<template>
  <UCard class="sticky top-0">
    <div class="flex flex-col sm:flex-row gap-2">
      <div>
        <UButton @click="$emit('openModal')">
          Create new task
        </UButton>
      </div>
      <div class="flex flex-row gap-2">
        <UButton v-if="selectionModeEnabled" variant="outline" @click="markBulkTasks">
          Mark all as done
        </UButton>
        <UButton v-if="selectionModeEnabled" variant="outline" color="rose" @click="deleteBulkTasks">
          Delete all
        </UButton>
        <UButton :icon="selectionModeEnabled ? 'i-heroicons-x-mark' : ''" color="blue" @click="selectionModeEnabled = !selectionModeEnabled">
          {{ selectionModeEnabled ? '' : 'Enable Selection Mode' }}
        </UButton>
      </div>
      <div>
        <USelectMenu v-model="queryFilter" class="w-[200px]" placeholder="Select filter parameter" value-attribute="value" option-attribute="label" :options="filterConditions" />
      </div>
    </div>
  </UCard>
</template>
