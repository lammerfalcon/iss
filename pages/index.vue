<script setup lang="ts">
import BaseHeader from '~/components/layout/BaseHeader.vue'
import { useQueryFilter } from '~/composables/useQueryFilter'
import TaksksList from '~/components/Tasks/TaksksList.vue'
import TaskForm from '~/components/Tasks/TaskForm.vue'

const { queryFilter } = useQueryFilter()
const tasksList = ref(null)
const selectedTaskIds = ref<number[]>([])

const newTask = ref<Task>({} as Task)
const isOpen = ref<boolean>(false)
const isEditing = ref<boolean>(false)
const editingTask = ref<Task | null>(null)

function openEditModal(task: Task) {
  newTask.value = { ...task }
  editingTask.value = task
  isEditing.value = true
  isOpen.value = true
}

async function refresh() {
  return tasksList?.value?.refreshData()
}
</script>

<template>
  <UContainer class="grid grid-cols-1 gap-6 p-6">
    <BaseHeader v-model:query-filter="queryFilter" v-model:selected-task-ids="selectedTaskIds" @refresh-data="refresh" @open-modal="isOpen = true" />
    <TaksksList ref="tasksList" v-model:selected-task-ids="selectedTaskIds" @open-edit-modal="openEditModal" />
    <UModal v-model="isOpen" @close="isEditing = false">
      <TaskForm
        v-model:editing-task="editingTask"
        v-model:is-open="isOpen"
        v-model:is-editing="isEditing"
        v-model:new-task="newTask"
        @refresh-data="refresh"
      />
    </UModal>
  </UContainer>
  <UNotifications :ui="{ position: 'bottom-0 end-0' }" />
</template>
