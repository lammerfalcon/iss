<script setup lang="ts">
import { UInput, URadioGroup, UTextarea } from '#components'
import type { card } from '#ui/ui.config'
import BaseHeader from '~/components/layout/BaseHeader.vue'

enum PriorityColors {
  none = 'gray',
  low = 'green',
  medium = 'yellow',
  high = 'red',
}

interface Task {
  id: number
  title: string
  content?: string
  done: boolean
  created_at: string
  priority: keyof typeof PriorityColors
}

const formConfig = [
  {
    label: 'Title',
    name: 'title',
    type: 'text',
    required: true,
    component: UInput,
  },
  {
    label: 'Content',
    name: 'content',
    type: 'textarea',
    component: UTextarea,

  },
  {
    label: 'Priority',
    name: 'priority',
    type: 'radio',
    component: URadioGroup,
    ui: { fieldset: 'flex flex-row gap-2' },
    uiRadio: { inner: 'ms-3 flex flex-col', wrapper: 'items-center' },
    options: [
      { label: 'none', value: 'none' },
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ],
  },
]
const toast = useToast()

const newTask = ref<Task>({} as Task)
const isOpen = ref<boolean>(false)
const isEditing = ref<boolean>(false)
const editingTask = ref<Task | null>(null)
const selectedTaskIds = ref<number[]>([])
const colorLevels = PriorityColors
const selectionModeEnabled = useState<boolean>('selectionModeEnabled', () => false)
const queryFilter = ref<boolean | null>(null)

interface QueryParams {
  done?: boolean
}

const { data, refresh } = await useAsyncData('tasks', async () => {
  const query: QueryParams = {}

  if (typeof queryFilter.value === 'boolean')
    query.done = queryFilter.value

  return await $fetch<Task[]>('/api/tasks', { query })
}, {
  watch: [queryFilter],
})

function openEditModal(task: Task) {
  newTask.value = { ...task }
  editingTask.value = task
  isEditing.value = true
  isOpen.value = true
}
async function saveTask() {
  const url = `/api/tasks${isEditing.value && editingTask.value.id ? `/${editingTask.value.id}` : ''}`
  const method = isEditing.value ? 'PUT' : 'POST'

  try {
    await $fetch(url, {
      method,
      body: newTask.value,
    })

    await refresh()
    resetFormAndState()
    toast.add({ title: 'Task saved successfully', color: 'green' }) // Положительный отзыв пользователю
  }
  catch (error) {
    console.error('Failed to save task:', error)
    toast.add({ title: 'Something went wrong 😢', color: 'red' })
  }
}

function resetFormAndState() {
  newTask.value = {} as Task
  editingTask.value = null
  isOpen.value = false
  isEditing.value = false
}

function deleteTask(id: number) {
  $fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  }).then(() => {
    refresh()
  })
}

async function toggleTask(id: number) {
  await $fetch('/api/tasks/toggle', {
    method: 'POST',
    body: {
      id,
    },
  })
  await refresh()
}

function getTaskUIConfig(task: Task) {
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
function toggleTaskSelection(taskId: number) {
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
watchEffect(() => {
  if (isOpen.value && !isEditing.value)
    newTask.value = {} as Task
})
</script>

<template>
  <UContainer class="grid grid-cols-1 gap-6 p-6">
    <BaseHeader v-model:query-filter="queryFilter" v-model:selected-task-ids="selectedTaskIds" @refresh-data="refresh" @open-modal="isOpen = true" />
    <transition-group tag="div" class="flex flex-col gap-6" name="list">
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
                <UBadge variant="subtle" :color="colorLevels[task.priority]">
                  {{ task.priority }}
                </UBadge>
              </div>
              <div class="text-sm text-gray-500">
                {{ new Date(task.created_at).toLocaleTimeString() }}
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
    </transition-group>

    <UModal v-model="isOpen" @close="isEditing = false">
      <UCard>
        <template #header>
          Create new task
        </template>
        <template #default>
          <UForm class="flex flex-col gap-4" @submit="saveTask">
            <UFormGroup v-for="field in formConfig" :key="field.type" :required="field.required" :label="field.label">
              <component v-bind="field" :is="field.component" v-model="newTask[field?.name]">
                <template #label="{ option }">
                  <UBadge :color="colorLevels[option.value]" variant="subtle">
                    {{ option.label }}
                  </UBadge>
                </template>
              </component>
            </UFormGroup>
            <div class="flex flex-row gap-2 justify-end mt-4">
              <UButton type="submit" variant="outline">
                {{ isEditing ? 'Update' : 'Create' }}
              </UButton>

              <UButton variant="outline" @click="isOpen = false">
                Cancel
              </UButton>
            </div>
          </UForm>
        </template>
      </UCard>
    </UModal>
  </UContainer>
  <UNotifications />
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
