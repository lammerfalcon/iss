<script setup lang="ts">
import type { card } from '#ui/ui.config'
import { useQueryFilter } from '~/composables/useQueryFilter'

const emits = defineEmits(['openEditModal'])
defineExpose<Exposed>({
  refreshData,
})
enum PriorityColors {
  none = 'gray',
  low = 'green',
  medium = 'yellow',
  high = 'red',
}
interface Exposed {
  refreshData: () => Promise<void>
}
const { queryFilter } = useQueryFilter()
const selectionModeEnabled = useState<boolean>('selectionModeEnabled', () => false)
const selectedTaskIds = defineModel<number[] | null>('selectedTaskIds')
const { data, refresh } = await useAsyncData('tasks', async () => {
  const query: QueryParams = {}

  if (queryFilter.value !== null)
    query.done = queryFilter.value

  return await $fetch<Task[]>('/api/tasks', { query })
}, {
  watch: [queryFilter],
})

async function deleteTask(id: number) {
  await $fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  })
  await refreshData()
}

async function toggleTask(id: number) {
  await $fetch('/api/tasks/toggle', {
    method: 'POST',
    body: {
      id,
    },
  })
  await refreshData()
}

function getTaskUIConfig(task: Task) {
  if (!selectedTaskIds.value)
    return {}
  const isSelected = selectedTaskIds.value.includes(task.id)
  const cardUI: Partial<typeof card> = {}
  if (task.done)
    cardUI.background = 'bg-gray-100'

  if (selectionModeEnabled.value) {
    cardUI.base = 'cursor-pointer'
    if (isSelected) {
      cardUI.background = 'bg-green-300/10'
      cardUI.ring = 'ring-green-500'
    }
    else {
      cardUI.background = 'hover:bg-gradient-to-r hover:from-cyan-300/20 hover:to-blue-300/20'
      cardUI.ring = 'ring-blue-500'
    }
  }
  return cardUI
}
function refreshData() {
  return refresh()
}
function toggleTaskSelection(taskId: number) {
  if (!selectedTaskIds.value) {
    console.error('selectedTaskIds.value is undefined or null')
    return
  }

  const index = selectedTaskIds.value.indexOf(taskId)
  if (index > -1)
    selectedTaskIds.value.splice(index, 1)
  else
    selectedTaskIds.value.push(taskId)
}

function handleCardClick(taskId: number) {
  if (!selectionModeEnabled.value)
    return

  toggleTaskSelection(taskId)
}
function openEditModal(task: Task) {
  emits('openEditModal', task)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <UCard v-if="!data?.length" class="text-center text-gray-500">
      No tasks found
    </UCard>
    <UCard v-for="task in data" :key="task.id" :ui="getTaskUIConfig(task)" class="w-full flex justify-between flex-col" @click.stop.prevent="handleCardClick(task.id)">
      <template #header>
        <h3 class="text-gray-500 text-lg uppercase ">
          {{ task.title }}
        </h3>
      </template>
      <template v-if="task.content" #default>
        <p class="text-gray-600 leading-4 tracking-wide">
          {{ task.content }}
        </p>
      </template>
      <template #footer>
        <div class="flex flex-row justify-between items-center">
          <div class="flex flex-col gap-1">
            <div>
              <UBadge variant="subtle" :color="PriorityColors[task.priority as keyof typeof PriorityColors]">
                {{ task.priority }}
              </UBadge>
            </div>
            <div class="text-sm text-gray-500">
              {{ useDateFormat(task.created_at) }}
            </div>
          </div>
          <div class="flex flex-row items-center gap-2">
            <UButton v-if="!task.done" variant="outline" size="xs" @click="toggleTask(task.id)">
              Mark as done
            </UButton>
            <UButton v-else-if="task.done" color="gray" variant="soft" size="xs" @click="toggleTask(task.id)">
              Unmark
            </UButton>
            <UButton icon="i-heroicons-pencil-square" variant="outline" size="xs" @click="openEditModal(task)" />
            <UButton icon="i-heroicons-trash" variant="outline" color="rose" size="xs" @click="deleteTask(task.id)" />
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
